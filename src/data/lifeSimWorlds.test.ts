import { describe, expect, it } from 'vitest';
import {
  ANIME_WORLDS,
  WORLD_COLORS,
  getWorldById,
  localizeWorldName,
  localizeWorldDescription,
} from './animeWorlds';
import {
  ANIME_REGIONS,
  REGION_COLORS,
  getRegionById,
  getRegionsByWorld,
  localizeRegionName,
  localizeRegionDescription,
} from './animeRegions';
import { WORLD_LORE, getWorldLore } from './lore';
import { UNIVERSE_PATHS } from './universePaths';

const LANGS = ['tr', 'en', 'ja', 'fr'] as const;

/** Xianxia evreni gerçek donghua yapımlarına dayanmalı; uydurma başlık yasak. */
const REAL_DONGHUA = [
  "A Record of a Mortal's Journey to Immortality",
  'Soul Land',
  'Battle Through the Heavens',
  'The Daily Life of the Immortal King',
];

describe('life sim worlds — veri bütünlüğü', () => {
  it('has unique ids for every world and region', () => {
    const worldIds = ANIME_WORLDS.map((w) => w.id);
    expect(new Set(worldIds).size).toBe(worldIds.length);

    const regionIds = ANIME_REGIONS.map((r) => r.id);
    expect(new Set(regionIds).size).toBe(regionIds.length);
  });

  it('gives every world a name and description in all four languages', () => {
    for (const world of ANIME_WORLDS) {
      for (const lang of LANGS) {
        const name = localizeWorldName(world, lang);
        const desc = localizeWorldDescription(world, lang);
        expect(name.trim().length, `${world.id} name [${lang}]`).toBeGreaterThan(0);
        expect(desc.trim().length, `${world.id} description [${lang}]`).toBeGreaterThan(0);
      }
      // Türkçe/İngilizce dışındaki diller İngilizceye düşebilir; yine de
      // her evrende JA ve FR adı doğrudan tanımlı olmalı (uydurma değil,
      // gerçek çeviri — eksikse test burada yakalar).
      expect(world.nameJA, `${world.id} nameJA`).toBeTruthy();
      expect(world.nameFR, `${world.id} nameFR`).toBeTruthy();
      expect(world.descriptionJA, `${world.id} descriptionJA`).toBeTruthy();
      expect(world.descriptionFR, `${world.id} descriptionFR`).toBeTruthy();
    }
  });

  it('gives every region a name and description in all four languages', () => {
    for (const region of ANIME_REGIONS) {
      for (const lang of LANGS) {
        expect(localizeRegionName(region, lang).trim().length, `${region.id} name [${lang}]`).toBeGreaterThan(0);
        expect(localizeRegionDescription(region, lang).trim().length, `${region.id} description [${lang}]`).toBeGreaterThan(0);
      }
      expect(region.nameJA, `${region.id} nameJA`).toBeTruthy();
      expect(region.nameFR, `${region.id} nameFR`).toBeTruthy();
      expect(region.descriptionJA, `${region.id} descriptionJA`).toBeTruthy();
      expect(region.descriptionFR, `${region.id} descriptionFR`).toBeTruthy();
    }
  });

  it('resolves every regionId and never orphans a region', () => {
    for (const world of ANIME_WORLDS) {
      expect(world.regionIds.length, `${world.id} regionIds`).toBeGreaterThan(0);
      for (const regionId of world.regionIds) {
        const region = getRegionById(regionId);
        expect(region, `${world.id} → ${regionId}`).toBeDefined();
        expect(region?.worldId).toBe(world.id);
      }
      // Bölge listesi ile regionIds aynı kümeyi göstermeli.
      const byWorld = getRegionsByWorld(world.id).map((r) => r.id).sort();
      expect(byWorld).toEqual([...world.regionIds].sort());
    }

    for (const region of ANIME_REGIONS) {
      expect(getWorldById(region.worldId), `${region.id} worldId`).toBeDefined();
    }
  });

  it('has a color, lore card and universe path for every world', () => {
    for (const world of ANIME_WORLDS) {
      expect(WORLD_COLORS[world.id], `${world.id} WORLD_COLORS`).toBeTruthy();
      expect(UNIVERSE_PATHS[world.id], `${world.id} universe path`).toBeTruthy();

      const lore = getWorldLore(world.id);
      expect(lore, `${world.id} lore`).toBeDefined();
      if (!lore) continue;

      expect(lore.worldId).toBe(world.id);
      expect(lore.factions.length).toBeGreaterThan(0);
      expect(lore.locations.length).toBeGreaterThan(0);

      for (const lang of ['ja', 'fr'] as const) {
        const localized = getWorldLore(world.id, lang);
        expect(localized?.summary.trim().length, `${world.id} lore summary [${lang}]`).toBeGreaterThan(0);
        expect(WORLD_LORE[world.id][lang], `${world.id} lore ${lang} block`).toBeTruthy();
      }
    }
  });

  it('has a color for every region', () => {
    for (const region of ANIME_REGIONS) {
      expect(REGION_COLORS[region.id], `${region.id} REGION_COLORS`).toBeTruthy();
    }
  });

  it('builds the xianxia world on real donghua only', () => {
    const world = getWorldById('xianxia_cultivation');
    expect(world).toBeDefined();
    if (!world) return;

    expect(world.sourceAnime.length).toBeGreaterThan(0);
    for (const title of world.sourceAnime) {
      expect(REAL_DONGHUA).toContain(title);
    }
    expect(world.sourceAnime).toEqual(REAL_DONGHUA);

    // Uzun yaşam vaadi ama yüksek tehlike: kademe atlayışı bedel ister.
    expect(world.lifeExpectancy[0]).toBeGreaterThanOrEqual(60);
    expect(world.dangerLevel).toBe('high');

    const lore = getWorldLore('xianxia_cultivation');
    expect(lore?.sourceSeries).toEqual(REAL_DONGHUA);
    // Kademe sırası "tek kanon" iddiası taşımamalı; kanon uyarısı metinde olmalı.
    expect(lore?.summary).toContain('kanon');
  });
});
