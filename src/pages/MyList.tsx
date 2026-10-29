import React, { useState } from 'react';
import { useAppStore } from '../context/AppStore';
import { WatchStatus, Anime, UserNamedList } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Trash2, 
  Clock, 
  CheckCircle, 
  PlaySquare, 
  XCircle, 
  LayoutGrid, 
  List as ListIcon, 
  Plus, 
  FileUp, 
  Grid3X3,
  BookmarkPlus,
  FolderPlus,
  Edit3,
  Check,
  FolderHeart,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { cn, getSafeImageUrl, handleImageError } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useToastStore } from '../store/useToastStore';
import { useNavigate } from 'react-router-dom';
import { ImportExportModal } from '../components/ImportExportModal';
import { MyListStatusDonutChart } from '../components/MyListStatusDonutChart';
import { CreateNamedListModal } from '../components/CreateNamedListModal';
import { ManageAnimeListsModal } from '../components/ManageAnimeListsModal';

export const MyList = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { 
    watchlist, 
    updateWatchlistItem, 
    removeFromWatchlist, 
    incrementEpisode,
    userNamedLists,
    deleteUserNamedList,
    toggleAnimeInNamedList
  } = useAppStore();
  const { addToast } = useToastStore();

  // Filter Mode: 'status' (Watching/Completed/etc) or 'custom' (Favorites/Seasonal/etc)
  const [filterMode, setFilterMode] = useState<'status' | 'custom'>('status');
  const [activeTab, setActiveTab] = useState<WatchStatus>('watching');
  const [selectedCustomListId, setSelectedCustomListId] = useState<string>('favorites');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateNamedModalOpen, setIsCreateNamedModalOpen] = useState(false);
  const [editingNamedList, setEditingNamedList] = useState<UserNamedList | null>(null);
  const [managingAnime, setManagingAnime] = useState<Anime | null>(null);

  const tabs: { id: WatchStatus; labelKey: string; icon: React.FC<any>; color: string }[] = [
    { id: 'watching', labelKey: 'watching', icon: PlaySquare, color: 'text-black' },
    { id: 'plan_to_watch', labelKey: 'plan_to_watch', icon: Clock, color: 'text-black' },
    { id: 'completed', labelKey: 'completed', icon: CheckCircle, color: 'text-black' },
    { id: 'dropped', labelKey: 'dropped', icon: XCircle, color: 'text-black' },
  ];

  // Active custom list object
  const activeCustomList = userNamedLists.find(l => l.id === selectedCustomListId) || userNamedLists[0];

  // Filtered anime list based on current filterMode
  const filteredList = filterMode === 'status'
    ? watchlist.filter(item => item.status === activeTab)
    : watchlist.filter(item => activeCustomList?.animeIds?.includes(item.anime.mal_id));

  const handleStatusChange = (mal_id: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateWatchlistItem(mal_id, { status: e.target.value as WatchStatus });
  };

  const handleScoreChange = (mal_id: number, score: number) => {
    updateWatchlistItem(mal_id, { userScore: score });
  };

  const handleDeleteCustomList = (listId: string, listName: string) => {
    if (window.confirm(`"${listName}" özel listesini silmek istediğinden emin misin? (Animeler izleme listenden silinmez)`)) {
      deleteUserNamedList(listId);
      addToast(`"${listName}" listesi silindi.`, 'info');
      if (selectedCustomListId === listId) {
        setSelectedCustomListId(userNamedLists.find(l => l.id !== listId)?.id || 'favorites');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">{t('my_list')}</h1>
          <p className="text-white bg-black border-4 border-black inline-block px-4 py-2 font-black uppercase tracking-widest text-sm neo-shadow-white">{t('track_shows')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setEditingNamedList(null);
              setIsCreateNamedModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-rose-600 text-white hover:bg-rose-500 font-black text-xs uppercase tracking-wider border-4 border-black neo-shadow-white transition-colors cursor-pointer"
          >
            <FolderPlus size={16} strokeWidth={2.5} />
            <span>+ YENİ ÖZEL LİSTE</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white text-black hover:bg-amber-400 font-black text-xs uppercase tracking-wider border-4 border-black neo-shadow-white transition-colors cursor-pointer"
          >
            <FileUp size={16} strokeWidth={2.5} />
            <span>MAL / AniList İçe Aktar</span>
          </button>
          
          <button
            onClick={() => navigate('/grid-maker')}
            className="flex items-center gap-2 px-4 py-3 bg-black text-white hover:bg-rose-600 font-black text-xs uppercase tracking-wider border-4 border-white neo-shadow-white transition-colors cursor-pointer"
          >
            <Grid3X3 size={16} strokeWidth={2.5} />
            <span>3x3 Grid Yap</span>
          </button>
        </div>
      </div>

      {/* Recharts Watchlist Status Donut Chart Visualization */}
      <MyListStatusDonutChart
        watchlist={watchlist}
        activeTab={activeTab}
        onSelectStatus={(status) => {
          setFilterMode('status');
          setActiveTab(status);
        }}
      />

      {/* Category Mode Switcher (Status Tabs vs Custom Lists) */}
      <div className="bg-neutral-900 border-4 border-black p-3 neo-shadow-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-400 mr-2 flex items-center gap-1.5">
            <SlidersHorizontal size={14} /> GÖRÜNÜM:
          </span>

          <button
            onClick={() => setFilterMode('status')}
            className={`px-4 py-2 border-2 font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
              filterMode === 'status'
                ? 'bg-white text-black border-white neo-shadow-white'
                : 'bg-black text-neutral-400 border-neutral-700 hover:border-white hover:text-white'
            }`}
          >
            📋 İZLEME DURUMU ({watchlist.length})
          </button>

          <button
            onClick={() => setFilterMode('custom')}
            className={`px-4 py-2 border-2 font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'custom'
                ? 'bg-amber-400 text-black border-white neo-shadow-white'
                : 'bg-black text-neutral-400 border-neutral-700 hover:border-amber-400 hover:text-white'
            }`}
          >
            <FolderHeart size={14} /> ÖZEL LİSTELERİM ({userNamedLists.length})
          </button>
        </div>

        {/* View Mode (Grid / List) */}
        <div className="hidden md:flex items-center gap-2 bg-white border-2 border-black p-1 neo-shadow">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("p-1.5 transition-colors border-2 border-transparent", viewMode === 'grid' ? "bg-black text-white border-black" : "text-black hover:bg-black/10")}
            title="Grid Görünümü"
          >
            <LayoutGrid size={20} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("p-1.5 transition-colors border-2 border-transparent", viewMode === 'list' ? "bg-black text-white border-black" : "text-black hover:bg-black/10")}
            title="Liste Görünümü"
          >
            <ListIcon size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* FILTER BAR SECTION */}
      {filterMode === 'status' ? (
        /* Status Tabs */
        <div className="flex overflow-x-auto hide-scrollbar gap-4 border-b-4 border-black pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 font-black text-sm uppercase tracking-widest transition-all border-4 border-black cursor-pointer",
                activeTab === tab.id 
                  ? "bg-black text-white neo-shadow-white" 
                  : "bg-white text-black neo-shadow hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0"
              )}
            >
              <tab.icon size={20} strokeWidth={2.5} className={activeTab === tab.id ? 'text-white' : 'text-black'} />
              {t(tab.labelKey)}
              <span className={cn(
                "ml-2 text-xs px-2 py-1 border-2",
                activeTab === tab.id ? "bg-white text-black border-white" : "bg-black text-white border-black"
              )}>
                {watchlist.filter(i => i.status === tab.id).length}
              </span>
            </button>
          ))}
        </div>
      ) : (
        /* Custom Named Lists Bar */
        <div className="space-y-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {userNamedLists.map((list) => {
              const isSelected = activeCustomList?.id === list.id;
              const count = watchlist.filter(item => list.animeIds?.includes(item.anime.mal_id)).length;
              return (
                <button
                  key={list.id}
                  onClick={() => setSelectedCustomListId(list.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 border-4 font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white border-white neo-shadow-white scale-105'
                      : 'bg-white text-black border-black neo-shadow hover:translate-y-[-2px]'
                  }`}
                >
                  <span className="text-lg">{list.emoji || '📁'}</span>
                  <span>{list.name}</span>
                  <span className={`text-xs px-2 py-0.5 border-2 ${
                    isSelected ? 'bg-amber-400 text-black border-white font-extrabold' : 'bg-black text-white border-black'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => {
                setEditingNamedList(null);
                setIsCreateNamedModalOpen(true);
              }}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-neutral-900 border-4 border-dashed border-white/50 text-white font-black text-xs uppercase tracking-wider hover:border-amber-400 hover:text-amber-400 transition-colors"
            >
              <Plus size={16} strokeWidth={3} />
              YENİ LİSTE EKLE
            </button>
          </div>

          {/* Active Custom List Info Header */}
          {activeCustomList && (
            <div className="bg-black border-4 border-white/30 p-4 md:p-6 neo-shadow-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div 
                  className="w-14 h-14 border-4 border-black flex items-center justify-center text-3xl neo-shadow"
                  style={{ backgroundColor: activeCustomList.color || '#eab308' }}
                >
                  {activeCustomList.emoji || '📁'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                      {activeCustomList.name}
                    </h3>
                    {activeCustomList.isDefault && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-800 text-neutral-300 border border-white/30">
                        VARSAYILAN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 font-bold uppercase mt-1">
                    {activeCustomList.description || 'Bu liste için açıklama bulunmamaktadır.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingNamedList(activeCustomList);
                    setIsCreateNamedModalOpen(true);
                  }}
                  className="px-3 py-2 bg-white text-black font-black uppercase text-xs border-2 border-black hover:bg-amber-400 transition-colors flex items-center gap-1.5 neo-shadow"
                >
                  <Edit3 size={14} /> DÜZENLE
                </button>

                {!activeCustomList.isDefault && (
                  <button
                    onClick={() => handleDeleteCustomList(activeCustomList.id, activeCustomList.name)}
                    className="px-3 py-2 bg-rose-600 text-white font-black uppercase text-xs border-2 border-black hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> SİL
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ANIME CARDS / EMPTY STATE */}
      {filteredList.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center bg-white border-4 border-black neo-shadow">
          <div className="w-20 h-20 border-4 border-black bg-black flex items-center justify-center mb-6 neo-shadow-white">
            <ListIcon size={32} className="text-white" strokeWidth={3} />
          </div>
          <h3 className="text-3xl font-black text-black uppercase tracking-tighter">
            {filterMode === 'status' ? t('looks_empty') : `"${activeCustomList?.name}" LİSTEN HENÜZ BOŞ`}
          </h3>
          <p className="text-black font-bold uppercase tracking-widest mt-4 max-w-md">
            {filterMode === 'status' 
              ? t('add_from_discover') 
              : 'İzleme listendeki kartların altındaki "+ LİSTEYE EKLE" butonunu kullanarak bu özel listeye dilediğin animeleri ekleyebilirsin.'}
          </p>

          <button
            onClick={() => navigate('/discover')}
            className="mt-6 px-8 py-3 bg-black text-white font-black uppercase text-xs tracking-widest border-4 border-black hover:bg-rose-600 transition-colors neo-shadow-white"
          >
            KEŞFET'E GİT VE ANİME BUL
          </button>
        </div>
      ) : (
        <motion.div 
          layout
          className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
          )}
        >
          <AnimatePresence>
            {filteredList.map((item) => {
              // Find which named lists this anime belongs to
              const assignedLists = userNamedLists.filter(l => l.animeIds?.includes(item.anime.mal_id));

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.anime.mal_id}
                  className={cn(
                    "bg-white border-4 border-black overflow-hidden hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0 transition-all group neo-shadow",
                    viewMode === 'list' ? "flex h-44" : "flex flex-col"
                  )}
                >
                  <div className={cn("relative shrink-0 border-black", viewMode === 'list' ? "w-32 h-full border-r-4" : "w-full aspect-[3/4] border-b-4")}>
                    <img 
                      src={getSafeImageUrl(item.anime.images?.webp?.large_image_url || item.anime.images?.jpg?.image_url)} 
                      alt={item.anime.title} 
                      className="w-full h-full object-cover transition-all" 
                      referrerPolicy="no-referrer" 
                      onError={handleImageError}
                    />
                    
                    {/* Status badge on cover */}
                    <span className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase border border-white neo-shadow-white">
                      {item.status}
                    </span>
                  </div>
                  
                  <div className={cn("flex-1 p-4 flex flex-col justify-between bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white", viewMode === 'grid' && "p-4")}>
                    <div>
                      <h4 className="font-black text-black text-base line-clamp-1 uppercase tracking-tight" title={item.anime.title_english || item.anime.title}>
                        {item.anime.title_english || item.anime.title}
                      </h4>
                      
                      {viewMode === 'list' && (
                        <p className="text-xs font-bold text-black/70 mt-1 line-clamp-2 uppercase tracking-wide leading-relaxed">{item.anime.synopsis}</p>
                      )}

                      {/* Custom Lists Badges on the Card */}
                      <div className="flex flex-wrap items-center gap-1 mt-2">
                        {assignedLists.map(l => (
                          <span
                            key={l.id}
                            className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-black text-white border border-black flex items-center gap-1 neo-shadow-white"
                          >
                            <span>{l.emoji || '📁'}</span>
                            <span className="truncate max-w-[80px]">{l.name}</span>
                          </span>
                        ))}

                        <button
                          onClick={() => setManagingAnime(item.anime)}
                          className="text-[9px] font-black uppercase px-2 py-0.5 bg-neutral-100 hover:bg-amber-400 text-black border border-black flex items-center gap-1 transition-colors cursor-pointer"
                          title="Özel Listelere Ekle / Çıkar"
                        >
                          <BookmarkPlus size={10} strokeWidth={3} />
                          {assignedLists.length === 0 ? '+ Listeye Ekle' : 'Yönet'}
                        </button>
                      </div>

                      {/* Episode Progress & Quick +1 */}
                      <div className="mt-2.5 bg-neutral-100 border-2 border-black p-2">
                        <div className="flex items-center justify-between text-xs font-black uppercase mb-1">
                          <span className="text-black">
                            BÖLÜM: <span className="text-rose-600">{item.episodesWatched || 0}</span> / {item.anime.episodes || '?'}
                          </span>
                          <button
                            onClick={async () => {
                              const res = await incrementEpisode(item.anime.mal_id);
                              if (res.completed) {
                                addToast(`🎉 Tebrikler! "${res.title}" tamamlandı!`, 'success');
                              } else {
                                addToast(`+1 Bölüm (${res.newEp}) izlendi!`, 'info');
                              }
                            }}
                            className="flex items-center gap-1 bg-black text-white hover:bg-rose-600 px-2 py-0.5 text-[10px] font-black border border-black transition-colors"
                          >
                            <Plus size={12} strokeWidth={3} /> +1 EP
                          </button>
                        </div>
                        <div className="w-full bg-neutral-300 h-1.5 border border-black overflow-hidden">
                          <div 
                            className="bg-rose-600 h-full transition-all"
                            style={{
                              width: `${item.anime.episodes ? Math.min(100, Math.round(((item.episodesWatched || 0) / item.anime.episodes) * 100)) : Math.min(100, (item.episodesWatched || 0) * 8)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/10 pt-2">
                      {/* Rating Stars */}
                      <div className="flex bg-black border border-black p-0.5 neo-shadow-white shrink-0">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onClick={() => handleScoreChange(item.anime.mal_id, star * 2)}
                            className={cn(
                              "px-0.5 py-0.5 hover:scale-125 transition-transform",
                              item.userScore >= star * 2 ? "text-amber-400" : "text-white/30"
                            )}
                          >
                            <Star size={14} fill={item.userScore >= star * 2 ? "currentColor" : "none"} strokeWidth={2.5} />
                          </button>
                        ))}
                      </div>

                      {/* Status Selector */}
                      <select 
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.anime.mal_id, e)}
                        className="bg-white border-2 border-black text-[11px] py-1 px-1.5 text-black font-black uppercase tracking-wider focus:outline-none max-w-[110px] shrink-0 hover:bg-black hover:text-white transition-colors"
                      >
                        <option value="watching">{t('watching')}</option>
                        <option value="plan_to_watch">{t('plan_to_watch')}</option>
                        <option value="completed">{t('completed')}</option>
                        <option value="dropped">{t('dropped')}</option>
                      </select>

                      {/* If viewing a custom list, allow quick unassign from this specific custom list */}
                      {filterMode === 'custom' && activeCustomList && (
                        <button
                          onClick={() => {
                            toggleAnimeInNamedList(activeCustomList.id, item.anime.mal_id);
                            addToast(`"${item.anime.title_english || item.anime.title}" ${activeCustomList.name} listesinden çıkarıldı.`, 'info');
                          }}
                          className="text-neutral-500 hover:text-white hover:bg-black border border-black p-1 text-[10px] font-black uppercase"
                          title={`${activeCustomList.name} listesinden çıkar`}
                        >
                          Kaldır
                        </button>
                      )}

                      {/* Delete from Watchlist */}
                      <button 
                        onClick={() => removeFromWatchlist(item.anime.mal_id)}
                        className="text-black hover:text-white hover:bg-rose-500 border border-transparent hover:border-black transition-all p-1.5 bg-neutral-100"
                        title="İzleme Listesinden Tamamen Sil"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* MODALS */}
      <ImportExportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />

      <CreateNamedListModal
        isOpen={isCreateNamedModalOpen}
        onClose={() => setIsCreateNamedModalOpen(false)}
        editingList={editingNamedList}
      />

      <ManageAnimeListsModal
        isOpen={!!managingAnime}
        onClose={() => setManagingAnime(null)}
        anime={managingAnime}
        onOpenCreateNewList={() => {
          setEditingNamedList(null);
          setIsCreateNamedModalOpen(true);
        }}
      />
    </div>
  );
};

export default MyList;
