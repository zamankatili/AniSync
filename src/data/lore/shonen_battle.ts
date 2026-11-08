import { WorldLore } from './types';

export const shonenBattleLore: WorldLore = {
  worldId: 'shonen_battle',
  summary: 'Ninja, kılıç ustası ve şeytan avcılarının yaşadığı, sürekli çatışma ve güçlenme odaklı bir dünya. Güç sistemleri (Chakra, Haki, Nen, Lanetli Enerji) ile karakterler güçlenir; her gün bir savaş, her gün bir meydan okuma.',
  history: 'Bu dünya, güç sistemlerinin keşfedilmesiyle şekillendi. Ninja köyleri (Konoha, Suna, Kiri, Iwa, Kumo) tarihsel olarak birbirleriyle savaştı. Korsan çağında (One Piece) Grand Line keşfedildi. Ruh Avcıları (Bleach) ruhları arındırdı. Büyücüler (Jujutsu Kaisen) lanetli ruhlarla savaştı. Şeytan Avcıları (Demon Slayer) Taisho döneminde şeytanlarla mücadele etti.',
  powerSystem: {
    name: 'Chakra / Haki / Nen / Lanetli Enerji',
    description: 'Her seri kendi güç sistemine sahip: Naruto\'da Chakra (fiziksel+ruhsal enerji), One Piece\'te Haki (gözlem/silah/kraliyet), Hunter x Hunter\'da Nen (aura kontrolü), Jujutsu Kaisen\'de Lanetli Enerji, Demon Slayer\'da Nefes teknikleri.',
    ranks: ['Çırak', 'Genin/Orta', 'Chunin/Üst', 'Jonin/Elit', 'Kage/Yonko', 'Hashira/S-Class']
  },
  factions: [
    { name: 'Konoha (Gizli Yaprak)', description: 'Naruto evreninin köyü. Hokage liderliğinde. Ninja akademisi, genin/chunin/jonin sistemi.', alignment: 'good' },
    { name: 'Akatsuki', description: 'Naruto\'daki suç örgütü. Tailed beast\'leri toplamayı hedefler.', alignment: 'evil' },
    { name: 'Denizciler (Marines)', description: 'One Piece\'te dünya hükümetinin askeri gücü. Adalet ve disiplin.', alignment: 'neutral' },
    { name: 'Korsanlar (Pirates)', description: 'One Piece\'te özgürlük ve macera peşindeki gruplar. Yonko, Shichibukai, Supernova.', alignment: 'neutral' },
    { name: 'Soul Society (Ruh Topluluğu)', description: 'Bleach\'te ruhların dünyası. 13 Mahkeme Tugayı (Gotei 13).', alignment: 'good' },
    { name: 'Arrancar / Espada', description: 'Bleach\'te Hollow\'ların güçlenmiş hali. Aizen\'in ordusu.', alignment: 'evil' },
    { name: 'Jujutsu High', description: 'Jujutsu Kaisen\'de büyücülerin okulu. Gojo, Nanami, Maki vb.', alignment: 'good' },
    { name: 'Cursed Spirits', description: 'Jujutsu Kaisen\'de lanetli ruhlar. İnsan negatif duygularından doğar.', alignment: 'evil' },
    { name: 'Demon Slayer Corps', description: 'Demon Slayer\'da şeytan avcıları örgütü. Hashira (Sütun) liderliğinde.', alignment: 'good' },
    { name: 'Twelve Kizuki', description: 'Demon Slayer\'da Muzan\'ın en güçlü 12 şeytanı.', alignment: 'evil' }
  ],
  locations: [
    { name: 'Konoha (Gizli Yaprak Köyü)', description: 'Naruto\'nun köyü. Hokage Anıtı, Ninja Akademisi.', dangerLevel: 'medium' },
    { name: 'Kanton (Korsanlar Denizi)', description: 'One Piece\'te East Blue\'dan Grand Line\'a geçiş. Baratie, Arlong Park.', dangerLevel: 'high' },
    { name: 'Soul Society', description: 'Bleach\'te ruhların dünyası. Seireitei (Saf Ruh Mahallesi).', dangerLevel: 'high' },
    { name: 'Marley (Devler Ülkesi)', description: 'Attack on Titan\'da düşman ülke. Titan güçlerini elinde tutar.', dangerLevel: 'extreme' },
    { name: 'Jujutsu Lisesi', description: 'Jujutsu Kaisen\'de büyücülerin eğitim yeri. Tokyo metropolitan.', dangerLevel: 'medium' }
  ],
  notableCharacters: [
    { name: 'Naruto Uzumaki', role: 'Hokage adayı, Jinchuriki', powerLevel: 95 },
    { name: 'Monkey D. Luffy', role: 'Korsanlar Kralı adayı, Gomu Gomu no Mi', powerLevel: 90 },
    { name: 'Ichigo Kurosaki', role: 'Soul Reaper, Hollow güçleri', powerLevel: 88 },
    { name: 'Satoru Gojo', role: 'En güçlü büyücü, Altı Göz', powerLevel: 99 },
    { name: 'Tanjiro Kamado', role: 'Şeytan avcısı, Güneş Nefesi', powerLevel: 85 },
    { name: 'Eren Yeager', role: 'Saldırı Titanı, Özgürlük savaşçısı', powerLevel: 92 }
  ],
  keyEvents: [
    'Ninja Savaşları (Naruto)',
    'Marineford Savaşı (One Piece)',
    'Soul Society İstilası (Bleach)',
    'Shibuya Olayı (Jujutsu Kaisen)',
    'Sonsuz Tren (Demon Slayer)',
    'Paradis Adası Operasyonu (Attack on Titan)'
  ],
  themes: ['Güçlenme', 'Dostluk', 'Azim', 'Savaş', 'Kayıp', 'Özgürlük', 'İhanet'],
  sourceSeries: ['Naruto', 'One Piece', 'Bleach', 'Jujutsu Kaisen', 'Demon Slayer', 'Attack on Titan', 'Hunter x Hunter', 'My Hero Academia'],
  ja: {
    summary: '忍者、剣士、悪魔狩りが暮らす、絶え間ない戦いと修行を求める世界。パワーシステム（チャクラ、覇気、念、呪力）でキャラクターは強くなり、毎日が戦い、毎日が挑戦。',
    history: 'この世界は、パワーシステムの発見で形作られた。忍の里（木ノ葉、砂、霧、岩、雲）は歴史的に互いに戦ってきた。海賊時代（ワンピース）にグランドラインが発見された。死神（ブリーチ）が魂を浄化した。呪術師（呪術廻戦）が呪霊と戦った。鬼殺隊（鬼滅の刃）が大正時代に鬼と戦った。',
    powerSystem: {
      name: 'チャクラ / 覇気 / 念 / 呪力',
      description: '各作品が独自のパワーシステムを持つ：『ナルト』ではチャクラ（肉体＋精神エネルギー）、『ワンピース』では覇気（見聞色／武装色／王の覇気）、『ハンター×ハンター』では念（オーラ制御）、『呪術廻戦』では呪力、『鬼滅の刃』では呼吸。',
      ranks: ['見習い', '下忍／中忍', '上忍／上', '影／四皇', '柱／S級']
    },
    factions: [
      { name: '木ノ葉（隠れ里）', description: 'ナルトの村。火影を中心に。忍術学校、下忍・中忍・上忍の制度。', alignment: 'good' },
      { name: '暁', description: 'ナルトの犯罪組織。尾獣を集めることを目指している。', alignment: 'evil' },
      { name: '海軍', description: 'ワンピースの世界政府の軍事力。正義と規律。', alignment: 'neutral' },
      { name: '海賊', description: 'ワンピースで自由と冒険を求める者たち。四皇、王下七武海、最悪の世代。', alignment: 'neutral' },
      { name: '魂の社会（ソウル・ソサエティ）', description: 'ブリーチの霊の世界。十三番隊（護廷十三隊）。', alignment: 'good' },
      { name: 'アランカル／エスパーダ', description: 'ブリーチの虚の進化形態。藍染の軍団。', alignment: 'evil' },
      { name: '呪術高専', description: '呪術廻戦の呪術師の学校。五条、七海、真希など。', alignment: 'good' },
      { name: '呪霊', description: '呪術廻戦の呪霊。人間の負の感情から生まれる。', alignment: 'evil' },
      { name: '鬼殺隊', description: '鬼滅の刃の鬼狩り組織。柱（柱）を中心に。', alignment: 'good' },
      { name: '十二鬼月', description: '鬼滅の刃の無惨の最強の十二の鬼。', alignment: 'evil' }
    ],
    locations: [
      { name: '木ノ葉（隠れ里）', description: 'ナルトの村。火影の記念碑、忍術学校。', dangerLevel: 'medium' },
      { name: 'カントン（海賊の海）', description: 'ワンピースの東の海からグランドラインへの入り口。バラティエ、アーロンパーク。', dangerLevel: 'high' },
      { name: '魂の社会', description: 'ブリーチの霊の世界。瀞霊廷（せいれいてい）。', dangerLevel: 'high' },
      { name: 'マーレ（巨人の国）', description: '進撃の巨人の敵国。巨人の力を保持している。', dangerLevel: 'extreme' },
      { name: '呪術高専', description: '呪術廻戦の呪術師の訓練場所。東京の都心。', dangerLevel: 'medium' }
    ],
    notableCharacters: [
      { name: 'うずまきナルト', role: '火影候補、人柱力', powerLevel: 95 },
      { name: 'モンキー・D・ルフィ', role: '海賊王候補、ゴムゴムの実', powerLevel: 90 },
      { name: '黒崎一護', role: '死神、虚の力', powerLevel: 88 },
      { name: '五条悟', role: '最強の呪術師、六眼', powerLevel: 99 },
      { name: '竈門炭治郎', role: '鬼狩り、日の呼吸', powerLevel: 85 },
      { name: 'エレン・イェーガー', role: '進撃の巨人、自由の戦士', powerLevel: 92 }
    ],
    keyEvents: ['忍界大戦（ナルト）', 'マリンフォード頂上戦争（ワンピース）', 'ソウル・ソサエティ侵攻（ブリーチ）', '渋谷事変（呪術廻戦）', '無限列車（鬼滅の刃）', 'パラディ島作戦（進撃の巨人）'],
    themes: ['成長', '友情', '根性', '戦争', '喪失', '自由', '裏切り']
  },
  fr: {
    summary: 'Un monde de ninjas, de maîtres d\'épée et de chasseurs de démons, axé sur le combat permanent et la puissance. Les systèmes de pouvoir (Chakra, Haki, Nen, énergie maudite) rendent les personnages plus forts ; chaque jour un combat, chaque jour un défi.',
    history: 'Ce monde s\'est formé avec la découverte des systèmes de pouvoir. Les villages ninja (Konoha, Suna, Kiri, Iwa, Kumo) se sont battus entre eux au cours de l\'histoire. À l\'ère des pirates (One Piece), la Grand Line fut découverte. Les shinigami (Bleach) ont purifié les âmes. Les sorciers (Jujutsu Kaisen) combattent les esprits maudits. Les tueurs de démons (Demon Slayer) luttent contre les démons à l\'ère Taishō.',
    powerSystem: {
      name: 'Chakra / Haki / Nen / Énergie maudite',
      description: 'Chaque série a son propre système de pouvoir : Chakra dans Naruto (énergie physique + spirituelle), Haki dans One Piece (observation / armement / suprême), Nen dans Hunter x Hunter (contrôle de l\'aura), énergie maudite dans Jujutsu Kaisen, techniques de respiration dans Demon Slayer.',
      ranks: ['Apprenti', 'Genin / Chunin', 'Jonin / Élite', 'Kage / Yonko', 'Hashira / Classe S']
    },
    factions: [
      { name: 'Konoha (Village Cache)', description: 'Le village de Naruto. Dirigé par le Hokage. Académie ninja, système genin/chunin/jonin.', alignment: 'good' },
      { name: 'Akatsuki', description: 'L\'organisation criminelle de Naruto. Vise à collecter les bêtes à queue.', alignment: 'evil' },
      { name: 'Marines', description: 'La puissance militaire du gouvernement mondial dans One Piece. Justice et discipline.', alignment: 'neutral' },
      { name: 'Pirates', description: 'Les groupes en quête de liberté et d\'aventure dans One Piece. Yonko, Shichibukai, Supernova.', alignment: 'neutral' },
      { name: 'Société des âmes', description: 'Le monde des esprits dans Bleach. Les 13 divisions de la Garde des âmes (Gotei 13).', alignment: 'good' },
      { name: 'Arrancar / Espada', description: 'L\'état évolué des Hollows dans Bleach. L\'armée d\'Aizen.', alignment: 'evil' },
      { name: 'Jujutsu High', description: 'L\'école de sorciers dans Jujutsu Kaisen. Gojo, Nanami, Maki, etc.', alignment: 'good' },
      { name: 'Esprits maudits', description: 'Les esprits maudits dans Jujutsu Kaisen. Nés des émotions négatives humaines.', alignment: 'evil' },
      { name: 'Corps de tueurs de démons', description: 'L\'organisation de tueurs de démons dans Demon Slayer. Dirigée par les Hashira (piliers).', alignment: 'good' },
      { name: 'Douze Lunes', description: 'Les 12 démons les plus puissants de Muzan dans Demon Slayer.', alignment: 'evil' }
    ],
    locations: [
      { name: 'Konoha (Village Cache)', description: 'Le village de Naruto. Monument du Hokage, Académie ninja.', dangerLevel: 'medium' },
      { name: 'Kanton (Mer des pirates)', description: 'Le passage de l\'East Blue vers la Grand Line dans One Piece. Baratie, Arlong Park.', dangerLevel: 'high' },
      { name: 'Société des âmes', description: 'Le monde des esprits dans Bleach. Seireitei (le district des âmes).', dangerLevel: 'high' },
      { name: 'Marley (Pays des géants)', description: 'Le pays ennemi dans l\'Attaque des Titans. Détient le pouvoir des Titans.', dangerLevel: 'extreme' },
      { name: 'Jujutsu High', description: 'Le lieu d\'entraînement des sorciers dans Jujutsu Kaisen. Tokyo métropolitain.', dangerLevel: 'medium' }
    ],
    notableCharacters: [
      { name: 'Naruto Uzumaki', role: 'Candidat Hokage, Jinchuriki', powerLevel: 95 },
      { name: 'Monkey D. Luffy', role: 'Candidat Roi des Pirates, Gomu Gomu no Mi', powerLevel: 90 },
      { name: 'Ichigo Kurosaki', role: 'Shinigami, pouvoirs de Hollow', powerLevel: 88 },
      { name: 'Satoru Gojo', role: 'Le sorcier le plus puissant, Six Yeux', powerLevel: 99 },
      { name: 'Tanjiro Kamado', role: 'Tueur de démons, Respiration Solaire', powerLevel: 85 },
      { name: 'Eren Yeager', role: 'Titan Assaillant, guerrier de la liberté', powerLevel: 92 }
    ],
    keyEvents: ['Guerres ninja (Naruto)', 'Bataille de Marineford (One Piece)', 'Invasion de la Société des âmes (Bleach)', 'Incident de Shibuya (Jujutsu Kaisen)', 'Le train à l\'infini (Demon Slayer)', 'Opération Île de Paradis (Attack on Titan)'],
    themes: ['Croissance', 'Amitié', 'Détermination', 'Guerre', 'Perte', 'Liberté', 'Trahison']
  }
};