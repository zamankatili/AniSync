import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { useAnimeData } from '../hooks/useAnimeData';
import { 
  MessageSquare, Heart, Share2, MoreHorizontal, UserPlus, Star, 
  Sparkles, Shuffle, Search as SearchIcon, Image as ImageIcon, Flame, Loader2,
  Activity, Music, ChevronRight, Tv2, Newspaper, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { Anime } from '../types';
import { DAILY_PICKS } from '../data/picks';
import { DailyPollModal } from '../components/DailyPollModal';
import { DailyChallengeModal } from '../components/DailyChallengeModal';
import { TasteProfileSurveyModal } from '../components/TasteProfileSurveyModal';
import { FeedPost } from '../components/FeedPost';
import { MemeZone } from '../components/MemeZone';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { QuickContinueWatching } from '../components/QuickContinueWatching';
import { TodayAiringWidget } from '../components/TodayAiringWidget';
import { AnimeNewsFeed } from '../components/AnimeNewsFeed';
import { CommunityPulse } from '../components/CommunityPulse';
import { MultiMediaHub } from '../components/MultiMediaHub';
import { useWeeklyChallengeStore } from '../store/useWeeklyChallengeStore';
import { useAppTranslation } from '../hooks/useAppTranslation';

export const Home = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { forumPosts, friends, addForumPost, userProfile, currentUser, activePoll } = useAppStore();
  const { addToast } = useToastStore();
  const { fetchRandom } = useAnimeData();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'activity' | 'multimedia' | 'memes' | 'news'>('feed');
  const [newPostContent, setNewPostContent] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [suggestedAnime, setSuggestedAnime] = useState<Anime | null>(null);

  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isTasteModalOpen, setIsTasteModalOpen] = useState(false);

  const { getOverallProgress, streakDays, totalChallengeXp } = useWeeklyChallengeStore();
  const challengeProgress = getOverallProgress();

  const postInputRef = React.useRef<HTMLTextAreaElement>(null);

  const [todayPick, setTodayPick] = useState(DAILY_PICKS[0]);

  const currentHour = new Date().getHours();
  const isPollActive = currentHour >= 10 && currentHour < 22;

  useEffect(() => {
    // Determine today's pick based on date to ensure it changes every midnight
    const daysSinceEpoch = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
    const index = daysSinceEpoch % DAILY_PICKS.length;
    setTodayPick(DAILY_PICKS[index]);
  }, []);

  // For the recommendation widget
  const handleRandomize = async () => {
    setIsRolling(true);
    const result = await fetchRandom();
    if (result) {
      setSuggestedAnime(result);
    }
    setIsRolling(false);
  };

  const shareSuggestion = () => {
    if (!suggestedAnime) return;
    addForumPost({
      title: `${suggestedAnime.title_english || suggestedAnime.title} İzlemeye Değer Mi?`,
      content: 'Sistem bana az önce bu animeyi önerdi. Aranızda izleyen var mı? Düşüncelerinizi merak ediyorum!',
      likes: 0,
      replies: 0,
      category: 'Discussion',
      type: 'recommendation',
      animeRef: {
        id: suggestedAnime.mal_id,
        title: suggestedAnime.title_english || suggestedAnime.title,
        image: suggestedAnime.images.webp.image_url,
        score: suggestedAnime.score
      }
    });
    setSuggestedAnime(null);
    addToast(t('suggestion_shared'), 'success');
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    addForumPost({
      title: 'Topluluk Gönderisi',
      content: newPostContent,
      likes: 0,
      replies: 0,
      category: 'Discussion',
      type: 'discussion'
    });
    setNewPostContent('');
    addToast(t('post_shared'), 'success');
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      <Helmet>
        <title>AniSync - Anime Tracking, Discovery & Community Platform</title>
        <meta name="description" content="Track your favorite anime, discover trending series, join watch parties, play anime music quizzes, and connect with anime enthusiasts worldwide on AniSync." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AniSync - Anime Tracking, Discovery & Community Platform" />
        <meta property="og:description" content="Track your favorite anime, discover trending series, join watch parties, play anime music quizzes, and connect with anime enthusiasts worldwide on AniSync." />
        <meta property="og:site_name" content="AniSync" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AniSync - Anime Tracking & Community" />
        <meta name="twitter:description" content="Discover trending series, create custom anime lists, play music quizzes, and track your anime journey with AniSync." />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'AniSync',
            'applicationCategory': 'EntertainmentApplication',
            'operatingSystem': 'All',
            'description': 'Comprehensive anime tracking, discovery, music quiz, watch party, and social community platform.'
          })}
        </script>
      </Helmet>
      
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-pre-wrap">{t('home')}</h1>
          
          <div className="flex bg-black border-4 border-white neo-shadow overflow-hidden">
            <button 
              onClick={() => setActiveTab('feed')}
              className={cn("px-4 py-2 font-black uppercase tracking-widest text-sm transition-colors cursor-pointer", activeTab === 'feed' ? "bg-white text-black" : "text-white hover:bg-neutral-900")}
            >
              SOSYAL AKIŞ
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={cn("px-4 py-2 font-black uppercase tracking-widest text-sm transition-colors border-l-4 border-white flex items-center gap-1.5 cursor-pointer", activeTab === 'activity' ? "bg-amber-400 text-black" : "text-white hover:bg-neutral-900")}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <Activity size={16} strokeWidth={3} className={activeTab === 'activity' ? "text-black" : "text-amber-400"} />
              CANLI AKIŞ
            </button>
            <button 
              onClick={() => setActiveTab('multimedia')}
              className={cn("px-3 py-2 font-black uppercase tracking-widest text-xs sm:text-sm transition-colors border-l-4 border-white flex items-center gap-1 cursor-pointer", activeTab === 'multimedia' ? "bg-rose-600 text-white" : "text-white hover:bg-neutral-900")}
            >
              <BookOpen size={15} strokeWidth={2.5} />
              MANGA & OYUN
            </button>
            <button 
              onClick={() => setActiveTab('memes')}
              className={cn("px-3 py-2 font-black uppercase tracking-widest text-xs sm:text-sm transition-colors border-l-4 border-white cursor-pointer", activeTab === 'memes' ? "bg-cyan-500 text-white" : "text-white hover:bg-neutral-900")}
            >
              MEME ZONE
            </button>
            <button 
              onClick={() => setActiveTab('news')}
              className={cn("px-3 py-2 font-black uppercase tracking-widest text-xs sm:text-sm transition-colors border-l-4 border-white flex items-center gap-1 cursor-pointer", activeTab === 'news' ? "bg-cyan-400 text-black" : "text-white hover:bg-neutral-900")}
            >
              <Newspaper size={15} strokeWidth={2.5} />
              HABERLER
            </button>
          </div>
        </div>

        {activeTab === 'feed' ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Create Post (Twitter/X style) */}
            <div className="bg-black p-4 md:p-6 border-2 border-white/20 neo-shadow-white mb-8">
              <div className="flex gap-4">
                <img src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`} alt="Me" className="w-12 h-12 border-2 border-white bg-white shrink-0 grayscale hover:grayscale-0 transition-all" />
                <form onSubmit={handlePost} className="flex-1">
                  <textarea 
                    ref={postInputRef}
                    placeholder={t('what_are_you_watching')}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white/20 px-0 py-2 text-xl font-bold uppercase tracking-wider text-white placeholder-neutral-700 focus:border-rose-500 min-h-[60px] resize-none outline-none transition-colors"
                  />
                  <div className="flex items-center justify-between pt-4 mt-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => addToast(t('image_feature_soon'), 'info')} type="button" className="text-white hover:text-rose-500 transition-colors">
                        <ImageIcon size={24} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => addToast(t('tag_feature_soon'), 'info')} type="button" className="text-white hover:text-rose-500 transition-colors">
                        <SearchIcon size={24} strokeWidth={2.5} />
                      </button>
                    </div>
                    <button 
                      type="submit"
                      disabled={!newPostContent.trim()}
                      className="bg-white text-black border-2 border-white font-black px-8 py-3 uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 neo-shadow-white"
                    >
                      {t('share')}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Continue Watching Bar with +1 Episode Tracker */}
            <QuickContinueWatching />

            {/* Community Pulse Social Stream (Watch status, reviews, collection updates) */}
            <CommunityPulse />

            {/* Compact Recent Activity Feed showing community list additions */}
            <RecentActivityFeed compact={true} onViewAll={() => setActiveTab('activity')} />

            {/* System Post: Daily Picks inserted into feed */}
            <div className="bg-rose-600 p-5 md:p-6 border-2 border-white neo-shadow-white mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                <Sparkles size={120} strokeWidth={1} />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Sparkles size={20} className="text-white" strokeWidth={2.5} />
                <span className="font-black tracking-widest text-white uppercase">{t('daily_pick')}</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight relative z-10">{todayPick.anime.title_english || todayPick.anime.title}</h3>
              <p className="text-rose-100 font-bold mb-5 relative z-10 max-w-[90%]">{todayPick.desc}: {todayPick.anime.synopsis}</p>
              <div className="bg-black p-4 flex gap-4 border-2 border-white relative z-10 group">
                 <img src={getSafeImageUrl(todayPick.anime.images.webp.image_url)} alt={todayPick.anime.title} className="w-20 h-28 object-cover border-2 border-white transition-all" referrerPolicy="no-referrer" />
                 <div className="flex flex-col justify-center">
                    <div className="font-black text-white mb-1 tracking-wider uppercase">{todayPick.anime.title}</div>
                    <div className="text-sm text-neutral-400 font-bold uppercase">{todayPick.anime.genres?.map(g => g.name).join(', ')} • {todayPick.anime.episodes} {t('episodes')}</div>
                    <div className="text-sm text-rose-500 flex items-center gap-1 font-black mt-2"><Star size={16} strokeWidth={2.5} fill="currentColor" /> {todayPick.anime.score}</div>
                 </div>
              </div>
              <div className="flex gap-4 mt-6 relative z-10">
                <button 
                  onClick={() => {
                    if (postInputRef.current) {
                      postInputRef.current.focus();
                      setNewPostContent(`${todayPick.anime.title} hakkında: `);
                    }
                  }} 
                  className="flex items-center bg-white text-black px-4 py-2 gap-2 border-2 border-white font-black hover:bg-black hover:text-white transition-all uppercase tracking-wider"
                >
                  <MessageSquare size={18} strokeWidth={2.5} /> {t('join_discussion')}
                </button>
              </div>
            </div>

            <div className="space-y-6 pb-20">
              {forumPosts.length > 0 ? (
                forumPosts.map((post, i) => (
                  <FeedPost key={post.id} post={post} index={i} />
                ))
              ) : (
                <div className="bg-black p-10 border-2 border-white/20 text-center neo-shadow">
                  <MessageSquare size={64} strokeWidth={1} className="mx-auto text-white/20 mb-6" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-2">{t('no_post_yet')}</h3>
                  <p className="text-neutral-500 font-bold uppercase tracking-wider">{t('be_first_post')}</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'activity' ? (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="pb-20"
          >
            <RecentActivityFeed />
          </motion.div>
        ) : activeTab === 'multimedia' ? (
          <motion.div
            key="multimedia"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="pb-20"
          >
            <MultiMediaHub />
          </motion.div>
        ) : activeTab === 'news' ? (
          <motion.div
            key="news"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-20"
          >
            <AnimeNewsFeed />
          </motion.div>
        ) : (
          <motion.div
            key="memes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-20"
          >
            <MemeZone />
          </motion.div>
        )}
      </div>

      {/* Right Sidebar - Widgets */}
      <div className="hidden lg:block w-80 space-y-8">
        
        {/* Recent Community Activity Widget */}
        <div className="bg-black p-6 border-2 border-white/30 neo-shadow-white relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 border-b-2 border-white/10 pb-3">
            <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
              <Activity size={18} className="text-amber-400" strokeWidth={2.5} /> CANLI AKIŞ
            </h3>
            <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 border border-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> CANLI
            </span>
          </div>
          <p className="font-bold text-neutral-400 text-xs uppercase tracking-wide mb-4 leading-relaxed">
            Üyelerin izleme listelerine eklediği serileri anlık Firestore akışıyla takip et ve doğrudan kendi listene ekle.
          </p>
          <button 
            onClick={() => setActiveTab('activity')}
            className="w-full bg-amber-400 text-black font-black uppercase tracking-widest py-2.5 border-2 border-black hover:bg-amber-300 transition-all text-xs flex items-center justify-center gap-2 neo-shadow cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Activity size={15} strokeWidth={2.5} /> CANLI AKIŞI AÇ →
          </button>
        </div>
        
        {/* Daily Poll Widget */}
        {isPollActive && activePoll ? (
          <div className="bg-black p-6 border-2 border-white neo-shadow-white relative overflow-hidden group">
            <h3 className="font-black text-white mb-2 flex items-center gap-2 relative z-10 uppercase tracking-widest text-lg">
              <Flame size={24} strokeWidth={2.5} className="text-orange-500" /> {t('daily_poll')}
            </h3>
            <p className="font-bold text-neutral-400 mb-6 relative z-10 uppercase tracking-wider text-sm mt-3">
              {activePoll.question} <span className="text-orange-500">{activePoll.highlight}</span>{activePoll.questionEnd || ''} {t('decide')}
            </p>
            <button 
              onClick={() => setIsPollModalOpen(true)}
              className="w-full bg-white text-black font-black uppercase tracking-widest py-3 border-2 border-white hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all relative z-10"
            >
              {t('join_poll')}
            </button>
          </div>
        ) : (
          <div className="bg-orange-500 p-6 border-2 border-white neo-shadow-white relative overflow-hidden">
            <h3 className="font-black text-black mb-1 flex items-center gap-2 relative z-10 uppercase tracking-widest text-md">
              <Flame size={20} strokeWidth={2.5} className="text-black" /> {t('poll_winner')}
            </h3>
            <p className="text-sm text-black/80 font-bold mb-4 relative z-10 uppercase tracking-wider mt-3">
               TOPLULUK OYLAMASINA GÖRE <span className="text-white font-black bg-black px-1 rounded-sm">BU GÜN GÜNLERDEN NARUTO!</span> SEN DE NİNJA YOLUNA KATIL.
            </p>
            <div className="bg-black p-3 flex gap-3 border-2 border-black relative z-10 hover:border-white transition-colors cursor-pointer group" onClick={() => addToast('Naruto sayfasına gitme özelliği yakında!', 'info')}>
              <img src={getSafeImageUrl("https://cdn.myanimelist.net/images/anime/13/17405l.webp")} alt="Naruto" className="w-16 h-20 object-cover border border-white grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
              <div className="flex-1 flex flex-col justify-center">
                 <div className="font-black text-white mb-1 uppercase">NARUTO</div>
                 <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">AKSİYON, MACERA, NİNJA</div>
                 <div className="text-xs text-rose-500 flex items-center gap-1 font-black mt-2"><Star size={14} strokeWidth={2.5} fill="currentColor" /> 7.99</div>
              </div>
            </div>
          </div>
        )}



        {/* Anime Music Quiz Teaser Widget */}
        <div className="bg-black p-5 border-4 border-amber-400 neo-shadow-white relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-400 text-black flex items-center justify-center font-black border border-black shrink-0">
                <Music size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  ANİME MÜZİK QUİZİ
                </h3>
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  GÜNÜN ŞARKISI VE ARCADE YARIŞI
                </span>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 border border-white shrink-0">
              YENİ
            </span>
          </div>

          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-4">
            Açılış şarkısını dinle, animeyi bil! Günlük Heardle serini koru ve Arcade modunda yüksek skoru kır.
          </p>

          <button
            onClick={() => navigate('/music-quiz')}
            className="w-full py-2.5 bg-amber-400 text-black hover:bg-white font-black text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Quize Başla</span>
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Watch Party Widget */}
        <div className="bg-black p-5 border-2 border-amber-400 neo-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-600 text-white flex items-center justify-center font-black border border-white shrink-0">
                <Tv2 size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  BİRLİKTE İZLE (WATCH PARTY)
                </h3>
                <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  CANLI SENKRONİZE YAYIN
                </span>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase bg-emerald-500 text-black px-1.5 py-0.5 border border-black shrink-0">
              CANLI
            </span>
          </div>

          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-4">
            Arkadaşlarınla aynı anda anime fragmanlarını izle, sahneler arası uçuşan reaksiyonlar fırlat ve anlık sohbet et!
          </p>

          <button
            onClick={() => navigate('/watch-party')}
            className="w-full py-2.5 bg-rose-600 text-white hover:bg-amber-400 hover:text-black font-black text-xs uppercase tracking-wider border-2 border-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Odalara Katıl</span>
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Today's Airing Anime Widget */}
        <TodayAiringWidget />
        
        {/* Haftanın Enleri */}
        <div className="bg-black p-6 border-2 border-white/20">
          <h3 className="font-black tracking-widest uppercase text-white mb-6 flex items-center gap-2">
            <Flame size={20} className="text-white" strokeWidth={2.5} /> {t('trend_topics')}
          </h3>
          <div className="space-y-5">
            {[
              { id: 1, topic: 'GÜNDEM', hashtag: '#SOLOLEVELING', posts: '12.4K' },
              { id: 2, topic: 'İNCELEME', hashtag: 'FRİEREN SEZON FİNALİ', posts: '8.2K' },
              { id: 3, topic: 'SORU', hashtag: 'EN İYİ ROMANTİZM', posts: '5.1K' }
            ].map(trend => (
              <div key={trend.id} className="cursor-pointer group/trend relative border-b-2 border-white/10 pb-4 last:border-0 last:pb-0">
                <div className="text-xs text-rose-500 font-black uppercase">{trend.id} • {trend.topic}</div>
                <div className="font-black text-lg text-white group-hover/trend:text-rose-500 transition-colors uppercase tracking-tight mt-1 mb-1">{trend.hashtag}</div>
                <div className="text-xs text-neutral-500 font-bold uppercase">{trend.posts} GÖNDERİ</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kimi Takip Etmeli */}
        <div className="bg-black p-6 border-2 border-white/20">
          <h3 className="font-black tracking-widest uppercase text-white mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-white" strokeWidth={2.5} /> {t('who_to_follow')}
          </h3>
          <div className="space-y-4">
            {friends.slice(0, 3).map((friend) => (
              <div key={friend.id} className="flex items-center gap-4 group/user py-2 border-b-2 border-white/10 last:border-0 cursor-pointer">
                <img src={friend.avatar} alt={friend.name} className="w-12 h-12 border-2 border-white bg-white grayscale group-hover/user:grayscale-0 transition-all object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black uppercase tracking-wider text-white text-sm truncate group-hover/user:text-white transition-colors">{friend.name}</h4>
                  <p className="text-xs font-bold text-neutral-500 truncate w-full uppercase">@{friend.name.toLowerCase()}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToast(`${friend.name} takip edilmeye başlandı.`, 'success'); }}
                  className="bg-white border-2 border-white text-black font-black text-xs uppercase px-4 py-2 hover:bg-black hover:text-white transition-all shadow-sm"
                >
                  {t('follow')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly 50-Challenge Loop Widget */}
        <div className="bg-black p-5 border-4 border-rose-600 neo-shadow-white relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 border border-white uppercase flex items-center gap-1">
              <Flame size={12} /> GÜNLÜK 6 SORU
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">
              {challengeProgress.completedCount}/50 SORU (%{challengeProgress.percent})
            </span>
          </div>
          <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">
            HAFTALIK ANİME MEYDAN OKUMASI
          </h3>
          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-3">
            Her gün yenilenen tematik soruları çöz, günün serisini koru ve sıralamada +{totalChallengeXp} XP topla!
          </p>
          <div className="h-2 w-full bg-neutral-900 border border-white/20 mb-3 overflow-hidden">
            <div 
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${challengeProgress.percent}%` }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsChallengeModalOpen(true)}
              className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase border-2 border-white/40 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>HIZLI AÇ</span>
            </button>
            <button
              onClick={() => navigate('/challenge')}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#fff]"
            >
              <span>TAM SAYFA</span>
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Anime Taste Profiler Survey Widget */}
        <div className="bg-black p-5 border-4 border-amber-400 neo-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase flex items-center gap-1">
              <Sparkles size={12} /> ZEVK ANALİZİ
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">
              OTAKU DNA
            </span>
          </div>
          <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">
            KİŞİSEL ZEVK PROFİLİ ANKETİ
          </h3>
          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-4">
            3 adımlı analizi tamamla, zevkine özel Otaku DNA kartını ve sana özel başlangıç animelerini anında keşfet!
          </p>
          <button
            onClick={() => setIsTasteModalOpen(true)}
            className="w-full py-2.5 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-2 transition-colors cursor-pointer neo-shadow"
          >
            <span>Zevk Profilini Çıkar</span>
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>

      </div>
    
      <DailyPollModal 
        isOpen={isPollModalOpen} 
        onClose={() => setIsPollModalOpen(false)} 
      />

      <DailyChallengeModal 
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
      />

      <TasteProfileSurveyModal
        isOpen={isTasteModalOpen}
        onClose={() => setIsTasteModalOpen(false)}
      />
    </div>
  );
};
