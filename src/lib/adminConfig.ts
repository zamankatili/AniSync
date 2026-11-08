/**
 * Admin & Remote Config sabitleri ve güvenli çözümleme yardımcıları.
 * Bootstrap: VITE_ADMIN_EMAILS env — ilk admin bu listeden tanınır.
 * Kalıcı: `users/{uid}` içindeki `role: 'admin' | 'moderator'` alanı (Firebase Auth ID token'a yansımaz; rules uid ile okur).
 */

export type AdminRole = 'admin' | 'moderator' | 'user';

export interface RemoteAnnouncement {
  tr: string;
  en: string;
  ja?: string;
  fr?: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  startsAt?: string;
  endsAt?: string;
}

/** Chat'teki "CANLI ETKİNLİK" bandı — admin \`config/app.chatEvent\`'e yazar; `null` ise gizli. */
export interface RemoteChatEvent {
  tr: string;
  en: string;
  ja?: string;
  fr?: string;
  date?: string; // admin'in serbest metin tarih/saati (ör. "Cuma 21:00")
}

export interface RemoteConfig {
  maintenanceMode: boolean;
  featureFlags: Record<string, number | boolean>;
  announcement?: RemoteAnnouncement | null;
  chatEvent?: RemoteChatEvent | null;
  limits?: Record<string, number>;
}

export const DEFAULT_REMOTE_CONFIG: RemoteConfig = {
  maintenanceMode: false,
  featureFlags: {
    lifeSim: 100,
    musicQuiz: 100,
    watchParty: 100,
    dle: 100,
    challenge: 100,
    adminNews: 100,
  },
};

/** Bootstrap fallback — ilk admin; `.env` `VITE_ADMIN_EMAILS` ile genişletilebilir/değiştirilebilir. */
const BOOTSTRAP_ADMIN_EMAILS = ['zamankatilii@gmail.com'];
const ADMIN_EMAIL_CACHE = ((import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const EFFECTIVE_ADMIN_EMAILS = ADMIN_EMAIL_CACHE.length > 0 ? ADMIN_EMAIL_CACHE : BOOTSTRAP_ADMIN_EMAILS;

export function getAdminEmails(): string[] {
  return [...EFFECTIVE_ADMIN_EMAILS];
}

/** E-posta tabanlı bootstrap admin kontrolü (rules da aynı listeyi kullanır). */
export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return EFFECTIVE_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function featureFlagValue(value: number | boolean | undefined): number {
  if (typeof value === 'boolean') return value ? 100 : 0;
  if (typeof value === 'number' && !Number.isNaN(value)) return Math.max(0, Math.min(100, value));
  return 0;
}

/** Duyurunun şu anda gösterilmesi gerekiyor mu? */
export function isAnnouncementActive(announcement: RemoteAnnouncement | null | undefined, now = new Date()): boolean {
  if (!announcement) return false;
  const startOk = !announcement.startsAt || new Date(announcement.startsAt).getTime() <= now.getTime();
  const endOk = !announcement.endsAt || new Date(announcement.endsAt).getTime() >= now.getTime();
  return startOk && endOk;
}

const CACHE_KEY = 'anisync_remote_config_v1';
const CACHE_TTL_MS = 60 * 1000; // 60s

/** localStorage'dan taze cache'i okur (yoksa varsayılan döner). */
export function loadCachedRemoteConfig(): RemoteConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { config: RemoteConfig; timestamp: number };
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed.config;
  } catch {
    return null;
  }
}

export function saveCachedRemoteConfig(config: RemoteConfig) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ config, timestamp: Date.now() }));
  } catch {
    // yoksay
  }
}
