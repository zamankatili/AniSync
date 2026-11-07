export interface WatchPartyRoomData {
  id: string;
  title: string;
  animeTitle: string;
  animeImage: string;
  animeId: number;
  videoUrl: string;
  youtubeId: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  isPlaying: boolean;
  currentTime: number; // in seconds
  updatedAt: string;
  createdAt: string;
  participantCount: number;
  isLocked: boolean; // only host can seek/play
  isPrivate: boolean;
  roomCode: string;
  category: 'fragman' | 'sezon-ozel' | 'amv' | 'bolum-tartisma';
  description: string;
}

export interface WatchPartyMessage {
  id: string;
  roomId: string;
  uid: string;
  userName: string;
  userAvatar: string;
  text: string;
  videoTimestamp?: number; // timestamp in seconds when sent
  createdAt: string;
  isHost?: boolean;
}

export interface FloatingReaction {
  id: string;
  roomId: string;
  uid: string;
  userName: string;
  emoji: string;
  label: string;
  color: string;
  createdAt: number;
  xOffset: number; // percentage from left (10% to 90%)
}

export const REACTION_TYPES = [
  { id: 'fire', emoji: '🔥', label: 'SUGOI!', color: '#f97316' },
  { id: 'cry', emoji: '😭', label: 'ANYA CRY', color: '#38bdf8' },
  { id: 'shock', emoji: '😱', label: 'NANI?!', color: '#eab308' },
  { id: 'king', emoji: '👑', label: 'KAIDOKU', color: '#a855f7' },
  { id: 'slash', emoji: '⚔️', label: 'BANKAI', color: '#ef4444' },
  { id: 'heart', emoji: '💖', label: 'KAWAII', color: '#ec4899' },
] as const;

export function extractYouTubeId(url: string): string {
  if (!url) return '';
  // Match youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url.trim();
}

export function formatVideoTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const INITIAL_FEATURED_ROOMS: WatchPartyRoomData[] = [
  {
    id: 'room-demon-slayer-infinity',
    title: 'Demon Slayer: Sonsuzluk Kalesi Sinema Filmi Fragman İncelemesi',
    animeTitle: 'Kimetsu no Yaiba: Infinity Castle',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1792/138022l.jpg',
    animeId: 58514,
    videoUrl: 'https://www.youtube.com/watch?v=4d_Jd2zY3jY',
    youtubeId: '4d_Jd2zY3jY',
    hostId: 'host-tanjiro',
    hostName: 'TanjiroSun',
    hostAvatar: 'Tanjiro',
    isPlaying: true,
    currentTime: 42,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    participantCount: 84,
    isLocked: false,
    isPrivate: false,
    roomCode: 'KNY-990',
    category: 'fragman',
    description: 'Ufotable stüdyosunun üçleme olarak duyurduğu Sonsuzluk Kalesi resmi fragmanını kare kare analiz edip birlikte izliyoruz!'
  },
  {
    id: 'room-aot-final-climax',
    title: 'Attack on Titan: Final Sezonu Özel Bölüm 2 Son Savaş',
    animeTitle: 'Shingeki no Kyojin: The Final Season',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1000/110531l.jpg',
    animeId: 40028,
    videoUrl: 'https://www.youtube.com/watch?v=E7WytQMFlSF',
    youtubeId: 'E7WytQMFlSF',
    hostId: 'host-levi',
    hostName: 'KaptanLevi',
    hostAvatar: 'Levi',
    isPlaying: false,
    currentTime: 115,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    participantCount: 126,
    isLocked: true,
    isPrivate: false,
    roomCode: 'AOT-104',
    category: 'sezon-ozel',
    description: 'Eren Yeager ve Kurucu Dev ile insanlığın kader savaşı. Kulaklıkları takın, ses seviyesini yükseltin!'
  },
  {
    id: 'room-chainsaw-reze',
    title: 'Chainsaw Man: Reze Arc (Bomba Şeytanı) Sinema Teaser',
    animeTitle: 'Chainsaw Man: Gekijou-ban Reze-hen',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
    animeId: 57444,
    videoUrl: 'https://www.youtube.com/watch?v=jk6jK7X3m3U',
    youtubeId: 'jk6jK7X3m3U',
    hostId: 'host-denji',
    hostName: 'PochitaFan',
    hostAvatar: 'Denji',
    isPlaying: true,
    currentTime: 18,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    participantCount: 62,
    isLocked: false,
    isPrivate: false,
    roomCode: 'CSM-069',
    category: 'fragman',
    description: 'Mappa stüdyosunun bomba gibi gelecek Reze filmi duyurusu! Sohbet odasında teorileri tartışıyoruz.'
  },
  {
    id: 'room-jjk-shibuya-epic',
    title: 'Jujutsu Kaisen: Shibuya Olayı - Sukuna vs Mahoraga Teaser',
    animeTitle: 'Jujutsu Kaisen 2nd Season',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg',
    animeId: 51009,
    videoUrl: 'https://www.youtube.com/watch?v=Cq_7wVqXjFk',
    youtubeId: 'Cq_7wVqXjFk',
    hostId: 'host-gojo',
    hostName: 'SatoruLimitless',
    hostAvatar: 'Gojo',
    isPlaying: true,
    currentTime: 88,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    participantCount: 154,
    isLocked: false,
    isPrivate: false,
    roomCode: 'JJK-404',
    category: 'amv',
    description: 'Shibuya sokaklarını yerle bir eden efsanevi animasyon ve yıkım sahnesi. Canlı reaksiyon butonlarıyla eşlik edin!'
  },
  {
    id: 'room-frieren-magic',
    title: 'Frieren: Fern & Frieren vs Klon Zindan Savaşı Klip',
    animeTitle: 'Sousou no Frieren',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1015/138075l.jpg',
    animeId: 52991,
    videoUrl: 'https://www.youtube.com/watch?v=4d_Jd2zY3jY',
    youtubeId: '4d_Jd2zY3jY',
    hostId: 'host-frieren',
    hostName: 'FrierenElf',
    hostAvatar: 'Frieren',
    isPlaying: false,
    currentTime: 5,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    participantCount: 45,
    isLocked: false,
    isPrivate: false,
    roomCode: 'FRN-300',
    category: 'bolum-tartisma',
    description: 'Büyücülük sınavının zirve savaşı. Madhouse stüdyosunun pürüzsüz sakuga animasyonlarını birlikte değerlendiriyoruz.'
  },
  {
    id: 'room-solo-leveling-s2',
    title: 'Solo Leveling Season 2: Arise from the Shadow Resmi Tanıtım',
    animeTitle: 'Ore dake Level Up na Ken Season 2',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1792/142479l.jpg',
    animeId: 58567,
    videoUrl: 'https://www.youtube.com/watch?v=jk6jK7X3m3U',
    youtubeId: 'jk6jK7X3m3U',
    hostId: 'host-jinwoo',
    hostName: 'ShadowMonarch',
    hostAvatar: 'Jinwoo',
    isPlaying: true,
    currentTime: 63,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    participantCount: 97,
    isLocked: false,
    isPrivate: false,
    roomCode: 'SLV-001',
    category: 'fragman',
    description: 'Sung Jinwoo ve Gölge Ordusu geri dönüyor! 2. sezon için toplulukla birlikte heyecanı paylaşıyoruz.'
  }
];
