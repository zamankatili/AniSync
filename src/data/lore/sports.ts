import { WorldLore } from './types';

export const sportsLore: WorldLore = {
  worldId: 'sports',
  summary: 'Takım ruhu, azim ve rekabetin ön planda olduğu spor dünyası. Voleybol, basketbol, futbol ve diğer sporlar. Antrenman, maçlar, turnuvalar ve takım dinamikleri. Hiçbir süper güç yok; sadece azim ve yetenek.',
  history: 'Spor anime türü, azim ve takım çalışmasını merkeze alır. Haikyuu!! (voleybol), Kuroko no Basket (basketbol), Blue Lock (futbol), Slam Dunk (basketbol), Yuri on Ice (buz pateni), Free! (yüzme) türün temel taşlarıdır. "Spokon" (spor + konjou/azim) alt türü.',
  powerSystem: {
    name: 'Fiziksel Yetenek / Teknik / Taktik',
    description: 'Güç sistemi yoktur. İlerleme fiziksel antrenman, teknik mükemmelleştirme ve taktik zeka ile ölçülür. "Zone" (akma durumu), "flow state" sporcu performansının zirvesi.',
    ranks: ['Acemi', 'Orta Seviye', 'Lise Takımı', 'Bölgesel', 'Ulusal', 'Profesyonel']
  },
  factions: [
    { name: 'Okul Takımı', description: 'Lise spor takımı. Antrenman ve maçlar.', alignment: 'good' },
    { name: 'Rakip Okullar', description: 'Bölge ve ulusal turnuvalardaki rakipler.', alignment: 'neutral' },
    { name: 'Milli Takım', description: 'Ülke temsili. En üst seviye.', alignment: 'good' },
    { name: 'Profesyonel Kulüp', description: 'Profesyonel spor kulüpleri.', alignment: 'neutral' }
  ],
  locations: [
    { name: 'Spor Salonu', description: 'Antrenman mekanı. Kondisyon ve teknik.', dangerLevel: 'low' },
    { name: 'Maç Sahası', description: 'Resmi maçlar. Turnuva atmosferi.', dangerLevel: 'low' },
    { name: 'Antrenman Kampı', description: 'Yaz kampı. Yoğun antrenman.', dangerLevel: 'low' },
    { name: 'Turnuva Arenası', description: 'Büyük turnuvalar. Ulusal/uluslararası.', dangerLevel: 'low' }
  ],
  notableCharacters: [
    { name: 'Shoyo Hinata', role: 'Haikyuu!! - Orta blokör, sıçrayıcı', powerLevel: 75 },
    { name: 'Tobio Kageyama', role: 'Haikyuu!! - Pasör, deha', powerLevel: 85 },
    { name: 'Tetsuya Kuroko', role: 'Kuroko no Basket - Misdirection', powerLevel: 70 },
    { name: 'Seijuro Akashi', role: 'Kuroko no Basket - İmparatorluk Gözü', powerLevel: 90 },
    { name: 'Yoichi Isagi', role: 'Blue Lock - Egoist forvet', powerLevel: 80 },
    { name: 'Hanamichi Sakuragi', role: 'Slam Dunk - Çaylak, potansiyel', powerLevel: 60 }
  ],
  keyEvents: [
    'Takıma katılma',
    'İlk maç',
    'Bölge turnuvası',
    'Ulusal turnuva',
    'Rakip ile karşılaşma',
    'Mezuniyet / kariyer kararı'
  ],
  themes: ['Azim', 'Takım Çalışması', 'Rekabet', 'Büyüme', 'Dostluk', 'Kaybetmek ve Öğrenmek', 'Tutku'],
  sourceSeries: ['Haikyuu!!', 'Kuroko no Basket', 'Blue Lock', 'Slam Dunk', 'Yuri on Ice', 'Free!', 'Ace of Diamond']
};