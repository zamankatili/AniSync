import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WatchlistItem, WatchStatus, Anime, ForumPost, Friend, UserProfile, UserNamedList } from '../types';
import { auth, googleProvider, db } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, getDoc, writeBatch, addDoc, serverTimestamp } from 'firebase/firestore';
import { SEED_POLLS, generateMorePolls } from '../data/polls';

interface AppState {
  watchlist: WatchlistItem[];
  addToWatchlist: (anime: Anime, status: WatchStatus) => void;
  updateWatchlistItem: (mal_id: number, updates: Partial<WatchlistItem>) => void;
  incrementEpisode: (mal_id: number) => Promise<{ completed: boolean; newEp: number; title: string }>;
  decrementEpisode: (mal_id: number) => Promise<void>;
  setEpisodeCount: (mal_id: number, count: number) => Promise<void>;
  importWatchlistItems: (items: WatchlistItem[]) => Promise<number>;
  removeFromWatchlist: (mal_id: number) => void;
  userNamedLists: UserNamedList[];
  createUserNamedList: (data: { name: string; description?: string; emoji?: string; color?: string; animeIds?: number[] }) => string;
  updateUserNamedList: (listId: string, updates: Partial<UserNamedList>) => void;
  deleteUserNamedList: (listId: string) => void;
  toggleAnimeInNamedList: (listId: string, mal_id: number) => void;
  forumPosts: ForumPost[];
  addForumPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'author'>) => void;
  deletePost: (postId: string) => void;
  friends: Friend[];
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  currentUser: User | null;
  authLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  activePoll: any;
}

const mockFriends: Friend[] = [
  { id: '1', name: 'KiraYukimura', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kira', lastOnline: '2m ago', currentlyWatching: "Frieren: Beyond Journey's End" },
  { id: '2', name: 'ZoroLostAgain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoro', lastOnline: '1h ago', currentlyWatching: 'One Piece' },
  { id: '3', name: 'GojoSaturo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gojo', lastOnline: '1d ago', currentlyWatching: 'Jujutsu Kaisen' },
];

const mockForumPosts: ForumPost[] = [
  {
    id: 'post3',
    author: { name: 'SakuraBlossom', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sakura', isFriend: false },
    title: 'Haftanın Önerisi: Sousou no Frieren',
    content: 'Fantastik dünyaları seviyorsanız bu başyapıtı kesinlikle kaçırmamalısınız. Müzikleri, çizimleri, karakter gelişimi her şeyiyle mükemmel. Puanım 10/10!',
    likes: 342,
    replies: 89,
    category: 'Recommendations',
    type: 'recommendation',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    animeRef: {
      id: 52991,
      title: 'Sousou no Frieren',
      image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
      score: 9.38
    }
  },
  {
    id: 'post4',
    author: { name: 'GojoSaturo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gojo', isFriend: true },
    title: 'Benim Top 5 Shounen Listem 🏆',
    content: 'Aksiyon dolu shounen serilerini sıraladım, sizin favoriniz hangisi?',
    likes: 215,
    replies: 56,
    category: 'Lists',
    type: 'list_share',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    listRef: {
      listName: 'En İyi Aksiyon Serileri',
      animes: [
        { id: 5114, title: 'Fullmetal Alchemist', image: 'https://cdn.myanimelist.net/images/anime/1223/96541l.webp' },
        { id: 11061, title: 'Hunter x Hunter', image: 'https://cdn.myanimelist.net/images/anime/1337/99013l.webp' },
        { id: 40748, title: 'Jujutsu Kaisen', image: 'https://cdn.myanimelist.net/images/anime/1171/109222l.webp' },
      ]
    }
  },
  {
    id: 'post1',
    author: { name: 'KiraYukimura', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kira', isFriend: true },
    title: 'Thoughts on the latest Solo Leveling episode?',
    content: 'The animation quality was absolutely insane, Ufotable level almost! What did you guys think of the pacing?',
    likes: 124,
    replies: 45,
    category: 'Discussion',
    type: 'discussion',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'post2',
    author: { name: 'OtakuMaster99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Otaku', isFriend: false },
    title: 'Need recommendations for emotional romance anime',
    content: 'I just finished Your Lie in April and Clannad After Story. I need something to fill the void, please help.',
    likes: 89,
    replies: 112,
    category: 'Discussion',
    type: 'discussion',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const DEFAULT_USER_NAMED_LISTS: UserNamedList[] = [
  {
    id: 'favorites',
    name: 'Favorites',
    description: 'En çok sevdiğim, tekrar tekrar izleyebileceğim başyapıtlar.',
    emoji: '⭐',
    color: '#eab308',
    animeIds: [],
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'want_to_watch',
    name: 'Want to Watch',
    description: 'Önümüzdeki günlerde mutlaka başlamak istediğim seriler.',
    emoji: '🎯',
    color: '#06b6d4',
    animeIds: [],
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'seasonal',
    name: 'Seasonal (Sonbahar 2026)',
    description: 'Sonbahar 2026 sezonunda haftalık takip ettiğim güncel seriler.',
    emoji: '🍂',
    color: '#f43f5e',
    animeIds: [],
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('anisync_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [userNamedLists, setUserNamedLists] = useState<UserNamedList[]>(() => {
    try {
      const saved = localStorage.getItem('anisync_user_named_lists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_USER_NAMED_LISTS;
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('anisync_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Hikikomori',
      handle: 'otaku_master',
      avatarSeed: 'Me',
      joinYear: new Date().getFullYear()
    };
  });
  
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(mockForumPosts);
  const [friends] = useState<Friend[]>(mockFriends);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Daily Poll state from Firestore
  const [activePoll, setActivePoll] = useState<any>(null);

  // Firestore Sync Effect for Polls
  useEffect(() => {
    // We listen to a specific document that stores the "Current Daily Poll"
    // Or we just fetch all polls and pick one based on the day.
    // To make it fully "Database Driven", we'll sync the polls collection.
    const pollsRef = collection(db, 'polls');
    const unsubscribe = onSnapshot(pollsRef, async (snapshot) => {
      try {
        if (snapshot.empty) {
          // Seed the database with 50 polls if empty!
          const batch = writeBatch(db);
          const allPolls = [...SEED_POLLS, ...generateMorePolls(35)]; // 15 + 35 = 50 polls
          
          allPolls.forEach((pollItem, index) => {
            const newDocRef = doc(collection(db, 'polls'), `poll_${index}`);
            batch.set(newDocRef, { ...pollItem, pollIndex: index, createdAt: new Date().toISOString() });
          });
          await batch.commit();
        } else {
          const pollsList: any[] = [];
          snapshot.forEach(doc => pollsList.push({ id: doc.id, ...doc.data() }));
          
          const minuteOfHour = Math.floor(new Date().getTime() / 1000 / 60);
          const current = pollsList.find(p => p.pollIndex === (minuteOfHour % pollsList.length));
          if (current) {
            setActivePoll(current);
          } else if (pollsList.length > 0) {
            setActivePoll(pollsList[0]);
          }
        }
      } catch (err) {
        console.warn('Polls sync warning:', err);
      }
    }, (error) => {
      console.warn("Polls listener permission or network error (falling back to local):", error);
    });
    
    return () => unsubscribe();
  }, []);

  // Firestore Sync Effect for Forum Posts
  useEffect(() => {
    const q = query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts: ForumPost[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as ForumPost;
        posts.push({
           ...data,
           isLikedByMe: auth.currentUser ? (data.likedBy || []).includes(auth.currentUser.uid) : false
        });
      });
      if (posts.length > 0) {
        setForumPosts(posts);
      }
    }, (error) => {
      console.warn("Forum posts listener permission or network error (using cached posts):", error);
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  // Firestore Sync Effect for Watchlist & Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setUserProfile(prev => ({
          ...prev,
          name: user.displayName || prev.name,
          handle: user.email?.split('@')[0] || prev.handle,
        }));
        
        // Sync Profile Data
        setDoc(doc(db, `users/${user.uid}`), {
          name: user.displayName || 'Hikikomori',
          handle: user.email?.split('@')[0] || 'otaku_master',
          photoURL: user.photoURL || null
        }, { merge: true });

        // Sync local watchlist to Firestore
        const localWatchlistString = localStorage.getItem('anisync_watchlist');
        if (localWatchlistString) {
          try {
            const localWatchlist = JSON.parse(localWatchlistString) as WatchlistItem[];
            if (localWatchlist.length > 0) {
              const batch = writeBatch(db);
              localWatchlist.forEach(item => {
                const docRef = doc(db, `users/${user.uid}/watchlist`, item.anime.mal_id.toString());
                batch.set(docRef, item, { merge: true });
              });
              await batch.commit();
              // Only clear local storage after successful sync
              localStorage.removeItem('anisync_watchlist');
            }
          } catch(e) {
            console.error("Local sync error", e);
          }
        }

        // Listen to watchlist in firestore
        const wq = collection(db, `users/${user.uid}/watchlist`);
        const unsubWatchlist = onSnapshot(wq, (snapshot) => {
          const wlist: WatchlistItem[] = [];
          snapshot.forEach((doc) => {
            wlist.push(doc.data() as WatchlistItem);
          });
          setWatchlist(wlist.sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()));
        }, (err) => {
          console.warn("Watchlist listener permission or network error:", err);
        });
        return () => unsubWatchlist();
      } else {
        setWatchlist([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Email register failed:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem('anisync_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('anisync_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('anisync_user_named_lists', JSON.stringify(userNamedLists));
    if (currentUser) {
      setDoc(doc(db, `users/${currentUser.uid}/customData`, 'namedLists'), {
        lists: userNamedLists,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Could not sync namedLists to Firestore:', err));
    }
  }, [userNamedLists, currentUser]);

  const createUserNamedList = (data: { name: string; description?: string; emoji?: string; color?: string; animeIds?: number[] }) => {
    const id = 'list_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newList: UserNamedList = {
      id,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      emoji: data.emoji || '📁',
      color: data.color || '#f43f5e',
      animeIds: data.animeIds || [],
      createdAt: new Date().toISOString()
    };
    setUserNamedLists(prev => [...prev, newList]);
    return id;
  };

  const updateUserNamedList = (listId: string, updates: Partial<UserNamedList>) => {
    setUserNamedLists(prev => prev.map(l => l.id === listId ? { ...l, ...updates } : l));
  };

  const deleteUserNamedList = (listId: string) => {
    setUserNamedLists(prev => prev.filter(l => l.id !== listId));
  };

  const toggleAnimeInNamedList = (listId: string, mal_id: number) => {
    setUserNamedLists(prev => prev.map(l => {
      if (l.id === listId) {
        const exists = l.animeIds.includes(mal_id);
        const updatedIds = exists 
          ? l.animeIds.filter(id => id !== mal_id)
          : [...l.animeIds, mal_id];
        return { ...l, animeIds: updatedIds };
      }
      return l;
    }));
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    if (auth.currentUser) {
      if (updates.name) {
        try {
          await updateProfile(auth.currentUser, { displayName: updates.name });
        } catch (err) {
          console.error("Firebase updateProfile failed:", err);
        }
      }
      try {
        await setDoc(doc(db, `users/${auth.currentUser.uid}`), updates, { merge: true });
      } catch (e) {
        console.error("Firestore user sync error", e);
      }
    }
  };

  const addToWatchlist = async (anime: Anime, status: WatchStatus) => {
    if (!currentUser) {
      // Fallback local
      setWatchlist(prev => {
        if (prev.some(item => item.anime.mal_id === anime.mal_id)) return prev;
        return [...prev, { anime, status, userScore: 0, episodesWatched: 0, addedAt: new Date().toISOString() }];
      });
      // Also log activity to recentActivities so the community feed updates in real-time
      try {
        await addDoc(collection(db, 'recentActivities'), {
          userId: 'guest_' + Math.random().toString(36).substring(2, 8),
          userName: userProfile.name || userProfile.handle || 'Misafir Otaku',
          userAvatarSeed: userProfile.avatarSeed || 'Me',
          userAvatar: null,
          animeId: anime.mal_id,
          animeTitle: anime.title_english || anime.title,
          animeImage: anime.images?.webp?.large_image_url || anime.images?.webp?.image_url || anime.images?.jpg?.image_url || '',
          actionType: 'added_to_watchlist',
          status,
          listName: status === 'watching' ? 'İzleniyor' : status === 'completed' ? 'Tamamlandı' : status === 'plan_to_watch' ? 'İzlenecekler' : status === 'on_hold' ? 'Beklemede' : 'Bırakılanlar',
          score: anime.score ?? null,
          genres: anime.genres?.map(g => g.name) || [],
          episodes: anime.episodes ?? null,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Could not log guest activity:", e);
      }
      return;
    }
    const item: WatchlistItem = { anime, status, userScore: 0, episodesWatched: 0, addedAt: new Date().toISOString() };
    await setDoc(doc(db, `users/${currentUser.uid}/watchlist`, anime.mal_id.toString()), item);

    try {
      await addDoc(collection(db, 'recentActivities'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || userProfile.name || userProfile.handle || 'Otaku',
        userAvatarSeed: userProfile.avatarSeed || 'Me',
        userAvatar: currentUser.photoURL || null,
        animeId: anime.mal_id,
        animeTitle: anime.title_english || anime.title,
        animeImage: anime.images?.webp?.large_image_url || anime.images?.webp?.image_url || anime.images?.jpg?.image_url || '',
        actionType: 'added_to_watchlist',
        status,
        listName: status === 'watching' ? 'İzleniyor' : status === 'completed' ? 'Tamamlandı' : status === 'plan_to_watch' ? 'İzlenecekler' : status === 'on_hold' ? 'Beklemede' : 'Bırakılanlar',
        score: anime.score ?? null,
        genres: anime.genres?.map(g => g.name) || [],
        episodes: anime.episodes ?? null,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Could not log user activity:", e);
    }
  };

  const updateWatchlistItem = async (mal_id: number, updates: Partial<WatchlistItem>) => {
    if (!currentUser) {
      setWatchlist(prev => prev.map(item => item.anime.mal_id === mal_id ? { ...item, ...updates } : item));
      return;
    }
    const itemRef = doc(db, `users/${currentUser.uid}/watchlist`, mal_id.toString());
    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      await setDoc(itemRef, { ...itemDoc.data(), ...updates });
    }
  };

  const incrementEpisode = async (mal_id: number): Promise<{ completed: boolean; newEp: number; title: string }> => {
    const item = watchlist.find(i => i.anime.mal_id === mal_id);
    if (!item) return { completed: false, newEp: 0, title: '' };

    const title = item.anime.title_english || item.anime.title;
    const currentEp = item.episodesWatched || 0;
    const totalEp = item.anime.episodes;
    const newEp = currentEp + 1;
    const isCompleted = totalEp !== null && totalEp !== undefined && newEp >= totalEp;

    const updates: Partial<WatchlistItem> = {
      episodesWatched: isCompleted && totalEp ? totalEp : newEp,
      status: isCompleted ? 'completed' : item.status
    };

    if (!currentUser) {
      setWatchlist(prev => prev.map(i => i.anime.mal_id === mal_id ? { ...i, ...updates } : i));
    } else {
      const itemRef = doc(db, `users/${currentUser.uid}/watchlist`, mal_id.toString());
      const itemDoc = await getDoc(itemRef);
      if (itemDoc.exists()) {
        await setDoc(itemRef, { ...itemDoc.data(), ...updates });
      }
    }

    // Log live activity if completed or milestone
    if (isCompleted) {
      try {
        await addDoc(collection(db, 'recentActivities'), {
          userId: currentUser?.uid || 'guest_' + Math.random().toString(36).substring(2, 8),
          userName: currentUser?.displayName || userProfile.name || userProfile.handle || 'Otaku',
          userAvatarSeed: userProfile.avatarSeed || 'Me',
          userAvatar: currentUser?.photoURL || null,
          animeId: item.anime.mal_id,
          animeTitle: title,
          animeImage: item.anime.images?.webp?.large_image_url || item.anime.images?.webp?.image_url || '',
          actionType: 'status_changed',
          status: 'completed',
          listName: 'Tamamlandı',
          score: item.userScore || item.anime.score || null,
          genres: item.anime.genres?.map(g => g.name) || [],
          episodes: totalEp,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Could not log completed activity:", e);
      }
    }

    return { completed: isCompleted, newEp: updates.episodesWatched || newEp, title };
  };

  const decrementEpisode = async (mal_id: number) => {
    const item = watchlist.find(i => i.anime.mal_id === mal_id);
    if (!item || (item.episodesWatched || 0) <= 0) return;

    const newEp = Math.max(0, (item.episodesWatched || 0) - 1);
    await updateWatchlistItem(mal_id, { episodesWatched: newEp });
  };

  const setEpisodeCount = async (mal_id: number, count: number) => {
    const item = watchlist.find(i => i.anime.mal_id === mal_id);
    if (!item) return;

    const totalEp = item.anime.episodes;
    const safeCount = Math.max(0, count);
    const isCompleted = totalEp !== null && totalEp !== undefined && safeCount >= totalEp;

    await updateWatchlistItem(mal_id, {
      episodesWatched: safeCount,
      status: isCompleted ? 'completed' : item.status
    });
  };

  const importWatchlistItems = async (items: WatchlistItem[]): Promise<number> => {
    if (!items || items.length === 0) return 0;

    if (!currentUser) {
      // Merge with existing local watchlist without duplicating IDs
      setWatchlist(prev => {
        const map = new Map<number, WatchlistItem>();
        prev.forEach(item => map.set(item.anime.mal_id, item));
        items.forEach(item => map.set(item.anime.mal_id, item));
        const merged = Array.from(map.values());
        localStorage.setItem('anisync_watchlist', JSON.stringify(merged));
        return merged;
      });
      return items.length;
    }

    // Write batch for authenticated user in chunks of 450 (Firestore limit is 500)
    const chunkSize = 450;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(item => {
        const docRef = doc(db, `users/${currentUser.uid}/watchlist`, item.anime.mal_id.toString());
        batch.set(docRef, item, { merge: true });
      });
      await batch.commit();
    }

    // Log single batch activity
    try {
      await addDoc(collection(db, 'recentActivities'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || userProfile.name || userProfile.handle || 'Otaku',
        userAvatarSeed: userProfile.avatarSeed || 'Me',
        userAvatar: currentUser.photoURL || null,
        animeId: items[0].anime.mal_id,
        animeTitle: `${items.length} Anime İçe Aktarıldı`,
        animeImage: items[0].anime.images?.webp?.image_url || '',
        actionType: 'added_to_watchlist',
        status: 'watching',
        listName: 'İçe Aktarma',
        score: null,
        genres: ['Import', 'MAL/AniList'],
        episodes: items.length,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Could not log import activity:", e);
    }

    return items.length;
  };

  const removeFromWatchlist = async (mal_id: number) => {
    if (!currentUser) {
      setWatchlist(prev => prev.filter(item => item.anime.mal_id !== mal_id));
      return;
    }
    await deleteDoc(doc(db, `users/${currentUser.uid}/watchlist`, mal_id.toString()));
  };

  const addForumPost = async (post: Omit<ForumPost, 'id' | 'createdAt' | 'author'>) => {
    const newPost: ForumPost = {
      ...post,
      author: {
        name: currentUser?.displayName || userProfile.name,
        avatar: currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`,
        isFriend: true,
        uid: currentUser?.uid
      },
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      likedBy: [],
      comments: []
    };
    if (!currentUser) {
      setForumPosts([newPost, ...forumPosts]);
      return;
    }
    await setDoc(doc(db, 'forumPosts', newPost.id), newPost);
  };

  const toggleLike = async (postId: string) => {
    const post = forumPosts.find(p => p.id === postId);
    if (!post) return;
    
    if (!currentUser) {
      setForumPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        likes: p.isLikedByMe ? p.likes - 1 : p.likes + 1,
        isLikedByMe: !p.isLikedByMe
      } : p));
      return;
    }
    
    // Remote logic
    const likedBy = post.likedBy || [];
    const idx = likedBy.indexOf(currentUser.uid);
    const updatedLikedBy = [...likedBy];
    
    let isLikedByMe = false;
    if (idx > -1) {
      updatedLikedBy.splice(idx, 1);
    } else {
      updatedLikedBy.push(currentUser.uid);
      isLikedByMe = true;
    }
    
    const updatedPost = {
      ...post,
      likes: updatedLikedBy.length,
      likedBy: updatedLikedBy
    };
    
    // locally modify to show immediately
    setForumPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        likes: updatedLikedBy.length,
        likedBy: updatedLikedBy,
        isLikedByMe: isLikedByMe
    } : p));
    
    await setDoc(doc(db, 'forumPosts', postId), updatedPost);
  };

  const deletePost = async (postId: string) => {
    if (!currentUser) {
      setForumPosts(prev => prev.filter(p => p.id !== postId));
      return;
    }
    await deleteDoc(doc(db, 'forumPosts', postId));
  };

  const addComment = async (postId: string, content: string) => {
    const post = forumPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      author: {
        name: currentUser?.displayName || userProfile.name,
        avatar: currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`,
        isFriend: true
      },
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    
    if (!currentUser) {
      setForumPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        replies: p.replies + 1,
        comments: [...(p.comments || []), newComment]
      } : p));
      return;
    }
    
    const updatedPost = {
      ...post,
      replies: post.replies + 1,
      comments: [...(post.comments || []), newComment]
    };
    await setDoc(doc(db, 'forumPosts', postId), updatedPost);
  };

  return (
    <AppContext.Provider value={{
      watchlist, addToWatchlist, updateWatchlistItem, incrementEpisode, decrementEpisode, setEpisodeCount, importWatchlistItems, removeFromWatchlist,
      userNamedLists, createUserNamedList, updateUserNamedList, deleteUserNamedList, toggleAnimeInNamedList,
      forumPosts, addForumPost, deletePost, friends, toggleLike, addComment,
      userProfile, updateUserProfile, currentUser, authLoading, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout,
      activePoll
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
