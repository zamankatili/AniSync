import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Loader2,
  Sparkles,
  Clock,
  Trash2,
  ArrowRight,
  Star,
  Filter,
  BookOpen,
  BookText,
  Tv2,
  Gamepad2,
} from 'lucide-react';
import { cn, getSafeImageUrl, handleImageError } from '../lib/utils';
import { searchMedia } from '../lib/api/unified';
import { pickTitle, type MediaKind, type UnifiedMedia } from '../types/unified';
import { useAppTranslation } from '../hooks/useAppTranslation';

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

/** Arama yapılan türler (oyun kaynağı FAZ 2'de eklenecek). */
const SEARCH_KINDS: MediaKind[] = ['anime', 'manga', 'light_novel', 'novel', 'game'];
const GROUP_ORDER: MediaKind[] = ['anime', 'manga', 'light_novel', 'novel', 'game'];

const KIND_META: Record<
  MediaKind,
  { labelKey: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; accent: string }
> = {
  anime: { labelKey: 'type_anime', icon: Tv2, accent: 'text-rose-400' },
  manga: { labelKey: 'type_manga', icon: BookOpen, accent: 'text-cyan-400' },
  light_novel: { labelKey: 'type_light_novel', icon: BookText, accent: 'text-amber-400' },
  novel: { labelKey: 'type_novel', icon: BookText, accent: 'text-emerald-400' },
  game: { labelKey: 'type_game', icon: Gamepad2, accent: 'text-violet-400' },
};

const matchesAnimeFormat = (media: UnifiedMedia, filter: string): boolean => {
  const format = (media.format || '').toUpperCase();
  if (filter === 'tv') return format === 'TV' || format === 'TV_SHORT';
  if (filter === 'movie') return format === 'MOVIE';
  if (filter === 'ova') return format === 'OVA' || format === 'SPECIAL';
  return true;
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useAppTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all'); // all, tv, movie, ova
  const [history, setHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [results, setResults] = useState<UnifiedMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      console.warn('Failed to load search history');
    }
  }, []);

  // Sync with URL search params when modal opens
  useEffect(() => {
    if (isOpen) {
      const urlQuery = searchParams.get('q');
      if (urlQuery && !query) setQuery(urlQuery);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced unified search (anime + manga + light novel + novel)
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    abortRef.current?.abort();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setSearchError(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setSearchError(false);

    const timer = setTimeout(async () => {
      try {
        const groups = await searchMedia({
          query: trimmed,
          kinds: SEARCH_KINDS,
          perPage: 5,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setResults(groups.flatMap((group) => group.items));
        if (location.pathname === '/discover') {
          setSearchParams({ q: trimmed }, { replace: true });
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setSearchError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen, location.pathname, setSearchParams]);

  // Modal kapanınca bekleyen isteği iptal et
  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, formatFilter]);

  const groups = useMemo(() => {
    return GROUP_ORDER.map((kind) => ({
      kind,
      items: results.filter(
        (item) => item.kind === kind && (kind !== 'anime' || matchesAnimeFormat(item, formatFilter))
      ),
    })).filter((group) => group.items.length > 0);
  }, [results, formatFilter]);

  const flatResults = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    flatResults.forEach((item, index) => map.set(item.id, index));
    return map;
  }, [flatResults]);

  const saveSearchQuery = (q: string) => {
    if (!q) return;
    const updated = [q, ...history.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 8);
    setHistory(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  };

  const openResult = (media: UnifiedMedia) => {
    if (query.trim()) saveSearchQuery(query.trim());
    onClose();
    // Birleşik detay sayfası tüm türleri (anime, manga, light novel, roman) karşılar.
    navigate(`/media/${encodeURIComponent(media.id)}`);
  };

  const runSearch = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (flatResults.length === 0) {
      if (e.key === 'Enter' && query.trim()) saveSearchQuery(query.trim());
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatResults.length) {
        openResult(flatResults[selectedIndex]);
      } else if (flatResults.length > 0) {
        openResult(flatResults[0]);
      } else if (query.trim()) {
        saveSearchQuery(query.trim());
      }
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
  };

  if (!isOpen) return null;

  const showEmptyState = query.trim().length < 2 || (flatResults.length === 0 && !loading);

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
              onChange={(e) => runSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search_everything_placeholder')}
              className="w-full min-w-0 bg-transparent text-white font-black text-sm md:text-lg uppercase tracking-wide placeholder:text-neutral-600 focus:outline-none"
            />

            {loading && <Loader2 size={22} className="animate-spin text-rose-500 shrink-0" />}

            {query && !loading && (
              <button
                onClick={() => runSearch('')}
                aria-label={t('clear')}
                className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            )}

            <button
              onClick={onClose}
              className="hidden sm:block p-2 border-2 border-white/20 hover:border-white hover:bg-rose-600 transition-colors text-xs font-black uppercase neo-shadow-white shrink-0"
            >
              ESC
            </button>
          </div>

          {/* Format Filter Bar & Keyboard Hints */}
          <div className="px-4 py-2.5 bg-neutral-900 border-b-2 border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-neutral-400" />
              <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-black">Format:</span>
              {[
                { id: 'all', label: 'HEPSİ' },
                { id: 'tv', label: 'TV' },
                { id: 'movie', label: 'FİLM' },
                { id: 'ova', label: 'OVA' },
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
                <span className="px-1 bg-neutral-800 border border-neutral-700 text-white">↑↓</span> {t('search_select')}
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1 bg-neutral-800 border border-neutral-700 text-white">↵</span> {t('search_go')}
              </span>
            </div>
          </div>

          {/* Results / Suggestions Container */}
          <div className="p-4 max-h-[60vh] md:max-h-[65dvh] overflow-y-auto space-y-4">
            {query.trim().length > 1 && flatResults.length > 0 ? (
              <div className="space-y-6">
                <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider flex justify-between gap-2">
                  <span>
                    {t('search_results')} ({flatResults.length})
                  </span>
                  <span className="hidden sm:inline">{t('click_for_details')}</span>
                </div>

                {groups.map((group) => {
                  const KindIcon = KIND_META[group.kind].icon;
                  return (
                    <div key={group.kind} className="space-y-2">
                      <h3 className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${KIND_META[group.kind].accent}`}>
                        <KindIcon size={14} strokeWidth={3} />
                        {t(KIND_META[group.kind].labelKey)}
                        <span className="text-neutral-500">({group.items.length})</span>
                      </h3>

                      {group.items.map((item) => {
                        const idx = indexById.get(item.id) ?? -1;
                        const isSelected = selectedIndex === idx;
                        const title = pickTitle(item.title, i18n.language);

                        return (
                          <div
                            key={item.id}
                            onClick={() => openResult(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`p-3 border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                              isSelected
                                ? 'bg-rose-950/40 border-rose-500 neo-shadow'
                                : 'border-white/10 hover:border-white/30 bg-neutral-950'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={getSafeImageUrl(item.cover?.medium || item.cover?.small)}
                                alt={title}
                                className={cn(
                                  'object-cover border border-white/20 shrink-0',
                                  item.kind === 'game' ? 'w-16 h-10' : 'w-12 h-16'
                                )}
                                referrerPolicy="no-referrer"
                                onError={handleImageError}
                              />

                              <div className="min-w-0">
                                <h4 className="font-black text-sm uppercase text-white truncate">{title}</h4>

                                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400 font-bold flex-wrap">
                                  {item.averageScore ? (
                                    <span className="flex items-center gap-1 text-amber-400 font-black">
                                      <Star size={12} fill="currentColor" /> {(item.averageScore / 10).toFixed(1)}
                                    </span>
                                  ) : null}
                                  {item.format ? (
                                    <span className="bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300 font-black uppercase border border-neutral-700">
                                      {item.format}
                                    </span>
                                  ) : null}
                                  {item.seasonYear ? <span>{item.seasonYear}</span> : null}
                                  {item.kind === 'anime' && item.episodes ? (
                                    <span>{item.episodes} {t('episodes')}</span>
                                  ) : null}
                                  {item.kind !== 'anime' && item.chapters ? (
                                    <span>{item.chapters} {t('chapters')}</span>
                                  ) : null}
                                  {item.kind !== 'anime' && item.volumes ? (
                                    <span>{item.volumes} {t('volumes')}</span>
                                  ) : null}
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
                  );
                })}
              </div>
            ) : showEmptyState ? (
              <div className="space-y-6">
                {query.trim().length > 1 && !loading ? (
                  <div className="py-8 text-center text-neutral-500 font-bold uppercase tracking-wider">
                    {searchError ? t('try_again_later') : `"${query.trim()}" — ${t('search_no_match')}`}
                  </div>
                ) : null}

                {/* Search History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                        <Clock size={14} className="text-rose-500" /> {t('recent_searches')}
                      </span>
                      <button
                        onClick={handleClearHistory}
                        className="text-[10px] font-black uppercase text-neutral-500 hover:text-rose-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> {t('clear')}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {history.map((item, index) => (
                        <button
                          key={`${item}-${index}`}
                          onClick={() => runSearch(item)}
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
                    <Sparkles size={14} className="text-amber-400" /> {t('popular_series')}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => runSearch(tag)}
                        className="px-3 py-2 bg-black border-2 border-white/20 hover:border-white hover:bg-rose-600 hover:text-white text-white text-xs font-black uppercase tracking-wider neo-shadow transition-all cursor-pointer"
                      >
                        🔥 {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-rose-500" />
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-neutral-950 border-t-2 border-white/10 flex justify-between items-center gap-3 text-[10px] text-neutral-500 uppercase font-black">
            <span className="truncate">{t('global_search')}</span>
            <span className="flex items-center gap-1 text-neutral-400 shrink-0">
              {t('shortcut')}: <span className="bg-neutral-800 border border-neutral-700 px-1 text-white">Ctrl + K</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
