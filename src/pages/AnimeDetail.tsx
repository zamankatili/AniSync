import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAnimeData } from '../hooks/useAnimeData';
import { Anime } from '../types';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, Loader2, PlayCircle, Plus, Check, ListVideo, Heart, Tv2, Sparkles } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { cn, getSafeImageUrl, handleImageError } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { StarRating } from '../components/StarRating';
import { AnimeComments } from '../components/AnimeComments';
import { AnimeCommunityReviews } from '../components/AnimeCommunityReviews';
import { AnimeErrorCard } from '../components/AnimeErrorCard';
import { useErrorStore } from '../store/useErrorStore';

export const AnimeDetail = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchById } = useAnimeData();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { watchlist, addToWatchlist, updateWatchlistItem, userProfile } = useAppStore();
  const { addToast } = useToastStore();

  const watchlistItem = anime ? watchlist.find(item => item.anime.mal_id === anime.mal_id) : null;
  const inWatchlist = !!watchlistItem;

  // Inferred or explicit favorite genres from user profile and watchlist
  const userFavoriteGenres = useMemo(() => {
    if (userProfile.favoriteGenres && userProfile.favoriteGenres.length > 0) {
      return userProfile.favoriteGenres;
    }
    // Infer from watchlist if user hasn't set custom genres yet
    const counts: Record<string, number> = {};
    watchlist.forEach(item => {
      item.anime?.genres?.forEach(g => {
        counts[g.name] = (counts[g.name] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    return sorted.length > 0 ? sorted.slice(0, 3) : ['Action', 'Fantasy'];
  }, [userProfile.favoriteGenres, watchlist]);

  // Check matching genres
  const matchedGenres = useMemo(() => {
    if (!anime?.genres) return [];
    return anime.genres.filter(g => 
      userFavoriteGenres.some(fg => fg.toLowerCase() === g.name.toLowerCase())
    );
  }, [anime, userFavoriteGenres]);

  const isPickedForYou = matchedGenres.length > 0;

  useEffect(() => {
    if (id) {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        useErrorStore.getState().logError({
          title: 'Geçersiz Anime URL Parametresi',
          message: `URL'de verilen "${id}" adresi geçerli bir sayısal anime ID değil.`,
          code: 'INVALID_ID_PARAM',
          source: 'AnimeDetail Route'
        });
        setAnime(null);
        setLoading(false);
      } else {
        loadAnime(parsedId);
      }
    }
  }, [id]);

  const loadAnime = async (animeId: number) => {
    setLoading(true);
    const data = await fetchById(animeId);
    if (data) {
      setAnime(data);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    if (!anime) return;
    if (!inWatchlist) {
      addToWatchlist(anime, 'plan_to_watch');
      addToast(`${anime.title_english || anime.title} listeye eklendi!`, 'success');
    }
  };

  const handleUpdateStatus = (status: any) => {
    if (anime && inWatchlist) {
      updateWatchlistItem(anime.mal_id, { status });
      addToast(`Durum güncellendi!`, 'success');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <Loader2 size={48} className="animate-spin text-black" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="max-w-4xl mx-auto my-12">
        <AnimeErrorCard
          code="NOT_FOUND"
          title="Aranan Anime Bulunamadı"
          message="Belirtilen ID ile anime kaydına erişilemedi veya sunucu yanıt vermedi."
          onRetry={() => { if (id) loadAnime(parseInt(id)); }}
          onUseFallback={() => navigate('/discover')}
        />
      </div>
    );
  }

  const pageTitle = `${anime.title_english || anime.title} - AniSync`;
  const pageDescription = anime.synopsis 
    ? anime.synopsis.replace(/<[^>]*>?/gm, '').substring(0, 155).trim() + '...'
    : `${anime.title_english || anime.title} (${anime.year || 'Anime'}) detail page on AniSync. Track episodes, view ratings, reviews, and community recommendations.`;
  const pageImage = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://anisync.app/anime/${anime.mal_id}`;

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    'name': anime.title_english || anime.title,
    'alternateName': anime.title,
    'image': pageImage,
    'description': pageDescription,
    'genre': anime.genres?.map(g => g.name) || [],
    'numberOfEpisodes': anime.episodes || undefined,
    'aggregateRating': anime.score ? {
      '@type': 'AggregateRating',
      'ratingValue': anime.score,
      'bestRating': 10,
      'worstRating': 1,
      'ratingCount': (anime as any).members || 1000
    } : undefined
  };

  return (
    <div className="pb-20 md:pb-0">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* OpenGraph */}
        <meta property="og:type" content="video.tv_show" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="AniSync" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />

        {/* Canonical */}
        <link rel="canonical" href={pageUrl} />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaJsonLd)}
        </script>
      </Helmet>
      {/* Hero Header */}
      <div className="relative h-64 md:h-96 w-full object-cover border-b-4 border-black">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110 grayscale" 
          style={{ backgroundImage: `url(${anime.images.webp.large_image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 w-12 h-12 bg-black border-4 border-black flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors neo-shadow-white hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
        >
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Left Column - Poster & Actions */}
          <div className="w-52 md:w-72 shrink-0 mx-auto md:mx-0">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="border-4 border-black bg-white neo-shadow overflow-hidden"
            >
              <img 
                src={getSafeImageUrl(anime.images.webp.large_image_url)} 
                alt={anime.title} 
                className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
            </motion.div>
            
            <div className="mt-8 flex flex-col gap-4">
              {!inWatchlist ? (
                <button 
                  onClick={handleAdd}
                  className="w-full py-4 bg-black text-white hover:bg-rose-500 hover:text-white font-black uppercase tracking-widest transition-all neo-shadow-white hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0 border-4 border-black flex items-center justify-center gap-3"
                >
                  <Plus size={24} strokeWidth={3} /> {t('add_to_list')}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="w-full py-3 bg-white text-black border-4 border-black font-black uppercase tracking-widest flex items-center justify-center gap-3 neo-shadow">
                    <Check size={24} strokeWidth={3} /> {t('in_your_list')}
                  </div>
                  <select 
                    value={watchlistItem.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="w-full bg-white border-4 border-black px-4 py-3 text-black focus:outline-none font-black uppercase tracking-wider neo-shadow"
                  >
                    <option value="watching"> {t('watching')}</option>
                    <option value="completed"> {t('completed')}</option>
                    <option value="plan_to_watch"> {t('plan_to_watch')}</option>
                    <option value="dropped"> {t('dropped')}</option>
                  </select>
                </div>
              )}
              
              {anime.trailer?.url && (
                <a 
                  href={anime.trailer.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-4 bg-white hover:bg-black hover:text-white text-black font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-4 border-black neo-shadow hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                >
                  <PlayCircle size={24} strokeWidth={2.5} /> {t('watch_trailer')}
                </a>
              )}

              <button
                onClick={() => navigate('/watch-party')}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-4 border-black neo-shadow hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] cursor-pointer"
              >
                <Tv2 size={24} strokeWidth={2.5} />
                <span>BİRLİKTE İZLE (WATCH PARTY)</span>
              </button>
            </div>
            
            <div className="mt-8 bg-black p-6 border-4 border-black space-y-6 neo-shadow-white">
              <div>
                <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">{t('format')}</span>
                <p className="text-white font-black uppercase tracking-wider">{anime.type || t('unknown')} ({anime.episodes ? `${anime.episodes} ${t('episodes')}` : t('ongoing')})</p>
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">{t('status')}</span>
                <p className="text-white font-black uppercase tracking-wider">{anime.status}</p>
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">{t('year_season')}</span>
                <p className="text-white font-black uppercase tracking-wider">{anime.season ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1) : ''} {anime.year || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">{t('studio')}</span>
                <p className="text-white font-black uppercase tracking-wider leading-tight">{anime.studios?.map(s => s.name).join(', ') || t('unknown')}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="flex-1 space-y-10 pt-4 md:pt-16">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {isPickedForYou && (
                  <div className="flex items-center gap-1.5 bg-emerald-400 text-black px-3.5 py-1 font-black text-xs uppercase tracking-wider border-2 border-black neo-shadow">
                    <Sparkles size={14} className="fill-black" />
                    SENİN İÇİN SEÇİLDİ
                  </div>
                )}
                {anime.score && (
                  <div className="flex items-center gap-2 bg-black text-white px-3 py-1 font-black uppercase tracking-widest border-2 border-black neo-shadow-white">
                    <Star fill="currentColor" size={18} strokeWidth={2.5} />
                    {anime.score}
                  </div>
                )}
                {anime.rank && (
                  <div className="flex items-center gap-2 bg-white text-black px-3 py-1 font-black uppercase tracking-widest border-2 border-black neo-shadow">
                    #{anime.rank}
                  </div>
                )}
              </div>

              {/* SENİN İÇİN SEÇİLDİ BANNER */}
              {isPickedForYou && (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 border-4 border-black p-4 neo-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-black text-white border-2 border-black flex-shrink-0 neo-shadow">
                      <Sparkles size={22} className="text-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase px-2 py-0.5 bg-black text-white border border-black tracking-widest">
                          ✨ SENİN İÇİN SEÇİLDİ
                        </span>
                        <span className="text-[11px] font-black uppercase text-black bg-white/80 px-2 py-0.5 border border-black">
                          %{Math.min(99, 84 + matchedGenres.length * 6)} TÜR UYUMU
                        </span>
                      </div>
                      <p className="text-xs font-black uppercase text-black mt-1 leading-snug">
                        Profilindeki favori türlerinle eşleşiyor: <span className="underline decoration-2">{matchedGenres.map(g => g.name).join(', ')}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-white border-2 border-black text-black shrink-0 neo-shadow">
                    KİŞİYE ÖZEL ÖNERİ
                  </span>
                </motion.div>
              )}

              <h1 className="text-4xl md:text-6xl font-black text-black mb-2 tracking-tighter uppercase leading-[1.1]">
                {anime.title_english || anime.title}
              </h1>
              {anime.title_english && (
                <h2 className="text-lg md:text-2xl text-black/60 font-bold uppercase tracking-wider mb-6">
                  {anime.title}
                </h2>
              )}
              
              <div className="flex flex-wrap gap-3 mb-8">
                {anime.genres?.map(g => (
                  <span key={g.mal_id} className="bg-white text-black border-2 border-black px-4 py-1 text-xs font-black uppercase tracking-widest neo-shadow">
                    {g.name}
                  </span>
                ))}
              </div>

              <div className="mb-8">
                <StarRating animeId={anime.mal_id} />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-tighter border-b-4 border-black pb-2 inline-block">{t('synopsis')}</h3>
              <p className="text-black font-bold uppercase tracking-wide leading-relaxed text-sm md:text-base whitespace-pre-line p-6 bg-white border-4 border-black neo-shadow">
                {anime.synopsis || t('no_synopsis')}
              </p>
            </div>
            
            {anime.background && (
              <div>
                <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-tighter border-b-4 border-black pb-2 inline-block">{t('background')}</h3>
                <p className="text-white font-bold uppercase tracking-wide leading-relaxed text-sm md:text-base italic bg-black p-6 border-4 border-black neo-shadow-white">
                  {anime.background}
                </p>
              </div>
            )}
          </div>
          
        </div>
        
        {/* Community Reviews & 5-Star Ratings Section */}
        <AnimeCommunityReviews animeId={anime.mal_id} animeTitle={anime.title_english || anime.title} />

        <AnimeComments animeId={anime.mal_id} />
      </div>
    </div>
  );
};
