/**
 * xpTotal Firestore senkronu.
 *
 * `users/{uid}.xpTotal|xpStreak|xpBestStreak` alanları istemciden yazılır
 * (rules: sahip-güncellemesi). Bu yüzden liderlik tablosu "takılgan" değildir:
 * hile yapmak mümkündür — kısıtlama ancak Admin SDK tabanlı sunucu yazmasıyla
 * sağlanır (bkz. docs/observability.md / docs/xp.md). Yine de değer gizli
 * değildir ve fazla bonus vermez; yalnızca kesitsel bir sıralama sinyalidir.
 *
 * Senkron stratejisi: yerel defter her zaman kazanır; uzak değer SADECE
 * toplamdan büyükse benimsenir (yeni cihazda geçiş).
 */

import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface RemoteXp {
  totalXp: number;
  streak: number;
  bestStreak: number;
}

export async function fetchRemoteXp(uid: string): Promise<RemoteXp | null> {
  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (!snapshot.exists()) return null;
    const data = snapshot.data() as Record<string, unknown>;
    const totalXp = Math.max(0, Math.floor(Number(data.xpTotal) || 0));
    const streak = Math.max(0, Math.floor(Number(data.xpStreak) || 0));
    const bestStreak = Math.max(streak, Math.floor(Number(data.xpBestStreak) || 0));
    return { totalXp, streak, bestStreak };
  } catch (error) {
    console.warn('[xpSync] uzak XP okunamadı', error);
    return null;
  }
}

export async function pushRemoteXp(uid: string, snapshot: RemoteXp): Promise<boolean> {
  try {
    // merge: true — kullanıcı belgesi yoksa alanları oluşturur, diğer alanlara dokunmaz.
    await setDoc(doc(db, 'users', uid), {
      xpTotal: Math.max(0, Math.floor(snapshot.totalXp)),
      xpStreak: Math.max(0, Math.floor(snapshot.streak)),
      xpBestStreak: Math.max(0, Math.floor(snapshot.bestStreak)),
      xpUpdatedAt: Date.now(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('[xpSync] uzak XP yazılamadı', error);
    return false;
  }
}

export interface LeaderboardRow {
  uid: string;
  name: string;
  avatar?: string;
  xpTotal: number;
}

/** En yüksek xpTotal'e sahip kullanıcılar. Alanı olmayan kullanıcılar döner listede yer almaz. */
export async function fetchXpLeaderboard(count = 10): Promise<LeaderboardRow[]> {
  try {
    const leaderboardQuery = query(
      collection(db, 'users'),
      orderBy('xpTotal', 'desc'),
      limit(Math.max(1, Math.min(50, count))),
    );
    const snapshot = await getDocs(leaderboardQuery);
    const rows: LeaderboardRow[] = [];
    snapshot.forEach((document) => {
      const data = document.data() as Record<string, unknown>;
      const xpTotal = Math.max(0, Math.floor(Number(data.xpTotal) || 0));
      if (xpTotal <= 0) return;
      const name =
        typeof data.displayName === 'string' && data.displayName.trim()
          ? String(data.displayName).slice(0, 80)
          : typeof data.name === 'string' && data.name.trim()
            ? String(data.name).slice(0, 80)
            : 'Otaku';
      rows.push({
        uid: document.id,
        name,
        avatar: typeof data.photoURL === 'string' ? data.photoURL : undefined,
        xpTotal,
      });
    });
    return rows;
  } catch (error) {
    console.warn('[xpSync] liderlik tablosu okunamadı', error);
    return [];
  }
}
