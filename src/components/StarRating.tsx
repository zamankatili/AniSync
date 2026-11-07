import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useToastStore } from '../store/useToastStore';

export const StarRating = ({ animeId }: { animeId: number }) => {
  const { currentUser } = useAppStore();
  const { addToast } = useToastStore();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useAppTranslation();

  useEffect(() => {
    fetchRatings();
  }, [animeId, currentUser]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const animeRef = doc(db, 'animeRatings', animeId.toString());
      const animeDoc = await getDoc(animeRef);
      
      if (animeDoc.exists()) {
        const data = animeDoc.data();
        setAverageRating(data.averageRating || 0);
        setTotalRatings(data.totalRatings || 0);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
      
      if (currentUser) {
        const userRatingRef = doc(db, `animeRatings/${animeId}/ratings`, currentUser.uid);
        const userRatingDoc = await getDoc(userRatingRef);
        if (userRatingDoc.exists()) {
          setUserRating(userRatingDoc.data().rating);
        } else {
          setUserRating(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleRate = async (rating: number) => {
    if (!currentUser) {
      addToast(t('login_required'), 'error');
      return;
    }
    
    // Optimistic UI update
    const oldRating = userRating;
    setUserRating(rating);
    
    try {
       const userRatingRef = doc(db, `animeRatings/${animeId}/ratings`, currentUser.uid);
       const animeRef = doc(db, 'animeRatings', animeId.toString());
       
       await setDoc(userRatingRef, { rating });
       
       // Calculate new average
       const ratingsSnapshot = await getDocs(collection(db, `animeRatings/${animeId}/ratings`));
       let sum = 0;
       let count = 0;
       ratingsSnapshot.forEach((doc) => {
         sum += doc.data().rating;
         count += 1;
       });
       
       const avg = count > 0 ? (sum / count) : 0;
       setAverageRating(avg);
       setTotalRatings(count);
       
       await setDoc(animeRef, { averageRating: avg, totalRatings: count }, { merge: true });
       addToast(t('rating_saved'), 'success');
    } catch (e) {
       console.error(e);
       setUserRating(oldRating); // Backtrack
       addToast('Error', 'error');
    }
  };

  return (
    <div className="flex items-center gap-6 bg-white p-4 border-4 border-black neo-shadow">
      <div className="flex flex-col items-center justify-center min-w-[80px]">
        <span className="font-black uppercase tracking-widest text-[10px] text-neutral-500 mb-1">{t('rating_average')}</span>
        <span className="font-black text-3xl leading-none">{loading ? '-' : averageRating.toFixed(1)}</span>
        <span className="font-bold text-[10px] text-neutral-500 uppercase tracking-widest mt-1">{totalRatings} {t('ratings')}</span>
      </div>
      <div className="w-1 h-14 bg-black/10" />
      <div className="flex flex-col justify-center">
        <span className="font-black uppercase tracking-widest text-[10px] text-neutral-500 mb-2 pl-1 block">{t('your_rating')}</span>
        <div className="flex gap-1" onMouseLeave={() => setHoveredStar(null)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoveredStar(star)}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95 p-1"
            >
              <Star
                size={32}
                strokeWidth={2.5}
                className={`transition-colors ${(hoveredStar !== null ? star <= hoveredStar : userRating !== null && star <= userRating) ? 'text-rose-500 fill-rose-500' : 'text-neutral-200'}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
