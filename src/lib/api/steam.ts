/**
 * Steam oyun kataloğu istemcisi.
 *
 * Steam'in genel mağaza API'si anahtar gerektirmez ve zengin meta veri döner.
 * CORS kısıtı nedeniyle istekler kendi Express sunucumuzdaki `/api/games/*`
 * proxy uçları üzerinden geçer (bkz. `server.ts`).
 */

import { fetchJson } from './http';
import { createTtlCache, dedupe } from './cache';
import { apiUrl } from '../apiBase';
import type { MediaSearchResult, UnifiedMedia } from '../../types/unified';

const BASE = apiUrl('/api/games');
const cache = createTtlCache<unknown>({ ttlMs: 10 * 60 * 1000 });

interface SteamSearchItem {
  id: string;
  name: string;
  image?: string | null;
  metascore?: number | null;
  price?: { currency?: string; initial?: number; final?: number } | null;
}

interface SteamSearchResponse {
  items?: SteamSearchItem[];
  total?: number;
}

interface SteamGameResponse {
  appid: string;
  name: string;
  shortDescription?: string | null;
  headerImage?: string | null;
  capsuleImage?: string | null;
  developers?: string[];
  publishers?: string[];
  genres?: string[];
  releaseDate?: string | null;
  metacritic?: number | null;
  website?: string | null;
  background?: string | null;
}

const storeUrl = (appid: string) => `https://store.steampowered.com/app/${appid}`;

function parseYear(releaseDate?: string | null): number | null {
  const match = releaseDate?.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

export function mapSteamSearchItem(item: SteamSearchItem): UnifiedMedia {
  const cover = item.image || undefined;

  return {
    id: `steam:${item.id}`,
    source: 'steam',
    sourceId: item.id,
    kind: 'game',
    title: { english: item.name },
    displayTitle: item.name,
    cover: { large: cover, medium: cover, small: cover },
    format: 'GAME',
    averageScore: item.metascore ?? null,
    genres: [],
    tags: [],
    studios: [],
    relations: [],
    externalLinks: [{ site: 'Steam', url: storeUrl(item.id), type: 'game' }],
    updatedAt: Date.now(),
    externalIds: { steam: item.id },
  };
}

export async function searchSteam(
  query: string,
  page = 1,
  limit = 10,
  language = 'en',
  signal?: AbortSignal
): Promise<MediaSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { items: [], page, hasNextPage: false, kind: 'game', source: 'steam' };
  }

  const cacheKey = `search:${trimmed.toLowerCase()}:${language}`;

  return dedupe(cacheKey, async () => {
    const cached = cache.get(cacheKey) as SteamSearchItem[] | null;
    let items = cached;

    if (!items) {
      const payload = await fetchJson<SteamSearchResponse>(
        `${BASE}/search?q=${encodeURIComponent(trimmed)}&lang=${encodeURIComponent(language)}`,
        {},
        { timeoutMs: 10000, retries: 1, signal }
      );
      items = payload.items ?? [];
      cache.set(cacheKey, items);
    }

    const start = (page - 1) * limit;
    const pageItems = items.slice(start, start + limit);

    return {
      items: pageItems.map(mapSteamSearchItem),
      page,
      hasNextPage: start + limit < items.length,
      kind: 'game' as const,
      source: 'steam' as const,
    };
  });
}

export async function getSteamGame(appid: string, signal?: AbortSignal): Promise<UnifiedMedia | null> {
  const cleanId = appid.replace(/\D/g, '');
  if (!cleanId) return null;

  const cacheKey = `detail:${cleanId}`;
  const cached = cache.get(cacheKey) as UnifiedMedia | null;
  if (cached) return cached;

  const game = await fetchJson<SteamGameResponse>(`${BASE}/${cleanId}`, {}, { timeoutMs: 10000, retries: 1, signal });
  if (!game?.name) return null;

  const year = parseYear(game.releaseDate);
  const media: UnifiedMedia = {
    id: `steam:${cleanId}`,
    source: 'steam',
    sourceId: cleanId,
    kind: 'game',
    title: { english: game.name },
    displayTitle: game.name,
    synopsis: game.shortDescription ?? undefined,
    cover: {
      large: game.headerImage ?? game.capsuleImage ?? undefined,
      medium: game.capsuleImage ?? game.headerImage ?? undefined,
      small: game.capsuleImage ?? game.headerImage ?? undefined,
    },
    banner: game.background ?? undefined,
    format: 'GAME',
    seasonYear: year,
    startDate: year ? { year } : undefined,
    averageScore: game.metacritic ?? null,
    genres: (game.genres ?? []).filter(Boolean),
    tags: [],
    studios: [...new Set([...(game.developers ?? []), ...(game.publishers ?? [])])].map((name) => ({ name })),
    relations: [],
    externalLinks: [
      { site: 'Steam', url: storeUrl(cleanId), type: 'game' },
      ...(game.website ? [{ site: 'Website', url: game.website, type: 'info' }] : []),
    ],
    updatedAt: Date.now(),
    externalIds: { steam: cleanId },
  };

  cache.set(cacheKey, media);
  return media;
}
