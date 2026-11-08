import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppStore } from '../context/AppStore';
import { useWeeklyChallengeStore } from '../store/useWeeklyChallengeStore';
import { DailyPollModal } from './DailyPollModal';
import { DailyChallengeModal } from './DailyChallengeModal';
import { TasteProfileSurveyModal } from './TasteProfileSurveyModal';
import { useLocation } from 'react-router-dom';

/**
 * Günlük Modal Orkestratörü — günde 1 kez, sayfaya yerleştikten ~4 saniye sonra
 * sırayla açık olmayan günlük içeriği otomatik açar:
 *   1) Günün Anketi (bugün oy verilmemişse)
 *   2) Günün Meydan Okuması (bugünkü gün tamamlanmadıysa)
 *   3) Otaku DNA anketi (hiç yapılmadıysa)
 * localStorage'da `anisync_daily_modal_shown_YYYY-MM-DD` anahtarı yazılır;
 * manuel butonlarla istendiğinde her zaman açılabilir. Admin sayfasında açmaz.
 */
export const DailyModalManager = () => {
  const { activePoll, currentUser, authLoading } = useAppStore();
  const { getDayProgress, selectDay } = useWeeklyChallengeStore();
  const location = useLocation();

  const [which, setWhich] = useState<'none' | 'poll' | 'challenge' | 'taste'>('none');

  useEffect(() => {
    if (authLoading) return;
    // Yönetim ve tam-ekran oyun ekranlarını rahatsız etme
    const path = location.pathname;
    if (
      path.startsWith('/admin') ||
      path.startsWith('/anime-life-sim') ||
      path.startsWith('/music-quiz') ||
      path.startsWith('/arcade')
    ) {
      return;
    }

    const todayKey = getLocalDateKey();
    const dailyKey = `anisync_daily_modal_shown_${todayKey}`;
    if (localStorage.getItem(dailyKey)) return;

    const decide = async () => {
      // 1) Günün Anketi
      if (activePoll && !(await hasVotedPoll(activePoll.id, currentUser?.uid))) {
        markShown(dailyKey);
        setWhich('poll');
        return;
      }
      // 2) Günün Meydan Okuması (bugünkü gün tamamlanmadıysa)
      const todayIdx = getTodayIndex();
      const progress = getDayProgress(todayIdx);
      if (!progress.isFullyDone) {
        selectDay(todayIdx); // modal bugün açılsın (persisted seçimden bağımsız)
        markShown(dailyKey);
        setWhich('challenge');
        return;
      }
      // 3) Otaku DNA (hiç yapılmadıysa)
      if (!localStorage.getItem('anisync_user_taste_dna')) {
        markShown(dailyKey);
        setWhich('taste');
      }
    };

    // Sayfa oturana ~4-5 sn ver; activePoll Firestore'dan geç gelirse effect yeniden kurulur
    const timer = window.setTimeout(() => void decide(), 4500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePoll, currentUser, authLoading, location.pathname]);

  if (which === 'poll') {
    return <DailyPollModal isOpen={true} onClose={() => setWhich('none')} />;
  }
  if (which === 'challenge') {
    return <DailyChallengeModal isOpen={true} onClose={() => setWhich('none')} />;
  }
  if (which === 'taste') {
    return <TasteProfileSurveyModal isOpen={true} onClose={() => setWhich('none')} />;
  }
  return null;
};

function getLocalDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Store'daki `getTodayIndex` ile aynı: Pazartesi=0 ... Pazar=6 */
function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function markShown(key: string) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // yoksay
  }
}

async function hasVotedPoll(pollId: string, uid?: string | null): Promise<boolean> {
  try {
    if (uid) {
      const voteRef = doc(db, `polls/${pollId}/votes/${uid}`);
      const snap = await getDoc(voteRef);
      return snap.exists();
    }
    const raw = localStorage.getItem(`anisync_daily_poll_${pollId}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.date === new Date().toLocaleDateString();
  } catch {
    return false;
  }
}
