import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, PenLine, Sparkles, Coffee, ChevronRight } from 'lucide-react';
import { useStore, todayKey } from '../store/useStore';
import { useShelfEntries } from '../store/useStore';
import { greeting, todayLabel, timeAgo } from '../lib/format';
import { levelProgress, rankFor, ATMOSPHERES } from '../lib/level';
import { recommendFrom, getSeasonal } from '../lib/api';
import { genreLabel } from '../lib/genres';
import { useAsync } from '../lib/hooks';
import { FALLBACK_SEASON } from '../data/seasonFallback';
import { todayPrompt } from '../data/prompts';
import { Section } from '../components/Section';
import { MediaCard } from '../components/MediaCard';
import { TeaMeter } from '../components/TeaMeter';
import { Avatar } from '../components/Avatar';
import { RailSkeleton } from '../components/PageSkeleton';
import { ProgressControl } from '../components/ProgressControl';
import type { ShelfEntry } from '../lib/types';

const PRESENCE = [
  { name: 'Elif', emoji: '🍵', color: '#e8a04c', doing: 'Frieren · 12. bölüm' },
  { name: 'Mert', emoji: '🎧', color: '#7fb069', doing: 'Made in Abyss OST' },
  { name: 'Deniz', emoji: '📖', color: '#c084fc', doing: 'Chainsaw Man · 2. kısım' },
  { name: 'Ada', emoji: '🎮', color: '#7fb069', doing: 'Elden Ring · Leyndell' },
  { name: 'Kaan', emoji: '🌙', color: '#8b7cf6', doing: 'Solo Leveling novel' },
];

export function Salon() {
  const profile = useStore((s) => s.profile)!;
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const posts = useStore((s) => s.posts);
  const answered = useStore((s) => s.answered);
  const answerPrompt = useStore((s) => s.answerPrompt);
  const entries = useShelfEntries();

  const [answer, setAnswer] = useState('');
  const [justAnswered, setJustAnswered] = useState(false);

  const prompt = todayPrompt();
  const greet = greeting();
  const progress = levelProgress(xp);
  const rank = rankFor(progress.level);
  const nextAtmos = ATMOSPHERES.find((a) => a.unlockLevel > progress.level);
  const active = entries.filter((e) => e.status === 'active').slice(0, 8);
  const alreadyAnswered = Boolean(answered[todayKey()]) || justAnswered;

  const recommendations = useMemo(
    () => recommendFrom([], profile.genres, 10).filter((m) => m.cover),
    [profile.genres],
  );

  const seasonal = useAsync(() => getSeasonal(), [], FALLBACK_SEASON);

  const submitAnswer = () => {
    if (!answer.trim()) return;
    answerPrompt(prompt.question, answer);
    setJustAnswered(true);
    setAnswer('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_318px] lg:gap-8">
      <div className="min-w-0 space-y-7">
        {/* selamlama */}
        <header className="animate-fade-up">
          <p className="eyebrow">{todayLabel()}</p>
          <h1 className="h1 mt-1.5">
            {greet.text},{' '}
            <span className="relative inline-block">
              {profile.name}
              <svg
                className="absolute -bottom-1.5 left-0 w-full"
                height="7"
                viewBox="0 0 100 7"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path d="M1 4.5 C 22 1, 42 6, 62 3 S 88 2.5, 99 4" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-3 text-[13.5px] text-[var(--ink-2)]">{greet.line}</p>
        </header>

        {/* günün sorusu */}
        <div className="note animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--note-ink)', opacity: 0.6 }}>
              bugünün sorusu
            </p>
            <span className="text-[10px] font-bold" style={{ color: 'var(--note-ink)', opacity: 0.5 }}>
              {posts.length} kişi konuşuyor
            </span>
          </div>
          <p className="display mt-1.5 text-[1.45rem] leading-tight" style={{ color: 'var(--note-ink)' }}>
            {prompt.question}
          </p>
          <p className="mt-1 text-[11.5px] italic" style={{ color: 'var(--note-ink)', opacity: 0.65 }}>
            {prompt.hint}
          </p>

          {alreadyAnswered ? (
            <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--note-ink)' }}>
                Bugünlük cevabını bıraktın. Teşekkürler.
              </p>
              <Link to="/kose" className="text-[11px] font-bold underline underline-offset-2" style={{ color: 'var(--note-ink)' }}>
                akışa git
              </Link>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitAnswer();
                }}
                placeholder="Kısa bir cevap yeter..."
                className="input text-[13px]"
                style={{
                  background: 'var(--note-field-bg)',
                  borderColor: 'var(--note-field-border)',
                  color: 'var(--note-ink)',
                }}
              />
              <button
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="btn btn-sm shrink-0"
                style={{
                  background: answer.trim() ? 'var(--note-btn-bg)' : 'transparent',
                  color: answer.trim() ? 'var(--note-btn-ink)' : 'var(--note-ink)',
                  border: '1px solid var(--note-field-border)',
                  opacity: answer.trim() ? 1 : 0.7,
                }}
              >
                <PenLine size={13} /> Bırak
              </button>
            </div>
          )}
        </div>

        {/* devam edenler */}
        <Section
          title="Kaldığın yerden"
          subtitle={
            active.length
              ? 'Bir bölüm daha? Masada yerin var.'
              : entries.length
                ? `Sırada ${entries.length} şey var. Birini açalım mı?`
                : 'Rafın henüz boş — ilk çayı bizden.'
          }
          action={entries.length ? { label: 'Rafım', to: '/raf' } : undefined}
        >
          {active.length ? (
            <div className="rail -mx-1 px-1">
              {active.map((entry) => (
                <ContinueCard key={entry.media.id} entry={entry} />
              ))}
            </div>
          ) : entries.length ? (
            <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
              <span className="text-3xl">📚</span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold">Rafında {entries.length} şey seni bekliyor.</p>
                <p className="mt-0.5 text-[11.5px] text-[var(--ink-3)]">
                  Birini “devam ediyor” yap, buradan tek dokunuşla ilerleyelim.
                </p>
              </div>
              <Link to="/raf" className="btn btn-primary btn-sm">
                Rafıma git <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
              <span className="text-3xl">🫖</span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold">Rafına bir şey bırak, buradan devam edelim.</p>
                <p className="mt-0.5 text-[11.5px] text-[var(--ink-3)]">
                  Anime, manga, novel ya da oyun — hepsi aynı rafta duruyor.
                </p>
              </div>
              <Link to="/kesfet" className="btn btn-primary btn-sm">
                Keşfet <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </Section>

        {/* öneriler */}
        <Section
          title="Rafına uygun"
          subtitle={`${profile.genres.slice(0, 3).map(genreLabel).join(' · ')} — seçtiklerinden yola çıktık.`}
          action={{ label: 'Tümü', to: '/kesfet' }}
        >
          <div className="rail -mx-1 px-1">
            {recommendations.map((m) => (
              <div key={m.id} className="w-[124px] md:w-[148px]">
                <MediaCard media={m} />
              </div>
            ))}
          </div>
        </Section>

        {/* bu sezon */}
        <Section title="Bu sezon" subtitle="Yayında olanlar, takvime eklenesi." action={{ label: 'Keşfet', to: '/kesfet' }}>
          {seasonal.loading && seasonal.data.length === 0 ? (
            <RailSkeleton />
          ) : (
            <div className="rail -mx-1 px-1">
              {seasonal.data.slice(0, 10).map((m) => (
                <div key={m.id} className="w-[124px] md:w-[148px]">
                  <MediaCard media={m} />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* köşeden */}
        <Section title="Köşeden" subtitle="Masada konuşulanlar" action={{ label: 'Köşe', to: '/kose' }}>
          <div className="space-y-3">
            {posts.slice(0, 2).map((p) => (
              <Link key={p.id} to="/kose" className="card lift flex items-start gap-3 p-3.5">
                <Avatar emoji={p.author.emoji} color={p.author.color} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-bold">
                    {p.author.name}
                    <span className="ml-2 font-medium text-[var(--ink-3)]">{timeAgo(p.createdAt)}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-[var(--ink-2)]">{p.text}</p>
                </div>
                <ChevronRight size={15} className="mt-1 shrink-0 text-[var(--ink-3)]" />
              </Link>
            ))}
          </div>
        </Section>
      </div>

      {/* yan sütun */}
      <aside className="space-y-4 lg:sticky lg:top-[76px] lg:self-start">
        <div className="card overflow-hidden p-4">
          <div className="flex items-center gap-3">
            <TeaMeter percent={progress.percent} size={58} />
            <div className="min-w-0">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--ink-3)]">seviye {progress.level}</p>
              <p className="display text-[1.35rem] leading-tight">{rank.name}</p>
              <p className="text-[11px] text-[var(--ink-3)]">{xp} XP</p>
            </div>
          </div>
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-[var(--ink-2)]">{rank.line}</p>
          <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="mt-1.5 text-[10.5px] text-[var(--ink-3)]">
            sıradaki seviyeye {progress.remaining} XP
            {nextAtmos ? ` · ${nextAtmos.name} ${nextAtmos.unlockLevel}. seviyede` : ''}
          </p>
          <Link to="/atmosfer" className="btn btn-soft btn-sm mt-3 w-full">
            <Sparkles size={13} /> Atmosferleri gör
          </Link>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <p className="eyebrow">mekânda şu an</p>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent)]">
              <span className="dot dot-live" /> canlı
            </span>
          </div>
          <div className="mt-3 flex -space-x-2">
            {PRESENCE.map((p) => (
              <Avatar key={p.name} emoji={p.emoji} color={p.color} size={28} />
            ))}
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[9px] font-bold text-[var(--ink-3)]">
              +9
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {PRESENCE.slice(0, 3).map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-[13px]">{p.emoji}</span>
                <p className="min-w-0 flex-1 truncate text-[11px] text-[var(--ink-2)]">
                  <span className="font-bold text-[var(--ink)]">{p.name}</span> {p.doing}
                </p>
              </div>
            ))}
          </div>
          <Link to="/kose" className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-bold text-[var(--accent)]">
            masaya otur <ChevronRight size={12} />
          </Link>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-[var(--accent)]" />
            <p className="text-[12px] font-bold">{streak} gündür buradasın</p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-3)]">
            Her gün uğramak 10 XP. Müdavimlik böyle başlıyor.
          </p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: i < Math.min(7, streak) ? 'var(--accent)' : 'var(--surface-3)' }}
              />
            ))}
          </div>
        </div>

        <div className="card-inset flex items-start gap-2.5 p-3.5">
          <Coffee size={15} className="mt-0.5 shrink-0 text-[var(--ink-3)]" />
          <p className="text-[10.5px] leading-relaxed text-[var(--ink-3)]">
            Topluluk akışı şimdilik örnek içerikle başlıyor. Yazdıkların ve rafın cihazında saklanıyor.
          </p>
        </div>
      </aside>
    </div>
  );
}

function ContinueCard({ entry }: { entry: ShelfEntry }) {
  return (
    <div className="card w-[268px] shrink-0 p-2.5">
      <div className="flex gap-2.5">
        <Link to={`/m/${entry.media.type}/${encodeURIComponent(entry.media.id.split(':').slice(1).join(':'))}`} className="shrink-0">
          <div className="h-[80px] w-[56px] overflow-hidden rounded-[var(--radius-xs)] bg-[var(--surface-3)]">
            {entry.media.cover && (
              <img src={entry.media.cover} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/m/${entry.media.type}/${encodeURIComponent(entry.media.id.split(':').slice(1).join(':'))}`}>
            <p className="line-clamp-2 text-[11.5px] font-semibold leading-snug">{entry.media.title}</p>
          </Link>
          <p className="mt-0.5 line-clamp-1 text-[9.5px] text-[var(--ink-3)]">{entry.media.meta}</p>
          <div className="mt-1.5">
            <ProgressControl entry={entry} showComplete={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
