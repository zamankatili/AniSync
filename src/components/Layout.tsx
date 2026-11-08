import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, List, User, Search, Bell, Loader2, LogIn, Compass, LayoutList, Calendar, Grid3X3, Music2, Tv2, Flame, Sparkles, MoreHorizontal, X as CloseIcon, Gamepad2, Dices, ChevronRight } from 'lucide-react';
import { cn, getSafeImageUrl, handleImageError } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from './Toast';
import { useAnimeData } from '../hooks/useAnimeData';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { AuthModal } from './AuthModal';
import { AiringScheduleModal } from './AiringScheduleModal';
import { AnimeRadioPlayer } from './AnimeRadioPlayer';
import { ThemeSwitcher } from './ThemeSwitcher';
import { GlobalChat } from './GlobalChat';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useReminderStore } from '../store/useReminderStore';
import { useThemeStore, THEME_CONFIGS } from '../store/useThemeStore';

import { GlobalSearchModal } from './GlobalSearchModal';
import { ErrorConsoleModal } from './ErrorConsoleModal';
import { AnimeErrorBoundary } from './AnimeErrorBoundary';

// Sol kenarlık menüsü — gruplu ve ölçeklenebilir yapı.
// Her grup bir bölüm başlığı (i18n) ve maddelerden oluşur; sıra mobil alt menüyle tutarlıdır.
const NAV_GROUPS: { sectionKey: string; items: { path: string; labelKey: string; icon: any }[] }[] = [
  {
    sectionKey: 'nav_section_browse',
    items: [
      { path: '/', labelKey: 'home', icon: Home },
      { path: '/calendar', labelKey: 'calendar', icon: Calendar },
      { path: '/list', labelKey: 'my_list', icon: List },
      { path: '/lists', labelKey: 'top_lists', icon: LayoutList },
    ],
  },
  {
    sectionKey: 'nav_section_social',
    items: [
      { path: '/watch-party', labelKey: 'watch_party', icon: Tv2 },
      { path: '/music-quiz', labelKey: 'music_quiz', icon: Music2 },
      { path: '/arcade', labelKey: 'arcade', icon: Gamepad2 },
      { path: '/dle', labelKey: 'dle', icon: Sparkles },
      { path: '/challenge', labelKey: 'weekly_challenge', icon: Flame },
    ],
  },
  {
    sectionKey: 'nav_section_explore',
    items: [
      { path: '/discover', labelKey: 'discover', icon: Compass },
      { path: '/grid-maker', labelKey: 'grid_maker', icon: Grid3X3 },
      { path: '/anime-life-sim', labelKey: 'anime_life_sim', icon: Dices },
    ],
  },
  {
    sectionKey: 'nav_section_account',
    items: [
      { path: '/profile', labelKey: 'profile', icon: User },
    ],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

// Mobil alt menüde en fazla 5 birincil sekme gösterilir (taşmayı önler).
const PRIMARY_NAV_PATHS = ['/', '/discover', '/list', '/calendar', '/profile'];
const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((item) => PRIMARY_NAV_PATHS.includes(item.path));
const MORE_GROUPS = NAV_GROUPS
  .map((group) => ({ ...group, items: group.items.filter((item) => !PRIMARY_NAV_PATHS.includes(item.path)) }))
  .filter((group) => group.items.length > 0);

const LANGUAGES = [
  { code: 'tr', short: 'TR', label: 'Türkçe' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'ja', short: 'JA', label: '日本語' },
  { code: 'fr', short: 'FR', label: 'Français' },
];

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useAppTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isMoreNavOpen, setIsMoreNavOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const { searchAnime, data: searchResults, loading: searchLoading } = useAnimeData();
  const { watchlist, addToWatchlist, userProfile, currentUser, authLoading } = useAppStore();
  const { addToast } = useToastStore();
  const {
    reminders,
    openScheduleModal,
    isScheduleModalOpen,
    closeScheduleModal,
    modalInitialTab,
    initReminders,
    playChimeSound,
    getTimeUntilAiring
  } = useReminderStore();
  const { checkAutoTheme, currentTheme } = useThemeStore();
  const activeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.noon;
  const searchRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    initReminders();
    checkAutoTheme();
    const themeTimer = setInterval(checkAutoTheme, 60000 * 5);
    return () => clearInterval(themeTimer);
  }, [initReminders, checkAutoTheme]);

  // Periodic reminder alert checker (every 60 seconds)
  useEffect(() => {
    const notifiedMap = new Set<string>();

    const checkReminders = () => {
      reminders.forEach((rem) => {
        const timeInfo = getTimeUntilAiring(rem.day, rem.timeTR);
        if (timeInfo.isToday && timeInfo.days === 0 && timeInfo.hours === 0 && timeInfo.minutes <= (rem.notifyBeforeMinutes || 15)) {
          const key = `${rem.mal_id}_${new Date().toDateString()}`;
          if (!notifiedMap.has(key)) {
            notifiedMap.add(key);
            if (rem.soundEnabled) playChimeSound();
            addToast(`⏰ "${rem.title_english || rem.title}" yeni bölümü birazdan yayında! (${rem.timeTR} TR)`, 'info');
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && rem.browserNotify) {
              new Notification(`📺 ${rem.title_english || rem.title} Yayınlanıyor!`, {
                body: rem.currentEpisode
                  ? `Bölüm ${rem.currentEpisode} saat ${rem.timeTR}'de yayında.`
                  : `Saat ${rem.timeTR}'de yayında.`,
                icon: rem.image,
              });
            }
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders, getTimeUntilAiring, playChimeSound, addToast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sayfa değişince mobil "daha fazla" ve dil menülerini kapat
  useEffect(() => {
    setIsMoreNavOpen(false);
    setIsLangMenuOpen(false);
  }, [location.pathname]);

  // Mobil "daha fazla" menüsü açıkken body scroll'unu kilitle
  useEffect(() => {
    if (!isMoreNavOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMoreNavOpen]);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangMenuOpen(false);
  };

  const currentLang = (i18n.language || 'tr').split('-')[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        searchAnime(searchQuery);
        setIsSearchOpen(true);
      } else {
        setIsSearchOpen(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchAnime]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults && searchResults.length > 0) {
        setIsSearchOpen(false);
        const topResult = searchResults[0];
        setSearchQuery('');
        navigate(`/anime/${topResult.mal_id}`);
      } else if (searchQuery.trim().length > 0) {
        searchAnime(searchQuery);
        setIsSearchOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="flex h-dvh bg-transparent text-neutral-100 font-sans overflow-hidden selection:bg-rose-500 selection:text-white relative">
      {/* Dynamic Atmospheric Ambient Glow Layer */}
      <div 
        className="pointer-events-none fixed inset-0 -z-10 transition-all duration-700 opacity-70"
        style={{
          background: `radial-gradient(ellipse at 50% -5%, ${activeConfig.glowColor} 0%, transparent 60%)`
        }}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 xl:w-72 border-r-2 border-white/20 bg-black/85 backdrop-blur-md p-5 safe-area-top overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
        <div className="flex items-center gap-3 mb-6 px-1">
          <div
            className="w-10 h-10 border-2 border-white flex items-center justify-center text-white font-black text-xl neo-shadow-white transition-colors duration-500 shrink-0"
            style={{ backgroundColor: activeConfig.accentColor }}
          >
            A
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-white leading-none">AniSync</h1>
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block truncate">
              {activeConfig.nameTR.split(' ')[0]}
            </span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col">
          {NAV_GROUPS.map((group) => (
            <div key={group.sectionKey} className="mb-2 last:mb-0">
              <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                <span
                  className="w-1.5 h-1.5 shrink-0"
                  style={{ backgroundColor: activeConfig.accentColor }}
                  aria-hidden="true"
                />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  {t(group.sectionKey)}
                </h2>
                <div className="flex-1 h-px bg-white/10" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => isActive ? {
                      backgroundColor: activeConfig.accentColor,
                      borderColor: activeConfig.accentColor,
                      boxShadow: `4px 4px 0px 0px ${activeConfig.secondaryColor}`
                    } : undefined}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2.5 border-2 transition-all font-bold uppercase tracking-wide text-[13px] whitespace-nowrap min-h-[44px]",
                      isActive
                        ? "text-white"
                        : "border-transparent text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <item.icon size={19} strokeWidth={2.25} className="shrink-0" />
                    <span className="truncate">{t(item.labelKey)}</span>
                    {item.path === '/anime-life-sim' && (
                      <span className="ml-auto text-[8px] font-black uppercase px-1.5 py-0.5 bg-rose-600 text-white border border-white shrink-0">
                        {t('new_badge')}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar alt bilgisi — tema + telif */}
        <div className="mt-4 pt-4 border-t-2 border-white/10 px-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">
              AniSync LOGOS
            </span>
            <a
              href="https://anisync-tau.vercel.app/"
              className="text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-white transition-colors flex items-center gap-1"
              target="_blank"
              rel="noreferrer"
            >
              {t('about')} <ChevronRight size={10} strokeWidth={3} />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-full relative overflow-y-auto overflow-x-hidden safe-area-top">
        {/* Dynamic Atmospheric Top Ambiance Bar */}
        <div 
          className="h-1.5 w-full shrink-0 transition-all duration-700 z-50 sticky top-0"
          style={{
            background: `linear-gradient(90deg, ${activeConfig.accentColor}, ${activeConfig.secondaryColor}, ${activeConfig.accentColor})`
          }}
        />

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b-2 border-white/20 bg-black/90 backdrop-blur-md sticky top-1.5 z-50">
           {isSearchOpen && window.innerWidth < 768 ? (
             <div className="flex-1 flex gap-2 items-center relative" ref={searchRef}>
               <input 
                 type="text" 
                 placeholder={t('search_placeholder')} 
                 autoFocus
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={handleSearchKeyDown}
                 className="flex-1 bg-black border-2 border-white/30 py-2 px-3 text-sm focus:outline-none focus:border-rose-500 font-bold uppercase tracking-wider text-white placeholder-neutral-600 transition-all neo-shadow"
               />
               <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-2 text-white border-2 border-white/20 hover:bg-rose-600 font-black neo-shadow-white">
                 X
               </button>
               
               {/* Mobile Search Results */}
               <AnimatePresence>
                 {searchQuery.length > 2 && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute top-full left-0 right-0 max-w-full mt-2 bg-black border-2 border-white neo-shadow-white max-h-80 overflow-y-auto"
                   >
                     {searchLoading ? (
                        <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div>
                     ) : searchResults && searchResults.length > 0 ? (
                       <div className="p-2">
                         {searchResults.slice(0, 5).map(anime => (
                           <div 
                             key={anime.mal_id} 
                             onClick={() => {
                                 setIsSearchOpen(false);
                                 setSearchQuery('');
                                 navigate(`/anime/${anime.mal_id}`);
                             }}
                             className="flex gap-2 p-2 hover:bg-white/10 border-b border-white/10 last:border-0 transition-colors cursor-pointer group"
                           >
                             <img 
                               src={getSafeImageUrl(anime.images.webp.image_url)} 
                               alt={anime.title} 
                               className="w-10 h-14 object-cover border border-white/20" 
                               referrerPolicy="no-referrer" 
                               onError={handleImageError}
                             />
                             <div className="flex-1 flex flex-col justify-center">
                               <h4 className="text-xs font-black uppercase text-white line-clamp-1">{anime.title_english || anime.title}</h4>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="p-4 text-center text-neutral-500 text-xs font-bold uppercase tracking-wider">
                         {t('no_results')}
                       </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           ) : (
             <>
               <div className="flex items-center gap-2">
                 <div 
                   className="w-8 h-8 border-2 border-white flex items-center justify-center text-white font-black uppercase transition-colors duration-500"
                   style={{ backgroundColor: activeConfig.accentColor }}
                 >
                   A
                 </div>
                 <h1 className="font-black text-white uppercase tracking-tighter text-xl">AniSync</h1>
               </div>

               <div className="flex items-center gap-2">
                 {/* Atmosphere Theme Switcher */}
                 <ThemeSwitcher />

                 {/* Language Picker */}
                 <div className="relative">
                   <button
                     type="button"
                     aria-haspopup="menu"
                     aria-expanded={isLangMenuOpen}
                     aria-label={t('language')}
                     onClick={() => setIsLangMenuOpen((v) => !v)}
                     className="touch-target px-2 text-white border-2 border-transparent hover:border-white/20 uppercase font-black text-xs"
                   >
                     {currentLang.toUpperCase()}
                   </button>
                   {isLangMenuOpen && (
                     <>
                       <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)} />
                       <div role="menu" className="absolute top-full right-0 mt-2 w-36 bg-black border-2 border-white neo-shadow-white flex flex-col z-50">
                         {LANGUAGES.map((lang) => (
                           <button
                             key={lang.code}
                             role="menuitem"
                             onClick={() => changeLanguage(lang.code)}
                             className={cn(
                               'px-3 py-2.5 text-left font-black uppercase text-xs min-h-[44px] hover:bg-white hover:text-black transition-colors',
                               currentLang === lang.code ? 'bg-white text-black' : 'text-white'
                             )}
                           >
                             <span className="inline-block w-7">{lang.short}</span>
                             <span className="normal-case font-bold">{lang.label}</span>
                           </button>
                         ))}
                       </div>
                     </>
                   )}
                 </div>

                 {/* Global Search Button */}
                 <button onClick={() => setIsGlobalSearchOpen(true)} className="p-2 text-white border-2 border-transparent hover:border-white/20">
                   <Search size={20} strokeWidth={2.5} />
                 </button>

                 {/* Airing Schedule & Reminders Bell */}
                 <button 
                   onClick={() => openScheduleModal('reminders')} 
                   className="p-2 text-white border-2 border-transparent hover:border-white/20 relative cursor-pointer"
                   title="Hatırlatıcılar ve Yayın Akışı"
                 >
                   <Bell size={20} strokeWidth={2.5} />
                   {reminders.length > 0 && (
                     <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-black animate-pulse" />
                   )}
                 </button>

                 {!authLoading && !currentUser && (
                   <button 
                     onClick={() => setIsAuthModalOpen(true)}
                     className="p-1 px-3 bg-white text-black border-2 border-white font-black uppercase tracking-wide text-xs neo-shadow-white"
                   >
                     {t('login')}
                   </button>
                 )}
                 {!authLoading && currentUser && (
                   <div 
                     onClick={() => navigate('/profile')}
                     className="w-9 h-9 border-2 border-white p-[2px] cursor-pointer bg-white"
                   >
                     <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
                       <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`} alt="Profile" className="w-full h-full grayscale hover:grayscale-0 transition-all" />
                     </div>
                   </div>
                 )}
               </div>
             </>
           )}
        </header>

        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between p-6 sticky top-1.5 z-50 bg-black/90 backdrop-blur-md border-b-2 border-white/10">
           <div 
             onClick={() => setIsGlobalSearchOpen(true)}
             className="relative w-96 flex-1 max-w-xl cursor-pointer group"
           >
             <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-hover:text-rose-500 transition-colors" />
             <div 
               className="w-full bg-black border-2 border-white/30 group-hover:border-white py-3 pl-12 pr-20 text-sm font-bold uppercase tracking-wider text-neutral-400 group-hover:text-white transition-all flex items-center justify-between neo-shadow"
             >
               <span>{t('search_placeholder')}</span>
               <span className="text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 font-black uppercase tracking-widest">
                 Ctrl + K
               </span>
             </div>
           </div>
           
           <div className="flex items-center gap-4 ml-6">
             {/* Atmospheric Theme Switcher */}
             <ThemeSwitcher />

             {/* Language Dropdown */}
             <div className="relative">
               <button
                 type="button"
                 aria-haspopup="menu"
                 aria-expanded={isLangMenuOpen}
                 aria-label={t('language')}
                 onClick={() => setIsLangMenuOpen((v) => !v)}
                 className="flex items-center gap-1 w-12 h-12 justify-center border-2 border-white/20 hover:border-white hover:bg-white hover:text-black text-white transition-all bg-black font-black uppercase text-xs"
               >
                 {currentLang.toUpperCase()}
               </button>
               {isLangMenuOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)} />
                   <div role="menu" className="absolute top-full right-0 mt-2 w-36 bg-black border-2 border-white neo-shadow-white flex flex-col z-50">
                     {LANGUAGES.map((lang) => (
                       <button
                         key={lang.code}
                         role="menuitem"
                         onClick={() => changeLanguage(lang.code)}
                         className={cn(
                           'px-3 py-2.5 text-left font-black uppercase text-xs min-h-[44px] hover:bg-white hover:text-black transition-colors',
                           currentLang === lang.code ? 'bg-white text-black' : 'text-white'
                         )}
                       >
                         <span className="inline-block w-7">{lang.short}</span>
                         <span className="normal-case font-bold">{lang.label}</span>
                       </button>
                     ))}
                   </div>
                 </>
               )}
             </div>

             {/* Airing Schedule & Reminders Bell Button */}
             <button 
               onClick={() => openScheduleModal('reminders')} 
               className="w-12 h-12 flex items-center justify-center border-2 border-white/20 hover:border-amber-400 hover:bg-amber-400 hover:text-black text-white transition-all bg-black relative cursor-pointer"
               title="Yayın Hatırlatıcıları & Takvim"
             >
               <Bell size={20} strokeWidth={2.5} />
               {reminders.length > 0 && (
                 <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-amber-400 text-black font-black text-[10px] border border-black shadow-[2px_2px_0px_0px_#000]">
                   {reminders.length}
                 </span>
               )}
             </button>
             
             {authLoading ? (
               <div className="w-12 h-12 border-2 border-white/20 bg-white/5 animate-pulse"></div>
             ) : currentUser ? (
               <div 
                 onClick={() => navigate('/profile')}
                 className="w-12 h-12 border-2 border-white cursor-pointer bg-white p-[2px]"
               >
                 <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
                   <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`} alt="Profile" className="w-full h-full grayscale hover:grayscale-0 transition-all" />
                 </div>
               </div>
             ) : (
               <button 
                 onClick={() => setIsAuthModalOpen(true)}
                 className="flex items-center gap-2 border-2 border-white bg-white hover:bg-rose-600 hover:border-rose-600 hover:text-white text-black px-6 py-3 font-black uppercase tracking-wider transition-all neo-shadow-white"
               >
                 <LogIn size={18} strokeWidth={2.5} /> {t('login')}
               </button>
             )}
           </div>
        </header>

        <div className="p-4 md:p-6 pb-28 md:pb-6 flex-1">
          <AnimeErrorBoundary>
            <Outlet />
          </AnimeErrorBoundary>
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AiringScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={closeScheduleModal} 
        initialTab={modalInitialTab} 
      />
      <GlobalChat />
      <AnimeRadioPlayer />
      <GlobalSearchModal isOpen={isGlobalSearchOpen} onClose={() => setIsGlobalSearchOpen(false)} />
      <ErrorConsoleModal />

      {/* Mobile Bottom Navigation — en fazla 5 birincil sekme + "Daha fazla" */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-2 border-white/20 safe-area-bottom z-50">
        <div className="flex items-stretch justify-around">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-label={t(item.labelKey)}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-[56px] min-h-[56px] flex-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-x-1 inset-y-1 border-2 -z-10"
                    style={{ backgroundColor: activeConfig.accentColor, borderColor: activeConfig.accentColor }}
                  />
                )}
                <item.icon size={22} strokeWidth={2.5} className={cn('transition-colors', isActive ? 'text-white' : 'text-neutral-500')} />
                <span className={cn('text-[9px] font-black uppercase tracking-wider', isActive ? 'text-white' : 'text-neutral-500')}>
                  {t(item.labelKey)}
                </span>
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setIsMoreNavOpen(true)}
            aria-label={t('more')}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-[56px] min-h-[56px] flex-1 text-neutral-500 hover:text-white transition-colors"
          >
            <MoreHorizontal size={22} strokeWidth={2.5} />
            <span className="text-[9px] font-black uppercase tracking-wider">{t('more')}</span>
          </button>
        </div>
      </nav>

      {/* Mobile "Daha fazla" alt sayfası */}
      <AnimatePresence>
        {isMoreNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreNavOpen(false)}
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label={t('more')}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[61] bg-black border-t-2 border-white/20 safe-area-bottom max-h-[80dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b-2 border-white/10 sticky top-0 bg-black z-10">
                <span className="font-black uppercase tracking-widest text-sm">{t('more')}</span>
                <button
                  type="button"
                  onClick={() => setIsMoreNavOpen(false)}
                  aria-label={t('close')}
                  className="touch-target border-2 border-white/20 hover:bg-white hover:text-black transition-colors"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
              <div className="p-4 pb-6 space-y-4 max-h-[70dvh] overflow-y-auto [scrollbar-width:thin]">
                {MORE_GROUPS.map((group) => (
                  <div key={group.sectionKey}>
                    <div className="flex items-center gap-2 px-1 pb-1.5">
                      <span className="w-1.5 h-1.5 shrink-0" style={{ backgroundColor: activeConfig.accentColor }} aria-hidden="true" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                        {t(group.sectionKey)}
                      </h2>
                      <div className="flex-1 h-px bg-white/10" aria-hidden="true" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMoreNavOpen(false)}
                          className="flex items-center gap-3 border-2 border-white/15 px-3 py-3 min-h-[56px] font-black uppercase text-xs tracking-wide hover:border-white hover:bg-white hover:text-black transition-colors"
                        >
                          <item.icon size={20} strokeWidth={2.5} className="shrink-0" />
                          <span className="leading-tight">{t(item.labelKey)}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
};
