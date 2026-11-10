import { describe, expect, it } from 'vitest';
import { toDateSafe } from './utils';

describe('toDateSafe', () => {
  it('reads a Firestore-like Timestamp via toDate()', () => {
    const date = new Date('2026-11-10T12:00:00.000Z');
    const ts = { toDate: () => date, seconds: 0, nanoseconds: 0 };
    expect(toDateSafe(ts)?.toISOString()).toBe(date.toISOString());
  });

  it('reads a plain { seconds, nanoseconds } object (anonymous chat messages)', () => {
    const ms = 1762780800000; // 2025-11-10T12:00:00Z
    const value = { seconds: Math.floor(ms / 1000), nanoseconds: 250_000_000 };
    expect(toDateSafe(value)?.getTime()).toBe(Math.floor(ms / 1000) * 1000 + 250);
  });

  it('accepts Date and ISO strings', () => {
    expect(toDateSafe(new Date('2026-01-02T03:04:05Z'))?.toISOString()).toBe('2026-01-02T03:04:05.000Z');
    expect(toDateSafe('2026-01-02T03:04:05Z')?.toISOString()).toBe('2026-01-02T03:04:05.000Z');
  });

  it('returns null for invalid / missing values instead of throwing', () => {
    expect(toDateSafe(undefined)).toBeNull();
    expect(toDateSafe(null)).toBeNull();
    expect(toDateSafe('not-a-date')).toBeNull();
    expect(toDateSafe({})).toBeNull();
    expect(toDateSafe({ toDate: () => { throw new Error('boom'); } })).toBeNull();
    expect(toDateSafe({ toDate: () => new Date('invalid') })).toBeNull();
  });
});
