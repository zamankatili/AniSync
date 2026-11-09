import React, { useEffect, useMemo, useState } from 'react';
import { X, Vote, ShieldCheck, Loader2, MessagesSquare } from 'lucide-react';
import { collection, doc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { isBootstrapAdminEmail } from '../lib/adminConfig';
import type { RoomRequest } from '../lib/rooms';
import { ROOM_VOTE_THRESHOLD, approveRoomRequest, rejectRoomRequest, voteForRoomRequest } from '../lib/rooms';
import { cn, formatRelativeTime } from '../lib/utils';

/**
 * Bekleyen oda istekleri kuyruğu.
 * - Giriş yapan herkes oy verebilir; bir kullanıcı istek başına bir oy.
 * - İstek 50 oya ulaşınca "moderatör onayı bekliyor" olur; admin onayı/reddi verir.
 * - Admin görür ki hepsini yayınlamaz; reddedebilir veya not düşünür.
 */
interface RoomQueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export const RoomQueuePanel: React.FC<RoomQueuePanelProps> = ({ isOpen, onClose, isAdmin }) => {
  const { t } = useAppTranslation();
  const { addToast } = useToastStore();
  const { currentUser } = useAppStore();
  const [requests, setRequests] = useState<RoomRequest[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busyVotes, setBusyVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setLoadError(false);
    const q = query(
      collection(db, 'roomRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(30),
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const rows: RoomRequest[] = [];
        snap.forEach((d) => rows.push({ ...(d.data() as RoomRequest), id: d.id }));
        setRequests(rows);
      },
      (err) => {
        console.warn('roomRequests listener error', err);
        setLoadError(true);
      },
    );
    return () => unsubscribe();
  }, [isOpen]);

  const toggleVote = async (req: RoomRequest) => {
    if (!currentUser) {
      addToast(t('chat_login_required'), 'info');
      return;
    }
    const uid = currentUser.uid;
    setBusyVotes((s) => new Set(s).add(req.id));
    try {
      const result = await voteForRoomRequest(req.id, uid);
      if (result === 'voted') addToast(t('chat_already_voted'), 'info');
      else if (result === 'closed') addToast(t('chat_request_closed'), 'info');
      else if (result === 'missing') addToast(t('chat_request_closed'), 'error');
    } catch (error) {
      console.error(error);
      addToast(t('chat_vote_failed'), 'error');
    } finally {
      setBusyVotes((s) => {
        const next = new Set(s);
        next.delete(req.id);
        return next;
      });
    }
  };

  const handleApprove = async (req: RoomRequest) => {
    if (!currentUser || !isAdmin) return;
    try {
      await approveRoomRequest(req, currentUser.uid, '');
      addToast(t('chat_request_approved', { name: req.name }), 'success');
    } catch (error) {
      console.error(error);
      addToast(t('chat_approve_failed'), 'error');
    }
  };

  const handleReject = async (req: RoomRequest) => {
    if (!currentUser || !isAdmin) return;
    try {
      await rejectRoomRequest(req.id, currentUser.uid, '');
      addToast(t('chat_request_rejected', { name: req.name }), 'info');
    } catch (error) {
      console.error(error);
      addToast(t('chat_reject_failed'), 'error');
    }
  };

  const pendingThreshold = ROOM_VOTE_THRESHOLD;

  const sorted = useMemo(
    () => (requests ?? []).slice().sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
    [requests],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('chat_queue_title')}
    >
      <div
        className="w-full max-w-lg bg-neutral-950 border-4 border-white neo-shadow-white max-h-[85vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b-4 border-white/20 bg-black flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 border-2 border-white flex items-center justify-center">
              <Vote size={20} className="text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-tight">{t('chat_queue_title')}</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                {t('chat_queue_subtitle', { count: sorted.length })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-rose-500 p-1.5 cursor-pointer" aria-label={t('close')}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {loadError ? (
            <div className="border-2 border-rose-500 bg-rose-500/10 p-4 text-xs font-bold text-rose-300 uppercase text-center">
              {t('chat_queue_load_error')}
            </div>
          ) : requests === null ? (
            <div className="flex items-center justify-center gap-2 p-8 text-neutral-400 font-black uppercase text-xs">
              <Loader2 size={18} className="animate-spin" /> {t('chat_queue_loading')}
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-10 flex flex-col items-center gap-2 text-center">
              <MessagesSquare size={32} className="text-neutral-600" />
              <p className="font-black text-white text-sm uppercase">{t('chat_queue_empty_title')}</p>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider max-w-xs">{t('chat_queue_empty_hint')}</p>
            </div>
          ) : (
            sorted.map((req) => {
              const votes = req.votes ?? 0;
              const pct = Math.min(100, Math.round((votes / pendingThreshold) * 100));
              const readyForReview = votes >= pendingThreshold;
              const hasVoted = currentUser ? (req.voters ?? []).includes(currentUser.uid) : false;
              const busy = busyVotes.has(req.id);
              return (
                <div key={req.id} className="bg-black border-2 border-white/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{req.icon}</span>
                      <div className="min-w-0">
                        <span lang="en" className="text-white font-black text-sm uppercase truncate block">#{req.name}</span>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase">
                          by {req.requestedBy?.name ?? 'Anon'} · {req.requestedBy?.karma ?? 0} XP
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      'text-[9px] font-black uppercase px-2 py-1 border shrink-0',
                      req.aiVerdict === 'ok' ? 'text-emerald-400 border-emerald-400/60 bg-emerald-500/10' : 'text-amber-400 border-amber-400/60 bg-amber-500/10',
                    )}>
                      {req.aiVerdict === 'ok' ? t('chat_ai_ok') : t('chat_ai_flagged')}
                    </span>
                  </div>
                  <p lang={req.topic ? 'en' : 'tr'} className="text-[11px] text-neutral-300 font-bold uppercase leading-snug mt-2 line-clamp-2">
                    {req.topic}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-neutral-800 border border-white/20 overflow-hidden">
                      <div
                        className={cn('h-full transition-all duration-300', readyForReview ? 'bg-emerald-500' : 'bg-cyan-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-cyan-400 font-mono w-14 text-right">{votes}/{pendingThreshold}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => toggleVote(req)}
                      disabled={busy || !currentUser || hasVoted}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 font-black uppercase text-[10px] tracking-wider border transition-colors',
                        hasVoted
                          ? 'border-emerald-500 text-emerald-400 cursor-default'
                          : 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black cursor-pointer',
                        'disabled:opacity-50',
                      )}
                    >
                      {busy ? <Loader2 size={12} className="animate-spin" /> : <Vote size={12} />}
                      {hasVoted ? t('chat_voted') : t('chat_vote')}
                    </button>
                    {readyForReview && (
                      <span className="text-[9px] font-black text-emerald-400 uppercase inline-flex items-center gap-1">
                        <ShieldCheck size={12} /> {t('chat_needs_moderator')}
                      </span>
                    )}
                    {isAdmin && (
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => handleReject(req)}
                          className="px-3 py-1.5 bg-rose-600 text-white border border-white/30 font-black text-[10px] uppercase hover:bg-rose-500"
                        >
                          {t('chat_reject')}
                        </button>
                        <button
                          onClick={() => handleApprove(req)}
                          className="px-3 py-1.5 bg-emerald-500 text-black border border-black font-black text-[10px] uppercase hover:bg-white"
                        >
                          {t('chat_approve')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
