// src/lib/geminiEndpoints.ts
import { GoogleGenAI } from "@google/genai";

// src/lib/verifyIdToken.ts
import crypto from "crypto";
var CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
var DEFAULT_PROJECT_ID = "folkloric-centaur-q6tp2";
var certCache = null;
async function getCerts() {
  const now = Date.now();
  if (certCache && certCache.expires > now) return certCache.certs;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`Google certs fetch failed: ${res.status}`);
  const certs = await res.json();
  const maxAge = /max-age=(\d+)/.exec(res.headers.get("cache-control") ?? "");
  const ttlMs = maxAge ? Number(maxAge[1]) * 1e3 : 36e5;
  certCache = { certs, expires: now + ttlMs };
  return certs;
}
var b64urlJson = (segment) => JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
async function verifyFirebaseIdToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const header = b64urlJson(h);
    const payload = b64urlJson(p);
    if (header?.alg !== "RS256" || typeof header?.kid !== "string") return null;
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
    const nowSec = Math.floor(Date.now() / 1e3);
    if (typeof payload?.exp !== "number" || payload.exp <= nowSec) return null;
    if (typeof payload?.iat !== "number" || payload.iat > nowSec + 300) return null;
    if (payload?.aud !== projectId) return null;
    if (payload?.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof payload?.sub !== "string" || !payload.sub) return null;
    const certs = await getCerts();
    const cert = certs[header.kid];
    if (!cert) return null;
    const key = cert.includes("BEGIN CERTIFICATE") ? new crypto.X509Certificate(cert).publicKey : crypto.createPublicKey(cert);
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(`${h}.${p}`);
    if (!verifier.verify(key, s, "base64url")) return null;
    return { uid: payload.sub };
  } catch {
    return null;
  }
}

// src/lib/apiAuth.ts
async function requireApiAuth(headers) {
  const raw = headers && (headers["authorization"] ?? headers["Authorization"]);
  const auth = typeof raw === "string" ? raw : "";
  if (auth.startsWith("Bearer ")) {
    const verified = await verifyFirebaseIdToken(auth.slice(7));
    if (verified) return { ok: true, uid: verified.uid };
    return { ok: false, status: 401, error: "Invalid token" };
  }
  if (process.env.NODE_ENV === "production") {
    return { ok: false, status: 401, error: "Authorization required" };
  }
  return { ok: true };
}

// src/lib/api/http.ts
var HttpError = class extends Error {
  constructor(message, status, url, retryAfterMs) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
    this.retryAfterMs = retryAfterMs;
  }
};
var RETRYABLE_STATUS = /* @__PURE__ */ new Set([408, 425, 429, 500, 502, 503, 504]);
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var parseRetryAfter = (value) => {
  if (!value) return void 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1e3);
  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return void 0;
};
async function requestOnce(url, init, options) {
  const { timeoutMs = 9e3, signal } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort, { once: true });
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
      throw new HttpError(`HTTP ${response.status} \u2014 ${url}`, response.status, url, retryAfterMs);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}
async function fetchJson(url, init = {}, options = {}) {
  const { retries = 2, baseDelayMs = 400 } = options;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestOnce(url, init, options);
    } catch (error) {
      lastError = error;
      if (options.signal?.aborted) throw error;
      const isHttpError = error instanceof HttpError;
      const retryable = !isHttpError || RETRYABLE_STATUS.has(error.status);
      if (!retryable || attempt === retries) throw error;
      const retryAfter = isHttpError ? error.retryAfterMs : void 0;
      const backoff = retryAfter ?? baseDelayMs * 2 ** attempt;
      await sleep(Math.min(backoff, 8e3) + Math.random() * 150);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
function createRateLimiter(minIntervalMs) {
  let chain = Promise.resolve();
  let lastRun = 0;
  return () => {
    chain = chain.then(async () => {
      const wait = Math.max(0, lastRun + minIntervalMs - Date.now());
      if (wait > 0) await sleep(wait);
      lastRun = Date.now();
    });
    return chain;
  };
}

// src/lib/api/cache.ts
var DEFAULT_TTL_MS = 15 * 60 * 1e3;
function createTtlCache(options = {}) {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const memory = /* @__PURE__ */ new Map();
  const storageKey = options.persistKey ? `anisync.cache.${options.persistKey}` : null;
  const silent = options.silent ?? true;
  const readStorage = () => {
    if (!storageKey || typeof localStorage === "undefined") return {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };
  const writeStorage = (data) => {
    if (!storageKey || typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      if (!silent) throw error;
      try {
        const keys = Object.keys(data);
        const trimmed = Object.fromEntries(keys.slice(Math.floor(keys.length / 2)).map((k) => [k, data[k]]));
        localStorage.setItem(storageKey, JSON.stringify(trimmed));
      } catch {
      }
    }
  };
  const get = (key) => {
    const now = Date.now();
    const fromMemory = memory.get(key);
    if (fromMemory) {
      if (fromMemory.expiresAt > now) return fromMemory.value;
      memory.delete(key);
    }
    const stored = readStorage()[key];
    if (stored && stored.expiresAt > now) {
      memory.set(key, stored);
      return stored.value;
    }
    return null;
  };
  const set = (key, value) => {
    const entry = { value, expiresAt: Date.now() + ttlMs };
    memory.set(key, entry);
    if (storageKey) {
      const data = readStorage();
      data[key] = entry;
      writeStorage(data);
    }
  };
  const remove = (key) => {
    memory.delete(key);
    if (storageKey) {
      const data = readStorage();
      delete data[key];
      writeStorage(data);
    }
  };
  const clear = () => {
    memory.clear();
    if (storageKey && typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch {
      }
    }
  };
  const wrap = async (key, producer) => {
    const cached = get(key);
    if (cached !== null) return cached;
    const value = await producer();
    set(key, value);
    return value;
  };
  return { get, set, delete: remove, clear, wrap };
}
var inflight = /* @__PURE__ */ new Map();
function dedupe(key, producer) {
  const existing = inflight.get(key);
  if (existing) return existing;
  const promise = producer().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

// src/types/unified.ts
function stripHtml(input) {
  if (!input) return "";
  return input.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n").trim();
}

// src/lib/api/anilist.ts
var ANILIST_ENDPOINT = "https://graphql.anilist.co";
var limiter = createRateLimiter(700);
var cache = createTtlCache({ ttlMs: 15 * 60 * 1e3 });
var MEDIA_CORE = `
  fragment MediaCore on Media {
    id
    idMal
    type
    format
    isAdult
    title { romaji english native }
    description(asHtml: false)
    coverImage { extraLarge large medium color }
    bannerImage
    status
    season
    seasonYear
    startDate { year month day }
    episodes
    chapters
    volumes
    duration
    averageScore
    popularity
    genres
    studios(isMain: true) { nodes { id name } }
    relations {
      edges {
        relationType
        node {
          id
          type
          format
          title { romaji english native }
          coverImage { medium }
        }
      }
    }
    externalLinks { site url type }
    trailer { id site }
    updatedAt
  }
`;
function detectKind(node) {
  if (node.type === "ANIME") return "anime";
  return node.format === "NOVEL" ? "light_novel" : "manga";
}
function mapAniListMedia(node) {
  const title = {
    romaji: node.title?.romaji ?? void 0,
    english: node.title?.english ?? void 0,
    native: node.title?.native ?? void 0
  };
  const relations = (node.relations?.edges ?? []).map((edge) => ({
    id: `anilist:${edge.node.id}`,
    kind: detectKind({ ...edge.node, isAdult: false }),
    relationType: edge.relationType,
    title: {
      romaji: edge.node.title?.romaji ?? void 0,
      english: edge.node.title?.english ?? void 0,
      native: edge.node.title?.native ?? void 0
    },
    cover: edge.node.coverImage?.medium ?? void 0
  }));
  return {
    id: `anilist:${node.id}`,
    source: "anilist",
    sourceId: String(node.id),
    kind: detectKind(node),
    title,
    displayTitle: title.english || title.romaji || title.native || "\u2014",
    synopsis: stripHtml(node.description),
    cover: {
      small: node.coverImage?.medium ?? void 0,
      medium: node.coverImage?.large ?? void 0,
      large: node.coverImage?.extraLarge ?? node.coverImage?.large ?? void 0,
      color: node.coverImage?.color ?? void 0
    },
    banner: node.bannerImage ?? void 0,
    format: node.format ?? void 0,
    status: node.status ?? void 0,
    season: node.season ?? void 0,
    seasonYear: node.seasonYear ?? null,
    startDate: node.startDate ?? void 0,
    episodes: node.episodes ?? null,
    chapters: node.chapters ?? null,
    volumes: node.volumes ?? null,
    duration: node.duration ?? null,
    averageScore: node.averageScore ?? null,
    popularity: node.popularity ?? null,
    genres: (node.genres ?? []).filter(Boolean),
    tags: [],
    studios: (node.studios?.nodes ?? []).map((studio) => ({ id: studio.id, name: studio.name })),
    relations,
    externalLinks: (node.externalLinks ?? []).map((link) => ({
      site: link.site,
      url: link.url,
      type: link.type ?? void 0
    })),
    trailer: node.trailer?.id ? {
      id: node.trailer.id,
      site: node.trailer.site ?? void 0
    } : void 0,
    updatedAt: node.updatedAt ? node.updatedAt * 1e3 : Date.now(),
    externalIds: {
      anilist: node.id,
      mal: node.idMal ?? void 0
    }
  };
}
function assertNoErrors(payload, context) {
  if (payload?.errors?.length) {
    const message = payload.errors.map((e) => e.message).filter(Boolean).join("; ") || "Bilinmeyen AniList hatas\u0131";
    throw new Error(`AniList: ${context} \u2014 ${message}`);
  }
}
async function graphql(query, variables, context, signal) {
  await limiter();
  const payload = await fetchJson(
    ANILIST_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ query: `${MEDIA_CORE}
${query}`, variables })
    },
    { timeoutMs: 1e4, retries: 2, signal }
  );
  assertNoErrors(payload, context);
  return payload;
}
var KIND_TO_ANILIST_TYPE = {
  anime: "ANIME",
  manga: "MANGA",
  light_novel: "MANGA"
};
async function searchAniList(params) {
  const { query = "", kind, page = 1, perPage = 20, hideAdult = true, genreIn, signal } = params;
  const type = KIND_TO_ANILIST_TYPE[kind];
  if (!type) throw new Error(`AniList desteklenmeyen t\xFCr: ${kind}`);
  const trimmed = query.trim();
  const genres = Array.isArray(genreIn) ? Array.from(new Set(genreIn.map((g) => g.trim()).filter(Boolean))) : [];
  const cacheKey = `search:${kind}:${trimmed.toLowerCase()}:${page}:${perPage}:${hideAdult ? "sfw" : "all"}:${genres.join("|")}`;
  return dedupe(cacheKey, async () => {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const useSearch = trimmed.length > 0;
    const format = kind === "light_novel" ? "NOVEL" : void 0;
    const genreArg = genres.length > 0 ? ", $genres: [String]" : "";
    const genreInArg = genres.length > 0 ? ", genre_in: $genres" : "";
    const queryDoc = useSearch ? `
        query ($search: String, $type: MediaType, $page: Int, $perPage: Int, $isAdult: Boolean, $format: MediaFormat${genreArg}) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { total currentPage lastPage hasNextPage }
            media(search: $search, type: $type, isAdult: $isAdult, format: $format, sort: SEARCH_MATCH${genreInArg}) {
              ...MediaCore
            }
          }
        }
      ` : `
        query ($type: MediaType, $page: Int, $perPage: Int, $isAdult: Boolean, $format: MediaFormat${genreArg}) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { total currentPage lastPage hasNextPage }
            media(type: $type, isAdult: $isAdult, format: $format, sort: POPULARITY_DESC${genreInArg}) {
              ...MediaCore
            }
          }
        }
      `;
    const variables = useSearch ? { search: trimmed, type, page, perPage, isAdult: hideAdult ? false : void 0, format, genres: genres.length > 0 ? genres : void 0 } : { type, page, perPage, isAdult: hideAdult ? false : void 0, format, genres: genres.length > 0 ? genres : void 0 };
    const payload = await graphql(queryDoc, variables, `arama (${kind})`, signal);
    const media = payload.data?.Page?.media ?? [];
    const filtered = kind === "light_novel" ? media.filter((node) => node.format === "NOVEL") : kind === "manga" ? media.filter((node) => node.format !== "NOVEL") : media;
    const result = {
      items: filtered.map(mapAniListMedia),
      page: payload.data?.Page?.pageInfo?.currentPage ?? page,
      hasNextPage: Boolean(payload.data?.Page?.pageInfo?.hasNextPage),
      kind,
      source: "anilist"
    };
    cache.set(cacheKey, result);
    return result;
  });
}

// src/lib/geminiEndpoints.ts
var ai = null;
var aiInit = false;
function getGeminiClient() {
  if (!aiInit) {
    ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
    aiInit = true;
  }
  return ai;
}
async function handleAiRecommendations(body, headers) {
  const auth = await requireApiAuth(headers);
  if (!auth.ok) return { status: auth.status ?? 401, body: { error: auth.error ?? "Unauthorized" } };
  try {
    const { savedTitles, savedGenres, language } = body ?? {};
    const titlesList = Array.isArray(savedTitles) && savedTitles.length > 0 ? savedTitles.join(", ") : "Attack on Titan, Demon Slayer, Jujutsu Kaisen";
    const genresList = Array.isArray(savedGenres) && savedGenres.length > 0 ? savedGenres.join(", ") : "Aksiyon, Fantezi, Gizem";
    const lang = typeof language === "string" && language.trim() ? language.trim().slice(0, 5) : "tr";
    const client = getGeminiClient();
    if (!client) {
      return { status: 200, body: { recommendations: [], fallback: true } };
    }
    const prompt = `Kullan\u0131c\u0131n\u0131n kaydetti\u011Fi izleme listesi animeleri: [${titlesList}] ve sevdi\u011Fi t\xFCrler: [${genresList}].
Bu izleme profiline dayanarak kullan\u0131c\u0131 i\xE7in tam 4 adet ki\u015Fiselle\u015Ftirilmi\u015F anime tavsiyesi \xFCret.
\xC7\u0131kt\u0131y\u0131 SADECE a\u015Fa\u011F\u0131daki JSON dizisi format\u0131nda ver:
[
  {
    "title": "Anime Ba\u015Fl\u0131\u011F\u0131 (resmi ad)",
    "englishTitle": "English Title",
    "reason": "1-2 c\xFCmlelik \xF6zel gerek\xE7e (kullan\u0131c\u0131n\u0131n izleme listesindeki serilere neden benziyor)"
  }
]
Kural: yaln\u0131zca ger\xE7ekten var olan animeler \xF6ner. Puan, b\xF6l\xFCm say\u0131s\u0131, g\xF6rsel URL'si veya kimlik UYDURMA; bu alanlar do\u011Frulanm\u0131\u015F katalogdan eklenecek. "reason" dili: ${lang}. A\xE7\u0131klama veya markdown yazma, yaln\u0131zca ge\xE7erli JSON dizisi d\xF6nd\xFCr.`;
    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt
    });
    let rawText = response.text || "";
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { status: 200, body: { recommendations: [], fallback: true } };
    }
    const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const verified = await Promise.all(
      parsed.slice(0, 4).map(async (rec) => {
        const requested = typeof rec?.title === "string" ? rec.title.trim() : "";
        const requestedEn = typeof rec?.englishTitle === "string" ? rec.englishTitle.trim() : "";
        const query = requested || requestedEn;
        if (!query) return null;
        try {
          const result = await searchAniList({ query, kind: "anime", perPage: 3 });
          const match = result.items.find((media) => {
            const candidates = [media.title.romaji, media.title.english, media.title.native, media.displayTitle].filter((v) => typeof v === "string" && v.length > 0).map(normalize);
            const target = normalize(query);
            return candidates.some((candidate) => candidate === target || candidate.includes(target) || target.includes(candidate));
          });
          if (!match) return null;
          if (!match.title?.romaji && !match.title?.english) return null;
          return {
            // LLM'in uydurduğu kimlik/puan/görsel yerine doğrulanmış katalog verisi.
            id: match.externalIds?.mal ?? 0,
            mediaId: match.id,
            title: match.title.romaji || match.displayTitle,
            englishTitle: match.title.english ?? void 0,
            genres: match.genres.slice(0, 4),
            score: match.averageScore != null ? Math.round(match.averageScore) / 10 : null,
            episodes: match.episodes ?? null,
            reason: typeof rec?.reason === "string" ? rec.reason.trim() : "",
            imageUrl: match.cover?.large ?? match.cover?.medium ?? void 0,
            synopsis: match.synopsis ? match.synopsis.slice(0, 240) : ""
          };
        } catch (error) {
          console.warn("[ai-recommendations] do\u011Frulama ba\u015Far\u0131s\u0131z:", error);
          return null;
        }
      })
    );
    const recommendations = verified.filter((item) => item !== null);
    if (recommendations.length === 0) {
      return { status: 200, body: { recommendations: [], fallback: true } };
    }
    return { status: 200, body: { recommendations, aiGenerated: true } };
  } catch (_err) {
    return { status: 200, body: { recommendations: [], fallback: true } };
  }
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

// server/api/ai-recommendations.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!await enforceRateLimit(req, res, RATE_LIMITS["ai-recommendations"])) return;
  const r = await handleAiRecommendations(req.body, req.headers ?? {});
  res.setHeader("Cache-Control", "no-store");
  res.status(r.status).json(r.body);
}
export {
  handler as default
};
