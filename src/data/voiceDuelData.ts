/**
 * KİM BU KARAKTER? — ses tanıma verisi.
 *
 * Tüm klipler **resmi** kanallardan gelir:
 *   Madoka Exedra [Official] — https://www.youtube.com/@madoka_exedra
 *
 * YouTube iframe API'siyle yalnızca ilgili klip, başlangıç/bitiş zamanlarıyla oynatılır.
 * Görüntü/puanlar AniList/MAL'den alınmaz (hot-link); yalnız metin gösterilir.
 */
export interface VoiceClip {
    id: string;
    name: string;
    series: string;
    videoId: string;
    startSeconds: number;
    endSeconds: number;
    options: [string, string, string, string];
    difficulty: 'kolay' | 'orta' | 'zor';
    hint: string;
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
        hint: 'Ana karakter. Umut dolu, istifini bozmayan bir kız — kermesteyi kabul ediyor olabilir.'
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
        hint: 'Güç ve adalet — "şunu ekiplerim doyursun" diyen kızıl tırtıl.'
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
        hint: 'Karamel sarı saçlı alveter reenak — mahallenin muhafızı, sizi kurtaran sesi.'
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
        hint: 'Alevli delici kız — yiyecek dilencilikliği, sade gaya da karsın.'
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
        hint: 'Beyaz cilt, mor saç — geçmişe dönüşüm, tasiye bir kuvvetin sesi.'
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
        hint: 'Ne olduğunu kaybetmiş bir kız — ama kardeşleri için bir şeyler parlak tutuyor.'
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
        hint: 'Becerikli, gözden kaçan küçük bir kız — sesi yumuşak ama sözleri keskin.'
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
        hint: 'Bu karakterin adı sorulur, her cevaplar da böyle kazanır: anlamları sıkı, ulvi, kader ve fedakârlık.'
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
        hint: 'Sesi coşkulu, çocuğun cesuru bir kalp.'
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
        hint: 'Bu dizinin yıldızı—yukarıda, yeterince parlak.'
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
