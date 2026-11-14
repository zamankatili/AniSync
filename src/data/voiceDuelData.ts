/**
 * KİM BU KARAKTER? — ses tanıma verisi.
 *
 * Tüm klipler **resmî** kanallardan gelir:
 *   ONE PIECE Official YouTube Channel — https://www.youtube.com/@onepieceofficial
 *   Bandai Namco Entertainment — https://www.youtube.com/@bandainamcoentertainment
 *   MAPPA CHANNEL — https://www.youtube.com/@MAPPACHANNEL
 *   呪術廻戦 ファントムパレード公式 — https://www.youtube.com/@user-uq8uo5kg7s
 *   TOHO animation — https://www.youtube.com/@TOHOanimation
 *   アニプレックス チャンネル — https://www.youtube.com/@aniplexch
 *   Crunchyroll — https://www.youtube.com/@Crunchyroll
 *
 * YouTube iframe API'siyle yalnızca ilgili klip, başlangıç/bitiş zamanlarıyla oynatılır.
 * Görüntü/puanlar AniList/MAL'den alınmaz (hot-link); yalnız metin gösterilir.
 */
export type VoiceHint = Record<'tr' | 'en' | 'ja' | 'fr', string>;

export interface VoiceClip {
    id: string;
    name: string;
    series: string;
    videoId: string;
    startSeconds: number;
    endSeconds: number;
    options: [string, string, string, string];
    difficulty: 'kolay' | 'orta' | 'zor';
    hint: VoiceHint;
}

export const VOICE_CLIPS: VoiceClip[] = [
    {
        id: 'gojo-awakened-pv',
        name: 'Gojo Satoru',
        series: 'Jujutsu Kaisen',
        videoId: 'Pufm_Yc1lHM',
        startSeconds: 0,
        endSeconds: 15,
        options: ['Gojo Satoru', 'Geto Suguru', 'Sukuna', 'Okkotsu Yuta'],
        difficulty: 'kolay',
        hint: {
            tr: 'Beyaz saçlı en güçlü büyücü. Gözlerini gizler ama her şeyi görür.',
            en: 'The white-haired strongest sorcerer. Eyes hidden, yet he sees everything.',
            ja: '最強の呪術師。目を隠しているが、すべてを見通す白髪の天才。',
            fr: "Le plus fort des sorciers, aux cheveux blancs. Les yeux cachés, il voit pourtant tout.",
        },
    },
    {
        id: 'monkey-luffy-gear5-pv',
        name: 'Monkey D. Luffy',
        series: 'One Piece',
        videoId: 'qBN2UgCAVqk',
        startSeconds: 3,
        endSeconds: 18,
        options: ['Monkey D. Luffy', 'Roronoa Zoro', 'Sanji', 'Portgas D. Ace'],
        difficulty: 'kolay',
        hint: {
            tr: 'Lastik bedenli çocuk. Hayali korsanların kralı olmak.',
            en: 'The boy with a rubber body dreaming of becoming Pirate King.',
            ja: 'ゴムの身体を持つ少年。海賊王という夢を追っている。',
            fr: "Le garçon au corps de caoutchouc qui rêve de devenir le Roi des Pirates.",
        },
    },
    {
        id: 'tanjirou-pv',
        name: 'Kamado Tanjiro',
        series: 'Demon Slayer: Kimetsu no Yaiba',
        videoId: '6JnxnSq7sqU',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Kamado Tanjiro', 'Hashibira Inosuke', 'Agatsuma Zenitsu', 'Tomioka Giyu'],
        difficulty: 'kolay',
        hint: {
            tr: 'Ailesini kaybeden bir oğul; bir iblisin içinde sıkışmış kız kardeşini insanlığa geri döndürmek için savaşıyor.',
            en: 'A boy who lost his family and fights to return his demon-turned sister to humanity.',
            ja: '家族を失い、鬼となった妹を人間に戻すために戦う水の呼吸の使い手。',
            fr: "Un garçon qui a perdu sa famille et se bat pour rendre sa sœur, devenue démon, à son humanité.",
        },
    },
    {
        id: 'zenitsu-pv',
        name: 'Agatsuma Zenitsu',
        series: 'Demon Slayer: Kimetsu no Yaiba',
        videoId: 'fHKBje6deFg',
        startSeconds: 0,
        endSeconds: 16,
        options: ['Agatsuma Zenitsu', 'Hashibira Inosuke', 'Sabito', 'Kamado Tanjiro'],
        difficulty: 'kolay',
        hint: {
            tr: 'Tam bir korkak; ama uyurken şimşek hızıyla savaşan genç.',
            en: 'A complete coward who fights at lightning speed the moment he falls asleep.',
            ja: '完全な臆病者だが、眠ると稲妻のような速さで戦う少年。',
            fr: "Un peureux intégral qui se bat à la vitesse de la foudre dès qu'il s'endort.",
        },
    },
    {
        id: 'kugisaki-nobara-pv',
        name: 'Kugisaki Nobara',
        series: 'Jujutsu Kaisen',
        videoId: 'Tj4PXlgdD74',
        startSeconds: 0,
        endSeconds: 15,
        options: ['Kugisaki Nobara', 'Maki Zenin', 'Momo Nishimiya', 'Inumaki Toge'],
        difficulty: 'orta',
        hint: {
            tr: 'Çivi ve çekiçle lanetlerin peşinde olan taşralı liseli kız; hayalinde büyük şehir var.',
            en: 'The country girl punching curses with a hammer and nail, obsessed with city life.',
            ja: '釘とカナヅチで呪いを打つ、都会にあこがれた地方の女子高生。',
            fr: "L'écolière de province qui cloue les malédictions à coups de marteau, folle de la grande ville.",
        },
    },
    {
        id: 'fushiguro-megumi-pv',
        name: 'Fushiguro Megumi',
        series: 'Jujutsu Kaisen',
        videoId: '--HiLB8TtNE',
        startSeconds: 0,
        endSeconds: 15,
        options: ['Fushiguro Megumi', 'Naoya Zenin', 'Aoi Todo', 'Inumaki Toge'],
        difficulty: 'orta',
        hint: {
            tr: 'Büyü lisesi 1. sınıf. Babasının gölge tekniğini devralan, soğukkanlı bir çocuk.',
            en: 'First-year at Jujutsu High. A stoic boy carrying his father’s shadow technique.',
            ja: '呪術高専1年生。父の影の術を受け継いだ、冷静で不器用な少年。',
            fr: "Première année à la Jujutsu High. Un garçon froid, héritier de la technique des ombres de son père.",
        },
    },
    {
        id: 'tomiioka-pv',
        name: 'Tomioka Giyu',
        series: 'Demon Slayer: Kimetsu no Yaiba',
        videoId: 'EWuFSs16WLs',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Tomioka Giyu', 'Rengoku Kyoujurou', 'Muichiro Tokito', 'Iguro Obanai'],
        difficulty: 'orta',
        hint: {
            tr: 'Suskun Su Sütunu. Tanjiro’yu iblis avcısı olarak yetiştiren adam.',
            en: 'The silent Water Hashira who guided Tanjiro into the Demon Slayer Corps.',
            ja: '無口な水柱。炭治郎を鬼殺隊へと導いた男。',
            fr: "La silencieuse Pilier de l'Eau qui a guidé Tanjiro vers le Corps.",
        },
    },
    {
        id: 'crocodile-pv',
        name: 'Crocodile',
        series: 'One Piece',
        videoId: 'cATIzH2js1U',
        startSeconds: 0,
        endSeconds: 15,
        options: ['Crocodile', 'Donquixote Doflamingo', 'Boa Hancock', 'Gin'],
        difficulty: 'orta',
        hint: {
            tr: 'Yedi Donanım savaşçılarından kum adamı; barış maskesiyle Arabasta’yı kuruyup bırakan adam.',
            en: 'The sand user of the Seven Warlords who drained Alabasta dry under the mask of “peace”.',
            ja: '砂の七武海。アラバスタを平和という仮面で食い物にした男。',
            fr: "L'utilisateur de sable des Sept Seigneurs, qui a asséché Alabasta sous couvert de paix.",
        },
    },
    {
        id: 'bigmom-pv',
        name: 'Charlotte Linlin',
        series: 'One Piece',
        videoId: 's-cx_f4ke8s',
        startSeconds: 0,
        endSeconds: 15,
        options: ['Charlotte Linlin', 'Kaido', 'Edward Newgate', 'Marshall D. Teach'],
        difficulty: 'orta',
        hint: {
            tr: 'Dört konsüllerden biri; tatlı düşkünü, iltifat gördüğünde şenlenen kadın korsan kaptan.',
            en: 'One of the Four Emperors — a gluttonous pirate captain whose mood soars on compliments.',
            ja: '四皇の一人で、お菓子好きの女海賊。褒めると機嫌が良くなる。',
            fr: "L'une des Quatre Empereurs — une pirate gourmande qui s'enflamme sous les compliments.",
        },
    },
    {
        id: 'orochimaru-clip',
        name: 'Orochimaru',
        series: 'Naruto / Boruto',
        videoId: 'E-IQjy1RxsI',
        startSeconds: 2,
        endSeconds: 22,
        options: ['Orochimaru', 'Kabuto Yakushi', 'Jiraiya', 'Tsunade'],
        difficulty: 'zor',
        hint: {
            tr: 'Efsane üç büyücüden biri; ölümsüzlük için bedenini bırakıp durur.',
            en: 'One of the legendary Sannin — the snake who jumps from body to body in pursuit of immortality.',
            ja: '伝説の三忍の一人。死体を乗り換え続ける蛇。',
            fr: "L'un des trois Sannin légendaires — le serpent qui change de corps à la recherche de l'immortalité.",
        },
    },
    {
        id: 'okkotsu-yuta-pv',
        name: 'Okkotsu Yuta',
        series: 'Jujutsu Kaisen',
        videoId: 'f1VVcjkzP4Q',
        startSeconds: 0,
        endSeconds: 20,
        options: ['Okkotsu Yuta', 'Yuji Itadori', 'Fushiguro Megumi', 'Fushiguro Toji'],
        difficulty: 'zor',
        hint: {
            tr: 'Özel sınıfın en güçlüsü; sevdiği kadının ruhuyla birlikte savaşan ikinci sınıf öğrenci.',
            en: 'The strongest of his generation, fighting shoulder to shoulder with the vengeful spirit of the woman he loved.',
            ja: '特級呪術師。愛する者をつなぎ止める呪霊と共に戦う二年生。',
            fr: "Le sorcier de grade spécial qui se bat aux côtés de l'esprit vengeur lié à la femme qu'il aimait.",
        },
    },
    {
        id: 'zenenin-naoya-pv',
        name: 'Zenin Naoya',
        series: 'Jujutsu Kaisen',
        videoId: 'zVtYVDcYb_Q',
        startSeconds: 0,
        endSeconds: 15,
        options: ['Zenin Naoya', 'Inumaki Toge', 'Kamo Kentoshi', 'Todo Aoi'],
        difficulty: 'zor',
        hint: {
            tr: 'Zen-in ailesinin son dehası; kız kardeşinin hızıyla yarışırken giderek herkesin unuttuğu adam.',
            en: 'The last genius of the Zenin clan — the faster his technique goes, the more he is forgotten.',
            ja: '禪院家最後の天才。速さを追えば追うほど、皆に忘れられる。',
            fr: "Le dernier génie du clan Zenin — plus sa technique va vite, plus il s'efface des mémoires.",
        },
    },
    {
        id: 'kenjaku-pv',
        name: 'Kenjaku',
        series: 'Jujutsu Kaisen',
        videoId: 'v4B0SHoPFYs',
        startSeconds: 0,
        endSeconds: 15,
        options: ['Kenjaku', 'Geto Suguru', 'Kamo Noritoshi', 'Toji Fushiguro'],
        difficulty: 'zor',
        hint: {
            tr: 'Bin yılın hayaleti; gerçek adı Kamo Noritoshi.',
            en: 'The sorcerer who outlives centuries — his true name is Kamo Noritoshi.',
            ja: '千年以上を生きる術師。真の姿は加茂憲倫。',
            fr: "Le sorcier que les siècles n'auront pas eu — son nom véritable est Kamo Noritoshi.",
        },
    },
    {
        id: 'kochou-shinobu-pv',
        name: 'Kochou Shinobu',
        series: 'Demon Slayer: Kimetsu no Yaiba',
        videoId: 'ZRj8up3hkys',
        startSeconds: 0,
        endSeconds: 16,
        options: ['Kochou Shinobu', 'Mitsuri Kanroji', 'Kanae Kochou', 'Kanao Tsuyuri'],
        difficulty: 'zor',
        hint: {
            tr: 'Böcek Sütunu’nun küçük kız kardeşi; yüzünde daimi bir gülümseme var.',
            en: 'The Insect Hashira who smiles at everyone equally — and who treats none of them as her equal.',
            ja: '蟲柱の姉。常に微笑むが、その瞳は人と鬼を区別しない。',
            fr: "La Pilier des Insectes, souriante envers tout le monde — et ne traitant personne sur un pied d'égalité.",
        },
    },
    {
        id: 'denji-pv',
        name: 'Denji',
        series: 'Chainsaw Man',
        videoId: 'j7L9BA7JJ-E',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Denji', 'Power', 'Aki Hayakawa', 'Himeno'],
        difficulty: 'kolay',
        hint: {
            tr: 'Çoğu zaman naif ve komik ama gerektiğinde en tehlikeli şeylere gülümseyen genç bir erkek.',
            en: 'A young man who is naive and funny, but smiles in the face of the most dangerous things.',
            ja: '普段は素朴でおどけた少年だが、最も恐ろしいものにも笑みを浮かべる。',
            fr: "Un jeune homme naïf et drôle, qui sourit même face aux choses les plus dangereuses."
        }
    },
    {
        id: 'power-pv',
        name: 'Power',
        series: 'Chainsaw Man',
        videoId: 'hUA2Evb8pHw',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Power', 'Denji', 'Makima', 'Aki Hayakawa'],
        difficulty: 'kolay',
        hint: {
            tr: 'Kendini zeki sanan, bağırarak konuşan ve kan dolu kimliğini hiçbir zaman gizlemeyen bir Blood Fiend.',
            en: 'The Blood Fiend who shouts, thinks she is a genius, and hides nothing of her chaotic nature.',
            ja: '叫び声を上げ、自分を天才だと思い、血の悪魔であることを隠さない。',
            fr: "Le démon du sang qui crie, se croit un génie et cache complètement son chaos."
        }
    },
    {
        id: 'pochita-pv',
        name: 'Pochita',
        series: 'Chainsaw Man',
        videoId: '6IyGq0pLxRo',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Pochita', 'Denji', 'Makima', 'Power'],
        difficulty: 'kolay',
        hint: {
            tr: 'Testere burnuna çıkardığı, Denji ile bütünleşmiş yaşlımsı ve köpek gibi yakın bir dost olan Chainsaw Devil.',
            en: 'The Chainsaw Devil himself — the loyal, saw-nosed companion of Denji.',
            ja: 'デンジと一体化した、ノコギリの鼻を持つチェンソーの悪魔本人。',
            fr: "Le Démon-tronçonneuse lui-même — le compagnon fidèle au nez de tronçonneuse de Denji."
        }
    },
    {
        id: 'aki-pv',
        name: 'Aki Hayakawa',
        series: 'Chainsaw Man',
        videoId: 'EuSHpwcU1yg',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Aki Hayakawa', 'Denji', 'Kishibe', 'Power'],
        difficulty: 'orta',
        hint: {
            tr: 'Her şeyi ciddiye alan, yüzü hep katı duran, kayıpları onu en sessiz intikamcıya dönüştüren bir genç.',
            en: 'The straight-faced young man with a cold attitude, disciplined and carrying heavy losses.',
            ja: '表情の硬い青年で、多くの喪失を経験してきた冷静沈着な復讐者。',
            fr: "Le jeune homme au visage austère, discipliné et droit, qui cache de profondes pertes."
        }
    },
    {
        id: 'himeno-pv',
        name: 'Himeno',
        series: 'Chainsaw Man',
        videoId: 'Xa8c3ZQLAec',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Himeno', 'Aki Hayakawa', 'Kobeni Higashiyama', 'Makima'],
        difficulty: 'orta',
        hint: {
            tr: 'Sigarasını ağzından hiç eksik etmeyen, kardeşi gibi gördüğü Aki için her şeyi yapan Ghost Devil.',
            en: 'The Ghost Devil who never leaves her cigarette and does everything for Aki, whom she sees as a brother.',
            ja: 'タバコを離さず、自分より弱い存在を守る幽霊の悪魔。アキのためには何でもする。',
            fr: "Le Démon-esprit qui ne quitte jamais sa cigarette et serait prêt à tout pour Aki, qu'elle considère comme un frère."
        }
    },
    {
        id: 'kobeni-pv',
        name: 'Kobeni Higashiyama',
        series: 'Chainsaw Man',
        videoId: 'oU2mU8H-M5A',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Kobeni Higashiyama', 'Himeno', 'Aki Hayakawa', 'Power'],
        difficulty: 'zor',
        hint: {
            tr: 'Sürekli ağlayan ama devasa yıllık dürtüye sahip, hayatını korumak için her şeyi yapan devil hunter.',
            en: 'The salary-man devil hunter who cries constantly but survives in impossible situations.',
            ja: '常に泣き続けるサラリーマン悪魔ハンター。極限状態でも生き残る。',
            fr: "Le tueur de démons en costume qui pleure tout le temps mais survit à toutes les situations."
        }
    },
    {
        id: 'makima-pv',
        name: 'Makima',
        series: 'Chainsaw Man',
        videoId: 'UOsl9kTJK6k',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Makima', 'Power', 'Himeno', 'Kobeni Higashiyama'],
        difficulty: 'zor',
        hint: {
            tr: 'Gülümsemesi hiç yüzünden eksik olmayan, herkese çok sevecen davranan ama içinden dehşet yayan bir kadın.',
            en: 'The terrifyingly calm woman who always smiles but hides something unspeakable behind it.',
            ja: '常に微笑みを絶やさないが、瞳の中に決して語れぬ何かを持つ女性。',
            fr: "La femme à l'éternel sourire qui semble si douce, mais au fond de ses yeux se cache quelque chose d'inimaginable."
        }
    },
];

export const scoreFor = (clipId: string, streak: number): number => {
    const clip = VOICE_CLIPS.find((c) => c.id === clipId);
    const base = clip?.difficulty === 'zor' ? 300 : clip?.difficulty === 'orta' ? 200 : 100;
    return base + streak * 10;
};

export const getRound = (count = 10): VoiceClip[] => {
    return [...VOICE_CLIPS]
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map((clip) => ({ ...clip, options: shuffleOptions(clip.options) }));
};

/** Şıkları Fisher–Yates ile karıştırır — doğru cevap hep aynı sırada kalmasın. */
const shuffleOptions = (options: readonly string[]): [string, string, string, string] => {
    const result = [...options];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result as [string, string, string, string];
};
