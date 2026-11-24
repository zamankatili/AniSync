import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, Users } from 'lucide-react';
import { OnlineMemberGrid } from '../components/OnlineMemberGrid';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useActiveTodayCount, useOnlineMembers } from '../hooks/usePresence';
import { PRESENCE_QUERY_LIMIT, PRESENCE_WINDOW_MS } from '../lib/presence';
import { cn } from '../lib/utils';

interface PresenceStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: 'emerald' | 'amber';
}

const PresenceStat: React.FC<PresenceStatProps> = ({ label, value, icon, tone }) => (
  <div className="border-4 border-white bg-black p-4 text-white neo-shadow-white">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</span>
      <span className={cn('shrink-0', tone === 'emerald' ? 'text-emerald-400' : 'text-amber-400')}>
        {icon}
      </span>
    </div>
    <p
      className={cn(
        'mt-2 text-4xl font-black leading-none tracking-tighter sm:text-5xl',
        tone === 'emerald' ? 'text-emerald-300' : 'text-amber-300',
      )}
    >
      {value}
    </p>
  </div>
);

/**
 * "Kimler online" tam sayfası. Son 5 dakikada görülen girişli üyeleri ve
 * yerel günde görülen yaklaşık üye sayısını gösterir. Misafirler izlenmez.
 */
export const OnlinePage = () => {
  const { t } = useAppTranslation();
  const { currentUser } = useAppStore();
  const { members, loading, error } = useOnlineMembers();
  const { count: todayCount, loading: todayLoading, error: todayError } = useActiveTodayCount();
  const windowMinutes = Math.round(PRESENCE_WINDOW_MS / 60_000);
  const onlineLabel = `${members.length}${members.length >= PRESENCE_QUERY_LIMIT ? '+' : ''}`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="border-4 border-white bg-black p-6 text-white neo-shadow-white md:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 border border-black bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            <Users size={12} strokeWidth={2.5} />
            {t('online_nav')}
          </span>
          <span className="border border-white/30 bg-neutral-900 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
            {t('online_page_approx')}
          </span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl">
          {t('online_page_title')}
        </h1>
        <p className="mt-2 max-w-2xl text-xs font-bold uppercase leading-relaxed tracking-wide text-neutral-400">
          {t('online_page_desc')}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <PresenceStat
          label={t('online_now_title')}
          value={loading ? '…' : onlineLabel}
          icon={<Users size={18} strokeWidth={2.5} />}
          tone="emerald"
        />
        <PresenceStat
          label={t('online_page_today_label')}
          value={todayLoading ? '…' : todayError ? '—' : todayCount}
          icon={<Clock size={18} strokeWidth={2.5} />}
          tone="amber"
        />
      </div>

      <section className="border-4 border-white bg-black p-5 text-white">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
            <Users size={16} strokeWidth={2.5} className="text-amber-400" />
            {t('online_page_members_title')}
          </h2>
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
            {t('online_page_refresh')}
          </span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
          {t('online_now_desc', { minutes: windowMinutes })}
        </p>

        <div className="mt-4">
          {error ? (
            <p role="status" className="text-xs font-bold text-neutral-400">
              {t('online_now_unavailable')}
            </p>
          ) : loading ? (
            <p role="status" className="text-xs font-bold text-neutral-400">
              {t('online_now_loading')}
            </p>
          ) : members.length === 0 ? (
            <p role="status" className="text-xs font-bold text-neutral-400">
              {t('online_now_empty')}
            </p>
          ) : (
            <OnlineMemberGrid
              members={members}
              currentUid={currentUser?.uid}
              max={PRESENCE_QUERY_LIMIT}
              variant="comfortable"
            />
          )}
        </div>
      </section>

      <section className="border-4 border-amber-400 bg-black p-5 text-white">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300">
          <ShieldCheck size={14} strokeWidth={2.5} />
          {t('online_page_privacy_title')}
        </p>
        <p className="mt-2 text-xs font-bold leading-relaxed text-neutral-400">
          {t('online_page_privacy')}
        </p>
        <p className="mt-2 text-xs font-bold leading-relaxed text-neutral-400">
          {t('online_page_today_desc')}
        </p>
      </section>

      <Link
        to="/"
        className="inline-flex min-h-[44px] w-fit items-center gap-2 border-2 border-white px-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        {t('home')}
      </Link>
    </div>
  );
};

export default OnlinePage;
