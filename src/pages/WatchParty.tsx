import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Tv2, Plus, Users, Search, Play, Pause, Flame, Sparkles, 
  ArrowLeft, Crown, Share2, Film, Check, ExternalLink, Bookmark 
} from 'lucide-react';
import { useWatchPartyStore } from '../store/useWatchPartyStore';
import { VideoPlayerDeck } from '../components/WatchParty/VideoPlayerDeck';
import { WatchPartyChat } from '../components/WatchParty/WatchPartyChat';
import { CreateWatchPartyModal } from '../components/WatchParty/CreateWatchPartyModal';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { cn } from '../lib/utils';
import { Anime } from '../types';

export const WatchParty: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile, addToWatchlist, watchlist } = useAppStore();
  const { addToast } = useToastStore();

  const { 
    rooms, 
    activeRoom, 
    fetchRooms, 
    joinRoom, 
    leaveRoom,
    seekTo 
  } = useWatchPartyStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);

  // Active user data
  const currentSafeUser = {
    uid: currentUser?.uid || 'guest-' + (userProfile?.name || 'otaku'),
    displayName: userProfile?.name || currentUser?.displayName || 'AnimeSever',
    photoURL: (userProfile as any)?.avatar || userProfile?.avatarSeed || currentUser?.photoURL || null
  };

  // Fetch rooms on lobby mount
  useEffect(() => {
    const unsub = fetchRooms();
    return () => unsub();
  }, [fetchRooms]);

  // Join room when roomId is in URL
  useEffect(() => {
    if (roomId) {
      const unsub = joinRoom(roomId, currentSafeUser);
      return () => {
        unsub();
        leaveRoom();
      };
    }
  }, [roomId, joinRoom, leaveRoom]);

  // Filtered rooms in Lobby
  const filteredRooms = rooms.filter((r) => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesQuery = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.animeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    const found = rooms.find(
      r => r.roomCode.toLowerCase() === roomCodeInput.trim().toLowerCase()
    );
    if (found) {
      navigate(`/watch-party/${found.id}`);
    } else {
      addToast('Bu koda sahip aktif bir oda bulunamadı.', 'error');
    }
  };

  const handleQuickAddWatchlist = (animeTitle: string, animeId: number, animeImage: string) => {
    const mockAnime: Anime = {
      mal_id: animeId,
      title: animeTitle,
      title_english: animeTitle,
      images: {
        jpg: { image_url: animeImage, large_image_url: animeImage },
        webp: { image_url: animeImage, large_image_url: animeImage }
      },
      synopsis: 'Watch Party ile izleniyor.',
      score: 8.8,
      episodes: 12,
      status: 'Currently Airing',
      genres: [{ mal_id: 1, name: 'Aksiyon' }],
      year: 2024
    };
    addToWatchlist(mockAnime, 'watching');
    addToast(`${animeTitle} izleme listenize eklendi!`, 'success');
  };

  // --------------------------------------------------------------------------
  // ROOM VIEW (When inside a specific room)
  // --------------------------------------------------------------------------
  if (roomId) {
    const currentRoom = activeRoom || rooms.find(r => r.id === roomId);

    if (!currentRoom) {
      return (
        <div className="max-w-4xl mx-auto py-16 text-center px-4">
          <Tv2 size={48} className="mx-auto mb-4 text-neutral-400" />
          <h2 className="text-xl font-black uppercase text-black mb-2">Oda Bulunamadı</h2>
          <p className="text-sm text-neutral-600 mb-6 font-bold">
            Bu oda kapatılmış veya geçersiz bir bağlantı kullanılmış olabilir.
          </p>
          <button
            onClick={() => navigate('/watch-party')}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black border-4 border-black font-black uppercase text-xs neo-shadow cursor-pointer"
          >
            Lobiye Geri Dön
          </button>
        </div>
      );
    }

    const isHost = currentRoom.hostId === currentSafeUser.uid;
    const canControl = isHost || !currentRoom.isLocked;
    const isAlreadyInList = watchlist.some(w => w.anime.mal_id === currentRoom.animeId);

    return (
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Top Breadcrumb & Room Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-4 border-black neo-shadow p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/watch-party')}
              className="p-1.5 bg-neutral-100 hover:bg-amber-400 border-2 border-black font-black text-xs uppercase flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>LOBİ</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase text-black">
                  {currentRoom.title}
                </span>
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                  {currentRoom.category}
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 font-bold truncate max-w-md">
                {currentRoom.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-neutral-100 border-2 border-black px-2.5 py-1 text-xs font-mono font-black">
              <span className="text-neutral-500 text-[10px]">ODA KODU:</span>
              <span className="text-rose-600">{currentRoom.roomCode}</span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopiedRoomCode(true);
                setTimeout(() => setCopiedRoomCode(false), 2000);
              }}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 border-2 border-black font-black text-xs uppercase text-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
            >
              {copiedRoomCode ? <Check size={12} /> : <Share2 size={12} />}
              <span>{copiedRoomCode ? "KOPYALANDI" : "DAVET ET"}</span>
            </button>
          </div>
        </div>

        {/* Main Watch Theatre Grid: Left Video / Right Synced Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Left Column: Video & Anime Info */}
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayerDeck
              room={currentRoom}
              isHost={isHost}
              canControl={canControl}
              currentUser={currentSafeUser}
            />

            {/* Anime Info Card & Quick Actions */}
            <div className="bg-white border-4 border-black neo-shadow p-4 flex flex-col sm:flex-row gap-4 items-start">
              <img
                src={currentRoom.animeImage}
                alt={currentRoom.animeTitle}
                className="w-24 h-34 object-cover border-2 border-black shadow-[3px_3px_0px_0px_#000] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h4 className="font-black text-base uppercase text-black">
                    {currentRoom.animeTitle}
                  </h4>
                  <button
                    onClick={() => handleQuickAddWatchlist(currentRoom.animeTitle, currentRoom.animeId, currentRoom.animeImage)}
                    className={cn(
                      "px-3 py-1.5 border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]",
                      isAlreadyInList
                        ? "bg-emerald-400 text-black"
                        : "bg-rose-500 hover:bg-rose-400 text-white"
                    )}
                  >
                    <Bookmark size={13} />
                    <span>{isAlreadyInList ? "LİSTEDE" : "LİSTEME EKLE"}</span>
                  </button>
                </div>

                <p className="text-xs text-neutral-700 font-bold leading-relaxed mb-3">
                  {currentRoom.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase text-neutral-600">
                  <span className="bg-neutral-100 px-2 py-0.5 border border-black">
                    MAL ID: #{currentRoom.animeId}
                  </span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 border border-black">
                    CANLI İZLEYİCİ: {currentRoom.participantCount}
                  </span>
                  <span className="bg-cyan-100 text-cyan-900 px-2 py-0.5 border border-black">
                    SENKRONİZASYON: AKTİF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat & Participants */}
          <div className="lg:col-span-1 h-[600px] flex flex-col">
            <WatchPartyChat
              room={currentRoom}
              currentUser={currentSafeUser}
              currentVideoTime={currentRoom.currentTime || 0}
              onJumpToTime={(seconds) => seekTo(currentRoom.id, seconds)}
            />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LOBBY VIEW (List of active rooms)
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-amber-400 border-4 border-black neo-shadow p-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-black text-amber-400 font-black text-xs px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <Tv2 size={14} /> CANLI İZLEME ODALARI
            </span>
            <span className="bg-white text-black font-black text-xs px-2 py-0.5 border border-black uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              EŞZAMANLI OYNATMA
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black leading-none mb-3">
            BİRLİKTE İZLE: WATCH PARTY ODALARI
          </h1>

          <p className="text-xs sm:text-sm font-bold text-neutral-900 leading-relaxed max-w-2xl">
            Arkadaşlarınız ve diğer otaku topluluğuyla aynı saniyede anime fragmanlarını, AMV&apos;leri ve özel sahneleri izleyin. Uçuşan canlı reaksiyonlar fırlatın ve sahneye özel zaman damgalı yorumlar yazın!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase flex items-center gap-2 border-2 border-black transition-transform active:translate-y-0.5 cursor-pointer shadow-[3px_3px_0px_0px_#fff]"
            >
              <Plus size={16} />
              <span>YENİ ODA OLUŞTUR (HOST OL)</span>
            </button>

            {/* Join by Code Form */}
            <form onSubmit={handleJoinByCode} className="flex items-center">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                placeholder="Örn: KNY-990"
                className="px-3 py-2 bg-white text-black border-2 border-black border-r-0 font-mono font-bold text-xs uppercase focus:outline-none w-32"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black font-black text-xs uppercase cursor-pointer"
              >
                KODA KATIL
              </button>
            </form>
          </div>
        </div>

        {/* Decorative corner icon */}
        <Film size={180} className="absolute -right-10 -bottom-10 text-black/10 pointer-events-none" />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-4 border-black neo-shadow p-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'TÜM ODALAR' },
            { id: 'fragman', label: 'FRAGMANLAR' },
            { id: 'sezon-ozel', label: 'SEZON ÖZEL' },
            { id: 'amv', label: 'AMV & KLİPLER' },
            { id: 'bolum-tartisma', label: 'BÖLÜM ANALİZİ' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 border-2 border-black font-black text-[11px] uppercase whitespace-nowrap cursor-pointer transition-colors",
                selectedCategory === cat.id
                  ? "bg-black text-amber-400 neo-shadow"
                  : "bg-neutral-100 hover:bg-neutral-200 text-black"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oda veya anime ara..."
            className="w-full px-3 py-1.5 pl-8 border-2 border-black font-bold text-xs bg-neutral-50 focus:bg-white focus:outline-none"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((r) => (
          <div
            key={r.id}
            onClick={() => navigate(`/watch-party/${r.id}`)}
            className="group bg-white border-4 border-black neo-shadow hover:translate-x-1 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Room Card Thumbnail */}
            <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden border-b-2 border-black">
              <img
                src={r.animeImage}
                alt={r.animeTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Status Pill Top Left */}
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/90 text-white px-2 py-0.5 border border-white/30 text-[9px] font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>CANLI</span>
              </div>

              {/* Viewer Count Top Right */}
              <div className="absolute top-2 right-2 bg-amber-400 text-black px-2 py-0.5 border border-black font-black text-[10px] uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                <Users size={11} />
                <span>{r.participantCount} İZLEYİCİ</span>
              </div>

              {/* Big Play Overlay on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="w-12 h-12 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-lg">
                  <Play size={20} className="translate-x-0.5" strokeWidth={3} />
                </div>
              </div>

              {/* Bottom anime tag */}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block truncate">
                  {r.animeTitle}
                </span>
              </div>
            </div>

            {/* Room Details Body */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-sm uppercase text-black line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors mb-1.5">
                  {r.title}
                </h3>
                <p className="text-[11px] text-neutral-600 font-bold line-clamp-2 mb-3">
                  {r.description}
                </p>
              </div>

              {/* Footer row */}
              <div className="pt-2 border-t-2 border-black flex items-center justify-between text-[10px] font-black uppercase">
                <div className="flex items-center gap-1 text-neutral-600">
                  <Crown size={11} className="text-amber-500" />
                  <span>HOST: {r.hostName}</span>
                </div>

                <div className="text-rose-600 font-mono">
                  #{r.roomCode}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="bg-white border-4 border-black neo-shadow p-12 text-center max-w-lg mx-auto">
          <Tv2 size={40} className="mx-auto mb-2 text-neutral-400" />
          <h4 className="font-black text-sm uppercase text-black mb-1">Eşleşen Oda Bulunamadı</h4>
          <p className="text-xs text-neutral-600 font-bold mb-4">
            Arama kriterlerinize uyan canlı oda yok veya henüz açılmamış.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase neo-shadow cursor-pointer"
          >
            İlk Odayı Sen Aç
          </button>
        </div>
      )}

      {/* Create Watch Party Modal */}
      <CreateWatchPartyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentSafeUser}
        onRoomCreated={(newId) => navigate(`/watch-party/${newId}`)}
      />
    </div>
  );
};
