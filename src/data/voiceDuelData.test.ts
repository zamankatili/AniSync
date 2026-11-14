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

  it('keeps unique ids and sane segments for every clip', () => {
    const ids = new Set(VOICE_CLIPS.map((clip) => clip.id));
    expect(ids.size).toBe(VOICE_CLIPS.length);

    for (const clip of VOICE_CLIPS) {
      expect(clip.startSeconds).toBeGreaterThanOrEqual(0);
      expect(clip.endSeconds).toBeGreaterThan(clip.startSeconds);
      expect(clip.endSeconds).toBeLessThanOrEqual(45);
      expect(clip.videoId).toMatch(/^[A-Za-z0-9_-]{6,20}$/);
      expect(new Set(clip.options).size).toBe(4);
      expect(clip.options).toContain(clip.name);
      expect(clip.hint).toEqual(
        expect.objectContaining({ tr: expect.any(String), en: expect.any(String), ja: expect.any(String), fr: expect.any(String) }),
      );
    }
  });

  it('documents at least three popular series from official sources', () => {
    const series = new Set(VOICE_CLIPS.map((clip) => clip.series));
    expect(series.has('Chainsaw Man')).toBe(true);
    expect(series.has('Jujutsu Kaisen')).toBe(true);
    expect(series.has('Demon Slayer: Kimetsu no Yaiba')).toBe(true);
    // Madoka çıkarıldı; Magica hiçbir şekilde geri gelmemeli.
    expect(series.has('Puella Magi Madoka Magica')).toBe(false);
    expect(series.has('Puella Magi Magia Exedra')).toBe(false);
  });
});
