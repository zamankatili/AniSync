import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  filterOnlineMembers,
  getLocalDayStart,
  mapPresenceDoc,
  PRESENCE_HEARTBEAT_MS,
  PRESENCE_QUERY_LIMIT,
  PRESENCE_WINDOW_MS,
  type OnlineMember,
} from '../lib/presence';

/**
 * Giriş yapmış kullanıcının `users/{uid}.lastSeen` alanını tazeler.
 * Yalnızca sekme görünürken ve çevrimiçiyken yazar; misafirler hiç yazmaz.
 */
export function usePresenceHeartbeat(uid: string | null | undefined): void {
  useEffect(() => {
    if (!uid) return;

    let cancelled = false;
    let lastWriteAt = 0;

    const write = (force: boolean) => {
      if (cancelled) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      if (auth.currentUser?.uid !== uid) return;

      const now = Date.now();
      if (!force && now - lastWriteAt < PRESENCE_HEARTBEAT_MS / 2) return;
      lastWriteAt = now;

      void setDoc(doc(db, `users/${uid}`), { lastSeen: serverTimestamp() }, { merge: true }).catch(() => {
        // Presence is best-effort: offline, ban or rules failures must not break the UI.
      });
    };

    write(true);
    const interval = window.setInterval(() => write(false), PRESENCE_HEARTBEAT_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') write(true);
    };
    const onOnline = () => write(true);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [uid]);
}

/**
 * Son 5 dakikada görülen üyeleri canlı dinler. Zamanlayıcı, yeni snapshot
 * gelmese bile bayat kayıtları listeden düşürür.
 */
export function useOnlineMembers(): {
  members: OnlineMember[];
  loading: boolean;
  error: string | null;
} {
  const [rawMembers, setRawMembers] = useState<OnlineMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const cutoff = Timestamp.fromMillis(Date.now() - PRESENCE_WINDOW_MS);
    const onlineQuery = query(
      collection(db, 'users'),
      where('lastSeen', '>=', cutoff),
      orderBy('lastSeen', 'desc'),
      limit(PRESENCE_QUERY_LIMIT),
    );

    const unsubscribe = onSnapshot(
      onlineQuery,
      (snapshot) => {
        if (cancelled) return;
        const stamp = Date.now();
        const next: OnlineMember[] = [];
        snapshot.forEach((snapshotDoc) => {
          const member = mapPresenceDoc(snapshotDoc.id, snapshotDoc.data(), stamp);
          if (member) next.push(member);
        });
        setRawMembers(next);
        setNow(stamp);
        setLoading(false);
        setError(null);
      },
      (listenerError) => {
        if (cancelled) return;
        console.warn('Online members listener failed:', listenerError);
        setLoading(false);
        setError(listenerError instanceof Error ? listenerError.message : 'presence-unavailable');
      },
    );

    const tick = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      cancelled = true;
      unsubscribe();
      window.clearInterval(tick);
    };
  }, []);

  const members = useMemo(() => filterOnlineMembers(rawMembers, now), [rawMembers, now]);
  return { members, loading, error };
}

/**
 * Bugün (izleyicinin yerel gününde) en az bir kez görülen girişli üyelerin
 * sayısı. Aggregation sorgusu kullanır; üye dokümanlarını indirmez.
 */
export function useActiveTodayCount(): {
  count: number;
  loading: boolean;
  error: string | null;
} {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const load = async () => {
      if (cancelled || inFlight) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        if (!cancelled) setLoading(false);
        return;
      }

      inFlight = true;
      try {
        const start = getLocalDayStart();
        const todayQuery = query(
          collection(db, 'users'),
          where('lastSeen', '>=', Timestamp.fromMillis(start)),
        );
        const snapshot = await getCountFromServer(todayQuery);
        if (!cancelled) {
          setCount(snapshot.data().count);
          setError(null);
        }
      } catch (listenerError) {
        if (!cancelled) {
          console.warn('Active-today count failed:', listenerError);
          setError(listenerError instanceof Error ? listenerError.message : 'presence-unavailable');
        }
      } finally {
        if (!cancelled) setLoading(false);
        inFlight = false;
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), 60_000);
    const onFocus = () => void load();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return { count, loading, error };
}
