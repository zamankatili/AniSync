import { AnimeCharacter } from '../types';

export const CHARACTERS_POOL: (AnimeCharacter & { hints: string[]; genre: string })[] = [
  {
    id: 'char_1',
    name: 'Monkey D. Luffy',
    series: 'One Piece',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/9/131031.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    hints: ['Hasır Şapka Korsanları Kaptanı', 'Gomu Gomu no Mi / Hito Hito no Mi', 'Korsanlar Kralı olmak istiyor']
  },
  {
    id: 'char_2',
    name: 'Roronoa Zoro',
    series: 'One Piece',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/3/100534.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    hints: ['Üç Kılıç Ustası (Santoryu)', 'Sürekli yönünü kaybeder', 'Dünyanın en iyi kılıç ustası olmayı hedefler']
  },
  {
    id: 'char_3',
    name: 'Gojo Satoru',
    series: 'Jujutsu Kaisen',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/15/422168.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    hints: ['Altı Göz ve Sınırsızlık (Limitless) gücü', 'Özel Derece Büyücü', 'Körbandı ve beyaz saçlarıyla bilinir']
  },
  {
    id: 'char_4',
    name: 'Levi Ackerman',
    series: 'Attack on Titan',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/2/241416.jpg',
    difficulty: 'easy',
    genre: 'Seinen/Shounen',
    hints: ['İnsanlığın En Güçlü Askeri', 'Keşif Birliği Özel Harekat Tim Lideri', 'Temizlik takıntısı var']
  },
  {
    id: 'char_5',
    name: 'Eren Yeager',
    series: 'Attack on Titan',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/10/216895.jpg',
    difficulty: 'easy',
    genre: 'Seinen/Shounen',
    hints: ['Saldırı Devi ve Kurucu Dev taşıyıcısı', 'Tüm devleri yok etmeye yemin etmişti', '"Tatakae" repliğiyle tanınır']
  },
  {
    id: 'char_6',
    name: 'Naruto Uzumaki',
    series: 'Naruto',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/2/284121.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    hints: ['Yedinci Hokage', 'Dokuz Kuyruklu Tilki (Kurama) Jinchuuriki\'si', 'Ramen aşığı']
  },
  {
    id: 'char_7',
    name: 'Sasuke Uchiha',
    series: 'Naruto',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/9/131317.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    hints: ['Sharingan ve Rinnegan sahibi', 'Chidori tekniği', 'İntikam peşindeki Uchiha klanı üyesi']
  },
  {
    id: 'char_8',
    name: 'Frieren',
    series: 'Sousou no Frieren',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/7/523292.jpg',
    difficulty: 'easy',
    genre: 'Fantasy',
    hints: ['Bin yaşını aşkın elf büyücü', 'Kahraman Himmel\'in yol arkadaşı', 'Büyü büyü kitapları toplar']
  },
  {
    id: 'char_9',
    name: 'Edward Elric',
    series: 'Fullmetal Alchemist',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/9/72533.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    hints: ['Çelik Simyacı (Fullmetal Alchemist)', 'Kısa boyuyla dalga geçilmesinden nefret eder', 'Çember çizmeden simya yapabilir']
  },
  {
    id: 'char_10',
    name: 'Light Yagami',
    series: 'Death Note',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/6/63870.jpg',
    difficulty: 'easy',
    genre: 'Psychological',
    hints: ['Yeni Dünyanın Tanrısı olmak istedi', 'Kira takma adıyla bilindi', 'Ölüm Defteri\'nin ilk insan kullanıcısı']
  },
  {
    id: 'char_11',
    name: 'L Lawliet',
    series: 'Death Note',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/10/76530.jpg',
    difficulty: 'easy',
    genre: 'Psychological',
    hints: ['Dünyanın en iyi dedektifi', 'Garip oturuş tarzı ve tatlı düşkünlüğü', 'Kira soruşturmasını yönetti']
  },
  {
    id: 'char_12',
    name: 'Guts',
    series: 'Berserk',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/15/73138.jpg',
    difficulty: 'medium',
    genre: 'Seinen',
    hints: ['Kara Kılıç Ustası (The Black Swordsman)', 'Ejderha Biçici (Dragonslayer) kılıcı', 'Kader ve Tanrı Eli\'ne karşı savaşır']
  },
  {
    id: 'char_13',
    name: 'Saitama',
    series: 'One Punch Man',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/11/294388.jpg',
    difficulty: 'easy',
    genre: 'Shounen/Comedy',
    hints: ['Hobi olarak kahramanlık yapar', 'Tek yumrukla düşmanlarını alt eder', 'Süpermarket indirimlerini asla kaçırmaz']
  },
  {
    id: 'char_14',
    name: 'Killua Zoldyck',
    series: 'Hunter x Hunter',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/2/327920.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    hints: ['Efsanevi suikastçı ailesinin varisi', 'Nen gücü elektrik temellidir (Godspeed)', 'Yo-yo ve kaykay kullanır']
  },
  {
    id: 'char_15',
    name: 'Spike Spiegel',
    series: 'Cowboy Bebop',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/4/51162.jpg',
    difficulty: 'medium',
    genre: 'Classic/Sci-Fi',
    hints: ['Bebop gemisinde ödül avcısı', 'Jeet Kune Do dövüş stili', '"Bang" repliğiyle tarihe geçti']
  },
  {
    id: 'char_16',
    name: 'Sung Jin-Woo',
    series: 'Solo Leveling',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/12/533481.jpg',
    difficulty: 'easy',
    genre: 'Action/Fantasy',
    hints: ['Gölge Hükümdarı (Shadow Monarch)', '"Arise" (Uyan) komutu', 'En zayıf E-seviye avcıdan tek başına level atlayan efsaneye']
  },
  {
    id: 'char_17',
    name: 'Taro Sakamoto',
    series: 'Sakamoto Days',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/13/554122.jpg',
    difficulty: 'medium',
    genre: 'Shounen',
    hints: ['Eski efsanevi suikastçı', 'Huzurlu bir market işletmecisi ve aile babası', 'Kavga anında zayıflayıp eski formuna döner']
  },
  {
    id: 'char_18',
    name: 'Thorfinn',
    series: 'Vinland Saga',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/8/415174.jpg',
    difficulty: 'medium',
    genre: 'Seinen',
    hints: ['Thors\'un oğlu', 'Askeladd\'dan intikam almak için yıllarca savaştı', '"Benim hiç düşmanım yok" felsefesini benimsedi']
  },
  {
    id: 'char_19',
    name: 'Ken Kaneki',
    series: 'Tokyo Ghoul',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/9/265033.jpg',
    difficulty: 'easy',
    genre: 'Dark Fantasy',
    hints: ['Tek Gözlü Hortlak (One-Eyed Ghoul)', 'Beyaz saç ve kırkayak kagune', 'Parmak çıtlatma alışkanlığı']
  },
  {
    id: 'char_20',
    name: 'Tanjiro Kamado',
    series: 'Demon Slayer: Kimetsu no Yaiba',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/12/386457.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    hints: ['Su ve Güneş Nefesi kullanıcısı', 'Kız kardeşi Nezuko\'yu insana dönüştürmeye çalışır', 'Koku alma duyusu son derece gelişmiştir']
  }
];

export function getDailyCharacter(): (AnimeCharacter & { hints: string[]; genre: string }) {
  // Rotate deterministically every day at midnight (UTC/Local)
  const now = new Date();
  const dateSeed = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
  const index = Math.abs(dateSeed) % CHARACTERS_POOL.length;
  return CHARACTERS_POOL[index];
}
