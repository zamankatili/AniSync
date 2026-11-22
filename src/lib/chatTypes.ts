import type { CommunityRoom, OfficialRoom } from './rooms';

/** KÖŞE mesajının alıntıladığı mesaj — yeni dokümanda taşınır, güncelleme gerektirmez. */
export interface ChatReplyRef {
  id: string;
  name: string;
  text: string;
}

/**
 * `globalChat/{id}` dokümanı.
 *
 * `createdAt` Firestore `Timestamp`'tır; `toDateSafe` ile okunur. `replyTo`
 * sonradan eklenen isteğe bağlı alandır (eski mesajlarda yoktur).
 */
export interface ChatMessage {
  id: string;
  text: string;
  uid: string;
  name: string;
  avatar: string;
  roomId?: string;
  createdAt: any;
  /** Yalnız bu cihazda saklanan misafir mesajı. */
  isLocal?: boolean;
  replyTo?: ChatReplyRef | null;
}

export type ChatRoomItem = OfficialRoom | CommunityRoom;

/** Tek mesaj sınırı — Firestore kuralı 500'e izin verir, UI 250'de tutar. */
export const CHAT_MESSAGE_MAX = 250;

/** Alıntıda taşınan metin sınırları (doküman şişmesin). */
export const CHAT_REPLY_NAME_MAX = 60;
export const CHAT_REPLY_TEXT_MAX = 140;
