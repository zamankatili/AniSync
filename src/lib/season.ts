/**
 * Dinamik anime sezonu hesabı (kış/ilkbahar/yaz/sonbahar).
 * Hardcoded "2026 Sonbahar" gibi etiketleri türetmek için tek kaynak.
 */
export type AnimeSeasonKey = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface AnimeSeasonInfo {
  season: AnimeSeasonKey;
  seasonYear: number;
  /** API'lerde kullanılan küçük harfli ad (winter|spring|summer|fall) */
  slug: 'winter' | 'spring' | 'summer' | 'fall';
  labelTR: string;
  labelEN: string;
  labelJA: string;
  labelFR: string;
}

const SEASON_LABELS: Record<AnimeSeasonKey, { slug: AnimeSeasonInfo['slug']; tr: string; en: string; ja: string; fr: string }> = {
  WINTER: { slug: 'winter', tr: 'Kış', en: 'Winter', ja: '冬', fr: 'Hiver' },
  SPRING: { slug: 'spring', tr: 'İlkbahar', en: 'Spring', ja: '春', fr: 'Printemps' },
  SUMMER: { slug: 'summer', tr: 'Yaz', en: 'Summer', ja: '夏', fr: 'Été' },
  FALL:   { slug: 'fall',   tr: 'Sonbahar', en: 'Fall', ja: '秋', fr: 'Automne' },
};

export function getAnimeSeason(date: Date = new Date()): AnimeSeasonInfo {
  const month = date.getMonth(); // 0-11
  const season: AnimeSeasonKey =
    month <= 1 || month === 11 ? 'WINTER' :
    month <= 4 ? 'SPRING' :
    month <= 7 ? 'SUMMER' : 'FALL';

  // Ocak/Şubat/Aralık kış sezonu, yıl: ocak/şubat → bulunduğu yıl, aralık → bir sonraki yıl başlangıcı sayılmaz (Jikan/MAL kuralı: Aralık+Ocak+Şubat o yılın Kışı olarak adlandırılır).
  const seasonYear = date.getFullYear();
  const labels = SEASON_LABELS[season];

  return {
    season,
    seasonYear,
    slug: labels.slug,
    labelTR: `${seasonYear} ${labels.tr}`,
    labelEN: `${labels.en} ${seasonYear}`,
    labelJA: `${seasonYear}年${labels.ja}`,
    labelFR: `${labels.fr} ${seasonYear}`,
  };
}

export function getSeasonSlug(date: Date = new Date()): AnimeSeasonInfo['slug'] {
  return getAnimeSeason(date).slug;
}

export interface DataEnvelope<T> {
  items: T[];
  source: string;
  /** true → canlı kaynaktan geldi ve taze */
  isLive: boolean;
  /** true → önbellek/fallback/örnek veri; kullanıcıya rozetle gösterilir */
  stale: boolean;
  fetchedAt: string; // ISO
  season: AnimeSeasonKey;
  seasonYear: number;
  seasonLabel: string;
  reason?: string;
}

export function buildEnvelope<T>(
  items: T[],
  partial: Omit<DataEnvelope<T>, 'items' | 'fetchedAt' | 'season' | 'seasonYear' | 'seasonLabel'> & { fetchedAt?: string },
): DataEnvelope<T> {
  const seasonInfo = getAnimeSeason();
  return {
    items,
    isLive: partial.isLive,
    stale: partial.stale,
    source: partial.source,
    reason: partial.reason,
    fetchedAt: partial.fetchedAt ?? new Date().toISOString(),
    season: seasonInfo.season,
    seasonYear: seasonInfo.seasonYear,
    seasonLabel: seasonInfo.labelTR,
  };
}
