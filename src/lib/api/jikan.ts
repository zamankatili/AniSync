/**
 * Jikan v4 (MyAnimeList) adaptörü.
 *
 * AniList birincil kaynağımız; Jikan ise yedek ve çapraz doğrulama kaynağıdır.
 * Jikan saniyede 3 istek / dakikada 60 istek sınırı uygular.
 */

import { createRateLimiter, fetchJson } from './http';
import { createTtlCache, dedupe } from './cache';
import type { MediaKind, MediaSearchResult, UnifiedMedia } from '../../types/unified';

const BASE_URL = 'https://api.jikan.moe/v4';
const limiter = createRateLimiter(450);
const cache = createTtlCache<unknown>({ ttlMs: 15 * 60 * 1000 });

interface JikanImageSet {
  jpg?: { image_url?: string; large_image_url?: string };
  webp?: { image_url?: string; large_image_url?: string };
}

interface JikanMedia {
  mal_id: number;
  title?: string;
  title_english?: string | null;
  title_japanese?: string | null;
  synopsis?: string | null;
  images?: JikanImageSet;
  score?: number | null;
  episodes?: number | null;
  chapters?: number | null;
  volumes?: number | null;
  status?: string | null;
  type?: string | null;
  year?: number | null;
  season?: string | null;
  genres?: { mal_id: number; name: string }[];
  studios?: { mal_id: number; name: string }[];
  authors?: { mal_id: number; name: string }[];
  popularity?: number | null;
  members?: number | null;
  url?: string | null;
}

interface JikanListResponse {
  data?: JikanMedia[] | null;
  pagination?: { current_page?: number; has_next_page?: boolean; last_visible_page?: number } | null;
}

interface JikanDetailResponse {
  data?: JikanMedia | null;
}

function normalizeScore(score?: number | null): number | null {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  // Jikan 0–10 döner; birleşik model 0–100 bekler.
  return Math.round(score * 10);
}

function mapImages(images?: JikanImageSet) {
  const large = images?.webp?.large_image_url || images?.jpg?.large_image_url || images?.webp?.image_url || images?.jpg?.image_url;
  const medium = images?.webp?.image_url || images?.jpg?.image_url || large;
  return {
    large: large ?? undefined,
    medium: medium ?? undefined,
    small: medium ?? undefined,
  };
}

export function mapJikanMedia(item: JikanMedia, kind: MediaKind): UnifiedMedia {
  const title = {
    romaji: item.title ?? undefined,
    english: item.title_english ?? undefined,
    native: item.title_japanese ?? undefined,
  };

  return {
    id: `jikan:${kind}:${item.mal_id}`,
    source: 'jikan',
    sourceId: String(item.mal_id),
    kind,
    title,
    displayTitle: title.english || title.romaji || title.native || '—',
    synopsis: item.synopsis ?? undefined,
    cover: mapImages(item.images),
    format: item.type ?? undefined,
    status: item.status ?? undefined,
    season: item.season ?? undefined,
    seasonYear: item.year ?? null,
    episodes: item.episodes ?? null,
    chapters: item.chapters ?? null,
    volumes: item.volumes ?? null,
    duration: null,
    averageScore: normalizeScore(item.score),
    popularity: item.members ?? item.popularity ?? null,
    genres: (item.genres ?? []).map((genre) => genre.name),
    tags: [],
    studios: (item.studios ?? []).map((studio) => ({ id: studio.mal_id, name: studio.name })),
    relations: [],
    externalLinks: item.url ? [{ site: 'MyAnimeList', url: item.url, type: 'info' }] : [],
    updatedAt: Date.now(),
  };
}

export interface JikanSearchParams {
  kind: 'anime' | 'manga';
  query: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export async function searchJikan(params: JikanSearchParams): Promise<MediaSearchResult> {
  const { kind, query, page = 1, limit = 20, signal } = params;
  const trimmed = query.trim();
  if (!trimmed) {
    return { items: [], page, hasNextPage: false, kind, source: 'jikan' };
  }

  const cacheKey = `search:${kind}:${trimmed.toLowerCase()}:${page}:${limit}`;

  return dedupe(cacheKey, async () => {
    const cached = cache.get(cacheKey) as MediaSearchResult | null;
    if (cached) return cached;

    await limiter();

    const payload = await fetchJson<JikanListResponse>(
      `${BASE_URL}/${kind}?q=${encodeURIComponent(trimmed)}&sfw=true&limit=${limit}&page=${page}`,
      {},
      { timeoutMs: 9000, retries: 2, signal }
    );

    const items = (payload.data ?? []).map((item) => mapJikanMedia(item, kind));

    const result: MediaSearchResult = {
      items,
      page: payload.pagination?.current_page ?? page,
      hasNextPage: Boolean(payload.pagination?.has_next_page),
      kind,
      source: 'jikan',
    };

    cache.set(cacheKey, result);
    return result;
  });
}

export async function getJikanMedia(
  kind: 'anime' | 'manga',
  malId: number,
  signal?: AbortSignal
): Promise<UnifiedMedia | null> {
  const cacheKey = `detail:${kind}:${malId}`;
  const cached = cache.get(cacheKey) as UnifiedMedia | null;
  if (cached) return cached;

  await limiter();

  const payload = await fetchJson<JikanDetailResponse>(`${BASE_URL}/${kind}/${malId}`, {}, { timeoutMs: 9000, signal });
  const item = payload.data;
  if (!item) return null;

  const media = mapJikanMedia(item, kind);
  cache.set(cacheKey, media);
  return media;
}
