import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WatchlistItem, WatchStatus, Anime, ForumPost, Friend, UserProfile, UserNamedList } from '../types';
import { auth, googleProvider, db } from '../firebase';
import { useDailyPoll } from '../hooks/useDailyPoll';
import { onAuthStateChanged, signInWithPopup, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, getAdditionalUserInfo } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, getDoc, writeBatch, addDoc, serverTimestamp } from 'firebase/firestore';
import { resolveAvatar } from '../lib/avatar';


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
    name: 'Seasonal',
    description: 'Bu sezon haftalık takip ettiğim güncel seriler.',
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
  
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [friends] = useState<Friend[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Daily Poll (src/hooks/useDailyPoll.ts — koleksiyonu dinler, rotasyona göre seçer)
  const activePoll = useDailyPoll();

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
      // Güncel listeyi her zaman uygula (silinen gönderiler ekranda kalmasın)
      setForumPosts(posts);
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

  const markOnboardingPending = () => {
    try {
      localStorage.setItem('anisync_onboarding_pending', '1');
    } catch {
      // localStorage kapalıysa onboarding atlanır, akış bozulmaz
    }
  };

  const loginWithGoogle = async () => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      if (getAdditionalUserInfo(credential)?.isNewUser) {
        markOnboardingPending();
      }
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
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      if (getAdditionalUserInfo(credential)?.isNewUser) {
        markOnboardingPending();
      }
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
      // Misafirler için yalnızca yerel kayıt (topluluk akışına sahte kayıt yazılmaz)
      setWatchlist(prev => {
        if (prev.some(item => item.anime.mal_id === anime.mal_id)) return prev;
        return [...prev, { anime, status, userScore: 0, episodesWatched: 0, addedAt: new Date().toISOString() }];
      });
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

    // Log live activity if completed (yalnızca giriş yapmış kullanıcılar)
    if (isCompleted && currentUser) {
      try {
        await addDoc(collection(db, 'recentActivities'), {
          userId: currentUser.uid,
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
        avatar: resolveAvatar(currentUser?.photoURL, userProfile.avatarSeed),
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
    
    const { isLikedByMe: _localIsLiked, ...postData } = post;
    const updatedPost = {
      ...postData,
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
        avatar: resolveAvatar(currentUser?.photoURL, userProfile.avatarSeed),
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
    
    const { isLikedByMe: _localIsLiked2, ...postData } = post;
    const updatedPost = {
      ...postData,
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
