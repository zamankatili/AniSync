import { describe, it, expect } from 'vitest';
import { ANIME_FACTS } from './animeFacts';
import { ANIME_QUOTES } from './animeQuotes';
import { OTAKU_ON_THIS_DAY } from './otakuOnThisDay';

const LANGS = ['tr', 'en', 'ja', 'fr'] as const;

describe('curated content', () => {
  it('keeps anime facts unique and fully localized', () => {
    const ids = ANIME_FACTS.map((fact) => fact.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ANIME_FACTS.length).toBeGreaterThanOrEqual(80);
    for (const fact of ANIME_FACTS) {
      for (const lang of LANGS) {
        expect(fact.text[lang].trim().length).toBeGreaterThan(0);
        expect(fact.tag[lang].trim().length).toBeGreaterThan(0);
      }
      if (fact.source) {
        expect(fact.source.url.startsWith('https://')).toBe(true);
      }
    }
  });

  it('keeps quotes unique and fully localized', () => {
    const ids = ANIME_QUOTES.map((quote) => quote.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ANIME_QUOTES.length).toBeGreaterThanOrEqual(40);
    for (const quote of ANIME_QUOTES) {
      expect(quote.character.trim().length).toBeGreaterThan(0);
      expect(quote.work.trim().length).toBeGreaterThan(0);
      for (const lang of LANGS) {
        expect(quote.text[lang].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('keeps on-this-day entries unique and localized', () => {
    const dates = OTAKU_ON_THIS_DAY.map((event) => event.date);
    expect(new Set(dates).size).toBe(dates.length);
    expect(OTAKU_ON_THIS_DAY.length).toBeGreaterThanOrEqual(27);
    for (const event of OTAKU_ON_THIS_DAY) {
      expect(event.date).toMatch(/^\d{2}-\d{2}$/);
      for (const lang of LANGS) {
        expect(event.text[lang].trim().length).toBeGreaterThan(0);
      }
      if (event.source) {
        expect(event.source.url.startsWith('https://')).toBe(true);
      }
    }
  });
});
