import { WorldLore } from './types';

export const darkFantasyLore: WorldLore = {
  worldId: 'dark_fantasy',
  summary: 'Kaos, ölüm, ihanet ve hayatta kalma mücadelesinin hüküm sürdüğü karanlık bir dünya. Hiçbir güvenlik yok; her gün bir kayıp, her gün bir ihanet. Güç sistemleri (Berserk\'te mark, AoT\'te titan, Re:Zero\'da dönüş) acımasız.',
  history: 'Bu dünya, insanlığın karanlık yönlerini yansıtır. Ortaçağ Avrupa\'sı (Berserk) cadı avları ve şövalye savaşlarıyla. Titanlar (Attack on Titan) insanlığı duvarların içine hapsetti. Yeniden Doğuş (Re:Zero) ve Overlord karanlık güçleri merkeze alır. Made in Abyss derinliklerin korkusunu işler.',
  powerSystem: {
    name: 'Mark / Titan / Lanet / Abyss',
    description: 'Berserk\'te Brand of Sacrifice (kurban markası) kötü ruhları çeker. AoT\'te Titan güçleri (9 Titan) kalıtsal. Re:Zero\'da Return by Death (ölümle geri dönüş). Made in Abyss\'te Abyss\'in laneti (derinlik arttıkça dönüşüm).',
    ranks: ['Sıradan', 'İşaretli', 'Titan Shifter', 'Abyss Delver', 'Demon Lord']
  },
  factions: [
    { name: 'Band of the Hawk (Şahin Takımı)', description: 'Berserk\'te Griffith\'in paralı asker grubu. İhanetle sona erdi.', alignment: 'neutral' },
    { name: 'Survey Corps (Keşif Birliği)', description: 'AoT\'te duvar dışını keşfeden birlik. Yüksek ölüm oranı.', alignment: 'good' },
    { name: 'Military Police', description: 'AoT\'te iç güvenlik. Yozlaşmış.', alignment: 'neutral' },
    { name: 'Titans (Devler)', description: 'AoT\'te insan yiyen devler. Gizemli köken.', alignment: 'evil' },
    { name: 'Witch Cult', description: 'Re:Zero\'da cadıların takipçileri. Kaos ve ölüm.', alignment: 'evil' },
    { name: 'Abyss Delvers', description: 'Made in Abyss\'te derinlik kaşifleri.', alignment: 'neutral' }
  ],
  locations: [
    { name: 'Midland Krallığı', description: 'Berserk\'in ortaçağ Avrupa\'sı. Savaş ve ihanet.', dangerLevel: 'high' },
    { name: 'Paradis Adası (Duvarlar)', description: 'AoT\'te insanlığın son sığınağı. Maria/Rose/Sina duvarları.', dangerLevel: 'extreme' },
    { name: 'Marley', description: 'AoT\'te düşman ülke. Titan güçlerini elinde tutar.', dangerLevel: 'extreme' },
    { name: 'Abyss (Çukur)', description: 'Made in Abyss\'te sonsuz derinlik. Her katman daha tehlikeli.', dangerLevel: 'extreme' },
    { name: 'Lugunica Krallığı', description: 'Re:Zero\'nun krallığı. Siyasi entrika ve cadı kültü.', dangerLevel: 'high' }
  ],
  notableCharacters: [
    { name: 'Guts (Kara Kılıççı)', role: 'Berserker, Brand of Sacrifice taşıyıcısı', powerLevel: 95 },
    { name: 'Griffith (Femto)', role: 'God Hand üyesi, ihanetçi', powerLevel: 99 },
    { name: 'Eren Yeager', role: 'Saldırı Titanı, özgürlük savaşçısı', powerLevel: 92 },
    { name: 'Levi Ackerman', role: 'İnsanlığın en güçlü askeri', powerLevel: 90 },
    { name: 'Subaru Natsuki', role: 'Return by Death yeteneği', powerLevel: 40 },
    { name: 'Riko', role: 'Abyss Delver, Reg\'in arkadaşı', powerLevel: 30 }
  ],
  keyEvents: [
    'Eclipse (Berserk) - Griffith\'in ihaneti',
    'Shiganshina Savaşı (AoT)',
    'Rumbling (AoT) - dünya yıkımı',
    'Witch Cult saldırıları (Re:Zero)',
    'Abyss\'e iniş (Made in Abyss)'
  ],
  themes: ['İhanet', 'Hayatta Kalma', 'Kayıp', 'Karanlık', 'Özgürlük', 'Kurban', 'Trajedi'],
  sourceSeries: ['Berserk', 'Attack on Titan', 'Re:Zero', 'Made in Abyss', 'Overlord', 'Goblin Slayer'],
  ja: {
    summary: '混沌、死、裏切り、そして生存の闘いが支配する闇の世界。安全はどこにもない。毎日が喪失で、毎日が裏切り。パワーシステム（ベルセルクの烙印、進撃の巨人の巨人、リゼロの死に戻り）は容赦ない。',
    history: 'この世界は、人類の暗い面を映している。中世ヨーロッパ（ベルセルク）は魔女狩りと騎士の戦い。巨人（進撃の巨人）は人類を壁の中に閉じ込めた。異世界転生（リゼロ、オーバーロード）は闇の力を中心に据える。メイドインアビスは深淵の恐怖を描く。',
    powerSystem: {
      name: '烙印 / 巨人 / 呪い / 深淵',
      description: 'ベルセルクでは犠牲の烙印が邪霊を引き寄せる。『進撃の巨人』では巨人の力（9体の巨人）が遺伝する。リゼロでは死に戻り（死によるリセット）。メイドインアビスでは深淵の呪い（深くなるほど変化）。',
      ranks: ['平人', '烙印を負った者', '巨人継承者', '深淵探窟家', '魔王']
    },
    factions: [
      { name: '鷹の団', description: 'ベルセルクのグリフィスの傭兵団。裏切りで終わった。', alignment: 'neutral' },
      { name: '調査兵団', description: '進撃の巨人で壁の外を調査する部隊。高い死亡率。', alignment: 'good' },
      { name: '憲兵団', description: '進撃の巨人の国内治安部隊。腐敗している。', alignment: 'neutral' },
      { name: '巨人', description: '進撃の巨人で人間を食らう巨大生物。謎めいた起源。', alignment: 'evil' },
      { name: '魔女教', description: 'リゼロの魔女の信者。混沌と死。', alignment: 'evil' },
      { name: '深淵探窟家', description: 'メイドインアビスの深淵の探検家。', alignment: 'neutral' }
    ],
    locations: [
      { name: 'ミッドランド王国', description: 'ベルセルクの中世ヨーロッパ。戦いと裏切り。', dangerLevel: 'high' },
      { name: 'パラディ島（壁）', description: '進撃の巨人の人類最後の砦。マリア・ローゼ・シーナの壁。', dangerLevel: 'extreme' },
      { name: 'マーレ', description: '進撃の巨人の敵国。巨人の力を保持している。', dangerLevel: 'extreme' },
      { name: '深淵（奈落）', description: 'メイドインアビスの無限の深さ。各層がより危険。', dangerLevel: 'extreme' },
      { name: 'ルグニカ王国', description: 'リゼロの王国。政治的な陰謀と魔女の崇拝。', dangerLevel: 'high' }
    ],
    notableCharacters: [
      { name: 'ガッツ（黒の剣士）', role: 'バーサーカー、犠牲の烙印の持ち主', powerLevel: 95 },
      { name: 'グリフィス（フェムト）', role: '神の手の一員、裏切り者', powerLevel: 99 },
      { name: 'エレン・イェーガー', role: '進撃の巨人、自由の戦士', powerLevel: 92 },
      { name: 'リヴァイ・アッカーマン', role: '人類最強の兵士', powerLevel: 90 },
      { name: 'ナツキ・スバル', role: '死に戻りの能力', powerLevel: 40 },
      { name: 'リコ', role: '深淵探窟家、レグの仲間', powerLevel: 30 }
    ],
    keyEvents: ['蝕（ベルセルク）- グリフィスの裏切り', 'シガンシナ陥落（進撃の巨人）', '地鳴らし（進撃の巨人）- 世界の破壊', '魔女教の襲撃（リゼロ）', '深淵への降下（メイドインアビス）'],
    themes: ['裏切り', '生存', '喪失', '闇', '自由', '犠牲', '悲劇']
  },
  fr: {
    summary: 'Un monde sombre dominé par le chaos, la mort, la trahison et la lutte pour la survie. Nulle sécurité ; chaque jour est une perte, chaque jour est une trahison. Les systèmes de pouvoir (la marque du Berserk, les Titans d\'AoT, le retour par la mort de Re:Zero) sont impitoyables.',
    history: 'Ce monde reflète les aspects sombres de l\'humanité. L\'Europe médiévale (Berserk) avec ses chasses aux sorcières et ses guerres de chevaliers. Les Titans (L\'Attaque des Titans) ont enfermé l\'humanité derrière des murs. Re:Zero et Overlord placent les forces obscures au centre. Made in Abyss explore la terreur des profondeurs.',
    powerSystem: {
      name: 'Marque / Titans / Malédiction / Abyss',
      description: 'Dans Berserk, la marque du sacrifice attire les esprits malveillants. Dans l\'Attaque des Titans, les pouvoirs des Titans (les 9 Titans) sont héréditaires. Dans Re:Zero, le retour par la mort (Reset par la mort). Dans Made in Abyss, la malédiction de l\'Abyss (transformation à mesure qu\'on descend).',
      ranks: ['Ordinaire', 'Marqué', 'Porteur de Titan', 'Explorateur d\'Abîme', 'Seigneur Démon']
    },
    factions: [
      { name: 'Bande du Faucon', description: 'Le groupe de mercenaires de Griffith dans Berserk. Finit par la trahison.', alignment: 'neutral' },
      { name: 'Escouade d\'Exploration', description: 'L\'unité qui explore au-delà des murs dans AoT. Taux de mortalité élevé.', alignment: 'good' },
      { name: 'Police militaire', description: 'La sécurité intérieure dans AoT. Corrompue.', alignment: 'neutral' },
      { name: 'Titans', description: 'Les géants mangeuses d\'humains dans AoT. Origine mystérieuse.', alignment: 'evil' },
      { name: 'Culte des sorcières', description: 'Les disciples des sorcières dans Re:Zero. Chaos et mort.', alignment: 'evil' },
      { name: 'Explorateurs d\'Abîme', description: 'Les explorateurs des profondeurs dans Made in Abyss.', alignment: 'neutral' }
    ],
    locations: [
      { name: 'Royaume de Midland', description: 'L\'Europe médiévale de Berserk. Guerre et trahison.', dangerLevel: 'high' },
      { name: 'Île de Paradis (les Murs)', description: 'Le dernier refuge de l\'humanité dans AoT. Les murs Maria, Rose et Sina.', dangerLevel: 'extreme' },
      { name: 'Marley', description: 'Le pays ennemi dans AoT. Détient le pouvoir des Titans.', dangerLevel: 'extreme' },
      { name: 'L\'Abîme (le Gouffre)', description: 'Les profondeurs sans fin de Made in Abyss. Chaque couche plus dangereuse.', dangerLevel: 'extreme' },
      { name: 'Royaume de Lugunica', description: 'Le royaume de Re:Zero. Intrigues politiques et culte des sorcières.', dangerLevel: 'high' }
    ],
    notableCharacters: [
      { name: 'Guts (Épée noire)', role: 'Berserker, porteur de la marque du sacrifice', powerLevel: 95 },
      { name: 'Griffith (Femto)', role: 'Membre de la Main du Dieu, traître', powerLevel: 99 },
      { name: 'Eren Yeager', role: 'Titan Assaillant, guerrier de la liberté', powerLevel: 92 },
      { name: 'Levi Ackerman', role: 'Le soldat humain le plus puissant', powerLevel: 90 },
      { name: 'Subaru Natsuki', role: 'Capacité de retour par la mort', powerLevel: 40 },
      { name: 'Riko', role: 'Exploratrice d\'Abîme, compagne de Reg', powerLevel: 30 }
    ],
    keyEvents: ['Éclipse (Berserk) - la trahison de Griffith', 'Bataille de Shiganshina (AoT)', 'Rumbling (AoT) - destruction du monde', 'Attaques du culte des sorcières (Re:Zero)', 'Descente dans l\'Abîme (Made in Abyss)'],
    themes: ['Trahison', 'Survie', 'Perte', 'Ténèbres', 'Liberté', 'Sacrifice', 'Tragédie']
  }
};