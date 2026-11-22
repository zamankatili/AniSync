import React from 'react';
import { Calendar } from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { cn } from '../../lib/utils';
import type { ChatEventInfo } from './types';

interface ChatEventBannerProps {
  event: ChatEventInfo;
}

/** Admin'in açtığı canlı etkinlik bandı. Etkinlik yoksa hiç basılmaz. */
export const ChatEventBanner: React.FC<ChatEventBannerProps> = ({ event }) => {
  const { t } = useAppTranslation();

  return (
    <div className="flex items-center justify-between gap-2 border-b-2 border-white/20 bg-gradient-to-r from-rose-900/60 to-purple-900/60 p-2 px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Calendar size={14} className="shrink-0 text-amber-400" />
        <div className="min-w-0">
          <span className="block truncate text-[10px] font-black uppercase tracking-wider text-white">
            {event.title}
          </span>
          <span className="text-[9px] font-bold uppercase text-neutral-300">
            {event.date ? `${event.date} · ` : ''}
            {event.attendees === null
              ? t('chat_attendees_loading')
              : t('chat_attendees', { count: event.attendees })}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={event.onToggle}
        disabled={event.busy}
        className={cn(
          'min-h-11 shrink-0 cursor-pointer border-2 px-2.5 text-[10px] font-black uppercase tracking-wider transition-colors disabled:cursor-wait disabled:opacity-50',
          event.joined
            ? 'border-black bg-emerald-500 text-black'
            : 'border-black bg-white text-black hover:bg-amber-400',
        )}
      >
        {event.busy ? '…' : event.joined ? t('chat_joined') : t('chat_join')}
      </button>
    </div>
  );
};

export default ChatEventBanner;
