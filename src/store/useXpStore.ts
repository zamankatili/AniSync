/**
 * XP defteri — scope'lu (misafir/uid) tek-key localStorage kalıcılığıyla.
 *
 * - `guest` kapsamı kimliksiz kullanımı tutar; giriş yapılınca `uid:{uid}`
 *   kapsamına `mergeGuestInto` ile bir kez taşınır.
 * - `visit(day)` günlük giriş + seri/kilometre bonusunu atomik uygular.
 * - `award(request)` idempotency/kapasiteleri uygular.
 * - Firestore senkronu `lib/xpSync`'te; bu store saf istemci defteridir.
 */

import { create } from 'zustand';
import {
  EMPTY_XP_SNAPSHOT,
  applyDailyVisit,
  awardXp,
  mergeSnapshots,
  sanitizeSnapshot,
  type AwardRequest,
  type AwardResult,
  type DailyVisitResult,
  type XpSnapshot,
} from '../lib/xp';

export const XP_STORAGE_KEY = 'anisync_xp_v1';
const GUEST_SCOPE = 'guest';

interface PersistedShape {
  version: number;
  scopes: Record<string, XpSnapshot>;
}

function readPersisted(): Record<string, XpSnapshot> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(XP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    if (!parsed || typeof parsed !== 'object' || !parsed.scopes || typeof parsed.scopes !== 'object') {
      return {};
    }
    const scopes: Record<string, XpSnapshot> = {};
    for (const [scope, snapshot] of Object.entries(parsed.scopes)) {
      if (typeof scope !== 'string' || scope.length === 0 || scope.length > 128) continue;
      scopes[scope] = sanitizeSnapshot(snapshot);
    }
    return scopes;
  } catch {
    return {};
  }
}

function writePersisted(scopes: Record<string, XpSnapshot>): void {
  try {
    const payload: PersistedShape = { version: EMPTY_XP_SNAPSHOT.version, scopes };
    localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* depolama kapalıysa defter oturumluk çalışır */
  }
}

export interface XpStoreState {
  scopes: Record<string, XpSnapshot>;
  activeScope: string;
  setActiveScope: (scope: string) => void;
  visit: (day: string) => DailyVisitResult;
  award: (request: Omit<AwardRequest, 'day'> & { day?: string }) => AwardResult;
  /** Misafir kaydını hesaba taşır (giriş sonrası bir kez). */
  mergeGuestInto: (scope: string) => void;
  /** Uzak (Firestore) toplamı, yerelden büyükse benimser. */
  applyRemote: (scope: string, remote: { totalXp: number; streak: number; bestStreak: number }) => void;
}

const initialScopes = readPersisted();

export const useXpStore = create<XpStoreState>()((set, get) => ({
  scopes: initialScopes,
  activeScope: GUEST_SCOPE,

  setActiveScope: (scope) => {
    if (typeof scope !== 'string' || scope.length === 0 || scope.length > 128) return;
    if (scope === get().activeScope) return;
    set({ activeScope: scope });
  },

  visit: (day) => {
    const scope = get().activeScope;
    const current = get().scopes[scope] ?? EMPTY_XP_SNAPSHOT;
    const result = applyDailyVisit(current, day);
    if (result.snapshot === current && result.alreadyVisited) return result;

    set((state) => {
      const scopes = { ...state.scopes, [scope]: result.snapshot };
      writePersisted(scopes);
      return { scopes };
    });
    return result;
  },

  award: (request) => {
    const scope = get().activeScope;
    const current = get().scopes[scope] ?? EMPTY_XP_SNAPSHOT;
    const day = request.day ?? new Date().toISOString().slice(0, 10);
    const result = awardXp(current, { ...request, day });
    if (result.snapshot === current && result.awarded === 0) return result;

    set((state) => {
      const scopes = { ...state.scopes, [scope]: result.snapshot };
      writePersisted(scopes);
      return { scopes };
    });
    return result;
  },

  mergeGuestInto: (scope) => {
    if (scope === GUEST_SCOPE) return;
    const state = get();
    const account = state.scopes[scope] ?? EMPTY_XP_SNAPSHOT;
    const guest = state.scopes[GUEST_SCOPE] ?? EMPTY_XP_SNAPSHOT;
    if (guest.entries.length === 0) return;

    const merged = mergeSnapshots(account, guest);
    set((current) => {
      const scopes = {
        ...current.scopes,
        [scope]: merged,
        // Misafir XP'si hesaba taşındı; iki kez saymasın.
        [GUEST_SCOPE]: { ...EMPTY_XP_SNAPSHOT },
      };
      writePersisted(scopes);
      return { scopes };
    });
  },

  applyRemote: (scope, remote) => {
    const total = Math.max(0, Math.floor(Number(remote.totalXp) || 0));
    if (total <= 0) return;
    const current = get().scopes[scope] ?? EMPTY_XP_SNAPSHOT;
    if (total <= current.totalXp) return;

    const remoteStreak = Math.max(0, Math.floor(Number(remote.streak) || 0));
    const remoteBest = Math.max(remoteStreak, Math.floor(Number(remote.bestStreak) || 0));
    const next: XpSnapshot = {
      ...current,
      totalXp: total,
      streak: Math.max(current.streak, remoteStreak),
      bestStreak: Math.max(current.bestStreak, remoteBest, current.streak),
      updatedAt: Date.now(),
    };
    set((state) => {
      const scopes = { ...state.scopes, [scope]: next };
      writePersisted(scopes);
      return { scopes };
    });
  },
}));

/** Aktif kapsamın defterini seçer. */
export const selectActiveSnapshot = (state: XpStoreState): XpSnapshot =>
  state.scopes[state.activeScope] ?? EMPTY_XP_SNAPSHOT;

export { GUEST_SCOPE };
