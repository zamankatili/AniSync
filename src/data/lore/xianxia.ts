import { WorldLore } from './types';

/**
 * Xianxia / Cultivation dünyası bilgi kartı.
 *
 * Dürüstlük notu: burada anlatılan kademeler tür sözlüğüdür, tek bir kanon
 * değildir — her eser kendi sistemini kurar. Kaynak seriler gerçek donghua
 * yapımlarıdır; uydurma başlık yok. Roman metni bu projede hiçbir yerde
 * barındırılmaz.
 */
export const xianxiaLore: WorldLore = {
  worldId: 'xianxia_cultivation',
  summary:
    'Qi toplayıp bedeni ve ruhu arındırarak yükseldiğin cultivation dünyası. Tarikatlar, kadim aileler ve gezgin cultivator\'lar aynı kaynaklar için yarışır; uzun yaşam mümkündür ama her kademe atlayışı bedel ister. Kademe adları esere göre değişir; buradaki şema tür sözlüğüdür, tek doğru kanon değil.',
  history:
    'Xianxia, Taocu simya ve Çin mitolojisinden beslenen bir fantezi türüdür; wuxia\'nın insan sınırları içinde kalan dövüş hikâyelerinden farklı olarak ölümsüzlük ve tanrısal ölçek iddiası taşır. 2010\'lardan sonra Çin web romanları ve bunların donghua uyarlamaları türü küreselleştirdi: A Record of a Mortal\'s Journey to Immortality, Soul Land, Battle Through the Heavens, The Daily Life of the Immortal King. AniSync yalnız animasyon/çizgi roman meta verisini gösterir; roman metni barındırmaz.',
  powerSystem: {
    name: 'Qi / Cultivation / Ruhsal Kademeler',
    description:
      'Cultivation (xiulian), qi toplayıp meridyenlerden dantian\'a yönlendirmek ve bedeni arındırmaktır. Yaygın iskelet: qi toplama → temel kurma → çekirdek oluşumu → ruhsal bebek → ruh oluşumu → ölümsüzlüğe yükseliş. Bu sıra kanon değildir; yazar aşamaları böler, birleştirir veya atlar. "Qi sapması" (走火入魔) yanlış pratiğin bedelidir.',
    ranks: [
      'Qi Toplama (Qi Refining)',
      'Temel Kurma (Foundation Establishment)',
      'Çekirdek Oluşumu / Altın Çekirdek (Core Formation)',
      'Ruhsal Bebek (Nascent Soul)',
      'Ruh Oluşumu (Soul Formation)',
      'Ölümsüzlüğe Yükseliş (Immortal Ascension)'
    ]
  },
  factions: [
    { name: 'Tarikatlar (Sects)', description: 'Dağ kapılarında yaşayan, kaynak ve itibar için yarışan öğreti toplulukları. İç ve dış disiplin ayrımı yaygındır.', alignment: 'neutral' },
    { name: 'Kadim Aileler', description: 'Kan bağıyla güç devreden soylu haneler; evlilik ve ittifak siyaseti belirler.', alignment: 'neutral' },
    { name: 'Gezgin Cultivator\'lar', description: 'Tarikat dışında, kendi kuralıyla yaşayan yalnız yetişkinler. Özgür ama korumasız.', alignment: 'neutral' },
    { name: 'Simyacı Loncası', description: 'Dan, iksir ve silah üreten zanaatkâr gücü; savaşta değil pazarda belirleyici.', alignment: 'good' }
  ],
  locations: [
    { name: 'Yedi Gizem Tarikatı (七玄门)', description: 'Dağ tarikatı: şifalı ot toplama, dış/iç disiplin ayrımı, sıradan insanlarla cultivator\'ların yan yana yaşaması.', dangerLevel: 'medium' },
    { name: 'Shrek Akademisi (史莱克学院)', description: 'Yalnız en güçlü yetenekleri alan ruh ustası akademisi; eğitim acımasız.', dangerLevel: 'high' },
    { name: 'Jiama İmparatorluğu (加玛帝国)', description: 'Simyacı loncası, müzayedeler ve çöl sınırındaki klan çatışmaları.', dangerLevel: 'high' },
    { name: 'Star Luo İmparatorluğu (星罗帝国)', description: 'Askerî imparatorluk: ruh ustası birlikleri ve sürekli sınır savaşı.', dangerLevel: 'extreme' }
  ],
  notableCharacters: [
    { name: 'Han Li (韓立)', role: 'A Record of a Mortal\'s Journey to Immortality — sıradan başlayıp sabırla yükselen cultivator', powerLevel: 85 },
    { name: 'Tang San (唐三)', role: 'Soul Land — ruh ustası, akademinin en güçlü yeteneklerinden', powerLevel: 90 },
    { name: 'Xiao Yan (蕭炎)', role: 'Battle Through the Heavens — simyacı ve dövüşçü, düşüşten dönüş', powerLevel: 88 },
    { name: 'Wang Ling (王令)', role: 'The Daily Life of the Immortal King — aşırı güçlü ama sıradan görünmeye çalışan öğrenci', powerLevel: 95 },
    { name: 'Yao Chen / Yao Lao', role: 'Battle Through the Heavens — hoca ruhu, simya bilgisinin kaynağı', powerLevel: 80 }
  ],
  keyEvents: [
    'Qi duyumsama ve ilk kademe',
    'Tarikat seçmeleri',
    'İlk gerçek kademe atlayışı',
    'Qi sapması (走火入魔) riski',
    'Müzayede ve kaynak kavgası',
    'Ölümsüzlük eşiği'
  ],
  themes: ['Sabır', 'Hırs ve Bedel', 'Usta-Çırak', 'Sınıf ve Kaynak Eşitsizliği', 'Uzun Yaşamın Yalnızlığı', 'Disiplin', 'Gücün Ahlakı'],
  sourceSeries: [
    'A Record of a Mortal\'s Journey to Immortality',
    'Soul Land',
    'Battle Through the Heavens',
    'The Daily Life of the Immortal King'
  ],
  ja: {
    summary:
      '気を集めて肉体と魂を鍛え、高みを目指す修行の世界。宗門、古き一族、そして流浪の修行者が同じ資源を奪い合う。長命は可能だが、段階を上がるたびに代償が伴う。段階の呼称は作品ごとに異なり、ここに示す体系はジャンルの語彙であって唯一の正典ではない。',
    history:
      '仙侠は道教の錬丹術と中国神話を背景にしたファンタジーで、人の限界にとどまる武侠とは異なり、不老不死と神的な規模を扱う。2010年代以降、中国のウェブ小説とそのドンファ化がジャンルを世界へ広げた。『凡人修仙伝』『斗羅大陸』『闘破穹天』『仙王の日常』など。AniSync はアニメ・漫画のメタデータのみを扱い、小説本文は掲載しない。',
    powerSystem: {
      name: '気／修行／霊的な段階',
      description:
        '修行（シウリャン）とは、気を集めて経脈から丹田へ導き、肉体を清めること。よく見られる骨格は、錬気 → 築基 → 金丹（核の形成）→ 元嬰（霊的胎児）→ 化神（魂の形成）→ 昇仙。ただしこれは正典ではなく、作者が段階を分けたり統合したり省略したりする。「走火入魔」（気の暴走）は誤った修行の代償だ。',
      ranks: ['錬気', '築基', '金丹', '元嬰', '化神', '昇仙']
    },
    factions: [
      { name: '宗門', description: '山門に住み、資源と名声を争う修行の共同体。外門と内門の区別が多い。', alignment: 'neutral' },
      { name: '古き一族', description: '血筋で力を継ぐ名家。婚姻と同盟の政治がものを言う。', alignment: 'neutral' },
      { name: '流浪の修行者', description: '宗門に属さず自らの掟で生きる者。自由だが守りはない。', alignment: 'neutral' },
      { name: '錬丹師ギルド', description: '丹薬や武器を作る職能勢力。戦場ではなく市場で影響力を持つ。', alignment: 'good' }
    ],
    locations: [
      { name: '七玄門', description: '山の宗門。薬草採集、外門と内門の区別、凡人が修行者と隣り合って暮らす場所。', dangerLevel: 'medium' },
      { name: 'シュレック学院', description: '最も強い素質だけを受け入れる武魂学院。訓練は過酷。', dangerLevel: 'high' },
      { name: 'ジャマ帝国', description: '錬丹師ギルド、競売、砂漠国境の一族抗争。', dangerLevel: 'high' },
      { name: '星羅帝国', description: '軍事帝国。武魂師の軍団と絶えない国境戦争。', dangerLevel: 'extreme' }
    ],
    notableCharacters: [
      { name: '韓立', role: '『凡人修仙伝』— 凡から始め、忍耐で登りつめる修行者', powerLevel: 85 },
      { name: '唐三', role: '『斗羅大陸』— 武魂師、学院最強の才能の一人', powerLevel: 90 },
      { name: '蕭炎', role: '『闘破穹天』— 錬丹師にして戦士、どん底からの逆転', powerLevel: 88 },
      { name: '王令', role: '『仙王の日常』— 桁違いに強いが普通に見せようとする学生', powerLevel: 95 },
      { name: '薬老（ヤオ・ラオ）', role: '『闘破穹天』— 師の魂、錬丹知識の源', powerLevel: 80 }
    ],
    keyEvents: ['気を感じ、最初の段階へ', '宗門の選抜', '最初の本格的な突破', '走火入魔の危険', '競売と資源争い', '不老の境'],
    themes: ['忍耐', '野心と代償', '師弟', '階級と資源の不平等', '長命の孤独', '規律', '力の倫理']
  },
  fr: {
    summary:
      'Un monde de cultivation où l\'on accumule le qi et affine corps et esprit pour s\'élever. Sectes, clans anciens et cultivateurs errants se disputent les mêmes ressources ; une longue vie est possible, mais chaque palier exige un prix. Les noms des paliers varient selon l\'œuvre : ce schéma est un vocabulaire de genre, pas un canon unique.',
    history:
      'Le xianxia est une fantasy nourrie d\'alchimie taoïste et de mythologie chinoise ; contrairement au wuxia, qui reste dans les limites humaines, il revendique l\'immortalité et une échelle divine. Depuis les années 2010, les web-romans chinois et leurs adaptations donghua ont mondialisé le genre : A Record of a Mortal\'s Journey to Immortality, Soul Land, Battle Through the Heavens, The Daily Life of the Immortal King. AniSync n\'affiche que des métadonnées d\'animation et de bande dessinée, jamais le texte des romans.',
    powerSystem: {
      name: 'Qi / cultivation / paliers spirituels',
      description:
        'La cultivation (xiulian) consiste à rassembler le qi, à le faire circuler par les méridiens jusqu\'au dantian et à purifier le corps. L\'ossature fréquente : raffinement du qi → fondation → formation du noyau (noyau d\'or) → âme naissante → formation de l\'âme → ascension immortelle. Cet ordre n\'est pas canonique : chaque auteur scinde, fusionne ou saute des paliers. La « déviation du qi » (走火入魔) est le prix d\'une pratique erronée.',
      ranks: ['Raffinement du qi', 'Fondation', 'Noyau d\'or', 'Âme naissante', 'Formation de l\'âme', 'Ascension immortelle']
    },
    factions: [
      { name: 'Sectes', description: 'Communautés vivant derrière des portes de montagne, en concurrence pour ressources et prestige. La séparation entre disciples externes et internes est courante.', alignment: 'neutral' },
      { name: 'Clans anciens', description: 'Maisons nobles où le pouvoir se transmet par le sang ; la politique des mariages et des alliances décide.', alignment: 'neutral' },
      { name: 'Cultivateurs errants', description: 'Ceux qui vivent hors des sectes selon leur propre loi. Libres, mais sans protection.', alignment: 'neutral' },
      { name: 'Guilde des alchimistes', description: 'Puissance artisanale des pilules et des armes ; décisive sur le marché plus que sur le champ de bataille.', alignment: 'good' }
    ],
    locations: [
      { name: 'Secte des Sept Mystères (七玄门)', description: 'Secte de montagne : cueillette d\'herbes, séparation externe/interne, mortels vivant aux côtés des cultivateurs.', dangerLevel: 'medium' },
      { name: 'Académie Shrek (史莱克学院)', description: 'Académie de maîtres d\'esprit qui n\'admet que les talents les plus forts ; entraînement impitoyable.', dangerLevel: 'high' },
      { name: 'Empire de Jia Ma (加玛帝国)', description: 'Guilde des alchimistes, enchères et querelles de clans à la frontière du désert.', dangerLevel: 'high' },
      { name: 'Empire de Star Luo (星罗帝国)', description: 'Empire militaire : légions de maîtres d\'esprit et guerre de frontière permanente.', dangerLevel: 'extreme' }
    ],
    notableCharacters: [
      { name: 'Han Li (韓立)', role: 'A Record of a Mortal\'s Journey to Immortality — parti de rien, monté par la patience', powerLevel: 85 },
      { name: 'Tang San (唐三)', role: 'Soul Land — maître d\'esprit, l\'un des talents les plus forts de l\'académie', powerLevel: 90 },
      { name: 'Xiao Yan (蕭炎)', role: 'Battle Through the Heavens — alchimiste et combattant, retour après la chute', powerLevel: 88 },
      { name: 'Wang Ling (王令)', role: 'The Daily Life of the Immortal King — étudiant surpuissant qui veut paraître ordinaire', powerLevel: 95 },
      { name: 'Yao Chen / Yao Lao', role: 'Battle Through the Heavens — esprit du maître, source du savoir alchimique', powerLevel: 80 }
    ],
    keyEvents: ['Ressentir le qi et premier palier', 'Sélection de la secte', 'Première vraie percée', 'Risque de déviation du qi (走火入魔)', 'Enchères et lutte pour les ressources', 'Seuil de l\'immortalité'],
    themes: ['Patience', 'Ambition et prix', 'Maître et disciple', 'Classe et inégalité des ressources', 'Solitude de la longue vie', 'Discipline', 'Éthique de la puissance']
  }
};
