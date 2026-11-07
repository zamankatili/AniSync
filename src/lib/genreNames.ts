/**
 * AniList tür adlarını dile göre lokalize eder.
 * Kaynak listesi: AniList GraphQL `GenreCollection` (İngilizce değerler) +
 * Türkçe demo veri tür adları (airingSchedule vb.).
 * Bilinmeyen tür adları olduğu gibi gösterilir.
 */
import i18n from '../i18n';

interface GenreI18n {
  en: string;
  tr: string;
  ja: string;
  fr: string;
}

const GENRE_MAP: Record<string, GenreI18n> = {
  action: { en: 'Action', tr: 'Aksiyon', ja: 'アクション', fr: 'Action' },
  adventure: { en: 'Adventure', tr: 'Macera', ja: '冒険', fr: 'Aventure' },
  cars: { en: 'Cars', tr: 'Arabalar', ja: 'カー', fr: 'Voitures' },
  comedy: { en: 'Comedy', tr: 'Komedi', ja: 'コメディ', fr: 'Comédie' },
  dementia: { en: 'Dementia', tr: 'Çılgın Hikâyeler', ja: 'クレイジー', fr: 'Démence' },
  demons: { en: 'Demons', tr: 'İblisler', ja: '悪魔', fr: 'Démons' },
  ecchi: { en: 'Ecchi', tr: 'Ecchi', ja: 'エッチ', fr: 'Ecchi' },
  fantasy: { en: 'Fantasy', tr: 'Fantastik', ja: 'ファンタジー', fr: 'Fantastique' },
  game: { en: 'Game', tr: 'Oyun', ja: 'ゲーム', fr: 'Jeux Vidéo' },
  harem: { en: 'Harem', tr: 'Harem', ja: 'ハーレム', fr: 'Harem' },
  historical: { en: 'Historical', tr: 'Tarihi', ja: '歴史', fr: 'Historique' },
  horror: { en: 'Horror', tr: 'Korku', ja: 'ホラー', fr: 'Horreur' },
  isekai: { en: 'Isekai', tr: 'Isekai', ja: '異世界', fr: 'Isekai' },
  josei: { en: 'Josei', tr: 'Josei', ja: '女性向け', fr: 'Josei' },
  kids: { en: 'Kids', tr: 'Çocuk', ja: '子供向け', fr: 'Enfants' },
  magic: { en: 'Magic', tr: 'Büyü', ja: '魔法', fr: 'Magie' },
  'martial arts': { en: 'Martial Arts', tr: 'Dövüş Sanatları', ja: '武術', fr: 'Arts Martiaux' },
  mecha: { en: 'Mecha', tr: 'Mecha', ja: 'メカ', fr: 'Mecha' },
  military: { en: 'Military', tr: 'Askeri', ja: '軍事', fr: 'Militaire' },
  music: { en: 'Music', tr: 'Müzik', ja: '音楽', fr: 'Musique' },
  mystery: { en: 'Mystery', tr: 'Gizem', ja: 'ミステリー', fr: 'Mystère' },
  parody: { en: 'Parody', tr: 'Parodi', ja: 'パロディ', fr: 'Parodie' },
  police: { en: 'Police', tr: 'Polis', ja: '警察', fr: 'Police' },
  psychological: { en: 'Psychological', tr: 'Psikolojik', ja: '心理', fr: 'Psychologique' },
  romance: { en: 'Romance', tr: 'Romantizm', ja: 'ロマンス', fr: 'Romance' },
  samurai: { en: 'Samurai', tr: 'Samuray', ja: '侍', fr: 'Samouraï' },
  school: { en: 'School', tr: 'Okul', ja: '学園', fr: 'École' },
  'sci-fi': { en: 'Sci-Fi', tr: 'Bilim Kurgu', ja: 'SF', fr: 'Science-Fiction' },
  seinen: { en: 'Seinen', tr: 'Seinen', ja: '青年向け', fr: 'Seinen' },
  shoujo: { en: 'Shoujo', tr: 'Shoujo', ja: '少女向け', fr: 'Shoujo' },
  'shoujo ai': { en: 'Shoujo Ai', tr: 'Shoujo Ai', ja: '少女愛', fr: 'Shoujo Ai' },
  shounen: { en: 'Shounen', tr: 'Shounen', ja: '少年向け', fr: 'Shounen' },
  'shounen ai': { en: 'Shounen Ai', tr: 'Shounen Ai', ja: '少年愛', fr: 'Shounen Ai' },
  'slice of life': { en: 'Slice of Life', tr: 'Yaşam Kesiti', ja: '日常系', fr: 'Tranche de Vie' },
  space: { en: 'Space', tr: 'Uzay', ja: 'スペース', fr: 'Espace' },
  sports: { en: 'Sports', tr: 'Spor', ja: 'スポーツ', fr: 'Sports' },
  'super power': { en: 'Super Power', tr: 'Süper Güç', ja: '超能力', fr: 'Super-Pouvoir' },
  supernatural: { en: 'Supernatural', tr: 'Doğaüstü', ja: '超自然', fr: 'Surnaturel' },
  thriller: { en: 'Thriller', tr: 'Gerilim', ja: 'スリラー', fr: 'Thriller' },
  vampire: { en: 'Vampire', tr: 'Vampir', ja: '吸血鬼', fr: 'Vampires' },
  yaoi: { en: 'Yaoi', tr: 'Yaoi', ja: 'BL', fr: 'Yaoi' },
  yuri: { en: 'Yuri', tr: 'Yuri', ja: '百合', fr: 'Yuri' },
  suspense: { en: 'Suspense', tr: 'Gerilim', ja: 'サスペンス', fr: 'Suspense' },
  gourmet: { en: 'Gourmet', tr: 'Gurme', ja: 'グルメ', fr: 'Gastronomie' },
  'award winning': { en: 'Award Winning', tr: 'Ödüllü', ja: '受賞作品', fr: 'Primé' },
  'boys love': { en: 'Boys Love', tr: 'Boys Love', ja: 'BL', fr: 'Boys Love' },
  'girls love': { en: 'Girls Love', tr: 'Girls Love', ja: 'GL', fr: 'Girls Love' },
  'work life': { en: 'Work Life', tr: 'İş Hayatı', ja: '仕事', fr: 'Vie Professionnelle' },
  drama: { en: 'Drama', tr: 'Dram', ja: 'ドラマ', fr: 'Drame' },
  // Türkçe demo veri tür adları (airingSchedule vb.)
  aksiyon: { en: 'Action', tr: 'Aksiyon', ja: 'アクション', fr: 'Action' },
  askeri: { en: 'Military', tr: 'Askeri', ja: '軍事', fr: 'Militaire' },
  'bilim kurgu': { en: 'Sci-Fi', tr: 'Bilim Kurgu', ja: 'SF', fr: 'Science-Fiction' },
  doğaüstü: { en: 'Supernatural', tr: 'Doğaüstü', ja: '超自然', fr: 'Surnaturel' },
  dövüş: { en: 'Martial Arts', tr: 'Dövüş', ja: '格闘', fr: 'Arts Martiaux' },
  dram: { en: 'Drama', tr: 'Dram', ja: 'ドラマ', fr: 'Drame' },
  fantastik: { en: 'Fantasy', tr: 'Fantastik', ja: 'ファンタジー', fr: 'Fantastique' },
  fantezi: { en: 'Fantasy', tr: 'Fantezi', ja: 'ファンタジー', fr: 'Fantastique' },
  futbol: { en: 'Sports', tr: 'Futbol', ja: 'サッカー', fr: 'Football' },
  gerilim: { en: 'Thriller', tr: 'Gerilim', ja: 'スリラー', fr: 'Thriller' },
  gizem: { en: 'Mystery', tr: 'Gizem', ja: 'ミステリー', fr: 'Mystère' },
  gurme: { en: 'Gourmet', tr: 'Gurme', ja: 'グルメ', fr: 'Gastronomie' },
  'karanlık fantazi': { en: 'Dark Fantasy', tr: 'Karanlık Fantazi', ja: 'ダークファンタジー', fr: 'Dark Fantasy' },
  'karanlık shounen': { en: 'Dark Shounen', tr: 'Karanlık Shounen', ja: 'ダーク少年向け', fr: 'Dark Shounen' },
  komedi: { en: 'Comedy', tr: 'Komedi', ja: 'コメディ', fr: 'Comédie' },
  korsan: { en: 'Pirates', tr: 'Korsan', ja: '海賊', fr: 'Pirates' },
  kozmik: { en: 'Cosmic', tr: 'Kozmik', ja: 'コズミック', fr: 'Cosmique' },
  'kozmik korku': { en: 'Cosmic Horror', tr: 'Kozmik Korku', ja: 'コズミックホラー', fr: 'Horreur Cosmique' },
  macera: { en: 'Adventure', tr: 'Macera', ja: '冒険', fr: 'Aventure' },
  okul: { en: 'School', tr: 'Okul', ja: '学園', fr: 'École' },
  parodi: { en: 'Parody', tr: 'Parodi', ja: 'パロディ', fr: 'Parodie' },
  psikolojik: { en: 'Psychological', tr: 'Psikolojik', ja: '心理', fr: 'Psychologique' },
  romantizm: { en: 'Romance', tr: 'Romantizm', ja: 'ロマンス', fr: 'Romance' },
  samuray: { en: 'Samurai', tr: 'Samuray', ja: '侍', fr: 'Samouraï' },
  spor: { en: 'Sports', tr: 'Spor', ja: 'スポーツ', fr: 'Sports' },
  'süper güç': { en: 'Super Power', tr: 'Süper Güç', ja: '超能力', fr: 'Super-Pouvoir' },
  güçlenme: { en: 'Super Power', tr: 'Güçlenme', ja: 'パワーアップ', fr: 'Puissance' },
  tarihi: { en: 'Historical', tr: 'Tarihi', ja: '歴史', fr: 'Historique' },
  uzaylı: { en: 'Sci-Fi', tr: 'Uzaylı', ja: '宇宙人', fr: 'Extraterrestre' },
};

const baseLang = (lang?: string): string => {
  const raw = lang || i18n.language || 'tr';
  return String(raw).split('-')[0].toLowerCase();
};

/** Tek tür adını geçerli dile çevirir; bilinmiyorsa orijinali döner. */
export function localizeGenre(name: string, lang?: string): string {
  if (!name) return name;
  const base = baseLang(lang);
  const entry = GENRE_MAP[name.trim().toLowerCase()];
  if (!entry) return name;
  const translated = (entry as any)[base];
  return translated || entry.en;
}

/** Tür listesini geçerli dile çevirir. */
export function localizeGenres(names: string[], lang?: string): string[] {
  return (names || []).map((name) => localizeGenre(name, lang));
}
