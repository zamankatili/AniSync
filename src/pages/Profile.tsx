import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { Settings, Play, CheckCircle, Heart, Clock, BarChart3, Navigation as NavigationIcon, ChevronRight, LogOut, PieChart as PieChartIcon, UserPlus, Grid3X3, FileUp, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { AnimeCard } from '../components/AnimeCard';
import { MonthlyActivityChart } from '../components/MonthlyActivityChart';
import { ProfileAnalyticsDashboard } from '../components/ProfileAnalyticsDashboard';
import { EditProfileModal } from '../components/EditProfileModal';
import { ImportExportModal } from '../components/ImportExportModal';
import { TasteProfileSurveyModal } from '../components/TasteProfileSurveyModal';
import { useNavigate, useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { WatchlistItem, UserProfile } from '../types';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { OtakuRankBadges } from '../components/OtakuRankBadges';
import { calculateKarma, getLevelForKarma, BADGES } from '../data/badgeData';
import { useQuizStore } from '../store/useQuizStore';

export const Profile = () => {
  const { t } = useAppTranslation();
  const { watchlist: myWatchlist, userProfile: myProfile, currentUser, logout } = useAppStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const { uid } = useParams();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTasteModalOpen, setIsTasteModalOpen] = useState(false);
  const [targetProfile, setTargetProfile] = useState<Partial<UserProfile> | null>(null);
  const [targetWatchlist, setTargetWatchlist] = useState<WatchlistItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const { arcadeHighScore, dailyStreak } = useQuizStore();
  const [featuredBadgeId, setFeaturedBadgeId] = useState<string>(() => {
    return localStorage.getItem('user_featured_badge') || 'first_step';
  });

  const handleSelectFeaturedBadge = (badgeId: string) => {
    setFeaturedBadgeId(badgeId);
    localStorage.setItem('user_featured_badge', badgeId);
  };

  const isOwnProfile = !uid || (currentUser && uid === currentUser.uid);
  const watchlist = isOwnProfile ? myWatchlist : targetWatchlist;
  const userProfile = isOwnProfile ? myProfile : (targetProfile || myProfile);

  useEffect(() => {
    if (!isOwnProfile && uid) {
      const fetchUserData = async () => {
        setLoadingProfile(true);
        try {
          const docRef = doc(db, 'users', uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTargetProfile(docSnap.data() as UserProfile);
          } else {
             setTargetProfile({ name: 'Gizemli İzleyici', handle: 'unknown', avatarSeed: '123' });
          }

          const wlistRef = collection(db, `users/${uid}/watchlist`);
          const wlistSnap = await getDocs(wlistRef);
          const wlist: WatchlistItem[] = [];
          wlistSnap.forEach(d => wlist.push(d.data() as WatchlistItem));
          setTargetWatchlist(wlist.sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()));
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchUserData();
    }
  }, [uid, isOwnProfile]);


  const completed = watchlist.filter(item => item.status === 'completed');
  const watching = watchlist.filter(item => item.status === 'watching');
  
  const totalEpisodes = completed.reduce((acc, item) => acc + (item.anime.episodes || 0), 0);
  const totalDays = (totalEpisodes * 24) / 60 / 24; // approx 24 mins per ep
  
  const ratedItems = watchlist.filter(item => item.userScore > 0);
  const meanScore = ratedItems.length > 0 
    ? (ratedItems.reduce((acc, item) => acc + item.userScore, 0) / ratedItems.length).toFixed(2)
    : '0.00';

  const userKarma = useMemo(() => {
    return calculateKarma(
      watchlist.length,
      completed.length,
      ratedItems.length,
      totalEpisodes,
      arcadeHighScore > 0 || dailyStreak > 0,
      arcadeHighScore
    );
  }, [watchlist.length, completed.length, ratedItems.length, totalEpisodes, arcadeHighScore, dailyStreak]);

  const levelInfo = useMemo(() => getLevelForKarma(userKarma), [userKarma]);
  const featuredBadge = BADGES.find(b => b.id === featuredBadgeId);

  const stats = [
    { labelKey: 'total_anime', value: watchlist.length, icon: Play, color: 'text-black', bg: 'bg-white' },
    { labelKey: 'completed', value: completed.length, icon: CheckCircle, color: 'text-black', bg: 'bg-white' },
    { labelKey: 'days_watched', value: totalDays.toFixed(1), icon: Clock, color: 'text-black', bg: 'bg-white' },
    { labelKey: 'mean_score', value: meanScore, icon: BarChart3, color: 'text-black', bg: 'bg-white' },
  ];

  // Prepare data for the pie chart
  const typesData = useMemo(() => {
    const counts = watchlist.reduce((acc, item) => {
      const type = item.anime.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => Number(b.value) - Number(a.value));
  }, [watchlist]);

  const COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border-4 border-rose-500 p-3 neo-shadow">
          <p className="text-white font-black uppercase tracking-widest text-sm">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {!currentUser && (
        <div className="bg-rose-500 border-4 border-black p-4 text-white font-black uppercase tracking-widest text-sm md:text-base flex items-center justify-between gap-4 neo-shadow-white">
          <p>{t('profile_offline_warning')}</p>
        </div>
      )}
      {/* Header Profile */}
      <div className="relative border-4 border-black bg-white neo-shadow-white overflow-hidden group">
        <div className="h-40 md:h-56 bg-black w-full border-b-4 border-black" />
        <div className="px-6 pb-8 md:px-10 md:pb-10 relative">
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20 mb-6">
            <div className="w-28 h-28 md:w-36 md:h-36 border-4 border-black overflow-hidden bg-white flex-shrink-0 relative z-10 transition-colors grayscale group-hover:grayscale-0">
              <img src={(isOwnProfile ? currentUser?.photoURL : (targetProfile as any)?.photoURL) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 pb-2 md:pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter">{userProfile.name}</h1>
                  <span className="bg-amber-400 text-black border-2 border-black font-black text-[11px] px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                    <span>{levelInfo.currentLevel.badge}</span>
                    <span>LVL {levelInfo.currentLevel.level} • {levelInfo.currentLevel.title}</span>
                  </span>
                  {featuredBadge && (
                    <span 
                      className="text-white border-2 border-black font-black text-[11px] px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]"
                      style={{ backgroundColor: featuredBadge.color }}
                    >
                      <span>{featuredBadge.icon}</span>
                      <span>{featuredBadge.titleTr}</span>
                    </span>
                  )}
                </div>
                <p className="text-black/70 font-bold mt-2 uppercase tracking-widest text-xs md:text-sm">@{userProfile.handle} {isOwnProfile && currentUser && `• ${currentUser.email}`} • JOINED {userProfile.joinYear || 2026}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {isOwnProfile && (
                  <>
                    <button 
                      onClick={() => navigate('/grid-maker')} 
                      className="flex items-center gap-2 bg-amber-400 hover:bg-white text-black border-2 border-black transition-colors px-4 py-3 text-xs font-black w-fit uppercase tracking-widest neo-shadow"
                    >
                      <Grid3X3 size={16} strokeWidth={2.5} />
                      3x3 Kartı
                    </button>
                    <button 
                      onClick={() => setIsTasteModalOpen(true)} 
                      className="flex items-center gap-2 bg-purple-500 hover:bg-white text-white hover:text-black border-2 border-black transition-colors px-4 py-3 text-xs font-black w-fit uppercase tracking-widest neo-shadow"
                    >
                      <Compass size={16} strokeWidth={2.5} />
                      Zevk Anketi
                    </button>
                    <button 
                      onClick={() => setIsImportModalOpen(true)} 
                      className="flex items-center gap-2 bg-white hover:bg-black text-black hover:text-white border-2 border-black transition-colors px-4 py-3 text-xs font-black w-fit uppercase tracking-widest neo-shadow"
                    >
                      <FileUp size={16} strokeWidth={2.5} />
                      MAL İçe Aktar
                    </button>
                    <button 
                      onClick={() => setIsEditModalOpen(true)} 
                      className="flex items-center gap-2 bg-black hover:bg-white hover:text-black border-2 border-black transition-colors px-5 py-3 text-white text-xs font-black w-fit uppercase tracking-widest neo-shadow"
                    >
                      <Settings size={16} strokeWidth={2.5} />
                      {t('edit_profile')}
                    </button>
                  </>
                )}
                {isOwnProfile && currentUser && (
                  <button 
                    onClick={async () => {
                      await logout();
                      navigate('/');
                      addToast('Çıkış yapıldı', 'info');
                    }} 
                    className="flex items-center gap-2 bg-rose-600 hover:bg-black text-white hover:text-rose-500 transition-colors px-5 py-3 text-xs font-black w-fit border-2 border-black uppercase tracking-widest neo-shadow"
                  >
                    <LogOut size={16} strokeWidth={2.5} />
                    {t('logout')}
                  </button>
                )}
                {!isOwnProfile && (
                  <button 
                    onClick={() => addToast('Takip etme özelliği yakında!', 'info')} 
                    className="flex items-center gap-2 bg-rose-600 hover:bg-black text-white hover:text-rose-500 transition-colors px-6 py-3 text-xs font-black w-fit border-2 border-black uppercase tracking-widest neo-shadow"
                  >
                    <UserPlus size={18} strokeWidth={2.5} />
                    {t('follow')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.labelKey} 
            className="bg-white p-6 border-4 border-black flex items-center gap-4 neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all group/stat cursor-default"
          >
            <div className={cn("w-14 h-14 border-4 border-black bg-black flex items-center justify-center transition-colors grayscale group-hover/stat:grayscale-0", stat.color)}>
              <stat.icon size={28} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-black text-black uppercase tracking-tighter leading-none mb-1">{stat.value}</div>
              <div className="text-xs text-black/60 font-black uppercase tracking-widest">{t(stat.labelKey)}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Visualization Dashboard with Recharts Radar Chart, Hours Spent & Completion Progress Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <ProfileAnalyticsDashboard watchlist={watchlist} isOwnProfile={isOwnProfile} />
      </motion.div>

      {/* Monthly User Activity Tracking Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <MonthlyActivityChart watchlist={watchlist} isOwnProfile={isOwnProfile} />
      </motion.div>

      {/* Community Badges & Karma Level System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <OtakuRankBadges
          watchlist={watchlist}
          isOwnProfile={isOwnProfile}
          featuredBadgeId={featuredBadgeId}
          onSelectFeaturedBadge={handleSelectFeaturedBadge}
        />
      </motion.div>

      {/* Analytics Chart */}
      {typesData.length > 0 && (
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white border-4 border-black p-6 md:p-8 neo-shadow relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
            <PieChartIcon size={240} />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 border-4 border-rose-500 bg-black text-rose-500 flex items-center justify-center">
               <BarChart3 size={20} strokeWidth={3} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-widest">{t('anime_stats_chart')}</h2>
          </div>
          
          <div className="h-64 sm:h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 640 ? 80 : 120}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {typesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontWeight: '900', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Left Col - Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-white/20">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('currently_watching')}</h2>
          </div>
          {watching.length === 0 ? (
            <div className="bg-black border-4 border-white/20 p-10 text-center neo-shadow">
              <p className="text-neutral-500 font-black uppercase tracking-widest">{t('no_watching_anime')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {watching.slice(0, 3).map(item => (
                <AnimeCard key={item.anime.mal_id} anime={item.anime} />
              ))}
            </div>
          )}
        </div>

        {/* Right Col - Favorites (Mock) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-white/20">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
              <Heart size={24} strokeWidth={2.5} className="text-rose-500" /> {t('favorites')}
            </h2>
          </div>
          <div className="bg-black p-6 border-4 border-rose-500 neo-shadow space-y-4">
             {/* Using the 10/10 rated animes or just top from completed list */}
             {ratedItems.length > 0 || completed.length > 0 ? (
               (ratedItems.length > 0 ? ratedItems.sort((a,b) => b.userScore - a.userScore) : completed).slice(0, 4).map((item, i) => (
                 <div 
                   key={item.anime.mal_id} 
                   onClick={() => navigate(`/anime/${item.anime.mal_id}`)}
                   className="flex gap-4 border-b-2 border-white/20 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0 transition-colors cursor-pointer group/fav"
                 >
                   <div className="text-2xl font-black text-white/20 group-hover/fav:text-rose-500 transition-colors w-6 flex justify-start">{i + 1}</div>
                   <img src={getSafeImageUrl(item.anime.images.webp.image_url)} className="w-14 h-20 object-cover border-2 border-white transition-all hover:scale-105" alt={item.anime.title} referrerPolicy="no-referrer" />
                   <div className="flex flex-col justify-center flex-1">
                     <span className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 group-hover/fav:text-rose-500 transition-colors leading-tight mb-1">{item.anime.title_english || item.anime.title}</span>
                     <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{item.anime.year || 'N/A'} • SCORE: {item.userScore > 0 ? item.userScore : '-'}</span>
                   </div>
                   <div className="flex items-center justify-center text-neutral-600 group-hover/fav:text-rose-500 opacity-0 group-hover/fav:opacity-100 transition-all">
                     <ChevronRight size={24} strokeWidth={2.5} />
                   </div>
                 </div>
               ))
             ) : (
                <p className="text-neutral-500 text-sm font-black uppercase tracking-widest text-center py-6">{t('no_favorites_yet')}</p>
             )}
          </div>
        </div>
      </div>
      
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <ImportExportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <TasteProfileSurveyModal isOpen={isTasteModalOpen} onClose={() => setIsTasteModalOpen(false)} />
    </div>
  );
};
