import { describe, expect, it } from 'vitest';
import {
  DAY_PHASES,
  SEASONS,
  getAmbienceProfile,
  getDayPhase,
  getSeason,
  isAmbiencePausedRoute,
  phaseLabelKey,
  seasonLabelKey,
} from './season';
import { productPassTranslations } from '../../i18nProductPass';

/**
 * Mevsim/faz motoru testleri.
 *
 * Amaç: "canlı veri" iddiası olmayan, tamamen yerel takvime dayanan katmanın
 * sınırlarını sabitlemek. Tarih/saat girdisi açıkça verilir; test sistem saatine
 * bağımlı değildir.
 */

const at = (month: number, hour: number): Date => new Date(2026, month, 15, hour, 0, 0);

describe('getSeason', () => {
  it('maps northern meteorological seasons month by month', () => {
    const expected = [
      'winter', // Jan
      'winter', // Feb
      'spring', // Mar
      'spring', // Apr
      'spring', // May
      'summer', // Jun
      'summer', // Jul
      'summer', // Aug
      'autumn', // Sep
      'autumn', // Oct
      'autumn', // Nov
      'winter', // Dec
    ];

    expected.forEach((season, month) => {
      expect(getSeason(at(month, 12))).toBe(season);
    });
  });

  it('flips the season for the southern hemisphere', () => {
    expect(getSeason(at(0, 12), 'south')).toBe('summer');
    expect(getSeason(at(3, 12), 'south')).toBe('autumn');
    expect(getSeason(at(6, 12), 'south')).toBe('winter');
    expect(getSeason(at(9, 12), 'south')).toBe('spring');
  });

  it('defaults to the northern hemisphere', () => {
    expect(getSeason(at(0, 12))).toBe(getSeason(at(0, 12), 'north'));
  });
});

describe('getDayPhase', () => {
  it('uses explicit hour boundaries', () => {
    expect(getDayPhase(at(5, 4))).toBe('night');
    expect(getDayPhase(at(5, 5))).toBe('dawn');
    expect(getDayPhase(at(5, 7))).toBe('dawn');
    expect(getDayPhase(at(5, 8))).toBe('day');
    expect(getDayPhase(at(5, 16))).toBe('day');
    expect(getDayPhase(at(5, 17))).toBe('dusk');
    expect(getDayPhase(at(5, 19))).toBe('dusk');
    expect(getDayPhase(at(5, 20))).toBe('night');
    expect(getDayPhase(at(5, 23))).toBe('night');
  });
});

describe('getAmbienceProfile', () => {
  it('maps particles to season and phase', () => {
    expect(getAmbienceProfile(at(0, 12)).particle).toBe('snow');
    expect(getAmbienceProfile(at(3, 12)).particle).toBe('petal');
    expect(getAmbienceProfile(at(9, 12)).particle).toBe('leaf');
    expect(getAmbienceProfile(at(6, 12)).particle).toBe('mote');
    expect(getAmbienceProfile(at(6, 22)).particle).toBe('firefly');
  });

  it('maps sparse accents to season and phase', () => {
    expect(getAmbienceProfile(at(3, 9)).accent).toBe('birds');
    expect(getAmbienceProfile(at(6, 22)).accent).toBe('crickets');
    expect(getAmbienceProfile(at(9, 12)).accent).toBe('wind');
    expect(getAmbienceProfile(at(0, 12)).accent).toBe('hush');
    expect(getAmbienceProfile(at(0, 22)).accent).toBe('wind');
  });

  it('gives summer nights their own cooler palette', () => {
    expect(getAmbienceProfile(at(6, 22)).palette.particle).toBe('#bef264');
    expect(getAmbienceProfile(at(6, 12)).palette.particle).toBe('#fde68a');
  });

  it('keeps density inside the documented range', () => {
    for (const month of [0, 3, 6, 9]) {
      for (const hour of [6, 12, 18, 22]) {
        const { density } = getAmbienceProfile(at(month, hour));
        expect(density).toBeGreaterThanOrEqual(0.4);
        expect(density).toBeLessThanOrEqual(1.1);
      }
    }
  });

  it('carries the requested hemisphere through the profile', () => {
    expect(getAmbienceProfile(at(0, 12), 'south').season).toBe('summer');
    expect(getAmbienceProfile(at(0, 12), 'south').hemisphere).toBe('south');
  });
});

describe('isAmbiencePausedRoute', () => {
  it('pauses media and microphone routes', () => {
    expect(isAmbiencePausedRoute('/watch-party')).toBe(true);
    expect(isAmbiencePausedRoute('/watch-party/room-1')).toBe(true);
    expect(isAmbiencePausedRoute('/music-quiz')).toBe(true);
    expect(isAmbiencePausedRoute('/voice-duel')).toBe(true);
    expect(isAmbiencePausedRoute('/anime-life-sim')).toBe(true);
  });

  it('does not pause unrelated routes that merely share a prefix', () => {
    expect(isAmbiencePausedRoute('/')).toBe(false);
    expect(isAmbiencePausedRoute('/discover')).toBe(false);
    expect(isAmbiencePausedRoute('/watch')).toBe(false);
    expect(isAmbiencePausedRoute('/anime-life-simulator')).toBe(false);
  });
});

describe('label keys', () => {
  const langs = ['tr', 'en', 'ja', 'fr'] as const;

  it('resolves season labels in all four languages', () => {
    for (const season of SEASONS) {
      const key = seasonLabelKey(season);
      for (const lang of langs) {
        expect(productPassTranslations[lang][key], `${lang}:${key}`).toBeTruthy();
      }
    }
  });

  it('resolves phase labels in all four languages', () => {
    for (const phase of DAY_PHASES) {
      const key = phaseLabelKey(phase);
      for (const lang of langs) {
        expect(productPassTranslations[lang][key], `${lang}:${key}`).toBeTruthy();
      }
    }
  });

  it('resolves accent labels in all four languages', () => {
    for (const accent of ['birds', 'crickets', 'wind', 'hush'] as const) {
      const key = `ambience_accent_${accent}`;
      for (const lang of langs) {
        expect(productPassTranslations[lang][key], `${lang}:${key}`).toBeTruthy();
      }
    }
  });
});
