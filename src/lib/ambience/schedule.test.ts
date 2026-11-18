import { describe, expect, it } from 'vitest';
import {
  ACCENT_GAP_MINUTES,
  ACCENT_JITTER_RATIO,
  accentCadenceMinutes,
  accentGapMs,
  advanceAccentClock,
  createAccentClock,
  jitteredGapMs,
  msUntilAccent,
} from './schedule';
import type { AmbientAccent } from './season';

/**
 * Seyrek vurgu saati testleri.
 *
 * Üç kural sabitlenir:
 * 1. Taban aralıklar 15 / 27 / 45 dakika.
 * 2. Sapma ±%20 ve deterministik örnekle test edilebilir.
 * 3. Sekme uyuduktan sonra dönüşte vurgular **birikip patlamaz**.
 */

const ACCENTS: AmbientAccent[] = ['birds', 'crickets', 'wind', 'hush'];
const half = () => 0.5;

describe('cadence constants', () => {
  it('uses exactly three sparse gaps across four accents', () => {
    expect(ACCENT_GAP_MINUTES.birds).toBe(15);
    expect(ACCENT_GAP_MINUTES.crickets).toBe(27);
    expect(ACCENT_GAP_MINUTES.wind).toBe(45);
    expect(ACCENT_GAP_MINUTES.hush).toBe(45);
  });

  it('has a gap and a minutes helper for every accent', () => {
    for (const accent of ACCENTS) {
      expect(accentGapMs(accent)).toBe(ACCENT_GAP_MINUTES[accent] * 60_000);
      expect(accentCadenceMinutes(accent)).toBe(ACCENT_GAP_MINUTES[accent]);
    }
  });
});

describe('jitteredGapMs', () => {
  it('returns the exact base gap at the midpoint sample', () => {
    for (const accent of ACCENTS) {
      expect(jitteredGapMs(accent, half)).toBe(accentGapMs(accent));
    }
  });

  it('stays inside ±20 percent', () => {
    for (const accent of ACCENTS) {
      const base = accentGapMs(accent);
      expect(jitteredGapMs(accent, () => 0)).toBe(Math.round(base * (1 - ACCENT_JITTER_RATIO)));
      expect(jitteredGapMs(accent, () => 1)).toBe(Math.round(base * (1 + ACCENT_JITTER_RATIO)));
    }
  });

  it('clamps out-of-range samples instead of producing negative delays', () => {
    for (const accent of ACCENTS) {
      expect(jitteredGapMs(accent, () => -5)).toBeGreaterThan(0);
      expect(jitteredGapMs(accent, () => 5)).toBe(Math.round(accentGapMs(accent) * 1.2));
    }
  });
});

describe('createAccentClock', () => {
  it('schedules the first accent from now plus the gap', () => {
    const clock = createAccentClock('birds', 1_000, half);
    expect(clock.accent).toBe('birds');
    expect(clock.nextAt).toBe(1_000 + accentGapMs('birds'));
  });
});

describe('advanceAccentClock', () => {
  it('keeps the cadence when the timer fires on time', () => {
    const start = 10_000;
    const first = createAccentClock('crickets', start, half);
    const next = advanceAccentClock(first, 'crickets', first.nextAt, half);
    expect(next.nextAt).toBe(first.nextAt + accentGapMs('crickets'));
  });

  it('skips missed accents after a long sleep instead of firing a burst', () => {
    const base = accentGapMs('birds');
    const first = createAccentClock('birds', 0, half);
    const firedAt = first.nextAt + base * 3 + 5_000;
    const next = advanceAccentClock(first, 'birds', firedAt, half);

    expect(next.nextAt).toBeGreaterThan(firedAt);
    expect(next.nextAt - firedAt).toBeLessThanOrEqual(base);
  });

  it('restarts the cadence when the profile changes accent', () => {
    const firedAt = 500_000;
    const previous = { accent: 'birds' as const, nextAt: 600_000 };
    const next = advanceAccentClock(previous, 'crickets', firedAt, half);

    expect(next.accent).toBe('crickets');
    expect(next.nextAt).toBe(firedAt + accentGapMs('crickets'));
  });
});

describe('msUntilAccent', () => {
  it('never returns a negative delay', () => {
    expect(msUntilAccent({ accent: 'wind', nextAt: 1_000 }, 5_000)).toBe(0);
    expect(msUntilAccent({ accent: 'wind', nextAt: 5_000 }, 1_000)).toBe(4_000);
  });
});
