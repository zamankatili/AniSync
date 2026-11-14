import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Gamepad2, Heart, Plus, Star, Sparkles, Search,
  ChevronRight, X, User, Loader2, RefreshCw, Trash2, CheckCircle2,
} from 'lucide-react';
import { cn, getSafeImageUrl } from '../lib/utils';
import { useToastStore } from '../store/useToastStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { searchAniList, fetchPopularCharacters } from '../lib/api/anilist';
import type { AniListPopularCharacter } from '../lib/api/anilist';
import { searchSteam } from '../lib/api/steam';
import type { UnifiedMedia } from '../types/unified';

export interface MangaItem {
  id: string;
  title: string;
  type: 'manga' | 'light_novel' | 'web_novel';
  coverImage: string;
  currentChapter: number;
  totalChapters?: number;
  currentVolume: number;
  status: 'reading' | 'completed' | 'on_hold' | 'plan_to_read';
  score?: number;
}

export interface GameItem {
  id: string;
  title: string;
  platform: 'PC' | 'PS5' | 'Switch' | 'Xbox' | 'Mobile';
  coverImage: string;
  hoursPlayed: number;
  status: 'playing' | 'completed' | 'backlog' | 'wishlist';
  score?: number;
}

export interface FavoriteCharacter {
  id: string;
  name: string;
  animeTitle: string;
  role: 'Waifu' | 'Husbando' | 'Favorit' | 'Seiyuu (Seslendirmen)';
  image: string;
  quote?: string;
  seiyuuName?: string;
}

interface LibraryState {
  mangas: MangaItem[];
  games: GameItem[];
  characters: FavoriteCharacter[];
}

const LIBRARY_KEY = 'anisync_multimedia_library_v1';
const EMPTY_LIBRARY: LibraryState = { mangas: [], games: [], characters: [] };

function readLibrary(): LibraryState {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return EMPTY_LIBRARY;
    const parsed = JSON.parse(raw) as Partial<LibraryState>;
    return {
      mangas: Array.isArray(parsed.mangas) ? parsed.mangas : [],
      games: Array.isArray(parsed.games) ? parsed.games : [],
      characters: Array.isArray(parsed.characters) ? parsed.characters : [],
    };
  } catch {
    return EMPTY_LIBRARY;
  }
}

const toTenPointScore = (score?: number | null): number | undefined => {
  if (typeof score !== 'number' || Number.isNaN(score)) return undefined;
  return Math.round((score / 10) * 10) / 10;
};

const mediaCover = (item: UnifiedMedia): string =>
  item.cover?.large || item.cover?.medium || item.cover?.small || '';

export const MultiMediaHub: React.FC = () => {
  const { addToast } = useToastStore();
  const { t, currentLang } = useAppTranslation();
  const [activeTab, setActiveTab] = useState<'manga' | 'games' | 'characters'>('manga');

  // Kullanıcının cihazında saklanan GERÇEK kütüphane (uydurma ilerleme yok).
  const [library, setLibrary] = useState<LibraryState>(readLibrary);

  // Canlı keşif verileri
  const [mangaResults, setMangaResults] = useState<UnifiedMedia[]>([]);
  const [mangaLoading, setMangaLoading] = useState(false);
  const [mangaError, setMangaError] = useState(false);
  const [mangaQuery, setMangaQuery] = useState('');

  const [gameResults, setGameResults] = useState<UnifiedMedia[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState(false);
  const [gameQuery, setGameQuery] = useState('anime');

  const [characterResults, setCharacterResults] = useState<AniListPopularCharacter[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [charactersError, setCharactersError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    } catch {
      /* kota dolu olabilir — kütüphane oturum boyunca çalışır */
    }
  }, [library]);

  const loadManga = useCallback(async (query: string) => {
    setMangaLoading(true);
    setMangaError(false);
    try {
      const [manga, novels] = await Promise.all([
        searchAniList({ kind: 'manga', query, perPage: 6 }),
        searchAniList({ kind: 'light_novel', query, perPage: 4 }),
      ]);
      const merged = [...manga.items, ...novels.items];
      const seen = new Set<string>();
      setMangaResults(
        merged.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        }),
      );
    } catch {
      setMangaError(true);
      setMangaResults([]);
    } finally {
      setMangaLoading(false);
    }
  }, []);

  const loadGames = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setGameResults([]);
      setGamesError(false);
      return;
    }
    setGamesLoading(true);
    setGamesError(false);
    try {
      const result = await searchSteam(trimmed, 1, 6, currentLang);
      setGameResults(result.items);
    } catch {
      setGamesError(true);
      setGameResults([]);
    } finally {
      setGamesLoading(false);
    }
  }, [currentLang]);

  const loadCharacters = useCallback(async () => {
    setCharactersLoading(true);
    setCharactersError(false);
    try {
      setCharacterResults(await fetchPopularCharacters(8));
    } catch {
      setCharactersError(true);
      setCharacterResults([]);
    } finally {
      setCharactersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadManga('');
    void loadCharacters();
  }, [loadManga, loadCharacters]);

  useEffect(() => {
    void loadGames('anime');
  }, [loadGames]);

  const refreshActive = () => {
    if (activeTab === 'manga') void loadManga(mangaQuery);
    else if (activeTab === 'games') void loadGames(gameQuery);
    else void loadCharacters();
  };

  const addManga = (item: UnifiedMedia) => {
    if (library.mangas.some((entry) => entry.id === item.id)) {
      addToast(t('multimedia_already_added', { title: item.displayTitle }), 'info');
      return;
    }
    const entry: MangaItem = {
      id: item.id,
      title: item.displayTitle,
      type: item.kind === 'light_novel' ? 'light_novel' : 'manga',
      coverImage: mediaCover(item),
      currentChapter: 0,
      totalChapters: item.chapters ?? undefined,
      currentVolume: 0,
      status: 'plan_to_read',
      score: toTenPointScore(item.averageScore),
    };
    setLibrary((prev) => ({ ...prev, mangas: [entry, ...prev.mangas] }));
    addToast(t('multimedia_added', { title: entry.title }), 'success');
  };

  const addGame = (item: UnifiedMedia) => {
    if (library.games.some((entry) => entry.id === item.id)) {
      addToast(t('multimedia_already_added', { title: item.displayTitle }), 'info');
      return;
    }
    const entry: GameItem = {
      id: item.id,
      title: item.displayTitle,
      platform: 'PC',
      coverImage: mediaCover(item),
      hoursPlayed: 0,
      status: 'backlog',
      score: toTenPointScore(item.averageScore),
    };
    setLibrary((prev) => ({ ...prev, games: [entry, ...prev.games] }));
    addToast(t('multimedia_added', { title: entry.title }), 'success');
  };

  const addCharacter = (character: AniListPopularCharacter) => {
    if (library.characters.some((entry) => entry.id === character.id)) {
      addToast(t('multimedia_already_added', { title: character.name }), 'info');
      return;
    }
    const entry: FavoriteCharacter = {
      id: character.id,
      name: character.name,
      animeTitle: character.animeTitle ?? '—',
      role: 'Favorit',
      image: character.image ?? '',
    };
    setLibrary((prev) => ({ ...prev, characters: [entry, ...prev.characters] }));
    addToast(t('multimedia_added', { title: entry.name }), 'success');
  };

  const removeManga = (id: string) => {
    setLibrary((prev) => ({ ...prev, mangas: prev.mangas.filter((entry) => entry.id !== id) }));
    addToast(t('multimedia_removed'), 'info');
  };

  const removeGame = (id: string) => {
    setLibrary((prev) => ({ ...prev, games: prev.games.filter((entry) => entry.id !== id) }));
    addToast(t('multimedia_removed'), 'info');
  };

  const removeCharacter = (id: string) => {
    setLibrary((prev) => ({ ...prev, characters: prev.characters.filter((entry) => entry.id !== id) }));
    addToast(t('multimedia_removed'), 'info');
  };

  const incrementChapter = (id: string) => {
    setLibrary((prev) => ({
      ...prev,
      mangas: prev.mangas.map((entry) => {
        if (entry.id !== id) return entry;
        const next = entry.currentChapter + 1;
        addToast(`📖 ${entry.title} — ${t('multimedia_chapter_progress', { done: next, total: entry.totalChapters ?? '?' })}`, 'success');
        return { ...entry, currentChapter: next, status: 'reading' };
      }),
    }));
  };

  const incrementHour = (id: string) => {
    setLibrary((prev) => ({
      ...prev,
      games: prev.games.map((entry) => {
        if (entry.id !== id) return entry;
        const next = entry.hoursPlayed + 1;
        addToast(`🎮 ${entry.title} — ${t('multimedia_hours_played', { hours: next })}`, 'info');
        return { ...entry, hoursPlayed: next, status: 'playing' };
      }),
    }));
  };

  const tabs = [
    { id: 'manga' as const, label: t('multimedia_tab_manga'), icon: BookOpen, count: library.mangas.length },
    { id: 'games' as const, label: t('multimedia_tab_games'), icon: Gamepad2, count: library.games.length },
    { id: 'characters' as const, label: t('multimedia_tab_characters'), icon: Heart, count: library.characters.length },
  ];

  return (
    <div className="bg-black border-4 border-white neo-shadow p-6 space-y-6 text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-white/20 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> {t('multimedia_badge')}
            </span>
            <span className="bg-cyan-500 text-white font-black text-[10px] px-2 py-0.5 border border-white uppercase">
              {t('multimedia_all_in_one')}
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>{t('multimedia_title')}</span>
          </h2>
          <p className="text-xs text-neutral-400 font-bold uppercase mt-1">
            {t('multimedia_desc')}
          </p>
        </div>

        <button
          onClick={refreshActive}
          className="px-4 py-2.5 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer neo-shadow"
        >
          <RefreshCw size={16} strokeWidth={3} />
          <span>{t('multimedia_refresh')}</span>
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex bg-neutral-900 border-2 border-white/30 p-1 overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2.5 px-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-white text-black neo-shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              )}
            >
              <Icon size={16} strokeWidth={2.5} className={isActive ? "text-rose-600" : "text-amber-400"} />
              <span>{tab.label} ({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Manga & Light Novel */}
      {activeTab === 'manga' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Sparkles size={15} /> {t('multimedia_discover')}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void loadManga(mangaQuery);
              }}
              className="flex gap-2 w-full sm:w-auto"
            >
              <input
                type="text"
                value={mangaQuery}
                onChange={(e) => setMangaQuery(e.target.value)}
                placeholder={t('multimedia_search_manga')}
                className="flex-1 sm:w-64 px-3 py-2 bg-neutral-900 border-2 border-white text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-cyan-500 hover:bg-white text-black border-2 border-white cursor-pointer"
                aria-label={t('multimedia_search_manga')}
              >
                <Search size={14} strokeWidth={3} />
              </button>
            </form>
          </div>

          {mangaLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-neutral-400 font-black uppercase text-xs">
              <Loader2 size={16} className="animate-spin" /> {t('multimedia_loading')}
            </div>
          ) : mangaError ? (
            <div className="p-4 border-2 border-rose-500 text-rose-400 font-black uppercase text-xs">
              {t('multimedia_load_error')}
            </div>
          ) : mangaResults.length === 0 ? (
            <div className="p-4 border-2 border-white/20 text-neutral-400 font-black uppercase text-xs">
              {t('multimedia_no_results')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mangaResults.map((item) => (
                <div key={item.id} className="bg-neutral-900 border-2 border-white/20 p-3 flex gap-3 hover:border-cyan-400 transition-colors">
                  <img
                    src={getSafeImageUrl(mediaCover(item))}
                    alt={item.displayTitle}
                    className="w-16 h-24 object-cover border-2 border-white shrink-0"
                    referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className={cn(
                        "text-[9px] font-black uppercase px-1.5 py-0.5 border border-white inline-block mb-1",
                        item.kind === 'light_novel' ? "bg-cyan-500 text-black" : "bg-rose-600 text-white"
                      )}>
                        {item.kind === 'light_novel' ? 'LIGHT NOVEL' : 'MANGA'}
                      </span>
                      <h4 lang="en" className="font-black text-xs uppercase text-white line-clamp-2">{item.displayTitle}</h4>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase mt-1 flex items-center gap-1">
                        <Star size={10} className="text-amber-400" />
                        {toTenPointScore(item.averageScore) ?? '—'}
                        {item.chapters ? ` • ${t('multimedia_chapters_total', { total: item.chapters })}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => addManga(item)}
                      className="mt-2 px-2 py-1 bg-amber-400 hover:bg-white text-black font-black text-[10px] uppercase border border-black cursor-pointer flex items-center gap-1 self-start"
                    >
                      <Plus size={11} strokeWidth={3} /> {t('multimedia_add_to_library')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t-2 border-white/20 pt-4 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <BookOpen size={15} /> {t('multimedia_library')} ({library.mangas.length})
            </h3>
            {library.mangas.length === 0 ? (
              <div className="p-4 border-2 border-white/20 text-neutral-400 font-black uppercase text-xs">
                {t('multimedia_empty_library')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {library.mangas.map((item) => (
                  <div key={item.id} className="bg-neutral-900 border-2 border-white/20 p-4 neo-shadow flex flex-col justify-between">
                    <div className="flex gap-3">
                      <img
                        src={getSafeImageUrl(item.coverImage)}
                        alt={item.title}
                        className="w-20 h-28 object-cover border-2 border-white shrink-0"
                        referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 border border-white inline-block mb-1",
                          item.type === 'manga' ? "bg-rose-600 text-white" : item.type === 'light_novel' ? "bg-cyan-500 text-black" : "bg-purple-600 text-white"
                        )}>
                          {item.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <h4 lang="en" className="font-black text-sm uppercase text-white line-clamp-2">{item.title}</h4>
                        <div className="text-xs font-mono font-bold text-amber-400 mt-2">
                          {t('multimedia_chapter_progress', { done: item.currentChapter, total: item.totalChapters ?? '?' })}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
                          {t('multimedia_volume', { count: item.currentVolume })} • {t('multimedia_score')}: ⭐ {item.score ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        {t(`media_status_${item.status}`)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => incrementChapter(item.id)}
                          className="px-2 py-1 bg-amber-400 hover:bg-white text-black font-black text-[10px] uppercase border border-black flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={11} strokeWidth={3} /> +1
                        </button>
                        <button
                          onClick={() => removeManga(item.id)}
                          className="p-1 bg-neutral-900 hover:bg-rose-600 text-white border border-white cursor-pointer"
                          aria-label={t('multimedia_remove')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Games */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Gamepad2 size={15} /> {t('multimedia_discover')}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void loadGames(gameQuery);
              }}
              className="flex gap-2 w-full sm:w-auto"
            >
              <input
                type="text"
                value={gameQuery}
                onChange={(e) => setGameQuery(e.target.value)}
                placeholder={t('multimedia_search_games')}
                className="flex-1 sm:w-64 px-3 py-2 bg-neutral-900 border-2 border-white text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-cyan-500 hover:bg-white text-black border-2 border-white cursor-pointer"
                aria-label={t('multimedia_search_games')}
              >
                <Search size={14} strokeWidth={3} />
              </button>
            </form>
          </div>

          {gamesLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-neutral-400 font-black uppercase text-xs">
              <Loader2 size={16} className="animate-spin" /> {t('multimedia_loading')}
            </div>
          ) : gamesError ? (
            <div className="p-4 border-2 border-rose-500 text-rose-400 font-black uppercase text-xs">
              {t('multimedia_load_error')}
            </div>
          ) : gameResults.length === 0 ? (
            <div className="p-4 border-2 border-white/20 text-neutral-400 font-black uppercase text-xs">
              {t('multimedia_no_results')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {gameResults.map((game) => (
                <div key={game.id} className="bg-neutral-900 border-2 border-white/20 p-3 flex gap-3 hover:border-cyan-400 transition-colors">
                  <img
                    src={getSafeImageUrl(mediaCover(game))}
                    alt={game.displayTitle}
                    className="w-20 h-16 object-cover border-2 border-white shrink-0"
                    referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 lang="en" className="font-black text-xs uppercase text-white line-clamp-2">{game.displayTitle}</h4>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase mt-1 flex items-center gap-1">
                        <Star size={10} className="text-amber-400" />
                        {toTenPointScore(game.averageScore) ?? '—'} • STEAM
                      </div>
                    </div>
                    <button
                      onClick={() => addGame(game)}
                      className="mt-2 px-2 py-1 bg-cyan-400 hover:bg-white text-black font-black text-[10px] uppercase border border-black cursor-pointer flex items-center gap-1 self-start"
                    >
                      <Plus size={11} strokeWidth={3} /> {t('multimedia_add_to_backlog')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t-2 border-white/20 pt-4 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <Gamepad2 size={15} /> {t('multimedia_library')} ({library.games.length})
            </h3>
            {library.games.length === 0 ? (
              <div className="p-4 border-2 border-white/20 text-neutral-400 font-black uppercase text-xs">
                {t('multimedia_empty_library')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {library.games.map((game) => (
                  <div key={game.id} className="bg-neutral-900 border-2 border-white/20 p-4 neo-shadow flex flex-col justify-between">
                    <div className="flex gap-3">
                      <img
                        src={getSafeImageUrl(game.coverImage)}
                        alt={game.title}
                        className="w-20 h-16 object-cover border-2 border-white shrink-0"
                        referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 border border-white bg-black text-cyan-400 inline-block mb-1">
                          {game.platform}
                        </span>
                        <h4 lang="en" className="font-black text-sm uppercase text-white line-clamp-2">{game.title}</h4>
                        <div className="text-xs font-mono font-bold text-amber-400 mt-2">
                          {t('multimedia_hours_played', { hours: game.hoursPlayed })}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
                          {t('multimedia_score')}: ⭐ {game.score ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase">
                        {t(`media_status_${game.status}`)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => incrementHour(game.id)}
                          className="px-2 py-1 bg-cyan-400 hover:bg-white text-black font-black text-[10px] uppercase border border-black flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={11} strokeWidth={3} /> +1
                        </button>
                        <button
                          onClick={() => removeGame(game.id)}
                          className="p-1 bg-neutral-900 hover:bg-rose-600 text-white border border-white cursor-pointer"
                          aria-label={t('multimedia_remove')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Characters */}
      {activeTab === 'characters' && (
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <User size={15} /> {t('multimedia_popular_characters')}
          </h3>

          {charactersLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-neutral-400 font-black uppercase text-xs">
              <Loader2 size={16} className="animate-spin" /> {t('multimedia_loading')}
            </div>
          ) : charactersError ? (
            <div className="p-4 border-2 border-rose-500 text-rose-400 font-black uppercase text-xs">
              {t('multimedia_load_error')}
            </div>
          ) : characterResults.length === 0 ? (
            <div className="p-4 border-2 border-white/20 text-neutral-400 font-black uppercase text-xs">
              {t('multimedia_no_results')}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {characterResults.map((character) => (
                <div key={character.id} className="bg-neutral-900 border-2 border-white/20 p-2 flex flex-col hover:border-rose-400 transition-colors">
                  <img
                    src={getSafeImageUrl(character.image ?? '')}
                    alt={character.name}
                    className="w-full aspect-[3/4] object-cover border-2 border-white mb-2"
                    referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  <h4 lang="en" className="font-black text-[11px] uppercase text-white line-clamp-1">{character.name}</h4>
                  <p lang="en" className="text-[9px] text-amber-400 font-bold uppercase line-clamp-1 mb-2">
                    {character.animeTitle ?? '—'}
                  </p>
                  <button
                    onClick={() => addCharacter(character)}
                    className="mt-auto px-2 py-1 bg-rose-600 hover:bg-white text-white hover:text-black font-black text-[9px] uppercase border border-white cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus size={10} strokeWidth={3} /> {t('multimedia_add_to_favorites')}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t-2 border-white/20 pt-4 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <Heart size={15} /> {t('multimedia_favorites')} ({library.characters.length})
            </h3>
            {library.characters.length === 0 ? (
              <div className="p-4 border-2 border-white/20 text-neutral-400 font-black uppercase text-xs">
                {t('multimedia_empty_library')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {library.characters.map((character) => (
                  <div key={character.id} className="bg-neutral-900 border-4 border-white p-4 neo-shadow relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 border border-white uppercase">
                      {character.role}
                    </div>
                    <div className="flex gap-4 items-center mb-3">
                      <img
                        src={getSafeImageUrl(character.image)}
                        alt={character.name}
                        className="w-18 h-24 object-cover border-2 border-white shrink-0"
                        referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                      <div className="min-w-0">
                        <h4 lang="en" className="font-black text-lg text-white uppercase tracking-tight line-clamp-2">{character.name}</h4>
                        <p lang="en" className="text-xs text-amber-400 font-bold uppercase line-clamp-1">{character.animeTitle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCharacter(character.id)}
                      className="w-full py-1.5 bg-neutral-900 hover:bg-rose-600 text-white font-black text-[10px] uppercase border border-white cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X size={12} strokeWidth={3} /> {t('multimedia_remove')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer note: verinin nereden geldiği dürüstçe belirtilir. */}
      <div className="border-t border-white/10 pt-3 flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-500">
        <ChevronRight size={12} />
        <span>ANILIST + STEAM • {t('multimedia_live_note')}</span>
      </div>
    </div>
  );
};
