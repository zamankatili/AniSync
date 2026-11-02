import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Heart, Plus, Sparkles, ArrowRight, LayoutGrid, Search, Upload, ListPlus, CheckSquare, Check } from 'lucide-react';
import { useShelfEntries, useStore } from '../store/useStore';
import { statusLabel } from '../lib/level';
import type { ShelfStatus } from '../lib/types';
import { mediaLink } from '../components/MediaCard';
import { MediaCard } from '../components/MediaCard';
import { ProgressControl } from '../components/ProgressControl';
import { EmptyState } from '../components/EmptyState';
import { Section } from '../components/Section';
import { recommendFrom } from '../lib/api';
import { ImportSheet } from '../components/ImportSheet';

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
  const lists = useStore((s) => s.lists);
  const bulkSetStatus = useStore((s) => s.bulkSetStatus);
  const bulkRemove = useStore((s) => s.bulkRemove);
  const bulkAddToList = useStore((s) => s.bulkAddToList);
  const [filter, setFilter] = useState<ShelfStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'updated' | 'title' | 'score' | 'progress'>('updated');
  const [importOpen, setImportOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exitSelect = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    const base = entries.filter((entry) => {
      if (filter !== 'all' && entry.status !== filter) return false;
      if (!q) return true;
      return `${entry.media.title} ${entry.media.subtitle ?? ''}`.toLocaleLowerCase('tr-TR').includes(q);
    });
    if (sort === 'updated') return base;

    const sorted = [...base];
    if (sort === 'title') sorted.sort((a, b) => a.media.title.localeCompare(b.media.title, 'tr'));
    if (sort === 'score') sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    if (sort === 'progress') {
      const ratio = (entry: (typeof entries)[number]) =>
        entry.media.totalUnits ? entry.progress / entry.media.totalUnits : entry.progress;
      sorted.sort((a, b) => ratio(b) - ratio(a));
    }
    return sorted;
  }, [entries, filter, query, sort]);

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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">rafım</p>
          <h1 className="h1 mt-1.5">Rafın</h1>
          <p className="mt-2 text-[13.5px] text-[var(--ink-2)]">
            {counts.total > 0
              ? `${counts.total} eser · ${counts.active} devam ediyor · ${counts.done} bitti`
              : 'Henüz boş. İlk eserini bıraktığında burası ısınacak.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
          <button
            onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
            className={`btn ${selectMode ? 'btn-soft' : 'btn-ghost'} btn-sm`}
            disabled={!entries.length}
          >
            <CheckSquare size={13} /> {selectMode ? 'Bitti' : 'Seç'}
          </button>
          <Link to="/listeler" className="btn btn-ghost btn-sm">
            <ListPlus size={13} /> Listeler
          </Link>
          <button onClick={() => setImportOpen(true)} className="btn btn-ghost btn-sm">
            <Upload size={13} /> İçe aktar
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rafında ara…"
            className="input !py-2.5 !pl-9 text-[13px]"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="select !py-2.5 text-[12.5px] sm:w-[176px]"
          aria-label="Sıralama"
        >
          <option value="updated">Son güncellenen</option>
          <option value="title">Ad (A–Z)</option>
          <option value="score">Puan</option>
          <option value="progress">İlerleme</option>
        </select>
      </div>

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

      {selectMode && (
        <div className="card sticky top-[60px] z-20 flex flex-wrap items-center gap-2 p-2.5">
          <span className="mr-1 text-[11.5px] font-bold">{selected.size} seçili</span>
          <button
            onClick={() => {
              bulkSetStatus(Array.from(selected), 'active');
              exitSelect();
            }}
            disabled={!selected.size}
            className="btn btn-ghost btn-sm disabled:opacity-40"
          >
            Devam
          </button>
          <button
            onClick={() => {
              bulkSetStatus(Array.from(selected), 'done');
              exitSelect();
            }}
            disabled={!selected.size}
            className="btn btn-ghost btn-sm disabled:opacity-40"
          >
            Bitti
          </button>
          <button
            onClick={() => {
              bulkSetStatus(Array.from(selected), 'planned');
              exitSelect();
            }}
            disabled={!selected.size}
            className="btn btn-ghost btn-sm disabled:opacity-40"
          >
            Sırada
          </button>
          {lists.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                bulkAddToList(e.target.value, Array.from(selected));
                exitSelect();
              }}
              disabled={!selected.size}
              className="select !w-auto !py-1.5 text-[11px]"
            >
              <option value="">Listeye ekle…</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.emoji} {list.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => {
              bulkRemove(Array.from(selected));
              exitSelect();
            }}
            disabled={!selected.size}
            className="btn btn-ghost btn-sm disabled:opacity-40"
          >
            Kaldır
          </button>
          <button onClick={exitSelect} className="btn btn-ghost btn-sm ml-auto">
            Vazgeç
          </button>
        </div>
      )}

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
          {filtered.map((entry) => (
            <div key={entry.media.id} className="card p-3">
              <div className="flex gap-3">
                {selectMode && (
                  <button
                    onClick={() => toggleSelect(entry.media.id)}
                    aria-label={`${entry.media.title} seç`}
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center border-2"
                    style={{
                      borderColor: selected.has(entry.media.id) ? 'var(--accent)' : 'var(--line-strong)',
                      background: selected.has(entry.media.id) ? 'var(--accent)' : 'transparent',
                      color: 'var(--accent-ink)',
                    }}
                  >
                    {selected.has(entry.media.id) && <Check size={13} />}
                  </button>
                )}
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
          title={query ? 'Rafında bulunamadı' : filter === 'all' ? 'Rafın henüz boş' : 'Bu bölümde bir şey yok'}
          description={
            query
              ? 'Farklı bir isim dene ya da aramayı temizle.'
              : filter === 'all'
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

      <ImportSheet open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
