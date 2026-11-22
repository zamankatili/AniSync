import { CHAT_MESSAGE_MAX } from './chatTypes';
import type { ChatStorageLike } from './chatOverview';

const DRAFTS_KEY = 'anisync_chat_drafts_v1';
const MAX_ROOMS = 24;

const resolveStorage = (storage?: ChatStorageLike | null): ChatStorageLike | null => {
  if (storage) return storage;
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};

function readMap(storage?: ChatStorageLike | null): Record<string, string> {
  const store = resolveStorage(storage);
  if (!store) return {};
  try {
    const raw = store.getItem(DRAFTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const map: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'string' && value) map[key] = value.slice(0, CHAT_MESSAGE_MAX);
    }
    return map;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, string>, storage?: ChatStorageLike | null): void {
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    const keys = Object.keys(map);
    const trimmed: Record<string, string> = {};
    for (const key of keys.slice(-MAX_ROOMS)) trimmed[key] = map[key];
    store.setItem(DRAFTS_KEY, JSON.stringify(trimmed));
  } catch {
    // Kota/depolama hatası taslağı kaybettirir; sohbet çalışmaya devam eder.
  }
}

/** Oda başına taslak — oda değiştirince yazılan metin kaybolmaz. */
export function readChatDraft(roomId: string, storage?: ChatStorageLike | null): string {
  return readMap(storage)[roomId] ?? '';
}

export function writeChatDraft(
  roomId: string,
  text: string,
  storage?: ChatStorageLike | null,
): void {
  const map = readMap(storage);
  const value = text.slice(0, CHAT_MESSAGE_MAX);
  if (value.trim()) {
    map[roomId] = value;
  } else {
    delete map[roomId];
  }
  writeMap(map, storage);
}

export function clearChatDraft(roomId: string, storage?: ChatStorageLike | null): void {
  const map = readMap(storage);
  if (!(roomId in map)) return;
  delete map[roomId];
  writeMap(map, storage);
}
