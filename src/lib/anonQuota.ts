/**
 * Anon 3 mesaj / gün kotası — giriş yapmamış ziyaretçiler için.
 *
 * - Kota istemci tarafında hedeflidir; kötüye kullanım aynı cihazda 3 ile sınırlıdır.
 *   Firestore yazılabilecek bir şey değildir (rules: anon yazma kapalı).
 * - Yerel mesajlar `anisync_anon_messages_v1` anahtarında tutulur; 24 saatte bayatlar.
 * - İmza/ad: "Misafir" + ikon, 1 gün kalıcı chibi yerel avatarı.
 */
const QUOTA_KEY = 'anisync_anon_quota_v1';
const MESSAGES_KEY = 'anisync_anon_messages_v1';
const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;

export const ANON_DAILY_LIMIT = 3;

const todayKey = (now: Date): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export interface AnonQuota {
  date: string;
  used: number;
}

export function readAnonQuota(now: Date = new Date(), storage: Pick<Storage, 'getItem'> = localStorage): AnonQuota {
  try {
    const raw = storage.getItem(QUOTA_KEY);
    if (!raw) return { date: todayKey(now), used: 0 };
    const parsed = JSON.parse(raw) as Partial<AnonQuota> | null;
    if (parsed?.date === todayKey(now) && typeof parsed?.used === 'number' && Number.isFinite(parsed.used)) {
      return { date: parsed.date, used: Math.max(0, Math.floor(parsed.used)) };
    }
    return { date: todayKey(now), used: 0 };
  } catch {
    return { date: todayKey(now), used: 0 };
  }
}

export function canAnonSend(now: Date = new Date(), storage: Pick<Storage, 'getItem'> = localStorage): boolean {
  return readAnonQuota(now, storage).used < ANON_DAILY_LIMIT;
}

export function recordAnonSend(now: Date = new Date(), storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): AnonQuota {
  const current = readAnonQuota(now, storage);
  const next: AnonQuota = { date: todayKey(now), used: current.used + 1 };
  try {
    storage.setItem(QUOTA_KEY, JSON.stringify(next));
  } catch {
    /* yoksay */
  }
  return next;
}

export interface AnonLocalMessage {
  id: string;
  roomId: string;
  text: string;
  createdAt: number;
  name: string;
}

export function loadAnonMessages(
  roomId: string,
  storage: Pick<Storage, 'getItem'> = localStorage,
  now: number = Date.now(),
): AnonLocalMessage[] {
  try {
    const raw = storage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnonLocalMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m) => m && m.roomId === roomId && now - Number(m.createdAt) < MESSAGE_TTL_MS);
  } catch {
    return [];
  }
}

export function appendAnonMessage(
  roomId: string,
  message: Omit<AnonLocalMessage, 'roomId'>,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  now: number = Date.now(),
): AnonLocalMessage[] {
  try {
    const allRaw = storage.getItem(MESSAGES_KEY);
    const all = allRaw ? (JSON.parse(allRaw) as AnonLocalMessage[]) : [];
    const kept = Array.isArray(all) ? all.filter((m) => now - Number(m.createdAt) < MESSAGE_TTL_MS) : [];
    const created: AnonLocalMessage = { ...message, roomId };
    kept.push(created);
    storage.setItem(MESSAGES_KEY, JSON.stringify(kept.slice(-100)));
    return kept.filter((m) => m.roomId === roomId);
  } catch {
    return [{ ...message, roomId }];
  }
}

/** Yerel anon mesajını kaldırır. */
export function removeAnonMessage(
  messageId: string,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
): void {
  try {
    const raw = storage.getItem(MESSAGES_KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as AnonLocalMessage[];
    if (!Array.isArray(all)) return;
    storage.setItem(MESSAGES_KEY, JSON.stringify(all.filter((m) => m.id !== messageId)));
  } catch {
    /* yoksay */
  }
}

/** Sadece UI render tepki ketleyicisi: bayatları temizler. */
export function purgeAnonMessages(
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  now: number = Date.now(),
): void {
  try {
    const raw = storage.getItem(MESSAGES_KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as AnonLocalMessage[];
    if (!Array.isArray(all)) return;
    const fresh = all.filter((m) => now - Number(m.createdAt) < MESSAGE_TTL_MS);
    if (fresh.length !== all.length) storage.setItem(MESSAGES_KEY, JSON.stringify(fresh));
  } catch {
    /* yoksay */
  }
}

