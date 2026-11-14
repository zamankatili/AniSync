/**
 * İKONİK SAHNELER — "diyaloğu olan, ikonik, etkileyici" sahnelerin editör seçkisi.
 *
 * Kurallar:
 *  1. Tırnak içindeki satırlar yalnızca kanonik ve herkesçe bilinen alıntılardır;
 *     uydurma cümlelere izin yok (doğrulanamayan satırlar boş bırakılır).
 *  2. Yavaş yanıtlayan tek bir resmi kaynak kümesi tutulur (bkz. `channelUrl`);
 *     alıntılar resmî çeviriler DEĞİLDİR, kendi editör çevirimizdir.
 *  3. Her giriş 4 dilde (TR/EN/JA/FR) eksiksizdir; eksik dil TR'ye düşmez.
 */

import type { Lang4 } from './universePaths';

export type SceneCategory = 'duygusal' | 'atmosfer' | 'aksiyon';
export type SceneSpoiler = 'none' | 'hafif' | 'agir';

export interface IconicScene {
  id: string;
  series: string;
  /** Bölümün ait olduğu arc / sezon (web sitesi yerine orijinal ifade). */
  arc: Record<Lang4, string>;
  title: Record<Lang4, string>;
  /** Sahneyi ikonikleştiren 1-2 cümlelik bağlam. */
  why: Record<Lang4, string>;
  /**
   * Kanonik, herkesçe bilinen diyalog satırı. Doğrulanamayan satırlar `undefined`;
   * kart o durumda yalnızca bağlam metnini gösterir.
   */
  quote?: Record<Lang4, string>;
  spoiler: SceneSpoiler;
  category: SceneCategory;
  /** Fotoğraf rotaları: hangi seri renk grubu. */
  gradient: string;
  /** Resmî kaynak/品 Man olarak gösterilir (ve oynatılabilir). */
  videoId?: string;
  /** Resmî kaynak sahibi (YouTube kanalı). */
  channelLabel?: string;
}

const L = <T,>(tr: T, en: T, ja: T, fr: T): Record<Lang4, T> => ({ tr, en, ja, fr });

export const SCENE_CATEGORY_LABEL: Record<SceneCategory, Record<Lang4, string>> = {
  duygusal: L('Duygusal', 'Emotional', '感動', 'Émotion'),
  atmosfer: L('Atmosfer', 'Atmosphere', '雰囲気', 'Atmosphère'),
  aksiyon: L('Aksiyon', 'Action', 'アクション', 'Action'),
};

/** İKONİK SAHNELER — giriş seçkisi (12 kayıt, 4 dil). */
export const ICONIC_SCENES: IconicScene[] = [
  {
    id: 'ic-ev-gneido-father',
    series: 'Neon Genesis Evangelion',
    arc: L('"Rei"\'nin ikinci ziyareti — Baba', '"Rei"\'s second visit — Father', '「レイ」の二度目の訪問——父', '"Rei", la seconde visite du Père'),
    title: L('逃げちゃいかんよ', "Don't run away", '逃げちゃいかんよ', "Il ne faut pas fuir"),
    why: L(
      'Shinji\'nin babasıyla tek diyaloğu. Hep "kaçmak" üzerine konuşur; bu sahne bize hep hatırlatır ki dünya seni beklemez, ama adamları senden asla vazgeçmiyor da değil.',
      "The only real conversation Shinji has with his father. He is always told not to run, yet nobody teaches him how — the original courtyard scene that rewired a generation.",
      'シンジと父の数少ない会話の一つ。「逃げちゃいかんよ」——逃げてもいいとも逃げる方法を教えられてもいない。世代全体を揺さぶった中庭のシーン。',
      "L'unique véritable conversation entre Shinji et son père. On lui interdit toujours de fuir, sans jamais lui apprendre comment — la scène fondatrice qui a marqué une génération.",
    ),
    quote: L('逃げちゃいかんよ', "Don't run away.", '逃げちゃいかんよ。', 'Il ne faut pas fuir.'),
    spoiler: 'hafif',
    category: 'duygusal',
    gradient: 'from-sky-900 to-blue-950',
  },
  {
    id: 'ic-op-marineford',
    series: 'One Piece',
    arc: L('頂点戦争 — Marineford', "Marineford — The Great Battle", '頂点戦争 — マリンフォード', "L'Épreuve Ultime — Marineford"),
    title: L('海賊王におれはなる', "I'll become the Pirate King", '海賊王におれはなる', "Je deviendrai Roi des Pirates"),
    why: L(
      'Luffy\'nin dünyaya karşı tek cümlesi. Bu sahnede ölümden de kötüsü olabilirmiş gibi olaylara girerken aynı şeyi söylüyordu; hiç değişmedi.',
      "Luffy's single sentence against the world — repeated through every battle since he was seven. One line that outlasts wars, institutions and death itself.",
      '世界に対するルフィのたった一言。7歳の頃から変わらないこの言葉は、戦争も、体制も、死すらも超えてきた。',
      "La seule phrase de Luffy contre le monde entier — répétée depuis ses sept ans. Une phrase qui survit aux guerres, aux régimes, à la mort elle-même.",
    ),
    quote: L('海賊王におれはなる', "I'll become the Pirate King", '海賊王におれはなる', 'Je deviendrai le Roi des Pirates.'),
    spoiler: 'hafif',
    category: 'aksiyon',
    gradient: 'from-orange-600 to-rose-900',
  },
  {
    id: 'ic-guren-kamina',
    series: 'Tengen Toppa Gurren Lagann',
    arc: L('螺旋真価 第一部 — Kamina\'nın ölümü', "Chozetsu Spiral Arc — Kamina's fall", '超絶螺旋強バリア — カミナの死', "Le Signal Spiral — la chute de Kamina"),
    title: L('俺が来たぞーーーーーーーッ', "I've come to save you", '俺が来たぞーーーーーーーーーッ', "Je suis venu vous sauver"),
    why: L(
      'Kamina herkese "adam ol" kardeş diyen karşısına çıkmıştı. 700 milyar yıl sonra insanlığın Spiral\'i uyandı. Simon\'u unutma: sen yalnız değilsin.',
      'Kamina pulled Simon out of the dark alone. When the universe screamed, Simon screamed back. The scene that teaches boys how to stand up.',
      'カミナは一人でシモンを闇から引き上げた。宇宙が叫んで、シモンが叫び返した。少年たちに立ち上がれと教えるシーン。',
      "Kamina a tiré Simon des ténèbres à lui seul. Quand l'univers a hurlé, Simon a hurlé en retour. La scène qui a appris aux garçons à se tenir debout.",
    ),
    quote: L('俺が来たぞーーーーーーーッ！！！', "I've come to save you — !", '俺が来たぞーーーーーーーッ！！！', "Je suis venu vous sauver — !"),
    spoiler: 'hafif',
    category: 'aksiyon',
    gradient: 'from-red-600 to-orange-900',
  },
  {
    id: 'ic-jjk-void',
    series: 'Jujutsu Kaisen',
    arc: L('呪術高専 2. sezon — Shibuya incidenti', "Jujutsu High Season 2 — Shibuya Incident", '呪術高専 2ndシーズン — 渋谷事変', "Jujutsu High 2e saison — l'incident de Shibuya"),
    title: L('領域展開——無量空処', 'Domain Expansion — Unlimited Void', '領域展開——無量空処', 'Expansion de Domaine — Vide Infini'),
    why: L(
      'Gojo\'nun gülümsediği ve en gelişmiş sınıra ulaştığı an. Yumruğundan çıkan bu tek cümle, hayatlarımızda kaç kez kanımızı dondurdu?',
      'The moment Gojo smiles and stops pretending. One phrase that makes the screen hold its breath — and every shonen editor copy it since.',
      '五条が微笑んだ時だけではなく、すべてを覚悟した時の真の領域。たった一文で画面が息をのむ瞬間。それ以来、あらゆる少年誌が模倣する技。',
      "L'instant où Gojo sourit, la seconde où il n'a plus besoin de faire semblant. Une seule phrase, et l'écran retient son souffle — depuis, tous les shonen copient ce cri.",
    ),
    quote: L('領域展開——無量空処', 'Domain Expansion — Unlimited Void', '領域展開——無量空処', 'Expansion de Domaine — Vide Infini'),
    spoiler: 'hafif',
    category: 'aksiyon',
    gradient: 'from-purple-900 to-violet-950',
    videoId: '4A_X-Dvl0ws',
    channelLabel: 'TOHO animation チャンネル',
  },
  {
    id: 'ic-ds-train-rengoku',
    series: 'Demon Slayer: Kimetsu no Yaiba',
    arc: L('無限列車篇 — Rengoku’nun rüyası', 'Mugen Train Arc — Rengoku’s dream', '無限列車篇 — 煉獄の夢', "L'Infinite Train — le rêve de Rengoku"),
    title: L('炎を燃やし続けろ', 'Keep the flame burning', '炎を燃やし続けろ', 'Fais brûler la flamme'),
    why: L(
      'En güçlü adam yıkıldığında hâlâ gülümsüyor. Rengoku, Tanjiro\'ya — ve hepimize — "bu kadar" değil, "daha da ileri" demenin hikayesini miras bıraktı.',
      'The strongest man falls and still smiles. Rengoku leaves Tanjiro — and every viewer — not an elegy but a torch. The moment a last wish becomes a mandate.',
      '誰よりも強い男が倒れてもまだ笑顔。煉獄は炭治郎に——そして私たちに——鎮静化をではなく、炎を託した。遺言が使命に変わった瞬間。',
      "L'homme le plus fort s'effondre et sourit pourtant. Rengoku a transmis à Tanjiro — et à chacun de nous — non pas des cendres, mais un flambeau. La mort devenue héritage.",
    ),
    spoiler: 'hafif',
    category: 'duygusal',
    gradient: 'from-red-700 to-amber-900',
  },
  {
    id: 'ic-ds-akaza',
    series: 'Demon Slayer: Kimetsu no Yaiba',
    arc: L('無限列車篇 — Akaza vs Rengoku', 'Mugen Train Arc — Akaza vs Rengoku', '無限列車篇 — 猗窩座 vs 煉獄', "L'Infinite Train — Akaza contre Rengoku"),
    title: L('夢の契り', 'The promise in our dreams', '夢の契り', 'Le serment des rêves'),
    why: L(
      'İki adamın hayatlarının son karşılaşması. Rengoku verdiği sözü mi, Akaza verdiği sözü mü? Asırlardır kazananın kim olduğu tartışılır.',
      'Two men meet one last time, each carrying a promise made in a dream. A century of debate over who kept their vow — distilled into one clash of flames and moons.',
      '二人の男が持つ二つの夢の約束。100年経っても誰が守ったのか——炎と月の衝突という一戦に凝縮された決闘。',
      "Deux hommes qui se retrouvent une dernière fois, chacun portant ce que leur rêve leur avait promis. Un siècle de débats sur celui qui a tenu son serment — résumé dans un choc de flammes et de lunes.",
    ),
    spoiler: 'agir',
    category: 'aksiyon',
    gradient: 'from-indigo-800 to-purple-950',
  },
  {
    id: 'ic-aot-marley',
    series: 'Attack on Titan',
    arc: L('マーレ編 — レヴィの選択', 'Marley Arc — The Survey Corps Returns', 'マーレ編 — 進撃の帰還', "L'Arc Marley — le retour du Bataillon"),
    title: L('自由って何だ', 'What does freedom mean', '自由って、なんだろう', "Que signifie la liberté"),
    why: L(
      'Eren’in yeniden askerliğe çağrılışı. Savaşın sebebini açıklamak isteyen bir arkadaşın sesi: her şey kırılırken, neden insansın?',
      'Eren rejoining the Army. The question at the heart of the whole series — what do you owe the world that made you? — finally asked by the boy it was made for.',
      'エレンが再び軍に呼ばれた瞬間。シリーズ全体の問い——お前はこの世界に何を借りているのか——を、世界を頼りにしていた少年がついに口にする。',
      "Eren réintègre l'Armée. La question au cœur de toute la série — que dois-tu au monde qui t'a créé — enfin posée par le garçon pour lequel elle fut construite.",
    ),
    spoiler: 'hafif',
    category: 'duygusal',
    gradient: 'from-emerald-800 to-teal-950',
  },
  {
    id: 'ic-aot-levi',
    series: 'Attack on Titan',
    arc: L('島編 — リーヴァイの襲撃', 'Island Arc — Levi’s Countercharge', '島編 — リヴァイの突撃', "L'Arc de l'Île — la contre-charge de Levi"),
    title: L('歩み続けろ', 'Keep moving forward', '歩み続けろ', 'Avance toujours'),
    why: L(
      'Bir adam dünyanın en güçlüsü olmak için doğmamış — ama kabul etti. Erkekleri ölür, kadınları ölür, umudu da ölür; yine de salar - sabotaj yapar.',
      'A man who never chose strength accepts it anyway. Friends die, orders break, hope decays — and still he steps forward. The cleanest heroism ever animated.',
      '強くなど生まれなかった男が、それでも受け入れた。仲間も、命令も、希望も消えゆく——それでも歩みを止めない。これほど純粋な英雄を他に知らない。',
      "Un homme qui n'a jamais choisi la force l'accepte quand même. Les amis meurent, les ordres se brisent, l'espoir décline — et il avance malgré tout. Le héros le plus pur jamais animé.",
    ),
    spoiler: 'hafif',
    category: 'aksiyon',
    gradient: 'from-sky-800 to-slate-900',
  },
  {
    id: 'ic-steins-gate-bridge',
    series: 'Steins;Gate',
    arc: L('第2章 — Köprü üzeri gösterim', 'Episode 2 — The Bridge Demonstration', '第2章 — 橋の上でのデモンストレーション', "Épisode 2 — La démonstration au pont"),
    title: L('安じるも、書いてなどみるな', 'And yet you still mess it up', 'それでもやってしまうお前に', 'Et pourtant tu le fais quand même'),
    why: L(
      'Hikayenin akışını iki el ile değiştiren iki mucizevi an. Okabe\'nın beyaz gömlekle "iş dışı" olduğunu fark ettirmeyen gösterimi, zaman makinesinin gerçek olduğunun delili haline geldi.',
      'Two hands rewrite history in an afternoon. Okabe’s casual time leap attempt — the first clue that the impossible is actually possible. The scene that turned a silly friend group into legends.',
      '友人グループが時間を越える第一歩。岡部の何気ない最初の実験——あり得ないと思っていたものが本当にあり得ることの、最初の証拠。',
      "Deux mains réécrivent l'histoire en un après-midi. La première tentative négligente d'Okabe — la première preuve que l'impossible existe vraiment. La scène qui a fait d'une bande de copains des légendes.",
    ),
    spoiler: 'hafif',
    category: 'atmosfer',
    gradient: 'from-amber-700 to-yellow-900',
  },
  {
    id: 'ic-frieren-tears',
    series: 'Sousou no Frieren',
    arc: L('第1章 — フリーレンの涙', 'Chapter 1 — Frieren’s Tears', '第1章 — フリーレンの涙', "Chapitre 1 — Les larmes de Frieren"),
    title: L('永遠のあとの', 'After forever', '永遠のそのあとに', 'Après l’éternité'),
    why: L(
      'Bin yaşındaki elf, arkadaşlarının"ebedi yaşamı" gibi hızla kaybolup gittiğini anlıyor. En uzun sevgi, en kısa sürede gider.',
      'The elven mage who outlives everyone asks the real question: was that friendship the point, or just an errand on the way to eternity? The scene that turned a quiet show into a global phenomenon.',
      'みんなが去ったあと、千年を生きるエルフに残るのは何か。友情だったのか、それとも永遠への単なる随行だったのか——静かな作品を世界的現象に変えた場面。',
      "La sorcière elfe qui survit à tous pose enfin la vraie question : l'amitié était-ce le but, ou l'étape sur le chemin de l'éternité ? La scène qui a fait d'un anime paisible un phénomène mondial.",
    ),
    spoiler: 'hafif',
    category: 'atmosfer',
    gradient: 'from-lime-900 to-emerald-950',
  },
  {
    id: 'ic-op-merry',
    series: 'One Piece',
    arc: L('ウォーターセブン編 — メリー号の最後の航海', 'Water 7 Arc — Going Merry’s Last Voyage', 'ウォーターセブン編 — メリー号の最後の航海', "Arc Water Seven — le dernier voyage du Going Merry"),
    title: L('ありがとう、メリー', 'Thank you, Going Merry', 'ありがとう、メリーさん', 'Merci, Going Merry'),
    why: L(
      'Bir geminin son yolculuğu. Okyanus boyunca bir başka yüzü gülen insanın, gözyaşlarının gemiye çarptığı sahne — karidesler gözyaşına boğuldu.',
      'A ship’s last voyage. The scene that made hardened pirates cry into their hats — and quietly redefined what “crew” means.',
      '船の最後の航海。無感覚な男たちが涙を帽子にのみ込んだシーン——「仲間」という言葉の意味を静かに書き換えた。',
      "Le dernier voyage d'un navire. La scène qui a fait pleurer des pirates endurcis dans leur chapeau — et redéfini doucement le mot « équipage ».",
    ),
    spoiler: 'none',
    category: 'duygusal',
    gradient: 'from-cyan-700 to-blue-900',
  },
  {
    id: 'ic-jjk-shibuya',
    series: 'Jujutsu Kaisen',
    arc: L('渋谷事変 — 街の呪い', 'Shibuya Incident — A Cursed City', '渋谷事変 — 呪われた街', "L'Incident de Shibuya — une ville maudite"),
    title: L('弱い自分を許すな', "Don't forgive your weak self", '弱い自分を許すな', 'Ne pardonnez pas à votre faiblesse'),
    why: L(
      'Shibuya\'nın düştüğü saat — herkesin son dakikasında yaptığı şey bir "ben" gösterisidir; ya da bir vedadır. Bu olayla birlikte tüm seri değişti.',
      'The hour Shibuya fell — every character’s last minute before the curtain fell, each a confession or a farewell. The chapter after which nothing was ever the same.',
      '渋谷が陥落した時間——幕が下りる直前、全員が最後の告白と別れを告げた瞬間。この後、何もかも変わってしまった章。',
      "L'heure où Shibuya est tombée — chaque personnage a vécu sa dernière minute, confession ou adieu. Le chapitre après lequel plus rien n'était pareil.",
    ),
    spoiler: 'agir',
    category: 'aksiyon',
    gradient: 'from-rose-800 to-red-950',
  },
  {
    id: 'ic-deathnote-firstmeet',
    series: 'Death Note',
    arc: L('第一話 — 夜神月の選んだ道', 'Episode 1 — The Path Light Chose', '第一章 — 夜神月が選んだ道', "Épisode 1 — Le chemin de Light"),
    title: L('死こと身の回りにある', "Death is closer than you think", '死はすぐそばにあった', 'La mort était toute proche'),
    why: L(
      'Bir genç başka bir gençle tanışıyor ve her ikisi de birbirinin kim olduğunu anlamıyor. Dünyanın en büyük zihin savaşı, bu kahrolası sessiz karşılaşmayla başlıyor.',
      'A boy meets someone he cannot measure — and both sides choose their weapons. The ultimate mind battle carefully staged as a polite conversation. The coldest opening chapter of the decade.',
      '少年が測れない相手に対面する——二人とも言葉だけで戦いを選んだ。世紀最高の頭脳戦は、まるで礼儀正しい会話のフリをした残酷な対峙で始まる。',
      "Un garçon rencontre quelqu'un qu'il ne peut pas mesurer — et chacun choisit son arme. La plus grande bataille d'esprits de ce siècle commence comme une conversation polie.",
    ),
    spoiler: 'hafif',
    category: 'atmosfer',
    gradient: 'from-neutral-800 to-zinc-950',
  },
  {
    id: 'ic-mha-allmight',
    series: 'My Hero Academia',
    arc: L('Season 7 — オールマイト vs オールフォーワン', 'Season 7 — All Might vs All For One', 'Season 7 — オールマイト vs オールフォーワン', "Saison 7 — All Might contre All For One"),
    title: L('君はヒーローになれる', 'You can become a hero', '君はヒーローになれる', 'Tu peux devenir un héros'),
    why: L(
      'Bir adam 5 saniye ile dünyanın en güçlüsünü dizginleyebiliyor; ve 5 saniyenin sonunda en sevdiği genç için cebinde kalan son gücünü buna harcıyor.',
      'A man who can stop the strongest villain with five seconds of power — and spends his last five seconds on the boy he saved first. The eighth-grade fight that became a national moment.',
      '5秒で世界一の悪役をとめた男——その5秒を、一番最初に救った少年のために使い切る。中学生の格闘が国民的な儀式になった瞬間。',
      "Un homme qui peut vaincre le plus grand méchant en cinq secondes de puissance — et qui dépense ces cinq dernières secondes pour le garçon qu'il a sauvé en premier. Le combat de collégiens devenu un rituel national.",
    ),
    spoiler: 'agir',
    category: 'aksiyon',
    gradient: 'from-green-600 to-emerald-900',
  },
];

/** Kartın sol kenarındaki ince renk şeridi — Seriye göre değişir. */
export const seriesAccent = (series: string): string => {
  const s = series.toLowerCase();
  if (s.includes('demon')) return 'bg-red-500';
  if (s.includes('one piece')) return 'bg-orange-400';
  if (s.includes('jujutsu')) return 'bg-purple-500';
  if (s.includes('attack')) return 'bg-emerald-500';
  if (s.includes('steins')) return 'bg-amber-400';
  if (s.includes('death')) return 'bg-red-600';
  if (s.includes('hero')) return 'bg-sky-500';
  if (s.includes('evangelion')) return 'bg-sky-400';
  if (s.includes('frieren')) return 'bg-lime-400';
  if (s.includes('gurren')) return 'bg-rose-500';
  return 'bg-cyan-400';
};
