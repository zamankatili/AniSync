import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Heart, Plus, Sparkles, ArrowRight, LayoutGrid } from 'lucide-react';
import { useShelfEntries, useStore } from '../store/useStore';
import { statusLabel } from '../lib/level';
import type { ShelfStatus } from '../lib/types';
import { mediaLink } from '../components/MediaCard';
import { MediaCard } from '../components/MediaCard';
import { ProgressControl } from '../components/ProgressControl';
import { EmptyState } from '../components/EmptyState';
import { Section } from '../components/Section';
import { recommendFrom } from '../lib/api';

const FILTERS: Array<{ id: ShelfStatus | 'all'; label: string }> = [
  { id: 'all', label: 'Tümü' },
  { id: 'active', label: 'Devam' },
  { id: 'planned', label: 'Sırada' },
  { id: 'done', label: 'Bitti' },
  { id: 'paused', label: 'Arada' },
  { id: 'dropped', label: 'Bıraktım' },
];

export function Raf() {
  const entries = useShelfEntries();
  const profile = useStore((s) => s.profile)!;
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const [filter, setFilter] = useState<ShelfStatus | 'all'>('all');

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.status === filter);

  const counts = useMemo(() => {
    const byStatus = (s: ShelfStatus) => entries.filter((e) => e.status === s).length;
    return {
      total: entries.length,
      active: byStatus('active'),
      done: byStatus('done'),
      planned: byStatus('planned'),
    };
  }, [entries]);

  const suggestions = useMemo(
    () => recommendFrom([], profile.genres, 12).filter((m) => !entries.some((e) => e.media.id === m.id) && m.cover).slice(0, 5),
    [profile.genres, entries],
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">rafım</p>
        <h1 className="h1 mt-1.5">Rafın</h1>
        <p className="mt-2 text-[13.5px] text-[var(--ink-2)]">
          {counts.total > 0
            ? `${counts.total} eser · ${counts.active} devam ediyor · ${counts.done} bitti`
            : 'Henüz boş. İlk eserini bıraktığında burası ısınacak.'}
        </p>
      </header>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count = f.id === 'all' ? entries.length : entries.filter((e) => e.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors"
              style={{
                borderColor: active ? 'var(--accent)' : 'var(--line)',
                background: active ? 'var(--accent-soft)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--ink-2)',
              }}
            >
              {f.label} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
          {filtered.map((entry) => (
            <div key={entry.media.id} className="card p-3">
              <div className="flex gap-3">
                <Link to={mediaLink(entry.media)} className="shrink-0">
                  <div className="h-[92px] w-[63px] overflow-hidden rounded-[var(--radius-xs)] bg-[var(--surface-3)]">
                    {entry.media.cover && (
                      <img
                        src={entry.media.cover}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={mediaLink(entry.media)} className="min-w-0">
                      <p className="line-clamp-1 text-[13px] font-semibold">{entry.media.title}</p>
                      <p className="mt-0.5 text-[10.5px] text-[var(--ink-3)]">{entry.media.meta || entry.media.subtitle}</p>
                    </Link>
                    <button
                      onClick={() => toggleFavorite(entry.media.id)}
                      aria-label="Favori"
                      className="shrink-0 p-1"
                      style={{ color: entry.favorite ? 'var(--accent)' : 'var(--ink-3)' }}
                    >
                      <Heart size={15} fill={entry.favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="chip !py-0.5 !text-[9.5px]">{statusLabel(entry.status, entry.media.type)}</span>
                    {entry.score ? <span className="text-[10px] font-bold text-[var(--warn)]">★ {entry.score}/10</span> : null}
                  </div>

                  <div className="mt-2.5">
                    <ProgressControl entry={entry} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookMarked size={26} />}
          title={filter === 'all' ? 'Rafın henüz boş' : 'Bu bölümde bir şey yok'}
          description={
            filter === 'all'
              ? 'Keşfet’ten bir şey seç, “Rafıma ekle” de. İlerledikçe burada birikir.'
              : 'Başka bir filtre seçebilir ya da yeni bir şey ekleyebilirsin.'
          }
          action={
            <Link to="/kesfet" className="btn btn-primary btn-sm">
              <Plus size={14} /> Bir şey ekle
            </Link>
          }
        />
      )}

      {suggestions.length > 0 && (
        <Section title="Rafına yakışır" subtitle="Seçtiğin türlerden, henüz rafta olmayanlar">
          <div className="rail -mx-1 px-1">
            {suggestions.map((m) => (
              <div key={m.id} className="w-[124px] md:w-[148px]">
                <MediaCard media={m} showType />
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="card-inset flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
        <Sparkles size={16} className="shrink-0 text-[var(--accent)]" />
        <p className="flex-1 text-[11.5px] leading-relaxed text-[var(--ink-3)]">
          Her bölüm/cilt/sayfa ilerlemesi 4 XP, bitirmek 40 XP. Raf büyüdükçe yeni atmosferler açılır.
        </p>
        <Link to="/atmosfer" className="btn btn-ghost btn-sm shrink-0">
          <LayoutGrid size={13} /> Atmosferler <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
