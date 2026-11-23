import { ANIME_QUOTES, type AnimeQuote, type QuoteLang } from '../data/animeQuotes';
import { OTAKU_ON_THIS_DAY, type OtakuDayEvent } from '../data/otakuOnThisDay';

export interface DailyMaarif {
  /** `YYYY-MM-DD` — yerel gün. */
  dateKey: string;
  /** `MM-DD` — "tarihte bugün" anahtarı. */
  monthDay: string;
  quote: AnimeQuote;
  /** O gün için küratörlü not; yoksa null ve sezon notu öne çıkar. */
  event: OtakuDayEvent | null;
  seasonNote: Record<QuoteLang, string>;
}

const SEASON_NOTES: Record<number, Record<QuoteLang, string>> = {
  1: {
    tr: 'Kış sezonu: yeni yılın ilk animeleri ve sıcak bir battaniye.',
    en: 'Winter season: the year’s first anime and a warm blanket.',
    ja: '冬シーズン：新年最初のアニメと温かい毛布。',
    fr: "Saison d'hiver : les premiers animes de l'année et une couverture chaude.",
  },
  2: {
    tr: 'Kış sezonunun ortası — uzun seriler için iyi bir dönem.',
    en: 'Mid-winter season — a good time for longer series.',
    ja: '冬シーズン中盤——長編シリーズに向いた時期。',
    fr: "Mi-saison d'hiver — un bon moment pour les séries longues.",
  },
  3: {
    tr: 'Bahar hazırlığı: sezon finalleri ve yeni başlangıçlar.',
    en: 'Spring prep: season finales and fresh starts.',
    ja: '春の準備：シーズン終盤と新しい始まり。',
    fr: 'Préparation du printemps : fins de saison et nouveaux départs.',
  },
  4: {
    tr: 'Bahar sezonu başlıyor; taze seriler ve yeni opening’ler.',
    en: 'Spring season begins — fresh series and new openings.',
    ja: '春シーズン開幕——新作と新しいOP。',
    fr: 'La saison de printemps commence — nouvelles séries et nouveaux openings.',
  },
  5: {
    tr: 'Bahar ortası — izleme listesini dengeleme zamanı.',
    en: 'Mid-spring — time to balance your watchlist.',
    ja: '春の半ば——視聴リストを整える時期。',
    fr: 'Mi-printemps — le moment d’équilibrer ta liste.',
  },
  6: {
    tr: 'Yaz hazırlığı: kısa seriler ve film maratonu.',
    en: 'Summer prep: short series and movie marathons.',
    ja: '夏の準備：短編シリーズと映画マラソン。',
    fr: "Préparation de l'été : séries courtes et marathons de films.",
  },
  7: {
    tr: 'Yaz sezonu açıldı; enerjik opening’ler ve tatil maratonları.',
    en: 'Summer season is here — energetic openings and holiday marathons.',
    ja: '夏シーズン開幕——エネルギッシュなOPと休暇マラソン。',
    fr: "La saison d'été est là — openings énergiques et marathons de vacances.",
  },
  8: {
    tr: 'Yaz ortası — uzun bir anime gecesi için ideal.',
    en: 'Mid-summer — ideal for a long anime night.',
    ja: '夏の半ば——長いアニメナイトに最適。',
    fr: "Mi-été — idéal pour une longue nuit d'anime.",
  },
  9: {
    tr: 'Güz hazırlığı: sezon finalleri ve yeni meraklar.',
    en: 'Autumn prep: season finales and new curiosities.',
    ja: '秋の準備：シーズン終盤と新たな好奇心。',
    fr: "Préparation de l'automne : fins de saison et nouvelles curiosités.",
  },
  10: {
    tr: 'Güz sezonu başlıyor; karanlık ve sıcak hikâyeler.',
    en: 'Autumn season begins — dark and cozy stories.',
    ja: '秋シーズン開幕——暗くて温かい物語。',
    fr: "La saison d'automne commence — des histoires sombres et chaleureuses.",
  },
  11: {
    tr: 'Güz ortası — battaniye altında bölüm biriktirme zamanı.',
    en: 'Mid-autumn — time to stock up episodes under a blanket.',
    ja: '秋の半ば——毛布の下でエピソードを溜める時期。',
    fr: "Mi-automne — le moment d'accumuler des épisodes sous un plaid.",
  },
  12: {
    tr: 'Kış hazırlığı: yıl sonu listeleri ve yılbaşı maratonları.',
    en: 'Winter prep: year-end lists and holiday marathons.',
    ja: '冬の準備：年末リストとホリデーマラソン。',
    fr: "Préparation de l'hiver : listes de fin d'année et marathons des fêtes.",
  },
};

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function getLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function getMonthDayKey(date = new Date()): string {
  return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function getDayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000) + 1;
}

export function getDailyMaarif(date = new Date()): DailyMaarif {
  const quote = ANIME_QUOTES[getDayOfYear(date) % ANIME_QUOTES.length];
  const monthDay = getMonthDayKey(date);
  const event = OTAKU_ON_THIS_DAY.find((entry) => entry.date === monthDay) ?? null;
  const seasonNote = SEASON_NOTES[date.getMonth() + 1] ?? SEASON_NOTES[1];
  return {
    dateKey: getLocalDateKey(date),
    monthDay,
    quote,
    event,
    seasonNote,
  };
}

export function pickLocalized<T extends Record<QuoteLang, string>>(value: T, lang: string): string {
  const key = (['tr', 'en', 'ja', 'fr'].includes(lang) ? lang : 'en') as QuoteLang;
  return value[key] || value.en;
}
