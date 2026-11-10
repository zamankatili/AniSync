import { describe, expect, it } from 'vitest';
import { getRound, VOICE_CLIPS } from './voiceDuelData';

describe('voiceDuel getRound', () => {
  it('returns the requested number of clips with four options each', () => {
    const round = getRound(10);
    expect(round).toHaveLength(Math.min(10, VOICE_CLIPS.length));
    for (const clip of round) {
      expect(clip.options).toHaveLength(4);
      expect(clip.options).toContain(clip.name);
    }
  });

  it('shuffles options so the correct answer is not always first', () => {
    // Eski hata: doğru cevap her zaman index 0'daydı.
    const positions = new Set<number>();
    for (let i = 0; i < 40; i += 1) {
      for (const clip of getRound(10)) {
        positions.add(clip.options.indexOf(clip.name));
      }
    }
    expect(positions.size).toBeGreaterThan(1);
    expect([...positions].every((p) => p >= 0 && p <= 3)).toBe(true);
  });
});
