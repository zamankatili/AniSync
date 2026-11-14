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

// server/api/games/appid.ts
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
async function handler(req, res) {
  if (!await enforceRateLimit(req, res, RATE_LIMITS["games-appid"])) return;
  const appid = String(req?.query?.appid ?? req?.query?.id ?? "").replace(/\D/g, "");
  if (!appid) {
    return res.status(400).json({ error: "invalid_appid" });
  }
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&cc=US`,
      { headers: { "User-Agent": UA, Accept: "application/json" } }
    );
    if (!response.ok) {
      throw new Error(`Steam ${response.status}`);
    }
    const data = await response.json();
    const entry = data?.[appid];
    if (!entry?.success || !entry.data) {
      return res.status(404).json({ error: "not_found" });
    }
    const game = entry.data;
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");
    return res.status(200).json({
      appid,
      name: game.name,
      type: game.type,
      shortDescription: game.short_description ?? null,
      headerImage: game.header_image ?? null,
      capsuleImage: game.capsule_image ?? null,
      developers: game.developers ?? [],
      publishers: game.publishers ?? [],
      genres: (game.genres ?? []).map((genre) => genre.description),
      releaseDate: game.release_date?.date ?? null,
      metacritic: game.metacritic?.score ?? null,
      website: game.website ?? null,
      background: game.background_raw ?? game.background ?? null
    });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({
      error: "steam_unavailable",
      message: String(error?.message ?? error)
    });
  }
}
export {
  handler as default
};
