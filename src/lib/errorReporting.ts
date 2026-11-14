/**
 * Sentry hata raporlama — env kapılı, tembel yüklenen ve kişisel veri temizleyici.
 *
 *  - `VITE_SENTRY_DSN` yoksa hiçbir şey yüklenmez (dev/test no-op).
 *  - SDK **yalnızca ilk hata yakalandığında** dinamik import edilir. Böylece
 *    hiç hata olmayan ziyaretlerde ~40 KB'lık paket indirilmez.
 *  - Global `error` / `unhandledrejection` dinleyicileri hemen kurulur; SDK
 *    gelene kadar oluşan en fazla 10 hata tamponlanır ve sonra gönderilir.
 *  - `sendDefaultPii: false`; `beforeSend` içinde kullanıcı, istek gövdesi,
 *    çerezler ve URL query'si silinir.
 *  - Performans izleme (tracing) bilinçli olarak kapalı: davranış ölçümü GA4'te.
 */
import type { ErrorEvent } from '@sentry/browser';

type SentryModule = typeof import('@sentry/browser');

export const SENTRY_DSN = String(import.meta.env.VITE_SENTRY_DSN ?? '').trim();
export const SENTRY_RELEASE = String(import.meta.env.VITE_SENTRY_RELEASE ?? '').trim();

const MAX_BUFFERED = 10;

interface BufferedError {
  error: unknown;
  context?: Record<string, unknown>;
}

let client: SentryModule | null = null;
let loadPromise: Promise<SentryModule | null> | null = null;
let handlersInstalled = false;
const buffer: BufferedError[] = [];

/** Aynı hatanın kısa sürede tekrar gönderilmesini engelleyen parmak izi. */
const recent = new Map<string, number>();
const DEDUPE_WINDOW_MS = 5_000;

export const isErrorReportingConfigured = (): boolean => /^https?:\/\//.test(SENTRY_DSN);

const fingerprint = (value: unknown): string => {
  if (value instanceof Error) return `${value.name}:${value.message}`;
  return String(value).slice(0, 200);
};

const shouldSkip = (error: unknown): boolean => {
  const key = fingerprint(error);
  const now = Date.now();
  const last = recent.get(key) ?? 0;
  if (now - last < DEDUPE_WINDOW_MS) return true;
  recent.set(key, now);
  if (recent.size > 50) {
    for (const [k, at] of recent) {
      if (now - at > DEDUPE_WINDOW_MS) recent.delete(k);
    }
  }
  return false;
};

/** URL'lerdeki query/hash ve kullanıcı kimliği taşıyabilecek alanları temizler. */
export function scrubEvent(event: Record<string, unknown>): Record<string, unknown> {
  const next = { ...event };
  delete next.user;

  const request = next.request as Record<string, unknown> | undefined;
  if (request) {
    const url = typeof request.url === 'string' ? request.url.split(/[?#]/)[0] : undefined;
    next.request = { ...request, ...(url ? { url } : {}), data: undefined, cookies: undefined };
  }

  if (Array.isArray(next.breadcrumbs)) {
    next.breadcrumbs = next.breadcrumbs.map((crumb) => {
      const entry = crumb as Record<string, unknown>;
      const data = entry.data as Record<string, unknown> | undefined;
      const cleanedUrl =
        typeof data?.url === 'string' ? data.url.split(/[?#]/)[0] : undefined;
      if (!data || !cleanedUrl) return crumb;
      return { ...entry, data: { ...data, url: cleanedUrl } };
    });
  }

  return next;
}

function installGlobalHandlers(): void {
  if (handlersInstalled || typeof window === 'undefined') return;
  handlersInstalled = true;

  window.addEventListener('error', (event) => {
    if (event.error) captureError(event.error, { surface: 'window.error' });
  });
  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, { surface: 'unhandledrejection' });
  });
}

/** SDK'yı (varsa) bir kez yükler ve bekleyen hataları gönderir. */
function ensureClient(): Promise<SentryModule | null> {
  if (client) return Promise.resolve(client);
  if (loadPromise) return loadPromise;
  if (!isErrorReportingConfigured() || typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  loadPromise = (async () => {
    try {
      const Sentry = await import('@sentry/browser');
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,
        ...(SENTRY_RELEASE ? { release: SENTRY_RELEASE } : {}),
        sendDefaultPii: false,
        tracesSampleRate: 0,
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'Non-Error promise rejection captured',
          'Failed to fetch',
          'NetworkError when attempting to fetch resource.',
          'Load failed',
        ],
        beforeSend(event) {
          return scrubEvent(event as unknown as Record<string, unknown>) as unknown as ErrorEvent;
        },
      });
      client = Sentry;
      for (const item of buffer.splice(0, buffer.length)) {
        Sentry.captureException(item.error, item.context ? { extra: item.context } : undefined);
      }
      return Sentry;
    } catch (error) {
      // Raporlama başarısız olsa da uygulama çalışmaya devam eder.
      console.warn('[errorReporting] Sentry başlatılamadı:', error);
      return null;
    }
  })();

  return loadPromise;
}

/**
 * Global dinleyicileri kurar. SDK'yı indirmez — yükleme ilk hatada olur.
 * Birden çok çağrı güvenlidir.
 */
export function initErrorReporting(): void {
  if (typeof window === 'undefined') return;
  if (!isErrorReportingConfigured()) return;
  installGlobalHandlers();
}

/** Yakalanan hatayı (mümkünse) Sentry'ye gönderir. */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!isErrorReportingConfigured()) return;
  if (shouldSkip(error)) return;

  if (!client) {
    if (buffer.length < MAX_BUFFERED) buffer.push({ error, context });
    void ensureClient();
    return;
  }

  client.captureException(error, context ? { extra: context } : undefined);
}

/** Kritik ama istisna olmayan olaylar (örn. başarısız yapılandırma). */
export function captureMessage(message: string, context?: Record<string, unknown>): void {
  if (!isErrorReportingConfigured()) return;
  if (client) {
    client.captureMessage(message, context ? { extra: context } : undefined);
    return;
  }
  void ensureClient().then((sentry) => {
    sentry?.captureMessage(message, context ? { extra: context } : undefined);
  });
}
