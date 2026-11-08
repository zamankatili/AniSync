/**
 * Anime/Manga evrenleri (8 Milyar Evrende 1 oyunu için)
 * Her evren, farklı yaşam beklentisi, tehlike seviyesi ve olay profiline sahiptir.
 */

export interface AnimeWorld {
  id: string;
  nameTR: string;
  nameEN: string;
  emoji: string;
  themeColor: string; // Tailwind color class
  descriptionTR: string;
  descriptionEN: string;
  lifeExpectancy: [number, number]; // [min, max] years
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  powerSystem: string; // Chakra, Haki, Nen, etc.
  sourceAnime: string[]; // Reference anime
  regionIds: string[];
  // İstatistik oranları (0-1 arası)
  stats: {
    warRate: number;           // Savaş/çatışma oranı
    diseaseRate: number;        // Hastalık/lanet oranı
    povertyRate: number;        // Yoksulluk oranı
    accidentRate: number;       // Kaza oranı
    violenceRate: number;       // Şiddet oranı
    substanceRate: number;      // Madde bağımlılığı oranı
    suicideRate: number;        // İntihar oranı
    powerAwakeningRate: number; // Güç uyanışı oranı (anime'ye özgü)
    adventureRate: number;      // Macera/görev oranı (anime'ye özgü)
    deathRate: number;          // Erken ölüm oranı
  };
}

export const ANIME_WORLDS: AnimeWorld[] = [
  {
    id: 'shonen_battle',
    nameTR: 'Shounen Savaş Dünyası',
    nameEN: 'Shounen Battle World',
    emoji: '⚔️',
    themeColor: 'rose',
    descriptionTR: 'Ninja, kılıç ustası ve şeytan avcılarının yaşadığı, sürekli çatışma ve güçlenme odaklı bir dünya. Her gün bir savaş, her gün bir meydan okuma.',
    descriptionEN: 'A world of ninjas, swordmasters and demon hunters, focused on constant conflict and power-ups. Every day a battle, every day a challenge.',
    lifeExpectancy: [25, 45],
    dangerLevel: 'high',
    powerSystem: 'Chakra / Haki / Nen / Lanetli Enerji',
    sourceAnime: ['Naruto', 'One Piece', 'Bleach', 'Jujutsu Kaisen', 'Demon Slayer'],
    regionIds: ['konoha', 'kanton', 'soul_society', 'jujutsu_high'],
    stats: {
      warRate: 0.35,
      diseaseRate: 0.08,
      povertyRate: 0.15,
      accidentRate: 0.12,
      violenceRate: 0.25,
      substanceRate: 0.05,
      suicideRate: 0.03,
      powerAwakeningRate: 0.15,
      adventureRate: 0.40,
      deathRate: 0.20
    }
  },
  {
    id: 'slice_of_life',
    nameTR: 'Huzurlu Yaşam Dünyası',
    nameEN: 'Slice of Life World',
    emoji: '🍵',
    themeColor: 'emerald',
    descriptionTR: 'Huzurlu, barışçıl ve günlük yaşamın güzelliğini kutlayan bir dünya. Kamp, müzik, okul ve dostluk odaklı.',
    descriptionEN: 'A peaceful, tranquil world celebrating the beauty of daily life. Focused on camping, music, school and friendship.',
    lifeExpectancy: [75, 90],
    dangerLevel: 'low',
    powerSystem: 'Yok (Günlük yaşam)',
    sourceAnime: ['Yuru Camp', 'Non Non Biyori', 'Laid-Back Camp', 'K-On!', 'Nichijou'],
    regionIds: ['rural_japan', 'school_town', 'coastal_village'],
    stats: {
      warRate: 0.01,
      diseaseRate: 0.05,
      povertyRate: 0.08,
      accidentRate: 0.03,
      violenceRate: 0.02,
      substanceRate: 0.03,
      suicideRate: 0.01,
      powerAwakeningRate: 0.0,
      adventureRate: 0.10,
      deathRate: 0.02
    }
  },
  {
    id: 'dark_fantasy',
    nameTR: 'Karanlık Fantastik Dünya',
    nameEN: 'Dark Fantasy World',
    emoji: '🗡️',
    themeColor: 'neutral',
    descriptionTR: 'Kaos, ölüm, ihanet ve hayatta kalma mücadelesinin hüküm sürdüğü karanlık bir dünya. Her gün bir savaş, her gün bir kayıp.',
    descriptionEN: 'A dark world ruled by chaos, death, betrayal and survival struggle. Every day a battle, every day a loss.',
    lifeExpectancy: [15, 30],
    dangerLevel: 'extreme',
    powerSystem: 'Büyü / Lanet / İblis Gücü',
    sourceAnime: ['Berserk', 'Attack on Titan', 'Made in Abyss', 'Vinland Saga'],
    regionIds: ['midland', 'paradis', 'the_abyss', 'marley'],
    stats: {
      warRate: 0.55,
      diseaseRate: 0.12,
      povertyRate: 0.30,
      accidentRate: 0.15,
      violenceRate: 0.45,
      substanceRate: 0.10,
      suicideRate: 0.08,
      powerAwakeningRate: 0.05,
      adventureRate: 0.30,
      deathRate: 0.40
    }
  },
  {
    id: 'isekai',
    nameTR: 'Isekai (Başka Dünya) Evreni',
    nameEN: 'Isekai (Another World) Universe',
    emoji: '🌀',
    themeColor: 'purple',
    descriptionTR: 'Modern dünyadan başka bir dünyaya reenkarnasyon veya ışınlanma. Güç sistemleri, maceralar ve kaderin belirsizliği.',
    descriptionEN: 'Reincarnation or teleportation from the modern world to another. Power systems, adventures and the uncertainty of fate.',
    lifeExpectancy: [20, 50],
    dangerLevel: 'medium',
    powerSystem: 'Büyü / Oyun Sistemi / Yetenek Ağacı',
    sourceAnime: ['Re:Zero', 'Konosuba', 'Mushoku Tensei', 'That Time I Got Reincarnated as a Slime'],
    regionIds: ['lugunica', 'axel', 'asura_kingdom'],
    stats: {
      warRate: 0.20,
      diseaseRate: 0.06,
      povertyRate: 0.18,
      accidentRate: 0.08,
      violenceRate: 0.15,
      substanceRate: 0.04,
      suicideRate: 0.05,
      powerAwakeningRate: 0.25,
      adventureRate: 0.45,
      deathRate: 0.15
    }
  },
  {
    id: 'cyberpunk',
    nameTR: 'Cyberpunk / Sci-Fi Dünyası',
    nameEN: 'Cyberpunk / Sci-Fi World',
    emoji: '🤖',
    themeColor: 'cyan',
    descriptionTR: 'Teknoloji, siber suç, yapay zeka ve distopik toplumların hüküm sürdüğü gelecek dünya. İnsan ve makine arasındaki çizgi bulanık.',
    descriptionEN: 'A future world ruled by technology, cybercrime, artificial intelligence and dystopian societies. The line between human and machine is blurred.',
    lifeExpectancy: [40, 65],
    dangerLevel: 'medium',
    powerSystem: 'Sibernetik / Psişik / Teknolojik',
    sourceAnime: ['Cyberpunk: Edgerunners', 'Psycho-Pass', 'Ghost in the Shell', 'Akira'],
    regionIds: ['night_city', 'sibyl_city', 'neo_tokyo'],
    stats: {
      warRate: 0.10,
      diseaseRate: 0.07,
      povertyRate: 0.25,
      accidentRate: 0.09,
      violenceRate: 0.30,
      substanceRate: 0.15,
      suicideRate: 0.06,
      powerAwakeningRate: 0.08,
      adventureRate: 0.20,
      deathRate: 0.12
    }
  },
  {
    id: 'seinen_psych',
    nameTR: 'Seinen / Psikolojik Dünya',
    nameEN: 'Seinen / Psychological World',
    emoji: '🧠',
    themeColor: 'neutral',
    descriptionTR: 'Zeka savaşları, ahlaki ikilemler, psikolojik gerilim ve derin karakter analizlerinin dünyası. Her gün bir satranç hamlesi.',
    descriptionEN: 'A world of intelligence battles, moral dilemmas, psychological thrillers and deep character analysis. Every day a chess move.',
    lifeExpectancy: [30, 55],
    dangerLevel: 'medium',
    powerSystem: 'Zeka / Strateji / Psikoloji',
    sourceAnime: ['Death Note', 'Monster', 'Code Geass', 'Steins;Gate'],
    regionIds: ['tokyo_modern', 'dusseldorf', 'akihabara'],
    stats: {
      warRate: 0.05,
      diseaseRate: 0.04,
      povertyRate: 0.12,
      accidentRate: 0.06,
      violenceRate: 0.18,
      substanceRate: 0.08,
      suicideRate: 0.07,
      powerAwakeningRate: 0.02,
      adventureRate: 0.15,
      deathRate: 0.10
    }
  },
  {
    id: 'romance_drama',
    nameTR: 'Romantik Dram Dünyası',
    nameEN: 'Romance / Drama World',
    emoji: '💖',
    themeColor: 'pink',
    descriptionTR: 'Duygusal yolculuklar, aşk, kayıp ve insan ilişkilerinin derinlemesine işlendiği bir dünya. Gözyaşı ve mutluluk bir arada.',
    descriptionEN: 'A world where emotional journeys, love, loss and human relationships are explored in depth. Tears and happiness together.',
    lifeExpectancy: [60, 80],
    dangerLevel: 'low',
    powerSystem: 'Yok (Duygusal)',
    sourceAnime: ['Clannad', 'Your Lie in April', 'Toradora', 'Violet Evergarden'],
    regionIds: ['hikarizaka', 'shigatsu_town', 'leiden'],
    stats: {
      warRate: 0.01,
      diseaseRate: 0.06,
      povertyRate: 0.10,
      accidentRate: 0.04,
      violenceRate: 0.03,
      substanceRate: 0.02,
      suicideRate: 0.03,
      powerAwakeningRate: 0.0,
      adventureRate: 0.08,
      deathRate: 0.04
    }
  },
  {
    id: 'sports',
    nameTR: 'Spor Dünyası',
    nameEN: 'Sports World',
    emoji: '🏐',
    themeColor: 'amber',
    descriptionTR: 'Takım ruhu, azim ve rekabetin hüküm sürdüğü spor dünyası. Voleybol, futbol, basketbol ve daha fazlası.',
    descriptionEN: 'A sports world ruled by team spirit, determination and competition. Volleyball, football, basketball and more.',
    lifeExpectancy: [70, 85],
    dangerLevel: 'low',
    powerSystem: 'Yok (Fiziksel)',
    sourceAnime: ['Haikyuu!!', 'Kuroko no Basket', 'Blue Lock', 'Hajime no Ippo'],
    regionIds: ['karasuno', 'seirin', 'blue_lock', 'kamogawa'],
    stats: {
      warRate: 0.01,
      diseaseRate: 0.03,
      povertyRate: 0.06,
      accidentRate: 0.05,
      violenceRate: 0.02,
      substanceRate: 0.01,
      suicideRate: 0.01,
      powerAwakeningRate: 0.0,
      adventureRate: 0.05,
      deathRate: 0.02
    }
  }
];

export const getWorldById = (id: string): AnimeWorld | undefined =>
  ANIME_WORLDS.find(w => w.id === id);

export const getWorldsByDangerLevel = (level: AnimeWorld['dangerLevel']): AnimeWorld[] =>
  ANIME_WORLDS.filter(w => w.dangerLevel === level);

export const WORLD_COLORS: Record<string, string> = {
  shonen_battle: 'rose',
  slice_of_life: 'emerald',
  dark_fantasy: 'neutral',
  isekai: 'purple',
  cyberpunk: 'cyan',
  seinen_psych: 'neutral',
  romance_drama: 'pink',
  sports: 'amber'
};