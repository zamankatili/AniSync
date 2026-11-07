import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Check, Sparkles, Plus } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { UserNamedList } from '../types';
import { useToastStore } from '../store/useToastStore';
import { getSafeImageUrl } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface CreateNamedListModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingList?: UserNamedList | null;
}

const EMOJI_OPTIONS = ['⭐', '🎯', '🍂', '🔥', '🌸', '🍿', '🏆', '⚔️', '🎭', '☕', '🚀', '💎'];
const COLOR_OPTIONS = [
  { name: 'Amber', hex: '#eab308' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#a855f7' }
];

export const CreateNamedListModal: React.FC<CreateNamedListModalProps> = ({
  isOpen,
  onClose,
  editingList
}) => {
  const { watchlist, userNamedLists, createUserNamedList, updateUserNamedList } = useAppStore();
  const { addToast } = useToastStore();
  const { t } = useAppTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('⭐');
  const [selectedColor, setSelectedColor] = useState('#eab308');
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (editingList) {
      setName(editingList.name);
      setDescription(editingList.description || '');
      setSelectedEmoji(editingList.emoji || '⭐');
      setSelectedColor(editingList.color || '#eab308');
      setSelectedAnimeIds(editingList.animeIds || []);
    } else {
      setName('');
      setDescription('');
      setSelectedEmoji('⭐');
      setSelectedColor('#eab308');
      setSelectedAnimeIds([]);
    }
  }, [editingList, isOpen]);

  if (!isOpen) return null;

  const toggleAnime = (mal_id: number) => {
    setSelectedAnimeIds(prev => 
      prev.includes(mal_id) ? prev.filter(id => id !== mal_id) : [...prev, mal_id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      addToast(t('named_list_name_required'), 'error');
      return;
    }

    const isDuplicate = userNamedLists.some(
      (l) => l.name.toLowerCase() === trimmedName.toLowerCase() && l.id !== editingList?.id
    );

    if (isDuplicate) {
      addToast(t('named_list_duplicate', { name: trimmedName }), 'error');
      return;
    }

    if (editingList) {
      updateUserNamedList(editingList.id, {
        name: trimmedName,
        description: description.trim(),
        emoji: selectedEmoji,
        color: selectedColor,
        animeIds: selectedAnimeIds
      });
      addToast(t('named_list_updated', { name: trimmedName }), 'success');
    } else {
      createUserNamedList({
        name: trimmedName,
        description: description.trim(),
        emoji: selectedEmoji,
        color: selectedColor,
        animeIds: selectedAnimeIds
      });
      addToast(t('named_list_created', { name: trimmedName }), 'success');
    }

    onClose();
  };

  const filteredWatchlist = watchlist.filter(item => {
    if (!searchQuery.trim()) return true;
    const title = (item.anime.title_english || item.anime.title).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white border-4 border-black p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col neo-shadow z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-4 border-black">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 border-2 border-black flex items-center justify-center text-xl neo-shadow"
                style={{ backgroundColor: selectedColor }}
              >
                {selectedEmoji}
              </div>
              <div>
                <h2 className="text-2xl font-black text-black uppercase tracking-tight">
                  {editingList ? t('named_list_edit_title') : t('named_list_create_title')}
                </h2>
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  {t('named_list_subtitle')}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1 border-2 border-black hover:bg-rose-500 hover:text-white transition-colors"
            >
              <X size={24} strokeWidth={3} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
            {/* List Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
                {t('named_list_name_label')}
              </label>
              <input
                type="text"
                required
                maxLength={40}
                placeholder={t('named_list_name_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-100 border-4 border-black px-4 py-3 text-black font-black uppercase text-sm focus:outline-none focus:bg-amber-100 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
                {t('named_list_desc_label')}
              </label>
              <input
                type="text"
                maxLength={120}
                placeholder={t('named_list_desc_placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-neutral-100 border-2 border-black px-4 py-2 text-black font-bold text-xs uppercase focus:outline-none focus:bg-amber-100 transition-colors"
              />
            </div>

            {/* Emoji & Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-black/20 pt-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
                  {t('named_list_emoji_label')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-9 h-9 border-2 text-base flex items-center justify-center transition-all ${
                        selectedEmoji === emoji 
                          ? 'border-black bg-black text-white neo-shadow scale-110' 
                          : 'border-neutral-300 hover:border-black bg-neutral-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
                  {t('named_list_color_label')}
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setSelectedColor(col.hex)}
                      className={`w-9 h-9 border-2 flex items-center justify-center transition-all ${
                        selectedColor === col.hex 
                          ? 'border-black ring-2 ring-black scale-110' 
                          : 'border-neutral-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                    >
                      {selectedColor === col.hex && <Check size={16} strokeWidth={3} className="text-black" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Anime Selection from Watchlist */}
            <div className="border-t-4 border-black pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-black">
                    {t('named_list_anime_label', { count: selectedAnimeIds.length })}
                  </label>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    {t('named_list_anime_hint')}
                  </span>
                </div>

                <input
                  type="text"
                  placeholder={t('named_list_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-100 border-2 border-black px-3 py-1.5 text-xs font-bold text-black uppercase focus:outline-none w-full sm:w-48"
                />
              </div>

              {watchlist.length === 0 ? (
                <div className="p-4 bg-neutral-100 border-2 border-black text-center text-xs font-black uppercase text-neutral-600">
                  {t('named_list_watchlist_empty')}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 border-2 border-black bg-neutral-50">
                  {filteredWatchlist.map((item) => {
                    const isSelected = selectedAnimeIds.includes(item.anime.mal_id);
                    return (
                      <div
                        key={item.anime.mal_id}
                        onClick={() => toggleAnime(item.anime.mal_id)}
                        className={`flex items-center gap-2 p-1.5 border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-black text-white border-black neo-shadow' 
                            : 'bg-white text-black border-neutral-300 hover:border-black'
                        }`}
                      >
                        <img
                          src={getSafeImageUrl(item.anime.images.webp.image_url)}
                          alt={item.anime.title}
                          className="w-7 h-9 object-cover border border-black flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black uppercase truncate leading-tight">
                            {item.anime.title_english || item.anime.title}
                          </p>
                          <span className="text-[9px] font-bold uppercase text-neutral-400">
                            {t(item.status)}
                          </span>
                        </div>
                        <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-amber-400 border-black text-black' : 'border-neutral-400'}`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t-4 border-black">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-black font-black uppercase text-xs hover:bg-neutral-200 transition-colors"
              >
                {t('cancel_label')}
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-black text-white border-4 border-black font-black uppercase text-xs tracking-widest hover:bg-amber-400 hover:text-black transition-colors neo-shadow-white"
              >
                {editingList ? t('named_list_save_updates') : t('named_list_create_cta')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
