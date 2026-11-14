import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { RecentActivity, Anime } from '../types';
import { getSafeImageUrl, formatRelativeTime, cn } from '../lib/utils';
import { getDefaultAvatar } from '../lib/avatar';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { playUiTap } from '../lib/gentleAudio';
import { 
  Activity, BookmarkPlus, Check, Star, ExternalLink, Filter, 
  Layers, Clock, Film, Sparkles, RefreshCw, Plus,
  Volume2, VolumeX, Radio, Eye, Flame, ArrowRight, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Gentle shared chime (see lib/gentleAudio.ts). The old hand-rolled triangle
// sweep at 0.1 gain felt like an alarm; this respects the global SFX setting.
const playNeoChime = () => {
  playUiTap();
};

interface RecentActivityFeedProps {
  compact?: boolean;
  onViewAll?: () => void;
  maxItems?: number;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ 
  compact = false, 
  onViewAll,
  maxItems = 25 
}) => {
  const navigate = useNavigate();
  const { watchlist, addToWatchlist } = useAppStore();
  const { addToast } = useToastStore();
  const { t } = useAppTranslation();

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'plan_to_watch' | 'watching' | 'completed' | 'custom'>('all');
  
  // Real-time tracking of newly arrived items via onSnapshot
  const isInitialLoad = useRef(true);
  const [newlyArrivedIds, setNewlyArrivedIds] = useState<Set<string>>(new Set());
  const [latestLiveAlert, setLatestLiveAlert] = useState<{
    id: string;
    userName: string;
    animeTitle: string;
    animeImage: string;
    listName: string;
    time: string;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Listen to live community additions using onSnapshot
    const q = query(
      collection(db, 'recentActivities'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Detect newly arrived items in real time
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !isInitialLoad.current) {
            const data = change.doc.data();
            const docId = change.doc.id;

            setNewlyArrivedIds((prev) => new Set([...prev, docId]));
            setLatestLiveAlert({
              id: docId,
              userName: data.userName || 'Otaku',
              animeTitle: data.animeTitle || 'Anime',
              animeImage: data.animeImage || '',
              listName: data.listName || t('watchlist_default_name'),
              time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });

            if (soundEnabled) {
              playNeoChime();
            }

            // Remove highlight after 8 seconds
            setTimeout(() => {
              setNewlyArrivedIds((prev) => {
                const next = new Set(prev);
                next.delete(docId);
                return next;
              });
            }, 8000);
          }
        });

        isInitialLoad.current = false;

        const fetched: RecentActivity[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          let createdAtStr = new Date().toISOString();
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          }

          fetched.push({
            id: doc.id,
            userId: data.userId || 'anon',
            userName: data.userName || 'Otaku',
            userAvatarSeed: data.userAvatarSeed || 'User',
            userAvatar: data.userAvatar || null,
            animeId: Number(data.animeId),
            animeTitle: data.animeTitle || 'Anime',
            animeImage: data.animeImage || '',
            actionType: data.actionType || 'added_to_watchlist',
            status: data.status || 'plan_to_watch',
            listName: data.listName || 'İzleme Listesi',
            score: data.score ?? null,
            genres: data.genres || [],
            episodes: data.episodes ?? null,
            createdAt: createdAtStr
          });
        });

        // Veritabanında henüz kayıt yoksa dürüstçe boş göster (uydurma aktivite yok)
        setActivities(fetched);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not fetch recent activities from firestore:', err);
        setActivities([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxItems, soundEnabled]);

  const isAnimeInWatchlist = (animeId: number) => {
    return watchlist.some((item) => item.anime.mal_id === animeId);
  };

  const handleQuickAdd = (e: React.MouseEvent, activity: RecentActivity) => {
    e.stopPropagation();
    if (isAnimeInWatchlist(activity.animeId)) {
      addToast(t('recent_activity_already_in_list', { title: activity.animeTitle }), 'info');
      return;
    }

    // Build standard Anime object
    const miniAnime: Anime = {
      mal_id: activity.animeId,
      title: activity.animeTitle,
      title_english: activity.animeTitle,
      images: {
        jpg: { image_url: activity.animeImage, large_image_url: activity.animeImage },
        webp: { image_url: activity.animeImage, large_image_url: activity.animeImage }
      },
      synopsis: '',
      score: activity.score ?? null,
      episodes: activity.episodes ?? null,
      status: 'Finished Airing',
      genres: (activity.genres || []).map((name, i) => ({ mal_id: i + 1, name })),
      year: new Date().getFullYear()
    };

    addToWatchlist(miniAnime, 'plan_to_watch');
    addToast(t('recent_activity_added_to_list', { title: activity.animeTitle }), 'success');
  };

  // Filter logic
  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    if (filter === 'custom') return act.actionType === 'added_to_custom_list';
    return act.status === filter;
  });

  const getStatusBadge = (activity: RecentActivity) => {
    if (activity.actionType === 'added_to_custom_list') {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider neo-shadow-sm">
          <Layers size={11} strokeWidth={3} /> {activity.listName || t('custom_list_default_name')}
        </span>
      );
    }

    switch (activity.status) {
      case 'watching':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            <Film size={11} strokeWidth={3} /> {t('recent_activity_watching')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            <Check size={11} strokeWidth={3} /> {t('recent_activity_completed')}
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            <Clock size={11} strokeWidth={3} /> {t('recent_activity_on_hold')}
          </span>
        );
      case 'dropped':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            {t('recent_activity_dropped')}
          </span>
        );
      case 'plan_to_watch':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            <BookmarkPlus size={11} strokeWidth={3} /> {t('recent_activity_plan_to_watch')}
          </span>
        );
    }
  };

  const getActionSentence = (activity: RecentActivity) => {
    if (activity.actionType === 'added_to_custom_list') {
      return (
        <span>
          {t('recent_activity_custom_added', { list: activity.listName })}
        </span>
      );
    }

    switch (activity.status) {
      case 'watching':
        return <span className="text-emerald-400 font-black">{t('activity_sentence_watching')}</span>;
      case 'completed':
        return <span className="text-blue-400 font-black">{t('activity_sentence_completed')}</span>;
      case 'on_hold':
        return <span className="text-amber-400 font-black">{t('activity_sentence_on_hold')}</span>;
      case 'dropped':
        return <span className="text-rose-400 font-black">{t('activity_sentence_dropped')}</span>;
      case 'plan_to_watch':
      default:
        return <span className="text-yellow-400 font-black">{t('activity_sentence_plan')}</span>;
    }
  };

  // ==========================================
  // COMPACT MODE (Displayed directly on HomePage)
  // ==========================================
  if (compact) {
    return (
      <div className="bg-black border-4 border-white neo-shadow-white mb-8 overflow-hidden">
        {/* Live Ticker Bar */}
        <div className="bg-neutral-950 px-4 py-2.5 border-b-4 border-white flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white font-black text-[11px] uppercase tracking-widest border border-white">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              {t('recent_activity_live_feed')}
            </span>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest hidden sm:inline flex items-center gap-1">
              <Radio size={14} className="animate-pulse text-amber-400" />
              {t('recent_activity_firestore')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? t('recent_activity_sound_off_title') : t('recent_activity_sound_on_title')}
              className="p-1 text-xs border border-white/40 hover:border-white text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={14} className="text-amber-400" /> : <VolumeX size={14} className="text-neutral-500" />}
            </button>

            {onViewAll && (
              <button
                onClick={onViewAll}
                className="px-2.5 py-1 text-xs font-black bg-white text-black hover:bg-neutral-200 uppercase tracking-wider transition-colors flex items-center gap-1 border border-black cursor-pointer"
              >
                <span>{t('common_all')}</span>
                <ArrowRight size={12} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Pop-in Toast Banner inside compact feed */}
        <AnimatePresence>
          {latestLiveAlert && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-amber-400 text-black px-4 py-2 border-b-2 border-black font-black text-xs uppercase tracking-wider flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="px-1.5 py-0.2 bg-black text-amber-400 text-[10px] border border-black">{t('recent_activity_new_dropped')}</span>
                <span className="truncate">
                  {t('recent_activity_alert_added', { user: latestLiveAlert.userName, title: latestLiveAlert.animeTitle })}
                </span>
              </div>
              <button
                onClick={() => setLatestLiveAlert(null)}
                className="p-0.5 hover:bg-black/20 text-black ml-2 cursor-pointer shrink-0"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Cards Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {activities.slice(0, 3).map((act) => {
              const inList = isAnimeInWatchlist(act.animeId);
              const isNewlyArrived = newlyArrivedIds.has(act.id);

              return (
                <motion.div
                  key={act.id}
                  layout
                  initial={isNewlyArrived ? { scale: 0.85, y: -20, opacity: 0, rotate: -2 } : { opacity: 0, y: 10 }}
                  animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  onClick={() => navigate(`/anime/${act.animeId}`)}
                  className={cn(
                    "p-3 transition-all cursor-pointer group flex gap-3 relative overflow-hidden",
                    isNewlyArrived
                      ? "bg-amber-400/15 border-4 border-amber-400 shadow-[4px_4px_0px_#f59e0b] animate-pulse"
                      : "bg-neutral-900 border-2 border-white/20 hover:border-amber-400"
                  )}
                >
                  {isNewlyArrived && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 border-b border-l border-black uppercase tracking-widest flex items-center gap-1 z-10">
                      <Sparkles size={9} className="fill-black" /> {t('recent_activity_new_arrived')}
                    </div>
                  )}

                  <img
                    src={getSafeImageUrl(act.animeImage)}
                    alt={act.animeTitle}
                    className="w-14 h-20 object-cover border-2 border-white shrink-0 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <img
                          src={act.userAvatar || getDefaultAvatar(act.userAvatarSeed || act.userName)}
                          alt={act.userName}
                          className="w-4 h-4 rounded-full border border-white/50 bg-white" loading="lazy" decoding="async" />
                        <span className="text-[10px] font-black text-neutral-300 truncate uppercase">{act.userName}</span>
                        <span className="text-[9px] text-neutral-500 font-bold ml-auto shrink-0 uppercase">
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-black text-white text-xs truncate uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                        {act.animeTitle}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10">
                      {getStatusBadge(act)}
                      <button
                        onClick={(e) => handleQuickAdd(e, act)}
                        title={inList ? t('recent_activity_in_list') : t('recent_activity_add_to_list')}
                        className={cn(
                          "px-2 py-1 border-2 transition-colors text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer",
                          inList
                            ? "bg-emerald-600 border-emerald-400 text-white"
                            : "bg-black border-white/40 text-white hover:bg-white hover:text-black hover:border-white"
                        )}
                      >
                        {inList ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
                        <span className="hidden xs:inline">{inList ? t('recent_activity_added_past') : t('recent_activity_add')}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Stream Footnote */}
        <div className="bg-neutral-950 px-4 py-2 border-t-2 border-white/10 flex items-center justify-between text-[11px] font-bold text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider">{t('recent_activity_active_live')}</span>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-amber-400 hover:text-white uppercase font-black tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
            >
              {t('recent_activity_open_all', { count: activities.length })}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // FULL PAGE FEED MODE (SON HAREKETLER TAB)
  // ==========================================
  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-950 via-black to-neutral-900 border-4 border-white p-6 neo-shadow-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Activity size={200} strokeWidth={1} className="text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-xs uppercase tracking-widest border border-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> {t('recent_activity_live_broadcast')}
              </span>
              <span className="px-2.5 py-0.5 bg-amber-400 text-black font-black text-xs uppercase tracking-widest border border-black flex items-center gap-1.5">
                <Radio size={12} className="text-black" /> {t('recent_activity_firestore')}
              </span>
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                {t('recent_activity_community_actions')}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
              {t('recent_activity_hero_title')}
            </h2>
            <p className="text-sm font-bold text-neutral-400 mt-1 uppercase tracking-wide max-w-xl">
              {t('recent_activity_hero_desc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "p-2.5 border-2 transition-all cursor-pointer flex items-center gap-2 text-xs font-black uppercase tracking-wider",
                soundEnabled 
                  ? "bg-amber-400 text-black border-black neo-shadow" 
                  : "bg-black text-neutral-400 border-white/30 hover:border-white"
              )}
              title={soundEnabled ? t('recent_activity_sound_off_title') : t('recent_activity_sound_on_title')}
            >
              {soundEnabled ? <Volume2 size={16} strokeWidth={2.5} /> : <VolumeX size={16} strokeWidth={2.5} />}
              <span className="hidden sm:inline">{soundEnabled ? t('recent_activity_sound_on_short') : t('recent_activity_sound_off_short')}</span>
            </button>

            <span className="text-xs font-black text-neutral-400 uppercase tracking-widest bg-neutral-900 border-2 border-white/30 px-3 py-2 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" /> {activities.length} {t('recent_activity_activity')}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t-2 border-white/10 relative z-10">
          <span className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter size={13} /> {t('recent_activity_filter')}
          </span>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'all'
                ? "bg-white text-black border-white neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-white"
            )}
          >
            {t('recent_activity_filter_all', { count: activities.length })}
          </button>
          <button
            onClick={() => setFilter('plan_to_watch')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'plan_to_watch'
                ? "bg-yellow-400 text-black border-yellow-400 neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-yellow-400"
            )}
          >
            {t('recent_activity_filter_plan')}
          </button>
          <button
            onClick={() => setFilter('watching')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'watching'
                ? "bg-emerald-500 text-black border-emerald-500 neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-emerald-500"
            )}
          >
            {t('recent_activity_filter_watching')}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'completed'
                ? "bg-blue-500 text-white border-blue-500 neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-blue-500"
            )}
          >
            {t('recent_activity_filter_completed')}
          </button>
          <button
            onClick={() => setFilter('custom')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'custom'
                ? "bg-purple-600 text-white border-purple-600 neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-purple-600"
            )}
          >
            {t('recent_activity_filter_custom')}
          </button>
        </div>
      </div>

      {/* Floating Live Drop Notification */}
      <AnimatePresence>
        {latestLiveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-amber-400 text-black border-4 border-black p-4 neo-shadow flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <div className="font-black text-sm uppercase tracking-wide">
                <span>{t('recent_activity_alert_new_action')}</span>
                <span className="underline decoration-2">{latestLiveAlert.userName}</span>
                <span>, </span>
                <span className="bg-black text-white px-2 py-0.5">"{latestLiveAlert.animeTitle}"</span>
                <span>{t('recent_activity_alert_added_to_list', { list: latestLiveAlert.listName })}!</span>
              </div>
            </div>
            <button
              onClick={() => setLatestLiveAlert(null)}
              className="p-1 hover:bg-black hover:text-white transition-colors cursor-pointer border-2 border-black"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Stream */}
      {loading ? (
        <div className="bg-black border-4 border-white/20 p-12 text-center neo-shadow">
          <RefreshCw size={36} className="animate-spin text-amber-400 mx-auto mb-4" />
          <p className="font-black text-white uppercase tracking-widest">
            {t('recent_activity_loading')}
          </p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-black border-4 border-white/20 p-12 text-center neo-shadow">
          <Activity size={48} className="text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
            {t('recent_activity_no_activity_title')}
          </h3>
          <p className="text-neutral-400 font-bold uppercase text-sm">
            {t('recent_activity_no_activity_desc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredActivities.map((activity, idx) => {
              const inList = isAnimeInWatchlist(activity.animeId);
              const isNewlyArrived = newlyArrivedIds.has(activity.id);

              return (
                <motion.div
                  key={activity.id}
                  layout
                  initial={isNewlyArrived ? { opacity: 0, y: -30, scale: 0.92, rotate: -1.5 } : { opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25, delay: idx === 0 ? 0 : 0.02 }}
                  className={cn(
                    "p-4 md:p-5 transition-all group relative overflow-hidden",
                    isNewlyArrived
                      ? "bg-amber-400/10 border-4 border-amber-400 shadow-[6px_6px_0px_#f59e0b]"
                      : "bg-black border-4 border-white/30 hover:border-white neo-shadow-white"
                  )}
                >
                  {/* Newly arrived Neo-Brutalist Banner */}
                  {isNewlyArrived && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-black font-black text-xs px-3 py-1 border-b-2 border-l-2 border-black uppercase tracking-widest flex items-center gap-1.5 z-20 animate-pulse">
                      <Sparkles size={13} className="fill-black" /> {t('recent_activity_new_arrived_live')}
                    </div>
                  )}

                  {/* Top user action row */}
                  <div className="flex items-center justify-between mb-3 border-b-2 border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          activity.userAvatar ||
                          getDefaultAvatar(activity.userAvatarSeed || activity.userName)
                        }
                        alt={activity.userName}
                        className="w-10 h-10 border-2 border-white bg-neutral-200 shrink-0 object-cover" loading="lazy" decoding="async" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-white uppercase tracking-wider text-sm hover:text-amber-400 transition-colors">
                            {activity.userName}
                          </span>
                          <span className="text-xs text-neutral-300 uppercase tracking-wide">
                            {getActionSentence(activity)}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          @{activity.userName.toLowerCase().replace(/\s+/g, '_')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-900 border border-white/20 px-2.5 py-1">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Anime Details Card inside Activity */}
                  <div className="bg-neutral-950 border-2 border-white/20 p-3 md:p-4 flex flex-col sm:flex-row gap-4 hover:border-amber-400/80 transition-colors">
                    <div 
                      onClick={() => navigate(`/anime/${activity.animeId}`)}
                      className="relative shrink-0 w-24 h-32 sm:w-28 sm:h-36 overflow-hidden border-2 border-white bg-black cursor-pointer group/img"
                    >
                      <img
                        src={getSafeImageUrl(activity.animeImage)}
                        alt={activity.animeTitle}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                        referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink size={22} className="text-white drop-shadow-md" strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3
                            onClick={() => navigate(`/anime/${activity.animeId}`)}
                            className="font-black text-lg text-white uppercase tracking-tight hover:text-amber-400 transition-colors cursor-pointer leading-tight line-clamp-1"
                          >
                            {activity.animeTitle}
                          </h3>
                          {getStatusBadge(activity)}
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-3 text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">
                          {activity.score && (
                            <span className="text-amber-400 font-black flex items-center gap-1 bg-black/60 px-2 py-0.5 border border-amber-400/30">
                              <Star size={13} fill="currentColor" /> {activity.score}
                            </span>
                          )}
                          {activity.episodes && (
                            <span>{activity.episodes} {t('recent_activity_episodes')}</span>
                          )}
                        </div>

                        {/* Genre tags */}
                        {activity.genres && activity.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {activity.genres.slice(0, 3).map((genre, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-900 border border-white/20 px-2 py-0.5"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-3 border-t border-white/10 mt-auto">
                        <button
                          onClick={(e) => handleQuickAdd(e, activity)}
                          className={cn(
                            "px-4 py-2 font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center gap-2 cursor-pointer",
                            inList
                              ? "bg-emerald-600 text-white border-emerald-400 cursor-default"
                              : "bg-white text-black border-white hover:bg-amber-400 hover:border-amber-400 hover:text-black neo-shadow-white active:translate-x-0.5 active:translate-y-0.5"
                          )}
                        >
                          {inList ? (
                            <>
                              <Check size={15} strokeWidth={3} />
                              {t('recent_activity_in_list_caps')}
                            </>
                          ) : (
                            <>
                              <BookmarkPlus size={15} strokeWidth={2.5} />
                              {t('recent_activity_add_to_list_caps')}
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => navigate(`/anime/${activity.animeId}`)}
                          className="px-4 py-2 font-black text-xs uppercase tracking-widest border-2 border-white/40 text-white hover:border-white hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink size={14} /> {t('recent_activity_view_details')}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
