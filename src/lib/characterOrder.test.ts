import { describe, it, expect } from 'vitest';
import {
  hashString,
  mulberry32,
  shuffleWithRng,
  shuffledIndices,
  dailyIndex,
  practiceWeights,
  pickWeighted,
  pickPracticeCharacter,
  difficultyFromFame,
  fameScore,
} from './characterOrder';

describe('hashString / mulberry32', () => {
  it('aynı seed aynı sırayı üretir', () => {
    const a = mulberry32(hashString('anisyncdle:3'));
    const b = mulberry32(hashString('anisyncdle:3'));
    for (let i = 0; i < 20; i += 1) {
      expect(a()).toBe(b());
    }
  });

  it('shuffleWithRng tüm elemanları korur', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleWithRng(input, mulberry32(42));
    expect([...shuffled].sort((x, y) => x - y)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // orijinal dokunulmaz
  });
});

describe('shuffledIndices', () => {
  it('0..size-1 aralığında bir permütasyon döner', () => {
    const order = shuffledIndices(10, 'seed');
    expect(order).toHaveLength(10);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('farklı cycle seed\'leri farklı permütasyon üretir', () => {
    const first = shuffledIndices(10, 'anisyncdle:0');
    const second = shuffledIndices(10, 'anisyncdle:1');
    expect(first).not.toEqual(second);
  });
});

describe('dailyIndex', () => {
  it('bir döngü içinde her karakter yalnızca bir kez gelir', () => {
    const seen = new Set<number>();
    for (let day = 0; day < 20; day += 1) {
      seen.add(dailyIndex(day, 20, 'anisyncdle'));
    }
    expect(seen.size).toBe(20);
  });

  it('20 günlük döngüde sıra dosya sırasını izlemez', () => {
    const order = Array.from({ length: 20 }, (_, day) => dailyIndex(day, 20, 'anisyncdle'));
    const isNatural = order.every((value, index) => value === index);
    expect(isNatural).toBe(false);
  });

  it('aynı gün her zaman aynı karakteri verir', () => {
    expect(dailyIndex(10000, 20, 'anisyncdle')).toBe(dailyIndex(10000, 20, 'anisyncdle'));
  });
});

describe('difficultyFromFame', () => {
  it('yüksek bilinirlik kolay, düşük bilinirlik zor verir', () => {
    expect(difficultyFromFame(5, 5)).toBe('easy');
    expect(difficultyFromFame(4, 4)).toBe('medium');
    expect(difficultyFromFame(3, 3)).toBe('hard');
  });

  it('ağırlık karakterin bilinirliğine kaykılıdır (%60 karakter)', () => {
    expect(fameScore(5, 1)).toBeCloseTo(3.4, 6);
    expect(fameScore(1, 5)).toBeCloseTo(2.6, 6);
    expect(fameScore(5, 1)).toBeGreaterThan(fameScore(1, 5));
  });
});

describe('practiceWeights', () => {
  it('erken turlarda zor yoktur; ilerledikçe zor artar', () => {
    expect(practiceWeights(0).hard).toBe(0);
    expect(practiceWeights(2).hard).toBeGreaterThan(0);
    expect(practiceWeights(5).hard).toBeGreaterThan(practiceWeights(2).hard);
  });

  it('ağırlıklar toplamı 1\'dir', () => {
    for (const round of [0, 1, 2, 3, 4, 5, 10]) {
      const { easy, medium, hard } = practiceWeights(round);
      expect(easy + medium + hard).toBeCloseTo(1, 6);
    }
  });
});

describe('pickWeighted', () => {
  it('sıfır ağırlıklı anahtarı seçmez', () => {
    const pick = pickWeighted({ easy: 0, medium: 0, hard: 1 }, () => 0.001);
    expect(pick).toBe('hard');
  });

  it('tüm ağırlıklar sıfırsa null döner', () => {
    expect(pickWeighted({ easy: 0, medium: 0, hard: 0 })).toBeNull();
  });
});

describe('pickPracticeCharacter', () => {
  const pool = [
    { id: 'e1', difficulty: 'easy' as const },
    { id: 'e2', difficulty: 'easy' as const },
    { id: 'm1', difficulty: 'medium' as const },
    { id: 'h1', difficulty: 'hard' as const },
  ];

  it('hariç tutulan karakteri seçmez', () => {
    const picked = pickPracticeCharacter(pool, (item) => item.difficulty, 5, (item) => item.id === 'e1', () => 0.01);
    expect(picked?.id).not.toBe('e1');
  });

  it('havuz boşsa null döner', () => {
    expect(pickPracticeCharacter([], (item: { difficulty: 'easy' }) => item.difficulty, 0)).toBeNull();
  });

  it('zor kademesi boşsa diğerini seçer', () => {
    const easyOnly = pool.filter((item) => item.difficulty === 'easy');
    // round 5: hard %30 ama havuzda zor yok → easy/medium'a düşer
    const picked = pickPracticeCharacter(easyOnly, (item) => item.difficulty, 5, undefined, () => 0.99);
    expect(picked?.difficulty).toBe('easy');
  });
});
