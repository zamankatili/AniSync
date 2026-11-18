/**
 * Mevsimsel ambiyans — saf hesap katmanı.
 *
 * Tasarım sınırları (dürüstlük):
 * - Konum izni **istenmez**. Yarımküre kullanıcı tercihidir (varsayılan kuzey).
 * - Hava durumu servisi yoktur; ay + saat yerel takvimden okunur.
 * - "Canlı" hiçbir iddia yoktur: efekt tamamen dekoratiftir.
 */

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';
export type Hemisphere = 'north' | 'south';
export type AmbientParticle = 'petal' | 'mote' | 'leaf' | 'snow' | 'firefly';
export type AmbientAccent = 'birds' | 'crickets' | 'wind' | 'hush';

export interface AmbiencePalette {
  /** Parçacık rengi (CSS rengi). */
  particle: string;
  /** Sabit mevsim tonu için düşük alfa rgba. */
  tint: string;
  /** Kontrol panelindeki vurgu rengi. */
  accent: string;
}

export interface AmbienceProfile {
  season: Season;
  phase: DayPhase;
  hemisphere: Hemisphere;
  particle: AmbientParticle;
  accent: AmbientAccent;
  palette: AmbiencePalette;
  /** Parçacık yoğunluğu çarpanı (0.4–1.1). */
  density: number;
}

/** Ocak = 0. Kuzey yarımküre meteorolojik takvim. */
const NORTH_SEASON_BY_MONTH: readonly Season[] = [
  'winter', // Ocak
  'winter', // Şubat
  'spring', // Mart
  'spring', // Nisan
  'spring', // Mayıs
  'summer', // Haziran
  'summer', // Temmuz
  'summer', // Ağustos
  'autumn', // Eylül
  'autumn', // Ekim
  'autumn', // Kasım
  'winter', // Aralık
];

const SOUTH_SEASON: Record<Season, Season> = {
  spring: 'autumn',
  summer: 'winter',
  autumn: 'spring',
  winter: 'summer',
};

const PALETTES: Record<Season, AmbiencePalette> = {
  spring: { particle: '#f9a8d4', tint: 'rgba(244, 114, 182, 0.10)', accent: '#f9a8d4' },
  summer: { particle: '#fde68a', tint: 'rgba(251, 191, 36, 0.08)', accent: '#fbbf24' },
  autumn: { particle: '#fb923c', tint: 'rgba(251, 146, 60, 0.09)', accent: '#fb923c' },
  winter: { particle: '#e2e8f0', tint: 'rgba(148, 163, 184, 0.12)', accent: '#cbd5e1' },
};

/** Yaz gecesi ateş böceği paleti (daha serin, yeşil). */
const SUMMER_NIGHT_PALETTE: AmbiencePalette = {
  particle: '#bef264',
  tint: 'rgba(132, 204, 22, 0.07)',
  accent: '#a3e635',
};

export const SEASONS: readonly Season[] = ['spring', 'summer', 'autumn', 'winter'];
export const DAY_PHASES: readonly DayPhase[] = ['dawn', 'day', 'dusk', 'night'];

export const getSeason = (date: Date, hemisphere: Hemisphere = 'north'): Season => {
  const north = NORTH_SEASON_BY_MONTH[date.getMonth()] ?? 'winter';
  return hemisphere === 'south' ? SOUTH_SEASON[north] : north;
};

export const getDayPhase = (date: Date): DayPhase => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

const particleFor = (season: Season, phase: DayPhase): AmbientParticle => {
  if (season === 'winter') return 'snow';
  if (season === 'spring') return 'petal';
  if (season === 'autumn') return 'leaf';
  return phase === 'night' ? 'firefly' : 'mote';
};

const accentFor = (season: Season, phase: DayPhase): AmbientAccent => {
  if (phase === 'night') return season === 'winter' ? 'wind' : 'crickets';
  if (season === 'winter') return 'hush';
  if (season === 'autumn') return 'wind';
  return 'birds';
};

const densityFor = (season: Season, phase: DayPhase): number => {
  if (season === 'winter') return 1.1;
  if (season === 'autumn') return 0.9;
  if (season === 'spring') return 0.85;
  return phase === 'night' ? 0.6 : 0.45;
};

export const getAmbienceProfile = (
  date: Date,
  hemisphere: Hemisphere = 'north',
): AmbienceProfile => {
  const season = getSeason(date, hemisphere);
  const phase = getDayPhase(date);
  const palette =
    season === 'summer' && phase === 'night' ? SUMMER_NIGHT_PALETTE : PALETTES[season];

  return {
    season,
    phase,
    hemisphere,
    particle: particleFor(season, phase),
    accent: accentFor(season, phase),
    palette,
    density: densityFor(season, phase),
  };
};

export const seasonLabelKey = (season: Season): string => `ambience_season_${season}`;
export const phaseLabelKey = (phase: DayPhase): string => `ambience_phase_${phase}`;

/**
 * Atmosferin duraklatıldığı ekranlar.
 *
 * Gerekçeler:
 * - `/watch-party`: video izlenirken parçacık/ses dikkat dağıtır.
 * - `/music-quiz`: müzik çalarken ambiyans sesi cevapları maskeler.
 * - `/voice-duel`: mikrofon kaydı var; ortam sesi kayda karışır.
 * - `/anime-life-sim`: oyunun kendi atmosferi ve ses tasarımı var.
 */
const PAUSED_ROUTE_PREFIXES = [
  '/watch-party',
  '/music-quiz',
  '/voice-duel',
  '/anime-life-sim',
] as const;

export const isAmbiencePausedRoute = (pathname: string): boolean =>
  PAUSED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
