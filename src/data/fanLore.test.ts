import { describe, expect, it } from 'vitest';
import { FAN_LORE, LORE_CATEGORIES, filterLore } from './fanLore';
import type { Lang4 } from './universePaths';

const LANGS: Lang4[] = ['tr', 'en', 'ja', 'fr'];

const expectCompleteLocalized = (value: Record<Lang4, string>, label: string) => {
  for (const lang of LANGS) {
    expect(value[lang], `${label} [${lang}]`).toBeTypeOf('string');
    expect(value[lang].trim().length, `${label} [${lang}] boş olmamalı`).toBeGreaterThan(0);
  }
};

describe('fanLore', () => {
  it('contains a curated set with unique ids', () => {
    expect(FAN_LORE.length).toBeGreaterThanOrEqual(24);
    const ids = FAN_LORE.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps categories, sources and four-language content valid', () => {
    for (const entry of FAN_LORE) {
      expect(LORE_CATEGORIES).toContain(entry.category);
      expect(entry.series.trim().length).toBeGreaterThan(0);
      expect(entry.sourceLabel.trim().length).toBeGreaterThan(0);
      expect(entry.sourceUrl.startsWith('https://')).toBe(true);
      expectCompleteLocalized(entry.question, `${entry.id} question`);
      expectCompleteLocalized(entry.answer, `${entry.id} answer`);
      expect(entry.tags.length).toBeGreaterThan(0);
    }
  });

  it('filters by category and searches across all four languages', () => {
    const characters = filterLore({ category: 'character' });
    expect(characters.length).toBeGreaterThan(0);
    expect(characters.every((entry) => entry.category === 'character')).toBe(true);

    // Türkçe, İngilizce ve Japonca aramalar aynı kaydı bulmalı.
    expect(filterLore({ query: 'üç kılıç' }).some((entry) => entry.id === 'zoro-three-swords')).toBe(true);
    expect(filterLore({ query: 'three swords' }).some((entry) => entry.id === 'zoro-three-swords')).toBe(true);
    expect(filterLore({ query: '三刀流' }).some((entry) => entry.id === 'zoro-three-swords')).toBe(true);

    expect(filterLore({ query: 'nothing-will-match-this' })).toHaveLength(0);
  });

  it('marks major spoilers and keeps at least one non-spoiler entry per category', () => {
    expect(FAN_LORE.some((entry) => entry.spoiler)).toBe(true);
    for (const category of LORE_CATEGORIES) {
      expect(FAN_LORE.some((entry) => entry.category === category && !entry.spoiler)).toBe(true);
    }
  });
});
