import { WorldLore } from './types';

export const cyberpunkLore: WorldLore = {
  worldId: 'cyberpunk',
  summary: 'Teknoloji, siber suç, yapay zeka ve distopik toplumların hüküm sürdüğü gelecek dünya. İnsan ve makine arasındaki çizgi bulanık. Siberpsikoz, megacorp\'lar, sokak samurayları.',
  history: 'Cyberpunk dünyası, megacorp\'ların hükümetlerin yerini aldığı distopik bir gelecekte geçer. Night City (Cyberpunk 2077) sokak çeteleri ve corp savaşları. Psycho-Pass\'te Sibyl System suç katsayısı ölçer. Ghost in the Shell\'de siber beyin ve hayalet (ghost) kavramı. Akira\'da neo-Tokyo ve psionik güçler.',
  powerSystem: {
    name: 'Cyberware / Netrunning / Psionik',
    description: 'Cyberware (siber implantlar): güç, hız, refleks artırımı. Netrunning: ağda gezinme, hack. Psionik: Akira tarzı telekinezi. Siberpsikoz riski: çok fazla implant = akıl sağlığı kaybı.',
    ranks: ['Sokak Çocuğu', 'Edgerunner', 'Netrunner', 'Cyberpsycho', 'Legend (Johnny Silverhand)']
  },
  factions: [
    { name: 'Arasaka', description: 'Cyberpunk\'ta Japon megacorp. Silah ve güvenlik.', alignment: 'evil' },
    { name: 'Militech', description: 'Amerikan megacorp. Askeri teknoloji.', alignment: 'evil' },
    { name: 'Sokak Çeteleri (Maelstrom, Tyger Claws, Valentinos)', description: 'Night City\'nin sokak çeteleri.', alignment: 'neutral' },
    { name: 'Netwatch', description: 'Ağ güvenliği örgütü. Netrunner\'ları avlar.', alignment: 'neutral' },
    { name: 'Psycho-Pass Sibyl System', description: 'Suç katsayısı ölçen AI sistem. Toplumu kontrol eder.', alignment: 'neutral' },
    { name: 'Section 9', description: 'Ghost in the Shell\'de anti-terör birimi.', alignment: 'good' }
  ],
  locations: [
    { name: 'Night City', description: 'Cyberpunk 2077\'nin şehri. Watson, Westbrook, Heywood, Santo Domingo, Pacifica.', dangerLevel: 'extreme' },
    { name: 'Neo-Tokyo', description: 'Akira\'nın distopik Tokyo\'su. Psionik güçler.', dangerLevel: 'high' },
    { name: 'Tokyo (Psycho-Pass)', description: 'Sibyl System\'in kontrolündeki şehir.', dangerLevel: 'medium' },
    { name: 'Niihama (Ghost in the Shell)', description: 'Siber beyin ve hayalet dünyası.', dangerLevel: 'medium' }
  ],
  notableCharacters: [
    { name: 'V', role: 'Mercenary, Relic implant', powerLevel: 85 },
    { name: 'Johnny Silverhand', role: 'Rockerboy, terörists', powerLevel: 70 },
    { name: 'Motoko Kusanagi', role: 'Major, siber beyin', powerLevel: 90 },
    { name: 'Akane Tsunemori', role: 'Müfettiş, Sibyl System', powerLevel: 60 },
    { name: 'Kaneda', role: 'Biker gang lideri', powerLevel: 65 },
    { name: 'Tetsuo', role: 'Psionik güçler', powerLevel: 95 }
  ],
  keyEvents: [
    'Arasaka Tower saldırısı',
    'Siberpsikoz salgını',
    'Netwatch operasyonları',
    'Akira\'nın uyanışı',
    'Sibyl System\'in ifşası'
  ],
  themes: ['Teknoloji', 'Kimlik', 'Distopya', 'İnsanlık', 'Kontrol', 'Özgürlük', 'Siberpsikoz'],
  sourceSeries: ['Cyberpunk 2077', 'Ghost in the Shell', 'Psycho-Pass', 'Akira', 'Cowboy Bebop', 'Serial Experiments Lain']
};