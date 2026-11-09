import { AnimeCharacter } from '../types';
import { getDailyDateKey } from '../lib/dailyDate';

export type DleHintLanguage = 'tr' | 'en' | 'ja' | 'fr';

export interface DleCharacter extends AnimeCharacter {
  /** Dört dilde ipuçları; eksik dil TR'ye düşer. */
  hints: Record<DleHintLanguage, string[]>;
  genre: string;
  /** Kullanıcının yazabileceği alternatif adlar (takma ad, kısa ad). */
  aliases?: string[];
}

export const CHARACTERS_POOL: DleCharacter[] = [
  {
    id: 'char_1',
    name: 'Monkey D. Luffy',
    series: 'One Piece',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/9/310307.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    aliases: ['luffy', 'straw hat', 'mugiwara'],
    hints: {
      tr: ['Hasır Şapka Korsanları Kaptanı', 'Gomu Gomu no Mi / Hito Hito no Mi', 'Korsanlar Kralı olmak istiyor'],
      en: ['Captain of the Straw Hat Pirates', 'Gomu Gomu no Mi / Hito Hito no Mi', 'Wants to become the Pirate King'],
      ja: ['麦わらの一味の船長', 'ゴムゴムの実／ヒトヒトの実', '海賊王を目指している'],
      fr: ['Capitaine des Chapeaux de Paille', 'Gomu Gomu no Mi / Hito Hito no Mi', 'Veut devenir le Roi des Pirates'],
    },
  },
  {
    id: 'char_2',
    name: 'Roronoa Zoro',
    series: 'One Piece',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/3/100534.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    aliases: ['zoro'],
    hints: {
      tr: ['Üç Kılıç Ustası (Santoryu)', 'Sürekli yönünü kaybeder', 'Dünyanın en iyi kılıç ustası olmayı hedefler'],
      en: ['Three-sword style master (Santoryu)', 'Gets lost constantly', 'Aims to be the world\'s greatest swordsman'],
      ja: ['三刀流の使い手', 'いつも道に迷う', '世界一の剣豪を目指す'],
      fr: ['Maître du style à trois sabres (Santoryu)', 'Se perd tout le temps', 'Veut devenir le meilleur épéiste du monde'],
    },
  },
  {
    id: 'char_3',
    name: 'Gojo Satoru',
    series: 'Jujutsu Kaisen',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/15/422168.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    aliases: ['gojo', 'satoru'],
    hints: {
      tr: ['Altı Göz ve Sınırsızlık (Limitless) gücü', 'Özel Derece Büyücü', 'Körbandı ve beyaz saçlarıyla bilinir'],
      en: ['Six Eyes and Limitless', 'Special Grade Sorcerer', 'Known for his blindfold and white hair'],
      ja: ['六眼と無下限呪術', '特級呪術師', '目隠しと白髪で知られる'],
      fr: ['Six Yeux et l\'Infini', 'Sorcier de grade spécial', 'Connu pour son bandeau et ses cheveux blancs'],
    },
  },
  {
    id: 'char_4',
    name: 'Levi Ackerman',
    series: 'Attack on Titan',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/2/241413.jpg',
    difficulty: 'easy',
    genre: 'Seinen/Shounen',
    aliases: ['levi', 'ackerman'],
    hints: {
      tr: ['İnsanlığın En Güçlü Askeri', 'Keşif Birliği Özel Harekat Tim Lideri', 'Temizlik takıntısı var'],
      en: ['Humanity\'s Strongest Soldier', 'Special Operations Squad leader of the Survey Corps', 'Has an obsession with cleanliness'],
      ja: ['人類最強の兵士', '調査兵団・特別作戦班の班長', '潔癖症'],
      fr: ['Le soldat le plus fort de l\'humanité', 'Chef de l\'escouade d\'opérations spéciales', 'Obsédé par la propreté'],
    },
  },
  {
    id: 'char_5',
    name: 'Eren Yeager',
    series: 'Attack on Titan',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/10/216895.jpg',
    difficulty: 'easy',
    genre: 'Seinen/Shounen',
    aliases: ['eren', 'yeager'],
    hints: {
      tr: ['Saldırı Devi ve Kurucu Dev taşıyıcısı', 'Tüm devleri yok etmeye yemin etmişti', '"Tatakae" repliğiyle tanınır'],
      en: ['Holder of the Attack and Founding Titans', 'Swore to destroy all Titans', 'Known for the line "Tatakae"'],
      ja: ['進撃の巨人と始祖の巨人の継承者', '全ての巨人を駆逐すると誓った', '「戦え」という台詞で有名'],
      fr: ['Détenteur du Titan Assaillant et du Titan Fondateur', 'A juré de détruire tous les Titans', 'Connu pour la réplique « Tatakae »'],
    },
  },
  {
    id: 'char_6',
    name: 'Naruto Uzumaki',
    series: 'Naruto',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/2/284121.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    aliases: ['naruto', 'uzumaki'],
    hints: {
      tr: ['Yedinci Hokage', 'Dokuz Kuyruklu Tilki (Kurama) Jinchuuriki\'si', 'Ramen aşığı'],
      en: ['Seventh Hokage', 'Jinchuriki of the Nine-Tailed Fox (Kurama)', 'Ramen lover'],
      ja: ['七代目火影', '九尾の狐（クラマ）の人柱力', 'ラーメン好き'],
      fr: ['Septième Hokage', 'Jinchuriki du Renard à neuf queues (Kurama)', 'Amateur de ramen'],
    },
  },
  {
    id: 'char_7',
    name: 'Sasuke Uchiha',
    series: 'Naruto',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/9/131317.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    aliases: ['sasuke', 'uchiha'],
    hints: {
      tr: ['Sharingan ve Rinnegan sahibi', 'Chidori tekniği', 'İntikam peşindeki Uchiha klanı üyesi'],
      en: ['Wielder of the Sharingan and Rinnegan', 'Chidori technique', 'Member of the revenge-driven Uchiha clan'],
      ja: ['写輪眼と輪廻眼の使い手', '千鳥の術', '復讐に駆られたうちは一族'],
      fr: ['Possède le Sharingan et le Rinnegan', 'Technique Chidori', 'Membre du clan Uchiwa assoiffé de vengeance'],
    },
  },
  {
    id: 'char_8',
    name: 'Frieren',
    series: 'Sousou no Frieren',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/7/525105.jpg',
    difficulty: 'easy',
    genre: 'Fantasy',
    aliases: ['frieren', 'sousou no frieren'],
    hints: {
      tr: ['Bin yaşını aşkın elf büyücü', 'Kahraman Himmel\'in yol arkadaşı', 'Büyü kitapları toplar'],
      en: ['An elf mage over a thousand years old', 'Companion of the hero Himmel', 'Collects grimoires'],
      ja: ['千年以上生きるエルフの魔法使い', '勇者ヒンメルの仲間', '魔導書を集めている'],
      fr: ['Une mage elfe de plus de mille ans', 'Compagne du héros Himmel', 'Collectionne les grimoires'],
    },
  },
  {
    id: 'char_9',
    name: 'Edward Elric',
    series: 'Fullmetal Alchemist',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/9/72533.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    aliases: ['edward', 'ed', 'elric', 'fullmetal'],
    hints: {
      tr: ['Çelik Simyacı (Fullmetal Alchemist)', 'Kısa boyuyla dalga geçilmesinden nefret eder', 'Çember çizmeden simya yapabilir'],
      en: ['The Fullmetal Alchemist', 'Hates being teased about his height', 'Can perform alchemy without a circle'],
      ja: ['鋼の錬金術師', '身長をからかわれるのを嫌う', '錬成陣なしで錬金術を使える'],
      fr: ['L\'Alchimiste d\'acier', 'Déteste qu\'on se moque de sa taille', 'Peut faire de l\'alchimie sans cercle'],
    },
  },
  {
    id: 'char_10',
    name: 'Light Yagami',
    series: 'Death Note',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/6/63870.jpg',
    difficulty: 'easy',
    genre: 'Psychological',
    aliases: ['light', 'yagami', 'kira'],
    hints: {
      tr: ['Yeni Dünyanın Tanrısı olmak istedi', 'Kira takma adıyla bilindi', 'Ölüm Defteri\'nin ilk insan kullanıcısı'],
      en: ['Wanted to become the god of a new world', 'Known by the alias Kira', 'First human user of the Death Note'],
      ja: ['新世界の神になろうとした', 'キラの名で知られる', 'デスノート最初の人間の使用者'],
      fr: ['Voulait devenir le dieu d\'un nouveau monde', 'Connu sous le nom de Kira', 'Premier utilisateur humain du Death Note'],
    },
  },
  {
    id: 'char_11',
    name: 'L Lawliet',
    series: 'Death Note',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/10/249647.jpg',
    difficulty: 'easy',
    genre: 'Psychological',
    aliases: ['l', 'lawliet'],
    hints: {
      tr: ['Dünyanın en iyi dedektifi', 'Garip oturuş tarzı ve tatlı düşkünlüğü', 'Kira soruşturmasını yönetti'],
      en: ['The world\'s greatest detective', 'Strange sitting posture and a sweet tooth', 'Led the Kira investigation'],
      ja: ['世界最高の名探偵', '奇妙な座り方と甘い物好き', 'キラ事件の捜査を指揮'],
      fr: ['Le meilleur détective du monde', 'Posture assise étrange et gourmandise', 'A dirigé l\'enquête sur Kira'],
    },
  },
  {
    id: 'char_12',
    name: 'Guts',
    series: 'Berserk',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/13/284125.jpg',
    difficulty: 'medium',
    genre: 'Seinen',
    aliases: ['guts', 'black swordsman'],
    hints: {
      tr: ['Kara Kılıç Ustası (The Black Swordsman)', 'Ejderha Biçici (Dragonslayer) kılıcı', 'Kader ve Tanrı Eli\'ne karşı savaşır'],
      en: ['The Black Swordsman', 'Wields the Dragonslayer', 'Fights fate and the God Hand'],
      ja: ['黒い剣士', 'ドラゴン殺しの大剣', '運命とゴッドハンドに抗う'],
      fr: ['Le Guerrier Noir', 'Manie le Pourfendeur de dragons', 'Lutte contre le destin et la Main de Dieu'],
    },
  },
  {
    id: 'char_13',
    name: 'Saitama',
    series: 'One Punch Man',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/11/294388.jpg',
    difficulty: 'easy',
    genre: 'Shounen/Comedy',
    aliases: ['saitama', 'caped baldy', 'one punch man'],
    hints: {
      tr: ['Hobi olarak kahramanlık yapar', 'Tek yumrukla düşmanlarını alt eder', 'Süpermarket indirimlerini asla kaçırmaz'],
      en: ['Hero for fun', 'Defeats enemies with a single punch', 'Never misses a supermarket sale'],
      ja: ['趣味でヒーローをやっている', 'ワンパンで敵を倒す', 'スーパーの特売を逃さない'],
      fr: ['Héros par passe-temps', 'Bat ses ennemis d\'un seul coup de poing', 'Ne rate jamais les promotions au supermarché'],
    },
  },
  {
    id: 'char_14',
    name: 'Killua Zoldyck',
    series: 'Hunter x Hunter',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/2/327920.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    aliases: ['killua', 'zoldyck'],
    hints: {
      tr: ['Efsanevi suikastçı ailesinin varisi', 'Nen gücü elektrik temellidir (Godspeed)', 'Yo-yo ve kaykay kullanır'],
      en: ['Heir to a legendary assassin family', 'His Nen is electricity-based (Godspeed)', 'Uses yo-yos and a skateboard'],
      ja: ['伝説の暗殺一家の跡継ぎ', '電気系の念能力（ゴッドスピード）', 'ヨーヨーとスケボーを使う'],
      fr: ['Héritier d\'une famille d\'assassins légendaire', 'Son Nen est basé sur l\'électricité (Godspeed)', 'Utilise des yo-yos et un skateboard'],
    },
  },
  {
    id: 'char_15',
    name: 'Spike Spiegel',
    series: 'Cowboy Bebop',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/11/516853.jpg',
    difficulty: 'medium',
    genre: 'Classic/Sci-Fi',
    aliases: ['spike', 'spiegel'],
    hints: {
      tr: ['Bebop gemisinde ödül avcısı', 'Jeet Kune Do dövüş stili', '"Bang" repliğiyle tarihe geçti'],
      en: ['A bounty hunter on the Bebop', 'Jeet Kune Do fighting style', 'Immortalized by the line "Bang"'],
      ja: ['ボベップ号の賞金稼ぎ', 'ジークンドーを駆使', '「Bang」の台詞で有名'],
      fr: ['Chasseur de primes sur le Bebop', 'Style de combat Jeet Kune Do', 'Rendu célèbre par la réplique « Bang »'],
    },
  },
  {
    id: 'char_16',
    name: 'Sung Jin-Woo',
    series: 'Solo Leveling',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/2/540692.jpg',
    difficulty: 'easy',
    genre: 'Action/Fantasy',
    aliases: ['sung jin woo', 'jinwoo', 'jin woo', 'sung jin-woo'],
    hints: {
      tr: ['Gölge Hükümdarı (Shadow Monarch)', '"Arise" (Uyan) komutu', 'En zayıf E-seviye avcıdan tek başına level atlayan efsaneye'],
      en: ['The Shadow Monarch', 'Commands with "Arise"', 'Went from the weakest E-rank hunter to a legend'],
      ja: ['影の君主', '「起きろ」の命令', '最弱のE級ハンターから伝説へ'],
      fr: ['Le Monarque des Ombres', 'Commande avec « Arise »', 'Passé du plus faible chasseur de rang E à une légende'],
    },
  },
  {
    id: 'char_17',
    name: 'Taro Sakamoto',
    series: 'Sakamoto Days',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/7/508475.jpg',
    difficulty: 'medium',
    genre: 'Shounen',
    aliases: ['sakamoto', 'taro'],
    hints: {
      tr: ['Eski efsanevi suikastçı', 'Huzurlu bir market işletmecisi ve aile babası', 'Kavga anında zayıflayıp eski formuna döner'],
      en: ['A former legendary assassin', 'Runs a peaceful grocery store and is a family man', 'Slims down and returns to his old form when fighting'],
      ja: ['元伝説の殺し屋', '平和な商店を営む家族思いの男', '戦うと痩せて元の姿に戻る'],
      fr: ['Un ancien assassin légendaire', 'Tient une épicerie paisible et est un père de famille', 'Mincit et retrouve sa forme d\'antan en combattant'],
    },
  },
  {
    id: 'char_18',
    name: 'Thorfinn',
    series: 'Vinland Saga',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/9/309871.jpg',
    difficulty: 'medium',
    genre: 'Seinen',
    aliases: ['thorfinn'],
    hints: {
      tr: ['Thors\'un oğlu', 'Askeladd\'dan intikam almak için yıllarca savaştı', '"Benim hiç düşmanım yok" felsefesini benimsedi'],
      en: ['Son of Thors', 'Fought for years to avenge Askeladd', 'Adopted the philosophy "I have no enemies"'],
      ja: ['トールズの息子', 'アシェラッドへの復讐のために長年戦った', '「俺に敵はいない」という思想を持つ'],
      fr: ['Fils de Thors', 'A combattu des années pour venger Askeladd', 'A adopté la philosophie « Je n\'ai pas d\'ennemis »'],
    },
  },
  {
    id: 'char_19',
    name: 'Ken Kaneki',
    series: 'Tokyo Ghoul',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/15/307255.jpg',
    difficulty: 'easy',
    genre: 'Dark Fantasy',
    aliases: ['kaneki', 'ken'],
    hints: {
      tr: ['Tek Gözlü Hortlak (One-Eyed Ghoul)', 'Beyaz saç ve kırkayak kagune', 'Parmak çıtlatma alışkanlığı'],
      en: ['The One-Eyed Ghoul', 'White hair and a centipede kagune', 'Habit of cracking his fingers'],
      ja: ['隻眼の喰種', '白髪とムカデの赫子', '指を鳴らす癖'],
      fr: ['Le Ghoul à un œil', 'Cheveux blancs et kagune de mille-pattes', 'A l\'habitude de faire craquer ses doigts'],
    },
  },
  {
    id: 'char_20',
    name: 'Tanjiro Kamado',
    series: 'Demon Slayer: Kimetsu no Yaiba',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/6/386735.jpg',
    difficulty: 'easy',
    genre: 'Shounen',
    aliases: ['tanjiro', 'kamado', 'kimetsu no yaiba'],
    hints: {
      tr: ['Su ve Güneş Nefesi kullanıcısı', 'Kız kardeşi Nezuko\'yu insana dönüştürmeye çalışır', 'Koku alma duyusu son derece gelişmiştir'],
      en: ['User of Water and Sun Breathing', 'Tries to turn his sister Nezuko human again', 'Has an extremely keen sense of smell'],
      ja: ['水の呼吸と日の呼吸の使い手', '妹の禰豆子を人間に戻そうとする', '異常に鋭い嗅覚'],
      fr: ['Utilise le Souffle de l\'Eau et du Soleil', 'Cherche à rendre humaine sa sœur Nezuko', 'A un odorat extrêmement développé'],
    },
  },
];

/** İpuçlarını dile göre döndürür; o dil yoksa TR'ye düşer. */
export function getCharacterHints(character: DleCharacter, language: string): string[] {
  const code = (language || 'tr').split('-')[0].toLowerCase() as DleHintLanguage;
  return character.hints[code]?.length ? character.hints[code] : character.hints.tr;
}

/**
 * Tahmin normalizasyonu: aksan, noktalama ve büyük/küçük harf farklarını
 * yok sayar. "Monkey D. Luffy" ≡ "monkey d luffy".
 */
export function normalizeCharacterName(value: string): string {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Bir tahminin doğru karakteri gösterip göstermediğini belirler.
 * Tam ad, takma adlar ve 4+ harfli ad parçaları kabul edilir
 * (örn. "Luffy", "Gojo", "Levi", "Thorfinn").
 */
export function matchesCharacter(character: DleCharacter, guess: string): boolean {
  const normalizedGuess = normalizeCharacterName(guess);
  if (!normalizedGuess) return false;

  const candidates = [character.name, ...(character.aliases ?? [])]
    .map(normalizeCharacterName)
    .filter(Boolean);
  if (candidates.includes(normalizedGuess)) return true;

  const fullName = normalizeCharacterName(character.name);
  const nameTokens = fullName.split(' ').filter((token) => token.length >= 4);
  return nameTokens.includes(normalizedGuess);
}

/**
 * Günün karakteri — TR takvim gününe göre deterministik döner.
 * Aynı gün içinde her açılışta aynı karakter, ertesi gün bir sonraki.
 */
export function getDailyCharacter(date: Date = new Date()): DleCharacter {
  const dateKey = getDailyDateKey(date);
  const dayNumber = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000);
  const index = ((dayNumber % CHARACTERS_POOL.length) + CHARACTERS_POOL.length) % CHARACTERS_POOL.length;
  return CHARACTERS_POOL[index];
}

/** Antrenman modu için rastgele karakter (mevcut olandan farklı). */
export function getRandomPracticeCharacter(excludeId?: string): DleCharacter {
  const pool = excludeId
    ? CHARACTERS_POOL.filter((character) => character.id !== excludeId)
    : CHARACTERS_POOL;
  return pool[Math.floor(Math.random() * pool.length)] ?? CHARACTERS_POOL[0];
}
