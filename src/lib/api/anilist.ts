import type { Media, MediaType } from '../types';
import { stripHtml } from '../format';

const ENDPOINT = 'https://graphql.anilist.co';

const MEDIA_FIELDS = `
  id
  type
  title { romaji english native }
  coverImage { extraLarge large color }
  bannerImage
  description(asHtml: false)
  genres
  averageScore
  seasonYear
  format
  episodes
  chapters
  volumes
  duration
  status
  siteUrl
`;

interface AniListMedia {
  id: number;
  type: 'ANIME' | 'MANGA';
  title: { romaji: string; english: string | null; native: string | null };
  coverImage: { extraLarge: string; large: string; color: string | null };
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  averageScore: number | null;
  seasonYear: number | null;
  format: string | null;
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  duration: number | null;
  status: string | null;
  siteUrl: string;
}

const FORMAT_LABELS: Record<string, string> = {
  TV: 'TV',
  TV_SHORT: 'Kısa',
  MOVIE: 'Film',
  SPECIAL: 'Özel',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Müzik',
  MANGA: 'Manga',
  NOVEL: 'Novel',
  ONE_SHOT: 'Tek bölüm',
};

const STATUS_LABELS: Record<string, string> = {
  RELEASING: 'Devam ediyor',
  FINISHED: 'Tamamlandı',
  NOT_YET_RELEASED: 'Yakında',
  CANCELLED: 'İptal',
  HIATUS: 'Arada',
};

export function mapAniList(m: AniListMedia): Media {
  const isAnime = m.type === 'ANIME';
  const type: MediaType = isAnime ? 'anime' : 'manga';
  const title = m.title.english || m.title.romaji || m.title.native || 'İsimsiz';
  const total = isAnime ? m.episodes : m.chapters;
  const bits: string[] = [];
  if (total) bits.push(`${total} ${isAnime ? 'bölüm' : 'bölüm'}`);
  else if (!isAnime && m.volumes) bits.push(`${m.volumes} cilt`);
  if (m.seasonYear) bits.push(String(m.seasonYear));
  if (m.format && FORMAT_LABELS[m.format]) bits.push(FORMAT_LABELS[m.format]);

  return {
    id: `${type}:${m.id}`,
    source: 'anilist',
    type,
    title,
    subtitle: m.title.romaji && m.title.romaji !== title ? m.title.romaji : undefined,
    cover: m.coverImage.large || m.coverImage.extraLarge,
    banner: m.bannerImage || undefined,
    description: stripHtml(m.description ?? ''),
    genres: m.genres ?? [],
    score: m.averageScore,
    year: m.seasonYear,
    totalUnits: total ?? (isAnime ? null : m.volumes),
    unitLabel: 'bölüm',
    meta: bits.join(' · '),
    externalUrl: m.siteUrl,
    accent: m.coverImage.color ?? undefined,
    status: m.status ? STATUS_LABELS[m.status] ?? m.status : null,
  };
}

interface GqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    signal: AbortSignal.timeout(9000),
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList isteği başarısız (${res.status})`);
  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error('AniList boş yanıt döndü');
  return json.data;
}

const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 1000 * 60 * 10;

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  const value = await loader();
  cache.set(key, { at: Date.now(), value });
  return value;
}

interface PageResult {
  Page: { media: AniListMedia[] };
}

export async function trendingAnime(page = 1): Promise<Media[]> {
  return cached(`trend:a:${page}`, async () => {
    const data = await gql<PageResult>(
      `query($page: Int) { Page(page: $page, perPage: 18) { media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } } }`,
      { page },
    );
    return data.Page.media.map(mapAniList);
  });
}

export async function trendingManga(page = 1): Promise<Media[]> {
  return cached(`trend:m:${page}`, async () => {
    const data = await gql<PageResult>(
      `query($page: Int) { Page(page: $page, perPage: 18) { media(sort: POPULARITY_DESC, type: MANGA, isAdult: false) { ${MEDIA_FIELDS} } } }`,
      { page },
    );
    return data.Page.media.map(mapAniList);
  });
}

export async function seasonalAnime(): Promise<Media[]> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const season = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';
  return cached(`season:${now.getFullYear()}:${season}`, async () => {
    const data = await gql<PageResult>(
      `query($season: MediaSeason, $year: Int) {
        Page(page: 1, perPage: 18) {
          media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FIELDS} }
        }
      }`,
      { season, year: now.getFullYear() },
    );
    return data.Page.media.map(mapAniList);
  });
}

export async function searchAniList(query: string, type: 'anime' | 'manga', page = 1): Promise<Media[]> {
  const q = query.trim();
  if (!q) return [];
  return cached(`search:${type}:${page}:${q.toLowerCase()}`, async () => {
    const data = await gql<PageResult>(
      `query($search: String, $type: MediaType, $page: Int) {
        Page(page: $page, perPage: 18) {
          media(search: $search, type: $type, isAdult: false) { ${MEDIA_FIELDS} }
        }
      }`,
      { search: q, type: type === 'anime' ? 'ANIME' : 'MANGA', page },
    );
    return data.Page.media.map(mapAniList);
  });
}

interface DetailResult {
  Media: AniListMedia & {
    recommendations: {
      nodes: Array<{ mediaRecommendation: AniListMedia | null }>;
    } | null;
  };
}

export async function anilistDetail(type: 'anime' | 'manga', id: number): Promise<{ media: Media; related: Media[] }> {
  const data = await gql<DetailResult>(
    `query($id: Int, $type: MediaType) {
      Media(id: $id, type: $type) {
        ${MEDIA_FIELDS}
        recommendations(perPage: 8, sort: RATING_DESC) {
          nodes { mediaRecommendation { ${MEDIA_FIELDS} } }
        }
      }
    }`,
    { id, type: type === 'anime' ? 'ANIME' : 'MANGA' },
  );
  const related = (data.Media.recommendations?.nodes ?? [])
    .map((n) => n.mediaRecommendation)
    .filter((m): m is AniListMedia => Boolean(m))
    .map(mapAniList);
  return { media: mapAniList(data.Media), related };
}
