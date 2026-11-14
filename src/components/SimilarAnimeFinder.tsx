import React, { useState, useEffect } from 'react';
import { Anime } from '../types';
import { useAnimeData } from '../hooks/useAnimeData';
import { useAppStore } from '../context/AppStore';
import { POPULAR_PRESETS } from '../data/animeRecommendations';
import type { SimilarRecommendation } from '../lib/similarAnime';
import { toLegacyAnime } from '../lib/api/animeBridge';
import { searchAniList } from '../lib/api/anilist';
import { AnimeCard } from './AnimeCard';
import { Sparkles, Search, Layers, Compass, CheckCircle2, ChevronRight, BookmarkPlus, Flame, Heart } from 'lucide-react';
import { getSafeImageUrl } from '../lib/utils';
import { localizeGenres } from '../lib/genreNames';
import { POPULAR_PRESET_TAGS, pickLocalized } from '../data/localizedContent';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';

export const SimilarAnimeFinder: React.FC = () => {
  const { watchlist } = useAppStore();
  const { fetchSimilarAnime } = useAnimeData();
  const navigate = useNavigate();
  const { t } = useAppTranslation();

  // Initial selected preset: Attack on Titan (16498) or user's first completed/watching anime
  const [selectedAnime, setSelectedAnime] = useState<{ mal_id: number; title: string; image_url: string; tag?: string }>(
    POPULAR_PRESETS[0]
  );
  const [recommendations, setRecommendations] = useState<SimilarRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Load recommendations whenever selectedAnime changes
  useEffect(() => {
    let isCurrent = true;
    const loadRecs = async () => {
      setLoading(true);
      try {
        const results = await fetchSimilarAnime(selectedAnime.mal_id);
        if (isCurrent) {
          setRecommendations(results);
        }
      } catch (e) {
        console.error('Failed to load similar anime:', e);
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    loadRecs();
    return () => {
      isCurrent = false;
    };
  }, [selectedAnime.mal_id, fetchSimilarAnime]);

  // Live search for anime
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const result = await searchAniList({ kind: 'anime', query: searchQuery.trim(), page: 1, perPage: 6 });
      setSearchResults(
        result.items
          .filter((item) => typeof item.externalIds?.mal === 'number')
          .map((item) => toLegacyAnime(item, item.externalIds!.mal as number))
      );
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: any) => {
    setSelectedAnime({
      mal_id: item.mal_id,
      title: item.title_english || item.title,
      image_url: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
      tag: localizeGenres(item.genres?.map((g: any) => g.name).slice(0, 2) || []).join(' / ') || t('unknown')
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // User watchlist items if any
  const userWatchedList = watchlist.map(w => ({
    mal_id: w.anime.mal_id,
    title: w.anime.title_english || w.anime.title,
    image_url: w.anime.images?.jpg?.large_image_url || w.anime.images?.jpg?.image_url || (w.anime as any).image_url,
    tag: `${w.status === 'completed' ? t('completed') : t('watching')} (${w.episodesWatched || 0} EP)`
  }));

  return (
    <div className="bg-black border-4 border-black p-6 md:p-10 neo-shadow-white space-y-8">
      {/* Section Header */}
      <div className="border-b-4 border-white/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black text-xs font-black tracking-widest uppercase mb-2 border-2 border-black neo-shadow-white">
            <Sparkles size={14} className="text-black" />
            {t('similar_badge')}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            {t('similar_title')}
          </h2>
          <p className="text-neutral-400 font-bold text-xs md:text-sm uppercase tracking-wider mt-1">
            {t('similar_desc')}
          </p>
        </div>

        {/* Live Search Form */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              placeholder={t('similar_search_placeholder')}
              aria-label={t('similar_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border-2 border-white/40 pl-4 pr-10 py-3 text-white font-black text-xs uppercase placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              aria-label={t('similar_search_placeholder')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-400 text-black hover:bg-white transition-colors"
            >
              <Search size={16} strokeWidth={3} />
            </button>
          </div>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black border-4 border-white z-50 neo-shadow max-h-80 overflow-y-auto space-y-1 p-2">
              <div className="flex justify-between items-center px-2 py-1 border-b border-white/20 text-[10px] text-neutral-400 uppercase font-black">
                <span>{t('similar_results_count', { count: searchResults.length })}</span>
                <button onClick={() => setSearchResults([])} className="text-white hover:text-rose-500">{t('close')}</button>
              </div>
              {searchResults.map((item) => (
                <div
                  key={item.mal_id}
                  onClick={() => selectSearchResult(item)}
                  className="flex items-center gap-3 p-2 bg-neutral-950 hover:bg-amber-400 hover:text-black text-white cursor-pointer transition-colors"
                >
                  <img
                    src={getSafeImageUrl(item.images?.jpg?.image_url)}
                    alt={item.title}
                    className="w-8 h-11 object-cover border border-white"
                    referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-xs uppercase truncate">{item.title_english || item.title}</h5>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">{item.year || 'Series'} • Puan: {item.score || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Preset Selector Badges (Quick Switch) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Flame size={16} className="text-rose-500" />
            {t('similar_pick_popular')}
          </span>
          {userWatchedList.length > 0 && (
            <span className="text-[10px] font-bold uppercase text-amber-400">
              {t('similar_from_list', { count: userWatchedList.length })}
            </span>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {/* If user has watched list, show their top watched items first */}
          {userWatchedList.slice(0, 4).map((item) => {
            const isSelected = selectedAnime.mal_id === item.mal_id;
            return (
              <button
                key={`user-${item.mal_id}`}
                onClick={() => setSelectedAnime(item)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 border-2 font-black uppercase text-xs transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-black border-white neo-shadow-white scale-105'
                    : 'bg-neutral-900 text-neutral-300 border-white/20 hover:border-amber-400'
                }`}
              >
                <img
                  src={getSafeImageUrl(item.image_url)}
                  alt="cover"
                  className="w-6 h-8 object-cover border border-black"
                  referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                <div className="text-left">
                  <div className="truncate max-w-[120px]">{item.title}</div>
                  <div className="text-[9px] text-amber-700 font-extrabold">{item.tag}</div>
                </div>
              </button>
            );
          })}

          {/* Global popular presets */}
          {POPULAR_PRESETS.map((preset) => {
            const isSelected = selectedAnime.mal_id === preset.mal_id;
            return (
              <button
                key={preset.mal_id}
                onClick={() => setSelectedAnime(preset)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 border-2 font-black uppercase text-xs transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white border-white neo-shadow-white scale-105'
                    : 'bg-neutral-900 text-neutral-300 border-white/20 hover:border-white'
                }`}
              >
                <img
                  src={getSafeImageUrl(preset.image_url)}
                  alt="cover"
                  className="w-6 h-8 object-cover border border-black"
                  referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                <div className="text-left">
                  <div className="truncate max-w-[130px]">{preset.title}</div>
                  <div className="text-[9px] text-neutral-400 font-normal">{pickLocalized(POPULAR_PRESET_TAGS[preset.mal_id], preset.tag)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Reference Anchor Card */}
      <div className="bg-neutral-900 border-4 border-amber-400 p-4 md:p-6 neo-shadow flex flex-col sm:flex-row items-center gap-6">
        <img
          src={getSafeImageUrl(selectedAnime.image_url)}
          alt={selectedAnime.title}
          className="w-24 h-32 md:w-28 md:h-36 object-cover border-4 border-black neo-shadow-white flex-shrink-0"
          referrerPolicy="no-referrer" loading="lazy" decoding="async" />
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-400">
            <CheckCircle2 size={12} />
            {t('similar_active_ref')}
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            {selectedAnime.title}
          </h3>
          <p className="text-xs md:text-sm text-neutral-300 font-bold uppercase leading-relaxed max-w-2xl">
            {t('similar_active_desc')}
          </p>
        </div>
        <button
          onClick={() => navigate(`/anime/${selectedAnime.mal_id}`)}
          className="px-4 py-3 bg-white text-black font-black uppercase text-xs tracking-wider border-2 border-black hover:bg-amber-400 transition-colors flex items-center gap-2 flex-shrink-0 neo-shadow"
        >
          {t('similar_detail_cta')} <ChevronRight size={16} />
        </button>
      </div>

      {/* Recommended Output Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-white/20 pb-2">
          <h4 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Compass size={20} className="text-cyan-400" />
            {t('similar_best_of', { title: selectedAnime.title, count: recommendations.length })}
          </h4>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            {loading ? t('similar_analyzing') : t('similar_matches')}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] border-4 border-white/20 bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900 border-4 border-white text-white font-black uppercase tracking-wider">
            {t('similar_empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.anime.mal_id}
                className="bg-neutral-950 border-4 border-black neo-shadow-white flex flex-col group hover:border-amber-400 transition-colors"
              >
                {/* Anime Card Upper */}
                <div className="flex-1">
                  <AnimeCard anime={rec.anime} />
                </div>

                {/* Topluluk Oy Bilgisi */}
                <div className="p-3 bg-black border-t-2 border-white/20 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-600 text-white border border-black inline-flex items-center gap-1">
                      <Heart size={10} fill="currentColor" /> {rec.votes.toLocaleString()} {t('similar_votes')}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                      {t('similar_community_pick')}
                    </span>
                  </div>
                  <p className="text-[11px] font-black text-neutral-300 leading-snug line-clamp-2 uppercase">
                    {rec.genres.length > 0 ? localizeGenres(rec.genres).join(' · ') : t('similar_genre_unknown')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
