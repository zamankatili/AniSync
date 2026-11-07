/**
 * Haftalık meydan okuma gün meta verilerinin çok dilli karşılıkları.
 * Soru içerikleri (weeklyChallengeBank) şimdilik Türkçe kalır; burada yalnızca
 * gün adları, temalar, rozetler ve açıklamalar çevrilir.
 */
import i18n from '../i18n';

interface LocalizedText {
  tr: string;
  en: string;
  ja: string;
  fr: string;
}

const L = (tr: string, en: string, ja: string, fr: string): LocalizedText => ({ tr, en, ja, fr });

const baseLang = (): string => String(i18n.language || 'tr').split('-')[0].toLowerCase();

export const pickLocalized = (entry: LocalizedText | undefined, fallback = ''): string => {
  if (!entry) return fallback;
  return (entry as any)[baseLang()] || entry.tr || fallback;
};

interface DayText {
  name: LocalizedText;
  shortName: LocalizedText;
  theme: LocalizedText;
  category: LocalizedText;
  badge: LocalizedText;
  description: LocalizedText;
}

const DAY_TEXTS: Record<string, DayText> = {
  mon: {
    name: L('Pazartesi', 'Monday', '月曜日', 'Lundi'),
    shortName: L('PZT', 'MON', '月', 'LUN'),
    theme: L('Shounen & Güç Sistemleri', 'Shounen & Power Systems', '少年＆パワーシステム', 'Shounen & Systèmes de pouvoir'),
    category: L('Aksiyon & Güç', 'Action & Power', 'アクション＆パワー', 'Action & Pouvoir'),
    badge: L('🔥 Güç Çırağı', '🔥 Power Apprentice', '🔥 力の見習い', '🔥 Apprenti du Pouvoir'),
    description: L(
      'Nen, Haki, Çakra ve Lanetli Enerji derinliklerine in!',
      'Dive into the depths of Nen, Haki, Chakra and Cursed Energy!',
      '念、覇気、チャクラ、呪力の深淵へ飛び込もう！',
      'Plonge dans les profondeurs du Nen, du Haki, du Chakra et de l’Énergie Maudite !'
    ),
  },
  tue: {
    name: L('Salı', 'Tuesday', '火曜日', 'Mardi'),
    shortName: L('SAL', 'TUE', '火', 'MAR'),
    theme: L('Seinen & Psikolojik Zeka', 'Seinen & Psychological Intellect', '青年＆心理的知性', 'Seinen & Intelligence psychologique'),
    category: L('Zeka & Psikoloji', 'Intellect & Psychology', '知性＆心理', 'Intellect & Psychologie'),
    badge: L('🧠 Zihin Ustası', '🧠 Mind Master', '🧠 精神の達人', '🧠 Maître de l’Esprit'),
    description: L(
      'Monster, Berserk, Death Note satranç hamlelerini çöz!',
      'Solve the chess moves of Monster, Berserk and Death Note!',
      'MONSTER、ベルセルク、DEATH NOTEのチェスの一手を解け！',
      'Résous les coups d’échecs de Monster, Berserk et Death Note !'
    ),
  },
  wed: {
    name: L('Çarşamba', 'Wednesday', '水曜日', 'Mercredi'),
    shortName: L('ÇAR', 'WED', '水', 'MER'),
    theme: L('Romantizm & Slice of Life', 'Romance & Slice of Life', 'ロマンス＆日常', 'Romance & Tranche de vie'),
    category: L('Duygu & Yaşam', 'Emotion & Life', '感情＆人生', 'Émotion & Vie'),
    badge: L('🌸 Kalp Hırsızı', '🌸 Heart Thief', '🌸 ハートの盗賊', '🌸 Voleur de Cœur'),
    description: L(
      'Kaguya-sama, Clannad, A Silent Voice ve saf duygular!',
      'Kaguya-sama, Clannad, A Silent Voice and pure emotions!',
      'かぐや様、CLANNAD、聲の形、そして純粋な感情！',
      'Kaguya-sama, Clannad, A Silent Voice et de pures émotions !'
    ),
  },
  thu: {
    name: L('Perşembe', 'Thursday', '木曜日', 'Jeudi'),
    shortName: L('PER', 'THU', '木', 'JEU'),
    theme: L('Isekai & Fantastik Dünyalar', 'Isekai & Fantasy Worlds', '異世界＆ファンタジー', 'Isekai & Mondes fantastiques'),
    category: L('Isekai & Büyü', 'Isekai & Magic', '異世界＆魔法', 'Isekai & Magie'),
    badge: L('🌀 Boyut Gezgini', '🌀 Dimension Traveler', '🌀 次元の旅人', '🌀 Voyageur Dimensionnel'),
    description: L(
      'Re:Zero, Mushoku Tensei, Frieren ve büyü kuralları!',
      'Re:Zero, Mushoku Tensei, Frieren and the rules of magic!',
      'Re:ゼロ、無職転生、葬送のフリーレンと魔法のルール！',
      'Re:Zero, Mushoku Tensei, Frieren et les règles de la magie !'
    ),
  },
  fri: {
    name: L('Cuma', 'Friday', '金曜日', 'Vendredi'),
    shortName: L('CUM', 'FRI', '金', 'VEN'),
    theme: L('Müzik, Sanat & Stüdyolar', 'Music, Art & Studios', '音楽、芸術＆スタジオ', 'Musique, Art & Studios'),
    category: L('Sanat & Müzik', 'Art & Music', '芸術＆音楽', 'Art & Musique'),
    badge: L('🎵 Melodi Efendisi', '🎵 Melody Master', '🎵 メロディの達人', '🎵 Maître de la Mélodie'),
    description: L(
      "Hiroyuki Sawano tınıları, Ufotable animasyonları ve efsane OP'ler!",
      'Hiroyuki Sawano melodies, Ufotable animation and legendary OPs!',
      '澤野弘之の旋律、ufotableのアニメーション、伝説のOP！',
      'Les mélodies de Hiroyuki Sawano, l’animation Ufotable et des OP légendaires !'
    ),
  },
  sat: {
    name: L('Cumartesi', 'Saturday', '土曜日', 'Samedi'),
    shortName: L('CMT', 'SAT', '土', 'SAM'),
    theme: L('Felsefe & Büyük İkilemler', 'Philosophy & Great Dilemmas', '哲学＆大きなジレンマ', 'Philosophie & Grands Dilemmes'),
    category: L('Felsefe & Ahlak', 'Philosophy & Morality', '哲学＆道徳', 'Philosophie & Morale'),
    badge: L('⚖️ Adalet Terazisi', '⚖️ Scales of Justice', '⚖️ 正義の天秤', '⚖️ Balance de la Justice'),
    description: L(
      'Eşdeğer değişim, Sonsuz Tsukuyomi ve ahlaki seçimler!',
      'Equivalent exchange, Infinite Tsukuyomi and moral choices!',
      '等価交換、無限月読、そして道徳的選択！',
      'Échange équivalent, Tsukuyomi Infini et choix moraux !'
    ),
  },
  sun: {
    name: L('Pazar', 'Sunday', '日曜日', 'Dimanche'),
    shortName: L('PAZ', 'SUN', '日', 'DIM'),
    theme: L('Haftanın Karşılaşmaları & Fan Oylaması', 'Weekly Showdowns & Fan Vote', '今週の対決＆ファン投票', 'Duels de la semaine & Vote des fans'),
    category: L('Büyük Düello', 'Grand Duel', '大デュエル', 'Grand Duel'),
    badge: L('⚔️ Arena Şampiyonu', '⚔️ Arena Champion', '⚔️ アリーナチャンピオン', '⚔️ Champion de l’Arène'),
    description: L(
      'Haftanın en tartışmalı GOAT serileri ve topluluk seçimleri!',
      "The week's most debated GOAT series and community picks!",
      '今週最も議論されたGOAT作品とコミュニティの選択！',
      'Les séries GOAT les plus débattues de la semaine et les choix de la communauté !'
    ),
  },
  finale: {
    name: L('Büyük Final', 'Grand Finale', 'グランドフィナーレ', 'Grande Finale'),
    shortName: L('FİNAL', 'FINAL', '決勝', 'FINALE'),
    theme: L('Efsaneler Kulübü & Haftalık Grand Finale', 'Legends Club & Weekly Grand Finale', '伝説のクラブ＆週間グランドフィナーレ', 'Club des Légendes & Grande Finale hebdomadaire'),
    category: L('Grand Master', 'Grand Master', 'グランドマスター', 'Grand Maître'),
    badge: L('👑 50 Soruluk Efsane', '👑 50-Question Legend', '👑 50問の伝説', '👑 Légende des 50 Questions'),
    description: L(
      'Haftanın 50 sorusunu taçlandıran 8 soruluk Grand Master etabı!',
      'The 8-question Grand Master stage that crowns the 50 questions of the week!',
      '今週の50問を締めくくる8問のグランドマスターステージ！',
      'L’étape Grand Maître de 8 questions qui couronne les 50 questions de la semaine !'
    ),
  },
};

export const localizeDayName = (id: string, fallback: string) => pickLocalized(DAY_TEXTS[id]?.name, fallback);
export const localizeDayShortName = (id: string, fallback: string) => pickLocalized(DAY_TEXTS[id]?.shortName, fallback);
export const localizeDayTheme = (id: string, fallback: string) => pickLocalized(DAY_TEXTS[id]?.theme, fallback);
export const localizeDayCategory = (id: string, fallback: string) => pickLocalized(DAY_TEXTS[id]?.category, fallback);
export const localizeDayBadge = (id: string, fallback: string) => pickLocalized(DAY_TEXTS[id]?.badge, fallback);
export const localizeDayDescription = (id: string, fallback: string) => pickLocalized(DAY_TEXTS[id]?.description, fallback);

interface WeekBadgeText {
  title: LocalizedText;
  description: LocalizedText;
}

const WEEK_BADGE_TEXTS: Record<string, WeekBadgeText> = {
  first_question: {
    title: L('İlk Kıvılcım', 'First Spark', '最初の火花', 'Première Étincelle'),
    description: L('Meydan okuma döngüsünde ilk sorunu yanıtla', 'Answer the first question in the challenge cycle', 'チャレンジサイクルで最初の問題に答える', 'Réponds à la première question du cycle de défi'),
  },
  daily_set: {
    title: L('Gün Fatihi', 'Day Conqueror', '一日の征服者', 'Conquérant du Jour'),
    description: L('Günün 6 soruluk meydan okumasını eksiksiz bitir', "Complete the day's 6-question challenge", 'その日の6問チャレンジを完全にクリア', 'Termine le défi de 6 questions du jour'),
  },
  shounen_master: {
    title: L('Güç Şampiyonu', 'Power Champion', 'パワーチャンピオン', 'Champion du Pouvoir'),
    description: L('Pazartesi Shounen etabının 6 sorusunu tamamla', "Complete the 6 questions of Monday's Shounen stage", '月曜日の少年ステージ6問を完了', 'Termine les 6 questions de l’étape Shounen du lundi'),
  },
  seinen_tactician: {
    title: L('Zihin Taktisyeni', 'Mind Tactician', '精神の戦術家', 'Tacticien de l’Esprit'),
    description: L('Salı Seinen etabının 6 sorusunu tamamla', "Complete the 6 questions of Tuesday's Seinen stage", '火曜日の青年ステージ6問を完了', 'Termine les 6 questions de l’étape Seinen du mardi'),
  },
  streak_3: {
    title: L('Alevli Seri', 'Blazing Streak', '炎の連続記録', 'Série Enflammée'),
    description: L('En az 3 günlük seri elde et', 'Achieve a streak of at least 3 days', '3日以上の連続記録を達成', 'Réalise une série d’au moins 3 jours'),
  },
  half_way: {
    title: L('Yarı Yol Otakusu', 'Halfway Otaku', '道半ばのオタク', 'Otaku à Mi-Chemin'),
    description: L("50 sorunun 25'ini başarıyla tamamla", 'Successfully complete 25 of the 50 questions', '50問のうち25問を完了', 'Termine avec succès 25 des 50 questions'),
  },
  fifty_legend: {
    title: L('50 Soruluk Efsane', '50-Question Legend', '50問の伝説', 'Légende des 50 Questions'),
    description: L('Haftalık havuzun 50 sorusunun tamamını tamamla!', 'Complete all 50 questions of the weekly pool!', '週間プールの50問すべてを完了！', 'Termine les 50 questions du pool hebdomadaire !'),
  },
};

export const localizeWeeklyBadgeTitle = (id: string, fallback: string) =>
  pickLocalized(WEEK_BADGE_TEXTS[id]?.title, fallback);

export const localizeWeeklyBadgeDescription = (id: string, fallback: string) =>
  pickLocalized(WEEK_BADGE_TEXTS[id]?.description, fallback);

const DIFFICULTY_KEYS: Record<string, string> = {
  Kolay: 'difficulty_easy',
  Orta: 'difficulty_medium',
  Zor: 'difficulty_hard',
  Efsane: 'difficulty_legend',
};

export const localizeDifficulty = (value: string | undefined, fallback = 'Normal') => {
  if (!value) return fallback;
  const key = DIFFICULTY_KEYS[value];
  if (!key) return value;
  const translated = i18n.t(key);
  return typeof translated === 'string' ? translated : value;
};
