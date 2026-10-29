import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { RecentActivity, WatchStatus, Anime } from '../types';
import { getSafeImageUrl, formatRelativeTime, cn } from '../lib/utils';
import { 
  Activity, BookmarkPlus, Check, Star, ExternalLink, Filter, 
  Layers, Clock, Film, Sparkles, RefreshCw, Plus, Zap,
  Volume2, VolumeX, Radio, Eye, Flame, ArrowRight, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Web Audio API Neo-Brutalist chime generator for real-time drop notifications
const playNeoChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.22);
  } catch {
    // Audio restricted or uninitialized, fail silently
  }
};

// Realistic initial community activities to ensure rich display even on fresh DBs
const SEED_ACTIVITIES: RecentActivity[] = [
  {
    id: 'seed-1',
    userId: 'user_kira',
    userName: 'KiraYukimura',
    userAvatarSeed: 'Kira',
    animeId: 52991,
    animeTitle: 'Sousou no Frieren',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
    actionType: 'added_to_watchlist',
    status: 'watching',
    listName: 'İzleniyor',
    score: 9.38,
    genres: ['Macera', 'Dram', 'Fantezi'],
    episodes: 28,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'seed-2',
    userId: 'user_sakura',
    userName: 'SakuraBlossom',
    userAvatarSeed: 'Sakura',
    animeId: 52299,
    animeTitle: 'Ore dake Level Up na Ken (Solo Leveling)',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1500/140813l.webp',
    actionType: 'added_to_watchlist',
    status: 'plan_to_watch',
    listName: 'İzlenecekler',
    score: 8.35,
    genres: ['Aksiyon', 'Fantezi'],
    episodes: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'seed-3',
    userId: 'user_gojo',
    userName: 'GojoSaturo',
    userAvatarSeed: 'Gojo',
    animeId: 5114,
    animeTitle: 'Fullmetal Alchemist: Brotherhood',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1223/96541l.webp',
    actionType: 'added_to_custom_list',
    listName: 'Tüm Zamanların Başyapıtları',
    score: 9.10,
    genres: ['Aksiyon', 'Macera', 'Dram'],
    episodes: 64,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString()
  },
  {
    id: 'seed-4',
    userId: 'user_zoro',
    userName: 'ZoroLostAgain',
    userAvatarSeed: 'Zoro',
    animeId: 21,
    animeTitle: 'One Piece',
    animeImage: 'https://cdn.myanimelist.net/images/anime/6/73245l.webp',
    actionType: 'added_to_watchlist',
    status: 'watching',
    listName: 'İzleniyor',
    score: 8.72,
    genres: ['Aksiyon', 'Macera', 'Fantezi'],
    episodes: 1100,
    createdAt: new Date(Date.now() - 1000 * 60 * 220).toISOString()
  },
  {
    id: 'seed-5',
    userId: 'user_otaku',
    userName: 'OtakuMaster99',
    userAvatarSeed: 'Otaku',
    animeId: 40748,
    animeTitle: 'Jujutsu Kaisen',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1171/109222l.webp',
    actionType: 'added_to_watchlist',
    status: 'completed',
    listName: 'Tamamlandı',
    score: 8.61,
    genres: ['Aksiyon', 'Doğaüstü'],
    episodes: 24,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    id: 'seed-6',
    userId: 'user_makima',
    userName: 'MakimaEyes',
    userAvatarSeed: 'Makima',
    animeId: 44511,
    animeTitle: 'Chainsaw Man',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1806/126216l.webp',
    actionType: 'added_to_watchlist',
    status: 'plan_to_watch',
    listName: 'İzlenecekler',
    score: 8.48,
    genres: ['Aksiyon', 'Korku'],
    episodes: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 540).toISOString()
  }
];

// Curated pool of high-profile anime for realistic live simulation
const SIMULATED_ANIME_POOL = [
  {
    animeId: 16498,
    animeTitle: 'Shingeki no Kyojin (Attack on Titan)',
    animeImage: 'https://cdn.myanimelist.net/images/anime/10/47347l.webp',
    score: 8.55,
    genres: ['Aksiyon', 'Dram', 'Gizem'],
    episodes: 25
  },
  {
    animeId: 9253,
    animeTitle: 'Steins;Gate',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1935/127974l.webp',
    score: 9.07,
    genres: ['Bilim Kurgu', 'Gerilim', 'Dram'],
    episodes: 24
  },
  {
    animeId: 38000,
    animeTitle: 'Kimetsu no Yaiba (Demon Slayer)',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1286/99889l.webp',
    score: 8.49,
    genres: ['Aksiyon', 'Fantezi', 'Tarih'],
    episodes: 26
  },
  {
    animeId: 1535,
    animeTitle: 'Death Note',
    animeImage: 'https://cdn.myanimelist.net/images/anime/9/9453l.webp',
    score: 8.62,
    genres: ['Doğaüstü', 'Gerilim', 'Gizem'],
    episodes: 37
  },
  {
    animeId: 50265,
    animeTitle: 'Spy x Family',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1441/122795l.webp',
    score: 8.49,
    genres: ['Aksiyon', 'Komedi'],
    episodes: 12
  },
  {
    animeId: 52991,
    animeTitle: 'Sousou no Frieren',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
    score: 9.38,
    genres: ['Macera', 'Dram', 'Fantezi'],
    episodes: 28
  },
  {
    animeId: 5114,
    animeTitle: 'Fullmetal Alchemist: Brotherhood',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1223/96541l.webp',
    score: 9.10,
    genres: ['Aksiyon', 'Macera', 'Dram'],
    episodes: 64
  },
  {
    animeId: 51009,
    animeTitle: 'Bocchi the Rock!',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1448/127956l.webp',
    score: 8.78,
    genres: ['Komedi', 'Müzik', 'Yaşamdan Kesitler'],
    episodes: 12
  },
  {
    animeId: 40748,
    animeTitle: 'Jujutsu Kaisen',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1171/109222l.webp',
    score: 8.61,
    genres: ['Aksiyon', 'Doğaüstü', 'Fantezi'],
    episodes: 24
  },
  {
    animeId: 30276,
    animeTitle: 'One Punch Man',
    animeImage: 'https://cdn.myanimelist.net/images/anime/12/76049l.webp',
    score: 8.50,
    genres: ['Aksiyon', 'Komedi', 'Süper Güç'],
    episodes: 12
  },
  {
    animeId: 32281,
    animeTitle: 'Kimi no Na wa. (Your Name)',
    animeImage: 'https://cdn.myanimelist.net/images/anime/1935/127974l.webp',
    score: 8.84,
    genres: ['Dram', 'Doğaüstü', 'Romantik'],
    episodes: 1
  }
];

const SIMULATED_USERS = [
  { name: 'LeviAckerman', avatarSeed: 'Levi' },
  { name: 'KurisuMakise', avatarSeed: 'Kurisu' },
  { name: 'TanjiroKamado', avatarSeed: 'Tanjiro' },
  { name: 'AnyaForger', avatarSeed: 'Anya' },
  { name: 'MegumiFushiguro', avatarSeed: 'Megumi' },
  { name: 'HitoriGotoh', avatarSeed: 'Bocchi' },
  { name: 'SaitamaSensei', avatarSeed: 'Saitama' },
  { name: 'KiraYukimura', avatarSeed: 'Kira' },
  { name: 'SakuraBlossom', avatarSeed: 'Sakura' },
  { name: 'GojoSaturo', avatarSeed: 'Gojo' }
];

const SIMULATED_ACTIONS: Array<{
  actionType: 'added_to_watchlist' | 'added_to_custom_list';
  status?: WatchStatus;
  listName: string;
}> = [
  { actionType: 'added_to_watchlist', status: 'watching', listName: 'İzleniyor' },
  { actionType: 'added_to_watchlist', status: 'plan_to_watch', listName: 'İzlenecekler' },
  { actionType: 'added_to_watchlist', status: 'completed', listName: 'Tamamlandı' },
  { actionType: 'added_to_custom_list', listName: 'Tüm Zamanların Başyapıtları' },
  { actionType: 'added_to_custom_list', listName: 'Hafta Sonu Maratonu' },
  { actionType: 'added_to_custom_list', listName: 'Duygusal Fırtına Serileri' },
  { actionType: 'added_to_watchlist', status: 'watching', listName: 'İzleniyor' }
];

interface RecentActivityFeedProps {
  compact?: boolean;
  onViewAll?: () => void;
  maxItems?: number;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ 
  compact = false, 
  onViewAll,
  maxItems = 25 
}) => {
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, currentUser } = useAppStore();
  const { addToast } = useToastStore();

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'plan_to_watch' | 'watching' | 'completed' | 'custom'>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Real-time tracking of newly arrived items via onSnapshot
  const isInitialLoad = useRef(true);
  const [newlyArrivedIds, setNewlyArrivedIds] = useState<Set<string>>(new Set());
  const [latestLiveAlert, setLatestLiveAlert] = useState<{
    id: string;
    userName: string;
    animeTitle: string;
    animeImage: string;
    listName: string;
    time: string;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Generates a realistic community activity and writes directly to Firestore
  const handleSimulateActivity = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    try {
      const randomAnime = SIMULATED_ANIME_POOL[Math.floor(Math.random() * SIMULATED_ANIME_POOL.length)];
      const randomUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
      const randomAction = SIMULATED_ACTIONS[Math.floor(Math.random() * SIMULATED_ACTIONS.length)];

      const simulatedDoc = {
        userId: currentUser?.uid || `user_sim_${Date.now().toString(36)}`,
        userName: randomUser.name,
        userAvatarSeed: randomUser.avatarSeed,
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomUser.avatarSeed}`,
        animeId: randomAnime.animeId,
        animeTitle: randomAnime.animeTitle,
        animeImage: randomAnime.animeImage,
        actionType: randomAction.actionType,
        status: randomAction.status || 'plan_to_watch',
        listName: randomAction.listName,
        score: randomAnime.score,
        genres: randomAnime.genres,
        episodes: randomAnime.episodes,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'recentActivities'), simulatedDoc);
      addToast(
        `⚡ Simülasyon Başarılı: ${randomAnime.animeTitle} (${randomUser.name}) canlı akışa eklendi!`,
        'success'
      );
    } catch (error) {
      console.error('Error generating simulated activity in Firestore:', error);
      addToast('Simülasyon aktivitesi kaydedilirken bir hata oluştu.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    // Listen to live community additions using onSnapshot
    const q = query(
      collection(db, 'recentActivities'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Detect newly arrived items in real time
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !isInitialLoad.current) {
            const data = change.doc.data();
            const docId = change.doc.id;

            setNewlyArrivedIds((prev) => new Set([...prev, docId]));
            setLatestLiveAlert({
              id: docId,
              userName: data.userName || 'Otaku',
              animeTitle: data.animeTitle || 'Anime',
              animeImage: data.animeImage || '',
              listName: data.listName || 'İzleme Listesi',
              time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });

            if (soundEnabled) {
              playNeoChime();
            }

            // Remove highlight after 8 seconds
            setTimeout(() => {
              setNewlyArrivedIds((prev) => {
                const next = new Set(prev);
                next.delete(docId);
                return next;
              });
            }, 8000);
          }
        });

        isInitialLoad.current = false;

        const fetched: RecentActivity[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          let createdAtStr = new Date().toISOString();
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          }

          fetched.push({
            id: doc.id,
            userId: data.userId || 'anon',
            userName: data.userName || 'Otaku',
            userAvatarSeed: data.userAvatarSeed || 'User',
            userAvatar: data.userAvatar || null,
            animeId: Number(data.animeId),
            animeTitle: data.animeTitle || 'Anime',
            animeImage: data.animeImage || '',
            actionType: data.actionType || 'added_to_watchlist',
            status: data.status || 'plan_to_watch',
            listName: data.listName || 'İzleme Listesi',
            score: data.score ?? null,
            genres: data.genres || [],
            episodes: data.episodes ?? null,
            createdAt: createdAtStr
          });
        });

        // Merge real data with fallback seeds if database has few items
        if (fetched.length === 0) {
          setActivities(SEED_ACTIVITIES);
        } else if (fetched.length < 5) {
          const existingIds = new Set(fetched.map(f => f.animeId));
          const filteredSeeds = SEED_ACTIVITIES.filter(s => !existingIds.has(s.animeId));
          setActivities([...fetched, ...filteredSeeds]);
        } else {
          setActivities(fetched);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Could not fetch recent activities from firestore, using fallback:', err);
        setActivities(SEED_ACTIVITIES);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxItems, soundEnabled]);

  const isAnimeInWatchlist = (animeId: number) => {
    return watchlist.some((item) => item.anime.mal_id === animeId);
  };

  const handleQuickAdd = (e: React.MouseEvent, activity: RecentActivity) => {
    e.stopPropagation();
    if (isAnimeInWatchlist(activity.animeId)) {
      addToast(`"${activity.animeTitle}" zaten listende bulunuyor.`, 'info');
      return;
    }

    // Build standard Anime object
    const miniAnime: Anime = {
      mal_id: activity.animeId,
      title: activity.animeTitle,
      title_english: activity.animeTitle,
      images: {
        jpg: { image_url: activity.animeImage, large_image_url: activity.animeImage },
        webp: { image_url: activity.animeImage, large_image_url: activity.animeImage }
      },
      synopsis: '',
      score: activity.score ?? null,
      episodes: activity.episodes ?? null,
      status: 'Finished Airing',
      genres: (activity.genres || []).map((name, i) => ({ mal_id: i + 1, name })),
      year: new Date().getFullYear()
    };

    addToWatchlist(miniAnime, 'plan_to_watch');
    addToast(`"${activity.animeTitle}" izleme listene eklendi!`, 'success');
  };

  // Filter logic
  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    if (filter === 'custom') return act.actionType === 'added_to_custom_list';
    return act.status === filter;
  });

  const getStatusBadge = (activity: RecentActivity) => {
    if (activity.actionType === 'added_to_custom_list') {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider neo-shadow-sm">
          <Layers size={11} strokeWidth={3} /> {activity.listName || 'Özel Liste'}
        </span>
      );
    }

    switch (activity.status) {
      case 'watching':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            <Film size={11} strokeWidth={3} /> İzliyor
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            <Check size={11} strokeWidth={3} /> Tamamlandı
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            <Clock size={11} strokeWidth={3} /> Beklemede
          </span>
        );
      case 'dropped':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            Bıraktı
          </span>
        );
      case 'plan_to_watch':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-wider">
            <BookmarkPlus size={11} strokeWidth={3} /> İzlenecek
          </span>
        );
    }
  };

  const getActionSentence = (activity: RecentActivity) => {
    if (activity.actionType === 'added_to_custom_list') {
      return (
        <span>
          özel <span className="text-purple-400 font-black">"{activity.listName}"</span> listesine ekledi
        </span>
      );
    }

    switch (activity.status) {
      case 'watching':
        return <span>serisini <span className="text-emerald-400 font-black">izlemeye başladı</span></span>;
      case 'completed':
        return <span>serisini <span className="text-blue-400 font-black">tamamladı</span></span>;
      case 'on_hold':
        return <span>serisini <span className="text-amber-400 font-black">beklemeye aldı</span></span>;
      case 'dropped':
        return <span>serisini <span className="text-rose-400 font-black">bıraktı</span></span>;
      case 'plan_to_watch':
      default:
        return <span>serisini <span className="text-yellow-400 font-black">izleme listesine</span> ekledi</span>;
    }
  };

  // ==========================================
  // COMPACT MODE (Displayed directly on HomePage)
  // ==========================================
  if (compact) {
    return (
      <div className="bg-black border-4 border-white neo-shadow-white mb-8 overflow-hidden">
        {/* Live Ticker Bar */}
        <div className="bg-neutral-950 px-4 py-2.5 border-b-4 border-white flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white font-black text-[11px] uppercase tracking-widest border border-white">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              CANLI AKIŞ
            </span>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest hidden sm:inline flex items-center gap-1">
              <Radio size={14} className="animate-pulse text-amber-400" />
              FIRESTORE onSnapshot
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Ses efektini kapat" : "Ses efektini aç"}
              className="p-1 text-xs border border-white/40 hover:border-white text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={14} className="text-amber-400" /> : <VolumeX size={14} className="text-neutral-500" />}
            </button>

            <button
              onClick={handleSimulateActivity}
              disabled={isSimulating}
              className="px-3 py-1 text-xs font-black bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black border-2 border-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer neo-shadow"
              title="Test: Rastgele bir topluluk aktivitesi simüle et ve canlı animasyonu gör"
            >
              {isSimulating ? (
                <RefreshCw size={12} className="animate-spin text-black" strokeWidth={3} />
              ) : (
                <Zap size={12} className="text-black fill-black" strokeWidth={2.5} />
              )}
              <span>TEST SİMÜLASYONU</span>
            </button>

            {onViewAll && (
              <button
                onClick={onViewAll}
                className="px-2.5 py-1 text-xs font-black bg-white text-black hover:bg-neutral-200 uppercase tracking-wider transition-colors flex items-center gap-1 border border-black cursor-pointer"
              >
                <span>TÜMÜ</span>
                <ArrowRight size={12} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Pop-in Toast Banner inside compact feed */}
        <AnimatePresence>
          {latestLiveAlert && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-amber-400 text-black px-4 py-2 border-b-2 border-black font-black text-xs uppercase tracking-wider flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="px-1.5 py-0.2 bg-black text-amber-400 text-[10px] border border-black">YENİ DÜŞTÜ</span>
                <span className="truncate">
                  <strong>{latestLiveAlert.userName}</strong> az önce <strong>"{latestLiveAlert.animeTitle}"</strong> serisini ekledi!
                </span>
              </div>
              <button
                onClick={() => setLatestLiveAlert(null)}
                className="p-0.5 hover:bg-black/20 text-black ml-2 cursor-pointer shrink-0"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Cards Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {activities.slice(0, 3).map((act) => {
              const inList = isAnimeInWatchlist(act.animeId);
              const isNewlyArrived = newlyArrivedIds.has(act.id);

              return (
                <motion.div
                  key={act.id}
                  layout
                  initial={isNewlyArrived ? { scale: 0.85, y: -20, opacity: 0, rotate: -2 } : { opacity: 0, y: 10 }}
                  animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  onClick={() => navigate(`/anime/${act.animeId}`)}
                  className={cn(
                    "p-3 transition-all cursor-pointer group flex gap-3 relative overflow-hidden",
                    isNewlyArrived
                      ? "bg-amber-400/15 border-4 border-amber-400 shadow-[4px_4px_0px_#f59e0b] animate-pulse"
                      : "bg-neutral-900 border-2 border-white/20 hover:border-amber-400"
                  )}
                >
                  {isNewlyArrived && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 border-b border-l border-black uppercase tracking-widest flex items-center gap-1 z-10">
                      <Sparkles size={9} className="fill-black" /> YENİ GELDİ!
                    </div>
                  )}

                  <img
                    src={getSafeImageUrl(act.animeImage)}
                    alt={act.animeTitle}
                    className="w-14 h-20 object-cover border-2 border-white shrink-0 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <img
                          src={act.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${act.userAvatarSeed || act.userName}`}
                          alt={act.userName}
                          className="w-4 h-4 rounded-full border border-white/50 bg-white"
                        />
                        <span className="text-[10px] font-black text-neutral-300 truncate uppercase">{act.userName}</span>
                        <span className="text-[9px] text-neutral-500 font-bold ml-auto shrink-0 uppercase">
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-black text-white text-xs truncate uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                        {act.animeTitle}
                      </h4>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10">
                      {getStatusBadge(act)}
                      <button
                        onClick={(e) => handleQuickAdd(e, act)}
                        title={inList ? "Zaten Listende" : "Listeme Ekle"}
                        className={cn(
                          "px-2 py-1 border-2 transition-colors text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer",
                          inList
                            ? "bg-emerald-600 border-emerald-400 text-white"
                            : "bg-black border-white/40 text-white hover:bg-white hover:text-black hover:border-white"
                        )}
                      >
                        {inList ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
                        <span className="hidden xs:inline">{inList ? 'Eklendi' : 'Ekle'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Stream Footnote */}
        <div className="bg-neutral-950 px-4 py-2 border-t-2 border-white/10 flex items-center justify-between text-[11px] font-bold text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider">Aktif Canlı Firestore Akışı</span>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-amber-400 hover:text-white uppercase font-black tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
            >
              Tüm Canlı Akışı Aç ({activities.length}) →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // FULL PAGE FEED MODE (SON HAREKETLER TAB)
  // ==========================================
  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-950 via-black to-neutral-900 border-4 border-white p-6 neo-shadow-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Activity size={200} strokeWidth={1} className="text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-xs uppercase tracking-widest border border-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> CANLI YAYIN
              </span>
              <span className="px-2.5 py-0.5 bg-amber-400 text-black font-black text-xs uppercase tracking-widest border border-black flex items-center gap-1.5">
                <Radio size={12} className="text-black" /> FIRESTORE ONSNAPSHOT
              </span>
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                TOPLULUK HAREKETLERİ
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
              DİĞER ÜYELER NELER EKLİYOR?
            </h2>
            <p className="text-sm font-bold text-neutral-400 mt-1 uppercase tracking-wide max-w-xl">
              Anime severlerin izleme listelerine ve özel koleksiyonlarına anlık olarak eklediği serileri keşfet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "p-2.5 border-2 transition-all cursor-pointer flex items-center gap-2 text-xs font-black uppercase tracking-wider",
                soundEnabled 
                  ? "bg-amber-400 text-black border-black neo-shadow" 
                  : "bg-black text-neutral-400 border-white/30 hover:border-white"
              )}
              title={soundEnabled ? "Yeni hareket ses efektini kapat" : "Yeni hareket ses efektini aç"}
            >
              {soundEnabled ? <Volume2 size={16} strokeWidth={2.5} /> : <VolumeX size={16} strokeWidth={2.5} />}
              <span className="hidden sm:inline">{soundEnabled ? "SES AÇIK" : "SES KAPALI"}</span>
            </button>

            <span className="text-xs font-black text-neutral-400 uppercase tracking-widest bg-neutral-900 border-2 border-white/30 px-3 py-2 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" /> {activities.length} AKTİVİTE
            </span>

            <button
              onClick={handleSimulateActivity}
              disabled={isSimulating}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black border-2 border-black font-black uppercase text-xs tracking-wider transition-all neo-shadow flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Gerçek zamanlı Firestore akışını test etmek için rastgele anime aktivitesi simüle et"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-black" strokeWidth={3} />
                  <span>GÖNDERİLİYOR...</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="text-black fill-black" strokeWidth={2.5} />
                  <span>SİMÜLASYON ÜRET</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t-2 border-white/10 relative z-10">
          <span className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter size={13} /> FİLTRELE:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'all'
                ? "bg-white text-black border-white neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-white"
            )}
          >
            TÜMÜ ({activities.length})
          </button>
          <button
            onClick={() => setFilter('plan_to_watch')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'plan_to_watch'
                ? "bg-yellow-400 text-black border-yellow-400 neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-yellow-400"
            )}
          >
            İZLENECEKLER
          </button>
          <button
            onClick={() => setFilter('watching')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'watching'
                ? "bg-emerald-500 text-black border-emerald-500 neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-emerald-500"
            )}
          >
            İZLENENLER
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'completed'
                ? "bg-blue-500 text-white border-blue-500 neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-blue-500"
            )}
          >
            TAMAMLANANLAR
          </button>
          <button
            onClick={() => setFilter('custom')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
              filter === 'custom'
                ? "bg-purple-600 text-white border-purple-600 neo-shadow-white"
                : "bg-black text-neutral-300 border-white/30 hover:border-purple-600"
            )}
          >
            ÖZEL LİSTELER
          </button>
        </div>
      </div>

      {/* Floating Live Drop Notification */}
      <AnimatePresence>
        {latestLiveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-amber-400 text-black border-4 border-black p-4 neo-shadow flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <div className="font-black text-sm uppercase tracking-wide">
                <span>🔴 YENİ HAREKET DÜŞTÜ: </span>
                <span className="underline decoration-2">{latestLiveAlert.userName}</span>
                <span>, </span>
                <span className="bg-black text-white px-2 py-0.5">"{latestLiveAlert.animeTitle}"</span>
                <span> serisini {latestLiveAlert.listName} listesine ekledi!</span>
              </div>
            </div>
            <button
              onClick={() => setLatestLiveAlert(null)}
              className="p-1 hover:bg-black hover:text-white transition-colors cursor-pointer border-2 border-black"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Stream */}
      {loading ? (
        <div className="bg-black border-4 border-white/20 p-12 text-center neo-shadow">
          <RefreshCw size={36} className="animate-spin text-amber-400 mx-auto mb-4" />
          <p className="font-black text-white uppercase tracking-widest">Canlı Firestore akışı bağlanıyor...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-black border-4 border-white/20 p-12 text-center neo-shadow">
          <Activity size={48} className="text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
            BU KATEGORİDE HENÜZ HAREKET YOK
          </h3>
          <p className="text-neutral-400 font-bold uppercase text-sm mb-6">
            Farklı bir filtre seçebilir veya simülasyon butonuyla bir hareket oluşturabilirsin!
          </p>
          <button
            onClick={handleSimulateActivity}
            className="px-6 py-3 bg-amber-400 text-black border-2 border-black font-black uppercase text-xs tracking-wider neo-shadow hover:bg-amber-300 transition-all cursor-pointer"
          >
            ⚡ HEMEN BİR TEST AKTİVİTESİ ÜRET
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredActivities.map((activity, idx) => {
              const inList = isAnimeInWatchlist(activity.animeId);
              const isNewlyArrived = newlyArrivedIds.has(activity.id);

              return (
                <motion.div
                  key={activity.id}
                  layout
                  initial={isNewlyArrived ? { opacity: 0, y: -30, scale: 0.92, rotate: -1.5 } : { opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25, delay: idx === 0 ? 0 : 0.02 }}
                  className={cn(
                    "p-4 md:p-5 transition-all group relative overflow-hidden",
                    isNewlyArrived
                      ? "bg-amber-400/10 border-4 border-amber-400 shadow-[6px_6px_0px_#f59e0b]"
                      : "bg-black border-4 border-white/30 hover:border-white neo-shadow-white"
                  )}
                >
                  {/* Newly arrived Neo-Brutalist Banner */}
                  {isNewlyArrived && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-black font-black text-xs px-3 py-1 border-b-2 border-l-2 border-black uppercase tracking-widest flex items-center gap-1.5 z-20 animate-pulse">
                      <Sparkles size={13} className="fill-black" /> YENİ GELDİ (CANLI)
                    </div>
                  )}

                  {/* Top user action row */}
                  <div className="flex items-center justify-between mb-3 border-b-2 border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          activity.userAvatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.userAvatarSeed || activity.userName}`
                        }
                        alt={activity.userName}
                        className="w-10 h-10 border-2 border-white bg-neutral-200 shrink-0 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-white uppercase tracking-wider text-sm hover:text-amber-400 transition-colors">
                            {activity.userName}
                          </span>
                          <span className="text-xs text-neutral-300 uppercase tracking-wide">
                            {getActionSentence(activity)}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          @{activity.userName.toLowerCase().replace(/\s+/g, '_')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-900 border border-white/20 px-2.5 py-1">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Anime Details Card inside Activity */}
                  <div className="bg-neutral-950 border-2 border-white/20 p-3 md:p-4 flex flex-col sm:flex-row gap-4 hover:border-amber-400/80 transition-colors">
                    <div 
                      onClick={() => navigate(`/anime/${activity.animeId}`)}
                      className="relative shrink-0 w-24 h-32 sm:w-28 sm:h-36 overflow-hidden border-2 border-white bg-black cursor-pointer group/img"
                    >
                      <img
                        src={getSafeImageUrl(activity.animeImage)}
                        alt={activity.animeTitle}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink size={22} className="text-white drop-shadow-md" strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3
                            onClick={() => navigate(`/anime/${activity.animeId}`)}
                            className="font-black text-lg text-white uppercase tracking-tight hover:text-amber-400 transition-colors cursor-pointer leading-tight line-clamp-1"
                          >
                            {activity.animeTitle}
                          </h3>
                          {getStatusBadge(activity)}
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-3 text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">
                          {activity.score && (
                            <span className="text-amber-400 font-black flex items-center gap-1 bg-black/60 px-2 py-0.5 border border-amber-400/30">
                              <Star size={13} fill="currentColor" /> {activity.score}
                            </span>
                          )}
                          {activity.episodes && (
                            <span>{activity.episodes} BÖLÜM</span>
                          )}
                        </div>

                        {/* Genre tags */}
                        {activity.genres && activity.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {activity.genres.slice(0, 3).map((genre, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-900 border border-white/20 px-2 py-0.5"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-3 border-t border-white/10 mt-auto">
                        <button
                          onClick={(e) => handleQuickAdd(e, activity)}
                          className={cn(
                            "px-4 py-2 font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center gap-2 cursor-pointer",
                            inList
                              ? "bg-emerald-600 text-white border-emerald-400 cursor-default"
                              : "bg-white text-black border-white hover:bg-amber-400 hover:border-amber-400 hover:text-black neo-shadow-white active:translate-x-0.5 active:translate-y-0.5"
                          )}
                        >
                          {inList ? (
                            <>
                              <Check size={15} strokeWidth={3} />
                              LİSTENDE EKLİ
                            </>
                          ) : (
                            <>
                              <BookmarkPlus size={15} strokeWidth={2.5} />
                              LİSTEME EKLE
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => navigate(`/anime/${activity.animeId}`)}
                          className="px-4 py-2 font-black text-xs uppercase tracking-widest border-2 border-white/40 text-white hover:border-white hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink size={14} /> DETAYLARI GÖR
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
