export type QuoteLang = 'tr' | 'en' | 'ja' | 'fr';

export interface AnimeQuote {
  id: string;
  character: string;
  work: string;
  text: Record<QuoteLang, string>;
}

/**
 * Kısa, atribüsyonlu replikler. Çeviriler uyarlamadır; resmi dublaj/alt yazı
 * metni olduğu iddia edilmez.
 */
export const ANIME_QUOTES: AnimeQuote[] = [
  {
    id: 'spike-whatever',
    character: 'Spike Spiegel',
    work: 'Cowboy Bebop',
    text: {
      tr: 'Ne olursa olur.',
      en: 'Whatever happens, happens.',
      ja: 'なるようになるさ。',
      fr: 'Ce qui doit arriver arrivera.',
    },
  },
  {
    id: 'luffy-pirate-king',
    character: 'Monkey D. Luffy',
    work: 'One Piece',
    text: {
      tr: 'Ben Korsanlar Kralı olacağım!',
      en: "I'm gonna be the Pirate King!",
      ja: '俺は海賊王になる！',
      fr: 'Je serai le Roi des Pirates !',
    },
  },
  {
    id: 'edward-pain',
    character: 'Edward Elric',
    work: 'Fullmetal Alchemist: Brotherhood',
    text: {
      tr: 'Acı çekmeden öğrenilen ders anlamsızdır.',
      en: 'A lesson without pain is meaningless.',
      ja: '痛みのない教訓に意味はない。',
      fr: "Une leçon sans douleur n'a pas de sens.",
    },
  },
  {
    id: 'itachi-faith',
    character: 'Itachi Uchiha',
    work: 'Naruto',
    text: {
      tr: 'İnsanların hayatı öldüklerinde bitmez; inançlarını kaybettiklerinde biter.',
      en: "People's lives don't end when they die. It ends when they lose faith.",
      ja: '人の人生は死んだ時に終わるのではない。信じる心を失った時に終わるのだ。',
      fr: "La vie des gens ne s'arrête pas à leur mort, mais lorsqu'ils perdent la foi.",
    },
  },
  {
    id: 'all-might-plus-ultra',
    character: 'All Might',
    work: 'My Hero Academia',
    text: {
      tr: 'Plus Ultra!',
      en: 'Plus Ultra!',
      ja: 'プラスウルトラ！',
      fr: 'Plus Ultra !',
    },
  },
  {
    id: 'mikasa-cruel',
    character: 'Mikasa Ackerman',
    work: 'Attack on Titan',
    text: {
      tr: 'Dünya zalim ama aynı zamanda çok güzel.',
      en: 'The world is cruel, but also very beautiful.',
      ja: '世界は残酷で、でもとても美しい。',
      fr: 'Le monde est cruel, mais aussi très beau.',
    },
  },
  {
    id: 'eren-fight',
    character: 'Eren Yeager',
    work: 'Attack on Titan',
    text: {
      tr: 'Savaşmazsan kazanamazsın.',
      en: "If you don't fight, you can't win.",
      ja: '戦わなければ勝てない。',
      fr: 'Si tu ne te bats pas, tu ne peux pas gagner.',
    },
  },
  {
    id: 'light-potato-chip',
    character: 'Light Yagami',
    work: 'Death Note',
    text: {
      tr: 'Bir cips alacağım... ve yiyeceğim!',
      en: "I'll take a potato chip... and eat it!",
      ja: 'ポテトチップスを取って…食べる！',
      fr: 'Je vais prendre une chips... et la manger !',
    },
  },
  {
    id: 'zelda-dangerous',
    character: 'The Legend of Zelda',
    work: 'The Legend of Zelda',
    text: {
      tr: 'Tek başına gitmek tehlikeli! Bunu al.',
      en: "It's dangerous to go alone! Take this.",
      ja: '一人で行くのは危険だ！これを持っていけ。',
      fr: "C'est dangereux d'y aller seul ! Prends ça.",
    },
  },
  {
    id: 'fallout-war',
    character: 'Fallout',
    work: 'Fallout',
    text: {
      tr: 'Savaş. Savaş asla değişmez.',
      en: 'War. War never changes.',
      ja: '戦争。戦争は決して変わらない。',
      fr: 'La guerre. La guerre ne change jamais.',
    },
  },
  {
    id: 'portal-cake',
    character: 'Portal',
    work: 'Portal',
    text: {
      tr: 'Pasta bir yalan.',
      en: 'The cake is a lie.',
      ja: 'ケーキは嘘だ。',
      fr: 'Le gâteau est un mensonge.',
    },
  },
  {
    id: 'bioshock-man',
    character: 'BioShock',
    work: 'BioShock',
    text: {
      tr: 'İnsan seçer, köle itaat eder.',
      en: 'A man chooses, a slave obeys.',
      ja: '人間は選び、奴隷は従う。',
      fr: 'Un homme choisit, un esclave obéit.',
    },
  },
  {
    id: 'kino-world',
    character: 'Kino',
    work: "Kino's Journey",
    text: {
      tr: 'Dünya güzel değil, bu yüzden güzel.',
      en: 'The world is not beautiful, therefore it is.',
      ja: '世界は美しくない、だから美しい。',
      fr: "Le monde n'est pas beau, c'est pour cela qu'il l'est.",
    },
  },
  {
    id: 'naruto-way',
    character: 'Naruto Uzumaki',
    work: 'Naruto',
    text: {
      tr: 'Sözümden asla dönmem. Ninja yolum budur.',
      en: 'I never go back on my word. That’s my ninja way.',
      ja: '俺は自分の言葉を曲げない。それが忍道だ。',
      fr: 'Je ne trahis jamais ma parole. C’est ma voie de ninja.',
    },
  },
  {
    id: 'kakashi-friends',
    character: 'Kakashi Hatake',
    work: 'Naruto',
    text: {
      tr: 'Arkadaşlarını bırakanlar, kuralları çiğneyenlerden daha kötüdür.',
      en: 'Those who abandon their friends are worse than scum.',
      ja: '仲間を捨てる奴は、ルールを破る奴より最低だ。',
      fr: 'Ceux qui abandonnent leurs amis sont pires que des canailles.',
    },
  },
  {
    id: 'lelouch-kill',
    character: 'Lelouch Lamperouge',
    work: 'Code Geass',
    text: {
      tr: 'Öldürmesi gerekenler, öldürülmeye hazır olanlardır.',
      en: 'The only ones who should kill are those prepared to be killed.',
      ja: '殺すべき者は、殺される覚悟のある者だけだ。',
      fr: 'Seuls ceux qui sont prêts à mourir devraient tuer.',
    },
  },
  {
    id: 'levi-regret',
    character: 'Levi Ackerman',
    work: 'Attack on Titan',
    text: {
      tr: 'Seçtiğin yoldan pişman olmayacağına inan.',
      en: 'Believe that you won’t regret the choice you made.',
      ja: '自分が選んだ道を後悔しないと信じろ。',
      fr: 'Crois que tu ne regretteras pas le choix que tu as fait.',
    },
  },
  {
    id: 'armin-sacrifice',
    character: 'Armin Arlert',
    work: 'Attack on Titan',
    text: {
      tr: 'Hiçbir şeyi feda edemeyen, hiçbir şeyi değiştiremez.',
      en: 'Someone who cannot sacrifice anything cannot change anything.',
      ja: '何も犠牲にできない者は、何も変えられない。',
      fr: 'Celui qui ne peut rien sacrifier ne peut rien changer.',
    },
  },
  {
    id: 'guts-endure',
    character: 'Guts',
    work: 'Berserk',
    text: {
      tr: 'Dayan, katlan ve ilerle.',
      en: 'Struggle, endure, contend.',
      ja: '抗い、耐え、争え。',
      fr: 'Lutte, endure, affronte.',
    },
  },
  {
    id: 'zoro-nothing',
    character: 'Roronoa Zoro',
    work: 'One Piece',
    text: {
      tr: 'Hiçbir şey olmadı.',
      en: 'Nothing happened.',
      ja: '何もなかった。',
      fr: 'Il ne s’est rien passé.',
    },
  },
  {
    id: 'luffy-free',
    character: 'Monkey D. Luffy',
    work: 'One Piece',
    text: {
      tr: 'Korsanlar Kralı, dünyanın en özgür insanıdır.',
      en: 'The Pirate King is the most free person in the world.',
      ja: '海賊王はこの世界で一番自由な奴だ。',
      fr: 'Le Roi des Pirates est l’homme le plus libre du monde.',
    },
  },
  {
    id: 'gintoki-live',
    character: 'Gintoki Sakata',
    work: 'Gintama',
    text: {
      tr: 'Güzel bir ölüm düşünecek vaktin varsa, sonuna kadar güzel yaşa.',
      en: 'If you have time to think of a beautiful death, live beautifully until the end.',
      ja: '美しい死を考える時間があるなら、最後まで美しく生きろ。',
      fr: 'Si tu as le temps de penser à une belle mort, vis magnifiquement jusqu’au bout.',
    },
  },
  {
    id: 'saitama-fun',
    character: 'Saitama',
    work: 'One Punch Man',
    text: {
      tr: 'Ben sadece eğlencesine kahramanlık yapan biriyim.',
      en: 'I’m just a guy who’s a hero for fun.',
      ja: '俺は趣味でヒーローをやってる男だ。',
      fr: 'Je suis juste un type qui fait le héros pour le fun.',
    },
  },
  {
    id: 'gojo-strongest',
    character: 'Satoru Gojo',
    work: 'Jujutsu Kaisen',
    text: {
      tr: 'Merak etme. En güçlü benim.',
      en: 'Don’t worry. I’m the strongest.',
      ja: '心配するな。俺が最強だ。',
      fr: 'Ne t’inquiète pas. C’est moi le plus fort.',
    },
  },
  {
    id: 'yuji-live',
    character: 'Yuji Itadori',
    work: 'Jujutsu Kaisen',
    text: {
      tr: 'Yaşadığım şekilde pişman olmak istemiyorum.',
      en: 'I don’t want to regret the way I lived.',
      ja: '自分の生き方に後悔したくない。',
      fr: 'Je ne veux pas regretter ma façon de vivre.',
    },
  },
  {
    id: 'tanjiro-live',
    character: 'Tanjiro Kamado',
    work: 'Demon Slayer',
    text: {
      tr: 'Kaç kişiyi kaybedersen kaybet, yaşamaya devam etmelisin.',
      en: 'No matter how many people you lose, you have to keep living.',
      ja: 'どれだけ多くの人を失っても、生き続けなければならない。',
      fr: 'Peu importe combien de personnes tu perds, tu dois continuer à vivre.',
    },
  },
  {
    id: 'anya-waku',
    character: 'Anya Forger',
    work: 'Spy × Family',
    text: {
      tr: 'Waku waku!',
      en: 'Waku waku!',
      ja: 'わくわく！',
      fr: 'Waku waku !',
    },
  },
  {
    id: 'edward-heart',
    character: 'Edward Elric',
    work: 'Fullmetal Alchemist: Brotherhood',
    text: {
      tr: 'Tam kalpli bir yürek.',
      en: 'A heart made fullmetal.',
      ja: '鋼の心。',
      fr: 'Un cœur de métal.',
    },
  },
  {
    id: 'roy-rain',
    character: 'Roy Mustang',
    work: 'Fullmetal Alchemist: Brotherhood',
    text: {
      tr: 'Yağmur için berbat bir gün.',
      en: 'It’s a terrible day for rain.',
      ja: '雨が降る日は、どうも苦手でな。',
      fr: 'C’est une sale journée pour la pluie.',
    },
  },
  {
    id: 'kenshin-sword',
    character: 'Kenshin Himura',
    work: 'Rurouni Kenshin',
    text: {
      tr: 'Kılıç bir silahtır; kılıç sanatı öldürme sanatıdır.',
      en: 'The sword is a weapon; swordsmanship is the art of killing.',
      ja: '剣は武器であり、剣術は人を斬る術だ。',
      fr: 'Le sabre est une arme ; l’art du sabre est l’art de tuer.',
    },
  },
  {
    id: 'vash-love-peace',
    character: 'Vash the Stampede',
    work: 'Trigun',
    text: {
      tr: 'Bu dünya sevgi ve barıştan yapılmış!',
      en: 'This world is made of love and peace!',
      ja: 'この世界は愛と平和でできている！',
      fr: 'Ce monde est fait d’amour et de paix !',
    },
  },
  {
    id: 'natsu-fired',
    character: 'Natsu Dragneel',
    work: 'Fairy Tail',
    text: {
      tr: 'İçim kıpır kıpır!',
      en: 'I’m all fired up!',
      ja: '燃えてきた！',
      fr: 'Je suis tout feu tout flamme !',
    },
  },
  {
    id: 'escanor-who',
    character: 'Escanor',
    work: 'The Seven Deadly Sins',
    text: {
      tr: 'Buna kim karar verdi?',
      en: 'Who decided that?',
      ja: '誰が決めた？',
      fr: 'Qui a décidé ça ?',
    },
  },
  {
    id: 'asta-never',
    character: 'Asta',
    work: 'Black Clover',
    text: {
      tr: 'Benim büyüm asla pes etmemek!',
      en: 'My magic is never giving up!',
      ja: '俺の魔法は諦めないことだ！',
      fr: 'Ma magie, c’est de ne jamais abandonner !',
    },
  },
  {
    id: 'deku-power',
    character: 'Izuku Midoriya',
    work: 'My Hero Academia',
    text: {
      tr: 'Bu benim gücüm değil; herkesin gücü.',
      en: 'It’s not my power; it’s everyone’s power.',
      ja: 'これは俺の力じゃない。みんなの力だ。',
      fr: 'Ce n’est pas mon pouvoir, c’est celui de tous.',
    },
  },
  {
    id: 'bakugo-number-one',
    character: 'Katsuki Bakugo',
    work: 'My Hero Academia',
    text: {
      tr: 'Bir numaralı kahraman olacağım.',
      en: 'I’ll become the number one hero.',
      ja: '俺が一番のヒーローになる。',
      fr: 'Je deviendrai le héros numéro un.',
    },
  },
  {
    id: 'light-justice',
    character: 'Light Yagami',
    work: 'Death Note',
    text: {
      tr: 'Ben adaletin ta kendisiyim!',
      en: 'I am justice!',
      ja: '俺が正義だ！',
      fr: 'Je suis la justice !',
    },
  },
  {
    id: 'l-law',
    character: 'L',
    work: 'Death Note',
    text: {
      tr: 'Ben L’im.',
      en: 'I am L.',
      ja: '私はLだ。',
      fr: 'Je suis L.',
    },
  },
  {
    id: 'goku-need',
    character: 'Goku',
    work: 'Dragon Ball Z',
    text: {
      tr: 'Güç, arzuya değil ihtiyaca cevap verir.',
      en: 'Power comes in response to a need, not a desire.',
      ja: '力は欲望ではなく、必要に応えてくれる。',
      fr: 'La force répond à un besoin, pas à un désir.',
    },
  },
  {
    id: 'vegeta-9000',
    character: 'Vegeta',
    work: 'Dragon Ball Z',
    text: {
      tr: 'Dokuz binin üzerinde!',
      en: 'It’s over nine thousand!',
      ja: '9000以上だ！',
      fr: 'C’est plus de neuf mille !',
    },
  },
  {
    id: 'shanks-friends',
    character: 'Shanks',
    work: 'One Piece',
    text: {
      tr: 'İçkini üstüme dökebilirsin... ama arkadaşlarıma zarar vereni affetmem.',
      en: 'You can pour drinks on me... but I won’t forgive anyone who harms my friends.',
      ja: '酒をかけられてもいい…だが仲間に手を出す奴は許さない。',
      fr: 'Tu peux me renverser des verres dessus... mais je ne pardonnerai pas à ceux qui blessent mes amis.',
    },
  },
];
