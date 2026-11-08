import { WorldLore } from './types';
import { shonenBattleLore } from './shonen_battle';
import { sliceOfLifeLore } from './slice_of_life';
import { darkFantasyLore } from './dark_fantasy';
import { isekaiLore } from './isekai';
import { cyberpunkLore } from './cyberpunk';
import { seinenLore } from './seinen';
import { romanceLore } from './romance';
import { sportsLore } from './sports';

export * from './types';

export const WORLD_LORE: Record<string, WorldLore> = {
  shonen_battle: shonenBattleLore,
  slice_of_life: sliceOfLifeLore,
  dark_fantasy: darkFantasyLore,
  isekai: isekaiLore,
  cyberpunk: cyberpunkLore,
  seinen_psych: seinenLore,
  romance_drama: romanceLore,
  sports: sportsLore,
};

export function getWorldLore(worldId: string, lang?: 'tr' | 'en' | 'ja' | 'fr'): WorldLore | undefined {
  const base = WORLD_LORE[worldId];
  if (!base) return undefined;
  // TR/EN veya dil belirtilmemişse tam içerik döner.
  // JA/FR için: tanımlı alanlar üst üste düşer, boşlar varsayılan metinle sağlanır.
  if (lang === 'ja' && base.ja) {
    return { ...base, ...base.ja, powerSystem: { ...base.powerSystem, ...(base.ja.powerSystem ?? {}) } } as WorldLore;
  }
  if (lang === 'fr' && base.fr) {
    return { ...base, ...base.fr, powerSystem: { ...base.powerSystem, ...(base.fr.powerSystem ?? {}) } } as WorldLore;
  }
  return base;
}