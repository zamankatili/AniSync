import { useState } from 'react';
import { Send, EyeOff, X } from 'lucide-react';
import type { Media, PostKind } from '../lib/types';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';

const KINDS: Array<{ id: PostKind; label: string }> = [
  { id: 'sohbet', label: 'Sohbet' },
  { id: 'oneri', label: 'Öneri' },
  { id: 'soru', label: 'Soru' },
  { id: 'inceleme', label: 'İnceleme' },
];

interface ComposerProps {
  refMedia?: Media | null;
  clubId?: string;
  placeholder?: string;
  onDone?: () => void;
  autoFocus?: boolean;
}

export function Composer({ refMedia, clubId, placeholder, onDone, autoFocus }: ComposerProps) {
  const profile = useStore((s) => s.profile);
  const createPost = useStore((s) => s.createPost);
  const [text, setText] = useState('');
  const [kind, setKind] = useState<PostKind>('sohbet');
  const [spoiler, setSpoiler] = useState(false);
  const [focused, setFocused] = useState(false);

  const submit = () => {
    if (!text.trim()) return;
    createPost({ text, kind, spoiler, ref: refMedia ?? undefined, clubId });
    setText('');
    setSpoiler(false);
    onDone?.();
  };

  return (
    <div className="card p-3.5">
      <div className="flex gap-3">
        <Avatar emoji={profile?.emoji ?? '🫖'} color={profile?.color ?? 'var(--accent)'} size={34} />
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
            }}
            placeholder={placeholder ?? 'Aklında ne var? Bir sahne, bir cümle, bir öneri...'}
            rows={focused ? 3 : 2}
            autoFocus={autoFocus}
            className="textarea !min-h-[54px] !border-0 !bg-transparent !px-0 !py-1 text-[13.5px] focus:!shadow-none"
          />

          {refMedia && (
            <div className="mb-2 flex items-center gap-2 rounded-[var(--radius-xs)] bg-[var(--surface-2)] p-1.5">
              <div className="h-9 w-6 overflow-hidden rounded-[2px] bg-[var(--surface-3)]">
                {refMedia.cover && <img src={refMedia.cover} alt="" className="h-full w-full object-cover" />}
              </div>
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{refMedia.title}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className="rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-colors"
                  style={{
                    background: kind === k.id ? 'var(--accent-soft)' : 'transparent',
                    color: kind === k.id ? 'var(--accent)' : 'var(--ink-3)',
                  }}
                >
                  {k.label}
                </button>
              ))}
              <button
                onClick={() => setSpoiler((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-bold transition-colors"
                style={{
                  background: spoiler ? 'var(--accent-soft)' : 'transparent',
                  color: spoiler ? 'var(--accent)' : 'var(--ink-3)',
                }}
                title="Spoiler olarak işaretle"
              >
                {spoiler ? <X size={11} /> : <EyeOff size={11} />}
                Spoiler
              </button>
            </div>

            <button onClick={submit} disabled={!text.trim()} className="btn btn-primary btn-sm disabled:opacity-40">
              <Send size={13} /> Paylaş
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
