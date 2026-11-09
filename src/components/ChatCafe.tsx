import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Send, Heart, Radio, Play, Pause, SkipForward, SkipBack, SkipBack as Rewind,
  ShieldCheck, Volume2, VolumeX, Sparkles, LogIn, CornerDownRight
} from 'lucide-react';
import { cn, formatRelativeTime } from '../lib/utils';
import { resolveAvatar } from '../lib/avatar';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useAppStore } from '../context/AppStore';
import { useRadioStore, RADIO_STATIONS } from '../store/useRadioStore';
import { levelProgress } from '../lib/level';
import type { UserProfile } from '../types';

/**
 * KÖŞE — tam ekran fikir/kahve masası ("otaku mahallesi köşe").
 *
 * NEO-BRÜTALİST yaklaşım: siyah zemin, beyaz kalın sınırlar, sert gölgeler.
 * Masalar (sol), katkı akışı (orta) ve RADYO/SEVİYE (sağ) — iki ayrı şey:
 * Salonun konuşma masaları (fikir) burada, sohbet odaları sağ altta mini panelde.
 */
export interface ChatCafeProps {
  onClose: () => void;
  currentUserName: string;
  currentUserAvatar?: string | null;
  myKarma: number;
  levelInfo?: { level: number; title: string };
}

type TableId = 'all' | 'Sohbet' | 'Soru' | 'Öneri' | 'İnceleme';

const TABLES: Array<{ id: TableId; label: Record<string, string>; icon: string; accent: string; desc: Record<string, string> }> = [
  { id: 'all', label: { tr: 'Hepsi', en: 'All', ja: 'すべて', fr: 'Tout' }, icon: '◉', accent: '#f2ead8', desc: { tr: '', en: '', ja: '', fr: '' } },
  { id: 'Sohbet', label: { tr: 'Sohbet', en: 'Chat', ja: 'おしゃべり', fr: 'Bavardage' }, icon: '💬', accent: '#e8c07a', desc: { tr: '', en: '', ja: '', fr: '' } },
  { id: 'Soru', label: { tr: 'Soru', en: 'Question', ja: '質問', fr: 'Question' }, icon: '❓', accent: '#ffd166', desc: { tr: '', en: '', ja: '', fr: '' } },
  { id: 'Öneri', label: { tr: 'Öneri', en: 'Advice', ja: 'おすすめ', fr: 'Conseil' }, icon: '📗', accent: '#7fb069', desc: { tr: '', en: '', ja: '', fr: '' } },
  { id: 'İnceleme', label: { tr: 'İnceleme', en: 'Review', ja: 'レビュー', fr: 'Critique' }, icon: '📖', accent: '#d2a4ff', desc: { tr: '', en: '', ja: '', fr: '' } },
];

const DOT_GRID = 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)';

const BlackPanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div className={cn('bg-black border-4 border-white neo-shadow-white', className)} {...rest}>{children}</div>
);

export const ChatCafe: React.FC<ChatCafeProps> = ({
  onClose,
  currentUserName,
  currentUserAvatar,
  myKarma,
  levelInfo,
}) => {
  const { t, currentLang } = useAppTranslation();
  const { forumPosts, addForumPost, toggleLike, currentUser, userProfile } = useAppStore();
  const { isPlaying, togglePlay, currentStationIndex, volume, isMuted, setVolume, toggleMute, nextStation, prevStation } = useRadioStore();

  const [activeTable, setActiveTable] = useState<TableId>('all');
  const [composerText, setComposerText] = useState('');
  const [composerKind, setComposerKind] = useState<TableId>('Sohbet');
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const clockText = clock.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dayText = clock.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  const lang = (currentLang as 'tr' | 'en' | 'ja' | 'fr' | string) || 'tr';
  const L = (entry: Record<string, string>) => entry[lang] || entry.tr || entry.en || '';

  const isSignedIn = !!currentUser;

  const posts = useMemo(() => {
    const base = [...forumPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (activeTable === 'all') return base;
    return base.filter((p) => (p.category || '').toLowerCase() === activeTable.toLowerCase());
  }, [forumPosts, activeTable]);

  const station = RADIO_STATIONS[currentStationIndex];
  const progressPercent = levelProgress(myKarma).percent;

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = composerText.trim();
    if (!text || !currentUser) return;

    await addForumPost({
      title: composerKind,
      content: text,
      likes: 0,
      replies: 0,
      category: composerKind,
      type: composerKind === 'İnceleme' ? 'review' : composerKind === 'Öneri' ? 'recommendation' : 'discussion',
      likedBy: [],
      comments: [],
    });
    setComposerText('');
  };

  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden text-white flex flex-col select-none"
      style={{ background: '#0b0b0b' }}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{ backgroundImage: DOT_GRID, backgroundSize: '24px 24px' }}
      />

      {/* ─── HEADER BANDI ───────────────────────────── */}
      <header className="relative border-b-4 border-white bg-black flex items-center justify-between gap-4 px-5 md:px-8 pt-3 md:pt-4 pb-3">
        <div className="flex items-center gap-4 min-w-0">
          <a href="#" onClick={(e) => e.preventDefault()} className="font-mono font-black text-3xl md:text-4xl tracking-tighter leading-none select-none">
            A<span className="text-amber-400">N</span>İ<span className="text-rose-600">SYNC</span>
          </a>
          <div className="hidden sm:block h-10 w-px bg-white/20" />
          <div className="hidden sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-400">İÇ MAHALLE</p>
            <h1 className="font-serif font-black text-[40px] md:text-[56px] leading-none tracking-tight">
              KÖŞE<span className="text-amber-400">.</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden md:block">
            <p className="font-serif font-bold text-[22px] leading-none tabular-nums tracking-tighter">{clockText}</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-neutral-500 mt-0.5">{dayText}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 border-4 border-white bg-black hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
            aria-label={t('close')}
            title={t('close')}
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
      </header>

      {/* ─── ANA GRID: MASALAR | AKIŞ | RADYO ───────── */}
      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] xl:grid-cols-[320px_1fr_340px] overflow-hidden">

        {/* ── SOL — MASALAR ─────────────────────── */}
        <aside className="hidden lg:flex flex-col border-r-4 border-white bg-black overflow-y-auto">
          <div className="p-4 md:p-5 border-b-4 border-white/20">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-400">MASALAR</p>
            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-wider mt-1">{t('chat_cafe_subtitle')}</p>
          </div>
          <div className="flex-1 p-3 md:p-4 space-y-2">
            {TABLES.map((table) => {
              const active = table.id === activeTable;
              const count = forumPosts.filter((p) => table.id === 'all' || (p.category || '').toLowerCase() === table.id.toLowerCase()).length;
              return (
                <button
                  key={table.id}
                  onClick={() => setActiveTable(table.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 border-2 transition-all text-left cursor-pointer group',
                    active
                      ? 'bg-amber-400 text-black border-white neo-shadow-white'
                      : 'bg-neutral-950 text-white border-white/20 hover:border-amber-400 hover:bg-neutral-900'
                  )}
                >
                  <span
                    className="w-10 h-10 flex items-center justify-center font-black text-xl shrink-0 border-2"
                    style={{
                      background: active ? '#000' : table.accent + '22',
                      color: active ? '#amber-400' : table.accent,
                      borderColor: active ? '#000' : table.accent + '55',
                    }}
                  >
                    {table.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] font-black uppercase tracking-tight truncate">{L(table.label)}</span>
                    <span className={cn('block font-mono text-[9px] uppercase tracking-wider mt-0.5', active ? 'text-black/70' : 'text-neutral-500')}>
                      {count} gönderi
                    </span>
                  </span>
                  <span className="text-xl">{active ? '◉' : '○'}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── ORTA — COMPOSER + AKIŞ ──────────────── */}
        <main className="min-w-0 flex flex-col overflow-y-auto bg-black">
          {/* Mobile table selector */}
          <div className="lg:hidden sticky top-0 z-10 bg-black border-b-2 border-white/20 p-2 flex gap-1.5 overflow-x-auto">
            {TABLES.map((table) => {
              const active = table.id === activeTable;
              return (
                <button
                  key={table.id}
                  onClick={() => setActiveTable(table.id)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 border-2 border-white font-black uppercase text-[10px] tracking-wider cursor-pointer transition-colors',
                    active ? 'bg-amber-400 text-black' : 'bg-black text-white hover:bg-neutral-800',
                  )}
                >
                  {table.icon} {L(table.label)}
                </button>
              );
            })}
          </div>

          {/* Composer */}
          <div className="p-3 md:p-5">
            <form
              onSubmit={handlePost}
              className="bg-neutral-950 border-4 border-white p-3 md:p-4 flex flex-col gap-2 neo-shadow-white"
            >
              <div className="flex items-center gap-3">
                <img
                  src={resolveAvatar(currentUserAvatar ?? null, isSignedIn ? currentUserName : 'misafir')}
                  alt={currentUserName}
                  className="w-12 h-12 border-2 border-white bg-white shrink-0 object-cover"
                  referrerPolicy="no-referrer"
                />
                <textarea
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder={isSignedIn ? (lang === 'tr' ? 'Kafanda ne var? Bir sahne, bir düşünce, bir öneri...' : 'What\'s on your mind? A scene, a thought, a recommendation...') : (lang === 'tr' ? 'Giriş yaparak masaya otur...' : 'Sign in to take a seat...')}
                  maxLength={280}
                  rows={2}
                  className="flex-1 min-w-0 bg-black border-2 border-white/30 focus:border-amber-400 outline-none text-white font-bold p-3 text-sm resize-none placeholder-neutral-700"
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost(e); }}
                />
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {TABLES.filter((t) => t.id !== 'all').map((table) => {
                    const active = composerKind === table.id;
                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => setComposerKind(table.id)}
                        className={cn(
                          'px-2.5 py-1 border-2 font-black uppercase text-[9px] tracking-wider cursor-pointer transition-colors',
                          active ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20 text-neutral-400 hover:border-white',
                        )}
                        aria-pressed={active}
                      >
                        {table.icon} {L(table.label)}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  disabled={!isSignedIn || !composerText.trim()}
                  className="px-6 py-2 bg-amber-400 hover:bg-white disabled:opacity-40 text-black font-black uppercase text-xs tracking-widest border-4 border-black flex items-center gap-2 neo-shadow transition-colors"
                >
                  {currentUser ? (lang === 'tr' ? 'YAZ →' : 'POST →') : (lang === 'tr' ? 'GİRİŞ' : 'SIGN IN')}
                </button>
              </div>
              {!isSignedIn && (
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  {lang === 'tr' ? 'Masaya oturmak için Google ile giriş yap.' : 'Sign in with Google to take a seat.'}
                </p>
              )}
            </form>
          </div>

          {/* Feed */}
          <div className="px-3 md:px-5 pb-8 flex-1">
            <div className="flex items-center justify-between pb-2 border-b-2 border-white/20">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-400">{t('chat_cafe_feed_label')}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                {posts.length} {lang === 'tr' ? 'gönderi' : lang === 'ja' ? '件' : 'posts'}
              </p>
            </div>
            {posts.length === 0 ? (
              <div className="mt-8 border-2 border-white/20 p-10 text-center">
                <p className="font-serif font-black text-3xl text-white">{lang === 'tr' ? 'İlk cümleyi sen yaz.' : 'Write the first sentence.'}</p>
                <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mt-2">{lang === 'tr' ? 'Kimse yargılamasın — bu masada yargı yok.' : 'No judgment at this table.'}</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {posts.slice(0, 40).map((post) => {
                  const kind = (post.category || 'Sohbet') as TableId;
                  const kindMeta = TABLES.find((tb) => tb.id === (kind as any)) ?? TABLES[1];
                  const avatar = resolveAvatar(post.author?.avatar ?? null, post.author?.name || post.id);
                  const isOwn = currentUser?.uid && post.author?.uid === currentUser.uid;
                  return (
                    <article
                      key={post.id}
                      className="relative bg-black border-2 border-white/20 hover:border-amber-400 transition-colors p-3 md:p-4 flex gap-3 group"
                    >
                      <img src={avatar} alt={post.author?.name} className="w-11 h-11 border-2 border-white/40 bg-white/10 object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span lang="en" className="font-black text-white text-[13px] uppercase tracking-tight">{post.author?.name ?? 'Anonim'}</span>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">{formatRelativeTime(post.createdAt)}</span>
                          <span
                            className="font-mono text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border"
                            style={{ color: kindMeta.accent, borderColor: kindMeta.accent + '88', background: kindMeta.accent + '14' }}
                          >
                            {kindMeta.icon} {L(kindMeta.label)}
                          </span>
                          {isOwn && <span className="font-mono text-[8px] font-black uppercase px-1 py-0.5 border border-rose-600 text-rose-400">SEN</span>}
                        </div>
                        <p lang="en" className="text-[13px] leading-snug text-neutral-100 mt-1 whitespace-pre-wrap break-words">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-neutral-400">
                          <button onClick={() => toggleLike(post.id)} className={cn('flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider hover:text-rose-500 transition-colors', post.isLikedByMe && 'text-rose-500')}>
                            <Heart size={13} strokeWidth={2.5} className={post.isLikedByMe ? 'fill-rose-500' : ''} />
                            {post.likes ?? 0}
                          </button>
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                            <CornerDownRight size={12} strokeWidth={3} /> {post.replies ?? 0}
                          </span>
                          {post.animeRef && (
                            <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-mono uppercase text-amber-400">★ {post.animeRef.title?.slice(0, 30)}</span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* ── SAĞ — RADYO + SEVİYE ─────────────────── */}
        <aside className="hidden xl:flex flex-col border-l-4 border-white bg-neutral-950 overflow-y-auto">
          {/* ANİME RADYOSU */}
          <div className="p-4 md:p-5 border-b-4 border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 border-2 border-amber-400 flex items-center justify-center">
                <Radio size={18} className={cn('text-amber-400', isPlaying && 'animate-pulse')} strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-400">ANİME RADYOSU</p>
                <p className="font-mono text-[8px] uppercase tracking-widest text-neutral-500">CANLI YAYIN</p>
              </div>
              <button onClick={nextStation} className="ml-auto p-1.5 text-white hover:text-amber-400 transition-colors" aria-label="Next station">
                <SkipForward size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="mt-3 border-2 border-white/20 bg-black p-3">
              <div
                className="h-16 flex items-center justify-center gap-1.5 overflow-hidden"
                aria-hidden="true"
              >
                {[0.4, 0.8, 1, 0.7, 0.95, 0.6, 1, 0.75, 0.9, 0.55, 0.8, 0.65, 1, 0.5].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-amber-400 rounded-sm"
                    style={{
                      height: `${Math.round(h * 100)}%`,
                      transition: 'height 180ms ease-in-out',
                      animation: isPlaying ? `eqbar ${0.5 + (i % 5) * 0.13}s ease-in-out ${i * 0.06}s infinite alternate` : 'none',
                      opacity: isPlaying ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 text-center">
                <p lang="en" className="font-black text-white text-sm uppercase leading-tight line-clamp-2">{station.name}</p>
                <span
                  className="inline-block font-mono text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 mt-1.5 border"
                  style={{ backgroundColor: station.color, color: '#000', borderColor: station.color }}
                >
                  {station.badge}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4">
                <button onClick={prevStation} className="p-1.5 text-white hover:text-amber-400" aria-label="Previous station"><SkipBack size={18} strokeWidth={2.5} /></button>
                <button onClick={togglePlay} className="w-12 h-12 border-4 border-amber-400 bg-black flex items-center justify-center hover:bg-amber-400 hover:text-black transition-colors text-amber-400" aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <Pause size={20} strokeWidth={3} fill="currentColor" /> : <Play size={20} strokeWidth={3} fill="currentColor" className="translate-x-[2px]" />}
                </button>
                <button onClick={nextStation} className="p-1.5 text-white hover:text-amber-400" aria-label="Next station"><SkipForward size={18} strokeWidth={2.5} /></button>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <button onClick={toggleMute} className="text-neutral-400 hover:text-white" aria-label="mute">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 appearance-none bg-neutral-800 accent-amber-400"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>

          {/* LV / KALFA */}
          <div className="p-4 md:p-5 border-b-4 border-white/20">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-400">SEVİYEN</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-14 h-14 border-4 border-white bg-amber-400 flex items-center justify-center">
                <span className="font-black text-black text-2xl leading-none">{levelInfo?.level ?? 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-base uppercase leading-none">{levelInfo?.title ?? 'Misafir'}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">{myKarma.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="mt-2.5 h-2 w-full bg-neutral-800 border border-white/30 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500" style={{ width: `${Math.round(progressPercent)}%` }} /></div>
            <p className="font-mono text-[8px] uppercase tracking-widest text-neutral-500 mt-1">KALFA olmak için 500 XP</p>
          </div>

          {/* KURALLAR */}
          <div className="p-4 md:p-5 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-500">KÖŞE KURALLARI</p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-neutral-400 leading-snug">
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">▸</span> Küfre tahammül yok.</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">▸</span> Spoiler olsa bile kaba konuşma.</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">▸</span> Reklam, link, kanal yasak.</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">▸</span> Kalfa (Lv5, 500 XP) ve üzeri masa açar.</li>
            </ul>
          </div>

          {/* Footer mini */}
          <div className="p-4 md:p-5 border-t-4 border-white/20">
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-neutral-600">Made in SHİNJUKU · UTC+3</p>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes eqbar {
          from { transform: scaleY(0.15); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default ChatCafe;
