/**
 * XP / Seviye motoru — v2 "mekân büyümesi" eğrisini yerel soru işareti bırakıyor.
 *
 * L seviyesine ulaşmak için toplam XP: 25 × (L−1) × L
 *   L2 = 50 · L3 = 150 · L4 = 300 · L5 = 500 · L6 = 750 · L7 = 1050 · L10 = 2250 · L15 = 5250
 *
 * Eğri v1'deki karma değerleriyle (izleme +15, tamamlama +40, puan +10...) birlikte
 * çalışır; yalnızca "seviye" hesaplaması ve rütbe isimleri tek yerde toplanmıştır.
 */
export const MAX_LEVEL = 30;

export const xpToReach = (level: number): number => 25 * (level - 1) * level;

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpToReach(level + 1)) level += 1;
  return level;
}

export interface LevelProgress {
  level: number;
  /** Bulunan seviyenin taban XP'si. */
  floor: number;
  /** Bir sonraki seviyenin taban XP'si (max seviyede `floor`'a eşit). */
  ceil: number;
  /** Bu seviyede kazanılan XP. */
  into: number;
  /** Bu seviye için gereken toplam XP (aralık). */
  span: number;
  percent: number;
  remaining: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const floor = xpToReach(level);
  const ceil = level >= MAX_LEVEL ? floor : xpToReach(level + 1);
  const span = Math.max(1, ceil - floor);
  return {
    level,
    floor,
    ceil,
    into: xp - floor,
    span,
    percent: Math.min(100, Math.max(0, ((xp - floor) / span) * 100)),
    remaining: Math.max(0, ceil - xp),
  };
}

export interface RankTier {
  id: string;
  /** Türkçe ad (yerelleştirme anahtarı `rank_{id}` değil, tablo kullanılıyor). */
  title: string;
  from: number;
  badge: string;
  color: string;
}

export const RANK_TIERS: RankTier[] = [
  { id: 'guest', title: 'Misafir', from: 1, badge: '🌱', color: '#10b981' },
  { id: 'regular', title: 'Müdavim', from: 3, badge: '☕', color: '#06b6d4' },
  { id: 'adept', title: 'Kalfa', from: 5, badge: '🔨', color: '#f59e0b' },
  { id: 'master', title: 'Usta', from: 7, badge: '🔥', color: '#a855f7' },
  { id: 'owner', title: 'Mekân Sahibi', from: 10, badge: '🏆', color: '#f97316' },
  { id: 'legend', title: 'Efsane', from: 15, badge: '👑', color: '#ef4444' },
];

export function rankForLevel(level: number): RankTier {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (level >= tier.from) current = tier;
  }
  return current;
}
