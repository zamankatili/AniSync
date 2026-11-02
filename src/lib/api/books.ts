import type { Media } from '../types';
import { stripHtml } from '../format';

const SEARCH_FIELDS =
  'key,title,author_name,first_publish_year,cover_i,subject,number_of_pages_median,ratings_average,edition_count,first_sentence';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  number_of_pages_median?: number;
  ratings_average?: number;
  edition_count?: number;
  first_sentence?: string[];
}

interface SearchResponse {
  docs: OpenLibraryDoc[];
  numFound: number;
}

const NOISE = /(fiction|juvenile|literature|translations|criticism|history and criticism|american|english|20th century|19th century)/i;

function cleanGenres(subjects?: string[]): string[] {
  if (!subjects) return [];
  const out: string[] = [];
  for (const raw of subjects) {
    const first = raw.split(',')[0].trim();
    if (!first || first.length > 24 || NOISE.test(first)) continue;
    if (out.includes(first)) continue;
    out.push(first);
    if (out.length >= 3) break;
  }
  return out;
}

export function mapBook(d: OpenLibraryDoc, description = ''): Media {
  const authors = d.author_name?.slice(0, 2).join(', ');
  const bits = [authors, d.first_publish_year].filter(Boolean) as string[];
  return {
    id: `book:${d.key.replace('/works/', '')}`,
    source: 'openlibrary',
    type: 'novel',
    title: d.title,
    subtitle: authors || undefined,
    cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : '',
    description,
    genres: cleanGenres(d.subject),
    score: d.ratings_average ? Math.round(d.ratings_average * 20) : null,
    year: d.first_publish_year ?? null,
    totalUnits: d.number_of_pages_median ?? null,
    unitLabel: 'sayfa',
    meta: bits.join(' · '),
    externalUrl: `https://openlibrary.org${d.key}`,
  };
}

const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 1000 * 60 * 30;

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  const value = await loader();
  cache.set(key, { at: Date.now(), value });
  return value;
}

export async function searchBooks(query: string, limit = 18): Promise<Media[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  return cached(`bsearch:${q.toLowerCase()}`, async () => {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}&fields=${SEARCH_FIELDS}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!res.ok) throw new Error(`Open Library isteği başarısız (${res.status})`);
    const json = (await res.json()) as SearchResponse;
    return (json.docs ?? [])
      .filter((d) => d.cover_i)
      .map((d) => mapBook(d, d.first_sentence?.[0] ? stripHtml(d.first_sentence[0]) : ''));
  });
}

export async function trendingBooks(): Promise<Media[]> {
  return cached('btrending', async () => {
    const res = await fetch('https://openlibrary.org/trending/weekly.json?limit=18', { signal: AbortSignal.timeout(9000) });
    if (!res.ok) throw new Error('Open Library trend verisi alınamadı');
    const json = (await res.json()) as { works: OpenLibraryDoc[] };
    return (json.works ?? []).filter((w) => w.cover_i).slice(0, 12).map((w) => mapBook(w));
  });
}

interface WorkResponse {
  title?: string;
  description?: string | { value: string };
  subjects?: string[];
  first_publish_date?: string;
  covers?: number[];
}

export async function bookDetail(id: string): Promise<Media | null> {
  const key = id.replace(/^book:/, '');
  const res = await fetch(`https://openlibrary.org/works/${key}.json`, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) return null;
  const json = (await res.json()) as WorkResponse;
  const description =
    typeof json.description === 'string' ? json.description : json.description?.value ?? '';
  const cover = json.covers?.[0] ? `https://covers.openlibrary.org/b/id/${json.covers[0]}-L.jpg` : '';
  const year = json.first_publish_date ? Number(json.first_publish_date.match(/\d{4}/)?.[0]) : null;
  return {
    id,
    source: 'openlibrary',
    type: 'novel',
    title: json.title ?? '',
    cover,
    description: stripHtml(description),
    genres: cleanGenres(json.subjects),
    year: year && Number.isFinite(year) ? year : null,
    totalUnits: null,
    unitLabel: 'sayfa',
  };
}
