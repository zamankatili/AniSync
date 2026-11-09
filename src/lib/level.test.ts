import { describe, it, expect } from 'vitest';
import { xpToReach, levelFromXp, levelProgress, rankForLevel, MAX_LEVEL } from './level';

describe('xpToReach', () => {
  it('25 * (L-1) * L eğrisini izler', () => {
    expect(xpToReach(1)).toBe(0);
    expect(xpToReach(2)).toBe(50);
    expect(xpToReach(3)).toBe(150);
    expect(xpToReach(4)).toBe(300);
    expect(xpToReach(5)).toBe(500);
    expect(xpToReach(7)).toBe(1050);
    expect(xpToReach(15)).toBe(5250);
  });
});

describe('levelFromXp', () => {
  it('0 XP ile 1. seviye başlar', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(49)).toBe(1);
  });

  it('eşik değerlerinde doğru seviye sayar', () => {
    expect(levelFromXp(50)).toBe(2);
    expect(levelFromXp(149)).toBe(2);
    expect(levelFromXp(150)).toBe(3);
    expect(levelFromXp(299)).toBe(3);
    expect(levelFromXp(300)).toBe(4);
  });

  it('MAX_LEVEL sınırında caps', () => {
    expect(levelFromXp(10 ** 9)).toBe(MAX_LEVEL);
  });
});

describe('levelProgress', () => {
  it('yıl ortası ilerlemeyi yüzde olarak verir', () => {
    const p = levelProgress(75); // L2: 50..150, 25/100
    expect(p.level).toBe(2);
    expect(p.floor).toBe(50);
    expect(p.ceil).toBe(150);
    expect(p.into).toBe(25);
    expect(p.span).toBe(100);
    expect(p.percent).toBe(25);
    expect(p.remaining).toBe(75);
  });

  it('max seviyede %100 verir', () => {
    const p = levelProgress(xpToReach(MAX_LEVEL) + 5000);
    expect(p.level).toBe(MAX_LEVEL);
    expect(p.percent).toBe(100);
    expect(p.remaining).toBe(0);
  });

  it('negatif XP ile patlamaz', () => {
    const p = levelProgress(-100);
    expect(p.level).toBe(1);
    expect(p.percent).toBe(0);
  });
});

describe('rankForLevel', () => {
  it('rütbeler seviyeyle açılır', () => {
    expect(rankForLevel(1).id).toBe('guest');
    expect(rankForLevel(2).id).toBe('guest');
    expect(rankForLevel(3).id).toBe('regular');
    expect(rankForLevel(5).id).toBe('adept');
    expect(rankForLevel(7).id).toBe('master');
    expect(rankForLevel(10).id).toBe('owner');
    expect(rankForLevel(15).id).toBe('legend');
    expect(rankForLevel(30).id).toBe('legend');
  });
});
