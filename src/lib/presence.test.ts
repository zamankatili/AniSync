import { describe, expect, it } from 'vitest';
import {
  PRESENCE_WINDOW_MS,
  filterOnlineMembers,
  getLocalDayStart,
  mapPresenceDoc,
  readPresenceMillis,
  type OnlineMember,
} from './presence';

const NOW = 1_700_000_000_000;

describe('presence helpers', () => {
  it('reads Firestore timestamp-like values', () => {
    expect(readPresenceMillis({ toMillis: () => NOW })).toBe(NOW);
    expect(readPresenceMillis({ seconds: 123 })).toBe(123_000);
    expect(readPresenceMillis(NOW)).toBe(NOW);
    expect(readPresenceMillis(null)).toBe(0);
    expect(readPresenceMillis({})).toBe(0);
  });

  it('maps a fresh user document into an online member', () => {
    const member = mapPresenceDoc(
      'u1',
      {
        lastSeen: { toMillis: () => NOW - 1_000 },
        name: '  Mina ',
        handle: 'mina',
        avatarSeed: 'seed',
        photoURL: ' https://example.com/a.png ',
      },
      NOW,
    );

    expect(member).toEqual({
      uid: 'u1',
      name: 'Mina',
      handle: 'mina',
      avatarSeed: 'seed',
      photoURL: 'https://example.com/a.png',
      lastSeen: NOW - 1_000,
    });
  });

  it('falls back to handle and then a neutral name', () => {
    expect(mapPresenceDoc('u2', { lastSeen: NOW, handle: 'otaku' }, NOW)?.name).toBe('otaku');
    expect(mapPresenceDoc('u3', { lastSeen: NOW }, NOW)?.name).toBe('Otaku');
  });

  it('rejects missing, zero and stale lastSeen values', () => {
    expect(mapPresenceDoc('u1', null, NOW)).toBeNull();
    expect(mapPresenceDoc('u1', {}, NOW)).toBeNull();
    expect(mapPresenceDoc('u1', { lastSeen: 0 }, NOW)).toBeNull();
    expect(mapPresenceDoc('u1', { lastSeen: NOW - PRESENCE_WINDOW_MS - 1 }, NOW)).toBeNull();
    expect(mapPresenceDoc('u1', { lastSeen: NOW - PRESENCE_WINDOW_MS }, NOW)).not.toBeNull();
  });

  it('returns the local midnight for the active-today count', () => {
    const lateEvening = new Date(2026, 10, 24, 23, 45, 30);
    expect(getLocalDayStart(lateEvening)).toBe(new Date(2026, 10, 24).getTime());
    expect(getLocalDayStart(lateEvening)).toBeLessThan(lateEvening.getTime());
  });

  it('drops stale members while preserving recency order', () => {
    const members: OnlineMember[] = [
      { uid: 'a', name: 'A', handle: 'a', avatarSeed: '', photoURL: null, lastSeen: NOW - 1_000 },
      { uid: 'b', name: 'B', handle: 'b', avatarSeed: '', photoURL: null, lastSeen: NOW - PRESENCE_WINDOW_MS - 1 },
      { uid: 'c', name: 'C', handle: 'c', avatarSeed: '', photoURL: null, lastSeen: NOW - 2_000 },
    ];

    expect(filterOnlineMembers(members, NOW).map((member) => member.uid)).toEqual(['a', 'c']);
  });
});
