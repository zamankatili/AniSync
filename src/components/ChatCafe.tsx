import React, { useEffect, useRef, useState } from 'react';
import { Hash, Search, X, ChevronDown } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { cn } from '../lib/utils';
import { ChatComposer } from './chat/ChatComposer';
import { ChatEventBanner } from './chat/ChatEventBanner';
import { ChatMessageList } from './chat/ChatMessageList';
import { ChatRoomRail } from './chat/ChatRoomRail';
import { ChatSearchBar } from './chat/ChatSearchBar';
import { ChatCafeSidebar } from './chat/ChatCafeSidebar';
import type { ChatView } from './chat/types';

export interface ChatCafeProps {
  chat: ChatView;
  onClose: () => void;
}

const DOT_GRID = 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)';

/**
 * KÖŞE tam sayfa kabuğu.
 *
 * Gerçek sohbet akışı merkezde; solda odalar, sağda radyo/seviye/kurallar.
 * Mobilde oda listesi çekmeceye taşınır, akış ve yazma alanı tam genişlik kalır.
 */
export const ChatCafe: React.FC<ChatCafeProps> = ({ chat, onClose }) => {
  const { t, currentLang } = useAppTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerWasOpenRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Çekmece açılınca odağa taşı; kapanınca açan düğmeye geri ver.
  useEffect(() => {
    if (drawerOpen) {
      drawerWasOpenRef.current = true;
      drawerCloseRef.current?.focus();
      return;
    }
    if (drawerWasOpenRef.current) {
      drawerWasOpenRef.current = false;
      drawerTriggerRef.current?.focus();
    }
  }, [drawerOpen]);

  // Escape kapatır; Tab odağı çekmecenin içinde tutar.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const root = drawerRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const clockText = clock.toLocaleTimeString(currentLang, { hour: '2-digit', minute: '2-digit' });
  const dateText = clock.toLocaleDateString(currentLang, { weekday: 'short', day: 'numeric', month: 'short' });
  const roomLabel = chat.roomLabel(chat.activeRoom);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#0b0b0b] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: DOT_GRID, backgroundSize: '24px 24px' }}
      />

      <header className="relative flex shrink-0 items-center gap-2 border-b-4 border-white bg-black px-2 py-1.5 sm:px-4 sm:py-2">
        <button
          type="button"
          ref={drawerTriggerRef}
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-11 min-w-0 items-center gap-1.5 border-2 border-white/30 bg-black px-2 text-left hover:border-amber-400 lg:hidden"
          aria-label={t('chat_rooms_open')}
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          aria-controls="kose-room-drawer"
        >
          <Hash size={16} className="shrink-0 text-amber-400" strokeWidth={3} />
          <span className="max-w-[112px] truncate text-[11px] font-black uppercase tracking-wider">
            <span lang="en">{roomLabel}</span>
          </span>
          <ChevronDown size={14} strokeWidth={3} className="shrink-0 text-neutral-400" />
        </button>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <span className="font-mono text-2xl font-black leading-none tracking-tighter">
            KÖŞE<span className="text-amber-400">.</span>
          </span>
          <span className="h-8 w-px bg-white/20" />
        </div>

        <span className="shrink-0 font-mono text-base font-black leading-none tracking-tighter lg:hidden">
          KÖŞE<span className="text-amber-400">.</span>
        </span>

        <div className="hidden min-w-0 flex-1 lg:block">
          <div className="flex items-center gap-1.5">
            <span lang="en" className="truncate text-sm font-black uppercase tracking-wider">
              #{roomLabel}
            </span>
            <span className="shrink-0 border border-black bg-amber-400 px-1.5 py-0.5 text-[9px] font-black uppercase text-black">
              {chat.roomBadge(chat.activeRoom)}
            </span>
          </div>
          <p className="truncate text-[10px] font-bold uppercase text-neutral-400">
            {chat.roomTopic(chat.activeRoom)}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div className="mr-2 hidden text-right xl:block">
            <p className="font-mono text-base font-bold leading-none tabular-nums">{clockText}</p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.25em] text-neutral-500">
              {dateText}
            </p>
          </div>
          <button
            type="button"
            onClick={chat.onToggleSearch}
            aria-pressed={chat.searchOpen}
            aria-label={t('chat_search_placeholder')}
            title={t('chat_search_placeholder')}
            className={cn(
              'flex min-h-11 min-w-11 items-center justify-center border-2 transition-colors',
              chat.searchOpen
                ? 'border-amber-400 bg-amber-400 text-black'
                : 'border-white/30 text-white hover:border-white hover:bg-white/10',
            )}
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('chat_back_to_panel')}
            title={t('chat_back_to_panel')}
            className="flex min-h-11 min-w-11 items-center justify-center border-2 border-white bg-black text-white transition-colors hover:bg-rose-600"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 border-b-2 border-white/10 bg-neutral-950 px-3 py-1.5 lg:hidden">
        <span className="shrink-0 border border-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-400">
          {chat.roomBadge(chat.activeRoom)}
        </span>
        <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wide text-neutral-400">
          {chat.roomTopic(chat.activeRoom)}
        </p>
      </div>

      {chat.event && <ChatEventBanner event={chat.event} />}

      {chat.searchOpen && (
        <ChatSearchBar
          value={chat.searchTerm}
          onChange={chat.onSearchTermChange}
          onClose={chat.onToggleSearch}
          matchCount={chat.timeline.reduce((total, item) => (item.type === 'msg' ? total + 1 : total), 0)}
          focusOnMount
        />
      )}

      <div className="relative flex min-h-0 flex-1">
        <div className="hidden min-h-0 w-[280px] shrink-0 border-r-4 border-white lg:flex xl:w-[300px]">
          <ChatRoomRail
            rooms={chat.rooms}
            activeRoomId={chat.activeRoomId}
            overview={chat.overview}
            pinnedRoomIds={chat.pinnedRoomIds}
            pendingRoomCount={chat.pendingRoomCount}
            signedIn={chat.anon.signedIn}
            roomLabel={chat.roomLabel}
            roomTopic={chat.roomTopic}
            onSelect={chat.onSelectRoom}
            onTogglePin={chat.onTogglePin}
            onOpenRoomModal={chat.onOpenRoomModal}
            onOpenQueue={chat.onOpenQueue}
          />
        </div>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ChatMessageList
            key={chat.activeRoomId}
            timeline={chat.timeline}
            loading={chat.loading}
            messageCount={chat.messageCount}
            searchTerm={chat.searchTerm}
            roomLabel={roomLabel}
            roomTopic={chat.roomTopic(chat.activeRoom)}
            roomIcon={chat.activeRoom.icon}
            onDelete={chat.onDelete}
            onReply={chat.onReply}
            onCopy={chat.onCopy}
            canDelete={chat.canDelete}
          />
          <div className="shrink-0 bg-neutral-950 pb-[env(safe-area-inset-bottom)]">
            <ChatComposer
              draft={chat.draft}
              onChange={chat.onDraftChange}
              onSend={chat.onSend}
              replyTo={chat.replyTo}
              onCancelReply={chat.onCancelReply}
              anon={chat.anon}
              roomLabel={roomLabel}
              focusSignal={chat.focusSignal}
            />
          </div>
        </main>

        <div className="hidden min-h-0 w-[300px] shrink-0 xl:flex">
          <ChatCafeSidebar myKarma={chat.myKarma} levelInfo={chat.levelInfo} />
        </div>
      </div>

      {drawerOpen && (
        <div
          ref={drawerRef}
          id="kose-room-drawer"
          className="fixed inset-0 z-[80] flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t('chat_rooms_title')}
        >
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex h-full w-[88vw] max-w-sm flex-col border-r-4 border-white bg-black">
            <div className="flex items-center justify-between border-b-2 border-white/20 p-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-400">
                {t('chat_rooms_title')}
              </span>
              <button
                type="button"
                ref={drawerCloseRef}
                onClick={() => setDrawerOpen(false)}
                className="flex min-h-11 min-w-11 items-center justify-center border-2 border-white/30 text-white hover:bg-white hover:text-black"
                aria-label={t('close')}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>
            <ChatRoomRail
              rooms={chat.rooms}
              activeRoomId={chat.activeRoomId}
              overview={chat.overview}
              pinnedRoomIds={chat.pinnedRoomIds}
              pendingRoomCount={chat.pendingRoomCount}
              signedIn={chat.anon.signedIn}
              roomLabel={chat.roomLabel}
              roomTopic={chat.roomTopic}
              onSelect={chat.onSelectRoom}
              onTogglePin={chat.onTogglePin}
              onOpenRoomModal={chat.onOpenRoomModal}
              onOpenQueue={chat.onOpenQueue}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatCafe;
