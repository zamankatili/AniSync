import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { getSeasonal, getTrending, searchMedia } from '../lib/api';
import { allGames } from '../lib/api/games';
import { useAsync, useDebounced } from '../lib/hooks';
import { GENRE_OPTIONS, matchGenres } from '../lib/genres';
import { MEDIA_LABELS } from '../lib/level';
import type { Media, MediaType } from '../lib/types';
import { FALLBACK_ANIME, FALLBACK_BOOKS, FALLBACK_MANGA } from '../data/fallback';
import { FALLBACK_SEASON } from '../data/seasonFallback';
import { MediaCard } from '../components/MediaCard';
import { Section } from '../components/Section';
import { RailSkeleton } from '../components/PageSkeleton';
import { EmptyState } from '../components/EmptyState';

const TYPES: Array<{ id: MediaType | 'all'; label: string }> = [
  { id: 'all', label: 'Tümü' },
  { id: 'anime', label: 'Anime' },
  { id: 'manga', label: 'Manga' },
  { id: 'novel', label: 'Novel' },
  { id: 'game', label: 'Oyun' },
];

export function Kesfet() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<MediaType | 'all'>('all');
  const [genre, setGenre] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounced(query, 380);

  useEffect(() => {
    if (params.get('focus')) {
      inputRef.current?.focus();
    }
  }, [params]);

  const search = useAsync<Media[]>(
    () => (debounced.trim().length >= 2 ? searchMedia(debounced, type) : Promise.resolve([])),
    [debounced, type],
    [],
  );

  const curated = useAsync(
    async () => {
      const [anime, manga, novel, seasonal] = await Promise.all([
        getTrending('anime'),
        getTrending('manga'),
        getTrending('novel'),
        getSeasonal(),
      ]);
      return { anime, manga, novel, seasonal, games: allGames() };
    },
    [],
    {
      anime: FALLBACK_ANIME,
      manga: FALLBACK_MANGA,
      novel: FALLBACK_BOOKS,
      seasonal: FALLBACK_SEASON,
      games: allGames(),
    },
  );

  const allCurated = useMemo(
    () => [...curated.data.seasonal, ...curated.data.anime, ...curated.data.manga, ...curated.data.novel, ...curated.data.games],
    [curated.data],
  );

  const genreResults = useMemo(() => {
    if (!genre) return [];
    const seen = new Set<string>();
    return allCurated.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return matchGenres([genre], m.genres) > 0 && (type === 'all' || m.type === type);
    });
  }, [allCurated, genre, type]);

  const searching = debounced.trim().length >= 2;
  const results = search.data;

  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow">keşif</p>
        <h1 className="h1 mt-1.5">Ne arıyorsun?</h1>
        <p className="mt-2 max-w-xl text-[13.5px] text-[var(--ink-2)]">
          Anime, manga, novel ve oyun aynı rafta. Bir isim yaz ya da aşağıdan karıştır.
        </p>
      </header>

      <div className="sticky top-[52px] z-30 -mx-4 px-4 py-2 md:top-[64px] md:-mx-8 md:px-8 glass">
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Frieren, Vagabond, Dune, Elden Ring…"
            className="input !py-3 !pl-10 !pr-10 text-[14px]"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[var(--ink-3)] hover:text-[var(--ink)]"
              aria-label="Temizle"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="mt-2.5 flex gap-1.5 overflow-x-auto no-scrollbar">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className="rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors"
              style={{
                borderColor: type === t.id ? 'var(--accent)' : 'var(--line)',
                background: type === t.id ? 'var(--accent-soft)' : 'transparent',
                color: type === t.id ? 'var(--accent)' : 'var(--ink-2)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {searching ? (
        <div>
          <p className="mb-3 flex items-center gap-2 text-[11.5px] text-[var(--ink-3)]">
            <SlidersHorizontal size={13} />
            {search.loading ? 'Aranıyor…' : `“${debounced.trim()}” için ${results.length} sonuç`}
          </p>

          {search.loading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton aspect-[2/3] w-full" />
                  <div className="skeleton mt-2 h-3 w-4/5" />
                </div>
              ))}
            </div>
          ) : results.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((m) => (
                <MediaCard key={m.id} media={m} showType />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search size={26} />}
              title="Bu isimle bir şey bulamadık"
              description="Yazımı değiştirmeyi dene: romaji adı, İngilizce adı ya da yazarın adı işe yarayabilir."
              action={
                <button onClick={() => setQuery('')} className="btn btn-ghost btn-sm">
                  Aramayı temizle
                </button>
              }
            />
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setGenre(null)}
              className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
              style={{
                borderColor: !genre ? 'var(--accent)' : 'var(--line)',
                background: !genre ? 'var(--accent-soft)' : 'transparent',
                color: !genre ? 'var(--accent)' : 'var(--ink-3)',
              }}
            >
              Hepsi
            </button>
            {GENRE_OPTIONS.slice(0, 9).map((g) => (
              <button
                key={g.id}
                onClick={() => setGenre(genre === g.id ? null : g.id)}
                className="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors"
                style={{
                  borderColor: genre === g.id ? 'var(--accent)' : 'var(--line)',
                  background: genre === g.id ? 'var(--accent-soft)' : 'transparent',
                  color: genre === g.id ? 'var(--accent)' : 'var(--ink-3)',
                }}
              >
                {g.tr}
              </button>
            ))}
          </div>

          {genre ? (
            <div>
              <p className="mb-3 text-[11.5px] text-[var(--ink-3)]">
                {GENRE_OPTIONS.find((g) => g.id === genre)?.tr} · {genreResults.length} içerik
              </p>
              {genreResults.length ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {genreResults.map((m) => (
                    <MediaCard key={m.id} media={m} showType />
                  ))}
                </div>
              ) : (
                <EmptyState compact title="Bu türde bir şey yok" description="Başka bir tür seçmeyi dene." />
              )}
            </div>
          ) : (
            <div className="space-y-7">
              <Section title="Bu sezon" subtitle="Yayında olanlar">
                {curated.loading && !curated.data.seasonal.length ? (
                  <RailSkeleton />
                ) : (
                  <div className="rail -mx-1 px-1">
                    {[...new Map(curated.data.seasonal.map((m) => [m.id, m])).values()].slice(0, 12).map((m) => (
                      <div key={m.id} className="w-[124px] md:w-[148px]">
                        <MediaCard media={m} showType />
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Manga rafı" subtitle="Panel panel okunası">
                <div className="rail -mx-1 px-1">
                  {curated.data.manga.slice(0, 12).map((m) => (
                    <div key={m.id} className="w-[124px] md:w-[148px]">
                      <MediaCard media={m} />
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Oyun masası" subtitle="Küratörlü seçki · Steam">
                <div className="rail -mx-1 px-1">
                  {curated.data.games.slice(0, 12).map((m) => (
                    <div key={m.id} className="w-[124px] md:w-[148px]">
                      <MediaCard media={m} />
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Novel köşesi" subtitle="Open Library rafından">
                <div className="rail -mx-1 px-1">
                  {curated.data.novel.slice(0, 12).map((m) => (
                    <div key={m.id} className="w-[124px] md:w-[148px]">
                      <MediaCard media={m} />
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </>
      )}

      <p className="pb-2 text-[10.5px] leading-relaxed text-[var(--ink-3)]">
        Veriler: AniList · Open Library · Steam. {MEDIA_LABELS.anime} ve {MEDIA_LABELS.manga} canlı gelir, bağlantı yoksa
        yerel seçki gösterilir.
      </p>
    </div>
  );
}
