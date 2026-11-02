import type { Atmos, AtmosId, MediaType, ShelfStatus } from './types';

export const MAX_LEVEL = 30;

/** Bir seviyeye ulaşmak için gereken toplam XP */
export const xpToReach = (level: number): number => 25 * (level - 1) * level;

export function levelFromXp(xp: number): number {
  let lvl = 1;
  while (lvl < MAX_LEVEL && xp >= xpToReach(lvl + 1)) lvl += 1;
  return lvl;
}

export function levelProgress(xp: number) {
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

const RANKS: Array<{ from: number; name: string; line: string }> = [
  { from: 1, name: 'Misafir', line: 'Kapıdan yeni girdin, çayı biz ısmarlarız.' },
  { from: 3, name: 'Müdavim', line: 'Artık masanın nerede olduğunu biliyorsun.' },
  { from: 5, name: 'Kalfa', line: 'Rafı düzenliyorsun, önerilerin dinleniyor.' },
  { from: 7, name: 'Usta', line: 'Mekânın hafızası senden soruluyor.' },
  { from: 10, name: 'Mekân Sahibi', line: 'Lambaları sen yakıyorsun.' },
  { from: 15, name: 'Efsane', line: 'Hikâyen duvarlara yazıldı.' },
];

export function rankFor(level: number) {
  let current = RANKS[0];
  for (const r of RANKS) if (level >= r.from) current = r;
  const next = RANKS.find((r) => r.from > level);
  return { name: current.name, line: current.line, nextAt: next?.from ?? null, nextName: next?.name ?? null };
}

export const ATMOSPHERES: Atmos[] = [
  {
    id: 'klasik',
    name: 'AniSync Klasik',
    tagline: 'Her şeyin başladığı yer: siyah, beyaz, kırmızı.',
    description:
      'Platformun temel görünümü ve v1 kimliği. Kalın çizgiler, sert gölgeler, yüksek kontrast. İlk günden itibaren buradasın.',
    unlockLevel: 1,
    icon: '🟥',
    swatches: ['#e11d48', '#ffffff', '#050505'],
    scene:
      'Eski bir afiş duvarı gibi: posterler üst üste yapıştırılmış, kenarları yıpranmış. Gürültülü ama tanıdık.',
  },
  {
    id: 'cay',
    name: 'Gece Çay Evi',
    tagline: 'Lamba açık, çay sıcak, kapı hep aralık.',
    description:
      'Platformun sıcak odası. Ahşap masalar, düşük ışık, duvarda elle yazılmış notlar. Seviye 2’de açılır.',
    unlockLevel: 2,
    icon: '🫖',
    swatches: ['#eda85a', '#e07a5f', '#241a16'],
    scene:
      'Kapıdan girdiğinde önce çay kokusu gelir. Solda raflar, sağda bir lamba, ortada uzun bir masa. Kimse kimseyi rahatsız etmez ama kimse de yalnız değildir.',
  },
  {
    id: 'sinema',
    name: 'Mahalle Sineması',
    tagline: 'Perde açılıyor, ışıklar kısılıyor.',
    description:
      'Kadife koltuklar, sararmış biletler, arka sırada fısıltılar. Seviye 4’te açılır. Watch party akşamları için biçilmiş kaftan.',
    unlockLevel: 4,
    icon: '🎟️',
    swatches: ['#e8c07a', '#d94a3d', '#140d0d'],
    scene:
      'Nostaljik bir yaz sineması. Makine hâlâ 35mm ile çalışıyor, perdede toz izleri var. Kimse telefonuna bakmıyor.',
  },
  {
    id: 'kutuphane',
    name: 'Kağıt & Mürekkep',
    tagline: 'Sessizlik de bir sohbettir.',
    description:
      'Aydınlık okuma salonu; manga panelleri, ciltlenmiş noveller, kenarı notlu sayfalar. Seviye 7’de açılır.',
    unlockLevel: 7,
    icon: '📖',
    swatches: ['#8c2f39', '#3f5b4a', '#f1e7d5'],
    scene:
      'Yüksek tavanlı bir okuma odası. Pencereden öğleden sonra ışığı giriyor, masada açık bir defter ve soğumuş kahve.',
  },
];

export const atmosById = (id: AtmosId): Atmos => ATMOSPHERES.find((a) => a.id === id) ?? ATMOSPHERES[0];

export const totalUnlocked = (level: number): Atmos[] => ATMOSPHERES.filter((a) => level >= a.unlockLevel);

export const STATUS_LABELS: Record<ShelfStatus, string> = {
  active: 'Devam ediyor',
  planned: 'Sırada',
  done: 'Bitti',
  paused: 'Arada',
  dropped: 'Bıraktım',
};

export const statusLabel = (status: ShelfStatus, type: MediaType): string => {
  if (status === 'active') {
    return type === 'anime' ? 'İzliyorum' : type === 'manga' ? 'Okuyorum' : type === 'novel' ? 'Okuyorum' : 'Oynuyorum';
  }
  if (status === 'done') {
    return type === 'game' ? 'Bitirdim' : 'Bitirdim';
  }
  return STATUS_LABELS[status];
};

export const STATUSES: ShelfStatus[] = ['active', 'planned', 'paused', 'done', 'dropped'];

export const MEDIA_LABELS: Record<MediaType, string> = {
  anime: 'Anime',
  manga: 'Manga',
  novel: 'Novel',
  game: 'Oyun',
};

export const XP = {
  visit: 10,
  addShelf: 15,
  progress: 4,
  complete: 40,
  post: 20,
  reply: 8,
  joinClub: 12,
  score: 6,
  favorite: 5,
  dailyQuestion: 18,
} as const;
