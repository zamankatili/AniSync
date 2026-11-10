import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Maximize, Minimize, Lock, Unlock, Crown, RefreshCw, 
  Sparkles, Flame, Radio, Users, Check, AlertCircle 
} from 'lucide-react';
import { WatchPartyRoomData, REACTION_TYPES, formatVideoTime } from '../../data/watchPartySeed';
import { FloatingReactionLayer } from './FloatingReactionLayer';
import { useWatchPartyStore } from '../../store/useWatchPartyStore';
import { cn } from '../../lib/utils';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface VideoPlayerDeckProps {
  room: WatchPartyRoomData;
  isHost: boolean;
  canControl: boolean;
  currentUser: { uid: string; displayName?: string | null };
}

export const VideoPlayerDeck: React.FC<VideoPlayerDeckProps> = ({
  room,
  isHost,
  canControl,
  currentUser
}) => {
  const { 
    reactions, 
    togglePlayPause, 
    seekTo, 
    toggleLock, 
    sendReaction 
  } = useWatchPartyStore();
  const { t } = useAppTranslation();

  const [localTime, setLocalTime] = useState<number>(room.currentTime || 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(room.isPlaying);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'drift'>('synced');
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /** YouTube IFrame API'sine komut gönder (harici script gerekmez). */
  const postCommand = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*',
    );
  }, []);

  /**
   * Embed src'i SABİT tutulur: yalnız video değişince değişir.
   * Önceki sürümde `start=${Math.floor(localTime)}` her saniye src'yi değiştiriyor,
   * YouTube iframe'i her saniye yeniden yükleniyordu (oynatma imkansız).
   */
  const embedSrc = useMemo(
    () => `https://www.youtube.com/embed/${room.youtubeId}?enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1&autoplay=0&origin=${encodeURIComponent(window.location.origin)}`,
    [room.youtubeId],
  );

  // YouTube player'dan gelen currentTime/duration/state bilgisini dinle.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      let payload: any = event.data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }
      const info = payload?.info;
      if (!info) return;
      if (typeof info.currentTime === 'number' && Number.isFinite(info.currentTime)) {
        setLocalTime(Math.floor(info.currentTime));
      }
      if (typeof info.duration === 'number' && info.duration > 0) {
        setDuration(info.duration);
      }
      if (typeof info.playerState === 'number') {
        setIsPlaying(info.playerState === 1);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Oda (host) durumu değiştiğinde player'ı gerçekten senkronla.
  useEffect(() => {
    setIsPlaying(room.isPlaying);
    if (Math.abs(room.currentTime - localTime) > 3) {
      setLocalTime(room.currentTime);
      postCommand('seekTo', [room.currentTime, true]);
      setSyncStatus('synced');
    }
    postCommand(room.isPlaying ? 'playVideo' : 'pauseVideo');
    // localTime bilinçli olarak dışarıda: her tick'te komut yağmuru olmasın.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.currentTime, room.isPlaying, postCommand]);

  // Ses seviyesi / sessize alma gerçek player'a uygulanır.
  useEffect(() => {
    postCommand('setVolume', [Math.round(volume * 100)]);
    postCommand(isMuted ? 'mute' : 'unMute');
  }, [volume, isMuted, postCommand]);

  const handleIframeLoad = () => {
    postCommand('setVolume', [Math.round(volume * 100)]);
    postCommand(isMuted ? 'mute' : 'unMute');
    if (room.isPlaying) postCommand('playVideo');
    if (room.currentTime > 0) postCommand('seekTo', [room.currentTime, true]);
  };

  const handlePlayToggle = async () => {
    if (!canControl) {
      setLastActionToast(t('watch_party_player_host_only'));
      setTimeout(() => setLastActionToast(null), 3000);
      return;
    }
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    postCommand(nextState ? 'playVideo' : 'pauseVideo');
    await togglePlayPause(room.id, nextState, localTime);
  };

  const handleSeek = async (newSec: number) => {
    if (!canControl) {
      setLastActionToast(t('watch_party_player_locked_seek'));
      setTimeout(() => setLastActionToast(null), 3000);
      return;
    }
    const upper = duration > 0 ? duration : 86400;
    const clamped = Math.max(0, Math.min(Math.floor(newSec), upper));
    setLocalTime(clamped);
    postCommand('seekTo', [clamped, true]);
    await seekTo(room.id, clamped);
  };

  const handleForceSync = () => {
    setSyncStatus('syncing');
    setLocalTime(room.currentTime);
    setIsPlaying(room.isPlaying);
    postCommand('seekTo', [room.currentTime, true]);
    postCommand(room.isPlaying ? 'playVideo' : 'pauseVideo');
    setTimeout(() => {
      setSyncStatus('synced');
      setLastActionToast(t('watch_party_player_synced'));
      setTimeout(() => setLastActionToast(null), 2500);
    }, 400);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const handleReactionClick = (typeId: string) => {
    sendReaction(room.id, currentUser, typeId);
  };

  const handleMuteToggle = () => {
    setIsMuted(prev => !prev);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (isMuted && value > 0) setIsMuted(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col bg-black border-4 border-black neo-shadow select-none relative">
      {/* Top Video Header */}
      <div className="bg-neutral-900 border-b-2 border-white/20 p-2.5 px-3 flex flex-wrap items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-black text-xs uppercase tracking-wider text-amber-400 truncate">
            {room.animeTitle}
          </span>
          <span className="text-neutral-500 text-xs hidden sm:inline">•</span>
          <span className="text-[11px] text-neutral-300 font-bold truncate max-w-[240px]">
            {room.title}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-black uppercase">
          {/* Host Badge */}
          <div className="flex items-center gap-1 bg-amber-400 text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#fff]">
            <Crown size={12} />
            <span>HOST: {room.hostName}</span>
          </div>

          {/* Sync Status Button */}
          <button
            onClick={handleForceSync}
            title={t('watch_party_player_force_sync')}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 border border-white/40 transition-colors cursor-pointer",
              syncStatus === 'synced' ? "bg-emerald-950 text-emerald-400 border-emerald-500" : "bg-neutral-800 text-amber-300 border-amber-400"
            )}
          >
            <RefreshCw size={10} className={cn(syncStatus === 'syncing' && "animate-spin")} />
            <span>{syncStatus === 'synced' ? t('watch_party_player_synced_short') : t('watch_party_player_sync')}</span>
          </button>
        </div>
      </div>

      {/* Video Viewport Frame with Floating Reactions */}
      <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
        {/* Floating Reactions Layer */}
        <FloatingReactionLayer reactions={reactions} />

        {/* Embedded Video */}
        {room.youtubeId ? (
          <iframe
            ref={iframeRef}
            src={embedSrc}
            title={room.title}
            onLoad={handleIframeLoad}
            className="w-full h-full border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="text-center p-6 text-neutral-400">
            <Radio size={36} className="mx-auto mb-2 text-amber-400 animate-pulse" />
            <p className="font-bold text-xs uppercase">
              {t('watch_party_player_live_preparing')}
            </p>
          </div>
        )}

        {/* Action Toast notification */}
        {lastActionToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-black border-2 border-black font-black text-xs px-3 py-1.5 shadow-[3px_3px_0px_0px_#000] z-40 animate-in fade-in slide-in-from-top-2">
            {lastActionToast}
          </div>
        )}
      </div>

      {/* Synced Control Bar */}
      <div className="bg-neutral-950 border-t-2 border-white/20 p-2.5 px-3 flex flex-col gap-2">
        {/* Progress Timeline Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-bold text-neutral-300 w-10 text-right">
            {formatVideoTime(localTime)}
          </span>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max={duration > 0 ? Math.floor(duration) : 0}
              value={duration > 0 ? Math.min(localTime, Math.floor(duration)) : 0}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              disabled={!canControl || duration <= 0}
              className={cn(
                "w-full h-2 accent-rose-600 bg-neutral-800 rounded-none border border-white/30 cursor-pointer",
                (!canControl || duration <= 0) && "cursor-not-allowed opacity-75"
              )}
            />
          </div>
          <span className="text-[11px] font-mono font-bold text-neutral-500 w-10">
            {duration > 0 ? formatVideoTime(duration) : '--:--'}
          </span>
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between gap-2 pt-1 text-white">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={handlePlayToggle}
              className={cn(
                "px-3 py-1.5 font-black text-xs uppercase flex items-center gap-1.5 border-2 border-black transition-transform active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_0px_#fff]",
                isPlaying ? "bg-rose-600 text-white hover:bg-rose-500" : "bg-amber-400 text-black hover:bg-amber-300"
              )}
            >
              {isPlaying ? <Pause size={14} strokeWidth={3} /> : <Play size={14} strokeWidth={3} />}
              <span>{isPlaying ? t('watch_party_player_pause') : t('watch_party_player_play')}</span>
            </button>

            {/* Quick Seek Buttons */}
            <button
              onClick={() => handleSeek(localTime - 10)}
              disabled={!canControl}
              title={t('watch_party_player_seek_back')}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/20 hover:border-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => handleSeek(localTime + 10)}
              disabled={!canControl}
              title={t('watch_party_player_seek_forward')}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/20 hover:border-white transition-colors cursor-pointer"
            >
              <RotateCw size={14} />
            </button>

            {/* Host Lock Control */}
            {isHost && (
              <button
                onClick={() => toggleLock(room.id, !room.isLocked)}
                className={cn(
                  "px-2 py-1 border text-[10px] font-black uppercase flex items-center gap-1 transition-colors cursor-pointer",
                  room.isLocked
                    ? "bg-rose-950 text-rose-300 border-rose-500"
                    : "bg-neutral-900 text-neutral-300 border-white/20 hover:border-white/50"
                )}
                title={room.isLocked ? t('watch_party_player_locked_title') : t('watch_party_player_unlocked_title')}
              >
                {room.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                <span>{room.isLocked ? t('watch_party_player_host_only_short') : t('watch_party_player_everyone_control')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Volume */}
            <button
              onClick={handleMuteToggle}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-amber-400 h-1 bg-neutral-800 cursor-pointer hidden sm:inline-block"
            />

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/20 hover:border-white transition-colors cursor-pointer"
              title={t('watch_party_player_fullscreen')}
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Reactions Toolbar */}
      <div className="bg-neutral-900 border-t-2 border-white/20 p-2 px-3 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles size={12} />
          {t('watch_party_player_live_reaction')}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {REACTION_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleReactionClick(type.id)}
              className="px-2 py-1 bg-black hover:bg-neutral-800 text-white border border-white/30 hover:border-white font-black text-xs flex items-center gap-1 transition-transform active:scale-90 cursor-pointer shadow-[1px_1px_0px_0px_#fff]"
              title={`${type.label} ${t('watch_party_player_reaction_throw')}`}
            >
              <span className="text-sm">{type.emoji}</span>
              <span className="text-[9px] uppercase hidden md:inline">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
