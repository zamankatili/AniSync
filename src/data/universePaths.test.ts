import { describe, expect, it } from 'vitest';
import {
  UNIVERSE_PATHS,
  computePathProgress,
  getRankSnapshot,
  getUniversePath,
  type Localized,
} from './universePaths';

const WORLD_IDS = [
  'shonen_battle',
  'slice_of_life',
  'dark_fantasy',
  'isekai',
  'cyberpunk',
  'seinen_psych',
  'romance_drama',
  'sports',
] as const;

const LANGS = ['tr', 'en', 'ja', 'fr'] as const;

const expectCompleteLocalized = (value: Localized, label: string) => {
  for (const lang of LANGS) {
    expect(value[lang], `${label} [${lang}]`).toBeTypeOf('string');
    expect(value[lang].trim().length, `${label} [${lang}] boş olmamalı`).toBeGreaterThan(0);
  }
};

describe('universePaths', () => {
  it('defines a path, five ranks and one dilemma for every life-sim world', () => {
    for (const worldId of WORLD_IDS) {
      const path = getUniversePath(worldId);
      expect(path, worldId).toBeDefined();
      if (!path) continue;

      expect(path.worldId).toBe(worldId);
      expect(path.ranks).toHaveLength(5);

      expectCompleteLocalized(path.arcName, `${worldId} arcName`);
      expectCompleteLocalized(path.arcNote, `${worldId} arcNote`);

      const thresholds = path.ranks.map((rank) => rank.threshold);
      expect(thresholds[0]).toBe(0);
      for (let i = 1; i < thresholds.length; i += 1) {
        expect(thresholds[i]).toBeGreaterThan(thresholds[i - 1]);
      }
      expect(thresholds[thresholds.length - 1]).toBeLessThanOrEqual(1);

      for (const rank of path.ranks) {
        expectCompleteLocalized(rank.name, `${worldId} rank.name`);
        expectCompleteLocalized(rank.note, `${worldId} rank.note`);
      }

      expect(path.dilemma.choices).toHaveLength(3);
      expect(path.dilemma.age).toBeGreaterThan(0);
      expectCompleteLocalized(path.dilemma.title, `${worldId} dilemma.title`);
      expectCompleteLocalized(path.dilemma.description, `${worldId} dilemma.description`);

      const choiceIds = path.dilemma.choices.map((choice) => choice.id);
      expect(new Set(choiceIds).size).toBe(choiceIds.length);
      for (const choice of path.dilemma.choices) {
        expectCompleteLocalized(choice.label, `${worldId} choice.label`);
        expectCompleteLocalized(choice.description, `${worldId} choice.description`);
        expect(choice.consequences.length).toBeGreaterThan(0);
        for (const consequence of choice.consequences) {
          expectCompleteLocalized(consequence, `${worldId} consequence`);
        }
      }
    }
  });

  it('uses world-specific event-id prefixes so fidelity scoring still works', () => {
    expect(UNIVERSE_PATHS.shonen_battle.dilemma.id.startsWith('shonen_')).toBe(true);
    expect(UNIVERSE_PATHS.dark_fantasy.dilemma.id.startsWith('df_')).toBe(true);
    expect(UNIVERSE_PATHS.isekai.dilemma.id.startsWith('isekai_')).toBe(true);
    expect(UNIVERSE_PATHS.cyberpunk.dilemma.id.startsWith('cyber_')).toBe(true);
    expect(UNIVERSE_PATHS.seinen_psych.dilemma.id.startsWith('seinen_')).toBe(true);
    expect(UNIVERSE_PATHS.romance_drama.dilemma.id.startsWith('romance_')).toBe(true);
    expect(UNIVERSE_PATHS.sports.dilemma.id.startsWith('sports_')).toBe(true);
    expect(UNIVERSE_PATHS.slice_of_life.dilemma.id.startsWith('sol_')).toBe(true);
  });

  it('computes clamped progress and snapshots the right rank', () => {
    expect(computePathProgress(0, 80, { power: 0, intelligence: 0, socialClass: 0 })).toBe(0);
    expect(computePathProgress(80, 80, { power: 100, intelligence: 100, socialClass: 100 })).toBe(1);
    expect(computePathProgress(200, 80, { power: 300, intelligence: 300, socialClass: 300 })).toBe(1);

    const start = getRankSnapshot('shonen_battle', 0);
    expect(start).not.toBeNull();
    expect(start?.index).toBe(0);
    expect(start?.nextPercent).toBe(0);

    const max = getRankSnapshot('shonen_battle', 1);
    expect(max).not.toBeNull();
    expect(max?.index).toBe(4);
    expect(max?.next).toBeNull();
    expect(max?.nextPercent).toBe(100);

    expect(getRankSnapshot('unknown_world', 0.5)).toBeNull();
  });
});
