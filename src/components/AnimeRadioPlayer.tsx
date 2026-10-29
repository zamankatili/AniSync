import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRadioStore, RADIO_STATIONS } from '../store/useRadioStore';
import { 
  Radio, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, 
  ChevronDown, ChevronUp, Music, Disc3, Sparkles, Loader2, X, Trophy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const AnimeRadioPlayer: React.FC = () => {
  const navigate = useNavigate();
  const {
    isPlaying,
    isBuffering,
    volume,
    isMuted,
    currentStationIndex,
    isPlayerOpen,
    isMiniMode,
    togglePlay,
    setStation,
    nextStation,
    prevStation,
    setVolume,
    toggleMute,
    setPlayerOpen,
    toggleMiniMode,
    setIsBuffering
  } = useRadioStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentStation = RADIO_STATIONS[currentStationIndex];

  // Sync Audio playback with state
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.src = currentStation.streamUrl;
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio autoplay blocked or stream error:", error);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentStationIndex, currentStation.streamUrl]);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  return (
    <>
      {/* Invisible HTML5 Audio Tag */}
      <audio
        ref={audioRef}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={() => setIsBuffering(false)}
        preload="none"
      />

      {/* Floating Radio Widget (Bottom Left) */}
      <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 flex flex-col items-start select-none">
        <AnimatePresence>
          {isPlayerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-black border-4 border-white neo-shadow-white p-4 w-76 sm:w-88 mb-3 flex flex-col gap-3"
            >
              {/* Boombox Deck Header */}
              <div className="flex items-center justify-between border-b-2 border-white/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 border border-white bg-rose-600 flex items-center justify-center text-white">
                    <Disc3 size={16} className={cn(isPlaying && "animate-spin")} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      ANISYNC ANIME RADYOSU
                    </h4>
                    <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                      CANLI YAYIN • TELİFSİZ STREAM
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPlayerOpen(false)}
                  className="p-1 text-white hover:text-rose-500 hover:bg-white/10 transition-colors"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Station Info Display */}
              <div className="bg-neutral-950 border-2 border-white/20 p-3 flex items-center gap-3 relative overflow-hidden">
                <div className="w-12 h-12 bg-neutral-900 border border-white/30 flex items-center justify-center shrink-0">
                  <Music size={22} className={cn("text-white", isPlaying && "text-rose-500 animate-pulse")} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span 
                      className="text-[9px] font-black px-1.5 py-0.2 border border-black uppercase tracking-wider"
                      style={{ backgroundColor: currentStation.color, color: currentStation.id.includes('kpop') || currentStation.id.includes('nightwave') ? '#000' : '#fff' }}
                    >
                      {currentStation.badge}
                    </span>
                    {isPlaying && (
                      <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        CANLI
                      </span>
                    )}
                  </div>

                  <h5 className="font-black text-xs text-white uppercase truncate">
                    {currentStation.name}
                  </h5>
                  <p className="text-[10px] text-neutral-400 font-bold truncate">
                    {currentStation.genre}
                  </p>
                </div>

                {/* Equalizer Visualizer Bars */}
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-6 shrink-0">
                    <span className="w-1 bg-rose-500 animate-[bounce_0.6s_ease-in-out_infinite] h-5" />
                    <span className="w-1 bg-amber-400 animate-[bounce_0.8s_ease-in-out_infinite_0.1s] h-3" />
                    <span className="w-1 bg-cyan-400 animate-[bounce_0.5s_ease-in-out_infinite_0.2s] h-6" />
                    <span className="w-1 bg-emerald-400 animate-[bounce_0.7s_ease-in-out_infinite_0.3s] h-4" />
                  </div>
                )}
              </div>

              {/* Station Preset Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                {RADIO_STATIONS.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => setStation(idx)}
                    className={cn(
                      "px-2 py-1.5 border text-[10px] font-black uppercase tracking-wider text-left truncate transition-colors cursor-pointer",
                      currentStationIndex === idx
                        ? "bg-white text-black border-white neo-shadow-white"
                        : "bg-neutral-900 text-neutral-300 border-white/20 hover:border-white/50"
                    )}
                  >
                    CH {idx + 1}: {st.badge}
                  </button>
                ))}
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between border-t border-white/20 pt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevStation}
                    className="p-2 bg-neutral-900 text-white hover:bg-neutral-800 border border-white/20 transition-colors cursor-pointer"
                    title="Önceki İstasyon"
                  >
                    <SkipBack size={14} />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-2.5 bg-rose-600 text-white hover:bg-white hover:text-black font-black border-2 border-white transition-colors cursor-pointer"
                    title={isPlaying ? "Durdur" : "Oynat"}
                  >
                    {isBuffering ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={16} strokeWidth={3} />
                    ) : (
                      <Play size={16} strokeWidth={3} className="translate-x-[1px]" />
                    )}
                  </button>

                  <button
                    onClick={nextStation}
                    className="p-2 bg-neutral-900 text-white hover:bg-neutral-800 border border-white/20 transition-colors cursor-pointer"
                    title="Sonraki İstasyon"
                  >
                    <SkipForward size={14} />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-18 accent-rose-600 cursor-pointer h-1.5 bg-neutral-800"
                  />
                </div>
              </div>

              {/* Music Quiz Banner */}
              <button
                onClick={() => {
                  navigate('/music-quiz');
                  setPlayerOpen(false);
                }}
                className="w-full mt-2 py-1.5 px-2 bg-amber-400 hover:bg-amber-300 text-black border border-black font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_0px_#fff]"
              >
                <Trophy size={13} className="text-black" />
                <span>Müzik Quizini Oyna (Şarkıyı Bil!)</span>
              </button>

              <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider text-center mt-1">
                LISTEN.moe & Radio Plaza açık API akışıdır. Arka planda kesintisiz çalar.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Pill Button */}
        {!isPlayerOpen && (
          <div className="flex items-center gap-1.5 bg-black border-2 border-white neo-shadow-white p-1.5 pr-3 hover:border-amber-400 transition-colors group cursor-pointer">
            <button
              onClick={togglePlay}
              className={cn(
                "w-8 h-8 flex items-center justify-center border font-black transition-colors shrink-0",
                isPlaying
                  ? "bg-rose-600 text-white border-rose-500"
                  : "bg-white text-black border-white hover:bg-amber-400"
              )}
              title={isPlaying ? "Radyoyu Durdur" : "Anime Radyosunu Başlat"}
            >
              {isBuffering ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={14} strokeWidth={3} />
              ) : (
                <Play size={14} strokeWidth={3} className="translate-x-[1px]" />
              )}
            </button>

            <div
              onClick={() => setPlayerOpen(true)}
              className="flex items-center gap-2 pl-1 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-amber-400 flex items-center gap-1 leading-none">
                  <Radio size={10} />
                  <span>ANİME RADYOSU</span>
                </span>
                <span className="text-[10px] font-black uppercase text-white truncate max-w-[120px] mt-0.5 leading-none">
                  {currentStation.badge}
                </span>
              </div>

              {isPlaying && (
                <div className="flex items-end gap-0.5 h-4 shrink-0 pl-1">
                  <span className="w-0.5 bg-rose-500 animate-[bounce_0.6s_ease-in-out_infinite] h-3.5" />
                  <span className="w-0.5 bg-amber-400 animate-[bounce_0.8s_ease-in-out_infinite_0.1s] h-2" />
                  <span className="w-0.5 bg-cyan-400 animate-[bounce_0.5s_ease-in-out_infinite_0.2s] h-4" />
                </div>
              )}

              <ChevronUp size={14} className="text-neutral-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
