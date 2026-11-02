import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Plus, Star, Sparkles, MessageSquare } from 'lucide-react';
import { getDetail } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { useStore } from '../store/useStore';
import { MEDIA_LABELS, statusLabel } from '../lib/level';
import { genreLabel } from '../lib/genres';
import { score10 } from '../lib/format';
import { MediaCard } from '../components/MediaCard';
import { AddSheet } from '../components/AddSheet';
import { ProgressControl } from '../components/ProgressControl';
import { Stars } from '../components/Stars';
import { Section } from '../components/Section';
import { Composer } from '../components/Composer';
import { PostCard } from '../components/PostCard';
import { EmptyState } from '../components/EmptyState';
import type { Media } from '../lib/types';

export function Detay() {
  const { type = 'anime', id = '' } = useParams();
  const navigate = useNavigate();
  const fullId = `${type}:${decodeURIComponent(id)}`;

  const { data, loading, error } = useAsync(() => getDetail(fullId), [fullId], null as { media: Media; related: Media[] } | null);
  const entry = useStore((s) => s.shelf[fullId]);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const setScore = useStore((s) => s.setScore);
  const posts = useStore((s) => s.posts);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const media = data?.media;
  const related = data?.related ?? [];

  useEffect(() => {
    if (media) document.title = `${media.title} — AniSync`;
    return () => {
      document.title = 'AniSync — Otaku Mahallesi';
    };
  }, [media]);

  const localPosts = useMemo(() => posts.filter((p) => p.ref?.id === fullId), [posts, fullId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="skeleton -mx-4 h-[200px] md:-mx-8 md:h-[260px]" />
        <div className="mt-4 flex gap-4">
          <div className="skeleton h-[120px] w-[84px]" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-6 w-2/3" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <EmptyState
        title="Bu sayfa açılmadı"
        description={error ?? 'İçerik bulunamadı. Bağlantı eski olabilir.'}
        action={
          <Link to="/kesfet" className="btn btn-primary btn-sm">
            Keşfet’e dön
          </Link>
        }
      />
    );
  }

  const description = media.description ?? '';
  const long = description.length > 320;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-3">
        <ArrowLeft size={13} /> geri
      </button>

      {/* hero */}
      <div className="relative -mx-4 md:-mx-8">
        <div className="relative h-[190px] overflow-hidden md:h-[280px]">
          {media.banner ? (
            <img src={media.banner} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: `linear-gradient(140deg, ${media.accent ?? '#3a2a20'}, var(--bg) 75%)` }}
            />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg) 4%, color-mix(in srgb, var(--bg) 45%, transparent) 55%, transparent)' }} />
        </div>

        <div className="relative -mt-16 px-4 md:-mt-24 md:px-8">
          <div className="flex items-end gap-4">
            <div className="w-[96px] shrink-0 md:w-[132px]">
              <div className="poster" style={{ boxShadow: 'var(--shadow-lift)' }}>
                {media.cover ? (
                  <img src={media.cover} alt={media.title} referrerPolicy="no-referrer" />
                ) : null}
              </div>
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="chip chip-accent">{MEDIA_LABELS[media.type]}</span>
                {media.year && <span className="chip">{media.year}</span>}
                {media.status && <span className="chip">{media.status}</span>}
              </div>
              <h1 className="h1 mt-2 line-clamp-2 text-[1.7rem] md:text-[2.3rem]">{media.title}</h1>
              {media.subtitle && <p className="mt-0.5 line-clamp-1 text-[11.5px] text-[var(--ink-3)]">{media.subtitle}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {media.score ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--warn)]">
            <Star size={13} fill="currentColor" /> {score10(media.score)} / 10
          </span>
        ) : null}
        {media.meta && <span className="text-[11px] text-[var(--ink-3)]">{media.meta}</span>}
        {media.genres.slice(0, 4).map((g) => (
          <span key={g} className="chip">{genreLabel(g)}</span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          {media.note && (
            <div className="card-inset flex gap-2.5 p-3.5">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <p className="text-[11.5px] leading-relaxed text-[var(--ink-2)]">
                <span className="font-bold text-[var(--ink)]">Küratör notu: </span>
                {media.note}
              </p>
            </div>
          )}

          <section>
            <h2 className="h2 mb-2 text-[1.05rem]">Konu</h2>
            <p className={`prose-warm max-w-[68ch] text-[13px] leading-relaxed text-[var(--ink-2)] ${long && !expanded ? 'line-clamp-4' : ''}`}>
              {description || 'Bu eser için henüz bir açıklama yok. İlk notu sen bırakabilirsin.'}
            </p>
            {long && (
              <button onClick={() => setExpanded((v) => !v)} className="mt-1.5 text-[11px] font-bold text-[var(--accent)]">
                {expanded ? 'daha az' : 'devamını oku'}
              </button>
            )}
            <p className="mt-2 text-[10px] text-[var(--ink-3)]">
              Özet kaynaktan geldiği gibi (İngilizce). Türkçe çeviri yakında.
            </p>
          </section>

          {media.externalUrl && (
            <a href={media.externalUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <ExternalLink size={13} /> kaynağa git
            </a>
          )}

          <p className="text-[10.5px] text-[var(--ink-3)]">
            Kaynak: {media.source === 'anilist' ? 'AniList' : media.source === 'openlibrary' ? 'Open Library' : 'Steam'}
            {media.totalUnits ? ` · ${media.totalUnits} ${media.unitLabel} olarak kayıtlı` : ''}
          </p>

          <Section title="Benzer hisler" subtitle="Aynı türden, rafta olmayanlar">
            <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-5">
              {related.slice(0, 5).map((m) => (
                <MediaCard key={m.id} media={m} showType />
              ))}
            </div>
          </Section>

          <Section title="Bu eser hakkında" subtitle="Mekânda konuşulanlar">
            <div className="space-y-3">
              <Composer refMedia={media} placeholder={`${media.title} hakkında bir şey söyle...`} />
              {localPosts.length ? (
                localPosts.map((p) => <PostCard key={p.id} post={p} />)
              ) : (
                <EmptyState compact icon={<MessageSquare size={20} />} title="Henüz not yok" description="İlk cümleyi sen yazabilirsin — spoiler etiketlemeyi unutma." />
              )}
            </div>
          </Section>
        </div>

        {/* sağ: raf kartı */}
        <aside className="order-first space-y-3 lg:order-none lg:sticky lg:top-[76px] lg:self-start">
          <div className="card p-4">
            {entry ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="chip chip-accent">{statusLabel(entry.status, entry.media.type)}</span>
                  <button
                    onClick={() => toggleFavorite(media.id)}
                    aria-label="Favori"
                    style={{ color: entry.favorite ? 'var(--accent)' : 'var(--ink-3)' }}
                  >
                    <Heart size={16} fill={entry.favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="mt-3">
                  <ProgressControl entry={entry} />
                </div>
                <div className="mt-3 border-t border-[var(--line)] pt-3">
                  <p className="eyebrow mb-1">puanın</p>
                  <Stars value={entry.score ?? 0} onChange={(v) => setScore(media.id, v)} />
                </div>
                <button onClick={() => setSheetOpen(true)} className="btn btn-ghost btn-sm mt-3 w-full">
                  Düzenle
                </button>
              </>
            ) : (
              <>
                <p className="text-[12.5px] font-semibold">Rafında yok</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-3)]">
                  Ekleyince ilerlemen buradan takip edilir; seviyen de büyür.
                </p>
                <button onClick={() => setSheetOpen(true)} className="btn btn-primary btn-sm mt-3 w-full">
                  <Plus size={14} /> Rafıma ekle
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      <AddSheet media={media} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
