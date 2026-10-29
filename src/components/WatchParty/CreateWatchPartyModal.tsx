import React, { useState } from 'react';
import { 
  X, Video, Sparkles, Youtube, Lock, Globe, Plus, AlertCircle 
} from 'lucide-react';
import { WatchPartyRoomData, extractYouTubeId } from '../../data/watchPartySeed';
import { useWatchPartyStore } from '../../store/useWatchPartyStore';
import { cn } from '../../lib/utils';

interface CreateWatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { uid: string; displayName?: string | null; photoURL?: string | null };
  onRoomCreated: (roomId: string) => void;
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
  onRoomCreated
}) => {
  const { createRoom } = useWatchPartyStore();

  const [title, setTitle] = useState('');
  const [animeTitle, setAnimeTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [animeImage, setAnimeImage] = useState('');
  const [category, setCategory] = useState<'fragman' | 'sezon-ozel' | 'amv' | 'bolum-tartisma'>('fragman');
  const [isLocked, setIsLocked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      setErrorMsg('Lütfen oda başlığı ve geçerli bir video URL girin.');
      return;
    }

    const yId = extractYouTubeId(videoUrl);
    if (!yId) {
      setErrorMsg('Geçerli bir YouTube bağlantısı girin.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const createdId = await createRoom({
        title: title.trim(),
        animeTitle: animeTitle.trim() || 'Anime Özel Gösterimi',
        animeImage: animeImage.trim() || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop',
        videoUrl: videoUrl.trim(),
        category,
        isLocked,
        isPrivate
      }, currentUser);

      onClose();
      onRoomCreated(createdId);
    } catch (err) {
      console.error(err);
      setErrorMsg('Oda oluşturulurken bir hata meydana geldi.');
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
              YENİ BİRLİKTE İZLEME ODASI OLUŞTUR (HOST OL)
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
              HIZLI POPÜLER ŞABLON SEÇ:
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
              Oda Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Demon Slayer Sonsuzluk Kalesi Fragman İncelemesi"
              className="w-full px-3 py-2 border-2 border-black font-bold text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Anime Name & Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                Anime Adı
              </label>
              <input
                type="text"
                value={animeTitle}
                onChange={(e) => setAnimeTitle(e.target.value)}
                placeholder="Örn: Kimetsu no Yaiba"
                className="w-full px-3 py-2 border-2 border-black font-bold text-xs bg-neutral-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                Kapak Görseli URL
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
              <span>YouTube Video Bağlantısı *</span>
              <span className="text-[10px] text-neutral-500 font-bold">Resmi trailer veya klip</span>
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
              Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'fragman', label: 'FRAGMAN' },
                { id: 'sezon-ozel', label: 'SEZON ÖZEL' },
                { id: 'amv', label: 'AMV / KLİP' },
                { id: 'bolum-tartisma', label: 'BÖLÜM ANALİZİ' }
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
                <span className="font-black text-xs uppercase text-black">Oynatıcıyı Kilitle</span>
              </div>
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-neutral-600 font-bold">
              Etkinleştirilirse videoyu sadece siz (Host) oynatıp durdurabilir veya sarabilirsiniz.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black font-black text-xs uppercase bg-white hover:bg-neutral-100 cursor-pointer"
            >
              İPTAL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 border-2 border-black font-black text-xs uppercase text-black transition-transform active:translate-y-0.5 cursor-pointer shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{isSubmitting ? "OLUŞTURULUYOR..." : "ODAYI AÇ VE BAŞLA"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
