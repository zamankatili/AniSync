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

// src/lib/rateLimit.ts
var RATE_LIMITS = {
  "anime-news": { name: "anime-news", limit: 60, windowMs: 6e4 },
  "games-search": { name: "games-search", limit: 30, windowMs: 6e4 },
  "games-appid": { name: "games-appid", limit: 40, windowMs: 6e4 },
  og: { name: "og", limit: 240, windowMs: 6e4 },
  translate: { name: "translate", limit: 20, windowMs: 6e4 },
  "moderate-room": { name: "moderate-room", limit: 20, windowMs: 6e4 },
  "ai-recommendations": { name: "ai-recommendations", limit: 10, windowMs: 6e4 },
  "refresh-news": { name: "refresh-news", limit: 6, windowMs: 6e4 }
};
function hashClientKey(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
var firstHeader = (value) => {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value ?? "");
};
function clientKeyFromHeaders(headers) {
  const bag = headers ?? {};
  const forwarded = firstHeader(bag["x-forwarded-for"]);
  const candidate = forwarded.split(",")[0]?.trim() || firstHeader(bag["x-real-ip"]).trim() || firstHeader(bag["cf-connecting-ip"]).trim() || "unknown";
  return hashClientKey(candidate);
}
function evaluateRateLimit(result, rule, nowMs = Date.now()) {
  const allowed = result.count <= rule.limit;
  const remaining = Math.max(0, rule.limit - result.count);
  const ttlMs = Math.max(0, result.ttlMs);
  return {
    allowed,
    limit: rule.limit,
    remaining,
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil(ttlMs / 1e3)),
    resetAtMs: nowMs + ttlMs
  };
}
function createMemoryStore(now = Date.now) {
  const buckets = /* @__PURE__ */ new Map();
  const MAX_BUCKETS = 5e3;
  const prune = (current) => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= current) buckets.delete(key);
    }
    if (buckets.size <= MAX_BUCKETS) return;
    const sorted = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (const [key] of sorted.slice(0, buckets.size - MAX_BUCKETS)) buckets.delete(key);
  };
  return {
    async consume(key, windowMs) {
      const current = now();
      if (buckets.size > MAX_BUCKETS) prune(current);
      const existing = buckets.get(key);
      if (!existing || existing.resetAt <= current) {
        const resetAt = current + windowMs;
        buckets.set(key, { count: 1, resetAt });
        return { count: 1, ttlMs: windowMs };
      }
      existing.count += 1;
      return { count: existing.count, ttlMs: existing.resetAt - current };
    }
  };
}
var REDIS_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {count, ttl}
`.trim();
function createRedisStore(url, token) {
  const endpoint = url.replace(/\/+$/, "");
  return {
    async consume(key, windowMs) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["EVAL", REDIS_SCRIPT, "1", key, String(windowMs)]),
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`redis ${response.status}`);
      }
      const payload = await response.json();
      const [count, ttlMs] = payload.result ?? [0, 0];
      return { count: Number(count) || 0, ttlMs: Number(ttlMs) || 0 };
    }
  };
}
var cachedStore = null;
function getRateLimitStore() {
  if (cachedStore) return cachedStore;
  const url = String(process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();
  cachedStore = url && token ? createRedisStore(url, token) : createMemoryStore();
  return cachedStore;
}
async function enforceRateLimit(req, res, rule) {
  if (process.env.RATE_LIMIT_DISABLED === "1") return true;
  const key = `anisync:rl:${rule.name}:${clientKeyFromHeaders(req?.headers)}`;
  let storeResult;
  try {
    storeResult = await getRateLimitStore().consume(key, rule.windowMs);
  } catch (error) {
    console.warn("[rate-limit] store hatas\u0131, istek ge\xE7irildi:", error);
    return true;
  }
  const decision = evaluateRateLimit(storeResult, rule);
  res.setHeader("X-RateLimit-Limit", String(decision.limit));
  res.setHeader("X-RateLimit-Remaining", String(decision.remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(decision.resetAtMs / 1e3)));
  if (decision.allowed) return true;
  res.setHeader("Retry-After", String(decision.retryAfterSeconds));
  res.setHeader("Cache-Control", "no-store");
  res.status(429).json({
    error: "rate_limited",
    retryAfterSeconds: decision.retryAfterSeconds
  });
  return false;
}

// server/api/anime-news.ts
async function handler(req, res) {
  if (!await enforceRateLimit(req, res, RATE_LIMITS["anime-news"])) return;
  const forceRefresh = String(req?.query?.refresh ?? "") === "true";
  try {
    const result = await ingestAnimeNews(forceRefresh);
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=900, stale-while-revalidate=1800"
    );
    res.status(200).json({
      news: result.items,
      source: result.stale ? "\xD6nbellek (bayat)" : "Canl\u0131 RSS (ANN / Google News)",
      isGrounded: !result.stale,
      stale: result.stale,
      cached: result.cached,
      fetchedAt: result.fetchedAt
    });
  } catch (err) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({
      news: [],
      source: "Haber ak\u0131\u015F\u0131 al\u0131namad\u0131",
      isGrounded: false,
      stale: true,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      error: String(err?.message ?? err)
    });
  }
}
export {
  handler as default
};
