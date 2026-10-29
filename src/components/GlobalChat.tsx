import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../context/AppStore';
import { 
  MessageSquare, X, Send, Loader2, Sparkles, Hash, Users, 
  Calendar, Flame, Music, Swords, Plus, Check, ChevronDown 
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { cn, formatRelativeTime } from '../lib/utils';
import { useToastStore } from '../store/useToastStore';

interface ChatMessage {
  id: string;
  text: string;
  uid: string;
  name: string;
  avatar: string;
  roomId?: string;
  createdAt: any;
}

export interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  icon: string;
  badge: string;
  isOfficial?: boolean;
}

const DEFAULT_ROOMS: ChatRoom[] = [
  { id: 'genel', name: 'genel-sohbet', topic: 'Anime dünyası, öneriler ve günlük geyik', icon: '💬', badge: 'ANA ODA', isOfficial: true },
  { id: 'spoiler', name: 'haftalik-spoiler', topic: 'Yeni çıkan bölümler, mangalar ve teoriler', icon: '🍿', badge: 'SPOILER', isOfficial: true },
  { id: 'muzik', name: 'muzik-ve-lofi', topic: 'Anime OST, radyo şarkıları ve favori açılışlar', icon: '🎧', badge: 'OST & LOFI', isOfficial: true },
  { id: 'vs-tartisma', name: 'guc-karsilastirma', topic: 'Karakter güç seviyeleri ve vs tartışmaları', icon: '⚔️', badge: 'VS ARENA', isOfficial: true },
  { id: 'etkinlik', name: 'online-etkinlikler', topic: 'Haftalık izleme geceleri ve canlı topluluk sohbeti', icon: '🎉', badge: 'CANLI ETKİNLİK', isOfficial: true },
];

export const GlobalChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string>('genel');
  const [customRooms, setCustomRooms] = useState<ChatRoom[]>(() => {
    try {
      const saved = localStorage.getItem('anisync_custom_rooms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [eventJoined, setEventJoined] = useState(false);
  const [eventAttendees, setEventAttendees] = useState(48);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { currentUser, userProfile } = useAppStore();
  const { addToast } = useToastStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const allRooms = [...DEFAULT_ROOMS, ...customRooms];
  const currentRoom = allRooms.find(r => r.id === activeRoomId) || DEFAULT_ROOMS[0];

  useEffect(() => {
    if (!isOpen) return;
    
    // Listen to messages for active room
    // Note: For backwards compatibility, 'genel' room also displays messages without a roomId field
    const chatRef = collection(db, 'globalChat');
    const q = query(chatRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as ChatMessage;
        const msgRoom = data.roomId || 'genel';
        if (msgRoom === activeRoomId) {
          msgs.push({ id: docSnap.id, ...data });
        }
      });
      setMessages(msgs.reverse());
      setTimeout(scrollToBottom, 100);
    }, (err) => {
      console.warn("GlobalChat listener error:", err);
    });
    
    return () => unsubscribe();
  }, [isOpen, activeRoomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) {
      if (!currentUser) {
        addToast("Sohbet etmek için giriş yapmalısın!", "info");
      }
      return;
    }
    
    if (newMessage.length > 250) {
      addToast("Mesaj çok uzun (max 250 karakter).", "error");
      return;
    }

    const text = newMessage.trim();
    setNewMessage('');
    
    try {
      await addDoc(collection(db, 'globalChat'), {
        text,
        roomId: activeRoomId,
        uid: currentUser.uid,
        name: currentUser.displayName || userProfile.name,
        avatar: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`,
        createdAt: serverTimestamp()
      });
      scrollToBottom();
    } catch (err) {
      console.error(err);
      addToast("Mesaj gönderilemedi.", "error");
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const formattedId = newRoomName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    if (allRooms.some(r => r.id === formattedId)) {
      addToast("Bu oda zaten mevcut!", "error");
      return;
    }

    const created: ChatRoom = {
      id: formattedId,
      name: newRoomName.trim().toLowerCase().replace(/\s+/g, '-'),
      topic: 'Kullanıcı tarafından oluşturulan özel anime odası',
      icon: '✨',
      badge: 'ÖZEL ODA',
      isOfficial: false
    };

    const updated = [...customRooms, created];
    setCustomRooms(updated);
    try {
      localStorage.setItem('anisync_custom_rooms', JSON.stringify(updated));
    } catch {}

    setActiveRoomId(created.id);
    setNewRoomName('');
    setIsCreatingRoom(false);
    addToast(`#${created.name} odası oluşturuldu!`, 'success');
  };

  const handleToggleEvent = () => {
    if (eventJoined) {
      setEventAttendees(prev => prev - 1);
      setEventJoined(false);
      addToast("Etkinlik katılımın iptal edildi.", "info");
    } else {
      setEventAttendees(prev => prev + 1);
      setEventJoined(true);
      addToast("🎉 Cuma 21:00 Frieren Final İzleme Gecesine katıldın!", "success");
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'globalChat', msgId));
    } catch (err) {
      console.error(err);
      addToast("Mesaj silinemedi.", "error");
    }
  };

  return (
    <>
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
                        #{currentRoom.name}
                      </span>
                      <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                        {currentRoom.badge}
                      </span>
                    </div>
                    <p className="text-neutral-400 font-bold text-[10px] uppercase truncate max-w-[200px]">
                      {currentRoom.topic}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-white hover:text-rose-500 hover:bg-white/10 p-1.5 transition-colors cursor-pointer"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Live Event Sticky Banner (When on #etkinlik room or top) */}
              <div className="bg-gradient-to-r from-rose-900/60 to-purple-900/60 border-b-2 border-white/20 p-2.5 px-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar size={14} className="text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider block truncate">
                      Cuma 21:00 • Frieren & Solo Leveling İzleme Partisi
                    </span>
                    <span className="text-[9px] text-neutral-300 font-bold uppercase">
                      {eventAttendees} Katılımcı
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleEvent}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border transition-colors shrink-0 cursor-pointer",
                    eventJoined 
                      ? "bg-emerald-500 text-black border-black" 
                      : "bg-white text-black hover:bg-amber-400 border-black"
                  )}
                >
                  {eventJoined ? "Katıldın ✓" : "Katıl"}
                </button>
              </div>

              {/* Room Selector Tabs Bar */}
              <div className="bg-neutral-900 border-b-2 border-white/20 p-1.5 flex items-center gap-1 overflow-x-auto">
                {allRooms.map((room) => {
                  const isSelected = room.id === activeRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={cn(
                        "px-2 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border shrink-0 transition-all cursor-pointer",
                        isSelected
                          ? "bg-white text-black border-white neo-shadow-white"
                          : "bg-black text-neutral-400 border-white/20 hover:text-white hover:border-white/40"
                      )}
                    >
                      <span>{room.icon}</span>
                      <span>#{room.name}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setIsCreatingRoom(!isCreatingRoom)}
                  className="px-2 py-1 bg-black hover:bg-white hover:text-black text-neutral-300 border border-white/30 text-[10px] font-black uppercase flex items-center gap-0.5 shrink-0 transition-colors cursor-pointer"
                  title="Özel Oda Aç"
                >
                  <Plus size={12} />
                  <span>Oda Aç</span>
                </button>
              </div>

              {/* Room Creation Sub-panel */}
              {isCreatingRoom && (
                <form onSubmit={handleCreateRoom} className="bg-neutral-950 border-b-2 border-white/30 p-2.5 flex gap-2">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="yeni-oda-ismi (örn: berserk-fan)"
                    maxLength={25}
                    className="flex-1 bg-black border border-white/40 px-2 py-1 text-xs font-bold text-white uppercase outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-400 text-black font-black text-xs uppercase border border-black hover:bg-white cursor-pointer"
                  >
                    Oluştur
                  </button>
                </form>
              )}
              
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-black relative">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
                    <Hash size={32} className="text-neutral-700" />
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                      #{currentRoom.name} ODASINDA İLK MESAJI SEN AT!
                    </p>
                    <p className="text-[10px] text-neutral-600 font-bold uppercase">
                      Topluluk kurallarına ve saygılı tartışma kültürüne dikkat edelim.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.uid === currentUser?.uid;
                    const showHeader = i === 0 || messages[i-1].uid !== msg.uid;
                    
                    return (
                      <div key={msg.id} className={cn("flex flex-col relative z-10", isMe ? "items-end" : "items-start")}>
                        {showHeader && !isMe && (
                          <div className="flex items-center gap-1.5 mb-1 pl-1">
                            <img src={msg.avatar} alt={msg.name} className="w-5 h-5 border border-white bg-white grayscale" />
                            <span className="text-[10px] text-neutral-300 font-black uppercase tracking-widest">{msg.name}</span>
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
                                title="Mesajı Sil"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            )}
                          </div>
                          <span className={cn(
                            "text-[8px] font-bold text-neutral-500 uppercase tracking-widest px-1",
                            isMe ? "text-right" : "text-left"
                          )}>
                            {msg.createdAt ? formatRelativeTime(msg.createdAt.toDate()) : 'Şimdi'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input Box */}
              <div className="p-3 bg-neutral-950 border-t-4 border-white/20 relative z-10">
                {currentUser ? (
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder={`#${currentRoom.name} odasına yaz...`}
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
                ) : (
                  <div className="text-center py-2.5 text-xs text-amber-400 font-black uppercase tracking-widest bg-black border border-amber-400/50">
                    SOHBETE KATILMAK İÇİN GİRİŞ YAP
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toggle Chat Floating Button */}
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-black border-4 border-white flex items-center justify-center text-white hover:bg-rose-600 hover:text-white transition-all neo-shadow-white relative group cursor-pointer"
            title="Tematik Sohbet & Odalar"
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
    </>
  );
};
