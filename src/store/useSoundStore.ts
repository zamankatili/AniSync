import { create } from 'zustand';

/**
 * Global sound-effects preference (Life Sim, reminder chime, feed chime,
 * quiz fallback).
 *
 * Persisted in localStorage so a user who mutes the game never gets a surprise
 * chime after a reload. Volume is a 0–1 multiplier applied on top of the very
 * low per-engine ceiling (see `lib/gentleAudio.ts`).
 *
 * **Default is OFF.** A first-time visitor must never hear audio they did not
 * ask for — the live feed chime fires when someone else posts, and that is
 * unsolicited. Turning sound on anywhere (feed button, Life Sim header)
 * persists the choice and unlocks every sound in the app.
 */

const STORAGE_KEY = 'anisync_sfx_settings';

interface SoundState {
  enabled: boolean;
  /** 0–1 user volume multiplier. Default is intentionally moderate. */
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  toggleEnabled: () => void;
}

const clamp01 = (value: number): number => {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
};

/**
 * localStorage'daki ham tercihi güvenli bir duruma çevirir.
 *
 * Saf fonksiyon: DOM yok, yan etki yok. Varsayılan **kapalı** — kayıt yoksa,
 * JSON bozuksa veya `enabled` alanı eksikse ses açılmaz. Yalnızca kullanıcının
 * açıkça kaydettiği `true` sesi açar.
 */
export const resolveStoredSound = (raw: string | null): { enabled: boolean; volume: number } => {
  if (!raw) return { enabled: false, volume: 0.5 };
  try {
    const parsed = JSON.parse(raw) as { enabled?: unknown; volume?: unknown } | null;
    return {
      enabled: parsed?.enabled === true,
      volume: typeof parsed?.volume === 'number' ? clamp01(parsed.volume) : 0.5,
    };
  } catch {
    return { enabled: false, volume: 0.5 };
  }
};

const loadInitial = (): { enabled: boolean; volume: number } => {
  if (typeof window === 'undefined') return resolveStoredSound(null);
  try {
    return resolveStoredSound(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // localStorage okunamıyorsa (gizli mod) varsayılan: sessiz.
    return { enabled: false, volume: 0.5 };
  }
};

const persist = (enabled: boolean, volume: number) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume }));
  } catch {
    // Private mode / storage disabled — preference simply won't persist.
  }
};

const initial = loadInitial();

export const useSoundStore = create<SoundState>((set, get) => ({
  enabled: initial.enabled,
  volume: initial.volume,
  setEnabled: (enabled) => {
    persist(enabled, get().volume);
    set({ enabled });
  },
  setVolume: (volume) => {
    const next = clamp01(volume);
    persist(get().enabled, next);
    set({ volume: next });
  },
  toggleEnabled: () => {
    const next = !get().enabled;
    persist(next, get().volume);
    set({ enabled: next });
  },
}));

/** Current 0–1 level, or 0 when sound is disabled. */
export const currentSfxLevel = (): number => {
  const { enabled, volume } = useSoundStore.getState();
  return enabled ? clamp01(volume) : 0;
};
