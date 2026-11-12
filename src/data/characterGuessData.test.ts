import { describe, expect, it } from 'vitest';
import { CHARACTER_HINTS, getCharacterRound } from './characterGuessData';
import type { Lang4 } from './universePaths';

const LANGS: Lang4[] = ['tr', 'en', 'ja', 'fr'];

const expectCompleteLocalized = (value: Record<Lang4, string>, label: string) => {
  for (const lang of LANGS) {
    expect(value[lang], `${label} [${lang}]`).toBeTypeOf('string');
    expect(value[lang].trim().length, `${label} [${lang}] boş olmamalı`).toBeGreaterThan(0);
  }
};

describe('characterGuessData', () => {
  it('has a meaningful, unique set of characters across well-known series', () => {
    expect(CHARACTER_HINTS.length).toBeGreaterThanOrEqual(30);
    const ids = CHARACTER_HINTS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    const series = new Set(CHARACTER_HINTS.map((item) => item.series));
    expect(series.size).toBeGreaterThanOrEqual(12);
    expect(series.has('Naruto')).toBe(true);
    expect(series.has('One Piece')).toBe(true);
  });

  it('every entry has four unique options that include the correct name', () => {
    for (const item of CHARACTER_HINTS) {
      expect(item.options).toHaveLength(4);
      expect(item.options).toContain(item.name);
      expect(new Set(item.options).size).toBe(4);
    }
  });

  it('every entry has four-language hints and answer notes', () => {
    for (const item of CHARACTER_HINTS) {
      expectCompleteLocalized(item.hint, `${item.id} hint`);
      expectCompleteLocalized(item.note, `${item.id} note`);
    }
  });

  it('getCharacterRound returns shuffled options without losing the answer', () => {
    const round = getCharacterRound(10);
    expect(round).toHaveLength(Math.min(10, CHARACTER_HINTS.length));
    for (const item of round) {
      expect(item.options).toHaveLength(4);
      expect(item.options).toContain(item.name);
      expect(new Set(item.options).size).toBe(4);
    }
  });
});
