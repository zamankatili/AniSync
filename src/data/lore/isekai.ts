import { WorldLore } from './types';

export const isekaiLore: WorldLore = {
  worldId: 'isekai',
  summary: 'Modern dünyadan başka bir dünyaya reenkarnasyon veya ışınlanma. Güç sistemleri, maceralar ve kaderin belirsizliği. Oyun mekanikleri (level, skill, inventory) gerçek hayata karışır.',
  history: 'İsekai türü, "başka dünya" kavramından doğdu. Re:Zero (ölümle geri dönüş), Konosuba (komedi isekai), Overlord (MMO dünyasında sıkışıp kalma), That Time I Got Reincarnated as a Slime (slime reenkarnasyonu), Sword Art Online (VRMMO tuzağı) ve Mushoku Tensei (reenkarnasyon + büyü) türün temel taşlarıdır.',
  powerSystem: {
    name: 'Level / Skill / Magic / Job Class',
    description: 'Oyun mekanikleri: level atlama, skill ağacı, job class seçimi, inventory, stat puanları. Büyü (elemental, kutsal, karanlık), kılıç teknikleri, summon. Reenkarnasyon bonusları (önceki hayatın anıları).',
    ranks: ['Level 1 (Başlangıç)', 'Level 10-30 (Orta)', 'Level 50-70 (Uzman)', 'Level 90+ (Efsane)', 'Demon Lord / Hero']
  },
  factions: [
    { name: 'Adventurer\'s Guild', description: 'Macera loncası. Görevler, rank sistemi (F-E-D-C-B-A-S).', alignment: 'neutral' },
    { name: 'Demon Lord Army', description: 'Şeytan Lord\'un ordusu. Boss ve generaller.', alignment: 'evil' },
    { name: 'Hero Party', description: 'Kahraman ve yoldaşları. Şeytan Lord\'u yenmek için.', alignment: 'good' },
    { name: 'Merchant Guild', description: 'Tüccar loncası. Ekonomi ve ticaret.', alignment: 'neutral' },
    { name: 'Magic Academy', description: 'Büyü okulu. Araştırma ve eğitim.', alignment: 'good' },
    { name: 'Church / Holy Order', description: 'Kutsal düzen. İyileştirme ve kutsal büyü.', alignment: 'good' }
  ],
  locations: [
    { name: 'Başlangıç Köyü', description: 'Macera başlangıç noktası. Güvenli bölge.', dangerLevel: 'low' },
    { name: 'Krallık Başkenti', description: 'Siyasi merkez. Saray, lonca, pazar.', dangerLevel: 'medium' },
    { name: 'Zindan (Dungeon)', description: 'Canavarlar ve hazineler. Level atlama yeri.', dangerLevel: 'high' },
    { name: 'Şeytan Lord Kalesi', description: 'Final boss bölgesi. En tehlikeli.', dangerLevel: 'extreme' },
    { name: 'Elf Ormanı', description: 'Elf krallığı. Büyü ve doğa.', dangerLevel: 'medium' }
  ],
  notableCharacters: [
    { name: 'Subaru Natsuki', role: 'Return by Death yeteneği', powerLevel: 40 },
    { name: 'Kazuma Satou', role: 'Şanssız maceracı, Chunchunmaru', powerLevel: 55 },
    { name: 'Rimuru Tempest', role: 'Slime reenkarnasyonu, Demon Lord', powerLevel: 95 },
    { name: 'Ainz Ooal Gown', role: 'Overlord, undead büyülü', powerLevel: 98 },
    { name: 'Rudeus Greyrat', role: 'Mushoku Tensei protagonist, büyü dehası', powerLevel: 80 },
    { name: 'Kirito', role: 'Sword Art Online, Dual Wield', powerLevel: 85 }
  ],
  keyEvents: [
    'Reenkarnasyon / ışınlanma',
    'İlk görev (tutorial)',
    'Job class seçimi',
    'Lonca kaydı',
    'Şeytan Lord ile karşılaşma',
    'Dünya kurtarma (veya yok etme)'
  ],
  themes: ['Yeniden Başlangıç', 'Güçlenme', 'Macera', 'Kader', 'Seçim', 'İkinci Şans'],
  sourceSeries: ['Re:Zero', 'Konosuba', 'Overlord', 'That Time I Got Reincarnated as a Slime', 'Sword Art Online', 'Mushoku Tensei', 'No Game No Life'],
  ja: {
    summary: '現代世界から異世界への転生や転移。パワーシステム、冒険、そして運命の不確かさ。ゲームの仕組み（レベル、スキル、インベントリ）が現実と交わる。',
    history: '異世界ジャンルは「異世界」という概念から生まれた。『リゼロ』（死に戻り）、『このすば』（コメディ異世界）、『オーバーロード』（MMORPGの世界に閉じ込められる）、『転生したらスライムだった件』（スライムに転生）、『ソードアート・オンライン』（VRMMOの罠）、『無職転生』（転生＋魔法）がジャンルの根幹。',
    powerSystem: {
      name: 'レベル / スキル / 魔法 / ジョブ',
      description: 'ゲームの仕組み：レベルアップ、スキルツリー、ジョブの選択、インベントリ、ステータス。魔法（属性、聖、闇）、剣技、召喚。転生ボーナス（前世の記憶）。',
      ranks: ['レベル1（初心者）', 'レベル10〜30（中級）', 'レベル50〜70（上級）', 'レベル90以上（伝説）', '魔王／勇者']
    },
    factions: [
      { name: '冒険者ギルド', description: '冒険者の協会。任務、ランク制度（F-E-D-C-B-A-S）。', alignment: 'neutral' },
      { name: '魔王軍', description: '魔王の軍勢。ボスと将軍たち。', alignment: 'evil' },
      { name: '勇者のパーティ', description: '勇者と仲間たち。魔王を倒すため。', alignment: 'good' },
      { name: '商人ギルド', description: '商人の協会。経済と貿易。', alignment: 'neutral' },
      { name: '魔法学院', description: '魔法の学校。研究と教育。', alignment: 'good' },
      { name: '教会／聖騎士団', description: '聖なる秩序。治癒と聖魔法。', alignment: 'good' }
    ],
    locations: [
      { name: '出生の村', description: '冒険の始まり。安全地帯。', dangerLevel: 'low' },
      { name: '王都', description: '政治の中心。城、ギルド、市場。', dangerLevel: 'medium' },
      { name: '迷宮（ダンジョン）', description: '魔物と宝物。レベルアップの場所。', dangerLevel: 'high' },
      { name: '魔王の城', description: '最終ボスの領域。最も危険。', dangerLevel: 'extreme' },
      { name: 'エルフの森', description: 'エルフの王国。魔法と自然。', dangerLevel: 'medium' }
    ],
    notableCharacters: [
      { name: 'ナツキ・スバル', role: '死に戻りの能力', powerLevel: 40 },
      { name: '佐藤和真（カズマ）', role: '不運な冒険者、めぐみん', powerLevel: 55 },
      { name: 'リムル＝テンペスト', role: 'スライム転生、魔王', powerLevel: 95 },
      { name: 'アインズ・ウール・ゴウン', role: 'オーバーロード、アンデッドの魔法使い', powerLevel: 98 },
      { name: 'ルーデウス・グレイラット', role: '無職転生の主人公、魔法の天才', powerLevel: 80 },
      { name: 'キリト', role: 'ソードアート・オンライン、二刀流', powerLevel: 85 }
    ],
    keyEvents: ['転生／異世界転移', '初任務（チュートリアル）', 'ジョブ選択', 'ギルド登録', '魔王との対決', '世界救済（または破壊）'],
    themes: ['新たな始まり', '成長', '冒険', '運命', '選択', '第二のチャンス']
  },
  fr: {
    summary: 'Réincarnation ou téléportation depuis le monde moderne vers un autre monde. Systèmes de pouvoir, aventures et incertitude du destin. Les mécaniques de jeu (niveau, compétence, inventaire) se mêlent à la réalité.',
    history: 'Le genre isekai est né du concept de « l\'autre monde ». Re:Zero (retour par la mort), KonoSuba (isekai comique), Overlord (coincé dans un monde de MMORPG), That Time I Got Reincarnated as a Slime (réincarnation en slime), Sword Art Online (piège VRMMO) et Mushoku Tensei (réincarnation + magie) en sont les piliers.',
    powerSystem: {
      name: 'Niveau / Compétence / Magie / Classe',
      description: 'Mécaniques de jeu : montée en niveau, arbre de compétences, choix de classe, inventaire, points de caractéristiques. Magie (élémentaire, sacrée, sombre), techniques d\'épée, invocation. Bonus de réincarnation (souvenirs de la vie antérieure).',
      ranks: ['Niveau 1 (Débutant)', 'Niveau 10-30 (Intermédiaire)', 'Niveau 50-70 (Expert)', 'Niveau 90+ (Légendaire)', 'Seigneur Démon / Héros']
    },
    factions: [
      { name: 'Guilde des aventuriers', description: 'La guilde des aventuriers. Quêtes, système de rangs (F-E-D-C-B-A-S).', alignment: 'neutral' },
      { name: 'Armée du Seigneur Démon', description: 'L\'armée du Seigneur Démon. Boss et généraux.', alignment: 'evil' },
      { name: 'Groupe de héros', description: 'Le héros et ses compagnons. Pour vaincre le Seigneur Démon.', alignment: 'good' },
      { name: 'Guilde des marchands', description: 'La guilde des marchands. Économie et commerce.', alignment: 'neutral' },
      { name: 'Académie de magie', description: 'L\'école de magie. Recherche et enseignement.', alignment: 'good' },
      { name: 'Église / Ordre sacré', description: 'L\'ordre sacré. Soins et magie sacrée.', alignment: 'good' }
    ],
    locations: [
      { name: 'Village de départ', description: 'Le point de départ de l\'aventure. Zone sûre.', dangerLevel: 'low' },
      { name: 'Capitale du royaume', description: 'Le centre politique. Palais, guilde, marché.', dangerLevel: 'medium' },
      { name: 'Donjon', description: 'Des monstres et des trésors. Lieu de montée en niveau.', dangerLevel: 'high' },
      { name: 'Château du Seigneur Démon', description: 'La zone du boss final. La plus dangereuse.', dangerLevel: 'extreme' },
      { name: 'Forêt des elfes', description: 'Le royaume des elfes. Magie et nature.', dangerLevel: 'medium' }
    ],
    notableCharacters: [
      { name: 'Subaru Natsuki', role: 'Capacité de retour par la mort', powerLevel: 40 },
      { name: 'Kazuma Satou', role: 'Aventurier malchanceux, Chunchunmaru', powerLevel: 55 },
      { name: 'Rimuru Tempest', role: 'Réincarnation en slime, Seigneur Démon', powerLevel: 95 },
      { name: 'Ainz Ooal Gown', role: 'Overlord, sorcier mort-vivant', powerLevel: 98 },
      { name: 'Rudeus Greyrat', role: 'Protagoniste de Mushoku Tensei, génie de la magie', powerLevel: 80 },
      { name: 'Kirito', role: 'Sword Art Online, Double maniement', powerLevel: 85 }
    ],
    keyEvents: ['Réincarnation / téléportation', 'Première quête (tutoriel)', 'Choix de classe', 'Inscription à la guilde', 'Affrontement avec le Seigneur Démon', 'Sauver le monde (ou le détruire)'],
    themes: ['Nouveau départ', 'Puissance', 'Aventure', 'Destin', 'Choix', 'Seconde chance']
  }
};