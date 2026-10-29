import { Anime } from '../types';

export interface SimilarRecommendation {
  anime: Anime;
  reason: string;
  matchScore: number;
}

export const POPULAR_PRESETS: { mal_id: number; title: string; image_url: string; tag: string }[] = [
  {
    mal_id: 16498,
    title: 'Attack on Titan',
    image_url: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
    tag: 'Karanlık Fantastik / Gizem'
  },
  {
    mal_id: 1535,
    title: 'Death Note',
    image_url: 'https://cdn.myanimelist.net/images/anime/1079/138100l.jpg',
    tag: 'Psikolojik Zeka Savaşı'
  },
  {
    mal_id: 52991,
    title: 'Sousou no Frieren',
    image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
    tag: 'Büyülü Yolculuk / Fantezi'
  },
  {
    mal_id: 40748,
    title: 'Jujutsu Kaisen',
    image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
    tag: 'Doğaüstü Aksiyon'
  },
  {
    mal_id: 9253,
    title: 'Steins;Gate',
    image_url: 'https://cdn.myanimelist.net/images/anime/1935/127974l.jpg',
    tag: 'Zaman Yolculuğu / Bilim Kurgu'
  },
  {
    mal_id: 5114,
    title: 'Fullmetal Alchemist: B',
    image_url: 'https://cdn.myanimelist.net/images/anime/1208/94745l.jpg',
    tag: 'Kusursuz Hikaye / Macera'
  },
  {
    mal_id: 38000,
    title: 'Demon Slayer',
    image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
    tag: 'Duygusal Shounen'
  },
  {
    mal_id: 37521,
    title: 'Vinland Saga',
    image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005l.jpg',
    tag: 'Tarihi İntikam Dramı'
  },
  {
    mal_id: 42310,
    title: 'Cyberpunk: Edgerunners',
    image_url: 'https://cdn.myanimelist.net/images/anime/1841/124747l.jpg',
    tag: 'Siberpunk / Adrenalin'
  },
  {
    mal_id: 11061,
    title: 'Hunter x Hunter (2011)',
    image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',
    tag: 'Stratejik Dövüş / Shounen'
  }
];

export const CURATED_SIMILAR_DATA: Record<number, SimilarRecommendation[]> = {
  // Attack on Titan
  16498: [
    {
      anime: {
        mal_id: 37521,
        title: 'Vinland Saga',
        title_english: 'Vinland Saga',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1500/103005l.webp' } },
        synopsis: 'Genç Viking savaşçısı Thorfinn, babasının katilinden intikam almak için acımasız bir savaşa sürüklenir.',
        score: 8.75,
        episodes: 24,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 8, name: 'Drama' }],
        year: 2019
      },
      reason: 'Aynı WIT Studio kökeni, epik askeri atmosfer, karakter gelişimi ve derin politik entrikalar.',
      matchScore: 98
    },
    {
      anime: {
        mal_id: 41457,
        title: '86 Eighty-Six',
        title_english: '86 Eighty-Six',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1987/117505l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1987/117505l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1987/117505l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1987/117505l.webp' } },
        synopsis: 'Sözde kansız dron savaşlarının ardında insan yerine konulmayan 86. bölge çocuklarının mücadelesi yatar.',
        score: 8.28,
        episodes: 11,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 8, name: 'Drama' }, { mal_id: 24, name: 'Sci-Fi' }],
        year: 2021
      },
      reason: 'Surların ardındaki ayrımcılık, askeri fedakarlıklar ve Hiroyuki Sawano imzalı epik müzikler.',
      matchScore: 95
    },
    {
      anime: {
        mal_id: 28623,
        title: 'Koutetsujou no Kabaneri',
        title_english: 'Kabaneri of the Iron Fortress',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/4/79051l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/4/79051l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/4/79051l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/4/79051l.webp' } },
        synopsis: 'Zombi benzeri yaratıkların dünyayı sardığı çağda, insanlar zırhlı trenlerle seyahat eder.',
        score: 7.3,
        episodes: 12,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 14, name: 'Horror' }],
        year: 2016
      },
      reason: 'AoT yönetmeni Tetsurou Araki imzalı, surlar içinde hayatta kalma ve zombi yaratıklar.',
      matchScore: 91
    },
    {
      anime: {
        mal_id: 34572,
        title: 'Black Clover',
        title_english: 'Black Clover',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/2/88336l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/2/88336l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/2/88336l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/2/88336l.webp' } },
        synopsis: 'Büyünün her şey olduğu bir dünyada büyüsü olmayan Asta, Büyücü Kral olmak için çabalar.',
        score: 8.16,
        episodes: 170,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 10, name: 'Fantasy' }],
        year: 2017
      },
      reason: 'Yıkıma karşı insanlığı savunma ve güçlü dostluk bağları.',
      matchScore: 86
    }
  ],

  // Death Note
  1535: [
    {
      anime: {
        mal_id: 1575,
        title: 'Code Geass: Hangyaku no Lelouch',
        title_english: 'Code Geass: Lelouch of the Rebellion',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1032/135088l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1032/135088l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1032/135088l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1032/135088l.webp' } },
        synopsis: 'Lelouch Lamperouge, mutlak itaat sağlayan Geass gücünü elde ederek Britanya İmparatorluğu\'na savaş açar.',
        score: 8.7,
        episodes: 25,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 8, name: 'Drama' }, { mal_id: 24, name: 'Sci-Fi' }],
        year: 2006
      },
      reason: 'Dahi bir ana karakter, gizli kimlik, satranç benzeri stratejiler ve dünyayı değiştirme tutkusu.',
      matchScore: 99
    },
    {
      anime: {
        mal_id: 19,
        title: 'Monster',
        title_english: 'Monster',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/10/61405l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/10/61405l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/10/61405l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/10/61405l.webp' } },
        synopsis: 'Beyin cerrahı Tenma, ameliyat ettiği dahi bir çocuğun aslında acımasız bir seri katil olduğunu öğrenir.',
        score: 8.87,
        episodes: 74,
        status: 'Finished Airing',
        genres: [{ mal_id: 8, name: 'Drama' }, { mal_id: 7, name: 'Mystery' }, { mal_id: 41, name: 'Suspense' }],
        year: 2004
      },
      reason: 'Aynı yönetmen Masayuki Kojima, derin ahlak felsefesi ve kedi-fare gerilimi.',
      matchScore: 96
    },
    {
      anime: {
        mal_id: 13601,
        title: 'Psycho-Pass',
        title_english: 'Psycho-Pass',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/5/43399l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/5/43399l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/5/43399l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/5/43399l.webp' } },
        synopsis: 'İnsanların suç işleme potansiyelini ölçen Sibyl Sistemi ve adaletin sınırlarını sorgulayan müfettişler.',
        score: 8.35,
        episodes: 22,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 24, name: 'Sci-Fi' }, { mal_id: 41, name: 'Suspense' }],
        year: 2012
      },
      reason: 'Adalet, sistem karşıtı suç dehaları ve dedektiflik sorgulamaları.',
      matchScore: 92
    }
  ],

  // Sousou no Frieren
  52991: [
    {
      anime: {
        mal_id: 33352,
        title: 'Violet Evergarden',
        title_english: 'Violet Evergarden',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1795/95088l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1795/95088l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1795/95088l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1795/95088l.webp' } },
        synopsis: 'Eski bir savaş makinesi olan Violet, insanların duygularını mektuplara dökerken "Seni seviyorum" sözünün anlamını arar.',
        score: 8.68,
        episodes: 13,
        status: 'Finished Airing',
        genres: [{ mal_id: 8, name: 'Drama' }, { mal_id: 10, name: 'Fantasy' }],
        year: 2018
      },
      reason: 'Savaş sonrası barış, zamanın akışı, anıların değeri ve nefes kesen görsel kalite.',
      matchScore: 97
    },
    {
      anime: {
        mal_id: 457,
        title: 'Mushishi',
        title_english: 'Mushi-Shi',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/2/73862l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/2/73862l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/2/73862l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/2/73862l.webp' } },
        synopsis: 'Ginko, insanlarla görünmez yaşam formları olan "Mushi"ler arasındaki dengeyi korumak için diyar diyar gezer.',
        score: 8.67,
        episodes: 26,
        status: 'Finished Airing',
        genres: [{ mal_id: 2, name: 'Adventure' }, { mal_id: 37, name: 'Supernatural' }],
        year: 2005
      },
      reason: 'Sakin ve felsefi atmosfer, doğayla iç içe yolculuk ve melankolik güzellik.',
      matchScore: 94
    },
    {
      anime: {
        mal_id: 2904,
        title: 'Ookami to Koushinryou',
        title_english: 'Spice and Wolf',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/10/8991l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/10/8991l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/10/8991l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/10/8991l.webp' } },
        synopsis: 'Gezgin tüccar Lawrence ve bilge kurt tanrıçası Holo\'nun ortak yolculuğu.',
        score: 8.22,
        episodes: 13,
        status: 'Finished Airing',
        genres: [{ mal_id: 2, name: 'Adventure' }, { mal_id: 10, name: 'Fantasy' }],
        year: 2008
      },
      reason: 'Yolculuk arkadaşlığı, uzun ömürlü bir varlığın fanilerle ilişkisi ve samimi diyaloglar.',
      matchScore: 91
    }
  ],

  // Jujutsu Kaisen
  40748: [
    {
      anime: {
        mal_id: 44511,
        title: 'Chainsaw Man',
        title_english: 'Chainsaw Man',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.webp' } },
        synopsis: 'Şeytan avcısı Denji, testere köpeği Pochita ile birleşerek Testere Adam\'a dönüşür.',
        score: 8.49,
        episodes: 12,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 37, name: 'Supernatural' }],
        year: 2022
      },
      reason: 'Aynı MAPPA stüdyosu, karanlık şeytan avı konsepti, yüksek tempolu animasyon ve kaotik dövüşler.',
      matchScore: 98
    },
    {
      anime: {
        mal_id: 269,
        title: 'Bleach',
        title_english: 'Bleach',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/3/40451l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/3/40451l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/3/40451l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/3/40451l.webp' } },
        synopsis: 'Ichigo Kurosaki, bir Ölüm Meleği\'nin güçlerini alarak ruhlar dünyasının koruyucusu olur.',
        score: 7.93,
        episodes: 366,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 37, name: 'Supernatural' }],
        year: 2004
      },
      reason: 'Gege Akutami\'nin en büyük ilham kaynağı: Şinigami güçleri, içsel canavarlar ve sokak modası ruhu.',
      matchScore: 95
    },
    {
      anime: {
        mal_id: 52299,
        title: 'Solo Leveling',
        title_english: 'Solo Leveling',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1816/138334l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1816/138334l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1816/138334l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1816/138334l.webp' } },
        synopsis: 'Dünyanın en zayıf avcısı Jinwoo, özel bir sistemle gölge ordusu komutanına dönüşür.',
        score: 8.51,
        episodes: 12,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 10, name: 'Fantasy' }],
        year: 2024
      },
      reason: 'Zindanlar, canavarlar ve saf güç yükselişi ile görsel şölen.',
      matchScore: 93
    }
  ],

  // Steins;Gate
  9253: [
    {
      anime: {
        mal_id: 31043,
        title: 'Boku dake ga Inai Machi',
        title_english: 'ERASED',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/10/77957l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/10/77957l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/10/77957l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/10/77957l.webp' } },
        synopsis: 'Zamanı birkaç dakika geri sarabilen Satoru, cinayeti engellemek için çocukluğuna 18 yıl geriye döner.',
        score: 8.3,
        episodes: 12,
        status: 'Finished Airing',
        genres: [{ mal_id: 7, name: 'Mystery' }, { mal_id: 41, name: 'Suspense' }],
        year: 2016
      },
      reason: 'Zaman sıçramalarıyla sevdiklerini kurtarma, kaderi değiştirme ve nefes kesen gerilim.',
      matchScore: 97
    },
    {
      anime: {
        mal_id: 31240,
        title: 'Re:Zero kara Hajimeru Isekai Seikatsu',
        title_english: 'Re:ZERO -Starting Life in Another World-',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1522/128039l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1522/128039l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1522/128039l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1522/128039l.webp' } },
        synopsis: 'Subaru öldüğünde zamanda geri dönerek checkpoint noktasına uyanma lanetine sahiptir.',
        score: 8.24,
        episodes: 25,
        status: 'Finished Airing',
        genres: [{ mal_id: 10, name: 'Fantasy' }, { mal_id: 41, name: 'Suspense' }],
        year: 2016
      },
      reason: 'Aynı White Fox stüdyosu, çaresizlik içindeki zaman döngüleri ve psikolojik travmalar.',
      matchScore: 95
    },
    {
      anime: {
        mal_id: 44074,
        title: 'Vivy: Fluorite Eye\'s Song',
        title_english: 'Vivy -Fluorite Eye\'s Song-',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1792/114972l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1792/114972l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1792/114972l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1792/114972l.webp' } },
        synopsis: 'İlk otonom yapay zeka Vivy, gelecekteki yapay zeka isyanını önlemek için 100 yıllık bir göreve başlar.',
        score: 8.42,
        episodes: 13,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 24, name: 'Sci-Fi' }],
        year: 2021
      },
      reason: 'Re:Zero yazarı Tappei Nagatsuki imzalı, geleceği değiştirmek üzere zaman müdahalesi ve müzik.',
      matchScore: 92
    }
  ],

  // Fullmetal Alchemist: Brotherhood
  5114: [
    {
      anime: {
        mal_id: 11061,
        title: 'Hunter x Hunter (2011)',
        title_english: 'Hunter x Hunter',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013l.webp' } },
        synopsis: 'Gon Freecss babasını bulmak için Avcı sınavına girer ve olağanüstü dostluklar kurar.',
        score: 9.04,
        episodes: 148,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 2, name: 'Adventure' }, { mal_id: 10, name: 'Fantasy' }],
        year: 2011
      },
      reason: 'Kusursuz güç sistemi (Nen ve Simya), derin karakter gelişimi ve sürükleyici macera.',
      matchScore: 98
    },
    {
      anime: {
        mal_id: 205,
        title: 'Samurai Champloo',
        title_english: 'Samurai Champloo',
        images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1375/121599l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1375/121599l.jpg' }, webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1375/121599l.webp', large_image_url: 'https://cdn.myanimelist.net/images/anime/1375/121599l.webp' } },
        synopsis: 'Fuu, ayçiçeği kokan samurayı aramak için iki vahşi kılıç ustasını yanına alır.',
        score: 8.51,
        episodes: 26,
        status: 'Finished Airing',
        genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 2, name: 'Adventure' }],
        year: 2004
      },
      reason: 'Yolculuk macerası, ikonik karakter dinamikleri ve unutulmaz anlar.',
      matchScore: 89
    }
  ]
};
