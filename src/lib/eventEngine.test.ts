import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getWorldById } from '../data/animeWorlds';
import { getRegionById } from '../data/animeRegions';

// Motor `i18n.language` okur; jsdom olmadan i18n başlatmasını önlemek için mock'lanır.
vi.mock('../i18n', () => ({ default: { language: 'tr' } }));

import {
  generateLife,
  computeStatsAt,
  applyStatChanges,
  LIFE_FOCUSES,
} from './eventEngine';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randomSpy = vi.spyOn(Math, 'random');

describe('eventEngine — generateLife', () => {
  const world = getWorldById('shonen_battle')!;
  const region = getRegionById('konoha')!;

  beforeEach(() => randomSpy.mockReset());
  afterEach(() => randomSpy.mockReset());

  it('aynı seed aynı hayatı üretir (deterministik)', () => {
    randomSpy.mockImplementation(mulberry32(42));
    const a = generateLife(world, region, '1h', { period: 'today', focus: 'combat' });
    randomSpy.mockImplementation(mulberry32(42));
    const b = generateLife(world, region, '1h', { period: 'today', focus: 'combat' });
    expect(a.deathAge).toBe(b.deathAge);
    expect(a.events.length).toBe(b.events.length);
    expect(a.characterName).toBe(b.characterName);
    expect(a.memorialText).toBe(b.memorialText);
  });

  it('doğum ilk olay, ölüm son olay; ölümden sonra olay üretilmez', () => {
    randomSpy.mockImplementation(mulberry32(7));
    const life = generateLife(world, region, '1h', { focus: 'study' });
    expect(life.events[0].age).toBe(0);
    expect(life.events[0].type).toBe('birth');
    const last = life.events[life.events.length - 1];
    expect(last.isDeath).toBe(true);
    expect(last.age).toBe(life.deathAge);
    for (const e of life.events) expect(e.age).toBeLessThanOrEqual(life.deathAge);
  });

  it('farklı seed hayatları çeşitlendirir', () => {
    randomSpy.mockImplementation(mulberry32(1));
    const a = generateLife(world, region, '1h', { focus: 'combat' });
    randomSpy.mockImplementation(mulberry32(2));
    const b = generateLife(world, region, '1h', { focus: 'combat' });
    const differs = a.characterName !== b.characterName || a.deathAge !== b.deathAge || a.events.length !== b.events.length;
    expect(differs).toBe(true);
  });

  it('tüm süre/dönem kombinasyonları çökmeden mantıklı aralık üretir', () => {
    for (const duration of ['30min', '1h', '1.5h'] as const) {
      for (const period of ['today', 'past', 'future'] as const) {
        randomSpy.mockImplementation(mulberry32(99));
        const life = generateLife(world, region, duration, { period });
        expect(life.deathAge).toBeGreaterThanOrEqual(0);
        expect(life.deathAge).toBeLessThanOrEqual(120);
        expect(life.events.length).toBeGreaterThanOrEqual(2); // doğum + ölüm
        for (const v of Object.values(life.finalStats)) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('odak kontrolü 10-60 yaşlarında gerçek seçimle gelir', () => {
    randomSpy.mockImplementation(mulberry32(2024));
    const life = generateLife(world, region, '1.5h', { focus: 'exploration' });
    const focusEvents = life.events.filter(e => e.id.startsWith('focus_'));
    for (const fe of focusEvents) {
      expect(fe.choices).toBeDefined();
      expect(fe.choices!.length).toBe(LIFE_FOCUSES.length);
    }
    if (life.deathAge > 12) {
      expect(focusEvents.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('evrene özgü olaylar yalnızca kendi evreninde üretilir', () => {
    const sports = getWorldById('sports')!;
    const sol = getWorldById('slice_of_life')!;
    const shonen = getWorldById('shonen_battle')!;
    const konoha = getRegionById('konoha')!;
    let sportsSeenTryout = false;
    let solSeenFaction = false;
    let shonenSeenFaction = false;
    let shonenSeenSportsEvent = false;

    for (let seed = 1; seed <= 80 && !(sportsSeenTryout && shonenSeenFaction); seed += 1) {
      randomSpy.mockImplementation(mulberry32(seed));
      const sSports = generateLife(sports, konoha, '1h', { focus: 'combat' });
      if (sSports.events.some(e => e.id === 'sports_tryout_13')) sportsSeenTryout = true;

      const sSol = generateLife(sol, getRegionById('rural_japan')!, '1h', { focus: 'study' });
      if (sSol.events.some(e => e.id.startsWith('faction_'))) solSeenFaction = true;

      const sShonen = generateLife(shonen, konoha, '1h', { focus: 'combat' });
      if (sShonen.events.some(e => e.id === 'faction_15')) shonenSeenFaction = true;
      if (sShonen.events.some(e => e.id.startsWith('sports_'))) shonenSeenSportsEvent = true;
    }

    expect(sportsSeenTryout).toBe(true);
    expect(solSeenFaction).toBe(false);
    expect(shonenSeenFaction).toBe(true);
    expect(shonenSeenSportsEvent).toBe(false);
  });

  it('bölge yaşam beklentisi ve ağır bölgelerde erken ölüm olasılığı bozulmaz', () => {
    randomSpy.mockImplementation(mulberry32(31415));
    const marley = getRegionById('marley')!;
    let early = 0;
    const N = 40;
    for (let i = 0; i < N; i++) {
      randomSpy.mockImplementation(mulberry32(1000 + i));
      const life = generateLife(getWorldById('dark_fantasy')!, marley, '1h', { focus: 'survival' });
      if (life.deathAge <= 40) early += 1;
    }
    expect(early).toBeGreaterThan(0); // ağır bölgede erken ölümler üretiliyor
  });
});

describe('eventEngine — stat motoru', () => {
  const world = getWorldById('shonen_battle')!;
  const region = getRegionById('konoha')!;

  it('applyStatChanges clamp uygular', () => {
    const s = applyStatChanges({ power: 95, intelligence: 10, luck: 10, socialClass: 10, health: 10 }, { power: 15, luck: -20 });
    expect(s.power).toBe(100);
    expect(s.luck).toBe(0);
  });

  it('computeStatsAt seçimin stat etkisini uygular', () => {
    randomSpy.mockImplementation(mulberry32(123));
    const life = generateLife(world, region, '1h', { focus: 'combat' });
    const choiceEvent = life.events.find(e => e.choices && e.choices.length > 0)!;
    const idx = life.events.indexOf(choiceEvent);
    const choice = choiceEvent.choices![0];
    const withChoice = computeStatsAt(life, idx, { [choiceEvent.id]: choice.id });
    const before = computeStatsAt(life, idx - 1, {});
    for (const [k, v] of Object.entries(choice.statChanges)) {
      const key = k as keyof typeof before;
      expect(withChoice[key]).toBe(Math.max(0, Math.min(100, before[key] + (v || 0))));
    }
  });
});
