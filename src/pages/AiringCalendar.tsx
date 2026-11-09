import React, { useState, useMemo, useEffect } from 'react';
import { DAYS_OF_WEEK, AIRING_SCHEDULE, AiringAnime } from '../data/airingSchedule';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useReminderStore } from '../store/useReminderStore';
import { 
  Calendar as CalendarIcon, Clock, Star, Tv, Plus, Check, 
  ExternalLink, Sparkles, Filter, Play, CheckCircle2,
  Bell, BellRing, BellOff, CalendarCheck, Download, Volume2, Search, Grid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useNavigate } from 'react-router-dom';
import { Anime, DayOfWeek } from '../types';

import { fetchScheduleWeek } from '../lib/airingService';
import { getAnimeSeason } from '../lib/season';

export const AiringCalendar: React.FC = () => {
  const { t } = useAppTranslation();
  const { watchlist, addToWatchlist, incrementEpisode } = useAppStore();
  const { addToast } = useToastStore();
  const {
    reminders,
    addReminder,
    removeReminder,
    isReminderSet,
    getReminder,
    notificationPermission,
    requestPermission,
    sendTestNotification,
    downloadIcsFile,
    generateGoogleCalendarUrl,
    getTimeUntilAiring,
    openScheduleModal,
    initReminders
  } = useReminderStore();

  const navigate = useNavigate();

  useEffect(() => {
    initReminders();
  }, [initReminders]);

  // Detect current day
  const todayKey = useMemo(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const map: Record<number, DayOfWeek> = {
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

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayKey);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyWatchlist, setOnlyMyWatchlist] = useState(false);
  const [onlyReminders, setOnlyReminders] = useState(false);
  const [liveAnimeMap, setLiveAnimeMap] = useState<Partial<Record<DayOfWeek, AiringAnime[]>>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [sourceLabel, setSourceLabel] = useState<string>(t('cal_live_source'));
  const [scheduleStale, setScheduleStale] = useState(true);

  // Live schedule fetch — haftanın TAMAMI (7 gün) tek seferde, gün bazlı sayfalı AniList.
  useEffect(() => {
    let isMounted = true;
    const loadWeek = async () => {
      setIsSyncing(true);
      try {
        const result = await fetchScheduleWeek();
        if (!isMounted) return;
        setLiveAnimeMap(result.days);
        setSourceLabel(result.source);
        setScheduleStale(result.stale);
      } catch (_err) {
        // Kaynak yok: statik arşiv listesi "örnek veri" rozetiyle gösterilir.
        if (isMounted) setScheduleStale(true);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };
    loadWeek();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to get anime list for any day
  const getAnimeListForDay = (day: DayOfWeek) => {
    const liveItems = liveAnimeMap[day];
    // Canlı veri hiç yoksa (çevrimdışı) arşiv listesi gösterilir; varsa
    // boş gün boş kalır — eski klasikler "bu hafta yayında" gibi görünmesin.
    const hasAnyLive = Object.keys(liveAnimeMap).length > 0;
    const sourceList = (liveItems && liveItems.length > 0)
      ? liveItems
      : (hasAnyLive ? [] : AIRING_SCHEDULE.filter(a => a.day === day));

    return sourceList.filter(anime => {
      if (onlyMyWatchlist && !watchlist.some(w => w.anime.mal_id === anime.mal_id)) {
        return false;
      }
      if (onlyReminders && !isReminderSet(anime.mal_id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = anime.title.toLowerCase().includes(query) || (anime.title_english || '').toLowerCase().includes(query);
        const matchesGenre = anime.genres.some(g => g.toLowerCase().includes(query));
        const matchesStudio = anime.studio.toLowerCase().includes(query);
        return matchesTitle || matchesGenre || matchesStudio;
      }
      return true;
    });
  };

  // Filter anime for selected day in day view
  const dayAnimeList = useMemo(() => {
    return getAnimeListForDay(selectedDay);
  }, [selectedDay, liveAnimeMap, onlyMyWatchlist, onlyReminders, searchQuery, watchlist, reminders, isReminderSet]);

  // Count per day
  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DAYS_OF_WEEK.forEach(d => {
      counts[d.key] = getAnimeListForDay(d.key as DayOfWeek).length;
    });
    return counts;
  }, [liveAnimeMap, onlyMyWatchlist, onlyReminders, searchQuery, watchlist, reminders, isReminderSet]);

  const handleToggleReminder = async (anime: AiringAnime) => {
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
      addToast(t('cal_reminder_set_15', { title: anime.title_english || anime.title }), 'success');
    }
  };

  const handleAddAnime = (animeItem: AiringAnime) => {
    const animeObj: Anime = {
      mal_id: animeItem.mal_id,
      title: animeItem.title,
      title_english: animeItem.title_english,
      images: {
        jpg: { image_url: animeItem.image, large_image_url: animeItem.image },
        webp: { image_url: animeItem.image, large_image_url: animeItem.image }
      },
      synopsis: animeItem.synopsis,
      score: animeItem.score,
      episodes: animeItem.totalEpisodes,
      status: 'Airing',
      genres: animeItem.genres.map((g, i) => ({ mal_id: i, name: g })),
      year: Number(animeItem.seasonYear) || getAnimeSeason().seasonYear
    };

    addToWatchlist(animeObj, 'watching');
    addToast(t('airing_added_toast', { title: animeItem.title_english || animeItem.title }), 'success');
  };

  const handleIncrement = async (mal_id: number) => {
    const res = await incrementEpisode(mal_id);
    if (res.completed) {
      addToast(t('airing_completed_toast', { title: res.title }), 'success');
    } else {
      addToast(t('airing_ep_increment', { ep: res.newEp }), 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-white/20 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 border-2 border-white bg-rose-600 text-white flex items-center justify-center font-black neo-shadow-white">
              <CalendarIcon size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
              {t('cal_title')}
            </h1>
            <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 border border-white uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#fff]">
              <Sparkles size={11} /> {sourceLabel}
            </span>
            {scheduleStale && (
              <span className="bg-neutral-800 text-neutral-300 font-black text-[10px] px-2 py-0.5 border border-white/30 uppercase">
                {t('data_stale_badge')}
              </span>
            )}
          </div>
          <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">
            {t('cal_subtitle')}
          </p>
        </div>

        {/* Action & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('cal_search_placeholder')}
              className="pl-8 pr-3 py-2 bg-black border-2 border-white text-white font-bold text-xs uppercase focus:outline-none focus:border-amber-400 placeholder-neutral-500 w-44 sm:w-56"
            />
            <Search size={14} className="absolute left-2.5 top-3 text-neutral-400" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-black border-2 border-white overflow-hidden neo-shadow-white">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                "px-3 py-2 font-black text-xs uppercase flex items-center gap-1 cursor-pointer transition-colors",
                viewMode === 'day' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
              )}
            >
              <List size={13} />
              <span>{t('cal_daily')}</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "px-3 py-2 font-black text-xs uppercase flex items-center gap-1 border-l-2 border-white cursor-pointer transition-colors",
                viewMode === 'week' ? "bg-amber-400 text-black" : "text-white hover:bg-neutral-900"
              )}
            >
              <Grid size={13} />
              <span>{t('cal_week')}</span>
            </button>
          </div>

          {/* Open Quick Modal Button */}
          <button
            onClick={() => openScheduleModal('reminders')}
            className="flex items-center gap-2 px-3 py-2 border-2 border-amber-400 bg-black text-amber-400 hover:bg-amber-400 hover:text-black font-black text-xs uppercase tracking-wider transition-all neo-shadow-white cursor-pointer"
          >
            <BellRing size={14} strokeWidth={2.5} />
            <span>{t('cal_reminders_btn', { count: reminders.length })}</span>
          </button>

          <button
            onClick={() => {
              setOnlyReminders(!onlyReminders);
              if (!onlyReminders) setOnlyMyWatchlist(false);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border-2 border-white font-black text-xs uppercase tracking-wider transition-all neo-shadow-white cursor-pointer",
              onlyReminders ? "bg-amber-400 text-black" : "bg-black text-white hover:bg-neutral-900"
            )}
          >
            <Bell size={14} strokeWidth={2.5} />
            <span>{onlyReminders ? t('cal_only_reminders') : t('cal_filter')}</span>
          </button>

          <button
            onClick={() => {
              setOnlyMyWatchlist(!onlyMyWatchlist);
              if (!onlyMyWatchlist) setOnlyReminders(false);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border-2 border-white font-black text-xs uppercase tracking-wider transition-all neo-shadow-white cursor-pointer",
              onlyMyWatchlist ? "bg-white text-black" : "bg-black text-white hover:bg-neutral-900"
            )}
          >
            <Filter size={14} strokeWidth={3} />
            <span>{onlyMyWatchlist ? t('cal_my_list') : t('cal_all')}</span>
          </button>
        </div>
      </div>

      {/* Week Day Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map(day => {
          const isToday = day.key === todayKey;
          const isSelected = day.key === selectedDay && viewMode === 'day';

          return (
            <button
              key={day.key}
              onClick={() => {
                setSelectedDay(day.key as DayOfWeek);
                setViewMode('day');
              }}
              className={cn(
                "relative p-3 flex flex-col items-center justify-center border-4 border-black transition-all cursor-pointer font-black",
                isSelected 
                  ? "bg-white text-black neo-shadow-white -translate-y-1" 
                  : "bg-neutral-950 text-white hover:bg-neutral-900 border-white/40",
                isToday && !isSelected && "border-rose-500 text-rose-400"
              )}
            >
              {isToday && (
                <span className="absolute -top-3 px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest border border-white">
                  {t('airing_today')}
                </span>
              )}

              <span className="text-xs uppercase tracking-wider mt-1">{t(`day_${day.key}`)}</span>
              <span className="text-xl font-black mt-0.5">{dayCounts[day.key] || 0}</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase">{t('cal_anime_unit')}</span>
            </button>
          );
        })}
      </div>

      {/* Broadcast Schedule Content - Single Day View */}
      {viewMode === 'day' ? (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-black border-2 border-white/20 p-4 neo-shadow-white">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-amber-400" strokeWidth={2.5} />
              <span className="text-sm font-black text-white uppercase tracking-wider">
                {t('cal_day_episodes', { day: t(`day_${selectedDay}`) })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {notificationPermission === 'granted' ? (
                <button
                  onClick={sendTestNotification}
                  className="text-[11px] font-black bg-neutral-900 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-600 hover:text-white px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={12} />
                  <span>{t('cal_notify_test')}</span>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const perm = await requestPermission();
                    if (perm === 'granted') {
                      addToast(t('cal_perm_granted_toast'), 'success');
                      sendTestNotification();
                    }
                  }}
                  className="text-[11px] font-black bg-amber-400 text-black px-2.5 py-1 border border-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell size={12} strokeWidth={3} />
                  <span>{t('cal_allow_notify')}</span>
                </button>
              )}

              <span className="text-xs font-black bg-rose-600 text-white px-3 py-1 uppercase tracking-widest border border-white">
                {t('cal_series_count', { count: dayAnimeList.length })}
              </span>
            </div>
          </div>

          {dayAnimeList.length === 0 ? (
            <div className="p-16 text-center bg-black border-4 border-white/20 neo-shadow-white">
              <Tv size={48} className="mx-auto text-neutral-600 mb-4" strokeWidth={2} />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {onlyReminders
                  ? t('cal_empty_reminders_title')
                  : onlyMyWatchlist 
                    ? t('cal_empty_list_title') 
                    : t('cal_empty_title')}
              </h3>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-2 max-w-md mx-auto">
                {onlyReminders || onlyMyWatchlist
                  ? t('cal_empty_filter_desc') 
                  : t('cal_empty_desc')}
              </p>
              {(onlyReminders || onlyMyWatchlist) && (
                <button 
                  onClick={() => {
                    setOnlyMyWatchlist(false);
                    setOnlyReminders(false);
                  }}
                  className="mt-4 px-6 py-2.5 bg-white text-black font-black uppercase text-xs border-2 border-white neo-shadow-white hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                >
                  {t('airing_show_all')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence mode="popLayout">
                {dayAnimeList.map(anime => {
                  const watchItem = watchlist.find(w => w.anime.mal_id === anime.mal_id);
                  const isWatching = watchItem?.status === 'watching';
                  const isCompleted = watchItem?.status === 'completed';
                  const isSet = isReminderSet(anime.mal_id);
                  const rem = getReminder(anime.mal_id);
                  const timeInfo = getTimeUntilAiring(anime.day, anime.timeTR);

                  return (
                    <motion.div
                      key={anime.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "bg-black border-4 neo-shadow-white p-4 flex flex-col justify-between transition-colors group",
                        isSet ? "border-amber-400" : "border-white hover:border-amber-400"
                      )}
                    >
                      <div className="flex gap-4">
                        {/* Anime Poster */}
                        <div 
                          onClick={() => navigate(`/anime/${anime.mal_id}`)}
                          className="w-24 h-34 shrink-0 border-2 border-white bg-neutral-900 cursor-pointer overflow-hidden relative"
                        >
                          <img 
                            src={getSafeImageUrl(anime.image)} 
                            alt={anime.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1 left-1 bg-black/90 text-amber-400 text-[10px] font-black px-1.5 py-0.5 border border-white flex items-center gap-0.5">
                            <Star size={10} fill="currentColor" /> {anime.score}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {typeof anime.currentEpisode === 'number' && (
                              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 border border-white uppercase tracking-wider">
                                {t('airing_episode', { episode: anime.currentEpisode })}
                              </span>
                            )}
                            <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                              <Clock size={12} /> {anime.timeTR} ({t('airing_timezone_suffix')})
                            </span>
                            {timeInfo.isToday && (
                              <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 border border-black uppercase animate-pulse">
                                {timeInfo.text}
                              </span>
                            )}
                          </div>

                          <h3 
                            onClick={() => navigate(`/anime/${anime.mal_id}`)}
                            lang="en"
                            className="font-black text-base uppercase text-white tracking-tight line-clamp-1 cursor-pointer hover:text-rose-500 transition-colors"
                            title={anime.title_english || anime.title}
                          >
                            {anime.title_english || anime.title}
                          </h3>

                          <p lang="en" className="text-[11px] text-neutral-400 font-bold uppercase tracking-wide mt-1">
                            {t('studio')}: <span className="text-white">{anime.studio}</span>
                          </p>

                          <p className="text-xs text-neutral-300 font-medium line-clamp-2 mt-2 leading-relaxed">
                            {anime.synopsis}
                          </p>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {anime.streamingOn.map(platform => (
                              <span 
                                key={platform} 
                                className="text-[9px] font-black uppercase bg-neutral-900 text-neutral-300 px-1.5 py-0.5 border border-white/20"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="mt-4 pt-3 border-t-2 border-white/20 flex flex-wrap items-center justify-between gap-2">
                        {/* Reminder Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleReminder(anime)}
                            className={cn(
                              "px-3 py-1.5 font-black text-xs uppercase tracking-wider border-2 transition-all flex items-center gap-1.5 cursor-pointer",
                              isSet
                                ? "bg-amber-400 text-black border-black hover:bg-red-500 hover:text-white"
                                : "bg-white text-black hover:bg-amber-400 border-black"
                            )}
                          >
                            {isSet ? (
                              <>
                                <BellRing size={13} className="animate-bounce" />
                                <span>{t('airing_reminder_on', { when: rem?.notifyBeforeMinutes === 0 ? t('airing_at_air') : t('airing_min_before', { count: rem?.notifyBeforeMinutes ?? 0 }) })}</span>
                              </>
                            ) : (
                              <>
                                <Bell size={13} strokeWidth={2.5} />
                                <span>{t('airing_set_reminder')}</span>
                              </>
                            )}
                          </button>

                          <a
                            href={generateGoogleCalendarUrl(anime)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-white/30 transition-colors"
                            title={t('airing_add_gcal')}
                          >
                            <CalendarCheck size={16} className="text-amber-400" />
                          </a>

                          <button
                            onClick={() => downloadIcsFile(anime)}
                            className="p-1.5 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-white/30 transition-colors cursor-pointer"
                            title={t('airing_download_ics_title')}
                          >
                            <Download size={16} />
                          </button>
                        </div>

                        {/* Watchlist & Details */}
                        <div className="flex items-center gap-2">
                          {watchItem ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black uppercase text-neutral-300">
                                {t('cal_watched')} <span className="text-amber-400">{watchItem.episodesWatched || 0}</span> / {anime.totalEpisodes || '?'}
                              </span>
                              {isCompleted ? (
                                <span className="text-[10px] font-black uppercase bg-emerald-500 text-black px-2 py-0.5 border border-black flex items-center gap-1">
                                  <CheckCircle2 size={12} strokeWidth={3} /> {t('cal_completed')}
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleIncrement(anime.mal_id)}
                                  className="px-2.5 py-1 bg-amber-400 text-black hover:bg-white text-[11px] font-black uppercase border border-white transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus size={12} strokeWidth={3} /> +1
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddAnime(anime)}
                              className="px-2.5 py-1.5 bg-neutral-900 text-white hover:bg-white hover:text-black font-black text-xs uppercase tracking-wider border border-white/30 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} strokeWidth={3} />
                              <span>{t('airing_add_to_list')}</span>
                            </button>
                          )}

                          <button
                            onClick={() => navigate(`/anime/${anime.mal_id}`)}
                            className="text-xs font-black uppercase text-neutral-400 hover:text-white flex items-center gap-1 transition-colors ml-1 cursor-pointer"
                          >
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      ) : (
        /* Full Week Grid View (anizm.net/takvim style) */
        <div className="space-y-8">
          {DAYS_OF_WEEK.map(dayObj => {
            const listForDay = getAnimeListForDay(dayObj.key as DayOfWeek);
            const isToday = dayObj.key === todayKey;

            return (
              <div 
                key={dayObj.key}
                className={cn(
                  "bg-black border-4 p-5 neo-shadow-white space-y-4",
                  isToday ? "border-amber-400" : "border-white/30"
                )}
              >
                {/* Day Section Title */}
                <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 font-black text-sm uppercase tracking-wider border border-black",
                      isToday ? "bg-amber-400 text-black" : "bg-white text-black"
                    )}>
                      {t(`day_${dayObj.key}`)}
                    </span>
                    {isToday && (
                      <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 border border-white uppercase animate-pulse">
                        {t('cal_today_broadcasts')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-black text-neutral-400 uppercase">
                    {t('cal_broadcast_count', { count: listForDay.length })}
                  </span>
                </div>

                {/* Day Anime Cards Grid */}
                {listForDay.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-bold uppercase py-4">{t('cal_no_broadcast_day')}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {listForDay.map(anime => {
                      const isSet = isReminderSet(anime.mal_id);
                      return (
                        <div
                          key={anime.id}
                          onClick={() => navigate(`/anime/${anime.mal_id}`)}
                          className={cn(
                            "bg-neutral-900 border-2 p-3 flex gap-3 transition-all cursor-pointer group hover:bg-neutral-800",
                            isSet ? "border-amber-400" : "border-white/20 hover:border-white"
                          )}
                        >
                          <img
                            src={getSafeImageUrl(anime.image)}
                            alt={anime.title}
                            className="w-16 h-22 object-cover border border-white shrink-0 group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-400 mb-0.5">
                                <span>{anime.timeTR} {t('airing_timezone_suffix')}</span>
                                {typeof anime.currentEpisode === 'number' && (
                                  <span>{t('airing_episode', { episode: anime.currentEpisode })}</span>
                                )}
                              </div>
                              <h4 lang="en" className="font-black text-xs text-white uppercase line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                                {anime.title_english || anime.title}
                              </h4>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span lang="en" className="text-[9px] font-bold text-neutral-400 uppercase truncate">
                                {anime.studio}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleReminder(anime);
                                }}
                                className={cn(
                                  "p-1 border text-[9px] font-black uppercase flex items-center gap-0.5 cursor-pointer",
                                  isSet ? "bg-amber-400 text-black border-black" : "bg-black text-white border-white/40 hover:border-amber-400"
                                )}
                              >
                                {isSet ? <BellRing size={11} className="animate-bounce" /> : <Bell size={11} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
