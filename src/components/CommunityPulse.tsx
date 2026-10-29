import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { 
  Activity, Tv, Star, Layers, MessageSquare, Plus, Filter, 
  Sparkles, Heart, Share2, Check, Search, X, Film, CheckCircle2,
  TrendingUp, Award, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl, formatRelativeTime } from '../lib/utils';
import { FeedPost } from './FeedPost';
import { ForumPost } from '../types';
import { useAppTranslation } from '../hooks/useAppTranslation';

type PulseCategory = 'all' | 'watch_status' | 'review' | 'collection' | 'discussion';

export const CommunityPulse: React.FC = () => {
  const { t } = useAppTranslation();
  const { 
    forumPosts, 
    addForumPost, 
    watchlist, 
    userNamedLists, 
    userProfile, 
    currentUser 
  } = useAppStore();
  const { addToast } = useToastStore();

  const [activeCategory, setActiveCategory] = useState<PulseCategory>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<'watch_status' | 'review' | 'collection' | 'discussion'>('discussion');

  // Form State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number>(9);
  const [episodeNum, setEpisodeNum] = useState<number>(1);
  const [selectedListId, setSelectedListId] = useState<string>('');

  // Search anime helper for forms
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return watchlist.map(w => w.anime).slice(0, 5);
    return watchlist
      .map(w => w.anime)
      .filter(a => (a.title_english || a.title).toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [watchlist, searchQuery]);

  // Filtered Pulse Posts
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') return forumPosts;
    return forumPosts.filter(p => {
      if (activeCategory === 'watch_status') return p.type === 'watch_status' || p.category === 'WatchStatus';
      if (activeCategory === 'review') return p.type === 'review' || p.type === 'recommendation' || p.category === 'Recommendations';
      if (activeCategory === 'collection') return p.type === 'list_share' || p.category === 'Lists';
      if (activeCategory === 'discussion') return p.type === 'discussion' || p.category === 'Discussion';
      return true;
    });
  }, [forumPosts, activeCategory]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      addToast('Lütfen bir açıklama veya düşünce giriniz.', 'error');
      return;
    }

    const selectedAnime = watchlist.find(w => w.anime.mal_id === selectedAnimeId)?.anime;

    if (createType === 'watch_status') {
      addForumPost({
        title: selectedAnime ? `${selectedAnime.title_english || selectedAnime.title} - Bölüm ${episodeNum} İzlendi` : 'İzleme Güncellemesi',
        content: postContent,
        likes: 0,
        replies: 0,
        category: 'WatchStatus',
        type: 'watch_status',
        animeRef: selectedAnime ? {
          id: selectedAnime.mal_id,
          title: selectedAnime.title_english || selectedAnime.title,
          image: selectedAnime.images.webp.image_url,
          score: selectedAnime.score
        } : undefined
      });
      addToast('İzleme durumunuz topluluk akışında paylaşıldı!', 'success');
    } else if (createType === 'review') {
      addForumPost({
        title: selectedAnime ? `${selectedAnime.title_english || selectedAnime.title} İncelemesi (${userScore}/10 ⭐)` : 'Anime İncelemesi',
        content: postContent,
        likes: 0,
        replies: 0,
        category: 'Recommendations',
        type: 'recommendation',
        animeRef: selectedAnime ? {
          id: selectedAnime.mal_id,
          title: selectedAnime.title_english || selectedAnime.title,
          image: selectedAnime.images.webp.image_url,
          score: userScore
        } : undefined
      });
      addToast('İncelemeniz başarıyla paylaşıldı!', 'success');
    } else if (createType === 'collection') {
      const chosenList = userNamedLists.find(l => l.id === selectedListId) || userNamedLists[0];
      const listAnimes = watchlist
        .filter(w => chosenList?.animeIds?.includes(w.anime.mal_id))
        .map(w => ({
          id: w.anime.mal_id,
          title: w.anime.title_english || w.anime.title,
          image: w.anime.images.webp.image_url
        }));

      addForumPost({
        title: `Koleksiyon Güncellemesi: ${chosenList?.name || 'Özel Listem'}`,
        content: postContent,
        likes: 0,
        replies: 0,
        category: 'Lists',
        type: 'list_share',
        listRef: {
          listName: chosenList?.name || 'Özel Listem',
          animes: listAnimes.length > 0 ? listAnimes : watchlist.slice(0, 3).map(w => ({
            id: w.anime.mal_id,
            title: w.anime.title_english || w.anime.title,
            image: w.anime.images.webp.image_url
          }))
        }
      });
      addToast('Koleksiyonunuz topluluğa sunuldu!', 'success');
    } else {
      addForumPost({
        title: postTitle || 'Topluluk Paylaşımı',
        content: postContent,
        likes: 0,
        replies: 0,
        category: 'Discussion',
        type: 'discussion'
      });
      addToast('Gönderiniz paylaşıldı!', 'success');
    }

    // Reset Form
    setPostTitle('');
    setPostContent('');
    setSelectedAnimeId(null);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Community Pulse Header & Action Bar */}
      <div className="bg-black border-4 border-white neo-shadow p-5 text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 border border-white uppercase tracking-wider flex items-center gap-1">
                <Activity size={12} className="animate-pulse" /> COMMUNITY PULSE
              </span>
              <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase">
                CANLI TOPLULUK AKIŞI
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              OTAKU TOPLULUK NABZI
            </h2>
            <p className="text-xs text-neutral-400 font-bold uppercase mt-1 max-w-xl leading-relaxed">
              İzlediğin son bölümü paylaş, favori serilerine yıldızlı incelemeler yaz veya oluşturduğun koleksiyon kartlarını yayınla!
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer neo-shadow-white shrink-0"
          >
            <Plus size={18} strokeWidth={3} />
            <span>AKISA GÖNDERİ PAYLAŞ</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'TÜM AKIŞ', icon: Activity, count: forumPosts.length },
          { id: 'watch_status', label: 'İZLEME DURUMU', icon: Tv },
          { id: 'review', label: 'İNCELERMELER', icon: Star },
          { id: 'collection', label: 'KOLEKSİYONLAR', icon: Layers },
          { id: 'discussion', label: 'TARTIŞMALAR', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as PulseCategory)}
              className={cn(
                "px-4 py-2.5 font-black text-xs uppercase tracking-wider border-2 border-white flex items-center gap-2 transition-all shrink-0 cursor-pointer",
                isActive
                  ? "bg-white text-black neo-shadow-white"
                  : "bg-black text-neutral-300 hover:text-white hover:bg-neutral-900"
              )}
            >
              <Icon size={14} strokeWidth={2.5} className={isActive ? "text-rose-600" : "text-amber-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feed Stream */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <FeedPost key={post.id} post={post} index={index} />
          ))
        ) : (
          <div className="bg-black border-2 border-white/20 p-12 text-center neo-shadow">
            <Activity size={48} className="mx-auto mb-3 text-neutral-600" />
            <h3 className="font-black text-xl uppercase text-white mb-2">Bu Kategoride Henüz Paylaşım Yok</h3>
            <p className="text-xs text-neutral-400 font-bold uppercase mb-6">
              İlk güncellemeyi paylaşarak topluluk nabzını sen başlat!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase neo-shadow cursor-pointer"
            >
              Şimdi Paylaşım Yap
            </button>
          </div>
        )}
      </div>

      {/* Create Pulse Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-black border-4 border-white neo-shadow-white p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 border border-white/20 hover:border-white cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="font-black text-xl uppercase text-white tracking-tight">
                  TOPLULUK AKIŞINA PAYLAŞIM YAP
                </h3>
              </div>

              {/* Type Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {[
                  { id: 'watch_status', label: 'İZLEME DURUMU', icon: Tv },
                  { id: 'review', label: 'İNCELEME', icon: Star },
                  { id: 'collection', label: 'KOLEKSİYON', icon: Layers },
                  { id: 'discussion', label: 'TARTIŞMA', icon: MessageSquare }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = createType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setCreateType(type.id as any)}
                      className={cn(
                        "p-2.5 border-2 font-black text-[10px] uppercase flex flex-col items-center gap-1.5 transition-all cursor-pointer",
                        isSelected
                          ? "bg-rose-600 border-white text-white neo-shadow"
                          : "bg-neutral-900 border-white/30 text-neutral-400 hover:border-white hover:text-white"
                      )}
                    >
                      <Icon size={16} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Watch Status Specific Inputs */}
                {createType === 'watch_status' && (
                  <div className="space-y-3 bg-neutral-900 p-4 border-2 border-white/20">
                    <label className="font-black text-xs uppercase text-amber-400 block">
                      Hangi Animeyi İzliyorsun?
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Listenizdeki animelerde ara..."
                      className="w-full px-3 py-2 bg-black border border-white/30 font-bold text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                      {searchResults.map((anime) => (
                        <div
                          key={anime.mal_id}
                          onClick={() => setSelectedAnimeId(anime.mal_id)}
                          className={cn(
                            "p-2 border cursor-pointer flex items-center gap-2 transition-all",
                            selectedAnimeId === anime.mal_id
                              ? "bg-rose-600 border-white text-white font-black"
                              : "bg-black border-white/20 text-neutral-300 hover:border-white"
                          )}
                        >
                          <img src={getSafeImageUrl(anime.images.webp.image_url)} alt={anime.title} className="w-8 h-10 object-cover border border-white" />
                          <span className="text-xs truncate uppercase font-bold">{anime.title_english || anime.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <span className="font-black text-xs uppercase text-white">Kaçıncı Bölüm?</span>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={episodeNum}
                        onChange={(e) => setEpisodeNum(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-1.5 bg-black border border-white/30 font-mono font-black text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Review Specific Inputs */}
                {createType === 'review' && (
                  <div className="space-y-3 bg-neutral-900 p-4 border-2 border-white/20">
                    <label className="font-black text-xs uppercase text-amber-400 block">
                      İnceleyeceğin Animeyi Seç
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Anime ara..."
                      className="w-full px-3 py-2 bg-black border border-white/30 font-bold text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {searchResults.map((anime) => (
                        <div
                          key={anime.mal_id}
                          onClick={() => setSelectedAnimeId(anime.mal_id)}
                          className={cn(
                            "p-2 border cursor-pointer flex items-center gap-2 transition-all",
                            selectedAnimeId === anime.mal_id
                              ? "bg-rose-600 border-white text-white font-black"
                              : "bg-black border-white/20 text-neutral-300 hover:border-white"
                          )}
                        >
                          <img src={getSafeImageUrl(anime.images.webp.image_url)} alt={anime.title} className="w-8 h-10 object-cover border border-white" />
                          <span className="text-xs truncate uppercase font-bold">{anime.title_english || anime.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="font-black text-xs uppercase text-white block mb-1">
                        Puanın ({userScore}/10 ⭐)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={userScore}
                        onChange={(e) => setUserScore(parseFloat(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* Collection Specific Inputs */}
                {createType === 'collection' && (
                  <div className="space-y-3 bg-neutral-900 p-4 border-2 border-white/20">
                    <label className="font-black text-xs uppercase text-amber-400 block">
                      Paylaşılacak Liste Seç
                    </label>
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full p-2.5 bg-black border border-white/30 text-white font-bold text-xs uppercase focus:outline-none"
                    >
                      <option value="">-- Listelerimden Seç --</option>
                      {userNamedLists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.emoji || '📁'} {list.name} ({list.animeIds?.length || 0} Anime)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Discussion Title */}
                {createType === 'discussion' && (
                  <div>
                    <label className="font-black text-xs uppercase text-white block mb-1">
                      Başlık (İsteğe Bağlı)
                    </label>
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Konu başlığı..."
                      className="w-full p-3 bg-neutral-900 border-2 border-white/30 text-white font-black text-sm uppercase focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                {/* Main Content Area */}
                <div>
                  <label className="font-black text-xs uppercase text-white block mb-1">
                    {createType === 'watch_status' ? 'Bu bölüm hakkında ne düşünüyorsun?' :
                     createType === 'review' ? 'Detaylı İnceleme & Eleştirin' :
                     createType === 'collection' ? 'Koleksiyonun hakkında bir not yaz' : 'Düşüncelerini Paylaş'}
                  </label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Akıştaki arkadaşlarınla düşüncelerini paylaş..."
                    rows={4}
                    className="w-full p-3 bg-neutral-900 border-2 border-white/30 text-white font-bold text-sm uppercase focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase border border-white/30 cursor-pointer"
                  >
                    İPTAL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase border-2 border-black neo-shadow cursor-pointer"
                  >
                    GÖNDERİ YAYINLA
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
