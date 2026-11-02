import type { Media, ShelfStatus } from './types';
import { anilistByMalIds } from './api/anilist';

export interface ImportItem {
  media: Media;
  status: ShelfStatus;
  progress: number;
  score?: number;
}

export type ImportSource = 'mal' | 'anilist';

export interface ImportResult {
  source: ImportSource;
  items: ImportItem[];
  skipped: number;
  enriched?: number;
}

const MAL_STATUS: Record<string, ShelfStatus> = {
  '1': 'active',
  '2': 'done',
  '3': 'paused',
  '4': 'dropped',
  '6': 'planned',
};

const ANILIST_STATUS: Record<string, ShelfStatus> = {
  CURRENT: 'active',
  REPEATING: 'active',
  COMPLETED: 'done',
  PLANNING: 'planned',
  PAUSED: 'paused',
  DROPPED: 'dropped',
};

const decode = (value: string): string =>
  value
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();

const normalizeScore = (value: unknown): number | undefined => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const ten = n > 10 ? Math.round(n / 10) : Math.round(n);
  return Math.min(10, Math.max(1, ten));
};

const statusWeight = (status: ShelfStatus): number => {
  if (status === 'done') return 4;
  if (status === 'active') return 3;
  if (status === 'paused') return 2;
  if (status === 'planned') return 1;
  return 0;
};

function mergeItems(items: ImportItem[]): ImportItem[] {
  const map = new Map<string, ImportItem>();
  for (const item of items) {
    const prev = map.get(item.media.id);
    if (!prev) {
      map.set(item.media.id, item);
      continue;
    }
    const winner = statusWeight(item.status) > statusWeight(prev.status) ? item : prev;
    map.set(item.media.id, {
      media: prev.media.cover ? prev.media : item.media,
      status: winner.status,
      progress: Math.max(prev.progress, item.progress),
      score: prev.score ?? item.score,
    });
  }
  return Array.from(map.values());
}

/** MAL XML yedeğini (MyAnimeList → Export) ayrıştırır. */
export function parseMalXml(xml: string): ImportResult {
  const items: ImportItem[] = [];
  let skipped = 0;

  const blocks = xml.split(/<anime>/i).slice(1);
  for (const block of blocks) {
    const body = block.split(/<\/anime>/i)[0];
    const field = (tag: string): string => {
      const match = body.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
      return match ? decode(match[1]) : '';
    };

    const malId = field('series_animedb_id');
    const title = field('series_title');
    if (!malId || !title) {
      skipped += 1;
      continue;
    }

    const episodes = Number(field('series_episodes')) || null;
    const watched = Number(field('my_watched_episodes')) || 0;
    const status = MAL_STATUS[field('my_status')] ?? 'planned';
    const score = normalizeScore(field('my_score'));
    const image = field('series_image');

    items.push({
      media: {
        id: `mal:${malId}`,
        source: 'local',
        type: 'anime',
        title,
        cover: image,
        genres: [],
        score: null,
        year: null,
        totalUnits: episodes,
        unitLabel: 'bölüm',
        meta: [episodes ? `${episodes} bölüm` : null, 'MAL'].filter(Boolean).join(' · '),
        externalUrl: `https://myanimelist.net/anime/${malId}`,
      },
      status,
      progress: watched,
      score,
    });
  }

  return { source: 'mal', items: mergeItems(items), skipped };
}

/** AniList JSON yedeğini (Settings → Export) ayrıştırır. */
export function parseAniListJson(raw: string): ImportResult {
  const json = JSON.parse(raw) as {
    lists?: Array<{
      entries?: Array<{
        status?: string;
        score?: number;
        progress?: number;
        media?: {
          id?: number;
          idMal?: number | null;
          type?: string;
          title?: { romaji?: string; english?: string; native?: string };
          coverImage?: { large?: string; extraLarge?: string };
          bannerImage?: string;
          genres?: string[];
          averageScore?: number | null;
          seasonYear?: number | null;
          episodes?: number | null;
          chapters?: number | null;
          format?: string | null;
          siteUrl?: string;
        };
      }>;
    }>;
  };

  const lists = Array.isArray(json.lists) ? json.lists : [];
  if (!lists.length) throw new Error('AniList dosyasında liste bulunamadı.');

  const items: ImportItem[] = [];
  let skipped = 0;

  for (const list of lists) {
    for (const entry of list.entries ?? []) {
      const m = entry.media;
      const title = m?.title?.english || m?.title?.romaji || m?.title?.native;
      if (!m?.id || !title) {
        skipped += 1;
        continue;
      }
      const type = m.type === 'MANGA' ? 'manga' : 'anime';
      const total = type === 'anime' ? m.episodes ?? null : m.chapters ?? null;
      const status = ANILIST_STATUS[entry.status ?? ''] ?? 'planned';
      const progress = Number(entry.progress) || 0;

      items.push({
        media: {
          id: `${type}:${m.id}`,
          source: 'anilist',
          type,
          title,
          subtitle: m.title?.romaji && m.title.romaji !== title ? m.title.romaji : undefined,
          cover: m.coverImage?.large ?? m.coverImage?.extraLarge ?? '',
          banner: m.bannerImage || undefined,
          description: '',
          genres: m.genres ?? [],
          score: m.averageScore ?? null,
          year: m.seasonYear ?? null,
          totalUnits: total,
          unitLabel: 'bölüm',
          meta: [total ? `${total} bölüm` : null, m.seasonYear, m.format].filter(Boolean).join(' · '),
          externalUrl: m.siteUrl,
        },
        status,
        progress,
        score: normalizeScore(entry.score),
      });
    }
  }

  return { source: 'anilist', items: mergeItems(items), skipped };
}

/** MAL kayıtlarını AniList kimliği + kapağıyla zenginleştirir. */
export async function prepareMalImport(xml: string): Promise<ImportResult> {
  const parsed = parseMalXml(xml);
  if (!parsed.items.length) return parsed;

  const malIds = parsed.items
    .map((item) => Number(item.media.id.split(':')[1]))
    .filter((n) => Number.isFinite(n));

  const lookup = await anilistByMalIds(malIds);
  let enriched = 0;

  const items = parsed.items.map((item) => {
    const malId = Number(item.media.id.split(':')[1]);
    const alt = lookup.get(malId);
    if (!alt) return item;
    enriched += 1;
    return { ...item, media: alt };
  });

  return { ...parsed, items, enriched };
}

/** Yapıştırılan metnin türünü tahmin eder. */
export function detectImportSource(raw: string): ImportSource | null {
  const text = raw.trim();
  if (!text) return null;
  if (text.startsWith('<') && /<anime>/i.test(text)) return 'mal';
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json?.lists)) return 'anilist';
    } catch {
      return null;
    }
  }
  return null;
}
