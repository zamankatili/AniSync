import React, { useEffect, useRef } from 'react';
import { CornerUpLeft, Send, X } from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { CHAT_MESSAGE_MAX, type ChatReplyRef } from '../../lib/chatTypes';
import { previewChatText } from '../../lib/chatText';
import { cn } from '../../lib/utils';
import type { ChatAnonInfo } from './types';

interface ChatComposerProps {
  draft: string;
  onChange: (value: string) => void;
  onSend: () => void;
  replyTo: ChatReplyRef | null;
  onCancelReply: () => void;
  anon: ChatAnonInfo;
  roomLabel: string;
  compact?: boolean;
  focusSignal?: number;
}

/**
 * KÖŞE yazma alanı.
 *
 * - Enter gönderir, Shift+Enter yeni satır açar (IME kompozisyonu korunur).
 * - Oda başına taslak üst katmanda tutulur; burada yalnız yükseklik yönetilir.
 * - Misafir kotası ve "yalnız bu cihaz" notu her zaman görünür.
 */
export const ChatComposer: React.FC<ChatComposerProps> = ({
  draft,
  onChange,
  onSend,
  replyTo,
  onCancelReply,
  anon,
  roomLabel,
  compact,
  focusSignal,
}) => {
  const { t } = useAppTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exhausted = !anon.signedIn && anon.used >= anon.limit;
  const canSend = draft.trim().length > 0 && !exhausted;

  useEffect(() => {
    if (!focusSignal) return;
    textareaRef.current?.focus();
  }, [focusSignal]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, compact ? 96 : 132)}px`;
  }, [draft, compact]);

  const insertSpoiler = () => {
    const element = textareaRef.current;
    const start = element?.selectionStart ?? draft.length;
    const end = element?.selectionEnd ?? start;
    const selected = draft.slice(start, end);
    if (draft.length + 4 - selected.length > CHAT_MESSAGE_MAX) return;
    const next = `${draft.slice(0, start)}||${selected}||${draft.slice(end)}`.slice(0, CHAT_MESSAGE_MAX);
    onChange(next);
    requestAnimationFrame(() => {
      if (!element) return;
      element.focus();
      const caret = start + 2 + selected.length;
      element.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="border-t-4 border-white/20 bg-neutral-950 p-2.5 sm:p-3">
      {replyTo && (
        <div className="mb-2 flex items-stretch gap-2 border-2 border-amber-400/60 bg-amber-400/10 p-1.5">
          <CornerUpLeft size={16} className="mt-1 shrink-0 text-amber-400" strokeWidth={3} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-wider text-amber-300">
              {t('chat_replying_to', { name: replyTo.name })}
            </p>
            <p className="truncate text-[11px] text-neutral-300">{previewChatText(replyTo.text, 96)}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-neutral-400 hover:text-white"
            aria-label={t('chat_cancel_reply')}
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      {!anon.signedIn && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 border border-amber-400/50 bg-amber-400/10 px-2 py-1 text-[9px] font-black uppercase text-amber-400">
          <span>
            {exhausted
              ? t('chat_anon_exhausted')
              : t('chat_anon_remaining', { used: anon.used, limit: anon.limit })}
          </span>
          <span className="text-neutral-500">{t('chat_anon_only_this_device')}</span>
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSend) onSend();
        }}
        className="flex items-end gap-2"
      >
        <div className="flex min-w-0 flex-1 flex-col border-2 border-white/30 bg-black transition-colors focus-within:border-rose-500">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onChange(event.target.value.slice(0, CHAT_MESSAGE_MAX))}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || event.shiftKey) return;
              if (event.nativeEvent.isComposing || event.keyCode === 229) return;
              event.preventDefault();
              if (canSend) onSend();
            }}
            placeholder={
              anon.signedIn
                ? t('chat_input_placeholder', { room: roomLabel })
                : t('chat_anon_placeholder')
            }
            aria-label={t('chat_input_placeholder', { room: roomLabel })}
            rows={1}
            maxLength={CHAT_MESSAGE_MAX}
            className="max-h-32 min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-sm font-semibold leading-relaxed text-white outline-none placeholder:text-neutral-600"
          />
          <div className="flex items-center justify-between gap-2 border-t border-white/10 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={insertSpoiler}
                className="flex min-h-11 min-w-11 items-center justify-center font-mono text-[13px] font-black text-neutral-400 hover:text-amber-400"
                aria-label={t('chat_spoiler_insert')}
                title={t('chat_spoiler_insert')}
              >
                ||…||
              </button>
              <span className="hidden font-mono text-[9px] uppercase tracking-wider text-neutral-600 sm:inline">
                {t('chat_composer_hint')}
              </span>
            </div>
            <span
              className={cn(
                'pr-1 font-mono text-[9px] tabular-nums',
                draft.length >= CHAT_MESSAGE_MAX
                  ? 'font-black text-rose-400'
                  : draft.length > 200
                    ? 'text-amber-400'
                    : 'text-neutral-600',
              )}
            >
              {t('chat_char_count', { count: draft.length, max: CHAT_MESSAGE_MAX })}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSend}
          aria-label={t('send')}
          className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center border-2 border-black bg-white p-2.5 font-black text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={18} strokeWidth={2.5} className="translate-x-[1px]" />
        </button>
      </form>
    </div>
  );
};

export default ChatComposer;
