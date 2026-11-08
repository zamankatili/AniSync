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
  sourceSeries: ['K-On!', 'Yuru Camp', 'Bocchi the Rock!', 'Non Non Biyori', 'Usagi Drop', 'Blend S', 'Komi-san', 'Nichijou'],
  ja: {
    summary: '穏やかで平和な、日常の美しさを讃える世界。キャンプ、音楽、学校、友情が中心。対立は少なく、平均寿命は高い。ゆっくりとした、キャラクター重視の物語。',
    history: 'この世界は、現代日本社会の日常からインスピレーションを得ている。学校の部活（けいおん！、ゆるキャン△）、カフェ文化（ブレンド・S）、音楽バンド（ぼっち・ざ・ろっく！）、田舎暮らし（のんのんびより）、そして家族の絆（うさぎドロップ）が中心。癒し系（いやし系）ジャンルの世界。',
    powerSystem: {
      name: 'なし（現実的な世界）',
      description: 'パワーシステムは存在しない。キャラクターは普通の人間として生きる：学校、仕事、趣味、友情。成長は社交能力と個人的成長で測られる。',
      ranks: ['子供', '学生', '大人', '老人']
    },
    factions: [
      { name: '学校の部活', description: '音楽、美術、キャンプ、スポーツ部。社会的な絆の基盤。', alignment: 'good' },
      { name: '家族', description: '核家族と拡大家族。支え合う仕組み。', alignment: 'good' },
      { name: 'ご近所', description: '近所とコミュニティの関係。', alignment: 'good' },
      { name: '職場', description: '仕事と同僚。', alignment: 'neutral' }
    ],
    locations: [
      { name: '学校', description: '高校／大学。部室、教室、食堂。', dangerLevel: 'low' },
      { name: 'キャンプ場', description: 'ゆるキャン△風の自然キャンプ。富士山の周辺。', dangerLevel: 'low' },
      { name: 'カフェ', description: 'ブレンド・S風のテーマカフェ。お客さんとの交流。', dangerLevel: 'low' },
      { name: '小さな町', description: 'のんのんびより風の田舎暮らし。穏やかで平和。', dangerLevel: 'low' },
      { name: '音楽スタジオ', description: 'ぼっち・ざ・ろっく！風のライブハウス。', dangerLevel: 'low' }
    ],
    notableCharacters: [
      { name: '後藤ひとり（ぼっち）', role: '社交不安のギタリスト', powerLevel: 5 },
      { name: '志摩リン', role: 'ソロキャンパー', powerLevel: 8 },
      { name: '平沢唯', role: 'けいおん！のギタリスト', powerLevel: 6 },
      { name: '一条ほたる', role: '田舎から街に引っ越した子供', powerLevel: 4 }
    ],
    keyEvents: ['学園祭の準備', 'キャンプ旅行（富士山）', 'バンド結成', '卒業式', '夏祭り（祭り）'],
    themes: ['友情', '成長', '癒し', '音楽', '自然', '家族', '日常']
  },
  fr: {
    summary: 'Un monde paisible et tranquille qui célèbre la beauté du quotidien. Camping, musique, école et amitié au centre. Conflit faible, espérance de vie élevée. Des histoires lentes, centrées sur les personnages.',
    history: 'Ce monde s\'inspire du quotidien de la société japonaise moderne. Les clubs scolaires (K-On!, Yuru Camp), la culture des cafés (Blend S), les groupes de musique (Bocchi the Rock!), la vie à la campagne (Non Non Biyori) et les liens familiaux (Usagi Drop) au centre. C\'est le monde du genre iyashikei (apaisant).',
    powerSystem: {
      name: 'Aucun (monde réaliste)',
      description: 'Il n\'y a pas de système de pouvoir. Les personnages vivent comme des gens ordinaires : école, travail, passion, amitié. La progression se mesure par les compétences sociales et la croissance personnelle.',
      ranks: ['Enfant', 'Étudiant', 'Adulte', 'Personne âgée']
    },
    factions: [
      { name: 'Clubs scolaires', description: 'Clubs de musique, d\'art, de camping, de sport. La base des liens sociaux.', alignment: 'good' },
      { name: 'La famille', description: 'Famille proche et famille élargie. Système de soutien.', alignment: 'good' },
      { name: 'Les voisins', description: 'Relations de quartier et de communauté.', alignment: 'good' },
      { name: 'Le lieu de travail', description: 'La vie professionnelle et les collègues.', alignment: 'neutral' }
    ],
    locations: [
      { name: 'École', description: 'Lycée / université. Salle de club, salles de classe, cantine.', dangerLevel: 'low' },
      { name: 'Camping', description: 'Des camps dans la nature sur le modèle de Yuru Camp. Autour du mont Fuji.', dangerLevel: 'low' },
      { name: 'Café', description: 'Des cafés à thème sur le modèle de Blend S. Interactions avec les clients.', dangerLevel: 'low' },
      { name: 'Petite ville', description: 'La vie à la campagne sur le modèle de Non Non Biyori. Calme et paisible.', dangerLevel: 'low' },
      { name: 'Studio de musique', description: 'Des salles de concert sur le modèle de Bocchi the Rock!', dangerLevel: 'low' }
    ],
    notableCharacters: [
      { name: 'Hitori Gotoh (Bocchi)', role: 'Guitariste anxieuse socialement', powerLevel: 5 },
      { name: 'Rin Shima', role: 'Campeuse solitaire', powerLevel: 8 },
      { name: 'Yui Hirasawa', role: 'Guitariste de K-On!', powerLevel: 6 },
      { name: 'Hotaru Ichijou', role: 'Enfant déménagé de la campagne à la ville', powerLevel: 4 }
    ],
    keyEvents: ['Préparations du festival scolaire', 'Voyage de camping (mont Fuji)', 'Formation d\'un groupe', 'Cérémonie de fin', 'Festival d\'été (matsuri)'],
    themes: ['Amitié', 'Croissance', 'Paix', 'Musique', 'Nature', 'Famille', 'Vie quotidienne']
  }
};