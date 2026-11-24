/**
 * Yaklaşık "şu an online" hesaplaması.
 *
 * Gerçek bir bağlantı durumu tutmak yerine `users/{uid}.lastSeen` alanına
 * periyodik kalp atışı yazılır. Son 5 dakikada görülen üyeler online sayılır;
 * sekme kapanınca alan kendiliğinden bayatlar. Böylece ayrı bir presence
 * koleksiyonu veya Firestore kural değişikliği gerekmez.
 */
export const PRESENCE_WINDOW_MS = 5 * 60 * 1000;
export const PRESENCE_HEARTBEAT_MS = 60 * 1000;
export const PRESENCE_QUERY_LIMIT = 30;

export interface OnlineMember {
  uid: string;
  name: string;
  handle: string;
  avatarSeed: string;
  photoURL: string | null;
  /** Epoch ms — Firestore `serverTimestamp()` değerinden okunur. */
  lastSeen: number;
}

function readText(value: unknown, maxLength = 120): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

/** Firestore Timestamp, sayı veya `{ seconds }` benzeri değeri epoch ms'e çevirir. */
export function readPresenceMillis(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object') return 0;

  const candidate = value as { toMillis?: unknown; seconds?: unknown };
  if (typeof candidate.toMillis === 'function') {
    const millis = (candidate.toMillis as () => unknown)();
    return typeof millis === 'number' && Number.isFinite(millis) ? millis : 0;
  }
  if (typeof candidate.seconds === 'number' && Number.isFinite(candidate.seconds)) {
    return candidate.seconds * 1000;
  }
  return 0;
}

/**
 * Bir `users/{uid}` dokümanını çevrimiçi üyeye dönüştürür.
 * Alan yoksa veya pencere dışındaysa `null` döner; böylece eski hesaplar
 * yanlışlıkla "online" görünmez.
 */
export function mapPresenceDoc(
  uid: string,
  data: Record<string, unknown> | null | undefined,
  now = Date.now(),
): OnlineMember | null {
  if (!uid || !data) return null;
  const lastSeen = readPresenceMillis(data.lastSeen);
  if (lastSeen <= 0 || now - lastSeen > PRESENCE_WINDOW_MS) return null;

  const handle = readText(data.handle, 60);
  const name = readText(data.name, 80) || handle || 'Otaku';

  return {
    uid,
    name,
    handle,
    avatarSeed: readText(data.avatarSeed, 120),
    photoURL: readText(data.photoURL, 2048) || null,
    lastSeen,
  };
}

/** Zaman geçtikçe bayatlayan üyeleri listeden düşürür. */
export function filterOnlineMembers(members: OnlineMember[], now = Date.now()): OnlineMember[] {
  return members.filter((member) => member.lastSeen > 0 && now - member.lastSeen <= PRESENCE_WINDOW_MS);
}
