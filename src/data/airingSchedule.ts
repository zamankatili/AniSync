export interface AiringAnime {
  id: string;
  mal_id: number;
  /** MAL kimliği yoksa AniList detayına yönlendirmek için. */
  anilist_id?: number;
  title: string;
  title_english: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  timeTR: string;
  timeJST: string;
  /** Jikan/AniList bu alanı vermez; yalnızca AniList `airingSchedules.episode` doldurur. Yoksa undefined. */
  currentEpisode?: number;
  /** Unix saniyesi; AniList `airingSchedules.airingAt`. */
  airingAt?: number;
  totalEpisodes: number | null;
  image: string;
  studio: string;
  score: number;
  genres: string[];
  synopsis: string;
  streamingOn: string[];
  seasonYear?: string;
}

export const DAYS_OF_WEEK = [
  { key: 'monday', labelTR: 'Pazartesi', labelEN: 'Monday', shortTR: 'Pzt' },
  { key: 'tuesday', labelTR: 'Salı', labelEN: 'Tuesday', shortTR: 'Sal' },
  { key: 'wednesday', labelTR: 'Çarşamba', labelEN: 'Wednesday', shortTR: 'Çar' },
  { key: 'thursday', labelTR: 'Perşembe', labelEN: 'Thursday', shortTR: 'Per' },
  { key: 'friday', labelTR: 'Cuma', labelEN: 'Friday', shortTR: 'Cum' },
  { key: 'saturday', labelTR: 'Cumartesi', labelEN: 'Saturday', shortTR: 'Cmt' },
  { key: 'sunday', labelTR: 'Pazar', labelEN: 'Sunday', shortTR: 'Paz' },
] as const;

/**
 * NOT: Bu liste arşiv/yedek "örnek veri"dir ve sezon doğrulaması içermez.
 * Canlı yayın akışı `src/lib/airingService.ts` üzerinden AniList/Jikan'dan
 * çekilir; bu dosya yalnızca istemci tamamen ağa erişemediğinde
 * `stale: true` / "ÖRNEK VERİ" etiketiyle gösterilir. Güncel sezon varsaymayın.
 */
export const AIRING_SCHEDULE: AiringAnime[] = [
  // Pazartesi
  {
    id: 'air_mon_1',
    mal_id: 58941,
    title: 'Sakamoto Days',
    title_english: 'SAKAMOTO DAYS',
    day: 'monday',
    timeTR: '18:00',
    timeJST: '23:00',
    currentEpisode: 11,
    totalEpisodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1169/143761l.webp',
    studio: 'TMS Entertainment',
    score: 8.65,
    genres: ['Aksiyon', 'Komedi', 'Shounen'],
    synopsis: 'Eski efsanevi suikastçı Taro Sakamoto, market işletmesiyle huzurlu yaşamaya devam ederken geçmişi tekrar yakalar ve ailesini korumak için hareketi geçer.',
    streamingOn: ['Netflix'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_mon_2',
    mal_id: 54857,
    title: 'Kimi no Koto ga Daidaidaidaidaisuki na 100-nin no Kanojo 2nd Season',
    title_english: 'The 100 Girlfriends Who Really Love You 2nd Season',
    day: 'monday',
    timeTR: '19:30',
    timeJST: '00:30',
    currentEpisode: 9,
    totalEpisodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1066/141071l.webp',
    studio: 'Bibury Animation',
    score: 8.35,
    genres: ['Komedi', 'Romantizm', 'Parodi'],
    synopsis: 'Rentaro ve 100 ruh ikizisinin aşk kaosu son bölümlerine doğru ilerler; yeni karakterler ve dramatic anlatılarla dolu.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_mon_3',
    mal_id: 55644,
    title: 'Tower of God Season 2: Workshop Battle',
    title_english: 'Tower of God: Workshop Battle Arc',
    day: 'monday',
    timeTR: '21:00',
    timeJST: '02:00',
    currentEpisode: 23,
    totalEpisodes: 26,
    image: 'https://cdn.myanimelist.net/images/anime/1118/143529l.webp',
    studio: 'The Answer Studio',
    score: 7.62,
    genres: ['Aksiyon', 'Macera', 'Gizem'],
    synopsis: 'Atölye Savaşının son aşamasında Baam ve FUGnun kılıçları kesişir; kulenin en karanlık sırrı ortaya çıkar.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },

  // Salı
  {
    id: 'air_tue_1',
    mal_id: 56784,
    title: 'Wind Breaker Season 2',
    title_english: 'Wind Breaker Season 2',
    day: 'tuesday',
    timeTR: '19:00',
    timeJST: '00:00',
    currentEpisode: 9,
    totalEpisodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1815/141743l.webp',
    studio: 'CloverWorks',
    score: 8.15,
    genres: ['Aksiyon', 'Okul', 'Dövüş'],
    synopsis: 'Furin Lisesi Bofurin çetesi, yeni bir şehri tehdit eden suç örgütü ile savaşıyorum sırasında internesişit ilişkilerini derinleştirir.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_tue_2',
    mal_id: 54900,
    title: 'Kuroshitsuji: Emerald Witch Arc',
    title_english: 'Black Butler: Emerald Witch Arc',
    day: 'tuesday',
    timeTR: '20:30',
    timeJST: '01:30',
    currentEpisode: 8,
    totalEpisodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1204/141887l.webp',
    studio: 'CloverWorks',
    score: 8.22,
    genres: ['Gizem', 'Doğaüstü', 'Tarihi'],
    synopsis: 'Ciel ve Sebastian, Zümrüt Cadının efsanelerini araştırırken Almanca ormanların karanlık yüzünü keşfeder.',
    streamingOn: ['Crunchyroll', 'Netflix'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_tue_3',
    mal_id: 57400,
    title: 'Apocalypse Hotel',
    title_english: 'Apocalypse Hotel',
    day: 'tuesday',
    timeTR: '22:00',
    timeJST: '03:00',
    currentEpisode: 7,
    totalEpisodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
    studio: 'CygamesPictures',
    score: 7.88,
    genres: ['Bilim Kurgu', 'Komedi', 'Doğaüstü'],
    synopsis: 'Çöküşteki Ginzadaki son lüks otelde, misafir ağırlayan robot ekibinin sırrı ve medeniyetin sonu üzerine yeni ipuçları.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },

  // Çarşamba
  {
    id: 'air_wed_1',
    mal_id: 54857,
    title: 'Re:Zero kara Hajimeru Isekai Seikatsu 3rd Season',
    title_english: 'Re:ZERO -Starting Life in Another World- Season 3 (Counterattack)',
    day: 'wednesday',
    timeTR: '17:30',
    timeJST: '22:30',
    currentEpisode: 13,
    totalEpisodes: 16,
    image: 'https://cdn.myanimelist.net/images/anime/1160/142384l.webp',
    studio: 'White Fox',
    score: 8.78,
    genres: ['Dram', 'Fantastik', 'Psikolojik', 'Gerilim'],
    synopsis: 'Subaru, Priestella saldırısının ardından tarihin en büyük karşı taarruzunu yönetir; Eğlenceli Babanın sırrı ağır konu haline gelir.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_wed_2',
    mal_id: 57520,
    title: 'Dr. STONE SCIENCE FUTURE (Final Season Part 1)',
    title_english: 'Dr. STONE SCIENCE FUTURE',
    day: 'wednesday',
    timeTR: '19:00',
    timeJST: '00:00',
    currentEpisode: 9,
    totalEpisodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1487/142079l.webp',
    studio: 'TMS Entertainment',
    score: 8.54,
    genres: ['Bilim Kurgu', 'Macera', 'Shounen'],
    synopsis: 'Senku ve Bilim Krallığı, Ay gidiş roketini tamamlar ve Whymanın kaynağına doğru son küresel yolculuğa çıkar.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_wed_3',
    mal_id: 59301,
    title: 'Gachiakuta',
    title_english: 'Gachiakuta',
    day: 'wednesday',
    timeTR: '21:00',
    timeJST: '02:00',
    currentEpisode: 7,
    totalEpisodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg',
    studio: 'Bones',
    score: 8.41,
    genres: ['Aksiyon', 'Fantastik', 'Karanlık Shounen'],
    synopsis: 'Rudo, Uçurumdaki canavarlarla mücadele ederken jinki eşyalarının gizemli geçmişine dairy ipuçları bulmaya başlar.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },

  // Perşembe
  {
    id: 'air_thu_1',
    mal_id: 57334,
    title: 'Dan Da Dan',
    title_english: 'DAN DA DAN',
    day: 'thursday',
    timeTR: '18:00',
    timeJST: '23:00',
    currentEpisode: 15,
    totalEpisodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1487/142079l.webp',
    studio: 'Science SARU',
    score: 8.82,
    genres: ['Aksiyon', 'Komedi', 'Doğaüstü', 'Uzaylı'],
    synopsis: 'Momo ve Okarun, galaxy arası uzaylı saldırılarını önlemek için yeni bir ittifak kurar; sevgililikleri de sınanmaya başlar.',
    streamingOn: ['Netflix', 'Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_thu_2',
    mal_id: 59120,
    title: 'Kaiju No. 8 Season 2 (ve Hoshina Yan Hikaye)',
    title_english: 'Kaiju No. 8 Season 2',
    day: 'thursday',
    timeTR: '20:00',
    timeJST: '01:00',
    currentEpisode: 6,
    totalEpisodes: 12,
    image: 'https://cdn.myanimelist.net/images/anime/1739/140994l.webp',
    studio: 'Production I.G',
    score: 8.48,
    genres: ['Aksiyon', 'Bilim Kurgu', 'Askeri'],
    synopsis: 'Kafka ve 3. Bölük, Kaiju 9nun koordine edilmiş istilasına karşı son savunma hattını kurar; Hoshina yan hikayesi de devam eder.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_thu_3',
    mal_id: 58210,
    title: 'Rurouni Kenshin: Kyoto Disturbance',
    title_english: 'Rurouni Kenshin: Kyoto Disturbance',
    day: 'thursday',
    timeTR: '21:30',
    timeJST: '02:30',
    currentEpisode: 19,
    totalEpisodes: 23,
    image: 'https://cdn.myanimelist.net/images/anime/1208/135328l.jpg',
    studio: 'LIDENFILMS',
    score: 8.10,
    genres: ['Aksiyon', 'Samuray', 'Tarihi'],
    synopsis: 'Kenshin, Shishionun Kyoto yangın planını engellemek için son kılıç savaşına hazırlanır; Okinanın tarihi açılır.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },

  // Cuma
  {
    id: 'air_fri_1',
    mal_id: 52991,
    title: 'Sousou no Frieren Season 2 (Özel Ön Gösterim & Yayını)',
    title_english: 'Frieren: Beyond Journey\'s End Season 2',
    day: 'friday',
    timeTR: '18:30',
    timeJST: '23:30',
    currentEpisode: 5,
    totalEpisodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
    studio: 'Madhouse',
    score: 9.38,
    genres: ['Macera', 'Dram', 'Fantastik', 'Felsefe'],
    synopsis: 'Frieren, Fern ve Stark, Kuzey Yaylasındaki Aureole cennetine doğru yol alırken kadim anıları ve yeni hikayelerle karşılaşır.',
    streamingOn: ['Crunchyroll', 'Netflix'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_fri_2',
    mal_id: 58712,
    title: 'Fire Force Season 3 (Enen no Shouboutai: San no Shou)',
    title_english: 'Fire Force Season 3',
    day: 'friday',
    timeTR: '20:00',
    timeJST: '01:00',
    currentEpisode: 8,
    totalEpisodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg',
    studio: 'David Production',
    score: 8.32,
    genres: ['Aksiyon', 'Doğaüstü', 'Bilim Kurgu'],
    synopsis: 'Shinra ve 8. Bölük, Beyaz Pelerinlerin nihai planına karşı Adolla felaketini durdurmak için son savaşa girer.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_fri_3',
    mal_id: 54842,
    title: 'Dungeon Meshi Season 2 (Zindan Lezzetleri Devam)',
    title_english: 'Delicious in Dungeon Season 2',
    day: 'friday',
    timeTR: '21:30',
    timeJST: '02:30',
    currentEpisode: 6,
    totalEpisodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1489/141014l.webp',
    studio: 'Trigger',
    score: 8.68,
    genres: ['Macera', 'Komedi', 'Fantastik', 'Gurme'],
    synopsis: 'Laios ve ekibi, Zindanın Efendisi Thistle ile derin katlarda yeni egzotik canavar tarifleriyle yüzleşir ve sırları açar.',
    streamingOn: ['Netflix'],
    seasonYear: '2026 Sonbahar'
  },

  // Cumartesi
  {
    id: 'air_sat_1',
    mal_id: 52701,
    title: 'Bleach: Sennen Kessen-hen - Soukoku-tan (Part 3 & Final Hazırlığı)',
    title_english: 'Bleach: Thousand-Year Blood War - The Conflict',
    day: 'saturday',
    timeTR: '17:00',
    timeJST: '23:00',
    currentEpisode: 12,
    totalEpisodes: 13,
    image: 'https://cdn.myanimelist.net/images/anime/1912/143527l.webp',
    studio: 'Pierrot Films',
    score: 8.85,
    genres: ['Aksiyon', 'Macera', 'Doğaüstü'],
    synopsis: 'Ichigo ve Kaptanlar, Ruh Kralı Sarayının ele geçirilmesi sonucu Yhwach ile nihai savaşa girer; final hazırlığı ağırlar.',
    streamingOn: ['Disney+', 'Hulu'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_sat_2',
    mal_id: 52347,
    title: 'Ore dake Level Up na Ken Season 2: Arise from the Shadow',
    title_english: 'Solo Leveling Season 2: Arise from the Shadow',
    day: 'saturday',
    timeTR: '19:00',
    timeJST: '00:00',
    currentEpisode: 11,
    totalEpisodes: 13,
    image: 'https://cdn.myanimelist.net/images/anime/1210/141049l.webp',
    studio: 'A-1 Pictures',
    score: 8.74,
    genres: ['Aksiyon', 'Fantastik', 'Süper Güç'],
    synopsis: 'Sung Jin-Woo, Jeju Adası ve Busan baskınından sonra Gölge Ordusunu serbest bırakarak dünya temeline sarsmaya devam eder.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_sat_3',
    mal_id: 58514,
    title: 'Blue Lock vs. U-20 Japan (ve Şampiyonlar Ligi)',
    title_english: 'Blue Lock Season 2',
    day: 'saturday',
    timeTR: '20:30',
    timeJST: '01:30',
    currentEpisode: 13,
    totalEpisodes: 14,
    image: 'https://cdn.myanimelist.net/images/anime/1169/143761l.webp',
    studio: '8bit',
    score: 7.85,
    genres: ['Spor', 'Futbol', 'Psikolojik'],
    synopsis: 'Forvetler, Japonya U-20 takımına karşı kader maçında kimyasal reaksiyon ve akıl almaz gollerle parlar; Şampiyonlar LigiSerisi başlar.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_sat_4',
    mal_id: 54112,
    title: 'Shangri-La Frontier 2nd Season',
    title_english: 'Shangri-La Frontier Season 2',
    day: 'saturday',
    timeTR: '13:00',
    timeJST: '17:30',
    currentEpisode: 22,
    totalEpisodes: 25,
    image: 'https://cdn.myanimelist.net/images/anime/1138/142999l.webp',
    studio: 'C2C',
    score: 8.24,
    genres: ['Aksiyon', 'Macera', 'VRMMO'],
    synopsis: 'Sunraku, Yedi Efsanevi Canavar\'dan Ctarnidd of the Abyss ile okyanusun derinliklerini keşfeder ve yeni sırları ortaya çıkarır.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },

  // Pazar
  {
    id: 'air_sun_1',
    mal_id: 21,
    title: 'One Piece (Elbaf Arkı: Devler Ülkesi Başlıyor)',
    title_english: 'One Piece - Elbaf Arc',
    day: 'sunday',
    timeTR: '05:30',
    timeJST: '09:30',
    currentEpisode: 1130,
    totalEpisodes: null,
    image: 'https://cdn.myanimelist.net/images/anime/6/73245l.webp',
    studio: 'Toei Animation',
    score: 8.79,
    genres: ['Aksiyon', 'Macera', 'Fantastik', 'Korsan'],
    synopsis: 'Egghead sonrası Hasır Şapka Korsanları efsanevi savaşçılar diyarı Elbaf e adım basar; kadin Viking devleri ve Anahat sırrı karşısın.',
    streamingOn: ['Crunchyroll', 'Netflix'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_sun_2',
    mal_id: 5114,
    title: 'Jujutsu Kaisen 3. Sezon: Culling Game (Ölüm Oyunu Özel)',
    title_english: 'Jujutsu Kaisen Season 3: The Culling Game',
    day: 'sunday',
    timeTR: '18:00',
    timeJST: '23:30',
    currentEpisode: 7,
    totalEpisodes: 24,
    image: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg',
    studio: 'MAPPA',
    score: 8.92,
    genres: ['Aksiyon', 'Karanlık Fantazi', 'Doğaüstü'],
    synopsis: 'Yuji ve Megumi, Kenjakunun ölüm bariyerleri içinde yeniden doğmuş kadın büyücülerle savaşıyor; final yaklaşıyor.',
    streamingOn: ['Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  },
  {
    id: 'air_sun_3',
    mal_id: 59880,
    title: 'Lord of the Mysteries (Kıyamet Döngüsü & Tarot Kulübü)',
    title_english: 'Lord of the Mysteries',
    day: 'sunday',
    timeTR: '20:00',
    timeJST: '01:00',
    currentEpisode: 9,
    totalEpisodes: 16,
    image: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
    studio: 'B.CMAY PICTURES',
    score: 8.84,
    genres: ['Gizem', 'Viktoryen', 'Kozmik Korku', 'Steampunk'],
    synopsis: 'Klein Moretti, Viktoryen Londrada simya ve tarotun yasak güçleriyle mücadele ederken "Aptal" unvanının sırrı başını gösterir.',
    streamingOn: ['Tencent Video', 'Crunchyroll'],
    seasonYear: '2026 Sonbahar'
  }
];

