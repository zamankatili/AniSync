import React, { useState } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { Play, Plus, Minus, CheckCircle2, Sparkles, ChevronRight, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const QuickContinueWatching: React.FC = () => {
  const { watchlist, incrementEpisode, decrementEpisode, setEpisodeCount } = useAppStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempEpValue, setTempEpValue] = useState<string>('');
  const [celebratingId, setCelebratingId] = useState<number | null>(null);

  const watchingItems = watchlist.filter(item => item.status === 'watching');

  const playSuccessSound = (isCompleted: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      if (isCompleted) {
        // Grand fanfare chord (C5 - E5 - G5 - C6)
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.001, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.6);
        });
      } else {
        // Quick cheerful pop chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch {
      // AudioContext unavailable
    }
  };

  const handleQuickIncrement = async (mal_id: number) => {
    const res = await incrementEpisode(mal_id);
    playSuccessSound(res.completed);

    if (res.completed) {
      setCelebratingId(mal_id);
      addToast(`🎉 Tebrikler! "${res.title}" tamamlandı!`, 'success');
      setTimeout(() => setCelebratingId(null), 3000);
    } else {
      addToast(`+1 Bölüm izlendi: "${res.title}" (Bölüm ${res.newEp})`, 'info');
    }
  };

  const handleQuickDecrement = async (mal_id: number) => {
    await decrementEpisode(mal_id);
    addToast('Bölüm sayısı 1 azaltıldı', 'info');
  };

  const handleSaveCustomEp = async (mal_id: number) => {
    const parsed = parseInt(tempEpValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      await setEpisodeCount(mal_id, parsed);
      addToast(`Bölüm ${parsed} olarak güncellendi`, 'success');
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
              <h3 className="font-black text-white uppercase text-base tracking-tight">HIZLI TAKİP ÇUBUĞU</h3>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Şu an izlediğin anime yok. Keşfet'ten ekleyip bölümlerini tek tıkla takip et!</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/discover')}
            className="px-4 py-2 border-2 border-white bg-white hover:bg-rose-600 hover:text-white text-black font-black uppercase text-xs tracking-wider transition-colors neo-shadow-white"
          >
            Anime Keşfet
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
              <h3 className="font-black text-white uppercase text-base tracking-tight">DEVAM EDENLER (HIZLI TAKİP)</h3>
              <span className="text-[10px] font-black uppercase bg-amber-400 text-black px-2 py-0.5 border border-white">
                {watchingItems.length} AKTİF
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wide">
              Bölüm bitince tek tıkla ilerlet, otomatik tamamla
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/list')}
          className="text-xs font-black uppercase text-neutral-400 hover:text-white flex items-center gap-1 transition-colors group"
        >
          Tüm Liste
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
                  referrerPolicy="no-referrer"
                />
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
                      {totalEp ? `Bölüm ${watched} / ${totalEp}` : `Bölüm ${watched} izlendi`}
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
                        Kaydet
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
                        title="1 Bölüm Geri Al"
                        className="w-7 h-7 border border-white/40 bg-black text-white hover:bg-neutral-800 disabled:opacity-30 flex items-center justify-center font-black transition-colors"
                      >
                        <Minus size={13} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingId(item.anime.mal_id);
                          setTempEpValue(watched.toString());
                        }}
                        title="Özel Bölüm Sayısı Gir"
                        className="px-2 h-7 border border-white/40 bg-black text-white/80 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center transition-colors"
                      >
                        Düzenle
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
                    <span>+1 BÖLÜM</span>
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
                    <span>TAMAMLANDI! 🎉</span>
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
