import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Star, Heart, Flame, LayoutList, Calendar, TrendingUp, Compass, Clapperboard } from 'lucide-react';
import { useAnimeData } from '../hooks/useAnimeData';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { CustomList, Anime } from '../types';
import { useAppStore } from '../context/AppStore';
import { getSafeImageUrl, handleImageError } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useToastStore } from '../store/useToastStore';
import { CreateListModal } from '../components/CreateListModal';
import { useNavigate } from 'react-router-dom';

const MiniAnimeList = ({ title, icon: Icon, path }: { title: string, icon: any, path: string }) => {
  const { fetchAnimeList } = useAnimeData();
  const [data, setData] = useState<Anime[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    fetchAnimeList(path).then(res => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [path]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b-4 border-black pb-2">
        <Icon size={24} className="text-white" strokeWidth={2.5} />
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h2>
      </div>
      
      <div className="bg-white border-4 border-black p-1 neo-shadow h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-black font-black uppercase tracking-widest">YÜKLENİYOR...</div>
        ) : !data || data.length === 0 ? (
          <div className="p-8 text-center text-black font-black uppercase tracking-widest text-sm flex flex-col items-center gap-3">
            <span>YÜKLENEMEDİ.</span>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-black text-white text-xs font-black uppercase border-2 border-black hover:bg-rose-600 transition-colors"
            >
              YENİDEN DENE
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-1">
            {data.slice(0, 10).map((anime, idx) => (
              <div 
                key={anime.mal_id} 
                onClick={() => navigate(`/anime/${anime.mal_id}`)}
                className="flex items-center gap-3 bg-black text-white p-2 group hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <span className="font-black text-xl w-6 text-center text-white/50 group-hover:text-white">{idx + 1}</span>
                <img 
                  src={getSafeImageUrl(anime.images.jpg.image_url)} 
                  alt="cover" 
                  className="w-10 h-14 object-cover border-2 border-white" 
                  referrerPolicy="no-referrer" 
                  onError={handleImageError}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black uppercase truncate text-sm">{anime.title}</h4>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 group-hover:text-rose-200">
                    <Star size={10} className="inline mr-1" /> {anime.score || 'N/A'}
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

export const ListsPage = () => {
  const { t } = useAppTranslation();
  const { addToast } = useToastStore();
  const { currentUser, userProfile } = useAppStore();
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official');
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCustomLists();
    }
  }, [activeTab]);

  const fetchCustomLists = async () => {
    setListsLoading(true);
    try {
      const q = query(collection(db, 'customLists'), orderBy('upvotes', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      const lists: CustomList[] = [];
      snapshot.forEach(doc => {
        lists.push({ id: doc.id, ...doc.data() } as CustomList);
      });
      setCustomLists(lists);
    } catch (e) {
      console.error(e);
    }
    setListsLoading(false);
  };

  const handleVote = async (list: CustomList) => {
    if (!currentUser) return addToast(t('login_required', 'Giriş yapmalısın.'), 'error');
    
    const isVoted = list.votedBy.includes(currentUser.uid);
    const listRef = doc(db, 'customLists', list.id);
    
    // Optimistic UI update
    setCustomLists(prev => prev.map(l => {
      if (l.id === list.id) {
        return {
          ...l,
          upvotes: isVoted ? l.upvotes - 1 : l.upvotes + 1,
          votedBy: isVoted ? l.votedBy.filter(id => id !== currentUser.uid) : [...l.votedBy, currentUser.uid]
        };
      }
      return l;
    }).sort((a, b) => b.upvotes - a.upvotes));
    
    try {
      if (isVoted) {
        await updateDoc(listRef, {
          upvotes: increment(-1),
          votedBy: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(listRef, {
          upvotes: increment(1),
          votedBy: arrayUnion(currentUser.uid)
        });
      }
    } catch (e) {
      console.error('Error voting for list', e);
      fetchCustomLists();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">{t('lists_page_title', 'LİSTELER')}</h1>
        <p className="text-white bg-black border-4 border-black inline-block px-4 py-2 font-black uppercase tracking-widest text-sm neo-shadow-white mb-6">
          {t('lists_page_desc', 'TOPLULUĞUN VE DÜNYANIN EN İYİLERİ.')}
        </p>

        <div className="flex gap-4 border-b-4 border-black pb-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('official')}
            className={`px-6 py-3 font-black uppercase tracking-widest transition-all border-4 ${activeTab === 'official' ? 'bg-rose-600 border-black text-white neo-shadow-white' : 'bg-black border-black text-white/50 hover:text-white hover:bg-neutral-900 border-transparent'}`}
          >
            RESMİ LİSTELER
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`px-6 py-3 font-black uppercase tracking-widest transition-all border-4 ${activeTab === 'community' ? 'bg-cyan-600 border-black text-white neo-shadow-white' : 'bg-black border-black text-white/50 hover:text-white hover:bg-neutral-900 border-transparent'}`}
          >
            TOPLULUK LİSTELERİ
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'official' ? (
          <motion.div
            key="official"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <MiniAnimeList title="TOP GÜNCEL" icon={Flame} path="/top/anime?filter=airing&limit=10" />
            <MiniAnimeList title="YAKLAŞAN EFSANELER" icon={Calendar} path="/top/anime?filter=upcoming&limit=10" />
            <MiniAnimeList title="TÜM ZAMANLAR POPÜLER" icon={Trophy} path="/top/anime?filter=bypopularity&limit=10" />
            
            <MiniAnimeList title="SONBAHAR 2026" icon={TrendingUp} path="/seasons/now?limit=10" />
            <MiniAnimeList title="FİLM BAŞYAPITLARI" icon={Clapperboard} path="/top/anime?type=movie&limit=10" />
            <MiniAnimeList title="AKSİYON DOLU" icon={Compass} path="/top/anime?type=tv&limit=10" />
          </motion.div>
        ) : (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  if (!currentUser) return addToast(t('login_required', 'Giriş yapmalısın.'), 'error');
                  setIsCreateModalOpen(true);
                }}
                className="bg-white text-black border-4 border-black px-4 py-2 font-black uppercase text-sm flex items-center gap-2 hover:bg-cyan-400 transition-colors neo-shadow block"
              >
                <Plus size={18} strokeWidth={3} /> {t('create_list', 'LİSTE OLUŞTUR')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listsLoading ? (
                 <div className="col-span-1 md:col-span-2 p-8 text-center text-white font-black uppercase tracking-widest">LİSTELER YÜKLENİYOR...</div>
              ) : customLists.length === 0 ? (
                 <div className="col-span-1 md:col-span-2 p-8 text-center bg-black border-4 border-white neo-shadow-white">
                   <p className="text-white font-black uppercase tracking-widest">HENÜZ LİSTE YOK.</p>
                 </div>
              ) : (
                 customLists.map((list) => {
                   const isVoted = currentUser && list.votedBy.includes(currentUser.uid);
                   return (
                     <div key={list.id} className="bg-black border-4 border-black p-4 neo-shadow-white flex flex-col gap-4 hover:translate-y-[-4px] transition-transform">
                       {/* Info side */}
                       <div className="space-y-2">
                         <h3 className="text-xl font-black text-white uppercase leading-tight line-clamp-1">{list.title}</h3>
                         <p className="text-sm text-neutral-400 font-bold uppercase line-clamp-2 min-h-[40px]">{list.description}</p>
                         <p className="text-xs text-white/50 font-black uppercase">By @{list.creatorName}</p>
                         
                         <button
                           onClick={() => handleVote(list)}
                           className={`mt-2 px-4 py-2 border-2 text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${isVoted ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-transparent border-white text-white hover:bg-white hover:text-black'}`}
                         >
                           <Heart size={16} className={isVoted ? "fill-white" : ""} strokeWidth={2.5} />
                           {list.upvotes} {t('votes', '+ OY')}
                         </button>
                       </div>
                       
                       {/* Anime covers side */}
                       <div className="grid grid-cols-5 gap-2 content-start">
                         {list.animes.slice(0, 5).map((anime, idx) => (
                           <div 
                             key={idx} 
                             onClick={() => navigate(`/anime/${anime.mal_id}`)}
                             className="relative group aspect-[3/4] cursor-pointer"
                           >
                             <img 
                               src={getSafeImageUrl(anime.image_url)} 
                               alt="cover" 
                               className="w-full h-full object-cover border-2 border-white/20 group-hover:border-white transition-colors" 
                               referrerPolicy="no-referrer" 
                               onError={handleImageError}
                             />
                             <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center pointer-events-none">
                               <span className="text-[8px] font-black text-white uppercase">{anime.title}</span>
                             </div>
                           </div>
                         ))}
                         {list.animes.length > 5 && (
                            <div className="aspect-[3/4] bg-neutral-900 border-2 border-white/20 flex flex-col items-center justify-center text-white p-1">
                              <span className="font-black text-sm">+{list.animes.length - 5}</span>
                            </div>
                         )}
                       </div>
                     </div>
                   );
                 })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateListModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          setActiveTab('community');
          fetchCustomLists();
        }} 
      />
    </div>
  );
};
