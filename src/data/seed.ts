import type { Post, Reply } from '../lib/types';
import { FALLBACK_ALL, FALLBACK_ANIME } from './fallback';

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

const reply = (name: string, emoji: string, color: string, text: string, msAgo: number): Reply => ({
  id: `r-${Math.random().toString(36).slice(2, 9)}`,
  author: { name, emoji, color },
  text,
  createdAt: ago(msAgo),
});

const ref = (match: string) => {
  const media = FALLBACK_ALL.find((m) => m.title.toLocaleLowerCase('tr-TR').includes(match.toLocaleLowerCase('tr-TR')));
  if (!media) return undefined;
  return { id: media.id, title: media.title, cover: media.cover, type: media.type, year: media.year ?? null, score: media.score ?? null };
};

const frieren = FALLBACK_ANIME.find((m) => m.title.includes('Frieren'));

export function buildSeedPosts(): Post[] {
  const posts: Post[] = [
    {
      id: 'seed-1',
      clubId: 'sezonluk',
      author: { name: 'Elif', emoji: '🍵', color: '#e8a04c' },
      kind: 'sohbet',
      text: 'Frieren’i bitirdim ve iki gündür hiçbir şey izleyemiyorum. Böyle boşluklarda ne yapıyorsunuz? Hemen yeni bir şeye mi başlıyorsunuz, yoksa bekliyor musunuz?',
      createdAt: ago(1000 * 60 * 42),
      likes: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'],
      replies: [
        reply('Mert', '🎧', '#7fb069', 'Ben en az bir hafta bekliyorum. Acele edince hiçbir şey tat vermiyor.', 1000 * 60 * 33),
        reply('Deniz', '📖', '#c084fc', 'Boşluk dolmuyor, sadece yer değiştiriyor. Bir manga cildi aç, iyi geliyor.', 1000 * 60 * 21),
      ],
      ref: frieren
        ? { id: frieren.id, title: frieren.title, cover: frieren.cover, type: 'anime', year: frieren.year ?? null, score: frieren.score ?? null }
        : undefined,
    },
    {
      id: 'seed-2',
      clubId: 'coop-masasi',
      author: { name: 'Ada', emoji: '🎮', color: '#7fb069' },
      kind: 'ilerleme',
      text: 'Malenia’yı 47. denemede kestim. Ellerim titriyor, kimseye anlatamıyorum çünkü kimse anlamıyor. Buraya bırakıyorum.',
      createdAt: ago(1000 * 60 * 60 * 3),
      likes: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12'],
      replies: [reply('Kaan', '🌙', '#8b7cf6', '47 mi? Ben 60’ta bıraktım. Saygılar.', 1000 * 60 * 60 * 2)],
      ref: ref('Elden Ring'),
    },
    {
      id: 'seed-3',
      clubId: 'manga-kafesi',
      author: { name: 'Deniz', emoji: '📖', color: '#c084fc' },
      kind: 'inceleme',
      text: 'Chainsaw Man ikinci kısım hakkında kısa bir not: Fujimoto bu kez daha sessiz, daha acıtıcı yazıyor. Aksiyon azaldıkça karakterlerin yalnızlığı artıyor. Bence ilk kısımdan iyi.',
      createdAt: ago(1000 * 60 * 60 * 6),
      likes: ['c1', 'c2', 'c3', 'c4', 'c5'],
      replies: [],
      spoiler: true,
      ref: ref('Chainsaw Man'),
    },
    {
      id: 'seed-4',
      clubId: 'manga-kafesi',
      author: { name: 'Kaan', emoji: '🌙', color: '#8b7cf6' },
      kind: 'soru',
      text: 'Solo Leveling novel’ını okuyan var mı? Manhwa ile arasındaki fark gerçekten bu kadar mı? Başlamaya değer mi, yoksa manhwa yeterli mi?',
      createdAt: ago(1000 * 60 * 60 * 9),
      likes: ['d1', 'd2', 'd3'],
      replies: [
        reply('Selin', '✨', '#e07a5f', 'Novel daha detaylı ama manhwa’nın çizim keyfi başka. İkisi de yürür.', 1000 * 60 * 60 * 8),
      ],
      ref: ref('Solo Leveling'),
    },
    {
      id: 'seed-5',
      clubId: 'visual-novel',
      author: { name: 'Zeynep', emoji: '🕯️', color: '#d4a5a5' },
      kind: 'sohbet',
      text: 'Bu akşam Steins;Gate ilk bölümü birlikte izlesek mi? Saat 22:00 gibi. İlk kez izleyecek olan varsa spoiler yok, söz.',
      createdAt: ago(1000 * 60 * 60 * 14),
      likes: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'],
      replies: [
        reply('Ege', '🍜', '#e8a04c', 'Ben varım. Daha önce başlayıp bırakmıştım, bu kez sonuna kadar.', 1000 * 60 * 60 * 13),
      ],
      ref: ref('Steins;Gate'),
    },
    {
      id: 'seed-6',
      clubId: 'gece-kuslari',
      author: { name: 'Ege', emoji: '🍜', color: '#e8a04c' },
      kind: 'oneri',
      text: 'Kısa ve vurucu bir şey arıyorsanız: Sonny Boy. Anlamasanız da izleyin, sonra buraya gelin beraber anlamaya çalışırız.',
      createdAt: ago(1000 * 60 * 60 * 22),
      likes: ['f1', 'f2', 'f3', 'f4'],
      replies: [],
    },
    {
      id: 'seed-7',
      author: { name: 'Selin', emoji: '✨', color: '#e07a5f' },
      kind: 'sohbet',
      text: 'Rafımda 34 şey "sırada" bekliyor. Yeni bir şeye başlama isteğiyle bu listeyi kapatma isteği arasında sıkıştım. Hepimiz aynı değil miyiz?',
      createdAt: ago(1000 * 60 * 60 * 28),
      likes: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'],
      replies: [reply('Elif', '🍵', '#e8a04c', 'Ben artık "sırada"yı bir tür arşiv olarak kabul ettim. Huzur burada.', 1000 * 60 * 60 * 26)],
    },
    {
      id: 'seed-8',
      clubId: 'gece-kuslari',
      author: { name: 'Mert', emoji: '🎧', color: '#7fb069' },
      kind: 'oneri',
      text: 'Gece 2’de kulaklıkla dinlemek için: Made in Abyss OST. Hanezeve Caradhina’yı duyunca bütün o çizimler geri geliyor. Dikkat, işe yaramıyor.',
      createdAt: ago(1000 * 60 * 60 * 40),
      likes: ['h1', 'h2', 'h3', 'h4', 'h5'],
      replies: [],
    },
  ];
  return posts.map((p) => ({ ...p, seed: true }));
}
