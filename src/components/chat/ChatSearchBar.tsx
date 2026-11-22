import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface ChatSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  matchCount?: number;
  focusOnMount?: boolean;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
  value,
  onChange,
  onClose,
  matchCount,
  focusOnMount,
}) => {
  const { t } = useAppTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);

  return (
    <div className="flex items-center gap-2 border-b-2 border-white/20 bg-black p-2">
      <Search size={16} className="shrink-0 text-amber-400" strokeWidth={2.5} />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.stopPropagation();
          if (value) onChange('');
          else onClose();
        }}
        placeholder={t('chat_search_placeholder')}
        aria-label={t('chat_search_placeholder')}
        className="min-h-11 min-w-0 flex-1 border-2 border-white/20 bg-neutral-950 px-2.5 text-xs font-bold text-white placeholder-neutral-600 outline-none transition-colors focus:border-amber-400"
      />
      {value ? (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-amber-400">
          {typeof matchCount === 'number' ? matchCount : ''}
        </span>
      ) : null}
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex min-h-11 min-w-11 items-center justify-center text-neutral-400 hover:text-white"
          aria-label={t('chat_search_empty')}
        >
          <X size={14} strokeWidth={3} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 min-w-11 items-center justify-center text-neutral-400 hover:text-white"
          aria-label={t('close')}
        >
          <X size={16} strokeWidth={3} />
        </button>
      )}
    </div>
  );
};

export default ChatSearchBar;
