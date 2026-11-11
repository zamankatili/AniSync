import React, { useState, useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import {
  MessageSquare, Star,
  Sparkles, Search as SearchIcon, Image as ImageIcon, Flame,
  Activity, Music, ChevronRight, Tv2, Newspaper, BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl } from '../lib/utils';
import { unifiedDetailPath } from '../lib/mediaLinks';
import { resolveAvatar } from '../lib/avatar';
import { useDailyPicks } from '../hooks/useDailyPicks';
import { DailyPollModal } from '../components/DailyPollModal';
import { DailyChallengeModal } from '../components/DailyChallengeModal';
import { TasteProfileSurveyModal } from '../components/TasteProfileSurveyModal';
import { OtakuLevelBadge } from '../components/OtakuLevelBadge';
import { DailyPromptCard } from '../components/DailyPromptCard';

import { MemeZone } from '../components/MemeZone';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { QuickContinueWatching } from '../components/QuickContinueWatching';
import { TodayAiringWidget } from '../components/TodayAiringWidget';
import { AnimeNewsFeed } from '../components/AnimeNewsFeed';
import { CommunityPulse } from '../components/CommunityPulse';
import { MultiMediaHub } from '../components/MultiMediaHub';
import { useWeeklyChallengeStore } from '../store/useWeeklyChallengeStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { localizeGenres } from '../lib/genreNames';

export const Home = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { addForumPost, userProfile, currentUser, activePoll } = useAppStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<'feed' | 'activity' | 'multimedia' | 'memes' | 'news'>('feed');
  const [newPostContent, setNewPostContent] = useState('');

  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isTasteModalOpen, setIsTasteModalOpen] = useState(false);

  const { getOverallProgress, streakDays, totalChallengeXp } = useWeeklyChallengeStore();
  const challengeProgress = getOverallProgress();

  const postInputRef = React.useRef<HTMLTextAreaElement>(null);

  /** Günün sorusu yanıtla → feed sekmesine geç, soru ile doldur, odaklan. */
  const handleDailyQuestionAnswer = (question: string) => {
    setActiveTab('feed');
    setNewPostContent(`${question} — `);
    window.setTimeout(() => postInputRef.current?.focus(), 60);
  };

  const { items: picksToday, personalized: picksPersonalized, state: picksState } = useDailyPicks(1);
  const todayPick = picksToday[0] ?? null;

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    if (!currentUser) {
      // Misafir gönderileri yalnızca yerel kalır ve yenileyince kaybolur — engellenir
      addToast(t('chat_login_required'), 'info');
      return;
    }

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
    <div className="w-full min-w-0 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Başlık/meta SEOManager (App seviyesi, i18n'li) tarafından yönetilir */}

      {/* Main Feed */}
      <div className="flex-1 min-w-0 max-w-2xl w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-pre-wrap">{t('home')}</h1>
          
          {/* Mobilde tek satırda kaydırılabilir sekme şeridi; masaüstünde tamamı sığar. */}
          <div className="flex bg-black border-4 border-white neo-shadow overflow-x-auto hide-scrollbar max-w-full">
            <button 
              onClick={() => setActiveTab('feed')}
              className={cn("shrink-0 px-2.5 py-2 font-black uppercase tracking-wide text-[10px] sm:text-xs whitespace-nowrap transition-colors cursor-pointer", activeTab === 'feed' ? "bg-white text-black" : "text-white hover:bg-neutral-900")}
            >
              {t('home_tab_feed')}
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={cn("shrink-0 px-2.5 py-2 font-black uppercase tracking-wide text-[10px] sm:text-xs whitespace-nowrap transition-colors border-l-4 border-white flex items-center gap-1 cursor-pointer", activeTab === 'activity' ? "bg-amber-400 text-black" : "text-white hover:bg-neutral-900")}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <Activity size={14} strokeWidth={3} className={activeTab === 'activity' ? "text-black" : "text-amber-400"} />
              {t('home_tab_activity')}
            </button>
            <button 
              onClick={() => setActiveTab('multimedia')}
              className={cn("shrink-0 px-2.5 py-2 font-black uppercase tracking-wide text-[10px] sm:text-xs whitespace-nowrap transition-colors border-l-4 border-white flex items-center gap-1 cursor-pointer", activeTab === 'multimedia' ? "bg-rose-600 text-white" : "text-white hover:bg-neutral-900")}
            >
              <BookOpen size={14} strokeWidth={2.5} className="shrink-0" />
              {t('home_tab_multimedia')}
            </button>
            <button 
              onClick={() => setActiveTab('memes')}
              className={cn("shrink-0 px-2.5 py-2 font-black uppercase tracking-wide text-[10px] sm:text-xs whitespace-nowrap transition-colors border-l-4 border-white cursor-pointer", activeTab === 'memes' ? "bg-cyan-500 text-white" : "text-white hover:bg-neutral-900")}
            >
              {t('home_tab_memes')}
            </button>
            <button 
              onClick={() => setActiveTab('news')}
              className={cn("shrink-0 px-2.5 py-2 font-black uppercase tracking-wide text-[10px] sm:text-xs whitespace-nowrap transition-colors border-l-4 border-white flex items-center gap-1 cursor-pointer", activeTab === 'news' ? "bg-cyan-400 text-black" : "text-white hover:bg-neutral-900")}
            >
              <Newspaper size={14} strokeWidth={2.5} className="shrink-0" />
              {t('home_tab_news')}
            </button>
          </div>
        </div>

        {/* Mobil: widget şeridi (sidebar yalnızca lg+ ekranda; mobilde bunlar görünür) */}
        <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {activePoll && (
            <button
              onClick={() => setIsPollModalOpen(true)}
              className="flex items-center gap-1.5 shrink-0 px-3 py-2 bg-black border-2 border-orange-500 text-orange-400 text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
              <Flame size={14} strokeWidth={2.5} /> {t('daily_poll')}
            </button>
          )}
          <button
            onClick={() => setIsChallengeModalOpen(true)}
            className="flex items-center gap-1.5 shrink-0 px-3 py-2 bg-black border-2 border-rose-600 text-rose-400 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            <Flame size={14} strokeWidth={2.5} /> {t('challenge_title')}
          </button>
          <button
            onClick={() => navigate('/music-quiz')}
            className="flex items-center gap-1.5 shrink-0 px-3 py-2 bg-black border-2 border-amber-400 text-amber-400 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            <Music size={14} strokeWidth={2.5} /> {t('anime_music_quiz')}
          </button>
          <button
            onClick={() => navigate('/watch-party')}
            className="flex items-center gap-1.5 shrink-0 px-3 py-2 bg-black border-2 border-rose-500 text-rose-300 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            <Tv2 size={14} strokeWidth={2.5} /> {t('watch_party_title')}
          </button>
          <button
            onClick={() => setIsTasteModalOpen(true)}
            className="flex items-center gap-1.5 shrink-0 px-3 py-2 bg-black border-2 border-cyan-400 text-cyan-300 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            <Sparkles size={14} strokeWidth={2.5} /> {t('taste_badge')}
          </button>
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
                <img src={resolveAvatar(currentUser?.photoURL, userProfile.avatarSeed)} alt="Me" className="w-12 h-12 border-2 border-white bg-white shrink-0 grayscale hover:grayscale-0 transition-all" />
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

            {/* System Post: Daily Pick (canlı AniList sezon trendi) */}
            {picksState === 'ready' && todayPick && (
            <div className="bg-rose-600 p-5 md:p-6 border-2 border-white neo-shadow-white mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                <Sparkles size={120} strokeWidth={1} />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Sparkles size={20} className="text-white" strokeWidth={2.5} />
                <span className="font-black tracking-widest text-white uppercase">{t('daily_pick')}{picksPersonalized ? ` · ${t('picks_personalized')}` : ''}</span>
              </div>
              <h3 lang="en" className="text-3xl font-black text-white mb-2 uppercase tracking-tight relative z-10">{todayPick.title.english || todayPick.title.romaji || todayPick.displayTitle}</h3>
              <p lang="en" className="text-rose-100 font-bold mb-5 relative z-10 max-w-[90%] line-clamp-2">{todayPick.synopsis}</p>
              <div className="bg-black p-4 flex gap-4 border-2 border-white relative z-10 group">
                 <img src={getSafeImageUrl(todayPick.cover?.large ?? todayPick.cover?.medium)} alt={todayPick.displayTitle} className="w-20 h-28 object-cover border-2 border-white transition-all" referrerPolicy="no-referrer" />
                 <div className="flex flex-col justify-center">
                    <div lang="en" className="font-black text-white mb-1 tracking-wider uppercase">{todayPick.displayTitle}</div>
                    <div lang="en" className="text-sm text-neutral-400 font-bold uppercase">{localizeGenres(todayPick.genres ?? []).slice(0, 3).join(', ')} • {todayPick.episodes ?? '—'} {t('episodes')}</div>
                    <div className="text-sm text-rose-500 flex items-center gap-1 font-black mt-2"><Star size={16} strokeWidth={2.5} fill="currentColor" /> {todayPick.averageScore != null ? (todayPick.averageScore / 10).toFixed(1) : '—'}</div>
                 </div>
              </div>
              <div className="flex gap-4 mt-6 relative z-10 flex-wrap">
                <button
                  onClick={() => {
                    const path = unifiedDetailPath(todayPick.id);
                    if (path) navigate(path);
                  }}
                  className="flex items-center bg-black text-white px-4 py-2 gap-2 border-2 border-white font-black hover:bg-white hover:text-black transition-all uppercase tracking-wider"
                >
                  <ChevronRight size={18} strokeWidth={2.5} /> {t('view_details')}
                </button>
                <button
                  onClick={() => {
                    if (postInputRef.current) {
                      postInputRef.current.focus();
                      setNewPostContent(`${todayPick.displayTitle} hakkında: `);
                    }
                  }}
                  className="flex items-center bg-white text-black px-4 py-2 gap-2 border-2 border-white font-black hover:bg-black hover:text-white transition-all uppercase tracking-wider"
                >
                  <MessageSquare size={18} strokeWidth={2.5} /> {t('join_discussion')}
                </button>
              </div>
            </div>
            )}

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
      <div className="hidden lg:block w-full lg:w-80 shrink-0 space-y-8">
        
        {/* Recent Community Activity Widget */}
        <div className="bg-black p-6 border-2 border-white/30 neo-shadow-white relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 border-b-2 border-white/10 pb-3">
            <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
              <Activity size={18} className="text-amber-400" strokeWidth={2.5} /> {t('live_stream')}
            </h3>
            <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 border border-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> {t('live_badge')}
            </span>
          </div>
          <p className="font-bold text-neutral-400 text-xs uppercase tracking-wide mb-4 leading-relaxed">
            {t('live_stream_desc')}
          </p>
          <button 
            onClick={() => setActiveTab('activity')}
            className="w-full bg-amber-400 text-black font-black uppercase tracking-widest py-2.5 border-2 border-black hover:bg-amber-300 transition-all text-xs flex items-center justify-center gap-2 neo-shadow cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Activity size={15} strokeWidth={2.5} /> {t('open_live_stream')} →
          </button>
        </div>
        
        {/* Daily Poll Widget */}
        {activePoll ? (
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
          <div className="bg-black p-6 border-2 border-white/20 relative overflow-hidden">
            <h3 className="font-black text-white mb-2 flex items-center gap-2 relative z-10 uppercase tracking-widest text-md">
              <Flame size={20} strokeWidth={2.5} className="text-neutral-500" /> {t('poll_empty_title')}
            </h3>
            <p className="text-sm text-neutral-400 font-bold mb-2 relative z-10 uppercase tracking-wider mt-3">
              {t('poll_empty_desc')}
            </p>
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
                  {t('anime_music_quiz')}
                </h3>
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  {t('quiz_sub')}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 border border-white shrink-0">
              {t('new_badge')}
            </span>
          </div>

          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-4">
            {t('quiz_desc')}
          </p>

          <button
            onClick={() => navigate('/music-quiz')}
            className="w-full py-2.5 bg-amber-400 text-black hover:bg-white font-black text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{t('start_quiz')}</span>
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
                  {t('watch_party_title')}
                </h3>
                <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {t('live_synced')}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase bg-emerald-500 text-black px-1.5 py-0.5 border border-black shrink-0">
              {t('live_badge')}
            </span>
          </div>

          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-4">
            {t('watch_party_desc')}
          </p>

          <button
            onClick={() => navigate('/watch-party')}
            className="w-full py-2.5 bg-rose-600 text-white hover:bg-amber-400 hover:text-black font-black text-xs uppercase tracking-wider border-2 border-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{t('join_rooms')}</span>
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Today's Airing Anime Widget */}
        <TodayAiringWidget />

        {/* Weekly 50-Challenge Loop Widget */}
        <div className="bg-black p-5 border-4 border-rose-600 neo-shadow-white relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 border border-white uppercase flex items-center gap-1">
              <Flame size={12} /> {t('daily_questions')}
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">
              {t('challenge_progress', { done: challengeProgress.completedCount, percent: challengeProgress.percent })}
            </span>
          </div>
          <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">
            {t('challenge_title')}
          </h3>
          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-3">
            {t('challenge_desc', { xp: totalChallengeXp })}
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
              <span>{t('quick_open')}</span>
            </button>
            <button
              onClick={() => navigate('/challenge')}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#fff]"
            >
              <span>{t('full_page')}</span>
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Anime Taste Profiler Survey Widget */}
        <div className="bg-black p-5 border-4 border-amber-400 neo-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase flex items-center gap-1">
              <Sparkles size={12} /> {t('taste_badge')}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">
              OTAKU DNA
            </span>
          </div>
          <h3 className="font-black text-white text-sm uppercase tracking-wider mb-1">
            {t('taste_title')}
          </h3>
          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-4">
            {t('taste_desc')}
          </p>
          <button
            onClick={() => setIsTasteModalOpen(true)}
            className="w-full py-2.5 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black flex items-center justify-center gap-2 transition-colors cursor-pointer neo-shadow"
          >
            <span>{t('build_taste_profile')}</span>
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Otaku Rübesi — XP & Seviye */}
        <OtakuLevelBadge />

        {/* Günün Sorusu — herkes aynı soruyu görür */}
        <DailyPromptCard onAnswer={handleDailyQuestionAnswer} />

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
