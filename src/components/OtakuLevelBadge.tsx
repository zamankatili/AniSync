import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Flame } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { useQuizStore } from '../store/useQuizStore';
import { useToastStore } from '../store/useToastStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { computeOtakuLevel } from '../lib/otakuLevel';
import { localizeLevelTitle } from '../lib/badgeLocalization';
import { useXpStore, selectActiveSnapshot } from '../store/useXpStore';
import { dayXp, DAILY_GOAL_XP } from '../lib/xp';
import { getDailyDateKey } from '../lib/dailyDate';

/**
 * Ana sayfa "OTAKU RÜTBESİ" kartı — izleme karması + etkinlik XP'sinin
 * toplamıyla seviye eğrisini gösterir; alt bölümde günlük hedef ve seri bulunur.
 * Seviye atlama anında tek seferlik toast atar (localStorage `anisync_level_seen`).
 */
export const OtakuLevelBadge: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const { watchlist } = useAppStore();
  const { arcadeHighScore, dailyStreak } = useQuizStore();
  const { addToast } = useToastStore();
  const activeSnapshot = useXpStore(selectActiveSnapshot);

  const engagementXp = activeSnapshot.totalXp;
  const todayKey = getDailyDateKey();
  const todayTotal = useMemo(() => dayXp(activeSnapshot, todayKey), [activeSnapshot, todayKey]);
  const goalPercent = Math.min(100, Math.floor((todayTotal / DAILY_GOAL_XP) * 100));
  const goalDone = todayTotal >= DAILY_GOAL_XP;

  const { totalXp, levelInfo } = useMemo(
    () => computeOtakuLevel(watchlist, arcadeHighScore > 0 || dailyStreak > 0, arcadeHighScore, engagementXp),
    [watchlist, arcadeHighScore, dailyStreak, engagementXp]
  );
  const { currentLevel, nextLevel, progressPercent } = levelInfo;
  const rankName = localizeLevelTitle(currentLevel.level, currentLevel.title);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('anisync_level_seen');
      // İlk kez gördüysek sessizce kaydet; kullanıcıyı habersiz kutlamayalım.
      if (seen === null) {
        localStorage.setItem('anisync_level_seen', String(currentLevel.level));
        return;
      }
      const seenNumber = Number(seen || '1');
      if (currentLevel.level > seenNumber) {
        addToast(t('level_up_toast', { rank: rankName, level: currentLevel.level }), 'success');
        localStorage.setItem('anisync_level_seen', String(currentLevel.level));
      }
    } catch {
      /* yoksay */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel.level]);

  return (
    <button
      onClick={() => navigate('/profile')}
      className="w-full text-left bg-black p-4 md:p-5 border-4 border-amber-400 neo-shadow-white relative overflow-hidden group cursor-pointer hover:bg-neutral-950 transition-colors"
      aria-label={t('otaku_rank_title')}
    >
      <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Star size={15} className="text-amber-400" fill="currentColor" strokeWidth={2.5} />
          <h2 className="font-black text-white text-xs tracking-widest uppercase">{t('otaku_rank_title')}</h2>
        </div>
        <ChevronRight size={18} className="text-amber-400 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
      </div>

      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 shrink-0 border-4 border-white flex items-center justify-center text-4xl neo-shadow"
          style={{ backgroundColor: currentLevel.color }}
        >
          <span role="img" aria-hidden="true">{currentLevel.badge}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-black px-1.5 py-0.5 border border-white">
              LV {currentLevel.level}
            </span>
            <span lang="tr" className="text-xs font-black uppercase text-white tracking-wider truncate">
              {rankName}
            </span>
          </div>
          <p className="text-2xl font-black text-amber-400 leading-none mt-1">
            {totalXp.toLocaleString()} <span className="text-xs text-neutral-400 font-bold uppercase">XP</span>
          </p>
          {nextLevel ? (
            <p className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">
              {t('otaku_rank_next', { level: nextLevel.level, xp: levelInfo.karmaNeededForNext })}
            </p>
          ) : (
            <p className="text-[10px] font-bold text-amber-400 uppercase mt-0.5">{t('otaku_rank_max')}</p>
          )}
        </div>
      </div>

      <div className="mt-3 h-2 w-full bg-neutral-800 border border-white/30 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Günlük hedef + seri */}
      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3 border-t border-white/10 pt-2.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
              {t('xp_daily_goal')}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest ${goalDone ? 'text-emerald-400' : 'text-neutral-400'}`}>
              {goalDone
                ? t('xp_goal_done')
                : t('xp_daily_goal_progress', { today: todayTotal, goal: DAILY_GOAL_XP })}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-neutral-800 border border-white/20 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${goalDone ? 'bg-emerald-400' : 'bg-cyan-400'}`}
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>
        {activeSnapshot.streak > 0 && (
          <span className="inline-flex items-center gap-1 border border-orange-500/60 bg-orange-950 px-2 py-1 text-[10px] font-black uppercase text-orange-400">
            <Flame size={12} strokeWidth={2.5} />
            {activeSnapshot.streak}
          </span>
        )}
      </div>
    </button>
  );
};
