import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight, X, Send, Trash2, ShieldCheck, LogIn, Vote, Plus, Sparkles, ChevronLeft
} from 'lucide-react';
import { cn, formatRelativeTime } from '../lib/utils';
import { resolveAvatar } from '../lib/avatar';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { DIRECT_ROOM_MIN_XP, ROOM_VOTE_THRESHOLD, OFFICIAL_ROOMS } from '../lib/rooms';
import type { ChatMessage, ChatRoomItem } from './GlobalChat';

/**
 * Tam-sayfa "KÖŞE" — masaüstü sohbet deneyimi.
 *
 * Sağ alttaki mini panelin (< 1024px) genişletilmiş kahvehane hali.
 * Masa listesi sol rafta, sohbet ortada, masa kuralları sağda.
 * Küçük ekranlarda aynı bileşenin yerine yüzen panel devreye girer.
 */
export interface ChatCafeProps {
  rooms: ChatRoomItem[];
  activeRoom: ChatRoomItem;
  messages: Array<ChatMessage & { anonymousIndex?: number }>;
  onSelectRoom: (id: string) => void;
  onClose: () => void;
  onSend: (e: React.FormEvent) => void;
  newMessage: string;
  onChangeNewMessage: (value: string) => void;
  onDeleteMessage: (msgId: string) => void;
  currentUserName: string;
  currentUserAvatar?: string | null;
  isSignedIn: boolean;
  myKarma: number;
  anonUsed: number;
  anonLimit: number;
  onOpenCreateModal: () => void;
  onOpenQueue: () => void;
  pendingRoomCount: number;
  isAdmin: boolean;
  canDirectCreate: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ROOM_ORDER = OFFICIAL_ROOMS.map((r) => r.id);
const roomIndex = (id: string) => ROOM_ORDER.indexOf(id);

const BG_ASIDE = 'radial-gradient(900px 500px at 20% -10%, rgba(232,192,122,0.10), transparent 60%), radial-gradient(700px 600px at 95% 110%, rgba(231,124,87,0.07), transparent 55%), #1a120c';
const BG_MAIN = 'radial-gradient(1200px 700px at 65% -10%, rgba(232,192,122,0.09), transparent 55%), radial-gradient(900px 800px at -10% 115%, rgba(127,176,105,0.06), transparent 55%), #201510';
const BG_RAIL = 'radial-gradient(700px 500px at 110% 15%, rgba(232,192,122,0.06), transparent 60%), #1a120c';
const DOT_GRID = 'radial-gradient(rgba(241,231,216,0.07) 1px, transparent 1px)';

export const ChatCafe: React.FC<ChatCafeProps> = ({
  rooms,
  activeRoom,
  messages,
  onSelectRoom,
  onClose,
  onSend,
  newMessage,
  onChangeNewMessage,
  onDeleteMessage,
  currentUserName,
  currentUserAvatar,
  isSignedIn,
  myKarma,
  anonUsed,
  anonLimit,
  onOpenCreateModal,
  onOpenQueue,
  pendingRoomCount,
  isAdmin,
  canDirectCreate,
  inputRef,
  messagesEndRef,
}) => {
  const { t } = useAppTranslation();
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const clockText = useMemo(
    () => clock.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    [clock],
  );
  const dayText = useMemo(
    () => clock.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }),
    [clock],
  );

  const roomLabel = (room: ChatRoomItem) =>
    room.isOfficial ? t(`chat_room_name_${room.id}`, { defaultValue: room.name }) : room.name;
  const roomTopic = (room: ChatRoomItem) =>
    room.isOfficial ? t(`chat_room_topic_${room.id}`, { defaultValue: room.topic }) : room.topic;

  const sentCount = messages.length;

  return (
    <div className="fixed inset-0 z-[60] bg-[#17100c] text-[#f3e8d8] flex overflow-hidden select-none">
      {/* ─── SOL RAF — MASALAR ─────────────────────────── */}
      <aside className="hidden md:flex flex-col w-[264px] xl:w-[292px] shrink-0 border-r border-[#2e241c] relative" style={{ background: BG_ASIDE }}>
        <div className="px-5 pt-5 pb-4 border-b border-[#2e241c]">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c4a165] hover:text-[#f5e6c8] transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} strokeWidth={3} />
            {t('chat_cafe_leave')}
          </button>
          <h1 className="font-serif font-black text-[44px] leading-none tracking-tight text-[#f5e6c8] mt-3">KÖŞE</h1>
          <p className="font-serif italic text-[12px] text-[#c4a165] mt-1.5">{t('chat_cafe_subtitle')}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-5 pt-1 pb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#8f7a5c]">MASALAR</span>
            <span className="font-mono text-[9px] text-[#8f7a5c]">{rooms.length}</span>
          </div>
          <div className="px-2 space-y-0.5">
            {rooms.map((room) => {
              const active = room.id === activeRoom.id;
              const idx = roomIndex(room.id);
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 flex items-center gap-3 border-l-2 transition-all cursor-pointer group',
                    active
                      ? 'border-[#e8c07a] bg-[#e8c07a]/10'
                      : 'border-transparent hover:bg-[#f5e6c8]/5'
                  )}
                >
                  <span className={cn('font-mono text-[9px] w-5 shrink-0 text-right', active ? 'text-[#e8c07a]' : 'text-[#6f5c43]')}>
                    {idx >= 0 ? String(idx + 1).padStart(2, '0') : '••'}
                  </span>
                  <span className="text-base w-6 shrink-0" aria-hidden>{room.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span lang="en" className={cn(
                      'block font-semibold text-[12.5px] leading-tight truncate',
                      active ? 'text-[#f5e6c8]' : 'text-[#d8c9b4] group-hover:text-[#f5e6c8]'
                    )}>
                      #{roomLabel(room)}
                    </span>
                    <span className="block text-[9px] font-mono uppercase tracking-wider text-[#8f7a5c] truncate">
                      {room.isOfficial ? t(`chat_room_badge_${room.id}`, { defaultValue: room.badge }) : t('chat_badge_community', { defaultValue: 'TOPLULUK' })}
                    </span>
                  </span>
                  {active && <ChevronRight size={14} className="text-[#e8c07a] shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[#2e241c] space-y-2">
          <button
            onClick={onOpenCreateModal}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-dashed border-[#e8c07a]/50 text-[#e8c07a] hover:bg-[#e8c07a] hover:text-[#1a120c] transition-all font-mono text-[10px] uppercase tracking-[0.2em] cursor-pointer"
          >
            <span className="flex items-center gap-2"><Plus size={13} strokeWidth={3} /> {canDirectCreate ? t('chat_open_room') : t('chat_request_room')}</span>
            <span className="opacity-60">{canDirectCreate ? `${DIRECT_ROOM_MIN_XP} XP ✓` : `${ROOM_VOTE_THRESHOLD} OY + MOD`}</span>
          </button>
          {pendingRoomCount > 0 && (
            <button
              onClick={onOpenQueue}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-[#3a2c21] text-[#d8c9b4] hover:text-[#f5e6c8] hover:border-[#e8c07a]/50 transition-colors font-mono text-[10px] uppercase tracking-[0.2em] cursor-pointer"
            >
              <span className="flex items-center gap-2"><Vote size={13} /> {t('chat_pending_requests')}</span>
              <span className="bg-[#e8c07a] text-[#1a120c] px-1.5 py-0.5">{pendingRoomCount}</span>
            </button>
          )}
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[#8f7a5c] hover:text-[#d8c9b4] transition-colors font-mono text-[9px] uppercase tracking-widest cursor-pointer">
            {isSignedIn
              ? <><ShieldCheck size={13} className="text-[#7fb069]" /> {t('chat_signed_in', { name: currentUserName })}</>
              : <><LogIn size={13} /> {t('chat_anon_cta')}</>}
          </button>
        </div>
      </aside>

      {/* ─── ORTA — SOHBET ─────────────────────────── */}
      <main className="relative flex-1 flex flex-col min-w-0" style={{ background: BG_MAIN }}>
        <div className="absolute inset-0 opacity-80" style={{ backgroundImage: DOT_GRID, backgroundSize: '22px 22px' }} />

        <header className="relative px-5 md:px-7 pt-5 md:pt-6 pb-4 border-b border-[#2e241c] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.35em] text-[#c4a165]">
              <span>MASA № {String(roomIndex(activeRoom.id) + 1 || 1).padStart(2, '0')}</span>
              <span className="text-[#6f5c43]">•</span>
              <span>{sentCount} {t('chat_cafe_messages')}</span>
            </div>
            <h2 lang="en" className="font-serif font-black text-[34px] md:text-[40px] leading-[0.95] tracking-tight text-[#f5e6c8] mt-1.5 truncate">
              #{roomLabel(activeRoom)}
            </h2>
            <p className="font-serif italic text-[12px] text-[#b39b77] mt-1 line-clamp-1">{roomTopic(activeRoom)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 border border-[#e8c07a]/60 text-[#e8c07a] font-mono text-[9px] uppercase tracking-widest">
                <ShieldCheck size={11} /> {t('chat_cafe_moderator')}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 border border-[#3a2c21] text-[#d8c9b4] hover:text-[#f5e6c8] hover:border-[#e8c07a]/60 transition-colors cursor-pointer"
              aria-label={t('chat_cafe_leave')}
              title={t('chat_cafe_leave')}
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Mesajlar */}
        <div className="relative flex-1 overflow-y-auto px-5 md:px-7 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-10">
              <span className="text-5xl opacity-60">☕</span>
              <p className="font-serif font-black text-2xl text-[#f5e6c8]">{t('chat_cafe_first_title')}</p>
              <p className="font-serif italic text-sm text-[#b39b77] max-w-xs">{t('chat_cafe_first_hint')}</p>
            </div>
          ) : (
            messages.map((msg) => {
              const time = formatRelativeTime(msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt);
              const seed = msg.uid === 'anon' ? `misafir-${msg.id}` : (msg.name || msg.uid || '?');
              const avatar = msg.uid === 'anon' ? resolveAvatar(null, seed) : resolveAvatar(msg.avatar, seed);
              return (
                <div key={msg.id} className="grid grid-cols-[44px_1fr] lg:grid-cols-[44px_1fr_auto] items-start gap-3 p-3 rounded-[10px] border border-[#2e241c] bg-[#241a13]/80 backdrop-blur-[2px]">
                  <div className="relative">
                    <img src={avatar} alt={msg.name} className="w-11 h-11 rounded-full object-cover border border-[#e8c07a]" referrerPolicy="no-referrer" />
                    {msg.isLocal && (
                      <span className="absolute -bottom-1 -right-1 font-mono text-[7px] bg-[#e8c07a] text-[#1a120c] px-1 border border-[#1a120c]">YEREL</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span lang="en" className="font-serif font-semibold text-[#f5e6c8] text-[14px]">{msg.name}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f7a5c]">{time}</span>
                    </div>
                    <p lang="en" className="text-[13.5px] text-[#d8c9b4] leading-snug mt-0.5 whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                  {msg.uid !== 'anon' && (
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="hidden lg:flex p-1.5 text-[#6f5c43] hover:text-[#e8c07a] transition-colors cursor-pointer self-start"
                      aria-label={t('chat_delete_message')}
                      title={t('chat_delete_message')}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Kahve menüsü kartı — not bırak */}
        <form onSubmit={onSend} className="relative border-t border-[#2e241c] p-4 md:p-5" style={{ background: '#1a120c' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-[#e8c07a]/90 rotate-[-0.6deg] shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
          <div className="bg-[#f6e7c1] text-[#1d1712] px-4 md:px-5 pt-2 pb-2.5 shadow-[6px_6px_0_#00000022] rotate-[-0.3deg]">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-[#7d5f22] border-b border-[#d9c9a0] pb-1.5 mb-1.5">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c2452e] inline-block" />
                {isSignedIn ? currentUserName : 'Misafir'}
              </span>
              <span>{isSignedIn ? t('chat_cafe_member') : t('chat_cafe_anon', { used: anonUsed, limit: anonLimit })}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => onChangeNewMessage(e.target.value)}
                placeholder={isSignedIn ? t('chat_input_placeholder', { room: roomLabel(activeRoom) }) : t('chat_anon_placeholder')}
                maxLength={250}
                className="flex-1 min-w-0 bg-transparent outline-none border-none placeholder-[#a8987a] text-[#1d1712] font-serif italic text-[17px] md:text-[19px] h-9"
                aria-label={t('chat_input_placeholder', { room: roomLabel(activeRoom) })}
              />
              <button
                type="submit"
                className="shrink-0 bg-[#1d1712] text-[#f6e7c1] font-mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] px-4 md:px-5 h-10 hover:bg-[#2a211a] transition-colors flex items-center gap-2 cursor-pointer"
              >
                {t('chat_cafe_send')} <Send size={12} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <p className="relative text-center font-mono text-[8px] uppercase tracking-[0.3em] text-[#6f5c43] mt-2 select-none">
            {isSignedIn ? t('chat_cafe_member_note') : t('chat_cafe_anon_note')}
          </p>
        </form>
      </main>

      {/* ─── SAĞ RAF ─────────────────────────── */}
      <aside className="hidden xl:flex flex-col w-[280px] 2xl:w-[312px] shrink-0 border-l border-[#2e241c]" style={{ background: BG_RAIL }}>
        <div className="p-5 border-b border-[#2e241c]">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#c4a165]">{t('chat_cafe_this_table')}</p>
          <p lang="en" className="font-serif font-black text-[26px] leading-none text-[#f5e6c8] mt-1.5">#{roomLabel(activeRoom)}</p>
          <p lang="en" className="font-serif italic text-[11px] text-[#b39b77] mt-1.5">{roomTopic(activeRoom)}</p>
        </div>
        <div className="p-5 border-b border-[#2e241c] space-y-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#8f7a5c]">{t('chat_cafe_rules')}</p>
          {[
            { icon: '🍵', text: t('chat_cafe_rule_1') },
            { icon: '🍿', text: t('chat_cafe_rule_2') },
            { icon: '🛡️', text: t('chat_cafe_rule_3') },
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-[#d8c9b4] leading-snug">
              <span>{rule.icon}</span>
              <span>{rule.text}</span>
            </div>
          ))}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#8f7a5c]">{t('chat_cafe_clock')}</p>
          <p className="font-serif font-black text-[56px] leading-none text-[#f5e6c8] mt-1 tabular-nums tracking-tighter">{clockText}</p>
          <p className="font-serif italic text-[11px] text-[#b39b77]">{dayText}</p>
          <div className="mt-auto pt-5 border-t border-[#2e241c] space-y-2 text-[10px] font-mono uppercase tracking-widest text-[#8f7a5c]">
            <p className="flex items-center gap-2"><Sparkles size={11} className="text-[#e8c07a]" /> {t('chat_cafe_footer_1')}</p>
            <p className="flex items-center gap-2"><ShieldCheck size={11} className="text-[#7fb069]" /> {t('chat_cafe_footer_2')}</p>
          </div>
        </div>
      </aside>
    </div>
  );
};
