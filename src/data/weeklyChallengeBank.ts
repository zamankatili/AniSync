export interface ChallengeOption {
  id: string;
  text: string;
  votes: number;
  isCorrect?: boolean;
}

export interface ChallengeQuestion {
  id: string;
  dayIndex: number; // 0: Pazartesi, 1: Salı, 2: Çarşamba, 3: Perşembe, 4: Cuma, 5: Cumartesi, 6: Pazar, 7: Büyük Final
  dayNameTr: string;
  category: string;
  theme: string;
  difficulty?: 'Kolay' | 'Orta' | 'Zor' | 'Efsane';
  question: string;
  options: ChallengeOption[];
  explanation?: string;
  isOpinionPoll?: boolean; // True: Topluluk Görüş Oylaması, False: Bilgi Testi (Quiz)
}

export interface DayMetadata {
  dayIndex: number;
  id: string;
  name: string;
  shortName: string;
  theme: string;
  category: string;
  questionCount: number;
  accentColor: string;
  badge: string;
  description: string;
}

export const WEEK_DAYS_CONFIG: DayMetadata[] = [
  { 
    dayIndex: 0, 
    id: 'mon', 
    name: 'Pazartesi', 
    shortName: 'PZT', 
    theme: 'Shounen & Güç Sistemleri', 
    category: 'Aksiyon & Güç', 
    questionCount: 6, 
    accentColor: 'border-orange-500 text-orange-400 bg-orange-500/10', 
    badge: '🔥 Güç Çırağı',
    description: 'Nen, Haki, Çakra ve Lanetli Enerji derinliklerine in!'
  },
  { 
    dayIndex: 1, 
    id: 'tue', 
    name: 'Salı', 
    shortName: 'SAL', 
    theme: 'Seinen & Psikolojik Zeka', 
    category: 'Zeka & Psikoloji', 
    questionCount: 6, 
    accentColor: 'border-purple-500 text-purple-400 bg-purple-500/10', 
    badge: '🧠 Zihin Ustası',
    description: 'Monster, Berserk, Death Note satranç hamlelerini çöz!'
  },
  { 
    dayIndex: 2, 
    id: 'wed', 
    name: 'Çarşamba', 
    shortName: 'ÇAR', 
    theme: 'Romantizm & Slice of Life', 
    category: 'Duygu & Yaşam', 
    questionCount: 6, 
    accentColor: 'border-pink-500 text-pink-400 bg-pink-500/10', 
    badge: '🌸 Kalp Hırsızı',
    description: 'Kaguya-sama, Clannad, A Silent Voice ve saf duygular!'
  },
  { 
    dayIndex: 3, 
    id: 'thu', 
    name: 'Perşembe', 
    shortName: 'PER', 
    theme: 'Isekai & Fantastik Dünyalar', 
    category: 'Isekai & Büyü', 
    questionCount: 6, 
    accentColor: 'border-emerald-500 text-emerald-400 bg-emerald-500/10', 
    badge: '🌀 Boyut Gezgini',
    description: 'Re:Zero, Mushoku Tensei, Frieren ve büyü kuralları!'
  },
  { 
    dayIndex: 4, 
    id: 'fri', 
    name: 'Cuma', 
    shortName: 'CUM', 
    theme: 'Müzik, Sanat & Stüdyolar', 
    category: 'Sanat & Müzik', 
    questionCount: 6, 
    accentColor: 'border-cyan-500 text-cyan-400 bg-cyan-500/10', 
    badge: '🎵 Melodi Efendisi',
    description: 'Hiroyuki Sawano tınıları, Ufotable animasyonları ve efsane OP\'ler!'
  },
  { 
    dayIndex: 5, 
    id: 'sat', 
    name: 'Cumartesi', 
    shortName: 'CMT', 
    theme: 'Felsefe & Büyük İkilemler', 
    category: 'Felsefe & Ahlak', 
    questionCount: 6, 
    accentColor: 'border-amber-400 text-amber-300 bg-amber-400/10', 
    badge: '⚖️ Adalet Terazisi',
    description: 'Eşdeğer değişim, Sonsuz Tsukuyomi ve ahlaki seçimler!'
  },
  { 
    dayIndex: 6, 
    id: 'sun', 
    name: 'Pazar', 
    shortName: 'PAZ', 
    theme: 'Haftanın Karşılaşmaları & Fan Oylaması', 
    category: 'Büyük Düello', 
    questionCount: 6, 
    accentColor: 'border-rose-500 text-rose-400 bg-rose-500/10', 
    badge: '⚔️ Arena Şampiyonu',
    description: 'Haftanın en tartışmalı GOAT serileri ve topluluk seçimleri!'
  },
  { 
    dayIndex: 7, 
    id: 'finale', 
    name: 'Büyük Final', 
    shortName: 'FİNAL', 
    theme: 'Efsaneler Kulübü & Haftalık Grand Finale', 
    category: 'Grand Master', 
    questionCount: 8, 
    accentColor: 'border-yellow-400 text-yellow-300 bg-yellow-500/20', 
    badge: '👑 50 Soruluk Efsane',
    description: 'Haftanın 50 sorusunu taçlandıran 8 soruluk Grand Master etabı!'
  }
];

// ==========================================
// 50 SORULUK HAFTALIK MEYDAN OKUMA HAVUZU
// GÜN BAZLI 6 SORU (7 GÜN x 6 = 42 SORU) + 8 SORULUK BÜYÜK FİNAL = 50 SORU
// ==========================================
export const WEEKLY_50_CHALLENGE_BANK: ChallengeQuestion[] = [
  // ==========================================
  // GÜN 0: PAZARTESİ - SHOUNEN & GÜÇ SİSTEMLERİ (6 SORU)
  // ==========================================
  {
    id: "mon-1",
    dayIndex: 0,
    dayNameTr: "Pazartesi",
    category: "Shounen Bilgisi",
    theme: "Güç Sistemleri",
    difficulty: "Orta",
    question: "Hunter x Hunter'da Nen sisteminin 6 ana kategorisinden hangisi auranın özelliklerini (örneğin elektrik veya kauçuk) değiştirmeyi sağlar?",
    options: [
      { id: "enhancement", text: "Güçlendirme (Enhancement)", votes: 142 },
      { id: "transmutation", text: "Dönüşüm (Transmutation)", isCorrect: true, votes: 418 },
      { id: "conjuration", text: "Somutlaştırma (Conjuration)", votes: 98 },
      { id: "emission", text: "Yayma (Emission)", votes: 65 }
    ],
    explanation: "Transmutation (Dönüşüm), auranın özelliklerini (örneğin Killua'nın aurasını elektriğe, Hisoka'nın Bungee Gum'a dönüştürmesi gibi) değiştirmeyi sağlar.",
    isOpinionPoll: false
  },
  {
    id: "mon-2",
    dayIndex: 0,
    dayNameTr: "Pazartesi",
    category: "Shounen Oylaması",
    theme: "Efsanevi Dövüş",
    difficulty: "Kolay",
    question: "Tarihin koreografi ve duygu patlaması açısından en epik Shounen kapışması sence hangisiydi?",
    options: [
      { id: "gon_pitou", text: "Gon vs Pitou (Hunter x Hunter)", votes: 489 },
      { id: "naruto_sasuke", text: "Naruto vs Sasuke (Son Vadi / Final)", votes: 612 },
      { id: "kakashi_obito", text: "Kakashi vs Obito (Kamui Boyutu)", votes: 534 },
      { id: "luffy_lucci", text: "Luffy vs Rob Lucci (Enies Lobby)", votes: 320 }
    ],
    explanation: "Topluluk oylamalarında Kakashi vs Obito ve Naruto vs Sasuke başabaş yarışırken, duygusal ağırlığıyla Gon vs Pitou zirveye oynuyor.",
    isOpinionPoll: true
  },
  {
    id: "mon-3",
    dayIndex: 0,
    dayNameTr: "Pazartesi",
    category: "Shounen Bilgisi",
    theme: "One Piece Lore",
    difficulty: "Zor",
    question: "One Piece evreninde Kaido'yu yaralayan efsanevi 'Enma' kılıcını Roronoa Zoro'dan önce kullanan Wano kahramanı kimdir?",
    options: [
      { id: "ryuma", text: "Shimotsuki Ryuma", votes: 165 },
      { id: "oden", text: "Kozuki Oden", isCorrect: true, votes: 684 },
      { id: "sukiyaki", text: "Kozuki Sukiyaki", votes: 88 },
      { id: "ushimaru", text: "Shimotsuki Ushimaru", votes: 42 }
    ],
    explanation: "Enma, Kaido'nun göğsünde devasa yarayı açan efsanevi Wano samurayı Kozuki Oden'in kılıcıydı. Kızı Hiyori tarafından Zoro'ya devredildi.",
    isOpinionPoll: false
  },
  {
    id: "mon-4",
    dayIndex: 0,
    dayNameTr: "Pazartesi",
    category: "Shounen Oylaması",
    theme: "Felsefi Antagonist",
    difficulty: "Orta",
    question: "Hangisinin hedefine ulaşma felsefesi kendi evreni içinde daha tutarlı ve ikna ediciydi?",
    options: [
      { id: "pain", text: "Pain / Nagato (Dünyanın acıyı tadarak barışı koruması)", votes: 590 },
      { id: "madara", text: "Madara Uchiha (Yalan da olsa sonsuz huzur: Sonsuz Tsukuyomi)", votes: 410 },
      { id: "aizen", text: "Sosuke Aizen (Yozlaşmış kukla Ruh Kralı tahtını devirmek)", votes: 345 },
      { id: "meruem", text: "Meruem (Türün evrimsel zirvesi ve yetenek temelli adalet)", votes: 462 }
    ],
    explanation: "Pain'in 'Acıyı bilmeyen gerçek barışı anlayamaz' tezi anime tarihinin en çok tartışılan ahlaki çıkmazlarından biridir.",
    isOpinionPoll: true
  },
  {
    id: "mon-5",
    dayIndex: 0,
    dayNameTr: "Pazartesi",
    category: "Shounen Bilgisi",
    theme: "Jujutsu Kaisen",
    difficulty: "Orta",
    question: "Satoru Gojo'nun 'Sınırsızlık' (Limitless) tekniğinde 'Kırmızı' (Red - İtme) ve 'Mavi' (Blue - Çekme) birleşince hangi uzay yırtıcı teknik ortaya çıkar?",
    options: [
      { id: "black", text: "Kara Kıvılcım (Black Flash)", votes: 112 },
      { id: "purple", text: "Kalıntı Mor (Hollow Purple)", isCorrect: true, votes: 721 },
      { id: "infinity", text: "Sonsuz Boşluk (Infinite Void)", votes: 135 },
      { id: "azure", text: "Gök Gözü (Six Eyes)", votes: 45 }
    ],
    explanation: "Çekme (Mavi) ile İtme (Kırmızı) zıtlıklarının çarpışması kütlesel bir sanal enerji patlaması olan Mor (Hollow Purple) tekniğini üretir.",
    isOpinionPoll: false
  },
  {
    id: "mon-6",
    dayIndex: 0,
    dayNameTr: "Pazartesi",
    category: "Shounen Oylaması",
    theme: "Hype Anları",
    difficulty: "Kolay",
    question: "Anime tarihinde ilk izlediğinde sende en çok tüyleri diken diken eden dönüşüm sahnesi hangisiydi?",
    options: [
      { id: "ssj_goku", text: "Goku Süper Saiyan İlk Uyanış (Namek)", votes: 610 },
      { id: "gear5_luffy", text: "Luffy Gear 5 Özgürlük Davulları", votes: 524 },
      { id: "gon_rage", text: "Gon Yetişkin Formu / Bütün Geleceği Feda Ediş", votes: 540 },
      { id: "ichigo_vasto", text: "Ichigo Tam Hollow (Vasto Lorde vs Ulquiorra)", votes: 432 }
    ],
    explanation: "Goku'nun Krillin'in kaybıyla Süper Saiyan oluşu shounen türünün temel taşını koyarken, Gon'un dönüşümü dramatik doruk noktasıdır.",
    isOpinionPoll: true
  },

  // ==========================================
  // GÜN 1: SALI - SEINEN & PSİKOLOJİK ZEKA (6 SORU)
  // ==========================================
  {
    id: "tue-1",
    dayIndex: 1,
    dayNameTr: "Salı",
    category: "Seinen Bilgisi",
    theme: "Monster",
    difficulty: "Orta",
    question: "Naoki Urasawa'nın 'Monster' serisinde beyin cerrahı Dr. Kenzo Tenma'nın belediye başkanı yerine ameliyat edip hayatını kurtardığı dahi çocuk kimdir?",
    options: [
      { id: "johan", text: "Johan Liebert", isCorrect: true, votes: 635 },
      { id: "grimmer", text: "Wolfgang Grimmer", votes: 85 },
      { id: "dieter", text: "Dieter", votes: 40 },
      { id: "roberto", text: "Roberto", votes: 32 }
    ],
    explanation: "Dr. Tenma hastane politikasını çiğneyip ilk gelen hasta olan yetim Johan'ı kurtararak hikayenin karanlık zincirini başlatmıştır.",
    isOpinionPoll: false
  },
  {
    id: "tue-2",
    dayIndex: 1,
    dayNameTr: "Salı",
    category: "Seinen Oylaması",
    theme: "Zeka Düellosu",
    difficulty: "Kolay",
    question: "Tarihin en keskin taktiksel zeka düellosu sence hangi iki zihin arasındaydı?",
    options: [
      { id: "light_l", text: "Light Yagami vs L (Death Note)", votes: 780 },
      { id: "lelouch_schneizel", text: "Lelouch vs Schneizel (Code Geass)", votes: 290 },
      { id: "yang_reinhard", text: "Yang Wen-li vs Reinhard (Legend of Galactic Heroes)", votes: 215 },
      { id: "kaiji_tonegawa", text: "Kaiji vs Tonegawa (E-Card kumarı)", votes: 140 }
    ],
    explanation: "Light ve L arasındaki psikolojik kedi-fare oyunu dünya genelinde anime tarihinin en ikonik zeka savaşı kabul edilir.",
    isOpinionPoll: true
  },
  {
    id: "tue-3",
    dayIndex: 1,
    dayNameTr: "Salı",
    category: "Seinen Bilgisi",
    theme: "Berserk",
    difficulty: "Orta",
    question: "Berserk serisinde Griffith'in kurduğu ve Guts'ın kılıç ustası olarak katıldığı efsanevi paralı asker birliğinin adı nedir?",
    options: [
      { id: "hawks", text: "Şahinler Çetesi (Band of the Hawk)", isCorrect: true, votes: 710 },
      { id: "dragons", text: "Kızıl Ejderler (Red Dragons)", votes: 62 },
      { id: "holy_iron", text: "Kutsal Demir Zincir Şövalyeleri", votes: 54 },
      { id: "black_dog", text: "Kara Köpekler Şövalyeleri", votes: 38 }
    ],
    explanation: "Band of the Hawk, Midland Krallığı'nda zaferden zafere koşmuş ancak Griffith'in Tutulma (Eclipse) fedakarlığıyla trajik sona uğramıştır.",
    isOpinionPoll: false
  },
  {
    id: "tue-4",
    dayIndex: 1,
    dayNameTr: "Salı",
    category: "Seinen Oylaması",
    theme: "Varoluşsal Çöküş",
    difficulty: "Orta",
    question: "İnsanı zihinsel ve felsefi olarak en derinden sarsan Seinen başyapıtı hangisi?",
    options: [
      { id: "berserk", text: "Berserk (Acı, kader ve insan iradesi)", votes: 520 },
      { id: "vinland", text: "Vinland Saga (İntikam döngüsünden barışa uyanış)", votes: 410 },
      { id: "monster", text: "Monster (İçimizdeki saf kötülüğün kökeni)", votes: 380 },
      { id: "vagabond", text: "Vagabond (Kılıç, benlik ve varoluş felsefesi)", votes: 290 }
    ],
    explanation: "Her dört eser de şiddetin getirdiği boşluğu ve insanın içsel kurtuluş arayışını benzersiz şekilde ele alır.",
    isOpinionPoll: true
  },
  {
    id: "tue-5",
    dayIndex: 1,
    dayNameTr: "Salı",
    category: "Seinen Bilgisi",
    theme: "Vinland Saga",
    difficulty: "Kolay",
    question: "Vinland Saga 2. Sezonda (Farmland Arc) Thorfinn'in şiddet sarmalından kurtulurken benimsediği temel ilke nedir?",
    options: [
      { id: "no_enemies", text: "Benim hiç düşmanım yok (I have no enemies)", isCorrect: true, votes: 795 },
      { id: "valhalla", text: "Savaşarak Valhalla'ya ulaşmak", votes: 32 },
      { id: "king", text: "Kral Canute'u devirmek", votes: 24 },
      { id: "wealth", text: "Tüccar olup zenginleşmek", votes: 15 }
    ],
    explanation: "Babası Thors'un mirası olan 'Hiç kimsenin düşmanın yok, incitecek hiç kimsen yok' sözü Thorfinn'in gerçek savaşçı olmasını sağlamıştır.",
    isOpinionPoll: false
  },
  {
    id: "tue-6",
    dayIndex: 1,
    dayNameTr: "Salı",
    category: "Seinen Oylaması",
    theme: "Anti-Kahramanlar",
    difficulty: "Zor",
    question: "Hangisinin ahlaki sınırları hiçe sayan eylemleri kendi davası açısından daha haklı görülebilir?",
    options: [
      { id: "eren", text: "Eren Yeager (Paradis'in varlığı için tüm dünyayı ezmek)", votes: 490 },
      { id: "lelouch", text: "Lelouch vi Britannia (Sıfır Ağıtı ile nefreti üzerine çekmek)", votes: 560 },
      { id: "light", text: "Light Yagami (Korku salarak savaşı ve suçu sıfırlamak)", votes: 210 },
      { id: "kiritsugu", text: "Kiritsugu Emiya (Çoğunluğun hayatta kalması için azınlığı feda etmek)", votes: 330 }
    ],
    explanation: "Lelouch'un nihai fedakarlığı nefreti kendi üzerinde toplayıp ölmek iken, Eren'in Gürlemesi mutlak yok oluşu hedeflemiştir.",
    isOpinionPoll: true
  },

  // ==========================================
  // GÜN 2: ÇARŞAMBA - ROMANTİZM & SLICE OF LIFE (6 SORU)
  // ==========================================
  {
    id: "wed-1",
    dayIndex: 2,
    dayNameTr: "Çarşamba",
    category: "Romantizm Bilgisi",
    theme: "Kaguya-sama",
    difficulty: "Kolay",
    question: "Kaguya-sama: Love is War'da Shuchiin Akademisi Öğrenci Konseyi Başkanı ve dahi öğrenci kimdir?",
    options: [
      { id: "shirogane", text: "Miyuki Shirogane", isCorrect: true, votes: 680 },
      { id: "ishigami", text: "Yu Ishigami", votes: 95 },
      { id: "chika", text: "Chika Fujiwara", votes: 45 },
      { id: "miko", text: "Miko Iino", votes: 22 }
    ],
    explanation: "Miyuki Shirogane, varlıklı Shinomiya ailesinin kızı Kaguya'ya aşkını ilk itiraf ettiren taraf olmamak için zeka savaşları verir.",
    isOpinionPoll: false
  },
  {
    id: "wed-2",
    dayIndex: 2,
    dayNameTr: "Çarşamba",
    category: "Romantizm Oylaması",
    theme: "Duygusal Etki",
    difficulty: "Orta",
    question: "Gözyaşlarını tutmanın imkansıza en yakın olduğu anime yapımı hangisiydi?",
    options: [
      { id: "clannad", text: "Clannad: After Story (Tomoya & Ushio)", votes: 540 },
      { id: "your_lie", text: "Your Lie in April (Kaori'nin veda mektubu)", votes: 580 },
      { id: "anohana", text: "Anohana (Menma'yı bulduk sahnesi)", votes: 410 },
      { id: "violet", text: "Violet Evergarden (10. Bölüm anne mektupları)", votes: 460 }
    ],
    explanation: "Bu dört yapım duygusal doruk noktalarıyla anime topluluğunun mendil tüketen efsaneleri olarak bilinir.",
    isOpinionPoll: true
  },
  {
    id: "wed-3",
    dayIndex: 2,
    dayNameTr: "Çarşamba",
    category: "Romantizm Bilgisi",
    theme: "Makoto Shinkai",
    difficulty: "Orta",
    question: "Makoto Shinkai'nin 'Your Name' (Kimi no Na wa) filminde zaman, iplik ve kader bağlarını simgeleyen antik kavram nedir?",
    options: [
      { id: "musubi", text: "Musubi (Zaman ve İplik Bağları)", isCorrect: true, votes: 590 },
      { id: "kataware", text: "Kataware-doki", votes: 120 },
      { id: "tiamat", text: "Tiamat Kuyruklu Yıldızı", votes: 75 },
      { id: "omamori", text: "Omamori Tılsımı", votes: 35 }
    ],
    explanation: "Hitoha ninenin anlattığı Musubi: ipliklerin bükülmesi, düğümlenmesi, çözülmesi ve yeniden birleşmesi zamanın akışıdır.",
    isOpinionPoll: false
  },
  {
    id: "wed-4",
    dayIndex: 2,
    dayNameTr: "Çarşamba",
    category: "Romantizm Oylaması",
    theme: "İdeal Çift",
    difficulty: "Kolay",
    question: "Kimyası ve birbirini tamamlama biçimiyle tarihin en ikonik anime çifti kim?",
    options: [
      { id: "okabe_kurisu", text: "Okabe & Kurisu (Steins;Gate)", votes: 590 },
      { id: "holow_lawrence", text: "Holo & Lawrence (Spice and Wolf)", votes: 310 },
      { id: "tomoya_nagisa", text: "Tomoya & Nagisa (Clannad)", votes: 280 },
      { id: "hori_miyamura", text: "Hori & Miyamura (Horimiya)", votes: 360 }
    ],
    explanation: "Okabe ve Kurisu'nun zaman çizgilerini aşan bilimsel ve duygusal ortaklığı listenin gediklisidir.",
    isOpinionPoll: true
  },
  {
    id: "wed-5",
    dayIndex: 2,
    dayNameTr: "Çarşamba",
    category: "Romantizm Bilgisi",
    theme: "A Silent Voice",
    difficulty: "Kolay",
    question: "'A Silent Voice' (Koe no Katachi) filminde Shoya Ishida'nın insanlarla göz teması kuramadığı dönemde yüzlerinde gördüğü sembol nedir?",
    options: [
      { id: "blue_x", text: "Mavi 'X' çarpı işaretleri", isCorrect: true, votes: 720 },
      { id: "black_dots", text: "Siyah noktalar", votes: 45 },
      { id: "white_masks", text: "Beyaz maskeler", votes: 38 },
      { id: "blur", text: "Bulanık sis", votes: 22 }
    ],
    explanation: "Suçluluk ve utanç nedeniyle insanların yüzündeki 'X' işaretleri, Ishida kendini affedip dünyaya açıldığında yere düşer.",
    isOpinionPoll: false
  },
  {
    id: "wed-6",
    dayIndex: 2,
    dayNameTr: "Çarşamba",
    category: "Romantizm Oylaması",
    theme: "İyileştirici Anime (Iyashikei)",
    difficulty: "Kolay",
    question: "Yorucu bir günün ardından ruhunu en çok dinlendiren 'Iyashikei' serisi hangisi?",
    options: [
      { id: "yurucamp", text: "Yuru Camp (Sakin kamp ateşi ve doğa)", votes: 490 },
      { id: "natsume", text: "Natsume Yuujinchou (Ruhlar ve dingin dostluklar)", votes: 380 },
      { id: "mushishi", text: "Mushishi (Doğanın gizemli felsefi dengesi)", votes: 420 },
      { id: "bocchi", text: "Bocchi the Rock! (Sosyal anksiyete ve müzik neşesi)", votes: 370 }
    ],
    explanation: "Iyashikei türü, günlük streslerden arındıran sıcak ve minimalist anlatımlarıyla bilinir.",
    isOpinionPoll: true
  },

  // ==========================================
  // GÜN 3: PERŞEMBE - ISEKAI & FANTASTİK DÜNYALAR (6 SORU)
  // ==========================================
  {
    id: "thu-1",
    dayIndex: 3,
    dayNameTr: "Perşembe",
    category: "Isekai Bilgisi",
    theme: "Re:Zero",
    difficulty: "Orta",
    question: "Re:Zero'da Natsuki Subaru'nun öldüğünde zamanda geri dönmesini sağlayan gizemli yeteneğin adı nedir?",
    options: [
      { id: "return_by_death", text: "Ölümle Geri Dönüş (Return by Death)", isCorrect: true, votes: 780 },
      { id: "time_leap", text: "Zaman Sıçraması (Time Leap)", votes: 55 },
      { id: "witch_curse", text: "Cadının Yeniden Doğuşu", votes: 42 },
      { id: "samsara", text: "Samsara Döngüsü", votes: 18 }
    ],
    explanation: "Subaru, Kıskançlık Cadısı Satella tarafından verilen bu yetenek sayesinde her ölümünde kontrol noktasına hafızasını koruyarak geri döner.",
    isOpinionPoll: false
  },
  {
    id: "thu-2",
    dayIndex: 3,
    dayNameTr: "Perşembe",
    category: "Isekai Oylaması",
    theme: "Dünya İnşası (World-Building)",
    difficulty: "Orta",
    question: "Dünya inşası, coğrafi detaylar ve büyü kuralları açısından en başarılı Isekai evreni hangisi?",
    options: [
      { id: "mushoku", text: "Mushoku Tensei: Jobless Reincarnation (Altı Yüzlü Dünya)", votes: 590 },
      { id: "rezero", text: "Re:Zero (Lugnica ve Cadı Kültü loru)", votes: 480 },
      { id: "overlord", text: "Overlord (Nazarick ve Yeni Dünya siyaseti)", votes: 410 },
      { id: "slime", text: "Tensura (Jura Tempest Federasyonu inşası)", votes: 340 }
    ],
    explanation: "Mushoku Tensei dillerden ekonomiye kadar kapsamlı dünya kurgusuyla Isekai türünün öncülerindendir.",
    isOpinionPoll: true
  },
  {
    id: "thu-3",
    dayIndex: 3,
    dayNameTr: "Perşembe",
    category: "Isekai Bilgisi",
    theme: "Overlord",
    difficulty: "Orta",
    question: "Overlord serisinde Nazarick Büyük Mezarlığı'nın mutlak hükümdarı Ainz Ooal Gown'un gerçek dünyadaki insan adı nedir?",
    options: [
      { id: "suzuki", text: "Suzuki Satoru", isCorrect: true, votes: 640 },
      { id: "tanaka", text: "Tanaka Kenji", votes: 65 },
      { id: "yamamoto", text: "Yamamoto Hiroshi", votes: 45 },
      { id: "satou", text: "Satou Kazuma", votes: 90 }
    ],
    explanation: "Ainz Ooal Gown, distopik gelecekte yaşayan yalnız maaşlı çalışan Suzuki Satoru'dur.",
    isOpinionPoll: false
  },
  {
    id: "thu-4",
    dayIndex: 3,
    dayNameTr: "Perşembe",
    category: "Isekai Oylaması",
    theme: "Komedi & Parodi",
    difficulty: "Kolay",
    question: "Isekai klişeleriyle en zekice dalga geçen komedi kadrosu hangisi?",
    options: [
      { id: "konosuba", text: "KonoSuba (Kazuma, Aqua, Megumin, Darkness)", votes: 740 },
      { id: "eminence", text: "The Eminence in Shadow (Cid Kagenou'nun chuunibyou fantezisi)", votes: 520 },
      { id: "cautious", text: "Cautious Hero (Aşırı Temkinli Kahraman)", votes: 190 },
      { id: "uncle", text: "Uncle from Another World (Sega aşığı amca)", votes: 180 }
    ],
    explanation: "KonoSuba kadrosunun işlevsizliği ve Kazuma'nın gerçekçi sinir krizleri türün zirve komedisidir.",
    isOpinionPoll: true
  },
  {
    id: "thu-5",
    dayIndex: 3,
    dayNameTr: "Perşembe",
    category: "Fantezi Bilgisi",
    theme: "Sousou no Frieren",
    difficulty: "Kolay",
    question: "Frieren: Beyond Journey's End serisinde İblis Kralı öldüren Kahramanlar Partisi'nin lideri ve Frieren'e ilham veren kahraman kimdir?",
    options: [
      { id: "himmel", text: "Himmel", isCorrect: true, votes: 810 },
      { id: "heiter", text: "Heiter", votes: 40 },
      { id: "eisen", text: "Eisen", votes: 30 },
      { id: "flamme", text: "Flamme", votes: 45 }
    ],
    explanation: "Kahraman Himmel, kibar ve bencil olmayan doğasıyla Frieren'in insan kalbini anlamak için çıktığı yeni yolculuğun kıvılcımıdır.",
    isOpinionPoll: false
  },
  {
    id: "thu-6",
    dayIndex: 3,
    dayNameTr: "Perşembe",
    category: "Isekai Oylaması",
    theme: "İkonik Hamle",
    difficulty: "Kolay",
    question: "Gerçek hayatta sadece bir defalığına kullanma hakkın olsa hangi büyüyü patlatmak isterdin?",
    options: [
      { id: "explosion", text: "Megumin'in 'EXPLOSION!' nükleer büyü patlaması", votes: 620 },
      { id: "atomic", text: "Cid Kagenou'nun 'I... AM... ATOMIC' darbesi", votes: 540 },
      { id: "gate", text: "Gilgamesh'in 'Gate of Babylon' hazine kapısı", votes: 480 },
      { id: "teleport", text: "Sonsuz Envanter ve Boyutlararası Işınlanma", votes: 310 }
    ],
    explanation: "Megumin'in manasını tüketene kadar attığı Explosion ve Cid'in fısıltıyla söylediği Atomic popüler kültür fenomenidir.",
    isOpinionPoll: true
  },

  // ==========================================
  // GÜN 4: CUMA - MÜZİK, SANAT & STÜDYOLAR (6 SORU)
  // ==========================================
  {
    id: "fri-1",
    dayIndex: 4,
    dayNameTr: "Cuma",
    category: "Müzik Bilgisi",
    theme: "Evangelion",
    difficulty: "Orta",
    question: "Neon Genesis Evangelion'un efsanevi açılış şarkısı 'A Cruel Angel's Thesis'i (Zankoku na Tenshi no Teze) seslendiren sanatçı kimdir?",
    options: [
      { id: "takahashi", text: "Yoko Takahashi", isCorrect: true, votes: 580 },
      { id: "lisa", text: "LiSA", votes: 85 },
      { id: "aimer", text: "Aimer", votes: 60 },
      { id: "utada", text: "Hikaru Utada", votes: 110 }
    ],
    explanation: "Yoko Takahashi 1995 yılında şarkıyı seslendirerek karaoke salonlarının ve anime tarihinin en çok çalınan şarkısını yaratmıştır.",
    isOpinionPoll: false
  },
  {
    id: "fri-2",
    dayIndex: 4,
    dayNameTr: "Cuma",
    category: "Stüdyo Oylaması",
    theme: "Animasyon Kalitesi",
    difficulty: "Kolay",
    question: "Görsel şölen, partikül efektleri ve dövüş akıcılığı konusunda şu an hangi stüdyo zirvede?",
    options: [
      { id: "ufotable", text: "Ufotable (Demon Slayer, Fate/stay night)", votes: 720 },
      { id: "mappa", text: "MAPPA (Jujutsu Kaisen, Chainsaw Man)", votes: 580 },
      { id: "kyoani", text: "Kyoto Animation (Violet Evergarden, Hyouka)", votes: 390 },
      { id: "wit", text: "Wit Studio (AOT 1-3, Vinland Saga S1)", votes: 240 }
    ],
    explanation: "Ufotable'ın 3D dijital kompozisyon ve dinamik ışıklandırması anime dünyasında çıtayı belirlemiştir.",
    isOpinionPoll: true
  },
  {
    id: "fri-3",
    dayIndex: 4,
    dayNameTr: "Cuma",
    category: "Müzik Bilgisi",
    theme: "Besteciler",
    difficulty: "Orta",
    question: "Attack on Titan, Solo Leveling ve Kill la Kill serilerinin heyecan fırtınası orkestral müziklerini besteleyen maestro kimdir?",
    options: [
      { id: "sawano", text: "Hiroyuki Sawano", isCorrect: true, votes: 780 },
      { id: "kanno", text: "Yoko Kanno", votes: 45 },
      { id: "hisaishi", text: "Joe Hisaishi", votes: 75 },
      { id: "kajiura", text: "Yuki Kajiura", votes: 35 }
    ],
    explanation: "Hiroyuki Sawano (SawanoDrop), patlayan orkestral davulları ve güçlü kadın vokalleriyle epik müziklerin kralıdır.",
    isOpinionPoll: false
  },
  {
    id: "fri-4",
    dayIndex: 4,
    dayNameTr: "Cuma",
    category: "Müzik Oylaması",
    theme: "Açılış Şarkısı (OP)",
    difficulty: "Kolay",
    question: "Dinlemekten asla bıkılmayan, introyu asla atlatmayan Shounen açılışı hangisi?",
    options: [
      { id: "unravel", text: "Unravel - TK from Ling Tosite Sigure (Tokyo Ghoul)", votes: 640 },
      { id: "silhouette", text: "Silhouette - KANA-BOON (Naruto Shippuden)", votes: 590 },
      { id: "gurenge", text: "Gurenge - LiSA (Demon Slayer)", votes: 320 },
      { id: "again", text: "Again - YUI (Fullmetal Alchemist: Brotherhood)", votes: 480 }
    ],
    explanation: "Tokyo Ghoul'un Unravel ve Naruto'nun Silhouette parçaları YouTube'da yüz milyonlarca dinlenmeye ulaşmıştır.",
    isOpinionPoll: true
  },
  {
    id: "fri-5",
    dayIndex: 4,
    dayNameTr: "Cuma",
    category: "Sanat Bilgisi",
    theme: "Studio Ghibli",
    difficulty: "Kolay",
    question: "Studio Ghibli'nin neredeyse tüm ikonik klasiklerinin (Spirited Away, Howl's Moving Castle, Mononoke) piyano ve orkestra müziklerini besteleyen efsane kimdir?",
    options: [
      { id: "hisaishi", text: "Joe Hisaishi", isCorrect: true, votes: 795 },
      { id: "sawano", text: "Hiroyuki Sawano", votes: 45 },
      { id: "susumu", text: "Susumu Hirasawa", votes: 30 },
      { id: "sagisu", text: "Shirou Sagisu", votes: 20 }
    ],
    explanation: "Joe Hisaishi ve Hayao Miyazaki ortaklığı, sinema tarihinin en büyük müzik-yönetmen birlikteliklerinden biridir.",
    isOpinionPoll: false
  },
  {
    id: "fri-6",
    dayIndex: 4,
    dayNameTr: "Cuma",
    category: "Seslendirmen Oylaması",
    theme: "Seiyuu Gücü",
    difficulty: "Orta",
    question: "Sesini duyduğun anda karakterin aurasını bambaşka seviyeye taşıyan Japon seslendirmen kim?",
    options: [
      { id: "tsuda", text: "Kenjiro Tsuda (Kento Nanami, Kishibe, Seto Kaiba)", votes: 680 },
      { id: "kamiya", text: "Hiroshi Kamiya (Levi Ackerman, Trafalgar Law)", votes: 520 },
      { id: "miyano", text: "Mamoru Miyano (Light Yagami, Okabe Rintaro)", votes: 430 },
      { id: "koyasu", text: "Takehito Koyasu (Dio Brando, Toji Fushiguro)", votes: 390 }
    ],
    explanation: "Kenjiro Tsuda'nın derin bariton sesi ve Kamiya'nın Levi replikleri anime seslendirme sanatının zirveleridir.",
    isOpinionPoll: true
  },

  // ==========================================
  // GÜN 5: CUMARTESİ - FELSEFE & BÜYÜK İKİLEMLER (6 SORU)
  // ==========================================
  {
    id: "sat-1",
    dayIndex: 5,
    dayNameTr: "Cumartesi",
    category: "Felsefe Bilgisi",
    theme: "Fullmetal Alchemist",
    difficulty: "Kolay",
    question: "Fullmetal Alchemist'te Simya biliminin temelini oluşturan ve 'Bir şey elde etmek için eşit değerde bir şey feda edilmelidir' diyen yasa nedir?",
    options: [
      { id: "equivalent_exchange", text: "Eşdeğer Değiş-Tokuş Kanunu (Equivalent Exchange)", isCorrect: true, votes: 820 },
      { id: "philosopher_law", text: "Felsefe Taşı Prensibi", votes: 35 },
      { id: "ouroboros", text: "Ouroboros Çemberi", votes: 28 },
      { id: "truth_order", text: "Hakikat Düzeni", votes: 22 }
    ],
    explanation: "Edward ve Alphonse Elric kardeşlerin annelerini canlandırmaya çalışırken kaybettikleri bedenleri bu yasanın ihlal edilemezliğini öğretmiştir.",
    isOpinionPoll: false
  },
  {
    id: "sat-2",
    dayIndex: 5,
    dayNameTr: "Cumartesi",
    category: "Felsefe Oylaması",
    theme: "Ahlaki İkilem",
    difficulty: "Orta",
    question: "Death Note defteri gerçek dünyada senin eline geçseydi, suçluları cezalandırmak için kullanır mıydın?",
    options: [
      { id: "never", text: "Asla! Hiç kimse yaşam ve ölüm yargıcı olamaz.", votes: 490 },
      { id: "only_worst", text: "Yalnızca kanıtlanmış en azılı katiller için kullanırdım.", votes: 530 },
      { id: "kira_way", text: "Kira gibi dünyayı tamamen temizlemek için kullanırdım.", votes: 190 },
      { id: "destroy", text: "Hemen defteri yakar ve varlığını unuturdum.", votes: 380 }
    ],
    explanation: "Topluluk oylamalarında insanların %50'si gücün yozlaştıracağı korkusuyla defteri yok etmeyi savunurken, %35'i azılı suçlular için cezayı düşünüyor.",
    isOpinionPoll: true
  },
  {
    id: "sat-3",
    dayIndex: 5,
    dayNameTr: "Cumartesi",
    category: "Felsefe Bilgisi",
    theme: "Steins;Gate",
    difficulty: "Orta",
    question: "Steins;Gate'te Okabe Rintaro'nun dünya çizgileri değiştiğinde dahi önceki zaman çizgisindeki anılarını kaybetmemesini sağlayan yetenek nedir?",
    options: [
      { id: "reading_steiner", text: "Reading Steiner", isCorrect: true, votes: 760 },
      { id: "divergence_meter", text: "Divergence Algısı", votes: 65 },
      { id: "amadeus", text: "Amadeus Hafızası", votes: 45 },
      { id: "attractor_field", text: "Attractor Çekimi", votes: 30 }
    ],
    explanation: "Okabe, 'Reading Steiner' yeteneği sayesinde zaman kırılmalarında zihnini korur ancak tüm trajedileri tek başına hatırlamanın yalnızlığını çeker.",
    isOpinionPoll: false
  },
  {
    id: "sat-4",
    dayIndex: 5,
    dayNameTr: "Cumartesi",
    category: "Felsefe Oylaması",
    theme: "Attack on Titan",
    difficulty: "Zor",
    question: "Eren Yeager'ın 'Gürleme' (Rumbling) kararı Paradis Adası için tek gerçek kurtuluş yolu muydu?",
    options: [
      { id: "only_choice", text: "Evet, dış dünya Paradis'i tamamen yok etmeye yemin etmişti.", votes: 580 },
      { id: "armin_way", text: "Hayır, diplomasi ve kısmi caydırıcılık denenmeliydi.", votes: 390 },
      { id: "zeke_plan", text: "Zeke'in kansız ötenazi planı daha ahlakiydi.", votes: 190 },
      { id: "tragedy", text: "Kaçınılmaz bir nefret döngüsüydü, kesin bir haklı taraf yok.", votes: 490 }
    ],
    explanation: "Attack on Titan'ın finali, nefret döngüsünün ve uluslararası faşizmin yarattığı çaresizliği gözler önüne serer.",
    isOpinionPoll: true
  },
  {
    id: "sat-5",
    dayIndex: 5,
    dayNameTr: "Cumartesi",
    category: "Lore Bilgisi",
    theme: "Fate Serisi",
    difficulty: "Orta",
    question: "Fate/stay night evreninde Fuyuki Kutsal Kase Savaşı'nda (Holy Grail War) kaç Usta (Master) ve kaç Hizmetkâr (Servant) çarpışır?",
    options: [
      { id: "seven", text: "7 Usta ve 7 Hizmetkâr", isCorrect: true, votes: 710 },
      { id: "five", text: "5 Usta ve 5 Hizmetkâr", votes: 40 },
      { id: "nine", text: "9 Usta ve 9 Hizmetkâr", votes: 35 },
      { id: "twelve", text: "12 Usta ve 12 Hizmetkâr", votes: 20 }
    ],
    explanation: "Geleneksel Fuyuki Kutsal Kase Savaşı 7 sınıf (Saber, Archer, Lancer, Rider, Caster, Assassin, Berserker) üzerinden yürütülür.",
    isOpinionPoll: false
  },
  {
    id: "sat-6",
    dayIndex: 5,
    dayNameTr: "Cumartesi",
    category: "Felsefe Oylaması",
    theme: "Ölümsüzlük mü, Fani Yaşam mı?",
    difficulty: "Orta",
    question: "Frieren gibi binlerce yıl yaşamak ama sevdiklerinin yaşlanıp gidişini izlemek mi, yoksa normal bir fani ömür mü?",
    options: [
      { id: "elf_life", text: "Frieren gibi binlerce yıl yaşayıp dünyayı ve sihri keşfetmek", votes: 460 },
      { id: "human_life", text: "Fani bir insan olup her anın kıymetini bilerek yaşlanmak", votes: 620 }
    ],
    explanation: "Frieren'in temel teması, sınırlı bir hayatın paylaşılan anlara kattığı paha biçilmez değerdir.",
    isOpinionPoll: true
  },

  // ==========================================
  // GÜN 6: PAZAR - HAFTANIN KARŞILAŞMALARI & FAN OYLAMASI (6 SORU)
  // ==========================================
  {
    id: "sun-1",
    dayIndex: 6,
    dayNameTr: "Pazar",
    category: "Haftalık Final",
    theme: "Keçi (G.O.A.T)",
    difficulty: "Orta",
    question: "Tüm zamanların kusursuz kurgulanmış tartışmasız en büyük anime başyapıtı hangisi?",
    options: [
      { id: "fmab", text: "Fullmetal Alchemist: Brotherhood", votes: 740 },
      { id: "aot", text: "Attack on Titan", votes: 680 },
      { id: "steins_gate", text: "Steins;Gate", votes: 510 },
      { id: "hxh", text: "Hunter x Hunter (2011)", votes: 490 }
    ],
    explanation: "FMAB ve Attack on Titan, MyAnimeList ve dünya genelinde en çok oylanan ve en yüksek puanlı zirve serileridir.",
    isOpinionPoll: true
  },
  {
    id: "sun-2",
    dayIndex: 6,
    dayNameTr: "Pazar",
    category: "Haftalık Final",
    theme: "Manga vs Anime",
    difficulty: "Kolay",
    question: "Mangası görsel sanat ve anlatım olarak animesinden fersah fersah üstün olan seri hangisi?",
    options: [
      { id: "berserk_manga", text: "Berserk (Miura'nın çizim detayları eşsiz)", votes: 820 },
      { id: "tokyo_ghoul_manga", text: "Tokyo Ghoul (:re ve kök hikaye bütünlüğü)", votes: 460 },
      { id: "vagabond_manga", text: "Vagabond (Inoue'nin fırça sanatı)", votes: 390 },
      { id: "one_punch_manga", text: "One Punch Man (Murata çizim harikası)", votes: 310 }
    ],
    explanation: "Berserk 1997 animesi dışında hiçbir 3D uyarlamanın Miura'nın kalemine yaklaşamaması mangayı tartışmasız kılmıştır.",
    isOpinionPoll: true
  },
  {
    id: "sun-3",
    dayIndex: 6,
    dayNameTr: "Pazar",
    category: "Haftalık Final",
    theme: "Gelecek Beklentisi",
    difficulty: "Kolay",
    question: "Önümüzdeki dönemde vizyona girmesini en büyük sabırsızlıkla iple çektiğin yapım?",
    options: [
      { id: "demon_slayer_movie", text: "Demon Slayer: Sonsuzluk Kalesi Filmleri Üçlemesi", votes: 670 },
      { id: "chainsaw_reze", text: "Chainsaw Man: Reze Arc Filmi", votes: 530 },
      { id: "jjk_season3", text: "Jujutsu Kaisen 3. Sezon (Culling Game)", votes: 610 },
      { id: "one_piece_remake", text: "The One Piece (Wit Studio Remake)", votes: 420 }
    ],
    explanation: "Sonsuzluk Kalesi üçlemesi ve JJK Culling Game sinema ve yayın tarihlerini kıracak dev projelerdir.",
    isOpinionPoll: true
  },
  {
    id: "sun-4",
    dayIndex: 6,
    dayNameTr: "Pazar",
    category: "Haftalık Final",
    theme: "Kült Başyapıt",
    difficulty: "Orta",
    question: "Her anime severin hayatında en az bir kez mutlaka baştan sona izlemesi gereken kült yapım?",
    options: [
      { id: "cowboy_bebop", text: "Cowboy Bebop (1998 Caz ve Uzay Melankolisi)", votes: 590 },
      { id: "evangelion", text: "Neon Genesis Evangelion (1995 Psikolojik Çöküş)", votes: 540 },
      { id: "death_note", text: "Death Note (2006 Giriş Kapısı)", votes: 610 },
      { id: "spirited_away", text: "Spirited Away (Oscar Ödüllü Ruhların Kaçışı)", votes: 480 }
    ],
    explanation: "Cowboy Bebop yetişkin teması, müziği ve felsefesiyle batıda animenin kabul edilmesini sağlayan başyapıttır.",
    isOpinionPoll: true
  },
  {
    id: "sun-5",
    dayIndex: 6,
    dayNameTr: "Pazar",
    category: "Haftalık Final",
    theme: "Sadakat ve Yoldaşlık",
    difficulty: "Kolay",
    question: "Tarihin en sadık, dostu için canını gözünü kırpmadan ortaya koyan yoldaşı kimdir?",
    options: [
      { id: "zoro", text: "Roronoa Zoro (Luffy'nin acısını tek başına yüklenişi: 'Hiçbir şey olmadı')", votes: 780 },
      { id: "rem", text: "Rem (Subaru'ya 'Sıfırdan Başla' diyerek hayatını kurtarışı)", votes: 390 },
      { id: "speedwagon", text: "Robert E. O. Speedwagon (Joestar soyunun koruyucu meleği)", votes: 310 },
      { id: "killua", text: "Killua Zoldyck (Gon'un ışığı için ailesine karşı duruşu)", votes: 490 }
    ],
    explanation: "Zoro'nun Kuma karşısında 'Hiçbir şey olmadı' dediği Thriller Bark sahnesi sadakatin zirvesidir.",
    isOpinionPoll: true
  },
  {
    id: "sun-6",
    dayIndex: 6,
    dayNameTr: "Pazar",
    category: "Haftalık Final",
    theme: "En İyi Anime Yılı",
    difficulty: "Orta",
    question: "Çıkan serilerin yoğunluğu ve kalitesiyle tarihin en unutulmaz anime yılı hangisiydi?",
    options: [
      { id: "year_2011", text: "2011 (HxH, Steins;Gate, Fate/Zero, Madoka Magica)", votes: 620 },
      { id: "year_2019", text: "2019 (Demon Slayer S1, Vinland S1, Mob Psycho S2, Promised Neverland)", votes: 540 },
      { id: "year_2022", text: "2022 (Bleach TYBW, Chainsaw Man, Spy x Family, Bocchi)", votes: 410 },
      { id: "year_2023", text: "2023 (Frieren, JJK S2 Shibuya, Oshi no Ko, Vinland S2)", votes: 590 }
    ],
    explanation: "2011 yılı hem Steins;Gate hem HxH hem Fate/Zero gibi başyapıtları aynı yıl izleyicilerle buluşturmuştur.",
    isOpinionPoll: true
  },

  // ==========================================
  // GÜN 7: BÜYÜK FİNAL / GRAND FINALE (8 SORU) -> TOPLAM: 42 + 8 = 50 SORU!
  // ==========================================
  {
    id: "finale-1",
    dayIndex: 7,
    dayNameTr: "Büyük Final",
    category: "Efsaneler Kulübü",
    theme: "Bleach Kılıç Ustası",
    difficulty: "Orta",
    question: "Bleach serisinde Kurosaki Ichigo'nun Zanpakuto'sunun gerçek adı nedir?",
    options: [
      { id: "senbon", text: "Senbonzakura", votes: 42 },
      { id: "zangetsu", text: "Zangetsu (Ay Kesen)", isCorrect: true, votes: 760 },
      { id: "zabimaru", text: "Zabimaru", votes: 35 },
      { id: "hyorin", text: "Hyorinmaru", votes: 28 }
    ],
    explanation: "Ichigo'nun kılıcı Zangetsu (Ay Kesen), içindeki Quincy ve Hollow güçlerinin birleşimidir.",
    isOpinionPoll: false
  },
  {
    id: "finale-2",
    dayIndex: 7,
    dayNameTr: "Büyük Final",
    category: "Efsaneler Kulübü",
    theme: "Psycho-Pass Sibyl",
    difficulty: "Zor",
    question: "Psycho-Pass evreninde vatandaşların suç eğilimini hesaplayan ve Dominator silahlarını yöneten merkezi sistemin adı nedir?",
    options: [
      { id: "sibyl", text: "Sibyl Sistemi", isCorrect: true, votes: 680 },
      { id: "dominator", text: "Dominator Protokolü", votes: 78 },
      { id: "magi", text: "MAGI Süperbilgisayarı", votes: 45 },
      { id: "enigma", text: "Enigma Matrisi", votes: 24 }
    ],
    explanation: "Sibyl Sistemi, suç katsayısını hesaplayarak insan kaderini yöneten kolektif bir asemptomatik beyin ağıdır.",
    isOpinionPoll: false
  },
  {
    id: "finale-3",
    dayIndex: 7,
    dayNameTr: "Büyük Final",
    category: "Efsaneler Kulübü",
    theme: "Toradora Tsundere",
    difficulty: "Kolay",
    question: "Toradora animesinde Taiga Aisaka'ya minyon boyuna ve hırçın doğasına ithafen takılan meşhur lakap nedir?",
    options: [
      { id: "palmtop_tiger", text: "Cep Kaplanı (Palmtop Tiger)", isCorrect: true, votes: 790 },
      { id: "tsundere_queen", text: "Küçük Ejderha", votes: 55 },
      { id: "golden_lion", text: "Altın Aslan", votes: 32 },
      { id: "mini_fury", text: "Kutup Ayısı", votes: 18 }
    ],
    explanation: "Taiga, küçük cüssesine rağmen herkese kafa tuttuğu için okulda 'Tenori Taiga' (Cep Kaplanı) olarak anılır.",
    isOpinionPoll: false
  },
  {
    id: "finale-4",
    dayIndex: 7,
    dayNameTr: "Büyük Final",
    category: "Efsaneler Kulübü",
    theme: "Tensura İttifakı",
    difficulty: "Orta",
    question: "That Time I Got Reincarnated as a Slime'da Rimuru ile Fırtına Ejderhası Veldora'nın birbirlerine verdiği ortak aile soyadı nedir?",
    options: [
      { id: "tempest", text: "Tempest", isCorrect: true, votes: 740 },
      { id: "veldora", text: "Veldora", votes: 62 },
      { id: "jura", text: "Jura", votes: 48 },
      { id: "chaos", text: "Chaos", votes: 20 }
    ],
    explanation: "Fırtına Ejderhası Veldora ve Rimuru birbirlerine 'Tempest' soyadını vererek ruhani eşitlik ve dostluk yemini etmiştir.",
    isOpinionPoll: false
  },
  {
    id: "finale-5",
    dayIndex: 7,
    dayNameTr: "Büyük Final",
    category: "Efsaneler Kulübü",
    theme: "Bocchi Müzik Grubu",
    difficulty: "Kolay",
    question: "Bocchi the Rock! animesinde Hitori Gotoh ve arkadaşlarının kurduğu müzik grubunun adı nedir?",
    options: [
      { id: "kessoku", text: "Kessoku Band", isCorrect: true, votes: 810 },
      { id: "houkago", text: "After-School Tea Time", votes: 60 },
      { id: "given", text: "The Given", votes: 25 },
      { id: "beck", text: "Mongolian Chop Squad", votes: 15 }
    ],
    explanation: "Kessoku Band (Birlik Grubu), üyelerinin soyadları efsanevi Asian Kung-Fu Generation üyelerinden esinlenilmiştir.",
    isOpinionPoll: false
  },
  {
    id: "finale-6",
    dayIndex: 7,
    dayNameTr: "Büyük Final",
    category: "Efsaneler Kulübü",
    theme: "Evangelion Teolojisi",
    difficulty: "Zor",
    question: "Neon Genesis Evangelion'da insanlığın bireysel ego sınırlarını yok edip tüm ruhları tek bir bilince toplamayı hedefleyen nihai plan nedir?",
    options: [
      { id: "instrumentality", text: "İnsanı Tamamlama Projesi (Human Instrumentality)", isCorrect: true, votes: 690 },
      { id: "dead_sea", text: "Ölü Deniz Parşömenleri", votes: 75 },
      { id: "third_impact", text: "Üçüncü Patlama Protokolü", votes: 85 },
      { id: "adam_project", text: "Adem Uyanış Planı", votes: 35 }
    ],
    explanation: "SEELE ve Gendo Ikari'nin yürüttüğü proje, insanın yalnızlık ve iletişim acısını yok etmek için ruhları LCL denizinde birleştirmeyi hedefler.",
    isOpinionPoll: false
  },
  {
    id: "finale-7",
    dayIndex: 7,
    dayNameTr: "Büyük Final",
    category: "Efsaneler Kulübü",
    theme: "Gerçeklik mi, Hayal mi?",
    difficulty: "Zor",
    question: "Madara Uchiha'nın 'Sonsuz Tsukuyomi'si acısız, savaşsız, herkesin arzusunun gerçekleştiği kusursuz bir rüya vaat ediyordu. Bu rüyaya teslim olur muydun?",
    options: [
      { id: "accept_dream", text: "Evet, gerçek dünyanın savaş ve acılarındansa sonsuz barış ve huzurlu rüya daha iyidir.", votes: 410 },
      { id: "reject_dream", text: "Hayır, sahte ve iradesiz bir cennettens e acı da olsa özgür ve gerçek hayatı seçerim.", votes: 720 }
    ],
    explanation: "Topluluk oylamalarında çoğunluk 'acı da olsa gerçek özgürlük' derken, Madara'nın vaadi derin felsefi bir haklılık payı taşır.",
    isOpinionPoll: true
  },
  {
    id: "finale-8",
    dayIndex: 7,
    dayNameTr: "Büyük Final",
    category: "Efsaneler Kulübü",
    theme: "Anime Kültürü Son Söz",
    difficulty: "Kolay",
    question: "Anime izlemek ve bu topluluğun bir parçası olmak senin için en çok neyi ifade ediyor?",
    options: [
      { id: "escape", text: "Gündelik hayatın monotonluğundan kaçış ve saf macera heyecanı", votes: 530 },
      { id: "philosophy", text: "Derin felsefi karakter analizleri ve zihinsel ufuk genişlemesi", votes: 480 },
      { id: "art", text: "Müzikleri, çizimleri ve yönetmenliğiyle benzersiz bir modern sanat", votes: 610 },
      { id: "community", text: "Ortak tutkuyu paylaştığım dostlarla bağ kurup tartışmak", votes: 430 }
    ],
    explanation: "50 soruluk haftalık meydan okumamızı tamamlayan tüm Otaku dostlarımıza tebrikler!",
    isOpinionPoll: true
  }
];

// Helper: Belirli bir gün indeksi (0-7) için soruları çeker
export function getQuestionsForDay(dayIndex: number): ChallengeQuestion[] {
  return WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === dayIndex);
}

// Helper: Belirli bir tarih için bugünün 6 soruluk meydan okumasını hesaplar
export function getDailyChallengeQuestions(date: Date = new Date()): {
  dayIndex: number;
  dayName: string;
  theme: string;
  questions: ChallengeQuestion[];
} {
  // JavaScript'te getDay(): 0 Pazar, 1 Pazartesi, 2 Salı...
  // Sistemimizde: 0 Pazartesi, 1 Salı... 6 Pazar
  const jsDay = date.getDay();
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

  const questionsForDay = getQuestionsForDay(dayIndex);
  const dayConfig = WEEK_DAYS_CONFIG.find(d => d.dayIndex === dayIndex) || WEEK_DAYS_CONFIG[0];

  return {
    dayIndex,
    dayName: dayConfig.name,
    theme: dayConfig.theme,
    questions: questionsForDay
  };
}
