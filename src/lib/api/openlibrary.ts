/**
 * OpenLibrary adaptörü — novella / kitap araması.
 *
 * Roman ve light novel kataloğu için açık, anahtarsız bir kaynak.
 * Kapak görselleri `covers.openlibrary.org` üzerinden gelir.
 */

import { fetchJson } from './http';
import { createTtlCache, dedupe } from './cache';
import type { MediaSearchResult, UnifiedMedia } from '../../types/unified';

const BASE_URL = 'https://openlibrary.org';
const cache = createTtlCache<unknown>({ ttlMs: 30 * 60 * 1000 });

interface OpenLibraryDoc {
  key: string;
  title?: string;
  subtitle?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  edition_count?: number;
  language?: string[];
  subject?: string[];
  ia?: string[];
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibraryDoc[];
  numFound?: number;
  start?: number;
}

const coverUrl = (coverId?: number) => (coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined);

export function mapOpenLibraryDoc(doc: OpenLibraryDoc): UnifiedMedia {
  const key = doc.key?.replace('/works/', '') || doc.key;
  const subjects = (doc.subject ?? []).slice(0, 8);

  return {
    id: `openlibrary:${key}`,
    source: 'openlibrary',
    sourceId: key,
    kind: 'novel',
    title: {
      english: doc.title,
      romaji: doc.subtitle ? `${doc.title}: ${doc.subtitle}` : doc.title,
    },
    displayTitle: doc.title || '—',
    synopsis: undefined,
    cover: {
      large: coverUrl(doc.cover_i),
      medium: coverUrl(doc.cover_i),
      small: coverUrl(doc.cover_i),
    },
    format: 'NOVEL',
    status: undefined,
    seasonYear: doc.first_publish_year ?? null,
    startDate: doc.first_publish_year ? { year: doc.first_publish_year } : undefined,
    averageScore: null,
    popularity: doc.edition_count ?? null,
    genres: subjects,
    tags: subjects,
    studios: (doc.author_name ?? []).map((name) => ({ name })),
    relations: [],
    externalLinks: [{ site: 'OpenLibrary', url: `${BASE_URL}${doc.key}`, type: 'info' }],
    updatedAt: Date.now(),
  };
}

export async function searchOpenLibrary(
  query: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal
): Promise<MediaSearchResult> {  const trimmed = query.trim();
  if (!trimmed) {
    return { items: [], page, hasNextPage: false, kind: 'novel', source: 'openlibrary' };
  }

  const cacheKey = `search:${trimmed.toLowerCase()}:${page}:${limit}`;

  return dedupe(cacheKey, async () => {
    const cached = cache.get(cacheKey) as MediaSearchResult | null;
    if (cached) return cached;

    const payload = await fetchJson<OpenLibrarySearchResponse>(
      `${BASE_URL}/search.json?q=${encodeURIComponent(trimmed)}&limit=${limit}&page=${page}`,
      {},
      { timeoutMs: 9000, retries: 1, signal }
    );

    const items = (payload.docs ?? []).map(mapOpenLibraryDoc);
    const total = payload.numFound ?? items.length;

    const result: MediaSearchResult = {
      items,
      page,
      hasNextPage: page * limit < total,
      kind: 'novel',
      source: 'openlibrary',
    };

    cache.set(cacheKey, result);
    return result;
  });
}

interface OpenLibraryWork {
  key: string;
  title?: string;
  description?: string | { value?: string } | null;
  subjects?: string[];
  covers?: number[];
  first_publish_date?: string | null;
  first_publish_year?: number | null;
}

const parseDescription = (description: OpenLibraryWork['description']): string | undefined => {
  if (!description) return undefined;
  if (typeof description === 'string') return description.trim() || undefined;
  return description.value?.trim() || undefined;
};

const parseYear = (work: OpenLibraryWork): number | null => {
  if (typeof work.first_publish_year === 'number') return work.first_publish_year;
  const match = work.first_publish_date?.match(/\d{4}/);
  return match ? Number(match[0]) : null;
};

/** Tek bir OpenLibrary eserini (`OL...W`) getirir. */
export async function getOpenLibraryWork(workId: string, signal?: AbortSignal): Promise<UnifiedMedia | null> {
  const cleanId = workId.replace(/^\/works\//, '').trim();
  if (!cleanId) return null;

  const cacheKey = `detail:${cleanId}`;
  const cached = cache.get(cacheKey) as UnifiedMedia | null;
  if (cached) return cached;

  const work = await fetchJson<OpenLibraryWork>(
    `${BASE_URL}/works/${encodeURIComponent(cleanId)}.json`,
    {},
    { timeoutMs: 9000, retries: 1, signal }
  );

  const coverId = work.covers?.[0];
  const subjects = (work.subjects ?? []).slice(0, 10);
  const year = parseYear(work);

  const media: UnifiedMedia = {
    id: `openlibrary:${cleanId}`,
    source: 'openlibrary',
    sourceId: cleanId,
    kind: 'novel',
    title: { english: work.title },
    displayTitle: work.title || '—',
    synopsis: parseDescription(work.description),
    cover: {
      large: coverUrl(coverId),
      medium: coverUrl(coverId),
      small: coverUrl(coverId),
    },
    format: 'NOVEL',
    seasonYear: year,
    startDate: year ? { year } : undefined,
    averageScore: null,
    genres: subjects,
    tags: subjects,
    studios: [],
    relations: [],
    externalLinks: [{ site: 'OpenLibrary', url: `${BASE_URL}/works/${cleanId}`, type: 'info' }],
    updatedAt: Date.now(),
    externalIds: { openlibrary: cleanId },
  };

  cache.set(cacheKey, media);
  return media;
}
