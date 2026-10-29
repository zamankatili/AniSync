import React, { useRef, useMemo } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ChevronLeft, ChevronRight, Star, Bookmark, Check, 
  CheckCircle2, Flame, Layers 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { Anime } from '../types';

const POPULAR_RECOMMENDATION_POOL: Anime[] = [
  {
    mal_id: 52991,
    title: 'Frieren: Beyond Journey\'s End',
    title_english: 'Frieren: Beyond Journey\'s End',
    images: {
      jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg' },
      webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg' }
    },
    synopsis: 'Büyük iblis kralı yenen kahraman kafilesinin büyücüsü Frieren, yolculuk sonrasındaki hayatında derin maceralara atılıyor.',
    score: 9.32,
    episodes: 28,
    status: 'Finished Airing',
    genres: [{ mal_id: 1, name: 'Fantezi' }, { mal_id: 2, name: 'Macera' }, { mal_id: 3, name: 'Dram' }],
    year: 2023
  },
  {
    mal_id: 52299,
    title: 'Solo Leveling',
    title_english: 'Solo Leveling (Ore dake Level Up na Ken)',
    images: {
      jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1208/135328l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1208/135328l.jpg' },
      webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1208/135328l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1208/135328l.jpg' }
    },
    synopsis: 'En zayıf e-rütbe avcı Sung Jinwoo, gizemli bir zindanda seviye atlama sistemi kazanır.',
    score: 8.52,
    episodes: 12,
    status: 'Finished Airing',
    genres: [{ mal_id: 1, name: 'Aksiyon' }, { mal_id: 2, name: 'Fantezi' }],
    year: 2024
  },
  {
    mal_id: 40748,
    title: 'Jujutsu Kaisen 2nd Season',
    title_english: 'Jujutsu Kaisen Season 2',
    images: {
      jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg' },
      webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg' }
    },
    synopsis: 'Satoru Gojo\'nun geçmişi ve nefes kesen Shibuya Olayı arkının unutulmaz doğaüstü savaşları.',
    score: 8.81,
    episodes: 23,
    status: 'Finished Airing',
    genres: [{ mal_id: 1, name: 'Aksiyon' }, { mal_id: 4, name: 'Doğaüstü' }],
    year: 2023
  },
  {
    mal_id: 54492,
    title: 'Kusuriya no Hitorigoto',
    title_english: 'The Apothecary Diaries',
    images: {
      jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033l.jpg' },
      webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033l.jpg' }
    },
    synopsis: 'Eczacı Maomao, imparatorluk sarayında tıbbi uzmanlığı ile gizemli vakaları çözer.',
    score: 8.78,
    episodes: 24,
    status: 'Finished Airing',
    genres: [{ mal_id: 5, name: 'Gizem' }, { mal_id: 6, name: 'Dram' }],
    year: 2023
  },
  {
    mal_id: 51179,
    title: 'Bleach: Thousand-Year Blood War',
    title_english: 'Bleach: Thousand-Year Blood War',
    images: {
      jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1908/135431l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1908/135431l.jpg' },
      webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1908/135431l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1908/135431l.jpg' }
    },
    synopsis: 'Kurosaki Ichigo ve Ruh Cemiyeti, Yhwach liderliğindeki Quincy ordusuna karşı son savaşı verir.',
    score: 9.04,
    episodes: 13,
    status: 'Finished Airing',
    genres: [{ mal_id: 1, name: 'Aksiyon' }, { mal_id: 4, name: 'Doğaüstü' }],
    year: 2022
  },
  {
    mal_id: 50265,
    title: 'Spy x Family',
    title_english: 'SPY x FAMILY',
    images: {
      jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg' },
      webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg' }
    },
    synopsis: 'Bir casus, bir suikastçı ve zihin okuyabilen küçük bir kız gizli bir aile kurar.',
    score: 8.51,
    episodes: 12,
    status: 'Finished Airing',
    genres: [{ mal_id: 7, name: 'Komedi' }, { mal_id: 1, name: 'Aksiyon' }],
    year: 2022
  },
  {
    mal_id: 50631,
    title: 'Chainsaw Man',
    title_english: 'Chainsaw Man',
    images: {
      jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg' },
      webp: { image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg', large_image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg' }
    },
    synopsis: 'Denji, Şeytan Pochita ile birleşerek Testere Adam adıyla kamu güvenliği için savaşır.',
    score: 8.48,
    episodes: 12,
    status: 'Finished Airing',
    genres: [{ mal_id: 1, name: 'Aksiyon' }, { mal_id: 8, name: 'Korku' }],
    year: 2022
  }
];

export const RecommendedForYouCarousel: React.FC = () => {
  const { watchlist, addToWatchlist } = useAppStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  // 1. Identify completed items and extract completed genres
  const completedItems = useMemo(() => {
    return watchlist.filter(item => item.status === 'completed');
  }, [watchlist]);

  const completedGenres = useMemo(() => {
    const genreMap: Record<string, number> = {};
    completedItems.forEach(item => {
      item.anime?.genres?.forEach(g => {
        if (g.name) {
          genreMap[g.name] = (genreMap[g.name] || 0) + 1;
        }
      });
    });
    return Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }, [completedItems]);

  // 2. Select recommendations based on completed genres
  const recommendedList = useMemo(() => {
    if (completedGenres.length === 0) {
      // Return popular recommendation pool if no completed animes yet
      return POPULAR_RECOMMENDATION_POOL;
    }

    // Filter or score candidates based on matching completed genres
    const completedIds = new Set(completedItems.map(i => i.anime.mal_id));
    
    // Sort pool by count of matching genres
    const candidates = POPULAR_RECOMMENDATION_POOL.filter(item => !completedIds.has(item.mal_id));
    
    if (candidates.length === 0) {
      return POPULAR_RECOMMENDATION_POOL;
    }

    return candidates.sort((a, b) => {
      const matchA = a.genres.filter(g => completedGenres.includes(g.name)).length;
      const matchB = b.genres.filter(g => completedGenres.includes(g.name)).length;
      return matchB - matchA;
    });
  }, [completedGenres, completedItems]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-black border-4 border-white neo-shadow-white p-5 md:p-6 mb-8 relative overflow-hidden">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-white/20 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-0.5 border border-white uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#fff]">
              <Sparkles size={13} /> SİZİN İÇİN ÖNERİLENLER
            </span>
            <span className="bg-white text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-600" />
              {completedItems.length > 0 ? `${completedItems.length} TAMAMLANAN SERİ BAZ ALINDI` : "POPÜLER TAVSİYE LİSTESİ"}
            </span>
          </div>

          <p className="text-xs text-neutral-300 font-bold uppercase tracking-wider mt-1">
            {completedGenres.length > 0 ? (
              <>Tamamladığınız favori türleriniz (<span className="text-rose-400 font-black">{completedGenres.slice(0, 3).join(', ')}</span>) doğrultusunda sizin için derlendi.</>
            ) : (
              "Tamamladığınız anime türlerine göre kişiselleştirilmiş öneri akışı."
            )}
          </p>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 bg-white hover:bg-rose-500 hover:text-white text-black font-black border-2 border-white flex items-center justify-center transition-all cursor-pointer neo-shadow-white active:translate-x-0.5 active:translate-y-0.5"
            title="Geri"
          >
            <ChevronLeft size={20} strokeWidth={3} />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 bg-white hover:bg-rose-500 hover:text-white text-black font-black border-2 border-white flex items-center justify-center transition-all cursor-pointer neo-shadow-white active:translate-x-0.5 active:translate-y-0.5"
            title="İleri"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div 
        ref={carouselRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendedList.map((anime) => {
          const isSaved = watchlist.some(w => w.anime.mal_id === anime.mal_id);
          const matchingGenreCount = anime.genres.filter(g => completedGenres.includes(g.name)).length;

          return (
            <div
              key={anime.mal_id}
              className="w-64 sm:w-72 shrink-0 snap-start bg-neutral-950 border-2 border-white/40 hover:border-white p-3.5 transition-all duration-200 group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Match tag if matching completed genres */}
              {matchingGenreCount > 0 && (
                <div className="absolute top-2 right-2 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 border border-white uppercase z-10">
                  {matchingGenreCount} TÜR EŞLEŞTİ
                </div>
              )}

              {/* Poster Image */}
              <div 
                onClick={() => navigate(`/anime/${anime.mal_id}`)}
                className="aspect-video w-full bg-black border-2 border-white overflow-hidden relative cursor-pointer mb-3"
              >
                <img
                  src={getSafeImageUrl(anime.images.webp.image_url)}
                  alt={anime.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-1.5 left-1.5 bg-black/90 text-amber-400 font-black text-[10px] px-1.5 py-0.5 border border-amber-400 flex items-center gap-1">
                  <Star size={11} fill="currentColor" /> {anime.score}
                </div>
              </div>

              {/* Title & Genres */}
              <div>
                <div className="flex flex-wrap items-center gap-1 mb-1">
                  {anime.genres.slice(0, 2).map((g, idx) => (
                    <span 
                      key={idx} 
                      className={cn(
                        "text-[9px] font-black uppercase px-1.5 py-0.2 border",
                        completedGenres.includes(g.name)
                          ? "bg-rose-950 text-rose-300 border-rose-500"
                          : "bg-neutral-900 text-neutral-400 border-white/20"
                      )}
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                <h3 
                  onClick={() => navigate(`/anime/${anime.mal_id}`)}
                  className="font-black text-sm text-white uppercase tracking-tight line-clamp-1 group-hover:text-rose-500 transition-colors cursor-pointer mb-1"
                >
                  {anime.title_english || anime.title}
                </h3>

                <p className="text-[11px] text-neutral-400 font-bold line-clamp-2 leading-relaxed mb-3">
                  {anime.synopsis}
                </p>
              </div>

              {/* Bottom Action Button */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (!isSaved) {
                      addToWatchlist(anime, 'plan_to_watch');
                      addToast(`${anime.title} izleme listenize eklendi!`, 'success');
                    }
                  }}
                  disabled={isSaved}
                  className={cn(
                    "flex-1 py-1.5 px-3 border-2 border-black font-black text-[11px] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#fff]",
                    isSaved
                      ? "bg-emerald-400 text-black border-emerald-500"
                      : "bg-white hover:bg-rose-600 hover:text-white text-black"
                  )}
                >
                  {isSaved ? <Check size={13} strokeWidth={3} /> : <Bookmark size={13} strokeWidth={2.5} />}
                  <span>{isSaved ? "LİSTEDE" : "LİSTEME EKLE"}</span>
                </button>

                <button
                  onClick={() => navigate(`/anime/${anime.mal_id}`)}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/30 text-xs font-black uppercase"
                  title="Detay"
                >
                  <ChevronRight size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
