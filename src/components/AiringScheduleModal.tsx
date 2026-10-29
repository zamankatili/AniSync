import React, { useState, useMemo, useEffect } from 'react';
import { DAYS_OF_WEEK, AIRING_SCHEDULE, AiringAnime } from '../data/airingSchedule';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useReminderStore } from '../store/useReminderStore';
import {
  Calendar as CalendarIcon, Clock, Star, Tv, Plus, Check,
  ExternalLink, Bell, BellRing, BellOff, Volume2, VolumeX,
  Share2, Download, CalendarCheck, CheckCircle2, X, ChevronRight,
  Filter, Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Anime, DayOfWeek } from '../types';

interface AiringScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'schedule' | 'reminders' | 'season';
}

export const AiringScheduleModal: React.FC<AiringScheduleModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'schedule'
}) => {
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, incrementEpisode } = useAppStore();
  const { addToast } = useToastStore();
  const {
    reminders,
    addReminder,
    removeReminder,
    isReminderSet,
    getReminder,
    updateReminder,
    notificationPermission,
    requestPermission,
    sendTestNotification,
    downloadIcsFile,
    generateGoogleCalendarUrl,
    getTimeUntilAiring,
    initReminders
  } = useReminderStore();

  const [activeTab, setActiveTab] = useState<'schedule' | 'reminders' | 'season'>(initialTab);
  const [selectedReminderAnime, setSelectedReminderAnime] = useState<AiringAnime | null>(null);
  const [notifyOffset, setNotifyOffset] = useState<number>(15);
  const [onlyWatchlist, setOnlyWatchlist] = useState<boolean>(false);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      initReminders();
    }
  }, [isOpen, initReminders]);

  // Detect current day
  const todayKey = useMemo(() => {
    const dayIndex = new Date().getDay();
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

  // Filter anime for selected day
  const dayAnimeList = useMemo(() => {
    return AIRING_SCHEDULE.filter((anime) => {
      if (anime.day !== selectedDay) return false;
      if (onlyWatchlist) {
        return watchlist.some((w) => w.anime.mal_id === anime.mal_id);
      }
      return true;
    });
  }, [selectedDay, onlyWatchlist, watchlist]);

  // Counts
  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DAYS_OF_WEEK.forEach((d) => {
      counts[d.key] = AIRING_SCHEDULE.filter((a) => a.day === d.key).length;
    });
    return counts;
  }, []);

  const handleToggleReminder = async (anime: AiringAnime) => {
    if (isReminderSet(anime.mal_id)) {
      await removeReminder(anime.mal_id);
      addToast(`"${anime.title_english || anime.title}" hatırlatıcısı kaldırıldı.`, 'info');
    } else {
      // Check notification permission
      if (notificationPermission === 'default') {
        const perm = await requestPermission();
        if (perm === 'granted') {
          addToast('Masaüstü bildirimleri aktif edildi!', 'success');
        }
      }
      await addReminder(anime, { notifyBeforeMinutes: notifyOffset, soundEnabled: true, browserNotify: true });
      addToast(`🔔 "${anime.title_english || anime.title}" için yayın hatırlatıcısı kuruldu! (${notifyOffset === 0 ? 'Yayın anında' : `${notifyOffset} dk önce`})`, 'success');
    }
  };

  const handleAddAnime = (animeItem: AiringAnime) => {
    const animeObj: Anime = {
      mal_id: animeItem.mal_id,
      title: animeItem.title,
      title_english: animeItem.title_english,
      images: {
        jpg: { image_url: animeItem.image, large_image_url: animeItem.image },
        webp: { image_url: animeItem.image, large_image_url: animeItem.image },
      },
      synopsis: animeItem.synopsis,
      score: animeItem.score,
      episodes: animeItem.totalEpisodes,
      status: 'Airing',
      genres: animeItem.genres.map((g, i) => ({ mal_id: i, name: g })),
      year: 2026,
    };

    addToWatchlist(animeObj, 'watching');
    addToast(`${animeItem.title_english || animeItem.title} izleme listene eklendi!`, 'success');
  };

  const handleIncrement = async (mal_id: number) => {
    const res = await incrementEpisode(mal_id);
    if (res.completed) {
      addToast(`🎉 Tebrikler! "${res.title}" tamamlandı!`, 'success');
    } else {
      addToast(`+1 Bölüm (${res.newEp}) izlendi!`, 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-black border-4 border-white neo-shadow-white w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b-4 border-white/20 bg-neutral-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-white bg-rose-600 text-white flex items-center justify-center font-black neo-shadow-white shrink-0">
              <CalendarIcon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
                  HAFTALIK YAYIN AKIŞI & HATIRLATICI
                </h2>
                <span className="hidden sm:inline-block bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 border border-black uppercase tracking-widest">
                  SONBAHAR 2026 / GÜNCEL
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                Bölüm çıkış saatleri, yayın kanalları ve takvim bildirimleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onClose}
              className="p-2.5 bg-white text-black hover:bg-rose-600 hover:text-white border-2 border-black transition-colors font-black uppercase text-xs flex items-center gap-1 neo-shadow-white cursor-pointer"
            >
              <X size={18} strokeWidth={3} />
              <span className="hidden sm:inline">KAPAT</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons & Permission Status */}
        <div className="bg-black border-b-2 border-white/20 px-4 md:px-6 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={cn(
                "px-4 py-2 border-2 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                activeTab === 'schedule'
                  ? "bg-white text-black border-white neo-shadow-white -translate-y-0.5"
                  : "bg-neutral-900 text-white border-white/20 hover:border-white/50"
              )}
            >
              <CalendarIcon size={14} strokeWidth={2.5} />
              <span>YAYIN PROGRAMI</span>
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={cn(
                "px-4 py-2 border-2 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer relative",
                activeTab === 'reminders'
                  ? "bg-amber-400 text-black border-amber-400 neo-shadow-white -translate-y-0.5"
                  : "bg-neutral-900 text-white border-white/20 hover:border-white/50"
              )}
            >
              <Bell size={14} strokeWidth={2.5} />
              <span>HATIRLATICILARIM</span>
              <span className={cn(
                "px-1.5 py-0.2 text-[10px] font-black border",
                activeTab === 'reminders' ? "bg-black text-amber-400 border-black" : "bg-amber-400 text-black border-black"
              )}>
                {reminders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('season')}
              className={cn(
                "px-4 py-2 border-2 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                activeTab === 'season'
                  ? "bg-rose-600 text-white border-rose-600 neo-shadow-white -translate-y-0.5"
                  : "bg-neutral-900 text-white border-white/20 hover:border-white/50"
              )}
            >
              <Sparkles size={14} strokeWidth={2.5} />
              <span>SEZON ÖZETİ</span>
            </button>
          </div>

          {/* Quick Notification Permission Status */}
          <div className="pb-2 flex items-center gap-2">
            {notificationPermission === 'granted' ? (
              <button
                onClick={sendTestNotification}
                className="text-[11px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500 hover:bg-emerald-800 hover:text-white px-2.5 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sistem ve ses bildirimini dene"
              >
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Bildirim Testi Gönder</span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  const perm = await requestPermission();
                  if (perm === 'granted') {
                    addToast('Masaüstü bildirimleri açıldı!', 'success');
                    sendTestNotification();
                  } else {
                    addToast('Bildirim izni verilmedi veya engellendi.', 'info');
                  }
                }}
                className="text-[11px] font-black bg-amber-400 text-black hover:bg-white border border-black px-2.5 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bell size={13} strokeWidth={3} />
                <span>Bildirimlere İzin Ver</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* TAB 1: WEEKLY SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Day Selection Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isToday = day.key === todayKey;
                  const isSelected = day.key === selectedDay;

                  return (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDay(day.key as DayOfWeek)}
                      className={cn(
                        "relative p-2.5 flex flex-col items-center justify-center border-2 transition-all cursor-pointer font-black",
                        isSelected
                          ? "bg-white text-black border-white neo-shadow-white -translate-y-1"
                          : "bg-neutral-950 text-neutral-300 hover:bg-neutral-900 border-white/20",
                        isToday && !isSelected && "border-rose-500 text-rose-400"
                      )}
                    >
                      {isToday && (
                        <span className="absolute -top-2.5 px-1.5 py-0.2 bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest border border-white">
                          BUGÜN
                        </span>
                      )}
                      <span className="text-[11px] uppercase tracking-wider">{day.shortTR}</span>
                      <span className="text-lg font-black mt-0.5">{dayCounts[day.key] || 0}</span>
                      <span className="text-[9px] text-neutral-400 uppercase">Seri</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-bar: Filter and Day Title */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950 border-2 border-white/20 p-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.labelTR} Günü Yayınlanan Anime Serileri
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => setOnlyWatchlist(!onlyWatchlist)}
                    className={cn(
                      "px-3 py-1.5 border font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer",
                      onlyWatchlist
                        ? "bg-amber-400 text-black border-black"
                        : "bg-black text-neutral-300 border-white/30 hover:border-white"
                    )}
                  >
                    <Filter size={12} strokeWidth={2.5} />
                    <span>{onlyWatchlist ? 'Sadece Listemdekiler (Açık)' : 'Tüm Yayınlar'}</span>
                  </button>

                  <span className="text-xs font-black bg-rose-600 text-white px-2 py-1 uppercase tracking-widest border border-white">
                    {dayAnimeList.length} ANİME
                  </span>
                </div>
              </div>

              {/* Anime Cards Grid */}
              {dayAnimeList.length === 0 ? (
                <div className="p-12 text-center bg-neutral-950 border-2 border-white/20">
                  <Tv size={40} className="mx-auto text-neutral-600 mb-3" />
                  <h4 className="text-base font-black text-white uppercase">
                    {onlyWatchlist ? 'Bu Gün İçin Listende Takip Ettiğin Anime Yok' : 'Bu Gün İçin Kayıtlı Seri Bulunamadı'}
                  </h4>
                  <p className="text-xs text-neutral-400 font-bold uppercase mt-1">
                    {onlyWatchlist ? "Filtreyi 'Tüm Yayınlar' yaparak popüler animeleri inceleyebilirsin." : 'Başka bir gün seçerek programı görüntüleyebilirsin.'}
                  </p>
                  {onlyWatchlist && (
                    <button
                      onClick={() => setOnlyWatchlist(false)}
                      className="mt-3 px-4 py-2 bg-white text-black font-black uppercase text-xs border border-black hover:bg-amber-400"
                    >
                      Tüm Yayınları Göster
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayAnimeList.map((anime) => {
                    const isSet = isReminderSet(anime.mal_id);
                    const rem = getReminder(anime.mal_id);
                    const watchItem = watchlist.find((w) => w.anime.mal_id === anime.mal_id);
                    const timeInfo = getTimeUntilAiring(anime.day, anime.timeTR);

                    return (
                      <div
                        key={anime.id}
                        className={cn(
                          "bg-black border-2 transition-all p-3.5 flex flex-col justify-between",
                          isSet ? "border-amber-400 neo-shadow-white" : "border-white/30 hover:border-white"
                        )}
                      >
                        <div className="flex gap-3">
                          {/* Image */}
                          <div
                            onClick={() => {
                              onClose();
                              navigate(`/anime/${anime.mal_id}`);
                            }}
                            className="w-20 h-28 shrink-0 border border-white/40 bg-neutral-900 cursor-pointer overflow-hidden relative group"
                          >
                            <img
                              src={getSafeImageUrl(anime.image)}
                              alt={anime.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-1 left-1 bg-black/90 text-amber-400 text-[9px] font-black px-1 py-0.2 border border-white flex items-center gap-0.5">
                              <Star size={9} fill="currentColor" /> {anime.score}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 border border-white uppercase tracking-wider">
                                BÖLÜM {anime.currentEpisode}
                              </span>
                              <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                                <Clock size={11} /> {anime.timeTR} TR
                              </span>
                              {timeInfo.isToday && (
                                <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 border border-black uppercase animate-pulse">
                                  {timeInfo.text}
                                </span>
                              )}
                            </div>

                            <h3
                              onClick={() => {
                                onClose();
                                navigate(`/anime/${anime.mal_id}`);
                              }}
                              className="font-black text-sm uppercase text-white truncate cursor-pointer hover:text-amber-400 transition-colors"
                              title={anime.title_english || anime.title}
                            >
                              {anime.title_english || anime.title}
                            </h3>

                            <p className="text-[10px] text-neutral-400 font-bold uppercase truncate mt-0.5">
                              Stüdyo: <span className="text-white">{anime.studio}</span>
                            </p>

                            <p className="text-[11px] text-neutral-300 font-medium line-clamp-2 mt-1 leading-relaxed">
                              {anime.synopsis}
                            </p>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {anime.streamingOn.map((platform) => (
                                <span
                                  key={platform}
                                  className="text-[8px] font-black uppercase bg-neutral-900 text-neutral-300 px-1.5 py-0.2 border border-white/20"
                                >
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-3 pt-2.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
                          {/* Reminder Toggle Button */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleReminder(anime)}
                              className={cn(
                                "px-2.5 py-1.5 font-black text-[11px] uppercase tracking-wider border transition-colors flex items-center gap-1.5 cursor-pointer",
                                isSet
                                  ? "bg-amber-400 text-black border-black hover:bg-red-500 hover:text-white hover:border-red-600"
                                  : "bg-white text-black hover:bg-amber-400 border-black"
                              )}
                            >
                              {isSet ? (
                                <>
                                  <BellRing size={13} className="animate-bounce" />
                                  <span>Hatırlatıcı Açık ({rem?.notifyBeforeMinutes === 0 ? 'Yayın anı' : `${rem?.notifyBeforeMinutes} dk`})</span>
                                </>
                              ) : (
                                <>
                                  <Bell size={13} />
                                  <span>Hatırlatıcı Kur</span>
                                </>
                              )}
                            </button>

                            {/* Google Calendar Link */}
                            <a
                              href={generateGoogleCalendarUrl(anime)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-white/20 transition-colors"
                              title="Google Takvim'e Ekle"
                            >
                              <CalendarCheck size={14} />
                            </a>

                            {/* Download ICS */}
                            <button
                              onClick={() => downloadIcsFile(anime)}
                              className="p-1.5 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-white/20 transition-colors cursor-pointer"
                              title="Apple / Telefon Takvimi (.ics) İndir"
                            >
                              <Download size={14} />
                            </button>
                          </div>

                          {/* Watchlist Quick Action */}
                          <div className="flex items-center gap-1.5">
                            {watchItem ? (
                              <button
                                onClick={() => handleIncrement(anime.mal_id)}
                                className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-amber-400 text-[10px] font-black uppercase border border-white/20 flex items-center gap-1"
                              >
                                <Plus size={11} strokeWidth={3} />
                                <span>Bölüm {watchItem.episodesWatched || 0}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddAnime(anime)}
                                className="px-2 py-1 bg-neutral-900 hover:bg-white hover:text-black text-white text-[10px] font-black uppercase border border-white/20 flex items-center gap-1"
                              >
                                <Plus size={11} strokeWidth={3} />
                                <span>Listeme Ekle</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              {/* Permission & Settings Bar */}
              <div className="bg-neutral-950 border-2 border-white/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <BellRing size={16} className="text-amber-400" />
                    Bölüm Bildirimi Ayarları
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold uppercase mt-1">
                    {notificationPermission === 'granted'
                      ? 'Tarayıcı bildirimleri yetkisi açık. Bölüm çıkışından önce masaüstü uyarısı alacaksınız.'
                      : 'Masaüstü bildirimleri kapalı veya bekleniyor. Lütfen tarayıcı izinlerini açın.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-black border border-white/20 px-2 py-1">
                    <span className="text-[10px] font-black text-neutral-400 uppercase">Önceden Uyar:</span>
                    <select
                      value={notifyOffset}
                      onChange={(e) => setNotifyOffset(Number(e.target.value))}
                      className="bg-black text-white text-xs font-black uppercase outline-none cursor-pointer"
                    >
                      <option value={0}>Yayın Anında</option>
                      <option value={5}>5 Dk Önce</option>
                      <option value={15}>15 Dk Önce</option>
                      <option value={30}>30 Dk Önce</option>
                      <option value={60}>1 Saat Önce</option>
                    </select>
                  </div>

                  <button
                    onClick={sendTestNotification}
                    className="px-3 py-1.5 bg-amber-400 text-black hover:bg-white font-black text-xs uppercase tracking-wider border border-black flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 size={13} strokeWidth={2.5} />
                    <span>Test Uyarısı</span>
                  </button>
                </div>
              </div>

              {/* List of active reminders */}
              {reminders.length === 0 ? (
                <div className="p-16 text-center bg-neutral-950 border-2 border-white/20">
                  <BellOff size={48} className="mx-auto text-neutral-600 mb-3" />
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">
                    Henüz Kurulu Bir Hatırlatıcı Yok
                  </h4>
                  <p className="text-xs text-neutral-400 font-bold uppercase mt-1 max-w-md mx-auto">
                    Haftalık yayın programından takip ettiğin diziler için "Hatırlatıcı Kur" butonuna basarak yeni bölümleri hiç kaçırma.
                  </p>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="mt-4 px-6 py-2.5 bg-white text-black hover:bg-amber-400 font-black text-xs uppercase tracking-wider border-2 border-black transition-colors"
                  >
                    Yayın Akışına Göz At
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-400 px-1">
                    <span>Toplam {reminders.length} Aktif Hatırlatıcı</span>
                    <span>Tüm Takvimi Eşitle</span>
                  </div>

                  {reminders.map((rem) => {
                    const timeInfo = getTimeUntilAiring(rem.day, rem.timeTR);
                    const dayObj = DAYS_OF_WEEK.find((d) => d.key === rem.day);

                    return (
                      <div
                        key={rem.id}
                        className="bg-neutral-950 border-2 border-white/20 hover:border-amber-400 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getSafeImageUrl(rem.image)}
                            alt={rem.title}
                            className="w-14 h-20 object-cover border border-white/30 shrink-0"
                            referrerPolicy="no-referrer"
                          />

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.2 border border-black uppercase">
                                {dayObj?.labelTR} • {rem.timeTR} TR
                              </span>
                              <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 uppercase">
                                BÖLÜM {rem.currentEpisode}
                              </span>
                            </div>

                            <h4
                              onClick={() => {
                                onClose();
                                navigate(`/anime/${rem.mal_id}`);
                              }}
                              className="font-black text-white uppercase text-base hover:text-amber-400 cursor-pointer"
                            >
                              {rem.title_english || rem.title}
                            </h4>

                            <div className="flex items-center gap-3 text-xs text-neutral-400 font-bold uppercase mt-1">
                              <span className="text-amber-300 flex items-center gap-1">
                                <Clock size={12} /> {timeInfo.text}
                              </span>
                              <span>• Stüdyo: {rem.studio || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                          {/* Google Calendar Link */}
                          <a
                            href={generateGoogleCalendarUrl(rem)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase border border-white/30 flex items-center gap-1.5 transition-colors"
                          >
                            <CalendarCheck size={14} className="text-amber-400" />
                            <span>Google Takvim</span>
                          </a>

                          {/* Download ICS */}
                          <button
                            onClick={() => downloadIcsFile(rem)}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase border border-white/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download size={14} />
                            <span>.ICS İndir</span>
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() => {
                              removeReminder(rem.mal_id);
                              addToast('Hatırlatıcı silindi', 'info');
                            }}
                            className="p-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500 transition-colors cursor-pointer"
                            title="Hatırlatıcıyı Kaldır"
                          >
                            <BellOff size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEASON OVERVIEW */}
          {activeTab === 'season' && (
            <div className="space-y-6">
              <div className="bg-neutral-950 border-2 border-white/20 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles size={20} className="text-amber-400" />
                  <h3 className="font-black text-lg text-white uppercase tracking-tight">
                    SONBAHAR 2026 SEZONU YAYIN HARİTASI
                  </h3>
                </div>
                <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                  Bu sezon Shounen efsanelerinden psikolojik gerilimlere, sürükleyici romantizmlerden fantezi dünyalarına kadar
                  haftanın her günü dopdolu bir yayın akışı bulunuyor. Takvimdeki animeler Türkiye saatiyle (TSİ) listelenmiştir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-black border-2 border-white/20 p-4">
                  <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 uppercase tracking-wider">
                    ÖNE ÇIKAN AKSİYON
                  </span>
                  <h4 className="text-sm font-black text-white uppercase mt-2">Dan Da Dan & Bleach</h4>
                  <p className="text-xs text-neutral-400 font-bold uppercase mt-1">
                    Perşembe 18:00 ve Cumartesi 17:00'da kaçırılmayacak bölümlerle yayında.
                  </p>
                </div>

                <div className="bg-black border-2 border-white/20 p-4">
                  <span className="text-[10px] font-black bg-amber-400 text-black px-2 py-0.5 uppercase tracking-wider">
                    FANTASTİK VE DRAM
                  </span>
                  <h4 className="text-sm font-black text-white uppercase mt-2">Re:Zero 3 & Frieren</h4>
                  <p className="text-xs text-neutral-400 font-bold uppercase mt-1">
                    Çarşamba günleri derin hikaye örgüsüyle haftanın en çok izlenenleri arasında.
                  </p>
                </div>

                <div className="bg-black border-2 border-white/20 p-4">
                  <span className="text-[10px] font-black bg-cyan-400 text-black px-2 py-0.5 uppercase tracking-wider">
                    HAFTA SONU MARATONU
                  </span>
                  <h4 className="text-sm font-black text-white uppercase mt-2">One Piece & Solo Leveling</h4>
                  <p className="text-xs text-neutral-400 font-bold uppercase mt-1">
                    Pazar sabahı Egghead adasıyla başlayıp akşam Sung Jin-Woo savaşıyla taçlanıyor.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-2 border-white/20 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-400 font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Türkiye Saati (TSİ) ile Canlı Eşzamanlı Yayınlar</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                navigate('/calendar');
              }}
              className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 border border-white/20 font-black uppercase text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Geniş Takvim Sayfası</span>
              <ChevronRight size={14} strokeWidth={3} />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-black hover:bg-amber-400 font-black uppercase text-xs border-2 border-black transition-colors cursor-pointer"
            >
              Tamam
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
