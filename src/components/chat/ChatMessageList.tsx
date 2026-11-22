import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, CornerUpLeft, Copy, Hash, Trash2 } from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { formatRelativeTime } from '../../lib/relativeTime';
import { previewChatText } from '../../lib/chatText';
import type { ChatMessage } from '../../lib/chatTypes';
import type { ChatTimelineItem } from '../../lib/chatTimeline';
import { cn } from '../../lib/utils';
import { resolveAvatar } from '../../lib/avatar';
import { ReportButton } from '../ReportButton';
import { ChatMessageBody } from './ChatMessageBody';

interface ChatMessageListProps {
  timeline: ChatTimelineItem[];
  loading: boolean;
  messageCount: number;
  searchTerm: string;
  roomLabel: string;
  roomTopic?: string;
  roomIcon?: string;
  onDelete: (messageId: string) => void;
  onReply: (message: ChatMessage) => void;
  onCopy: (text: string) => void;
  canDelete: (message: ChatMessage) => boolean;
  compact?: boolean;
}

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, children, danger }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={cn(
      'flex min-h-11 min-w-11 items-center justify-center border border-transparent transition-colors',
      danger
        ? 'text-neutral-500 hover:border-rose-500/50 hover:text-rose-400'
        : 'text-neutral-500 hover:border-white/30 hover:text-white',
    )}
  >
    {children}
  </button>
);

/**
 * KÖŞE mesaj akışı.
 *
 * Kullanıcı yukarı kaydırıp okurken yeni mesaj gelirse konumu zorla
 * değiştirilmez; sağ altta sayılı "en sona git" düğmesi çıkar. Kendi mesajı
 * gönderildiğinde ise otomatik olarak en alta dönülür.
 */
export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  timeline,
  loading,
  messageCount,
  searchTerm,
  roomLabel,
  roomTopic,
  roomIcon,
  onDelete,
  onReply,
  onCopy,
  canDelete,
  compact,
}) => {
  const { t, i18n } = useAppTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  const lastOwnIdRef = useRef<string | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const msgCount = timeline.reduce((total, item) => (item.type === 'msg' ? total + 1 : total), 0);

  const scrollToBottom = (smooth: boolean) => {
    const element = bodyRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    setUnseen(0);
    setStickToBottom(true);
  };

  useEffect(() => {
    const delta = msgCount - lastCountRef.current;
    lastCountRef.current = msgCount;
    if (delta <= 0) return;
    if (stickToBottom) {
      scrollToBottom(false);
    } else {
      setUnseen((current) => current + delta);
    }
  }, [msgCount, stickToBottom]);

  useEffect(() => {
    const lastMessage = [...timeline].reverse().find((item) => item.type === 'msg');
    if (!lastMessage || lastMessage.type !== 'msg' || !lastMessage.own) return;
    if (lastOwnIdRef.current === lastMessage.msg.id) return;
    lastOwnIdRef.current = lastMessage.msg.id;
    if (lastCountRef.current > 0) scrollToBottom(true);
  }, [timeline]);

  const handleScroll = () => {
    const element = bodyRef.current;
    if (!element) return;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    const atBottom = distance < 80;
    setStickToBottom(atBottom);
    if (atBottom) setUnseen(0);
  };

  const jumpToMessage = (messageId: string) => {
    const target = document.getElementById(`chat-msg-${messageId}`);
    if (!target) return;
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    target.classList.add('chat-msg-flash');
    window.setTimeout(() => target.classList.remove('chat-msg-flash'), 1400);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={bodyRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className={cn(
          'relative flex-1 space-y-3 overflow-y-auto bg-black',
          compact ? 'p-3' : 'p-3 sm:p-5',
        )}
      >
        {loading && timeline.length === 0 && (
          <div className="space-y-3 py-4" aria-hidden="true">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-start gap-2.5">
                <span className="h-8 w-8 shrink-0 animate-pulse border-2 border-white/20 bg-neutral-900" />
                <span className="flex-1 space-y-1.5">
                  <span className="block h-2.5 w-24 animate-pulse bg-neutral-800" />
                  <span className="block h-9 w-3/4 animate-pulse border-2 border-white/10 bg-neutral-900" />
                </span>
              </div>
            ))}
            <p className="text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              {t('chat_loading_messages')}
            </p>
          </div>
        )}

        {!loading && timeline.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
            {searchTerm.trim() ? (
              <div className="space-y-2 text-neutral-500">
                <Hash size={32} className="mx-auto text-neutral-700" />
                <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  {t('chat_search_empty')}
                </p>
              </div>
            ) : messageCount === 0 ? (
              <div className="w-full max-w-sm border-2 border-white/15 bg-neutral-950 p-5 shadow-[4px_4px_0_0_rgba(255,255,255,0.08)]">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-amber-400/60 bg-amber-400/10 text-2xl">
                  <span aria-hidden="true">{roomIcon || '#'}</span>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-amber-400">KÖŞE</p>
                <h3 lang="en" className="mt-1 text-lg font-black uppercase tracking-tight text-white">
                  #{roomLabel}
                </h3>
                {roomTopic && (
                  <p className="mt-2 text-[11px] font-semibold leading-relaxed text-neutral-400">
                    {roomTopic}
                  </p>
                )}
                <p className="mt-4 border-t border-white/10 pt-3 text-[10px] font-black uppercase tracking-widest text-neutral-300">
                  {t('chat_first_message', { room: roomLabel })}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase text-neutral-600">{t('chat_rules')}</p>
              </div>
            ) : (
              <div className="space-y-2 text-neutral-500">
                <Hash size={32} className="mx-auto text-neutral-700" />
                <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  {t('chat_search_empty')}
                </p>
              </div>
            )}
          </div>
        )}

        {timeline.map((item) => {
          if (item.type === 'day') {
            return (
              <div key={item.key} className="flex items-center gap-2 py-1">
                <span className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500">
                  {item.label}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
            );
          }

          if (item.type === 'new') {
            return (
              <div
                key={item.key}
                className="flex items-center gap-2 border-y-2 border-rose-500/60 bg-rose-500/10 px-2 py-1.5"
              >
                <CornerUpLeft size={12} className="shrink-0 text-rose-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-rose-300">
                  {t('chat_since_last_visit')}
                </span>
                <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-rose-300/80">
                  {t('chat_new_messages_count', { count: item.count })}
                </span>
              </div>
            );
          }

          const { msg, own, showHeader, mentionsMe, createdIso } = item;
          const replyTo = msg.replyTo;
          const ownDeletable = canDelete(msg);

          return (
            <article
              key={item.key}
              id={`chat-msg-${msg.id}`}
              className={cn(
                'group/msg relative flex flex-col',
                own ? 'items-end' : 'items-start',
                mentionsMe && 'border-l-4 border-rose-500 pl-2',
              )}
            >
              {showHeader && (
                <div className="mb-1 flex flex-wrap items-center gap-1.5 pl-1">
                  <img
                    src={msg.avatar || resolveAvatar(null, msg.uid === 'anon' ? `misafir-${msg.id}` : msg.name)}
                    alt=""
                    className="h-7 w-7 shrink-0 border-2 border-white/70 bg-neutral-900 object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-200">
                    {msg.name}
                  </span>
                  {msg.isLocal && (
                    <span className="border border-amber-400 bg-amber-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase text-amber-400">
                      {t('chat_local_room_badge')}
                    </span>
                  )}
                  {mentionsMe && (
                    <span className="border border-rose-400 bg-rose-500/20 px-1.5 py-0.5 text-[8px] font-black uppercase text-rose-300">
                      {t('chat_mentions_you')}
                    </span>
                  )}
                </div>
              )}

              <div
                className={cn(
                  'max-w-[85%] border-2 px-3 py-2 text-[13px] font-semibold leading-relaxed text-left shadow-[3px_3px_0_0_rgba(255,255,255,0.08)]',
                  compact ? 'max-w-[92%]' : '',
                  own
                    ? 'border-rose-300/70 bg-rose-700 text-white'
                    : 'border-white/20 bg-neutral-900 text-neutral-100',
                )}
              >
                {replyTo && (
                  <button
                    type="button"
                    onClick={() => jumpToMessage(replyTo.id)}
                    aria-label={t('chat_reply_jump', { name: replyTo.name })}
                    className="mb-1.5 flex w-full items-stretch gap-2 border-l-4 border-amber-400 bg-black/35 p-1.5 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[9px] font-black uppercase tracking-wider text-amber-300">
                        {replyTo.name}
                      </span>
                      <span className="line-clamp-2 text-[11px] font-medium text-neutral-300">
                        {previewChatText(replyTo.text, 96)}
                      </span>
                    </span>
                  </button>
                )}
                <ChatMessageBody text={msg.text} query={searchTerm} />
              </div>

              {confirmDeleteId !== msg.id && (
                <div
                  className={cn(
                    'mt-0.5 flex w-full flex-wrap items-center gap-0.5 transition-opacity sm:opacity-0 sm:group-hover/msg:opacity-100 sm:focus-within:opacity-100',
                    own ? 'justify-end' : 'justify-start',
                  )}
                >
                  <time className="px-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                    {formatRelativeTime(createdIso ?? undefined, i18n.language) || t('chat_now')}
                  </time>
                  <ActionButton label={t('chat_reply')} onClick={() => onReply(msg)}>
                    <CornerUpLeft size={14} strokeWidth={2.5} />
                  </ActionButton>
                  <ActionButton label={t('chat_copy')} onClick={() => onCopy(msg.text)}>
                    <Copy size={14} strokeWidth={2.5} />
                  </ActionButton>
                  {ownDeletable ? (
                    <ActionButton
                      label={t('chat_delete_message')}
                      danger
                      onClick={() => setConfirmDeleteId(msg.id)}
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </ActionButton>
                  ) : (
                    <ReportButton
                      target={{
                        targetPath: `globalChat/${msg.id}`,
                        targetLabel: msg.text?.slice(0, 60),
                      }}
                      compact
                      className="min-h-11 min-w-11 justify-center"
                    />
                  )}
                </div>
              )}

              {confirmDeleteId === msg.id && (
                <div className="mt-1 flex flex-wrap items-center gap-1 border-2 border-rose-500 bg-rose-950/50 p-1">
                  <span className="px-1 text-[10px] font-black uppercase tracking-wider text-rose-100">
                    {t('chat_delete_confirm')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(msg.id);
                      setConfirmDeleteId(null);
                    }}
                    className="min-h-11 border-2 border-rose-500 bg-rose-600 px-2.5 text-[10px] font-black uppercase text-white hover:bg-rose-500"
                  >
                    {t('chat_delete_confirm_yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="min-h-11 border-2 border-white/30 px-2.5 text-[10px] font-black uppercase text-neutral-200 hover:border-white hover:bg-white hover:text-black"
                  >
                    {t('chat_delete_confirm_no')}
                  </button>
                </div>
              )}
            </article>
          );
        })}

        <div ref={endRef} />
      </div>

      {(!stickToBottom || unseen > 0) && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 border-2 border-black bg-amber-400 px-2.5 py-2 text-[9px] font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#fff]"
        >
          <ArrowDown size={13} strokeWidth={3} />
          {unseen > 0 && (
            <span className="border border-black bg-rose-600 px-1 text-white">
              {unseen > 99 ? '99+' : unseen}
            </span>
          )}
          {t('chat_jump_latest')}
        </button>
      )}

      <style>{`
        @keyframes chatMsgFlash {
          0% { background-color: rgba(244, 63, 94, 0.28); }
          100% { background-color: transparent; }
        }
        .chat-msg-flash { animation: chatMsgFlash 1.2s ease-out; }
      `}</style>
    </div>
  );
};

export default ChatMessageList;
