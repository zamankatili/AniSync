import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../context/AppStore';
import { MessageSquare, X, Maximize2, Search, ChevronDown, Hash } from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  where,
  getDoc,
  getCountFromServer,
  setDoc,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { cn, toDateSafe } from '../lib/utils';
import { useToastStore } from '../store/useToastStore';
import { isBootstrapAdminEmail } from '../lib/adminConfig';
import { resolveAvatar } from '../lib/avatar';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { DIRECT_ROOM_MIN_XP, OFFICIAL_ROOMS, type CommunityRoom } from '../lib/rooms';
import { computeOtakuLevel } from '../lib/otakuLevel';
import { useXpStore, selectActiveSnapshot } from '../store/useXpStore';
import { localizeLevelTitle } from '../lib/badgeLocalization';
import { useQuizStore } from '../store/useQuizStore';
import {
  canAnonSend,
  recordAnonSend,
  loadAnonMessages,
  readAnonQuota,
  appendAnonMessage,
  removeAnonMessage,
  ANON_DAILY_LIMIT,
} from '../lib/anonQuota';
import { CHAT_MESSAGE_MAX, type ChatMessage, type ChatReplyRef, type ChatRoomItem } from '../lib/chatTypes';
import { buildReplyRef, normalizeReplyRef } from '../lib/chatText';
import { buildChatTimeline } from '../lib/chatTimeline';
import { buildRoomOverview, markRoomVisited, readLastVisits } from '../lib/chatOverview';
import { readChatDraft, writeChatDraft } from '../lib/chatDrafts';
import { readPinnedRoomIds, togglePinnedRoomId } from '../lib/chatPins';
import { RoomRequestModal } from './RoomRequestModal';
import { RoomQueuePanel } from './RoomQueuePanel';
import { ChatCafe } from './ChatCafe';
import { ChatComposer } from './chat/ChatComposer';
import { ChatEventBanner } from './chat/ChatEventBanner';
import { ChatMessageList } from './chat/ChatMessageList';
import { ChatRoomRail } from './chat/ChatRoomRail';
import { ChatSearchBar } from './chat/ChatSearchBar';
import type { ChatView } from './chat/types';

export type { ChatMessage, ChatRoomItem } from '../lib/chatTypes';

/** Olay işleyicilerinde kullanılan saf olmayan yardımcılar (bileşen dışında). */
const currentTimeMs = (): number => Date.now();
const createAnonMessageId = (): string =>
  `anon-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * KÖŞE kontrolcüsü.
 *
 * Tek bir durum kaynağı (oda, mesajlar, taslak, yanıt, arama) hem yüzen paneli
 * hem tam sayfa görünümü besler. Böylece "tam ekrana geç" dendiğinde yazılan
 * metin, seçili oda ve arama kaybolmaz.
 */
export const GlobalChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string>('genel');
  const [communityRooms, setCommunityRooms] = useState<CommunityRoom[]>([]);
  const [pendingRoomCount, setPendingRoomCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [anonLoadKey, setAnonLoadKey] = useState(0);
  const [eventJoined, setEventJoined] = useState(false);
  const [eventAttendees, setEventAttendees] = useState<number | null>(null);
  const [rsvpBusy, setRsvpBusy] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [overviewMessages, setOverviewMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(() => readChatDraft('genel'));
  const [replyTo, setReplyTo] = useState<ChatReplyRef | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const roomPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const roomPickerOverlayRef = useRef<HTMLDivElement>(null);
  const roomPickerWasOpenRef = useRef(false);
  const [lastVisitByRoom, setLastVisitByRoom] = useState<Record<string, number>>({});
  const [visitTick, setVisitTick] = useState(0);
  const [pinnedRoomIds, setPinnedRoomIds] = useState<string[]>(() => readPinnedRoomIds());

  const { currentUser, userProfile, watchlist } = useAppStore();
  const { addToast } = useToastStore();
  const { t, i18n } = useAppTranslation();
  const { config } = useRemoteConfig();
  const lastSentAt = useRef(0);

  const chatEvent = config?.chatEvent;
  const eventLang = (i18n.language || 'tr').slice(0, 2) as 'tr' | 'en' | 'ja' | 'fr';
  const eventTitle = chatEvent ? chatEvent[eventLang] || chatEvent.tr || chatEvent.en || '' : '';
  const eventVisible = !!eventTitle;

  const { arcadeHighScore, dailyStreak } = useQuizStore();
  const xpSnapshot = useXpStore(selectActiveSnapshot);
  const engagementXp = xpSnapshot.totalXp;
  const otakuInfo = useMemo(
    () => computeOtakuLevel(watchlist, arcadeHighScore > 0 || dailyStreak > 0, arcadeHighScore, engagementXp),
    [watchlist, arcadeHighScore, dailyStreak, engagementXp],
  );
  const myKarma = otakuInfo.totalXp;
  const myLevelInfo = useMemo(
    () => ({
      level: otakuInfo.levelInfo.currentLevel.level,
      title: localizeLevelTitle(otakuInfo.levelInfo.currentLevel.level, otakuInfo.levelInfo.currentLevel.title),
    }),
    [otakuInfo.levelInfo.currentLevel.level, otakuInfo.levelInfo.currentLevel.title],
  );

  const myName = currentUser?.displayName || userProfile?.name || null;
  const myUid = currentUser?.uid ?? null;

  // Topluluk odaları + bekleyen istek sayısı — yalnız panel/tam sayfa açıkken.
  useEffect(() => {
    if (!isOpen) return;
    const roomsQuery = query(collection(db, 'chatRooms'), orderBy('createdAt', 'desc'), limit(40));
    const unsubscribeRooms = onSnapshot(
      roomsQuery,
      (snap) => {
        const rows: CommunityRoom[] = [];
        snap.forEach((docSnap) =>
          rows.push({
            id: docSnap.id,
            isOfficial: false,
            ...(docSnap.data() as Omit<CommunityRoom, 'id' | 'isOfficial'>),
          }),
        );
        setCommunityRooms(rows);
      },
      (err) => console.warn('chatRooms listener error', err),
    );

    const requestsQuery = query(
      collection(db, 'roomRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(60),
    );
    const unsubscribeRequests = onSnapshot(
      requestsQuery,
      (snap) => setPendingRoomCount(snap.size),
      (err) => console.warn('roomRequests count listener error', err),
    );

    return () => {
      unsubscribeRooms();
      unsubscribeRequests();
    };
  }, [isOpen]);

  // Admin/moderatör rolü (bootstrap e-posta ile de tanınır).
  // Rol çözümü asenkron; senkron setState ile gereksiz ara render yapılmaz.
  useEffect(() => {
    let alive = true;
    const resolveRole = async () => {
      if (!currentUser) {
        await Promise.resolve();
        if (alive) setIsAdmin(false);
        return;
      }
      if (isBootstrapAdminEmail(currentUser.email)) {
        await Promise.resolve();
        if (alive) setIsAdmin(true);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        const role = snap.exists() ? (snap.data() as { role?: string })?.role : undefined;
        if (alive) setIsAdmin(role === 'admin' || role === 'moderator');
      } catch {
        if (alive) setIsAdmin(false);
      }
    };
    void resolveRole();
    return () => {
      alive = false;
    };
  }, [currentUser]);

  // Misafir mesajları yalnız bu cihazda; Firestore'a yazılmaz.
  const anonLocalMessages = useMemo(
    () => {
      // anonLoadKey yalnızca yeniden okuma tetikleyicisidir.
      void anonLoadKey;
      return loadAnonMessages(activeRoomId);
    },
    [activeRoomId, anonLoadKey],
  );

  const allMessages = useMemo(() => {
    const toMs = (value: unknown): number => {
      const date = toDateSafe(value);
      return date ? date.getTime() : 0;
    };
    const local: ChatMessage[] = anonLocalMessages.map((message) => ({
      id: message.id,
      text: message.text,
      uid: 'anon',
      name: message.name,
      avatar: '',
      roomId: activeRoomId,
      createdAt: message.createdAt,
      isLocal: true,
      replyTo: normalizeReplyRef(message.replyTo),
    }));
    return [...messages, ...local].sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));
  }, [messages, anonLocalMessages, activeRoomId]);

  const allRooms = useMemo<ChatRoomItem[]>(
    () => [...OFFICIAL_ROOMS, ...communityRooms],
    [communityRooms],
  );
  const currentRoom = allRooms.find((room) => room.id === activeRoomId) || allRooms[0] || OFFICIAL_ROOMS[0];

  const roomLabel = (room: ChatRoomItem) =>
    room.isOfficial ? t(`chat_room_name_${room.id}`, { defaultValue: room.name }) : room.name;
  const roomTopic = (room: ChatRoomItem) =>
    room.isOfficial ? t(`chat_room_topic_${room.id}`, { defaultValue: room.topic }) : room.topic;
  const roomBadge = (room: ChatRoomItem) =>
    room.isOfficial
      ? t(`chat_room_badge_${room.id}`, { defaultValue: room.badge })
      : t('chat_badge_community', { defaultValue: 'TOPLULUK' });

  const roomIds = useMemo(() => allRooms.map((room) => room.id), [allRooms]);
  const lastVisits = useMemo(
    () => readLastVisits(roomIds),
    // visitTick, aktif odanın "şimdi ziyaret edildi" damgasını yeniden okutur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roomIds, visitTick],
  );
  const overview = useMemo(
    () => buildRoomOverview(overviewMessages, lastVisits, myUid),
    [overviewMessages, lastVisits, myUid],
  );

  const lastVisit = lastVisitByRoom[activeRoomId] ?? 0;
  const visibleMessages = useMemo(() => {
    const needle = searchTerm.trim().toLocaleLowerCase();
    if (!needle) return allMessages;
    return allMessages.filter((message) => (message.text || '').toLocaleLowerCase().includes(needle));
  }, [allMessages, searchTerm]);

  const dayLabel = useCallback(
    (date: Date | null): string => {
      if (!date) return '';
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
      if (sameDay(date, today)) return t('chat_day_today');
      if (sameDay(date, yesterday)) return t('chat_day_yesterday');
      return new Intl.DateTimeFormat(i18n.language || 'tr', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    },
    [i18n.language, t],
  );

  const timeline = useMemo(
    () =>
      buildChatTimeline(visibleMessages, {
        lastVisit,
        showNewDivider: !searchTerm.trim(),
        myUid,
        myName,
        dayLabel,
      }),
    [visibleMessages, lastVisit, searchTerm, myUid, myName, dayLabel],
  );

  const anonQuota = readAnonQuota();

  // Aktif odanın canlı mesajları.
  useEffect(() => {
    if (!isOpen) return;
    const chatRef = collection(db, 'globalChat');
    let unsubscribe: (() => void) | undefined;
    let alive = true;

    const applySnapshot = (snapshot: QuerySnapshot) => {
      if (!alive) return;
      const rows: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const msgRoom = typeof data.roomId === 'string' ? data.roomId : 'genel';
        if (msgRoom !== activeRoomId) return;
        rows.push({
          ...(data as unknown as ChatMessage),
          id: docSnap.id,
          roomId: msgRoom,
          replyTo: normalizeReplyRef(data.replyTo),
        });
      });
      setMessages(rows.reverse());
      setLoading(false);
    };

    const runFallback = () => {
      const fallbackQuery = query(chatRef, orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(
        fallbackQuery,
        applySnapshot,
        (err) => {
          console.warn('GlobalChat fallback listener error:', err);
          setLoading(false);
        },
      );
    };

    try {
      const roomQuery = query(
        chatRef,
        where('roomId', '==', activeRoomId),
        orderBy('createdAt', 'desc'),
        limit(50),
      );
      unsubscribe = onSnapshot(
        roomQuery,
        applySnapshot,
        (err) => {
          console.warn('GlobalChat room query error (indeks gerekebilir), fallback kullanılıyor:', err);
          runFallback();
        },
      );
    } catch (err) {
      console.warn('GlobalChat room query failed to start, fallback kullanılıyor:', err);
      runFallback();
    }

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [isOpen, activeRoomId]);

  // Oda listesi için son 80 mesaj: okunmamış sayısı + son mesaj önizlemesi.
  useEffect(() => {
    if (!isOpen) return;
    const overviewQuery = query(collection(db, 'globalChat'), orderBy('createdAt', 'desc'), limit(80));
    const unsubscribe = onSnapshot(
      overviewQuery,
      (snapshot) => {
        const rows: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          rows.push({
            ...(data as unknown as ChatMessage),
            id: docSnap.id,
            roomId: typeof data.roomId === 'string' ? data.roomId : 'genel',
            replyTo: normalizeReplyRef(data.replyTo),
          });
        });
        setOverviewMessages(rows);
      },
      (err) => console.warn('GlobalChat overview listener error:', err),
    );
    return () => unsubscribe();
  }, [isOpen]);

  // RSVP — yalnız etkinlik bandı görünürken.
  useEffect(() => {
    if (!eventVisible || !isOpen) return;
    let alive = true;
    (async () => {
      try {
        const countSnap = await getCountFromServer(collection(db, 'chatEventRsvps'));
        if (alive) setEventAttendees(countSnap.data().count);
        if (currentUser) {
          const mine = await getDoc(doc(db, 'chatEventRsvps', currentUser.uid));
          if (alive) setEventJoined(mine.exists());
        }
      } catch (err) {
        console.warn('RSVP load error:', err);
        if (alive) setEventAttendees(0);
      }
    })();
    return () => {
      alive = false;
    };
  }, [eventVisible, isOpen, currentUser]);

  const handleToggleEvent = async () => {
    if (!eventVisible || rsvpBusy) return;
    if (!currentUser) {
      addToast(t('chat_login_required'), 'info');
      return;
    }
    setRsvpBusy(true);
    try {
      const mineRef = doc(db, 'chatEventRsvps', currentUser.uid);
      if (eventJoined) {
        await deleteDoc(mineRef);
        setEventJoined(false);
        setEventAttendees((count) => (typeof count === 'number' ? Math.max(0, count - 1) : count));
        addToast(t('chat_event_left'), 'info');
      } else {
        await setDoc(mineRef, { uid: currentUser.uid, createdAt: new Date().toISOString() });
        setEventJoined(true);
        setEventAttendees((count) => (typeof count === 'number' ? count + 1 : count));
        addToast(t('chat_event_joined'), 'success');
      }
    } catch (err) {
      console.warn('RSVP toggle error:', err);
      addToast(t('chat_event_failed'), 'error');
    } finally {
      setRsvpBusy(false);
    }
  };

  const markVisited = (roomId: string) => {
    const previous = markRoomVisited(roomId);
    setLastVisitByRoom((current) => ({ ...current, [roomId]: previous }));
    setVisitTick((tick) => tick + 1);
  };

  const openChat = () => {
    markVisited(activeRoomId);
    setDraft(readChatDraft(activeRoomId));
    setLoading(true);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setFullScreen(false);
    setRoomPickerOpen(false);
  };

  const handleRoomChange = (roomId: string) => {
    if (roomId === activeRoomId) {
      setRoomPickerOpen(false);
      return;
    }
    writeChatDraft(activeRoomId, draft);
    markVisited(roomId);
    setActiveRoomId(roomId);
    setMessages([]);
    setDraft(readChatDraft(roomId));
    setReplyTo(null);
    setSearchTerm('');
    setSearchOpen(false);
    setRoomPickerOpen(false);
    setLoading(true);
  };

  const handleDraftChange = (value: string) => {
    const limited = value.slice(0, CHAT_MESSAGE_MAX);
    setDraft(limited);
    writeChatDraft(activeRoomId, limited);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;

    // Misafir: günde 3 mesaj, yalnız bu cihazda.
    if (!currentUser) {
      const now = new Date();
      if (!canAnonSend(now)) {
        addToast(t('chat_anon_quota_exhausted'), 'info');
        return;
      }
      const quota = recordAnonSend(now);
      const pendingReply = replyTo;
      appendAnonMessage(activeRoomId, {
        id: createAnonMessageId(),
        text,
        createdAt: now.getTime(),
        name: t('chat_anon_name', { n: quota.used }),
        // Yanıt da yereldir; Firestore'a gitmez, yalnız bu cihazda çizilir.
        replyTo: pendingReply,
      });
      setAnonLoadKey((key) => key + 1);
      setDraft('');
      setReplyTo(null);
      writeChatDraft(activeRoomId, '');
      return;
    }

    if (text.length > CHAT_MESSAGE_MAX) {
      addToast(t('chat_message_too_long'), 'error');
      return;
    }
    const now = currentTimeMs();
    if (now - lastSentAt.current < 1500) {
      addToast(t('chat_slow_down'), 'info');
      return;
    }
    lastSentAt.current = now;

    const pendingReply = replyTo;
    setDraft('');
    setReplyTo(null);
    writeChatDraft(activeRoomId, '');

    try {
      const payload: DocumentData = {
        text,
        roomId: activeRoomId,
        uid: currentUser.uid,
        name: currentUser.displayName || userProfile?.name || 'Otaku',
        avatar: resolveAvatar(currentUser.photoURL, userProfile?.avatarSeed),
        createdAt: serverTimestamp(),
      };
      if (pendingReply) payload.replyTo = pendingReply;
      await addDoc(collection(db, 'globalChat'), payload);
    } catch (err) {
      console.error(err);
      setDraft(text);
      setReplyTo(pendingReply);
      writeChatDraft(activeRoomId, text);
      addToast(t('chat_send_failed'), 'error');
    }
  };

  const handleDelete = async (messageId: string) => {
    const target = allMessages.find((message) => message.id === messageId);
    if (target?.isLocal) {
      removeAnonMessage(messageId);
      setAnonLoadKey((key) => key + 1);
      return;
    }
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'globalChat', messageId));
    } catch (err) {
      console.error(err);
      addToast(t('chat_delete_failed'), 'error');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast(t('chat_copied'), 'success');
    } catch {
      addToast(t('chat_copy_failed'), 'error');
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyTo(buildReplyRef(message));
    setFocusSignal((signal) => signal + 1);
  };

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchTerm('');
    } else {
      setRoomPickerOpen(false);
      setSearchOpen(true);
    }
  };

  const canDelete = (message: ChatMessage) =>
    !!message.isLocal || (!!currentUser && message.uid === currentUser.uid);

  // Yüzen panel oda seçici: odak tuzağı, Escape ve dış tıkla kapatma.
  useEffect(() => {
    if (roomPickerOpen) {
      roomPickerWasOpenRef.current = true;
      const root = roomPickerOverlayRef.current;
      const first = root?.querySelector<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
      return;
    }
    if (roomPickerWasOpenRef.current) {
      roomPickerWasOpenRef.current = false;
      const trigger = roomPickerTriggerRef.current;
      if (trigger?.isConnected) trigger.focus();
    }
  }, [roomPickerOpen]);

  useEffect(() => {
    if (!roomPickerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setRoomPickerOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const root = roomPickerOverlayRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [roomPickerOpen]);

  useEffect(() => {
    if (!roomPickerOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (roomPickerOverlayRef.current?.contains(target)) return;
      if (roomPickerTriggerRef.current?.contains(target)) return;
      setRoomPickerOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [roomPickerOpen]);

  useEffect(() => {
    if (fullScreen) setRoomPickerOpen(false);
  }, [fullScreen]);

  const chatView: ChatView = {
    rooms: allRooms,
    activeRoom: currentRoom,
    activeRoomId,
    onSelectRoom: handleRoomChange,
    overview,
    pinnedRoomIds,
    onTogglePin: (roomId) => setPinnedRoomIds(togglePinnedRoomId(roomId)),
    pendingRoomCount,
    onOpenRoomModal: () => setRoomModalOpen(true),
    onOpenQueue: () => setQueueOpen(true),
    roomLabel,
    roomTopic,
    roomBadge,
    timeline,
    messageCount: allMessages.length,
    loading,
    searchOpen,
    searchTerm,
    onSearchTermChange: setSearchTerm,
    onToggleSearch: toggleSearch,
    draft,
    onDraftChange: handleDraftChange,
    onSend: () => {
      void handleSend();
    },
    focusSignal,
    replyTo,
    onReply: handleReply,
    onCancelReply: () => setReplyTo(null),
    onDelete: (messageId) => {
      void handleDelete(messageId);
    },
    onCopy: (text) => {
      void handleCopy(text);
    },
    canDelete,
    myName,
    myUid,
    myKarma,
    levelInfo: myLevelInfo,
    anon: {
      signedIn: !!currentUser,
      used: anonQuota.used,
      limit: ANON_DAILY_LIMIT,
    },
    event: eventVisible
      ? {
          title: eventTitle,
          date: chatEvent?.date,
          attendees: eventAttendees,
          joined: eventJoined,
          busy: rsvpBusy,
          onToggle: () => {
            void handleToggleEvent();
          },
        }
      : null,
    isAdmin,
  };

  return (
    <>
      {isOpen && fullScreen && <ChatCafe chat={chatView} onClose={() => setFullScreen(false)} />}

      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end md:bottom-8 md:right-8">
        <AnimatePresence>
          {isOpen && !fullScreen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 flex w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden border-4 border-white bg-black shadow-[8px_8px_0_0_#fff] sm:w-[420px]"
              style={{ height: 'min(560px, 72vh)' }}
            >
              <div className="z-10 flex items-center justify-between gap-2 border-b-4 border-white/20 bg-neutral-950 p-2 px-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-white bg-rose-600 text-lg font-black text-white">
                    {currentRoom.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-black uppercase tracking-wider text-white">
                        <span lang="en">#{roomLabel(currentRoom)}</span>
                      </span>
                      <span className="shrink-0 border border-black bg-amber-400 px-1.5 py-0.5 text-[9px] font-black uppercase text-black">
                        {roomBadge(currentRoom)}
                      </span>
                    </div>
                    <p className="truncate text-[10px] font-bold uppercase text-neutral-400">
                      {roomTopic(currentRoom)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={toggleSearch}
                    aria-pressed={searchOpen}
                    aria-label={t('chat_search_placeholder')}
                    title={t('chat_search_placeholder')}
                    className={cn(
                      'flex min-h-11 min-w-11 items-center justify-center border-2 transition-colors',
                      searchOpen
                        ? 'border-amber-400 bg-amber-400 text-black'
                        : 'border-white/30 text-white hover:border-white hover:bg-white/10',
                    )}
                  >
                    <Search size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFullScreen(true)}
                    aria-label={t('chat_to_cafe_title')}
                    title={t('chat_to_cafe_title')}
                    className="flex min-h-11 min-w-11 items-center justify-center border-2 border-amber-400/50 text-amber-400 transition-colors hover:border-amber-400 hover:bg-amber-400 hover:text-black"
                  >
                    <Maximize2 size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={closeChat}
                    aria-label={t('close')}
                    className="flex min-h-11 min-w-11 items-center justify-center border-2 border-transparent text-white transition-colors hover:bg-white/10 hover:text-rose-400"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {chatView.event && <ChatEventBanner event={chatView.event} />}

              <div className="border-b-2 border-white/20 bg-neutral-900 p-1.5">
                <button
                  type="button"
                  ref={roomPickerTriggerRef}
                  onClick={() =>
                    setRoomPickerOpen((value) => {
                      const next = !value;
                      if (next) {
                        setSearchOpen(false);
                        setSearchTerm('');
                      }
                      return next;
                    })
                  }
                  aria-haspopup="dialog"
                  aria-expanded={roomPickerOpen}
                  aria-controls="kose-panel-rooms"
                  className={cn(
                    'flex min-h-11 w-full items-center gap-2 border-2 px-2.5 text-left transition-colors',
                    roomPickerOpen
                      ? 'border-amber-400 bg-amber-400 text-black'
                      : 'border-white/20 bg-black text-white hover:border-white/50',
                  )}
                >
                  <Hash size={15} strokeWidth={3} className={roomPickerOpen ? 'text-black' : 'text-amber-400'} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span lang="en" className="truncate text-[11px] font-black uppercase tracking-wider">
                        #{roomLabel(currentRoom)}
                      </span>
                      {(() => {
                        const totalUnread = allRooms.reduce((sum, room) => sum + (overview[room.id]?.unread ?? 0), 0);
                        return totalUnread > 0 ? (
                          <span className="shrink-0 border border-black bg-rose-600 px-1 text-[8px] font-black leading-4 text-white">
                            {totalUnread > 99 ? '99+' : totalUnread}
                          </span>
                        ) : null;
                      })()}
                    </span>
                    <span className={cn('block truncate text-[9px] font-bold uppercase', roomPickerOpen ? 'text-black/70' : 'text-neutral-500')}>
                      {roomTopic(currentRoom)}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    strokeWidth={3}
                    className={cn('shrink-0 transition-transform', roomPickerOpen && 'rotate-180')}
                  />
                </button>
              </div>

              <div className="relative flex min-h-0 flex-1 flex-col">
                {searchOpen && (
                  <ChatSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onClose={toggleSearch}
                    matchCount={visibleMessages.length}
                    focusOnMount
                  />
                )}

                <ChatMessageList
                  key={activeRoomId}
                  timeline={timeline}
                  loading={loading}
                  messageCount={allMessages.length}
                  searchTerm={searchTerm}
                  roomLabel={roomLabel(currentRoom)}
                  roomTopic={roomTopic(currentRoom)}
                  roomIcon={currentRoom.icon}
                  onDelete={(messageId) => {
                    void handleDelete(messageId);
                  }}
                  onReply={handleReply}
                  onCopy={(text) => {
                    void handleCopy(text);
                  }}
                  canDelete={canDelete}
                  compact
                />

                <ChatComposer
                  draft={draft}
                  onChange={handleDraftChange}
                  onSend={() => {
                    void handleSend();
                  }}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  anon={chatView.anon}
                  roomLabel={roomLabel(currentRoom)}
                  compact
                  focusSignal={focusSignal}
                />

                {roomPickerOpen && (
                  <div
                    ref={roomPickerOverlayRef}
                    id="kose-panel-rooms"
                    role="dialog"
                    aria-modal="false"
                    aria-label={t('chat_rooms_title')}
                    className="absolute inset-0 z-30 flex flex-col bg-black"
                  >
                    <ChatRoomRail
                      rooms={allRooms}
                      activeRoomId={activeRoomId}
                      overview={overview}
                      pinnedRoomIds={pinnedRoomIds}
                      pendingRoomCount={pendingRoomCount}
                      signedIn={!!currentUser}
                      roomLabel={roomLabel}
                      roomTopic={roomTopic}
                      onSelect={handleRoomChange}
                      onTogglePin={(roomId) => setPinnedRoomIds(togglePinnedRoomId(roomId))}
                      onOpenRoomModal={() => {
                        setRoomPickerOpen(false);
                        setRoomModalOpen(true);
                      }}
                      onOpenQueue={() => {
                        setRoomPickerOpen(false);
                        setQueueOpen(true);
                      }}
                      onNavigate={() => setRoomPickerOpen(false)}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <button
            type="button"
            onClick={openChat}
            className="group relative flex h-14 w-14 items-center justify-center border-4 border-white bg-black text-white shadow-[6px_6px_0_0_#fff] transition-all hover:bg-rose-600"
            aria-label={t('chat_toggle_title')}
            title={t('chat_toggle_title')}
          >
            <MessageSquare size={24} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <RoomRequestModal isOpen={roomModalOpen} onClose={() => setRoomModalOpen(false)} karma={myKarma} />
      <RoomQueuePanel isOpen={queueOpen} onClose={() => setQueueOpen(false)} isAdmin={isAdmin} />
    </>
  );
};

export default GlobalChat;
