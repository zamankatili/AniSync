import { WorldLore } from './types';

export const romanceLore: WorldLore = {
  worldId: 'romance_drama',
  summary: 'Duygusal bağlar, aşk, kayıp ve insan ilişkilerinin derinlemesine işlendiği bir dünya. Romantik komedi, dram ve slice of life karışımı. Karakter gelişimi ve duygusal olgunlaşma merkezde.',
  history: 'Romantik anime türü, insan ilişkilerini ve duygusal gelişimi merkeze alır. Your Lie in April (müzik ve aşk), Clannad (aile ve kayıp), Toradora (tsundere ve aşk), Fruits Basket (lanet ve aile), Kaguya-sama (zeka oyunları ve aşk), Horimiya (gizli kimlikler) türün temel taşlarıdır.',
  powerSystem: {
    name: 'Yok (Duygusal/İnsani)',
    description: 'Güç sistemi yoktur. İlerleme duygusal olgunlaşma, iletişim becerileri ve ilişkilerle ölçülür. "Tsundere", "kuudere", "dandere" gibi arketipler.',
    ranks: ['Çocuk', 'Ergen', 'Genç Yetişkin', 'Yetişkin', 'Yaşlı']
  },
  factions: [
    { name: 'Okul (Lise)', description: 'Romantik hikayelerin en yaygın ortamı. Sınıf arkadaşları, kulüpler.', alignment: 'neutral' },
    { name: 'Aile', description: 'Aile bağları, ebeveyn-çocuk ilişkileri. Clannad\'ın merkezi.', alignment: 'good' },
    { name: 'Arkadaş Grubu', description: 'Sosyal çevre ve destek sistemi.', alignment: 'good' },
    { name: 'Rakip (Love Rival)', description: 'Aşk üçgenindeki rakip. Dram kaynağı.', alignment: 'neutral' }
  ],
  locations: [
    { name: 'Lise', description: 'Sınıf, kulüp odası, çatı. Romantik anların mekanı.', dangerLevel: 'low' },
    { name: 'Müzik Odası', description: 'Your Lie in April tarzı piyano/müzik odaları.', dangerLevel: 'low' },
    { name: 'Festival Alanı', description: 'Okul festivali, yaz festivali (matsuri). Romantik anlar.', dangerLevel: 'low' },
    { name: 'Eve Giden Yol', description: 'Okuldan eve yürüyüş. İtirafların yapıldığı yer.', dangerLevel: 'low' }
  ],
  notableCharacters: [
    { name: 'Kousei Arima', role: 'Piyano dehası, travma', powerLevel: 15 },
    { name: 'Kaori Miyazono', role: 'Keman virtüözü, özgür ruh', powerLevel: 20 },
    { name: 'Tomoya Okazaki', role: 'Clannad protagonist, aile babası', powerLevel: 25 },
    { name: 'Nagisa Furukawa', role: 'Tomoya\'nın eşi, oyuncu', powerLevel: 15 },
    { name: 'Taiga Aisaka', role: 'Tsundere, Palmtop Tiger', powerLevel: 30 },
    { name: 'Ryuji Takasu', role: 'Taiga\'nın partneri', powerLevel: 25 },
    { name: 'Kaguya Shinomiya', role: 'Zeka oyunları, aşk', powerLevel: 40 },
    { name: 'Miyuki Shirogane', role: 'Öğrenci konseyi başkanı', powerLevel: 45 }
  ],
  keyEvents: [
    'İlk görüşme / tanışma',
    'Aşk itirafı (kokuhaku)',
    'Okul festivali',
    'Mezuniyet',
    'Kayıp ve yas (Clannad)',
    'Müzik performansı (Your Lie in April)'
  ],
  themes: ['Aşk', 'Kayıp', 'Büyüme', 'Aile', 'Müzik', 'İletişim', 'Duygusal Olgunlaşma', 'Geçmişin Gölgesi'],
  sourceSeries: ['Your Lie in April', 'Clannad', 'Toradora', 'Fruits Basket', 'Kaguya-sama', 'Horimiya', 'Violet Evergarden'],
  ja: {
    summary: '感情的な絆、愛、喪失、そして人間関係を深く描く世界。ロマンチック・コメディ、ドラマ、日常の混合。キャラクターの成長と感情の成熟が中心。',
    history: '恋愛アニメのジャンルは、人間関係と感情の成長を中心に据える。『四月は君の嘘』（音楽と愛）、『CLANNAD』（家族と喪失）、『とらドラ!』（ツンデレと愛）、『フルーツバスケット』（呪いと家族）、『かぐや様』（頭脳ゲームと愛）、『Horimiya』（隠されたアイデンティティ）がジャンルの根幹。',
    powerSystem: {
      name: 'なし（感情・人間的）',
      description: 'パワーシステムは存在しない。成長は感情の成熟、コミュニケーション能力、そして人間関係で測られる。「ツンデレ」「クーデレ」「ダンデレ」といったアーキタイプ。',
      ranks: ['子供', '思春期', '青年期', '大人', '老人']
    },
    factions: [
      { name: '学校（高校）', description: '恋愛物語の最も一般的な舞台。同級生、部活。', alignment: 'neutral' },
      { name: '家族', description: '家族の絆、親子関係。『CLANNAD』の中心。', alignment: 'good' },
      { name: '友人グループ', description: '社会的なつながりと支え合う仲間。', alignment: 'good' },
      { name: 'ライバル（恋敵）', description: '恋愛の三角関係におけるライバル。ドラマの源。', alignment: 'neutral' }
    ],
    locations: [
      { name: '高校', description: '教室、部室、屋上。恋愛の瞬間の場所。', dangerLevel: 'low' },
      { name: '音楽室', description: '『四月は君の嘘』風のピアノ・音楽室。', dangerLevel: 'low' },
      { name: '祭りの会場', description: '学園祭、夏祭り（祭り）。恋愛の瞬間。', dangerLevel: 'low' },
      { name: '家への帰り道', description: '学校からの帰り道。告白の場面。', dangerLevel: 'low' }
    ],
    notableCharacters: [
      { name: '有馬公生', role: 'ピアノの天才、トラウマ', powerLevel: 15 },
      { name: '宮園かをり', role: 'バイオリンの巨匠、自由な魂', powerLevel: 20 },
      { name: '岡崎智也', role: 'CLANNADの主人公、家族思いの父', powerLevel: 25 },
      { name: '古河渚', role: '智也の妻、アニメーター', powerLevel: 15 },
      { name: '逢坂大河', role: 'ツンデレ、手のひらサイズのトラ', powerLevel: 30 },
      { name: '高須竜児', role: '大河のパートナー', powerLevel: 25 },
      { name: '四宮かぐや', role: '頭脳ゲーム、愛', powerLevel: 40 },
      { name: '白銀御行', role: '生徒会長', powerLevel: 45 }
    ],
    keyEvents: ['初対面 / 出会い', '告白（コクハク）', '学園祭', '卒業式', '喪失と悲しみ（CLANNAD）', '音楽の演奏（四月は君の嘘）'],
    themes: ['愛', '喪失', '成長', '家族', '音楽', 'コミュニケーション', '感情の成熟', '過去の影']
  },
  fr: {
    summary: 'Un monde de liens émotionnels, d\'amour, de perte et de relations humaines explorées en profondeur. Comédie romantique, drame et slice of life. La croissance des personnages et la maturité émotionnelle au centre.',
    history: 'Le genre romantique des anime place les relations humaines et la croissance émotionnelle au centre. Your Lie in April (musique et amour), Clannad (famille et perte), Toradora (tsundere et amour), Fruits Basket (malédiction et famille), Kaguya-sama (jeux d\'esprit et amour), Horimiya (identités secrètes) en sont les piliers.',
    powerSystem: {
      name: 'Aucun (émotionnel / humain)',
      description: 'Il n\'y a pas de système de pouvoir. La progression se mesure par la maturité émotionnelle, la communication et les relations. Les archétypes « tsundere », « kuudere », « dandere ».',
      ranks: ['Enfant', 'Adolescent', 'Jeune adulte', 'Adulte', 'Personne âgée']
    },
    factions: [
      { name: 'École (lycée)', description: 'Le cadre le plus fréquent des histoires d\'amour. Camarades de classe, clubs.', alignment: 'neutral' },
      { name: 'La famille', description: 'Les liens familiaux, les relations parents-enfants. Le cœur de Clannad.', alignment: 'good' },
      { name: 'Le groupe d\'amis', description: 'Le cercle social et le système de soutien.', alignment: 'good' },
      { name: 'Le rival (rivale d\'amour)', description: 'Le rival dans le triangle amoureux. Source de drame.', alignment: 'neutral' }
    ],
    locations: [
      { name: 'Lycée', description: 'Salle, club, toit. Le lieu des moments romantiques.', dangerLevel: 'low' },
      { name: 'Salle de musique', description: 'Des salles de piano sur le modèle de Your Lie in April.', dangerLevel: 'low' },
      { name: 'Terrain du festival', description: 'Festival scolaire, festival d\'été (matsuri). Moments romantiques.', dangerLevel: 'low' },
      { name: 'Le chemin du retour', description: 'La promenade de l\'école à la maison. Le lieu des aveux.', dangerLevel: 'low' }
    ],
    notableCharacters: [
      { name: 'Kousei Arima', role: 'Génie du piano, traumatisé', powerLevel: 15 },
      { name: 'Kaori Miyazono', role: 'Virtuose du violon, esprit libre', powerLevel: 20 },
      { name: 'Tomoya Okazaki', role: 'Protagoniste de Clannad, père de famille', powerLevel: 25 },
      { name: 'Nagisa Furukawa', role: 'Épouse de Tomoya, actrice', powerLevel: 15 },
      { name: 'Taiga Aisaka', role: 'Tsundere, Palmtop Tiger', powerLevel: 30 },
      { name: 'Ryuji Takasu', role: 'Partenaire de Taiga', powerLevel: 25 },
      { name: 'Kaguya Shinomiya', role: 'Jeux d\'esprit, amour', powerLevel: 40 },
      { name: 'Miyuki Shirogane', role: 'Président du conseil des élèves', powerLevel: 45 }
    ],
    keyEvents: ['Première rencontre', 'Aveu (kokuhaku)', 'Festival scolaire', 'Cérémonie de fin', 'Perte et deuil (Clannad)', 'Performance musicale (Your Lie in April)'],
    themes: ['Amour', 'Perte', 'Croissance', 'Famille', 'Musique', 'Communication', 'Maturité émotionnelle', 'Les ombres du passé']
  }
};