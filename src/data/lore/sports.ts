import { WorldLore } from './types';

export const sportsLore: WorldLore = {
  worldId: 'sports',
  summary: 'Takım ruhu, azim ve rekabetin ön planda olduğu spor dünyası. Voleybol, basketbol, futbol ve diğer sporlar. Antrenman, maçlar, turnuvalar ve takım dinamikleri. Hiçbir süper güç yok; sadece azim ve yetenek.',
  history: 'Spor anime türü, azim ve takım çalışmasını merkeze alır. Haikyuu!! (voleybol), Kuroko no Basket (basketbol), Blue Lock (futbol), Slam Dunk (basketbol), Yuri on Ice (buz pateni), Free! (yüzme) türün temel taşlarıdır. "Spokon" (spor + konjou/azim) alt türü.',
  powerSystem: {
    name: 'Fiziksel Yetenek / Teknik / Taktik',
    description: 'Güç sistemi yoktur. İlerleme fiziksel antrenman, teknik mükemmelleştirme ve taktik zeka ile ölçülür. "Zone" (akma durumu), "flow state" sporcu performansının zirvesi.',
    ranks: ['Acemi', 'Orta Seviye', 'Lise Takımı', 'Bölgesel', 'Ulusal', 'Profesyonel']
  },
  factions: [
    { name: 'Okul Takımı', description: 'Lise spor takımı. Antrenman ve maçlar.', alignment: 'good' },
    { name: 'Rakip Okullar', description: 'Bölge ve ulusal turnuvalardaki rakipler.', alignment: 'neutral' },
    { name: 'Milli Takım', description: 'Ülke temsili. En üst seviye.', alignment: 'good' },
    { name: 'Profesyonel Kulüp', description: 'Profesyonel spor kulüpleri.', alignment: 'neutral' }
  ],
  locations: [
    { name: 'Spor Salonu', description: 'Antrenman mekanı. Kondisyon ve teknik.', dangerLevel: 'low' },
    { name: 'Maç Sahası', description: 'Resmi maçlar. Turnuva atmosferi.', dangerLevel: 'low' },
    { name: 'Antrenman Kampı', description: 'Yaz kampı. Yoğun antrenman.', dangerLevel: 'low' },
    { name: 'Turnuva Arenası', description: 'Büyük turnuvalar. Ulusal/uluslararası.', dangerLevel: 'low' }
  ],
  notableCharacters: [
    { name: 'Shoyo Hinata', role: 'Haikyuu!! - Orta blokör, sıçrayıcı', powerLevel: 75 },
    { name: 'Tobio Kageyama', role: 'Haikyuu!! - Pasör, deha', powerLevel: 85 },
    { name: 'Tetsuya Kuroko', role: 'Kuroko no Basket - Misdirection', powerLevel: 70 },
    { name: 'Seijuro Akashi', role: 'Kuroko no Basket - İmparatorluk Gözü', powerLevel: 90 },
    { name: 'Yoichi Isagi', role: 'Blue Lock - Egoist forvet', powerLevel: 80 },
    { name: 'Hanamichi Sakuragi', role: 'Slam Dunk - Çaylak, potansiyel', powerLevel: 60 }
  ],
  keyEvents: [
    'Takıma katılma',
    'İlk maç',
    'Bölge turnuvası',
    'Ulusal turnuva',
    'Rakip ile karşılaşma',
    'Mezuniyet / kariyer kararı'
  ],
  themes: ['Azim', 'Takım Çalışması', 'Rekabet', 'Büyüme', 'Dostluk', 'Kaybetmek ve Öğrenmek', 'Tutku'],
  sourceSeries: ['Haikyuu!!', 'Kuroko no Basket', 'Blue Lock', 'Slam Dunk', 'Yuri on Ice', 'Free!', 'Ace of Diamond'],
  ja: {
    summary: 'チームスピリット、根性、そして競争が主役のスポーツワールド。バレーボール、バスケットボール、サッカー、そしてその他のスポーツ。練習、試合、トーナメント、チームダイナミクス。超能力は存在せず、ただ根性と才能だけ。',
    history: 'スポーツアニメのジャンルは、根性とチームワークを中心に据える。『ハイキュー!!』（バレーボール）、『黒子のバスケ』（バスケットボール）、『ブルーロック』（サッカー）、『スラムダンク』（バスケットボール）、『ユーリ!!! on ICE』（フィギュアスケート）、『Free!』（水泳）がジャンルの根幹。『スポ根』（スポーツ＋根性）サブジャンル。',
    powerSystem: {
      name: '肉体的な才能と技術、戦術',
      description: 'パワーシステムは存在しない。上達は肉体的な鍛錬、技術の完璧化、戦術的な知性で測られる。『ゾーン』（フロー状態）がアスリートのパフォーマンスの頂点。',
      ranks: ['初心者', '中級者', '高校チーム', '地区大会', '全国大会', 'プロ']
    },
    factions: [
      { name: '高校チーム', description: '高校のスポーツチーム。練習と試合。', alignment: 'good' },
      { name: 'ライバル校', description: '地区・全国大会でのライバル。', alignment: 'neutral' },
      { name: '代表チーム', description: '国代表。最高レベル。', alignment: 'good' },
      { name: 'プロクラブ', description: 'プロのスポーツクラブ。', alignment: 'neutral' }
    ],
    locations: [
      { name: '体育館', description: '練習場所。体力と技術。', dangerLevel: 'low' },
      { name: '試合会場', description: '正式な試合。トーナメントの雰囲気。', dangerLevel: 'low' },
      { name: '合宿所', description: '夏合宿。集中的な練習。', dangerLevel: 'low' },
      { name: 'トーナメントの舞台', description: '大きな大会。全国・国際。', dangerLevel: 'low' }
    ],
    notableCharacters: [
      { name: '日向翔陽', role: 'ハイキュー!! - ミドルブロッカー、ジャンプの天才', powerLevel: 75 },
      { name: '影山飛雄', role: 'ハイキュー!! - セッター、天才', powerLevel: 85 },
      { name: '黒子テツヤ', role: '黒子のバスケ - ミスディレクション', powerLevel: 70 },
      { name: '赤司征十郎', role: '黒子のバスケ - 黄帝の眼', powerLevel: 90 },
      { name: '潔世一', role: 'ブルーロック - エゴイストのフォワード', powerLevel: 80 },
      { name: '桜木花道', role: 'スラムダンク - 新人、可能性の塊', powerLevel: 60 }
    ],
    keyEvents: ['チームへの入部', '初試合', '地区大会', '全国大会', 'ライバルとの対決', '卒業／キャリアの決断'],
    themes: ['根性', 'チームワーク', '競争', '成長', '友情', '敗北から学ぶ', '情熱']
  },
  fr: {
    summary: 'Un monde de sport dominé par l\'esprit d\'équipe, la détermination et la compétition. Volleyball, basketball, football et plus encore. Entraînement, matchs, tournois et dynamique d\'équipe. Aucun super pouvoir, seulement la ténacité et le talent.',
    history: 'Le genre des anime sportifs place la ténacité et l\'esprit d\'équipe au centre. Haikyuu!! (volleyball), Kuroko no Basket (basketball), Blue Lock (football), Slam Dunk (basketball), Yuri on Ice (patinage), Free! (natation) en sont les piliers. Le sous-genre « spokon » (sport + konjou/détermination).',
    powerSystem: {
      name: 'Talent physique, technique et tactique',
      description: 'Il n\'y a pas de système de pouvoir. La progression se mesure par l\'entraînement physique, la maîtrise technique et l\'intelligence tactique. Le « Zone » (état de flow) est le sommet de la performance athlétique.',
      ranks: ['Débutant', 'Intermédiaire', 'Équipe scolaire', 'Tournoi régional', 'Tournoi national', 'Professionnel']
    },
    factions: [
      { name: 'Équipe scolaire', description: 'Équipe sportive du lycée. Entraînement et matchs.', alignment: 'good' },
      { name: 'Écoles rivales', description: 'Rivales des tournois régionaux et nationaux.', alignment: 'neutral' },
      { name: 'Équipe nationale', description: 'Représentation du pays. Le plus haut niveau.', alignment: 'good' },
      { name: 'Club professionnel', description: 'Clubs sportifs professionnels.', alignment: 'neutral' }
    ],
    locations: [
      { name: 'Gymnase', description: 'Lieu d\'entraînement. Condition physique et technique.', dangerLevel: 'low' },
      { name: 'Terrain de match', description: 'Matchs officiels. Atmosphère de tournoi.', dangerLevel: 'low' },
      { name: 'Camp d\'entraînement', description: 'Stage d\'été. Entraînement intensif.', dangerLevel: 'low' },
      { name: 'Arène de tournoi', description: 'Grands tournois, nationaux et internationaux.', dangerLevel: 'low' }
    ],
    notableCharacters: [
      { name: 'Shōyō Hinata', role: 'Haikyuu!! - Bloc-centre, sauteur', powerLevel: 75 },
      { name: 'Tobio Kageyama', role: 'Haikyuu!! - Passeur, génie', powerLevel: 85 },
      { name: 'Tetsuya Kuroko', role: 'Kuroko no Basket - Misdirection', powerLevel: 70 },
      { name: 'Seijūrō Akashi', role: 'Kuroko no Basket - Œil de l\'Empereur', powerLevel: 90 },
      { name: 'Yōichi Isagi', role: 'Blue Lock - Attaquant égoïste', powerLevel: 80 },
      { name: 'Hanamichi Sakuragi', role: 'Slam Dunk - Débutant au potentiel énorme', powerLevel: 60 }
    ],
    keyEvents: ['Rejoindre l\'équipe', 'Premier match', 'Tournoi régional', 'Tournoi national', 'Affrontement avec le rival', 'Diplôme / décision de carrière'],
    themes: ['Détermination', 'Esprit d\'équipe', 'Compétition', 'Croissance', 'Amitié', 'Apprendre en perdant', 'Passion']
  }
};