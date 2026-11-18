import { create } from 'zustand';

/**
 * Mevsimsel ambiyans tercihi.
 *
 * Üç mod var:
 * - `off`   : hiçbir katman yok.
 * - `calm`  : yalnızca sabit mevsim tonu (hareket yok, CPU ~0). **Varsayılan.**
 * - `full`  : sabit ton + yavaş parçacıklar.
 *
 * Neden varsayılan `calm`? İlk ziyaretçiye ne ses ne de hareket dayatmak
 * istemiyoruz. `calm` tek bir sabit degrade katmanıdır; pil ve dikkat maliyeti
 * yoktur ama mevsim hissi görünür kalır. `full` açık bir tercih gerektirir.
 *
 * Ses bu depoda tutulmaz: tüm uygulama tek bir genel ses tercihine
 * (`useSoundStore`) uyar. Böylece "ambiyansı kapatmadan sesi kapat" gibi ikinci
 * bir anahtar doğmaz ve geri bildirim çanı, hatırlatıcı, Life Sim ve ambiyans
 * aynı sözleşmeyi paylaşır.
 *
 * Yarımküre de kullanıcı tercihidir; konum izni **istenmez**.
 */

const STORAGE_KEY = 'anisync_ambience';

export const AMBIENCE_MODES = ['off', 'calm', 'full'] as const;
export type AmbienceMode = (typeof AMBIENCE_MODES)[number];

export const AMBIENCE_HEMISPHERES = ['north', 'south'] as const;
export type AmbienceHemisphere = (typeof AMBIENCE_HEMISPHERES)[number];

export interface AmbiencePreference {
  mode: AmbienceMode;
  hemisphere: AmbienceHemisphere;
}

export const DEFAULT_AMBIENCE: AmbiencePreference = {
  mode: 'calm',
  hemisphere: 'north',
};

const isMode = (value: unknown): value is AmbienceMode =>
  typeof value === 'string' && (AMBIENCE_MODES as readonly string[]).includes(value);

const isHemisphere = (value: unknown): value is AmbienceHemisphere =>
  typeof value === 'string' && (AMBIENCE_HEMISPHERES as readonly string[]).includes(value);

/**
 * localStorage'daki ham tercihi güvenli bir duruma çevirir.
 *
 * Saf fonksiyon. Bozuk JSON, bilinmeyen mod veya eksik alan → `calm`/`north`.
 * Bilinmeyen bir değeri asla `full`'a yükseltmeyiz: fail-closed, hareketin
 * kapalı kalması yönündedir.
 */
export const resolveStoredAmbience = (raw: string | null): AmbiencePreference => {
  if (!raw) return { ...DEFAULT_AMBIENCE };

  try {
    const parsed = JSON.parse(raw) as { mode?: unknown; hemisphere?: unknown } | null;
    return {
      mode: isMode(parsed?.mode) ? parsed.mode : DEFAULT_AMBIENCE.mode,
      hemisphere: isHemisphere(parsed?.hemisphere)
        ? parsed.hemisphere
        : DEFAULT_AMBIENCE.hemisphere,
    };
  } catch {
    return { ...DEFAULT_AMBIENCE };
  }
};

interface AmbienceState extends AmbiencePreference {
  setMode: (mode: AmbienceMode) => void;
  setHemisphere: (hemisphere: AmbienceHemisphere) => void;
}

const loadInitial = (): AmbiencePreference => {
  if (typeof window === 'undefined') return { ...DEFAULT_AMBIENCE };
  try {
    return resolveStoredAmbience(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Gizli mod / depolama kapalı: varsayılan sakin mod.
    return { ...DEFAULT_AMBIENCE };
  }
};

const persist = (preference: AmbiencePreference): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch {
    // Tercih kalıcı olmaz; oturum boyunca geçerli kalır.
  }
};

const initial = loadInitial();

export const useAmbienceStore = create<AmbienceState>((set, get) => ({
  mode: initial.mode,
  hemisphere: initial.hemisphere,
  setMode: (mode) => {
    if (!isMode(mode)) return;
    persist({ mode, hemisphere: get().hemisphere });
    set({ mode });
  },
  setHemisphere: (hemisphere) => {
    if (!isHemisphere(hemisphere)) return;
    persist({ mode: get().mode, hemisphere });
    set({ hemisphere });
  },
}));
