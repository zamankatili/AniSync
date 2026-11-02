import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Check, Heart, Trash2, Star } from 'lucide-react';
import type { Media, ShelfStatus } from '../lib/types';
import { statusLabel } from '../lib/level';
import { genreLabel } from '../lib/genres';
import { useStore } from '../store/useStore';
import { Sheet } from './Sheet';
import { ProgressControl } from './ProgressControl';
import { Stars } from './Stars';

interface AddSheetProps {
  media: Media | null;
  open: boolean;
  onClose: () => void;
}

export function AddSheet({ media, open, onClose }: AddSheetProps) {
  const entry = useStore((s) => (media ? s.shelf[media.id] : undefined));
  const addToShelf = useStore((s) => s.addToShelf);
  const setStatus = useStore((s) => s.setStatus);
  const setScore = useStore((s) => s.setScore);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const removeEntry = useStore((s) => s.removeEntry);
  const lists = useStore((s) => s.lists);
  const toggleListItem = useStore((s) => s.toggleListItem);
  const setEntryNote = useStore((s) => s.setEntryNote);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [note, setNote] = useState('');
  const [noteSpoiler, setNoteSpoiler] = useState(false);

  useEffect(() => {
    setNote(entry?.note ?? '');
    setNoteSpoiler(Boolean(entry?.noteSpoiler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media?.id]);

  if (!media || !open) return null;

  const statuses: ShelfStatus[] = ['active', 'planned', 'done', 'paused', 'dropped'];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Rafına ekle"
      subtitle={media.title}
    >
      <div className="mb-4 flex gap-3">
        <div className="w-[62px] shrink-0">
          <div className="poster" style={{ borderRadius: 'var(--radius-xs)' }}>
            {media.cover ? <img src={media.cover} alt="" referrerPolicy="no-referrer" /> : null}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug">{media.title}</p>
          <p className="mt-1 text-[11px] text-[var(--ink-3)]">{media.meta || media.subtitle}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {media.genres.slice(0, 3).map((g) => (
              <span key={g} className="chip">{genreLabel(g)}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {statuses.map((status) => {
          const active = entry?.status === status;
          return (
            <button
              key={status}
              onClick={() => {
                if (entry) setStatus(media.id, status);
                else addToShelf(media, status);
              }}
              className="flex w-full items-center justify-between rounded-[var(--radius-sm)] border px-3.5 py-3 text-left transition-colors"
              style={{
                borderColor: active ? 'var(--accent)' : 'var(--line)',
                background: active ? 'var(--accent-soft)' : 'transparent',
              }}
            >
              <span className="flex items-center gap-2.5 text-[13px] font-semibold">
                {status === 'done' ? <Check size={15} /> : <Bookmark size={15} />}
                {statusLabel(status, media.type)}
              </span>
              {active && <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">seçili</span>}
            </button>
          );
        })}
      </div>

      {entry && (
        <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-4">
          <ProgressControl entry={entry} />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow mb-1">Puanın</p>
              <Stars value={entry.score ?? 0} onChange={(v) => setScore(media.id, v)} />
            </div>
            <button
              onClick={() => toggleFavorite(media.id)}
              className={`btn ${entry.favorite ? 'btn-soft' : 'btn-ghost'} btn-sm`}
            >
              <Heart size={14} fill={entry.favorite ? 'currentColor' : 'none'} />
              {entry.favorite ? 'Favoride' : 'Favori'}
            </button>
          </div>

          <div className="border-t border-[var(--line)] pt-4">
            <p className="eyebrow mb-1">kişisel not</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bu eserle ilgili kendine bir not…"
              className="textarea !min-h-[70px] text-[12.5px]"
              maxLength={500}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => setNoteSpoiler((v) => !v)}
                className="chip"
                style={{
                  borderColor: noteSpoiler ? 'var(--accent)' : 'var(--line)',
                  color: noteSpoiler ? 'var(--accent)' : 'var(--ink-3)',
                }}
              >
                {noteSpoiler ? 'Spoiler’lı' : 'Spoiler yok'}
              </button>
              <button onClick={() => setEntryNote(media.id, note, noteSpoiler)} className="btn btn-soft btn-sm">
                Notu kaydet
              </button>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">listeler</p>
              <Link to="/listeler" className="text-[10.5px] font-bold text-[var(--accent)]">
                yönet
              </Link>
            </div>
            {lists.length ? (
              <div className="flex flex-wrap gap-1.5">
                {lists.map((list) => {
                  const active = list.mediaIds.includes(media.id);
                  return (
                    <button
                      key={list.id}
                      onClick={() => toggleListItem(list.id, media.id)}
                      className="chip"
                      style={{
                        borderColor: active ? list.color : 'var(--line)',
                        color: active ? list.color : 'var(--ink-3)',
                        background: active ? `${list.color}18` : 'transparent',
                      }}
                    >
                      {list.emoji} {list.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-[var(--ink-3)]">
                Henüz liste yok. <Link to="/listeler" className="font-bold text-[var(--accent)]">İlk listeyi aç.</Link>
              </p>
            )}
          </div>

          {confirmRemove ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  removeEntry(media.id);
                  onClose();
                }}
                className="btn btn-sm flex-1"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                Evet, çıkar
              </button>
              <button onClick={() => setConfirmRemove(false)} className="btn btn-ghost btn-sm flex-1">
                Vazgeç
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ink-3)] hover:text-[var(--accent-2)]"
            >
              <Trash2 size={13} /> Raftan çıkar
            </button>
          )}
        </div>
      )}

      <p className="mt-5 flex items-center gap-1.5 text-[10.5px] text-[var(--ink-3)]">
        <Star size={11} /> İlerleme kaydedince mekân seviyen de büyür.
      </p>
    </Sheet>
  );
}
