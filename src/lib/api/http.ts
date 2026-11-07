/**
 * Ortak HTTP katmanı: timeout, retry (429/5xx) ve basit hız sınırlayıcı.
 *
 * Tüm dış API çağrıları buradan geçer; böylece hata davranışı tek yerde yönetilir.
 */

export class HttpError extends Error {
  readonly status: number;
  readonly url: string;
  readonly retryAfterMs?: number;

  constructor(message: string, status: number, url: string, retryAfterMs?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.retryAfterMs = retryAfterMs;
  }
}

export interface FetchJsonOptions {
  /** Varsayılan 9000 ms. */
  timeoutMs?: number;
  /** Ek deneme sayısı (toplam istek = retries + 1). Varsayılan 2. */
  retries?: number;
  /** İlk bekleme; her denemede 2 katına çıkar. Varsayılan 400 ms. */
  baseDelayMs?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
};

async function requestOnce<T>(url: string, init: RequestInit, options: FetchJsonOptions): Promise<T> {
  const { timeoutMs = 9000, signal } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort, { once: true });

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });

    if (!response.ok) {
      const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
      throw new HttpError(`HTTP ${response.status} — ${url}`, response.status, url, retryAfterMs);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  options: FetchJsonOptions = {}
): Promise<T> {
  const { retries = 2, baseDelayMs = 400 } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestOnce<T>(url, init, options);
    } catch (error) {
      lastError = error;

      if (options.signal?.aborted) throw error;

      const isHttpError = error instanceof HttpError;
      const retryable = !isHttpError || RETRYABLE_STATUS.has(error.status);
      if (!retryable || attempt === retries) throw error;

      const retryAfter = isHttpError ? error.retryAfterMs : undefined;
      const backoff = retryAfter ?? baseDelayMs * 2 ** attempt;
      await sleep(Math.min(backoff, 8000) + Math.random() * 150);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export interface RateLimiter {
  (): Promise<void>;
}

/**
 * Ardışık çağrılar arasında minimum aralık bırakan basit kuyruk.
 * Jikan gibi sıkı rate-limit uygulayan API'ler için kullanılır.
 */
export function createRateLimiter(minIntervalMs: number): RateLimiter {
  let chain: Promise<void> = Promise.resolve();
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
