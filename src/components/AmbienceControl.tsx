import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bird,
  Check,
  ChevronDown,
  Clock,
  Flower2,
  Leaf,
  Moon,
  Snowflake,
  Sun,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useAmbienceStore, type AmbienceMode } from '../store/useAmbienceStore';
import { useSoundStore } from '../store/useSoundStore';
import {
  getAmbienceProfile,
  isAmbiencePausedRoute,
  phaseLabelKey,
  seasonLabelKey,
  type AmbienceProfile,
  type AmbientAccent,
  type Season,
} from '../lib/ambience/season';
import { accentCadenceMinutes } from '../lib/ambience/schedule';
import { useMediaQuery } from '../lib/useMediaQuery';
import { getSoundContext, playUiTap } from '../lib/gentleAudio';
import { stopAmbientAudio } from '../lib/ambience/audio';

/**
 * Mevsimsel ambiyans kontrolü.
 *
 * İki yerleşim:
 * - `popover`: masaüstü üst çubukta ikon düğmesi + panel.
 * - `inline` : mobil "Daha fazla" sayfasında doğrudan panel.
 *
 * Dürüstlük notları panelde açıkça yazar: konum izni yok, hava durumu yok,
 * canlı veri yok, ses genel ses tercihine bağlı ve tamamen sentezlenmiş.
 */

type Translate = (key: string, options?: Record<string, unknown>) => string;

const SEASON_ICON: Record<Season, typeof Flower2> = {
  spring: Flower2,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
};

const ACCENT_ICON: Record<AmbientAccent, typeof Bird> = {
  birds: Bird,
  crickets: Moon,
  wind: Wind,
  hush: Snowflake,
};

const accentLabelKey = (accent: AmbientAccent): string => `ambience_accent_${accent}`;

const MODE_ORDER: AmbienceMode[] = ['off', 'calm', 'full'];

interface PanelProps {
  t: Translate;
  profile: AmbienceProfile;
  mode: AmbienceMode;
  soundEnabled: boolean;
  reducedMotion: boolean;
  paused: boolean;
  onModeChange: (mode: AmbienceMode) => void;
  onHemisphereChange: (hemisphere: 'north' | 'south') => void;
  onToggleSound: () => void;
}

const AmbiencePanel: React.FC<PanelProps> = ({
  t,
  profile,
  mode,
  soundEnabled,
  reducedMotion,
  paused,
  onModeChange,
  onHemisphereChange,
  onToggleSound,
}) => {
  const SeasonIcon = SEASON_ICON[profile.season];
  const AccentIcon = ACCENT_ICON[profile.accent];
  const accentColor = profile.palette.accent;
  const modeDescription =
    mode === 'off'
      ? t('ambience_mode_off_desc')
      : mode === 'calm'
        ? t('ambience_mode_calm_desc')
        : t('ambience_mode_full_desc');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2 border-b-2 border-white/15 pb-2">
        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
          <SeasonIcon size={16} style={{ color: accentColor }} aria-hidden="true" />
          <span>{t('ambience_title')}</span>
        </h3>
        <span className="shrink-0 border border-white/25 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-neutral-400">
          {t('ambience_badge')}
        </span>
      </div>

      <p className="text-[10px] font-bold uppercase leading-snug text-neutral-400">
        {t('ambience_subtitle')}
      </p>

      <div className="flex items-center gap-2.5 border-2 border-white/15 bg-neutral-950 p-2">
        <span
          className="h-9 w-9 shrink-0 border-2 border-white/25"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase leading-tight text-white">
            {t('ambience_now', {
              season: t(seasonLabelKey(profile.season)),
              phase: t(phaseLabelKey(profile.phase)),
            })}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[9px] font-bold uppercase text-neutral-500">
            <AccentIcon size={11} aria-hidden="true" />
            <span className="truncate">{t(accentLabelKey(profile.accent))}</span>
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
          {t('ambience_mode_label')}
        </p>
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={t('ambience_mode_label')}>
          {MODE_ORDER.map((candidate) => {
            const selected = candidate === mode;
            return (
              <button
                key={candidate}
                type="button"
                aria-pressed={selected}
                onClick={() => onModeChange(candidate)}
                className={cn(
                  'flex min-h-[44px] items-center justify-center gap-1 border-2 px-1.5 py-1 text-[10px] font-black uppercase tracking-wide transition-colors',
                  selected
                    ? 'border-white bg-white text-black'
                    : 'border-white/20 text-neutral-300 hover:border-white hover:text-white',
                )}
              >
                {selected && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                <span className="truncate">{t(`ambience_mode_${candidate}`)}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[9px] font-bold uppercase leading-snug text-neutral-500">
          {modeDescription}
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
          {t('ambience_hemisphere')}
        </p>
        <div
          className="grid grid-cols-2 gap-1.5"
          role="group"
          aria-label={t('ambience_hemisphere')}
        >
          {(['north', 'south'] as const).map((candidate) => {
            const selected = candidate === profile.hemisphere;
            return (
              <button
                key={candidate}
                type="button"
                aria-pressed={selected}
                onClick={() => onHemisphereChange(candidate)}
                className={cn(
                  'min-h-[44px] border-2 px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-colors',
                  selected
                    ? 'border-white bg-white text-black'
                    : 'border-white/20 text-neutral-300 hover:border-white hover:text-white',
                )}
              >
                {t(`ambience_hemisphere_${candidate}`)}
              </button>
            );
          })}
        </div>
        <p className="text-[9px] font-bold uppercase leading-snug text-neutral-500">
          {t('ambience_hemisphere_note')}
        </p>
      </div>

      <div className="space-y-1.5 border-2 border-white/15 p-2">
        <div className="flex items-start gap-2">
          {soundEnabled ? (
            <Volume2 size={15} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
          ) : (
            <VolumeX size={15} className="mt-0.5 shrink-0 text-neutral-500" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase text-white">
              {soundEnabled ? t('ambience_sound_on') : t('ambience_sound_off')}
            </p>
            <p className="mt-0.5 text-[9px] font-bold uppercase leading-snug text-neutral-500">
              {t('ambience_sound_note')}
            </p>
          </div>
        </div>
        {!soundEnabled && (
          <button
            type="button"
            onClick={onToggleSound}
            className="min-h-[44px] w-full border-2 border-amber-400 bg-amber-400 px-2 text-[10px] font-black uppercase tracking-wide text-black transition-colors hover:bg-amber-300"
          >
            {t('ambience_sound_enable')}
          </button>
        )}
        {soundEnabled && (
          <button
            type="button"
            onClick={onToggleSound}
            className="min-h-[44px] w-full border-2 border-white/25 px-2 text-[10px] font-black uppercase tracking-wide text-neutral-200 transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            {t('ambience_sound_disable')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-neutral-500">
        <Clock size={11} aria-hidden="true" />
        <span>
          {t('ambience_cadence_label')} ·{' '}
          {t('ambience_cadence_value', {
            minutes: accentCadenceMinutes(profile.accent),
          })}
        </span>
      </div>

      <div className="space-y-1">
        {reducedMotion && (
          <p className="border-l-2 border-amber-400 pl-2 text-[9px] font-bold uppercase leading-snug text-amber-200/90">
            {t('ambience_reduced_motion')}
          </p>
        )}
        {paused && (
          <p className="border-l-2 border-rose-400 pl-2 text-[9px] font-bold uppercase leading-snug text-rose-200/90">
            {t('ambience_paused_route')}
          </p>
        )}
        <p className="border-l-2 border-white/20 pl-2 text-[9px] font-bold uppercase leading-snug text-neutral-500">
          {t('ambience_decorative_note')}
        </p>
      </div>
    </div>
  );
};

interface AmbienceControlProps {
  variant?: 'popover' | 'inline';
}

export const AmbienceControl: React.FC<AmbienceControlProps> = ({ variant = 'popover' }) => {
  const { t } = useAppTranslation();
  const location = useLocation();
  const mode = useAmbienceStore((state) => state.mode);
  const hemisphere = useAmbienceStore((state) => state.hemisphere);
  const setMode = useAmbienceStore((state) => state.setMode);
  const setHemisphere = useAmbienceStore((state) => state.setHemisphere);
  const soundEnabled = useSoundStore((state) => state.enabled);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [openPath, setOpenPath] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Popover, açıldığı rotaya bağlıdır: rota değişince kendiliğinden kapanır
  // (effect içinde setState gerekmez).
  const open = openPath === location.pathname;

  const profile = useMemo(() => getAmbienceProfile(now, hemisphere), [now, hemisphere]);
  const paused = isAmbiencePausedRoute(location.pathname);

  // Panel açıkken mevsim/faz bilgisi bayatlamasın.
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (variant !== 'popover' || !open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpenPath(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPath(null);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [variant, open]);

  const handleModeChange = (next: AmbienceMode) => {
    setMode(next);
    playUiTap();
  };

  const handleHemisphereChange = (next: 'north' | 'south') => {
    setHemisphere(next);
    playUiTap();
  };

  const handleToggleSound = () => {
    const current = useSoundStore.getState().enabled;
    useSoundStore.getState().setEnabled(!current);
    if (current) {
      stopAmbientAudio();
      return;
    }
    // Açma bir kullanıcı işaretidir: context'i burada başlat ve tek bir nazik
    // onay tonu çal.
    getSoundContext();
    playUiTap();
  };

  const panel = (
    <AmbiencePanel
      t={t}
      profile={profile}
      mode={mode}
      soundEnabled={soundEnabled}
      reducedMotion={reducedMotion}
      paused={paused}
      onModeChange={handleModeChange}
      onHemisphereChange={handleHemisphereChange}
      onToggleSound={handleToggleSound}
    />
  );

  if (variant === 'inline') {
    return (
      <section
        aria-label={t('ambience_title')}
        className="border-2 border-white/15 bg-black p-3"
      >
        {panel}
      </section>
    );
  }

  const TriggerIcon = SEASON_ICON[profile.season];

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpenPath(open ? null : location.pathname)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('ambience_open')}
        title={t('ambience_title')}
        className="touch-target h-10 gap-1.5 border-2 bg-black px-2.5 transition-colors hover:bg-neutral-900 md:h-12"
        style={{ borderColor: profile.palette.accent }}
      >
        <TriggerIcon size={18} strokeWidth={2.5} aria-hidden="true" />
        <span className="hidden text-[10px] font-black uppercase text-white xl:inline">
          {t(seasonLabelKey(profile.season))}
        </span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={cn('text-neutral-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('ambience_title')}
          className="absolute right-0 top-full z-[9999] mt-2 w-[21rem] max-w-[calc(100vw-1rem)] border-4 border-white bg-black p-3.5 shadow-2xl neo-shadow-white"
          style={{ borderColor: profile.palette.accent }}
        >
          {panel}
        </div>
      )}
    </div>
  );
};
