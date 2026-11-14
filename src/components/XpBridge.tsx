/**
 * XpBridge — React ağacına görünmeden takılan XP orkestratörü.
 *
 * 1. Kapsamı seçer: `uid:{uid}` veya misafir (`guest`).
 * 2. Giriş yapıldıysa misafir defterini hesaba taşır (bir kez).
 * 3. Her gün (TR takvimi) günlük giriş XP'si + seri bonusu verir.
 * 4. `users/{uid}` üzerindeki uzak XP değerini yeni uid'de bir kez benimser,
 *    ardından yerel defter değiştikçe uzak değeri (debounce) günceller.
 *
 * Toast'lar KVKK/oyun akışıyla tutarlıdır; oyun toast'larına ek, sessiz
 * XP bildiriyor.
 */

import { useEffect, useRef } from 'react';
import { getDailyDateKey } from '../lib/dailyDate';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useToastStore } from '../store/useToastStore';
import { GUEST_SCOPE, useXpStore, selectActiveSnapshot } from '../store/useXpStore';
import { fetchRemoteXp, pushRemoteXp } from '../lib/xpSync';

export const XpBridge: React.FC = () => {
  const { t } = useAppTranslation();
  const { addToast } = useToastStore();
  const { currentUser, authLoading } = useAppStore();
  const uid = currentUser?.uid ?? null;

  const setActiveScope = useXpStore((state) => state.setActiveScope);
  const visit = useXpStore((state) => state.visit);
  const mergeGuestInto = useXpStore((state) => state.mergeGuestInto);
  const applyRemote = useXpStore((state) => state.applyRemote);
  const activeSnapshot = useXpStore(selectActiveSnapshot);

  const appliedRemoteForRef = useRef<string | null>(null);
  const lastPushRef = useRef<{ scope: string; totalXp: number } | null>(null);
  const pendingPushRef = useRef<number | null>(null);

  // 1) Kapsamı auth durumuna göre ayarla
  useEffect(() => {
    if (authLoading) return;
    setActiveScope(uid ? `uid:${uid}` : GUEST_SCOPE);
  }, [uid, authLoading, setActiveScope]);

  // 2) Giriş sonrası misafir defterini taşı
  useEffect(() => {
    if (authLoading || !uid) return;
    mergeGuestInto(`uid:${uid}`);
  }, [authLoading, uid, mergeGuestInto]);

  // 3) Günlük giriş + seri (kapsam/gün başına idempotent)
  const activeScope = useXpStore((state) => state.activeScope);
  useEffect(() => {
    if (authLoading) return;
    const attempt = visit(getDailyDateKey());
    if (attempt.alreadyVisited) return;
    if (attempt.loginXp > 0) {
      addToast(t('xp_daily_claim_toast', { xp: attempt.loginXp }), 'success');
    }
    if (attempt.streakBonusXp > 0) {
      addToast(
        t('xp_streak_toast', { count: attempt.streak, bonus: attempt.streakBonusXp }),
        'success',
      );
    }
    // Kapsam değişince yeniden dene: yeni hesap girişinde günü tekrar işaretlemeli.
  }, [authLoading, activeScope, visit, addToast, t]);

  // 4a) Uzak XP'yi yeni uid'de bir kez benimse
  useEffect(() => {
    if (authLoading || !uid) return;
    const scope = `uid:${uid}`;
    if (appliedRemoteForRef.current === scope) return;
    appliedRemoteForRef.current = scope;

    let cancelled = false;
    void (async () => {
      const remote = await fetchRemoteXp(uid);
      if (cancelled || !remote) return;
      applyRemote(scope, remote);
      lastPushRef.current = { scope, totalXp: Math.max(remote.totalXp, useXpStore.getState().scopes[scope]?.totalXp ?? 0) };
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, uid, applyRemote]);

  // 4b) Yerel defter uzaktan farklıysa debounce ile yaz
  useEffect(() => {
    if (authLoading || !uid) return;
    const scope = `uid:${uid}`;
    const { totalXp, streak, bestStreak } = activeSnapshot;

    const last = lastPushRef.current;
    if (last && last.scope === scope && last.totalXp >= totalXp) return;

    if (pendingPushRef.current !== null) {
      window.clearTimeout(pendingPushRef.current);
    }
    pendingPushRef.current = window.setTimeout(() => {
      pendingPushRef.current = null;
      void pushRemoteXp(uid, { totalXp, streak, bestStreak }).then((ok) => {
        if (ok) lastPushRef.current = { scope, totalXp };
      });
    }, 1500);

    return () => {
      if (pendingPushRef.current !== null) {
        window.clearTimeout(pendingPushRef.current);
        pendingPushRef.current = null;
      }
    };
  }, [authLoading, uid, activeSnapshot]);

  // 4c) Referans: kullanıcı görmez, ama import ölü-kod elimine olmasın.
  return null;
};

export default XpBridge;
