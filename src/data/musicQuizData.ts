export interface QuizSong {
  id: string;
  animeTitle: string;
  animeTitleTR: string;
  songTitle: string;
  artist: string;
  type: 'OP' | 'ED' | 'OST';
  themeNumber?: string; // e.g. "OP 1"
  year: number;
  studio: string;
  animeImage: string;
  audioUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  options: string[]; // 4 options
}

// Helper to shuffle array
export const shuffleList = <T>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const QUIZ_SONGS: QuizSong[] = [
  {
    id: 'song_demon_slayer_1',
    animeTitle: 'Demon Slayer: Kimetsu no Yaiba',
    animeTitleTR: 'Demon Slayer: Kimetsu no Yaiba',
    songTitle: 'Gurenge (紅蓮華)',
    artist: 'LiSA',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2019,
    studio: 'ufotable',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1286/99889l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/45/22/d7452274-6107-7ace-420b-1b509d55d067/mzaf_15546458713313472040.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Ufotable tarafından nefes kesen animasyonlarla uyarlandı.',
      'Kılıç kullanan ve kız kardeşini kurtarmak için savaşan bir genç.',
      '2019-2020 yıllarında global anime müzik listelerini kasıp kavurdu.'
    ],
    options: ['Jujutsu Kaisen', 'Demon Slayer: Kimetsu no Yaiba', 'Bleach', 'Dororo']
  },
  {
    id: 'song_aot_1',
    animeTitle: 'Attack on Titan (Shingeki no Kyojin)',
    animeTitleTR: 'Attack on Titan',
    songTitle: 'Guren no Yumiya (紅蓮の弓矢)',
    artist: 'Linked Horizon',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2013,
    studio: 'Wit Studio',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/47347l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a1/80/18/a18018c5-c9ec-404b-8131-209d9da31e7d/mzaf_16053807441322295049.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Devasa surların ardında hayatta kalmaya çalışan insanlık.',
      'Almanca görkemli koro vokalleriyle başlar.',
      'Eren Yeager ve Keşif Birliği efsanesi.'
    ],
    options: ['Kabaneri of the Iron Fortress', 'Vinland Saga', 'Attack on Titan (Shingeki no Kyojin)', 'Code Geass']
  },
  {
    id: 'song_jjk_1',
    animeTitle: 'Jujutsu Kaisen',
    animeTitleTR: 'Jujutsu Kaisen',
    songTitle: 'Kaikai Kitan (廻廻奇譚)',
    artist: 'Eve',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2020,
    studio: 'MAPPA',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1171/109222l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f5/4c/d5/f54cd59f-9e3a-6d98-1d2a-2d4759e53d8c/mzaf_4222491987450616275.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Lanetli parmakları yutan bir lise öğrencisinin hikayesi.',
      'MAPPA stüdyosunun en popüler modern başyapıtlarından biri.',
      'Gojo Satoru ve Tokyo Büyücülük Lisesi.'
    ],
    options: ['Chainsaw Man', 'Jujutsu Kaisen', 'Tokyo Ghoul', 'Noragami']
  },
  {
    id: 'song_tokyo_ghoul_1',
    animeTitle: 'Tokyo Ghoul',
    animeTitleTR: 'Tokyo Ghoul',
    songTitle: 'unravel',
    artist: 'TK from 凛として時雨',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2014,
    studio: 'Studio Pierrot',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1498/134443l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/47/d8/df/47d8df4c-f4ea-aa54-ca53-a7028c14e009/mzaf_10498383233375963447.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Ghul organı nakledilen Ken Kaneki.',
      'Piyano melodisi ve patlayıcı çığlık çığlığa vokal.',
      'Karanlık fantastik animelerin en ikonik şarkısı.'
    ],
    options: ['Parasyte -the maxim-', 'Tokyo Ghoul', 'Psycho-Pass', 'Deadman Wonderland']
  },
  {
    id: 'song_naruto_bluebird',
    animeTitle: 'Naruto Shippuden',
    animeTitleTR: 'Naruto Shippuden',
    songTitle: 'Blue Bird (ブルーバード)',
    artist: 'Ikimono-gakari',
    type: 'OP',
    themeNumber: 'OP 3',
    year: 2008,
    studio: 'Studio Pierrot',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1565/111305l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/49/a2/12/49a21221-a1e5-6b5d-0074-a03893e96b34/mzaf_15079015092040984888.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Mırıldanan mızıka introsu ile unutulmaz bir klasik.',
      'Gizli Yaprak Köyü ve Hokage olma hayali kuran genç.',
      'Ikimono-gakari grubunun efsanevi şarkısı.'
    ],
    options: ['Bleach', 'Naruto Shippuden', 'One Piece', 'Fairy Tail']
  },
  {
    id: 'song_naruto_silhouette',
    animeTitle: 'Naruto Shippuden',
    animeTitleTR: 'Naruto Shippuden',
    songTitle: 'Silhouette (シルエット)',
    artist: 'KANA-BOON',
    type: 'OP',
    themeNumber: 'OP 16',
    year: 2014,
    studio: 'Studio Pierrot',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1565/111305l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/e5/bd/27/e5bd2789-01f2-70b5-650c-e2652b414f52/mzaf_10459523275997230495.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'KANA-BOON grubunun enerjik elektro-gitar introlu efsane şarkısı.',
      '4. Büyük Ninja Savaşı dönemi açılışı.',
      'Naruto, Sasuke ve Sakura koşturma sahneleri.'
    ],
    options: ['Boruto', 'Naruto Shippuden', 'Black Clover', 'My Hero Academia']
  },
  {
    id: 'song_fmab_again',
    animeTitle: 'Fullmetal Alchemist: Brotherhood',
    animeTitleTR: 'Fullmetal Alchemist: Brotherhood',
    songTitle: 'again',
    artist: 'YUI',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2009,
    studio: 'Bones',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1208/94745l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/05/56/67/05566779-7a32-7634-8468-2396bb6b533e/mzaf_17204998963283296181.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Animetop 1 listelerinin yıllarca zirvesinde yer alan başyapıt.',
      'YUI sanatçısının hızlı akustik ve elektrik gitar vokalleri.',
      'Elric kardeşlerin simya ve Felsefe Taşı arayışı.'
    ],
    options: ['Soul Eater', 'Fullmetal Alchemist: Brotherhood', 'D.Gray-man', 'Hunter x Hunter']
  },
  {
    id: 'song_one_piece_weare',
    animeTitle: 'One Piece',
    animeTitleTR: 'One Piece',
    songTitle: 'We Are! (ウィーアー!)',
    artist: 'Hiroshi Kitadani',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 1999,
    studio: 'Toei Animation',
    animeImage: 'https://cdn.myanimelist.net/images/anime/6/73245l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/21/cf/3f/21cf3f11-0941-860e-26f6-47407a164996/mzaf_11306385150928929724.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Hasır Şapka Korsanları ve Korsanlar Kralı olma sevdası.',
      '1999 yılında başlayan efsanevi deniz macerasının ilk açılışı.',
      '"ARITTANNO OMOI WO KAKIATSUME!" nakaratı.'
    ],
    options: ['Toriko', 'One Piece', 'Dragon Ball Z', 'Bleach']
  },
  {
    id: 'song_death_note_world',
    animeTitle: 'Death Note',
    animeTitleTR: 'Death Note',
    songTitle: 'the WORLD',
    artist: 'NIGHTMARE',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2006,
    studio: 'Madhouse',
    animeImage: 'https://cdn.myanimelist.net/images/anime/9/9443l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/91/92/ff/9192ffd7-32bd-65f5-4122-83e956e17424/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Gökten düşen gizemli siyah defter.',
      'Light Yagami (Kira) ve L arasındaki zeka savaşı.',
      'J-Goth rock grubu NIGHTMARE vokalleri.'
    ],
    options: ['Code Geass', 'Death Note', 'Monster', 'Psycho-Pass']
  },
  {
    id: 'song_evangelion_thesis',
    animeTitle: 'Neon Genesis Evangelion',
    animeTitleTR: 'Neon Genesis Evangelion',
    songTitle: "A Cruel Angel's Thesis (残酷な天使のテーゼ)",
    artist: 'Yoko Takahashi',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 1995,
    studio: 'Gainax',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1314/142022l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/71/84/c2/7184c264-b976-bf10-53d3-1768c857754b/mzaf_11306385150928929724.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Japon karaoke mekanlarında tüm zamanların en çok söylenen şarkısı.',
      'Mecha ve psikoloji türünün efsanevi klasiği.',
      'Shinji Ikari, Asuka ve EVA-01.'
    ],
    options: ['Mobile Suit Gundam', 'Neon Genesis Evangelion', 'RahXephon', 'Gurren Lagann']
  },
  {
    id: 'song_steins_gate_hacking',
    animeTitle: 'Steins;Gate',
    animeTitleTR: 'Steins;Gate',
    songTitle: 'Hacking to the Gate',
    artist: 'Kanako Ito',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2011,
    studio: 'White Fox',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1935/127974l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/fb/3f/8e/fb3f8e56-11b0-4660-845b-7b2521c7a82b/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Mikrodalga fırınla geçmişe e-posta gönderen çılgın bilim insanı.',
      'Okabe Rintarou (Hououin Kyouma) ve Makise Kurisu.',
      'Zaman çizgileri (World Lines) ve El Psy Kongroo.'
    ],
    options: ['Robotics;Notes', 'Steins;Gate', 'Chaos;Head', 'Erased']
  },
  {
    id: 'song_sao_crossingfield',
    animeTitle: 'Sword Art Online',
    animeTitleTR: 'Sword Art Online',
    songTitle: 'crossing field',
    artist: 'LiSA',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2012,
    studio: 'A-1 Pictures',
    animeImage: 'https://cdn.myanimelist.net/images/anime/11/39717l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/44/21/bc/4421bc0a-4712-be2b-8a16-160538074413/mzaf_15079015092040984888.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Sanal gerçeklik kaskı (NerveGear) ile oyuna hapsolma macerası.',
      'Kirito ve Asuna Aincrad katlarında hayatta kalmaya çalışır.',
      'LiSA sanatçısının ilk büyük global anime patlaması.'
    ],
    options: ['Log Horizon', 'Sword Art Online', 'Accel World', 'Overlord']
  },
  {
    id: 'song_csm_kickback',
    animeTitle: 'Chainsaw Man',
    animeTitleTR: 'Chainsaw Man',
    songTitle: 'KICK BACK',
    artist: 'Kenshi Yonezu',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2022,
    studio: 'MAPPA',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1806/126216l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/13/6f/9d/136f9d2a-407a-5813-f938-f1c2b5358045/mzaf_10459523275997230495.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Kenshi Yonezu ve King Gnu üyelerinin işbirliği yaptığı bas-ağır başyapıt.',
      'Pochita ile birleşen ve motorlu testere iblisleşen Denji.',
      'Makima ve Kamu Güvenliği İblis Avcıları.'
    ],
    options: ['Jujutsu Kaisen', 'Chainsaw Man', 'Hell’s Paradise', 'Dorohedoro']
  },
  {
    id: 'song_oshi_no_ko_idol',
    animeTitle: 'Oshi no Ko',
    animeTitleTR: 'Oshi no Ko',
    songTitle: 'IDOL (アイドル)',
    artist: 'YOASOBI',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2023,
    studio: 'Doga Kobo',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1812/134736l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/58/01/5e/58015e21-0490-41ff-8089-6e3e5718712a/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '2023 yılında Billboard Global 200 listesinde 1 numaraya çıkan ilk J-Pop parçası.',
      'Efsanevi idol Ai Hoshino ve ikiz çocukları Aqua & Ruby.',
      'Eğlence sektörünün karanlık ve sır dolu yüzü.'
    ],
    options: ['Kaguya-sama: Love is War', 'Oshi no Ko', 'Bocchi the Rock!', 'Nana']
  },
  {
    id: 'song_bleach_asterisk',
    animeTitle: 'Bleach',
    animeTitleTR: 'Bleach',
    songTitle: '*~asterisk~',
    artist: 'ORANGE RANGE',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2004,
    studio: 'Studio Pierrot',
    animeImage: 'https://cdn.myanimelist.net/images/anime/3/40451l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/4a/12/35/4a123512-5f12-0943-410a-319a00812356/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      '2000’lerin sokak hip-hop ve rock tarzını yansıtan efsanevi ilk açılış.',
      'Rukia Kuchiki ve Turuncu saçlı Şinigami Ichigo Kurosaki.',
      'Zangetsu ve Soul Society macerası.'
    ],
    options: ['Soul Eater', 'Bleach', 'Shaman King', 'InuYasha']
  },
  {
    id: 'song_hxh_departure',
    animeTitle: 'Hunter x Hunter (2011)',
    animeTitleTR: 'Hunter x Hunter',
    songTitle: 'Departure!',
    artist: 'Masatoshi Ono',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2011,
    studio: 'Madhouse',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1337/99013l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/21/30/fa/2130fa21-2e21-0a41-2130-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '148 bölüm boyunca neredeyse hiç değişmeyen efsanevi coşkulu açılış.',
      'Gon Freecss, Killua Zoldyck, Kurapika ve Leorio.',
      'Avcı Sınavı ve Nen gücü eğitimi.'
    ],
    options: ['Yu Yu Hakusho', 'Hunter x Hunter (2011)', 'Toriko', 'World Trigger']
  },
  {
    id: 'song_mha_theday',
    animeTitle: 'My Hero Academia (Boku no Hero Academia)',
    animeTitleTR: 'My Hero Academia',
    songTitle: 'THE DAY',
    artist: 'Porno Graffitti',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2016,
    studio: 'Bones',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/78745l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/44/21/bc/4421bc0a-4712-be2b-8a16-160538074413/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Özgünlüğü (Quirk) olmadan doğan fakat All Might’ın varisi olan Deku.',
      'UA Lisesi 1-A sınıfı kahraman adayları.',
      'Porno Graffitti rock grubunun ikonik temposu.'
    ],
    options: ['Tiger & Bunny', 'My Hero Academia (Boku no Hero Academia)', 'Black Clover', 'Fire Force']
  },
  {
    id: 'song_dbz_chala',
    animeTitle: 'Dragon Ball Z',
    animeTitleTR: 'Dragon Ball Z',
    songTitle: 'CHA-LA HEAD-CHA-LA',
    artist: 'Hironobu Kageyama',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 1989,
    studio: 'Toei Animation',
    animeImage: 'https://cdn.myanimelist.net/images/anime/6/20947l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/30/41/70/30417088-7501-1004-9042-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Tüm zamanların en bilinen klasik Shonen marşı.',
      'Goku, Vegeta, Saiyan ırkı ve Ejder Topları.',
      'Kamehameha dalgası ve Süper Saiyan dönüşümü.'
    ],
    options: ['Saint Seiya', 'Dragon Ball Z', 'Yu Yu Hakusho', 'Fist of the North Star']
  },
  {
    id: 'song_code_geass_colors',
    animeTitle: 'Code Geass: Lelouch of the Rebellion',
    animeTitleTR: 'Code Geass',
    songTitle: 'COLORS',
    artist: 'FLOW',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2006,
    studio: 'Sunrise',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1032/135088l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/05/12/34/05123456-1234-5678-9012-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Japonya’nın Britanya İmparatorluğu tarafından işgal edildiği Alan 11 dünyası.',
      'Geass gücü edinen dahi stratejist Lelouch vi Britanya (Zero).',
      'FLOW grubunun trompet introlu muhteşem şarkısı "JIBUN WO!"'
    ],
    options: ['Gundam SEED', 'Code Geass: Lelouch of the Rebellion', 'Guilty Crown', 'Aldnoah.Zero']
  },
  {
    id: 'song_cowboy_bebop_tank',
    animeTitle: 'Cowboy Bebop',
    animeTitleTR: 'Cowboy Bebop',
    songTitle: 'Tank!',
    artist: 'SEATBELTS (Yoko Kanno)',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 1998,
    studio: 'Sunrise',
    animeImage: 'https://cdn.myanimelist.net/images/anime/4/19644l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/91/92/ff/9192ffd7-32bd-65f5-4122-83e956e17424/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '"3, 2, 1 Let’s Jam!" unutulmaz kontrbas ve caz saksafon girişi.',
      'Spike Spiegel, Jet Black ve uzay ödül avcıları.',
      'Yoko Kanno’nun caz müzik başyapıtı.'
    ],
    options: ['Trigun', 'Cowboy Bebop', 'Outlaw Star', 'Samurai Champloo']
  },
  {
    id: 'song_jojo_sonochi',
    animeTitle: "JoJo's Bizarre Adventure",
    animeTitleTR: "JoJo's Bizarre Adventure",
    songTitle: 'Sono Chi no Sadame (ジョジョ〜その血の運命〜)',
    artist: 'Hiroaki "TOMMY" Tominaga',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2012,
    studio: 'David Production',
    animeImage: 'https://cdn.myanimelist.net/images/anime/3/40409l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/12/34/56/12345678-1234-5678-9012-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '"JOOOOOJO!" diye haykırılan epik pirinç enstrüman vokalleri.',
      'Jonathan Joestar ve Dio Brando arasındaki taş maske rekabeti.',
      'Hamon (Güneş enerjisi) dövüş sanatı.'
    ],
    options: ['Fist of the North Star', "JoJo's Bizarre Adventure", 'Baki', 'Kengan Ashura']
  },
  {
    id: 'song_opm_thehero',
    animeTitle: 'One Punch Man',
    animeTitleTR: 'One Punch Man',
    songTitle: 'THE HERO !! ~Ikareru Kobushi ni Hi wo Tskero~',
    artist: 'JAM Project',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2015,
    studio: 'Madhouse',
    animeImage: 'https://cdn.myanimelist.net/images/anime/12/76619l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/88/99/00/88990011-2233-4455-6677-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '"ONE PUNCHHHHH!" nidasıyla başlayan patlayıcı heavy metal şarkısı.',
      'Tek yumrukla tüm düşmanlarını yok ettiği için sıkıntıdan patlayan Saitama.',
      'Genos ve Kahraman Derneği.'
    ],
    options: ['Mob Psycho 100', 'One Punch Man', 'My Hero Academia', 'Tiger & Bunny']
  },
  {
    id: 'song_mob_99',
    animeTitle: 'Mob Psycho 100',
    animeTitleTR: 'Mob Psycho 100',
    songTitle: '99',
    artist: 'MOB CHOIR',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2016,
    studio: 'Bones',
    animeImage: 'https://cdn.myanimelist.net/images/anime/8/80356l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/77/88/99/77889900-1122-3344-5566-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Geriye doğru sayım yapan (1, 2, 3... 99) deneysel psych-rock temposu.',
      'Duyguları %100’e ulaştığında muazzam psişik güç patlaması yaşayan Shigeo Kageyama.',
      'Sahte ruhban ustası Reigen Arataka.'
    ],
    options: ['One Punch Man', 'Mob Psycho 100', 'Saiki K.', 'Soul Eater']
  },
  {
    id: 'song_frieren_thebrave',
    animeTitle: 'Frieren: Beyond Journey’s End (Sousou no Frieren)',
    animeTitleTR: 'Frieren: Beyond Journey’s End',
    songTitle: 'The Brave (勇者)',
    artist: 'YOASOBI',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2023,
    studio: 'Madhouse',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1015/138025l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/11/22/33/11223344-5566-7788-9900-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'İblis Kralı yendikten sonra bitti sanılan fakat asıl başlayan yolculuk.',
      'Bin yıllık ömrü olan elf büyücü Frieren ve insan arkadaşları.',
      'YOASOBI’nin duygusal ve epik temposu.'
    ],
    options: ['Delicious in Dungeon', 'Frieren: Beyond Journey’s End (Sousou no Frieren)', 'Mushoku Tensei', 'The Faraway Paladin']
  },
  {
    id: 'song_bocchi_seishun',
    animeTitle: 'Bocchi the Rock!',
    animeTitleTR: 'Bocchi the Rock!',
    songTitle: 'Seishun Complex (青春コンプレックス)',
    artist: 'Kessoku Band',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2022,
    studio: 'CloverWorks',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1448/127956l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/44/55/66/44556677-8899-0011-2233-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Sosyal anksiyeteli pembe saçlı gitarist Hitori Gotou (Bocchi).',
      'Kessoku Band grubunun gerçekçi ve enerjik j-rock gitar soloları.',
      '2022 yılının sürpriz anime müzik fenomeni.'
    ],
    options: ['K-On!', 'Bocchi the Rock!', 'BECK', 'Love Live!']
  },
  {
    id: 'song_kaguya_love_dramatic',
    animeTitle: 'Kaguya-sama: Love is War',
    animeTitleTR: 'Kaguya-sama: Love is War',
    songTitle: 'Love Dramatic ft. Rikka Ihara',
    artist: 'Masayuki Suzuki',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2019,
    studio: 'A-1 Pictures',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1295/106551l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/11/22/33/11223344-5566-7788-9900-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      '"J-Funk İlahı" Masayuki Suzuki’nin romantik ve havalı vokalleri.',
      'Kaguya Shinomiya ve Miyuki Shirogane arasındaki zeka odaklı aşk savaşı.',
      '"OH LOVE ME MISTER!" nakaratı.'
    ],
    options: ['Horimiya', 'Kaguya-sama: Love is War', 'Toradora!', 'Komican']
  },
  {
    id: 'song_spy_family_mixednuts',
    animeTitle: 'Spy x Family',
    animeTitleTR: 'Spy x Family',
    songTitle: 'Mixed Nuts (ミックスナッツ)',
    artist: 'Official HIGE DANdism',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2022,
    studio: 'Wit Studio / CloverWorks',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1441/122795l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/22/33/44/22334455-6677-8899-0011-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Ajan Loid (Twilight), Suikastçı Yor ve zihin okuyan Anya.',
      'Caz yürüyüşlü bas gitar ve fıstık (peanut) göndermeleri.',
      'Official HIGE DANdism grubunun eğlenceli temposu.'
    ],
    options: ['Buddy Daddies', 'Spy x Family', 'Great Pretender', 'Kaguya-sama']
  },
  {
    id: 'song_haikyu_flyhigh',
    animeTitle: 'Haikyu!!',
    animeTitleTR: 'Haikyu!!',
    songTitle: 'FLY HIGH!!',
    artist: 'BURNOUT SYNDROMES',
    type: 'OP',
    themeNumber: 'OP 2',
    year: 2016,
    studio: 'Production I.G',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1825/110716l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/33/44/55/33445566-7788-9900-1122-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Karasuno Lisesi "Düşmüş Şahinler" voleybol takımı.',
      'Shoyo Hinata ve Tobio Kageyama uyumu.',
      'BURNOUT SYNDROMES grubunun yüksek motivasyonlu rock marşı.'
    ],
    options: ['Kuroko’s Basketball', 'Haikyu!!', 'Free!', 'Blue Lock']
  },
  {
    id: 'song_blue_lock_chaos',
    animeTitle: 'Blue Lock',
    animeTitleTR: 'Blue Lock',
    songTitle: 'Chaos ga Kiwamaru (カオスが極まる)',
    artist: 'UNISON SQUARE GARDEN',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2022,
    studio: '8bit',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1258/126929l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/55/66/77/55667788-9900-1122-3344-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Japonya’nın en bencil ve dahi forvetini yetiştirme projesi.',
      'Yoichi Isagi ve Ego Jinpachi.',
      'UNISON SQUARE GARDEN grubunun çılgın hızlı gitar ritimleri.'
    ],
    options: ['Aoashi', 'Blue Lock', 'Giant Killing', 'Captain Tsubasa']
  },
  {
    id: 'song_cyberpunk_stay',
    animeTitle: 'Cyberpunk: Edgerunners',
    animeTitleTR: 'Cyberpunk: Edgerunners',
    songTitle: 'I Really Want to Stay at Your House',
    artist: 'Rosa Walton / Hallie Coggins',
    type: 'OST',
    themeNumber: 'INSERT',
    year: 2022,
    studio: 'Studio Trigger',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1818/126436l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/66/77/88/66778899-0011-2233-4455-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Night City’de geçen trajik ve görsel bir bilim kurgu şöleni.',
      'David Martinez ve Lucy’nin Ay hayali.',
      'Dinleyen her anime severi gözyaşlarına boğan efsanevi şarkı.'
    ],
    options: ['Akudama Drive', 'Cyberpunk: Edgerunners', 'Ghost in the Shell', 'Psycho-Pass']
  },
  {
    id: 'song_solo_leveling_level',
    animeTitle: 'Solo Leveling (Ore dake Level Up na Ken)',
    animeTitleTR: 'Solo Leveling',
    songTitle: 'LEveL',
    artist: 'SawanoHiroyuki[nZk]:TOMORROW X TOGETHER',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2024,
    studio: 'A-1 Pictures',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1122/139500l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/77/88/99/77889900-1122-3344-5566-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'En zayıf E-Rütbe avcıdan tek başına seviye atlayan Gölge Hükümdar Sung Jin-woo.',
      'Hiroyuki Sawano ve K-Pop grubu TXT ortak çalışması.',
      'Sistem arayüzü ve Gölge Ordusu.'
    ],
    options: ['Tower of God', 'Solo Leveling (Ore dake Level Up na Ken)', 'The God of High School', 'Omniscient Reader']
  },
  {
    id: 'song_your_name_zenzenzense',
    animeTitle: 'Your Name. (Kimi no Na wa.)',
    animeTitleTR: 'Your Name.',
    songTitle: 'Zenzenzense (前前前世)',
    artist: 'RADWIMPS',
    type: 'OST',
    themeNumber: 'INSERT',
    year: 2016,
    studio: 'CoMix Wave Films',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1935/127974l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/88/99/00/88990011-2233-4455-6677-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Makoto Shinkai’nin dünya çapında gişe rekorları kıran filmi.',
      'Rüyalarında beden değiştiren Taki ve Mitsuha.',
      'RADWIMPS rock grubunun efsanevi temposu.'
    ],
    options: ['Weathering With You', 'Your Name. (Kimi no Na wa.)', '5 Centimeters per Second', 'Suzume']
  },
  {
    id: 'song_vinland_mukan',
    animeTitle: 'Vinland Saga',
    animeTitleTR: 'Vinland Saga',
    songTitle: 'MUKAN',
    artist: 'Survive Said The Prophet',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2019,
    studio: 'Wit Studio',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1500/103005l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/99/00/11/99001122-3344-5566-7788-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Babası Thors’un öcünü almak için Askeladd’ın peşinden giden Thorfinn.',
      'Vikingler çağı, savaşlar ve intikam ateşi.',
      'Screamo rock tempolu Survive Said The Prophet vokali.'
    ],
    options: ['Kingdom', 'Vinland Saga', 'Berserk', 'Golden Kamuy']
  },
  {
    id: 'song_noragami_kyouran',
    animeTitle: 'Noragami Aragoto',
    animeTitleTR: 'Noragami Aragoto',
    songTitle: 'Kyouran Hey Kids!! (狂乱 Hey Kids!!)',
    artist: 'THE ORAL CIGARETTES',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2015,
    studio: 'Bones',
    animeImage: 'https://cdn.myanimelist.net/images/anime/7/77177l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/93/bf/7a/93bf7af9-be63-3112-9c16-2d64a021bc82/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      '5 Yen karşılığında dilekleri gerçekleştiren başıboş tanrı Yato.',
      'THE ORAL CIGARETTES’in bağımlılık yapan elektro-rock gitar riffi.',
      'Yukine ve Hiyori ile birlikte iblislere karşı verilen mücadele.'
    ],
    options: ['Noragami Aragoto', 'Bungou Stray Dogs', 'Durarara!!', 'K-Project']
  },
  {
    id: 'song_re_zero_redo',
    animeTitle: 'Re:Zero - Starting Life in Another World',
    animeTitleTR: 'Re:Zero',
    songTitle: 'Redo',
    artist: 'Konomi Suzuki',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2016,
    studio: 'White Fox',
    animeImage: 'https://cdn.myanimelist.net/images/anime/11/79410l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bf/25/11/bf251147-3860-2441-2c0a-0e2bb6cb2d21/mzaf_15783305592815777891.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Öldüğünde zamana geri dönme (Return by Death) lanetine sahip Subaru Natsuki.',
      'Gümüş saçlı yarı-elf Emilia ve hizmetçi Rem.',
      'Isekai türünün en trajik ve psikolojik başyapıtlarından biri.'
    ],
    options: ['Konosuba', 'Re:Zero - Starting Life in Another World', 'Overlord', 'Sword Art Online']
  },
  {
    id: 'song_fate_zero_tobeginning',
    animeTitle: 'Fate/Zero',
    animeTitleTR: 'Fate/Zero',
    songTitle: 'To the Beginning',
    artist: 'Kalafina',
    type: 'OP',
    themeNumber: 'OP 2',
    year: 2012,
    studio: 'ufotable',
    animeImage: 'https://cdn.myanimelist.net/images/anime/2/38843l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/4a/bc/4a/4abc4a96-6e1e-21ef-a477-8d074ec6a2be/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'hard',
    hints: [
      'Kutsal Kase Savaşı için tarihi kahramanları çağıran 7 Büyücü usta.',
      'Kalafina grubunun senfonik ve opera tarzı büyüleyici vokalleri.',
      'Saber, Gilgamesh ve Kiritsugu Emiya.'
    ],
    options: ['Fate/stay night: Unlimited Blade Works', 'Fate/Zero', 'Kara no Kyoukai', 'Aharon']
  },
  {
    id: 'song_fire_force_inferno',
    animeTitle: 'Fire Force (Enen no Shouboutai)',
    animeTitleTR: 'Fire Force',
    songTitle: 'Inferno (インフェルノ)',
    artist: 'Mrs. GREEN APPLE',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2019,
    studio: 'David Production',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1020/100030l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/88/77/66/88776655-4433-2211-0099-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'İnsanların aniden alev alarak iblislere dönüştüğü dünya.',
      'Ayaklarından alev çıkaran Shinra Kusakakabe.',
      'Mrs. GREEN APPLE grubunun yüksek enerjili rock introsu.'
    ],
    options: ['Promare', 'Fire Force (Enen no Shouboutai)', 'Soul Eater', 'Blue Exorcist']
  },
  {
    id: 'song_black_clover_catcher',
    animeTitle: 'Black Clover',
    animeTitleTR: 'Black Clover',
    songTitle: 'Black Catcher',
    artist: 'Vickeblanka',
    type: 'OP',
    themeNumber: 'OP 10',
    year: 2020,
    studio: 'Studio Pierrot',
    animeImage: 'https://cdn.myanimelist.net/images/anime/2/88336l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/99/88/77/99887766-5544-3322-1100-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Büyü gücü olmadan doğan fakat Kara Boğalar loncasına giren Asta.',
      'Vickeblanka’nın caz piyanolu ve patlayıcı vokal çalışması.',
      'Büyücü Kral olma yolunda Yuno ile rekabet.'
    ],
    options: ['Fairy Tail', 'Black Clover', 'Magi', 'Radiant']
  },
  {
    id: 'song_mashle_blingbang',
    animeTitle: 'Mashle: Magic and Muscles',
    animeTitleTR: 'Mashle',
    songTitle: 'Bling-Bang-Bang-Born',
    artist: 'Creepy Nuts',
    type: 'OP',
    themeNumber: 'OP 2',
    year: 2024,
    studio: 'A-1 Pictures',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1183/133608l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/00/11/22/00112233-4455-6677-8899-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '2024 başında TikTok ve sosyal medyada viral olan hip-hop dans şarkısı.',
      'Büyü dünyasında hiç büyüsü olmadan sadece kas gücü ve kremalı çöreklerle savaşan Mash Burnedead.',
      'Creepy Nuts hip-hop ikilisinin efsanevi ritmi.'
    ],
    options: ['One Punch Man', 'Mashle: Magic and Muscles', 'Mob Psycho 100', 'Black Clover']
  },
  {
    id: 'song_jujutsu_specialz',
    animeTitle: 'Jujutsu Kaisen Season 2',
    animeTitleTR: 'Jujutsu Kaisen S2',
    songTitle: 'SPECIALZ',
    artist: 'King Gnu',
    type: 'OP',
    themeNumber: 'OP 2',
    year: 2023,
    studio: 'MAPPA',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1792/138022l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/11/00/99/11009988-7766-5544-3322-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '"YOU ARE MY SPECIAL" nakaratıyla bilinen Shibuya Olayı açılışı.',
      'King Gnu’nun deneysel rock ve bass groove üslubu.',
      'Ryomen Sukuna ve Gojo Satoru Mühürlenme savaşı.'
    ],
    options: ['Chainsaw Man', 'Jujutsu Kaisen Season 2', 'Bleach TYBW', 'Demon Slayer']
  },
  {
    id: 'song_aot_rumbling',
    animeTitle: 'Attack on Titan Final Season',
    animeTitleTR: 'Attack on Titan Final',
    songTitle: 'The Rumbling',
    artist: 'SiM',
    type: 'OP',
    themeNumber: 'OP 7',
    year: 2022,
    studio: 'MAPPA',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1948/120625l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/22/11/00/22110099-8877-6655-4433-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'SiM grubunun metalcore ve heavy breakdown üslubu.',
      'Eren Yeager’ın Kurucu Titani uyandırıp "Gürleme" felaketini başlatması.',
      '"BEWARE! COMING FOR YOU!" haykırışı.'
    ],
    options: ['Vinland Saga', 'Attack on Titan Final Season', 'Kabaneri', 'Tokyo Ghoul']
  },
  {
    id: 'song_demon_slayer_zankyosanka',
    animeTitle: 'Demon Slayer: Entertainment District Arc',
    animeTitleTR: 'Demon Slayer Season 2',
    songTitle: 'Zankyosanka (残響散歌)',
    artist: 'Aimer',
    type: 'OP',
    themeNumber: 'OP 2',
    year: 2022,
    studio: 'ufotable',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1908/120036l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/33/22/11/33221100-9988-7766-5544-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Aimer sanatçısının caz trompetli ve coşkulu vokalleri.',
      'Ses Haşirası Tengen Uzui ve Gece Hayatı Bölgesi savaşı.',
      'Daki ve Gyutaro iblis kardeşler.'
    ],
    options: ['Jujutsu Kaisen', 'Demon Slayer: Entertainment District Arc', 'Fate/Heaven’s Feel', 'Noragami']
  },
  {
    id: 'song_tokyo_revengers_crybaby',
    animeTitle: 'Tokyo Revengers',
    animeTitleTR: 'Tokyo Revengers',
    songTitle: 'Cry Baby',
    artist: 'Official HIGE DANdism',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2021,
    studio: 'LIDENFILMS',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1830/118320l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/44/33/22/44332211-0099-8877-6655-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Geçmişe 12 yıl geri dönüp ortaokul çete günlerinde Hinata’yı kurtarmaya çalışan Takemichi.',
      'Tokyo Manji Çetesi (Toman) lideri Mikey ve Draken.',
      'Sürekli anahtar değişimi yapılan virtüöz rock düzenlemesi.'
    ],
    options: ['Erased', 'Tokyo Revengers', 'Durarara!!', 'Wind Breaker']
  },
  {
    id: 'song_overlord_clattanoia',
    animeTitle: 'Overlord',
    animeTitleTR: 'Overlord',
    songTitle: 'Clattanoia',
    artist: 'OxT',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2015,
    studio: 'Madhouse',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/75808l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/55/44/33/55443322-1100-9988-7766-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'YGGDRASIL oyunu kapandığında iskelet büyücü karakteri Ainz Ooal Gown olarak dünyada kalan Momonga.',
      'Nazarick Büyük Mezarlığı muhafızları (Albedo, Shalltear).',
      'OxT grubunun sert heavy metal vokalleri.'
    ],
    options: ['Log Horizon', 'Overlord', 'The Eminence in Shadow', 'That Time I Got Reincarnated as a Slime']
  },
  {
    id: 'song_no_game_no_life_thisgame',
    animeTitle: 'No Game No Life',
    animeTitleTR: 'No Game No Life',
    songTitle: 'This Game',
    artist: 'Konomi Suzuki',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2014,
    studio: 'Madhouse',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1079/138100l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/66/55/44/66554433-2211-0099-8877-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Hiç kaybetmeyen dahi kardeşler Sora ve Shiro (Blank).',
      'Her şeyin oyunlarla çözüldüğü Disboard dünyası.',
      'Unutulmaz virtuöz piyano sololu açılış.'
    ],
    options: ['Problem Children', 'No Game No Life', 'Kakegurui', 'Classroom of the Elite']
  },
  {
    id: 'song_gurren_lagann_sorairo',
    animeTitle: 'Tengen Toppa Gurren Lagann',
    animeTitleTR: 'Gurren Lagann',
    songTitle: 'Sorairo Days (空色デイズ)',
    artist: 'Shoko Nakagawa',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2007,
    studio: 'Gainax',
    animeImage: 'https://cdn.myanimelist.net/images/anime/11/82306l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/77/66/55/77665544-3322-1100-9988-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '"Senin matkabın gökleri delecek matkaptır!"',
      'Kamina, Simon ve Yoko.',
      'Mecha türünün en motivasyonel ve coşkulu şarkısı.'
    ],
    options: ['Kill la Kill', 'Tengen Toppa Gurren Lagann', 'FLCL', 'Promare']
  },
  {
    id: 'song_sailor_moon_moonlight',
    animeTitle: 'Pretty Guardian Sailor Moon',
    animeTitleTR: 'Sailor Moon',
    songTitle: 'Moonlight Densetsu (ムーンライト伝説)',
    artist: 'DALI',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 1992,
    studio: 'Toei Animation',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/83431l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/88/77/66/88776655-4433-2211-0099-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '90’lar çocukluğunun unutulmaz Mahou Shoujo (Sihirli Kız) klasiği.',
      'Usagi Tsukino (Ay Savaşçısı) ve Tuxedo Mask.',
      '"Gomen ne sunao ja nakute" sözleriyle başlayan tango valsi.'
    ],
    options: ['Cardcaptor Sakura', 'Pretty Guardian Sailor Moon', 'Tokyo Mew Mew', 'Magical DoReMi']
  },
  {
    id: 'song_pokemon_gotta_catch',
    animeTitle: 'Pokémon',
    animeTitleTR: 'Pokémon',
    songTitle: "Gotta Catch 'Em All!",
    artist: 'Jason Paige',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 1997,
    studio: 'OLM',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/73248l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/99/88/77/99887766-5544-3322-1100-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Tüm dünyada milyonlarca çocuğun ezbere bildiği İngilizce jenerik.',
      'Ash Ketchum, Pikachu, Brock ve Misty.',
      '"I want to be the very best, like no one ever was!"'
    ],
    options: ['Digimon Adventure', 'Pokémon', 'Monster Rancher', 'Yu-Gi-Oh!']
  },
  {
    id: 'song_digimon_butterfly',
    animeTitle: 'Digimon Adventure',
    animeTitleTR: 'Digimon Adventure',
    songTitle: 'Butter-Fly',
    artist: 'Kouji Wada',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 1999,
    studio: 'Toei Animation',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/11239l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/00/99/88/00998877-6655-4433-2211-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Merhum Kouji Wada’nın ölümsüzleştiği rock marşı.',
      'Sayısal Dünyaya düşen Seçilmiş Çocuklar ve Agumon.',
      'Japonya ve dünya genelinde anime klasiklerinin başında gelir.'
    ],
    options: ['Pokémon', 'Digimon Adventure', 'Bakugan', 'Beyblade']
  },
  {
    id: 'song_death_parade_flyers',
    animeTitle: 'Death Parade',
    animeTitleTR: 'Death Parade',
    songTitle: 'Flyers',
    artist: 'BRADIO',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2015,
    studio: 'Madhouse',
    animeImage: 'https://cdn.myanimelist.net/images/anime/5/71553l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/11/00/99/11009988-7766-5544-3322-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Öldükten sonra Quindecim barında ölüm oyunları oynayan ruhlar.',
      'Barman Decim ve Hakem sistemi.',
      'Anime ne kadar karanlık olsa da açılış şarkısı o kadar eğlenceli ve funk dans doludur.'
    ],
    options: ['Bartender', 'Death Parade', 'Psycho-Pass', 'Kakegurui']
  },
  {
    id: 'song_dr_stone_goodmorning',
    animeTitle: 'Dr. STONE',
    animeTitleTR: 'Dr. STONE',
    songTitle: 'Good Morning World!',
    artist: 'BURNOUT SYNDROMES',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2019,
    studio: 'TMS Entertainment',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1613/102576l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/22/11/00/22110099-8877-6655-4433-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Tüm insanlığın taşlaştığı dünyada 3700 yıl sonra uyanan dahi bilim insanı Senku Ishigami.',
      'Taş Çağından sıfırdan medeniyet ve bilim Krallığı kurma mücadelesi.',
      '"OHAYO WORLD, GOOD MORNING WORLD!"'
    ],
    options: ['Cells at Work!', 'Dr. STONE', 'Fire Force', 'World Trigger']
  },
  {
    id: 'song_assassination_seishun',
    animeTitle: 'Assassination Classroom (Ansatsu Kyoushitsu)',
    animeTitleTR: 'Assassination Classroom',
    songTitle: 'Seishun Satsubatsuron (青春サツバツ論)',
    artist: '3-E Utatan',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2015,
    studio: 'Lerche',
    animeImage: 'https://cdn.myanimelist.net/images/anime/5/75810l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/33/22/11/33221100-9988-7766-5544-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Ay’ın %70’ini yok eden ve dünyayı patlatmakla tehdit eden sarı ahtapot öğretmen Koro-sensei.',
      'Kunugigaoka Lisesi 3-E sınıfı öğrencileri.',
      'Öğrencilerin seslendirdiği neşeli suikast temalı şarkı.'
    ],
    options: ['Classroom of the Elite', 'Assassination Classroom (Ansatsu Kyoushitsu)', 'Danganronpa', 'Great Teacher Onizuka']
  },
  {
    id: 'song_fairy_tail_snowfairy',
    animeTitle: 'Fairy Tail',
    animeTitleTR: 'Fairy Tail',
    songTitle: 'Snow Fairy',
    artist: 'FUNKIST',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2009,
    studio: 'A-1 Pictures / Satelight',
    animeImage: 'https://cdn.myanimelist.net/images/anime/5/18131l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/44/33/22/44332211-0099-8877-6655-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Alev Ejder Katili Natsu Dragneel, Lucy Heartfilia, Erza ve Happy.',
      'Fiore Krallığı’nın en gürültülü ve aile bağı yüksek loncası.',
      'FUNKIST’in flüt ve ska-rock tonlu efsane açılışı.'
    ],
    options: ['Rave Master', 'Fairy Tail', 'Edens Zero', 'Black Clover']
  },
  {
    id: 'song_initial_d_running',
    animeTitle: 'Initial D',
    animeTitleTR: 'Initial D',
    songTitle: 'Running in the 90s',
    artist: 'Max Coveri',
    type: 'OST',
    themeNumber: 'EUROBEAT',
    year: 1998,
    studio: 'Studio Gallop',
    animeImage: 'https://cdn.myanimelist.net/images/anime/13/11237l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/55/44/33/55443322-1100-9988-7766-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'İnternet meme kültürünün ve araba yarışı dünyasının efsane Eurobeat klasiği.',
      'Toyota Sprinter Trueno AE86 ile Akina dağında yanlayan Takumi Fujiwara.',
      'Soya peyniri (Tofu) teslimatçısından drift efsanesine.'
    ],
    options: ['MF Ghost', 'Initial D', 'Wangan Midnight', 'Redline']
  },
  {
    id: 'song_initial_d_dejavu',
    animeTitle: 'Initial D',
    animeTitleTR: 'Initial D',
    songTitle: 'Deja Vu',
    artist: 'Dave Rodgers',
    type: 'OST',
    themeNumber: 'EUROBEAT',
    year: 1998,
    studio: 'Studio Gallop',
    animeImage: 'https://cdn.myanimelist.net/images/anime/13/11237l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/66/55/44/66554433-2211-0099-8877-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '"DEJA VU! I HAVE JUST BEEN IN THIS PLACE BEFORE!"',
      'Virajda el freni çekilip keskin drift yapılan ikonik sahneler.',
      'Dave Rodgers’ın en ünlü eurobeat parçası.'
    ],
    options: ['Speed Racer', 'Initial D', 'Cyber Formula', 'Over Take!']
  },
  {
    id: 'song_parasyte_letmehear',
    animeTitle: 'Parasyte -the maxim- (Kiseijuu)',
    animeTitleTR: 'Parasyte',
    songTitle: 'Let Me Hear',
    artist: 'Fear, and Loathing in Las Vegas',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2014,
    studio: 'Madhouse',
    animeImage: 'https://cdn.myanimelist.net/images/anime/8/66733l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/77/66/55/77665544-3322-1100-9988-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Gökten düşen parazitlerin insan beynini ele geçirdiği karanlık bilimkurgu.',
      'Sağ eline parazit yerleşen Shinichi Izumi ve Migi.',
      'Electronic-screamo tarzlı Fear, and Loathing in Las Vegas vokali.'
    ],
    options: ['Tokyo Ghoul', 'Parasyte -the maxim- (Kiseijuu)', 'Ajin', 'Inuyashiki']
  },
  {
    id: 'song_samurai_champloo_battlecry',
    animeTitle: 'Samurai Champloo',
    animeTitleTR: 'Samurai Champloo',
    songTitle: 'Battlecry ft. SHINGO2',
    artist: 'Nujabes',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2004,
    studio: 'Manglobe',
    animeImage: 'https://cdn.myanimelist.net/images/anime/11/29134l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/88/77/66/88776655-4433-2211-0099-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Lofi hip-hop janrının babası efsanevi prodüktör Nujabes yapımı.',
      'Edo dönemi samuray kılıç dövüşlerini hip-hop kültürüyle harmanlayan başyapıt.',
      'Mugen, Jin ve "ayçiçeği kokan samurayı" arayan Fuu.'
    ],
    options: ['Cowboy Bebop', 'Samurai Champloo', 'Afro Samurai', 'Rurouni Kenshin']
  },
  {
    id: 'song_psycho_pass_abnormalize',
    animeTitle: 'Psycho-Pass',
    animeTitleTR: 'Psycho-Pass',
    songTitle: 'abnormalize',
    artist: 'Ling Tosite Sigure',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2012,
    studio: 'Production I.G',
    animeImage: 'https://cdn.myanimelist.net/images/anime/5/43399l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/99/88/77/99887766-5544-3322-1100-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'İnsanların suç işleme potansiyelini ölçen Sibyl Sistemi distopyası.',
      'Müfettiş Akane Tsunemori ve İnfazcı Shinya Kogami.',
      'Ling Tosite Sigure grubunun tiz çığlıklı matematilsel rock tarzı.'
    ],
    options: ['Ghost in the Shell', 'Psycho-Pass', 'Ergo Proxy', 'ID:INVADED']
  },
  {
    id: 'song_erased_rere',
    animeTitle: 'ERASED (Boku dake ga Inai Machi)',
    animeTitleTR: 'ERASED',
    songTitle: 'Re:Re:',
    artist: 'ASIAN KUNG-FU GENERATION',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2016,
    studio: 'A-1 Pictures',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/77957l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/00/11/22/00112233-4455-6677-8899-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Felaket gerçekleşmeden birkaç dakika öncesine dönen "Tekrarlama" gücü.',
      'Sınıf arkadaşı Kayo Hinazuki’yi seri katilden korumak için 1988 yılına dönen Satoru Fujinuma.',
      'ASIAN KUNG-FU GENERATION grubunun efsanevi gitar introlu parçası.'
    ],
    options: ['Steins;Gate', 'ERASED (Boku dake ga Inai Machi)', 'Tokyo Revengers', 'Anohana']
  },
  {
    id: 'song_anohana_secretbase',
    animeTitle: 'Anohana: The Flower We Saw That Day',
    animeTitleTR: 'Anohana',
    songTitle: 'secret base ~Kimi ga Kureta Mono~ (10 years after ver.)',
    artist: 'Meiko Honma (Ai Kayano) & Friends',
    type: 'ED',
    themeNumber: 'ED 1',
    year: 2011,
    studio: 'A-1 Pictures',
    animeImage: 'https://cdn.myanimelist.net/images/anime/5/31885l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/11/22/33/11223344-5566-7788-9900-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '"Menma, seni bulduk!" duygu patlaması sahnesi.',
      'Çocukluk arkadaşının ruhunu huzura kavuşturmak için yıllar sonra bir araya gelen "Super Peace Busters".',
      'Hüzünlü akustik gitar ve piyano şarkısı.'
    ],
    options: ['Your Lie in April', 'Anohana: The Flower We Saw That Day', 'Clannad', 'Angel Beats!']
  },
  {
    id: 'song_your_lie_in_april_hikaru',
    animeTitle: 'Your Lie in April (Shigatsu wa Kimi no Uso)',
    animeTitleTR: 'Your Lie in April',
    songTitle: 'Hikaru Nara (光るなら)',
    artist: 'Goose house',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2014,
    studio: 'A-1 Pictures',
    animeImage: 'https://cdn.myanimelist.net/images/anime/3/67177l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/22/33/44/22334455-6677-8899-0011-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Piyano sesini duyamayan dahi piyanist Kousei Arima.',
      'Özgür ruhlu çellist/keman virtüözü Kaori Miyazono.',
      'Goose house grubunun rengarenk akustik ve vokalli sevimli şarkısı.'
    ],
    options: ['Kono Oto Tomare!', 'Your Lie in April (Shigatsu wa Kimi no Uso)', 'Nodame Cantabile', 'Kids on the Slope']
  },
  {
    id: 'song_clannad_afterstory',
    animeTitle: 'Clannad: After Story',
    animeTitleTR: 'Clannad: After Story',
    songTitle: 'Toki wo Kizamu Uta (時を刻む唄)',
    artist: 'Lia',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2008,
    studio: 'Kyoto Animation',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1299/110774l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/33/44/55/33445566-7788-9900-1122-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Kyoto Animation’ın izleyen herkesi gözyaşlarına boğan dram başyapıtı.',
      'Tomoya Okazaki, Nagisa Furukawa ve minik Ushio.',
      'Lia sanatçısının piyano ve keman eşliğindeki unutulmaz vokalleri.'
    ],
    options: ['Kanon', 'Clannad: After Story', 'AIR', 'Little Busters!']
  },
  {
    id: 'song_angel_beats_mysoul',
    animeTitle: 'Angel Beats!',
    animeTitleTR: 'Angel Beats!',
    songTitle: 'My Soul, Your Beats!',
    artist: 'Lia',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2010,
    studio: 'P.A. Works',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/22080l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/44/55/66/44556677-8899-0011-2233-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Ölümden sonraki okul dünyasında Tanrı’ya isyan eden "SSS" örgütü.',
      'Yuzuru Otonashi, Yurippe ve Melek (Kanade Tachibana).',
      'Kanade’nin piyanoda çaldığı melodiyle başlayan ikonik açılış.'
    ],
    options: ['Charlotte', 'Angel Beats!', 'Plastic Memories', 'Guilty Crown']
  },
  {
    id: 'song_kon_dontsaylazy',
    animeTitle: 'K-On!',
    animeTitleTR: 'K-On!',
    songTitle: 'Don’t say "lazy"',
    artist: 'Sakurakou K軽音部 (Yoko Hikasa)',
    type: 'ED',
    themeNumber: 'ED 1',
    year: 2009,
    studio: 'Kyoto Animation',
    animeImage: 'https://cdn.myanimelist.net/images/anime/12/76121l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/55/66/77/55667788-9900-1122-3344-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Sakuragaoka Lisesi Hafif Müzik Kulübü (Houkago Tea Time).',
      'Yui, Mio, Ritsu, Tsumugi ve Azusa.',
      'Mio Akiyama vokalli havalı J-Rock kapanış klasiği.'
    ],
    options: ['Bocchi the Rock!', 'K-On!', 'Love Live!', 'Bang Dream!']
  },
  {
    id: 'song_suzume_theme',
    animeTitle: 'Suzume (Suzume no Tojimari)',
    animeTitleTR: 'Suzume',
    songTitle: 'Suzume (すずめ ft. 十明)',
    artist: 'RADWIMPS ft. Toaka',
    type: 'OST',
    themeNumber: 'THEME',
    year: 2022,
    studio: 'CoMix Wave Films',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1825/128476l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/66/77/88/66778899-0011-2233-4455-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Japonya genelindeki gizemli felaket kapılarını kapatan Suzume ve Souta (sandalye).',
      'RADWIMPS ve Toaka’nın hipnotik mırıldanmalı vokalleri.',
      'Makoto Shinkai’nin son sinema başyapıtı.'
    ],
    options: ['Your Name.', 'Suzume (Suzume no Tojimari)', 'Weathering With You', 'A Silent Voice']
  },
  {
    id: 'song_silent_voice_lit',
    animeTitle: 'A Silent Voice (Koe no Katachi)',
    animeTitleTR: 'A Silent Voice',
    songTitle: 'lit(var)',
    artist: 'Kensuke Ushio',
    type: 'OST',
    themeNumber: 'THEME',
    year: 2016,
    studio: 'Kyoto Animation',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1122/96435l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/77/88/99/77889900-1122-3344-5566-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'İşitme engelli Shoko Nishimiya ve geçmişte ona zorbalık eden Shoya Ishida.',
      'Kensuke Ushio’nun piyano tuşlarına basış seslerini bile kaydederek yaptığı minimalist müzik.',
      'İletişim, affetme ve kendini kabullenme öyküsü.'
    ],
    options: ['Your Name.', 'A Silent Voice (Koe no Katachi)', 'I Want to Eat Your Pancreas', 'Josee, the Tiger and the Fish']
  },
  {
    id: 'song_kill_la_kill_before',
    animeTitle: 'Kill la Kill',
    animeTitleTR: 'Kill la Kill',
    songTitle: 'Before My Body Is Dry (Don’t Lose Your Way)',
    artist: 'Hiroyuki Sawano ft. Mika Kobayashi',
    type: 'OST',
    themeNumber: 'INSERT',
    year: 2013,
    studio: 'Studio Trigger',
    animeImage: 'https://cdn.myanimelist.net/images/anime/12/52731l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/88/99/00/88990011-2233-4455-6677-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '"DON’T LOSE YOUR WAY!" efsanevi motivasyon vokalleri.',
      'Tek bıçaklı makas kılıcıyla babasının katilini arayan Ryuko Matoi ve canlı giysi Senketsu.',
      'Satsuki Kiryuin ve Honnouji Akademisi.'
    ],
    options: ['Gurren Lagann', 'Kill la Kill', 'Panty & Stocking', 'FLCL']
  },
  {
    id: 'song_soul_eater_resonance',
    animeTitle: 'Soul Eater',
    animeTitleTR: 'Soul Eater',
    songTitle: 'Resonance',
    artist: 'T.M.Revolution',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2008,
    studio: 'Bones',
    animeImage: 'https://cdn.myanimelist.net/images/anime/8/73589l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/99/00/11/99001122-3344-5566-7788-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Silah ustaları ve canlı silahlara dönüşen öğrenciler (DWMA Akademisi).',
      'Maka Albarn, Soul Eater Evans, Death the Kid ve Black Star.',
      'T.M.Revolution sanatçısının efsane j-rock vokali.'
    ],
    options: ['Fire Force', 'Soul Eater', 'Bleach', 'D.Gray-man']
  },
  {
    id: 'song_great_teacher_onizuka',
    animeTitle: 'Great Teacher Onizuka (GTO)',
    animeTitleTR: 'Great Teacher Onizuka',
    songTitle: "Driver's High",
    artist: "L'Arc~en~Ciel",
    type: 'OP',
    themeNumber: 'OP 1',
    year: 1999,
    studio: 'Studio Pierrot',
    animeImage: 'https://cdn.myanimelist.net/images/anime/13/11120l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/00/11/22/00112233-4455-6677-8899-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Eski motosiklet çete liderinden sıra dışı lise öğretmenine dönüşen Eikichi Onizuka.',
      'L’Arc~en~Ciel grubunun motosiklet gaz sesiyle başlayan efsane şarkısı.',
      '"En iyi öğretmen, hayatı öğreten öğretmendir."'
    ],
    options: ['Gintama', 'Great Teacher Onizuka (GTO)', 'Slam Dunk', 'Golden Boy']
  },
  {
    id: 'song_hellsing_ready_steady',
    animeTitle: 'Fullmetal Alchemist (2003)',
    animeTitleTR: 'Fullmetal Alchemist',
    songTitle: 'Ready Steady Go',
    artist: "L'Arc~en~Ciel",
    type: 'OP',
    themeNumber: 'OP 2',
    year: 2003,
    studio: 'Bones',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/73249l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/11/22/33/11223344-5566-7788-9900-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '2003 yapımı orijinal FMA serisinin en enerjik açılışı.',
      'Edward Elric’in otomekazi protez kolları ve simya dövüşleri.',
      '"READY STEADY CAN’T HOLD ME BACK!"'
    ],
    options: ['Fullmetal Alchemist (2003)', 'D.Gray-man', 'Shaman King', 'Trigun']
  },
  {
    id: 'song_eminence_highest',
    animeTitle: 'The Eminence in Shadow (Kage no Jitsuryokusha ni Naritakute!)',
    animeTitleTR: 'The Eminence in Shadow',
    songTitle: 'HIGHEST',
    artist: 'OxT',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2022,
    studio: 'Nexus',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1874/128424l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/22/33/44/22334455-6677-8899-0011-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Gölgelerin ardındaki gizli lider rolü oynamak isteyen Cid Kagenou (Shadow).',
      'Gölge Bahçesi (Shadow Garden) ve Diablos Tarikatı.',
      'OxT ikilisinin havalı ve senfonik rock parçası.'
    ],
    options: ['Overlord', 'The Eminence in Shadow', 'Misfit of Demon King Academy', 'Trapped in a Dating Sim']
  },
  {
    id: 'song_wind_breaker_zettai',
    animeTitle: 'Wind Breaker',
    animeTitleTR: 'Wind Breaker',
    songTitle: 'Zettai Reikou (絶対零度)',
    artist: 'natori',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2024,
    studio: 'CloverWorks',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1733/141870l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/33/44/55/33445566-7788-9900-1122-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      '2024 bahar sezonunun en popüler liseli sokak dövüşçüleri animesi.',
      'Furin Lisesi "Bofurin" koruma çetesi ve Haruka Sakura.',
      'natori sanatçısının ritmik bas vokalleri.'
    ],
    options: ['Tokyo Revengers', 'Wind Breaker', 'Crows Zero', 'High & Low']
  },
  {
    id: 'song_kaiju_no8_abyss',
    animeTitle: 'Kaiju No. 8',
    animeTitleTR: 'Kaiju No. 8',
    songTitle: 'Abyss',
    artist: 'YUNGBLUD',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2024,
    studio: 'Production I.G',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1307/141873l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/44/55/66/44556677-8899-0011-2233-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'easy',
    hints: [
      'Canavar temizlikçisiyken içine küçük bir canavar giren 32 yaşındaki Kafka Hibino.',
      'Savunma Güçleri ve 8 Numaralı Canavar dönüşümü.',
      'İngiliz rock yıldızı YUNGBLUD tarafından seslendirilen uluslararası açılış.'
    ],
    options: ['Attack on Titan', 'Kaiju No. 8', 'Chainsaw Man', 'Godzilla Singular Point']
  },
  {
    id: 'song_hells_paradise_work',
    animeTitle: "Hell's Paradise (Jigokuraku)",
    animeTitleTR: "Hell's Paradise",
    songTitle: 'WORK',
    artist: 'millennium parade x Sheena Ringo',
    type: 'OP',
    themeNumber: 'OP 1',
    year: 2023,
    studio: 'MAPPA',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1481/133096l.webp',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/55/66/77/55667788-9900-1122-3344-100155252814/mzaf_10015525281489065604.plus.aac.p.m4a',
    difficulty: 'medium',
    hints: [
      'Ölümsüzlük iksirini bulmak için gizemli Shinsenkyo adasına gönderilen idam mahkumu ninjalar.',
      'Boşluktaki Gabimaru ve celladı Sagiri.',
      'Sheena Ringo ve King Gnu liderinin deneysel caz-rock işbirliği.'
    ],
    options: ['Dororo', "Hell's Paradise (Jigokuraku)", 'Demon Slayer', 'Ninja Kamui']
  }
];

// Helper to generate a playlist of exact length for 25, 50, 100 song challenges
export const generateArcadePlaylist = (targetCount: number = 25): QuizSong[] => {
  const result: QuizSong[] = [];
  let loopCount = 0;
  
  while (result.length < targetCount) {
    const shuffled = shuffleList(QUIZ_SONGS).map((song, idx) => ({
      ...song,
      id: `${song.id}_ch_${loopCount}_${idx}`
    }));
    result.push(...shuffled);
    loopCount++;
  }
  return result.slice(0, targetCount);
};

// Helper to get daily song deterministically by date string
export const getDailyQuizSong = (dateString?: string): QuizSong => {
  const date = dateString ? new Date(dateString) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Unique hash per day of year so it changes every 24h predictably
  const dayHash = year * 10000 + (month + 1) * 100 + day;
  const index = Math.abs(dayHash) % QUIZ_SONGS.length;
  return QUIZ_SONGS[index];
};

// Durations for the 6 stages in Daily Heardle mode (seconds)
export const DAILY_UNLOCK_STAGES = [1.5, 3.0, 6.0, 10.0, 18.0, 30.0];
