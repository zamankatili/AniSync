export type MediaType = 'anime' | 'manga' | 'novel' | 'game';

export type MediaSource = 'anilist' | 'openlibrary' | 'steam' | 'local';

export interface Media {
  /** "anime:16498" gibi kaynak-önekli benzersiz anahtar */
  id: string;
  source: MediaSource;
  type: MediaType;
  title: string;
  /** Orijinal/alternatif ad (romaji, yazar adı vb.) */
  subtitle?: string;
  cover: string;
  banner?: string;
  description?: string;
  genres: string[];
  /** 0-100 arası puan */
  score?: number | null;
  year?: number | null;
  totalUnits?: number | null;
  /** "bölüm", "cilt", "sayfa", "saat" */
  unitLabel: string;
  /** Kart üzerinde görünen kısa ek bilgi: "24 bölüm · 2023" */
  meta?: string;
  externalUrl?: string;
  accent?: string;
  /** Küratör notu — oyun kataloğu ve editör seçkileri için */
  note?: string;
  status?: string | null;
}

export type ShelfStatus = 'active' | 'planned' | 'done' | 'paused' | 'dropped';

export interface ShelfEntry {
  media: Media;
  status: ShelfStatus;
  progress: number;
  score?: number;
  note?: string;
  noteSpoiler?: boolean;
  favorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PostKind = 'sohbet' | 'oneri' | 'inceleme' | 'soru' | 'ilerleme';

export interface Reply {
  id: string;
  author: Author;
  text: string;
  createdAt: string;
}

export interface Author {
  name: string;
  emoji: string;
  color: string;
}

export interface Post {
  id: string;
  author: Author;
  kind: PostKind;
  text: string;
  createdAt: string;
  likes: string[];
  replies: Reply[];
  ref?: Pick<Media, 'id' | 'title' | 'cover' | 'type' | 'year' | 'score'>;
  clubId?: string;
  spoiler?: boolean;
  /** Örnek/seed gönderiler silinemez */
  seed?: boolean;
}

export interface Club {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  color: string;
  cadence: string;
  members: number;
}

export interface Profile {
  name: string;
  handle: string;
  emoji: string;
  color: string;
  bio: string;
  joinedAt: string;
  genres: string[];
  homeType: MediaType;
}

export type AtmosId = 'cay' | 'klasik' | 'sinema' | 'kutuphane';

export interface Atmos {
  id: AtmosId;
  name: string;
  tagline: string;
  description: string;
  unlockLevel: number;
  icon: string;
  swatches: [string, string, string];
  scene: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earned: boolean;
}

export interface NamedList {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
  mediaIds: string[];
  createdAt: string;
}
