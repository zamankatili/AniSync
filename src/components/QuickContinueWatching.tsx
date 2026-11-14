import React, { useState } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { Play, Plus, Minus, CheckCircle2, Sparkles, ChevronRight, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { playChoiceMade, playUiTap } from '../lib/gentleAudio';

export const QuickContinueWatching: React.FC = () => {
  const { watchlist, incrementEpisode, decrementEpisode, setEpisodeCount } = useAppStore();
  const { addToast } = useToastStore();
  const { t } = useAppTranslation();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempEpValue, setTempEpValue] = useState<string>('');
  const [celebratingId, setCelebratingId] = useState<number | null>(null);

  const watchingItems = watchlist.filter(item => item.status === 'watching');

  const playSuccessSound = (isCompleted: boolean) => {
    // Tamamlama ve artırma için paylaşılan yumuşak motifler.
    if (isCompleted) playChoiceMade();
    else playUiTap();
  };

  const handleQuickIncrement = async (mal_id: number) => {
    const res = await incrementEpisode(mal_id);
    playSuccessSound(res.completed);

    if (res.completed) {
      setCelebratingId(mal_id);
      addToast(t('congrats_completed', { title: res.title }), 'success');
      setTimeout(() => setCelebratingId(null), 3000);
    } else {
      addToast(t('quick_increment_toast', { title: res.title, ep: res.newEp }), 'info');
    }
  };

  const handleQuickDecrement = async (mal_id: number) => {
    await decrementEpisode(mal_id);
    addToast(t('episode_decrement_toast'), 'info');
  };

  const handleSaveCustomEp = async (mal_id: number) => {
    const parsed = parseInt(tempEpValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      await setEpisodeCount(mal_id, parsed);
      addToast(t('episode_updated_toast', { ep: parsed }), 'success');
    }
    setEditingId(null);
  };

  if (watchingItems.length === 0) {
    return (
      <div className="bg-black border-4 border-white neo-shadow-white p-5 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-white bg-amber-400 text-black flex items-center justify-center font-black">
              <Tv size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-black text-white uppercase text-base tracking-tight">{t('quick_track_bar')}</h2>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{t('quick_track_empty')}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/discover')}
            className="px-4 py-2 border-2 border-white bg-white hover:bg-rose-600 hover:text-white text-black font-black uppercase text-xs tracking-wider transition-colors neo-shadow-white"
          >
            {t('discover_anime')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-4 border-white neo-shadow-white p-5 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-white/20 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-white bg-amber-400 text-black flex items-center justify-center font-black">
            <Play size={18} fill="currentColor" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-white uppercase text-base tracking-tight">{t('continuing_header')}</h2>
              <span className="text-[10px] font-black uppercase bg-amber-400 text-black px-2 py-0.5 border border-white">
                {t('active_count', { count: watchingItems.length })}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wide">
              {t('continuing_sub')}
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/list')}
          className="text-xs font-black uppercase text-neutral-400 hover:text-white flex items-center gap-1 transition-colors group"
        >
          {t('all_list')}
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Horizontal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {watchingItems.map(item => {
          const totalEp = item.anime.episodes;
          const watched = item.episodesWatched || 0;
          const progressPercent = totalEp ? Math.min(100, Math.round((watched / totalEp) * 100)) : null;
          const isDone = celebratingId === item.anime.mal_id;

          return (
            <div 
              key={item.anime.mal_id}
              className={cn(
                "relative bg-neutral-900 border-2 border-white p-3 flex gap-3 transition-all",
                isDone ? "bg-emerald-950 border-emerald-400" : "hover:border-amber-400"
              )}
            >
              {/* Anime Poster */}
              <div 
                onClick={() => navigate(`/anime/${item.anime.mal_id}`)}
                className="w-16 h-22 shrink-0 border-2 border-white bg-black cursor-pointer overflow-hidden relative group"
              >
                <img 
                  src={getSafeImageUrl(item.anime.images.webp.image_url)} 
                  alt={item.anime.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              </div>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 
                    onClick={() => navigate(`/anime/${item.anime.mal_id}`)}
                    className="font-black text-sm uppercase text-white tracking-tight truncate cursor-pointer hover:text-amber-400 transition-colors"
                    title={item.anime.title_english || item.anime.title}
                  >
                    {item.anime.title_english || item.anime.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                      {totalEp ? t('episode_of', { watched, total: totalEp }) : t('episode_watched', { watched })}
                    </span>
                    {progressPercent !== null && (
                      <span className="text-[10px] text-neutral-400 font-bold">
                        (%{progressPercent})
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black border border-white/40 h-2 mt-2 relative overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${progressPercent !== null ? progressPercent : Math.min(100, watched * 8)}%` }}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-white/10">
                  {editingId === item.anime.mal_id ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="0"
                        max={totalEp || 9999}
                        value={tempEpValue}
                        onChange={(e) => setTempEpValue(e.target.value)}
                        className="w-16 bg-black border border-white text-white text-xs font-black p-1 text-center"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleSaveCustomEp(item.anime.mal_id)}
                        className="bg-amber-400 text-black text-[10px] font-black px-2 py-1 uppercase"
                      >
                        {t('save')}
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="text-neutral-400 text-[10px] font-bold px-1"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleQuickDecrement(item.anime.mal_id)}
                        disabled={watched <= 0}
                        title={t('undo_episode')}
                        className="w-7 h-7 border border-white/40 bg-black text-white hover:bg-neutral-800 disabled:opacity-30 flex items-center justify-center font-black transition-colors"
                      >
                        <Minus size={13} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingId(item.anime.mal_id);
                          setTempEpValue(watched.toString());
                        }}
                        title={t('custom_ep_title')}
                        className="px-2 h-7 border border-white/40 bg-black text-white/80 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center transition-colors"
                      >
                        {t('edit')}
                      </button>
                    </div>
                  )}

                  {/* Primary +1 Button */}
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickIncrement(item.anime.mal_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-amber-400 font-black text-xs uppercase tracking-wider border-2 border-black neo-shadow-white transition-colors cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={3} />
                    <span>{t('plus_one_episode')}</span>
                  </motion.button>
                </div>
              </div>

              {/* Celebrating Completed Overlay */}
              <AnimatePresence>
                {isDone && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-emerald-600/95 border-2 border-white flex items-center justify-center gap-2 text-white font-black uppercase text-sm z-20"
                  >
                    <CheckCircle2 size={24} strokeWidth={3} />
                    <span>{t('completed_badge')}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
