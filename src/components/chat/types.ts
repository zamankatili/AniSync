import type { ChatMessage, ChatRoomItem, ChatReplyRef } from '../../lib/chatTypes';
import type { ChatRoomOverview } from '../../lib/chatOverview';
import type { ChatTimelineItem } from '../../lib/chatTimeline';

export interface ChatEventInfo {
  title: string;
  date?: string;
  attendees: number | null;
  joined: boolean;
  busy: boolean;
  onToggle: () => void;
}

export interface ChatAnonInfo {
  signedIn: boolean;
  used: number;
  limit: number;
}

/**
 * KÖŞE'nin tek görünüm modeli. Hem yüzen panel hem tam sayfa aynı nesneyi
 * okur; böylece oda, arama, taslak ve yanıt durumu görünüm değişince korunur.
 */
export interface ChatView {
  rooms: ChatRoomItem[];
  activeRoom: ChatRoomItem;
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  overview: Record<string, ChatRoomOverview>;
  pendingRoomCount: number;
  onOpenRoomModal: () => void;
  onOpenQueue: () => void;

  roomLabel: (room: ChatRoomItem) => string;
  roomTopic: (room: ChatRoomItem) => string;
  roomBadge: (room: ChatRoomItem) => string;

  timeline: ChatTimelineItem[];
  messageCount: number;
  loading: boolean;

  searchOpen: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onToggleSearch: () => void;

  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  focusSignal: number;
  replyTo: ChatReplyRef | null;
  onReply: (message: ChatMessage) => void;
  onCancelReply: () => void;

  onDelete: (messageId: string) => void;
  onCopy: (text: string) => void;
  canDelete: (message: ChatMessage) => boolean;

  myName: string | null;
  myUid: string | null;
  myKarma: number;
  levelInfo: { level: number; title: string } | null;
  anon: ChatAnonInfo;
  event: ChatEventInfo | null;
  isAdmin: boolean;
}
