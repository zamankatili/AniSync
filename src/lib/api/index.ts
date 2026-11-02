import type { Media, MediaType } from '../types';
import { anilistDetail, searchAniList, seasonalAnime, trendingAnime, trendingManga } from './anilist';
import { bookDetail, searchBooks, trendingBooks } from './books';
import { allGames, gameById, searchGames } from './games';
import { FALLBACK_ALL, FALLBACK_ANIME, FALLBACK_BOOKS, FALLBACK_MANGA } from '../../data/fallback';
import { FALLBACK_SEASON } from '../../data/seasonFallback';

export const MEDIA_TYPES: MediaType[] = ['anime', 'manga', 'novel', 'game'];

/** Sonuçları türler arasında dönüşümlü harmanlar (tek tür baskın olmasın). */
function interleave(lists: Media[][]): Media[] {
  const out: Media[] = [];
  const seen = new Set<string>();
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i += 1) {
    for (const list of lists) {
      const item = list[i];
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
  }
  return out;
}

export async function getTrending(type: MediaType): Promise<Media[]> {
  try {
    if (type === 'anime') return await trendingAnime();
    if (type === 'manga') return await trendingManga();
    if (type === 'novel') return await trendingBooks();
    return allGames();
  } catch {
    if (type === 'anime') return FALLBACK_ANIME;
    if (type === 'manga') return FALLBACK_MANGA;
    if (type === 'novel') return FALLBACK_BOOKS;
    return allGames();
  }
}

export async function getSeasonal(): Promise<Media[]> {
  try {
    return await seasonalAnime();
  } catch {
    return FALLBACK_SEASON;
  }
}

export async function searchMedia(query: string, type: MediaType | 'all'): Promise<Media[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const safe = async (fn: () => Promise<Media[]>): Promise<Media[]> => {
    try {
      return await fn();
    } catch {
      return [];
    }
  };

  if (type === 'all') {
    const [anime, manga, books] = await Promise.all([
      safe(() => searchAniList(q, 'anime')),
      safe(() => searchAniList(q, 'manga')),
      safe(() => searchBooks(q, 12)),
    ]);
    const games = searchGames(q, 8);
    const merged = interleave([anime, manga, books, games]);
    if (merged.length > 0) return merged;
    return localSearch(q);
  }

  if (type === 'game') return searchGames(q);
  if (type === 'novel') {
    const books = await safe(() => searchBooks(q));
    if (books.length) return books;
    return FALLBACK_BOOKS.filter((b) => b.title.toLocaleLowerCase('tr-TR').includes(q.toLocaleLowerCase('tr-TR')));
  }

  const result = await safe(() => searchAniList(q, type));
  if (result.length) return result;
  return localSearch(q).filter((m) => m.type === type && m.source === 'anilist');
}

function localSearch(q: string): Media[] {
  const needle = q.toLocaleLowerCase('tr-TR');
  return FALLBACK_ALL.filter((m) => {
    const hay = `${m.title} ${m.subtitle ?? ''} ${(m.genres ?? []).join(' ')}`.toLocaleLowerCase('tr-TR');
    return hay.includes(needle);
  });
}

export async function getDetail(id: string): Promise<{ media: Media; related: Media[] }> {
  const prefix = id.split(':')[0];
  const raw = id.split(':').slice(1).join(':');
  const type = prefix as MediaType;
  const numeric = Number(raw);

  if (prefix === 'game') {
    const media = gameById(id);
    if (!media) throw new Error('Oyun bulunamadı');
    return { media, related: recommendFrom([media], media.genres, 8) };
  }

  if (prefix === 'book') {
    const [detail, fallback] = await Promise.all([
      bookDetail(id).catch(() => null),
      Promise.resolve(FALLBACK_BOOKS.find((b) => b.id === id)),
    ]);
    const base = fallback ?? detail;
    if (!base) throw new Error('Kitap bulunamadı');
    const media: Media = {
      ...base,
      ...detail,
      title: base.title || detail?.title || 'İsimsiz',
      subtitle: base.subtitle,
      cover: base.cover || detail?.cover || '',
      genres: detail?.genres?.length ? detail.genres : base.genres,
    };
    return { media, related: recommendFrom([media], media.genres, 8) };
  }

  if ((type === 'anime' || type === 'manga') && Number.isFinite(numeric)) {
    try {
      const { media, related } = await anilistDetail(type, numeric);
      return {
        media,
        related: related.length ? related : recommendFrom([media], media.genres, 8),
      };
    } catch {
      const local = FALLBACK_ALL.find((m) => m.id === id);
      if (local) return { media: local, related: recommendFrom([local], local.genres, 8) };
      throw new Error('İçerik yüklenemedi');
    }
  }

  const local = FALLBACK_ALL.find((m) => m.id === id);
  if (local) return { media: local, related: recommendFrom([local], local.genres, 8) };
  throw new Error('İçerik bulunamadı');
}

/** Ortak türlere göre yerel seçkiden öneri üretir. */
export function recommendFrom(
  pool: Media[],
  genres: string[],
  limit = 8,
): Media[] {
  const want = new Set(genres.map((g) => g.toLocaleLowerCase('tr-TR')));
  const candidates = [...pool, ...FALLBACK_ALL, ...allGames()];
  const seen = new Set<string>();
  const scored = candidates
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    })
    .map((m) => {
      const shared = m.genres.filter((g) => want.has(g.toLocaleLowerCase('tr-TR'))).length;
      return { m, shared, score: m.score ?? 0 };
    })
    .filter((s) => s.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.score - a.score);
  return scored.slice(0, limit).map((s) => s.m);
}

export const typeOf = (m: Media): MediaType => m.type;
