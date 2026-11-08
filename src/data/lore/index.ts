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

export function getWorldLore(worldId: string): WorldLore | undefined {
  return WORLD_LORE[worldId];
}