import { WorldLore } from './types';

export const shonenBattleLore: WorldLore = {
  worldId: 'shonen_battle',
  summary: 'Ninja, kılıç ustası ve şeytan avcılarının yaşadığı, sürekli çatışma ve güçlenme odaklı bir dünya. Güç sistemleri (Chakra, Haki, Nen, Lanetli Enerji) ile karakterler güçlenir; her gün bir savaş, her gün bir meydan okuma.',
  history: 'Bu dünya, güç sistemlerinin keşfedilmesiyle şekillendi. Ninja köyleri (Konoha, Suna, Kiri, Iwa, Kumo) tarihsel olarak birbirleriyle savaştı. Korsan çağında (One Piece) Grand Line keşfedildi. Ruh Avcıları (Bleach) ruhları arındırdı. Büyücüler (Jujutsu Kaisen) lanetli ruhlarla savaştı. Şeytan Avcıları (Demon Slayer) Taisho döneminde şeytanlarla mücadele etti.',
  powerSystem: {
    name: 'Chakra / Haki / Nen / Lanetli Enerji',
    description: 'Her seri kendi güç sistemine sahip: Naruto\'da Chakra (fiziksel+ruhsal enerji), One Piece\'te Haki (gözlem/silah/kraliyet), Hunter x Hunter\'da Nen (aura kontrolü), Jujutsu Kaisen\'de Lanetli Enerji, Demon Slayer\'da Nefes teknikleri.',
    ranks: ['Çırak', 'Genin/Orta', 'Chunin/Üst', 'Jonin/Elit', 'Kage/Yonko', 'Hashira/S-Class']
  },
  factions: [
    { name: 'Konoha (Gizli Yaprak)', description: 'Naruto evreninin köyü. Hokage liderliğinde. Ninja akademisi, genin/chunin/jonin sistemi.', alignment: 'good' },
    { name: 'Akatsuki', description: 'Naruto\'daki suç örgütü. Tailed beast\'leri toplamayı hedefler.', alignment: 'evil' },
    { name: 'Denizciler (Marines)', description: 'One Piece\'te dünya hükümetinin askeri gücü. Adalet ve disiplin.', alignment: 'neutral' },
    { name: 'Korsanlar (Pirates)', description: 'One Piece\'te özgürlük ve macera peşindeki gruplar. Yonko, Shichibukai, Supernova.', alignment: 'neutral' },
    { name: 'Soul Society (Ruh Topluluğu)', description: 'Bleach\'te ruhların dünyası. 13 Mahkeme Tugayı (Gotei 13).', alignment: 'good' },
    { name: 'Arrancar / Espada', description: 'Bleach\'te Hollow\'ların güçlenmiş hali. Aizen\'in ordusu.', alignment: 'evil' },
    { name: 'Jujutsu High', description: 'Jujutsu Kaisen\'de büyücülerin okulu. Gojo, Nanami, Maki vb.', alignment: 'good' },
    { name: 'Cursed Spirits', description: 'Jujutsu Kaisen\'de lanetli ruhlar. İnsan negatif duygularından doğar.', alignment: 'evil' },
    { name: 'Demon Slayer Corps', description: 'Demon Slayer\'da şeytan avcıları örgütü. Hashira (Sütun) liderliğinde.', alignment: 'good' },
    { name: 'Twelve Kizuki', description: 'Demon Slayer\'da Muzan\'ın en güçlü 12 şeytanı.', alignment: 'evil' }
  ],
  locations: [
    { name: 'Konoha (Gizli Yaprak Köyü)', description: 'Naruto\'nun köyü. Hokage Anıtı, Ninja Akademisi.', dangerLevel: 'medium' },
    { name: 'Kanton (Korsanlar Denizi)', description: 'One Piece\'te East Blue\'dan Grand Line\'a geçiş. Baratie, Arlong Park.', dangerLevel: 'high' },
    { name: 'Soul Society', description: 'Bleach\'te ruhların dünyası. Seireitei (Saf Ruh Mahallesi).', dangerLevel: 'high' },
    { name: 'Marley (Devler Ülkesi)', description: 'Attack on Titan\'da düşman ülke. Titan güçlerini elinde tutar.', dangerLevel: 'extreme' },
    { name: 'Jujutsu Lisesi', description: 'Jujutsu Kaisen\'de büyücülerin eğitim yeri. Tokyo metropolitan.', dangerLevel: 'medium' }
  ],
  notableCharacters: [
    { name: 'Naruto Uzumaki', role: 'Hokage adayı, Jinchuriki', powerLevel: 95 },
    { name: 'Monkey D. Luffy', role: 'Korsanlar Kralı adayı, Gomu Gomu no Mi', powerLevel: 90 },
    { name: 'Ichigo Kurosaki', role: 'Soul Reaper, Hollow güçleri', powerLevel: 88 },
    { name: 'Satoru Gojo', role: 'En güçlü büyücü, Altı Göz', powerLevel: 99 },
    { name: 'Tanjiro Kamado', role: 'Şeytan avcısı, Güneş Nefesi', powerLevel: 85 },
    { name: 'Eren Yeager', role: 'Saldırı Titanı, Özgürlük savaşçısı', powerLevel: 92 }
  ],
  keyEvents: [
    'Ninja Savaşları (Naruto)',
    'Marineford Savaşı (One Piece)',
    'Soul Society İstilası (Bleach)',
    'Shibuya Olayı (Jujutsu Kaisen)',
    'Sonsuz Tren (Demon Slayer)',
    'Paradis Adası Operasyonu (Attack on Titan)'
  ],
  themes: ['Güçlenme', 'Dostluk', 'Azim', 'Savaş', 'Kayıp', 'Özgürlük', 'İhanet'],
  sourceSeries: ['Naruto', 'One Piece', 'Bleach', 'Jujutsu Kaisen', 'Demon Slayer', 'Attack on Titan', 'Hunter x Hunter', 'My Hero Academia']
};