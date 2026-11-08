import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Günün Anketi — Firestore `polls` koleksiyonunu dinler ve
 * dakika-tindey bir rotasyonla sıradaki ankete karar verir.
 * Koleksiyon boşsa anket gizlenir (tohumlama admin panelindedir).
 */
export const useDailyPoll = () => {
  const [activePoll, setActivePoll] = useState<any>(null);

  useEffect(() => {
    const pollsRef = collection(db, 'polls');
    const unsubscribe = onSnapshot(
      pollsRef,
      (snapshot) => {
        try {
          if (snapshot.empty) {
            // Anketler admin panelinden tohumlanır (normal kullanıcıların yazma izni yok)
            setActivePoll(null);
            return;
          }
          const pollsList: any[] = [];
          snapshot.forEach((doc) => pollsList.push({ id: doc.id, ...doc.data() }));

          const minuteOfHour = Math.floor(new Date().getTime() / 1000 / 60);
          const current = pollsList.find((p) => p.pollIndex === minuteOfHour % pollsList.length);
          setActivePoll(current ?? pollsList[0]);
        } catch (err) {
          console.warn('Polls sync warning:', err);
        }
      },
      (error) => {
        console.warn('Polls listener permission or network error (using local fallback):', error);
      }
    );
    return () => unsubscribe();
  }, []);

  return activePoll;
};
