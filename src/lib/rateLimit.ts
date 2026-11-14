/**
 * Sunucu tarafı hız sınırlama — Vercel fonksiyonları için.
 *
 * İki mod:
 *  1. **Upstash Redis** (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
 *     tanımlıysa: örnekler arası gerçek sayaç (atomik `EVAL`, INCR + PEXPIRE).
 *  2. Aksi halde: **bellek içi** sayaç. Bu, her fonksiyon örneği için ayrıdır
 *     ve ölçeklenmiş trafikte yaklaşık bir koruma sağlar. Dürüst sınır: dağıtık
 *     değildir, soğuk başlangıçta sıfırlanır.
 *
 * Hata durumunda **fail-open**: Redis erişilemezse istek engellenmez, yalnızca
 * uyarı loglanır. Ürünün çalışması hız sınırına feda edilmez.
 *
 * IP adresi asla düz metin saklanmaz; FNV-1a ile kısa bir anahtara çevrilir.
 */

export interface RateLimitRule {
  /** Ölçüm/limit adı (header ve loglarda görünür). */
  name: string;
  /** Pencere içinde izin verilen istek sayısı. */
  limit: number;
  /** Pencere süresi (ms). */
  windowMs: number;
}

export interface RateLimitStoreResult {
  count: number;
  ttlMs: number;
}

export interface RateLimitStore {
  consume(key: string, windowMs: number): Promise<RateLimitStoreResult>;
}

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAtMs: number;
}

/** Fonksiyon başına makul varsayılanlar. */
export const RATE_LIMITS = {
  'anime-news': { name: 'anime-news', limit: 60, windowMs: 60_000 },
  'games-search': { name: 'games-search', limit: 30, windowMs: 60_000 },
  'games-appid': { name: 'games-appid', limit: 40, windowMs: 60_000 },
  og: { name: 'og', limit: 240, windowMs: 60_000 },
  translate: { name: 'translate', limit: 20, windowMs: 60_000 },
  'moderate-room': { name: 'moderate-room', limit: 20, windowMs: 60_000 },
  'ai-recommendations': { name: 'ai-recommendations', limit: 10, windowMs: 60_000 },
  'refresh-news': { name: 'refresh-news', limit: 6, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitRule>;

/** FNV-1a 32-bit — IP'yi geri döndürülemez kısa anahtara çevirir. */
export function hashClientKey(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

type HeaderBag = Record<string, string | string[] | undefined>;

const firstHeader = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return String(value ?? '');
};

/**
 * İstemci anahtarını başlıklardan çıkarır. Vercel `x-forwarded-for`'u doldurur;
 * yoksa `x-real-ip`, o da yoksa sabit `unknown` kovası kullanılır.
 */
export function clientKeyFromHeaders(headers: HeaderBag | undefined): string {
  const bag = headers ?? {};
  const forwarded = firstHeader(bag['x-forwarded-for']);
  const candidate =
    forwarded.split(',')[0]?.trim() ||
    firstHeader(bag['x-real-ip']).trim() ||
    firstHeader(bag['cf-connecting-ip']).trim() ||
    'unknown';
  return hashClientKey(candidate);
}

/** Saf karar fonksiyonu — testte enjekte edilebilir saatle doğrulanır. */
export function evaluateRateLimit(
  result: RateLimitStoreResult,
  rule: RateLimitRule,
  nowMs = Date.now(),
): RateLimitDecision {
  const allowed = result.count <= rule.limit;
  const remaining = Math.max(0, rule.limit - result.count);
  const ttlMs = Math.max(0, result.ttlMs);
  return {
    allowed,
    limit: rule.limit,
    remaining,
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil(ttlMs / 1000)),
    resetAtMs: nowMs + ttlMs,
  };
}

/** Bellek içi sayaç — tek örnek için yeterli, dağıtık değil. */
export function createMemoryStore(now: () => number = Date.now): RateLimitStore {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  const MAX_BUCKETS = 5_000;

  const prune = (current: number) => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= current) buckets.delete(key);
    }
    if (buckets.size <= MAX_BUCKETS) return;
    // Hâlâ doluysa en eski süreli kovaları at (bellek sızıntısını önler).
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
    },
  };
}

const REDIS_SCRIPT = `
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

function createRedisStore(url: string, token: string): RateLimitStore {
  const endpoint = url.replace(/\/+$/, '');
  return {
    async consume(key, windowMs) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['EVAL', REDIS_SCRIPT, '1', key, String(windowMs)]),
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`redis ${response.status}`);
      }
      const payload = (await response.json()) as { result?: [number, number] };
      const [count, ttlMs] = payload.result ?? [0, 0];
      return { count: Number(count) || 0, ttlMs: Number(ttlMs) || 0 };
    },
  };
}

let cachedStore: RateLimitStore | null = null;

export function getRateLimitStore(): RateLimitStore {
  if (cachedStore) return cachedStore;
  const url = String(process.env.UPSTASH_REDIS_REST_URL ?? '').trim();
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN ?? '').trim();
  cachedStore = url && token ? createRedisStore(url, token) : createMemoryStore();
  return cachedStore;
}

interface MinimalResponse {
  setHeader(name: string, value: string | number): unknown;
  status(code: number): { json(body: unknown): unknown };
}

interface MinimalRequest {
  headers?: HeaderBag;
}

/**
 * Kuralı uygular. `true` dönerse istek işlenebilir; `false` dönerse yanıt
 * 429 olarak yazılmıştır ve handler erken çıkmalıdır.
 */
export async function enforceRateLimit(
  req: MinimalRequest,
  res: MinimalResponse,
  rule: RateLimitRule,
): Promise<boolean> {
  if (process.env.RATE_LIMIT_DISABLED === '1') return true;

  const key = `anisync:rl:${rule.name}:${clientKeyFromHeaders(req?.headers)}`;
  let storeResult: RateLimitStoreResult;
  try {
    storeResult = await getRateLimitStore().consume(key, rule.windowMs);
  } catch (error) {
    // Fail-open: hız sınırı altyapısı çökse bile ürün çalışsın.
    console.warn('[rate-limit] store hatası, istek geçirildi:', error);
    return true;
  }

  const decision = evaluateRateLimit(storeResult, rule);
  res.setHeader('X-RateLimit-Limit', String(decision.limit));
  res.setHeader('X-RateLimit-Remaining', String(decision.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(decision.resetAtMs / 1000)));

  if (decision.allowed) return true;

  res.setHeader('Retry-After', String(decision.retryAfterSeconds));
  res.setHeader('Cache-Control', 'no-store');
  res.status(429).json({
    error: 'rate_limited',
    retryAfterSeconds: decision.retryAfterSeconds,
  });
  return false;
}
