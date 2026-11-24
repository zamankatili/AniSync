import React from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { resolveAvatar } from '../lib/avatar';
import type { OnlineMember } from '../lib/presence';
import { cn } from '../lib/utils';

interface OnlineMemberGridProps {
  members: OnlineMember[];
  currentUid?: string | null;
  max?: number;
  variant?: 'compact' | 'comfortable';
}

/** Online üye avatarları; hem kart hem tam sayfa için ortak. */
export const OnlineMemberGrid: React.FC<OnlineMemberGridProps> = ({
  members,
  currentUid,
  max = 12,
  variant = 'compact',
}) => {
  const { t } = useAppTranslation();
  const shown = members.slice(0, max);
  const overflow = Math.max(0, members.length - shown.length);
  const comfortable = variant === 'comfortable';

  if (shown.length === 0) return null;

  return (
    <ul className={cn('grid gap-2', comfortable ? 'sm:grid-cols-2' : 'grid-cols-4 sm:grid-cols-5')}>
      {shown.map((member) => {
        const isSelf = currentUid === member.uid;
        const displayName = isSelf ? t('online_now_self') : member.name;
        return (
          <li key={member.uid} className="min-w-0">
            <Link
              to={isSelf ? '/profile' : `/profile/${member.uid}`}
              aria-label={displayName}
              title={displayName}
              className={cn(
                'min-h-[44px] min-w-[44px] border-2 transition-colors focus-visible:outline-none',
                comfortable
                  ? 'flex items-center gap-3 border-white/20 bg-neutral-950 p-2 hover:border-amber-400 focus-visible:border-amber-400'
                  : 'flex flex-col items-center gap-1 border-transparent p-0.5 hover:border-amber-400 focus-visible:border-amber-400',
              )}
            >
              <span
                className={cn(
                  'relative block shrink-0 border-2 border-white bg-neutral-900',
                  comfortable ? 'h-12 w-12' : 'h-11 w-11',
                )}
              >
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

              <span className={cn('min-w-0', comfortable ? 'flex-1 text-left' : 'w-full text-center')}>
                <span
                  className={cn(
                    'block truncate font-black uppercase tracking-wide text-neutral-200',
                    comfortable ? 'text-sm' : 'text-[9px]',
                  )}
                >
                  {displayName}
                </span>
                {comfortable && member.handle && (
                  <span className="mt-0.5 block truncate text-[10px] font-bold text-neutral-500">
                    @{member.handle}
                  </span>
                )}
              </span>

              {comfortable && isSelf && (
                <span className="shrink-0 border border-amber-400/60 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                  {t('online_now_self')}
                </span>
              )}
            </Link>
          </li>
        );
      })}

      {overflow > 0 && (
        <li
          className={cn(
            'flex min-h-[44px] items-center justify-center border-2 border-dashed border-white/30 text-[10px] font-black text-amber-300',
            comfortable ? 'sm:col-span-1' : '',
          )}
        >
          +{overflow}
        </li>
      )}
    </ul>
  );
};

export default OnlineMemberGrid;
