/**
 * Anime/Manga evrenlerindeki bölgeler (8 Milyar Evrende 1 oyunu için)
 * Her evren kendi bölgesel istatistiklerine sahiptir.
 */

import type { Lang4 } from './universePaths';

export interface AnimeRegion {
  id: string;
  worldId: string;
  nameTR: string;
  nameEN: string;
  /** JA/FR adlar opsiyonel; yoksa İngilizce ada düşer. */
  nameJA?: string;
  nameFR?: string;
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
  descriptionJA?: string;
  descriptionFR?: string;
}

export const ANIME_REGIONS: AnimeRegion[] = [
  // Shounen Battle World
  {
    id: 'konoha',
    worldId: 'shonen_battle',
    nameTR: 'Konoha (Gizli Yaprak Köyü)',
    nameEN: 'Konoha (Hidden Leaf Village)',
    nameJA: '木ノ葉隠れの里',
    nameFR: 'Konoha (Village de la Feuille)',
    emoji: '🍃',
    population: 50000,
    birthRate: 0.025,
    lifeExpectancy: [30, 50],
    stats: { warRate: 0.20, diseaseRate: 0.05, povertyRate: 0.10, accidentRate: 0.08, violenceRate: 0.15, substanceRate: 0.03, suicideRate: 0.02, powerAwakeningRate: 0.30, adventureRate: 0.50, deathRate: 0.12 },
    descriptionTR: 'Naruto evrenindeki Konoha köyü. Ninja akademisi, Chuunin sınavları ve büyük savaşlarla dolu bir yaşam.',
    descriptionEN: 'Konoha village in the Naruto universe. A life filled with ninja academy, Chuunin exams and great wars.',
    descriptionJA: 'ナルトの世界の木ノ葉隠れの里。忍術学校、中忍試験、大きな戦いが待つ忍の人生。',
    descriptionFR: 'Le village de Konoha dans l\'univers Naruto. Une vie remplie d\'académie ninja, d\'examens du Chūnin et de grandes guerres.'
  },
  {
    id: 'kanton',
    worldId: 'shonen_battle',
    nameTR: 'Kanton (Korsanlar Denizi)',
    nameEN: 'East Blue (Pirate Sea)',
    nameJA: '東の海（イーストブルー）',
    nameFR: 'East Blue (mer des pirates)',
    emoji: '🏴‍☠️',
    population: 100000,
    birthRate: 0.030,
    lifeExpectancy: [35, 55],
    stats: { warRate: 0.30, diseaseRate: 0.08, povertyRate: 0.20, accidentRate: 0.10, violenceRate: 0.25, substanceRate: 0.06, suicideRate: 0.02, powerAwakeningRate: 0.10, adventureRate: 0.60, deathRate: 0.15 },
    descriptionTR: 'One Piece evrenindeki Doğu Denizi. Korsanlar, Denizci ve Devrimciler arasındaki çatışma.',
    descriptionEN: 'East Blue in the One Piece universe. Conflict between Pirates, Marines and Revolutionaries.',
    descriptionJA: 'ワンピースの世界の東の海。海賊、海軍、革命軍の抗争。',
    descriptionFR: 'East Blue dans l\'univers One Piece. Conflits entre Pirates, Marines et Révolutionnaires.'
  },
  {
    id: 'soul_society',
    worldId: 'shonen_battle',
    nameTR: 'Ruhlar Dünyası (Soul Society)',
    nameEN: 'Soul Society',
    nameJA: 'ソウル・ソサエティ',
    nameFR: 'Soul Society',
    emoji: '⚔️',
    population: 80000,
    birthRate: 0.015,
    lifeExpectancy: [50, 80],
    stats: { warRate: 0.25, diseaseRate: 0.03, povertyRate: 0.05, accidentRate: 0.05, violenceRate: 0.20, substanceRate: 0.02, suicideRate: 0.01, powerAwakeningRate: 0.20, adventureRate: 0.35, deathRate: 0.08 },
    descriptionTR: 'Bleach evrenindeki Ruhlar Dünyası. Shinigami akademisi, Hollow saldırıları ve ruh temizleme görevleri.',
    descriptionEN: 'Soul Society in the Bleach universe. Shinigami academy, Hollow attacks and soul cleansing missions.',
    descriptionJA: 'ブリーチの世界のソウル・ソサエティ。死神の学校、ホロウの襲撃、魂の浄化任務。',
    descriptionFR: 'La Soul Society dans l\'univers Bleach. Académie de Shinigami, attaques de Hollows et missions de purification des âmes.'
  },
  {
    id: 'marley',
    worldId: 'dark_fantasy',
    nameTR: 'Marley (Devler Ülkesi)',
    nameEN: 'Marley (Land of Titans)',
    nameJA: 'マーレ（巨人の国）',
    nameFR: 'Marley (terre des Titans)',
    emoji: '⚔️',
    population: 200000,
    birthRate: 0.020,
    lifeExpectancy: [20, 35],
    stats: { warRate: 0.45, diseaseRate: 0.06, povertyRate: 0.25, accidentRate: 0.10, violenceRate: 0.40, substanceRate: 0.04, suicideRate: 0.05, powerAwakeningRate: 0.08, adventureRate: 0.25, deathRate: 0.30 },
    descriptionTR: 'Attack on Titan evrenindeki Marley. Dev istilası, askeri disiplin ve karanlık savaş ortamı.',
    descriptionEN: 'Marley in the Attack on Titan universe. Titan invasion, military discipline and dark war environment.',
    descriptionJA: '進撃の巨人の世界のマーレ。巨人の侵攻、軍事規律、そして闇に包まれた戦時。',
    descriptionFR: 'Marley dans l\'univers L\'Attaque des Titans. Invasion des Titans, discipline militaire et environnement de guerre sombre.'
  },
  {
    id: 'jujutsu_high',
    worldId: 'shonen_battle',
    nameTR: 'Jujutsu Lisesi (Büyücü Okulu)',
    nameEN: 'Jujutsu High (Sorcerer School)',
    nameJA: '呪術高専',
    nameFR: 'Jujutsu High (école de sorcellerie)',
    emoji: '🔮',
    population: 1000,
    birthRate: 0.010,
    lifeExpectancy: [25, 40],
    stats: { warRate: 0.40, diseaseRate: 0.04, povertyRate: 0.05, accidentRate: 0.08, violenceRate: 0.35, substanceRate: 0.02, suicideRate: 0.03, powerAwakeningRate: 0.25, adventureRate: 0.50, deathRate: 0.25 },
    descriptionTR: 'Jujutsu Kaisen evrenindeki Jujutsu Lisesi. Lanetlerle dolu, güçlü büyücülerin yetiştiği elit okul.',
    descriptionEN: 'Jujutsu High in the Jujutsu Kaisen universe. An elite school where powerful sorcerers are trained, filled with curses.',
    descriptionJA: '呪術廻戦の世界の呪術高専。呪いに満ちた、有能な呪術師を育てる名門校。',
    descriptionFR: 'Jujutsu High dans l\'univers Jujutsu Kaisen. Une école d\'élite formant des sorciers puissants, remplie de malédictions.'
  },

  // Slice of Life World
  {
    id: 'rural_japan',
    worldId: 'slice_of_life',
    nameTR: 'Kırsal Japonya',
    nameEN: 'Rural Japan',
    nameJA: '日本の田舎',
    nameFR: 'Japon rural',
    emoji: '🏔️',
    population: 5000,
    birthRate: 0.008,
    lifeExpectancy: [80, 90],
    stats: { warRate: 0.0, diseaseRate: 0.03, povertyRate: 0.05, accidentRate: 0.02, violenceRate: 0.01, substanceRate: 0.02, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.15, deathRate: 0.01 },
    descriptionTR: 'Yuru Camp ve Non Non Biyori tarzı kırsal Japonya. Huzurlu, sakin, doğayla iç içe bir yaşam.',
    descriptionEN: 'Rural Japan in the style of Yuru Camp and Non Non Biyori. A peaceful, calm life in nature.',
    descriptionJA: 'ゆるキャン△とのんのんびより風の田舎日本。のどかで静かな、自然と寄り添う暮らし。',
    descriptionFR: 'Le Japon rural dans le style de Yuru Camp et Non Non Biyori. Une vie paisible et calme, en harmonie avec la nature.'
  },
  {
    id: 'school_town',
    worldId: 'slice_of_life',
    nameTR: 'Okul Kasabası',
    nameEN: 'School Town',
    nameJA: '学校町',
    nameFR: 'Ville scolaire',
    emoji: '🏫',
    population: 20000,
    birthRate: 0.012,
    lifeExpectancy: [75, 85],
    stats: { warRate: 0.0, diseaseRate: 0.04, povertyRate: 0.06, accidentRate: 0.03, violenceRate: 0.02, substanceRate: 0.02, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.10, deathRate: 0.01 },
    descriptionTR: 'K-On ve Nichijou tarzı okul kasabası. Müzik kulübü, komedi ve günlük yaşam.',
    descriptionEN: 'A school town in the style of K-On and Nichijou. Music club, comedy and daily life.',
    descriptionJA: 'けいおん！と日常風の学校町。軽音楽部、コメディ、そして日常。',
    descriptionFR: 'Une ville scolaire dans le style de K-On et Nichijō. Club de musique, comédie et vie quotidienne.'
  },
  {
    id: 'coastal_village',
    worldId: 'slice_of_life',
    nameTR: 'Kıyı Kasabası',
    nameEN: 'Coastal Village',
    nameJA: '海辺の村',
    nameFR: 'Village côtier',
    emoji: '🌊',
    population: 8000,
    birthRate: 0.010,
    lifeExpectancy: [78, 88],
    stats: { warRate: 0.0, diseaseRate: 0.03, povertyRate: 0.04, accidentRate: 0.02, violenceRate: 0.01, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.12, deathRate: 0.01 },
    descriptionTR: 'Deniz kenarında huzurlu bir kasaba. Balıkçılık, yaz festivalleri ve sakin bir yaşam.',
    descriptionEN: 'A peaceful coastal town. Fishing, summer festivals and a tranquil life.',
    descriptionJA: '海辺の穏やかな町。漁業、夏祭り、そして静かな暮らし。',
    descriptionFR: 'Une ville côtière paisible. Pêche, festivals d\'été et une vie tranquille.'
  },

  // Dark Fantasy World
  {
    id: 'midland',
    worldId: 'dark_fantasy',
    nameTR: 'Midland (Berserk)',
    nameEN: 'Midland (Berserk)',
    nameJA: 'ミッドランド（ベルセルク）',
    nameFR: 'Midland (Berserk)',
    emoji: '🗡️',
    population: 500000,
    birthRate: 0.025,
    lifeExpectancy: [15, 25],
    stats: { warRate: 0.60, diseaseRate: 0.15, povertyRate: 0.40, accidentRate: 0.12, violenceRate: 0.55, substanceRate: 0.12, suicideRate: 0.10, powerAwakeningRate: 0.03, adventureRate: 0.20, deathRate: 0.45 },
    descriptionTR: 'Berserk evrenindeki Midland. Savaş, iblisler, kader ve hayatta kalma mücadelesi.',
    descriptionEN: 'Midland in the Berserk universe. War, demons, fate and the struggle for survival.',
    descriptionJA: 'ベルセルクの世界のミッドランド。戦争、使徒、運命、そして生き延びる戦い。',
    descriptionFR: 'Midland dans l\'univers Berserk. Guerre, apôtres, destin et lutte pour la survie.'
  },
  {
    id: 'paradis',
    worldId: 'dark_fantasy',
    nameTR: 'Paradis Adası (AOT)',
    nameEN: 'Paradis Island (AOT)',
    nameJA: 'パラディ島（進撃の巨人）',
    nameFR: 'Île de Paradis (L\'Attaque des Titans)',
    emoji: '🏰',
    population: 1000000,
    birthRate: 0.020,
    lifeExpectancy: [20, 35],
    stats: { warRate: 0.50, diseaseRate: 0.08, povertyRate: 0.20, accidentRate: 0.08, violenceRate: 0.45, substanceRate: 0.05, suicideRate: 0.06, powerAwakeningRate: 0.05, adventureRate: 0.25, deathRate: 0.35 },
    descriptionTR: 'Attack on Titan evrenindeki Paradis Adası. Devler, duvarlar ve hayatta kalma mücadelesi.',
    descriptionEN: 'Paradis Island in the Attack on Titan universe. Titans, walls and the struggle for survival.',
    descriptionJA: '進撃の巨人の世界のパラディ島。巨人、壁、そして生き延びるための戦い。',
    descriptionFR: 'L\'île de Paradis dans l\'univers L\'Attaque des Titans. Titans, murs et lutte pour la survie.'
  },
  {
    id: 'the_abyss',
    worldId: 'dark_fantasy',
    nameTR: 'Uçurum (Made in Abyss)',
    nameEN: 'The Abyss (Made in Abyss)',
    nameJA: 'アビス（メイドインアビス）',
    nameFR: 'L\'Abîme (Made in Abyss)',
    emoji: '🕳️',
    population: 5000,
    birthRate: 0.010,
    lifeExpectancy: [10, 20],
    stats: { warRate: 0.30, diseaseRate: 0.20, povertyRate: 0.35, accidentRate: 0.25, violenceRate: 0.40, substanceRate: 0.08, suicideRate: 0.05, powerAwakeningRate: 0.02, adventureRate: 0.60, deathRate: 0.50 },
    descriptionTR: 'Made in Abyss evrenindeki Uçurum. Derin katmanlar, lanetler ve keşif maceraları.',
    descriptionEN: 'The Abyss in the Made in Abyss universe. Deep layers, curses and exploration adventures.',
    descriptionJA: 'メイドインアビスの世界の深き巣窟。深い階層、呪い、そして探索の冒険。',
    descriptionFR: 'L\'Abysse dans l\'univers Made in Abyss. Niveaux profonds, malédictions et aventures d\'exploration.'
  },

  // Isekai World
  {
    id: 'lugunica',
    worldId: 'isekai',
    nameTR: 'Lugunica Krallığı',
    nameEN: 'Kingdom of Lugunica',
    nameJA: 'ルグニカ王国',
    nameFR: 'Royaume de Lugunica',
    emoji: '🏰',
    population: 500000,
    birthRate: 0.022,
    lifeExpectancy: [30, 50],
    stats: { warRate: 0.25, diseaseRate: 0.07, povertyRate: 0.20, accidentRate: 0.06, violenceRate: 0.18, substanceRate: 0.04, suicideRate: 0.06, powerAwakeningRate: 0.20, adventureRate: 0.40, deathRate: 0.18 },
    descriptionTR: 'Re:Zero evrenindeki Lugunica Krallığı. Politik entrikalar, cadı kültü ve zaman döngüleri.',
    descriptionEN: 'Kingdom of Lugunica in the Re:Zero universe. Political intrigues, witch cult and time loops.',
    descriptionJA: 'リゼロの世界のルグニカ王国。政治の駆け引き、魔女教、そして時間のループ。',
    descriptionFR: 'Le royaume de Lugunica dans l\'univers Re:Zero. Intrigues politiques, culte de la sorcière et boucles temporelles.'
  },
  {
    id: 'axel',
    worldId: 'isekai',
    nameTR: 'Axel Şehri',
    nameEN: 'Axel Town',
    nameJA: 'アクセルの町',
    nameFR: 'Ville d\'Axel',
    emoji: '🛡️',
    population: 50000,
    birthRate: 0.018,
    lifeExpectancy: [40, 60],
    stats: { warRate: 0.10, diseaseRate: 0.05, povertyRate: 0.15, accidentRate: 0.05, violenceRate: 0.10, substanceRate: 0.03, suicideRate: 0.02, powerAwakeningRate: 0.15, adventureRate: 0.50, deathRate: 0.08 },
    descriptionTR: 'Konosuba evrenindeki Axel. Maceracı şehri, düşük seviye görevler ve komedi dolu bir yaşam.',
    descriptionEN: 'Axel town in the Konosuba universe. Adventurer town, low-level quests and a comedic life.',
    descriptionJA: 'この素晴らしい世界に祝福を！の世界のアクセル。冒険者の町、低レベルの依頼、コメディに富んだ人生。',
    descriptionFR: 'La ville d\'Axel dans l\'univers KonoSuba. Ville d\'aventuriers, quêtes de bas niveau et vie comique.'
  },
  {
    id: 'asura_kingdom',
    worldId: 'isekai',
    nameTR: 'Asura Krallığı',
    nameEN: 'Asura Kingdom',
    nameJA: 'アスラ王国',
    nameFR: 'Royaume d\'Asura',
    emoji: '⚔️',
    population: 1000000,
    birthRate: 0.020,
    lifeExpectancy: [35, 55],
    stats: { warRate: 0.20, diseaseRate: 0.06, povertyRate: 0.18, accidentRate: 0.07, violenceRate: 0.15, substanceRate: 0.04, suicideRate: 0.03, powerAwakeningRate: 0.22, adventureRate: 0.45, deathRate: 0.12 },
    descriptionTR: 'Mushoku Tensei evrenindeki Asura Krallığı. Büyü akademisi, soylu entrikaları ve kaderin belirsizliği.',
    descriptionEN: 'Asura Kingdom in the Mushoku Tensei universe. Magic academy, noble intrigues and the uncertainty of fate.',
    descriptionJA: '無職転生の世界のアスラ王国。魔法学院、貴族の陰謀、そして運命の不確かさ。',
    descriptionFR: 'Le royaume d\'Asura dans l\'univers Mushoku Tensei. Académie de magie, intrigues de nobles et incertitude du destin.'
  },

  // Cyberpunk World
  {
    id: 'night_city',
    worldId: 'cyberpunk',
    nameTR: 'Night City',
    nameEN: 'Night City',
    nameJA: 'ナイトシティ',
    nameFR: 'Night City',
    emoji: '🌃',
    population: 1000000,
    birthRate: 0.015,
    lifeExpectancy: [35, 55],
    stats: { warRate: 0.08, diseaseRate: 0.09, povertyRate: 0.35, accidentRate: 0.12, violenceRate: 0.40, substanceRate: 0.20, suicideRate: 0.08, powerAwakeningRate: 0.05, adventureRate: 0.25, deathRate: 0.18 },
    descriptionTR: 'Cyberpunk Edgerunners evrenindeki Night City. Çeteler, megacorp\'lar ve siberpsikoz.',
    descriptionEN: 'Night City in the Cyberpunk Edgerunners universe. Gangs, megacorps and cyberpsychosis.',
    descriptionJA: 'サイバーパンク エッジランナーズの世界のナイトシティ。ギャング、メガコーポ、そしてサイバーサイコシス。',
    descriptionFR: 'Night City dans l\'univers Cyberpunk Edgerunners. Gangs, mégacorpos et cyberpsychose.'
  },
  {
    id: 'sibyl_city',
    worldId: 'cyberpunk',
    nameTR: 'Sibyl Şehri',
    nameEN: 'Sibyl City',
    nameJA: 'シビュラ・シティ',
    nameFR: 'Ville de Sibyl',
    emoji: '🔍',
    population: 2000000,
    birthRate: 0.012,
    lifeExpectancy: [50, 70],
    stats: { warRate: 0.05, diseaseRate: 0.04, povertyRate: 0.10, accidentRate: 0.06, violenceRate: 0.15, substanceRate: 0.08, suicideRate: 0.05, powerAwakeningRate: 0.03, adventureRate: 0.15, deathRate: 0.08 },
    descriptionTR: 'Psycho-Pass evrenindeki Sibyl Şehri. Suç katsayısı, Dominatör ve adalet sistemi.',
    descriptionEN: 'Sibyl City in the Psycho-Pass universe. Crime coefficient, Dominator and justice system.',
    descriptionJA: 'PSYCHO-PASSの世界のシビュラ。犯罪係数、ドミネーター、そして正義のシステム。',
    descriptionFR: 'La ville de Sibylla dans l\'univers Psycho-Pass. Coefficient de criminalité, Dominator et système de justice.'
  },
  {
    id: 'neo_tokyo',
    worldId: 'cyberpunk',
    nameTR: 'Neo-Tokyo',
    nameEN: 'Neo-Tokyo',
    nameJA: 'ネオ東京',
    nameFR: 'Neo-Tokyo',
    emoji: '🏙️',
    population: 3000000,
    birthRate: 0.010,
    lifeExpectancy: [40, 60],
    stats: { warRate: 0.12, diseaseRate: 0.06, povertyRate: 0.20, accidentRate: 0.10, violenceRate: 0.25, substanceRate: 0.12, suicideRate: 0.07, powerAwakeningRate: 0.04, adventureRate: 0.18, deathRate: 0.10 },
    descriptionTR: 'Akira evrenindeki Neo-Tokyo. Motor çeteleri, psikik güçler ve distopik gelecek.',
    descriptionEN: 'Neo-Tokyo in the Akira universe. Biker gangs, psychic powers and dystopian future.',
    descriptionJA: 'AKIRAの世界の新東京。暴走族、超能力、そしてディストピアの未来。',
    descriptionFR: 'Néo-Tokyo dans l\'univers Akira. Gangs de motards, pouvoirs psychiques et avenir dystopique.'
  },

  // Seinen / Psychological World
  {
    id: 'tokyo_modern',
    worldId: 'seinen_psych',
    nameTR: 'Modern Tokyo',
    nameEN: 'Modern Tokyo',
    nameJA: '現代の東京',
    nameFR: 'Tokyo moderne',
    emoji: '🗼',
    population: 14000000,
    birthRate: 0.008,
    lifeExpectancy: [40, 60],
    stats: { warRate: 0.03, diseaseRate: 0.04, povertyRate: 0.12, accidentRate: 0.05, violenceRate: 0.10, substanceRate: 0.06, suicideRate: 0.06, powerAwakeningRate: 0.0, adventureRate: 0.08, deathRate: 0.08 },
    descriptionTR: 'Death Note ve Monster evrenindeki modern Tokyo. Zeka savaşları, ahlaki ikilemler ve gizli güçler.',
    descriptionEN: 'Modern Tokyo in the Death Note and Monster universe. Intelligence battles, moral dilemmas and hidden powers.',
    descriptionJA: 'DEATH NOTEとMONSTERの現代東京。頭脳戦、道徳的ジレンマ、そして隠されし力。',
    descriptionFR: 'Tokyo moderne dans l\'univers Death Note et Monster. Batailles d\'intelligence, dilemmes moraux et pouvoirs cachés.'
  },
  {
    id: 'dusseldorf',
    worldId: 'seinen_psych',
    nameTR: 'Düsseldorf (1980\'ler)',
    nameEN: 'Düsseldorf (1980s)',
    nameJA: 'デュッセルドルフ（1980年代）',
    nameFR: 'Düsseldorf (années 1980)',
    emoji: '🔍',
    population: 500000,
    birthRate: 0.007,
    lifeExpectancy: [35, 50],
    stats: { warRate: 0.02, diseaseRate: 0.05, povertyRate: 0.15, accidentRate: 0.04, violenceRate: 0.12, substanceRate: 0.09, suicideRate: 0.07, powerAwakeningRate: 0.0, adventureRate: 0.10, deathRate: 0.10 },
    descriptionTR: 'Monster evrenindeki Düsseldorf. Seri katiller, psikolojik gerilim ve ahlaki sorgulama.',
    descriptionEN: 'Düsseldorf in the Monster universe. Serial killers, psychological thriller and moral questioning.',
    descriptionJA: 'MONSTERの世界のデュッセルドルフ。連続殺人鬼、心理サスペンス、そして道徳の問い。',
    descriptionFR: 'Düsseldorf dans l\'univers Monster. Tueurs en série, thriller psychologique et questionnement moral.'
  },
  {
    id: 'akihabara',
    worldId: 'seinen_psych',
    nameTR: 'Akihabara (Otaku Bölgesi)',
    nameEN: 'Akihabara (Otaku District)',
    nameJA: '秋葉原（オタク街）',
    nameFR: 'Akihabara (quartier otaku)',
    emoji: '🎮',
    population: 100000,
    birthRate: 0.006,
    lifeExpectancy: [45, 65],
    stats: { warRate: 0.01, diseaseRate: 0.03, povertyRate: 0.10, accidentRate: 0.03, violenceRate: 0.05, substanceRate: 0.05, suicideRate: 0.04, powerAwakeningRate: 0.0, adventureRate: 0.06, deathRate: 0.06 },
    descriptionTR: 'Steins;Gate ve otaku kültürü evreni. Zaman yolculuğu, teknoloji ve günlük yaşam.',
    descriptionEN: 'Steins;Gate and otaku culture universe. Time travel, technology and daily life.',
    descriptionJA: 'STEINS;GATEとオタク文化の世界。タイムリープ、テクノロジー、そして日常。',
    descriptionFR: 'STEINS;GATE et la culture otaku. Voyage dans le temps, technologie et vie quotidienne.'
  },

  // Romance / Drama World
  {
    id: 'hikarizaka',
    worldId: 'romance_drama',
    nameTR: 'Hikarizaka (Clannad)',
    nameEN: 'Hikarizaka (Clannad)',
    nameJA: '光坂（クラナド）',
    nameFR: 'Hikarizaka (Clannad)',
    emoji: '🌸',
    population: 30000,
    birthRate: 0.012,
    lifeExpectancy: [65, 80],
    stats: { warRate: 0.0, diseaseRate: 0.08, povertyRate: 0.08, accidentRate: 0.04, violenceRate: 0.02, substanceRate: 0.02, suicideRate: 0.02, powerAwakeningRate: 0.0, adventureRate: 0.05, deathRate: 0.03 },
    descriptionTR: 'Clannad evrenindeki Hikarizaka. Aile, dostluk ve duygusal yolculuk.',
    descriptionEN: 'Hikarizaka in the Clannad universe. Family, friendship and emotional journey.',
    descriptionJA: 'CLANNADの世界の光坂。家族、友情、そして感情の旅路。',
    descriptionFR: 'Hikarizaka dans l\'univers Clannad. Famille, amitié et voyage émotionnel.'
  },
  {
    id: 'shigatsu_town',
    worldId: 'romance_drama',
    nameTR: 'Shigatsu Kasabası',
    nameEN: 'Shigatsu Town',
    nameJA: '四月の町',
    nameFR: 'Ville de Shigatsu',
    emoji: '🎹',
    population: 20000,
    birthRate: 0.010,
    lifeExpectancy: [68, 82],
    stats: { warRate: 0.0, diseaseRate: 0.07, povertyRate: 0.06, accidentRate: 0.03, violenceRate: 0.01, substanceRate: 0.01, suicideRate: 0.02, powerAwakeningRate: 0.0, adventureRate: 0.04, deathRate: 0.02 },
    descriptionTR: 'Your Lie in April evreni. Müzik, aşk ve kayıp.',
    descriptionEN: 'Your Lie in April universe. Music, love and loss.',
    descriptionJA: '四月は君の嘘の世界。音楽、恋、そして喪失。',
    descriptionFR: 'Shigatsu Town dans l\'univers Your Lie in April. Musique, amour et perte.'
  },
  {
    id: 'leiden',
    worldId: 'romance_drama',
    nameTR: 'Leiden (Violet Evergarden)',
    nameEN: 'Leiden (Violet Evergarden)',
    nameJA: 'ライデン（ヴァイオレット・エヴァーガーデン）',
    nameFR: 'Leiden (Violet Evergarden)',
    emoji: '✉️',
    population: 15000,
    birthRate: 0.009,
    lifeExpectancy: [60, 75],
    stats: { warRate: 0.05, diseaseRate: 0.06, povertyRate: 0.07, accidentRate: 0.03, violenceRate: 0.03, substanceRate: 0.02, suicideRate: 0.02, powerAwakeningRate: 0.0, adventureRate: 0.06, deathRate: 0.03 },
    descriptionTR: 'Violet Evergarden evrenindeki Leiden. Mektuplar, duygular ve savaş sonrası iyileşme.',
    descriptionEN: 'Leiden in the Violet Evergarden universe. Letters, emotions and post-war healing.',
    descriptionJA: 'ヴァイオレット・エヴァーガーデンの世界のライデン。手紙、感情、そして戦後の癒し。',
    descriptionFR: 'Leiden dans l\'univers Violet Evergarden. Lettres, émotions et guérison d\'après-guerre.'
  },

  // Sports World
  {
    id: 'karasuno',
    worldId: 'sports',
    nameTR: 'Karasuno Lisesi',
    nameEN: 'Karasuno High School',
    nameJA: '烏野高校',
    nameFR: 'Lycée Karasuno',
    emoji: '🏐',
    population: 1500,
    birthRate: 0.015,
    lifeExpectancy: [75, 88],
    stats: { warRate: 0.0, diseaseRate: 0.02, povertyRate: 0.04, accidentRate: 0.04, violenceRate: 0.01, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.04, deathRate: 0.01 },
    descriptionTR: 'Haikyuu evrenindeki Karasuno. Voleybol, takım ruhu ve azim.',
    descriptionEN: 'Karasuno in the Haikyuu universe. Volleyball, team spirit and determination.',
    descriptionJA: 'ハイキュー!!の世界の烏野高校。バレーボール、チームの絆、そして根性。',
    descriptionFR: 'Le lycée Karasuno dans l\'univers Haikyuu. Volleyball, esprit d\'équipe et détermination.'
  },
  {
    id: 'seirin',
    worldId: 'sports',
    nameTR: 'Seirin Lisesi',
    nameEN: 'Seirin High School',
    nameJA: '誠凛高校',
    nameFR: 'Lycée Seirin',
    emoji: '🏀',
    population: 1200,
    birthRate: 0.014,
    lifeExpectancy: [76, 89],
    stats: { warRate: 0.0, diseaseRate: 0.02, povertyRate: 0.04, accidentRate: 0.03, violenceRate: 0.01, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.04, deathRate: 0.01 },
    descriptionTR: 'Kuroko no Basket evrenindeki Seirin. Basketbol, takım oyunu ve azim.',
    descriptionEN: 'Seirin in the Kuroko no Basket universe. Basketball, team play and determination.',
    descriptionJA: '黒子のバスケの世界の誠凛高校。バスケットボール、チームプレー、そして根性。',
    descriptionFR: 'Le lycée Seirin dans l\'univers Kuroko no Basket. Basketball, jeu d\'équipe et détermination.'
  },
  {
    id: 'blue_lock',
    worldId: 'sports',
    nameTR: 'Blue Lock Tesisleri',
    nameEN: 'Blue Lock Facility',
    nameJA: 'ブルーロック施設',
    nameFR: 'Centre Blue Lock',
    emoji: '⚽',
    population: 300,
    birthRate: 0.010,
    lifeExpectancy: [70, 85],
    stats: { warRate: 0.0, diseaseRate: 0.02, povertyRate: 0.03, accidentRate: 0.05, violenceRate: 0.02, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.03, deathRate: 0.01 },
    descriptionTR: 'Blue Lock evrenindeki tesis. Egoist futbol, forvet eğitimi ve hayatta kalma.',
    descriptionEN: 'Blue Lock facility in the Blue Lock universe. Egoist football, striker training and survival.',
    descriptionJA: 'ブルーロックの世界の施設。エゴイストなサッカー、ストライカー育成、そして生存。',
    descriptionFR: 'L\'installation Blue Lock dans l\'univers Blue Lock. Foot égoïste, formation de buteurs et survie.'
  },
  {
    id: 'kamogawa',
    worldId: 'sports',
    nameTR: 'Kamogawa Boks Salonu',
    nameEN: 'Kamogawa Boxing Gym',
    nameJA: '鴨川ボクシングジム',
    nameFR: 'Salle de boxe Kamogawa',
    emoji: '🥊',
    population: 50,
    birthRate: 0.008,
    lifeExpectancy: [72, 86],
    stats: { warRate: 0.0, diseaseRate: 0.02, povertyRate: 0.03, accidentRate: 0.04, violenceRate: 0.02, substanceRate: 0.01, suicideRate: 0.01, powerAwakeningRate: 0.0, adventureRate: 0.03, deathRate: 0.01 },
    descriptionTR: 'Hajime no Ippo evrenindeki Kamogawa salonu. Boks, azim ve makivara antrenmanları.',
    descriptionEN: 'Kamogawa gym in the Hajime no Ippo universe. Boxing, determination and makivara training.',
    descriptionJA: 'はじめの一歩の世界の鴨川ボクシングジム。ボクシング、根性、そして巻き藁の鍛錬。',
    descriptionFR: 'La salle Kamogawa dans l\'univers Hajime no Ippo. Boxe, détermination et entraînement à la makivara.'
  },

  // Xianxia / Cultivation World — gerçek donghua mekânları
  {
    id: 'seven_mysteries_sect',
    worldId: 'xianxia_cultivation',
    nameTR: 'Yedi Gizem Tarikatı (七玄门)',
    nameEN: 'Seven Mysteries Sect (七玄门)',
    nameJA: '七玄門',
    nameFR: 'Secte des Sept Mystères (七玄门)',
    emoji: '⛰️',
    population: 8000,
    birthRate: 0.020,
    lifeExpectancy: [55, 95],
    stats: { warRate: 0.20, diseaseRate: 0.12, povertyRate: 0.30, accidentRate: 0.10, violenceRate: 0.20, substanceRate: 0.03, suicideRate: 0.03, powerAwakeningRate: 0.20, adventureRate: 0.35, deathRate: 0.16 },
    descriptionTR: 'A Record of a Mortal\'s Journey to Immortality\'daki dağ tarikatı. Şifalı ot toplama, dış ve iç disiplin ayrımı, sıradan insanlarla cultivator\'ların yan yana yaşadığı bir kapı.',
    descriptionEN: 'The mountain sect from A Record of a Mortal\'s Journey to Immortality. Herb gathering, the split between outer and inner disciples, and mortals living beside cultivators.',
    descriptionJA: '『凡人修仙伝』の山門。薬草採集、外門と内門の区別、そして凡人が修行者と隣り合って暮らす場所。',
    descriptionFR: 'La secte de montagne de « A Record of a Mortal\'s Journey to Immortality ». Cueillette d\'herbes, séparation entre disciples externes et internes, et mortels vivant aux côtés des cultivateurs.'
  },
  {
    id: 'shrek_academy',
    worldId: 'xianxia_cultivation',
    nameTR: 'Shrek Akademisi (史莱克学院)',
    nameEN: 'Shrek Academy (史莱克学院)',
    nameJA: 'シュレック学院',
    nameFR: 'Académie Shrek (史莱克学院)',
    emoji: '🏯',
    population: 1500,
    birthRate: 0.012,
    lifeExpectancy: [60, 105],
    stats: { warRate: 0.15, diseaseRate: 0.06, povertyRate: 0.10, accidentRate: 0.12, violenceRate: 0.18, substanceRate: 0.02, suicideRate: 0.02, powerAwakeningRate: 0.45, adventureRate: 0.50, deathRate: 0.14 },
    descriptionTR: 'Soul Land\'deki ruh ustası akademisi. "Sadece canavarlar" sloganıyla yalnız en güçlü yetenekleri alır; eğitim acımasız, mezuniyet ölümcüldür.',
    descriptionEN: 'The spirit master academy from Soul Land. Its motto is "only monsters" — it admits only the strongest talents, training is brutal and graduation is lethal.',
    descriptionJA: '『斗羅大陸』の武魂学院。「怪物だけ」を掲げ、最も強い素質だけを受け入れる。訓練は過酷で、卒業は命がけだ。',
    descriptionFR: 'L\'académie de maîtres d\'esprit de « Soul Land ». Sa devise : « seulement des monstres » — elle n\'admet que les talents les plus forts, l\'entraînement est brutal et l\'examen final mortel.'
  },
  {
    id: 'jiama_empire',
    worldId: 'xianxia_cultivation',
    nameTR: 'Jiama İmparatorluğu (加玛帝国)',
    nameEN: 'Jia Ma Empire (加玛帝国)',
    nameJA: 'ジャマ帝国',
    nameFR: 'Empire de Jia Ma (加玛帝国)',
    emoji: '🏛️',
    population: 400000,
    birthRate: 0.026,
    lifeExpectancy: [45, 85],
    stats: { warRate: 0.30, diseaseRate: 0.12, povertyRate: 0.28, accidentRate: 0.09, violenceRate: 0.30, substanceRate: 0.05, suicideRate: 0.03, powerAwakeningRate: 0.15, adventureRate: 0.40, deathRate: 0.20 },
    descriptionTR: 'Battle Through the Heavens\'taki imparatorluk. Simyacı loncası, müzayedeler ve çöl sınırındaki klan çatışmaları: ticaret de, güç de aynı pazarda satılır.',
    descriptionEN: 'The empire from Battle Through the Heavens. An alchemist guild, auctions and clan feuds on the desert border — trade and power are sold in the same market.',
    descriptionJA: '『闘破穹天』の帝国。錬丹師ギルド、競売、そして砂漠国境の一族抗争。取引も力も同じ市場で売買される。',
    descriptionFR: 'L\'empire de « Battle Through the Heavens ». Guilde des alchimistes, enchères et querelles de clans à la frontière du désert : le commerce et le pouvoir se vendent sur le même marché.'
  },
  {
    id: 'star_luo_empire',
    worldId: 'xianxia_cultivation',
    nameTR: 'Star Luo İmparatorluğu (星罗帝国)',
    nameEN: 'Star Luo Empire (星罗帝国)',
    nameJA: '星羅帝国',
    nameFR: 'Empire de Star Luo (星罗帝国)',
    emoji: '⚔️',
    population: 600000,
    birthRate: 0.024,
    lifeExpectancy: [45, 85],
    stats: { warRate: 0.35, diseaseRate: 0.11, povertyRate: 0.22, accidentRate: 0.10, violenceRate: 0.32, substanceRate: 0.04, suicideRate: 0.04, powerAwakeningRate: 0.25, adventureRate: 0.38, deathRate: 0.22 },
    descriptionTR: 'Soul Land\'deki askerî imparatorluk. Ruh ustası birlikleri, soylu ailelerin evlilik ittifakları ve sürekli sınır savaşı; güç doğrudan rütbe demek.',
    descriptionEN: 'The military empire from Soul Land. Spirit master legions, noble marriage alliances and constant border war — power translates directly into rank.',
    descriptionJA: '『斗羅大陸』の軍事帝国。武魂師の軍団、貴族の婚姻同盟、そして絶えない国境戦争。力がそのまま階級になる。',
    descriptionFR: 'L\'empire militaire de « Soul Land ». Légions de maîtres d\'esprit, alliances matrimoniales nobles et guerre de frontière permanente — la puissance se traduit directement en grade.'
  }
];

const LOCALIZED_REGION_NAME: Record<string, 'nameTR' | 'nameEN' | 'nameJA' | 'nameFR'> = {
  tr: 'nameTR',
  en: 'nameEN',
  ja: 'nameJA',
  fr: 'nameFR',
};

/** Bölge adını verilen dilde döndürür (JA/FR yoksa İngilizceye düşer). */
export const localizeRegionName = (region: AnimeRegion, lang: Lang4): string => {
  const key = LOCALIZED_REGION_NAME[lang] ?? 'nameEN';
  return region[key] ?? region.nameEN;
};

/** Bölge açıklamasını verilen dilde döndürür (JA/FR yoksa İngilizce). */
export const localizeRegionDescription = (region: AnimeRegion, lang: Lang4): string => {
  if (lang === 'tr') return region.descriptionTR;
  if (lang === 'ja') return region.descriptionJA ?? region.descriptionEN;
  if (lang === 'fr') return region.descriptionFR ?? region.descriptionEN;
  return region.descriptionEN;
};

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
  kamogawa: 'neutral',
  seven_mysteries_sect: 'orange',
  shrek_academy: 'amber',
  jiama_empire: 'orange',
  star_luo_empire: 'rose'
};