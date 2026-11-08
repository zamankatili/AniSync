import { WorldLore } from './types';

export const cyberpunkLore: WorldLore = {
  worldId: 'cyberpunk',
  summary: 'Teknoloji, siber suç, yapay zeka ve distopik toplumların hüküm sürdüğü gelecek dünya. İnsan ve makine arasındaki çizgi bulanık. Siberpsikoz, megacorp\'lar, sokak samurayları.',
  history: 'Cyberpunk dünyası, megacorp\'ların hükümetlerin yerini aldığı distopik bir gelecekte geçer. Night City (Cyberpunk 2077) sokak çeteleri ve corp savaşları. Psycho-Pass\'te Sibyl System suç katsayısı ölçer. Ghost in the Shell\'de siber beyin ve hayalet (ghost) kavramı. Akira\'da neo-Tokyo ve psionik güçler.',
  powerSystem: {
    name: 'Cyberware / Netrunning / Psionik',
    description: 'Cyberware (siber implantlar): güç, hız, refleks artırımı. Netrunning: ağda gezinme, hack. Psionik: Akira tarzı telekinezi. Siberpsikoz riski: çok fazla implant = akıl sağlığı kaybı.',
    ranks: ['Sokak Çocuğu', 'Edgerunner', 'Netrunner', 'Cyberpsycho', 'Legend (Johnny Silverhand)']
  },
  factions: [
    { name: 'Arasaka', description: 'Cyberpunk\'ta Japon megacorp. Silah ve güvenlik.', alignment: 'evil' },
    { name: 'Militech', description: 'Amerikan megacorp. Askeri teknoloji.', alignment: 'evil' },
    { name: 'Sokak Çeteleri (Maelstrom, Tyger Claws, Valentinos)', description: 'Night City\'nin sokak çeteleri.', alignment: 'neutral' },
    { name: 'Netwatch', description: 'Ağ güvenliği örgütü. Netrunner\'ları avlar.', alignment: 'neutral' },
    { name: 'Psycho-Pass Sibyl System', description: 'Suç katsayısı ölçen AI sistem. Toplumu kontrol eder.', alignment: 'neutral' },
    { name: 'Section 9', description: 'Ghost in the Shell\'de anti-terör birimi.', alignment: 'good' }
  ],
  locations: [
    { name: 'Night City', description: 'Cyberpunk 2077\'nin şehri. Watson, Westbrook, Heywood, Santo Domingo, Pacifica.', dangerLevel: 'extreme' },
    { name: 'Neo-Tokyo', description: 'Akira\'nın distopik Tokyo\'su. Psionik güçler.', dangerLevel: 'high' },
    { name: 'Tokyo (Psycho-Pass)', description: 'Sibyl System\'in kontrolündeki şehir.', dangerLevel: 'medium' },
    { name: 'Niihama (Ghost in the Shell)', description: 'Siber beyin ve hayalet dünyası.', dangerLevel: 'medium' }
  ],
  notableCharacters: [
    { name: 'V', role: 'Mercenary, Relic implant', powerLevel: 85 },
    { name: 'Johnny Silverhand', role: 'Rockerboy, terörists', powerLevel: 70 },
    { name: 'Motoko Kusanagi', role: 'Major, siber beyin', powerLevel: 90 },
    { name: 'Akane Tsunemori', role: 'Müfettiş, Sibyl System', powerLevel: 60 },
    { name: 'Kaneda', role: 'Biker gang lideri', powerLevel: 65 },
    { name: 'Tetsuo', role: 'Psionik güçler', powerLevel: 95 }
  ],
  keyEvents: [
    'Arasaka Tower saldırısı',
    'Siberpsikoz salgını',
    'Netwatch operasyonları',
    'Akira\'nın uyanışı',
    'Sibyl System\'in ifşası'
  ],
  themes: ['Teknoloji', 'Kimlik', 'Distopya', 'İnsanlık', 'Kontrol', 'Özgürlük', 'Siberpsikoz'],
  sourceSeries: ['Cyberpunk 2077', 'Ghost in the Shell', 'Psycho-Pass', 'Akira', 'Cowboy Bebop', 'Serial Experiments Lain'],
  ja: {
    summary: 'テクノロジー、サイバー犯罪、人工知能、そしてディストピア社会が支配する未来の世界。人と機械の境界が曖昧。サイバーサイコシス、メガコーポ、ストリートサムライ。',
    history: 'サイバーパンクの世界は、メガコーポが政府に代わったディストピア的な未来に舞台を置く。ナイトシティ（サイバーパンク2077）はストリートギャングと企業戦争。『PSYCHO-PASS』ではシビュラシステムが犯罪係数を測定する。『攻殻機動隊』では電脳とゴーストの概念。『AKIRA』ではネオ東京とサイキック能力。',
    powerSystem: {
      name: 'サイバーウェア / ネットランニング / サイキック',
      description: 'サイバーウェア（サイバーインプラント）：力、速度、反射神経の増強。ネットランニング：ネットワーク上での移動、ハッキング。サイキック：AKIRA風のテレキネシス。サイバーサイコシスのリスク：過剰なインプラント＝精神の崩壊。',
      ranks: ['ストリートキッド', 'エッジランナー', 'ネットランナー', 'サイバーサイコ', '伝説（ジョニー・シルバーハンド）']
    },
    factions: [
      { name: '荒坂', description: 'サイバーパンクの日本メガコーポ。武器とセキュリティ。', alignment: 'evil' },
      { name: 'ミリテック', description: 'アメリカのメガコーポ。軍事技術。', alignment: 'evil' },
      { name: 'ストリートギャング (メイルストローム、タイガークロー、バレンチノス)', description: 'ナイトシティのストリートギャング。', alignment: 'neutral' },
      { name: 'ネットウォッチ', description: 'ネットワーク上のセキュリティ組織。ネットランナーを追跡する。', alignment: 'neutral' },
      { name: 'PSYCHO-PASS シビュラシステム', description: '犯罪係数を測定するAIシステム。社会を支配する。', alignment: 'neutral' },
      { name: 'セクション9', description: '攻殻機動隊の対テロ組織。', alignment: 'good' }
    ],
    locations: [
      { name: 'ナイトシティ', description: 'サイバーパンク2077の街。ウェイソン、ウェストブルック、ヘイウッド、サントドミンゴ、パシフィカ。', dangerLevel: 'extreme' },
      { name: 'ネオ東京', description: 'AKIRAのディストピア的な東京。サイキック能力。', dangerLevel: 'high' },
      { name: '東京（PSYCHO-PASS）', description: 'シビュラシステムに支配された街。', dangerLevel: 'medium' },
      { name: '新浜市（攻殻機動隊）', description: '電脳とゴーストの世界。', dangerLevel: 'medium' }
    ],
    notableCharacters: [
      { name: 'V', role: '傭兵、レリックインプラント', powerLevel: 85 },
      { name: 'ジョニー・シルバーハンド', role: 'ロッカーボーイ、テロリスト', powerLevel: 70 },
      { name: '草薙素子', role: '少佐、電脳体', powerLevel: 90 },
      { name: '常守朱', role: '監視官、シビュラシステム', powerLevel: 60 },
      { name: '金田正太郎', role: '暴走族リーダー', powerLevel: 65 },
      { name: '鉄雄', role: 'サイキック能力', powerLevel: 95 }
    ],
    keyEvents: ['荒坂タワー襲撃', 'サイバーサイコシス流行', 'ネットウォッチ作戦', 'AKIRAの目覚め', 'シビュラシステムの暴露'],
    themes: ['テクノロジー', 'アイデンティティ', 'ディストピア', '人間性', '支配', '自由', 'サイバーサイコシス']
  },
  fr: {
    summary: 'Un monde futuriste dominé par la technologie, la cybercriminalité, l\'intelligence artificielle et des sociétés dystopiques. La ligne entre humain et machine est floue. Cyberpsychose, mégacorpos, samouraïs des rues.',
    history: 'Le monde cyberpunk se déroule dans un futur dystopique où les mégacorpos ont remplacé les gouvernements. Night City (Cyberpunk 2077) est le théâtre de gangs de rue et de guerres d\'entreprises. Dans Psycho-Pass, le Sibyl System mesure le coefficient de criminalité. Dans Ghost in the Shell, les concepts de cerveau cybernétique et de fantôme. Dans Akira, Neo-Tokyo et les pouvoirs psychiques.',
    powerSystem: {
      name: 'Cyberware / Netrunning / Psychique',
      description: 'Cyberware (implants cybernétiques) : augmentation de la force, de la vitesse, des réflexes. Netrunning : navigation sur le réseau, piratage. Psychique : télékinésie à la Akira. Risque de cyberpsychose : trop d\'implants = perte de santé mentale.',
      ranks: ['Gamin des rues', 'Edgerunner', 'Netrunner', 'Cyberpsycho', 'Légende (Johnny Silverhand)']
    },
    factions: [
      { name: 'Arasaka', description: 'La megacorp japonaise de Cyberpunk. Armes et sécurité.', alignment: 'evil' },
      { name: 'Militech', description: 'La megacorp américaine. Technologie militaire.', alignment: 'evil' },
      { name: 'Gangs de rue (Maelstrom, Tyger Claws, Valentinos)', description: 'Les gangs de rue de Night City.', alignment: 'neutral' },
      { name: 'Netwatch', description: 'L\'organisation de sécurité du réseau. Traque les netrunners.', alignment: 'neutral' },
      { name: 'Psycho-Pass Sibyl System', description: 'Le système d\'IA qui mesure le coefficient de criminalité. Contrôle la société.', alignment: 'neutral' },
      { name: 'Section 9', description: 'L\'unité anti-terroriste de Ghost in the Shell.', alignment: 'good' }
    ],
    locations: [
      { name: 'Night City', description: 'La ville de Cyberpunk 2077. Watson, Westbrook, Heywood, Santo Domingo, Pacifica.', dangerLevel: 'extreme' },
      { name: 'Neo-Tokyo', description: 'Le Tokyo dystopique d\'Akira. Pouvoirs psychiques.', dangerLevel: 'high' },
      { name: 'Tokyo (Psycho-Pass)', description: 'La ville sous le contrôle du Sibyl System.', dangerLevel: 'medium' },
      { name: 'Niihama (Ghost in the Shell)', description: 'Le monde du cerveau cybernétique et du fantôme.', dangerLevel: 'medium' }
    ],
    notableCharacters: [
      { name: 'V', role: 'Mercenaire, implant Relic', powerLevel: 85 },
      { name: 'Johnny Silverhand', role: 'Rockerboy, terroriste', powerLevel: 70 },
      { name: 'Motoko Kusanagi', role: 'Major, cerveau cybernétique', powerLevel: 90 },
      { name: 'Akane Tsunemori', role: 'Inspectrice, Sibyl System', powerLevel: 60 },
      { name: 'Kaneda', role: 'Chef de gang de motards', powerLevel: 65 },
      { name: 'Tetsuo', role: 'Pouvoirs psychiques', powerLevel: 95 }
    ],
    keyEvents: ['Assaut de la Arasaka Tower', 'Épidémie de cyberpsychose', 'Opérations Netwatch', 'Le réveil d\'Akira', 'Dévoilement du Sibyl System'],
    themes: ['Technologie', 'Identité', 'Dystopie', 'Humanité', 'Contrôle', 'Liberté', 'Cyberpsychose']
  }
};