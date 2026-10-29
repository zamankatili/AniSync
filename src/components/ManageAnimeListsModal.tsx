import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, BookmarkPlus, FolderPlus } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { Anime } from '../types';
import { getSafeImageUrl } from '../lib/utils';
import { useToastStore } from '../store/useToastStore';

interface ManageAnimeListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: Anime | null;
  onOpenCreateNewList: () => void;
}

export const ManageAnimeListsModal: React.FC<ManageAnimeListsModalProps> = ({
  isOpen,
  onClose,
  anime,
  onOpenCreateNewList
}) => {
  const { userNamedLists, toggleAnimeInNamedList } = useAppStore();
  const { addToast } = useToastStore();

  if (!isOpen || !anime) return null;

  const handleToggle = (listId: string, listName: string) => {
    toggleAnimeInNamedList(listId, anime.mal_id);
    const targetList = userNamedLists.find(l => l.id === listId);
    const willBeAdded = !targetList?.animeIds.includes(anime.mal_id);
    if (willBeAdded) {
      addToast(`"${anime.title_english || anime.title}" ${listName} listesine eklendi!`, 'success');
    } else {
      addToast(`"${anime.title_english || anime.title}" ${listName} listesinden çıkarıldı.`, 'info');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative bg-white border-4 border-black p-6 w-full max-w-md neo-shadow z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-4 border-black pb-3">
            <div className="flex items-center gap-2">
              <BookmarkPlus size={22} className="text-black" />
              <h3 className="text-xl font-black uppercase text-black tracking-tight">
                ÖZEL LİSTELERE EKLE
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 border-2 border-black hover:bg-rose-500 hover:text-white transition-colors"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Anime Header Info */}
          <div className="flex items-center gap-3 bg-neutral-100 border-2 border-black p-2.5">
            <img
              src={getSafeImageUrl(anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url)}
              alt={anime.title}
              className="w-10 h-14 object-cover border border-black"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-black text-sm uppercase truncate text-black">
                {anime.title_english || anime.title}
              </h4>
              <p className="text-[10px] font-bold text-neutral-500 uppercase">
                {anime.year || anime.status} • {anime.episodes ? `${anime.episodes} BÖLÜM` : 'SERİ'}
              </p>
            </div>
          </div>

          {/* Named Lists Checkbox Stack */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600 block mb-1">
              LİSTELERİN ({userNamedLists.length}):
            </span>

            {userNamedLists.map((list) => {
              const isInList = list.animeIds.includes(anime.mal_id);
              return (
                <div
                  key={list.id}
                  onClick={() => handleToggle(list.id, list.name)}
                  className={`flex items-center justify-between p-3 border-2 cursor-pointer transition-all ${
                    isInList
                      ? 'bg-black text-white border-black neo-shadow-white scale-[1.01]'
                      : 'bg-white text-black border-neutral-300 hover:border-black'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{list.emoji || '📁'}</span>
                    <div className="min-w-0">
                      <p className="font-black text-xs uppercase truncate leading-tight">
                        {list.name}
                      </p>
                      {list.description && (
                        <p className={`text-[10px] truncate ${isInList ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {list.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ml-2 ${
                    isInList ? 'bg-amber-400 border-white text-black' : 'border-black bg-white'
                  }`}>
                    {isInList && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create New List Shortcut */}
          <div className="border-t-2 border-black pt-3 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenCreateNewList();
              }}
              className="flex items-center gap-1.5 text-xs font-black uppercase text-rose-600 hover:text-black transition-colors"
            >
              <FolderPlus size={16} />
              + YENİ BİR ÖZEL LİSTE OLUŞTUR
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-black text-white font-black text-xs uppercase border-2 border-black hover:bg-neutral-800 transition-colors"
            >
              TAMAM
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
