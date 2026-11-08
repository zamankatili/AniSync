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

