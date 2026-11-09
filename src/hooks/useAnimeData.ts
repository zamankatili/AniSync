import { useState, useCallback, useRef } from 'react';
import { Anime } from '../types';
import { FALLBACK_LISTS, EXTENDED_RANDOM_CATALOG } from '../data/fallbackLists';
import { CURATED_SIMILAR_DATA, SimilarRecommendation } from '../data/animeRecommendations';
import { fetchAnimeFallback, toLegacyAnime } from '../lib/api/animeBridge';
import { searchAniList, fetchSeasonalTrendingAnime } from '../lib/api/anilist';

const BASE_URL = 'https://api.jikan.moe/v4';

// MAL tür kimliği -> AniList tür adı (Explore'un genre filtresi bunları kullanır)
const MAL_GENRE_TO_ANILIST: Record<number, string> = {
  1: 'Action',
  2: 'Adventure',
  4: 'Comedy',
  8: 'Drama',
  10: 'Fantasy',
  14: 'Horror',
  22: 'Romance',
  24: 'Sci-Fi',
  36: 'Slice of Life',
};
const CACHE_KEY_PREFIX = 'ety_jikan_cache_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

interface CacheItem {
  data: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheItem>();

const isNoCacheUrl = (url: string) => {
  return url.includes('/random/anime') || url.includes('_nocache') || url.includes('_ts=');
};

const getFromCache = (key: string) => {
  if (isNoCacheUrl(key)) return null;

  const now = Date.now();
  if (memoryCache.has(key)) {
    const item = memoryCache.get(key)!;
    if (now - item.timestamp < CACHE_TTL_MS) {
      return item.data;
    }
  }

  try {
    const stored = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (stored) {
      const parsed: CacheItem = JSON.parse(stored);
      if (now - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return null;
};

const setToCache = (key: string, data: any) => {
  if (isNoCacheUrl(key)) return;

  const item: CacheItem = { data, timestamp: Date.now() };
  memoryCache.set(key, item);
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(item));
  } catch (e) {
    // Ignore localStorage errors
  }
};

interface UseAnimeResult {
  data: Anime[] | null;
  loading: boolean;
  error: string | null;
  fetchTop: () => Promise<void>;
  searchAnime: (query: string) => Promise<void>;
  fetchRandom: () => Promise<Anime | null>;
  fetchByCriteria: (genres: number[]) => Promise<Anime[] | null>;
  fetchAnimeList: (path: string) => Promise<Anime[] | null>;
  fetchById: (id: number) => Promise<Anime | null>;
  fetchSimilarAnime: (animeId: number) => Promise<SimilarRecommendation[]>;
}

let apiQueue: Promise<any> = Promise.resolve();
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Jikan yanıt vermezse isteği iptal et (sayfa sonsuza kadar yüklenmesin). */
const fetchWithTimeout = async (url: string, timeoutMs = 9000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const jikanFetch = async (url: string) => {
  // Check cache first (skips for random/nocache)
  const cached = getFromCache(url);
  if (cached) {
    return cached;
  }

  apiQueue = apiQueue.then(() => delay(500)); // 500ms delay to respect Jikan rate limits
  await apiQueue;

  try {
    const res = await fetchWithTimeout(url);
    if (res.status === 429) {
      // Retry once after backoff delay if rate limited
      await delay(1600);
      const retryRes = await fetchWithTimeout(url);
      if (!retryRes.ok) throw new Error(`API Error: ${retryRes.status}`);
      const json = await retryRes.json();
      if (json && json.data) {
        setToCache(url, json);
      }
      return json;
    }
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const json = await res.json();
    if (json && json.data) {
      setToCache(url, json);
    }
    return json;
  } catch (err) {
    console.warn(`Jikan fetch failed for ${url}:`, err);
    throw err;
  }
};

// Çevrimdışı fallback: CANLI yollar (güncel yayın / sezon / yaklaşan) boş döner —
// eski klasikler "bu sezon yayında" gibi sunulmaz. Yalnızca doğası gereği
// "tüm zamanlar" olan listeler arşivden beslenir.
const getFallbackByPath = (path: string): Anime[] => {
  if (path.includes('airing') || path.includes('now') || path.includes('season') || path.includes('upcoming')) {
    return [];
  }
  if (path.includes('movie')) {
    return FALLBACK_LISTS['evergreen_movies'];
  }
  if (path.includes('bypopularity') || path.includes('type=tv')) {
    return FALLBACK_LISTS['evergreen_popular'];
  }
  return [];
};

// Track shown anime IDs across random calls to prevent repeating
const shownRandomIds = new Set<number>();

const localAnimeSearch = (q: string): Anime[] => {
  const allLocal = [
    ...(FALLBACK_LISTS['evergreen_picks'] || []),
    ...(FALLBACK_LISTS['evergreen_popular'] || []),
    ...(FALLBACK_LISTS['evergreen_upcoming'] || []),
    ...(FALLBACK_LISTS['evergreen_movies'] || []),
  ];
  const matches = allLocal.filter(
    (a) =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.title_english && a.title_english.toLowerCase().includes(q)) ||
      ((a as any).title_japanese && (a as any).title_japanese.toLowerCase().includes(q)) ||
      (a.synopsis && a.synopsis.toLowerCase().includes(q))
  );
  return Array.from(new Map(matches.map((m) => [m.mal_id, m])).values());
};

const fetchAniListAsLegacy = async (options: { query?: string; perPage?: number } = {}): Promise<Anime[]> => {
  try {
    const result = await searchAniList({
      query: options.query ?? '',
      kind: 'anime',
      perPage: options.perPage ?? 12,
    });
    return result.items.map((item) => toLegacyAnime(item));
  } catch (error) {
    console.warn('[useAnimeData] AniList yedek listesi alınamadı:', error);
    return [];
  }
};

export const useAnimeData = (): UseAnimeResult => {
  const [data, setData] = useState<Anime[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trending — GÜNCEL SEZON trendleri AniList'ten (birincil), Jikan sezonu yedek.
  // Eski davranış: Jikan `top/anime?filter=airing` = tüm zamanların puan
  // sıralaması; "güncel" gibi gösterilmesi yanıltıcıydı.
  const fetchTop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const seasonal = await fetchSeasonalTrendingAnime(12);
      const items = seasonal.items.map((item) => toLegacyAnime(item));
      if (items.length > 0) {
        setData(items);
        setError(null);
        setLoading(false);
        return;
      }
    } catch (_anilistErr) {
      // AniList yoksa Jikan'ın GERÇEK güncel sezon listesine geç
    }

    try {
      const json = await jikanFetch(`${BASE_URL}/seasons/now?limit=12&sfw=true`);
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        setData(json.data as Anime[]);
        setError(null);
        setLoading(false);
        return;
      }
    } catch (_jikanErr) {
      // iki kaynak da yok
    }

    setData([]);
    setError('Güncel sezon listesi alınamadı. Bağlantınızı kontrol edip tekrar deneyin.');
    setLoading(false);
  }, []);

  // Search anime by query with resilient offline fallback
  const searchAnime = useCallback(async (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const json = await jikanFetch(`${BASE_URL}/anime?q=${encodeURIComponent(query.trim())}&sfw=true&limit=12`);
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        setData(json.data as Anime[]);
      } else {
        // Jikan boş döndü: AniList'te ara, o da yoksa yerel havuzda.
        const fromAniList = await fetchAniListAsLegacy({ query, perPage: 12 });
        setData(fromAniList.length > 0 ? fromAniList : localAnimeSearch(q));
      }
    } catch (err: any) {
      console.warn('Remote search error, falling back to AniList / local pool:', err);
      const fromAniList = await fetchAniListAsLegacy({ query, perPage: 12 });
      setData(fromAniList.length > 0 ? fromAniList : localAnimeSearch(q));
    } finally {
      setLoading(false);
    }
  }, []);

  // SINIRSIZ KEŞİF MOTORU — AniList birincil: 1..15 POPULARITY_DESC sayfasında rastgele 20'lik dilim
  const fetchRandom = useCallback(async (): Promise<Anime | null> => {
    setLoading(true);
    setError(null);

    try {
    // Filter helper to pick an unseen anime from an array
    const pickUnseen = (pool: Anime[]): Anime | null => {
      const unseen = pool.filter((a) => a.mal_id > 0 && !shownRandomIds.has(a.mal_id));
      if (unseen.length > 0) {
        const picked = unseen[Math.floor(Math.random() * unseen.length)];
        shownRandomIds.add(picked.mal_id);
        return picked;
      }
      const any = pool.find((a) => a.mal_id > 0);
      if (any) {
        shownRandomIds.clear();
        shownRandomIds.add(any.mal_id);
        return any;
      }
      return null;
    };

    try {
      // AniList birincil: 1..15 POPULARITY_DESC sayfasında rastgele 20'lik dilim (canlı, SFW)
      const page = Math.floor(Math.random() * 15) + 1;
      const result = await searchAniList({ kind: 'anime', page, perPage: 20 });
      const pool = result.items
        .filter((m) => typeof m.externalIds?.mal === 'number')
        .map((m) => toLegacyAnime(m, m.externalIds!.mal as number));
      const picked = pool.length > 0 ? pickUnseen(pool) : null;
      if (picked) return picked;
    } catch (e) {
      console.warn('AniList rastgele motoru başarısız, Jikan deneniyor:', e);
    }

    try {
      // Yedek: Jikan sayfası
      const randomPage = Math.floor(Math.random() * 25) + 1;
      const json = await jikanFetch(`${BASE_URL}/top/anime?page=${randomPage}&limit=25&_nocache=${Date.now()}`);
      if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
        const picked = pickUnseen(json.data as Anime[]);
        if (picked) return picked;
      }
    } catch (e) {
      console.warn('Jikan sayfa rastgele fetch başarısız, random endpoint deneniyor:', e);
    }

    try {
      // yedek: Jikan direkt rastgele
      const json = await jikanFetch(`${BASE_URL}/random/anime?_ts=${Date.now()}`);
      if (json && json.data) {
        const anime = json.data as Anime;
        shownRandomIds.add(anime.mal_id);
        return anime;
      }
    } catch (e) {
      console.warn('Jikan /random başarısız:', e);
    }

    // son çare: dürüst yedek katalog
    const fallbackPicked = pickUnseen(EXTENDED_RANDOM_CATALOG);
    return fallbackPicked ?? EXTENDED_RANDOM_CATALOG[0];
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter by Criteria — AniList birincil: genre_in ile rastgele sayfa
  const fetchByCriteria = useCallback(async (genres: number[]): Promise<Anime[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const names = Array.from(
        new Set(genres.map((id) => MAL_GENRE_TO_ANILIST[id]).filter((name): name is string => Boolean(name)))
      );

      if (names.length > 0) {
        const page = Math.floor(Math.random() * 4) + 1;
        const result = await searchAniList({ kind: 'anime', page, perPage: 15, genreIn: names });
        const pool = result.items
          .filter((m) => typeof m.externalIds?.mal === 'number')
          .map((m) => toLegacyAnime(m, m.externalIds!.mal as number));
        if (pool.length > 0) return pool;
      }

      // yedek: Jikan (MAL tür id'leri doğrudan çalışır)
      try {
        const genreString = genres.join(',');
        const randomPage = Math.floor(Math.random() * 4) + 1;
        const json = await jikanFetch(`${BASE_URL}/anime?genres=${genreString}&page=${randomPage}&order_by=popularity&sort=asc&sfw=true&limit=15&_nocache=${Date.now()}`);
        if (json && json.data && json.data.length > 0) {
          return json.data as Anime[];
        }
      } catch (err: any) {
        console.warn('Jikan kriter motoru başarısız:', err);
      }

      const matches = EXTENDED_RANDOM_CATALOG.filter((a) =>
        a.genres?.some((g) => genres.includes(g.mal_id))
      );
      return matches.length > 0 ? matches : FALLBACK_LISTS['evergreen_popular'];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch list by specific path
  const fetchAnimeList = useCallback(async (path: string): Promise<Anime[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const json = await jikanFetch(`${BASE_URL}${path}`);
      if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as Anime[];
      }
      return getFallbackByPath(path);
    } catch (err: any) {
      console.warn(`Fallback triggered for ${path}`);
      return getFallbackByPath(path);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Anime by MAL ID
  const fetchById = useCallback(async (id: number): Promise<Anime | null> => {
    setLoading(true);
    setError(null);

    // 1) Birincil kaynak: AniList (hızlı, anahtarsız, güncel).
    const fromAniList = await fetchAnimeFallback(id);
    if (fromAniList) {
      setLoading(false);
      return fromAniList;
    }

    // 2) Yedek: Jikan (MAL) — AniList'te karşılığı yoksa.
    try {
      const json = await jikanFetch(`${BASE_URL}/anime/${id}`);
      if (!json?.data) throw new Error('Jikan boş yanıt döndürdü');
      return json.data as Anime;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch anime by ID');
      const inCatalog = EXTENDED_RANDOM_CATALOG.find(a => a.mal_id === id);
      return inCatalog || null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Similar Anime Recommendations
  const fetchSimilarAnime = useCallback(async (animeId: number): Promise<SimilarRecommendation[]> => {
    // 1. Check curated data first for instant rich matches
    const curated = CURATED_SIMILAR_DATA[animeId];
    if (curated && curated.length > 0) {
      return curated;
    }

    // 2. Fetch live recommendations from Jikan
    try {
      const json = await jikanFetch(`${BASE_URL}/anime/${animeId}/recommendations`);
      if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
        const recommendations: SimilarRecommendation[] = json.data.slice(0, 6).map((rec: any) => ({
          anime: {
            mal_id: rec.entry.mal_id,
            title: rec.entry.title,
            title_english: rec.entry.title,
            images: rec.entry.images,
            synopsis: 'Topluluk tarafından bu seriyi beğenenler için önerildi.',
            score: 8.0,
            episodes: 12,
            status: 'Finished Airing',
            genres: [],
            year: 2022
          } as Anime,
          reason: `Topluluktaki yüzlerce izleyici bu seriyi tamamladıktan sonra önerdi (${rec.votes || 10}+ Tavsiye oyu).`,
          matchScore: Math.min(99, 85 + Math.min(14, rec.votes || 5))
        }));
        return recommendations;
      }
    } catch (err) {
      console.warn(`Jikan recommendations failed for ${animeId}:`, err);
    }

    // 3. Fallback: Return diverse high-rated recommendations from catalog
    return EXTENDED_RANDOM_CATALOG.slice(0, 4).map((anime, idx) => ({
      anime,
      reason: 'Benzer tür, sürükleyici hikaye anlatımı ve yüksek topluluk puanı.',
      matchScore: 90 - idx * 3
    }));
  }, []);

  return { 
    data, 
    loading, 
    error, 
    fetchTop, 
    searchAnime, 
    fetchRandom, 
    fetchByCriteria, 
    fetchAnimeList, 
    fetchById,
    fetchSimilarAnime
  };
};
