import type { Lang4, Localized } from './universePaths';

/**
 * "Kayıp Bölüm" — özgün, kısa bir metin macera (interactive fiction).
 *
 * Tasarım notları (docs/text-adventure-research.md):
 *  - Zork'tan alınan ders: küçük ve tutarlı bir dünya, sınırlı ama iyi
 *    uygulanmış fiil seti, ekranda görünen komutlar, ilerlemeli ipucu.
 *  - Metinler özgündür; Zork veya başka bir oyundan alıntı yoktur.
 *  - Dört dilde tam içerik. Teknik olarak `Lang4` anahtarları zorunludur
 *    (`textAdventure.test.ts` boş çeviri bırakmaz).
 */

export type { Lang4, Localized };

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export interface AdventureItem {
  id: string;
  name: Localized;
  desc: Localized;
  aliases: string[];
}

export interface AdventureRoom {
  id: string;
  name: Localized;
  desc: Localized;
  /** Karanlıkta gösterilen kısa açıklama (yalnızca arşiv). */
  darkDesc?: Localized;
  exits: Partial<Record<Direction, string>>;
  items: string[];
}

export interface AdventureEnding {
  id: string;
  title: Localized;
  text: Localized;
}

const L = (tr: string, en: string, ja: string, fr: string): Localized => ({ tr, en, ja, fr });

export const DIRECTION_LABELS: Record<Direction, Localized> = {
  north: L('kuzey', 'north', '北', 'nord'),
  south: L('güney', 'south', '南', 'sud'),
  east: L('doğu', 'east', '東', 'est'),
  west: L('batı', 'west', '西', 'ouest'),
  up: L('yukarı', 'up', '上', 'haut'),
  down: L('aşağı', 'down', '下', 'bas'),
};

/** Yön eşanlamlıları — kullanıcı tek harf yazsa da çalışır. */
export const DIRECTION_ALIASES: Record<string, Direction> = {
  kuzey: 'north', k: 'north', n: 'north', north: 'north', '北': 'north', nord: 'north',
  güney: 'south', g: 'south', s: 'south', south: 'south', '南': 'south', sud: 'south',
  doğu: 'east', d: 'east', e: 'east', east: 'east', '東': 'east', est: 'east',
  batı: 'west', b: 'west', w: 'west', west: 'west', '西': 'west', ouest: 'west',
  yukarı: 'up', y: 'up', up: 'up', u: 'up', '上': 'up', haut: 'up', monte: 'up',
  aşağı: 'down', a: 'down', down: 'down', '下': 'down', bas: 'down', descend: 'down',
};

/**
 * Fiil eşanlamlıları. Dört dilde de kısa tutuldu; bilinmeyen fiil
 * oyuncuyu suçlamadan yeniden dener.
 */
export const VERB_ALIASES: Record<string, string> = {
  // look / examine
  bak: 'look', etrafa: 'look', 'etrafına': 'look', incele: 'look', gözle: 'look',
  look: 'look', l: 'look', examine: 'look', x: 'look', '見る': 'look', '見回す': 'look',
  regarde: 'look', regarder: 'look',
  // go
  git: 'go', ilerle: 'go', 'yürü': 'go', go: 'go', walk: 'go', move: 'go',
  '行く': 'go', '進む': 'go', va: 'go', aller: 'go', marche: 'go',
  // take
  al: 'take', 'kap': 'take', take: 'take', get: 'take', grab: 'take', pick: 'take',
  '取る': 'take', '拾う': 'take', prends: 'take', prendre: 'take',
  // drop
  'bırak': 'drop', at: 'drop', drop: 'drop', '置く': 'drop', '捨てる': 'drop',
  laisse: 'drop', laisser: 'drop', pose: 'drop',
  // use
  kullan: 'use', use: 'use', '使う': 'use', utilise: 'use', utiliser: 'use',
  // open
  'aç': 'open', open: 'open', '開ける': 'open', ouvre: 'open', ouvrir: 'open',
  // talk
  'konuş': 'talk', sor: 'talk', talk: 'talk', speak: 'talk', '話す': 'talk', '聞く': 'talk',
  parle: 'talk', parler: 'talk',
  // meta
  envanter: 'inventory', 'çanta': 'inventory', i: 'inventory', inv: 'inventory',
  inventory: 'inventory', items: 'inventory', '持ち物': 'inventory', '荷物': 'inventory',
  inventaire: 'inventory', sac: 'inventory',
  'yardım': 'help', help: 'help', komutlar: 'help', 'ヘルプ': 'help', '助け': 'help', aide: 'help',
  ipucu: 'hint', hint: 'hint', 'ヒント': 'hint', indice: 'hint',
  harita: 'map', map: 'map', '地図': 'map', carte: 'map',
  kaydet: 'save', save: 'save', '保存': 'save', sauvegarde: 'save', sauver: 'save',
  'yükle': 'load', load: 'load', '読み込む': 'load', charge: 'load', charger: 'load',
  yeniden: 'restart', 'sıfırla': 'restart', restart: 'restart', reset: 'restart',
  'リセット': 'restart', recommence: 'restart', 'réinitialiser': 'restart',
  'şifre': 'code', kod: 'code', code: 'code', 'コード': 'code', '暗証番号': 'code',
  sakla: 'keep', tut: 'keep', keep: 'keep', '取っておく': 'keep', garde: 'keep', garder: 'keep',
  sil: 'erase', erase: 'erase', destroy: 'erase', wipe: 'erase', '消す': 'erase',
  efface: 'erase', effacer: 'erase',
};

export const ADVENTURE_ITEMS: AdventureItem[] = [
  {
    id: 'flashlight',
    name: L('el feneri', 'flashlight', '懐中電灯', 'lampe torche'),
    desc: L(
      'Pilsiz, eski bir el feneri. Camı çizik ama sağlam.',
      'An old flashlight with no battery. The lens is scratched but intact.',
      '電池の入っていない古い懐中電灯。レンズは傷だらけだが壊れてはいない。',
      'Une vieille lampe torche sans pile. La lentille est rayée mais intacte.',
    ),
    aliases: ['fener', 'el feneri', 'lamba', 'flashlight', 'torch', 'lamp', 'ライト', '懐中電灯', 'lampe', 'torche'],
  },
  {
    id: 'screwdriver',
    name: L('tornavida', 'screwdriver', 'ドライバー', 'tournevis'),
    desc: L(
      'Kırmızı saplı bir tornavida. Vidaları sökmeye yarar.',
      'A red-handled screwdriver. Good for unscrewing things.',
      '赤い柄のドライバー。ネジを外すのに使える。',
      'Un tournevis à manche rouge. Pratique pour dévisser.',
    ),
    aliases: ['tornavida', 'screwdriver', 'driver', 'ドライバー', 'tournevis'],
  },
  {
    id: 'coin',
    name: L('bozuk para', 'coin', '硬貨', 'pièce'),
    desc: L(
      'Otomatin altında sıkışmış, üzeri tozlu bir bozuk para.',
      'A dusty coin stuck under the vending machine.',
      '自動販売機の下に挟まった、ほこりまみれの硬貨。',
      'Une pièce poussiéreuse coincée sous le distributeur.',
    ),
    aliases: ['bozuk para', 'para', 'coin', '硬貨', 'コイン', 'piece', 'pièce'],
  },
  {
    id: 'battery',
    name: L('pil', 'battery', '電池', 'pile'),
    desc: L(
      'Otomatin düşürdüğü ince bir pil. Fenerle aynı boyutta.',
      'A slim battery from the vending machine. It fits the flashlight.',
      '自動販売機から出てきた細い電池。懐中電灯に合う。',
      'Une pile fine tombée du distributeur. Elle va dans la lampe.',
    ),
    aliases: ['pil', 'battery', '電池', 'バッテリー', 'pile'],
  },
  {
    id: 'bulb',
    name: L('projektör ampulü', 'projector bulb', '映写機の電球', 'ampoule de projecteur'),
    desc: L(
      'Sandıktan çıkan, kalın camlı bir projektör ampulü.',
      'A thick-glass projector bulb from the crate.',
      '木箱から出てきた、厚いガラスの映写機用電球。',
      'Une ampoule de projecteur à verre épais sortie de la caisse.',
    ),
    aliases: ['ampul', 'projektör ampulü', 'bulb', '電球', 'ampoule'],
  },
  {
    id: 'old_key',
    name: L('eski anahtar', 'old key', '古い鍵', 'vieille clé'),
    desc: L(
      'Pirinçten, ağır bir anahtar. Üzerinde küçük bir merdiven kabartması var.',
      'A heavy brass key with a tiny staircase embossed on it.',
      '真鍮製の重い鍵。小さな階段の彫刻がある。',
      'Une lourde clé en laiton avec un petit escalier gravé.',
    ),
    aliases: ['eski anahtar', 'anahtar', 'key', 'old key', '鍵', '古い鍵', 'cle', 'clé'],
  },
  {
    id: 'tape',
    name: L('kayıp bölüm kaseti', 'lost episode tape', '失われた回のテープ', 'cassette de l’épisode perdu'),
    desc: L(
      'Etiketi elle yazılmış: "BÖLÜM 13 — YAYINLANMADI". Kasetin kasası soğuk.',
      'The label is handwritten: "EPISODE 13 — NEVER AIRED". The shell feels cold.',
      'ラベルには手書きで「第13話 — 未放送」。ケースが冷たい。',
      'Étiquette manuscrite : « ÉPISODE 13 — JAMAIS DIFFUSÉ ». La coque est froide.',
    ),
    aliases: ['kaset', 'kayıp bölüm', 'tape', 'cassette', 'ビデオテープ', 'カセット', 'bande'],
  },
  {
    id: 'note',
    name: L('katalog notu', 'catalog note', 'カタログのメモ', 'note de catalogue'),
    desc: L(
      'Sararmış bir not: "47". Altında silinmiş bir rakam daha var.',
      'A yellowed note: "47". Below it, another digit has been erased.',
      '黄ばんだメモ：「47」。その下に消された数字がもう一つ。',
      'Une note jaunie : « 47 ». En dessous, un autre chiffre a été effacé.',
    ),
    aliases: ['not', 'katalog notu', 'note', 'メモ', 'カタログ', 'papier'],
  },
];

export const ADVENTURE_ROOMS: AdventureRoom[] = [
  {
    id: 'club',
    name: L('Anime Kulübü Odası', 'Anime Club Room', 'アニメ部室', 'Salle du club d’anime'),
    desc: L(
      'Tozlu bir kulüp odası. Duvarda solmuş bir anime posteri, köşede kırık bir kaset rafı var. Masanın üstünde bir el feneri ve bir tornavida duruyor. Doğudaki kapı koridora açılıyor.',
      'A dusty club room. A faded anime poster hangs on the wall and a broken tape shelf sits in the corner. A flashlight and a screwdriver lie on the desk. The door to the east opens onto the corridor.',
      'ほこりっぽい部室。壁には色あせたアニメのポスター、隅には壊れたテープ棚。机の上に懐中電灯とドライバーがある。東の扉は廊下に続く。',
      'Une salle de club poussiéreuse. Une affiche d’anime fanée au mur, une étagère à cassettes cassée dans un coin. Une lampe torche et un tournevis traînent sur le bureau. La porte à l’est donne sur le couloir.',
    ),
    exits: { east: 'corridor' },
    items: ['flashlight', 'screwdriver'],
  },
  {
    id: 'corridor',
    name: L('Koridor', 'Corridor', '廊下', 'Couloir'),
    desc: L(
      'Floresan lamba tekliyor. Yerde, otomatin altında bir bozuk para parlıyor. Batıda kulüp odası, kuzeyde arşiv, doğuda depo, güneyde gösterim odası var. Otomatın ışığı hâlâ yanıyor.',
      'A fluorescent light flickers. A coin glints under the vending machine. West is the club room, north the archive, east the storage room, south the screening room. The vending machine is still lit.',
      '蛍光灯がちらつく。自販機の下で硬貨が光っている。西は部室、北は資料室、東は倉庫、南は上映室。自販機の明かりはまだ点いている。',
      'Un néon clignote. Une pièce brille sous le distributeur. À l’ouest la salle du club, au nord les archives, à l’est le débarras, au sud la salle de projection. Le distributeur est encore allumé.',
    ),
    exits: { west: 'club', north: 'archive', east: 'storage', south: 'screening' },
    items: ['coin'],
  },
  {
    id: 'archive',
    name: L('Arşiv', 'Archive', '資料室', 'Archives'),
    desc: L(
      'Duvarları kaplayan raflarda yüzlerce kaset var. Yerde bir kaset ve sararmış bir katalog notu duruyor. Notta "47" yazıyor. Güneyde koridor.',
      'Hundreds of tapes fill shelves along the walls. A tape and a yellowed catalog note lie on the floor. The note reads "47". The corridor is to the south.',
      '壁一面の棚に何百本ものテープ。床にテープと黄ばんだカタログのメモが落ちている。メモには「47」。南は廊下。',
      'Des centaines de cassettes couvrent les étagères. Une cassette et une note de catalogue jaunie traînent au sol. La note indique « 47 ». Le couloir est au sud.',
    ),
    darkDesc: L(
      'Arşiv zifiri karanlık. Elini bile göremiyorsun. Işık olmadan hiçbir şey bulamazsın.',
      'The archive is pitch black. You cannot see your own hand. Without light you will find nothing.',
      '資料室は真っ暗。自分の手も見えない。光がなければ何も見つけられない。',
      'Les archives sont plongées dans le noir. Tu ne vois même pas ta main. Sans lumière, tu ne trouveras rien.',
    ),
    exits: { south: 'corridor' },
    items: ['tape', 'note'],
  },
  {
    id: 'storage',
    name: L('Depo', 'Storage Room', '倉庫', 'Débarras'),
    desc: L(
      'Karton kutular ve tozlu raflar. Köşede vidalı bir sandık, yanında kilitli bir dolap var. Batıda koridor.',
      'Cardboard boxes and dusty shelves. A screwed-shut crate sits in the corner beside a locked locker. The corridor is to the west.',
      '段ボール箱とほこりをかぶった棚。隅にネジ止めされた木箱と、鍵のかかったロッカーがある。西は廊下。',
      'Des cartons et des étagères poussiéreuses. Une caisse vissée dans un coin, à côté d’un placard verrouillé. Le couloir est à l’ouest.',
    ),
    exits: { west: 'corridor' },
    items: [],
  },
  {
    id: 'screening',
    name: L('Gösterim Odası', 'Screening Room', '上映室', 'Salle de projection'),
    desc: L(
      'Kadife koltuklar boş. Duvarda eski bir perde, karşısında ampulü sökülmüş bir projektör var. Perdenin yanında yarı saydam bir bekçi duruyor. Kuzeyde koridor, yukarıda projeksiyon odasına çıkan kilitli bir merdiven var.',
      'The velvet seats are empty. An old screen hangs on the wall, facing a projector with its bulb removed. A translucent caretaker stands beside the screen. North is the corridor; a locked staircase leads up to the projection booth.',
      'ビロードの席は空っぽ。壁に古いスクリーン、その前に電球を抜かれた映写機。スクリーンの横に半透明の案内人が立っている。北は廊下、上へは映写室への鍵のかかった階段。',
      'Les fauteuils de velours sont vides. Un vieil écran au mur fait face à un projecteur sans ampoule. Un gardien translucide se tient près de l’écran. Au nord le couloir ; un escalier verrouillé monte vers la cabine de projection.',
    ),
    exits: { north: 'corridor', up: 'booth' },
    items: [],
  },
  {
    id: 'booth',
    name: L('Projeksiyon Odası', 'Projection Booth', '映写室', 'Cabine de projection'),
    desc: L(
      'Küçük, sıcak bir oda. Eski bir terminal, üzerinde üç haneli kod girişi var. Kuzeydeki kapı çıkış holüne gidiyor ama kilitli. Aşağıda gösterim odası.',
      'A small, warm room. An old terminal has a three-digit code slot. The north door leads to the exit hall but is locked. The screening room is below.',
      '狭く暖かい部屋。古い端末に3桁のコード入力口がある。北の扉は出口ホールへ続くが鍵がかかっている。下は上映室。',
      'Une petite pièce chaude. Un vieux terminal avec un clavier à trois chiffres. La porte au nord mène au hall de sortie mais elle est verrouillée. La salle de projection est en bas.',
    ),
    exits: { down: 'screening', north: 'exit' },
    items: [],
  },
  {
    id: 'exit',
    name: L('Çıkış Holü', 'Exit Hall', '出口ホール', 'Hall de sortie'),
    desc: L(
      'Beton bir hol. Aralık kapıdan yağmur sesi geliyor. Elinde kayıp bölüm kaseti var. Onu saklayabilir, silebilir ya da burada bırakabilirsin.',
      'A concrete hall. Rain hisses through the half-open door. You are holding the lost episode tape. You can keep it, erase it, or leave it here.',
      'コンクリートのホール。半開きの扉から雨音が聞こえる。手には失われた回のテープ。持ち帰るか、消すか、ここに置いていくか。',
      'Un hall de béton. La pluie siffle par la porte entrouverte. Tu tiens la cassette de l’épisode perdu. Tu peux la garder, l’effacer ou la laisser ici.',
    ),
    exits: {},
    items: [],
  },
];

export const ADVENTURE_ENDINGS: AdventureEnding[] = [
  {
    id: 'keep',
    title: L('ARŞİVİN YENİ BEKÇİSİ', 'THE ARCHIVE’S NEW KEEPER', '資料室の新しい案内人', 'LE NOUVEAU GARDIEN DES ARCHIVES'),
    text: L(
      'Kaseti ceketine koydun. Yağmurda yürürken kasetin hafifçe ısındığını hissediyorsun. Şehirde yeni bir efsane başlıyor — ama arşiv artık seni de hatırlıyor.',
      'You slip the tape into your coat. As you walk through the rain it grows faintly warm. A new legend begins in the city — but the archive remembers you now.',
      'テープをコートの内ポケットに入れた。雨の中を歩くと、テープがかすかに温かい。街に新しい伝説が始まる——だが資料室はもう君を覚えている。',
      'Tu glisses la cassette dans ton manteau. Sous la pluie, elle devient légèrement tiède. Une nouvelle légende naît en ville — mais les archives se souviennent de toi désormais.',
    ),
  },
  {
    id: 'erase',
    title: L('TEMİZ ÇIKIŞ', 'A CLEAN EXIT', 'きれいな出口', 'UNE SORTIE PROPRE'),
    text: L(
      'Kaseti mıknatısla sildin. Projektörün fanı bir an durdu, sonra sustu. Stüdyo rahat bir nefes aldı. Kapı arkandan kapandı ve koridor yeniden sıradan bir koridor oldu.',
      'You wipe the tape with a magnet. The projector fan stops for a beat, then goes silent. The studio exhales. The door closes behind you, and the corridor is just a corridor again.',
      '磁石でテープを消した。映写機のファンが一瞬止まり、静かになった。スタジオは息をついた。扉が背後で閉まり、廊下はただの廊下に戻った。',
      'Tu effaces la cassette avec un aimant. Le ventilateur du projecteur s’arrête un instant, puis se tait. Le studio respire. La porte se referme derrière toi, et le couloir redevient un simple couloir.',
    ),
  },
  {
    id: 'leave',
    title: L('SIRADAKİ İZLEYİCİ', 'THE NEXT VIEWER', '次の観客', 'LE PROCHAIN SPECTATEUR'),
    text: L(
      'Kaseti masaya bıraktın. Yağmurda yürüdün. Arkanda, stüdyonun penceresinde bir ışık yandı. İçeride biri kaseti eline aldı ve etiketi okudu. Sıradaki izleyici sensin.',
      'You leave the tape on the table and walk into the rain. Behind you, a light flicks on in the studio window. Someone inside picks up the tape and reads the label. The next viewer is you.',
      'テープを机に置き、雨の中へ歩き出した。背後、スタジオの窓に明かりが灯る。中で誰かがテープを手に取り、ラベルを読んだ。次の観客は君だ。',
      'Tu laisses la cassette sur la table et sors sous la pluie. Derrière toi, une lumière s’allume à la fenêtre du studio. Quelqu’un prend la cassette et lit l’étiquette. Le prochain spectateur, c’est toi.',
    ),
  },
];

export const TA_INTRO = L(
  'Gece yarısı, kulübün eski binasındasın. Elinde, kimsenin yayınlanmadığını söylediği bir kaset var. Kapı arkandan kapandı. Işıklar teker teker söndü. Buradan çıkmak için stüdyonun sırrını çözmen gerekiyor.',
  'Midnight, in the club’s old building. You carry a tape nobody claims was ever aired. The door shut behind you. The lights went out one by one. To leave, you must solve the studio’s secret.',
  '真夜中、部室の古い建物にいる。誰も放送されたと言わないテープを手に持っている。背後で扉が閉まった。明かりが一つずつ消えていった。ここを出るには、スタジオの秘密を解かねばならない。',
  'Minuit, dans le vieux bâtiment du club. Tu portes une cassette que personne ne dit avoir été diffusée. La porte s’est refermée derrière toi. Les lumières se sont éteintes une à une. Pour sortir, il faut résoudre le secret du studio.',
);

export const TA_HELP = L(
  'Komutlar: bak · git <yön> · al <nesne> · bırak <nesne> · kullan <nesne> [hedef] · aç <şey> · konuş <kişi> · envanter · ipucu · harita · kaydet · yükle · yeniden. Yönler: kuzey, güney, doğu, batı, yukarı, aşağı. Kısa yazabilirsin: "k", "n", "e", "w".',
  'Commands: look · go <direction> · take <item> · drop <item> · use <item> [target] · open <thing> · talk <person> · inventory · hint · map · save · load · restart. Directions: north, south, east, west, up, down. Short forms work: "n", "s", "e", "w".',
  'コマンド：見る · 行く <方向> · 取る <物> · 置く <物> · 使う <物> [対象] · 開ける <物> · 話す <人> · 持ち物 · ヒント · 地図 · 保存 · 読み込む · リセット。方向：北・南・東・西・上・下。',
  'Commandes : regarder · aller <direction> · prendre <objet> · laisser <objet> · utiliser <objet> [cible] · ouvrir <chose> · parler <personne> · inventaire · indice · carte · sauvegarde · charger · recommencer. Directions : nord, sud, est, ouest, haut, bas.',
);

export const TA_QUICK_COMMANDS: { label: Localized; command: string }[] = [
  { label: L('Bak', 'Look', '見る', 'Regarder'), command: 'look' },
  { label: L('Envanter', 'Inventory', '持ち物', 'Inventaire'), command: 'inventory' },
  { label: L('İpucu', 'Hint', 'ヒント', 'Indice'), command: 'hint' },
  { label: L('Harita', 'Map', '地図', 'Carte'), command: 'map' },
  { label: L('Yardım', 'Help', 'ヘルプ', 'Aide'), command: 'help' },
  { label: L('Kaydet', 'Save', '保存', 'Sauver'), command: 'save' },
  { label: L('Yükle', 'Load', '読み込む', 'Charger'), command: 'load' },
  { label: L('Yeniden', 'Restart', 'リセット', 'Recommencer'), command: 'restart' },
];

export const TA_FIXTURES: Record<string, Localized> = {
  vending: L(
    'Işığı yanık bir otomat. Bozuk para yuvası ve tek sıra düğme var.',
    'A lit vending machine with a coin slot and a single row of buttons.',
    '明かりのついた自販機。硬貨投入口とボタンが一列。',
    'Un distributeur allumé avec une fente à pièces et une rangée de boutons.',
  ),
  crate: L(
    'Vidalarla kapatılmış ahşap bir sandık. Kapağında stüdyo logosu var.',
    'A wooden crate screwed shut, with a studio logo on the lid.',
    'ネジで閉じられた木箱。ふたにスタジオのロゴ。',
    'Une caisse en bois vissée, avec le logo du studio sur le couvercle.',
  ),
  locker: L(
    'Kilitli, vidalı metal bir dolap. Kapısı hafifçe şişmiş.',
    'A locked, screwed metal locker. The door is slightly warped.',
    '鍵とネジで閉じられた金属ロッカー。扉が少し歪んでいる。',
    'Un placard métallique verrouillé et vissé. La porte est légèrement voilée.',
  ),
  projector: L(
    'Eski bir 16 mm projektör. Ampul yuvası boş, film yolu temiz.',
    'An old 16 mm projector. The bulb socket is empty; the film path is clean.',
    '古い16mm映写機。電球ソケットは空で、フィルム通路はきれいだ。',
    'Un vieux projecteur 16 mm. Le logement de l’ampoule est vide, le chemin de film est propre.',
  ),
  terminal: L(
    'Üç haneli kod girişi olan eski bir terminal. Ekranı yeşil yanıyor.',
    'An old terminal with a three-digit code slot. Its screen glows green.',
    '3桁のコード入力口がある古い端末。画面が緑に光る。',
    'Un vieux terminal avec un clavier à trois chiffres. L’écran luit en vert.',
  ),
  door: L(
    'Merdivene çıkan ahşap kapı. Pirinç bir anahtar deliği var.',
    'A wooden door to the staircase, with a brass keyhole.',
    '階段へ続く木の扉。真鍮の鍵穴がある。',
    'Une porte en bois vers l’escalier, avec une serrure en laiton.',
  ),
  ghost: L(
    'Yarı saydam bir bekçi. Ağzı kıpırdıyor ama sesi zor duyuluyor.',
    'A translucent caretaker. Its mouth moves, but the voice is faint.',
    '半透明の案内人。口は動くが声はかすかだ。',
    'Un gardien translucide. Sa bouche bouge, mais sa voix est faible.',
  ),
};

export const TA_HINTS: Localized[] = [
  L(
    'Fenerin pili yok. Koridordaki otomatin altına bak; bozuk parayı kullanınca bir pil düşecek.',
    'The flashlight has no battery. Check under the vending machine in the corridor; a coin will get you a battery.',
    '懐中電灯に電池がない。廊下の自販機の下を見よう。硬貨を使えば電池が出てくる。',
    'La lampe n’a pas de pile. Regarde sous le distributeur du couloir : une pièce te donnera une pile.',
  ),
  L(
    'Depodaki sandık ve dolap vidalı. Tornavidayla ikisini de açabilirsin: ampul ve eski anahtar orada.',
    'The crate and locker in storage are screwed shut. The screwdriver opens both: the bulb and the old key are inside.',
    '倉庫の木箱とロッカーはネジ止め。ドライバーで両方開けられる。中に電球と古い鍵がある。',
    'La caisse et le placard du débarras sont vissés. Le tournevis ouvre les deux : l’ampoule et la vieille clé sont dedans.',
  ),
  L(
    'Arşiv karanlık. Pil takılı feneri kullanmadan kaseti ya da notu alamazsın.',
    'The archive is dark. You cannot take the tape or the note without a working flashlight.',
    '資料室は暗い。電池を入れた懐中電灯なしではテープもメモも取れない。',
    'Les archives sont sombres. Sans lampe en état de marche, impossible de prendre la cassette ou la note.',
  ),
  L(
    'Gösterim odasında ampulü projektöre tak, sonra kaseti oynat. Perde sana kodun son rakamını verecek.',
    'In the screening room, fit the bulb into the projector, then play the tape. The screen will give you the last digit.',
    '上映室で電球を映写機に付け、テープを再生しよう。スクリーンがコードの最後の数字を示す。',
    'Dans la salle de projection, installe l’ampoule puis lis la cassette. L’écran te donnera le dernier chiffre.',
  ),
  L(
    'Notta 47 yazıyor, perdede 1 gördün. Merdiven kapısını eski anahtarla aç ve terminale 471 gir.',
    'The note says 47 and the screen showed 1. Unlock the staircase with the old key and enter 471 on the terminal.',
    'メモは47、スクリーンは1。古い鍵で階段を開け、端末に471を入力する。',
    'La note indique 47 et l’écran a montré 1. Ouvre l’escalier avec la vieille clé et entre 471 sur le terminal.',
  ),
  L(
    'Çıkış holündesin. Kaseti saklayabilir, silebilir ya da bırakabilirsin — üçü de farklı bir son açar.',
    'You are in the exit hall. Keep the tape, erase it, or leave it — each leads to a different ending.',
    '出口ホールにいる。テープを持ち帰る、消す、置いていく——どれも別の結末につながる。',
    'Tu es dans le hall de sortie. Garde la cassette, efface-la ou laisse-la : chaque choix mène à une fin différente.',
  ),
];

export const TA_SOLUTION = L(
  'Çözüm: kulüpten fener ve tornavidayı al; koridordaki bozuk parayla otomattan pil al; depoda tornavidayla sandığı ve dolabı aç; arşivde pili fenere tak, kaseti ve notu al; gösterim odasında ampulü projektöre tak, kaseti oynat; eski anahtarla merdiven kapısını aç; terminale 471 gir.',
  'Solution: take the flashlight and screwdriver from the club; buy a battery with the corridor coin; use the screwdriver on the crate and locker in storage; fit the battery into the flashlight in the archive, take the tape and note; in the screening room fit the bulb and play the tape; unlock the staircase with the old key; enter 471 on the terminal.',
  '解決策：部室で懐中電灯とドライバーを取る。廊下の硬貨で自販機から電池を買う。倉庫でドライバーを使い木箱とロッカーを開ける。資料室で電池を懐中電灯に入れ、テープとメモを取る。上映室で電球を映写機に付け、テープを再生する。古い鍵で階段を開け、端末に471を入力する。',
  'Solution : prends la lampe et le tournevis au club ; achète une pile avec la pièce du couloir ; utilise le tournevis sur la caisse et le placard ; mets la pile dans la lampe aux archives, prends la cassette et la note ; dans la salle de projection, installe l’ampoule et lis la cassette ; ouvre l’escalier avec la vieille clé ; entre 471 sur le terminal.',
);

export const TA_TEXT = {
  nothing: L('Burada öyle bir şey yok.', 'There is no such thing here.', 'ここにはそんなものはない。', 'Il n’y a rien de tel ici.'),
  cannotTake: L('Bunu alamazsın.', 'You cannot take that.', 'それは取れない。', 'Tu ne peux pas prendre ça.'),
  took: L('Aldın:', 'Taken:', '取った：', 'Pris :'),
  alreadyHave: L('Bu zaten envanterinde.', 'You already have that.', 'それはもう持っている。', 'Tu l’as déjà.'),
  dropped: L('Bıraktın:', 'Dropped:', '置いた：', 'Laissé :'),
  notCarrying: L('Envanterinde yok.', 'You are not carrying that.', '持ち物にない。', 'Tu ne l’as pas sur toi.'),
  noExit: L('O yönde bir çıkış yok.', 'There is no exit that way.', 'その方向に出口はない。', 'Il n’y a pas de sortie par là.'),
  dark: L('Karanlıkta bu iş olmaz. Bir ışık kaynağı bulmalısın.', 'Not in the dark. You need a light source.', '暗闇では無理だ。光源が必要だ。', 'Pas dans le noir. Il te faut une source de lumière.'),
  examine: L('Dikkatle bakıyorsun:', 'You look closely:', '注意して見る：', 'Tu regardes de près :'),
  alreadyOn: L('Fener zaten açık.', 'The flashlight is already on.', '懐中電灯はもう点いている。', 'La lampe est déjà allumée.'),
  noBattery: L('Fenerin pili yok. Önce bir pil bulmalısın.', 'The flashlight has no battery. Find one first.', '懐中電灯に電池がない。まず電池を探そう。', 'La lampe n’a pas de pile. Trouve-en une d’abord.'),
  lightOn: L('Pili taktın. Fenerin soğuk, mavi ışığı duvarları tarıyor.', 'You fit the battery. The flashlight’s cold blue beam sweeps the walls.', '電池を入れた。冷たい青い光が壁を照らす。', 'Tu installes la pile. Le faisceau bleu froid balaie les murs.'),
  vendingNeedCoin: L('Otomat bozuk para istiyor. Yuvası boş.', 'The vending machine wants a coin. The slot is empty.', '自販機は硬貨を要求している。投入口は空だ。', 'Le distributeur demande une pièce. La fente est vide.'),
  vendingGive: L('Bozuk parayı attın. Otomat takırdadı ve bir pil düşürdü.', 'You insert the coin. The machine clunks and drops a battery.', '硬貨を入れた。自販機がガコンと音を立て、電池が出てきた。', 'Tu insères la pièce. La machine claque et lâche une pile.'),
  vendingEmpty: L('Otomatın içi boş. Sadece toz ve eski bir çikolata kabı var.', 'The machine is empty. Just dust and an old chocolate wrapper.', '自販機は空っぽ。ほこりと古いチョコの包みだけ。', 'Le distributeur est vide. Juste de la poussière et un vieil emballage.'),
  crateNeedTool: L('Sandık vidalarla kapatılmış. Tornavida gerekiyor.', 'The crate is screwed shut. You need a screwdriver.', '木箱はネジで閉じられている。ドライバーが必要だ。', 'La caisse est vissée. Il faut un tournevis.'),
  crateOpen: L('Sandığı açtın. İçinden kalın camlı bir projektör ampulü çıktı.', 'You open the crate. Inside is a thick-glass projector bulb.', '木箱を開けた。中から厚いガラスの映写機用電球が出てきた。', 'Tu ouvres la caisse. À l’intérieur, une ampoule de projecteur.'),
  crateAlready: L('Sandık zaten açık.', 'The crate is already open.', '木箱はもう開いている。', 'La caisse est déjà ouverte.'),
  lockerNeedTool: L('Dolap kilitli ve vidalı. Tornavida olmadan açılmaz.', 'The locker is locked and screwed. You need a screwdriver.', 'ロッカーは鍵とネジで閉じられている。ドライバーが必要だ。', 'Le placard est verrouillé et vissé. Il faut un tournevis.'),
  lockerOpen: L('Dolabı açtın. İçinde pirinç bir anahtar var.', 'You open the locker. A brass key waits inside.', 'ロッカーを開けた。中に真鍮の鍵がある。', 'Tu ouvres le placard. Une clé en laiton t’attend.'),
  lockerAlready: L('Dolap zaten açık.', 'The locker is already open.', 'ロッカーはもう開いている。', 'Le placard est déjà ouvert.'),
  bulbSet: L('Ampulü projektöre taktın. Mercekler hafifçe titredi.', 'You fit the bulb. The lenses tremble slightly.', '電球を映写機に取り付けた。レンズがかすかに震える。', 'Tu installes l’ampoule. Les lentilles frémissent.'),
  bulbAlready: L('Projektörün ampulü takılı.', 'The projector already has a bulb.', '映写機にはもう電球が付いている。', 'Le projecteur a déjà une ampoule.'),
  projectorNeedBulb: L('Projektörün ampulü yok. Önce bir ampul bulmalısın.', 'The projector has no bulb. Find one first.', '映写機に電球がない。まず電球を探そう。', 'Le projecteur n’a pas d’ampoule. Trouve-en une.'),
  projectorNeedTape: L('Projektör hazır ama oynatacak kaset yok.', 'The projector is ready, but there is no tape to play.', '映写機は準備できたが、再生するテープがない。', 'Le projecteur est prêt, mais il n’y a pas de cassette.'),
  tapePlayed: L(
    'Kaset dönmeye başladı. Perdede bir kız, elinde kırık bir saat tutuyor. Görüntü bir an donuyor ve köşede tek bir rakam beliriyor: 1. Sonra perde kararıyor.',
    'The tape starts. A girl on screen holds a broken watch. The image freezes for a moment and a single digit appears in the corner: 1. Then the screen goes dark.',
    'テープが回り始めた。画面の少女が壊れた時計を握っている。映像が一瞬止まり、隅に数字が一つ浮かぶ：1。そして画面は暗くなる。',
    'La cassette démarre. Une fille à l’écran tient une montre cassée. L’image se fige et un chiffre apparaît dans un coin : 1. Puis l’écran s’éteint.',
  ),
  tapeAlready: L('Kaset zaten oynatıldı. Perde karanlık.', 'The tape has already played. The screen is dark.', 'テープはもう再生された。スクリーンは暗い。', 'La cassette a déjà été lue. L’écran est noir.'),
  boothNeedKey: L('Merdiven kapısı kilitli. Eski bir anahtar işe yarayabilir.', 'The staircase door is locked. An old key might work.', '階段の扉は鍵がかかっている。古い鍵なら合うかもしれない。', 'La porte de l’escalier est verrouillée. Une vieille clé pourrait marcher.'),
  boothAlready: L('Merdiven kapısı zaten açık.', 'The staircase door is already open.', '階段の扉はもう開いている。', 'La porte de l’escalier est déjà ouverte.'),
  boothUnlocked: L('Eski anahtar döndü. Merdiven kapısı gıcırdayarak açıldı.', 'The old key turns. The staircase door creaks open.', '古い鍵が回った。階段の扉がきしみながら開く。', 'La vieille clé tourne. La porte de l’escalier s’ouvre en grinçant.'),
  exitLocked: L('Kuzey kapısı kilitli. Terminaldeki kod kilidi açabilir.', 'The north door is locked. The terminal code could open it.', '北の扉は鍵がかかっている。端末のコードで開けられるかもしれない。', 'La porte nord est verrouillée. Le code du terminal pourrait l’ouvrir.'),
  terminalNeedCode: L('Terminal üç haneli bir kod bekliyor. "şifre 000" gibi yazabilirsin.', 'The terminal waits for a three-digit code. Try "code 000".', '端末は3桁のコードを待っている。「コード 000」のように入力する。', 'Le terminal attend un code à trois chiffres. Essaie « code 000 ».'),
  terminalOk: L('Terminal onayladı. Kuzey kapısı uğultuyla açıldı.', 'The terminal accepts the code. The north door hums open.', '端末がコードを受け付けた。北の扉がうなりながら開く。', 'Le terminal accepte le code. La porte nord s’ouvre en bourdonnant.'),
  terminalBad: L('Terminal kodu reddetti. Ekranda "HATALI" yazıyor.', 'The terminal rejects the code. "INVALID" flashes on screen.', '端末はコードを拒否した。画面に「エラー」と表示される。', 'Le terminal refuse le code. « INVALIDE » clignote.'),
  terminalAlready: L('Kuzey kapısı zaten açık. Terminal bekleme modunda.', 'The north door is already open. The terminal idles.', '北の扉はもう開いている。端末は待機中。', 'La porte nord est déjà ouverte. Le terminal est en veille.'),
  talkGhost: L(
    'Bekçi sana bakmıyor bile. "Kaseti oynatmadan önce ışığı bul," diye fısıldıyor. "Kod üç haneli. İlk ikisi notta, sonuncusu perdede."',
    'The caretaker does not look at you. "Find the light before you play the tape," it whispers. "The code has three digits. The first two are on the note, the last is on the screen."',
    '案内人はこちらを見ない。「テープを再生する前に光を探せ」とささやく。「コードは3桁。最初の二つはメモに、最後はスクリーンにある」',
    'Le gardien ne te regarde pas. « Trouve la lumière avant de lire la cassette », souffle-t-il. « Le code a trois chiffres. Les deux premiers sont sur la note, le dernier sur l’écran. »',
  ),
  talkNoOne: L('Burada konuşacak kimse yok.', 'There is nobody here to talk to.', 'ここに話す相手はいない。', 'Il n’y a personne à qui parler ici.'),
  notUnderstood: L('Bunu anlamadım. "yardım" yazarak komutları görebilirsin.', 'I did not understand that. Type "help" to see the commands.', '理解できなかった。「ヘルプ」でコマンドを確認できる。', 'Je n’ai pas compris. Tape « aide » pour voir les commandes.'),
  noItemToUse: L('Elinde kullanacak bir şey yok.', 'You have nothing to use.', '使えるものを持っていない。', 'Tu n’as rien à utiliser.'),
  nothingHappens: L('Hiçbir şey olmuyor.', 'Nothing happens.', '何も起こらない。', 'Rien ne se passe.'),
  inventoryEmpty: L('Envanterin boş.', 'Your inventory is empty.', '持ち物は空だ。', 'Ton inventaire est vide.'),
  inventoryTitle: L('Envanterinde:', 'You are carrying:', '持ち物：', 'Tu portes :'),
  exits: L('Çıkışlar:', 'Exits:', '出口：', 'Sorties :'),
  visibleItems: L('Görünen:', 'You see:', '見えるもの：', 'Tu vois :'),
  lockedSuffix: L('kilitli', 'locked', '鍵', 'verrouillé'),
  mapTitle: L('Ziyaret ettiğin yerler:', 'Places visited:', '訪れた場所：', 'Lieux visités :'),
  noTerminal: L('Burada kod girecek bir terminal yok.', 'There is no terminal here to enter a code.', 'ここにコードを入力する端末はない。', 'Il n’y a pas de terminal ici pour saisir un code.'),
  cannotGo: L('Oraya gidemiyorsun.', 'You cannot go there.', 'そこへは行けない。', 'Tu ne peux pas aller par là.'),
  saveOk: L('Oyun kaydedildi. ("yükle" ile geri dön.)', 'Game saved. (Use "load" to return.)', 'ゲームを保存した。（「読み込む」で戻れる）', 'Partie sauvegardée. (Utilise « charger » pour revenir.)'),
  loadOk: L('Kayıt yüklendi.', 'Save loaded.', 'セーブを読み込んだ。', 'Sauvegarde chargée.'),
  noSave: L('Kayıtlı oyun yok.', 'There is no saved game.', 'セーブデータがない。', 'Il n’y a pas de sauvegarde.'),
  restartOk: L('Yeni bir gece başlıyor.', 'A new night begins.', '新しい夜が始まる。', 'Une nouvelle nuit commence.'),
  endingPrompt: L(
    'Kaset elinde. Ne yapacaksın? "sakla", "sil" ya da "bırak" yazabilirsin.',
    'The tape is in your hand. What will you do? Type "keep", "erase" or "leave".',
    'テープは君の手の中。どうする？「取っておく」「消す」「置いていく」と入力できる。',
    'La cassette est dans ta main. Que fais-tu ? Tape « garder », « effacer » ou « laisser ».',
  ),
  alreadyEnded: L('Hikâye bitti. "yeniden" ile baştan başlayabilirsin.', 'The story is over. Type "restart" to begin again.', '物語は終わった。「リセット」で最初から始められる。', 'L’histoire est finie. Tape « recommencer » pour reprendre.',
  ),
} as const;

/** İlerleme yüzdesi için sayılan kilometre taşları. */
export const PROGRESS_FLAGS = [
  'light_on',
  'battery_taken',
  'crate_open',
  'locker_open',
  'tape_taken',
  'note_taken',
  'bulb_set',
  'tape_played',
  'booth_unlocked',
  'exit_unlocked',
] as const;

export const getLocalized = (value: Localized, lang: Lang4): string => value[lang] || value.en;
