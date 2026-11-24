import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useOnlineMembers } from '../hooks/usePresence';
import { resolveAvatar } from '../lib/avatar';
import { PRESENCE_QUERY_LIMIT, PRESENCE_WINDOW_MS } from '../lib/presence';
import { cn } from '../lib/utils';

interface OnlineNowProps {
  variant?: 'card' | 'compact';
  className?: string;
}

/**
 * Yaklaşık çevrimiçi üye şeridi. Misafirler yazmaz ve listede görünmez;
 * yalnızca son 5 dakikada kalp atışı gönderen girişli üyeler gösterilir.
 */
export const OnlineNow: React.FC<OnlineNowProps> = ({ variant = 'card', className }) => {
  const { t } = useAppTranslation();
  const { currentUser } = useAppStore();
  const { members, loading, error } = useOnlineMembers();
  const titleId = useId();
  const compact = variant === 'compact';
  const maxAvatars = compact ? 8 : 12;
  const shown = members.slice(0, maxAvatars);
  const overflow = Math.max(0, members.length - shown.length);
  const countLabel = `${members.length}${members.length >= PRESENCE_QUERY_LIMIT ? '+' : ''}`;
  const windowMinutes = Math.round(PRESENCE_WINDOW_MS / 60_000);

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
      </p>

      {error ? (
        <p role="status" className="mt-3 text-[11px] font-bold text-neutral-400">
          {t('online_now_unavailable')}
        </p>
      ) : loading ? (
        <p role="status" className="mt-3 text-[11px] font-bold text-neutral-400">
          {t('online_now_loading')}
        </p>
      ) : shown.length === 0 ? (
        <p role="status" className="mt-3 text-[11px] font-bold text-neutral-400">
          {t('online_now_empty')}
        </p>
      ) : (
        <ul className={cn('mt-3 grid gap-2', compact ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-5')}>
          {shown.map((member) => {
            const isSelf = currentUser?.uid === member.uid;
            const displayName = isSelf ? t('online_now_self') : member.name;
            return (
              <li key={member.uid} className="min-w-0">
                <Link
                  to={isSelf ? '/profile' : `/profile/${member.uid}`}
                  aria-label={displayName}
                  title={displayName}
                  className="flex min-h-[44px] min-w-[44px] flex-col items-center gap-1 border-2 border-transparent p-0.5 transition-colors hover:border-amber-400 focus-visible:border-amber-400 focus-visible:outline-none"
                >
                  <span className="relative block h-11 w-11 shrink-0 border-2 border-white bg-neutral-900">
                    <img
                      src={resolveAvatar(member.photoURL, member.avatarSeed || member.handle || member.uid)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-black bg-emerald-400"
                    />
                  </span>
                  <span className="w-full truncate text-center text-[9px] font-black uppercase tracking-wide text-neutral-300">
                    {displayName}
                  </span>
                </Link>
              </li>
            );
          })}
          {overflow > 0 && (
            <li className="flex min-h-[44px] items-center justify-center border-2 border-dashed border-white/30 text-[10px] font-black text-amber-300">
              +{overflow}
            </li>
          )}
        </ul>
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
