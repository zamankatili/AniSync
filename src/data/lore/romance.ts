import { WorldLore } from './types';

export const romanceLore: WorldLore = {
  worldId: 'romance_drama',
  summary: 'Duygusal bağlar, aşk, kayıp ve insan ilişkilerinin derinlemesine işlendiği bir dünya. Romantik komedi, dram ve slice of life karışımı. Karakter gelişimi ve duygusal olgunlaşma merkezde.',
  history: 'Romantik anime türü, insan ilişkilerini ve duygusal gelişimi merkeze alır. Your Lie in April (müzik ve aşk), Clannad (aile ve kayıp), Toradora (tsundere ve aşk), Fruits Basket (lanet ve aile), Kaguya-sama (zeka oyunları ve aşk), Horimiya (gizli kimlikler) türün temel taşlarıdır.',
  powerSystem: {
    name: 'Yok (Duygusal/İnsani)',
    description: 'Güç sistemi yoktur. İlerleme duygusal olgunlaşma, iletişim becerileri ve ilişkilerle ölçülür. "Tsundere", "kuudere", "dandere" gibi arketipler.',
    ranks: ['Çocuk', 'Ergen', 'Genç Yetişkin', 'Yetişkin', 'Yaşlı']
  },
  factions: [
    { name: 'Okul (Lise)', description: 'Romantik hikayelerin en yaygın ortamı. Sınıf arkadaşları, kulüpler.', alignment: 'neutral' },
    { name: 'Aile', description: 'Aile bağları, ebeveyn-çocuk ilişkileri. Clannad\'ın merkezi.', alignment: 'good' },
    { name: 'Arkadaş Grubu', description: 'Sosyal çevre ve destek sistemi.', alignment: 'good' },
    { name: 'Rakip (Love Rival)', description: 'Aşk üçgenindeki rakip. Dram kaynağı.', alignment: 'neutral' }
  ],
  locations: [
    { name: 'Lise', description: 'Sınıf, kulüp odası, çatı. Romantik anların mekanı.', dangerLevel: 'low' },
    { name: 'Müzik Odası', description: 'Your Lie in April tarzı piyano/müzik odaları.', dangerLevel: 'low' },
    { name: 'Festival Alanı', description: 'Okul festivali, yaz festivali (matsuri). Romantik anlar.', dangerLevel: 'low' },
    { name: 'Eve Giden Yol', description: 'Okuldan eve yürüyüş. İtirafların yapıldığı yer.', dangerLevel: 'low' }
  ],
  notableCharacters: [
    { name: 'Kousei Arima', role: 'Piyano dehası, travma', powerLevel: 15 },
    { name: 'Kaori Miyazono', role: 'Keman virtüözü, özgür ruh', powerLevel: 20 },
    { name: 'Tomoya Okazaki', role: 'Clannad protagonist, aile babası', powerLevel: 25 },
    { name: 'Nagisa Furukawa', role: 'Tomoya\'nın eşi, oyuncu', powerLevel: 15 },
    { name: 'Taiga Aisaka', role: 'Tsundere, Palmtop Tiger', powerLevel: 30 },
    { name: 'Ryuji Takasu', role: 'Taiga\'nın partneri', powerLevel: 25 },
    { name: 'Kaguya Shinomiya', role: 'Zeka oyunları, aşk', powerLevel: 40 },
    { name: 'Miyuki Shirogane', role: 'Öğrenci konseyi başkanı', powerLevel: 45 }
  ],
  keyEvents: [
    'İlk görüşme / tanışma',
    'Aşk itirafı (kokuhaku)',
    'Okul festivali',
    'Mezuniyet',
    'Kayıp ve yas (Clannad)',
    'Müzik performansı (Your Lie in April)'
  ],
  themes: ['Aşk', 'Kayıp', 'Büyüme', 'Aile', 'Müzik', 'İletişim', 'Duygusal Olgunlaşma', 'Geçmişin Gölgesi'],
  sourceSeries: ['Your Lie in April', 'Clannad', 'Toradora', 'Fruits Basket', 'Kaguya-sama', 'Horimiya', 'Violet Evergarden']
};