/**
 * Canlı anime haber hattı (sunucu & Vercel serverless ortak kaynağı).
 * `server.ts` (local/Express) ve `api/refresh-news.ts` (Vercel cron) bunu kullanır.
 */
export interface ServerNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: 'DUYURU' | 'FRAGMAN' | 'FİLM' | 'MANGA' | 'SEZON';
  date: string;
  publishedAt: string;
  imageUrl: string;
  linkUrl?: string;
  isHot?: boolean;
}

export interface IngestResult {
  items: ServerNewsItem[];
  fetchedAt: string;
  stale: boolean;
  cached: boolean;
}

let animeNewsCache: { items: ServerNewsItem[]; fetchedAt: string; timestamp: number } | null = null;
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 dk
const LOCAL_NEWS_IMAGE = '/icons/icon-192.png';

const decodeEntities = (s: string) =>
  String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

// Önce entity'leri çöz (&lt;cite&gt; → <cite>), sonra etiketleri temizle.
const stripHtmlServer = (s: string) =>
  decodeEntities(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const extractTag = (block: string, tag: string): string => {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1].trim() : '';
};

const extractLink = (block: string): string => {
  const atom = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?\s*>/i);
  if (atom) return atom[1];
  return extractTag(block, 'link');
};

function classifyNewsCategory(rawTitle: string): ServerNewsItem['category'] {
  const t = rawTitle.toLowerCase();
  if (/(fragman|trailer|teaser)/i.test(t)) return 'FRAGMAN';
  if (/(film|movie|sinema)/i.test(t)) return 'FİLM';
  if (/(manga|manhwa|cilt)/i.test(t)) return 'MANGA';
  if (/(sezon|season|episode|bölüm|premiere|airing)/i.test(t)) return 'SEZON';
  return 'DUYURU';
}

async function fetchRssItems(feedUrl: string, sourceName: string, timeoutMs = 5000): Promise<ServerNewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AniSync/1.0 (anime news aggregator)' },
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/g) || [];
    return blocks.slice(0, 12).map((block, idx) => {
      const title = stripHtmlServer(extractTag(block, 'title'));
      if (!title) return null as unknown as ServerNewsItem;
      const link = extractLink(block);
      const pub = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated') || extractTag(block, 'dc:date');
      const dateIso = pub && !Number.isNaN(Date.parse(pub)) ? new Date(pub).toISOString() : new Date().toISOString();
      const desc = stripHtmlServer(extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content'));
      const item: ServerNewsItem = {
        id: `rss_${sourceName.replace(/\W+/g, '_')}_${idx}_${Date.parse(dateIso) || idx}`,
        title,
        summary: (desc || title).slice(0, 240),
        source: sourceName,
        category: classifyNewsCategory(title),
        date: dateIso,
        publishedAt: dateIso,
        imageUrl: LOCAL_NEWS_IMAGE,
        linkUrl: link || undefined,
      };
      return item;
    }).filter(Boolean);
  } catch (_err) {
    clearTimeout(timeout);
    return [];
  }
}

export async function ingestAnimeNews(forceRefresh = false): Promise<IngestResult> {
  const now = Date.now();
  if (!forceRefresh && animeNewsCache && (now - animeNewsCache.timestamp < NEWS_CACHE_TTL)) {
    return { items: animeNewsCache.items, fetchedAt: animeNewsCache.fetchedAt, stale: false, cached: true };
  }

  const feeds: Array<[string, string]> = [
    ['https://www.animenewsnetwork.com/all/rss.xml', 'Anime News Network'],
    ['https://news.google.com/rss/search?q=anime&hl=tr&gl=TR&ceid=TR:tr&when=7d', 'Google News'],
  ];
  const results = await Promise.all(feeds.map(([url, name]) => fetchRssItems(url, name).catch(() => [] as ServerNewsItem[])));

  const seen = new Set<string>();
  const merged = results.flat()
    .filter((item) => {
      const published = new Date(item.publishedAt).getTime();
      if (Number.isNaN(published)) return false;
      return Date.now() - published <= 30 * 24 * 60 * 60 * 1000; // 30 günden eski haberler gösterilmez
    })
    .filter((item) => {
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 12)
    .map((item, idx) => ({ ...item, isHot: idx < 3 }));

  const fetchedAt = new Date().toISOString();
  if (merged.length > 0) {
    animeNewsCache = { items: merged, fetchedAt, timestamp: Date.now() };
    return { items: merged, fetchedAt, stale: false, cached: false };
  }
  if (animeNewsCache) {
    return { items: animeNewsCache.items, fetchedAt: animeNewsCache.fetchedAt, stale: true, cached: true };
  }
  return { items: [] as ServerNewsItem[], fetchedAt, stale: true, cached: false };
}
