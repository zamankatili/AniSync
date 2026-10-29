import { useState, useCallback, useRef } from 'react';
import { Anime } from '../types';
import { FALLBACK_LISTS, EXTENDED_RANDOM_CATALOG } from '../data/fallbackLists';
import { CURATED_SIMILAR_DATA, SimilarRecommendation } from '../data/animeRecommendations';

const BASE_URL = 'https://api.jikan.moe/v4';
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

const jikanFetch = async (url: string) => {
  // Check cache first (skips for random/nocache)
  const cached = getFromCache(url);
  if (cached) {
    return cached;
  }

  apiQueue = apiQueue.then(() => delay(500)); // 500ms delay to respect Jikan rate limits
  await apiQueue;

  try {
    const res = await fetch(url);
    if (res.status === 429) {
      // Retry once after backoff delay if rate limited
      await delay(1600);
      const retryRes = await fetch(url);
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

const getFallbackByPath = (path: string): Anime[] => {
  if (path.includes('airing') || path.includes('now')) {
    return FALLBACK_LISTS['top_airing'];
  }
  if (path.includes('upcoming')) {
    return FALLBACK_LISTS['top_upcoming'];
  }
  if (path.includes('movie')) {
    return FALLBACK_LISTS['top_movies'];
  }
  return FALLBACK_LISTS['top_popular'];
};

// Track shown anime IDs across random calls to prevent repeating
const shownRandomIds = new Set<number>();

export const useAnimeData = (): UseAnimeResult => {
  const [data, setData] = useState<Anime[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trending / Top Airing
  const fetchTop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await jikanFetch(`${BASE_URL}/top/anime?filter=airing&limit=10`);
      if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
        setData(json.data as Anime[]);
      } else {
        setData(FALLBACK_LISTS['top_airing']);
      }
    } catch (err: any) {
      console.warn('fetchTop fallback triggered:', err);
      // Ensure data is available without error locking the UI
      setData(FALLBACK_LISTS['top_airing']);
    } finally {
      setLoading(false);
    }
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
        // Fallback to local pool search if remote returns 0 items
        const allLocal = [
          ...(FALLBACK_LISTS['top_airing'] || []),
          ...(FALLBACK_LISTS['top_popular'] || []),
          ...(FALLBACK_LISTS['top_upcoming'] || []),
          ...(FALLBACK_LISTS['top_movies'] || [])
        ];
        const localMatches = allLocal.filter(a => 
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.title_english && a.title_english.toLowerCase().includes(q)) ||
          ((a as any).title_japanese && (a as any).title_japanese.toLowerCase().includes(q)) ||
          (a.synopsis && a.synopsis.toLowerCase().includes(q))
        );
        // Deduplicate
        const uniqueMatches = Array.from(new Map(localMatches.map(m => [m.mal_id, m])).values());
        setData(uniqueMatches);
      }
    } catch (err: any) {
      console.warn('Remote search error, falling back to local pool:', err);
      const allLocal = [
        ...(FALLBACK_LISTS['top_airing'] || []),
        ...(FALLBACK_LISTS['top_popular'] || []),
        ...(FALLBACK_LISTS['top_upcoming'] || []),
        ...(FALLBACK_LISTS['top_movies'] || [])
      ];
      const localMatches = allLocal.filter(a => 
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.title_english && a.title_english.toLowerCase().includes(q)) ||
        (a.synopsis && a.synopsis.toLowerCase().includes(q))
      );
      const uniqueMatches = Array.from(new Map(localMatches.map(m => [m.mal_id, m])).values());
      setData(uniqueMatches);
    } finally {
      setLoading(false);
    }
  }, []);

  // Multi-tier Random Engine across ALL aired anime series without repetition
  const fetchRandom = useCallback(async (): Promise<Anime | null> => {
    setLoading(true);
    setError(null);

    // Filter helper to pick an unseen anime from an array
    const pickUnseen = (pool: Anime[]): Anime | null => {
      const unseen = pool.filter(a => !shownRandomIds.has(a.mal_id));
      if (unseen.length > 0) {
        const picked = unseen[Math.floor(Math.random() * unseen.length)];
        shownRandomIds.add(picked.mal_id);
        return picked;
      }
      // If all seen, reset and pick any
      if (pool.length > 0) {
        const picked = pool[Math.floor(Math.random() * pool.length)];
        shownRandomIds.clear();
        shownRandomIds.add(picked.mal_id);
        return picked;
      }
      return null;
    };

    try {
      // Pick random page from top anime (pages 1 to 30 = 750 high-quality aired series)
      const randomPage = Math.floor(Math.random() * 25) + 1;
      const json = await jikanFetch(`${BASE_URL}/top/anime?page=${randomPage}&limit=25&_nocache=${Date.now()}`);
      if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
        const picked = pickUnseen(json.data as Anime[]);
        if (picked) return picked;
      }
    } catch (e) {
      console.warn('Page-based random fetch failed, trying random endpoint:', e);
    }

    try {
      // Secondary attempt: Jikan direct random endpoint with timestamp
      const json = await jikanFetch(`${BASE_URL}/random/anime?_ts=${Date.now()}`);
      if (json && json.data) {
        const anime = json.data as Anime;
        shownRandomIds.add(anime.mal_id);
        return anime;
      }
    } catch (e) {
      console.warn('Random endpoint failed, using extended catalog:', e);
    }

    // Tertiary guarantee: pick unseen from our extended catalog of 25+ iconic series
    const fallbackPicked = pickUnseen(EXTENDED_RANDOM_CATALOG);
    if (fallbackPicked) return fallbackPicked;

    return EXTENDED_RANDOM_CATALOG[0];
  }, []);

  // Filter by Criteria across random pages for maximum variety
  const fetchByCriteria = useCallback(async (genres: number[]): Promise<Anime[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const genreString = genres.join(',');
      // Randomize page (1 to 4) so user doesn't always see the exact same 10 anime
      const randomPage = Math.floor(Math.random() * 4) + 1;
      const json = await jikanFetch(`${BASE_URL}/anime?genres=${genreString}&page=${randomPage}&order_by=popularity&sort=asc&sfw=true&limit=15&_nocache=${Date.now()}`);
      if (json && json.data && json.data.length > 0) {
        return json.data as Anime[];
      }
      return EXTENDED_RANDOM_CATALOG.filter(a => 
        a.genres?.some(g => genres.includes(g.mal_id))
      );
    } catch (err: any) {
      console.warn('fetchByCriteria failed, using filtered catalog:', err);
      const matches = EXTENDED_RANDOM_CATALOG.filter(a => 
        a.genres?.some(g => genres.includes(g.mal_id))
      );
      return matches.length > 0 ? matches : FALLBACK_LISTS['top_popular'];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch list by specific path
  const fetchAnimeList = useCallback(async (path: string): Promise<Anime[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const normalizedPath = path.includes('/seasons/2026/fall') ? '/seasons/now?limit=10' : path;
      const json = await jikanFetch(`${BASE_URL}${normalizedPath}`);
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
    try {
      const json = await jikanFetch(`${BASE_URL}/anime/${id}`);
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
