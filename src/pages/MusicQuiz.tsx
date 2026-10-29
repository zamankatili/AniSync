import React, { useState, useEffect, useRef } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { useThemeStore, THEME_CONFIGS } from '../store/useThemeStore';
import { useToastStore } from '../store/useToastStore';
import { QUIZ_SONGS, DAILY_UNLOCK_STAGES, QuizSong } from '../data/musicQuizData';
import { playSynthAnimeMelody, stopSynthMelody } from '../lib/synthAudioPlayer';
import { resolveRealSongAudioUrl } from '../lib/audioResolver';
import { ChallengeInviteBox } from '../components/ChallengeInviteBox';
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, Flame, Trophy, 
  HelpCircle, Share2, Sparkles, Heart, Check, X, ChevronRight, 
  Music, Disc, ArrowRight, Zap, Award, Search, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl, handleImageError } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const MusicQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { currentTheme } = useThemeStore();
  const activeThemeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.noon;

  const {
    activeMode,
    setActiveMode,
    dailySong,
    dailyCurrentStage,
    dailyGuesses,
    dailyCompleted,
    dailyWon,
    dailyStreak,
    submitDailyGuess,
    skipDailyStage,
    challengeTarget,
    setChallengeTarget,
    arcadeSongs,
    arcadeIndex,
    arcadeScore,
    arcadeCombo,
    arcadeMaxCombo,
    arcadeLives,
    arcadeHighScore,
    arcadeGameOver,
    arcadeChallengeWon,
    arcadeCorrectCount,
    arcadeLastCorrect,
    completedChallenges,
    startArcadeGame,
    submitArcadeAnswer,
    nextArcadeQuestion,
    stats
  } = useQuizStore();

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Daily Input state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuess, setSelectedGuess] = useState('');

  // Arcade Timer
  const [arcadeTimer, setArcadeTimer] = useState(15);
  const arcadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentArcadeSong = arcadeSongs[arcadeIndex] || arcadeSongs[0];
  const activeTargetSong = activeMode === 'daily' ? dailySong : currentArcadeSong;
  const [activeAudioUrl, setActiveAudioUrl] = useState<string>(activeTargetSong?.audioUrl || '');

  // Synchronously set initial audio URL then asynchronously resolve live iTunes AAC preview URL
  useEffect(() => {
    let isCancelled = false;

    if (activeTargetSong) {
      setActiveAudioUrl(activeTargetSong.audioUrl || '');

      resolveRealSongAudioUrl(
        activeTargetSong.songTitle, 
        activeTargetSong.artist, 
        activeTargetSong.animeTitle, 
        activeTargetSong.audioUrl
      ).then((url) => {
        if (!isCancelled && url) {
          setActiveAudioUrl(url);
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [activeTargetSong?.id, activeMode]);

  // Dynamically shuffle options for Arcade mode so correct answer is randomly A, B, C, or D
  const currentArcadeOptions = React.useMemo(() => {
    if (!currentArcadeSong || !currentArcadeSong.options) return [];
    const arr = [...currentArcadeSong.options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [currentArcadeSong?.id, arcadeIndex]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopSynthMelody();
      if (arcadeTimerRef.current) {
        clearInterval(arcadeTimerRef.current);
      }
    };
  }, []);

  // Handle Audio playback time limit & events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      if (activeMode === 'daily' && !dailyCompleted) {
        const allowedDuration = DAILY_UNLOCK_STAGES[dailyCurrentStage];
        if (audio.currentTime >= allowedDuration) {
          audio.pause();
          audio.currentTime = 0;
          stopSynthMelody();
          setIsPlaying(false);
        }
      }
    };

    const handleEnded = () => {
      stopSynthMelody();
      setIsPlaying(false);
      audio.currentTime = 0;
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error event triggered:', e);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [activeMode, dailyCurrentStage, dailyCompleted]);

  // Switch Audio Source & Reset Timer on question / mode change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);
    stopSynthMelody();

    if (activeMode === 'arcade' && !arcadeGameOver) {
      setArcadeTimer(15);
      if (activeAudioUrl) {
        audio.load();
        audio.currentTime = 0;
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    } else if (activeMode === 'daily') {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }

    return () => {
      stopSynthMelody();
    };
  }, [activeMode, activeAudioUrl, arcadeIndex, arcadeGameOver]);

  // Arcade Countdown Interval (Decrements timer safely without nested setState)
  useEffect(() => {
    if (activeMode !== 'arcade' || arcadeGameOver || arcadeLastCorrect !== null) {
      if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);
      return;
    }

    if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);

    arcadeTimerRef.current = setInterval(() => {
      setArcadeTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);
    };
  }, [activeMode, arcadeIndex, arcadeGameOver, arcadeLastCorrect]);

  // Safe Timeout Handler Effect when timer reaches 0
  useEffect(() => {
    if (activeMode === 'arcade' && arcadeTimer === 0 && !arcadeGameOver && arcadeLastCorrect === null) {
      if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);
      handleArcadeTimeout();
    }
  }, [arcadeTimer, activeMode, arcadeGameOver, arcadeLastCorrect]);

  const playAudioWithFallback = () => {
    const audio = audioRef.current;
    setAudioError(null);
    stopSynthMelody();

    const allowed = activeMode === 'daily' && !dailyCompleted 
      ? DAILY_UNLOCK_STAGES[dailyCurrentStage] 
      : 15;

    if (audio) {
      audio.currentTime = 0;
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Audio play blocked or failed, triggering synth fallback:', err);
          setIsPlaying(true);
          playSynthAnimeMelody(allowed).then(() => {
            setIsPlaying(false);
          });
        });
    } else {
      setIsPlaying(true);
      playSynthAnimeMelody(allowed).then(() => {
        setIsPlaying(false);
      });
    }
  };

  const togglePlayAudio = () => {
    const audio = audioRef.current;

    if (isPlaying) {
      if (audio) audio.pause();
      stopSynthMelody();
      setIsPlaying(false);
    } else {
      playAudioWithFallback();
    }
  };

  const handleStartArcade = (target?: any) => {
    startArcadeGame(target);
    setTimeout(() => {
      playAudioWithFallback();
    }, 50);
  };

  const handleNextArcadeQuestion = () => {
    nextArcadeQuestion();
    setTimeout(() => {
      playAudioWithFallback();
    }, 50);
  };

  const handleArcadeTimeout = () => {
    stopSynthMelody();
    if (audioRef.current) audioRef.current.pause();
    submitArcadeAnswer('__TIME_OUT__', 0);
    addToast('Süre doldu! -1 Can 💔', 'error');
  };

  const handleSelectArcadeOption = (option: string) => {
    if (arcadeGameOver || arcadeLastCorrect !== null) return;
    if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);

    stopSynthMelody();
    if (audioRef.current) audioRef.current.pause();

    const isCorrect = submitArcadeAnswer(option, arcadeTimer);
    if (isCorrect) {
      addToast(`🎉 Doğru! +${Math.round((500 + arcadeTimer * 50) * Math.min(4, 1 + arcadeCombo * 0.25))} Puan`, 'success');
    } else {
      addToast(`Yanlış! Doğru cevap: ${currentArcadeSong.animeTitle}`, 'error');
    }
  };

  const handleDailySubmit = () => {
    if (!selectedGuess.trim()) return;

    const isCorrect = submitDailyGuess(selectedGuess);
    setSelectedGuess('');
    setSearchQuery('');

    if (isCorrect) {
      addToast('🎉 TEBRİKLER! Şarkıyı başarıyla bildin!', 'success');
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          playSynthAnimeMelody(10);
        });
        setIsPlaying(true);
      }
    } else {
      addToast('Yanlış tahmin! Daha uzun dinleme süresi açıldı.', 'info');
    }
  };

  const handleDailySkip = () => {
    skipDailyStage();
    addToast('Pas geçildi. Sıradaki süre kilitleri açıldı.', 'info');
  };

  const handleShareResults = () => {
    const attempts = dailyGuesses.length;
    const squares = dailyGuesses.map(g => (g.correct ? '🟩' : g.skipped ? '🟨' : '⬛')).join('');
    const text = `🎵 AniSync Anime Müzik Quiz #${new Date().getDate()}\n` +
      `${dailyWon ? `Tebrikler! ${attempts}/6 denemede bildim!` : 'Bugünkü şarkıda elendim!'}\n` +
      `${squares}\n` +
      `Seri: ${dailyStreak} 🔥 | Sen de dene:\n` +
      `${window.location.origin}/music-quiz`;

    navigator.clipboard.writeText(text);
    addToast('Sonuçlar panoya kopyalandı! Arkadaşlarınla paylaşabilirsin.', 'success');
  };

  // Filter autocomplete suggestions for Daily Mode
  const suggestions = QUIZ_SONGS.map(s => s.animeTitle).filter(title => 
    searchQuery.trim().length > 1 && title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden Audio Tag pointing to dynamically resolved real iTunes preview URL */}
      <audio 
        ref={audioRef} 
        src={activeAudioUrl || activeTargetSong?.audioUrl} 
        preload="auto" 
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-white/20 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div 
              className="w-10 h-10 border-2 border-white flex items-center justify-center text-white font-black text-xl neo-shadow-white transition-colors duration-500"
              style={{ backgroundColor: activeThemeConfig.accentColor }}
            >
              <Music size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
              MÜZİK QUİZİ
            </h1>
          </div>
          <p className="text-xs md:text-sm font-black text-neutral-400 uppercase tracking-widest">
            Açılış ve kapanış müziklerini dinle, hangi animeye ait olduğunu tahmin et!
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-black border-4 border-white neo-shadow-white overflow-hidden self-start sm:self-auto shrink-0">
          <button
            onClick={() => {
              setActiveMode('daily');
              setIsPlaying(false);
              stopSynthMelody();
              if (audioRef.current) audioRef.current.pause();
            }}
            className={cn(
              "px-4 py-2 font-black uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 cursor-pointer",
              activeMode === 'daily' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
            )}
          >
            <Sparkles size={14} />
            <span>Günün Şarkısı</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('arcade');
              handleStartArcade();
            }}
            className={cn(
              "px-4 py-2 font-black uppercase tracking-wider text-xs transition-colors border-l-4 border-white flex items-center gap-1.5 cursor-pointer",
              activeMode === 'arcade' ? "bg-amber-400 text-black" : "text-white hover:bg-neutral-900"
            )}
          >
            <Zap size={14} />
            <span>Arcade Modu</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950 border-2 border-white/20 p-3.5 neo-shadow-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-600/20 border border-rose-500 text-rose-400 flex items-center justify-center font-black">
            <Flame size={18} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Günlük Seri</span>
            <span className="text-base font-black text-white">{dailyStreak} Gün 🔥</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-400/20 border border-amber-400 text-amber-400 flex items-center justify-center font-black">
            <Trophy size={18} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Arcade Rekoru</span>
            <span className="text-base font-black text-white">{stats.arcadeHighScore} Puan</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-400/20 border border-cyan-400 text-cyan-400 flex items-center justify-center font-black">
            <Award size={18} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Kazanma Oranı</span>
            <span className="text-base font-black text-white">
              {stats.totalPlayed > 0 ? `%${Math.round((stats.totalWins / stats.totalPlayed) * 100)}` : '%0'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-400/20 border border-emerald-400 text-emerald-400 flex items-center justify-center font-black">
            <Music size={18} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Kütüphane</span>
            <span className="text-base font-black text-white">{QUIZ_SONGS.length} İkonik Şarkı</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: DAILY SONG (HEARDLE STYLE) */}
      {/* ============================================================== */}
      {activeMode === 'daily' && (
        <div className="space-y-6">
          {/* Main Player Box */}
          <div className="bg-black border-4 border-white neo-shadow-white p-6 relative overflow-hidden">
            {/* Stage Progress Bar (6 Segments) */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-400 mb-2">
                <span>Dinleme Kademesi {Math.min(dailyCurrentStage + 1, 6)} / 6</span>
                <span className="text-amber-400 font-black">
                  Maksimum Süre: {DAILY_UNLOCK_STAGES[dailyCurrentStage]} Saniye
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1.5 h-3">
                {DAILY_UNLOCK_STAGES.map((sec, idx) => {
                  const isUnlocked = idx <= dailyCurrentStage;
                  const isPassed = idx < dailyGuesses.length;
                  const guess = dailyGuesses[idx];

                  return (
                    <div
                      key={sec}
                      className={cn(
                        "border transition-all relative overflow-hidden",
                        isPassed
                          ? guess?.correct
                            ? "bg-emerald-500 border-emerald-400"
                            : guess?.skipped
                              ? "bg-amber-400 border-amber-300"
                              : "bg-red-600 border-red-500"
                          : isUnlocked
                            ? "bg-neutral-800 border-white/50"
                            : "bg-neutral-950 border-white/20 opacity-40"
                      )}
                    >
                      <span className="text-[8px] font-black text-black absolute inset-0 flex items-center justify-center">
                        {sec}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Big Disc Visualizer & Play Button */}
            <div className="flex flex-col items-center justify-center my-6 gap-4">
              <div className="relative">
                <div 
                  className={cn(
                    "w-28 h-28 border-4 border-white rounded-full bg-neutral-900 flex items-center justify-center neo-shadow-white transition-all duration-700",
                    isPlaying && "animate-spin"
                  )}
                  style={{ animationDuration: '4s' }}
                >
                  <Disc size={64} className="text-white/60" />
                  <div 
                    className="absolute w-8 h-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: activeThemeConfig.accentColor }}
                  />
                </div>

                {/* Animated Equalizer Waves */}
                {isPlaying && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 h-6 bg-black px-2 py-0.5 border border-white">
                    <span className="w-1 bg-rose-500 animate-[bounce_0.6s_ease-in-out_infinite] h-5" />
                    <span className="w-1 bg-amber-400 animate-[bounce_0.8s_ease-in-out_infinite_0.1s] h-3" />
                    <span className="w-1 bg-cyan-400 animate-[bounce_0.5s_ease-in-out_infinite_0.2s] h-6" />
                    <span className="w-1 bg-emerald-400 animate-[bounce_0.7s_ease-in-out_infinite_0.3s] h-4" />
                  </div>
                )}
              </div>

              <button
                onClick={togglePlayAudio}
                className={cn(
                  "px-8 py-3.5 border-4 font-black uppercase text-sm tracking-wider flex items-center gap-2.5 transition-all neo-shadow-white cursor-pointer",
                  isPlaying 
                    ? "bg-rose-600 text-white border-white" 
                    : "bg-white text-black border-black hover:bg-amber-400"
                )}
              >
                {isPlaying ? <Pause size={20} strokeWidth={3} /> : <Play size={20} strokeWidth={3} className="translate-x-[1px]" />}
                <span>{isPlaying ? "Durdur" : `Dinle (${DAILY_UNLOCK_STAGES[dailyCurrentStage]}s)`}</span>
              </button>
            </div>

            {/* Hints Box */}
            <div className="border-t-2 border-white/20 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-400 shrink-0" />
                <span className="text-xs font-black uppercase text-white">İpucu Aç ({revealedHints}/3):</span>
                {revealedHints > 0 && (
                  <span className="text-xs text-amber-300 font-bold">
                    {dailySong.hints[revealedHints - 1]}
                  </span>
                )}
              </div>

              {revealedHints < 3 && !dailyCompleted && (
                <button
                  onClick={() => setRevealedHints(prev => Math.min(3, prev + 1))}
                  className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/20 text-[11px] font-black uppercase transition-colors cursor-pointer"
                >
                  +1 İpucu Göster
                </button>
              )}
            </div>
          </div>

          {/* Guesses Log (6 Slots) */}
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const guess = dailyGuesses[idx];
              const isCurrent = idx === dailyGuesses.length && !dailyCompleted;

              return (
                <div
                  key={idx}
                  className={cn(
                    "p-3 border-2 flex items-center justify-between transition-colors",
                    guess
                      ? guess.correct
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                        : guess.skipped
                          ? "bg-amber-950/30 border-amber-500 text-amber-300"
                          : "bg-red-950/40 border-red-500 text-red-300"
                      : isCurrent
                        ? "bg-black border-white/60 text-white"
                        : "bg-neutral-950/60 border-white/10 text-neutral-600"
                  )}
                >
                  <span className="text-xs font-black uppercase tracking-wider">
                    {guess ? (
                      guess.correct ? `✓ ${guess.text}` : guess.skipped ? `— ${guess.text}` : `✗ ${guess.text}`
                    ) : (
                      isCurrent ? "Sıradaki Tahminin..." : `${idx + 1}. Tahmin`
                    )}
                  </span>

                  <span className="text-[10px] font-black uppercase">
                    {guess ? (
                      guess.correct ? "DOĞRU" : guess.skipped ? "PAS" : "YANLIŞ"
                    ) : (
                      `${DAILY_UNLOCK_STAGES[idx]}s`
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Guess Submission Input / Controls (When game active) */}
          {!dailyCompleted ? (
            <div className="bg-neutral-950 border-4 border-white neo-shadow-white p-4 space-y-3">
              <label className="text-xs font-black uppercase text-white tracking-wider block">
                Anime İsmini Yaz veya Seç:
              </label>

              {/* Quick Choice Buttons from Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {dailySong.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedGuess(opt)}
                    className={cn(
                      "p-2.5 border-2 text-xs font-black uppercase tracking-wider text-left transition-colors cursor-pointer truncate",
                      selectedGuess === opt
                        ? "bg-amber-400 text-black border-black neo-shadow-white"
                        : "bg-black text-white border-white/20 hover:border-white"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Search input for open guess */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery || selectedGuess}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedGuess(e.target.value);
                  }}
                  placeholder="Başka bir anime adı yaz..."
                  className="w-full bg-black border-2 border-white/30 py-2.5 pl-9 pr-3 text-xs font-bold uppercase text-white focus:outline-none focus:border-amber-400"
                />

                {/* Autocomplete Dropdown */}
                {suggestions.length > 0 && searchQuery && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-black border-2 border-white neo-shadow-white max-h-48 overflow-y-auto z-30">
                    {suggestions.map((title) => (
                      <div
                        key={title}
                        onClick={() => {
                          setSelectedGuess(title);
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-neutral-900 cursor-pointer text-xs font-black uppercase border-b border-white/10 last:border-0"
                      >
                        {title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleDailySkip}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider border-2 border-white/20 transition-colors cursor-pointer"
                >
                  Pas Geç (+Süre Aç)
                </button>

                <button
                  onClick={handleDailySubmit}
                  disabled={!selectedGuess.trim()}
                  className="flex-1 py-3 bg-white text-black hover:bg-emerald-400 disabled:opacity-40 font-black text-xs uppercase tracking-wider border-2 border-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer neo-shadow-white"
                >
                  <Check size={16} strokeWidth={3} />
                  <span>Tahmini Onayla</span>
                </button>
              </div>
            </div>
          ) : (
            /* Game Over Card */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black border-4 border-white neo-shadow-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  {dailyWon ? (
                    <span className="text-2xl">🎉</span>
                  ) : (
                    <span className="text-2xl">💀</span>
                  )}
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      {dailyWon ? "TEBRİKLER! BİLDİN!" : "GÜNÜN ŞARKISI TAMAMLANDI"}
                    </h3>
                    <p className="text-xs text-neutral-400 font-bold uppercase">
                      {dailyWon ? `${dailyGuesses.length}. denemede doğru cevabı buldun.` : 'Yarınki yeni şarkıda şansını tekrar dene!'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleShareResults}
                  className="px-4 py-2 bg-amber-400 text-black hover:bg-white font-black text-xs uppercase tracking-wider border-2 border-black flex items-center gap-1.5 transition-colors cursor-pointer neo-shadow-white"
                >
                  <Share2 size={14} />
                  <span>Sonucu Kopyala</span>
                </button>
              </div>

              {/* Song Revealed Card */}
              <div className="flex flex-col sm:flex-row gap-4 bg-neutral-950 border-2 border-white/20 p-4">
                <img
                  src={getSafeImageUrl(dailySong.animeImage)}
                  alt={dailySong.animeTitle}
                  className="w-24 h-34 object-cover border-2 border-white shrink-0 mx-auto sm:mx-0"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />

                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 border border-white uppercase">
                      {dailySong.type} • {dailySong.themeNumber || 'TEMA'}
                    </span>
                    <span className="text-xs text-neutral-400 font-bold uppercase">
                      {dailySong.year} • {dailySong.studio}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white uppercase tracking-tight">
                    {dailySong.animeTitle}
                  </h4>
                  <p className="text-sm font-black text-amber-400 uppercase mt-0.5">
                    {dailySong.songTitle}
                  </p>
                  <p className="text-xs text-neutral-400 font-bold uppercase mt-0.5">
                    Sanatçı: <span className="text-white">{dailySong.artist}</span>
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={togglePlayAudio}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/30 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      <span>Şarkının Tamamını Dinle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Challenge & Duel Invite Box */}
              <ChallengeInviteBox
                title={`Günün Anime Müziği (${dailySong.animeTitle})`}
                scoreDisplay={dailyWon ? `${dailyGuesses.length}/6 Denemede Bildi!` : 'Tamamlandı'}
                subtitle={`Günlük Seri: ${dailyStreak} Gün 🔥`}
                challengeType="music_daily"
                statsData={{ streak: dailyStreak, guesses: dailyGuesses.length }}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: ARCADE & CHALLENGE MODE */}
      {/* ============================================================== */}
      {activeMode === 'arcade' && (
        <div className="space-y-6">
          {/* Challenge Selector Bar */}
          <div className="bg-black border-4 border-white neo-shadow-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Trophy size={16} />
                Meydan Okuma Modunu Seç:
              </span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                25, 50 veya 100 Şarkılık Özel Listeler
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { target: 25, label: '25 Şarkı', sub: 'Hız Maratonu', icon: '⚡' },
                { target: 50, label: '50 Şarkı', sub: 'Usta Sınavı', icon: '🏆' },
                { target: 100, label: '100 Şarkı', sub: 'Efsane Sınavı', icon: '🔥' },
                { target: 'endless', label: 'Sınırsız', sub: 'Sonsuz Rush', icon: '♾️' }
              ].map((item) => {
                const isActive = challengeTarget === item.target;
                const record = completedChallenges[`${item.target}`];

                return (
                  <button
                    key={String(item.target)}
                    onClick={() => {
                      setChallengeTarget(item.target as any);
                      startArcadeGame(item.target as any);
                    }}
                    className={cn(
                      "p-3 border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer",
                      isActive
                        ? "bg-amber-400 text-black border-black neo-shadow-white scale-102 font-black"
                        : "bg-neutral-950 text-white border-white/30 hover:border-white hover:bg-neutral-900"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black uppercase tracking-tight flex items-center gap-1">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        {record && (
                          <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                            ✓ Tamamlandı
                          </span>
                        )}
                      </div>
                      <span className={cn("text-[10px] block font-bold uppercase", isActive ? "text-neutral-900" : "text-neutral-400")}>
                        {item.sub}
                      </span>
                    </div>

                    {record && (
                      <div className="mt-2 pt-1 border-t border-black/20 text-[9px] font-black uppercase flex items-center justify-between">
                        <span>En İyi: {record.bestScore}P</span>
                        <span>%{record.bestAccuracy} Doğru</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Bar for Challenge Targets (25, 50, 100) */}
          {typeof challengeTarget === 'number' && !arcadeGameOver && (
            <div className="bg-neutral-950 border-2 border-white/30 p-3 neo-shadow-white space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-white">
                <span className="flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  Meydan Okuma İlerlemesi: {Math.min(arcadeIndex + 1, challengeTarget)} / {challengeTarget} Şarkı
                </span>
                <span className="text-amber-400 font-mono">
                  %{Math.min(100, Math.round(((arcadeIndex) / challengeTarget) * 100))}
                </span>
              </div>

              <div className="w-full bg-neutral-900 h-3 border border-white/30 overflow-hidden relative">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, Math.round(((arcadeIndex) / challengeTarget) * 100))}%`,
                    backgroundColor: activeThemeConfig.accentColor 
                  }}
                />
              </div>
            </div>
          )}

          {/* Arcade Status Bar */}
          <div className="bg-black border-4 border-white neo-shadow-white p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Lives */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-neutral-400">Canlar:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((heart) => (
                  <Heart
                    key={heart}
                    size={20}
                    className={cn(
                      "transition-all",
                      heart <= arcadeLives ? "text-rose-500 fill-rose-500 scale-110" : "text-neutral-700"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-neutral-400">Kalan Süre:</span>
              <span className={cn(
                "text-2xl font-black font-mono px-3 py-0.5 border-2",
                arcadeTimer <= 4 ? "bg-red-600 text-white border-white animate-ping" : "bg-neutral-900 text-amber-400 border-white/20"
              )}>
                {arcadeTimer}s
              </span>
            </div>

            {/* Score & Combo */}
            <div className="flex items-center gap-4">
              {arcadeCombo > 1 && (
                <span className="text-xs font-black uppercase bg-amber-400 text-black px-2 py-1 border border-black animate-bounce">
                  {arcadeCombo}x KOMBO 🔥
                </span>
              )}
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Mevcut Puan</span>
                <span className="text-xl font-black text-white">{arcadeScore}</span>
              </div>
            </div>
          </div>

          {/* Arcade Active Question Card */}
          {!arcadeGameOver ? (
            <div className="bg-neutral-950 border-4 border-white neo-shadow-white p-6 space-y-6">
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 border border-white uppercase tracking-widest">
                  SORU #{arcadeIndex + 1} {typeof challengeTarget === 'number' ? `/ ${challengeTarget}` : ''}
                </span>

                <h3 className="text-lg md:text-xl font-black text-white uppercase text-center tracking-tight">
                  Şu an çalan şarkı hangi animeye ait?
                </h3>

                {/* Animated Sound Wave & Explicit Play/Pause Button */}
                <div className="flex flex-col items-center gap-2 my-1">
                  <button
                    onClick={togglePlayAudio}
                    className={cn(
                      "px-6 py-3 border-4 font-black uppercase text-xs tracking-wider flex items-center gap-2.5 transition-all neo-shadow-white cursor-pointer",
                      isPlaying 
                        ? "bg-rose-600 text-white border-white" 
                        : "bg-amber-400 text-black border-black hover:bg-white"
                    )}
                  >
                    {isPlaying ? <Pause size={18} strokeWidth={3} /> : <Play size={18} strokeWidth={3} className="translate-x-[1px]" />}
                    <span>{isPlaying ? "Müziği Durdur" : "Şarkıyı Dinle (Yeniden Çal 🎵)"}</span>
                  </button>

                  {isPlaying && (
                    <div className="flex items-end gap-1 h-5 mt-1">
                      <span className="w-1.5 bg-rose-500 animate-[bounce_0.6s_ease-in-out_infinite] h-5" />
                      <span className="w-1.5 bg-amber-400 animate-[bounce_0.8s_ease-in-out_infinite_0.1s] h-3" />
                      <span className="w-1.5 bg-cyan-400 animate-[bounce_0.5s_ease-in-out_infinite_0.2s] h-5" />
                      <span className="w-1.5 bg-emerald-400 animate-[bounce_0.7s_ease-in-out_infinite_0.3s] h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Large Choice Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {currentArcadeOptions.map((option, idx) => {
                  const isAnswered = arcadeLastCorrect !== null;
                  const isCorrectTarget = option.toLowerCase().trim() === currentArcadeSong.animeTitle.toLowerCase().trim();

                  return (
                    <button
                      key={option}
                      disabled={isAnswered}
                      onClick={() => handleSelectArcadeOption(option)}
                      className={cn(
                        "p-4 border-4 text-sm font-black uppercase tracking-wider text-left transition-all flex items-center justify-between cursor-pointer",
                        isAnswered
                          ? isCorrectTarget
                            ? "bg-emerald-500 text-black border-black neo-shadow-white scale-102"
                            : "bg-neutral-900 text-neutral-500 border-white/10 opacity-50"
                          : "bg-black text-white border-white neo-shadow-white hover:bg-white hover:text-black hover:-translate-y-1"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 border-2 border-current flex items-center justify-center text-xs font-black">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="truncate">{option}</span>
                      </div>

                      {isAnswered && isCorrectTarget && (
                        <Check size={18} strokeWidth={3} className="shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Button after answering */}
              {arcadeLastCorrect !== null && (
                <div className="pt-4 border-t-2 border-white/20 flex items-center justify-between">
                  <div className="text-xs font-bold uppercase text-neutral-300">
                    Şarkı: <span className="text-amber-400 font-black">{currentArcadeSong.songTitle}</span> • {currentArcadeSong.artist}
                  </div>

                  <button
                    onClick={handleNextArcadeQuestion}
                    className="px-6 py-2.5 bg-amber-400 text-black hover:bg-white font-black text-xs uppercase tracking-wider border-2 border-black flex items-center gap-1.5 transition-colors cursor-pointer neo-shadow-white"
                  >
                    <span>Sıradaki Soru</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : arcadeChallengeWon ? (
            /* Challenge Completed Victory Screen */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black border-4 border-emerald-400 neo-shadow-white p-8 text-center space-y-5 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-emerald-500 border-4 border-white text-black mx-auto flex items-center justify-center neo-shadow-white">
                <Trophy size={40} strokeWidth={2.5} />
              </div>

              <div>
                <span className="bg-emerald-500 text-black text-xs font-black px-3 py-1 border border-black uppercase tracking-widest inline-block mb-2">
                  🎉 MEYDAN OKUMA BAŞARIYLA TAMAMLANDI!
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                  {challengeTarget} ŞARKILIK LİSTEYİ BİTİRDİN!
                </h2>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
                  Müthiş anime kulak hafızası! Rozetin profil kütüphanene kaydedildi.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto bg-neutral-950 border-2 border-white/20 p-4">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Toplam Skor</span>
                  <span className="text-2xl font-black text-amber-400">{arcadeScore}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Doğruluk Oranı</span>
                  <span className="text-2xl font-black text-emerald-400">
                    %{typeof challengeTarget === 'number' ? Math.round((arcadeCorrectCount / challengeTarget) * 100) : 100}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">En Yüksek Kombo</span>
                  <span className="text-2xl font-black text-cyan-400">{arcadeMaxCombo}x</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => startArcadeGame(challengeTarget)}
                  className="px-8 py-3 bg-emerald-400 text-black hover:bg-white font-black text-xs uppercase tracking-wider border-2 border-black transition-colors cursor-pointer neo-shadow-white w-full sm:w-auto"
                >
                  Aynı Meydan Okumayı Tekrar Oyna
                </button>
                <button
                  onClick={() => {
                    const nextTarget = challengeTarget === 25 ? 50 : challengeTarget === 50 ? 100 : 'endless';
                    setChallengeTarget(nextTarget);
                    startArcadeGame(nextTarget);
                  }}
                  className="px-8 py-3 bg-white text-black hover:bg-amber-400 font-black text-xs uppercase tracking-wider border-2 border-black transition-colors cursor-pointer neo-shadow-white w-full sm:w-auto"
                >
                  Sıradaki Zorluk Seviyesine Geç →
                </button>
              </div>

              {/* Challenge & Duel Invite Box */}
              <ChallengeInviteBox
                title={`${challengeTarget} Şarkılık Anime Müzik Meydan Okuması`}
                scoreDisplay={`${arcadeScore} Puan`}
                subtitle={`En Yüksek Kombo: ${arcadeMaxCombo}x`}
                challengeType="music_arcade"
                statsData={{ accuracy: typeof challengeTarget === 'number' ? Math.round((arcadeCorrectCount / challengeTarget) * 100) : 100 }}
              />
            </motion.div>
          ) : (
            /* Game Over Screen */
            <div className="bg-black border-4 border-white neo-shadow-white p-8 text-center space-y-5">
              <span className="text-5xl">💀</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                OYUN BİTTİ!
              </h2>
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
                Tüm canların tükendi. İşte bu turdaki başarın:
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-4 bg-neutral-950 border-2 border-white/20 p-4">
                <div>
                  <span className="text-xs text-neutral-400 font-bold uppercase block">Skorun</span>
                  <span className="text-2xl font-black text-amber-400">{arcadeScore}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 font-bold uppercase block">İlerleme</span>
                  <span className="text-2xl font-black text-white">
                    {arcadeIndex + 1} {typeof challengeTarget === 'number' ? `/ ${challengeTarget}` : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={() => startArcadeGame(challengeTarget)}
                className="px-8 py-3 bg-white text-black hover:bg-amber-400 font-black text-sm uppercase tracking-wider border-4 border-black transition-colors cursor-pointer neo-shadow-white"
              >
                Yeniden Oyna
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
