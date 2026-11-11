import React, { useState } from 'react';
import { 
  X, Video, Sparkles, Youtube, Lock, Globe, Plus, AlertCircle 
} from 'lucide-react';
import { WatchPartyRoomData, extractYouTubeId } from '../../data/watchPartySeed';
import { useWatchPartyStore } from '../../store/useWatchPartyStore';
import { cn, FALLBACK_ANIME_COVER } from '../../lib/utils';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface CreateWatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { uid: string; displayName?: string | null; photoURL?: string | null };
  onRoomCreated: (roomId: string) => void;
  /** Detay sayfasından "Birlikte izle" ile gelindiğinde başlık/kapak ön doldurulur. */
  initialAnime?: { id: number; title: string; image?: string };
}

const PRESET_VIDEOS = [
  {
    title: 'Demon Slayer: Infinity Castle Fragmanı',
    animeTitle: 'Kimetsu no Yaiba: Infinity Castle',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1792/138022l.jpg',
    url: 'https://www.youtube.com/watch?v=4d_Jd2zY3jY',
    category: 'fragman' as const
  },
  {
    title: 'Attack on Titan Final Sezon Son Savaş',
    animeTitle: 'Shingeki no Kyojin',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1000/110531l.jpg',
    url: 'https://www.youtube.com/watch?v=E7WytQMFlSF',
    category: 'sezon-ozel' as const
  },
  {
    title: 'Chainsaw Man: Reze Arc Teaser',
    animeTitle: 'Chainsaw Man: Reze-hen',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
    url: 'https://www.youtube.com/watch?v=jk6jK7X3m3U',
    category: 'fragman' as const
  }
];

export const CreateWatchPartyModal: React.FC<CreateWatchPartyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRoomCreated,
  initialAnime
}) => {
  const { createRoom } = useWatchPartyStore();
  const { t } = useAppTranslation();

  const [title, setTitle] = useState('');
  const [animeTitle, setAnimeTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [animeImage, setAnimeImage] = useState('');
  const [category, setCategory] = useState<'fragman' | 'sezon-ozel' | 'amv' | 'bolum-tartisma'>('fragman');
  const [isLocked, setIsLocked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Detay sayfasından gelen anime bilgisiyle formu ön doldur.
  React.useEffect(() => {
    if (!isOpen || !initialAnime) return;
    setAnimeTitle(initialAnime.title || '');
    setAnimeImage(initialAnime.image || '');
    setTitle((prev) => prev || `${initialAnime.title} — Watch Party`);
    // initialAnime referansı her render'da değişebilir; alanlara göre bağla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialAnime?.id, initialAnime?.title, initialAnime?.image]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_VIDEOS[0]) => {
    setTitle(preset.title);
    setAnimeTitle(preset.animeTitle);
    setVideoUrl(preset.url);
    setAnimeImage(preset.animeImage);
    setCategory(preset.category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setErrorMsg(t('watch_party_modal_error_title_url'));
      return;
    }

    const yId = extractYouTubeId(videoUrl);
    if (!yId) {
      setErrorMsg(t('watch_party_modal_error_youtube'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const createdId = await createRoom({
        title: title.trim(),
        animeTitle: animeTitle.trim() || t('watch_party_modal_default_anime_title'),
        animeId: initialAnime?.id,
        animeImage: animeImage.trim() || FALLBACK_ANIME_COVER,
        videoUrl: videoUrl.trim(),
        category,
        isLocked,
        isPrivate
      }, currentUser);

      onClose();
      onRoomCreated(createdId);
    } catch (err) {
      console.error(err);
      setErrorMsg(t('watch_party_modal_error_create'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white border-4 border-black neo-shadow flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3 bg-neutral-900 text-white border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-amber-400" />
            <h3 className="font-black text-sm uppercase tracking-wider">
              {t('watch_party_modal_header')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-rose-100 border-2 border-rose-500 text-rose-800 text-xs font-black flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-500 block mb-1.5 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" />
              {t('watch_party_modal_preset_label')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_VIDEOS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2 bg-neutral-50 hover:bg-amber-100 border-2 border-black font-bold text-[10px] text-left uppercase truncate transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#000]"
                >
                  {preset.animeTitle}
                </button>
              ))}
            </div>
          </div>

          {/* Room Title */}
          <div>
            <label className="text-xs font-black uppercase text-black block mb-1">
              {t('watch_party_modal_room_title')}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('watch_party_modal_room_title_placeholder')}
              className="w-full px-3 py-2 border-2 border-black font-bold text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Anime Name & Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                {t('watch_party_modal_anime_name')}
              </label>
              <input
                type="text"
                value={animeTitle}
                onChange={(e) => setAnimeTitle(e.target.value)}
                placeholder={t('watch_party_modal_anime_name_placeholder')}
                className="w-full px-3 py-2 border-2 border-black font-bold text-xs bg-neutral-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                {t('watch_party_modal_cover_url')}
              </label>
              <input
                type="url"
                value={animeImage}
                onChange={(e) => setAnimeImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border-2 border-black font-bold text-xs bg-neutral-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="text-xs font-black uppercase text-black block mb-1 flex items-center justify-between">
              <span>{t('watch_party_modal_video_url')}</span>
              <span className="text-[10px] text-neutral-500 font-bold">
                {t('watch_party_modal_video_url_helper')}
              </span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 pl-8 border-2 border-black font-bold text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Youtube size={14} className="absolute left-2.5 top-3 text-rose-600" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-black uppercase text-black block mb-1">
              {t('watch_party_modal_category')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'fragman', label: t('watch_party_category_trailers') },
                { id: 'sezon-ozel', label: t('watch_party_category_seasonal') },
                { id: 'amv', label: t('watch_party_category_amv') },
                { id: 'bolum-tartisma', label: t('watch_party_category_episode_analysis') }
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as any)}
                  className={cn(
                    "p-2 border-2 border-black font-black text-[10px] uppercase transition-colors cursor-pointer",
                    category === cat.id
                      ? "bg-rose-500 text-white shadow-[2px_2px_0px_0px_#000]"
                      : "bg-neutral-100 text-black hover:bg-neutral-200"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Control Settings */}
          <div className="p-3 bg-neutral-100 border-2 border-black space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-neutral-700" />
                <span className="font-black text-xs uppercase text-black">
                  {t('watch_party_modal_lock_player')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-neutral-600 font-bold">
              {t('watch_party_modal_lock_desc')}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black font-black text-xs uppercase bg-white hover:bg-neutral-100 cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 border-2 border-black font-black text-xs uppercase text-black transition-transform active:translate-y-0.5 cursor-pointer shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{isSubmitting ? t('watch_party_modal_creating') : t('watch_party_modal_open_start')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
