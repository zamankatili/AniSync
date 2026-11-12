import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../context/AppStore';
import {
  MessageSquare, X, Send, Hash, Calendar, Plus, Vote, Maximize2, Search, ArrowDown, CornerDownRight
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, where, getDoc, getCountFromServer, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { cn, toDateSafe } from '../lib/utils';
import { formatRelativeTime } from '../lib/relativeTime';
import { useToastStore } from '../store/useToastStore';
import { ReportButton } from './ReportButton';
import { isBootstrapAdminEmail } from '../lib/adminConfig';
import { resolveAvatar } from '../lib/avatar';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { OFFICIAL_ROOMS, type CommunityRoom, type OfficialRoom } from '../lib/rooms';
import { computeOtakuLevel } from '../lib/otakuLevel';
import { localizeLevelTitle } from '../lib/badgeLocalization';
import { useQuizStore } from '../store/useQuizStore';
import { useIsLargeScreen } from '../lib/useMediaQuery';
import { canAnonSend, recordAnonSend, loadAnonMessages, readAnonQuota, appendAnonMessage, removeAnonMessage, ANON_DAILY_LIMIT } from '../lib/anonQuota';
import { RoomRequestModal } from './RoomRequestModal';
import { RoomQueuePanel } from './RoomQueuePanel';
import { ChatCafe } from './ChatCafe';

export interface ChatMessage {
  id: string;
  text: string;
  uid: string;
  name: string;
  avatar: string;
  roomId?: string;
  createdAt: any;
  /** Yalnız bu cihazda saklanan misafir mesajı. */
  isLocal?: boolean;
}

export type ChatRoomItem = OfficialRoom | CommunityRoom;

export const GlobalChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLargeScreen = useIsLargeScreen();
  const [cafeFullScreen, setCafeFullScreen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string>('genel');
  const [communityRooms, setCommunityRooms] = useState<CommunityRoom[]>([]);
  const [pendingRoomCount, setPendingRoomCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [anonLoadKey, setAnonLoadKey] = useState(0);
  const [eventJoined, setEventJoined] = useState(false);
  const [eventAttendees, setEventAttendees] = useState<number | null>(null); // null = yükleniyor; Firestore'dan gerçekte
  const [rsvpBusy, setRsvpBusy] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [lastVisitByRoom, setLastVisitByRoom] = useState<Record<string, number>>({});
  const { currentUser, userProfile } = useAppStore();
  const { addToast } = useToastStore();
  const { t, i18n } = useAppTranslation();
  const { config } = useRemoteConfig();
  const lastSentAt = useRef(0);

  // Admin'in açtığı canlı etkinlik (yoksa bant hiç gösterilmez)
  const chatEvent = config?.chatEvent;
  const eventLang = ((i18n.language || 'tr').slice(0, 2) as 'tr' | 'en' | 'ja' | 'fr');
  const eventTitle = chatEvent ? (chatEvent[eventLang] || chatEvent.tr || chatEvent.en || '') : '';
  const eventVisible = !!eventTitle;

  const { watchlist } = useAppStore();
  const { arcadeHighScore, dailyStreak } = useQuizStore();
  const otakuInfo = useMemo(
    () => computeOtakuLevel(watchlist, arcadeHighScore > 0 || dailyStreak > 0, arcadeHighScore),
    [watchlist, arcadeHighScore, dailyStreak],
  );
  const myKarma = otakuInfo.karma;
  const myLevelInfo = useMemo(
    () => ({
      level: otakuInfo.levelInfo.currentLevel.level,
      title: localizeLevelTitle(otakuInfo.levelInfo.currentLevel.level, otakuInfo.levelInfo.currentLevel.title),
    }),
    [otakuInfo.levelInfo.currentLevel.level, otakuInfo.levelInfo.currentLevel.title],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesBodyRef = useRef<HTMLDivElement>(null);

  // Küçük ekrana düşülünce KÖŞE'yi küçült — panel kalır
  useEffect(() => {
    if (!isLargeScreen) setCafeFullScreen(false);
  }, [isLargeScreen]);

  // Topluluk odaları — Firestore canlı; resmi + topluluk birleşir
  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, 'chatRooms'), orderBy('createdAt', 'desc'), limit(40));
    const unsub = onSnapshot(q, (snap) => {
      const rows: CommunityRoom[] = [];
      snap.forEach((d) => rows.push({ id: d.id, isOfficial: false, ...(d.data() as Omit<CommunityRoom, 'id' | 'isOfficial'>) }));
      setCommunityRooms(rows);
    }, (err) => console.warn('chatRooms listener error', err));

    const q2 = query(collection(db, 'roomRequests'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(60));
    const unsub2 = onSnapshot(q2, (snap) => setPendingRoomCount(snap.size), (err) => {
      console.warn('roomRequests count listener error', err);
    });

    return () => {
      unsub();
      unsub2();
    };
  }, [isOpen]);

  // Admin/moderatör rolünü Firestore'dan oku (bootstrap e-posta ile de tanınır)
  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    if (isBootstrapAdminEmail(currentUser.email)) {
      setIsAdmin(true);
      return;
    }
    getDoc(doc(db, 'users', currentUser.uid))
      .then((snap) => {
        const role = snap.exists() ? (snap.data() as { role?: string })?.role : undefined;
        setIsAdmin(role === 'admin' || role === 'moderator');
      })
      .catch(() => setIsAdmin(false));
  }, [currentUser]);

  // Anon yerel mesajlar — bu cihazda saklanır, Firestore'a yazılmaz
  const anonLocalMessages = useMemo(
    () => loadAnonMessages(activeRoomId),
    [activeRoomId, anonLoadKey],
  );
  const allMessages = useMemo(() => {
    const toSeconds = (c: any): number => {
      if (c && typeof c.seconds === 'number') return c.seconds * 1000 + ((c.nanoseconds ?? 0) / 1e6);
      if (typeof c === 'number') return c;
      return 0;
    };
    const local: ChatMessage[] = anonLocalMessages.map((m) => ({
      id: m.id,
      text: m.text,
      uid: 'anon',
      name: m.name,
      avatar: '',
      roomId: activeRoomId,
      createdAt: { seconds: Math.floor(m.createdAt / 1000), nanoseconds: 0 },
      isLocal: true,
    }));
    return [...messages, ...local].sort((a, b) => toSeconds(a.createdAt) - toSeconds(b.createdAt));
  }, [messages, anonLocalMessages, activeRoomId]);

  const lastVisit = lastVisitByRoom[activeRoomId] ?? 0;

  const visibleMessages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allMessages;
    return allMessages.filter((m) => (m.text || '').toLowerCase().includes(q));
  }, [allMessages, searchTerm]);

  const newMessagesCount = useMemo(() => {
    if (lastVisit <= 0) return 0;
    return allMessages.filter((m) => {
      const date = toDateSafe(m.createdAt);
      return !!date && date.getTime() > lastVisit;
    }).length;
  }, [allMessages, lastVisit]);

  type ChatRenderItem =
    | { type: 'day'; key: string; label: string }
    | { type: 'new'; key: string }
    | { type: 'msg'; key: string; msg: ChatMessage; index: number };

  const renderItems = useMemo<ChatRenderItem[]>(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    const dayLabel = (date: Date | null): string => {
      if (!date) return '';
      if (sameDay(date, today)) return t('chat_day_today');
      if (sameDay(date, yesterday)) return t('chat_day_yesterday');
      return new Intl.DateTimeFormat(i18n.language || 'tr', {
        day: 'numeric', month: 'short', year: 'numeric',
      }).format(date);
    };

    const items: ChatRenderItem[] = [];
    let previousDay = '';
    let newDividerAdded = false;

    visibleMessages.forEach((msg, index) => {
      const date = toDateSafe(msg.createdAt);
      const dayKey = date ? date.toISOString().slice(0, 10) : 'unknown';
      if (dayKey !== previousDay) {
        previousDay = dayKey;
        items.push({ type: 'day', key: `day-${dayKey}`, label: dayLabel(date) });
      }

      // "Son ziyaretinden beri" ayırıcısı yalnızca arama yokken ve gerçekten
      // yeni mesaj varsa gösterilir.
      if (!newDividerAdded && !searchTerm.trim() && newMessagesCount > 0 && date && date.getTime() > lastVisit) {
        items.push({ type: 'new', key: 'new-since-last-visit' });
        newDividerAdded = true;
      }

      items.push({ type: 'msg', key: msg.id, msg, index });
    });

    return items;
  }, [visibleMessages, lastVisit, newMessagesCount, searchTerm, i18n.language, t]);

  const anonQuota = readAnonQuota();

  const allRooms = useMemo<ChatRoomItem[]>(
    () => [...OFFICIAL_ROOMS, ...communityRooms],
    [communityRooms],
  );
  const currentRoom = allRooms.find(r => r.id === activeRoomId) || allRooms[0] || OFFICIAL_ROOMS[0];

  const roomLabel = (room: ChatRoomItem) =>
    room.isOfficial ? t(`chat_room_name_${room.id}`, { defaultValue: room.name }) : room.name;
  const roomTopic = (room: ChatRoomItem) =>
    room.isOfficial ? t(`chat_room_topic_${room.id}`, { defaultValue: room.topic }) : room.topic;
  const roomBadge = (room: ChatRoomItem) =>
    room.isOfficial ? t(`chat_room_badge_${room.id}`, { defaultValue: room.badge }) : t('chat_badge_community', { defaultValue: 'TOPLULUK' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowJumpToLatest(false);
  };

  const handleBodyScroll = () => {
    const el = messagesBodyRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJumpToLatest(distance > 120);
  };

  const handleRoomChange = (roomId: string) => {
    setActiveRoomId(roomId);
    setSearchTerm('');
    setSearchOpen(false);
  };

  const applySnapshot = (snapshot: any) => {
    const msgs: ChatMessage[] = [];
    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data() as ChatMessage;
      const msgRoom = data.roomId || 'genel';
      if (msgRoom === activeRoomId) {
        msgs.push({ ...data, id: docSnap.id });
      }
    });
    setMessages(msgs.reverse());
    setTimeout(scrollToBottom, 100);
  };

  useEffect(() => {
    if (!isOpen) return;

    const chatRef = collection(db, 'globalChat');
    let unsubscribe: (() => void) | undefined;

    // Önce oda-bazlı sorgu (kompozit indeks için firestore.indexes.json);
    // indeks yoksa (FAILED_PRECONDITION) istemci tarafında filtreleyerek devam et.
    const runFallback = () => {
      const q = query(chatRef, orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, applySnapshot, (err) => {
        console.warn('GlobalChat fallback listener error:', err);
      });
    };

    try {
      const q = query(chatRef, where('roomId', '==', activeRoomId), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, applySnapshot, (err) => {
        console.warn('GlobalChat room query error (indeks gerekebilir), fallback kullanılıyor:', err);
        runFallback();
      });
    } catch (err) {
      console.warn('GlobalChat room query failed to start, fallback kullanılıyor:', err);
      runFallback();
    }

    return () => unsubscribe?.();
  }, [isOpen, activeRoomId]);

  // "Son ziyaret" damgası: odaya girişte önceki zamanı oku, sonra güncelle.
  // Böylece geri dönen kullanıcı yalnızca yeni mesajları ayırıcıyla görür.
  useEffect(() => {
    if (!isOpen) return;
    const key = `anisync_chat_last_visit_${activeRoomId}`;
    let previous = 0;
    try {
      previous = Number(localStorage.getItem(key)) || 0;
    } catch {
      previous = 0;
    }
    setLastVisitByRoom((prev) => ({ ...prev, [activeRoomId]: previous }));
    try {
      localStorage.setItem(key, String(Date.now()));
    } catch {
      // storage disabled — divider simply won't appear next time
    }
  }, [isOpen, activeRoomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text) return;

    // Anon misafirler: günlük 3 mesaj (bu cihazda, Firestore'a yazılmadan)
    if (!currentUser) {
      const now = new Date();
      if (!canAnonSend(now)) {
        addToast(t('chat_anon_quota_exhausted'), 'info');
        return;
      }
      const quota = recordAnonSend(now);
      const dayIndex = quota.used;
      const anonName = t('chat_anon_name', { n: dayIndex });
      appendAnonMessage(activeRoomId, {
        id: `anon-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        createdAt: Date.now(),
        name: anonName,
      });
      setAnonLoadKey((k) => k + 1);
      setNewMessage('');
      return;
    }

    if (newMessage.length > 250) {
      addToast(t('chat_message_too_long'), "error");
      return;
    }
    const now = Date.now();
    if (now - lastSentAt.current < 1500) {
      // Basit hız sınırı: kullanıcı başına 1.5 sn'de 1 mesaj
      addToast(t('chat_slow_down'), 'info');
      return;
    }
    lastSentAt.current = now;

    setNewMessage('');
    
    try {
      await addDoc(collection(db, 'globalChat'), {
        text,
        roomId: activeRoomId,
        uid: currentUser.uid,
        name: currentUser.displayName || userProfile.name,
        avatar: resolveAvatar(currentUser.photoURL, userProfile.avatarSeed),
        createdAt: serverTimestamp()
      });
      scrollToBottom();
    } catch (err) {
      console.error(err);
      // Kullanıcının yazdığı metni kaybetmemesi için geri koy.
      setNewMessage(text);
      addToast(t('chat_send_failed'), "error");
    }
  };

  // Gerçek RSVP verisini yükle (yalnızca etkinlik banner'ı görünürken)
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
    return () => { alive = false; };
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
        setEventAttendees((c) => (typeof c === 'number' ? Math.max(0, c - 1) : c));
        addToast(t('chat_event_left'), 'info');
      } else {
        await setDoc(mineRef, { uid: currentUser.uid, createdAt: new Date().toISOString() });
        setEventJoined(true);
        setEventAttendees((c) => (typeof c === 'number' ? c + 1 : c));
        addToast(t('chat_event_joined'), 'success');
      }
    } catch (err) {
      console.warn('RSVP toggle error:', err);
      addToast(t('chat_event_failed'), 'error');
    } finally {
      setRsvpBusy(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    const target = allMessages.find((m) => m.id === msgId);
    if (target?.isLocal) {
      removeAnonMessage(msgId);
      setAnonLoadKey((k) => k + 1);
      return;
    }
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'globalChat', msgId));
    } catch (err) {
      console.error(err);
      addToast(t('chat_delete_failed'), "error");
    }
  };

  return (
    <>
      {/* KÖŞE tam sayfa — masaüstü veya cafeFullScreen */}
      {isLargeScreen && cafeFullScreen && isOpen && (
        <ChatCafe
          onClose={() => setCafeFullScreen(false)}
          currentUserName={currentUser?.displayName || userProfile?.name || 'Otaku'}
          currentUserAvatar={currentUser?.photoURL ?? null}
          myKarma={myKarma}
          levelInfo={myLevelInfo}
        />
      )}

      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-black border-4 border-white neo-shadow-white mb-4 w-84 sm:w-105 overflow-hidden flex flex-col"
              style={{ height: '560px', maxHeight: '75vh' }}
            >
              {/* Chat Header */}
              <div className="bg-neutral-950 p-3 px-4 flex items-center justify-between border-b-4 border-white/20 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-white bg-rose-600 flex items-center justify-center text-white font-black text-lg">
                    {currentRoom.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-black text-sm uppercase tracking-wider">
                        #{roomLabel(currentRoom)}
                      </span>
                      <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                        {roomBadge(currentRoom)}
                      </span>
                    </div>
                    <p className="text-neutral-400 font-bold text-[10px] uppercase truncate max-w-[200px]">
                      {roomTopic(currentRoom)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSearchOpen((v) => !v);
                      if (searchOpen) setSearchTerm('');
                    }}
                    className={cn(
                      "px-2 py-1.5 flex items-center font-black uppercase text-[9px] tracking-widest transition-colors cursor-pointer border",
                      searchOpen
                        ? "text-black bg-amber-400 border-amber-400"
                        : "text-white border-white/30 hover:border-white hover:bg-white/10",
                    )}
                    title={t('chat_search_placeholder')}
                    aria-label={t('chat_search_placeholder')}
                    aria-pressed={searchOpen}
                  >
                    <Search size={12} strokeWidth={2.5} />
                  </button>
                  {/* Tam sayfa KÖŞE'ye geçiş — yalnızca geniş ekranlarda */}
                  {isLargeScreen && (
                    <button
                      onClick={() => setCafeFullScreen(true)}
                      className="text-amber-400 hover:text-white border border-amber-400/50 hover:border-amber-400 px-2 py-1.5 flex items-center gap-1.5 font-black uppercase text-[9px] tracking-widest transition-colors cursor-pointer"
                      title={t('chat_to_cafe_title')}
                      aria-label={t('chat_to_cafe_title')}
                    >
                      <Maximize2 size={12} strokeWidth={2.5} />
                      <span className="hidden sm:inline">{t('chat_to_cafe')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-rose-500 hover:bg-white/10 p-1.5 transition-colors cursor-pointer"
                    aria-label={t('close')}
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Admin'in açtığı canlı etkinlik bandı (yoksa gizlenir) */}
              {eventVisible && (
                <div className="bg-gradient-to-r from-rose-900/60 to-purple-900/60 border-b-2 border-white/20 p-2.5 px-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={14} className="text-amber-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider block truncate">
                        {eventTitle}
                      </span>
                      <span className="text-[9px] text-neutral-300 font-bold uppercase">
                        {chatEvent?.date ? `${chatEvent.date} · ` : ''}{eventAttendees === null ? t('chat_attendees_loading') : t('chat_attendees', { count: eventAttendees })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleEvent}
                    disabled={rsvpBusy}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border transition-colors shrink-0 cursor-pointer disabled:opacity-50",
                      eventJoined
                        ? "bg-emerald-500 text-black border-black"
                        : "bg-white text-black hover:bg-amber-400 border-black"
                    )}
                  >
                    {rsvpBusy ? '...' : eventJoined ? t('chat_joined') : t('chat_join')}
                  </button>
                </div>
              )}

              {/* Room Selector Tabs Bar */}
              <div className="bg-neutral-900 border-b-2 border-white/20 p-1.5 flex items-center gap-1 overflow-x-auto">
                {allRooms.map((room) => {
                  const isSelected = room.id === activeRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleRoomChange(room.id)}
                      className={cn(
                        "px-2 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border shrink-0 transition-all cursor-pointer",
                        isSelected
                          ? "bg-white text-black border-white neo-shadow-white"
                          : "bg-black text-neutral-400 border-white/20 hover:text-white hover:border-white/40"
                      )}
                    >
                      <span>{room.icon}</span>
                      <span>#{roomLabel(room)}</span>
                    </button>
                  );
                })}

                {currentUser && pendingRoomCount > 0 && (
                  <button
                    onClick={() => setQueueOpen(true)}
                    className="px-2 py-1 bg-cyan-500 hover:bg-white text-black border border-black text-[10px] font-black uppercase flex items-center gap-0.5 shrink-0 transition-colors cursor-pointer"
                    title={t('chat_pending_requests_title')}
                  >
                    <Vote size={12} />
                    <span>{t('chat_pending_requests')} ({pendingRoomCount})</span>
                  </button>
                )}

                <button
                  onClick={() => setRoomModalOpen(true)}
                  className="px-2 py-1 bg-black hover:bg-white hover:text-black text-neutral-300 border border-white/30 text-[10px] font-black uppercase flex items-center gap-0.5 shrink-0 transition-colors cursor-pointer"
                  title={t('chat_open_room_title')}
                >
                  <Plus size={12} />
                  <span>{t(myKarma >= 500 ? 'chat_open_room' : 'chat_request_room')}</span>
                </button>
              </div>

              
              {/* Mesaj arama — bu oda içinde */}
              {searchOpen && (
                <div className="bg-black border-b-2 border-white/20 p-2 flex items-center gap-2">
                  <Search size={14} className="text-neutral-500 shrink-0" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('chat_search_placeholder')}
                    aria-label={t('chat_search_placeholder')}
                    className="flex-1 min-w-0 bg-neutral-950 border-2 border-white/20 focus:border-amber-400 px-2 py-1.5 text-[11px] font-bold text-white placeholder-neutral-600 outline-none transition-colors"
                  />
                  {searchTerm && (
                    <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 shrink-0">
                      {visibleMessages.length}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-neutral-400 hover:text-white p-1 shrink-0"
                    aria-label={t('chat_search_empty')}
                  >
                    <X size={13} strokeWidth={3} />
                  </button>
                </div>
              )}

              {/* Messages Body */}
              <div
                ref={messagesBodyRef}
                onScroll={handleBodyScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-black relative"
              >
                {visibleMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2 text-center px-4">
                    <Hash size={32} className="text-neutral-700" />
                    {allMessages.length === 0 ? (
                      <>
                        <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                          {t('chat_first_message', { room: roomLabel(currentRoom) })}
                        </p>
                        <p className="text-[10px] text-neutral-600 font-bold uppercase">
                          {t('chat_rules')}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                        {t('chat_search_empty')}
                      </p>
                    )}
                  </div>
                ) : (
                  renderItems.map((item) => {
                    if (item.type === 'day') {
                      return (
                        <div key={item.key} className="flex items-center gap-2 py-0.5">
                          <span className="h-px flex-1 bg-white/10" />
                          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-neutral-500">
                            {item.label}
                          </span>
                          <span className="h-px flex-1 bg-white/10" />
                        </div>
                      );
                    }

                    if (item.type === 'new') {
                      return (
                        <div key={item.key} className="flex items-center gap-2 border-y-2 border-rose-500/60 bg-rose-500/10 py-1.5 px-2">
                          <CornerDownRight size={12} className="text-rose-400 shrink-0" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-rose-300">
                            {t('chat_since_last_visit')}
                          </span>
                          <span className="ml-auto text-[9px] font-mono uppercase tracking-wider text-rose-300/80">
                            {t('chat_new_messages_count', { count: newMessagesCount })}
                          </span>
                        </div>
                      );
                    }

                    const msg = item.msg;
                    const i = item.index;
                    const prevMsg = i > 0 ? visibleMessages[i - 1] : undefined;
                    const isMe = msg.uid === currentUser?.uid || msg.uid === 'anon';
                    const showHeader = !prevMsg || prevMsg.uid !== msg.uid;

                    return (
                      <div key={item.key} className={cn("flex flex-col relative z-10", isMe ? "items-end" : "items-start")}>
                        {showHeader && (
                          <div className="flex items-center gap-1.5 mb-1 pl-1">
                            <img src={msg.avatar || resolveAvatar(null, msg.uid === 'anon' ? `misafir-${msg.id}` : msg.name)} alt={msg.name} className="w-5 h-5 border border-white bg-white grayscale" />
                            <span className="text-[10px] text-neutral-300 font-black uppercase tracking-widest">{msg.name}</span>
                            {msg.isLocal && (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 border border-amber-400 text-amber-400 bg-amber-400/10">{t('chat_local_room_badge')}</span>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5 w-full" style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                          <div className={cn(
                            "px-3.5 py-2.5 max-w-[85%] text-xs font-bold tracking-wide border-2 uppercase text-left relative group/msg",
                            isMe
                              ? "bg-rose-600 text-white border-white neo-shadow-white"
                              : "bg-neutral-900 text-neutral-100 border-white/30"
                          )}>
                            {msg.text}
                            {isMe && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 text-rose-500 hover:text-white p-1 bg-black border border-white transition-opacity cursor-pointer"
                                title={t('chat_delete_message')}
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            )}
                          </div>
                          <span className={cn(
                            "text-[8px] font-bold text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-2",
                            isMe ? "text-right" : "text-left"
                          )}>
                            {formatRelativeTime(toDateSafe(msg.createdAt)?.toISOString(), i18n.language) || t('chat_now')}
                            {!isMe && (
                              <ReportButton
                                target={{ targetPath: `globalChat/${msg.id}`, targetLabel: msg.text?.slice(0, 60) }}
                                compact
                                className="ml-1"
                              />
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {showJumpToLatest && (
                  <div className="sticky bottom-1 flex justify-end z-20">
                    <button
                      type="button"
                      onClick={scrollToBottom}
                      className="inline-flex items-center gap-1.5 bg-amber-400 text-black border-2 border-black px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest neo-shadow"
                    >
                      <ArrowDown size={12} strokeWidth={3} /> {t('chat_jump_latest')}
                    </button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input Box */}
              <div className="p-3 bg-neutral-950 border-t-4 border-white/20 relative z-10">
                {!currentUser && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 px-2 py-1 border border-amber-400/50 bg-amber-400/10 text-[9px] font-black uppercase">
                    <span className="text-amber-400">{t('chat_anon_remaining', { used: anonQuota.used, limit: ANON_DAILY_LIMIT })}</span>
                    <span className="text-neutral-500">{t('chat_anon_only_this_device')}</span>
                  </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={t('chat_input_placeholder', { room: roomLabel(currentRoom) })}
                    maxLength={250}
                    className="flex-1 min-w-0 bg-black border-2 border-white/30 px-3 py-2.5 text-white font-bold uppercase tracking-wider text-xs focus:outline-none focus:border-rose-500 placeholder-neutral-600 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-white text-black disabled:opacity-40 p-2.5 border-2 border-black hover:bg-amber-400 transition-colors flex items-center justify-center font-black neo-shadow-white shrink-0 cursor-pointer"
                  >
                    <Send size={16} strokeWidth={2.5} className="translate-x-[1px]" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toggle Chat Floating Button */}
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-black border-4 border-white flex items-center justify-center text-white hover:bg-rose-600 hover:text-white transition-all neo-shadow-white relative group cursor-pointer"
            title={t('chat_toggle_title')}
          >
             <MessageSquare size={24} strokeWidth={2.5} />
             {/* Indicator ping */}
             <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-rose-600 border border-white"></span>
              </span>
          </button>
        )}
      </div>

      {/* Oda öneri / aç pencereleri */}
      <RoomRequestModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        karma={myKarma}
      />
      <RoomQueuePanel
        isOpen={queueOpen}
        onClose={() => setQueueOpen(false)}
        isAdmin={isAdmin}
      />
    </>
  );
};
