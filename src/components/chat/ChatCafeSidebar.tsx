import React from 'react';
import {
  Pause,
  Play,
  Radio,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useRadioStore, RADIO_STATIONS } from '../../store/useRadioStore';
import { levelProgress } from '../../lib/level';
import { cn } from '../../lib/utils';

interface ChatCafeSidebarProps {
  myKarma: number;
  levelInfo: { level: number; title: string } | null;
}

/** Tam sayfa KÖŞE'nin sağ rayı: radyo, seviye ve ev kuralları. */
export const ChatCafeSidebar: React.FC<ChatCafeSidebarProps> = ({ myKarma, levelInfo }) => {
  const { t, currentLang } = useAppTranslation();
  const {
    isPlaying,
    togglePlay,
    currentStationIndex,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    nextStation,
    prevStation,
  } = useRadioStore();

  const station = RADIO_STATIONS[currentStationIndex];
  const progress = Math.round(levelProgress(myKarma).percent);

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-y-auto border-l-4 border-white bg-neutral-950">
      <section className="border-b-4 border-white/20 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-amber-400">
            <Radio
              size={18}
              className={cn('text-amber-400', isPlaying && 'animate-pulse')}
              strokeWidth={2.5}
            />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-400">
              {t('chat_cafe_radio')}
            </p>
            <p className="font-mono text-[8px] uppercase tracking-widest text-neutral-500">
              {t('chat_cafe_live')}
            </p>
          </div>
          <button
            type="button"
            onClick={nextStation}
            className="ml-auto flex min-h-11 min-w-11 items-center justify-center text-white hover:text-amber-400"
            aria-label={t('radio_next')}
          >
            <SkipForward size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-3 border-2 border-white/20 bg-black p-3">
          <div className="flex h-16 items-center justify-center gap-1.5 overflow-hidden" aria-hidden="true">
            {[0.4, 0.8, 1, 0.7, 0.95, 0.6, 1, 0.75, 0.9, 0.55, 0.8, 0.65, 1, 0.5].map((height, index) => (
              <span
                key={index}
                className="w-1.5 rounded-sm bg-amber-400"
                style={{
                  height: `${Math.round(height * 100)}%`,
                  transition: 'height 180ms ease-in-out',
                  animation: isPlaying
                    ? `koseEq ${0.5 + (index % 5) * 0.13}s ease-in-out ${index * 0.06}s infinite alternate`
                    : 'none',
                  opacity: isPlaying ? 1 : 0.3,
                }}
              />
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="line-clamp-2 text-sm font-black uppercase leading-tight text-white">
              {station.name}
            </p>
            <span
              className="mt-1.5 inline-block border px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest"
              style={{ backgroundColor: station.color, color: '#000', borderColor: station.color }}
            >
              {station.badge}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={prevStation}
              className="flex min-h-11 min-w-11 items-center justify-center text-white hover:text-amber-400"
              aria-label={t('radio_prev')}
            >
              <SkipBack size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-12 w-12 items-center justify-center border-4 border-amber-400 bg-black text-amber-400 transition-colors hover:bg-amber-400 hover:text-black"
              aria-label={isPlaying ? t('radio_pause') : t('radio_play')}
            >
              {isPlaying ? (
                <Pause size={20} strokeWidth={3} fill="currentColor" />
              ) : (
                <Play size={20} strokeWidth={3} fill="currentColor" className="translate-x-[2px]" />
              )}
            </button>
            <button
              type="button"
              onClick={nextStation}
              className="flex min-h-11 min-w-11 items-center justify-center text-white hover:text-amber-400"
              aria-label={t('radio_next')}
            >
              <SkipForward size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="flex min-h-11 min-w-11 items-center justify-center text-neutral-400 hover:text-white"
              aria-label={t('radio_mute')}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(event) => setVolume(parseFloat(event.target.value))}
              className="h-1 flex-1 appearance-none bg-neutral-800 accent-amber-400"
              aria-label={t('radio_volume')}
            />
          </div>
        </div>
      </section>

      <section className="border-b-4 border-white/20 p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-400">
          {t('chat_cafe_your_level')}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center border-4 border-white bg-amber-400">
            <span className="text-2xl font-black leading-none text-black">
              {levelInfo?.level ?? 0}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-black uppercase leading-none text-white">
              {levelInfo?.title ?? t('chat_cafe_guest')}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              {myKarma.toLocaleString(currentLang)} XP
            </p>
          </div>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden border border-white/30 bg-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-widest text-neutral-500">
          {t('chat_cafe_kalfa_hint')}
        </p>
      </section>

      <section className="flex-1 p-4">
        <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-500">
          <ShieldCheck size={12} />
          {t('chat_cafe_rules_title')}
        </p>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-neutral-400">
          <li className="flex gap-2"><span className="shrink-0 text-amber-400">▸</span> {t('chat_cafe_house_rule_1')}</li>
          <li className="flex gap-2"><span className="shrink-0 text-amber-400">▸</span> {t('chat_cafe_house_rule_2')}</li>
          <li className="flex gap-2"><span className="shrink-0 text-amber-400">▸</span> {t('chat_cafe_house_rule_3')}</li>
          <li className="flex gap-2"><span className="shrink-0 text-amber-400">▸</span> {t('chat_cafe_house_rule_4')}</li>
        </ul>
        <p className="mt-4 border-t border-white/10 pt-3 text-[9px] leading-relaxed text-neutral-600">
          {t('chat_scope_note')}
        </p>
      </section>

      <style>{`
        @keyframes koseEq {
          from { transform: scaleY(0.15); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </aside>
  );
};

export default ChatCafeSidebar;
