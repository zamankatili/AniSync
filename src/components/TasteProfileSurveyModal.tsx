import React, { useState } from 'react';
import { 
  Sparkles, Compass, Check, ArrowRight, ArrowLeft, X, 
  Brain, Shield, Flame, Heart, Zap, Award, Film, Bookmark 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { fetchAnimeFallback, toLegacyAnime } from '../lib/api/animeBridge';
import { getJikanMedia } from '../lib/api/jikan';
import { Anime } from '../types';

interface TasteProfileSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (result: TasteProfileResult) => void;
}

export interface TasteProfileResult {
  dnaTitle: string;
  dnaBadge: string;
  description: string;
  primaryGenres: string[];
  preferredPacing: string;
  archetype: string;
  recommendedAnimes: {
    mal_id: number;
    title: string;
    image: string;
    score: number;
    reason: string;
  }[];
}

const GENRE_OPTIONS = [
  { id: 'Action', labelKey: 'taste_genre_action', icon: '⚔️' },
  { id: 'Fantasy', labelKey: 'taste_genre_fantasy', icon: '🧙' },
  { id: 'Psychological', labelKey: 'taste_genre_psychological', icon: '🧠' },
  { id: 'Sci-Fi', labelKey: 'taste_genre_scifi', icon: '🚀' },
  { id: 'Romance', labelKey: 'taste_genre_romance', icon: '💖' },
  { id: 'Comedy', labelKey: 'taste_genre_comedy', icon: '😂' },
  { id: 'Mystery', labelKey: 'taste_genre_mystery', icon: '🕵️' },
  { id: 'Slice of Life', labelKey: 'taste_genre_slice', icon: '🍵' },
];

const PACING_OPTIONS = [
  { id: 'fast', titleKey: 'taste_pacing_fast_title', descKey: 'taste_pacing_fast_desc' },
  { id: 'deep', titleKey: 'taste_pacing_deep_title', descKey: 'taste_pacing_deep_desc' },
  { id: 'chill', titleKey: 'taste_pacing_chill_title', descKey: 'taste_pacing_chill_desc' }
];

const ARCHETYPE_OPTIONS = [
  { id: 'strategist', titleKey: 'taste_arch_strategist_title', descKey: 'taste_arch_strategist_desc' },
  { id: 'grit', titleKey: 'taste_arch_grit_title', descKey: 'taste_arch_grit_desc' },
  { id: 'antihero', titleKey: 'taste_arch_antihero_title', descKey: 'taste_arch_antihero_desc' },
  { id: 'sage', titleKey: 'taste_arch_sage_title', descKey: 'taste_arch_sage_desc' }
];

/**
 * Sabit editör seçkisi. Bu liste kişiselleştirilmiş bir AI eşleştirmesi
 * değildir; sonuç ekranında bu açıkça belirtilir. Skorlar seçkinin
 * yayınlandığı tarihteki MAL değerleridir, canlı veri değildir.
 */
const CURATED_RECOMMENDATIONS = [
  {
    mal_id: 52991,
    title: "Frieren: Beyond Journey's End",
    image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
    score: 9.32,
    reasonKey: 'taste_rec_frieren'
  },
  {
    mal_id: 52299,
    title: "Solo Leveling",
    image: "https://cdn.myanimelist.net/images/anime/1208/135328l.jpg",
    score: 8.52,
    reasonKey: 'taste_rec_solo'
  },
  {
    mal_id: 1535,
    title: "Death Note",
    image: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
    score: 8.62,
    reasonKey: 'taste_rec_death_note'
  }
];

export const TasteProfileSurveyModal: React.FC<TasteProfileSurveyModalProps> = ({ 
  isOpen, 
  onClose,
  onCompleted 
}) => {
  const { updateUserProfile, addToWatchlist, watchlist } = useAppStore();
  const { addToast } = useToastStore();
  const { t } = useAppTranslation();

  const [step, setStep] = useState<number>(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action', 'Fantasy']);
  const [selectedPacing, setSelectedPacing] = useState<string>('fast');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('strategist');
  const [result, setResult] = useState<TasteProfileResult | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        if (prev.length === 1) return prev; // En az 1 tür seçili kalsın
        return prev.filter(g => g !== genreId);
      } else {
        if (prev.length >= 4) return prev; // Max 4 tür
        return [...prev, genreId];
      }
    });
  };

  const calculateProfileResult = (): TasteProfileResult => {
    // 1. Archetype → Otaku DNA (localized copy; no AI claim)
    const dnaByArchetype: Record<string, { titleKey: string; badge: string; descKey: string }> = {
      strategist: { titleKey: 'taste_dna_strategist_title', badge: '🧠', descKey: 'taste_dna_strategist_desc' },
      grit: { titleKey: 'taste_dna_grit_title', badge: '🔥', descKey: 'taste_dna_grit_desc' },
      antihero: { titleKey: 'taste_dna_antihero_title', badge: '⚔️', descKey: 'taste_dna_antihero_desc' },
      sage: { titleKey: 'taste_dna_sage_title', badge: '🌌', descKey: 'taste_dna_sage_desc' }
    };

    const dna = dnaByArchetype[selectedArchetype] ?? dnaByArchetype.strategist;
    const dnaTitle = t(dna.titleKey);
    const desc = t(dna.descKey);

    // 2. Fixed editor picks (explicitly labelled on the result screen)
    const recs = CURATED_RECOMMENDATIONS.map((rec) => ({
      mal_id: rec.mal_id,
      title: rec.title,
      image: rec.image,
      score: rec.score,
      reason: t(rec.reasonKey)
    }));

    return {
      dnaTitle,
      dnaBadge: dna.badge,
      description: desc,
      primaryGenres: selectedGenres,
      preferredPacing: selectedPacing,
      archetype: selectedArchetype,
      recommendedAnimes: recs
    };
  };

  const handleFinishSurvey = () => {
    const computedResult = calculateProfileResult();
    setResult(computedResult);

    // Save to AppStore userProfile
    updateUserProfile({
      favoriteGenres: selectedGenres,
      bio: t('taste_bio_prefix', { badge: computedResult.dnaBadge, title: computedResult.dnaTitle })
    });

    localStorage.setItem('anisync_user_taste_dna', JSON.stringify(computedResult));
    addToast(t('taste_profile_created', { title: computedResult.dnaTitle }), 'success');

    if (onCompleted) {
      onCompleted(computedResult);
    }
  };

  /**
   * Watchlist'e eklemeden önce gerçek medya verisini çeker. Kaynak
   * erişilemezse uydurma bölüm/yıl/tür bilgisi yazmak yerine hata gösterir.
   */
  const handleQuickAdd = async (animeData: TasteProfileResult['recommendedAnimes'][0]) => {
    if (addingId !== null) return;
    setAddingId(animeData.mal_id);

    let anime: Anime | null = await fetchAnimeFallback(animeData.mal_id);
    if (!anime) {
      const jikanMedia = await getJikanMedia('anime', animeData.mal_id).catch(() => null);
      if (jikanMedia) anime = toLegacyAnime(jikanMedia, animeData.mal_id);
    }

    if (!anime) {
      addToast(t('taste_add_error'), 'error');
      setAddingId(null);
      return;
    }

    addToWatchlist(anime, 'plan_to_watch');
    addToast(t('taste_added_toast', { title: anime.title }), 'success');
    setAddingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white border-4 border-black neo-shadow flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-3.5 bg-neutral-950 text-white border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 text-black border border-black flex items-center justify-center font-black">
              <Compass size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-wider text-amber-400">
                {t('taste_header_badge')}
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase">
                {result ? t('taste_header_result') : t('taste_header_step', { step })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {!result ? (
            <div className="space-y-5">
              
              {/* Step 1: Genres */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black text-black uppercase tracking-tight">
                      {t('taste_step1_title')}
                    </h4>
                    <p className="text-xs text-neutral-600 font-bold uppercase mt-0.5">
                      {t('taste_step1_desc', { count: selectedGenres.length })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {GENRE_OPTIONS.map((g) => {
                      const isSelected = selectedGenres.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGenre(g.id)}
                          className={cn(
                            "p-3 border-2 border-black font-black text-xs uppercase text-left flex items-center justify-between transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]",
                            isSelected ? "bg-amber-400 text-black" : "bg-neutral-50 text-black hover:bg-neutral-100"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{g.icon}</span>
                            <span>{t(g.labelKey)}</span>
                          </span>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Pacing */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black text-black uppercase tracking-tight">
                      {t('taste_step2_title')}
                    </h4>
                    <p className="text-xs text-neutral-600 font-bold uppercase mt-0.5">
                      {t('taste_step2_desc')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {PACING_OPTIONS.map((p) => {
                      const isSelected = selectedPacing === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPacing(p.id)}
                          className={cn(
                            "w-full p-3.5 border-2 border-black text-left font-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]",
                            isSelected ? "bg-rose-600 text-white" : "bg-neutral-50 text-black hover:bg-neutral-100"
                          )}
                        >
                          <div className="text-xs uppercase mb-1 flex items-center justify-between">
                            <span>{t(p.titleKey)}</span>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <p className={cn("text-[11px] font-bold leading-relaxed", isSelected ? "text-rose-100" : "text-neutral-600")}>
                            {t(p.descKey)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Archetype */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black text-black uppercase tracking-tight">
                      {t('taste_step3_title')}
                    </h4>
                    <p className="text-xs text-neutral-600 font-bold uppercase mt-0.5">
                      {t('taste_step3_desc')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {ARCHETYPE_OPTIONS.map((a) => {
                      const isSelected = selectedArchetype === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedArchetype(a.id)}
                          className={cn(
                            "w-full p-3.5 border-2 border-black text-left font-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]",
                            isSelected ? "bg-amber-400 text-black" : "bg-neutral-50 text-black hover:bg-neutral-100"
                          )}
                        >
                          <div className="text-xs uppercase mb-1 flex items-center justify-between">
                            <span>{t(a.titleKey)}</span>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <p className="text-[11px] font-bold text-neutral-700 leading-relaxed">
                            {t(a.descKey)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Result DNA Screen */
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-amber-400 border-4 border-black p-5 neo-shadow text-black">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{result.dnaBadge}</span>
                  <span className="font-black text-xs uppercase bg-black text-amber-400 px-2 py-0.5">
                    {t('taste_dna_label')}
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                  {result.dnaTitle}
                </h3>
                <p className="text-xs font-bold leading-relaxed">
                  {result.description}
                </p>
              </div>

              {/* Curated 3 starter recommendations */}
              <div>
                <h4 className="font-black text-xs uppercase text-black tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-600" />
                  {t('taste_curated_title')}
                </h4>
                <p className="text-[10px] font-bold text-neutral-600 uppercase mb-2">
                  {t('taste_curated_note')}
                </p>

                <div className="space-y-2.5">
                  {result.recommendedAnimes.map((rec) => {
                    const isAlreadySaved = watchlist.some(w => w.anime.mal_id === rec.mal_id);
                    return (
                      <div
                        key={rec.mal_id}
                        className="p-3 bg-neutral-950 border-2 border-black text-white flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]"
                      >
                        <img 
                          src={rec.image} 
                          alt={rec.title} 
                          className="w-12 h-16 object-cover border border-white shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-xs uppercase truncate text-white">
                            {rec.title}
                          </h5>
                          <span className="text-[10px] text-amber-400 font-bold block mb-1">
                            {t('taste_mal_score_snapshot', { score: rec.score })}
                          </span>
                          <p className="text-[10px] text-neutral-300 font-bold line-clamp-1">
                            {rec.reason}
                          </p>
                        </div>

                        <button
                          onClick={() => handleQuickAdd(rec)}
                          disabled={isAlreadySaved || addingId === rec.mal_id}
                          className={cn(
                            "px-3 py-1.5 border border-black font-black text-[10px] uppercase flex items-center gap-1 shrink-0 cursor-pointer disabled:cursor-wait",
                            isAlreadySaved ? "bg-emerald-400 text-black" : "bg-white text-black hover:bg-amber-400"
                          )}
                        >
                          {isAlreadySaved ? <Check size={12} /> : <Bookmark size={12} />}
                          <span>
                            {isAlreadySaved
                              ? t('taste_in_list')
                              : addingId === rec.mal_id
                                ? t('taste_add_loading')
                                : t('taste_add')}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 border-2 border-black font-black text-xs uppercase cursor-pointer neo-shadow"
                >
                  {t('taste_save_complete')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step Navigation Footer */}
        {!result && (
          <div className="p-3.5 bg-neutral-100 border-t-2 border-black flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-4 py-2 bg-white hover:bg-neutral-200 border-2 border-black font-black text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>{t('taste_back')}</span>
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer neo-shadow"
              >
                <span>{t('taste_next')}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishSurvey}
                className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer neo-shadow shadow-[2px_2px_0px_0px_#000]"
              >
                <Sparkles size={14} />
                <span>{t('taste_create')}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
