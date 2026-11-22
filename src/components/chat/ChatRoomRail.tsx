import React from 'react';
import { Hash, Plus, Vote } from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { formatRelativeTime } from '../../lib/relativeTime';
import { previewChatText } from '../../lib/chatText';
import type { ChatRoomItem } from '../../lib/chatTypes';
import type { ChatRoomOverview } from '../../lib/chatOverview';
import { cn } from '../../lib/utils';

interface ChatRoomRailProps {
  rooms: ChatRoomItem[];
  activeRoomId: string;
  overview: Record<string, ChatRoomOverview>;
  pendingRoomCount: number;
  signedIn: boolean;
  roomLabel: (room: ChatRoomItem) => string;
  roomTopic: (room: ChatRoomItem) => string;
  onSelect: (roomId: string) => void;
  onOpenRoomModal: () => void;
  onOpenQueue: () => void;
  onNavigate?: () => void;
  className?: string;
}

interface RoomButtonProps {
  room: ChatRoomItem;
  active: boolean;
  overview?: ChatRoomOverview;
  label: string;
  topic: string;
  onSelect: () => void;
}

const RoomButton: React.FC<RoomButtonProps> = ({ room, active, overview, label, topic, onSelect }) => {
  const { t, i18n } = useAppTranslation();
  const last = overview?.last;
  const unread = overview?.unread ?? 0;
  const preview = last
    ? `${last.name}: ${previewChatText(last.text, 46)}`
    : topic;
  const time = overview && overview.lastAt > 0
    ? formatRelativeTime(new Date(overview.lastAt).toISOString(), i18n.language)
    : '';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-11 w-full items-center gap-2.5 border-2 p-2 text-left transition-colors',
        active
          ? 'border-white bg-amber-400 text-black'
          : 'border-white/15 bg-neutral-950 text-white hover:border-amber-400/70 hover:bg-neutral-900',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center border-2 text-base',
          active ? 'border-black bg-black/10' : 'border-white/20 bg-black',
        )}
        aria-hidden="true"
      >
        {room.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span lang="en" className="truncate text-[12px] font-black uppercase tracking-tight">#{label}</span>
          {unread > 0 && (
            <span
              className="ml-auto shrink-0 border border-black bg-rose-600 px-1 text-[9px] font-black leading-4 text-white"
              aria-label={t('chat_new_messages_count', { count: unread })}
            >
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </span>
        <span
          className={cn(
            'mt-0.5 block truncate text-[10px] font-medium',
            active ? 'text-black/70' : 'text-neutral-500',
          )}
        >
          {preview}
        </span>
      </span>
      {time && (
        <span
          className={cn(
            'shrink-0 font-mono text-[8px] uppercase tracking-wider',
            active ? 'text-black/60' : 'text-neutral-600',
          )}
        >
          {time}
        </span>
      )}
    </button>
  );
};

/** Tam sayfa KÖŞE'nin oda listesi; mobilde çekmece içinde de kullanılır. */
export const ChatRoomRail: React.FC<ChatRoomRailProps> = ({
  rooms,
  activeRoomId,
  overview,
  pendingRoomCount,
  signedIn,
  roomLabel,
  roomTopic,
  onSelect,
  onOpenRoomModal,
  onOpenQueue,
  onNavigate,
  className,
}) => {
  const { t } = useAppTranslation();
  const official = rooms.filter((room) => room.isOfficial);
  const community = rooms.filter((room) => !room.isOfficial);

  const select = (roomId: string) => {
    onSelect(roomId);
    onNavigate?.();
  };

  return (
    <nav
      aria-label={t('chat_rooms_title')}
      className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto bg-black', className)}
    >
      <div className="border-b-4 border-white/20 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-400">
          {t('chat_rooms_title')}
        </p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          {t('chat_cafe_subtitle')}
        </p>
      </div>

      <div className="flex-1 space-y-4 p-2.5">
        <section aria-label={t('chat_rooms_official')}>
          <p className="mb-1.5 px-1 font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-500">
            {t('chat_rooms_official')}
          </p>
          <div className="space-y-1.5">
            {official.map((room) => (
              <RoomButton
                key={room.id}
                room={room}
                active={room.id === activeRoomId}
                overview={overview[room.id]}
                label={roomLabel(room)}
                topic={roomTopic(room)}
                onSelect={() => select(room.id)}
              />
            ))}
          </div>
        </section>

        <section aria-label={t('chat_rooms_community')}>
          <p className="mb-1.5 px-1 font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-500">
            {t('chat_rooms_community')}
          </p>
          {community.length === 0 ? (
            <p className="border-2 border-dashed border-white/15 p-3 text-[10px] font-bold uppercase leading-relaxed tracking-wider text-neutral-600">
              {t('chat_rooms_empty')}
            </p>
          ) : (
            <div className="space-y-1.5">
              {community.map((room) => (
                <RoomButton
                  key={room.id}
                  room={room}
                  active={room.id === activeRoomId}
                  overview={overview[room.id]}
                  label={roomLabel(room)}
                  topic={roomTopic(room)}
                  onSelect={() => select(room.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="space-y-1.5 border-t-4 border-white/20 p-2.5">
        {signedIn && pendingRoomCount > 0 && (
          <button
            type="button"
            onClick={onOpenQueue}
            className="flex min-h-11 w-full items-center justify-center gap-1.5 border-2 border-cyan-400 bg-cyan-500/15 px-2 text-[10px] font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-500 hover:text-black"
          >
            <Vote size={14} strokeWidth={2.5} />
            {t('chat_pending_requests')} ({pendingRoomCount})
          </button>
        )}
        <button
          type="button"
          onClick={onOpenRoomModal}
          className="flex min-h-11 w-full items-center justify-center gap-1.5 border-2 border-white bg-black px-2 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white hover:text-black"
        >
          <Plus size={14} strokeWidth={3} />
          {t('chat_open_room_title')}
        </button>
        <p className="flex items-start gap-1 px-0.5 pt-1 text-[9px] leading-snug text-neutral-600">
          <Hash size={11} className="mt-0.5 shrink-0" />
          {t('chat_scope_note')}
        </p>
      </div>
    </nav>
  );
};

export default ChatRoomRail;
