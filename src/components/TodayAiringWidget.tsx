import React, { useMemo, useState, useEffect } from 'react';
import { AIRING_SCHEDULE, AiringAnime, DAYS_OF_WEEK } from '../data/airingSchedule';
import { fetchLiveScheduleForDay } from '../lib/airingService';
import { Calendar, Clock, ChevronRight, Bell, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSafeImageUrl, cn } from '../lib/utils';
import { animeDetailPath } from '../lib/mediaLinks';
import { useReminderStore } from '../store/useReminderStore';
import { useToastStore } from '../store/useToastStore';
import { useAppTranslation } from '../hooks/useAppTranslation';

export const TodayAiringWidget: React.FC = () => {
  const navigate = useNavigate();
  const goToAnime = (anime: { mal_id?: number | null; anilist_id?: number | null }) => {
    const path = animeDetailPath(anime);
    if (path) navigate(path);
  };
  const { t } = useAppTranslation();
  const { isReminderSet, addReminder, removeReminder, openScheduleModal, notificationPermission, requestPermission } = useReminderStore();
  const { addToast } = useToastStore();

  const todayKey = useMemo(() => {
    const dayIndex = new Date().getDay();
    const map: Record<number, AiringAnime['day']> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    return map[dayIndex] || 'monday';
  }, []);

  const [liveTodayAnime, setLiveTodayAnime] = useState<AiringAnime[]>([]);
  const [scheduleStale, setScheduleStale] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchLiveScheduleForDay(todayKey).then(res => {
      if (isMounted) {
        setScheduleStale(res.stale);
        if (res.list && res.list.length > 0) {
          setLiveTodayAnime(res.list.slice(0, 3));
        }
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [todayKey]);

  const todayAnime = useMemo(() => {
    if (liveTodayAnime.length > 0) return liveTodayAnime;
    return AIRING_SCHEDULE.filter(a => a.day === todayKey).slice(0, 3);
  }, [liveTodayAnime, todayKey]);

  const todayLabel = t(`day_${todayKey}`);

  const handleToggleReminder = async (e: React.MouseEvent, anime: AiringAnime) => {
    e.stopPropagation();
    if (isReminderSet(anime.mal_id)) {
      await removeReminder(anime.mal_id);
      addToast(t('airing_removed_toast', { title: anime.title_english || anime.title }), 'info');
    } else {
      if (notificationPermission === 'default') {
        const perm = await requestPermission();
        if (perm === 'granted') {
          addToast(t('airing_notifications_active'), 'success');
        }
      }
      await addReminder(anime, { notifyBeforeMinutes: 15, soundEnabled: true, browserNotify: true });
      addToast(t('today_reminder_set', { title: anime.title_english || anime.title }), 'success');
    }
  };

  return (
    <div className="bg-black p-5 border-2 border-white/20 neo-shadow-white">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-amber-400" strokeWidth={2.5} />
          <h3 className="font-black tracking-widest uppercase text-white text-sm">
            {t('today_airing_title', { day: todayLabel })}
          </h3>
          <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
            {t('season_2026_badge')}
          </span>
          {scheduleStale && (
            <span className="bg-neutral-800 text-neutral-300 text-[9px] font-black px-1.5 py-0.2 border border-white/30 uppercase">
              {t('data_stale_badge')}
            </span>
          )}
        </div>
        <button
          onClick={() => openScheduleModal('schedule')}
          className="text-[10px] font-black uppercase bg-rose-600 hover:bg-white hover:text-black text-white px-2 py-0.5 border border-white transition-colors cursor-pointer"
        >
          {t('open_schedule')}
        </button>
      </div>

      <div className="space-y-3">
        {todayAnime.map(anime => {
          const isSet = isReminderSet(anime.mal_id);

          return (
            <div 
              key={anime.id}
              onClick={() => goToAnime(anime)}
              className={cn(
                "flex items-center gap-3 p-2 bg-neutral-900 border transition-colors cursor-pointer group",
                isSet ? "border-amber-400 bg-neutral-950" : "border-white/20 hover:border-amber-400"
              )}
            >
              <img 
                src={getSafeImageUrl(anime.image)} 
                alt={anime.title} 
                className="w-12 h-16 object-cover border border-white/30 shrink-0 group-hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                  <Clock size={10} /> {anime.timeTR} {t('airing_timezone_suffix')}
                  {typeof anime.currentEpisode === 'number' && (
                    <> • {t('airing_ep_watched', { count: anime.currentEpisode })}</>
                  )}
                </span>
                <h4 lang="en" className="text-xs font-black uppercase text-white truncate group-hover:text-amber-400 transition-colors mt-0.5">
                  {anime.title_english || anime.title}
                </h4>
                <p lang="en" className="text-[10px] text-neutral-400 font-bold uppercase truncate mt-0.5">
                  {anime.studio}
                </p>
              </div>

              {/* Quick Reminder Bell Button */}
              <button
                onClick={(e) => handleToggleReminder(e, anime)}
                className={cn(
                  "p-2 border transition-all shrink-0 cursor-pointer",
                  isSet
                    ? "bg-amber-400 text-black border-black hover:bg-rose-600 hover:text-white"
                    : "bg-black text-white border-white/20 hover:border-amber-400 hover:text-amber-400"
                )}
                title={isSet ? t('reminder_set_title') : t('reminder_set_hint')}
              >
                {isSet ? <BellRing size={14} className="animate-bounce" /> : <Bell size={14} />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => openScheduleModal('reminders')}
          className="py-2 px-2 bg-black text-amber-400 hover:bg-amber-400 hover:text-black font-black text-xs uppercase tracking-wider border-2 border-amber-400 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Bell size={12} strokeWidth={2.5} />
          <span>{t('reminders_short')}</span>
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className="py-2 px-2 bg-white text-black hover:bg-neutral-200 font-black text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>{t('full_calendar')}</span>
          <ChevronRight size={13} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
