/**
 * Anime/Manga evrenlerindeki bölgeler (8 Milyar Evrende 1 oyunu için)
 * Her evren kendi bölgesel istatistiklerine sahiptir.
 */

export interface AnimeRegion {
  id: string;
  worldId: string;
  nameTR: string;
  nameEN: string;
  emoji: string;
  population: number; // Evrensel nüfus (sembolik)
  birthRate: number;  // Yıllık doğum oranı (0-1)
  lifeExpectancy: [number, number];
  stats: {
    warRate: number;
    diseaseRate: number;
    povertyRate: number;
    accidentRate: number;
    violenceRate: number;
    substanceRate: number;
    suicideRate: number;
    powerAwakeningRate: number;
    adventureRate: number;
    deathRate: number;
  };
  descriptionTR: string;
  descriptionEN: string;
}

export const ANIME_REGIONS: AnimeRegion[] = [
  // Shounen Battle World
  {
    id: 'konoha',
    worldId: 'shonen_battle',
    nameTR: 'Konoha (Gizli Yaprak Köyü)',
    nameEN: 'Konoha (Hidden Leaf Village)',
    emoji: '🍃',
    population: 50000,
    birthRate: 0.025,
    lifeExpectancy: [30, 50],
    stats: { warRate: 0.20, diseaseRate: 0.05, povertyRate: 0.10, accidentRate: 0.08, violenceRate: 0.15, substanceRate: 0.03, suicideRate: 0.02, powerAwakeningRate: 0.30, adventureRate: 0.50, deathRate: 0.12 },
    descriptionTR: 'Naruto evrenindeki Konoha köyü. Ninja akademisi, Chuunin sınavları ve büyük savaşlarla dolu bir yaşam.',
    descriptionEN: 'Konoha village in the Naruto universe. A life filled with ninja academy, Chuunin exams and great wars.'
  },
  {
    id: 'kanton',
    worldId: 'shonen_battle',
    nameTR: 'Kanton (Korsanlar Denizi)',
    nameEN: 'East Blue (Pirate Sea)',
    emoji: '🏴‍☠️',
    population: 100000,
    birthRate: 0.030,
    lifeExpectancy: [35, 55],
    stats: { warRate: 0.30, diseaseRate: 0.08, povertyRate: 0.20, accidentRate: 0.10, violenceRate: 0.25, substanceRate: 0.06, suicideRate: 0.02, powerAwakeningRate: 0.10, adventureRate: 0.60, deathRate: 0.15 },
    descriptionTR: 'One Piece evrenindeki Doğu Denizi. Korsanlar, Denizci ve Devrimciler arasındaki çatışma.',
    descriptionEN: 'East Blue in the One Piece universe. Conflict between Pirates, Marines and Revolutionaries.'
  },
  {
    id: 'soul_society',
    worldId: 'shonen_battle',
    nameTR: 'Ruhlar Dünyası (Soul Society)',
    nameEN: 'Soul Society',
    emoji: '⚔️',
    population: 80000,
    birthRate: 0.015,
    lifeExpectancy: [50, 80],
    stats: { warRate: 0.25, diseaseRate: 0.03, povertyRate: 0.05, accidentRate: 0.05, violenceRate: 0.20, substanceRate: 0.02, suicideRate: 0.01, powerAwakeningRate: 0.20, adventureRate: 0.35, deathRate: 0.08 },
    descriptionTR: 'Bleach evrenindeki Ruhlar Dünyası. Shinigami akademisi, Hollow saldırıları ve ruh temizleme görevleri.',
    descriptionEN: 'Soul Society in the Bleach universe. Shinigami academy, Hollow attacks and soul cleansing missions.'
  },
  {
    id: 'marley',
    worldId: 'shonen_battle',
    nameTR: 'Marley (Devler Ülkesi)',
    nameEN: 'Marley (Land of Titans)',
    emoji: 'Titan',
    population: 200000,
    birthRate: 0.020,
    lifeExpectancy: [20, 35],
    stats: { warRate: 0.45, diseaseRate: 0.06, povertyRate: 0.25, accidentRate: 0.10, violenceRate: 0.40, substanceRate: 0.04, suicideRate: 0.05, powerAwakeningRate: 0.08, adventureRate: 0.25, deathRate: 0.30 },
    descriptionTR: 'Attack on Titan evrenindeki Marley. Dev istilası, askeri disiplin ve karanlık savaş ortamı.',
    descriptionEN: 'Marley in the Attack on Titan universe. Titan invasion, military discipline and dark war environment.'
  },
  {
    id: 'jujutsu_high',
    worldId: 'shonen_battle',
    nameTR: 'Jujutsu Lisesi (Büyücü Okulu)',
    nameEN: 'Jujutsu High (Sorcerer School)',
    emoji: '🔮',
    population: 1000,
    birthRate: 0.010,
    lifeExpectancy: [25, 40],
    stats: { warRate: 0.40, diseaseRate: 0.04, povertyRate: 0.05, accidentRate: 0.08, violenceRate: 0.35, substanceRate: 0.02, suicideRate: 0.03, powerAwakeningRate: 0.25, adventureRate: 0.50, deathRate: 0.25 },
    descriptionTR: 'Jujutsu Kaisen evrenindeki Jujutsu Lisesi. Lanetlerle dolu, güçlü büyücülerin yetiştiği elit okul.',
    descriptionEN: 'Jujutsu High in the Jujutsu Kaisen universe. An elite school where powerful sorcerers are trained, filled with curses.'
  },

  // Slice of Life World
  {
    id: 'rural_japan',
    worldId: 'slice_of_life',
    nameTR: 'Kırsal Japonya',
    nameEN: 'Rural Japan',
    emoji: '🏔️',
    population: 5000,
    birthRate: 0.008,
    lifeExpectancy: [80, 90],
    stats: { warRate: 0.0, diseaseRate: 0.03, povertyRate: 0.05, accidentRate: 0.02, violenceRate: 0.01, substanceRate: 0.02, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.15, deathRate: 0.01 },
    descriptionTR: 'Yuru Camp ve Non Non Biyori tarzı kırsal Japonya. Huzurlu, sakin, doğayla iç içe bir yaşam.',
    descriptionEN: 'Rural Japan in the style of Yuru Camp and Non Non Biyori. A peaceful, calm life in nature.'
  },
  {
    id: 'school_town',
    worldId: 'slice_of_life',
    nameTR: 'Okul Kasabası',
    nameEN: 'School Town',
    emoji: '🏫',
    population: 20000,
    birthRate: 0.012,
    lifeExpectancy: [75, 85],
    stats: { warRate: 0.0, diseaseRate: 0.04, povertyRate: 0.06, accidentRate: 0.03, violenceRate: 0.02, substanceRate: 0.02, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.10, deathRate: 0.01 },
    descriptionTR: 'K-On ve Nichijou tarzı okul kasabası. Müzik kulübü, komedi ve günlük yaşam.',
    descriptionEN: 'A school town in the style of K-On and Nichijou. Music club, comedy and daily life.'
  },
  {
    id: 'coastal_village',
    worldId: 'slice_of_life',
    nameTR: 'Kıyı Kasabası',
    nameEN: 'Coastal Village',
    emoji: '🌊',
    population: 8000,
    birthRate: 0.010,
    lifeExpectancy: [78, 88],
    stats: { warRate: 0.0, diseaseRate: 0.03, povertyRate: 0.04, accidentRate: 0.02, violenceRate: 0.01, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.12, deathRate: 0.01 },
    descriptionTR: 'Deniz kenarında huzurlu bir kasaba. Balıkçılık, yaz festivalleri ve sakin bir yaşam.',
    descriptionEN: 'A peaceful coastal town. Fishing, summer festivals and a tranquil life.'
  },

  // Dark Fantasy World
  {
    id: 'midland',
    worldId: 'dark_fantasy',
    nameTR: 'Midland (Berserk)',
    nameEN: 'Midland (Berserk)',
    emoji: '🗡️',
    population: 500000,
    birthRate: 0.025,
    lifeExpectancy: [15, 25],
    stats: { warRate: 0.60, diseaseRate: 0.15, povertyRate: 0.40, accidentRate: 0.12, violenceRate: 0.55, substanceRate: 0.12, suicideRate: 0.10, powerAwakeningRate: 0.03, adventureRate: 0.20, deathRate: 0.45 },
    descriptionTR: 'Berserk evrenindeki Midland. Savaş, iblisler, kader ve hayatta kalma mücadelesi.',
    descriptionEN: 'Midland in the Berserk universe. War, demons, fate and the struggle for survival.'
  },
  {
    id: 'paradis',
    worldId: 'dark_fantasy',
    nameTR: 'Paradis Adası (AOT)',
    nameEN: 'Paradis Island (AOT)',
    emoji: '🏰',
    population: 1000000,
    birthRate: 0.020,
    lifeExpectancy: [20, 35],
    stats: { warRate: 0.50, diseaseRate: 0.08, povertyRate: 0.20, accidentRate: 0.08, violenceRate: 0.45, substanceRate: 0.05, suicideRate: 0.06, powerAwakeningRate: 0.05, adventureRate: 0.25, deathRate: 0.35 },
    descriptionTR: 'Attack on Titan evrenindeki Paradis Adası. Devler, duvarlar ve hayatta kalma mücadelesi.',
    descriptionEN: 'Paradis Island in the Attack on Titan universe. Titans, walls and the struggle for survival.'
  },
  {
    id: 'the_abyss',
    worldId: 'dark_fantasy',
    nameTR: 'Uçurum (Made in Abyss)',
    nameEN: 'The Abyss (Made in Abyss)',
    emoji: '🕳️',
    population: 5000,
    birthRate: 0.010,
    lifeExpectancy: [10, 20],
    stats: { warRate: 0.30, diseaseRate: 0.20, povertyRate: 0.35, accidentRate: 0.25, violenceRate: 0.40, substanceRate: 0.08, suicideRate: 0.05, powerAwakeningRate: 0.02, adventureRate: 0.60, deathRate: 0.50 },
    descriptionTR: 'Made in Abyss evrenindeki Uçurum. Derin katmanlar, lanetler ve keşif maceraları.',
    descriptionEN: 'The Abyss in the Made in Abyss universe. Deep layers, curses and exploration adventures.'
  },

  // Isekai World
  {
    id: 'lugunica',
    worldId: 'isekai',
    nameTR: 'Lugunica Krallığı',
    nameEN: 'Kingdom of Lugunica',
    emoji: '🏰',
    population: 500000,
    birthRate: 0.022,
    lifeExpectancy: [30, 50],
    stats: { warRate: 0.25, diseaseRate: 0.07, povertyRate: 0.20, accidentRate: 0.06, violenceRate: 0.18, substanceRate: 0.04, suicideRate: 0.06, powerAwakeningRate: 0.20, adventureRate: 0.40, deathRate: 0.18 },
    descriptionTR: 'Re:Zero evrenindeki Lugunica Krallığı. Politik entrikalar, cadı kültü ve zaman döngüleri.',
    descriptionEN: 'Kingdom of Lugunica in the Re:Zero universe. Political intrigues, witch cult and time loops.'
  },
  {
    id: 'axel',
    worldId: 'isekai',
    nameTR: 'Axel Şehri',
    nameEN: 'Axel Town',
    emoji: '🛡️',
    population: 50000,
    birthRate: 0.018,
    lifeExpectancy: [40, 60],
    stats: { warRate: 0.10, diseaseRate: 0.05, povertyRate: 0.15, accidentRate: 0.05, violenceRate: 0.10, substanceRate: 0.03, suicideRate: 0.02, powerAwakeningRate: 0.15, adventureRate: 0.50, deathRate: 0.08 },
    descriptionTR: 'Konosuba evrenindeki Axel. Maceracı şehri, düşük seviye görevler ve komedi dolu bir yaşam.',
    descriptionEN: 'Axel town in the Konosuba universe. Adventurer town, low-level quests and a comedic life.'
  },
  {
    id: 'asura_kingdom',
    worldId: 'isekai',
    nameTR: 'Asura Krallığı',
    nameEN: 'Asura Kingdom',
    emoji: '⚔️',
    population: 1000000,
    birthRate: 0.020,
    lifeExpectancy: [35, 55],
    stats: { warRate: 0.20, diseaseRate: 0.06, povertyRate: 0.18, accidentRate: 0.07, violenceRate: 0.15, substanceRate: 0.04, suicideRate: 0.03, powerAwakeningRate: 0.22, adventureRate: 0.45, deathRate: 0.12 },
    descriptionTR: 'Mushoku Tensei evrenindeki Asura Krallığı. Büyü akademisi, soylu entrikaları ve kaderin belirsizliği.',
    descriptionEN: 'Asura Kingdom in the Mushoku Tensei universe. Magic academy, noble intrigues and the uncertainty of fate.'
  },

  // Cyberpunk World
  {
    id: 'night_city',
    worldId: 'cyberpunk',
    nameTR: 'Night City',
    nameEN: 'Night City',
    emoji: '🌃',
    population: 1000000,
    birthRate: 0.015,
    lifeExpectancy: [35, 55],
    stats: { warRate: 0.08, diseaseRate: 0.09, povertyRate: 0.35, accidentRate: 0.12, violenceRate: 0.40, substanceRate: 0.20, suicideRate: 0.08, powerAwakeningRate: 0.05, adventureRate: 0.25, deathRate: 0.18 },
    descriptionTR: 'Cyberpunk Edgerunners evrenindeki Night City. Çeteler, megacorp\'lar ve siberpsikoz.',
    descriptionEN: 'Night City in the Cyberpunk Edgerunners universe. Gangs, megacorps and cyberpsychosis.'
  },
  {
    id: 'sibyl_city',
    worldId: 'cyberpunk',
    nameTR: 'Sibyl Şehri',
    nameEN: 'Sibyl City',
    emoji: '🔍',
    population: 2000000,
    birthRate: 0.012,
    lifeExpectancy: [50, 70],
    stats: { warRate: 0.05, diseaseRate: 0.04, povertyRate: 0.10, accidentRate: 0.06, violenceRate: 0.15, substanceRate: 0.08, suicideRate: 0.05, powerAwakeningRate: 0.03, adventureRate: 0.15, deathRate: 0.08 },
    descriptionTR: 'Psycho-Pass evrenindeki Sibyl Şehri. Suç katsayısı, Dominatör ve adalet sistemi.',
    descriptionEN: 'Sibyl City in the Psycho-Pass universe. Crime coefficient, Dominator and justice system.'
  },
  {
    id: 'neo_tokyo',
    worldId: 'cyberpunk',
    nameTR: 'Neo-Tokyo',
    nameEN: 'Neo-Tokyo',
    emoji: '🏙️',
    population: 3000000,
    birthRate: 0.010,
    lifeExpectancy: [40, 60],
    stats: { warRate: 0.12, diseaseRate: 0.06, povertyRate: 0.20, accidentRate: 0.10, violenceRate: 0.25, substanceRate: 0.12, suicideRate: 0.07, powerAwakeningRate: 0.04, adventureRate: 0.18, deathRate: 0.10 },
    descriptionTR: 'Akira evrenindeki Neo-Tokyo. Motor çeteleri, psikik güçler ve distopik gelecek.',
    descriptionEN: 'Neo-Tokyo in the Akira universe. Biker gangs, psychic powers and dystopian future.'
  },

  // Seinen / Psychological World
  {
    id: 'tokyo_modern',
    worldId: 'seinen_psych',
    nameTR: 'Modern Tokyo',
    nameEN: 'Modern Tokyo',
    emoji: 'さまざ',
    population: 14000000,
    birthRate: 0.008,
    lifeExpectancy: [40, 60],
    stats: { warRate: 0.03, diseaseRate: 0.04, povertyRate: 0.12, accidentRate: 0.05, violenceRate: 0.10, substanceRate: 0.06, suicideRate: 0.06, powerAwakeningRate: 0.0, adventureRate: 0.08, deathRate: 0.08 },
    descriptionTR: 'Death Note ve Monster evrenindeki modern Tokyo. Zeka savaşları, ahlaki ikilemler ve gizli güçler.',
    descriptionEN: 'Modern Tokyo in the Death Note and Monster universe. Intelligence battles, moral dilemmas and hidden powers.'
  },
  {
    id: 'dusseldorf',
    worldId: 'seinen_psych',
    nameTR: 'Düsseldorf (1980\'ler)',
    nameEN: 'Düsseldorf (1980s)',
    emoji: '🔍',
    population: 500000,
    birthRate: 0.007,
    lifeExpectancy: [35, 50],
    stats: { warRate: 0.02, diseaseRate: 0.05, povertyRate: 0.15, accidentRate: 0.04, violenceRate: 0.12, substanceRate: 0.09, suicideRate: 0.07, powerAwakeningRate: 0.0, adventureRate: 0.10, deathRate: 0.10 },
    descriptionTR: 'Monster evrenindeki Düsseldorf. Seri katiller, psikolojik gerilim ve ahlaki sorgulama.',
    descriptionEN: 'Düsseldorf in the Monster universe. Serial killers, psychological thriller and moral questioning.'
  },
  {
    id: 'akihabara',
    worldId: 'seinen_psych',
    nameTR: 'Akihabara (Otaku Bölgesi)',
    nameEN: 'Akihabara (Otaku District)',
    emoji: '🎮',
    population: 100000,
    birthRate: 0.006,
    lifeExpectancy: [45, 65],
    stats: { warRate: 0.01, diseaseRate: 0.03, povertyRate: 0.10, accidentRate: 0.03, violenceRate: 0.05, substanceRate: 0.05, suicideRate: 0.04, powerAwakeningRate: 0.0, adventureRate: 0.06, deathRate: 0.06 },
    descriptionTR: 'Steins;Gate ve otaku kültürü evreni. Zaman yolculuğu, teknoloji ve günlük yaşam.',
    descriptionEN: 'Steins;Gate and otaku culture universe. Time travel, technology and daily life.'
  },

  // Romance / Drama World
  {
    id: 'hikarizaka',
    worldId: 'romance_drama',
    nameTR: 'Hikarizaka (Clannad)',
    nameEN: 'Hikarizaka (Clannad)',
    emoji: '🌸',
    population: 30000,
    birthRate: 0.012,
    lifeExpectancy: [65, 80],
    stats: { warRate: 0.0, diseaseRate: 0.08, povertyRate: 0.08, accidentRate: 0.04, violenceRate: 0.02, substanceRate: 0.02, suicideRate: 0.02, powerAwakeningRate: 0.0, adventureRate: 0.05, deathRate: 0.03 },
    descriptionTR: 'Clannad evrenindeki Hikarizaka. Aile, dostluk ve duygusal yolculuk.',
    descriptionEN: 'Hikarizaka in the Clannad universe. Family, friendship and emotional journey.'
  },
  {
    id: 'shigatsu_town',
    worldId: 'romance_drama',
    nameTR: 'Shigatsu Kasabası',
    nameEN: 'Shigatsu Town',
    emoji: '🎹',
    population: 20000,
    birthRate: 0.010,
    lifeExpectancy: [68, 82],
    stats: { warRate: 0.0, diseaseRate: 0.07, povertyRate: 0.06, accidentRate: 0.03, violenceRate: 0.01, substanceRate: 0.01, suicideRate: 0.02, powerAwakeningRate: 0.0, adventureRate: 0.04, deathRate: 0.02 },
    descriptionTR: 'Your Lie in April evreni. Müzik, aşk ve kayıp.',
    descriptionEN: 'Your Lie in April universe. Music, love and loss.'
  },
  {
    id: 'leiden',
    worldId: 'romance_drama',
    nameTR: 'Leiden (Violet Evergarden)',
    nameEN: 'Leiden (Violet Evergarden)',
    emoji: '✉️',
    population: 15000,
    birthRate: 0.009,
    lifeExpectancy: [60, 75],
    stats: { warRate: 0.05, diseaseRate: 0.06, povertyRate: 0.07, accidentRate: 0.03, violenceRate: 0.03, substanceRate: 0.02, suicideRate: 0.02, powerAwakeningRate: 0.0, adventureRate: 0.06, deathRate: 0.03 },
    descriptionTR: 'Violet Evergarden evrenindeki Leiden. Mektuplar, duygular ve savaş sonrası iyileşme.',
    descriptionEN: 'Leiden in the Violet Evergarden universe. Letters, emotions and post-war healing.'
  },

  // Sports World
  {
    id: 'karasuno',
    worldId: 'sports',
    nameTR: 'Karasuno Lisesi',
    nameEN: 'Karasuno High School',
    emoji: '🏐',
    population: 1500,
    birthRate: 0.015,
    lifeExpectancy: [75, 88],
    stats: { warRate: 0.0, diseaseRate: 0.02, povertyRate: 0.04, accidentRate: 0.04, violenceRate: 0.01, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.04, deathRate: 0.01 },
    descriptionTR: 'Haikyuu evrenindeki Karasuno. Voleybol, takım ruhu ve azim.',
    descriptionEN: 'Karasuno in the Haikyuu universe. Volleyball, team spirit and determination.'
  },
  {
    id: 'seirin',
    worldId: 'sports',
    nameTR: 'Seirin Lisesi',
    nameEN: 'Seirin High School',
    emoji: '🏀',
    population: 1200,
    birthRate: 0.014,
    lifeExpectancy: [76, 89],
    stats: { warRate: 0.0, diseaseRate: 0.02, povertyRate: 0.04, accidentRate: 0.03, violenceRate: 0.01, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.04, deathRate: 0.01 },
    descriptionTR: 'Kuroko no Basket evrenindeki Seirin. Basketbol, takım oyunu ve azim.',
    descriptionEN: 'Seirin in the Kuroko no Basket universe. Basketball, team play and determination.'
  },
  {
    id: 'blue_lock',
    worldId: 'sports',
    nameTR: 'Blue Lock Tesisleri',
    nameEN: 'Blue Lock Facility',
    emoji: '⚽',
    population: 300,
    birthRate: 0.010,
    lifeExpectancy: [70, 85],
    stats: { warRate: 0.0, diseaseRate: 0.02, povertyRate: 0.03, accidentRate: 0.05, violenceRate: 0.02, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.03, deathRate: 0.01 },
    descriptionTR: 'Blue Lock evrenindeki tesis. Egoist futbol, forvet eğitimi ve hayatta kalma.',
    descriptionEN: 'Blue Lock facility in the Blue Lock universe. Egoist football, striker training and survival.'
  },
  {
    id: 'kamogawa',
    worldId: 'sports',
    nameTR: 'Kamogawa Boks Salonu',
    nameEN: 'Kamogawa Boxing Gym',
    emoji: '🥊',
    population: 50,
    birthRate: 0.008,
    lifeExpectancy: [72, 86],
    stats: { warRate: 0.0, diseaseRate: 0.02, povertyRate: 0.03, accidentRate: 0.04, violenceRate: 0.02, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.03, deathRate: 0.01 },
    descriptionTR: 'Hajime no Ippo evrenindeki Kamogawa salonu. Boks, azim ve makivara antrenmanları.',
    descriptionEN: 'Kamogawa gym in the Hajime no Ippo universe. Boxing, determination and makivara training.'
  }
];

export const getRegionById = (id: string): AnimeRegion | undefined =>
  ANIME_REGIONS.find(r => r.id === id);

export const getRegionsByWorld = (worldId: string): AnimeRegion[] =>
  ANIME_REGIONS.filter(r => r.worldId === worldId);

export const REGION_COLORS: Record<string, string> = {
  konoha: 'emerald',
  kanton: 'rose',
  soul_society: 'purple',
  marley: 'neutral',
  jujutsu_high: 'cyan',
  rural_japan: 'emerald',
  school_town: 'amber',
  coastal_village: 'cyan',
  midland: 'neutral',
  paradis: 'rose',
  the_abyss: 'neutral',
  lugunica: 'purple',
  axel: 'amber',
  asura_kingdom: 'rose',
  night_city: 'cyan',
  sibyl_city: 'neutral',
  neo_tokyo: 'rose',
  tokyo_modern: 'cyan',
  dusseldorf: 'neutral',
  akihabara: 'amber',
  hikarizaka: 'pink',
  shigatsu_town: 'pink',
  leiden: 'amber',
  karasuno: 'amber',
  seirin: 'cyan',
  blue_lock: 'rose',
  kamogawa: 'neutral'
};