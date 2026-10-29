import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useAnimeData } from '../hooks/useAnimeData';
import { 
  Grid3X3, Download, Share2, Sparkles, RefreshCw, Plus, 
  Trash2, Search, Check, Copy, ExternalLink, Image as ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { Anime } from '../types';
import { EXTENDED_RANDOM_CATALOG, FALLBACK_LISTS } from '../data/fallbackLists';
import { useNavigate } from 'react-router-dom';

interface GridSlot {
  index: number;
  anime: {
    mal_id: number;
    title: string;
    image_url: string;
    score?: number | null;
  } | null;
}

const DEFAULT_POPULAR_ANIME = [
  { mal_id: 52991, title: 'Sousou no Frieren', image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp', score: 9.38 },
  { mal_id: 5114, title: 'Fullmetal Alchemist: Brotherhood', image_url: 'https://cdn.myanimelist.net/images/anime/1223/96541l.webp', score: 9.10 },
  { mal_id: 9253, title: 'Steins;Gate', image_url: 'https://cdn.myanimelist.net/images/anime/1935/127974l.webp', score: 9.07 },
  { mal_id: 11061, title: 'Hunter x Hunter (2011)', image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013l.webp', score: 9.04 },
  { mal_id: 1535, title: 'Death Note', image_url: 'https://cdn.myanimelist.net/images/anime/9/9453l.webp', score: 8.62 },
  { mal_id: 16498, title: 'Shingeki no Kyojin (Attack on Titan)', image_url: 'https://cdn.myanimelist.net/images/anime/10/47347l.webp', score: 8.55 },
  { mal_id: 21, title: 'One Piece', image_url: 'https://cdn.myanimelist.net/images/anime/6/73245l.webp', score: 8.73 },
  { mal_id: 20, title: 'Naruto', image_url: 'https://cdn.myanimelist.net/images/anime/13/17405l.webp', score: 8.03 },
  { mal_id: 269, title: 'Bleach', image_url: 'https://cdn.myanimelist.net/images/anime/3/40451l.webp', score: 7.92 },
  { mal_id: 38000, title: 'Kimetsu no Yaiba (Demon Slayer)', image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889l.webp', score: 8.50 },
  { mal_id: 40748, title: 'Jujutsu Kaisen', image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222l.webp', score: 8.60 },
  { mal_id: 52299, title: 'Solo Leveling', image_url: 'https://cdn.myanimelist.net/images/anime/1816/138334l.webp', score: 8.51 },
  { mal_id: 53887, title: 'Mashle: Magic and Muscles', image_url: 'https://cdn.myanimelist.net/images/anime/1922/136087l.webp', score: 7.78 },
  { mal_id: 54492, title: 'Kusuriya no Hitorigoto (Apothecary Diaries)', image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033l.webp', score: 8.78 },
  { mal_id: 51179, title: 'Dandadan', image_url: 'https://cdn.myanimelist.net/images/anime/1103/144183l.webp', score: 8.65 },
  { mal_id: 48583, title: 'Shingeki no Kyojin The Final Season', image_url: 'https://cdn.myanimelist.net/images/anime/1279/111295l.webp', score: 9.05 },
  { mal_id: 30276, title: 'One Punch Man', image_url: 'https://cdn.myanimelist.net/images/anime/12/76049l.webp', score: 8.51 },
  { mal_id: 32182, title: 'Mob Psycho 100', image_url: 'https://cdn.myanimelist.net/images/anime/8/80403l.webp', score: 8.49 },
  { mal_id: 25777, title: 'Shigatsu wa Kimi no Uso (Your Lie in April)', image_url: 'https://cdn.myanimelist.net/images/anime/3/67177l.webp', score: 8.65 },
  { mal_id: 199, title: 'Sen to Chihiro no Kamikakushi (Spirited Away)', image_url: 'https://cdn.myanimelist.net/images/anime/10/75815l.webp', score: 8.78 },
  { mal_id: 32281, title: 'Kimi no Na wa (Your Name)', image_url: 'https://cdn.myanimelist.net/images/anime/5/87048l.webp', score: 8.85 },
  { mal_id: 31964, title: 'Boku no Hero Academia', image_url: 'https://cdn.myanimelist.net/images/anime/10/78745l.webp', score: 7.85 },
  { mal_id: 22359, title: 'Tokyo Ghoul', image_url: 'https://cdn.myanimelist.net/images/anime/5/64449l.webp', score: 7.80 },
  { mal_id: 33486, title: 'Boku dake ga Inai Machi (ERASED)', image_url: 'https://cdn.myanimelist.net/images/anime/10/77955l.webp', score: 8.28 },
  { mal_id: 37430, title: 'Tensei shitara Slime Datta Ken', image_url: 'https://cdn.myanimelist.net/images/anime/1897/115161l.webp', score: 8.12 },
  { mal_id: 41457, title: '86 (Eighty Six)', image_url: 'https://cdn.myanimelist.net/images/anime/1987/117557l.webp', score: 8.28 },
  { mal_id: 52880, title: 'Vinland Saga Season 2', image_url: 'https://cdn.myanimelist.net/images/anime/1170/124312l.webp', score: 8.82 },
  { mal_id: 35760, title: 'Shingeki no Kyojin Season 3 Part 2', image_url: 'https://cdn.myanimelist.net/images/anime/1517/100633l.webp', score: 9.10 },
  { mal_id: 43608, title: 'Kaguya-sama wa Kokurasetai?', image_url: 'https://cdn.myanimelist.net/images/anime/1160/106312l.webp', score: 8.65 },
  { mal_id: 31240, title: 'Re:Zero kara Hajimeru Isekai Seikatsu', image_url: 'https://cdn.myanimelist.net/images/anime/1508/134442l.webp', score: 8.25 },
];

const ALL_LOCAL_ANIME_POOL = [
  ...DEFAULT_POPULAR_ANIME,
  ...EXTENDED_RANDOM_CATALOG.map(a => ({
    mal_id: a.mal_id,
    title: a.title_english || a.title,
    image_url: a.images?.webp?.large_image_url || a.images?.webp?.image_url || '',
    score: a.score
  })),
  ...Object.values(FALLBACK_LISTS).flat().map(a => ({
    mal_id: a.mal_id,
    title: a.title_english || a.title,
    image_url: a.images?.webp?.large_image_url || a.images?.webp?.image_url || '',
    score: a.score
  }))
];

const THEMES = [
  { id: 'crimson', name: 'Neo Crimson', bg: '#000000', border: '#e11d48', accent: '#e11d48', text: '#ffffff' },
  { id: 'amber', name: 'Cyber Amber', bg: '#0a0a0a', border: '#f59e0b', accent: '#f59e0b', text: '#ffffff' },
  { id: 'mono', name: 'Brutalist Stark', bg: '#000000', border: '#ffffff', accent: '#ffffff', text: '#ffffff' },
  { id: 'cyan', name: 'Retro Neon', bg: '#050b14', border: '#06b6d4', accent: '#06b6d4', text: '#ffffff' },
];

export const AnimeGridMaker: React.FC = () => {
  const { watchlist, userProfile, currentUser, addForumPost } = useAppStore();
  const { addToast } = useToastStore();
  const { searchAnime, data: searchResults, loading: searchLoading } = useAnimeData();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<GridSlot[]>(() => {
    return Array.from({ length: 9 }, (_, i) => ({ index: i, anime: null }));
  });

  const [title, setTitle] = useState('BENİM 3x3 ANİME BAŞYAPITLARIM');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [showTitlesOnCards, setShowTitlesOnCards] = useState(true);

  // Modal selector state
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [pickerTab, setPickerTab] = useState<'watchlist' | 'search' | 'popular'>('watchlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto fill from user's watchlist or defaults
  const handleAutoFill = () => {
    const filled: GridSlot[] = Array.from({ length: 9 }, (_, i) => ({ index: i, anime: null }));
    
    // Sort watchlist by userScore or score
    const candidates = [...watchlist]
      .sort((a, b) => (b.userScore || b.anime.score || 0) - (a.userScore || a.anime.score || 0))
      .map(w => ({
        mal_id: w.anime.mal_id,
        title: w.anime.title_english || w.anime.title,
        image_url: w.anime.images.webp?.large_image_url || w.anime.images.webp?.image_url || '',
        score: w.userScore || w.anime.score
      }));

    for (let i = 0; i < 9; i++) {
      if (candidates[i]) {
        filled[i].anime = candidates[i];
      } else if (DEFAULT_POPULAR_ANIME[i]) {
        filled[i].anime = DEFAULT_POPULAR_ANIME[i];
      }
    }

    setSlots(filled);
    addToast('3x3 Izgarası en yüksek puanlı animelerle dolduruldu!', 'success');
  };

  const handleClearAll = () => {
    setSlots(Array.from({ length: 9 }, (_, i) => ({ index: i, anime: null })));
    addToast('Tüm hücreler temizlendi', 'info');
  };

  const handleSelectAnimeForSlot = (animeData: { mal_id: number; title: string; image_url: string; score?: number | null }) => {
    if (activeSlotIndex === null) return;
    setSlots(prev => prev.map(s => s.index === activeSlotIndex ? { ...s, anime: animeData } : s));
    setActiveSlotIndex(null);
  };

  const handleRemoveSlot = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSlots(prev => prev.map(s => s.index === index ? { ...s, anime: null } : s));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 1) {
      searchAnime(searchQuery.trim());
    }
  };

  // Debounce search query effect (400ms)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    const timer = setTimeout(() => {
      searchAnime(q);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchAnime]);

  const combinedSearchResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const remote = searchResults || [];
    
    const remoteMapped = remote.map(r => ({
      mal_id: r.mal_id,
      title: r.title_english || r.title,
      image_url: r.images?.webp?.large_image_url || r.images?.webp?.image_url || '',
      score: r.score
    }));

    if (!query) {
      return DEFAULT_POPULAR_ANIME;
    }

    const localMatches = ALL_LOCAL_ANIME_POOL.filter(a => 
      a.title && a.title.toLowerCase().includes(query)
    );

    const map = new Map();
    [...remoteMapped, ...localMatches].forEach(item => {
      map.set(item.mal_id, item);
    });
    return Array.from(map.values());
  }, [searchQuery, searchResults]);

  // Canvas Image Rendering and Download
  const generateCanvasImage = async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, size, size);

    // Outer Neo-Brutalist Frame
    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, size - 16, size - 16);

    // Header Area
    ctx.fillStyle = selectedTheme.accent;
    ctx.fillRect(24, 24, size - 48, 120);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, size - 48, 120);

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), size / 2, 75);

    // Subtitle / User Tag
    ctx.font = '700 22px sans-serif';
    ctx.fillStyle = '#fef08a';
    const handle = userProfile.handle ? `@${userProfile.handle}` : `@${userProfile.name.toLowerCase()}`;
    ctx.fillText(`${handle} • ANISYNC 3X3 SEÇKİSİ`, size / 2, 115);

    // Load all images
    const startX = 40;
    const startY = 170;
    const gridGap = 20;
    const cellSize = (size - 80 - (gridGap * 2)) / 3; // ~286px

    const loadImg = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          // If CORS fails, create placeholder image
          const fallback = new Image();
          resolve(fallback);
        };
        img.src = url;
      });
    };

    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (cellSize + gridGap);
      const y = startY + row * (cellSize + gridGap);

      const slot = slots[i];

      // Cell border & shadow
      ctx.fillStyle = '#171717';
      ctx.fillRect(x, y, cellSize, cellSize);

      if (slot.anime && slot.anime.image_url) {
        try {
          const img = await loadImg(slot.anime.image_url);
          if (img.width > 0) {
            // Draw image cropped to square
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, x, y, cellSize, cellSize);
          }
        } catch {
          // continue
        }

        // Overlay gradient at bottom of cell for title readability
        if (showTitlesOnCards) {
          const grad = ctx.createLinearGradient(x, y + cellSize - 70, x, y + cellSize);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,0.95)');
          ctx.fillStyle = grad;
          ctx.fillRect(x, y + cellSize - 70, cellSize, 70);

          ctx.fillStyle = '#ffffff';
          ctx.font = '800 16px sans-serif';
          ctx.textAlign = 'center';
          const truncated = slot.anime.title.length > 24 ? slot.anime.title.substring(0, 22) + '...' : slot.anime.title;
          ctx.fillText(truncated.toUpperCase(), x + cellSize / 2, y + cellSize - 16);
        }
      } else {
        // Empty slot placeholder
        ctx.fillStyle = '#262626';
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.fillStyle = '#525252';
        ctx.font = '900 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', x + cellSize / 2, y + cellSize / 2 + 16);
      }

      // Cell stroke
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }

    // Footer Watermark
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '800 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OLUŞTURULDU: ANISYNC (NEO-BRUTALIST ANIME TRACKER)', size / 2, size - 25);

    return canvas.toDataURL('image/png');
  };

  const handleDownloadPNG = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateCanvasImage();
      if (!dataUrl) {
        addToast('Görsel oluşturulamadı', 'error');
        return;
      }

      const link = document.createElement('a');
      link.download = `anisync-3x3-${userProfile.handle || 'otaku'}.png`;
      link.href = dataUrl;
      link.click();
      addToast('🎉 3x3 Anime Kartı PNG olarak başarıyla indirildi!', 'success');
    } catch (err) {
      console.error(err);
      addToast('İndirme sırasında hata oluştu', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToFeed = () => {
    const validAnimes = slots.filter(s => s.anime !== null).map(s => s.anime!);
    if (validAnimes.length < 3) {
      addToast('Toplulukta paylaşmak için en az 3 anime eklemelisin!', 'info');
      return;
    }

    addForumPost({
      title: title || 'Benim 3x3 Anime Başyapıtlarım 🏆',
      content: `${userProfile.name} 3x3 anime seçkisini paylaştı! Sizin favorileriniz hangileri?`,
      likes: 0,
      replies: 0,
      category: 'Lists',
      type: 'list_share',
      listRef: {
        listName: title,
        animes: validAnimes.map(a => ({
          id: a.mal_id,
          title: a.title,
          image: a.image_url
        }))
      }
    });

    addToast('🎉 3x3 Kartın Topluluk Akışında Paylaşıldı!', 'success');
    navigate('/');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`İşte benim 3x3 Anime Başyapıtlarım! 🎌🔥\nSenin favorilerin hangileri?\n\n#AniSync #Anime3x3 #AnimeCommunity`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-white/20 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 border-2 border-white bg-amber-400 text-black flex items-center justify-center font-black neo-shadow-white">
              <Grid3X3 size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
              3X3 ANİME KARTI ÜRETİCİSİ
            </h1>
          </div>
          <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">
            En sevdiğin 9 animeyi seç, Neo-Brutalist şık bir kart oluştur ve sosyal medyada paylaş
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAutoFill}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-amber-400 font-black text-xs uppercase tracking-wider border-2 border-white neo-shadow-white transition-colors cursor-pointer"
          >
            <Sparkles size={14} strokeWidth={3} />
            <span>Otomatik Doldur</span>
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 py-2.5 bg-neutral-900 text-white hover:bg-rose-600 font-black text-xs uppercase tracking-wider border-2 border-white/40 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3x3 Interactive Grid Visual */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div 
            className="w-full max-w-[500px] aspect-square p-5 border-4 neo-shadow-white transition-all flex flex-col justify-between"
            style={{ 
              backgroundColor: selectedTheme.bg, 
              borderColor: selectedTheme.border 
            }}
          >
            {/* Header Box */}
            <div 
              className="p-3 border-2 border-white mb-4 text-center neo-shadow"
              style={{ backgroundColor: selectedTheme.accent }}
            >
              <h2 className="font-black text-white text-base md:text-lg uppercase tracking-tight truncate">
                {title}
              </h2>
              <p className="text-[11px] font-black text-amber-200 uppercase tracking-widest mt-0.5">
                @{userProfile.handle || userProfile.name} • ANISYNC 3X3
              </p>
            </div>

            {/* 3x3 Slots */}
            <div className="grid grid-cols-3 gap-3 flex-1">
              {slots.map(slot => {
                const anime = slot.anime;
                return (
                  <div
                    key={slot.index}
                    onClick={() => setActiveSlotIndex(slot.index)}
                    className="relative aspect-square bg-neutral-900 border-2 border-white cursor-pointer group overflow-hidden flex flex-col items-center justify-center hover:border-amber-400 transition-colors"
                  >
                    {anime ? (
                      <>
                        <img 
                          src={getSafeImageUrl(anime.image_url)} 
                          alt={anime.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        {showTitlesOnCards && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-1.5 pt-4 text-center">
                            <p className="text-[10px] font-black text-white uppercase tracking-tight line-clamp-1">
                              {anime.title}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={(e) => handleRemoveSlot(e, slot.index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-rose-600 text-white font-black text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white"
                          title="Hücreyi Sil"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-500 group-hover:text-amber-400 transition-colors p-2 text-center">
                        <Plus size={24} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1">Ekle</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Brand */}
            <div className="mt-3 text-center">
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                ANISYNC NEO-BRUTALIST SEÇKİSİ
              </span>
            </div>
          </div>

          {/* Hidden Canvas used for high-res PNG export */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Right Column: Customization & Export Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Title Setting */}
          <div className="bg-black p-5 border-2 border-white/20 neo-shadow-white">
            <h3 className="font-black text-white text-sm uppercase tracking-wider mb-2">
              KART BAŞLIĞI
            </h3>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2024 Favorilerim"
              maxLength={40}
              className="w-full bg-neutral-900 border-2 border-white/40 text-white font-black text-sm p-3 focus:outline-none focus:border-amber-400 uppercase tracking-wide"
            />
          </div>

          {/* Theme Palette Setting */}
          <div className="bg-black p-5 border-2 border-white/20 neo-shadow-white">
            <h3 className="font-black text-white text-sm uppercase tracking-wider mb-3">
              TEMA VE RENK PALETİ
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={cn(
                    "p-3 border-2 font-black text-xs uppercase flex items-center justify-between transition-all",
                    selectedTheme.id === theme.id ? "bg-white text-black border-white neo-shadow-white" : "bg-neutral-900 text-white border-white/20 hover:border-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: theme.accent }} />
                    <span>{theme.name}</span>
                  </div>
                  {selectedTheme.id === theme.id && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showTitlesOnCards}
                onChange={(e) => setShowTitlesOnCards(e.target.checked)}
                className="w-4 h-4 accent-amber-400"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Resimlerin altında anime adlarını göster
              </span>
            </label>
          </div>

          {/* Export & Share Actions */}
          <div className="bg-black p-5 border-2 border-white/20 neo-shadow-white space-y-3">
            <h3 className="font-black text-white text-sm uppercase tracking-wider mb-2">
              DIŞA AKTAR VE PAYLAŞ
            </h3>

            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm tracking-wider border-2 border-black neo-shadow-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download size={18} strokeWidth={3} />
              <span>{isExporting ? 'Oluşturuluyor...' : '1080x1080 PNG İndir'}</span>
            </button>

            <button
              onClick={handleShareToFeed}
              className="w-full py-3 px-4 bg-white hover:bg-rose-600 hover:text-white text-black font-black uppercase text-xs tracking-wider border-2 border-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 size={16} strokeWidth={2.5} />
              <span>Topluluk Akışında Paylaş</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase text-xs tracking-wider border border-white/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>X (Twitter)'da Paylaş</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Anime Picker for Cell */}
      <AnimatePresence>
        {activeSlotIndex !== null && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black border-4 border-white neo-shadow-white w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 border-b-2 border-white flex items-center justify-between bg-neutral-900">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-400 text-black font-black text-xs flex items-center justify-center border border-black">
                    {activeSlotIndex + 1}
                  </span>
                  <h3 className="font-black text-white uppercase text-sm tracking-wider">
                    Hücre İçin Anime Seç
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSlotIndex(null)}
                  className="w-8 h-8 border border-white text-white hover:bg-rose-600 font-black text-sm flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b-2 border-white/20">
                <button
                  onClick={() => setPickerTab('watchlist')}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition-colors",
                    pickerTab === 'watchlist' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
                  )}
                >
                  Listem ({watchlist.length})
                </button>
                <button
                  onClick={() => setPickerTab('search')}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition-colors border-l-2 border-white/20",
                    pickerTab === 'search' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
                  )}
                >
                  Anime Ara
                </button>
                <button
                  onClick={() => setPickerTab('popular')}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition-colors border-l-2 border-white/20",
                    pickerTab === 'popular' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
                  )}
                >
                  Popüler
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 flex-1 overflow-y-auto max-h-[50vh] space-y-3">
                {pickerTab === 'search' && (
                  <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Örn: Steins Gate, Death Note..." 
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        if (val.trim().length >= 2) {
                          searchAnime(val.trim());
                        }
                      }}
                      className="flex-1 bg-neutral-900 border-2 border-white/40 text-white text-xs font-bold p-2.5 uppercase tracking-wider focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-amber-400 text-black font-black uppercase text-xs border-2 border-white"
                    >
                      {searchLoading ? '...' : 'Ara'}
                    </button>
                  </form>
                )}

                {pickerTab === 'watchlist' && (
                  watchlist.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-xs font-bold uppercase">
                      İzleme listende henüz anime yok. "Popüler" sekmesinden veya "Anime Ara"dan seçebilirsin.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {watchlist.map(item => (
                        <div
                          key={item.anime.mal_id}
                          onClick={() => handleSelectAnimeForSlot({
                            mal_id: item.anime.mal_id,
                            title: item.anime.title_english || item.anime.title,
                            image_url: item.anime.images?.webp?.large_image_url || item.anime.images?.webp?.image_url || '',
                            score: item.userScore || item.anime.score
                          })}
                          className="flex gap-2 p-2 bg-neutral-900 border border-white/20 hover:border-amber-400 cursor-pointer group"
                        >
                          <img 
                            src={getSafeImageUrl(item.anime.images.webp?.image_url)} 
                            alt={item.anime.title} 
                            className="w-10 h-14 object-cover border border-white/20 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-xs font-black uppercase text-white truncate group-hover:text-amber-400">
                              {item.anime.title_english || item.anime.title}
                            </h4>
                            <span className="text-[10px] text-amber-400 font-bold mt-1">
                              ★ {item.userScore ? `${item.userScore}/10` : item.anime.score || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {pickerTab === 'search' && (
                  <div>
                    {combinedSearchResults.length === 0 ? (
                      <div className="text-center py-10 space-y-4 bg-neutral-950 border-2 border-white/20 p-6">
                        <div className="w-16 h-16 bg-neutral-900 border-2 border-white/40 mx-auto flex items-center justify-center text-amber-400">
                          <Search size={32} />
                        </div>
                        <div>
                          <h4 className="text-white font-black text-sm uppercase tracking-wider">Sonuç Bulunamadı</h4>
                          <p className="text-xs text-neutral-400 mt-1 uppercase">Aradığınız kriterlere uygun anime bulunamadı. Aşağıdaki popüler önerilere göz atabilirsiniz:</p>
                        </div>
                        <div className="pt-2 text-left">
                          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block mb-2">⭐ POPÜLER ANİME ÖNERİLERİ</span>
                          <div className="grid grid-cols-2 gap-2">
                            {DEFAULT_POPULAR_ANIME.slice(0, 6).map(anime => (
                              <div
                                key={anime.mal_id}
                                onClick={() => handleSelectAnimeForSlot(anime)}
                                className="flex gap-2 p-2 bg-neutral-900 border border-white/20 hover:border-amber-400 cursor-pointer group"
                              >
                                <img 
                                  src={getSafeImageUrl(anime.image_url)} 
                                  alt={anime.title} 
                                  className="w-8 h-12 object-cover border border-white/20 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <h5 className="text-[11px] font-black uppercase text-white truncate group-hover:text-amber-400">
                                    {anime.title}
                                  </h5>
                                  <span className="text-[9px] text-amber-400 font-bold">★ {anime.score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!searchQuery.trim() && (
                          <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-2">
                            ⭐ ÖNE ÇIKAN POPÜLER ANİMELER
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {combinedSearchResults.map(anime => (
                            <div
                              key={anime.mal_id}
                              onClick={() => handleSelectAnimeForSlot({
                                mal_id: anime.mal_id,
                                title: anime.title,
                                image_url: anime.image_url,
                                score: anime.score
                              })}
                              className="flex gap-2.5 p-2.5 bg-neutral-900 border-2 border-white/20 hover:border-amber-400 cursor-pointer group transition-all"
                            >
                              <img 
                                src={getSafeImageUrl(anime.image_url)} 
                                alt={anime.title} 
                                className="w-12 h-16 object-cover border-2 border-white/30 shrink-0 shadow"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className="text-xs font-black uppercase text-white truncate group-hover:text-amber-400">
                                  {anime.title}
                                </h4>
                                <span className="text-[10px] text-amber-400 font-bold mt-1">
                                  ★ {anime.score || 'N/A'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {pickerTab === 'popular' && (
                  <div className="grid grid-cols-2 gap-2">
                    {DEFAULT_POPULAR_ANIME.map(anime => (
                      <div
                        key={anime.mal_id}
                        onClick={() => handleSelectAnimeForSlot(anime)}
                        className="flex gap-2 p-2 bg-neutral-900 border border-white/20 hover:border-amber-400 cursor-pointer group"
                      >
                        <img 
                          src={getSafeImageUrl(anime.image_url)} 
                          alt={anime.title} 
                          className="w-10 h-14 object-cover border border-white/20 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-xs font-black uppercase text-white truncate group-hover:text-amber-400">
                            {anime.title}
                          </h4>
                          <span className="text-[10px] text-amber-400 font-bold mt-1">
                            ★ {anime.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
