/**
 * Küratörlü fan bilgisi veritabanı.
 *
 * Kurallar:
 *  - Her kayıt kısa, doğrulanabilir ve kanon kaynaklı olmalı.
 *  - Söylenti, "duyduğuma göre" veya hayran teorisi yanıt olarak yazılmaz.
 *  - Spoiler içeren kayıtlar `spoiler: true` ile işaretlenir ve varsayılan
 *    olarak gizlenir.
 *  - Kaynak etiketi kaynağı (manga bölümü, resmi site, sektör sözlüğü)
 *    belirtir; bağlantı doğrulama için verilir.
 *
 * Bu sayfa canlı haber değildir; sektör duyuruları AnimeNewsFeed'den gelir.
 */

import type { Localized } from './universePaths';

export type LoreCategory = 'character' | 'world' | 'series' | 'industry' | 'xianxia';

export interface FanLoreEntry {
  id: string;
  category: LoreCategory;
  /** Seri veya konu etiketi (arama için). */
  series: string;
  spoiler: boolean;
  question: Localized;
  answer: Localized;
  sourceLabel: string;
  sourceUrl: string;
  tags: string[];
}

const L = (tr: string, en: string, ja: string, fr: string): Localized => ({ tr, en, ja, fr });

export const FAN_LORE: FanLoreEntry[] = [
  /* ── Karakterler ─────────────────────────────────────────────── */
  {
    id: 'zoro-three-swords',
    category: 'character',
    series: 'One Piece',
    spoiler: true,
    question: L(
      'Zoro neden üç kılıç kullanıyor?',
      'Why does Zoro use three swords?',
      'ゾロはなぜ三刀流なのか？',
      'Pourquoi Zoro utilise-t-il trois sabres ?',
    ),
    answer: L(
      'Çocukluk rakibi Kuina ile bir sözü vardır: dünyanın en güçlü kılıç ustası olmak. Kuina öldükten sonra onun kılıcı Wado Ichimonji’yi taşır ve üç kılıç stilini bu sözü tamamlamak için geliştirir. Üçüncü kılıç yalnızca gösteriş değil, taşıdığı hatıranın parçasıdır.',
      'He made a promise to his childhood rival Kuina: to become the world’s greatest swordsman. After Kuina dies he carries her sword, Wado Ichimonji, and develops the three-sword style to fulfill that promise. The third blade is not just flashy — it is part of the memory he carries.',
      '幼なじみのクイナと「世界一の剣士になる」と約束した。クイナの死後、彼女の愛刀・和道一文字を携え、その約束を果たすために三刀流を編み出した。三本目は見栄ではなく、背負った記憶の一部。',
      'Il a fait une promesse à Kuina, sa rivale d’enfance : devenir le meilleur sabreur du monde. Après la mort de Kuina, il porte son sabre Wado Ichimonji et développe le style à trois sabres pour tenir cette promesse. La troisième lame n’est pas décorative : elle fait partie de la mémoire qu’il porte.',
    ),
    sourceLabel: 'One Piece — manga, cilt 1 (Kuina geri dönüşü)',
    sourceUrl: 'https://en.wikipedia.org/wiki/One_Piece',
    tags: ['zoro', 'kuina', 'wado ichimonji', 'kılıç', 'sword'],
  },
  {
    id: 'kakashi-late',
    category: 'character',
    series: 'Naruto',
    spoiler: true,
    question: L(
      'Kakashi neden hep geç kalıyor?',
      'Why is Kakashi always late?',
      'カカシはなぜいつも遅刻するのか？',
      'Pourquoi Kakashi est-il toujours en retard ?',
    ),
    answer: L(
      'Verdiği bahaneler (kara kedi, yolun üstünde yaşlı bir kadın) gerçek nedeni gizler: her seferinde anma taşına uğrar. Orada Obito, Rin ve kendi geçmişini anar. “Kopya Ninja” unvanını da Obito’nun ona bıraktığı Sharingan’a borçludur.',
      'His excuses (a black cat, an old lady on the road) hide the real reason: he stops at the memorial stone. There he remembers Obito, Rin and his own past. His “Copy Ninja” title comes from the Sharingan Obito left him.',
      '黒猫や道端のおばあさんという言い訳の裏には本当の理由がある。毎回、慰霊碑に立ち寄り、オビトやリン、自分の過去を悼んでいるのだ。「コピー忍者」の異名も、オビトから託された写輪眼によるもの。',
      'Ses excuses (un chat noir, une vieille dame sur la route) cachent la vraie raison : il s’arrête au monument aux morts. Là, il se souvient d’Obito, de Rin et de son propre passé. Son titre de « ninja copieur » vient du Sharingan légué par Obito.',
    ),
    sourceLabel: 'Naruto — manga, Kakashi Gaiden (cilt 27)',
    sourceUrl: 'https://en.wikipedia.org/wiki/Naruto',
    tags: ['kakashi', 'obito', 'sharingan', 'anma taşı', 'memorial'],
  },
  {
    id: 'levi-ackerman',
    category: 'character',
    series: 'Attack on Titan',
    spoiler: true,
    question: L(
      'Levi neden bu kadar güçlü?',
      'Why is Levi so strong?',
      'リヴァイはなぜそんなに強いのか？',
      'Pourquoi Levi est-il si fort ?',
    ),
    answer: L(
      'Levi, Ackerman soyundan gelir. Ackermanlar, güçlü bir koruma dürtüsü tetiklendiğinde insanüstü fiziksel yetenek kazanır; buna “Ackerman uyanışı” denir. Yeraltı şehrinde geçen acımasız çocukluğu ve yıllarca süren pratik de bu yeteneği keskinleştirir.',
      'Levi is of Ackerman descent. Ackermans gain superhuman physical ability when a strong protective urge is triggered — the “Ackerman awakening”. His brutal childhood in the Underground City and years of practice sharpen that ability further.',
      'リヴァイはアッカーマン一族の血を引く。強い守護本能が引き金となり、超人的な身体能力が目覚める——「アッカーマンの覚醒」だ。地下街での過酷な幼少期と長年の鍛錬が、その力に磨きをかけた。',
      'Levi descend des Ackerman. Les Ackerman acquièrent des capacités physiques surhumaines lorsqu’un fort instinct de protection est déclenché : l’« éveil Ackerman ». Son enfance brutale dans la ville souterraine et des années d’entraînement affûtent encore ce don.',
    ),
    sourceLabel: 'Attack on Titan — manga, Ackerman açıklaması',
    sourceUrl: 'https://en.wikipedia.org/wiki/Attack_on_Titan',
    tags: ['levi', 'ackerman', 'awakening', 'survey corps'],
  },
  {
    id: 'gojo-blindfold',
    category: 'character',
    series: 'Jujutsu Kaisen',
    spoiler: false,
    question: L(
      'Gojo gözlerini neden bandajla kapatıyor?',
      'Why does Gojo cover his eyes?',
      '五条はなぜ目を隠しているのか？',
      'Pourquoi Gojo cache-t-il ses yeux ?',
    ),
    answer: L(
      'Gojo “Altı Göz” (Rikugan) ile doğar: sonsuz bilgi akışını neredeyse hiç çaba harcamadan işleyebilir. Bu yetenek sürekli açıkken beynini aşırı yorar. Bandaj, hem bu yükü azaltır hem de Sınırsız tekniğini daha hassas kontrol etmesini sağlar.',
      'Gojo is born with the “Six Eyes” (Rikugan): he can process an enormous flow of information almost effortlessly. Keeping it fully open exhausts his brain, so the blindfold reduces the load and helps him control Limitless with precision.',
      '五条は「六眼」を持って生まれた。膨大な情報をほぼ無意識に処理できるが、常に全開だと脳に大きな負担がかかる。目隠しは負担を減らし、無下限呪術を精密に制御するためでもある。',
      'Gojo naît avec les « Six Eyes » (Rikugan) : il traite un flux immense d’informations presque sans effort. Les garder grands ouverts épuise son cerveau ; le bandeau réduit la charge et l’aide à contrôler l’Infini avec précision.',
    ),
    sourceLabel: 'Jujutsu Kaisen — manga, cilt 1',
    sourceUrl: 'https://en.wikipedia.org/wiki/Jujutsu_Kaisen',
    tags: ['gojo', 'six eyes', 'limitless', 'bandeau'],
  },
  {
    id: 'edward-automail',
    category: 'character',
    series: 'Fullmetal Alchemist',
    spoiler: true,
    question: L(
      'Edward’ın kolu ve bacağı neden metal?',
      'Why are Edward’s arm and leg metal?',
      'エドワードの腕と脚はなぜ機械なのか？',
      'Pourquoi le bras et la jambe d’Edward sont-ils mécaniques ?',
    ),
    answer: L(
      'Edward ve kardeşi Alphonse, ölen annelerini simyayla geri getirmeye çalışır. İnsan transmutasyonu yasaktır ve ağır bir bedel ister: Edward bir bacağını, ardından kardeşinin ruhunu zırha bağlamak için kolunu kaybeder. Automail protezler bu kaybın bedelidir.',
      'Edward and his brother Alphonse try to bring their dead mother back with alchemy. Human transmutation is forbidden and exacts a heavy toll: Edward loses a leg, then an arm to bind Alphonse’s soul to armour. His automail prosthetics are the price of that mistake.',
      'エドワードと弟のアルフォンスは、亡き母を錬金術で蘇らせようとする。人体錬成は禁じられ、重い代償を伴う。エドワードは片脚を、続いてアルの魂を鎧に縛るために片腕を失った。オートメイルはその代償の証。',
      'Edward et son frère Alphonse tentent de ramener leur mère morte par l’alchimie. La transmutation humaine est interdite et coûte cher : Edward perd une jambe, puis un bras pour lier l’âme d’Alphonse à une armure. Ses prothèses automail sont le prix de cette erreur.',
    ),
    sourceLabel: 'Fullmetal Alchemist — manga, cilt 1',
    sourceUrl: 'https://en.wikipedia.org/wiki/Fullmetal_Alchemist',
    tags: ['edward', 'alphonse', 'automail', 'equivalent exchange'],
  },
  {
    id: 'tanjiro-earrings',
    category: 'character',
    series: 'Demon Slayer',
    spoiler: true,
    question: L(
      'Tanjiro’nun hanafuda küpeleri ne anlama geliyor?',
      'What do Tanjiro’s hanafuda earrings mean?',
      '炭治郎の花札の耳飾りにはどんな意味がある？',
      'Que signifient les boucles d’oreilles hanafuda de Tanjiro ?',
    ),
    answer: L(
      'Küpeler babasından kalan bir aile yadigârıdır ve Güneş Nefesi’nin (Hinokami Kagura) görsel sembolüdür. Bu teknik, Yoriichi Tsugikuni’nin yarattığı ilk nefes stilinin aktarımıdır; Tanjiro ailesinin dansı olarak öğrendiği ritüel de aslında bu nefesin bir parçasıdır.',
      'The earrings are a family heirloom from his father and a visual symbol of Sun Breathing (Hinokami Kagura). That technique descends from the first Breathing style created by Yoriichi Tsugikuni; the ritual dance Tanjiro learned from his family is part of that same tradition.',
      '耳飾りは父から受け継いだ家宝で、日の呼吸（ヒノカミ神楽）の象徴。この呼吸法は継国縁壱が生み出した最初の呼吸の流れをくむ。炭治郎が家の踊りとして覚えた神楽も、その伝統の一部だ。',
      'Les boucles sont un héritage familial transmis par son père et le symbole visuel de la Respiration du Soleil (Hinokami Kagura). Cette technique descend du premier style de respiration créé par Yoriichi Tsugikuni ; la danse rituelle apprise en famille en fait partie.',
    ),
    sourceLabel: 'Demon Slayer — manga, cilt 1 ve Hinokami Kagura bölümleri',
    sourceUrl: 'https://en.wikipedia.org/wiki/Demon_Slayer:_Kimetsu_no_Yaiba',
    tags: ['tanjiro', 'hanafuda', 'sun breathing', 'yoriichi'],
  },
  {
    id: 'anya-telepathy',
    category: 'character',
    series: 'Spy x Family',
    spoiler: false,
    question: L(
      'Anya neden insanların düşüncelerini okuyabiliyor?',
      'Why can Anya read minds?',
      'アーニャはなぜ人の心が読めるのか？',
      'Pourquoi Anya peut-elle lire les pensées ?',
    ),
    answer: L(
      'Anya, gizli bir deneyin parçası olarak telepati yeteneği kazanmış bir çocuktur. Ailesinin gerçek mesleğini de bu yüzden bilir; Loid’in casus, Yor’un suikastçı olduğunu öğrenir ama ailesini korumak için bunu saklar. “Waku waku” onun en saf motivasyonudur: heyecan.',
      'Anya is a child who gained telepathy as part of a secret experiment. That is how she knows her family’s real jobs — Loid is a spy, Yor an assassin — and she hides it to keep the family together. “Waku waku” is her purest motivation: excitement.',
      'アーニャは秘密の実験によってテレパシーを得た子ども。だから父ロイドがスパイ、母ヨルが殺し屋だと知っているが、家族を守るために黙っている。「わくわく」が彼女の一番純粋な動機だ。',
      'Anya est une enfant ayant acquis la télépathie lors d’une expérience secrète. C’est ainsi qu’elle sait que Loid est espion et Yor assassin, mais elle le cache pour protéger sa famille. « Waku waku » est sa motivation la plus pure : l’excitation.',
    ),
    sourceLabel: 'Spy x Family — manga, cilt 1',
    sourceUrl: 'https://en.wikipedia.org/wiki/Spy_%C3%97_Family',
    tags: ['anya', 'telepathy', 'experiment', 'forger'],
  },
  {
    id: 'saitama-routine',
    category: 'character',
    series: 'One Punch Man',
    spoiler: false,
    question: L(
      'Saitama nasıl bu kadar güçlendi?',
      'How did Saitama become so strong?',
      'サイタマはどうやって強くなったのか？',
      'Comment Saitama est-il devenu si fort ?',
    ),
    answer: L(
      'Saitama’nın verdiği cevap basit ve komik: her gün 100 şınav, 100 mekik, 100 squat ve 10 km koşu. Saçlarının dökülmesini de bu rutinin yan etkisi olarak açıklar. Hikâye, bu absürt rutinin arkasındaki gerçek nedeni kasıtlı olarak açık bırakır.',
      'Saitama’s answer is simple and comedic: 100 push-ups, 100 sit-ups, 100 squats and a 10 km run every day. He calls his hair loss a side effect of the routine. The story deliberately leaves the real reason behind this absurd regimen open.',
      'サイタマの答えは単純でおかしい：毎日100回の腕立て伏せ、腹筋、スクワット、そして10km走。脱毛もその副作用だと語る。物語はこの馬鹿げた訓練の真の理由をあえて明かさない。',
      'La réponse de Saitama est simple et comique : 100 pompes, 100 abdos, 100 squats et 10 km de course chaque jour. Il attribue sa calvitie à ce routine. L’histoire laisse volontairement ouverte la vraie raison de cet entraînement absurde.',
    ),
    sourceLabel: 'One Punch Man — manga, cilt 1',
    sourceUrl: 'https://en.wikipedia.org/wiki/One-Punch_Man',
    tags: ['saitama', 'training', 'workout', 'bald'],
  },
  {
    id: 'violet-brooch',
    category: 'character',
    series: 'Violet Evergarden',
    spoiler: true,
    question: L(
      'Violet’ın broşu neden bu kadar değerli?',
      'Why is Violet’s brooch so important?',
      'ヴァイオレットのブローチはなぜ大切なのか？',
      'Pourquoi la broche de Violet est-elle si importante ?',
    ),
    answer: L(
      'Broş, Binbaşı Gilbert Bougainvillea’nın Violet’a bıraktığı hatıradır ve onun “sevgi” kelimesinin anlamını arayışının simgesidir. Violet savaşta bir araç olarak yetiştirilmişti; broş, insan olduğunu ve sevildiğini hatırlatan tek somut kanıttır.',
      'The brooch is a memento left to Violet by Major Gilbert Bougainvillea and the symbol of her search for the meaning of “love”. Raised as a tool of war, Violet holds the brooch as the one concrete proof that she was human and loved.',
      'ブローチはギルベルト少佐がヴァイオレットに託した形見であり、「愛」の意味を探す旅の象徴。戦争の道具として育てられた彼女にとって、自分が人間であり愛されていたことを示す唯一の証だ。',
      'La broche est un souvenir laissé à Violet par le major Gilbert Bougainvillea et le symbole de sa quête du sens de « l’amour ». Élevée comme un outil de guerre, Violet y voit la preuve concrète qu’elle était humaine et aimée.',
    ),
    sourceLabel: 'Violet Evergarden — anime, 1. bölüm',
    sourceUrl: 'https://en.wikipedia.org/wiki/Violet_Evergarden',
    tags: ['violet', 'gilbert', 'brooch', 'auto memory doll'],
  },
  {
    id: 'spike-bang',
    category: 'character',
    series: 'Cowboy Bebop',
    spoiler: true,
    question: L(
      'Spike’in “Bang.” repliği ne anlatıyor?',
      'What does Spike’s “Bang.” mean?',
      'スパイクの「Bang.」という台詞の意味は？',
      'Que signifie le « Bang. » de Spike ?',
    ),
    answer: L(
      '“Bang.” Spike’in geçmişiyle ve kendi ölümüyle yüzleşmesinin işaretidir. Final bölümünde parmağıyla silah işareti yapıp bu sözü söyler; bu, kaçtığı geçmişe dönüş ve kapanış anlamına gelir. Bebop’un en çok alıntılanan anlarından biridir.',
      '“Bang.” marks Spike’s confrontation with his past and his own death. In the final episode he makes a finger-gun and says it — a return to the past he fled and a form of closure. It is one of Bebop’s most quoted moments.',
      '「Bang.」はスパイクが過去と自分の死に向き合う印だ。最終話で指鉄砲を作りこの言葉を言う。逃げていた過去への回帰と、一つの決着を意味する。ビバップ屈指の名台詞。',
      '« Bang. » marque la confrontation de Spike avec son passé et sa propre mort. Dans le dernier épisode, il imite un pistolet avec ses doigts et prononce ce mot : un retour au passé qu’il fuyait et une forme de clôture.',
    ),
    sourceLabel: 'Cowboy Bebop — anime, 26. bölüm',
    sourceUrl: 'https://en.wikipedia.org/wiki/Cowboy_Bebop',
    tags: ['spike', 'bang', 'bebop', 'finale'],
  },
  {
    id: 'eren-key',
    category: 'character',
    series: 'Attack on Titan',
    spoiler: true,
    question: L(
      'Eren’in boynundaki anahtar neyi açıyor?',
      'What does the key around Eren’s neck open?',
      'エレンの首の鍵は何を開けるのか？',
      'Que ouvre la clé au cou d’Eren ?',
    ),
    answer: L(
      'Anahtar, Eren’in babası Grisha’nın Shiganshina’daki evinin bodrumunu açar. Bodrum, duvarların dışındaki dünyaya ve titanların gerçek doğasına dair kanıtları barındırır. Serinin ilk bölümünden itibaren kurulan en büyük gizemlerden biridir.',
      'The key opens the basement of Grisha’s house in Shiganshina. That basement holds evidence about the world beyond the walls and the true nature of the Titans — one of the biggest mysteries set up from the very first episode.',
      '鍵は父グリシャのシガンシナ区の家の地下室を開ける。そこには壁の外の世界と巨人の真実を示す証拠がある。第1話から張られた最大の謎の一つ。',
      'La clé ouvre la cave de la maison de Grisha à Shiganshina. Cette cave contient les preuves sur le monde au-delà des murs et la vraie nature des Titans, l’un des plus grands mystères posés dès le premier épisode.',
    ),
    sourceLabel: 'Attack on Titan — manga, cilt 1',
    sourceUrl: 'https://en.wikipedia.org/wiki/Attack_on_Titan',
    tags: ['eren', 'grisha', 'basement', 'key'],
  },

  /* ── Evren kuralları ─────────────────────────────────────────── */
  {
    id: 'naruto-chakra-natures',
    category: 'world',
    series: 'Naruto',
    spoiler: false,
    question: L(
      'Naruto’da beş chakra doğası nedir?',
      'What are the five chakra natures in Naruto?',
      'ナルトの五大チャクラ性質とは？',
      'Quelles sont les cinq natures de chakra dans Naruto ?',
    ),
    answer: L(
      'Ateş, rüzgâr, yıldırım, toprak ve su. Her ninja genellikle bir veya iki doğaya yatkındır; üst düzey ninjalar birden fazlasını kullanabilir. Doğalar arasında bir üstünlük döngüsü vardır: rüzgâr ateşi, ateş rüzgârı değil; su ateşi söndürür gibi.',
      'Fire, wind, lightning, earth and water. Most ninja are attuned to one or two natures, while elite ninja can use more. The natures form a superiority cycle — for example, water extinguishes fire and wind feeds fire.',
      '火・風・雷・土・水の五つ。多くの忍者は一つか二つの性質を持ち、上級忍者は複数を使える。性質には相性の循環がある（水は火を消し、風は火を強めるなど）。',
      'Feu, vent, foudre, terre et eau. La plupart des ninjas maîtrisent une ou deux natures, les élites davantage. Les natures suivent un cycle d’avantage : l’eau éteint le feu, le vent l’attise, etc.',
    ),
    sourceLabel: 'Naruto — manga, chakra doğası açıklaması',
    sourceUrl: 'https://en.wikipedia.org/wiki/Naruto',
    tags: ['chakra', 'nature', 'ninja', 'element'],
  },
  {
    id: 'demon-slayer-breathing',
    category: 'world',
    series: 'Demon Slayer',
    spoiler: true,
    question: L(
      'Nefes stilleri nereden geliyor?',
      'Where do Breathing styles come from?',
      '呼吸法はどこから生まれたのか？',
      'D’où viennent les styles de respiration ?',
    ),
    answer: L(
      'Tüm nefes stilleri, Yoriichi Tsugikuni’nin geliştirdiği Güneş Nefesi’nden türemiştir. Su, Alev, Gök Gürültüsü gibi stiller bu kökten dallanır; Hinokami Kagura ise Güneş Nefesi’nin aile içinde ritüel dans olarak korunmuş hâlidir. Şeytan avcıları bu nefeslerle bedenlerini insanüstü sınırlara taşır.',
      'Every Breathing style descends from Sun Breathing, developed by Yoriichi Tsugikuni. Styles such as Water, Flame and Thunder branch from that root; Hinokami Kagura is Sun Breathing preserved as a family ritual dance. Demon Slayers use these techniques to push their bodies past human limits.',
      'すべての呼吸法は、継国縁壱が編み出した日の呼吸から派生した。水・炎・雷などの呼吸はその幹から枝分かれし、ヒノカミ神楽は日の呼吸が家の ritual 舞として受け継がれたもの。鬼殺隊は呼吸で身体を人の限界以上に高める。',
      'Tous les styles de respiration descendent de la Respiration du Soleil, développée par Yoriichi Tsugikuni. Les styles Eau, Flamme ou Foudre en sont des branches ; le Hinokami Kagura est la Respiration du Soleil conservée comme danse rituelle familiale.',
    ),
    sourceLabel: 'Demon Slayer — manga, Güneş Nefesi açıklaması',
    sourceUrl: 'https://en.wikipedia.org/wiki/Demon_Slayer:_Kimetsu_no_Yaiba',
    tags: ['breathing', 'sun breathing', 'yoriichi', 'hinokami'],
  },
  {
    id: 'one-piece-devil-fruit',
    category: 'world',
    series: 'One Piece',
    spoiler: false,
    question: L(
      'Şeytan Meyvesi’nin zayıflığı ne?',
      'What is the weakness of a Devil Fruit?',
      '悪魔の実の弱点は？',
      'Quelle est la faiblesse d’un Fruit du Démon ?',
    ),
    answer: L(
      'Şeytan Meyvesi yiyen kişi yüzme yeteneğini kaybeder; deniz suyu ve deniz taşı (kairoseki) bedenini güçsüz bırakır. Ayrıca bir kişi yalnızca bir meyve yiyebilir — ikincisi ölümcüldür. Bu kurallar serinin güç dengesinin temelidir.',
      'Anyone who eats a Devil Fruit loses the ability to swim; seawater and Sea Prism Stone (kairoseki) weaken their body. A person can also eat only one fruit — a second is fatal. These rules are the foundation of the series’ power balance.',
      '悪魔の実を食べた者は泳げなくなり、海水や海楼石（カイロセキ）で体が弱まる。また一人が食べられる実は一つだけで、二つ目は死に至る。これが作品の力の均衡の土台だ。',
      'Quiconque mange un Fruit du Démon perd la capacité de nager ; l’eau de mer et la Pierre Marine (kairoseki) affaiblissent son corps. On ne peut manger qu’un seul fruit — un second est fatal. Ces règles fondent l’équilibre des pouvoirs.',
    ),
    sourceLabel: 'One Piece — manga, cilt 1 ve sonrası',
    sourceUrl: 'https://en.wikipedia.org/wiki/One_Piece',
    tags: ['devil fruit', 'seastone', 'swimming', 'luffy'],
  },
  {
    id: 'aot-titan-shifters',
    category: 'world',
    series: 'Attack on Titan',
    spoiler: true,
    question: L(
      'Kimler titana dönüşebilir?',
      'Who can transform into a Titan?',
      '誰が巨人に変身できるのか？',
      'Qui peut se transformer en Titan ?',
    ),
    answer: L(
      'Yalnızca Ymir’in tebaası sayılan Eldialılar titana dönüşebilir. Saf titanlar omurilik sıvısıyla oluşturulur; Dokuz Titan’ın gücünü taşıyan “shifter”lar ise bilinçli dönüşüm yapabilir. Titan gücü, taşıyıcının ölümüyle bir sonraki Eldialı’ya geçer.',
      'Only Eldians, considered Ymir’s subjects, can become Titans. Pure Titans are created with spinal fluid, while the “shifters” who hold one of the Nine Titans can transform consciously. A Titan’s power passes to another Eldian when its holder dies.',
      '巨人になれるのは、ユミルの民とされるエルディア人だけ。純粋な巨人は脊髄液で作られ、九つの巨人の力を持つ「継承者」は意思を持って変身できる。巨人の力は継承者の死とともに次のエルディア人へ移る。',
      'Seuls les Eldiens, sujets d’Ymir, peuvent devenir des Titans. Les Titans purs sont créés avec du liquide spinal, tandis que les « shifters » portant l’un des Neuf Titans se transforment consciemment. Le pouvoir passe à un autre Eldien à la mort du porteur.',
    ),
    sourceLabel: 'Attack on Titan — manga, Titan kökeni',
    sourceUrl: 'https://en.wikipedia.org/wiki/Attack_on_Titan',
    tags: ['titan', 'eldian', 'ymir', 'spinal fluid'],
  },
  {
    id: 'jjk-cursed-energy',
    category: 'world',
    series: 'Jujutsu Kaisen',
    spoiler: false,
    question: L(
      'Lanetli enerji nereden geliyor?',
      'Where does cursed energy come from?',
      '呪力はどこから生まれるのか？',
      'D’où vient l’énergie maudite ?',
    ),
    answer: L(
      'Lanetli enerji, insanların olumsuz duygularından — korku, öfke, kıskançlık — doğar. Bu enerjinin birikmesi lanetli ruhları oluşturur. Büyücüler bu enerjiyi kontrol ederek tekniklerinde kullanır; kontrol edemeyen sıradan insanlar ise lanetlerin hedefi olur.',
      'Cursed energy is born from human negative emotions — fear, anger, jealousy. Its accumulation creates cursed spirits. Sorcerers control this energy to power their techniques, while ordinary people who cannot control it become targets.',
      '呪力は人間の負の感情——恐れ、怒り、嫉妬——から生まれる。それが溜まると呪霊になる。呪術師はこの力を制御して術式に使うが、制御できない一般人は呪いの標的になる。',
      'L’énergie maudite naît des émotions négatives humaines — peur, colère, jalousie. Son accumulation crée des esprits maudits. Les sorciers la contrôlent pour leurs techniques ; les gens ordinaires en deviennent les cibles.',
    ),
    sourceLabel: 'Jujutsu Kaisen — manga, cilt 1',
    sourceUrl: 'https://en.wikipedia.org/wiki/Jujutsu_Kaisen',
    tags: ['cursed energy', 'cursed spirits', 'sorcerer'],
  },
  {
    id: 'hxh-nen',
    category: 'world',
    series: 'Hunter x Hunter',
    spoiler: false,
    question: L(
      'Nen nedir ve nasıl çalışır?',
      'What is Nen and how does it work?',
      '念とは何か、どう機能するのか？',
      'Qu’est-ce que le Nen et comment fonctionne-t-il ?',
    ),
    answer: L(
      'Nen, yaşam enerjisinin (aura) iradeyle kontrol edilmesidir. Temel teknikler Ten, Zetsu, Ren ve Hatsu’dur; Hatsu kişinin kendi yeteneğidir. Nen kullanıcıları ayrıca Güçlendirme, Dönüştürme, Yayma, Manipülasyon, Somutlaştırma ve Uzmanlık kategorilerine ayrılır.',
      'Nen is the controlled use of life energy (aura). The basics are Ten, Zetsu, Ren and Hatsu; Hatsu is a person’s unique ability. Users are also classified into Enhancer, Transmuter, Emitter, Manipulator, Conjurer and Specialist categories.',
      '念は生命エネルギー（オーラ）を意思で制御する技術。基本は纏・絶・練・発で、発が個人の能力。さらに強化系・変化系・放出系・操作系・具現化系・特質系に分類される。',
      'Le Nen est l’utilisation contrôlée de l’énergie vitale (aura). Les bases sont Ten, Zetsu, Ren et Hatsu ; le Hatsu est la capacité unique de chacun. Les utilisateurs se répartissent en Renforcement, Transformation, Émission, Manipulation, Matérialisation et Spécialisation.',
    ),
    sourceLabel: 'Hunter x Hunter — manga, Nen açıklaması',
    sourceUrl: 'https://en.wikipedia.org/wiki/Hunter_%C3%97_Hunter',
    tags: ['nen', 'aura', 'hatsu', 'hunter'],
  },
  {
    id: 'fma-equivalent-exchange',
    category: 'world',
    series: 'Fullmetal Alchemist',
    spoiler: false,
    question: L(
      'Eşdeğer Takas nedir?',
      'What is Equivalent Exchange?',
      '等価交換とは？',
      'Qu’est-ce que l’échange équivalent ?',
    ),
    answer: L(
      'Simyada bir şey yaratmak için eşit değerde başka bir şey vermek gerekir. Kütle korunur; hiçbir şey yoktan var edilemez. İnsan transmutasyonu bu yüzden yasaktır: bir insanın değerini eşitleyecek bir bedel yoktur ve deneme, ağır kayıplarla sonuçlanır.',
      'To create something with alchemy you must give something of equal value. Mass is conserved; nothing can be created from nothing. That is why human transmutation is forbidden: no price equals a human life, and attempts end in severe loss.',
      '錬金術で何かを作るには、等しい価値の何かを差し出さなければならない。質量は保存され、無からは生み出せない。だから人体錬成は禁じられている——人間の命に等しい代償はなく、試みは大きな喪失を招く。',
      'Pour créer quelque chose par l’alchimie, il faut donner quelque chose d’égale valeur. La masse se conserve ; rien ne se crée de rien. C’est pourquoi la transmutation humaine est interdite : aucun prix n’égale une vie, et les tentatives causent de lourdes pertes.',
    ),
    sourceLabel: 'Fullmetal Alchemist — manga, cilt 1',
    sourceUrl: 'https://en.wikipedia.org/wiki/Fullmetal_Alchemist',
    tags: ['alchemy', 'equivalent exchange', 'human transmutation'],
  },
  {
    id: 'spirited-away-names',
    category: 'world',
    series: 'Spirited Away',
    spoiler: true,
    question: L(
      'Yubaba neden isimleri çalıyor?',
      'Why does Yubaba steal names?',
      '湯婆婆はなぜ名前を奪うのか？',
      'Pourquoi Yubaba vole-t-elle les noms ?',
    ),
    answer: L(
      'Yubaba, çalışanlarının gerçek isimlerini alarak onları kendi kimliklerinden koparır. İsimsiz kalan kişi, Yubaba’ya daha kolay bağlanır ve evine dönme iradesini kaybeder. Chihiro’nun “Sen” olarak çağrılması, kimliğini unutma tehlikesinin sembolüdür.',
      'Yubaba takes her workers’ real names to sever them from their identity. A person without a name is easier to bind to her and loses the will to go home. Chihiro being called “Sen” symbolizes the danger of forgetting who she is.',
      '湯婆婆は働く者の本当の名前を奪い、自我から切り離す。名前を失った者は縁に縛られ、家へ帰る意志を失う。千尋が「千」と呼ばれることは、自分を忘れる危険の象徴だ。',
      'Yubaba prend les vrais noms de ses employés pour les couper de leur identité. Sans nom, on est plus facilement lié à elle et on perd la volonté de rentrer. Chihiro appelée « Sen » symbolise le danger d’oublier qui elle est.',
    ),
    sourceLabel: 'Spirited Away — Studio Ghibli filmi (2001)',
    sourceUrl: 'https://en.wikipedia.org/wiki/Spirited_Away',
    tags: ['ghibli', 'yubaba', 'name', 'chihiro'],
  },

  /* ── Sektör ──────────────────────────────────────────────────── */
  {
    id: 'industry-cour',
    category: 'industry',
    series: 'Anime industry',
    spoiler: false,
    question: L(
      '“Cour” ne demek?',
      'What does “cour” mean?',
      '「クール」とは何か？',
      'Que signifie « cour » ?',
    ),
    answer: L(
      '“Cour”, bir yayın sezonuna denk gelen 12–13 bölümlük anime bloğudur (yaklaşık üç ay). İki cour genellikle 24–26 bölümlük bir sezon anlamına gelir. Terim, Japon televizyon yayın takviminden gelir ve uluslararası anime topluluğunda yaygın kullanılır.',
      'A “cour” is a 12–13 episode block of anime, roughly one broadcast season (about three months). Two cours usually mean a 24–26 episode run. The term comes from the Japanese TV broadcast calendar and is standard in the international anime community.',
      '「クール」は約3か月、12〜13話の放送単位。2クールで24〜26話になることが多い。日本のテレビ放送暦に由来し、海外のアニメファンにも定着している。',
      'Un « cour » est un bloc de 12 à 13 épisodes, soit environ une saison de diffusion (trois mois). Deux cours correspondent souvent à 24–26 épisodes. Le terme vient du calendrier télé japonais et est courant dans la communauté anime.',
    ),
    sourceLabel: 'Anime News Network — ansiklopedi sözlüğü',
    sourceUrl: 'https://www.animenewsnetwork.com/encyclopedia/lexicon.php',
    tags: ['cour', 'season', 'episodes', 'broadcast'],
  },
  {
    id: 'industry-production-committee',
    category: 'industry',
    series: 'Anime industry',
    spoiler: false,
    question: L(
      'Yapım komitesi (seisaku iinkai) ne yapar?',
      'What does a production committee do?',
      '製作委員会は何をするのか？',
      'Que fait un comité de production ?',
    ),
    answer: L(
      'Yapım komitesi, bir animeyi finanse eden şirketlerin ortaklığıdır: yayıncı, yayınevi, plak şirketi, oyuncak firması gibi. Maliyeti ve telif riskini paylaşırlar; gelirler de anlaşmalara göre bölüşülür. Bu model, tek bir stüdyonun tüm riski almasını önler.',
      'A production committee is a partnership of companies financing an anime: broadcasters, publishers, record labels, toy makers and others. They share the cost and rights risk, and split revenue by contract. The model keeps a single studio from carrying all the risk.',
      '製作委員会は、放送局・出版社・レコード会社・玩具メーカーなどが出資する共同事業体。制作費と著作権リスクを分担し、契約に応じて収益を分配する。一つのスタジオが全リスクを負わない仕組みだ。',
      'Un comité de production est un partenariat d’entreprises finançant un anime : diffuseurs, éditeurs, labels, fabricants de jouets… Ils partagent les coûts et les risques de droits, puis répartissent les revenus selon les contrats.',
    ),
    sourceLabel: 'Anime News Network — sektör açıklamaları',
    sourceUrl: 'https://www.animenewsnetwork.com/encyclopedia/lexicon.php',
    tags: ['production committee', 'funding', 'rights', 'industry'],
  },
  {
    id: 'industry-sakuga',
    category: 'industry',
    series: 'Anime industry',
    spoiler: false,
    question: L(
      '“Sakuga” ne anlama geliyor?',
      'What does “sakuga” mean?',
      '「作画」とはどういう意味？',
      'Que signifie « sakuga » ?',
    ),
    answer: L(
      '“Sakuga” kelime anlamıyla “çizim/animasyon” demektir; fan dilinde ise özellikle akıcı, yaratıcı ve bütçesi yüksek hissettiren animasyon sahnelerini anlatır. Bu sahneler genellikle konuk ana animatörler (genga) tarafından yapılır ve bölümün en çok konuşulan anları olur.',
      '“Sakuga” literally means drawing/animation; in fan usage it refers to especially fluid, expressive and high-effort animation scenes. These are often handled by guest key animators (genga) and become the episode’s most discussed moments.',
      '「作画」は本来「絵を描くこと」だが、ファン用語では特に滑らかで表現豊か、手間のかかったアニメーションシーンを指す。外部の原画マンが担当することが多く、話題の見どころになる。',
      '« Sakuga » signifie littéralement dessin/animation ; dans le jargon fan, cela désigne des scènes particulièrement fluides, expressives et ambitieuses. Elles sont souvent confiées à des animateurs clés invités et deviennent les moments les plus commentés.',
    ),
    sourceLabel: 'Anime News Network — sakuga açıklaması',
    sourceUrl: 'https://www.animenewsnetwork.com/encyclopedia/lexicon.php',
    tags: ['sakuga', 'animation', 'key animator', 'genga'],
  },
  {
    id: 'industry-seasons',
    category: 'industry',
    series: 'Anime industry',
    spoiler: false,
    question: L(
      'Anime sezonları nasıl işliyor?',
      'How do anime seasons work?',
      'アニメのシーズンはどうなっている？',
      'Comment fonctionnent les saisons d’anime ?',
    ),
    answer: L(
      'Japonya’da yayın yılı dört sezona ayrılır: Kış (Ocak), İlkbahar (Nisan), Yaz (Temmuz) ve Sonbahar (Ekim). Çoğu yeni seri bu aylarda başlar; “bahar 2026” gibi ifadeler bu takvimi anlatır. Uluslararası platformlarda simulcast, aynı sezon içinde yayın demektir.',
      'The Japanese broadcast year has four seasons: Winter (January), Spring (April), Summer (July) and Autumn (October). Most new shows launch in these windows; “Spring 2026” refers to this calendar. On international platforms, simulcast means same-season streaming.',
      '日本の放送は冬（1月）・春（4月）・夏（7月）・秋（10月）の4シーズンに分かれる。新作の多くはこの時期に始まり、「2026年春」などはこの暦を指す。海外配信の同時配信はシミュルキャストと呼ばれる。',
      'L’année de diffusion japonaise compte quatre saisons : hiver (janvier), printemps (avril), été (juillet) et automne (octobre). La plupart des nouveautés démarrent alors ; « printemps 2026 » suit ce calendrier. En streaming international, simulcast signifie diffusion la même saison.',
    ),
    sourceLabel: 'Anime News Network — yayın takvimi',
    sourceUrl: 'https://www.animenewsnetwork.com/encyclopedia/lexicon.php',
    tags: ['season', 'winter', 'spring', 'simulcast'],
  },

  /* ── Seriler ─────────────────────────────────────────────────── */
  {
    id: 'madoka-original',
    category: 'series',
    series: 'Puella Magi Madoka Magica',
    spoiler: false,
    question: L(
      'Madoka Magica nasıl ortaya çıktı?',
      'How was Madoka Magica created?',
      'まどか☆マギカはどう生まれた？',
      'Comment Madoka Magica a-t-il été créé ?',
    ),
    answer: L(
      '2011 yapımı Madoka Magica bir anime özgün projesidir; “Magica Quartet” adlı yaratıcı ekip tarafından geliştirilmiştir. Senaristi Gen Urobuchi, yönetmeni Akiyuki Shinbo, karakter tasarımı Ume Aoki ve müzik Yuki Kajiura’ya aittir. “Sevimli kızlar + karanlık sonuç” formülü türü yeniden tanımlamıştır.',
      'The 2011 Madoka Magica is an original anime project developed by the creative team “Magica Quartet”. Gen Urobuchi wrote it, Akiyuki Shinbo directed, Ume Aoki designed the characters and Yuki Kajiura composed the music. Its “cute girls + dark consequences” formula redefined the genre.',
      '2011年の『まどか☆マギカ』は「Magica Quartet」によるオリジナルアニメ。脚本は虚淵玄、監督は新房昭之、キャラ原案は蒼樹うめ、音楽は梶浦由記。「可愛い少女＋暗い結末」の公式がジャンルを再定義した。',
      'Madoka Magica (2011) est un projet d’anime original développé par l’équipe « Magica Quartet ». Scénario de Gen Urobuchi, réalisation d’Akiyuki Shinbo, personnages d’Ume Aoki, musique de Yuki Kajiura. Sa formule « filles mignonnes + conséquences sombres » a redéfini le genre.',
    ),
    sourceLabel: 'Madoka Magica — resmi site',
    sourceUrl: 'https://www.madoka-magica.com/',
    tags: ['madoka', 'urobuchi', 'shinbo', 'magica quartet'],
  },
  {
    id: 'frieren-creators',
    category: 'series',
    series: 'Frieren: Beyond Journey’s End',
    spoiler: false,
    question: L(
      'Frieren’ı kim yazdı?',
      'Who created Frieren?',
      '『葬送のフリーレン』の作者は？',
      'Qui a créé Frieren ?',
    ),
    answer: L(
      'Manga, Kanehito Yamada’nın senaryosu ve Tsukasa Abe’nin çizimleriyle Shogakukan’ın Weekly Shōnen Sunday dergisinde yayımlanır. 2020’de başlayan seri, 2023’te Madhouse stüdyosunun anime uyarlamasıyla küresel popülerlik kazandı.',
      'The manga is written by Kanehito Yamada and drawn by Tsukasa Abe, serialised in Shogakukan’s Weekly Shōnen Sunday. It began in 2020 and reached global popularity with Madhouse’s 2023 anime adaptation.',
      '漫画は山田鐘人・原作、アベツカサ・作画で、小学館「週刊少年サンデー」に連載。2020年に開始し、2023年のマッドハウス制作アニメで世界的に人気となった。',
      'Le manga est écrit par Kanehito Yamada et dessiné par Tsukasa Abe dans le Weekly Shōnen Sunday de Shogakukan. Lancé en 2020, il a conquis le monde avec l’adaptation animée de Madhouse en 2023.',
    ),
    sourceLabel: 'Frieren — Shogakukan / resmi yayın',
    sourceUrl: 'https://en.wikipedia.org/wiki/Frieren:_Beyond_Journey%27s_End',
    tags: ['frieren', 'yamada', 'abe', 'madhouse'],
  },
  {
    id: 'spy-family-creator',
    category: 'series',
    series: 'Spy x Family',
    spoiler: false,
    question: L(
      'Spy x Family’i kim çiziyor?',
      'Who creates Spy x Family?',
      '『SPY×FAMILY』の作者は？',
      'Qui crée Spy x Family ?',
    ),
    answer: L(
      'Tatsuya Endo’nun yazıp çizdiği manga, Shueisha’nın Shōnen Jump+ platformunda 2019’dan beri yayımlanıyor. Seri, Soğuk Savaş benzeri bir dünyada sahte bir aile kuran üç karakterin komik ve duygusal hikâyesini anlatır.',
      'Written and drawn by Tatsuya Endo, the manga has run on Shueisha’s Shōnen Jump+ since 2019. It follows three characters forming a fake family in a Cold War-like world, balancing comedy and genuine emotion.',
      '遠藤達哉が作画・原作を担当し、集英社「少年ジャンプ+」で2019年から連載中。冷戦風の世界で偽の家族を演じる三人の、笑いと情感の物語。',
      'Écrit et dessiné par Tatsuya Endo, le manga paraît sur Shōnen Jump+ de Shueisha depuis 2019. Il suit trois personnages formant une fausse famille dans un monde de type guerre froide, entre comédie et émotion.',
    ),
    sourceLabel: 'Spy x Family — Shueisha / resmi yayın',
    sourceUrl: 'https://en.wikipedia.org/wiki/Spy_%C3%97_Family',
    tags: ['spy x family', 'endo', 'shueisha', 'jump+'],
  },
  {
    id: 'cowboy-bebop-music',
    category: 'series',
    series: 'Cowboy Bebop',
    spoiler: false,
    question: L(
      'Cowboy Bebop’un müziğini kim yaptı?',
      'Who composed Cowboy Bebop’s music?',
      'カウボーイビバップの音楽は誰が作った？',
      'Qui a composé la musique de Cowboy Bebop ?',
    ),
    answer: L(
      'Müzik, Yoko Kanno ve grubu Seatbelts tarafından yapılmıştır. Caz, blues, rock ve elektronik öğeleri birleştiren soundtrack, anime müziğinin sınırlarını genişletmiş ve bugün hâlâ en çok övülen anime müziklerinden biri sayılmaktadır.',
      'The music was composed by Yoko Kanno and her band Seatbelts. Blending jazz, blues, rock and electronic elements, the soundtrack expanded what anime music could be and is still considered one of the medium’s finest.',
      '音楽は菅野よう子とバンド・シートベルツが担当。ジャズ、ブルース、ロック、エレクトロニカを融合したサウンドトラックはアニメ音楽の可能性を広げ、今なお最高峰の一つとされる。',
      'La musique a été composée par Yoko Kanno et son groupe Seatbelts. Mélangeant jazz, blues, rock et électronique, la bande-son a élargi les frontières de la musique d’anime et reste l’une des plus acclamées.',
    ),
    sourceLabel: 'Cowboy Bebop — resmi soundtrack / Sunrise',
    sourceUrl: 'https://en.wikipedia.org/wiki/Cowboy_Bebop',
    tags: ['cowboy bebop', 'yoko kanno', 'seatbelts', 'jazz'],
  },

  /* ── Xianxia & Donghua sözlüğü ───────────────────────────────
   * Bu kayıtlar başka bir dünyanın kanonu değil, tür sözlüğüdür.
   * Amaç: Çin yapımlarına gelen kullanıcının "xianxia", "donghua",
   * "manhua" terimlerini doğru yerde öğrenmesi. Kitap metni yok;
   * kaynaklar ansiklopedik doğrulama bağlantılarıdır.
   */
  {
    id: 'xianxia-cultivation-basics',
    category: 'xianxia',
    series: 'Xianxia & Donghua',
    spoiler: false,
    question: L(
      'Xianxia ne demek, neden her yerde “cultivation” geçiyor?',
      'What does xianxia mean, and why is “cultivation” everywhere?',
      '仙侠（シェンシア）とは？なぜ「修行」ばかり出てくるのか？',
      'Que signifie « xianxia », et pourquoi parle-t-on toujours de « cultivation » ?',
    ),
    answer: L(
      'Xianxia (仙侠) “ölümsüz kahramanlar” demektir: Taocu simya, Çin mitolojisi ve dövüş sanatlarından beslenen bir fantezi türü. Kahramanlar qi (yaşam enerjisi) toplayıp bedeni ve ruhu arındırarak cultivation (xiulian) yapar; amaç güçlenmek ve ölümsüzlüğe yaklaşmaktır. Meridyenler, dantian, dan/simya ve “qi sapması” (走火入魔) türün ortak sözlüğüdür. Terimler ve aşamalar yazara göre değişir; tek bir kanon yok.',
      'Xianxia (仙侠) means “immortal heroes”: a fantasy genre rooted in Taoist alchemy, Chinese mythology and martial arts. Characters gather qi (life energy) and refine body and spirit through cultivation (xiulian) to grow stronger and approach immortality. Meridians, the dantian, alchemical pills and “qi deviation” (走火入魔) are shared vocabulary. Terms and stages vary by author — there is no single canon.',
      '仙侠（シェンシア）は「仙人の英雄」を意味する。道教の錬丹術、中国神話、武術を背景にしたファンタジーで、登場人物は気を集め、修行によって肉体と魂を鍛え、強くなること・不老不死に近づくことを目指す。経脈、丹田、丹薬、そして「走火入魔」（気の暴走）が共通の語彙。用語や段階は作者ごとに異なり、唯一の正典は存在しない。',
      '« Xianxia » (仙侠) signifie « héros immortels » : un genre fantastique nourri d’alchimie taoïste, de mythologie chinoise et d’arts martiaux. Les personnages accumulent le qi (énergie vitale) et affinent corps et esprit par la « cultivation » (xiulian) pour gagner en puissance et approcher l’immortalité. Méridiens, dantian, pilules alchimiques et « déviation du qi » (走火入魔) forment le vocabulaire commun. Termes et paliers varient selon l’auteur : il n’existe pas de canon unique.',
    ),
    sourceLabel: 'Wikipedia — Xianxia',
    sourceUrl: 'https://en.wikipedia.org/wiki/Xianxia',
    tags: ['xianxia', '仙侠', 'cultivation', 'xiulian', 'qi', 'dantian', '走火入魔', 'ölümsüz', 'immortal'],
  },
  {
    id: 'xianxia-cultivation-realms',
    category: 'xianxia',
    series: 'Xianxia & Donghua',
    spoiler: false,
    question: L(
      'Cultivation aşamaları (Qi Refining, Foundation Establishment…) sabit mi?',
      'Are the cultivation stages (Qi Refining, Foundation Establishment…) fixed?',
      '修行の段階（錬気、築基など）は固定なのか？',
      'Les paliers de cultivation (Qi Refining, Foundation Establishment…) sont-ils fixes ?',
    ),
    answer: L(
      'Pek çok xianxia anlatısı benzer bir iskelet kullanır: qi toplama → temel kurma → çekirdek oluşumu (altın çekirdek) → ruhsal bebek → ruh oluşumu → ölümsüzlüğe yükseliş. Ama bu sıra kanon değildir: her yazar kendi sistemini kurar, aşamaları böler, birleştirir ya da atlar. Bir eserdeki “altın çekirdek” başka eserde farklı bir basamağa denk gelebilir. Bu yüzden buradaki terimler tür sözlüğüdür, tek doğru şema değil.',
      'Many xianxia stories share a skeleton: qi gathering → foundation building → core formation (golden core) → nascent soul → soul formation → immortal ascension. That order is not canon: every author builds their own system, splitting, merging or skipping stages. A “golden core” in one novel can map to a different step in another. Treat these terms as genre vocabulary, not one true schema.',
      '多くの仙侠作品は似た骨格を共有する。気を集める → 築基 → 金丹（核の形成）→ 元嬰（霊的胎児）→ 化神 → 昇仙、という流れだ。ただしこれは正典ではなく、作者ごとに段階を分けたり統合したり省略したりする。ある作品の「金丹」が別の作品では違う段階に当たることもある。ここに挙げる用語はジャンルの語彙であり、唯一の体系図ではない。',
      'Beaucoup de récits xianxia partagent une ossature : accumulation du qi → fondation → formation du noyau (noyau d’or) → âme naissante → formation de l’âme → ascension immortelle. Cet ordre n’est pas canonique : chaque auteur bâtit son système, scinde, fusionne ou saute des paliers. Un « noyau d’or » peut correspondre à une autre étape ailleurs. Ces termes sont un vocabulaire de genre, pas un schéma unique.',
    ),
    sourceLabel: 'Wikipedia — Xianxia (cultivation)',
    sourceUrl: 'https://en.wikipedia.org/wiki/Xianxia',
    tags: ['cultivation', 'golden core', '金丹', 'nascent soul', '元嬰', 'aşama', 'realm', 'paliers'],
  },
  {
    id: 'wuxia-vs-xianxia',
    category: 'xianxia',
    series: 'Wuxia & Xianxia',
    spoiler: false,
    question: L(
      'Wuxia ile xianxia aynı şey mi?',
      'Are wuxia and xianxia the same thing?',
      '武侠（ウーシャ）と仙侠は同じもの？',
      'Wuxia et xianxia, est-ce la même chose ?',
    ),
    answer: L(
      'Hayır. Wuxia (武侠) “dövüş kahramanları” demektir: jianghu (nehir-göl) dünyasında geçen, düşük fantezi düzeyinde dövüş sanatı hikâyeleridir; Jin Yong (Louis Cha) klasikleri bu türün standardıdır. Xianxia ise ölümsüzlük, cultivation, tanrılar ve mitoloji içeren yüksek fantazidir. İkisi de Çin fantazisi ama ölçek farklı: wuxia insan sınırları içinde kalır, xianxia bu sınırları aşar.',
      'No. Wuxia (武侠) means “martial heroes”: low-fantasy martial-arts stories set in the jianghu (“rivers and lakes”); Jin Yong’s (Louis Cha) classics define the genre. Xianxia is high fantasy with immortality, cultivation, gods and mythology. Both are Chinese fantasy, but the scale differs: wuxia stays within human limits, xianxia breaks them.',
      'いいえ。武侠（ウーシャ）は「武の英雄」を指し、江湖（川と湖、すなわち武人の世界）を舞台にしたローファンタジー的な武術譚。金庸（ジン・ヨン）の作品が代表的だ。一方、仙侠は不老不死・修行・神々・神話を含むハイファンタジー。どちらも中国ファンタジーだが規模が違う。武侠は人の限界にとどまり、仙侠はそれを超える。',
      'Non. Le wuxia (武侠) désigne les « héros martiaux » : des récits d’arts martiaux en fantaisie basse situés dans le jianghu (« rivières et lacs ») ; les classiques de Jin Yong (Louis Cha) font référence. Le xianxia est de la haute fantaisie avec immortalité, cultivation, dieux et mythologie. Les deux sont chinois, mais l’échelle diffère : le wuxia reste dans les limites humaines, le xianxia les dépasse.',
    ),
    sourceLabel: 'Wikipedia — Wuxia',
    sourceUrl: 'https://en.wikipedia.org/wiki/Wuxia',
    tags: ['wuxia', '武侠', 'xianxia', 'jianghu', '江湖', 'jin yong', 'louis cha', 'dövüş sanatları'],
  },
  {
    id: 'donghua-vs-anime',
    category: 'xianxia',
    series: 'Donghua',
    spoiler: false,
    question: L(
      '“Donghua” anime mi, ayrı bir şey mi?',
      'Is “donghua” anime, or something else?',
      '「ドンファ」はアニメなのか、別物なのか？',
      '« Donghua », est-ce du anime ou autre chose ?',
    ),
    answer: L(
      'Donghua (动画) Çince “animasyon” demektir; anime topluluğu bunu Çin yapımı animasyon dizileri için kullanır. Japon anime ile ortak bir görsel dil paylaşsa da prodüksiyon, yayın ve denetim pratikleri farklıdır; birçok donghua 3D CG ağırlıklıdır. AniList bu yapımları menşe ülke alanıyla (`countryOfOrigin: CN`) ayırır — AniSync’in “Bölgesel Keşif” filtresi tam olarak bu veriyi kullanır. Her donghua xianxia değildir: günlük yaşam, bilim kurgu ve komedi de yaygındır.',
      'Donghua (动画) is the Chinese word for “animation”; the anime community uses it for Chinese-made animated series. It shares visual language with Japanese anime, but production, distribution and censorship practices differ, and many donghua are 3D CG. AniList separates these works by country of origin (`countryOfOrigin: CN`) — AniSync’s “Regional Discovery” filter uses exactly that data. Not every donghua is xianxia: slice of life, sci-fi and comedy are common too.',
      'ドンファ（动画）は中国語で「アニメーション」を意味し、アニメコミュニティでは中国制作のアニメ作品を指す。日本のアニメと視覚言語を共有するが、制作・配給・検閲の慣行は異なり、3D CG 主体の作品も多い。AniList は制作国（`countryOfOrigin: CN`）で区別しており、AniSync の「地域別ディスカバリー」はまさにこのデータを使う。ドンファがすべて仙侠というわけではなく、日常系・SF・コメディも多い。',
      '« Donghua » (动画) est le mot chinois pour « animation » ; la communauté anime l’emploie pour les séries animées chinoises. Il partage un langage visuel avec l’anime japonais, mais production, diffusion et censure diffèrent, et beaucoup de donghua sont en 3D. AniList les distingue par pays d’origine (`countryOfOrigin: CN`) — le filtre « Découverte par région » d’AniSync utilise exactement ces données. Tout donghua n’est pas xianxia : tranche de vie, SF et comédie sont courants.',
    ),
    sourceLabel: 'Wikipedia — Chinese animation',
    sourceUrl: 'https://en.wikipedia.org/wiki/Chinese_animation',
    tags: ['donghua', '动画', 'çin animasyonu', 'chinese animation', 'countryoforigin', 'bölgesel keşif', '3d cg'],
  },
  {
    id: 'manhua-manhwa-manga',
    category: 'xianxia',
    series: 'Manhua · Manhwa · Manga',
    spoiler: false,
    question: L(
      'Manhua, manhwa ve manga arasındaki fark ne?',
      'What is the difference between manhua, manhwa and manga?',
      '中華圏の漫画・韓国の漫画・日本の漫画はどう違う？',
      'Quelle différence entre manhua, manhwa et manga ?',
    ),
    answer: L(
      'Üçü de aynı Han karakterlerinin (漫画) yerel okunuşudur: manga (Japonca), manhua (Çince), manhwa (Korece). Ayrım coğrafidir: manga Japonya, manhua Çin/Tayvan/Hong Kong, manhwa Kore çizgi roman geleneğidir. Okuma yönü de değişir: basılı Japon manga genelde sağdan sola, Kore webtoon’ları ve Çin web manhua’ları çoğunlukla dikey kaydırmalıdır. AniSync’te “ÇİN / MANHUA” anahtarı AniList’te menşei Çin olan kayıtları süzer.',
      'All three are local readings of the same Han characters (漫画): manga (Japanese), manhua (Chinese), manhwa (Korean). The split is geographic: manga from Japan, manhua from China/Taiwan/Hong Kong, manhwa from Korea. Reading direction differs too: printed Japanese manga is usually right-to-left, while Korean webtoons and Chinese web manhua mostly scroll vertically. AniSync’s “CHINA / MANHUA” switch filters AniList entries whose origin is China.',
      '三つとも同じ漢字（漫画）の地域ごとの読み方で、日本は「マンガ」、中国語圏は「マンファ」、韓国語も「マンファ」と発音が変わる。つまり呼び分けは地理的なもので、日本の漫画・中国（台湾・香港を含む）の漫画・韓国の漫画を指す。読み方も異なり、日本の紙媒体は右から左、韓国のウェブトゥーンや中国のウェブ漫画は縦スクロールが多い。AniSync の「中国 / マンファ」は AniList で制作国が中国の作品だけを絞り込む。',
      'Les trois sont des lectures locales des mêmes caractères han (漫画) : manga (japonais), manhua (chinois), manhwa (coréen). La distinction est géographique : manga du Japon, manhua de Chine/Taïwan/Hong Kong, manhwa de Corée. Le sens de lecture varie aussi : le manga imprimé japonais se lit de droite à gauche, tandis que les webtoons coréens et les web manhua chinois défilent surtout verticalement. Le bouton « CHINE / MANHUA » d’AniSync filtre les entrées AniList dont l’origine est la Chine.',
    ),
    sourceLabel: 'Wikipedia — Manhua',
    sourceUrl: 'https://en.wikipedia.org/wiki/Manhua',
    tags: ['manhua', '漫画', 'manhwa', 'manga', 'webtoon', 'okuma yönü', 'reading direction'],
  },
  {
    id: 'xianxia-web-novels-scope',
    category: 'xianxia',
    series: 'Xianxia web novels',
    spoiler: false,
    question: L(
      'Xianxia web romanları (Qidian, NovelUpdates) neden AniSync’te yok?',
      'Why are xianxia web novels (Qidian, NovelUpdates) not on AniSync?',
      '仙侠ウェブ小説（起点、NovelUpdates）はなぜ AniSync にないのか？',
      'Pourquoi les web-romans xianxia (Qidian, NovelUpdates) sont-ils absents d’AniSync ?',
    ),
    answer: L(
      'Çünkü veri kaynağımız AniList: orada donghua ve manhua meta verisi vardır, Qidian/NovelUpdates gibi platformlarda serileşen web romanlarının metni ya da eksiksiz kataloğu yoktur. AniSync kitap metni barındırmaz; bir romanın anime veya manhua uyarlaması varsa o kaydı gösterir. Bu bilinçli bir kapsam sınırıdır: olmayan bir kataloğu varmış gibi göstermiyoruz.',
      'Because our data source is AniList: it carries donghua and manhua metadata, but not the text or the complete catalogue of web novels serialized on platforms like Qidian or NovelUpdates. AniSync hosts no book text; if a novel has an anime or manhua adaptation, that entry is shown. This is a deliberate scope limit: we never pretend to have a catalogue we do not have.',
      'データ源が AniList だからだ。AniList にはドンファやマンファのメタデータはあるが、起点（Qidian）や NovelUpdates で連載されるウェブ小説の本文や完全なカタログはない。AniSync は小説本文を掲載せず、アニメ化・マンファ化された作品があればその項目を表示する。これは意図的な範囲の限界であり、存在しないカタログがあるふりはしない。',
      'Parce que notre source est AniList : elle fournit des métadonnées de donghua et de manhua, mais ni le texte ni le catalogue complet des web-romans sérialisés sur Qidian ou NovelUpdates. AniSync n’héberge aucun texte de roman ; si un roman a une adaptation anime ou manhua, c’est cette fiche qui s’affiche. C’est une limite de périmètre assumée : nous ne prétendons pas avoir un catalogue que nous n’avons pas.',
    ),
    sourceLabel: 'Wikipedia — Web novel',
    sourceUrl: 'https://en.wikipedia.org/wiki/Web_novel',
    tags: ['web novel', 'qidian', 'novelupdates', 'xianxia', '仙侠', 'kapsam', 'scope', 'anilist'],
  },
];

export const LORE_CATEGORIES: LoreCategory[] = ['character', 'world', 'xianxia', 'series', 'industry'];

export const getLoreCategories = (): LoreCategory[] => LORE_CATEGORIES;

/** Bir kaydın dört dilde arama metni. */
export const loreSearchText = (entry: FanLoreEntry): string =>
  [
    entry.series,
    entry.sourceLabel,
    ...entry.tags,
    ...Object.values(entry.question),
    ...Object.values(entry.answer),
  ]
    .join(' ')
    .toLowerCase();

export const filterLore = (options: {
  query?: string;
  category?: LoreCategory | 'all';
}): FanLoreEntry[] => {
  const query = (options.query || '').trim().toLowerCase();
  const category = options.category || 'all';
  return FAN_LORE.filter((entry) => {
    if (category !== 'all' && entry.category !== category) return false;
    if (!query) return true;
    return loreSearchText(entry).includes(query);
  });
};
