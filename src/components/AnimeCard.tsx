import React from 'react';
import { Anime } from '../types';
import { Star, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useNavigate } from 'react-router-dom';
import { getSafeImageUrl, handleImageError } from '../lib/utils';
import { animeDetailPath } from '../lib/mediaLinks';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface AnimeCardProps {
  anime: Anime;
  compact?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, compact = false }) => {
  const { watchlist, addToWatchlist, incrementEpisode } = useAppStore();
  const { addToast } = useToastStore();
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  
  const watchItem = watchlist.find(item => item.anime.mal_id === anime.mal_id);
  const inWatchlist = !!watchItem;
  const isWatching = watchItem?.status === 'watching';

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!(Number(anime.mal_id) > 0)) {
      // MAL kimliği olmayan kayıtları '0' anahtarıyla yazmak veriyi ezer.
      addToast(t('anime_card_missing_id'), 'error');
      return;
    }
    if (!inWatchlist) {
      addToWatchlist(anime, 'watching');
      addToast(t('anime_card_added_to_list', { title: anime.title_english || anime.title }), 'success');
    } else if (isWatching) {
      const res = await incrementEpisode(anime.mal_id);
      if (res.completed) {
        addToast(t('anime_card_completed', { title: res.title }), 'success');
      } else {
        addToast(t('anime_card_episode_watched', { ep: res.newEp }), 'info');
      }
    } else {
      addToast(t('anime_card_already_in_list', { title: anime.title_english || anime.title, status: watchItem.status }), 'info');
    }
  };

  const handleNavigate = () => {
    const path = animeDetailPath(anime);
    if (!path) {
      addToast(t('anime_card_missing_id'), 'error');
      return;
    }
    navigate(path);
  };

  return (
    <motion.div 
      whileHover={{ y: -6, x: -6 }}
      onClick={handleNavigate}
      className="group relative flex flex-col bg-black border-4 border-black neo-shadow cursor-pointer transition-all hover:shadow-none"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden border-b-4 border-black bg-white">
        <img 
          src={getSafeImageUrl(
            anime.images?.jpg?.large_image_url || 
            anime.images?.jpg?.image_url || 
            anime.images?.webp?.large_image_url || 
            anime.images?.webp?.image_url || 
            (anime as any).image_url
          )} 
          alt={anime.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {anime.score && (
            <div className="flex items-center gap-1 bg-white text-black px-2 py-1 text-xs font-black border-2 border-black neo-shadow-white">
              <Star size={14} fill="currentColor" strokeWidth={2.5} />
              {anime.score}
            </div>
          )}
          {isWatching && (
            <div className="bg-amber-400 text-black px-2 py-1 text-[10px] font-black border-2 border-black neo-shadow-white uppercase">
              {t('anime_card_ep', { count: watchItem?.episodesWatched || 0 })}
            </div>
          )}
        </div>

        {/* Add / +1 Button */}
        <button 
          onClick={handleAdd}
          title={isWatching ? t('anime_card_title_increment') : inWatchlist ? t('anime_card_title_in_list') : t('anime_card_title_start_watching')}
          className="absolute top-3 right-3 min-w-10 h-10 px-2 border-2 border-black flex items-center justify-center text-black bg-white font-black hover:bg-amber-400 transition-colors z-10 neo-shadow-white text-xs uppercase"
        >
          {isWatching ? (
            <span className="flex items-center gap-0.5"><Plus size={14} strokeWidth={3} />1</span>
          ) : inWatchlist ? (
            <Check size={18} strokeWidth={3} />
          ) : (
            <Plus size={18} strokeWidth={3} />
          )}
        </button>

        {/* Hover info for desktop - centered over image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/85 backdrop-blur-[2px] z-0 pointer-events-none">
          <p lang="en" className="text-white text-xs font-bold leading-relaxed line-clamp-6 uppercase tracking-wide text-center">
            {anime.synopsis || t('anime_card_no_synopsis')}
          </p>
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {anime.genres.slice(0, 3).map(g => (
                <span lang="en" key={g.mal_id} className="text-[10px] uppercase font-black tracking-widest bg-white text-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000]">
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {!compact && (
         <div className="p-4 pt-3 relative z-10 bg-white group-hover:bg-rose-500 transition-colors">
           <h3 lang="en" className="font-black text-black text-sm line-clamp-1 uppercase tracking-tight group-hover:text-white transition-colors" title={anime.title_english || anime.title}>
             {anime.title_english || anime.title}
           </h3>
           <div className="flex items-center justify-between mt-2 text-xs text-black/70 font-bold uppercase tracking-wider group-hover:text-white/80 transition-colors">
             <span>{anime.year || anime.status}</span>
             <span>{anime.episodes ? `${anime.episodes} ${t('anime_card_eps')}` : t('anime_card_ongoing')}</span>
           </div>
         </div>
      )}
    </motion.div>
  );
};
