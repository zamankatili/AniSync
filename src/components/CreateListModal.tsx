import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToastStore } from '../store/useToastStore';
import { getSafeImageUrl } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';

export const CreateListModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) => {
  const { t } = useAppTranslation();
  const { watchlist, currentUser, userProfile } = useAppStore();
  const { addToast } = useToastStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAnimes, setSelectedAnimes] = useState<{ mal_id: number; title: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`);
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setIsSearching(false);
  };

  const handleToggleAnime = (anime: any) => {
    const isSelected = selectedAnimes.find(a => a.mal_id === anime.mal_id);
    if (isSelected) {
      setSelectedAnimes(prev => prev.filter(a => a.mal_id !== anime.mal_id));
    } else {
      if (selectedAnimes.length >= 20) {
        return addToast('En fazla 20 anime ekleyebilirsin.', 'error');
      }
      setSelectedAnimes(prev => [...prev, { mal_id: anime.mal_id, title: anime.title, image_url: anime.images.jpg.image_url }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return addToast('Başlık gerekli.', 'error');
    if (selectedAnimes.length < 3) return addToast('En az 3 anime seçmelisin.', 'error');
    if (!currentUser || !userProfile) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'customLists'), {
        title,
        description,
        creatorId: currentUser.uid,
        creatorName: userProfile.handle || userProfile.name,
        upvotes: 0,
        votedBy: [],
        animes: selectedAnimes,
        createdAt: serverTimestamp()
      });

      // Log activity to recentActivities for the community
      try {
        if (selectedAnimes.length > 0) {
          const firstAnime = selectedAnimes[0];
          await addDoc(collection(db, 'recentActivities'), {
            userId: currentUser.uid,
            userName: userProfile.handle || userProfile.name,
            userAvatarSeed: userProfile.avatarSeed || 'Me',
            userAvatar: currentUser.photoURL || null,
            animeId: firstAnime.mal_id,
            animeTitle: firstAnime.title,
            animeImage: firstAnime.image_url,
            actionType: 'added_to_custom_list',
            listName: title,
            createdAt: serverTimestamp()
          });
        }
      } catch (actErr) {
        console.warn('Could not log list creation activity:', actErr);
      }

      addToast('Liste oluşturuldu!', 'success');
      onSuccess();
      onClose();
      setTitle('');
      setDescription('');
      setSelectedAnimes([]);
    } catch (err) {
      console.error(err);
      addToast('Bir hata oluştu.', 'error');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/60 backdrop-blur-sm"
           onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white border-4 border-black p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col neo-shadow"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-black">
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">YENİ LİSTE</h2>
            <button onClick={onClose} className="text-black hover:text-rose-600 transition-colors">
              <X size={32} strokeWidth={3} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-black font-black uppercase tracking-widest text-sm mb-2">LİSTE BAŞLIĞI</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Örn: En İyi 10 Isekai Macerası..."
                  className="w-full bg-neutral-100 border-4 border-black px-4 py-3 text-black font-black placeholder-neutral-400 focus:outline-none focus:border-rose-500 transition-colors uppercase"
                />
              </div>
              <div>
                <label className="block text-black font-black uppercase tracking-widest text-sm mb-2">AÇIKLAMA (OPSİYONEL)</label>
                <textarea
                  maxLength={200}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Bu listeyi neden yaptığını kısaca anlat..."
                  className="w-full bg-neutral-100 border-4 border-black px-4 py-3 text-black font-bold placeholder-neutral-400 focus:outline-none focus:border-rose-500 transition-colors min-h-[80px]"
                />
              </div>
            </div>

            <div className="border-t-4 border-black pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                  <label className="block text-black font-black uppercase tracking-widest text-sm">ANİMELERİ SEÇ ({selectedAnimes.length}/20)</label>
                  <span className="text-xs font-bold text-neutral-500 uppercase">{searchQuery ? 'Arama Sonuçları' : 'Kişisel Listenden'}</span>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    placeholder="Anime Ara..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-neutral-100 border-4 border-black pl-10 pr-4 py-2 text-black font-bold focus:outline-none focus:border-rose-500 uppercase text-sm"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                {selectedAnimes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedAnimes.map(anime => (
                      <span key={anime.mal_id} className="bg-black text-white px-2 py-1 text-xs font-black uppercase flex items-center gap-1">
                        {anime.title}
                        <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => handleToggleAnime({mal_id: anime.mal_id})} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isSearching ? (
                <div className="p-6 bg-neutral-100 border-4 border-black text-center">
                  <p className="font-black uppercase text-neutral-500">ARANIYOR...</p>
                </div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div className="p-6 bg-neutral-100 border-4 border-black text-center">
                  <p className="font-black uppercase text-neutral-500">SONUÇ BULUNAMADI.</p>
                </div>
              ) : !searchQuery && watchlist.length === 0 ? (
                <div className="p-6 bg-neutral-100 border-4 border-black text-center flex flex-col gap-2">
                  <p className="font-black uppercase text-neutral-500">LİSTEN BOŞ.</p>
                  <p className="text-xs font-bold uppercase text-neutral-400">YUKARIDAN ANİME ARAYABİLİRSİN.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {(searchQuery ? searchResults : watchlist.map(w => w.anime)).map((anime) => {
                    const isSelected = selectedAnimes.some(a => a.mal_id === anime.mal_id);
                    return (
                      <div 
                        key={anime.mal_id}
                        onClick={() => handleToggleAnime(anime)}
                        className={`relative aspect-[3/4] cursor-pointer group border-4 transition-all ${isSelected ? 'border-rose-500 scale-95' : 'border-transparent hover:border-black'}`}
                      >
                        <img src={getSafeImageUrl(anime.images?.jpg?.image_url || anime.image_url)} alt="cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {isSelected ? <Trash2 size={32} className="text-rose-500" /> : <Plus size={32} className="text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </form>

          <div className="mt-6 pt-4 border-t-4 border-black flex justify-end">
            <button
               disabled={loading || selectedAnimes.length < 3}
               onClick={handleSubmit}
               className="bg-black text-white border-4 border-black font-black px-8 py-4 uppercase tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed neo-shadow-white"
            >
               {loading ? 'KAYDEDİLİYOR...' : 'LİSTEYİ YAYINLA'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
