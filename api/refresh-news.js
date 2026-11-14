// src/lib/rssIngest.ts
var animeNewsCache = null;
var NEWS_CACHE_TTL = 15 * 60 * 1e3;
var LOCAL_NEWS_IMAGE = "/icons/icon-192.png";
var decodeEntities = (s) => String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10))).replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
var stripHtmlServer = (s) => decodeEntities(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
var extractTag = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
};
var extractLink = (block) => {
  const atom = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?\s*>/i);
  if (atom) return atom[1];
  return extractTag(block, "link");
};
function classifyNewsCategory(rawTitle) {
  const t = rawTitle.toLowerCase();
  if (/(fragman|trailer|teaser)/i.test(t)) return "FRAGMAN";
  if (/(film|movie|sinema)/i.test(t)) return "F\u0130LM";
  if (/(manga|manhwa|cilt)/i.test(t)) return "MANGA";
  if (/(sezon|season|episode|bölüm|premiere|airing)/i.test(t)) return "SEZON";
  return "DUYURU";
}
async function fetchRssItems(feedUrl, sourceName, timeoutMs = 5e3) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "AniSync/1.0 (anime news aggregator)" }
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/g) || [];
    return blocks.slice(0, 12).map((block, idx) => {
      const title = stripHtmlServer(extractTag(block, "title"));
      if (!title) return null;
      const link = extractLink(block);
      const pub = extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated") || extractTag(block, "dc:date");
      const dateIso = pub && !Number.isNaN(Date.parse(pub)) ? new Date(pub).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const desc = stripHtmlServer(extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content"));
      const item = {
        id: `rss_${sourceName.replace(/\W+/g, "_")}_${idx}_${Date.parse(dateIso) || idx}`,
        title,
        summary: (desc || title).slice(0, 240),
        source: sourceName,
        category: classifyNewsCategory(title),
        date: dateIso,
        publishedAt: dateIso,
        imageUrl: LOCAL_NEWS_IMAGE,
        linkUrl: link || void 0
      };
      return item;
    }).filter(Boolean);
  } catch (_err) {
    clearTimeout(timeout);
    return [];
  }
}
async function ingestAnimeNews(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && animeNewsCache && now - animeNewsCache.timestamp < NEWS_CACHE_TTL) {
    return { items: animeNewsCache.items, fetchedAt: animeNewsCache.fetchedAt, stale: false, cached: true };
  }
  const feeds = [
    ["https://www.animenewsnetwork.com/all/rss.xml", "Anime News Network"],
    ["https://news.google.com/rss/search?q=anime&hl=tr&gl=TR&ceid=TR:tr&when=7d", "Google News"]
  ];
  const results = await Promise.all(feeds.map(([url, name]) => fetchRssItems(url, name).catch(() => [])));
  const seen = /* @__PURE__ */ new Set();
  const merged = results.flat().filter((item) => {
    const published = new Date(item.publishedAt).getTime();
    if (Number.isNaN(published)) return false;
    return Date.now() - published <= 30 * 24 * 60 * 60 * 1e3;
  }).filter((item) => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 12).map((item, idx) => ({ ...item, isHot: idx < 3 }));
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (merged.length > 0) {
    animeNewsCache = { items: merged, fetchedAt, timestamp: Date.now() };
    return { items: merged, fetchedAt, stale: false, cached: false };
  }
  if (animeNewsCache) {
    return { items: animeNewsCache.items, fetchedAt: animeNewsCache.fetchedAt, stale: true, cached: true };
  }
  return { items: [], fetchedAt, stale: true, cached: false };
}

// server/api/refresh-news.ts
async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = String(req?.headers?.authorization ?? "");
    if (auth !== `Bearer ${cronSecret}`) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  try {
    const result = await ingestAnimeNews(true);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      news: result.items,
      source: result.stale ? "\xD6nbellek (bayat)" : "Canl\u0131 RSS (ANN / Google News)",
      isGrounded: !result.stale,
      stale: result.stale,
      fetchedAt: result.fetchedAt,
      refreshedAt: result.fetchedAt
    });
  } catch (err) {
    res.status(500).json({ news: [], error: String(err?.message ?? err) });
  }
}
export {
  handler as default
};
