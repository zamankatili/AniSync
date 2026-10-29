import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Sparkles, Clock, Trash2, ArrowRight, Star, Filter, Command, CornerDownLeft } from 'lucide-react';
import { useAnimeData } from '../hooks/useAnimeData';
import { getSafeImageUrl, handleImageError } from '../lib/utils';
import { Anime } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCH_TAGS = [
  'Attack on Titan',
  'Jujutsu Kaisen',
  'Demon Slayer',
  'Solo Leveling',
  'One Piece',
  'Death Note',
  'Naruto',
  'Bleach',
];

const LOCAL_STORAGE_HISTORY_KEY = 'anisync_search_history_v1';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all'); // all, tv, movie, ova
  const [history, setHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const { searchAnime, data: searchResults, loading } = useAnimeData();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load search history');
    }
  }, []);

  // Sync with URL search params when modal opens or query changes
  useEffect(() => {
    if (isOpen) {
      const urlQuery = searchParams.get('q');
      if (urlQuery && !query) {
        setQuery(urlQuery);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search trigger
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    const timer = setTimeout(() => {
      if (trimmed.length > 1) {
        searchAnime(trimmed);
        // Update URL query params synchronously for deep-linking & indexability
        if (location.pathname === '/discover') {
          setSearchParams({ q: trimmed }, { replace: true });
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, isOpen, searchAnime, location.pathname, setSearchParams]);

  // Handle keyboard navigation inside search modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults || searchResults.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        saveSearchQuery(query.trim());
      }
      return;
    }

    const filtered = getFilteredResults();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filtered.length) {
        const selected = filtered[selectedIndex];
        handleSelectAnime(selected.mal_id);
      } else if (filtered.length > 0) {
        handleSelectAnime(filtered[0].mal_id);
      } else if (query.trim()) {
        saveSearchQuery(query.trim());
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const saveSearchQuery = (q: string) => {
    if (!q) return;
    const updated = [q, ...history.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 8);
    setHistory(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      // Ignore storage error
    }
  };

  const handleSelectAnime = (malId: number) => {
    if (query.trim()) saveSearchQuery(query.trim());
    onClose();
    navigate(`/anime/${malId}`);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
  };

  const getFilteredResults = (): Anime[] => {
    if (!searchResults) return [];
    if (formatFilter === 'all') return searchResults;
    return searchResults.filter((anime) => {
      const type = (anime.type || '').toLowerCase();
      if (formatFilter === 'tv') return type.includes('tv');
      if (formatFilter === 'movie') return type.includes('movie');
      if (formatFilter === 'ova') return type.includes('ova') || type.includes('special');
      return true;
    });
  };

  if (!isOpen) return null;

  const filteredResults = getFilteredResults();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-12 md:pt-20 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-3xl bg-black border-4 border-white neo-shadow-white flex flex-col overflow-hidden text-white"
        >
          {/* Top Search Input Section */}
          <div className="p-4 border-b-4 border-white bg-black flex items-center gap-3 relative">
            <Search size={24} className="text-rose-500 shrink-0 font-black" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Anime başlığı, karakter veya açıklama ara... (Örn: Jujutsu Kaisen)"
              className="w-full bg-transparent text-white font-black text-base md:text-lg uppercase tracking-wide placeholder:text-neutral-600 focus:outline-none"
            />

            {loading && <Loader2 size={22} className="animate-spin text-rose-500 shrink-0" />}

            {query && !loading && (
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(-1);
                }}
                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 border-2 border-white/20 hover:border-white hover:bg-rose-600 transition-colors text-xs font-black uppercase neo-shadow-white"
            >
              ESC
            </button>
          </div>

          {/* Format Filter Bar & Keyboard Hints */}
          <div className="px-4 py-2.5 bg-neutral-900 border-b-2 border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-neutral-400" />
              <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-black">Format:</span>
              {[
                { id: 'all', label: 'HEPSİ' },
                { id: 'tv', label: 'TV SERİLERİ' },
                { id: 'movie', label: 'FİLMLER' },
                { id: 'ova', label: 'OVA / ÖZEL' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormatFilter(f.id)}
                  className={`px-2.5 py-1 border transition-all text-[11px] font-black uppercase ${
                    formatFilter === f.id
                      ? 'bg-rose-600 border-white text-white neo-shadow'
                      : 'border-white/20 text-neutral-400 hover:text-white hover:border-white/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-3 text-[10px] text-neutral-400 uppercase tracking-widest font-black">
              <span className="flex items-center gap-1">
                <span className="px-1 bg-neutral-800 border border-neutral-700 text-white">↑↓</span> Seç
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1 bg-neutral-800 border border-neutral-700 text-white">↵</span> Git
              </span>
            </div>
          </div>

          {/* Results / Suggestions Container */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
            {/* Case 1: Active query and results */}
            {query.trim().length > 1 ? (
              filteredResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-2 flex justify-between">
                    <span>Arama Sonuçları ({filteredResults.length})</span>
                    <span>Sayfa Detayına Gitmek İçin Tıklayın</span>
                  </div>

                  {filteredResults.map((anime, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={anime.mal_id}
                        onClick={() => handleSelectAnime(anime.mal_id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-3 border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-rose-950/40 border-rose-500 neo-shadow'
                            : 'border-white/10 hover:border-white/30 bg-neutral-950'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={getSafeImageUrl(anime.images?.webp?.image_url)}
                            alt={anime.title}
                            className="w-12 h-16 object-cover border border-white/20 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                          />

                          <div className="min-w-0">
                            <h4 className="font-black text-sm uppercase text-white truncate group-hover:text-rose-400">
                              {anime.title_english || anime.title}
                            </h4>

                            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400 font-bold flex-wrap">
                              {anime.score && (
                                <span className="flex items-center gap-1 text-amber-400 font-black">
                                  <Star size={12} fill="currentColor" /> {anime.score}
                                </span>
                              )}
                              {anime.type && (
                                <span className="bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300 font-black uppercase border border-neutral-700">
                                  {anime.type}
                                </span>
                              )}
                              {anime.year && <span>{anime.year}</span>}
                              {anime.episodes && <span>{anime.episodes} Bölüm</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`p-2 border transition-colors ${
                              isSelected ? 'bg-rose-600 border-white text-white' : 'border-white/20 text-neutral-400'
                            }`}
                          >
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : !loading ? (
                <div className="py-12 text-center text-neutral-500 font-bold uppercase tracking-wider">
                  "{query}" ile eşleşen anime bulunamadı. Lütfen kelimeyi kontrol edin.
                </div>
              ) : null
            ) : (
              /* Case 2: Empty query - Show Recent History & Popular Tags */
              <div className="space-y-6">
                {/* Search History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                        <Clock size={14} className="text-rose-500" /> Son Aramalarınız
                      </span>
                      <button
                        onClick={handleClearHistory}
                        className="text-[10px] font-black uppercase text-neutral-500 hover:text-rose-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Temizle
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {history.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(item);
                            searchAnime(item);
                          }}
                          className="px-3 py-1.5 bg-neutral-900 border border-white/20 hover:border-rose-500 hover:text-rose-400 text-neutral-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Clock size={12} className="text-neutral-500" />
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Tags */}
                <div>
                  <span className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Sparkles size={14} className="text-amber-400" /> Öne Çıkan Popüler Seriler
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                          searchAnime(tag);
                        }}
                        className="px-3 py-2 bg-black border-2 border-white/20 hover:border-white hover:bg-rose-600 hover:text-white text-white text-xs font-black uppercase tracking-wider neo-shadow transition-all cursor-pointer"
                      >
                        🔥 {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-neutral-950 border-t-2 border-white/10 flex justify-between items-center text-[10px] text-neutral-500 uppercase font-black">
            <span>AniSync Global İndekslenebilir Arama Motoru</span>
            <span className="flex items-center gap-1 text-neutral-400">
              Kısayol: <span className="bg-neutral-800 border border-neutral-700 px-1 text-white">Ctrl + K</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
