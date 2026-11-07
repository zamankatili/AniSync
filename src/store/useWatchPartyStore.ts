import { create } from 'zustand';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, addDoc, 
  serverTimestamp, query, orderBy, limit, getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  WatchPartyRoomData, WatchPartyMessage, FloatingReaction, 
  INITIAL_FEATURED_ROOMS, REACTION_TYPES, extractYouTubeId 
} from '../data/watchPartySeed';

interface WatchPartyState {
  rooms: WatchPartyRoomData[];
  activeRoom: WatchPartyRoomData | null;
  messages: WatchPartyMessage[];
  reactions: FloatingReaction[];
  isLoading: boolean;
  userOffsetSeconds: number; // difference between local player and host time
  isSynced: boolean;
  
  // Actions
  fetchRooms: () => () => void;
  joinRoom: (roomId: string, user: { uid: string; displayName?: string | null; photoURL?: string | null }) => () => void;
  leaveRoom: () => void;
  createRoom: (roomData: Partial<WatchPartyRoomData>, user: { uid: string; displayName?: string | null; photoURL?: string | null }) => Promise<string>;
  togglePlayPause: (roomId: string, isPlaying: boolean, currentTime: number) => Promise<void>;
  seekTo: (roomId: string, newTime: number) => Promise<void>;
  toggleLock: (roomId: string, isLocked: boolean) => Promise<void>;
  sendMessage: (roomId: string, user: { uid: string; displayName?: string | null; photoURL?: string | null }, text: string, currentVideoTime?: number) => Promise<void>;
  sendReaction: (roomId: string, user: { uid: string; displayName?: string | null }, reactionId: string) => Promise<void>;
  syncWithHost: (hostTime: number) => void;
}

export const useWatchPartyStore = create<WatchPartyState>((set, get) => ({
  rooms: INITIAL_FEATURED_ROOMS,
  activeRoom: null,
  messages: [],
  reactions: [],
  isLoading: false,
  userOffsetSeconds: 0,
  isSynced: true,

  fetchRooms: () => {
    set({ isLoading: true });
    const roomsCol = collection(db, 'watchPartyRooms');
    const q = query(roomsCol, orderBy('createdAt', 'desc'), limit(30));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, use seed rooms
        set({ rooms: INITIAL_FEATURED_ROOMS, isLoading: false });
        return;
      }
      
      const firestoreRooms: WatchPartyRoomData[] = [];
      snapshot.forEach((d) => {
        firestoreRooms.push({ id: d.id, ...d.data() } as WatchPartyRoomData);
      });

      // Merge firestore rooms with seed rooms so initial rooms are always accessible
      const existingIds = new Set(firestoreRooms.map(r => r.id));
      const remainingSeed = INITIAL_FEATURED_ROOMS.filter(r => !existingIds.has(r.id));
      set({ rooms: [...firestoreRooms, ...remainingSeed], isLoading: false });
    }, (err) => {
      console.warn('WatchParty fetch error, using local fallback:', err);
      set({ rooms: INITIAL_FEATURED_ROOMS, isLoading: false });
    });

    return unsubscribe;
  },

  joinRoom: (roomId: string, user) => {
    set({ isLoading: true, messages: [], reactions: [] });

    const roomDocRef = doc(db, 'watchPartyRooms', roomId);

    // 1. Ensure room exists in Firestore
    getDoc(roomDocRef).then((snap) => {
      if (!snap.exists()) {
        const seed = INITIAL_FEATURED_ROOMS.find(r => r.id === roomId);
        if (seed) {
          setDoc(roomDocRef, {
            ...seed,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }).catch(console.error);
        }
      }
    }).catch(console.error);

    // 2. Listen to room updates
    const unsubRoom = onSnapshot(roomDocRef, (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as WatchPartyRoomData;
        set({ activeRoom: data, isLoading: false });
      } else {
        const seed = INITIAL_FEATURED_ROOMS.find(r => r.id === roomId);
        if (seed) {
          set({ activeRoom: seed, isLoading: false });
        }
      }
    }, (err) => {
      console.warn('Room listener error, using fallback:', err);
      const seed = INITIAL_FEATURED_ROOMS.find(r => r.id === roomId);
      if (seed) set({ activeRoom: seed, isLoading: false });
    });

    // 3. Listen to messages
    const msgsCol = collection(db, 'watchPartyRooms', roomId, 'messages');
    const qMsgs = query(msgsCol, orderBy('createdAt', 'asc'), limit(60));
    const unsubMsgs = onSnapshot(qMsgs, (snap) => {
      const list: WatchPartyMessage[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as WatchPartyMessage);
      });
      set({ messages: list });
    }, (err) => {
      console.warn('Messages listener error:', err);
    });

    // 4. Listen to reactions
    const reactCol = collection(db, 'watchPartyRooms', roomId, 'reactions');
    const qReact = query(reactCol, orderBy('createdAt', 'desc'), limit(20));
    const unsubReact = onSnapshot(qReact, (snap) => {
      const list: FloatingReaction[] = [];
      const now = Date.now();
      snap.forEach((d) => {
        const item = { id: d.id, ...d.data() } as FloatingReaction;
        // Keep reactions from the last 12 seconds
        if (now - (item.createdAt || 0) < 12000) {
          list.push(item);
        }
      });
      set({ reactions: list });
    }, (err) => {
      console.warn('Reactions listener error:', err);
    });

    return () => {
      unsubRoom();
      unsubMsgs();
      unsubReact();
    };
  },

  leaveRoom: () => {
    set({ activeRoom: null, messages: [], reactions: [] });
  },

  createRoom: async (roomData, user) => {
    const youtubeId = extractYouTubeId(roomData.videoUrl || '');
    const randomCode = 'ANM-' + Math.floor(100 + Math.random() * 900);
    const newRoom: Omit<WatchPartyRoomData, 'id'> = {
      title: roomData.title || 'Anime Birlikte İzleme Odası',
      animeTitle: roomData.animeTitle || 'Seçili Anime',
      animeImage: roomData.animeImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop',
      animeId: roomData.animeId || 58514,
      videoUrl: roomData.videoUrl || 'https://www.youtube.com/watch?v=4d_Jd2zY3jY',
      youtubeId: youtubeId || '4d_Jd2zY3jY',
      hostId: user.uid,
      hostName: user.displayName || 'AnimeSever',
      hostAvatar: user.displayName || 'Otaku',
      isPlaying: false,
      currentTime: 0,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      participantCount: 1,
      isLocked: false,
      isPrivate: roomData.isPrivate || false,
      roomCode: randomCode,
      category: roomData.category || 'fragman',
      description: roomData.description || 'Toplulukla birlikte heyecan dolu sahneleri izliyoruz!'
    };

    try {
      const docRef = await addDoc(collection(db, 'watchPartyRooms'), newRoom);
      return docRef.id;
    } catch (err) {
      console.warn('Could not save to firestore, using local fallback room ID:', err);
      const fallbackId = 'room-custom-' + Date.now();
      const fullRoom = { id: fallbackId, ...newRoom };
      set((st) => ({ rooms: [fullRoom, ...st.rooms], activeRoom: fullRoom }));
      return fallbackId;
    }
  },

  togglePlayPause: async (roomId: string, isPlaying: boolean, currentTime: number) => {
    const roomRef = doc(db, 'watchPartyRooms', roomId);
    const updateData = {
      isPlaying,
      currentTime: Math.floor(currentTime),
      updatedAt: new Date().toISOString()
    };

    // Optimistic update
    set((state) => {
      if (state.activeRoom && state.activeRoom.id === roomId) {
        return { activeRoom: { ...state.activeRoom, ...updateData } };
      }
      return state;
    });

    try {
      await updateDoc(roomRef, updateData);
    } catch (err) {
      console.warn('Firestore togglePlay error (handled optimistically):', err);
    }
  },

  seekTo: async (roomId: string, newTime: number) => {
    const roomRef = doc(db, 'watchPartyRooms', roomId);
    const updateData = {
      currentTime: Math.floor(newTime),
      updatedAt: new Date().toISOString()
    };

    set((state) => {
      if (state.activeRoom && state.activeRoom.id === roomId) {
        return { activeRoom: { ...state.activeRoom, ...updateData } };
      }
      return state;
    });

    try {
      await updateDoc(roomRef, updateData);
    } catch (err) {
      console.warn('Firestore seek error (handled optimistically):', err);
    }
  },

  toggleLock: async (roomId: string, isLocked: boolean) => {
    const roomRef = doc(db, 'watchPartyRooms', roomId);
    set((state) => {
      if (state.activeRoom && state.activeRoom.id === roomId) {
        return { activeRoom: { ...state.activeRoom, isLocked } };
      }
      return state;
    });
    try {
      await updateDoc(roomRef, { isLocked });
    } catch (err) {
      console.warn('Firestore toggleLock error:', err);
    }
  },

  sendMessage: async (roomId: string, user, text: string, currentVideoTime?: number) => {
    if (!text.trim()) return;

    const newMsg: Omit<WatchPartyMessage, 'id'> = {
      roomId,
      uid: user.uid,
      userName: user.displayName || 'Anonim',
      userAvatar: user.photoURL || user.displayName || 'Otaku',
      text: text.trim(),
      videoTimestamp: currentVideoTime ? Math.floor(currentVideoTime) : undefined,
      createdAt: new Date().toISOString(),
      isHost: get().activeRoom?.hostId === user.uid
    };

    // Optimistic local add
    const tempId = 'msg-' + Date.now();
    set((st) => ({
      messages: [...st.messages, { id: tempId, ...newMsg }]
    }));

    try {
      await addDoc(collection(db, 'watchPartyRooms', roomId, 'messages'), newMsg);
    } catch (err) {
      console.warn('Could not post room message to Firestore:', err);
    }
  },

  sendReaction: async (roomId: string, user, reactionId: string) => {
    const foundType = REACTION_TYPES.find(r => r.id === reactionId) || REACTION_TYPES[0];
    const xOffset = Math.floor(15 + Math.random() * 70); // 15% to 85% width

    const reactionPayload: FloatingReaction = {
      id: 'react-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      roomId,
      uid: user.uid,
      userName: user.displayName || 'İzleyici',
      emoji: foundType.emoji,
      label: foundType.label,
      color: foundType.color,
      createdAt: Date.now(),
      xOffset
    };

    // Immediately trigger locally
    set((st) => ({
      reactions: [...st.reactions.slice(-15), reactionPayload]
    }));

    try {
      await addDoc(collection(db, 'watchPartyRooms', roomId, 'reactions'), {
        ...reactionPayload,
        serverTime: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore reaction add error:', err);
    }
  },

  syncWithHost: (hostTime: number) => {
    set({ userOffsetSeconds: 0, isSynced: true });
  }
}));
