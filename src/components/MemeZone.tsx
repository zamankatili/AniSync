import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Share2, Heart, ExternalLink, RefreshCw } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { handleImageError } from '../lib/utils';

interface RedditPost {
  id: string;
  title: string;
  url: string;
  ups: number;
  author: string;
  permalink: string;
}

export const MemeZone = () => {
  const { t } = useAppTranslation();
  const { addForumPost, currentUser } = useAppStore();
  const { addToast } = useToastStore();
  const [memes, setMemes] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://meme-api.com/gimme/animemes/30`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const fetchedMemes: RedditPost[] = data.memes
        .filter((meme: any) => !meme.nsfw && !meme.spoiler)
        .map((meme: any) => ({
          id: meme.postLink.split('/').pop() || Math.random().toString(),
          title: meme.title,
          url: meme.url,
          ups: meme.ups,
          author: meme.author,
          permalink: meme.postLink
        }));
        
      setMemes(fetchedMemes);
    } catch (err) {
      console.error('Error fetching memes', err);
      // Fallback memes
      setMemes([
        {
          id: 'fb-1',
          title: 'When you finish a 24-episode anime in one sitting at 4 AM',
          url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop',
          ups: 1420,
          author: 'OtakuMaster',
          permalink: '#'
        },
        {
          id: 'fb-2',
          title: 'Zoro getting lost in another anime universe',
          url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop',
          ups: 2890,
          author: 'ZoroFan',
          permalink: '#'
        },
        {
          id: 'fb-3',
          title: 'Me waiting for Season 2 of my favorite underrated anime',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop',
          ups: 3100,
          author: 'FrierenAppreciator',
          permalink: '#'
        }
      ]);
      addToast('Meme akışı yedek sunucudan yüklendi.', 'info');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  const handleShareToFeed = (meme: RedditPost) => {
    if (!currentUser) return addToast('Giriş yapmalısın.', 'error');
    
    addForumPost({
      title: 'Hahaha!',
      content: meme.title,
      likes: 0,
      replies: 0,
      category: 'Meme',
      type: 'meme_share',
      memeUrl: meme.url
    });
    
    addToast('Meme akışa eklendi!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
         <div>
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter">MEME ZONE</h2>
           <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mt-1">GÜNLÜK ANIME MEMELERİ (R/ANIMEMES)</p>
         </div>
         <button 
           onClick={fetchMemes} 
           disabled={loading}
           className="bg-cyan-500 text-white border-2 border-white p-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 relative group"
         >
           <RefreshCw size={20} strokeWidth={3} className={loading ? "animate-spin" : ""} />
           <span className="absolute top-full right-0 mt-2 bg-black border-2 border-white text-white text-[10px] uppercase font-black px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Yenile</span>
         </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin text-white" />
          <p className="font-black text-white tracking-widest uppercase">MEMELER YÜKLENİYOR...</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {memes.map((meme, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={meme.id} 
              className="break-inside-avoid bg-black border-4 border-white neo-shadow overflow-hidden group relative"
            >
              <div className="p-3 border-b-4 border-white bg-white">
                <h3 className="font-black text-black uppercase tracking-tight text-sm line-clamp-2">{meme.title}</h3>
                <p className="text-[10px] font-bold text-neutral-500 uppercase mt-1">u/{meme.author}</p>
              </div>
              <img 
                src={meme.url} 
                alt={meme.title} 
                className="w-full h-auto" 
                loading="lazy" 
                referrerPolicy="no-referrer" 
                onError={handleImageError}
              />
              
              <div className="absolute opacity-0 group-hover:opacity-100 inset-0 bg-black/60 transition-opacity flex flex-col items-center justify-center p-4 gap-4 backdrop-blur-sm">
                 <button 
                   onClick={() => handleShareToFeed(meme)}
                   className="w-full max-w-[200px] flex items-center justify-center gap-2 bg-rose-600 text-white font-black uppercase tracking-widest py-3 border-2 border-white hover:bg-white hover:text-rose-600 transition-colors neo-shadow"
                 >
                   <Share2 size={20} strokeWidth={2.5} /> PAYLAŞ
                 </button>
                 <a 
                   href={meme.permalink}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full max-w-[200px] flex items-center justify-center gap-2 bg-cyan-500 text-white font-black uppercase tracking-widest py-3 border-2 border-white hover:bg-white hover:text-cyan-600 transition-colors"
                 >
                   <ExternalLink size={20} strokeWidth={2.5} /> REDDIT'TE AÇ
                 </a>
              </div>
              <div className="absolute bottom-2 left-2 bg-black text-white text-[10px] font-black uppercase px-2 py-1 border-2 border-white flex items-center gap-1">
                 <Heart size={12} className="fill-white" /> {meme.ups}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
