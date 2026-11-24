import { describe, it, expect } from 'vitest';
import { getDailyMaarif, getLocalDateKey, getMonthDayKey, pickLocalized } from './maarif';

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
    expect(leaf.memorial).toBeNull();
    expect(leaf.seasonNote.tr).toContain('Güz');
  });

  it('finds memorial entries on their anniversary', () => {
    const leaf = getDailyMaarif(new Date(2026, 1, 9));
    expect(leaf.monthDay).toBe('02-09');
    expect(leaf.memorial?.name).toBe('Osamu Tezuka');
    expect(leaf.memorial?.deathYear).toBe(1989);
  });

  it('normalizes BCP-47 locale tags instead of falling back to English', () => {
    const value = { tr: 'Türkçe', en: 'English', ja: '日本語', fr: 'Français' };
    expect(pickLocalized(value, 'tr-TR')).toBe('Türkçe');
    expect(pickLocalized(value, 'ja-JP')).toBe('日本語');
    expect(pickLocalized(value, 'fr_FR')).toBe('Français');
    expect(pickLocalized(value, 'de-DE')).toBe('English');
  });

  it('formats stable local date keys', () => {
    const date = new Date(2026, 0, 5);
    expect(getLocalDateKey(date)).toBe('2026-01-05');
    expect(getMonthDayKey(date)).toBe('01-05');
  });
});
