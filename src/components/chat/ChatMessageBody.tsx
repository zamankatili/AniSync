import React, { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { parseChatText } from '../../lib/chatText';
import { cn } from '../../lib/utils';

interface HighlightedTextProps {
  text: string;
  query?: string;
}

/** Arama terimini büyük/küçük harf duyarsız vurgular; HTML üretmez. */
const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => {
  const needle = (query || '').trim().toLocaleLowerCase();
  if (!needle) return <>{text}</>;

  const haystack = text.toLocaleLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let index = haystack.indexOf(needle);
  let guard = 0;

  while (index !== -1 && guard < 60) {
    if (index > cursor) parts.push(text.slice(cursor, index));
    parts.push(
      <mark key={`${index}-${guard}`} className="bg-amber-400 px-0.5 text-black">
        {text.slice(index, index + needle.length)}
      </mark>,
    );
    cursor = index + needle.length;
    index = haystack.indexOf(needle, cursor);
    guard += 1;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
};

interface ChatMessageBodyProps {
  text: string;
  query?: string;
  className?: string;
}

/**
 * Mesaj gövdesi: spoiler, bağlantı ve anma parçaları.
 * Tüm içerik React düğümü olarak basılır; `dangerouslySetInnerHTML` yoktur.
 */
export const ChatMessageBody: React.FC<ChatMessageBodyProps> = ({ text, query, className }) => {
  const { t } = useAppTranslation();
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const segments = useMemo(() => parseChatText(text), [text]);

  return (
    <span className={cn('whitespace-pre-wrap break-words', className)}>
      {segments.map((segment, index) => {
        if (segment.kind === 'spoiler') {
          if (revealed[index]) {
            return (
              <span key={index} className="inline">
                <span className="border-b border-amber-400/50 bg-amber-400/10 px-1 text-amber-100">
                  <HighlightedText text={segment.text} query={query} />
                </span>
                <button
                  type="button"
                  onClick={() => setRevealed((current) => ({ ...current, [index]: false }))}
                  className="relative ml-1 inline-flex items-center text-[10px] font-black uppercase tracking-wider text-neutral-400 underline decoration-dotted hover:text-white after:absolute after:-inset-y-2 after:inset-x-0 after:content-['']"
                  aria-label={t('chat_spoiler_hide')}
                >
                  <EyeOff size={11} strokeWidth={3} />
                </button>
              </span>
            );
          }
          return (
            <button
              key={index}
              type="button"
              onClick={() => setRevealed((current) => ({ ...current, [index]: true }))}
              className="relative mx-0.5 inline-flex items-center gap-1 border border-rose-400/70 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-300 hover:bg-rose-500 hover:text-white after:absolute after:-inset-y-2 after:inset-x-0 after:content-['']"
              aria-label={t('chat_spoiler_reveal')}
              aria-expanded={false}
            >
              <Eye size={11} strokeWidth={3} />
              {t('chat_spoiler_label')}
            </button>
          );
        }

        if (segment.kind === 'link') {
          return (
            <a
              key={index}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={(event) => event.stopPropagation()}
              className="break-all font-bold text-amber-300 underline decoration-amber-400/60 underline-offset-2 hover:text-amber-200"
            >
              <HighlightedText text={segment.text} query={query} />
            </a>
          );
        }

        if (segment.kind === 'mention') {
          return (
            <mark
              key={index}
              className="bg-amber-400/25 px-0.5 font-black text-amber-300"
            >
              {segment.text}
            </mark>
          );
        }

        return <HighlightedText key={index} text={segment.text} query={query} />;
      })}
    </span>
  );
};

export default ChatMessageBody;
