import { WorldLore } from './types';

export const darkFantasyLore: WorldLore = {
  worldId: 'dark_fantasy',
  summary: 'Kaos, ölüm, ihanet ve hayatta kalma mücadelesinin hüküm sürdüğü karanlık bir dünya. Hiçbir güvenlik yok; her gün bir kayıp, her gün bir ihanet. Güç sistemleri (Berserk\'te mark, AoT\'te titan, Re:Zero\'da dönüş) acımasız.',
  history: 'Bu dünya, insanlığın karanlık yönlerini yansıtır. Ortaçağ Avrupa\'sı (Berserk) cadı avları ve şövalye savaşlarıyla. Titanlar (Attack on Titan) insanlığı duvarların içine hapsetti. Yeniden Doğuş (Re:Zero) ve Overlord karanlık güçleri merkeze alır. Made in Abyss derinliklerin korkusunu işler.',
  powerSystem: {
    name: 'Mark / Titan / Lanet / Abyss',
    description: 'Berserk\'te Brand of Sacrifice (kurban markası) kötü ruhları çeker. AoT\'te Titan güçleri (9 Titan) kalıtsal. Re:Zero\'da Return by Death (ölümle geri dönüş). Made in Abyss\'te Abyss\'in laneti (derinlik arttıkça dönüşüm).',
    ranks: ['Sıradan', 'İşaretli', 'Titan Shifter', 'Abyss Delver', 'Demon Lord']
  },
  factions: [
    { name: 'Band of the Hawk (Şahin Takımı)', description: 'Berserk\'te Griffith\'in paralı asker grubu. İhanetle sona erdi.', alignment: 'neutral' },
    { name: 'Survey Corps (Keşif Birliği)', description: 'AoT\'te duvar dışını keşfeden birlik. Yüksek ölüm oranı.', alignment: 'good' },
    { name: 'Military Police', description: 'AoT\'te iç güvenlik. Yozlaşmış.', alignment: 'neutral' },
    { name: 'Titans (Devler)', description: 'AoT\'te insan yiyen devler. Gizemli köken.', alignment: 'evil' },
    { name: 'Witch Cult', description: 'Re:Zero\'da cadıların takipçileri. Kaos ve ölüm.', alignment: 'evil' },
    { name: 'Abyss Delvers', description: 'Made in Abyss\'te derinlik kaşifleri.', alignment: 'neutral' }
  ],
  locations: [
    { name: 'Midland Krallığı', description: 'Berserk\'in ortaçağ Avrupa\'sı. Savaş ve ihanet.', dangerLevel: 'high' },
    { name: 'Paradis Adası (Duvarlar)', description: 'AoT\'te insanlığın son sığınağı. Maria/Rose/Sina duvarları.', dangerLevel: 'extreme' },
    { name: 'Marley', description: 'AoT\'te düşman ülke. Titan güçlerini elinde tutar.', dangerLevel: 'extreme' },
    { name: 'Abyss (Çukur)', description: 'Made in Abyss\'te sonsuz derinlik. Her katman daha tehlikeli.', dangerLevel: 'extreme' },
    { name: 'Lugunica Krallığı', description: 'Re:Zero\'nun krallığı. Siyasi entrika ve cadı kültü.', dangerLevel: 'high' }
  ],
  notableCharacters: [
    { name: 'Guts (Kara Kılıççı)', role: 'Berserker, Brand of Sacrifice taşıyıcısı', powerLevel: 95 },
    { name: 'Griffith (Femto)', role: 'God Hand üyesi, ihanetçi', powerLevel: 99 },
    { name: 'Eren Yeager', role: 'Saldırı Titanı, özgürlük savaşçısı', powerLevel: 92 },
    { name: 'Levi Ackerman', role: 'İnsanlığın en güçlü askeri', powerLevel: 90 },
    { name: 'Subaru Natsuki', role: 'Return by Death yeteneği', powerLevel: 40 },
    { name: 'Riko', role: 'Abyss Delver, Reg\'in arkadaşı', powerLevel: 30 }
  ],
  keyEvents: [
    'Eclipse (Berserk) - Griffith\'in ihaneti',
    'Shiganshina Savaşı (AoT)',
    'Rumbling (AoT) - dünya yıkımı',
    'Witch Cult saldırıları (Re:Zero)',
    'Abyss\'e iniş (Made in Abyss)'
  ],
  themes: ['İhanet', 'Hayatta Kalma', 'Kayıp', 'Karanlık', 'Özgürlük', 'Kurban', 'Trajedi'],
  sourceSeries: ['Berserk', 'Attack on Titan', 'Re:Zero', 'Made in Abyss', 'Overlord', 'Goblin Slayer']
};