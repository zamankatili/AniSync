const STORAGE_KEY = 'anisync_chat_pinned_rooms_v1';
const MAX_PINS = 8;

function readIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string').slice(0, MAX_PINS);
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_PINS)));
  } catch {
    // Depolama doluysa sabitleme sessizce kaybolur; sohbet çalışmaya devam eder.
  }
}

export function readPinnedRoomIds(): string[] {
  return readIds();
}

export function togglePinnedRoomId(roomId: string): string[] {
  const ids = readIds();
  const next = ids.includes(roomId) ? ids.filter((id) => id !== roomId) : [...ids, roomId];
  const trimmed = next.slice(0, MAX_PINS);
  writeIds(trimmed);
  return trimmed;
}
