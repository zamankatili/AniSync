import { describe, expect, it } from 'vitest';
import {
  buildRoomOverview,
  lastVisitStorageKey,
  markRoomVisited,
  readLastVisit,
  readLastVisits,
  type ChatStorageLike,
} from './chatOverview';
import type { ChatMessage } from './chatTypes';

const memoryStorage = (initial: Record<string, string> = {}) => {
  const map: Record<string, string> = { ...initial };
  const storage: ChatStorageLike = {
    getItem: (key) => (key in map ? map[key] : null),
    setItem: (key, value) => {
      map[key] = value;
    },
  };
  return { storage, map };
};

const message = (
  id: string,
  roomId: string,
  uid: string,
  createdAt: Date,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({
  id,
  roomId,
  uid,
  name: uid,
  avatar: '',
  text: id,
  createdAt,
  ...extra,
});

describe('buildRoomOverview', () => {
  it('collects the newest message and unread count per room', () => {
    const overview = buildRoomOverview(
      [
        message('a1', 'genel', 'u2', new Date(2026, 0, 10, 12, 0)),
        message('a2', 'genel', 'u2', new Date(2026, 0, 10, 12, 5)),
        message('b1', 'muzik', 'u3', new Date(2026, 0, 10, 12, 3)),
      ],
      { genel: new Date(2026, 0, 10, 12, 1).getTime(), muzik: 0 },
      'u1',
    );

    expect(overview.genel.last?.id).toBe('a2');
    expect(overview.genel.unread).toBe(1);
    expect(overview.muzik.unread).toBe(1);
    expect(overview.muzik.last?.id).toBe('b1');
  });

  it('does not count the user own messages as unread', () => {
    const overview = buildRoomOverview(
      [message('mine', 'genel', 'u1', new Date(2026, 0, 10, 12, 0))],
      {},
      'u1',
    );
    expect(overview.genel.unread).toBe(0);
  });

  it('ignores local guest messages and invalid timestamps', () => {
    const overview = buildRoomOverview(
      [
        message('local', 'genel', 'anon', new Date(2026, 0, 10, 12, 0), { isLocal: true }),
        message('broken', 'genel', 'u2', null as unknown as Date),
      ],
      {},
      'u1',
    );
    expect(overview.genel).toBeUndefined();
  });

  it('falls back to the general room when roomId is missing', () => {
    const overview = buildRoomOverview(
      [message('a', '', 'u2', new Date(2026, 0, 10, 12, 0), { roomId: undefined })],
      {},
      'u1',
    );
    expect(overview.genel.last?.id).toBe('a');
  });
});

describe('last visit storage', () => {
  it('marks a room visited and returns the previous stamp', () => {
    const { storage, map } = memoryStorage({ [lastVisitStorageKey('genel')]: '1000' });
    const previous = markRoomVisited('genel', 2000, storage);
    expect(previous).toBe(1000);
    expect(map[lastVisitStorageKey('genel')]).toBe('2000');
  });

  it('returns zero for invalid stored values', () => {
    const { storage } = memoryStorage({ [lastVisitStorageKey('genel')]: 'nope' });
    expect(readLastVisit('genel', storage)).toBe(0);
  });

  it('reads stamps for several rooms', () => {
    const { storage } = memoryStorage({
      [lastVisitStorageKey('a')]: '10',
      [lastVisitStorageKey('b')]: '20',
    });
    expect(readLastVisits(['a', 'b', 'c'], storage)).toEqual({ a: 10, b: 20, c: 0 });
  });

  it('survives a storage that throws', () => {
    const storage: ChatStorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readLastVisit('genel', storage)).toBe(0);
    expect(markRoomVisited('genel', 1, storage)).toBe(0);
  });
});
