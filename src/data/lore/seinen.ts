import { WorldLore } from './types';

export const seinenLore: WorldLore = {
  worldId: 'seinen_psych',
  summary: 'Zeka, psikoloji ve derin temaların ön planda olduğu olgun bir dünya. Suç, adalet, insan doğası ve varoluş sorgulaması. Karanlık ve düşündürücü hikayeler.',
  history: 'Seinen türü, olgun izleyiciye hitap eder. Death Note (adalet ve güç), Monster (seri katil ve ahlak), Psycho-Pass (suç ve toplum), Tokyo Ghoul (kimlik ve canavar), Vinland Saga (şiddet ve barış), Berserk (karanlık fantezi) türün temel taşlarıdır.',
  powerSystem: {
    name: 'Zeka / Manipülasyon / Fiziksel',
    description: 'Güç sistemi yoktur (Death Note hariç: Shinigami gözü ve Defter). Çatışma zeka, strateji, psikolojik savaş ve manipülasyonla çözülür. Fiziksel güç ikincildir.',
    ranks: ['Sıradan', 'Zeki', 'Dahi', 'Stratejist', 'Mastermind']
  },
  factions: [
    { name: 'L (Dedektif)', description: 'Death Note\'taki gizemli dedektif. Tatlı düşkünü.', alignment: 'good' },
    { name: 'Kira (Light Yagami)', description: 'Death Note\'u kullanan adalet savaşçısı/seri katil.', alignment: 'evil' },
    { name: 'Johan Liebert', description: 'Monster\'daki seri katil. Karizmatik ve korkunç.', alignment: 'evil' },
    { name: 'Ken Kaneki', description: 'Tokyo Ghoul\'da yarı ghoul. Kimlik krizi.', alignment: 'neutral' },
    { name: 'Thorfinn', description: 'Vinland Saga\'da Viking savaşçısı → pasifist.', alignment: 'good' }
  ],
  locations: [
    { name: 'Tokyo (Death Note)', description: 'Light ve L\'in kedi-fare oyunu.', dangerLevel: 'medium' },
    { name: 'Düsseldorf (Monster)', description: 'Johan\'ın izini süren Tenma\'nın yolu.', dangerLevel: 'high' },
    { name: 'Tokyo (Tokyo Ghoul)', description: 'Ghoul\'ların yaşadığı şehir. Anteiku kafe.', dangerLevel: 'high' },
    { name: 'İskandinavya (Vinland Saga)', description: 'Viking savaşları ve Thorfinn\'in yolculuğu.', dangerLevel: 'high' }
  ],
  notableCharacters: [
    { name: 'Light Yagami', role: 'Kira, Death Note kullanıcısı', powerLevel: 70 },
    { name: 'L', role: 'Dünyanın en büyük dedektifi', powerLevel: 65 },
    { name: 'Johan Liebert', role: 'Seri katil, "canavar"', powerLevel: 60 },
    { name: 'Ken Kaneki', role: 'Yarı ghoul, kimlik krizi', powerLevel: 85 },
    { name: 'Thorfinn', role: 'Viking savaşçısı → pasifist', powerLevel: 75 },
    { name: 'Guts', role: 'Berserker (dark fantasy overlap)', powerLevel: 95 }
  ],
  keyEvents: [
    'Death Note\'un bulunması',
    'L vs Kira',
    'Johan\'ın kaçışı',
    'Tokyo Ghoul\'da Aogiri ağacı olayı',
    'Vinland Saga\'da Thorfinn\'in dönüşümü'
  ],
  themes: ['Adalet', 'Güç', 'İnsan Doğası', 'Ahlak', 'Kimlik', 'Şiddet', 'Barış', 'Varoluş'],
  sourceSeries: ['Death Note', 'Monster', 'Psycho-Pass', 'Tokyo Ghoul', 'Vinland Saga', 'Berserk', 'Parasyte'],
  ja: {
    summary: '知性、心理、そして深いテーマが前面に出る成熟した世界。犯罪、正義、人間の本性、そして存在の問い。暗く、思考を促す物語。',
    history: '青年漫画のジャンルは、成熟した読者に向けて描かれる。『DEATH NOTE』（正義と力）、『MONSTER』（連続殺人鬼と道徳）、『PSYCHO-PASS』（犯罪と社会）、『東京喰種』（アイデンティティと怪物）、『ヴィンランド・サガ』（暴力と平和）、『ベルセルク』（ダークファンタジー）が根幹。',
    powerSystem: {
      name: '知性 / 操作 / 肉体',
      description: 'パワーシステムは存在しない（DEATH NOTEを除く：死神の目と死亡ノート）。対立は知性、戦略、心理戦、そして操作で解決される。肉体的能力は二次的。',
      ranks: ['平凡', '聡明', '天才', '戦略家', '支配者']
    },
    factions: [
      { name: 'L（探偵）', description: 'DEATH NOTEに登場する謎めいた探偵。甘い物好き。', alignment: 'good' },
      { name: 'キラ（夜神月）', description: 'DEATH NOTEを使う正義の戦士／連続殺人鬼。', alignment: 'evil' },
      { name: 'ヨハン・リーベルト', description: 'MONSTERの連続殺人鬼。カリスマ性と恐怖。', alignment: 'evil' },
      { name: '金木研', description: '東京喰種の半喰種。アイデンティティの危機。', alignment: 'neutral' },
      { name: 'トルフィン', description: 'ヴィンランド・サガのヴァイキング戦士 → 平和主義者。', alignment: 'good' }
    ],
    locations: [
      { name: '東京（DEATH NOTE）', description: 'ライトとLのイタチごっこ。', dangerLevel: 'medium' },
      { name: 'デュッセルドルフ（MONSTER）', description: 'ヨハンの足跡を追うテンマの道。', dangerLevel: 'high' },
      { name: '東京（東京喰種）', description: '喰種が暮らす街。杏山カフェ。', dangerLevel: 'high' },
      { name: 'スカンジナビア（ヴィンランド・サガ）', description: 'ヴァイキングの戦いとトルフィンの旅。', dangerLevel: 'high' }
    ],
    notableCharacters: [
      { name: '夜神月（ライト・ヤガミ）', role: 'キラ、死亡ノートの使い手', powerLevel: 70 },
      { name: 'L', role: '世界最高の探偵', powerLevel: 65 },
      { name: 'ヨハン・リーベルト', role: '連続殺人鬼、「怪物」', powerLevel: 60 },
      { name: '金木研', role: '半喰種、アイデンティティの危機', powerLevel: 85 },
      { name: 'トルフィン', role: 'ヴァイキング戦士 → 平和主義者', powerLevel: 75 },
      { name: 'ガッツ', role: 'バーサーカー（ダークファンタジーとの重なり）', powerLevel: 95 }
    ],
    keyEvents: ['DEATH NOTEの発見', 'L対キラ', 'ヨハンの逃亡', '東京喰種のアオギリの樹事件', 'ヴィンランド・サガのトルフィンの変貌'],
    themes: ['正義', '力', '人間の本性', '道徳', 'アイデンティティ', '暴力', '平和', '存在']
  },
  fr: {
    summary: 'Un monde mûr où l\'intelligence, la psychologie et les thèmes profonds sont au premier plan. Crime, justice, nature humaine et interrogation existentielle. Des histoires sombres et réfléchies.',
    history: 'Le genre seinen s\'adresse à un public mûr. Death Note (justice et pouvoir), Monster (tueur en série et morale), Psycho-Pass (crime et société), Tokyo Ghoul (identité et monstre), Vinland Saga (violence et paix), Berserk (dark fantasy) en sont les piliers.',
    powerSystem: {
      name: 'Intelligence / Manipulation / Physique',
      description: 'Il n\'y a pas de système de pouvoir (sauf Death Note : l\'œil de Shinigami et le Death Note). Les conflits se règlent par l\'intelligence, la stratégie, la guerre psychologique et la manipulation. La force physique est secondaire.',
      ranks: ['Ordinaire', 'Intelligent', 'Génie', 'Stratège', 'Maître en chef']
    },
    factions: [
      { name: 'L (le détective)', description: 'Le détective mystérieux de Death Note. Gourmandise.', alignment: 'good' },
      { name: 'Kira (Light Yagami)', description: 'Le guerrier de la justice / tueur en série qui utilise le Death Note.', alignment: 'evil' },
      { name: 'Johan Liebert', description: 'Le tueur en série de Monster. Charismatique et terrifiant.', alignment: 'evil' },
      { name: 'Ken Kaneki', description: 'Le demi-gouge de Tokyo Ghoul. Crise d\'identité.', alignment: 'neutral' },
      { name: 'Thorfinn', description: 'Le guerrier viking de Vinland Saga → pacifiste.', alignment: 'good' }
    ],
    locations: [
      { name: 'Tokyo (Death Note)', description: 'Le jeu du chat et de la souris entre Light et L.', dangerLevel: 'medium' },
      { name: 'Düsseldorf (Monster)', description: 'Le chemin de Tenma sur les traces de Johan.', dangerLevel: 'high' },
      { name: 'Tokyo (Tokyo Ghoul)', description: 'La ville où vivent les goules. Café Anteiku.', dangerLevel: 'high' },
      { name: 'Scandinavie (Vinland Saga)', description: 'Les guerres vikings et le voyage de Thorfinn.', dangerLevel: 'high' }
    ],
    notableCharacters: [
      { name: 'Light Yagami', role: 'Kira, utilisateur du Death Note', powerLevel: 70 },
      { name: 'L', role: 'Le plus grand détective du monde', powerLevel: 65 },
      { name: 'Johan Liebert', role: 'Tueur en série, le « monstre »', powerLevel: 60 },
      { name: 'Ken Kaneki', role: 'Demi-gouge, crise d\'identité', powerLevel: 85 },
      { name: 'Thorfinn', role: 'Guerrier viking → pacifiste', powerLevel: 75 },
      { name: 'Guts', role: 'Berserker (recoupement dark fantasy)', powerLevel: 95 }
    ],
    keyEvents: ['La découverte du Death Note', 'L contre Kira', 'L\'évasion de Johan', 'L\'incident d\'Aogiri de l\'arbre dans Tokyo Ghoul', 'La transformation de Thorfinn dans Vinland Saga'],
    themes: ['Justice', 'Pouvoir', 'Nature humaine', 'Morale', 'Identité', 'Violence', 'Paix', 'Existence']
  }
};