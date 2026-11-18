import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getAmbienceProfile,
  isAmbiencePausedRoute,
  type AmbienceProfile,
} from '../lib/ambience/season';
import {
  advanceAccentClock,
  createAccentClock,
  msUntilAccent,
} from '../lib/ambience/schedule';
import { playAmbientAccent, stopAmbientAudio } from '../lib/ambience/audio';
import { useAmbienceStore } from '../store/useAmbienceStore';
import { useSoundStore } from '../store/useSoundStore';
import { useMediaQuery } from '../lib/useMediaQuery';

export interface SeasonalAmbienceState {
  profile: AmbienceProfile;
  paused: boolean;
  reducedMotion: boolean;
  /** Parçacık tuvali çizilmeli mi? */
  particlesActive: boolean;
  /** Doğa vurguları çalınabilir mi? (genel ses + kullanıcı etkileşimi) */
  audioActive: boolean;
  /** Her vurguda artar; tuval bunu kısa bir "esinti" darbesine çevirir. */
  gust: number;
}

const prefersReducedMotionQuery = '(prefers-reduced-motion: reduce)';

const readVisibility = (): boolean =>
  typeof document === 'undefined' ? true : document.visibilityState !== 'hidden';

const readUserActivation = (): boolean => {
  if (activationSeen) return true;
  if (typeof navigator === 'undefined') return false;
  const activation = (
    navigator as Navigator & { userActivation?: { hasBeenActive?: boolean } }
  ).userActivation;
  return activation?.hasBeenActive === true;
};

/**
 * İlk kullanıcı işaretini abone olarak izler. `navigator.userActivation`
 * desteklenmese bile (Firefox/Safari) ilk pointer/key olayı sesi açar; böylece
 * ambiyans sesi tarayıcıya göre sessizce kaybolmaz.
 */
let activationSeen = false;

const subscribeUserActivation = (onChange: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const mark = () => {
    activationSeen = true;
    onChange();
  };
  window.addEventListener('pointerdown', mark, { passive: true });
  window.addEventListener('keydown', mark);
  return () => {
    window.removeEventListener('pointerdown', mark);
    window.removeEventListener('keydown', mark);
  };
};

/**
 * Mevsimsel ambiyansın tek orkestratörü.
 *
 * Sorumluluklar:
 * - Dakikada bir mevsim/faz profilini tazelemek (yerel saat; ağ yok).
 * - Sekme görünür değilken ve duraklatılan rotalarda **her şeyi** durdurmak.
 * - Parçacık ve ses için tek bir vurgu saati işletmek (çift ses olmasın).
 * - Genel ses tercihi kapalıysa hiç ses çalmamak; kullanıcı etkileşimi
 *   olmadan AudioContext açmamak.
 *
 * `prefers-reduced-motion` yalnızca parçacıkları kapatır; ses bir hareket
 * değildir ve zaten genel ses tercihine bağlıdır.
 */
export const useSeasonalAmbience = (): SeasonalAmbienceState => {
  const location = useLocation();
  const mode = useAmbienceStore((state) => state.mode);
  const hemisphere = useAmbienceStore((state) => state.hemisphere);
  const soundEnabled = useSoundStore((state) => state.enabled);

  const reducedMotion = useMediaQuery(prefersReducedMotionQuery);
  const [visible, setVisible] = useState(readVisibility);
  const audioUnlocked = useSyncExternalStore(
    subscribeUserActivation,
    readUserActivation,
    () => false,
  );
  const [now, setNow] = useState(() => new Date());
  const [gust, setGust] = useState(0);

  // Profil dakikada bir tazelenir. Sekmeye geri dönüldüğünde de hemen
  // güncellenir; aksi hâlde saatler sonra eski faz (örn. gece) görünebilirdi.
  useEffect(() => {
    const tick = () => setNow(new Date());
    const interval = window.setInterval(tick, 60_000);

    const onVisible = () => {
      setVisible(readVisibility());
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Genel ses sonradan açıldıysa kullanıcı etkileşimini bekle. İlk işaretleme
  // veya tuş basımı AudioContext'i açmaya yeter; bu izleme yukarıdaki
  // `useSyncExternalStore` aboneliğinde yapılır.

  const profile = getAmbienceProfile(now, hemisphere);
  const paused = isAmbiencePausedRoute(location.pathname);
  const particlesActive = mode === 'full' && !reducedMotion && !paused && visible;
  const audioActive = mode !== 'off' && !paused && visible && soundEnabled && audioUnlocked;

  const accent = profile.accent;

  useEffect(() => {
    // Ne parçacık ne ses tüketecekse saat hiç kurulmaz: boşta kalan zamanlayıcı
    // yok. `calm` + ses kapalı, en yaygın durumdur ve sıfır maliyetlidir.
    if (!particlesActive && !audioActive) return;

    let clock = createAccentClock(accent, Date.now());
    let timer = 0;

    const schedule = () => {
      timer = window.setTimeout(() => {
        const firedAt = Date.now();

        // Zamanlayıcı uyandığında koşullar değişmiş olabilir (rota, sekme,
        // ses). Ses için son kontrolü burada yapıyoruz.
        if (!document.hidden && useSoundStore.getState().enabled) {
          playAmbientAccent(accent);
        }
        setGust((value) => value + 1);

        clock = advanceAccentClock(clock, accent, firedAt);
        schedule();
      }, Math.max(5_000, msUntilAccent(clock, Date.now())));
    };

    schedule();

    return () => {
      window.clearTimeout(timer);
      stopAmbientAudio();
    };
  }, [accent, particlesActive, audioActive]);

  return {
    profile,
    paused,
    reducedMotion,
    particlesActive,
    audioActive,
    gust,
  };
};
