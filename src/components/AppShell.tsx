import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookMarked, Compass, Flame, House, Lamp, MessagesSquare, Search, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { atmosById, levelProgress, rankFor } from '../lib/level';
import { TeaMeter } from './TeaMeter';
import { Avatar } from './Avatar';
import { Toasts } from './Toasts';
import { LevelUpModal } from './LevelUpModal';
import { Onboarding } from '../pages/Onboarding';
import { ErrorBoundary } from './ErrorBoundary';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useThemeStore } from '../store/useThemeStore';

const NAV = [
  { to: '/', label: 'Salon', icon: House },
  { to: '/kesfet', label: 'Keşfet', icon: Compass },
  { to: '/raf', label: 'Rafım', icon: BookMarked },
  { to: '/kose', label: 'Köşe', icon: MessagesSquare },
];

export function AppShell() {
  const hydrated = useStore((s) => s.hydrated);
  const onboarded = useStore((s) => s.onboarded);
  const profile = useStore((s) => s.profile);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const touchVisit = useStore((s) => s.touchVisit);
  const location = useLocation();
  const navigate = useNavigate();
  const preview = useStore((s) => s.preview);
  const clearPreview = useStore((s) => s.clearPreview);
  const checkAutoTheme = useThemeStore((s) => s.checkAutoTheme);

  useEffect(() => {
    checkAutoTheme();
    const timer = setInterval(checkAutoTheme, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [checkAutoTheme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/kesfet?focus=1');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => {
    touchVisit();
  }, [touchVisit, onboarded]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/icon.svg" alt="" className="h-12 w-12 animate-pulse rounded-2xl" />
          <p className="eyebrow">mekân hazırlanıyor</p>
        </div>
      </div>
    );
  }

  if (!onboarded || !profile) {
    return <Onboarding />;
  }

  const progress = levelProgress(xp);
  const rank = rankFor(progress.level);

  const openSearch = () => navigate('/kesfet?focus=1');

  return (
    <div className="min-h-dvh">
      <div className="app-bg" aria-hidden />

      {/* Masaüstü kenar çubuğu */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[var(--line)] px-4 py-5 md:flex glass">
        <Link to="/" className="mb-7 flex items-center gap-2.5 px-1">
          <img src="/icon.svg" alt="" className="h-9 w-9 rounded-[10px]" />
          <span>
            <span className="display block text-[1.18rem] leading-none">AniSync</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ink-3)]">
              otaku mahallesi
            </span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className="nav-item" data-active={location.pathname === item.to}>
              <item.icon size={18} strokeWidth={1.9} />
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/atmosfer" className="nav-item" data-active={location.pathname === '/atmosfer'}>
            <Lamp size={18} strokeWidth={1.9} />
            Atmosferler
          </NavLink>
        </nav>

        <div className="mt-auto space-y-2">
          <Link to="/ben" className="block">
            <div className="card-inset p-3 transition-colors hover:border-[var(--line-strong)]">
              <div className="flex items-center gap-3">
                <TeaMeter percent={progress.percent} size={38} />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">seviye {progress.level}</p>
                  <p className="truncate text-[12.5px] font-bold">{rank.name}</p>
                  <p className="text-[10px] text-[var(--ink-3)]">
                    sıradaki {progress.level + 1} · {progress.remaining} XP
                  </p>
                </div>
              </div>
              <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-[var(--surface-3)]">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 px-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ink-3)]">
              <Flame size={13} className="text-[var(--accent)]" /> {streak} gün
            </span>
            <span className="text-[var(--ink-3)]">·</span>
            <span className="text-[11px] font-semibold text-[var(--ink-3)]">çay sıcak</span>
          </div>
        </div>
      </aside>

      {/* Ana içerik */}
      <div className="md:pl-[248px]">
        {/* Mobil başlık */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-2.5 glass md:hidden safe-top">
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="" className="h-8 w-8 rounded-[9px]" />
            <span className="display text-[1.05rem] leading-none">AniSync</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/atmosfer"
              className="mr-1 flex items-center gap-1 rounded-full border border-[var(--line)] py-0.5 pl-1 pr-2"
              aria-label={`Seviye ${progress.level}`}
            >
              <TeaMeter percent={progress.percent} size={22} showSteam={false} />
              <span className="text-[10px] font-bold text-[var(--ink-2)]">{progress.level}</span>
            </Link>
            {streak > 0 && (
              <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-bold text-[var(--accent)]">
                <Flame size={11} /> {streak}
              </span>
            )}
            <ThemeSwitcher compact />
            <button onClick={openSearch} className="btn btn-ghost btn-icon h-9 w-9" aria-label="Ara">
              <Search size={17} />
            </button>
            <Link to="/ben" aria-label="Profil">
              <Avatar emoji={profile.emoji} color={profile.color} size={32} />
            </Link>
          </div>
        </header>

        {/* Masaüstü üst çubuk */}
        <header className="sticky top-0 z-30 hidden items-center gap-4 border-b border-[var(--line)] px-8 py-3 glass md:flex">
          <button
            onClick={openSearch}
            className="flex w-full max-w-md items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2 text-left text-[12px] text-[var(--ink-3)] transition-colors hover:border-[var(--line-strong)]"
          >
            <Search size={15} />
            <span className="flex-1">Anime, manga, novel, oyun ara…</span>
            <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[9px] font-bold">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcher />
            <Link to="/atmosfer" className="btn btn-ghost btn-sm">
              <Lamp size={14} /> Atmosfer
            </Link>
            <Link to="/ben" className="flex items-center gap-2 rounded-full border border-[var(--line)] py-1 pl-1 pr-3 transition-colors hover:border-[var(--line-strong)]">
              <Avatar emoji={profile.emoji} color={profile.color} size={26} />
              <span className="text-[11.5px] font-bold">{profile.name}</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-7">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobil alt menü */}
      <nav className="tabbar fixed inset-x-0 bottom-0 z-40 md:hidden safe-bottom">
        <div className="flex items-stretch px-2">
          {[...NAV, { to: '/ben', label: 'Ben', icon: User }].map((item) => {
            const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className="tab" data-active={active}>
                <item.icon size={20} strokeWidth={active ? 2.4 : 1.9} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <Toasts />
      <LevelUpModal />

      {preview && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[70px] z-[70] flex justify-center px-4 md:bottom-5">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2 shadow-[var(--shadow-lift)]">
            <span className="text-[11px] font-semibold">
              Önizleme: <span className="text-[var(--accent)]">{atmosById(preview).name}</span>
            </span>
            <button onClick={clearPreview} className="text-[10.5px] font-bold text-[var(--ink-3)] hover:text-[var(--ink)]">
              Bitir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
