/**
 * Karakter sıralaması ve zorluk seçimi.
 *
 * İki farklı ihtiyaç var:
 *  1. **Günlük içerik** tüm kullanıcılar için aynı olmalı, ama dosya sırasıyla
 *     ilerlememeli. Bu yüzden her 20 günlük döngüde yeni bir deterministik
 *     permütasyon üretilir: aynı gün herkes aynı karakteri görür, döngü
 *     başında sıra yeniden karışır ve her karakter döngüde bir kez gelir.
 *  2. **Antrenman / serbest tur** her açılışta farklı olmalı ve zorluk
 *     ilerledikçe artmalı. Burada ağırlıklı rastgele seçim kullanılır.
 *
 * Zorluk, karakterin ve serisinin bilinirliğinden türetilir; rastgele
 * dağıtılmaz. Böylece "zor" karakterler gerçekten daha az bilinenlerdir.
 */

export type DifficultyTier = 'easy' | 'medium' | 'hard';

/**
 * Zorluğu karakter/seri bilinirliğinden türetir.
 * Ağırlık: karakterin kendi bilinirliği %60, serisinin bilinirliği %40.
 * Bilinirlik 1–5 arasındadır; skor ≥4.5 kolay, ≥3.5 orta, geri kalan zor.
 */
export function fameScore(characterFame: number, seriesPopularity: number): number {
  const clamp = (value: number) => Math.min(5, Math.max(1, Number(value) || 1));
  return 0.6 * clamp(characterFame) + 0.4 * clamp(seriesPopularity);
}

export function difficultyFromFame(characterFame: number, seriesPopularity: number): DifficultyTier {
  const score = fameScore(characterFame, seriesPopularity);
  if (score >= 4.5) return 'easy';
  if (score >= 3.5) return 'medium';
  return 'hard';
}

/** FNV-1a 32-bit — aynı metin her ortamda aynı tohumu üretir. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Küçük, hızlı ve deterministik PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates — `sort(() => Math.random() - 0.5)` yanlılığını kullanmaz. */
export function shuffleWithRng<T>(items: readonly T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 0..size-1 dizisinin tohumlu permütasyonu. */
export function shuffledIndices(size: number, seed: string): number[] {
  if (size <= 0) return [];
  const indices = Array.from({ length: size }, (_, index) => index);
  return shuffleWithRng(indices, mulberry32(hashString(seed)));
}

/**
 * Gün numarasına göre havuzdan bir indeks seçer.
 *
 * Döngü = `floor(day / poolSize)`. Her döngüde yeni permütasyon üretildiği
 * için art arda günler dosya sırasını izlemez; aynı döngü içinde karakter
 * tekrar etmez.
 */
export function dailyIndex(dayNumber: number, poolSize: number, salt: string): number {
  if (poolSize <= 0) return 0;
  const safeDay = Number.isFinite(dayNumber) ? Math.trunc(dayNumber) : 0;
  const cycle = Math.floor(safeDay / poolSize);
  const position = ((safeDay % poolSize) + poolSize) % poolSize;
  const order = shuffledIndices(poolSize, `${salt}:${cycle}`);
  return order[position] ?? 0;
}

/**
 * Antrenman turuna göre zorluk ağırlıkları.
 * İlk iki turda "zor" yok; 4. turdan sonra zor karakterler belirginleşir.
 */
export function practiceWeights(roundIndex: number): Record<DifficultyTier, number> {
  const round = Math.max(0, Math.trunc(roundIndex) || 0);
  if (round <= 1) return { easy: 0.7, medium: 0.3, hard: 0 };
  if (round <= 3) return { easy: 0.45, medium: 0.4, hard: 0.15 };
  return { easy: 0.25, medium: 0.45, hard: 0.3 };
}

/** Ağırlıklara göre tek bir anahtar seçer; tüm ağırlıklar 0 ise `null`. */
export function pickWeighted<T extends string>(
  weights: Record<T, number>,
  rng: () => number = Math.random,
): T | null {
  const entries = Object.entries(weights) as Array<[T, number]>;
  const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
  if (total <= 0) return null;

  let threshold = rng() * total;
  for (const [key, weight] of entries) {
    if (weight <= 0) continue;
    threshold -= weight;
    if (threshold <= 0) return key;
  }
  // Kayan nokta yuvarlaması: son geçerli anahtara düş.
  const fallback = entries.filter(([, weight]) => weight > 0).pop();
  return fallback ? fallback[0] : null;
}

/**
 * Havuzdan zorluk ağırlıklarına göre karakter seçer.
 * Seçilen zorlukta uygun karakter yoksa diğer kademelere düşer.
 */
export function pickPracticeCharacter<T>(
  pool: readonly T[],
  tierOf: (item: T) => DifficultyTier,
  roundIndex: number,
  isExcluded?: (item: T) => boolean,
  rng: () => number = Math.random,
): T | null {
  const available = pool.filter((item) => !isExcluded?.(item));
  if (available.length === 0) return null;

  const byTier: Record<DifficultyTier, T[]> = { easy: [], medium: [], hard: [] };
  for (const item of available) byTier[tierOf(item)].push(item);

  const base = practiceWeights(roundIndex);
  const weights: Record<DifficultyTier, number> = {
    easy: byTier.easy.length > 0 ? base.easy : 0,
    medium: byTier.medium.length > 0 ? base.medium : 0,
    hard: byTier.hard.length > 0 ? base.hard : 0,
  };

  const tier = pickWeighted(weights, rng);
  if (!tier) return available[Math.floor(rng() * available.length)] ?? available[0];

  const bucket = byTier[tier];
  return bucket[Math.floor(rng() * bucket.length)] ?? available[0];
}
