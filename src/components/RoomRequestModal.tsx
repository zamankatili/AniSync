import React, { useMemo, useState } from 'react';
import { Loader2, Check, X, Sparkles, Vote } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { isBootstrapAdminEmail } from '../lib/adminConfig';
import {
  DIRECT_ROOM_MIN_XP,
  ROOM_VOTE_THRESHOLD,
  createRoomDirect,
  moderateRoomProposal,
  submitRoomRequest,
} from '../lib/rooms';
import { cn } from '../lib/utils';

/**
 * Oda önerme / açma penceresi.
 * - Kalfa ve üzeri (>= 500 XP) AI filtresi geçince doğrudan oda açar.
 * - Altındaki her kullanıcı 50 oy + moderatör onayına tabi "oda isteği" açar.
 * - AI filtresi şüpheli bulursa istek yine kaydedilir (moderasyon kuyruğunda görünür).
 */
interface RoomRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  karma: number;
}

const EMOJI_OPTIONS = [
  '💬','🍿','⚓','📺','🎮','🕹️','🎵','🎧','🍜','🗾','🌆','🧑‍🚀','👹','⚔️','🧿','🧥',
  '🐲','🚀','🎴','🌀','🌸','🏯','🗻','😎','🧠','💀','🐶','🪅','💥','🏆','📖','✍️',
];

export const RoomRequestModal: React.FC<RoomRequestModalProps> = ({ isOpen, onClose, karma }) => {
  const { t } = useAppTranslation();
  const { addToast } = useToastStore();
  const { currentUser, userProfile } = useAppStore();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [icon, setIcon] = useState('💬');
  const [customIcon, setCustomIcon] = useState('');
  const [busy, setBusy] = useState(false);

  const canDirect = karma >= DIRECT_ROOM_MIN_XP;
  const activeIcon = (customIcon || icon || '💬').trim().slice(0, 2);

  const handleSubmit = async () => {
    const trimmedName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 24);
    const trimmedTopic = topic.trim();
    if (trimmedName.length < 3) {
      addToast(t('chat_room_name_too_short'), 'error');
      return;
    }
    if (trimmedTopic.length < 6) {
      addToast(t('chat_room_topic_too_short'), 'error');
      return;
    }
    if (!currentUser) {
      addToast(t('chat_login_required'), 'info');
      return;
    }

    setBusy(true);
    try {
      const moderation = await moderateRoomProposal(trimmedName, trimmedTopic);
      const displayName = currentUser.displayName || userProfile?.name || 'Otaku';
      const createdBy = { uid: currentUser.uid, name: displayName };

      if (canDirect && moderation.ok) {
        await createRoomDirect(trimmedName, trimmedTopic, activeIcon, createdBy, karma);
        addToast(t('chat_room_created_direct', { name: trimmedName }), 'success');
      } else {
        await submitRoomRequest(trimmedName, trimmedTopic, activeIcon, { ...createdBy, karma }, moderation.verdict, moderation.reason);
        addToast(
          moderation.verdict === 'ok'
            ? t('chat_room_request_submitted', { count: ROOM_VOTE_THRESHOLD })
            : t('chat_room_request_ai_flagged'),
          'success',
        );
      }
      onClose();
    } catch (error) {
      console.error(error);
      addToast(t('chat_room_failed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('chat_new_room_title')}
    >
      <div
        className="w-full max-w-lg bg-neutral-950 border-4 border-white neo-shadow-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-4 border-white/20 bg-black flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 border-2 border-white flex items-center justify-center text-xl">
              {activeIcon}
            </div>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-tight leading-tight">
                {canDirect ? t('chat_create_room_title') : t('chat_request_room_title')}
              </h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                {canDirect ? t('chat_karma_direct', { karma }) : t('chat_karma_request', { karma })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-rose-500 p-1.5 cursor-pointer" aria-label={t('close')}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase border-2 border-amber-400 bg-amber-400/10 text-amber-400 px-3 py-2">
            <Sparkles size={14} />
            <span>
              {canDirect
                ? t('chat_rule_direct', { xp: DIRECT_ROOM_MIN_XP })
                : t('chat_rule_request', { threshold: ROOM_VOTE_THRESHOLD })}
            </span>
          </div>

          <div>
            <label htmlFor="room-name" className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">
              {t('chat_room_name_label')}
            </label>
            <input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="one-piece-spoiler"
              className="w-full bg-black border-2 border-white/30 focus:border-amber-400 text-white font-bold p-3 text-sm outline-none"
            />
            <p className="text-[9px] text-neutral-500 font-bold uppercase mt-1">{t('chat_room_name_hint')}</p>
          </div>

          <div>
            <label htmlFor="room-topic" className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">
              {t('chat_room_topic_label')}
            </label>
            <textarea
              id="room-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
              maxLength={140}
              placeholder={t('chat_room_topic_placeholder')}
              className="w-full bg-black border-2 border-white/30 focus:border-amber-400 text-white font-bold p-3 text-sm outline-none resize-none"
            />
          </div>

          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">
              {t('chat_room_icon_label')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => {
                const selected = activeIcon === emoji && !customIcon;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setIcon(emoji); setCustomIcon(''); }}
                    className={cn(
                      'w-9 h-9 border-2 text-lg flex items-center justify-center cursor-pointer transition-all',
                      selected ? 'bg-amber-400 border-black' : 'bg-black border-white/20 hover:border-amber-400',
                    )}
                    aria-pressed={selected}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value.slice(0, 2))}
                placeholder={t('chat_room_icon_custom_placeholder')}
                maxLength={2}
                className="w-16 text-center bg-black border border-white/30 p-1.5 font-bold outline-none"
                aria-label={t('chat_room_icon_custom')}
              />
              <span className="text-[9px] text-neutral-500 font-bold uppercase">{t('chat_room_icon_custom_hint')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-5 py-3 bg-neutral-800 text-white border-2 border-white/30 font-black text-xs uppercase tracking-wider hover:bg-neutral-700"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={busy || !name.trim() || !topic.trim()}
              className="flex-1 py-3 bg-amber-400 hover:bg-white disabled:opacity-50 text-black font-black uppercase text-xs tracking-widest border-4 border-black flex items-center justify-center gap-2 neo-shadow transition-colors cursor-pointer"
            >
              {busy
                ? <Loader2 size={16} className="animate-spin" />
                : canDirect
                  ? <Check size={16} strokeWidth={3} />
                  : <Vote size={16} strokeWidth={2.5} />}
              <span>{busy ? t('chat_room_submitting') : canDirect ? t('chat_create') : t('chat_request_send')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
