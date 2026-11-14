// src/lib/ogMeta.ts
var OG_SITE_NAME = "AniSync";
var DEFAULT_OG_IMAGE = "https://anisync-tau.vercel.app/icons/icon-512.png";
var OG_LOCALES = {
  tr: "tr_TR",
  en: "en_US",
  ja: "ja_JP",
  fr: "fr_FR"
};
var OG_TYPES = [
  "website",
  "article",
  "book",
  "video.tv_show",
  "video.movie",
  "video.other"
];
var OG_FALLBACK_COPY = {
  tr: {
    title: "AniSync \u2014 Anime, manga ve oyun ke\u015Ffi",
    description: "Yeni bir \u015Fey izlemek i\xE7in do\u011Fru yer: g\xFCncel sezon, yay\u0131n takvimi, ki\u015Fisel listeler ve topluluk tek yerde."
  },
  en: {
    title: "AniSync \u2014 Anime, manga and game discovery",
    description: "The easiest place to find something new to watch: current season, airing calendar, personal lists and community."
  },
  ja: {
    title: "AniSync \u2014 \u30A2\u30CB\u30E1\u30FB\u30DE\u30F3\u30AC\u30FB\u30B2\u30FC\u30E0\u306E\u767A\u898B",
    description: "\u6B21\u306B\u898B\u308B\u4F5C\u54C1\u304C\u3059\u3050\u898B\u3064\u304B\u308B\u3002\u4ECA\u671F\u30A2\u30CB\u30E1\u3001\u653E\u9001\u30AB\u30EC\u30F3\u30C0\u30FC\u3001\u30DE\u30A4\u30EA\u30B9\u30C8\u3001\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u304C\u3072\u3068\u3064\u306B\u3002"
  },
  fr: {
    title: "AniSync \u2014 D\xE9couvrir animes, mangas et jeux",
    description: "Le meilleur point de d\xE9part pour trouver quoi regarder : saison en cours, calendrier, listes personnelles et communaut\xE9."
  }
};
function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function truncateText(input, max) {
  const normalized = String(input ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const chars = Array.from(normalized);
  if (chars.length <= max) return normalized;
  const hardCut = chars.slice(0, Math.max(1, max - 1)).join("");
  const lastSpace = hardCut.lastIndexOf(" ");
  const softCut = lastSpace > hardCut.length * 0.6 ? hardCut.slice(0, lastSpace) : hardCut;
  return `${softCut.replace(/[\s,.;:!?-]+$/, "")}\u2026`;
}
function pickLocaleFromHeader(header) {
  const raw = Array.isArray(header) ? header.join(",") : String(header ?? "");
  for (const part of raw.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (code === "tr" || code === "en" || code === "ja" || code === "fr") return code;
  }
  return "tr";
}
function safeImageUrl(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return DEFAULT_OG_IMAGE;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.toString() : DEFAULT_OG_IMAGE;
  } catch {
    return DEFAULT_OG_IMAGE;
  }
}
function buildOgHtml(input) {
  const locale = input.locale && OG_LOCALES[input.locale] ? input.locale : "tr";
  const title = truncateText(input.title, 110) || OG_FALLBACK_COPY[locale].title;
  const description = truncateText(input.description, 180) || OG_FALLBACK_COPY[locale].description;
  const canonical = input.canonicalUrl;
  const image = safeImageUrl(input.imageUrl);
  const type = OG_TYPES.includes(input.type) ? input.type : "website";
  const alternates = Object.keys(OG_LOCALES).filter((code) => code !== locale).map((code) => `    <meta property="og:locale:alternate" content="${OG_LOCALES[code]}" />`).join("\n");
  const robots = input.noindex === false ? "" : '    <meta name="robots" content="noindex, nofollow" />\n';
  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
${robots}    <meta name="theme-color" content="#e11d48" />

    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="${OG_SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:locale" content="${OG_LOCALES[locale]}" />
${alternates}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
    <p><a href="${escapeHtml(canonical)}">${escapeHtml(title)}</a></p>
  </body>
</html>
`;
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

// src/types/unified.ts
function pickTitle(title, language) {
  const code = (language || "tr").split("-")[0];
  const localized = title.localized?.[code];
  if (localized) return localized;
  if (code === "ja") {
    return title.native || title.romaji || title.english || "\u2014";
  }
  if (code === "tr" || code === "fr") {
    return title.english || title.romaji || title.native || "\u2014";
  }
  return title.english || title.romaji || title.native || "\u2014";
}
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
async function getAniListMedia(id, signal) {
  const cacheKey = `detail:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const payload = await graphql(
    `query ($id: Int) { Media(id: $id) { ...MediaCore } }`,
    { id },
    `detay (${id})`,
    signal
  );
  const node = payload.data?.Media;
  if (!node) return null;
  const media = mapAniListMedia(node);
  cache.set(cacheKey, media);
  return media;
}
async function getAniListMediaByMalId(malId, signal) {
  const cacheKey = `detail:mal:${malId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const payload = await graphql(
    `query ($idMal: Int, $type: MediaType) { Media(idMal: $idMal, type: $type) { ...MediaCore } }`,
    { idMal: malId, type: "ANIME" },
    `detay (MAL ${malId})`,
    signal
  );
  const node = payload.data?.Media;
  if (!node) return null;
  const media = mapAniListMedia(node);
  cache.set(cacheKey, media);
  return media;
}

// src/lib/api/jikan.ts
var BASE_URL = "https://api.jikan.moe/v4";
var limiter2 = createRateLimiter(450);
var cache2 = createTtlCache({ ttlMs: 15 * 60 * 1e3 });
function normalizeScore(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return null;
  return Math.round(score * 10);
}
function mapImages(images) {
  const large = images?.webp?.large_image_url || images?.jpg?.large_image_url || images?.webp?.image_url || images?.jpg?.image_url;
  const medium = images?.webp?.image_url || images?.jpg?.image_url || large;
  return {
    large: large ?? void 0,
    medium: medium ?? void 0,
    small: medium ?? void 0
  };
}
function mapJikanMedia(item, kind) {
  const title = {
    romaji: item.title ?? void 0,
    english: item.title_english ?? void 0,
    native: item.title_japanese ?? void 0
  };
  return {
    id: `jikan:${kind}:${item.mal_id}`,
    source: "jikan",
    sourceId: String(item.mal_id),
    kind,
    title,
    displayTitle: title.english || title.romaji || title.native || "\u2014",
    synopsis: item.synopsis ?? void 0,
    cover: mapImages(item.images),
    format: item.type ?? void 0,
    status: item.status ?? void 0,
    season: item.season ?? void 0,
    seasonYear: item.year ?? null,
    episodes: item.episodes ?? null,
    chapters: item.chapters ?? null,
    volumes: item.volumes ?? null,
    duration: null,
    averageScore: normalizeScore(item.score),
    popularity: item.members ?? item.popularity ?? null,
    genres: (item.genres ?? []).map((genre) => genre.name),
    tags: [],
    studios: (item.studios ?? []).map((studio) => ({ id: studio.mal_id, name: studio.name })),
    relations: [],
    externalLinks: item.url ? [{ site: "MyAnimeList", url: item.url, type: "info" }] : [],
    updatedAt: Date.now()
  };
}
async function getJikanMedia(kind, malId, signal) {
  const cacheKey = `detail:${kind}:${malId}`;
  const cached = cache2.get(cacheKey);
  if (cached) return cached;
  await limiter2();
  const payload = await fetchJson(`${BASE_URL}/${kind}/${malId}`, {}, { timeoutMs: 9e3, signal });
  const item = payload.data;
  if (!item) return null;
  const media = mapJikanMedia(item, kind);
  cache2.set(cacheKey, media);
  return media;
}

// src/lib/seoRoutes.ts
var SITE_BASE_URL = "https://anisync-tau.vercel.app";

// src/lib/ogRender.ts
var INTEGER_ID = /^[1-9]\d{0,8}$/;
function parseOgTarget(kind, rawId) {
  const id = String(rawId ?? "").trim();
  if (!id) return null;
  if (kind === "anime") {
    return INTEGER_ID.test(id) ? { lookup: "mal", malId: Number(id) } : null;
  }
  if (kind === "media") {
    const [source, ...rest] = id.split(":");
    if (source === "anilist" && rest.length === 1 && INTEGER_ID.test(rest[0])) {
      return { lookup: "anilist", anilistId: Number(rest[0]) };
    }
    if (source === "jikan" && rest.length === 2) {
      const [mediaKind, sourceId] = rest;
      if ((mediaKind === "anime" || mediaKind === "manga") && INTEGER_ID.test(sourceId)) {
        return { lookup: "jikan", mediaKind, malId: Number(sourceId) };
      }
    }
  }
  return null;
}
async function loadOgMedia(target) {
  const safe = async (load) => {
    try {
      return await load();
    } catch {
      return null;
    }
  };
  if (target.lookup === "anilist") {
    return safe(() => getAniListMedia(target.anilistId));
  }
  if (target.lookup === "jikan") {
    return safe(() => getJikanMedia(target.mediaKind, target.malId));
  }
  return await safe(() => getAniListMediaByMalId(target.malId)) ?? await safe(() => getJikanMedia("anime", target.malId));
}
function canonicalPathFor(target, kind, rawId) {
  if (target) {
    if (target.lookup === "mal") return `/anime/${target.malId}`;
    if (target.lookup === "anilist") return `/media/anilist:${target.anilistId}`;
    return `/media/jikan:${target.mediaKind}:${target.malId}`;
  }
  const id = String(rawId ?? "").trim();
  if (kind === "anime" && INTEGER_ID.test(id)) return `/anime/${id}`;
  if (kind === "media" && /^[a-z]+:[A-Za-z0-9:_-]{1,80}$/.test(id)) return `/media/${id}`;
  return "/";
}
var KIND_OG_TYPE = {
  anime: "video.tv_show",
  manga: "book",
  novel: "book",
  light_novel: "book",
  game: "video.other"
};
function ogInputForMedia(media, locale, canonicalUrl) {
  const localized = pickTitle(media.title, locale);
  const title = localized && localized !== "-" ? localized : media.displayTitle || OG_SITE_NAME;
  const synopsis = truncateText(stripHtml(media.synopsis), 180);
  return {
    title: `${title} - ${OG_SITE_NAME}`,
    description: synopsis || `${title} \xB7 ${OG_SITE_NAME}`,
    canonicalUrl,
    imageUrl: media.cover?.large ?? media.cover?.medium ?? media.banner ?? null,
    locale,
    type: KIND_OG_TYPE[media.kind] ?? "website"
  };
}
async function renderOgPage(kind, rawId, locale) {
  const target = parseOgTarget(kind, rawId);
  const canonicalUrl = `${SITE_BASE_URL}${canonicalPathFor(target, kind, rawId)}`;
  const media = target ? await loadOgMedia(target) : null;
  if (!media) {
    const copy = OG_FALLBACK_COPY[locale] ?? OG_FALLBACK_COPY.tr;
    return {
      html: buildOgHtml({
        title: copy.title,
        description: copy.description,
        canonicalUrl,
        locale,
        noindex: true
      }),
      found: false,
      canonicalUrl
    };
  }
  return {
    html: buildOgHtml(ogInputForMedia(media, locale, canonicalUrl)),
    found: true,
    canonicalUrl
  };
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

// server/api/og.ts
function readParams(req) {
  const query = req?.query ?? {};
  let kind = String(query.kind ?? "").toLowerCase();
  let id = String(query.id ?? "");
  if (!kind || !id) {
    const pathOnly = String(req?.url ?? "").split("?")[0];
    const parts = pathOnly.split("/").filter(Boolean);
    if (parts[0] === "api" && parts[1] === "og" && parts.length >= 4) {
      if (!kind) kind = decodeURIComponent(parts[2]).toLowerCase();
      if (!id) id = decodeURIComponent(parts.slice(3).join("/"));
    }
  }
  return { kind, id };
}
async function handler(req, res) {
  if (!await enforceRateLimit(req, res, RATE_LIMITS.og)) return;
  const { kind, id } = readParams(req);
  const locale = pickLocaleFromHeader(req?.headers?.["accept-language"]);
  let result;
  try {
    result = await renderOgPage(kind, id, locale);
  } catch {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return res.status(200).send(
      '<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>AniSync</title></head><body></body></html>'
    );
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Vary", "User-Agent, Accept-Language");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Og-Fallback", result.found ? "0" : "1");
  return res.status(200).send(result.html);
}
export {
  handler as default
};
