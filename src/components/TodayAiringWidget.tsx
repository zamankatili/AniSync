import React, { useMemo } from 'react';
import { AIRING_SCHEDULE, AiringAnime, DAYS_OF_WEEK } from '../data/airingSchedule';
import { Calendar, Clock, ChevronRight, Bell, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSafeImageUrl, cn } from '../lib/utils';
import { useReminderStore } from '../store/useReminderStore';
import { useToastStore } from '../store/useToastStore';

export const TodayAiringWidget: React.FC = () => {
  const navigate = useNavigate();
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

  const todayAnime = useMemo(() => {
    return AIRING_SCHEDULE.filter(a => a.day === todayKey).slice(0, 3);
  }, [todayKey]);

  const todayLabel = DAYS_OF_WEEK.find(d => d.key === todayKey)?.labelTR || 'Bugün';

  const handleToggleReminder = async (e: React.MouseEvent, anime: AiringAnime) => {
    e.stopPropagation();
    if (isReminderSet(anime.mal_id)) {
      await removeReminder(anime.mal_id);
      addToast(`"${anime.title_english || anime.title}" hatırlatıcısı kaldırıldı.`, 'info');
    } else {
      if (notificationPermission === 'default') {
        const perm = await requestPermission();
        if (perm === 'granted') {
          addToast('Masaüstü bildirimleri aktif edildi!', 'success');
        }
      }
      await addReminder(anime, { notifyBeforeMinutes: 15, soundEnabled: true, browserNotify: true });
      addToast(`🔔 "${anime.title_english || anime.title}" için hatırlatıcı kuruldu!`, 'success');
    }
  };

  return (
    <div className="bg-black p-5 border-2 border-white/20 neo-shadow-white">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-amber-400" strokeWidth={2.5} />
          <h3 className="font-black tracking-widest uppercase text-white text-sm">
            {todayLabel} Yayınları
          </h3>
          <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
            2026 SEZONU
          </span>
        </div>
        <button
          onClick={() => openScheduleModal('schedule')}
          className="text-[10px] font-black uppercase bg-rose-600 hover:bg-white hover:text-black text-white px-2 py-0.5 border border-white transition-colors cursor-pointer"
        >
          PROGRAMI AÇ
        </button>
      </div>

      <div className="space-y-3">
        {todayAnime.map(anime => {
          const isSet = isReminderSet(anime.mal_id);

          return (
            <div 
              key={anime.id}
              onClick={() => navigate(`/anime/${anime.mal_id}`)}
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
                  <Clock size={10} /> {anime.timeTR} TR • Bölüm {anime.currentEpisode}
                </span>
                <h4 className="text-xs font-black uppercase text-white truncate group-hover:text-amber-400 transition-colors mt-0.5">
                  {anime.title_english || anime.title}
                </h4>
                <p className="text-[10px] text-neutral-400 font-bold uppercase truncate mt-0.5">
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
                title={isSet ? "Hatırlatıcı kurulu (Kaldırmak için tıkla)" : "Yayın hatırlatıcısı kur"}
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
          <span>Hatırlatıcılar</span>
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className="py-2 px-2 bg-white text-black hover:bg-neutral-200 font-black text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Tüm Takvim</span>
          <ChevronRight size={13} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
