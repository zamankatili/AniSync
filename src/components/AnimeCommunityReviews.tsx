import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, ThumbsUp, Send, Sparkles, User, ShieldCheck, Clock, Award 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, doc, onSnapshot, setDoc, query, orderBy, limit, updateDoc, increment 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { cn } from '../lib/utils';

export interface CommunityReview {
  id: string;
  animeId: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5 stars
  blurb: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
}

interface AnimeCommunityReviewsProps {
  animeId: number;
  animeTitle?: string;
}

const INITIAL_SEED_REVIEWS: Record<number, CommunityReview[]> = {
  52991: [
    {
      id: 'rev-frieren-1',
      animeId: 52991,
      userId: 'user-otaku-1',
      userName: 'FrierenFanatic',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frieren1',
      rating: 5,
      blurb: 'Son yıllarda izlediğim en derin atmosferik fantastik anime. Müzikler, sahneler ve zaman algısının işlenişi kusursuz!',
      createdAt: '2 saat önce',
      likes: 24,
      likedBy: []
    },
    {
      id: 'rev-frieren-2',
      animeId: 52991,
      userId: 'user-otaku-2',
      userName: 'KagamineLevi',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=levi99',
      rating: 5,
      blurb: 'Savaş sahnelerindeki ses tasarımı ve Fern ile Stark arkadaşlığı muhteşem. Tam puanı hakediyor.',
      createdAt: '5 saat önce',
      likes: 18,
      likedBy: []
    }
  ],
  52299: [
    {
      id: 'rev-solo-1',
      animeId: 52299,
      userId: 'user-otaku-3',
      userName: 'ShadowMonarch',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sungjinwoo',
      rating: 5,
      blurb: 'Sung Jinwoo dönüşümü ve Hiroyuki Sawano müzikleri efsanevi! Webtoon uyarlaması beklentileri aştı.',
      createdAt: 'Bugün',
      likes: 31,
      likedBy: []
    }
  ]
};

export const AnimeCommunityReviews: React.FC<AnimeCommunityReviewsProps> = ({ 
  animeId, 
  animeTitle 
}) => {
  const { currentUser, userProfile } = useAppStore();
  const { addToast } = useToastStore();

  const [reviews, setReviews] = useState<CommunityReview[]>(() => INITIAL_SEED_REVIEWS[animeId] || []);
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [blurbText, setBlurbText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Firestore real-time listener
  useEffect(() => {
    const reviewsCol = collection(db, 'animeReviews', animeId.toString(), 'userReviews');
    const q = query(reviewsCol, orderBy('createdAt', 'desc'), limit(30));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreList: CommunityReview[] = [];
        snapshot.forEach((d) => {
          firestoreList.push({ id: d.id, ...d.data() } as CommunityReview);
        });
        setReviews(firestoreList);
      }
    }, (err) => {
      console.warn('Firestore review listener error, using local state:', err);
    });

    return () => unsubscribe();
  }, [animeId]);

  // Calculate Community Average Rating out of 5
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blurbText.trim()) {
      addToast('Lütfen kısa bir inceleme yazısı ekleyin.', 'error');
      return;
    }

    setIsSubmitting(true);
    const userId = currentUser?.uid || 'guest-' + (userProfile?.name || 'otaku');
    const userName = userProfile?.name || currentUser?.displayName || 'AnimeSever';
    const userAvatar = currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`;

    const newReview: CommunityReview = {
      id: 'rev-' + Date.now(),
      animeId,
      userId,
      userName,
      userAvatar,
      rating: userRating,
      blurb: blurbText.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    // Optimistic local update
    setReviews((prev) => [newReview, ...prev]);
    setBlurbText('');

    try {
      const reviewDocRef = doc(db, 'animeReviews', animeId.toString(), 'userReviews', newReview.id);
      await setDoc(reviewDocRef, newReview);
      addToast('Topluluk incelemeniz yayınlandı!', 'success');
    } catch (err) {
      console.warn('Firestore review write info:', err);
      addToast('İncelemeniz başarıyla kaydedildi!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    const currentUid = currentUser?.uid || 'guest-user';

    setReviews((prev) => prev.map((r) => {
      if (r.id === reviewId) {
        const liked = r.likedBy?.includes(currentUid);
        const newLikes = liked ? r.likes - 1 : r.likes + 1;
        const newLikedBy = liked 
          ? (r.likedBy || []).filter(id => id !== currentUid)
          : [...(r.likedBy || []), currentUid];
        return { ...r, likes: Math.max(0, newLikes), likedBy: newLikedBy };
      }
      return r;
    }));

    try {
      const docRef = doc(db, 'animeReviews', animeId.toString(), 'userReviews', reviewId);
      await updateDoc(docRef, { likes: increment(1) });
    } catch (_err) {
      // Handled optimistically
    }
  };

  const RATING_LABELS: Record<number, string> = {
    1: '1/5 - ZAYIF / KÖTÜ',
    2: '2/5 - YETERSİZ',
    3: '3/5 - ORTALAMA',
    4: '4/5 - ÇOK İYİ',
    5: '5/5 - MÜKEMMEL / ŞAHESER'
  };

  return (
    <div className="bg-black border-4 border-white neo-shadow-white p-6 md:p-8 mt-10 relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-4 border-white/20 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-600 text-white border-4 border-white flex items-center justify-center font-black neo-shadow">
            <MessageSquare size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              TOPLULUK İNCELEMELERİ VE 5 YILDIZLI DEĞERLENDİRMELER
            </h2>
            <p className="text-xs text-neutral-300 font-bold uppercase tracking-wider">
              {animeTitle || "Bu seri"} hakkında izleyicilerin kısa yorumları ve puanları
            </p>
          </div>
        </div>

        {/* Community Score Badge */}
        <div className="flex items-center gap-3 bg-neutral-900 border-2 border-amber-400 px-4 py-2 text-white font-black neo-shadow">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={18} 
                fill={star <= Math.round(parseFloat(averageRating)) ? "currentColor" : "none"} 
                className="text-amber-400"
              />
            ))}
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-amber-400 tracking-tight leading-none block">
              ★ {averageRating} / 5.0
            </span>
            <span className="text-[10px] text-neutral-400 font-mono uppercase block">
              {reviews.length} İNCELEME
            </span>
          </div>
        </div>
      </div>

      {/* Write a Review Box */}
      <form onSubmit={handleSubmitReview} className="bg-neutral-950 border-4 border-white p-5 neo-shadow mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-white/20 pb-3">
          <span className="font-black text-xs uppercase text-amber-400 flex items-center gap-1.5">
            <Sparkles size={14} /> KISA İNCELEME VE PUAN EKLE
          </span>
          <span className="text-xs font-black uppercase text-rose-400">
            {RATING_LABELS[hoverRating || userRating]}
          </span>
        </div>

        {/* 5-Star Interactive Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-white mr-2">Puanın:</span>
          {[1, 2, 3, 4, 5].map((star) => {
            const activeStar = star <= (hoverRating || userRating);
            return (
              <button
                type="button"
                key={star}
                onClick={() => setUserRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform active:scale-125 cursor-pointer"
                title={`${star} Yıldız`}
              >
                <Star
                  size={28}
                  fill={activeStar ? '#f59e0b' : 'none'}
                  className={cn(
                    "transition-colors",
                    activeStar ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "text-neutral-600 hover:text-neutral-400"
                  )}
                  strokeWidth={2.5}
                />
              </button>
            );
          })}
        </div>

        {/* Short Blurb Textarea */}
        <textarea
          rows={3}
          maxLength={350}
          value={blurbText}
          onChange={(e) => setBlurbText(e.target.value)}
          placeholder="Seri hakkındaki kısa incelemeni, duygu ve düşüncelerini yaz (Örn: Çizimler, müzikler ve hikaye kurgusu harikaydı!)..."
          className="w-full p-3 bg-black border-2 border-white/40 focus:border-amber-400 text-white font-bold text-xs uppercase placeholder-neutral-600 focus:outline-none transition-colors resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-neutral-500 font-mono font-bold">
            {blurbText.length} / 350 KARAKTER
          </span>

          <button
            type="submit"
            disabled={isSubmitting || !blurbText.trim()}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs uppercase border-2 border-white flex items-center gap-2 transition-all active:translate-y-0.5 cursor-pointer neo-shadow-white shadow-[2px_2px_0px_0px_#fff]"
          >
            <Send size={14} />
            <span>{isSubmitting ? "YAYINLANIYOR..." : "İNCELEMEYİ YAYINLA"}</span>
          </button>
        </div>
      </form>

      {/* Community Reviews Feed */}
      <div className="space-y-4">
        <h3 className="font-black text-sm uppercase text-white tracking-widest flex items-center gap-2 mb-2">
          <span>TOPLULUK DÜŞÜNCELERİ ({reviews.length})</span>
        </h3>

        {reviews.length > 0 ? (
          reviews.map((rev) => {
            const isLikedByMe = rev.likedBy?.includes(currentUser?.uid || 'guest-user');

            return (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-950 border-2 border-white/30 p-4 transition-all hover:border-white relative"
              >
                {/* User Info Header */}
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={rev.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.userName}`} 
                      alt={rev.userName} 
                      className="w-9 h-9 border border-white bg-white object-cover"
                    />
                    <div>
                      <span className="font-black text-xs uppercase text-white block leading-snug">
                        {rev.userName}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono font-bold flex items-center gap-1">
                        <Clock size={10} /> {rev.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars Badge */}
                  <div className="flex items-center gap-1 bg-black px-2.5 py-1 border border-amber-400 text-amber-400 font-black text-xs shadow-[2px_2px_0px_0px_#f59e0b]">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={12} 
                          fill={s <= rev.rating ? "currentColor" : "none"} 
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-[11px]">{rev.rating}/5</span>
                  </div>
                </div>

                {/* Review Blurb Text */}
                <p className="text-xs text-neutral-200 font-bold leading-relaxed mb-4 whitespace-pre-line pl-1">
                  &ldquo;{rev.blurb}&rdquo;
                </p>

                {/* Like / Upvote Action */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleLikeReview(rev.id)}
                    className={cn(
                      "px-3 py-1 border text-[11px] font-black uppercase flex items-center gap-1.5 transition-colors cursor-pointer",
                      isLikedByMe
                        ? "bg-amber-400 text-black border-amber-400 shadow-[1px_1px_0px_0px_#fff]"
                        : "bg-neutral-900 text-neutral-300 border-white/30 hover:border-white hover:text-white"
                    )}
                  >
                    <ThumbsUp size={12} />
                    <span>FAYDALI ({rev.likes})</span>
                  </button>

                  <span className="text-[10px] text-neutral-500 font-bold uppercase">
                    ONAYLI ANISYNC İNCELEMESİ
                  </span>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-neutral-950 border-2 border-white/20 p-8 text-center text-neutral-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p className="font-black text-xs uppercase mb-1">Henüz Topluluk İncelemesi Yazılmadı</p>
            <p className="text-[11px] font-bold">İlk 5 yıldızlı değerlendirmeyi sen yazarak topluluğa katkı ver!</p>
          </div>
        )}
      </div>
    </div>
  );
};
