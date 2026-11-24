import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useActiveTodayCount, useOnlineMembers } from '../hooks/usePresence';
import { PRESENCE_QUERY_LIMIT, PRESENCE_WINDOW_MS } from '../lib/presence';
import { cn } from '../lib/utils';
import { OnlineMemberGrid } from './OnlineMemberGrid';

interface OnlineNowProps {
  variant?: 'card' | 'compact';
  className?: string;
  showSeeAll?: boolean;
}

/**
 * Yaklaşık çevrimiçi üye şeridi. Misafirler yazmaz ve listede görünmez;
 * yalnızca son 5 dakikada kalp atışı gönderen girişli üyeler gösterilir.
 */
export const OnlineNow: React.FC<OnlineNowProps> = ({
  variant = 'card',
  className,
  showSeeAll = true,
}) => {
  const { t } = useAppTranslation();
  const { currentUser } = useAppStore();
  const { members, loading, error } = useOnlineMembers();
  const { count: todayCount, loading: todayLoading, error: todayError } = useActiveTodayCount();
  const titleId = useId();
  const compact = variant === 'compact';
  const maxAvatars = compact ? 8 : 12;
  const countLabel = `${members.length}${members.length >= PRESENCE_QUERY_LIMIT ? '+' : ''}`;
  const windowMinutes = Math.round(PRESENCE_WINDOW_MS / 60_000);
  const todayLabel = todayLoading ? '…' : String(todayCount);

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'border-4 border-white bg-black text-white neo-shadow-white',
        compact ? 'p-3' : 'p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id={titleId}
          className={cn(
            'flex min-w-0 items-center gap-1.5 font-black uppercase tracking-wider',
            compact ? 'text-[11px]' : 'text-sm',
          )}
        >
          <Users size={compact ? 14 : 16} strokeWidth={2.5} className="shrink-0 text-amber-400" />
          <span className="truncate">{t('online_now_title')}</span>
        </h2>
        <span
          aria-live="polite"
          className="shrink-0 border border-white/30 bg-neutral-900 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300"
        >
          {loading ? '…' : t('online_now_count', { count: countLabel })}
        </span>
      </div>

      <p className={cn('mt-1 font-bold uppercase tracking-wide text-neutral-400', compact ? 'text-[9px]' : 'text-[10px]')}>
        {t('online_now_desc', { minutes: windowMinutes })}
        {!todayError && (
          <>
            {' · '}
            {t('online_now_today_short', { count: todayLabel })}
          </>
        )}
      </p>

      {error ? (
        <p role="status" className="mt-3 text-[11px] font-bold text-neutral-400">
          {t('online_now_unavailable')}
        </p>
      ) : loading ? (
        <p role="status" className="mt-3 text-[11px] font-bold text-neutral-400">
          {t('online_now_loading')}
        </p>
      ) : members.length === 0 ? (
        <p role="status" className="mt-3 text-[11px] font-bold text-neutral-400">
          {t('online_now_empty')}
        </p>
      ) : (
        <div className="mt-3">
          <OnlineMemberGrid
            members={members}
            currentUid={currentUser?.uid}
            max={maxAvatars}
          />
        </div>
      )}

      {showSeeAll && (
        <Link
          to="/online"
          className="mt-3 inline-flex min-h-[44px] items-center gap-1 border-2 border-amber-400 px-3 text-[10px] font-black uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-400 hover:text-black"
        >
          {t('online_now_open')}
          <ChevronRight size={14} strokeWidth={3} />
        </Link>
      )}

      {!currentUser && (
        <p className="mt-3 border-t border-white/10 pt-2 text-[9px] font-bold leading-relaxed text-neutral-500">
          {t('online_now_guest')}
        </p>
      )}
    </section>
  );
};

export default OnlineNow;
