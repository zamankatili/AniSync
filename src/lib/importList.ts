/**
 * MAL (MyAnimeList) XML yedeği ve AniList JSON yedeğinden takip listesi okur.
 *
 * Kurallar:
 * - Veri kaynaksız uydurulmaz. Bilinmeyen kapak/özet/skor için `null` bırakılır.
 * - Kapak URL'leri `http://` + MAL kaynaklı "Animellist" sabiti `https`'e çevrilir.
 * - Sık kullanılan `my_status` basamakları (1/2/3/4/6) ve metin karşılıkları desteklenir.
 * - AniList JSON yedeğinde `media` yuvalanmış olmalı ve `idMal` bulunmalıdır;
 *   aksi halde kayıt atlanır ama sessizce yutmak yerine `skipped` sayılır.
 * - Skor her zaman 0–10 aralığına indirgenir; puanı olmayan kayıt `0` bırakılır
 *   (arayüz 0 = "puan yok" kabul eder).
 */
import type { Anime, WatchStatus, WatchlistItem } from '../types';

export type ImportSource = 'mal' | 'anilist';

export interface ParsedImportItem {
  malId: number;
  title: string;
  /** MAL yedeğinden gelen kapak (http → https çevrilmiş). */
  coverUrl?: string;
  synopsis?: string;
  /** 0–10; 0 = puan yok. */
  score: number;
  /** İzleyicinin verdiği puan; 0 = puan yok. */
  userScore: number;
  episodes: number | null;
  episodesWatched: number;
  genres: Array<{ mal_id: number; name: string }>;
  seasonYear: number | null;
  status?: string;
  season?: string;
  type?: string;
  studios: Array<{ mal_id: number; name: string }>;
  watchStatus: WatchStatus;
  /** AniList JSON'da tam kayıt varsa ham veri; zenginleştirme için saklanmaz. */
  listType: 'anime';
}

export interface ParsedImport {
  source: ImportSource;
  items: ParsedImportItem[];
  skipped: number;
}

const MAL_STATUS_MAP: Record<string, WatchStatus> = {
  '1': 'watching',
  '2': 'completed',
  '3': 'on_hold',
  '4': 'dropped',
  '6': 'plan_to_watch',
};

const MAL_STATUS_TEXT_MAP: Array<[RegExp, WatchStatus]> = [
  [/^watching|izliyor|izle/i, 'watching'],
  [/^completed|tamamland|tamam/i, 'completed'],
  [/^on[- ]?hold|hold|bekle/i, 'on_hold'],
  [/^dropped|bırakt|birak/i, 'dropped'],
  [/^plan to watch|plann?ed|sırada|sirada/i, 'plan_to_watch'],
];

const ANILIST_STATUS_MAP: Record<string, WatchStatus> = {
  CURRENT: 'watching',
  REPEATING: 'watching',
  COMPLETED: 'completed',
  PLANNING: 'plan_to_watch',
  PAUSED: 'on_hold',
  DROPPED: 'dropped',
};

const ANILIST_AIRING_STATUS: Record<string, string> = {
  FINISHED: 'Finished Airing',
  RELEASING: 'Currently Airing',
  NOT_YET_RELEASED: 'Not Yet Released',
  CANCELLED: 'Cancelled',
  HIATUS: 'On Hiatus',
};

const ANILIST_FORMAT_TYPE: Record<string, string> = {
  TV: 'TV',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
};

const ANILIST_SEASON: Record<string, string> = {
  WINTER: 'Winter',
  SPRING: 'Spring',
  SUMMER: 'Summer',
  FALL: 'Fall',
};

const decodeXmlEntities = (value: string): string =>
  value
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCharCode(n) : '';
    })
    .trim();

const toHttps = (url: string): string => url.replace(/^http:\/\//i, 'https://');

const toNumber = (value: string | undefined | null): number => {
  const n = Number((value ?? '').trim());
  return Number.isFinite(n) ? n : 0;
};

const clampScore = (value: unknown): number => {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : Number.NaN;
  if (!Number.isFinite(n) || n <= 0) return 0;
  // AniList 0–100 ölçeğini 0–10'a indirgeme; MAL zaten 0–10.
  const ten = n > 10 ? Math.round((n / 10) * 10) / 10 : Math.round(n * 10) / 10;
  return Math.min(10, Math.max(0, ten));
};

/** Adlandırılmış kayıtlar için kararlı, yalnızca kimlik niyetine yarayan sahte-id. */
export const stableNameId = (name: string): number => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (Math.imul(hash, 31) + name.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) || 1;
};

const mergeWatchStatus = (a: WatchStatus, b: WatchStatus): WatchStatus => {
  const weight: Record<WatchStatus, number> = {
    completed: 5,
    watching: 4,
    on_hold: 3,
    dropped: 2,
    plan_to_watch: 1,
  };
  return weight[a] >= weight[b] ? a : b;
};

const mergeItems = (items: ParsedImportItem[]): ParsedImportItem[] => {
  const map = new Map<number, ParsedImportItem>();
  for (const item of items) {
    const prev = map.get(item.malId);
    if (!prev) {
      map.set(item.malId, { ...item, genres: [...item.genres], studios: [...item.studios] });
      continue;
    }
    const winner = mergeWatchStatus(prev.watchStatus, item.watchStatus);
    map.set(item.malId, {
      ...prev,
      coverUrl: prev.coverUrl ?? item.coverUrl,
      synopsis: prev.synopsis || item.synopsis,
      score: prev.score || item.score,
      userScore: prev.userScore || item.userScore,
      episodes: prev.episodes ?? item.episodes,
      episodesWatched: Math.max(prev.episodesWatched, item.episodesWatched),
      seasonYear: prev.seasonYear ?? item.seasonYear,
      studios: prev.studios.length ? prev.studios : item.studios,
      genres: prev.genres.length ? prev.genres : item.genres,
      watchStatus: winner,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title, 'tr'));
};

const mapTextStatus = (raw: string): WatchStatus => {
  const text = raw.trim();
  if (MAL_STATUS_MAP[text]) return MAL_STATUS_MAP[text];
  const found = MAL_STATUS_TEXT_MAP.find(([pattern]) => pattern.test(text));
  return found ? found[1] : 'plan_to_watch';
};

/** MAL `animelist.xml` yedeğini ayrıştırır (`<anime>` blokları). */
export function parseMalXml(raw: string): ParsedImport {
  const blocks = raw.split(/<anime>/i).slice(1);
  const items: ParsedImportItem[] = [];
  let skipped = 0;

  for (const block of blocks) {
    const body = block.split(/<\/anime>/i)[0] ?? '';
    const field = (tag: string): string => {
      const match = body.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
      return match ? decodeXmlEntities(match[1]) : '';
    };

    const malId = toNumber(field('series_animedb_id'));
    const title = field('series_title');
    if (!malId || !title) {
      skipped += 1;
      continue;
    }

    const episodesRaw = field('series_episodes');
    const episodes = episodesRaw && toNumber(episodesRaw) > 0 ? toNumber(episodesRaw) : null;
    const episodesWatched = Math.max(0, toNumber(field('my_watched_episodes')));
    const score = clampScore(field('my_score'));
    const statusRaw = field('my_status');
    const coverRaw = field('series_image');

    items.push({
      malId,
      title,
      coverUrl: coverRaw ? toHttps(coverRaw) : undefined,
      score: 0,
      userScore: score,
      episodes,
      episodesWatched,
      genres: [],
      seasonYear: null,
      studios: [],
      watchStatus: mapTextStatus(statusRaw),
      listType: 'anime',
    });
  }

  return { source: 'mal', items: mergeItems(items), skipped };
}

/** AniList JSON yedeğini (Ayarlar → İçe/Dışa Aktar) ayrıştırır. Yalnızca ANIME. */
export function parseAniListJson(raw: string): ParsedImport {
  const json = JSON.parse(raw) as {
    lists?: Array<{
      name?: string;
      entries?: Array<{
        status?: string;
        score?: number | string;
        progress?: number | string;
        media?: {
          id?: number | null;
          idMal?: number | null;
          type?: string | null;
          episodes?: number | null;
          format?: string | null;
          season?: string | null;
          seasonYear?: number | null;
          averageScore?: number | null;
          genres?: string[] | null;
          title?: { romaji?: string | null; english?: string | null; native?: string | null } | null;
          coverImage?: { extraLarge?: string | null; large?: string | null; medium?: string | null } | null;
          studios?: { nodes?: Array<{ id?: number | null; name?: string | null } | null> | null } | null;
          status?: string | null;
          description?: string | null;
        } | null;
      }>;
    }>;
  };

  const lists = Array.isArray(json.lists) ? json.lists : [];
  if (lists.length === 0) {
    return { source: 'anilist', items: [], skipped: 0 };
  }

  const items: ParsedImportItem[] = [];
  let skipped = 0;

  for (const list of lists) {
    for (const entry of list.entries ?? []) {
      const media = entry.media;
      const mtype = (media?.type ?? 'ANIME').toUpperCase();
      if (mtype !== 'ANIME') {
        // Manga/novel bu akışa girmez (onlar MultiMedya kütüphanesinde).
        skipped += 1;
        continue;
      }
      const malId = Number(media?.idMal ?? 0);
      const title = media?.title?.english || media?.title?.romaji || media?.title?.native || '';
      if (!malId || !title) {
        skipped += 1;
        continue;
      }
      const studios = (media?.studios?.nodes ?? [])
        .filter((node): node is { id?: number | null; name?: string | null } => Boolean(node))
        .map((node) => {
          const name = (node.name ?? '').trim();
          return name ? { mal_id: stableNameId(name), name } : null;
        })
        .filter((s): s is { mal_id: number; name: string } => Boolean(s));

      items.push({
        malId,
        title,
        coverUrl: media?.coverImage?.extraLarge ?? media?.coverImage?.large ?? media?.coverImage?.medium ?? undefined,
        synopsis: (media?.description ?? '').trim() || undefined,
        score: clampScore(media?.averageScore ?? 0),
        userScore: clampScore(entry.score ?? 0),
        episodes: media?.episodes && media.episodes > 0 ? media.episodes : null,
        episodesWatched: Math.max(0, toNumber(String(entry.progress ?? 0))),
        genres: (media?.genres ?? []).filter(Boolean).map((name) => ({ mal_id: stableNameId(name), name })),
        seasonYear: media?.seasonYear ?? null,
        status: media?.status ? ANILIST_AIRING_STATUS[media.status] ?? media.status : undefined,
        season: media?.season ? ANILIST_SEASON[media.season] ?? media.season : undefined,
        type: media?.format ? ANILIST_FORMAT_TYPE[media.format] ?? media.format : undefined,
        studios,
        watchStatus: ANILIST_STATUS_MAP[entry.status ?? ''] ?? 'plan_to_watch',
        listType: 'anime',
      });
    }
  }

  return { source: 'anilist', items: mergeItems(items), skipped };
}

/** Yapıştırılan/seçilen metnin hangi yedeğe ait olduğunu tahmin eder. */
export function detectImportSource(raw: string): ImportSource | null {
  const text = raw.trim();
  if (!text) return null;
  if (text.startsWith('<') && /<anime>/i.test(text)) return 'mal';
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const json = JSON.parse(text) as { lists?: unknown };
      if (Array.isArray(json?.lists)) return 'anilist';
    } catch {
      return null;
    }
  }
  // Sayfası okunan bir yedek var ama listeleri yoksa yine de AniList'tir.
  if (text.startsWith('{') && /"lists"\s*:/.test(text)) return 'anilist';
  return null;
}

/** Metin kaynaklı ayrıştırma (senkron, ağ gerektirmez). */
export function parseImportText(raw: string): ParsedImport {
  const source = detectImportSource(raw);
  if (source === 'mal') return parseMalXml(raw);
  if (source === 'anilist') return parseAniListJson(raw);
  throw new Error('Desteklenmeyen dosya biçimi. MAL `animelist.xml` veya AniList JSON yedeğini kullanın.');
}

/** Zenginleştirilmiş kaydı izleme listesi öğesine çevirir; uydurma varsayılan yoktur. */
export function toWatchlistItem(
  item: ParsedImportItem,
  enrichment?: {
    displayTitle: string;
    title?: { english?: string; romaji?: string; native?: string };
    synopsis?: string;
    averageScore?: number | null;
    episodes?: number | null;
    genres?: string[];
    seasonYear?: number | null;
    status?: string;
    season?: string;
    type?: string;
    studios?: Array<{ name: string }>;
    cover?: { large?: string; medium?: string };
  },
): WatchlistItem {
  const title = enrichment?.displayTitle || item.title;
  const genres =
    enrichment?.genres && enrichment.genres.length > 0
      ? enrichment.genres.map((name) => ({ mal_id: stableNameId(name), name }))
      : item.genres;

  const studios =
    enrichment?.studios && enrichment.studios.length > 0
      ? enrichment.studios.map((studio) => ({ mal_id: stableNameId(studio.name), name: studio.name }))
      : item.studios;

  const anime: Anime = {
    mal_id: item.malId,
    title,
    title_english: enrichment?.title?.english ?? null,
    images: {
      jpg: { image_url: enrichment?.cover?.large ?? enrichment?.cover?.medium ?? item.coverUrl ?? '', large_image_url: enrichment?.cover?.large ?? enrichment?.cover?.medium ?? item.coverUrl ?? '' },
      webp: { image_url: enrichment?.cover?.large ?? enrichment?.cover?.medium ?? item.coverUrl ?? '', large_image_url: enrichment?.cover?.large ?? enrichment?.cover?.medium ?? item.coverUrl ?? '' },
    },
    synopsis: enrichment?.synopsis ?? item.synopsis ?? '',
    score:
      enrichment?.averageScore != null
        ? Math.round((enrichment.averageScore / 10) * 10) / 10
        : item.score > 0
          ? item.score
          : null,
    episodes: enrichment?.episodes ?? item.episodes,
    status: enrichment?.status ? ANILIST_AIRING_STATUS[enrichment.status] ?? enrichment.status : item.status ?? '',
    genres,
    year: enrichment?.seasonYear ?? item.seasonYear,
    type: enrichment?.type ?? item.type,
    season: enrichment?.season ? ANILIST_SEASON[enrichment.season] ?? enrichment.season : item.season,
    studios,
  };

  return {
    anime,
    status: item.watchStatus,
    userScore: item.userScore,
    episodesWatched: item.episodesWatched,
    addedAt: new Date().toISOString(),
  };
}
