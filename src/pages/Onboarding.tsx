import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle2, Loader2, Plus, Star, Tv
} from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { GENRE_OPTIONS } from '../data/genres';
import { localizeGenre } from '../lib/genreNames';
import { fetchRecommendationsByGenres } from '../lib/api/anilist';
import type { UnifiedMedia } from '../types/unified';
import { unifiedToAnime, isListable } from '../lib/unifiedToAnime';
import { getSafeImageUrl, cn } from '../lib/utils';

const MAX_GENRES = 8;
const SKIP_KEY = 'anisync_onboarding_pending';

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const {
    userProfile, currentUser, updateUserProfile, addToWatchlist, watchlist,
  } = useAppStore();
  const { addToast } = useToastStore();

  const [name, setName] = useState(() => (currentUser?.displayName || userProfile.name || '').trim());
  const [handle, setHandle] = useState(() => (userProfile.handle || '').replace(/[^a-zA-Z0-9_]/g, ''));
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [recs, setRecs] = useState<UnifiedMedia[]>([]);
  const [recsState, setRecsState] = useState<'idle' | 'loading' | 'ready' | 'empty' | 'error'>('idle');
  const [retryNonce, setRetryNonce] = useState(0);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const toggleGenre = (genre: string) =>
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : prev.length >= MAX_GENRES
          ? prev
          : [...prev, genre]
    );

  // Canlı AniList önerileri — sen seçene kadar dokunma, seçim yapınca güncelle
  useEffect(() => {
    if (selectedGenres.length < 2) {
      setRecs([]);
      setRecsState('idle');
      return;
    }
    let cancelled = false;
    setRecsState('loading');
    const timer = window.setTimeout(async () => {
      try {
        const items = await fetchRecommendationsByGenres(selectedGenres, 6);
        if (cancelled) return;
        setRecs(items);
        setRecsState(items.length > 0 ? 'ready' : 'empty');
      } catch {
        if (!cancelled) setRecsState('error');
      }
    }, 550);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenres, retryNonce]);

  const canComplete = name.trim().length >= 2 && selectedGenres.length >= 2;

  const clearPending = () => {
    try {
      localStorage.removeItem(SKIP_KEY);
    } catch {
      /* yoksay */
    }
  };

  const finish = () => {
    if (!canComplete) return;
    updateUserProfile({
      name: name.trim(),
      handle: handle.trim() || userProfile.handle,
      favoriteGenres: [...selectedGenres],
    });
    clearPending();
    addToast(t('onboarding_done'), 'success');
    navigate('/', { replace: true });
  };

  const skip = () => {
    clearPending();
    navigate('/', { replace: true });
  };

  const addPick = (media: UnifiedMedia) => {
    if (!isListable(media)) return;
    const anime = unifiedToAnime(media);
    addToWatchlist(anime, 'plan_to_watch');
    addToast(t('anime_card_added_to_list', { title: anime.title }), 'success');
    setAddedIds((prev) => new Set(prev).add(media.sourceId));
  };

  const isInWatchlist = (media: UnifiedMedia) => {
    const mal = media.externalIds?.mal;
    return typeof mal === 'number' && watchlist.some((item) => item.anime.mal_id === mal);
  };

  const openPick = (media: UnifiedMedia) => {
    navigate(`/media/anilist:${media.sourceId}`);
  };

  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2 gap-6 items-stretch">
      {/* Sol: kapı hissi, düz beyaz üzerinde siyah + amber */}
      <div className="hidden lg:flex flex-col justify-between bg-black border-4 border-white neo-shadow-white p-10 relative overflow-hidden select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 text-white font-black flex items-center justify-center border-2 border-white">
            A
          </div>
          <div>
            <p className="font-black text-2xl leading-none tracking-tighter">ANİSYNC</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mt-1">{t('onboarding_eyebrow')}</p>
          </div>
        </div>

        <div>
          <h1 className="text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.95]">
            {t('onboarding_title')}
          </h1>
          <p className="text-neutral-300 font-bold mt-6 max-w-md text-lg leading-snug">
            {t('onboarding_desc')}
          </p>
        </div>

        <div className="space-y-3">
          {[t('onboarding_step1'), t('onboarding_step2'), t('onboarding_step3')].map((label, index) => (
            <div key={label} className="flex items-center gap-3 font-black text-white uppercase tracking-widest text-sm">
              <span className="w-8 h-8 bg-amber-400 text-black flex items-center justify-center border-2 border-white">
                {index + 1}
              </span>
              {label}
            </div>
          ))}
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pt-4">{t('onboarding_footer')}</p>
        </div>
      </div>

      {/* Sağ: çalışma kartı */}
      <div className="bg-white border-4 border-black text-black p-5 sm:p-7 neo-shadow-white flex flex-col relative">
        <button
          onClick={skip}
          className="absolute top-4 right-4 text-[11px] font-black uppercase tracking-widest text-black/50 hover:text-black border-b-2 border-transparent hover:border-black pb-0.5 transition-colors"
        >
          {t('onboarding_skip')}
        </button>

        <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.35em] flex items-center gap-2">
          <Tv size={14} /> {t('onboarding_eyebrow')}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="onb-name" className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-black/70">
              {t('onboarding_name_label')}
            </label>
            <input
              id="onb-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-4 border-black p-3 font-black uppercase tracking-wide focus:outline-none focus:border-rose-500 bg-white"
              placeholder="Hikikomori"
              maxLength={40}
            />
          </div>
          <div>
            <label htmlFor="onb-handle" className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-black/70">
              {t('onboarding_handle_label')}
            </label>
            <input
              id="onb-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              className="w-full border-4 border-black p-3 font-mono font-bold focus:outline-none focus:border-rose-500 bg-neutral-50 lowercase"
              placeholder="otaku_master"
              maxLength={20}
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/70">{t('onboarding_genres_label')}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
              {selectedGenres.length}/{MAX_GENRES} · {t('onboarding_genres_hint')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => {
              const active = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  aria-pressed={active}
                  className={cn(
                    'px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer',
                    active
                      ? 'bg-black text-amber-400 border-black neo-shadow'
                      : 'bg-white text-black border-black/20 hover:border-black'
                  )}
                >
                  {localizeGenre(genre)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Canlı AniList önerileri */}
        <div className="mt-5 flex-1">
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-black/70">
              <Sparkles size={12} className="text-rose-600" /> {t('onboarding_live_note')}
            </span>
            {recsState === 'loading' && <Loader2 size={14} className="animate-spin" />}
          </div>

          {recsState === 'idle' && (
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide leading-relaxed mt-6 text-center py-6">
              {t('onboarding_genres_hint')}
            </p>
          )}

          {recsState === 'loading' && (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-neutral-200 animate-pulse border-2 border-black/10" />
              ))}
            </div>
          )}

          {(recsState === 'error' || recsState === 'empty') && (
            <div className="border-2 border-amber-500 bg-amber-50 p-3 text-xs font-bold text-amber-900 uppercase tracking-wide">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="max-w-sm normal-case font-bold">{t('onboarding_recs_error')}</p>
                <button
                  onClick={() => setRetryNonce((n) => n + 1)}
                  className="px-3 py-1.5 bg-black text-amber-400 font-black uppercase text-[10px] border-2 border-black cursor-pointer hover:bg-amber-400 hover:text-black transition-colors"
                >
                  {t('onboarding_retry')}
                </button>
              </div>
            </div>
          )}

          {recsState === 'ready' && (
            <div className="grid grid-cols-3 gap-3">
              {recs.map((media) => {
                const added = addedIds.has(media.sourceId) || isInWatchlist(media);
                const listable = isListable(media);
                return (
                  <div key={media.id} className="bg-black border-2 border-black p-1.5 flex flex-col group">
                    <button
                      type="button"
                      onClick={() => openPick(media)}
                      className="relative aspect-[3/4] w-full overflow-hidden border border-white/20 bg-neutral-900 cursor-pointer"
                      aria-label={media.displayTitle}
                    >
                      <img
                        src={getSafeImageUrl(media.cover?.medium ?? media.cover?.large)}
                        alt={media.displayTitle}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer" decoding="async" />
                      {media.averageScore != null && (
                        <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 bg-black/90 text-amber-400 text-[10px] font-black px-1.5 py-0.5 border border-white/40">
                          <Star size={10} fill="currentColor" /> {(media.averageScore / 10).toFixed(1)}
                        </span>
                      )}
                    </button>
                    <p lang="en" className="text-[10px] font-black text-white uppercase leading-tight line-clamp-2 mt-1.5 min-h-[28px]">
                      {media.displayTitle}
                    </p>
                    <button
                      type="button"
                      disabled={!listable || added}
                      onClick={() => addPick(media)}
                      className={cn(
                        'mt-1.5 w-full inline-flex items-center justify-center gap-1 py-1 text-[9px] font-black uppercase border border-white/40 transition-colors',
                        added ? 'bg-emerald-500 text-black border-emerald-300' : 'text-amber-400 hover:bg-amber-400 hover:text-black hover:border-black disabled:opacity-40'
                      )}
                    >
                      {added ? <><CheckCircle2 size={10} /> {t('onboarding_added')}</> : <><Plus size={10} /> {t('onboarding_add')}</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alt aksiyon */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t-2 border-black">
          <button
            onClick={finish}
            disabled={!canComplete}
            className="flex-1 py-4 px-4 bg-amber-400 hover:bg-black hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest border-4 border-black flex items-center justify-center gap-2 transition-all neo-shadow cursor-pointer active:translate-y-0.5"
          >
            <span>{t('onboarding_complete')}</span>
            <ArrowRight size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
