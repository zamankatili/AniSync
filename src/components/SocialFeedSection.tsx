import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAppStore } from '../context/AppStore';
import { SocialFeedPost, Anime } from '../types';
import { useToastStore } from '../store/useToastStore';
import { getSafeImageUrl, formatRelativeTime } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getDefaultAvatar } from '../lib/avatar';
import { ReportButton } from './ReportButton';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Star, 
  Sparkles, 
  Flame, 
  Search, 
  CheckCircle2, 
  Bookmark, 
  Share2, 
  Plus, 
  X,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const SocialFeedSection: React.FC = () => {
  const { currentUser, userProfile, watchlist } = useAppStore();
  const { addToast } = useToastStore();
  const { t } = useAppTranslation();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<SocialFeedPost[]>([]);
  const [loading, setLoading] = useState(false);

  // New post form state
  const [selectedAnime, setSelectedAnime] = useState<{ mal_id: number; title: string; image_url: string } | null>(null);
  const [episodeNote, setEpisodeNote] = useState('');
  const [rating, setRating] = useState<number>(9);
  const [reviewText, setReviewText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // Quick anime search for posting
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Real-time Firestore sync
  useEffect(() => {
    const q = query(collection(db, 'socialFeed'), orderBy('createdAt', 'desc'), limit(25));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: SocialFeedPost[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString()
          } as SocialFeedPost);
        });
        setPosts(loaded);
      } else {
        setPosts([]);
      }
    }, (err) => {
      console.warn('Social feed listener warning:', err);
      setPosts([]);
    });

    return () => unsubscribe();
  }, []);

  // Search anime for posting
  const handleAnimeSearch = async (queryText: string) => {
    setSearchQuery(queryText);
    if (!queryText.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(queryText)}&limit=5&sfw=true`);
      const json = await res.json();
      if (json && json.data) {
        setSearchResults(json.data);
      }
    } catch (e) {
      console.warn('Anime search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAnime = (anime: any) => {
    setSelectedAnime({
      mal_id: anime.mal_id,
      title: anime.title_english || anime.title,
      image_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url
    });
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  // Submit new review post
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast(t('chat_login_required'), 'info');
      return;
    }
    if (!selectedAnime) {
      addToast(t('social_feed_select_anime'), 'error');
      return;
    }
    if (!reviewText.trim()) {
      addToast(t('social_feed_write_review'), 'error');
      return;
    }

    setIsPosting(true);
    const postPayload = {
      userId: currentUser.uid,
      userName: userProfile.name || userProfile.handle || t('social_feed_default_user'),
      userAvatarSeed: userProfile.avatarSeed || 'Me',
      userAvatar: currentUser?.photoURL || null,
      animeId: selectedAnime.mal_id,
      animeTitle: selectedAnime.title,
      animeImage: selectedAnime.image_url,
      episodeNote: episodeNote.trim() || 'İzleme Güncellemesi',
      rating,
      reviewText: reviewText.trim(),
      likes: 0,
      likedBy: [],
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'socialFeed'), postPayload);
      addToast(t('social_feed_post_shared'), 'success');
      // Reset form
      setSelectedAnime(null);
      setEpisodeNote('');
      setReviewText('');
      setRating(9);
    } catch (err) {
      console.error('Error posting social feed:', err);
      // Optimistic local add
      setPosts(prev => [{
        id: 'local_' + Date.now(),
        ...postPayload,
        createdAt: new Date().toISOString()
      } as SocialFeedPost, ...prev]);
      addToast(t('social_feed_posted'), 'success');
      setSelectedAnime(null);
      setEpisodeNote('');
      setReviewText('');
    } finally {
      setIsPosting(false);
    }
  };

  // Toggle Like on Feed Post (yalnızca giriş yapmış kullanıcılar Firestore'a yazar; misafirler yerel)
  const handleToggleLike = async (post: SocialFeedPost) => {
    const uid = currentUser?.uid;
    const localUid = uid ?? 'guest_user';
    const isLiked = post.likedBy?.includes(localUid);

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
          likedBy: isLiked ? p.likedBy?.filter(id => id !== localUid) : [...(p.likedBy || []), localUid]
        };
      }
      return p;
    }));

    if (!uid) return; // Misafir beğenisi yalnızca yerel
    try {
      const postRef = doc(db, 'socialFeed', post.id);
      if (isLiked) {
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(uid)
        });
      }
    } catch (e) {
      console.warn('Like toggle sync error:', e);
    }
  };

  return (
    <div className="bg-black border-4 border-black p-6 md:p-10 neo-shadow-white space-y-8">
      {/* Header */}
      <div className="border-b-4 border-white/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 text-white text-xs font-black tracking-widest uppercase mb-2 border-2 border-black neo-shadow-white">
            <Flame size={14} className="text-white" />
            {t('social_feed_header_badge')}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            {t('social_feed_title')}
          </h2>
          <p className="text-neutral-400 font-bold text-xs md:text-sm uppercase tracking-wider mt-1">
            {t('social_feed_header_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-neutral-900 border-2 border-white/30 text-white font-black text-xs uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('social_feed_live_feed')}
          </span>
        </div>
      </div>

      {/* Share / Create Review Box */}
      <div className="bg-white border-4 border-black p-5 md:p-6 neo-shadow">
        <div className="flex items-center gap-3 border-b-2 border-black pb-3 mb-4">
          <div className="w-10 h-10 border-2 border-black bg-black flex items-center justify-center text-white">
            <MessageSquare size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-black text-base uppercase tracking-tight">
              {t('social_feed_create_title')}
            </h3>
            <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
              {t('social_feed_create_desc')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitPost} className="space-y-4">
          {/* Anime Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Pick from Watchlist or Search */}
            <div className="md:col-span-6 relative">
              <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1">
                {t('social_feed_select_anime_label')}
              </label>

              {selectedAnime ? (
                <div className="flex items-center justify-between p-2 bg-neutral-100 border-2 border-black">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={getSafeImageUrl(selectedAnime.image_url)} 
                      alt={selectedAnime.title} 
                      className="w-7 h-10 object-cover border border-black flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-black text-xs uppercase truncate text-black">{selectedAnime.title}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedAnime(null)}
                    className="p-1 text-black hover:text-rose-600"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('social_feed_search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => handleAnimeSearch(e.target.value)}
                    className="w-full bg-neutral-100 border-2 border-black px-3 py-2.5 text-xs font-black uppercase text-black focus:outline-none focus:bg-amber-100 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* Search Dropdown */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black z-50 neo-shadow max-h-56 overflow-y-auto p-1 space-y-1">
                      {searchResults.map((item) => (
                        <div
                          key={item.mal_id}
                          onClick={() => handleSelectAnime(item)}
                          className="flex items-center gap-2 p-1.5 hover:bg-black hover:text-white cursor-pointer transition-colors"
                        >
                          <img
                            src={getSafeImageUrl(item.images?.jpg?.image_url)}
                            alt={item.title}
                            className="w-6 h-8 object-cover border border-black flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs font-black uppercase truncate">{item.title_english || item.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quick watchlist pills */}
              {!selectedAnime && watchlist.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto mt-2 pb-1 scrollbar-none">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase flex-shrink-0">
                  {t('social_feed_watchlist_pills')}
                </span>
                  {watchlist.slice(0, 4).map((w) => (
                    <button
                      key={w.anime.mal_id}
                      type="button"
                      onClick={() => handleSelectAnime(w.anime)}
                      className="flex-shrink-0 px-2 py-0.5 bg-neutral-100 hover:bg-amber-400 text-black border border-black text-[10px] font-black uppercase truncate max-w-[130px] transition-colors"
                    >
                      {w.anime.title_english || w.anime.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episode Note */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1">
                {t('social_feed_episode_note_label')}
              </label>
              <input
                type="text"
                placeholder={t('social_feed_episode_note_placeholder')}
                value={episodeNote}
                onChange={(e) => setEpisodeNote(e.target.value)}
                maxLength={40}
                className="w-full bg-neutral-100 border-2 border-black px-3 py-2.5 text-xs font-black uppercase text-black focus:outline-none focus:bg-amber-100 transition-colors"
              />
            </div>

            {/* Score Selector */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1">
                {t('social_feed_score_label', { rating })}
              </label>
              <div className="flex items-center gap-1 bg-neutral-100 border-2 border-black px-2 py-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`flex-1 text-[11px] font-black py-0.5 transition-colors ${
                      rating === num ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1">
              {t('social_feed_review_label')}
            </label>
            <textarea
              required
              rows={3}
              maxLength={300}
              placeholder={t('social_feed_review_placeholder')}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-neutral-100 border-2 border-black p-3 text-xs font-bold text-black uppercase focus:outline-none focus:bg-amber-100 transition-colors"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">
              {t('social_feed_chars_left', { left: 300 - reviewText.length })}
            </span>

            <button
              type="submit"
              disabled={isPosting || !selectedAnime || !reviewText.trim()}
              className="px-6 py-3 bg-black text-white hover:bg-rose-600 font-black uppercase text-xs tracking-widest border-2 border-black neo-shadow transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={14} />
              {isPosting ? t('social_feed_posting') : t('social_feed_share')}
            </button>
          </div>
        </form>
      </div>

      {/* FEED STREAM GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-white/20 pb-2">
          <h4 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Compass size={20} className="text-amber-400" />
            {t('social_feed_stream_title', { count: posts.length })}
          </h4>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            {t('social_feed_stream_newest')}
          </span>
        </div>

        {posts.length === 0 && (
          <div className="border-4 border-white/20 bg-black p-12 text-center">
            <Compass size={48} className="text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
              {t('social_feed_empty_title')}
            </h3>
            <p className="text-neutral-400 font-bold uppercase text-xs">
              {t('social_feed_empty_desc')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const uid = currentUser?.uid || 'guest_user';
            const isLiked = post.likedBy?.includes(uid);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-950 border-4 border-black p-5 neo-shadow-white flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors"
              >
                {/* Author Info & Relative Time */}
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.userAvatar || getDefaultAvatar(post.userAvatarSeed || 'Otaku')}
                      alt={post.userName}
                      className="w-9 h-9 border-2 border-white object-cover bg-neutral-800"
                    />
                    <div>
                      <h5 className="font-black text-xs uppercase text-white truncate max-w-[140px] leading-tight">
                        {post.userName}
                      </h5>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">
                        {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {post.rating && (
                    <div className="flex items-center gap-1 bg-amber-400 text-black px-2 py-0.5 border border-black font-black text-xs neo-shadow-white">
                      <Star size={12} fill="currentColor" strokeWidth={2.5} />
                      {post.rating}/10
                    </div>
                  )}
                </div>

                {/* Attached Anime Card */}
                <div 
                  onClick={() => navigate(`/anime/${post.animeId}`)}
                  className="flex items-center gap-3 p-2 bg-black border-2 border-white/20 hover:border-white transition-colors cursor-pointer group"
                >
                  <img
                    src={getSafeImageUrl(post.animeImage)}
                    alt={post.animeTitle}
                    className="w-12 h-16 object-cover border border-white flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase text-amber-400 px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 inline-block mb-1">
                      {post.episodeNote || t('social_feed_episode_update')}
                    </span>
                    <h6 className="font-black text-xs uppercase text-white truncate group-hover:text-rose-400 transition-colors">
                      {post.animeTitle}
                    </h6>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                      {t('social_feed_go_to_details')}
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <div className="flex-1">
                  <p className="text-xs text-neutral-200 font-bold uppercase leading-relaxed tracking-wide">
                    "{post.reviewText}"
                  </p>
                </div>

                {/* Footer Interaction Bar */}
                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleLike(post)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase border transition-colors cursor-pointer ${
                      isLiked 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : 'bg-black text-neutral-400 border-white/30 hover:border-white hover:text-white'
                    }`}
                  >
                    <Heart size={14} className={isLiked ? "fill-white" : ""} strokeWidth={2.5} />
                    <span>{post.likes || 0} {t('social_feed_likes')}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/anime/${post.animeId}`)}
                    className="text-[10px] font-black uppercase text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                  >
                    <MessageSquare size={12} /> {t('social_feed_discuss')}
                  </button>

                  <ReportButton
                    target={{ targetPath: `socialFeed/${post.id}`, targetLabel: post.animeTitle }}
                    compact
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
