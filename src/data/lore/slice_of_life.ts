import { WorldLore } from './types';

export const sliceOfLifeLore: WorldLore = {
  worldId: 'slice_of_life',
  summary: 'Huzurlu, barışçıl ve günlük yaşamın güzelliğini kutlayan bir dünya. Kamp, müzik, okul ve dostluk odaklı. Çatışma düşük, yaşam beklentisi yüksek. Yavaş tempolu, karakter odaklı hikayeler.',
  history: 'Bu dünya, modern Japon toplumunun günlük yaşamından ilham alır. Okul kulüpleri (K-On!, Yuru Camp), kafe kültürü (Blend S), müzik grupları (Bocchi the Rock!), köy yaşamı (Non Non Biyori) ve aile bağları (Usagi Drop) merkezdedir. İyileştirici (iyashikei) türün evrenidir.',
  powerSystem: {
    name: 'Yok (Gerçekçi Dünya)',
    description: 'Güç sistemi yoktur. Karakterler normal insanlar olarak yaşar: okul, iş, hobi, arkadaşlık. İlerleme sosyal beceriler ve kişisel gelişimle ölçülür.',
    ranks: ['Çocuk', 'Öğrenci', 'Yetişkin', 'Yaşlı']
  },
  factions: [
    { name: 'Okul Kulüpleri', description: 'Müzik, sanat, kamp, spor kulüpleri. Sosyal bağların temeli.', alignment: 'good' },
    { name: 'Aile', description: 'Çekirdek aile ve geniş aile. Destek sistemi.', alignment: 'good' },
    { name: 'Komşular', description: 'Mahalle ve topluluk ilişkileri.', alignment: 'good' },
    { name: 'İş Yeri', description: 'Çalışma hayatı ve meslektaşlar.', alignment: 'neutral' }
  ],
  locations: [
    { name: 'Okul', description: 'Lise/üniversite. Kulüp odaları, derslikler, kantin.', dangerLevel: 'low' },
    { name: 'Kamp Alanı', description: 'Yuru Camp tarzı doğa kampları. Fuji Dağı çevresi.', dangerLevel: 'low' },
    { name: 'Kafe', description: 'Blend S tarzı temalı kafeler. Müşteri etkileşimi.', dangerLevel: 'low' },
    { name: 'Küçük Kasaba', description: 'Non Non Biyori tarzı köy yaşamı. Sakin ve huzurlu.', dangerLevel: 'low' },
    { name: 'Müzik Stüdyosu', description: 'Bocchi the Rock! tarzı canlı müzik mekanları.', dangerLevel: 'low' }
  ],
  notableCharacters: [
    { name: 'Hitori Gotoh (Bocchi)', role: 'Sosyal fobik gitarist', powerLevel: 5 },
    { name: 'Rin Shima', role: 'Solo kampçı', powerLevel: 8 },
    { name: 'Yui Hirasawa', role: 'K-On! gitaristi', powerLevel: 6 },
    { name: 'Hotaru Ichijou', role: 'Köyden şehre taşınan çocuk', powerLevel: 4 }
  ],
  keyEvents: [
    'Okul festivali hazırlıkları',
    'Kamp gezisi (Fuji Dağı)',
    'Müzik grubu kurma',
    'Mezuniyet töreni',
    'Yaz festivali (matsuri)'
  ],
  themes: ['Dostluk', 'Büyüme', 'Huzur', 'Müzik', 'Doğa', 'Aile', 'Günlük Yaşam'],
  sourceSeries: ['K-On!', 'Yuru Camp', 'Bocchi the Rock!', 'Non Non Biyori', 'Usagi Drop', 'Blend S', 'Komi-san', 'Nichijou']
};