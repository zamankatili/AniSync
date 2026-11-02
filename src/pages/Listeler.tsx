import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, ListPlus, Plus, Trash2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Sheet } from '../components/Sheet';
import { MediaCard } from '../components/MediaCard';
import { EmptyState } from '../components/EmptyState';

const EMOJIS = ['📚', '⭐', '🌙', '🎯', '🍂', '🕯️', '🎮', '🫖', '🌸', '🗂️'];
const COLORS = ['#e11d48', '#eda85a', '#8b7cf6', '#7fb069', '#d95d39', '#8a4f7d'];

export function Listeler() {
  const lists = useStore((s) => s.lists);
  const shelf = useStore((s) => s.shelf);
  const createList = useStore((s) => s.createList);
  const deleteList = useStore((s) => s.deleteList);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const selected = lists.find((l) => l.id === selectedId) ?? null;

  const selectedMedia = useMemo(() => {
    if (!selected) return [];
    return selected.mediaIds.map((id) => shelf[id]?.media).filter((m): m is NonNullable<typeof m> => Boolean(m));
  }, [selected, shelf]);

  const create = () => {
    if (name.trim().length < 2) return;
    const id = createList({ name, description, emoji, color });
    setName('');
    setDescription('');
    setOpen(false);
    setSelectedId(id);
  };

  const share = async () => {
    if (!selected) return;
    const text = [
      `${selected.emoji} ${selected.name} — ${selectedMedia.length} eser`,
      '',
      ...selectedMedia.map((m) => `• ${m.title}${m.year ? ` (${m.year})` : ''}`),
      '',
      '— AniSync, otaku mahallesi',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Listeyi kopyala:', text);
    }
  };

  if (selected) {
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedId(null)} className="btn btn-ghost btn-sm">
          <ArrowLeft size={13} /> listeler
        </button>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">liste</p>
            <h1 className="h1 mt-1.5">
              {selected.emoji} {selected.name}
            </h1>
            <p className="mt-2 text-[13px] text-[var(--ink-2)]">
              {selected.description || 'Bu liste için henüz bir açıklama yok.'}
            </p>
            <p className="mt-1 text-[11px] text-[var(--ink-3)]">{selectedMedia.length} eser</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => void share()} className="btn btn-ghost btn-sm">
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Kopyalandı' : 'Paylaş'}
            </button>
            {confirmDelete ? (
              <button
                onClick={() => {
                  deleteList(selected.id);
                  setSelectedId(null);
                  setConfirmDelete(false);
                }}
                className="btn btn-sm"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                Eminim, sil
              </button>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="btn btn-ghost btn-sm">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </header>

        {selectedMedia.length ? (
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-5">
            {selectedMedia.map((media) => (
              <div key={media.id}>
                <MediaCard media={media} showType />
                <button
                  onClick={() => useStore.getState().toggleListItem(selected.id, media.id)}
                  className="mt-1 text-[10px] font-bold text-[var(--ink-3)] underline underline-offset-2 hover:text-[var(--accent-2)]"
                >
                  listeden çıkar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ListPlus size={24} />}
            title="Liste boş"
            description="Bir eserin detayındaki “Rafıma ekle” panelinden bu listeye ekleyebilirsin."
            action={
              <Link to="/kesfet" className="btn btn-primary btn-sm">
                <Plus size={13} /> Keşfet
              </Link>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">listeler</p>
          <h1 className="h1 mt-1.5">Kendi rafın, kendi düzeni</h1>
          <p className="mt-2 max-w-xl text-[13px] text-[var(--ink-2)]">
            “Frieren sonrası”, “kış akşamları”, “birlikte oynanacaklar”… Ne istersen.
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm shrink-0">
          <Plus size={13} /> Yeni liste
        </button>
      </header>

      {lists.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setSelectedId(list.id)}
              className="card lift p-4 text-left"
              style={{ borderLeft: `6px solid ${list.color}` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">{list.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold">{list.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[var(--ink-3)]">
                    {list.description || 'Açıklama yok'}
                  </p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">
                    {list.mediaIds.length} eser
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ListPlus size={24} />}
          title="Henüz liste yok"
          description="İlk listeni aç: bir tema, bir ruh hâli ya da “birlikte izlenecekler”."
          action={
            <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={13} /> Liste oluştur
            </button>
          }
        />
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni liste"
        subtitle="İsim, ruh hâli ve renk. Gerisi senin."
      >
        <label className="block">
          <span className="eyebrow mb-2 block">liste adı</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Frieren sonrası, kış akşamları…"
            className="input"
            maxLength={40}
            autoFocus
          />
        </label>

        <label className="mt-4 block">
          <span className="eyebrow mb-2 block">açıklama (opsiyonel)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bu liste ne için?"
            className="textarea !min-h-[64px]"
            maxLength={140}
          />
        </label>

        <div className="mt-4">
          <span className="eyebrow mb-2 block">simge</span>
          <div className="grid grid-cols-10 gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="flex aspect-square items-center justify-center rounded-full border text-[17px]"
                style={{
                  borderColor: emoji === e ? 'var(--accent)' : 'var(--line)',
                  background: emoji === e ? 'var(--accent-soft)' : 'var(--surface)',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="eyebrow mb-2 block">renk</span>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Renk ${c}`}
                className="h-7 w-7 rounded-full border-2"
                style={{ background: c, borderColor: color === c ? 'var(--ink)' : 'transparent' }}
              />
            ))}
          </div>
        </div>

        <button onClick={create} disabled={name.trim().length < 2} className="btn btn-primary mt-5 w-full disabled:opacity-40">
          Listeyi aç
        </button>
      </Sheet>
    </div>
  );
}
