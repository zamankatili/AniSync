import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, MessageSquare, Users, Crown, Clock, 
  Sparkles, Check, Share2, Copy, ShieldCheck 
} from 'lucide-react';
import { WatchPartyRoomData, WatchPartyMessage, formatVideoTime } from '../../data/watchPartySeed';
import { useWatchPartyStore } from '../../store/useWatchPartyStore';
import { cn } from '../../lib/utils';

interface WatchPartyChatProps {
  room: WatchPartyRoomData;
  currentUser: { uid: string; displayName?: string | null; photoURL?: string | null };
  currentVideoTime: number;
  onJumpToTime: (seconds: number) => void;
}

export const WatchPartyChat: React.FC<WatchPartyChatProps> = ({
  room,
  currentUser,
  currentVideoTime,
  onJumpToTime
}) => {
  const { messages, sendMessage } = useWatchPartyStore();
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [attachTimestamp, setAttachTimestamp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const timeToSend = attachTimestamp ? currentVideoTime : undefined;
    await sendMessage(room.id, currentUser, inputText, timeToSend);
    setInputText('');
    setAttachTimestamp(false);
  };

  const copyRoomLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border-4 border-black neo-shadow flex-1 min-h-[460px]">
      {/* Chat / Tab Header */}
      <div className="bg-neutral-900 border-b-4 border-black p-2 flex items-center justify-between text-white">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer",
              activeTab === 'chat'
                ? "bg-amber-400 text-black border-2 border-black neo-shadow"
                : "text-neutral-300 hover:text-white"
            )}
          >
            <MessageSquare size={13} />
            <span>Sohbet ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer",
              activeTab === 'participants'
                ? "bg-amber-400 text-black border-2 border-black neo-shadow"
                : "text-neutral-300 hover:text-white"
            )}
          >
            <Users size={13} />
            <span>İzleyiciler ({room.participantCount})</span>
          </button>
        </div>

        {/* Share Room Button */}
        <button
          onClick={copyRoomLink}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          title="Oda Bağlantısını Kopyala"
        >
          {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
          <span className="hidden sm:inline text-[10px] uppercase font-black">
            {copiedLink ? "KOPYALANDI!" : "DAVET ET"}
          </span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'chat' ? (
        <div className="flex flex-col flex-1 min-h-0 bg-neutral-50">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {/* System welcome notice */}
            <div className="p-2.5 bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs font-bold">
              <span className="font-black uppercase flex items-center gap-1 mb-0.5">
                <Sparkles size={13} className="text-amber-600" />
                CANLI İZLEME ODASINA HOŞ GELDİNİZ!
              </span>
              Host ve katılımcılarla eşzamanlı izleyin, sahne reaksiyonlarını paylaşın ve sohbete katılın.
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-10 text-neutral-400">
                <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
                <p className="font-black text-xs uppercase">Henüz mesaj yazılmadı.</p>
                <p className="text-[11px] font-bold">İlk yorumu sen yaparak sohbeti başlat!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.uid === currentUser.uid;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1 text-xs",
                      isMe ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-neutral-500">
                      <span>{msg.userName}</span>
                      {msg.isHost && (
                        <span className="bg-amber-400 text-black px-1 border border-black text-[9px] flex items-center gap-0.5">
                          <Crown size={9} /> HOST
                        </span>
                      )}
                    </div>

                    <div
                      className={cn(
                        "p-2.5 max-w-[85%] border-2 border-black font-bold break-words",
                        isMe
                          ? "bg-rose-500 text-white shadow-[2px_2px_0px_0px_#000]"
                          : "bg-white text-black shadow-[2px_2px_0px_0px_#000]"
                      )}
                    >
                      {/* Video timestamp tag if present */}
                      {msg.videoTimestamp !== undefined && (
                        <button
                          onClick={() => onJumpToTime(msg.videoTimestamp!)}
                          className={cn(
                            "inline-flex items-center gap-1 text-[9px] font-mono font-black px-1.5 py-0.5 border border-black mb-1 mr-1.5 cursor-pointer uppercase",
                            isMe ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-900 text-amber-400 hover:bg-black"
                          )}
                          title="Videoyu bu saniyeye sar"
                        >
                          <Clock size={10} />
                          <span>▶ {formatVideoTime(msg.videoTimestamp)}</span>
                        </button>
                      )}
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t-2 border-black flex flex-col gap-1.5">
            {/* Timestamp Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAttachTimestamp(!attachTimestamp)}
                className={cn(
                  "text-[10px] font-black uppercase px-2 py-0.5 border border-black flex items-center gap-1 cursor-pointer transition-colors",
                  attachTimestamp
                    ? "bg-rose-600 text-white shadow-[1px_1px_0px_0px_#000]"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <Clock size={11} />
                <span>Zaman Damgası ({formatVideoTime(currentVideoTime)})</span>
              </button>

              <span className="text-[9px] text-neutral-400 font-bold uppercase">
                Oda Kodu: {room.roomCode}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Sahne hakkında düşünceni yaz..."
                maxLength={300}
                className="flex-1 px-3 py-2 border-2 border-black font-bold text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-300 text-black border-2 border-black font-black text-xs uppercase flex items-center justify-center transition-transform active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Participants Tab */
        <div className="flex-1 p-3 bg-neutral-50 overflow-y-auto space-y-2">
          <div className="text-xs font-black uppercase text-neutral-500 mb-2">
            Şu Anda Odada Bulunanlar ({room.participantCount})
          </div>

          {/* Host Card */}
          <div className="p-2.5 bg-amber-100 border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 border border-black flex items-center justify-center font-black text-sm text-black">
                {room.hostName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs text-black">{room.hostName}</span>
                  <span className="bg-black text-amber-400 text-[9px] font-black px-1.5 py-0.2 flex items-center gap-0.5">
                    <Crown size={9} /> ODA SAHİBİ
                  </span>
                </div>
                <span className="text-[10px] text-neutral-600 font-bold">Oynatıcıyı Yönetiyor</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Simulated Active Members */}
          {[
            { name: 'KagamineOtaku', status: 'Senkronize', isMe: false },
            { name: 'LeviAckerman_Fan', status: 'Senkronize', isMe: false },
            { name: 'MakimaObserver', status: '0.2s gecikme', isMe: false },
            { name: 'ZoroLostAgain', status: 'Senkronize', isMe: false },
            { name: currentUser.displayName || 'Sen', status: 'Senkronize', isMe: true }
          ].map((part, idx) => (
            <div
              key={idx}
              className={cn(
                "p-2 bg-white border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_0px_#000]",
                part.isMe && "border-rose-500 bg-rose-50"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-neutral-200 border border-black flex items-center justify-center font-bold text-xs">
                  {part.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-xs text-black">
                    {part.name} {part.isMe && "(Sen)"}
                  </span>
                  <p className="text-[9px] text-emerald-600 font-bold uppercase">{part.status}</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
