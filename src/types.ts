export interface Anime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: { image_url: string; large_image_url: string };
    webp: { image_url: string; large_image_url: string };
  };
  synopsis: string;
  score: number | null;
  episodes: number | null;
  status: string;
  genres: Array<{ mal_id: number; name: string }>;
  year: number | null;
  trailer?: { url?: string; embed_url?: string; youtube_id?: string };
  type?: string;
  season?: string;
  studios?: Array<{ mal_id: number; name: string }>;
  rank?: number;
  background?: string;
}

export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

export interface WatchlistItem {
  anime: Anime;
  status: WatchStatus;
  userScore: number;
  episodesWatched: number;
  addedAt: string;
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    isFriend: boolean;
    uid?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
}

export type PostType = 'discussion' | 'recommendation' | 'list_share' | 'meme_share' | 'watch_status' | 'review';

export interface ForumPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    isFriend: boolean;
    uid?: string;
  };
  title: string;
  content: string;
  likes: number;
  likedBy?: string[];
  replies: number;
  category: string;
  type: PostType;
  createdAt: string;
  isLikedByMe?: boolean;
  comments?: Comment[];
  memeUrl?: string;
  animeRef?: {
    id: number;
    title: string;
    image: string;
    score: number | null;
  };
  listRef?: {
    listName: string;
    animes: { id: number; image: string; title: string }[];
  };
}

export interface UserProfile {
  name: string;
  handle: string;
  avatarSeed: string;
  joinYear: number;
  favoriteGenres?: string[];
  bio?: string;
}

export interface SocialFeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatarSeed?: string;
  userAvatar?: string;
  animeId: number;
  animeTitle: string;
  animeImage: string;
  episodeNote?: string;
  rating?: number;
  reviewText: string;
  likes: number;
  likedBy?: string[];
  createdAt: any;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  lastOnline: string;
  currentlyWatching?: string;
}

export interface CustomList {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  upvotes: number;
  votedBy: string[];
  animes: { mal_id: number; title: string; image_url: string }[];
  createdAt: string;
}

export interface UserNamedList {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  animeIds: number[];
  createdAt: string;
  isDefault?: boolean;
}

export type ActivityActionType = 'added_to_watchlist' | 'status_changed' | 'added_to_custom_list';

export interface RecentActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatarSeed?: string;
  userAvatar?: string;
  animeId: number;
  animeTitle: string;
  animeImage: string;
  actionType?: ActivityActionType;
  status?: WatchStatus;
  listName?: string;
  score?: number | null;
  genres?: string[];
  episodes?: number | null;
  createdAt: any;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface AnimeReminder {
  id: string; // e.g. rem_54857
  mal_id: number;
  title: string;
  title_english?: string | null;
  image: string;
  day: DayOfWeek;
  timeTR: string; // e.g. "18:30"
  timeJST?: string; // e.g. "23:30"
  currentEpisode: number;
  totalEpisodes?: number | null;
  studio?: string;
  notifyBeforeMinutes: number; // 0 (at broadcast), 5, 15, 30, 60
  browserNotify: boolean;
  soundEnabled: boolean;
  streamingOn?: string[];
  createdAt: string;
  lastNotifiedEpisode?: number;
}

export interface AnimeCharacter {
  id: string;
  name: string;
  series: string;
  imageUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
