import { apiUrl } from './apiBase';
import { getAnimeSeason } from './season';

export interface AnimeNewsItem {
  id: string | number;
  title: string;
  summary: string;
  source: string;
  category: 'DUYURU' | 'FRAGMAN' | 'FİLM' | 'MANGA' | 'SEZON';
  /** ISO-8601 yayın tarihi; UI bunu `Intl.RelativeTimeFormat` ile biçimler. */
  date: string;
  publishedAt?: string;
  imageUrl: string;
  linkUrl?: string;
  isHot?: boolean;
}

export interface NewsFetchResult {
  news: AnimeNewsItem[];
  source: string;
  isGrounded: boolean;
  /** Canlı kaynak değilse true (önbellek/çevrimdışı). */
  stale: boolean;
  fetchedAt: string;
}

const NEWS_CACHE_KEY = 'anisync_live_news_v3';
const NEWS_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 saat
const LOCAL_IMAGE = '/icons/icon-192.png';

function classifyNewsCategory(rawTitle: string): AnimeNewsItem['category'] {
  const t = rawTitle.toLowerCase();
  if (/(fragman|trailer|teaser)/i.test(t)) return 'FRAGMAN';
  if (/(film|movie|sinema)/i.test(t)) return 'FİLM';
  if (/(manga|manhwa|cilt)/i.test(t)) return 'MANGA';
  if (/(sezon|season|episode|bölüm|premiere|yayına girdi|airing)/i.test(t)) return 'SEZON';
  return 'DUYURU';
}

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

/** Önce entity'leri çöz, sonra etiketleri temizle. */
function stripHtml(input: string): string {
  return decodeEntities(input).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isFreshEnough(iso: string | undefined, maxAgeDays = 30): boolean {
  if (!iso) return false;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= maxAgeDays * 24 * 60 * 60 * 1000;
}

/** rss2json.com — CORS açık ücretsiz RSS→JSON köprüsü (anahtar gerektirmez). */
async function fetchRssViaProxy(feedUrl: string, timeoutMs = 5000): Promise<any[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.cgi?rss_url=${encodeURIComponent(feedUrl)}&count=12`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.items) ? json.items : [];
  } catch (_err) {
    clearTimeout(timeout);
    return [];
  }
}

function mapRssItem(item: any, feedSource: string, idx: number): AnimeNewsItem | null {
  const title = stripHtml(String(item?.title || '')).trim();
  if (!title) return null;
  const published = item?.pubDate ? new Date(item.pubDate) : null;
  const publishedIso = published && !Number.isNaN(published.getTime()) ? published.toISOString() : new Date().toISOString();
  const summary = stripHtml(String(item?.description || item?.content || '')).slice(0, 240) || title;
  return {
    id: `rss_${feedSource.replace(/\W+/g, '_')}_${idx}_${publishedIso}`,
    title,
    summary: summary.endsWith('.') || summary.length < 30 ? summary : `${summary}…`,
    source: feedSource,
    category: classifyNewsCategory(title),
    date: publishedIso,
    publishedAt: publishedIso,
    imageUrl: item?.thumbnail || item?.enclosure?.link || LOCAL_IMAGE,
    linkUrl: item?.link || undefined,
    isHot: false,
  };
}

export async function fetchLiveNews(forceRefresh = false): Promise<NewsFetchResult> {
  const fetchedAt = new Date().toISOString();

  // 1. Kısa ömürlü istemci önbelleği
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(NEWS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < NEWS_CACHE_TTL && Array.isArray(parsed.news) && parsed.news.length > 0) {
          return {
            news: parsed.news,
            source: 'Yerel Önbellek',
            isGrounded: true,
            stale: false,
            fetchedAt: new Date(parsed.timestamp).toISOString(),
          };
        }
      }
    } catch (_e) {
      // önbellek yoksay
    }
  }

  let staleCandidate: NewsFetchResult | null = null;
  try {
    const cached = localStorage.getItem(NEWS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed.news) && parsed.news.length > 0) {
        staleCandidate = {
          news: parsed.news,
          source: 'Yerel Önbellek (bayat)',
          isGrounded: false,
          stale: true,
          fetchedAt: new Date(parsed.timestamp).toISOString(),
        };
      }
    }
  } catch (_e) {
    // yoksay
  }

  // 2. Backend hattı (RSS ingestion; GEMINI varsa zenginleştirir) — dev/tam-stack
  try {
    const url = apiUrl(forceRefresh ? '/api/anime-news?refresh=true' : '/api/anime-news');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.news) && data.news.length > 0) {
        const news: AnimeNewsItem[] = data.news.map((item: any, idx: number) => ({
          id: item.id ?? `api_${idx}`,
          title: stripHtml(String(item.title ?? '')),
          summary: stripHtml(String(item.summary ?? '')),
          source: item.source ?? 'AniSync',
          category: ['DUYURU', 'FRAGMAN', 'FİLM', 'MANGA', 'SEZON'].includes(item.category) ? item.category : 'DUYURU',
          date: item.publishedAt || item.date || fetchedAt,
          publishedAt: item.publishedAt || item.date || fetchedAt,
          imageUrl: item.imageUrl || LOCAL_IMAGE,
          linkUrl: item.linkUrl,
          isHot: Boolean(item.isHot),
        })).filter((n: AnimeNewsItem) => n.title);

        if (news.length > 0) {
          const serverStale = Boolean(data?.stale) || !isGroundedOrFresh(data);
          try {
            localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ news, timestamp: Date.now() }));
          } catch (_e) { /* yoksay */ }
          return {
            news,
            source: data?.source || 'AniSync Haber Motoru',
            isGrounded: !serverStale,
            stale: serverStale,
            fetchedAt: data?.fetchedAt || fetchedAt,
          };
        }
      }
    }
  } catch (_apiErr) {
    // Vercel/serverless: endpoint yok → doğrudan RSS dene
  }

  // 3. Doğrudan canlı RSS (client-side) — ANN + Google News (TR, son 7 gün)
  const [annItems, googleItems] = await Promise.all([
    fetchRssViaProxy('https://www.animenewsnetwork.com/all/rss.xml', 5000),
    fetchRssViaProxy('https://news.google.com/rss/search?q=anime&hl=tr&gl=TR&ceid=TR:tr&when=7d', 5000),
  ]);

  const mapped = [
    ...googleItems.map((item, idx) => mapRssItem(item, 'Google News', idx)),
    ...annItems.map((item, idx) => mapRssItem(item, 'Anime News Network', idx)),
  ].filter((item): item is AnimeNewsItem => item !== null)
   .filter(item => isFreshEnough(item.publishedAt, 30));

  if (mapped.length > 0) {
    const seen = new Set<string>();
    const deduped = mapped.filter(item => {
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
      .slice(0, 12)
      .map((item, idx) => ({ ...item, isHot: idx < 3 }));

    try {
      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ news: deduped, timestamp: Date.now() }));
    } catch (_e) { /* yoksay */ }

    return { news: deduped, source: 'Canlı RSS (Google News / ANN)', isGrounded: true, stale: false, fetchedAt };
  }

  // 4. Son çare: yayındaki sezon animeleri — HABER DEĞİL, “sezon takvimi” olarak dürüstçe etiketlenir
  try {
    const season = getAnimeSeason();
    const jikanController = new AbortController();
    const jikanTimeout = setTimeout(() => jikanController.abort(), 5000);
    const jikanRes = await fetch('https://api.jikan.moe/v4/seasons/now?limit=8', { signal: jikanController.signal });
    clearTimeout(jikanTimeout);
    if (jikanRes.ok) {
      const json = await jikanRes.json();
      if (Array.isArray(json?.data) && json.data.length > 0) {
        const news: AnimeNewsItem[] = json.data.map((anime: any, idx: number) => {
          const title = anime.title_english || anime.title;
          const malId = anime.mal_id;
          return {
            id: `season_${malId || idx}`,
            title: `${title} — ${season.labelTR} sezonunda yayında`,
            summary: anime.synopsis
              ? `${stripHtml(anime.synopsis).slice(0, 180)}…`
              : `${title} serisinin bu sezonki bölümleri yayınlanıyor.`,
            source: 'MyAnimeList (Jikan) — Sezon Takvimi',
            category: 'SEZON' as const,
            date: fetchedAt,
            publishedAt: fetchedAt,
            imageUrl: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || LOCAL_IMAGE,
            linkUrl: anime.url || (malId ? `https://myanimelist.net/anime/${malId}` : undefined),
            isHot: idx < 2,
          };
        });
        try {
          localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ news, timestamp: Date.now() }));
        } catch (_e) { /* yoksay */ }
        return { news, source: 'Jikan — Canlı Sezon Takvimi (haber akışı değil)', isGrounded: true, stale: false, fetchedAt };
      }
    }
  } catch (_jikanErr) {
    // çevrimdışı
  }

  // 5. Hiçbir kaynak yok → bayat önbellek ya da boş durum (uydurma içerik YOK)
  if (staleCandidate) return staleCandidate;
  return { news: [], source: 'Haber akışı alınamadı', isGrounded: false, stale: true, fetchedAt };
}

function isGroundedOrFresh(data: any): boolean {
  if (data?.isGrounded === true) return true;
  const fetched = data?.fetchedAt ? new Date(data.fetchedAt).getTime() : 0;
  return fetched > 0 && Date.now() - fetched < NEWS_CACHE_TTL;
}
