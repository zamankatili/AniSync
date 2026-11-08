import { WorldLore } from './types';

export const isekaiLore: WorldLore = {
  worldId: 'isekai',
  summary: 'Modern dünyadan başka bir dünyaya reenkarnasyon veya ışınlanma. Güç sistemleri, maceralar ve kaderin belirsizliği. Oyun mekanikleri (level, skill, inventory) gerçek hayata karışır.',
  history: 'İsekai türü, "başka dünya" kavramından doğdu. Re:Zero (ölümle geri dönüş), Konosuba (komedi isekai), Overlord (MMO dünyasında sıkışıp kalma), That Time I Got Reincarnated as a Slime (slime reenkarnasyonu), Sword Art Online (VRMMO tuzağı) ve Mushoku Tensei (reenkarnasyon + büyü) türün temel taşlarıdır.',
  powerSystem: {
    name: 'Level / Skill / Magic / Job Class',
    description: 'Oyun mekanikleri: level atlama, skill ağacı, job class seçimi, inventory, stat puanları. Büyü (elemental, kutsal, karanlık), kılıç teknikleri, summon. Reenkarnasyon bonusları (önceki hayatın anıları).',
    ranks: ['Level 1 (Başlangıç)', 'Level 10-30 (Orta)', 'Level 50-70 (Uzman)', 'Level 90+ (Efsane)', 'Demon Lord / Hero']
  },
  factions: [
    { name: 'Adventurer\'s Guild', description: 'Macera loncası. Görevler, rank sistemi (F-E-D-C-B-A-S).', alignment: 'neutral' },
    { name: 'Demon Lord Army', description: 'Şeytan Lord\'un ordusu. Boss ve generaller.', alignment: 'evil' },
    { name: 'Hero Party', description: 'Kahraman ve yoldaşları. Şeytan Lord\'u yenmek için.', alignment: 'good' },
    { name: 'Merchant Guild', description: 'Tüccar loncası. Ekonomi ve ticaret.', alignment: 'neutral' },
    { name: 'Magic Academy', description: 'Büyü okulu. Araştırma ve eğitim.', alignment: 'good' },
    { name: 'Church / Holy Order', description: 'Kutsal düzen. İyileştirme ve kutsal büyü.', alignment: 'good' }
  ],
  locations: [
    { name: 'Başlangıç Köyü', description: 'Macera başlangıç noktası. Güvenli bölge.', dangerLevel: 'low' },
    { name: 'Krallık Başkenti', description: 'Siyasi merkez. Saray, lonca, pazar.', dangerLevel: 'medium' },
    { name: 'Zindan (Dungeon)', description: 'Canavarlar ve hazineler. Level atlama yeri.', dangerLevel: 'high' },
    { name: 'Şeytan Lord Kalesi', description: 'Final boss bölgesi. En tehlikeli.', dangerLevel: 'extreme' },
    { name: 'Elf Ormanı', description: 'Elf krallığı. Büyü ve doğa.', dangerLevel: 'medium' }
  ],
  notableCharacters: [
    { name: 'Subaru Natsuki', role: 'Return by Death yeteneği', powerLevel: 40 },
    { name: 'Kazuma Satou', role: 'Şanssız maceracı, Chunchunmaru', powerLevel: 55 },
    { name: 'Rimuru Tempest', role: 'Slime reenkarnasyonu, Demon Lord', powerLevel: 95 },
    { name: 'Ainz Ooal Gown', role: 'Overlord, undead büyülü', powerLevel: 98 },
    { name: 'Rudeus Greyrat', role: 'Mushoku Tensei protagonist, büyü dehası', powerLevel: 80 },
    { name: 'Kirito', role: 'Sword Art Online, Dual Wield', powerLevel: 85 }
  ],
  keyEvents: [
    'Reenkarnasyon / ışınlanma',
    'İlk görev (tutorial)',
    'Job class seçimi',
    'Lonca kaydı',
    'Şeytan Lord ile karşılaşma',
    'Dünya kurtarma (veya yok etme)'
  ],
  themes: ['Yeniden Başlangıç', 'Güçlenme', 'Macera', 'Kader', 'Seçim', 'İkinci Şans'],
  sourceSeries: ['Re:Zero', 'Konosuba', 'Overlord', 'That Time I Got Reincarnated as a Slime', 'Sword Art Online', 'Mushoku Tensei', 'No Game No Life']
};