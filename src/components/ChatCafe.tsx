import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Send, Trash2, Sparkles, ChevronRight, Plus, Vote, LogIn, ShieldCheck, Maximize2
} from 'lucide-react';
import { cn, formatRelativeTime } from '../lib/utils';
import { resolveAvatar } from '../lib/avatar';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { DIRECT_ROOM_MIN_XP, ROOM_VOTE_THRESHOLD, OFFICIAL_ROOMS, type OfficialRoom } from '../lib/rooms';
import type { ChatMessage, ChatRoomItem } from './GlobalChat';
import { useIsLargeScreen } from '../lib/useMediaQuery';

/**
 * KÖŞE — tam ekran "otaku mahallesi köşe masası" sohbeti.
 * https://anisync-tau.vercel.app/kose referansındaki görünümden ilhamla,
 * kendi tasarım dilimize uyarlanmıştır: koyu zeytin, amber sınırlar, serif.
 *
 * Küçük ekranlarda otomatik olarak yüzen panel kullanılır; bu bileşen
 * yalnızca geniş ekranlarda render edilir.
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
  levelInfo?: { level: number; title: string };
}

const BG = 'radial-gradient(1200px 700px at 65% -10%, rgba(232,192,122,0.10), transparent 55%), radial-gradient(900px 800px at -10% 115%, rgba(127,176,105,0.07), transparent 55%), #141c17';
const CARD = '#1d2722';
const CARD_SOFT = '#242f28';
const BORDER = '#e8c07a33';
const BORDER_STRONG = '#e8c07a66';
const TEXT = '#f2ead8';
const MUTED = '#8ba08f';
const GOLD = '#e8c07a';

const CIRCLE_COLORS: Record<string, string> = {
  genel: '#e8c07a',
  'haftalik-spoiler': '#e07040',
  'one-piece-spoiler': '#d94a3d',
  'bolum-odasi': '#57b8a2',
  muzik: '#b083f0',
  'vs-tartisma': '#e05252',
  etkinlik: '#5aa4e6',
};

const KIND_BADGES: Array<{ prefix: string; label: string; className: string }> = [
  { prefix: 'soru:', label: 'SORU', className: 'text-amber-300 border-amber-400/50 bg-amber-400/10' },
  { prefix: 'öneri:', label: 'ÖNERİ', className: 'text-emerald-300 border-emerald-400/50 bg-emerald-400/10' },
  { prefix: 'oneri:', label: 'ÖNERİ', className: 'text-emerald-300 border-emerald-400/50 bg-emerald-400/10' },
  { prefix: 'inceleme:', label: 'İNCELEME', className: 'text-purple-300 border-purple-400/50 bg-purple-400/10' },
  { prefix: 'sohbet:', label: 'SOHBET', className: 'text-neutral-300 border-neutral-500/50 bg-neutral-500/10' },
];

const detectKind = (text: string) => {
  const lower = text.toLowerCase();
  return KIND_BADGES.find((b) => lower.startsWith(b.prefix));
};

const chipPrefix = (chip: string) => {
  if (chip === 'Sohbet') return 'Sohbet:';
  if (chip === 'Soru') return 'Soru:';
  if (chip === 'Öneri') return 'Öneri:';
  return '';
};

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
  levelInfo,
}) => {
  const { t } = useAppTranslation();
  const [activeChip, setActiveChip] = useState<string>('Sohbet');
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

  const chipLabel = (chip: string): string => {
    const map: Record<string, string> = {
      Sohbet: 'Sohbet',
      Soru: 'Soru',
      Öneri: 'Öneri',
      İnceleme: 'İnceleme',
    };
    return map[chip] ?? chip;
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto" style={{ background: BG, color: TEXT }}>
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 pt-4 md:pt-6 pb-10">

        {/* ─── ÜST ŞERİT ───────────────────── */}
        <header className="flex items-start justify-between gap-4 border-b border-[#e8c07a1f] pb-4 md:pb-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#b3c7b0]">ANİSYNC · İÇ MAHALLE</p>
            <h1 className="font-serif font-black text-[64px] md:text-[80px] leading-[0.92] tracking-tight text-[#f2ead8] mt-1 select-none">KÖŞE</h1>
            <p className="font-serif italic text-[13.5px] md:text-[15px] text-[#b3c7b0] mt-2 max-w-md leading-snug">
              {t('chat_cafe_tagline')}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0 pt-2">
            <button
              onClick={onClose}
              className="flex items-center gap-2 border border-[#e8c07a33] text-[#e8c07a] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-[#e8c07a] hover:text-[#141c17] transition-all cursor-pointer"
              aria-label={t('chat_back_to_panel')}
              title={t('chat_back_to_panel')}
            >
              <Maximize2 size={13} strokeWidth={2.5} />
              {t('chat_back_to_panel')}
            </button>
            <div className="text-right">
              <p className="font-serif font-bold text-[20px] leading-none text-[#f2ead8] tabular-nums">{clockText}</p>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[#8ba08f] mt-0.5">{dayText}</p>
            </div>
            {isSignedIn ? (
              <div className="flex items-center gap-2 border border-[#e8c07a33] px-2 py-1">
                {currentUserAvatar ? (
                  <img src={currentUserAvatar} alt={currentUserName} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#e8c07a]/20 border border-[#e8c07a] flex items-center justify-center text-[10px] font-black text-[#e8c07a]">{(currentUserName || '?').charAt(0).toUpperCase()}</span>
                )}
                <span className="font-mono text-[10px] font-bold uppercase text-[#f2ead8] max-w-[110px] truncate">{currentUserName}</span>
              </div>
            ) : (
              <button className="flex items-center gap-1.5 border border-[#e8c07a]/60 text-[#e8c07a] px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest hover:bg-[#e8c07a] hover:text-[#141c17] transition-all cursor-pointer">
                <LogIn size={11} strokeWidth={3} /> {t('chat_anon_cta')}
              </button>
            )}
          </div>
        </header>

        {/* ─── MASALAR ───────────────────────────────── */}
        <section className="mt-5 md:mt-6">
          <div className="flex items-end justify-between gap-3 pb-2 border-b border-[#e8c07a1f]">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#b3c7b0]">MASALAR</p>
            <p className="font-mono text-[8px] uppercase tracking-widest text-[#8ba08f]">
              {t('chat_cafe_caption', { defaultValue: 'katıldığın masaların akışta hep görünür' })}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {rooms.map((room) => {
              const active = room.id === activeRoom.id;
              const tint = CIRCLE_COLORS[room.id] ?? '#8ba08f';
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={cn(
                    'group relative text-left p-3 md:p-4 border transition-all cursor-pointer rounded-[10px]',
                    active
                      ? 'border-[#e8c07a] bg-[#242f28] shadow-[0_0_30px_-8px_rgba(232,192,122,0.45)]'
                      : 'border-[#e8c07a33] bg-[#1d2722] hover:border-[#e8c07a66] hover:-translate-y-0.5'
                  )}
                  style={{ background: active ? `linear-gradient(160deg, ${tint}14, transparent 70%), ${CARD_SOFT}` : `linear-gradient(160deg, ${tint}0c, transparent 70%), ${CARD}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[20px] md:text-[22px] shrink-0 border border-[#e8c07a33]"
                      style={{ background: `radial-gradient(circle at 35% 35%, ${tint}33, transparent 70%)`, color: tint }}
                    >
                      {room.icon}
                    </span>
                    <span className="min-w-0">
                      <span lang="en" className="block text-[12px] md:text-[13px] font-black uppercase leading-tight truncate text-[#f2ead8] group-hover:text-[#e8c07a] transition-colors">#{roomLabel(room)}</span>
                      <span className="block text-[8px] md:text-[9px] font-mono uppercase tracking-widest text-[#8ba08f] mt-1 truncate">
                        {room.isOfficial ? t(`chat_room_badge_${room.id}`, { defaultValue: room.badge }) : t('chat_badge_community', { defaultValue: 'TOPLULUK' })}
                      </span>
                    </span>
                  </div>
                  <p className="text-[9px] md:text-[10px] text-[#b3c7b0] leading-snug mt-2.5 line-clamp-2 min-h-[28px]">{roomTopic(room)}</p>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#e8c07a1f]">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[#8ba08f]">№ {(OFFICIAL_ROOMS.findIndex((r) => r.id === room.id) + 1) || '•'}</span>
                    {active ? (
                      <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#e8c07a]">{t('chat_cafe_joined')} ✓</span>
                    ) : (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#b3c7b0] group-hover:text-[#e8c07a]">{t('chat_cafe_join')} →</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Yeni masa kartı */}
            <button
              onClick={onOpenCreateModal}
              className="group text-left p-3 md:p-4 border border-dashed border-[#e8c07a44] rounded-[10px] flex flex-col justify-between min-h-[128px] hover:border-[#e8c07a] hover:bg-[#e8c07a08] transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#b3c7b0]">
                <Plus size={14} strokeWidth={3} /> {canDirectCreate ? t('chat_open_room') : t('chat_request_room')}
              </span>
              <span className="text-[9px] font-mono text-[#8ba08f] leading-snug">
                {canDirectCreate
                  ? t('chat_rule_direct', { defaultValue: `${DIRECT_ROOM_MIN_XP}+ XP — doğrudan aç` })
                  : t('chat_rule_request', { defaultValue: `${ROOM_VOTE_THRESHOLD} OY + Moderatör onayı` })}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#e8c07a]">→ {canDirectCreate ? '500 XP ✓' : `${ROOM_VOTE_THRESHOLD} OY`}</span>
            </button>
          </div>
        </section>

        {/* ─── COMPOSER + AKIŞ ───────────────────────── */}
        <section className="mt-6 md:mt-7 max-w-[860px] mx-auto w-full">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#e8c07a1f]">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#b3c7b0]">{t('chat_cafe_feed_label')}</p>
            <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-[#8ba08f]">
              {pendingRoomCount > 0 && (
                <button
                  onClick={onOpenQueue}
                  className="flex items-center gap-1 border border-[#e8c07a44] text-[#e8c07a] px-2 py-1 hover:bg-[#e8c07a] hover:text-[#141c17] transition-all cursor-pointer"
                >
                  <Vote size={11} /> {t('chat_pending_requests')} ({pendingRoomCount})
                </button>
              )}
              {!isSignedIn && (
                <span className="hidden sm:inline">{t('chat_anon_remaining', { used: anonUsed, limit: anonLimit })}</span>
              )}
              {levelInfo && (
                <span className="hidden lg:inline-flex items-center gap-1.5 border border-[#e8c07a33] px-2 py-1 text-[#e8c07a]">
                  <Sparkles size={11} /> LV {levelInfo.level} · {levelInfo.title}
                </span>
              )}
            </div>
          </div>

          {/* Composer */}
          <form onSubmit={onSend} className="mt-3 border border-[#e8c07a33] rounded-[10px] bg-[#1d2722] p-3 flex gap-3 items-center">
            <img
              src={resolveAvatar(currentUserAvatar, isSignedIn ? currentUserName : `misafir-${anonUsed}`)}
              alt={currentUserName}
              className="w-11 h-11 rounded-[8px] object-cover border border-[#e8c07a33] shrink-0"
              referrerPolicy="no-referrer"
            />
            <input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => onChangeNewMessage(e.target.value)}
              placeholder={isSignedIn ? t('chat_input_placeholder', { room: roomLabel(activeRoom) }) : t('chat_anon_placeholder')}
              maxLength={250}
              className="flex-1 min-w-0 bg-transparent outline-none border-none placeholder-[#5f7263] text-[#f2ead8] font-serif italic text-[15px] md:text-[16px] h-10"
              aria-label={t('chat_input_placeholder', { room: roomLabel(activeRoom) })}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="shrink-0 bg-[#e8c07a] disabled:opacity-40 text-[#141c17] font-mono text-[11px] md:text-[12px] font-black uppercase tracking-[0.25em] px-4 md:px-5 h-11 hover:bg-[#f2d083] transition-colors flex items-center gap-2 cursor-pointer"
            >
              {t('chat_cafe_share')} <Send size={13} strokeWidth={3} />
            </button>
          </form>

          {/* Akış */}
          <div className="mt-4 space-y-3">
            {messages.length === 0 ? (
              <div className="border border-dashed border-[#e8c07a33] rounded-[10px] py-12 px-6 text-center">
                <p className="font-serif font-black text-[26px] text-[#f2ead8]">{t('chat_cafe_first_title')}</p>
                <p className="font-serif italic text-[12.5px] text-[#b3c7b0] mt-2 max-w-md mx-auto leading-snug">{t('chat_cafe_first_hint')}</p>
              </div>
            ) : (
              messages.map((msg) => {
                const kind = detectKind(msg.text);
                const isMe = msg.uid === 'anon' || msg.isLocal;
                const avatar = msg.uid === 'anon' || msg.isLocal
                  ? resolveAvatar(null, `misafir-${msg.id}`)
                  : resolveAvatar((msg as any).avatar, msg.name || msg.uid);
                const time = formatRelativeTime(
                  msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt,
                );
                const kindKey = kind;
                return (
                  <article key={msg.id} className="group relative border border-[#e8c07a1f] rounded-[10px] bg-[#1d2722] p-3 md:p-4 flex gap-3 hover:border-[#e8c07a44] transition-colors">
                    <img
                      src={avatar}
                      alt={msg.name}
                      className="w-11 h-11 rounded-[8px] object-cover border border-[#e8c07a33] shrink-0 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span lang="en" className="font-serif font-bold text-[14.5px] text-[#f2ead8]">{msg.name}</span>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8ba08f]">{time}</span>
                        {msg.isLocal && (
                          <span className="font-mono text-[8px] font-black px-1.5 py-0.5 border border-[#e8c07a] text-[#e8c07a] rounded-[4px]">YEREL</span>
                        )}
                        {kindKey && (
                          <span className={cn('font-mono text-[8px] font-black px-1.5 py-0.5 border rounded-[4px]', kindKey.className)}>
                            {kindKey.label}
                          </span>
                        )}
                      </div>
                      <p lang="en" className="text-[13.5px] leading-relaxed text-[#d8c9b4] mt-1 whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    {(isMe || isAdmin) && (
                      <button
                        onClick={() => onDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 self-start p-1.5 text-[#5f7263] hover:text-[#e07040] transition-all cursor-pointer"
                        aria-label={t('chat_delete_message')}
                        title={t('chat_delete_message')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatCafe;
