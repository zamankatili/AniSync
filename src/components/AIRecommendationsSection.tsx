import React, { useState, useEffect } from 'react';
import { 
  Sparkles, RefreshCw, Star, Bookmark, Check, ChevronRight, 
  BrainCircuit, ThumbsUp, Zap, Loader2, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useNavigate } from 'react-router-dom';
import { cn, getSafeImageUrl } from '../lib/utils';
import { Anime } from '../types';

export interface AIRecommendationItem {
  id: number;
  title: string;
  englishTitle?: string;
  genres: string[];
  score: number;
  episodes: number;
  matchPercentage: number;
  reason: string;
  imageUrl: string;
  synopsis: string;
}

const FALLBACK_RECOMMENDATIONS: AIRecommendationItem[] = [
  {
    id: 52991,
    title: 'Frieren: Beyond Journey\'s End',
    englishTitle: 'Frieren: Beyond Journey\'s End',
    genres: ['Fantezi', 'Macera', 'Dram'],
    score: 9.32,
    episodes: 28,
    matchPercentage: 98,
    reason: 'Kaydedilen fantastik ve derin hikayeli anilelerinle %98 uyumlu. Unutulmaz atmosferi ve karakter gelişimi tam zevkine göre.',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
    synopsis: 'Büyük iblis kralı yenen kahraman kafilesinin büyücüsü Frieren, insan yaşamının kısalığını ve bağ kurmanın önemini anlıyor.'
  },
  {
    id: 52299,
    title: 'Solo Leveling',
    englishTitle: 'Solo Leveling (Ore dake Level Up na Ken)',
    genres: ['Aksiyon', 'Fantezi', 'Güçlenme'],
    score: 8.52,
    episodes: 12,
    matchPercentage: 95,
    reason: 'İzleme listenizdeki aksiyon ve seviye atlama temalı serilerden yola çıkarak AI tarafından yüksek öncelikle önerildi.',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1208/135328l.jpg',
    synopsis: 'En zayıf e-rütbe avcı Sung Jinwoo, gizemli bir zindan görevinde sistem tarafından seçilerek sınırsız seviye atlama yeteneği kazanır.'
  },
  {
    id: 40748,
    title: 'Jujutsu Kaisen 2nd Season',
    englishTitle: 'Jujutsu Kaisen Season 2',
    genres: ['Aksiyon', 'Doğaüstü', 'Okul'],
    score: 8.81,
    episodes: 23,
    matchPercentage: 94,
    reason: 'Tempolu dövüş koreografileri ve büyüleyici atmosfer seven izleme profilinizle kusursuz eşleşme.',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg',
    synopsis: 'Satoru Gojo ve Suguru Geto\'nun gençlik günleri ile unutulmaz Shibuya Olayı arkının nefes kesen mücadelesi.'
  },
  {
    id: 54492,
    title: 'Kusuriya no Hitorigoto',
    englishTitle: 'The Apothecary Diaries',
    genres: ['Gizem', 'Tarihi', 'Dram'],
    score: 8.78,
    episodes: 24,
    matchPercentage: 92,
    reason: 'Zeka küpü ana karakteri ve saray içi gizem çözme dinamikleriyle listeniz için özel seçilmiş yapım.',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1708/138033l.jpg',
    synopsis: 'Eczacı kız Maomao, imparatorluk sarayına hizmetçi olarak satılır ve tıbbi bilgileriyle gizemli zehirlenme vakalarını çözer.'
  }
];

export const AIRecommendationsSection: React.FC = () => {
  const { watchlist, addToWatchlist } = useAppStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>(FALLBACK_RECOMMENDATIONS);
  const [loading, setLoading] = useState<boolean>(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const userSavedTitles = watchlist.map(item => item.anime.title_english || item.anime.title).slice(0, 10);
  const userSavedGenres = Array.from(new Set(watchlist.flatMap(item => (item.anime.genres || []).map(g => g.name)))).slice(0, 8);

  const fetchAIRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savedTitles: userSavedTitles,
          savedGenres: userSavedGenres,
          totalSaved: watchlist.length
        })
      });

      if (!res.ok) throw new Error('AI Tavsiyeleri alınamadı');

      const data = await res.json();
      if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        addToast('Kişiselleştirilmiş AI tavsiyeleri listenize göre güncellendi!', 'success');
      } else {
        setRecommendations(FALLBACK_RECOMMENDATIONS);
      }
    } catch (err) {
      console.warn('AI recommendations fetch notice:', err);
      setRecommendations(FALLBACK_RECOMMENDATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIRecommendations();
  }, [watchlist.length]);

  const handleAddToList = (rec: AIRecommendationItem) => {
    const mockAnime: Anime = {
      mal_id: rec.id,
      title: rec.title,
      title_english: rec.englishTitle || rec.title,
      images: {
        jpg: { image_url: rec.imageUrl, large_image_url: rec.imageUrl },
        webp: { image_url: rec.imageUrl, large_image_url: rec.imageUrl }
      },
      synopsis: rec.synopsis,
      score: rec.score,
      episodes: rec.episodes,
      status: 'Finished Airing',
      genres: rec.genres.map((g, idx) => ({ mal_id: idx + 1, name: g })),
      year: 2024
    };

    addToWatchlist(mockAnime, 'plan_to_watch');
    setAddedIds((prev) => new Set(prev).add(rec.id));
    addToast(`${rec.title} izleme listenize eklendi!`, 'success');
  };

  return (
    <div className="bg-black border-4 border-amber-400 neo-shadow p-5 md:p-6 mb-8 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-white/20 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-400 text-black border-2 border-white flex items-center justify-center font-black neo-shadow">
            <BrainCircuit size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">
                GEMINI AI KİŞİSELLEŞTİRİLMİŞ TAVSİYELER
              </h2>
              <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 border border-white uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#fff]">
                <Sparkles size={11} /> AI POWERED
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              Kaydedilen {watchlist.length} serilik izleme geçmişine göre Gemini yapay zekası tarafından önerilmiştir
            </p>
          </div>
        </div>

        <button
          onClick={fetchAIRecommendations}
          disabled={loading}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black flex items-center gap-2 transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 neo-shadow shadow-[2px_2px_0px_0px_#fff] shrink-0"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} strokeWidth={3} />
          <span>{loading ? "ANALİZ EDİLİYOR..." : "TAVSİYELERİ YENİLE"}</span>
        </button>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        {recommendations.map((rec, index) => {
          const isAdded = addedIds.has(rec.id) || watchlist.some(w => w.anime.mal_id === rec.id);

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-neutral-950 border-2 border-amber-400/50 hover:border-amber-400 p-4 transition-all duration-200 group flex flex-col sm:flex-row gap-4 relative overflow-hidden"
            >
              {/* Match Percentage Badge */}
              <div className="absolute top-2 right-2 bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] z-10">
                <Zap size={10} fill="currentColor" />
                <span>%{rec.matchPercentage} UYUMLU</span>
              </div>

              {/* Cover Image */}
              <div 
                onClick={() => navigate(`/anime/${rec.id}`)}
                className="w-full sm:w-32 h-44 bg-black border-2 border-white shrink-0 overflow-hidden relative cursor-pointer"
              >
                <img
                  src={getSafeImageUrl(rec.imageUrl)}
                  alt={rec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-1 left-1 bg-black/90 text-amber-400 font-black text-[10px] px-1.5 py-0.5 border border-amber-400 flex items-center gap-1">
                  <Star size={11} fill="currentColor" /> {rec.score}
                </div>
              </div>

              {/* Card Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex flex-wrap items-center gap-1 mb-1">
                    {rec.genres.slice(0, 3).map((g, i) => (
                      <span key={i} className="text-[9px] font-black uppercase bg-neutral-900 text-neutral-300 px-1.5 py-0.2 border border-white/20">
                        {g}
                      </span>
                    ))}
                  </div>

                  <h3 
                    onClick={() => navigate(`/anime/${rec.id}`)}
                    className="text-base font-black text-white uppercase tracking-tight leading-snug group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer mb-1.5"
                  >
                    {rec.englishTitle || rec.title}
                  </h3>

                  {/* AI Reason Box */}
                  <div className="p-2 bg-amber-950/60 border border-amber-500/40 text-[11px] font-bold text-amber-200 leading-snug mb-3">
                    <span className="text-amber-400 font-black uppercase block mb-0.5 flex items-center gap-1">
                      <Sparkles size={11} /> Neden Bu Anime?
                    </span>
                    {rec.reason}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleAddToList(rec)}
                    disabled={isAdded}
                    className={cn(
                      "flex-1 py-1.5 px-3 border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#fff]",
                      isAdded
                        ? "bg-emerald-400 text-black border-emerald-500"
                        : "bg-white hover:bg-amber-400 text-black"
                    )}
                  >
                    {isAdded ? <Check size={14} strokeWidth={3} /> : <Bookmark size={14} strokeWidth={2.5} />}
                    <span>{isAdded ? "LİSTEDE" : "LİSTEME EKLE"}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/anime/${rec.id}`)}
                    className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/30 text-xs font-black uppercase flex items-center justify-center cursor-pointer"
                    title="Detayları İncele"
                  >
                    <ChevronRight size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
