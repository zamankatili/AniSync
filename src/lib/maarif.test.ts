import { describe, it, expect } from 'vitest';
import { getDailyMaarif, getLocalDateKey, getMonthDayKey } from './maarif';

describe('maarif', () => {
  it('returns the same leaf for the same local day', () => {
    const morning = new Date(2026, 6, 20, 8, 0, 0);
    const night = new Date(2026, 6, 20, 23, 59, 0);
    expect(getDailyMaarif(morning)).toEqual(getDailyMaarif(night));
  });

  it('finds curated on-this-day events', () => {
    const leaf = getDailyMaarif(new Date(2026, 6, 20));
    expect(leaf.monthDay).toBe('07-20');
    expect(leaf.event?.date).toBe('07-20');
  });

  it('falls back to the season note when no event exists', () => {
    const leaf = getDailyMaarif(new Date(2026, 10, 23));
    expect(leaf.monthDay).toBe('11-23');
    expect(leaf.event).toBeNull();
    expect(leaf.seasonNote.tr).toContain('Güz');
  });

  it('formats stable local date keys', () => {
    const date = new Date(2026, 0, 5);
    expect(getLocalDateKey(date)).toBe('2026-01-05');
    expect(getMonthDayKey(date)).toBe('01-05');
  });
});
