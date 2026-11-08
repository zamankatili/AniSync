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

          // GÜNLÜK rotasyon: aynı gün içinde anket DEĞİŞMEZ (önceki dakika-bazlı
          // rotasyon "Her dakika başka anket" hatasına yol açıyordu)
          const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
          const current =
            pollsList.find((p) => p.pollIndex === daysSinceEpoch % pollsList.length) ??
            pollsList[0];
          setActivePoll(current);
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
