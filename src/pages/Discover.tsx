import React, { useEffect, useState } from 'react';
import { useAnimeData } from '../hooks/useAnimeData';
import { AnimeCard } from '../components/AnimeCard';
import { GenreTrendingVisualization } from '../components/GenreTrendingVisualization';
import { SimilarAnimeFinder } from '../components/SimilarAnimeFinder';
import { SocialFeedSection } from '../components/SocialFeedSection';
import { Sparkles, Loader2, Play, Calendar, Filter, Shuffle, Search, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anime } from '../types';
import { DAILY_PICKS } from '../data/picks';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { AnimeErrorCard } from '../components/AnimeErrorCard';
import { MultiMediaHub } from '../components/MultiMediaHub';

const GENRES = [
  { id: 1, name: 'Action', emoji: '⚔️' },
  { id: 2, name: 'Adventure', emoji: '🗺️' },
  { id: 4, name: 'Comedy', emoji: '😂' },
  { id: 8, name: 'Drama', emoji: '🎭' },
  { id: 10, name: 'Fantasy', emoji: '🪄' },
  { id: 14, name: 'Horror', emoji: '👻' },
  { id: 22, name: 'Romance', emoji: '❤️' },
  { id: 24, name: 'Sci-Fi', emoji: '🚀' },
  { id: 36, name: 'Slice of Life', emoji: '☕' },
];

export const Discover = () => {
  const { t } = useAppTranslation();
  const { data: trending, loading, error, fetchTop, fetchRandom, fetchByCriteria } = useAnimeData();
  const [randomAnime, setRandomAnime] = useState<Anime | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  useEffect(() => {
    fetchTop();
  }, [fetchTop]);

  const handleRandomize = async () => {
    setIsRolling(true);
    let result: Anime | null = null;
    
    try {
      if (selectedGenres.length > 0) {
        const results = await fetchByCriteria(selectedGenres);
        if (results && results.length > 0) {
          result = results[Math.floor(Math.random() * results.length)];
        } else {
          result = await fetchRandom();
        }
      } else {
        result = await fetchRandom();
      }
    } catch (e) {
      console.warn('Randomize error, pulling from global engine:', e);
      result = await fetchRandom();
    }
    
    if (result) {
      setRandomAnime(result);
    }
    setIsRolling(false);
  };

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const dayIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
  const picksLength = DAILY_PICKS.length;
  
  const currentPicks = [
    DAILY_PICKS[dayIndex % picksLength],
    DAILY_PICKS[(dayIndex + 1) % picksLength],
    DAILY_PICKS[(dayIndex + 2) % picksLength]
  ];
  
  return (
    <div className="space-y-16">
      {/* Hero Section - Infinite Random Discovery Engine */}
      <section className="relative overflow-hidden bg-white border-4 border-black p-6 md:p-10 neo-shadow-white group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left w-full h-full flex flex-col justify-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-black tracking-widest uppercase mb-4 border-2 border-transparent">
                <Sparkles size={14} className="text-white" />
                SINIRSIZ ANİME KEŞİF MOTORU
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter leading-[1.1]" dangerouslySetInnerHTML={{ __html: t('cant_find_watch').replace('<br>', '<br class="hidden md:block"/>') }}>
              </h2>
              <p className="text-black/70 font-bold mt-4 max-w-md text-sm md:text-base mx-auto md:mx-0 uppercase tracking-wider">
                Yayınlanmış tüm anime evreninden asla tekrara düşmeyen rastgele öneriler al ya da türlerini seç!
              </p>
            </div>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-black p-4 border-2 border-black text-left space-y-4">
                    <p className="text-xs font-black text-white uppercase tracking-widest">{t('genre_selection')}</p>
                    <div className="flex flex-wrap gap-3">
                      {GENRES.map(g => (
                        <button
                          key={g.id}
                          onClick={() => toggleGenre(g.id)}
                          className={cn(
                            "px-4 py-2 text-sm transition-all duration-100 flex items-center gap-2 border-2 font-black uppercase tracking-wider",
                            selectedGenres.includes(g.id) 
                              ? "bg-white border-white text-black neo-shadow-white" 
                              : "bg-black border-white/30 text-neutral-400 hover:border-white hover:text-white"
                          )}
                        >
                          <span>{g.emoji}</span>
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={handleRandomize}
                disabled={isRolling}
                className="w-full sm:w-auto overflow-hidden bg-black text-white font-black px-8 py-4 uppercase tracking-widest flex items-center justify-center gap-3 border-4 border-black hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isRolling ? <Loader2 size={24} strokeWidth={2.5} className="animate-spin" /> : (selectedGenres.length > 0 ? <Search size={24} strokeWidth={2.5} /> : <Shuffle size={24} strokeWidth={2.5} />)}
                  {isRolling ? t('searching') : (selectedGenres.length > 0 ? 'FİLTREYE GÖRE KEŞFET' : 'YENİ BİR ANİME ÖNER')}
                </span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "w-full sm:w-auto px-6 py-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all border-4 cursor-pointer",
                  showFilters || selectedGenres.length > 0
                    ? "bg-black border-black text-white"
                    : "bg-white border-black text-black hover:bg-black hover:text-white"
                )}
              >
                <Filter size={20} strokeWidth={2.5} />
                {selectedGenres.length > 0 ? `${selectedGenres.length} ${t('genres_selected')}` : t('filter')}
              </button>
            </div>
          </div>

          <div className="w-full md:w-1/3 flex justify-center perspective-1000 relative z-20">
            <AnimatePresence mode="wait">
              {isRolling ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-56 sm:w-64 aspect-[3/4] border-4 border-black bg-white overflow-hidden flex flex-col animate-pulse neo-shadow"
                >
                  <div className="flex-1 bg-black/10" />
                  <div className="h-32 p-4 flex flex-col gap-3 bg-black">
                    <div className="h-6 w-4/5 bg-white/20 rounded-none animate-pulse" />
                    <div className="h-4 w-3/5 bg-white/20 rounded-none animate-pulse" />
                    <div className="flex gap-2 mt-auto">
                      <div className="h-6 w-20 bg-white/20 rounded-none animate-pulse" />
                      <div className="h-6 w-12 bg-white/20 rounded-none animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              ) : randomAnime ? (
                <motion.div
                  key={randomAnime.mal_id}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                  className="w-56 sm:w-64 neo-shadow"
                >
                  <AnimeCard anime={randomAnime} />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-56 sm:w-64 aspect-[3/4] border-4 border-black bg-white flex flex-col items-center justify-center text-black p-6 text-center neo-shadow"
                >
                  <Sparkles size={64} strokeWidth={1} className="mb-6 opacity-80" />
                  <p className="font-black uppercase tracking-wider text-sm leading-relaxed">{t('click_discover')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* NEW FEATURE: Similar Anime Recommendation Engine */}
      <section>
        <SimilarAnimeFinder />
      </section>

      {/* Recharts Genre Data Visualization Section */}
      <section>
        <GenreTrendingVisualization />
      </section>

      {/* Günün Önerileri Section */}
      <section>
        <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-white/20">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <Calendar size={28} strokeWidth={2.5} className="text-rose-500" />
            {t('daily_recs')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentPicks.map((pick, i) => (
            <div key={i} className="flex flex-col gap-4 bg-black p-4 border-2 border-white/20 hover:border-rose-500 transition-colors group">
              <div className="text-center md:text-left border-b-2 border-white/20 pb-3 mb-2 group-hover:border-rose-500 transition-colors">
                <h3 className="font-black text-xl uppercase tracking-tighter text-white">{pick.theme}</h3>
                <p className="text-xs text-neutral-400 mt-2 h-8 font-bold uppercase tracking-wider">{pick.desc}</p>
              </div>
              <div className="flex-1">
                <AnimeCard anime={pick.anime} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-white/20">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            {t('trending_now')}
            <span className="flex h-3 w-3 rounded-full bg-rose-500 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            </span>
          </h2>

          <button
            onClick={() => fetchTop()}
            className="flex items-center gap-2 px-3 py-1.5 bg-black border-2 border-white text-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors"
          >
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
            YENİLE
          </button>
        </div>

        {loading && (!trending || trending.length === 0) ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] border-2 border-white/20 bg-white/5 animate-pulse"></div>
            ))}
          </div>
        ) : trending && trending.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {trending.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : error ? (
          <AnimeErrorCard
            code="RATE_LIMIT"
            title="Günün Trending Verileri Alınamadı"
            message={error || "Jikan API servis kotası aşılmış olabilir. Yeniden deneyin veya çevrimdışı listeleri yükleyin."}
            onRetry={() => fetchTop()}
          />
        ) : (
          <div className="p-8 text-center bg-black border-2 border-white/20 text-neutral-400 font-black uppercase">
            TRENDING VERİSİ YÜKLENİYOR...
          </div>
        )}
      </section>

      {/* Multi-Media (Manga, Novel, Games) & Waifu/Husbando Character Shrine */}
      <section>
        <MultiMediaHub />
      </section>

      {/* Community Social Feed Section */}
      <section className="pt-4">
        <SocialFeedSection />
      </section>
    </div>
  );
};
