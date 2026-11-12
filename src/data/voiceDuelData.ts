/**
 * KİM BU KARAKTER? — ses tanıma verisi.
 *
 * Tüm klipler **resmi** kanallardan gelir:
 *   Madoka Exedra [Official] — https://www.youtube.com/@madoka_exedra
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
        id: 'madoka-kaname-pv',
        name: 'Madoka Kaname',
        series: 'Puella Magi Madoka Magica',
        videoId: 'iiSnjdyZx2o',
        startSeconds: 1,
        endSeconds: 18,
        options: ['Madoka Kaname', 'Sayaka Miki', 'Mami Tomoe', 'Kyoko Sakura'],
        difficulty: 'kolay',
        hint: {
            tr: 'Ana karakter. Umut dolu, nazik ve başkaları için dilek dilemeye hazır.',
            en: 'The main character. Hopeful, gentle, and willing to make a wish for others.',
            ja: '主人公。希望に満ちた優しい少女で、他人のために願いを捧げようとします。',
            fr: "L'héroïne. Pleine d'espoir, douce et prête à faire un vœu pour les autres."
        }
    },
    {
        id: 'sayaka-miki-pv',
        name: 'Sayaka Miki',
        series: 'Puella Magi Madoka Magica',
        videoId: 'ybYdGnHiNmU',
        startSeconds: 1,
        endSeconds: 20,
        options: ['Sayaka Miki', 'Madoka Kaname', 'Kyoko Sakura', 'Iroha Tamaki'],
        difficulty: 'kolay',
        hint: {
            tr: 'Adalet için savaşan ve doğru olanı yapmaya inanan bir kız.',
            en: 'A girl who fights for justice and believes in doing what is right.',
            ja: '正義のために戦い、正しいことを信じる少女。',
            fr: 'Une fille qui se bat pour la justice et croit faire ce qui est juste.'
        }
    },
    {
        id: 'mami-tomoe-pv',
        name: 'Mami Tomoe',
        series: 'Puella Magi Madoka Magica',
        videoId: '7XF6PdyXRRA',
        startSeconds: 3,
        endSeconds: 25,
        options: ['Mami Tomoe', 'Madoka Kaname', 'Sana Futaba', 'Oriko Mikuni'],
        difficulty: 'orta',
        hint: {
            tr: 'Altın sarısı bukleleri olan, sakin ve koruyucu sesli deneyimli bir büyü kızı.',
            en: 'A composed senior magical girl with golden curls and a warm, protective voice.',
            ja: '金色の巻き毛を持つ、落ち着いた保護的な声の先輩魔法少女。',
            fr: 'Une magical girl expérimentée aux boucles dorées, calme et protectrice.'
        }
    },
    {
        id: 'kyoko-sakura-pv',
        name: 'Kyoko Sakura',
        series: 'Puella Magi Madoka Magica',
        videoId: 'vEXvJV4M7QU',
        startSeconds: 1,
        endSeconds: 20,
        options: ['Kyoko Sakura', 'Iroha Tamaki', 'Sayaka Miki', 'Oriko Mikuni'],
        difficulty: 'orta',
        hint: {
            tr: 'Ateşli, yemeyi seven, sivri dilli ve sert görünüşlü bir savaşçı.',
            en: 'A fiery, food-loving fighter with a sharp tongue and a tough exterior.',
            ja: '炎のように熱く、食べることが好きな、毒舌で強気な戦士。',
            fr: 'Une combattante ardente et gourmande, à la langue acérée et au caractère dur.'
        }
    },
    {
        id: 'homura-akemi-pv',
        name: 'Homura Akemi',
        series: 'Puella Magi Madoka Magica',
        videoId: '-JrjjmNrOO8',
        startSeconds: 1,
        endSeconds: 25,
        options: ['Homura Akemi', 'Oriko Mikuni', 'Mami Tomoe', 'Madoka Kaname'],
        difficulty: 'zor',
        hint: {
            tr: 'Uzun koyu saçlı, soğukkanlı ve sesinde kayıp izleri taşıyan bir kız.',
            en: 'A cool, quiet girl with long dark hair and a voice tinged with loss.',
            ja: '長い黒髪のクールで静かな少女。声には喪失感が漂う。',
            fr: 'Une fille calme aux longs cheveux sombres, dont la voix trahit la perte.'
        }
    },
    {
        id: 'iroha-tamaki-pv',
        name: 'Iroha Tamaki',
        series: 'Puella Magi Magia Exedra',
        videoId: 'CC-ggjCq4_c',
        startSeconds: 1,
        endSeconds: 25,
        options: ['Iroha Tamaki', 'Sana Futaba', 'Sayaka Miki', 'Madoka Kaname'],
        difficulty: 'zor',
        hint: {
            tr: 'Kaybettiğini arayan, kız kardeşlerini koruyan nazik bir kız.',
            en: 'A gentle girl searching for what she has lost, protecting her younger sisters.',
            ja: '失ったものを探しながら妹たちを守る優しい少女。',
            fr: "Une fille douce qui cherche ce qu'elle a perdu et protège ses petites sœurs."
        }
    },
    {
        id: 'sana-futaba-pv',
        name: 'Sana Futaba',
        series: 'Puella Magi Magia Exedra',
        videoId: 'u-xatxYH7D8',
        startSeconds: 2,
        endSeconds: 24,
        options: ['Sana Futaba', 'Iroha Tamaki', 'Kyoko Sakura', 'Mami Tomoe'],
        difficulty: 'zor',
        hint: {
            tr: 'Utangaç, gözlemci; sesi yumuşak ama sözleri keskin bir kız.',
            en: 'A shy, observant girl with a soft voice but sharp words.',
            ja: '内気で観察力のある少女。声は柔らかいが言葉は鋭い。',
            fr: 'Une fille timide et observatrice, à la voix douce mais aux mots acérés.'
        }
    },
    {
        id: 'oriko-mikuni-pv',
        name: 'Oriko Mikuni',
        series: 'Puella Magi Magia Exedra',
        videoId: '3fanVonPjfo',
        startSeconds: 0,
        endSeconds: 22,
        options: ['Oriko Mikuni', 'Madoka Kaname', 'Mami Tomoe', 'Sayaka Miki'],
        difficulty: 'zor',
        hint: {
            tr: 'Kader ve fedakârlık hissi taşıyan, sakin ve aristokratik bir ses.',
            en: 'A calm, aristocratic voice with a sense of fate and sacrifice.',
            ja: '運命と犠牲を感じさせる、落ち着いた気品ある声。',
            fr: 'Une voix calme et aristocratique, marquée par le destin et le sacrifice.'
        }
    },
    {
        id: 'sayaka-miki-pv-jp',
        name: 'Sayaka Miki',
        series: 'Puella Magi Madoka Magica',
        videoId: '3TLWNypt9_g',
        startSeconds: 1,
        endSeconds: 18,
        options: ['Sayaka Miki', 'Kyoko Sakura', 'Iroha Tamaki', 'Mami Tomoe'],
        difficulty: 'kolay',
        hint: {
            tr: 'Güçlü bir adalet duygusu taşıyan coşkulu bir ses.',
            en: 'An enthusiastic voice with a strong sense of justice.',
            ja: '強い正義感を感じさせる、熱意のある声。',
            fr: "Une voix enthousiaste portée par un fort sens de la justice."
        }
    },
    {
        id: 'madoka-kaname-pv-2',
        name: 'Madoka Kaname',
        series: 'Puella Magi Madoka Magica',
        videoId: 'bLy6AExK2VE',
        startSeconds: 0,
        endSeconds: 18,
        options: ['Madoka Kaname', 'Homura Akemi', 'Sana Futaba', 'Mami Tomoe'],
        difficulty: 'kolay',
        hint: {
            tr: 'Serinin merkezindeki parlak ve umut dolu ses.',
            en: 'The bright, hopeful voice at the heart of the series.',
            ja: '物語の中心にいる、明るく希望に満ちた声。',
            fr: "La voix lumineuse et pleine d'espoir au cœur de la série."
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
