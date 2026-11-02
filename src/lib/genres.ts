export interface GenreOption {
  id: string;
  tr: string;
  hint?: string;
}

export const GENRE_OPTIONS: GenreOption[] = [
  { id: 'Action', tr: 'Aksiyon' },
  { id: 'Adventure', tr: 'Macera' },
  { id: 'Fantasy', tr: 'Fantastik' },
  { id: 'Romance', tr: 'Romantizm' },
  { id: 'Drama', tr: 'Dram' },
  { id: 'Comedy', tr: 'Komedi' },
  { id: 'Mystery', tr: 'Gizem' },
  { id: 'Sci-Fi', tr: 'Bilim Kurgu' },
  { id: 'Slice of Life', tr: 'Gündelik' },
  { id: 'Horror', tr: 'Korku' },
  { id: 'Psychological', tr: 'Psikolojik' },
  { id: 'Sports', tr: 'Spor' },
  { id: 'Supernatural', tr: 'Doğaüstü' },
  { id: 'Music', tr: 'Müzik' },
];

const TR_BY_ID = new Map(GENRE_OPTIONS.map((g) => [g.id.toLowerCase(), g.tr]));

const TR_TO_ID = new Map(GENRE_OPTIONS.map((g) => [g.tr.toLowerCase(), g.id.toLowerCase()]));

/** Kaynaktan gelen tür adını Türkçe etikete çevirir. */
export function genreLabel(raw: string): string {
  const key = raw.toLowerCase();
  if (TR_BY_ID.has(key)) return TR_BY_ID.get(key)!;
  if (TR_TO_ID.has(key)) return raw;
  const known: Record<string, string> = {
    'slice of life': 'Gündelik',
    'sci-fi': 'Bilim Kurgu',
    'science fiction': 'Bilim Kurgu',
    'coming of age': 'Büyüme',
    'video game': 'Oyun',
    'visual novel': 'Visual Novel',
    'action rpg': 'Aksiyon RPG',
    'jrpg': 'JRPG',
    'co-op': 'Co-op',
    'roguelike': 'Roguelike',
    'metroidvania': 'Metroidvania',
    'açık dünya': 'Açık Dünya',
    'sıra tabanlı': 'Sıra Tabanlı',
    'rahat': 'Rahat',
    'zorlu': 'Zorlu',
    'hikâye': 'Hikâye',
    'felsefi': 'Felsefi',
    'klasik': 'Klasik',
    'psikolojik': 'Psikolojik',
    'western': 'Western',
    'macera': 'Macera',
    'atipik': 'Atipik',
    'diyalog': 'Diyalog',
    'keşif': 'Keşif',
    'bulmaca': 'Bulmaca',
    'indie': 'Indie',
    'simülasyon': 'Simülasyon',
    'yarış': 'Yarış',
    'kart': 'Kart',
    'korku': 'Korku',
    'şans': 'Şans',
    'survival': 'Survival',
    'sandbox': 'Sandbox',
    'yönetim': 'Yönetim',
    'fantastik': 'Fantastik',
    'bilim kurgu': 'Bilim Kurgu',
    'gizem': 'Gizem',
    'dram': 'Dram',
  };
  return known[key] ?? raw;
}

/** Öneri motorunda eşleştirme için türü normalize eder (iki dilde de çalışır). */
export function genreKey(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (TR_TO_ID.has(key)) return TR_TO_ID.get(key)!;
  return key;
}

export const matchGenres = (wanted: string[], candidate: string[]): number => {
  const set = new Set(wanted.map(genreKey));
  return candidate.reduce((acc, g) => acc + (set.has(genreKey(g)) ? 1 : 0), 0);
};
