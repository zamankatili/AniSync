/**
 * Küratörlü "Xianxia & Donghua" rafı.
 *
 * Kurallar:
 * - Her kayıt gerçek bir AniList meta verisine bağlıdır (id, yıl, format, kapak).
 * - Uydurma başlık, yıl veya kapak yok; kapaklar AniList CDN’inden gelir.
 * - Roman metni barındırılmaz. `novelSearchUrl` yalnız NovelUpdates arama
 *   sayfasına gider (kaynağı bulmak için); alıntı/özet kopyalanmaz.
 * - Elle küratörlüdür ve "canlı" iddiası taşımaz; son kontrol tarihi sabittir.
 */

export type ShelfKind = 'donghua' | 'manhua';
export type ShelfTag = 'xianxia' | 'cultivation' | 'wuxia' | 'fantasy' | 'modern';

export interface ShelfEntry {
  id: string;
  kind: ShelfKind;
  anilistId: number;
  anilistUrl: string;
  /** İngilizce/resmî gösterim adı. */
  title: string;
  /** AniList romanizasyonu (arama için). */
  titleRomaji: string;
  /** Orijinal Çince başlık. */
  titleNative: string;
  year: number;
  format: string;
  episodes?: number;
  chapters?: number;
  tags: ShelfTag[];
  cover: string;
  novelSearchUrl?: string;
  notes: { tr: string; en: string; ja: string; fr: string };
}

/** Rafın son elle doğrulandığı tarih (AniList kayıtları + bağlantılar). */
export const SHELF_LAST_CHECKED = '2026-11-17';

export const DONGHUA_SHELF: ShelfEntry[] = [
  {
    id: 'fanren-xiuxian-zhuan',
    kind: 'donghua',
    anilistId: 115844,
    anilistUrl: 'https://anilist.co/anime/115844',
    title: 'A Record of a Mortal\'s Journey to Immortality',
    titleRomaji: 'Fanren Xiu Xian Zhuan',
    titleNative: '凡人修仙传',
    year: 2020,
    format: 'ONA',
    episodes: 17,
    tags: ['xianxia', 'cultivation'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx115844-UFnSJplzMwRr.png',
    novelSearchUrl:
      'https://www.novelupdates.com/series-finder/?sf=1&sh=A%20Record%20of%20a%20Mortal%27s%20Journey%20to%20Immortality',
    notes: {
      tr: 'Han Li, sıradan bir köylü çocuğu olarak cultivation dünyasına girer; sabır ve hazırlık öne çıkar.',
      en: 'Han Li enters the cultivation world as an ordinary village boy; patience and preparation carry him.',
      ja: '韓立は平凡な村の少年として修行の世界に入る。忍耐と準備が武器になる。',
      fr: 'Han Li entre dans le monde de la cultivation comme un simple garçon de village ; la patience et la préparation le portent.',
    },
  },
  {
    id: 'douluo-dalu',
    kind: 'donghua',
    anilistId: 101920,
    anilistUrl: 'https://anilist.co/anime/101920',
    title: 'Soul Land',
    titleRomaji: 'Douluo Dalu',
    titleNative: '斗罗大陆',
    year: 2018,
    format: 'ONA',
    episodes: 26,
    tags: ['cultivation', 'fantasy'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101920-g7P83Uveo26D.png',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=Douluo%20Dalu',
    notes: {
      tr: 'Tang San ruh ustası olarak doğar; akademi ve turnuvalar güç kademelerini görünür kılar.',
      en: 'Tang San is born a spirit master; academies and tournaments make the power ladder visible.',
      ja: '唐三は武魂師として生まれ、学院と大会が力の階段を可視化する。',
      fr: 'Tang San naît maître d\'esprit ; académies et tournois rendent visible l\'échelle de puissance.',
    },
  },
  {
    id: 'doupo-cangqiong',
    kind: 'donghua',
    anilistId: 102464,
    anilistUrl: 'https://anilist.co/anime/102464',
    title: 'Battle Through the Heavens',
    titleRomaji: 'Dou Po Cangqiong',
    titleNative: '斗破苍穹',
    year: 2017,
    format: 'ONA',
    episodes: 12,
    tags: ['xianxia', 'cultivation'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx102464-jgCh7bsSI0Bg.jpg',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=Battle%20Through%20the%20Heavens',
    notes: {
      tr: 'Xiao Yan gücünü yitirir ve simya ile dövüşü birleştirerek geri döner.',
      en: 'Xiao Yan loses his power and returns by combining alchemy with combat.',
      ja: '蕭炎は力を失い、錬丹と戦いを組み合わせて復帰する。',
      fr: 'Xiao Yan perd sa puissance et revient en mêlant alchimie et combat.',
    },
  },
  {
    id: 'xian-wang-richang',
    kind: 'donghua',
    anilistId: 114121,
    anilistUrl: 'https://anilist.co/anime/114121',
    title: 'The Daily Life of the Immortal King',
    titleRomaji: 'Xian Wang De Richang Shenghuo',
    titleNative: '仙王的日常生活',
    year: 2020,
    format: 'ONA',
    episodes: 15,
    tags: ['xianxia', 'modern'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx114121-vxWVgIBlBjox.png',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=The%20Daily%20Life%20of%20the%20Immortal%20King',
    notes: {
      tr: 'Wang Ling olağanüstü güçlüdür ama sıradan bir lise öğrencisi gibi görünmeye çalışır.',
      en: 'Wang Ling is absurdly powerful but tries to pass as an ordinary high-schooler.',
      ja: '王令は桁違いに強いが、普通の高校生として振る舞おうとする。',
      fr: 'Wang Ling est absurdement puissant mais tente de passer pour un lycéen ordinaire.',
    },
  },
  {
    id: 'tian-guan-ci-fu',
    kind: 'donghua',
    anilistId: 113260,
    anilistUrl: 'https://anilist.co/anime/113260',
    title: 'Heaven Official\'s Blessing',
    titleRomaji: 'Tian Guan Ci Fu',
    titleNative: '天官赐福',
    year: 2020,
    format: 'ONA',
    episodes: 11,
    tags: ['xianxia', 'fantasy'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113260-4LPAAKCSJe8f.jpg',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=Tian%20Guan%20Ci%20Fu',
    notes: {
      tr: 'Xie Lian üç kez sürgün edilmiş bir tanrıdır; göksel bürokrasi ile yeryüzü arasında gidip gelir.',
      en: 'Xie Lian is a god exiled three times, moving between celestial bureaucracy and the mortal realm.',
      ja: '謝怜は三度追放された神。天界の役所と下界を行き来する。',
      fr: 'Xie Lian est un dieu exilé trois fois, entre bureaucratie céleste et monde mortel.',
    },
  },
  {
    id: 'mo-dao-zu-shi',
    kind: 'donghua',
    anilistId: 101972,
    anilistUrl: 'https://anilist.co/anime/101972',
    title: 'Grandmaster of Demonic Cultivation',
    titleRomaji: 'Modao Zushi',
    titleNative: '魔道祖师',
    year: 2018,
    format: 'ONA',
    episodes: 15,
    tags: ['xianxia', 'fantasy'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx101972-dep8Bcte5jQd.jpg',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=Mo%20Dao%20Zu%20Shi',
    notes: {
      tr: 'Wei Wuxian’ın ölümünden sonraki dönüşü ve klanlar arası siyaset.',
      en: 'Wei Wuxian\'s return after death, amid clan politics.',
      ja: '魏無羨の死後の帰還と、一族同士の政治劇。',
      fr: 'Le retour de Wei Wuxian après sa mort, au milieu de la politique des clans.',
    },
  },
  {
    id: 'shiguang-dailiren',
    kind: 'donghua',
    anilistId: 126403,
    anilistUrl: 'https://anilist.co/anime/126403',
    title: 'Link Click',
    titleRomaji: 'Shiguang Dailiren',
    titleNative: '时光代理人',
    year: 2021,
    format: 'ONA',
    episodes: 11,
    tags: ['modern', 'fantasy'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx126403-BfVSRzWUtVFW.png',
    notes: {
      tr: 'Fotoğrafa dokunarak geçmişe giren iki arkadaş; donghua yalnızca xianxia değildir.',
      en: 'Two friends enter photographs to reach the past; donghua is not only xianxia.',
      ja: '写真に触れて過去へ入る二人の友人。ドンファは仙侠だけではない。',
      fr: 'Deux amis entrent dans les photos pour atteindre le passé ; le donghua n\'est pas que du xianxia.',
    },
  },
  {
    id: 'cike-wu-liuqi',
    kind: 'donghua',
    anilistId: 107912,
    anilistUrl: 'https://anilist.co/anime/107912',
    title: 'Scissor Seven',
    titleRomaji: 'Cike Wu Liuqi',
    titleNative: '刺客伍六七',
    year: 2018,
    format: 'ONA',
    episodes: 10,
    tags: ['modern', 'wuxia'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx107912-pLrOL1AzEIEt.jpg',
    notes: {
      tr: 'Hafızasını yitirmiş bir suikastçı, berber olarak çalışırken kendini arar.',
      en: 'A memory-lost assassin works as a barber while searching for himself.',
      ja: '記憶を失った殺し屋が、床屋として働きながら自分を探す。',
      fr: 'Un assassin amnésique travaille comme coiffeur tout en se cherchant.',
    },
  },
  {
    id: 'tunshi-xingkong',
    kind: 'donghua',
    anilistId: 117012,
    anilistUrl: 'https://anilist.co/anime/117012',
    title: 'Swallowed Star',
    titleRomaji: 'Tunshi Xingkong',
    titleNative: '吞噬星空',
    year: 2020,
    format: 'ONA',
    episodes: 26,
    tags: ['cultivation', 'fantasy'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx117012-l2rktMbQbn0Z.png',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=Swallowed%20Star',
    notes: {
      tr: 'Canavar istilasından sonra Luo Feng, hayatta kalmak için dövüş eğitimi alır.',
      en: 'After a monster invasion, Luo Feng trains to survive.',
      ja: '怪物の襲来後、羅峰は生き残るために戦いを学ぶ。',
      fr: 'Après une invasion de monstres, Luo Feng s\'entraîne pour survivre.',
    },
  },
  {
    id: 'yao-shen-ji',
    kind: 'manhua',
    anilistId: 86707,
    anilistUrl: 'https://anilist.co/manga/86707',
    title: 'Tales of Demons and Gods',
    titleRomaji: 'Yao Shen Ji',
    titleNative: '妖神记',
    year: 2015,
    format: 'MANGA',
    tags: ['xianxia', 'cultivation'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86707-QD3UyAOHUEaT.jpg',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=Tales%20of%20Demons%20and%20Gods',
    notes: {
      tr: 'Nie Li ölümünden sonra gençliğine döner ve bilgisiyle klanını korumaya çalışır.',
      en: 'Nie Li returns to his youth after death and uses his knowledge to protect his clan.',
      ja: '聶離は死後、若き日に戻り、知識で一族を守ろうとする。',
      fr: 'Nie Li revient à sa jeunesse après sa mort et protège son clan grâce à son savoir.',
    },
  },
  {
    id: 'wu-lian-dianfeng',
    kind: 'manhua',
    anilistId: 104494,
    anilistUrl: 'https://anilist.co/manga/104494',
    title: 'Martial Peak',
    titleRomaji: 'Wu Lian Dianfeng',
    titleNative: '武炼巅峰',
    year: 2018,
    format: 'MANGA',
    tags: ['cultivation'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx104494-xmWuGEwxzbfB.jpg',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=Martial%20Peak',
    notes: {
      tr: 'Yang Kai, düşük seviyeli bir öğrenciden kademeleri aşarak yükselir.',
      en: 'Yang Kai climbs from a low-ranked disciple through the cultivation stages.',
      ja: '楊開は下位の弟子から修行の段階を上がっていく。',
      fr: 'Yang Kai s’élève depuis le rang de disciple inférieur à travers les paliers de cultivation.',
    },
  },
  {
    id: 'bai-lian-cheng-shen',
    kind: 'manhua',
    anilistId: 101408,
    anilistUrl: 'https://anilist.co/manga/101408',
    title: 'Apotheosis',
    titleRomaji: 'Bai Lian Cheng Shen',
    titleNative: '百炼成神',
    year: 2015,
    format: 'MANGA',
    chapters: 1311,
    tags: ['cultivation'],
    cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101408-Ym79QPjdXk8F.jpg',
    novelSearchUrl: 'https://www.novelupdates.com/series-finder/?sf=1&sh=Apotheosis',
    notes: {
      tr: 'Luo Zheng, ailesinin düşüşünden sonra güçlenmek için yeteneklerini geliştirir.',
      en: 'After his family\'s fall, Luo Zheng develops his abilities to grow strong.',
      ja: '羅征は一族の没落後、力を得るために才能を磨く。',
      fr: 'Après la chute de sa famille, Luo Zheng développe ses capacités pour devenir fort.',
    },
  },
];

export const SHELF_TAG_ORDER: ShelfTag[] = [
  'xianxia',
  'cultivation',
  'wuxia',
  'fantasy',
  'modern',
];

export const getShelfEntry = (id: string): ShelfEntry | undefined =>
  DONGHUA_SHELF.find((entry) => entry.id === id);
