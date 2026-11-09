/**
 * AniList GraphQL istemcisi.
 *
 * AniList, birincil kaynağımızdır: güncel sezon verisi, ilişkiler, puanlar ve
 * çoklu dil başlıkları tek istekte gelir. Anahtar gerektirmez.
 *
 * Not: AniList dakikada ~90 istek sınırı uygular. `createRateLimiter` ile
 * istekler arasında güvenli bir aralık bırakıyoruz.
 */

import { fetchJson, createRateLimiter } from './http';
import { createTtlCache, dedupe } from './cache';
import type { MediaKind, MediaSearchResult, UnifiedMedia } from '../../types/unified';
import { stripHtml } from '../../types/unified';
import { getAnimeSeason } from '../season';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';
const limiter = createRateLimiter(700);
const cache = createTtlCache<unknown>({ ttlMs: 15 * 60 * 1000 });

const MEDIA_CORE = `
  fragment MediaCore on Media {
    id
    idMal
    type
    format
    isAdult
    title { romaji english native }
    description(asHtml: false)
    coverImage { extraLarge large medium color }
    bannerImage
    status
    season
    seasonYear
    startDate { year month day }
    episodes
    chapters
    volumes
    duration
    averageScore
    popularity
    genres
    studios(isMain: true) { nodes { id name } }
    relations {
      edges {
        relationType
        node {
          id
          type
          format
          title { romaji english native }
          coverImage { medium }
        }
      }
    }
    externalLinks { site url type }
    trailer { id site }
    updatedAt
  }
`;

interface AniListTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}

interface AniListMediaNode {
  id: number;
  idMal?: number | null;
  type: 'ANIME' | 'MANGA';
  format?: string | null;
  isAdult?: boolean;
  title: AniListTitle;
  description?: string | null;
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
    medium?: string | null;
    color?: string | null;
  } | null;
  bannerImage?: string | null;
  status?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  startDate?: { year?: number | null; month?: number | null; day?: number | null } | null;
  episodes?: number | null;
  chapters?: number | null;
  volumes?: number | null;
  duration?: number | null;
  averageScore?: number | null;
  popularity?: number | null;
  genres?: string[] | null;
  studios?: { nodes?: { id: number; name: string }[] | null } | null;
  relations?: {
    edges?: {
      relationType: string;
      node: {
        id: number;
        type: 'ANIME' | 'MANGA';
        format?: string | null;
        title: AniListTitle;
        coverImage?: { medium?: string | null } | null;
      };
    }[] | null;
  } | null;
  externalLinks?: { site: string; url: string; type?: string | null }[] | null;
  trailer?: { id?: string | null; site?: string | null } | null;
  updatedAt?: number | null;
}

interface AniListPageResponse {
  data?: {
    Page?: {
      pageInfo?: { total?: number; currentPage?: number; lastPage?: number; hasNextPage?: boolean } | null;
      media?: AniListMediaNode[] | null;
    } | null;
    Media?: AniListMediaNode | null;
  } | null;
  errors?: { message?: string }[] | null;
}

function detectKind(node: AniListMediaNode): MediaKind {
  if (node.type === 'ANIME') return 'anime';
  return node.format === 'NOVEL' ? 'light_novel' : 'manga';
}

export function mapAniListMedia(node: AniListMediaNode): UnifiedMedia {
  const title = {
    romaji: node.title?.romaji ?? undefined,
    english: node.title?.english ?? undefined,
    native: node.title?.native ?? undefined,
  };

  const relations = (node.relations?.edges ?? []).map((edge) => ({
    id: `anilist:${edge.node.id}`,
    kind: detectKind({ ...edge.node, isAdult: false } as AniListMediaNode),
    relationType: edge.relationType,
    title: {
      romaji: edge.node.title?.romaji ?? undefined,
      english: edge.node.title?.english ?? undefined,
      native: edge.node.title?.native ?? undefined,
    },
    cover: edge.node.coverImage?.medium ?? undefined,
  }));

  return {
    id: `anilist:${node.id}`,
    source: 'anilist',
    sourceId: String(node.id),
    kind: detectKind(node),
    title,
    displayTitle: title.english || title.romaji || title.native || '—',
    synopsis: stripHtml(node.description),
    cover: {
      small: node.coverImage?.medium ?? undefined,
      medium: node.coverImage?.large ?? undefined,
      large: node.coverImage?.extraLarge ?? node.coverImage?.large ?? undefined,
      color: node.coverImage?.color ?? undefined,
    },
    banner: node.bannerImage ?? undefined,
    format: node.format ?? undefined,
    status: node.status ?? undefined,
    season: node.season ?? undefined,
    seasonYear: node.seasonYear ?? null,
    startDate: node.startDate ?? undefined,
    episodes: node.episodes ?? null,
    chapters: node.chapters ?? null,
    volumes: node.volumes ?? null,
    duration: node.duration ?? null,
    averageScore: node.averageScore ?? null,
    popularity: node.popularity ?? null,
    genres: (node.genres ?? []).filter(Boolean),
    tags: [],
    studios: (node.studios?.nodes ?? []).map((studio) => ({ id: studio.id, name: studio.name })),
    relations,
    externalLinks: (node.externalLinks ?? []).map((link) => ({
      site: link.site,
      url: link.url,
      type: link.type ?? undefined,
    })),
    trailer: node.trailer?.id
      ? {
          id: node.trailer.id,
          site: node.trailer.site ?? undefined,
        }
      : undefined,
    updatedAt: node.updatedAt ? node.updatedAt * 1000 : Date.now(),
    externalIds: {
      anilist: node.id,
      mal: node.idMal ?? undefined,
    },
  };
}

function assertNoErrors(payload: AniListPageResponse, context: string): void {
  if (payload?.errors?.length) {
    const message = payload.errors.map((e) => e.message).filter(Boolean).join('; ') || 'Bilinmeyen AniList hatası';
    throw new Error(`AniList: ${context} — ${message}`);
  }
}

async function graphql<T extends AniListPageResponse>(
  query: string,
  variables: Record<string, unknown>,
  context: string,
  signal?: AbortSignal
): Promise<T> {
  await limiter();

  const payload = await fetchJson<T>(
    ANILIST_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query: `${MEDIA_CORE}\n${query}`, variables }),
    },
    { timeoutMs: 10000, retries: 2, signal }
  );

  assertNoErrors(payload, context);
  return payload;
}

const KIND_TO_ANILIST_TYPE: Partial<Record<MediaKind, 'ANIME' | 'MANGA'>> = {
  anime: 'ANIME',
  manga: 'MANGA',
  light_novel: 'MANGA',
};

export interface AniListSearchParams {
  query?: string;
  kind: 'anime' | 'manga' | 'light_novel';
  page?: number;
  perPage?: number;
  hideAdult?: boolean;
  signal?: AbortSignal;
}

/**
 * AniList'te arama yapar. `query` boşsa popülerlik sırasına göre listeler.
 */
export async function searchAniList(params: AniListSearchParams): Promise<MediaSearchResult> {
  const { query = '', kind, page = 1, perPage = 20, hideAdult = true, signal } = params;
  const type = KIND_TO_ANILIST_TYPE[kind];
  if (!type) throw new Error(`AniList desteklenmeyen tür: ${kind}`);

  const trimmed = query.trim();
  const cacheKey = `search:${kind}:${trimmed.toLowerCase()}:${page}:${perPage}:${hideAdult ? 'sfw' : 'all'}`;

  return dedupe(cacheKey, async () => {
    const cached = cache.get(cacheKey) as MediaSearchResult | null;
    if (cached) return cached;

    const useSearch = trimmed.length > 0;
    // AniList'te NOVEL ayrı bir formattır; light novel sonuçlarını sunucu tarafında süz.
    const format = kind === 'light_novel' ? 'NOVEL' : undefined;

    const queryDoc = useSearch
      ? `
        query ($search: String, $type: MediaType, $page: Int, $perPage: Int, $isAdult: Boolean, $format: MediaFormat) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { total currentPage lastPage hasNextPage }
            media(search: $search, type: $type, isAdult: $isAdult, format: $format, sort: SEARCH_MATCH) {
              ...MediaCore
            }
          }
        }
      `
      : `
        query ($type: MediaType, $page: Int, $perPage: Int, $isAdult: Boolean, $format: MediaFormat) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { total currentPage lastPage hasNextPage }
            media(type: $type, isAdult: $isAdult, format: $format, sort: POPULARITY_DESC) {
              ...MediaCore
            }
          }
        }
      `;

    const variables = useSearch
      ? { search: trimmed, type, page, perPage, isAdult: hideAdult ? false : undefined, format }
      : { type, page, perPage, isAdult: hideAdult ? false : undefined, format };

    const payload = await graphql<AniListPageResponse>(queryDoc, variables, `arama (${kind})`, signal);

    const media = payload.data?.Page?.media ?? [];
    const filtered =
      kind === 'light_novel'
        ? media.filter((node) => node.format === 'NOVEL')
        : kind === 'manga'
          ? media.filter((node) => node.format !== 'NOVEL')
          : media;

    const result: MediaSearchResult = {
      items: filtered.map(mapAniListMedia),
      page: payload.data?.Page?.pageInfo?.currentPage ?? page,
      hasNextPage: Boolean(payload.data?.Page?.pageInfo?.hasNextPage),
      kind,
      source: 'anilist',
    };

    cache.set(cacheKey, result);
    return result;
  });
}

/** Tek bir AniList kaydını kimliğine göre getirir. */
export async function getAniListMedia(id: number, signal?: AbortSignal): Promise<UnifiedMedia | null> {
  const cacheKey = `detail:${id}`;
  const cached = cache.get(cacheKey) as UnifiedMedia | null;
  if (cached) return cached;

  const payload = await graphql<AniListPageResponse>(
    `query ($id: Int) { Media(id: $id) { ...MediaCore } }`,
    { id },
    `detay (${id})`,
    signal
  );

  const node = payload.data?.Media;
  if (!node) return null;

  const media = mapAniListMedia(node);
  cache.set(cacheKey, media);
  return media;
}

/**
 * MyAnimeList kimliğinden AniList kaydı getirir.
 * Jikan erişilemediğinde eski `/anime/:id` sayfaları için yedek yol.
 */
export async function getAniListMediaByMalId(malId: number, signal?: AbortSignal): Promise<UnifiedMedia | null> {
  const cacheKey = `detail:mal:${malId}`;
  const cached = cache.get(cacheKey) as UnifiedMedia | null;
  if (cached) return cached;

  const payload = await graphql<AniListPageResponse>(
    `query ($idMal: Int, $type: MediaType) { Media(idMal: $idMal, type: $type) { ...MediaCore } }`,
    { idMal: malId, type: 'ANIME' },
    `detay (MAL ${malId})`,
    signal
  );

  const node = payload.data?.Media;
  if (!node) return null;

  const media = mapAniListMedia(node);
  cache.set(cacheKey, media);
  return media;
}

/**
 * MyAnimeList kimliklerini toplu çözümler (50'lik dilimler, `idMal_in`).
 * Import akışında kapak, özet ve skor zenginleştirmesi içindir; bir dilim
 * başarısız olursa diğerleri korunur (kısmi sonuç Map'i).
 */
export async function getAniListByMalIds(
  malIds: number[],
  signal?: AbortSignal
): Promise<Map<number, UnifiedMedia>> {
  const unique = Array.from(new Set(malIds.filter((id) => Number.isFinite(id) && id > 0)));
  const out = new Map<number, UnifiedMedia>();
  if (unique.length === 0) return out;

  for (let index = 0; index < unique.length; index += 50) {
    const chunk = unique.slice(index, index + 50);
    try {
      const payload = await graphql<AniListPageResponse>(
        `query ($ids: [Int]) {
          Page(page: 1, perPage: 50) {
            media(idMal_in: $ids, type: ANIME) {
              ...MediaCore
            }
          }
        }`,
        { ids: chunk },
        `toplu MAL (${chunk.length})`,
        signal
      );
      for (const node of payload.data?.Page?.media ?? []) {
        if (typeof node.idMal === 'number') {
          out.set(node.idMal, mapAniListMedia(node));
        }
      }
    } catch {
      // Dilim başarısız olursa bu kısmı MAL verisiyle geçeriz; import kopmaz.
    }
  }

  return out;
}

/** Sezonluk / popüler listeler için kısayol. */
export async function getAniListTrending(
  kind: 'anime' | 'manga' | 'light_novel' = 'anime',
  page = 1,
  perPage = 20
): Promise<MediaSearchResult> {
  return searchAniList({ kind, page, perPage });
}

export interface AniListPopularCharacter {
  /** Global kimlik: `anilist:character:123` */
  id: string;
  anilistId: number;
  name: string;
  nativeName?: string;
  image?: string;
  animeTitle?: string;
  favourites: number;
}

/**
 * AniList'te en çok favorilenen karakterler (canlı).
 * MultiMedya merkezindeki karakter keşfi için kullanılır; sabit liste yok.
 */
export async function fetchPopularCharacters(perPage = 8): Promise<AniListPopularCharacter[]> {
  const cacheKey = `characters:popular:${perPage}`;

  return dedupe(cacheKey, async () => {
    const cached = cache.get(cacheKey) as AniListPopularCharacter[] | null;
    if (cached) return cached;

    await limiter();
    const payload = await fetchJson<{
      data?: {
        Page?: {
          characters?: {
            id: number;
            name?: { full?: string | null; native?: string | null } | null;
            image?: { large?: string | null; medium?: string | null } | null;
            favourites?: number | null;
            media?: {
              nodes?: { title?: { romaji?: string | null; english?: string | null } | null }[] | null;
            } | null;
          }[] | null;
        } | null;
      } | null;
      errors?: { message?: string }[] | null;
    }>(
      ANILIST_ENDPOINT,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          query: `
            query ($perPage: Int) {
              Page(page: 1, perPage: $perPage) {
                characters(sort: FAVOURITES_DESC) {
                  id
                  name { full native }
                  image { large medium }
                  favourites
                  media(type: ANIME, perPage: 1, sort: POPULARITY_DESC) {
                    nodes { title { romaji english } }
                  }
                }
              }
            }
          `,
          variables: { perPage },
        }),
      },
      { timeoutMs: 10000, retries: 2 },
    );

    if (payload?.errors?.length) {
      throw new Error(`AniList: popüler karakterler — ${payload.errors.map((e) => e.message).join('; ')}`);
    }

    const characters = payload.data?.Page?.characters ?? [];
    const result: AniListPopularCharacter[] = [];
    for (const character of characters) {
      const title = character.media?.nodes?.[0]?.title;
      const name = character.name?.full || character.name?.native || '';
      if (!character.id || !name) continue;
      result.push({
        id: `anilist:character:${character.id}`,
        anilistId: character.id,
        name,
        nativeName: character.name?.native ?? undefined,
        image: character.image?.large || character.image?.medium || undefined,
        animeTitle: title?.english || title?.romaji || undefined,
        favourites: character.favourites ?? 0,
      });
    }

    cache.set(cacheKey, result);
    return result;
  });
}

/**
 * GÜNCEL SEZONUN trend animeleri (AniList `season + seasonYear`, TRENDING_DESC).
 * Keşfet sayfasındaki "TRENDING NOW" bölümü budur — klasikler değildir.
 * Sezon, çağrıldığı tarihe göre dinamik hesaplanır.
 */
export async function fetchSeasonalTrendingAnime(perPage = 12): Promise<MediaSearchResult> {
  const season = getAnimeSeason();
  const cacheKey = `season-trending:${season.season}:${season.seasonYear}:${perPage}`;

  return dedupe(cacheKey, async () => {
    const cached = cache.get(cacheKey) as MediaSearchResult | null;
    if (cached) return cached;

    const queryDoc = `
      query ($season: MediaSeason, $year: Int, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage }
          media(type: ANIME, season: $season, seasonYear: $year, sort: TRENDING_DESC, isAdult: false) {
            ...MediaCore
          }
        }
      }
    `;

    const variables = { season: season.season, year: season.seasonYear, perPage };
    const payload = await graphql<AniListPageResponse>(queryDoc, variables, `sezon-trendleri (${season.labelEN})`);

    const media = payload.data?.Page?.media ?? [];
    const result: MediaSearchResult = {
      items: media.map(mapAniListMedia),
      page: 1,
      hasNextPage: Boolean(payload.data?.Page?.pageInfo?.hasNextPage),
      kind: 'anime',
      source: 'anilist',
    };

    cache.set(cacheKey, result);
    return result;
  });
}
