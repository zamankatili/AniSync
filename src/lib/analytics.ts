/**
 * GA4 (gtag) ölçüm katmanı — rıza kapılı, env kapılı, kişisel veri taşımaz.
 *
 * Kurallar:
 *  - `VITE_GA4_ID` tanımlı değilse hiçbir script yüklenmez (no-op).
 *  - KVKK: kullanıcı açıkça "Kabul et" demeden gtag çalışmaz. Seçim
 *    `localStorage`'da saklanır; "Reddet" kalıcıdır ve tekrar sorulmaz.
 *  - URL'ler analiz öncesi sadeleştirilir: query/hash atılır, kimlik
 *    segmentleri `:id` ile değiştirilir. E-posta/uid gibi veriler gönderilmez.
 *  - Özel olay adları ve parametreleri allowlist ile sınırlıdır; serbest metin
 *    parametresi gönderilmez (yanlışlıkla PII sızmasın).
 */

export type AnalyticsConsent = 'granted' | 'denied' | 'unset';

export const ANALYTICS_CONSENT_KEY = 'anisync_analytics_consent';

/** GA4 ölçüm kimliği (G-XXXXXXX). Tanımsızsa analiz tamamen kapalıdır. */
export const GA4_MEASUREMENT_ID = String(import.meta.env.VITE_GA4_ID ?? '').trim();

const GA4_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/i;

/** Kimlik taşıyan yol segmentlerinin ebeveynleri. */
const ID_PARENTS = new Set(['anime', 'media', 'watch-party', 'profile', 'u']);

/** Özel olaylarda kabul edilen parametre adları. */
export const ALLOWED_EVENT_PARAMS = [
  'route',
  'surface',
  'mode',
  'difficulty',
  'lang',
  'result',
  'source',
  'count',
] as const;

const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{2,39}$/;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const isAnalyticsConfigured = (): boolean =>
  GA4_ID_PATTERN.test(GA4_MEASUREMENT_ID);

const safeStorage = (): Storage | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

export function getAnalyticsConsent(): AnalyticsConsent {
  const storage = safeStorage();
  const raw = storage?.getItem(ANALYTICS_CONSENT_KEY);
  if (raw === 'granted' || raw === 'denied') return raw;
  return 'unset';
}

/**
 * Rıza kararını kaydeder. `granted` ise gtag hemen yüklenir; `denied` ise
 * yüklenmiş bir script varsa etkisizleştirilir (yeni sayfa görüntülemesi
 * gönderilmez — script kaldırma tarayıcı tarafında garanti değildir).
 */
export function setAnalyticsConsent(decision: 'granted' | 'denied'): void {
  const storage = safeStorage();
  try {
    storage?.setItem(ANALYTICS_CONSENT_KEY, decision);
  } catch {
    // Depolama engelliyse oturum boyunca bellekte tutulur.
  }
  consentOverride = decision;
  if (decision === 'granted') initAnalytics();
}

let consentOverride: AnalyticsConsent | null = null;
let scriptRequested = false;
let lastTrackedPath = '';

const currentConsent = (): AnalyticsConsent => consentOverride ?? getAnalyticsConsent();

/**
 * Sadece rıza verildiyse gtag script'ini bir kez enjekte eder.
 * Birden çok çağrı güvenlidir.
 */
export function initAnalytics(): void {
  if (!isAnalyticsConfigured() || typeof document === 'undefined') return;
  if (currentConsent() !== 'granted') return;
  if (scriptRequested) return;
  scriptRequested = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
  script.dataset.anisyncAnalytics = 'ga4';
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });
  window.gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

/**
 * Analiz için yolu sadeleştirir: query/hash atılır, kimlik segmentleri
 * `:id` olur. Örn. `/anime/16498?x=1` → `/anime/:id`.
 */
export function sanitizeAnalyticsPath(rawPath: string): string {
  const clean = String(rawPath ?? '').split(/[?#]/)[0] || '/';
  const segments = clean.split('/');
  const result = segments.map((segment, index) => {
    if (!segment) return segment;
    const parent = segments[index - 1];
    if (parent && ID_PARENTS.has(parent)) return ':id';
    return segment;
  });
  const path = result.join('/');
  return path.startsWith('/') ? path : `/${path}`;
}

/** Sayfa görüntülemesi — aynı yol için tekrar göndermez (StrictMode/rerender koruması). */
export function trackPageView(rawPath: string, title?: string): void {
  if (!isAnalyticsConfigured() || currentConsent() !== 'granted') return;
  const path = sanitizeAnalyticsPath(rawPath);
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    ...(title ? { page_title: title } : {}),
  });
}

/**
 * Allowlist dışındaki olay adları ve parametreler sessizce düşürülür.
 * Dönüş değeri testlerde ve hata ayıklamada kullanılır.
 */
export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): boolean {
  if (!isAnalyticsConfigured() || currentConsent() !== 'granted') return false;
  const cleanName = sanitizeEventName(name);
  if (!cleanName) return false;
  window.gtag?.('event', cleanName, sanitizeEventParams(params));
  return true;
}

/**
 * Dönüşüm olayını tarayıcı başına bir kez gönderir.
 *
 * Aktivasyon hunisi için kullanılır (kayıt, ilk liste, ilk oyun bitirme).
 * Ölçüm rızası yoksa hiçbir şey işaretlenmez; rıza sonradan verilirse
 * dönüşüm bir sonraki tetiklemede kaydedilir. Bu, `localStorage` temizlenirse
 * yeniden sayılabileceği anlamına gelir — dürüst sınır: tarayıcı bazlı.
 */
export function trackConversionOnce(
  key: string,
  name: string,
  params: Record<string, unknown> = {},
): boolean {
  if (!/^[a-z0-9_]{2,32}$/.test(key)) return false;
  const storage = safeStorage();
  const storageKey = `anisync_conv_${key}`;
  try {
    if (storage?.getItem(storageKey) === '1') return false;
  } catch {
    // Depolama okunamıyorsa gönderimi engelleme; en fazla bir kez fazla sayılır.
  }

  const sent = trackEvent(name, params);
  if (sent) {
    try {
      storage?.setItem(storageKey, '1');
    } catch {
      // Depolama kapalıysa dönüşüm yine de gönderildi.
    }
  }
  return sent;
}

/** Olay adı allowlist'i — geçersizse `null`. */
export function sanitizeEventName(name: string): string | null {
  const value = String(name ?? '').trim();
  return EVENT_NAME_PATTERN.test(value) ? value : null;
}

/**
 * Parametre allowlist'i. Serbest metin yerine kısa etiket kabul edilir;
 * 40 karakterden uzun değerler PII riski taşıdığı için atılır.
 */
export function sanitizeEventParams(
  params: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (!(ALLOWED_EVENT_PARAMS as readonly string[]).includes(key)) continue;
    if (typeof value === 'string') {
      if (value.length > 0 && value.length <= 40) clean[key] = value;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      clean[key] = value;
    } else if (typeof value === 'boolean') {
      clean[key] = value;
    }
  }
  return clean;
}
