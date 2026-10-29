import React, { useState } from 'react';
import { 
  BookOpen, Gamepad2, Heart, Plus, Star, CheckCircle2, 
  Sparkles, Layers, Book, Trophy, Search, ChevronRight, X, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { useToastStore } from '../store/useToastStore';

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

const INITIAL_MANGAS: MangaItem[] = [
  { id: 'm1', title: 'Chainsaw Man', type: 'manga', coverImage: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg', currentChapter: 168, totalChapters: 200, currentVolume: 17, status: 'reading', score: 9.5 },
  { id: 'm2', title: 'Omniscient Reader\'s Viewpoint', type: 'web_novel', coverImage: 'https://cdn.myanimelist.net/images/anime/1210/141049l.webp', currentChapter: 215, totalChapters: 551, currentVolume: 8, status: 'reading', score: 9.8 },
  { id: 'm3', title: 'Solo Leveling (Novel)', type: 'light_novel', coverImage: 'https://cdn.myanimelist.net/images/anime/1210/141049l.webp', currentChapter: 270, totalChapters: 270, currentVolume: 14, status: 'completed', score: 9.2 }
];

const INITIAL_GAMES: GameItem[] = [
  { id: 'g1', title: 'Elden Ring: Shadow of the Erdtree', platform: 'PC', coverImage: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg', hoursPlayed: 142, status: 'completed', score: 10 },
  { id: 'g2', title: 'Genshin Impact (Natlan Update)', platform: 'PC', coverImage: 'https://cdn.myanimelist.net/images/anime/1169/143761l.webp', hoursPlayed: 320, status: 'playing', score: 8.8 },
  { id: 'g3', title: 'Persona 3 Reload', platform: 'PS5', coverImage: 'https://cdn.myanimelist.net/images/anime/1208/135328l.jpg', hoursPlayed: 85, status: 'completed', score: 9.6 }
];

const INITIAL_CHARACTERS: FavoriteCharacter[] = [
  { id: 'c1', name: 'Makima', animeTitle: 'Chainsaw Man', role: 'Waifu', image: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg', quote: 'Tüm köpekler söz dinlemeli.', seiyuuName: 'Tomori Kusunoki' },
  { id: 'c2', name: 'Gojo Satoru', animeTitle: 'Jujutsu Kaisen', role: 'Husbando', image: 'https://cdn.myanimelist.net/images/anime/1171/123961l.jpg', quote: 'Merak etme, ben en güçlüyüm.', seiyuuName: 'Yuichi Nakamura' },
  { id: 'c3', name: 'Fern', animeTitle: 'Sousou no Frieren', role: 'Waifu', image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp', quote: 'Frieren-sama, lütfen büyü yapmayı bırakın.', seiyuuName: 'Kana Ichinose' }
];

export const MultiMediaHub: React.FC = () => {
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<'manga' | 'games' | 'characters'>('manga');

  const [mangas, setMangas] = useState<MangaItem[]>(INITIAL_MANGAS);
  const [games, setGames] = useState<GameItem[]>(INITIAL_GAMES);
  const [characters, setCharacters] = useState<FavoriteCharacter[]>(INITIAL_CHARACTERS);

  // New Item Modals
  const [isAddMangaOpen, setIsAddMangaOpen] = useState(false);
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'manga' | 'light_novel' | 'web_novel'>('manga');
  const [newChapter, setNewChapter] = useState(1);

  const handleIncrementChapter = (id: string) => {
    setMangas(prev => prev.map(m => {
      if (m.id === id) {
        const next = m.currentChapter + 1;
        addToast(`📖 ${m.title} - Bölüm ${next} okundu!`, 'success');
        return { ...m, currentChapter: next };
      }
      return m;
    }));
  };

  const handleIncrementHour = (id: string) => {
    setGames(prev => prev.map(g => {
      if (g.id === id) {
        const next = g.hoursPlayed + 1;
        addToast(`🎮 ${g.title} - Toplam ${next} saat oynandı!`, 'info');
        return { ...g, hoursPlayed: next };
      }
      return g;
    }));
  };

  const handleAddMangaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: MangaItem = {
      id: 'm-' + Date.now(),
      title: newTitle.trim(),
      type: newType,
      coverImage: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
      currentChapter: newChapter,
      currentVolume: 1,
      status: 'reading',
      score: 9.0
    };

    setMangas([newItem, ...mangas]);
    addToast(`${newTitle} okuma listenize eklendi!`, 'success');
    setNewTitle('');
    setIsAddMangaOpen(false);
  };

  return (
    <div className="bg-black border-4 border-white neo-shadow p-6 space-y-6 text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-white/20 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> MULTI-MEDIA & OYUN & NOVEL MERKEZİ
            </span>
            <span className="bg-cyan-500 text-white font-black text-[10px] px-2 py-0.5 border border-white uppercase">
              HEPSİ BİR ARADA
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>MANGA, NOVEL, OYUN VE KARAKTER VİTRİNİ</span>
          </h2>
          <p className="text-xs text-neutral-400 font-bold uppercase mt-1">
            Manga bölümlerini takip et, oyun backlog&apos;unu yönet ve favori Waifu/Husbando vitrinini sergile!
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (activeTab === 'manga') setIsAddMangaOpen(true);
            else if (activeTab === 'games') setIsAddGameOpen(true);
            else addToast('Favori Karakter vitrinine profil sayfasından ekleme yapabilirsiniz.', 'info');
          }}
          className="px-4 py-2.5 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer neo-shadow"
        >
          <Plus size={16} strokeWidth={3} />
          <span>{activeTab === 'manga' ? 'MANGA/NOVEL EKLE' : activeTab === 'games' ? 'OYUN EKLE' : 'KARAKTER EKLE'}</span>
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex bg-neutral-900 border-2 border-white/30 p-1 overflow-x-auto gap-1">
        {[
          { id: 'manga', label: 'MANGA & LIGHT/WEB NOVEL', icon: BookOpen, count: mangas.length },
          { id: 'games', label: 'OYUN KÜTÜPHANESİ & BACKLOG', icon: Gamepad2, count: games.length },
          { id: 'characters', label: 'FAVORİ KARAKTER & SEIYUU VİTRİNİ', icon: Heart, count: characters.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* Tab Content 1: Manga & Novel Tracker */}
      {activeTab === 'manga' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mangas.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border-2 border-white/20 p-4 neo-shadow flex flex-col justify-between hover:border-amber-400 transition-colors group"
            >
              <div className="flex gap-3">
                <img
                  src={getSafeImageUrl(item.coverImage)}
                  alt={item.title}
                  className="w-20 h-28 object-cover border-2 border-white shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 border border-white inline-block mb-1",
                    item.type === 'manga' ? "bg-rose-600 text-white" : item.type === 'light_novel' ? "bg-cyan-500 text-black" : "bg-purple-600 text-white"
                  )}>
                    {item.type.replace('_', ' ').toUpperCase()}
                  </span>

                  <h3 className="font-black text-sm uppercase text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>

                  <div className="text-xs font-mono font-bold text-amber-400 mt-2">
                    Bölüm {item.currentChapter} / {item.totalChapters || '?'}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
                    Cilt {item.currentVolume} • Skor: ⭐ {item.score || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Increments */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1">
                  <CheckCircle2 size={12} /> {item.status.toUpperCase()}
                </span>

                <button
                  onClick={() => handleIncrementChapter(item.id)}
                  className="px-3 py-1 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase border border-black flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={12} strokeWidth={3} />
                  <span>+1 BÖLÜM OKUNDU</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Gaming Library */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-neutral-900 border-2 border-white/20 p-4 neo-shadow flex flex-col justify-between hover:border-cyan-400 transition-colors group"
            >
              <div className="flex gap-3">
                <img
                  src={getSafeImageUrl(game.coverImage)}
                  alt={game.title}
                  className="w-20 h-28 object-cover border-2 border-white shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 border border-white bg-black text-cyan-400 inline-block mb-1">
                    {game.platform}
                  </span>

                  <h3 className="font-black text-sm uppercase text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {game.title}
                  </h3>

                  <div className="text-xs font-mono font-bold text-amber-400 mt-2">
                    {game.hoursPlayed} SAAT OYNANDI
                  </div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
                    Skor: ⭐ {game.score || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Hours Increment */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase">
                  DURUM: {game.status.toUpperCase()}
                </span>

                <button
                  onClick={() => handleIncrementHour(game.id)}
                  className="px-3 py-1 bg-cyan-400 hover:bg-white text-black font-black text-xs uppercase border border-black flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={12} strokeWidth={3} />
                  <span>+1 SAAT EKLE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: Favorite Characters & Seiyuu Shrine */}
      {activeTab === 'characters' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="bg-neutral-900 border-4 border-white p-4 neo-shadow relative overflow-hidden group hover:border-rose-500 transition-colors"
            >
              <div className="absolute top-2 right-2 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 border border-white uppercase">
                {char.role}
              </div>

              <div className="flex gap-4 items-center mb-3">
                <img
                  src={getSafeImageUrl(char.image)}
                  alt={char.name}
                  className="w-18 h-24 object-cover border-2 border-white shrink-0 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h3 className="font-black text-lg text-white uppercase tracking-tight group-hover:text-rose-400 transition-colors">
                    {char.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-bold uppercase">
                    {char.animeTitle}
                  </p>
                  {char.seiyuuName && (
                    <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">
                      Seiyuu: <span className="text-white">{char.seiyuuName}</span>
                    </p>
                  )}
                </div>
              </div>

              {char.quote && (
                <p className="text-xs text-neutral-300 font-medium italic border-t border-white/20 pt-2 leading-relaxed">
                  &ldquo;{char.quote}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Manga Modal */}
      {isAddMangaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-black border-4 border-white neo-shadow p-6 relative">
            <button onClick={() => setIsAddMangaOpen(false)} className="absolute top-3 right-3 text-white">
              <X size={16} />
            </button>
            <h3 className="font-black text-lg uppercase text-white mb-4">Manga / Light Novel Ekle</h3>
            <form onSubmit={handleAddMangaSubmit} className="space-y-4">
              <div>
                <label className="font-black text-xs uppercase text-white block mb-1">Eser Adı</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: Solo Leveling"
                  className="w-full p-2.5 bg-neutral-900 border border-white text-white font-bold text-xs uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="font-black text-xs uppercase text-white block mb-1">Tür</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2.5 bg-neutral-900 border border-white text-white font-bold text-xs uppercase focus:outline-none"
                >
                  <option value="manga">Manga</option>
                  <option value="light_novel">Light Novel</option>
                  <option value="web_novel">Web Novel / Manhwa</option>
                </select>
              </div>

              <div>
                <label className="font-black text-xs uppercase text-white block mb-1">Kaldığın Bölüm</label>
                <input
                  type="number"
                  min="1"
                  value={newChapter}
                  onChange={(e) => setNewChapter(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 bg-neutral-900 border border-white text-white font-bold text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase border-2 border-black neo-shadow cursor-pointer"
              >
                KÜTÜPHANEYE EKLE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
