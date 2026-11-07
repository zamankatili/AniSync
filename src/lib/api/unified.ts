/**
 * Birleşik arama dağıtıcısı.
 *
 * Arayüz yalnızca bu modülü tanır. Kaynak seçimi, yedekleme (fallback) ve
 * normalizasyon burada yapılır. Yeni bir kaynak eklemek için:
 *   1) `lib/api/<kaynak>.ts` içinde arama + detay fonksiyonları yaz,
 *   2) aşağıdaki `searchByKind` / `getUnifiedDetail` dağıtıcısına bağla.
 */

import { getAniListMedia, searchAniList } from './anilist';
import { getJikanMedia, searchJikan } from './jikan';
import { getOpenLibraryWork, searchOpenLibrary } from './openlibrary';
import { getSteamGame, searchSteam } from './steam';
import type {
  MediaKind,
  MediaSearchResult,
  UnifiedMedia,
  UnifiedSearchOptions,
} from '../../types/unified';
import { sortKinds } from '../../types/unified';

const DEFAULT_KINDS: MediaKind[] = ['anime', 'manga', 'light_novel'];

const emptyResult = (kind: MediaKind, page: number, source: MediaSearchResult['source']): MediaSearchResult => ({
  items: [],
  page,
  hasNextPage: false,
  kind,
  source,
});

async function searchByKind(kind: MediaKind, options: UnifiedSearchOptions): Promise<MediaSearchResult> {
  const { query, page = 1, perPage = 20, hideAdult = true, signal } = options;

  switch (kind) {
    case 'anime': {
      try {
        return await searchAniList({ query, kind: 'anime', page, perPage, hideAdult, signal });
      } catch (error) {
        console.warn('[unified] AniList anime araması başarısız, Jikan yedek kaynağına geçiliyor.', error);
        return searchJikan({ kind: 'anime', query, page, limit: perPage, signal });
      }
    }
    case 'manga': {
      try {
        return await searchAniList({ query, kind: 'manga', page, perPage, hideAdult, signal });
      } catch (error) {
        console.warn('[unified] AniList manga araması başarısız, Jikan yedek kaynağına geçiliyor.', error);
        return searchJikan({ kind: 'manga', query, page, limit: perPage, signal });
      }
    }
    case 'light_novel': {
      try {
        return await searchAniList({ query, kind: 'light_novel', page, perPage, hideAdult, signal });
      } catch (error) {
        console.warn('[unified] AniList light novel araması başarısız.', error);
        return emptyResult(kind, page, 'anilist');
      }
    }
    case 'novel': {
      try {
        return await searchOpenLibrary(query, page, perPage, signal);
      } catch (error) {
        console.warn('[unified] OpenLibrary araması başarısız.', error);
        return emptyResult(kind, page, 'openlibrary');
      }
    }
    case 'game': {
      try {
        return await searchSteam(query, page, perPage, 'en', signal);
      } catch (error) {
        console.warn('[unified] Steam oyun araması başarısız.', error);
        return emptyResult(kind, page, 'steam');
      }
    }
    default:
      return emptyResult(kind, page, 'anilist');
  }
}

/**
 * Birden fazla türde paralel arama yapar ve tür bazında gruplanmış sonuç döndürür.
 * Tek bir kaynağın çökmesi diğer türleri engellemez.
 */
export async function searchMedia(options: UnifiedSearchOptions): Promise<MediaSearchResult[]> {
  const kinds = sortKinds(options.kinds?.length ? options.kinds : DEFAULT_KINDS);
  const settled = await Promise.allSettled(kinds.map((kind) => searchByKind(kind, options)));

  return settled.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    console.warn('[unified] arama hatası', kinds[index], result.reason);
    return emptyResult(kinds[index], options.page ?? 1, 'anilist');
  });
}

export interface ParsedUnifiedId {
  source: UnifiedMedia['source'];
  kind?: MediaKind;
  sourceId: string;
}

/**
 * "anilist:154587", "jikan:anime:52991", "openlibrary:OL123W" gibi kimlikleri çözer.
 */
export function parseUnifiedId(id: string): ParsedUnifiedId | null {
  const [source, ...rest] = id.split(':');
  if (!source || rest.length === 0) return null;

  if (source === 'jikan') {
    const [kind, sourceId] = rest;
    if (!kind || !sourceId) return null;
    return { source: 'jikan', kind: kind as MediaKind, sourceId };
  }

  if (source === 'anilist' || source === 'openlibrary' || source === 'steam' || source === 'igdb' || source === 'rawg') {
    return { source, sourceId: rest.join(':') };
  }

  return null;
}

/** Tek bir kaydın detayını getirir; kaynağı kimlikten çözer. */
export async function getUnifiedDetail(id: string, signal?: AbortSignal): Promise<UnifiedMedia | null> {
  const parsed = parseUnifiedId(id);
  if (!parsed) return null;

  switch (parsed.source) {
    case 'anilist': {
      const numericId = Number(parsed.sourceId);
      if (!Number.isFinite(numericId)) return null;
      return getAniListMedia(numericId, signal);
    }
    case 'jikan': {
      const numericId = Number(parsed.sourceId);
      if (!Number.isFinite(numericId)) return null;
      return getJikanMedia(parsed.kind === 'manga' ? 'manga' : 'anime', numericId, signal);
    }
    case 'openlibrary': {
      return getOpenLibraryWork(parsed.sourceId, signal);
    }
    case 'steam': {
      return getSteamGame(parsed.sourceId, signal);
    }
    default:
      // IGDB/RAWG detayları ileride eklenecek.
      return null;
  }
}
