import type { Club } from '../lib/types';

export const CLUBS: Club[] = [
  {
    id: 'gece-kuslari',
    name: 'Gece Kuşları',
    emoji: '🌙',
    tagline: 'Saat 00:00’dan sonra açılan sohbet.',
    description:
      'Gündüz izleyemediğin bölümleri gece izleyenlerin masası. Spoiler etiketine dikkat, gerisi serbest. Haftada bir "gece maratonu" yapıyoruz.',
    color: '#8b7cf6',
    cadence: 'Her gece · 00:00',
    members: 412,
  },
  {
    id: 'manga-kafesi',
    name: 'Manga Kafesi',
    emoji: '📚',
    tagline: 'Haftada bir cilt, birlikte okuyoruz.',
    description:
      'Her pazartesi yeni bir cilt seçiyoruz, hafta boyunca okuyup cuma akşamı konuşuyoruz. Ağır spoiler sadece "spoiler" etiketiyle.',
    color: '#e8a04c',
    cadence: 'Pazartesi · yeni cilt',
    members: 286,
  },
  {
    id: 'visual-novel',
    name: 'Visual Novel Odası',
    emoji: '🕯️',
    tagline: 'Metin okumak da oynamaktır.',
    description:
      'Steins;Gate, Umineko, VA-11 HALL-A... Ekran görüntüsü paylaşımı serbest, rota tartışmaları spoiler etiketiyle. Sessiz okuma saatleri de var.',
    color: '#c084fc',
    cadence: 'Çarşamba · okuma saati',
    members: 168,
  },
  {
    id: 'coop-masasi',
    name: 'Co-op Masası',
    emoji: '🎮',
    tagline: 'Birlikte oynamak için bir bahane.',
    description:
      'Lethal Company, Valheim, Monster Hunter... Akşam 21:00’de lobi kuranlar burada. "Sesim yok ama oynarım" diyenler de gelsin.',
    color: '#7fb069',
    cadence: 'Her akşam · 21:00',
    members: 341,
  },
  {
    id: 'sezonluk',
    name: 'Sezonluk Takip',
    emoji: '📺',
    tagline: 'Bu sezon ne izliyoruz?',
    description:
      'Yeni sezonun ilk üç bölüm izlenimleri, "bıraktım/devam" kararları ve bölüm bölüm notlar. Kaçırdığın şeyleri buradan yakalarsın.',
    color: '#e07a5f',
    cadence: 'Cuma · sezon özeti',
    members: 523,
  },
  {
    id: 'bos-sayfa',
    name: 'Boş Sayfa',
    emoji: '✍️',
    tagline: 'Kendi hikâyeni yaz.',
    description:
      'Fanfiction, deneme, çeviri, manga incelemesi... Yazmak isteyenler için sessiz bir köşe. Nazik eleştiri kültürü tek kuralımız.',
    color: '#d4a5a5',
    cadence: 'Ayda bir · fanzin',
    members: 97,
  },
];

export const clubById = (id: string): Club | undefined => CLUBS.find((c) => c.id === id);
