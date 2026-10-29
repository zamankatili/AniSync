import React, { useState } from 'react';
import { 
  Sparkles, BrainCircuit, Shuffle, Layers, Star, Bookmark, Check, 
  ChevronRight, Zap, RefreshCw, Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecommendedForYouCarousel } from './RecommendedForYouCarousel';
import { AIRecommendationsSection } from './AIRecommendationsSection';
import { useAnimeData } from '../hooks/useAnimeData';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useNavigate } from 'react-router-dom';
import { cn, getSafeImageUrl } from '../lib/utils';
import { Anime } from '../types';

export const UnifiedRecommendationHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'genre' | 'ai' | 'random'>('genre');
  const { fetchRandom } = useAnimeData();
  const { addToWatchlist, watchlist, addForumPost } = useAppStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [isRolling, setIsRolling] = useState(false);
  const [randomAnime, setRandomAnime] = useState<Anime | null>(null);

  const handleRollRandom = async () => {
    setIsRolling(true);
    const result = await fetchRandom();
    if (result) {
      setRandomAnime(result);
    }
    setIsRolling(false);
  };

  const isRandomSaved = randomAnime ? watchlist.some(w => w.anime.mal_id === randomAnime.mal_id) : false;

  const handleSaveRandom = () => {
    if (randomAnime && !isRandomSaved) {
      addToWatchlist(randomAnime, 'plan_to_watch');
      addToast(`${randomAnime.title_english || randomAnime.title} izleme listenize eklendi!`, 'success');
    }
  };

  return (
    <div className="bg-black border-4 border-white neo-shadow-white p-5 md:p-6 mb-8 relative overflow-hidden">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-white/20 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 text-black border-2 border-white flex items-center justify-center font-black neo-shadow">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">
              TAVSİYE VE KEŞİF MERKEZİ
            </h2>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              İzleme geçmişine uygun özel öneriler, Gemini AI analizi veya rastgele zar atma
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex bg-neutral-900 border-2 border-white neo-shadow overflow-hidden shrink-0">
          <button
            onClick={() => setActiveSubTab('genre')}
            className={cn(
              "px-3 py-1.5 font-black text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer",
              activeSubTab === 'genre'
                ? "bg-rose-600 text-white"
                : "text-neutral-300 hover:text-white"
            )}
          >
            <Layers size={13} />
            <span>TÜR ODAKLI</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai')}
            className={cn(
              "px-3 py-1.5 font-black text-xs uppercase flex items-center gap-1.5 border-l-2 border-white transition-colors cursor-pointer",
              activeSubTab === 'ai'
                ? "bg-amber-400 text-black"
                : "text-neutral-300 hover:text-white"
            )}
          >
            <BrainCircuit size={13} />
            <span>GEMINI AI</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('random');
              if (!randomAnime) handleRollRandom();
            }}
            className={cn(
              "px-3 py-1.5 font-black text-xs uppercase flex items-center gap-1.5 border-l-2 border-white transition-colors cursor-pointer",
              activeSubTab === 'random'
                ? "bg-cyan-400 text-black"
                : "text-neutral-300 hover:text-white"
            )}
          >
            <Shuffle size={13} />
            <span>RASTGELE ZAR</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'genre' ? (
          <motion.div
            key="genre"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <RecommendedForYouCarousel />
          </motion.div>
        ) : activeSubTab === 'ai' ? (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AIRecommendationsSection />
          </motion.div>
        ) : (
          <motion.div
            key="random"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-neutral-950 border-2 border-cyan-400 p-5 neo-shadow space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div>
                <span className="font-black text-xs uppercase text-cyan-400 flex items-center gap-1.5">
                  <Shuffle size={14} /> ŞANSINA NE ÇIKACAK?
                </span>
                <p className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">
                  Ne izleyeceğine karar veremiyorsan zarı at, tamamen rastgele kaliteli bir seri keşfet!
                </p>
              </div>

              <button
                onClick={handleRollRandom}
                disabled={isRolling}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase border-2 border-black flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50 neo-shadow shadow-[2px_2px_0px_0px_#fff]"
              >
                {isRolling ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />}
                <span>{isRolling ? "ZAR ATILIYOR..." : "YENİ ZAR AT"}</span>
              </button>
            </div>

            {randomAnime ? (
              <div className="bg-black p-4 border-2 border-white flex flex-col sm:flex-row gap-4 items-start relative">
                <img
                  src={getSafeImageUrl(randomAnime.images.webp.image_url)}
                  alt={randomAnime.title}
                  className="w-28 h-36 object-cover border-2 border-white shrink-0 cursor-pointer"
                  onClick={() => navigate(`/anime/${randomAnime.mal_id}`)}
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 
                      onClick={() => navigate(`/anime/${randomAnime.mal_id}`)}
                      className="font-black text-base uppercase text-white hover:text-cyan-400 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {randomAnime.title_english || randomAnime.title}
                    </h3>
                    <span className="bg-rose-600 text-white font-black text-xs px-2 py-0.5 border border-white flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {randomAnime.score || 'N/A'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 font-bold line-clamp-3 leading-relaxed mb-3">
                    {randomAnime.synopsis || "Anime açıklaması mevcut değil."}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveRandom}
                      disabled={isRandomSaved}
                      className={cn(
                        "px-4 py-1.5 border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#fff]",
                        isRandomSaved
                          ? "bg-emerald-400 text-black border-emerald-500"
                          : "bg-white text-black hover:bg-cyan-400"
                      )}
                    >
                      {isRandomSaved ? <Check size={14} strokeWidth={3} /> : <Bookmark size={14} />}
                      <span>{isRandomSaved ? "LİSTEDE" : "LİSTEME EKLE"}</span>
                    </button>

                    <button
                      onClick={() => navigate(`/anime/${randomAnime.mal_id}`)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/30 text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <span>İNCELE</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-400">
                <Shuffle size={32} className="mx-auto mb-2 opacity-50 text-cyan-400" />
                <p className="font-black text-xs uppercase">Zar atarak keşfe başla!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
