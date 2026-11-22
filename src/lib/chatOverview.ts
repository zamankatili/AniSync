import type { ChatMessage } from './chatTypes';
import { toDateSafe } from './utils';

export type ChatStorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const resolveStorage = (storage?: ChatStorageLike | null): ChatStorageLike | null => {
  if (storage) return storage;
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};

export const lastVisitStorageKey = (roomId: string): string =>
  `anisync_chat_last_visit_${roomId}`;

/** Odanın önceki ziyaret zamanı (ms). Depolama kapalıysa 0. */
export function readLastVisit(
  roomId: string,
  storage?: ChatStorageLike | null,
): number {
  const store = resolveStorage(storage);
  if (!store) return 0;
  try {
    const value = Number(store.getItem(lastVisitStorageKey(roomId)));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

/** Tüm odalar için önceki ziyaret damgaları. */
export function readLastVisits(
  roomIds: string[],
  storage?: ChatStorageLike | null,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const roomId of roomIds) {
    result[roomId] = readLastVisit(roomId, storage);
  }
  return result;
}

/**
 * Odayı "şimdi ziyaret edildi" olarak işaretler ve **önceki** damgayı döner.
 * Çağıran taraf önceki değeri "son ziyaretinden beri" çizgisi için kullanır.
 */
export function markRoomVisited(
  roomId: string,
  now: number = Date.now(),
  storage?: ChatStorageLike | null,
): number {
  const previous = readLastVisit(roomId, storage);
  const store = resolveStorage(storage);
  if (store) {
    try {
      store.setItem(lastVisitStorageKey(roomId), String(now));
    } catch {
      // Depolama kapalı — ayırıcı bir sonraki açılışta görünmez.
    }
  }
  return previous;
}

export interface ChatRoomOverview {
  last: ChatMessage | null;
  lastAt: number;
  unread: number;
}

/**
 * Oda listesi için son mesaj + okunmamış sayısı.
 *
 * Girdi `globalChat` üzerindeki sınırlı (son N) bir dinleyicidir; bu yüzden
 * sayı bir üst sınırdır, "tam okunmamış" iddiası taşımaz.
 */
export function buildRoomOverview(
  messages: ChatMessage[],
  lastVisits: Record<string, number>,
  myUid?: string | null,
): Record<string, ChatRoomOverview> {
  const overview: Record<string, ChatRoomOverview> = {};

  for (const msg of messages) {
    if (msg.isLocal) continue;
    const date = toDateSafe(msg.createdAt);
    if (!date) continue;
    const ms = date.getTime();
    const roomId = msg.roomId || 'genel';
    const entry = overview[roomId] ?? { last: null, lastAt: 0, unread: 0 };

    if (ms >= entry.lastAt) {
      entry.last = msg;
      entry.lastAt = ms;
    }

    const visitedAt = lastVisits[roomId] ?? 0;
    if (ms > visitedAt && (!myUid || msg.uid !== myUid)) {
      entry.unread += 1;
    }

    overview[roomId] = entry;
  }

  return overview;
}
