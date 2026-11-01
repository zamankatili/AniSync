import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { BlurredImage } from '../components/BlurredImage';
import { GuessInput } from '../components/GuessInput';
import { StatsModal } from '../components/StatsModal';
import { ChallengeInviteBox } from '../components/ChallengeInviteBox';
import { getDailyCharacter, CHARACTERS_POOL } from '../data/charactersPool';
import { useToastStore } from '../store/useToastStore';
import { 
  Trophy, Flame, Sparkles, RefreshCw, HelpCircle, CheckCircle2, 
  XCircle, Share2, Eye, ShieldAlert, Award, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

const STATS_KEY = 'anisyncdle_stats_v1';
const TODAY_STATE_KEY = 'anisyncdle_today_v1';

export const AniSyncDle: React.FC = () => {
  const { addToast } = useToastStore();
  const [gameMode, setGameMode] = useState<'daily' | 'practice'>('daily');
  const [practiceIndex, setPracticeIndex] = useState(0);

  const character = useMemo(() => {
    if (gameMode === 'daily') {
      return getDailyCharacter();
    }
    return CHARACTERS_POOL[practiceIndex % CHARACTERS_POOL.length];
  }, [gameMode, practiceIndex]);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Stats State
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_e) {}
    return { played: 0, wins: 0, streak: 0, maxStreak: 0 };
  });

  // Load today's game state if in daily mode
  useEffect(() => {
    if (gameMode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      try {
        const saved = localStorage.getItem(`${TODAY_STATE_KEY}_${today}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setGuesses(parsed.guesses || []);
          setIsCorrect(!!parsed.isCorrect);
          setIsGameOver(!!parsed.isGameOver);
        }
      } catch (_e) {}
    } else {
      setGuesses([]);
      setIsCorrect(false);
      setIsGameOver(false);
    }
  }, [gameMode]);

  const maxAttempts = 6;
  const blurLevel = isCorrect 
    ? 0 
    : isGameOver 
      ? 0 
      : Math.max(0, 24 - (guesses.length * 4));

  const handleGuess = (guessName: string) => {
    if (isGameOver || isCorrect) return;

    const newGuesses = [...guesses, guessName];
    setGuesses(newGuesses);

    const isMatch = guessName.trim().toLowerCase() === character.name.toLowerCase();

    if (isMatch) {
      setIsCorrect(true);
      setIsGameOver(true);
      addToast(`🎉 Tebrikler! Doğru tahmin: ${character.name}!`, 'success');

      // Update stats
      setStats((prev: any) => {
        const nextWins = prev.wins + 1;
        const nextStreak = prev.streak + 1;
        const updated = {
          played: prev.played + 1,
          wins: nextWins,
          streak: nextStreak,
          maxStreak: Math.max(prev.maxStreak, nextStreak)
        };
        localStorage.setItem(STATS_KEY, JSON.stringify(updated));
        return updated;
      });

      if (gameMode === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`${TODAY_STATE_KEY}_${today}`, JSON.stringify({
          guesses: newGuesses,
          isCorrect: true,
          isGameOver: true
        }));
      }
    } else {
      if (newGuesses.length >= maxAttempts) {
        setIsGameOver(true);
        addToast(`❌ Haklarınız bitti. Karakter: ${character.name} (${character.series})`, 'error');

        setStats((prev: any) => {
          const updated = {
            ...prev,
            played: prev.played + 1,
            streak: 0
          };
          localStorage.setItem(STATS_KEY, JSON.stringify(updated));
          return updated;
        });

        if (gameMode === 'daily') {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(`${TODAY_STATE_KEY}_${today}`, JSON.stringify({
            guesses: newGuesses,
            isCorrect: false,
            isGameOver: true
          }));
        }
      } else {
        addToast(`Yanlış tahmin! Görsel biraz daha netleşti. (${maxAttempts - newGuesses.length} hak kaldı)`, 'info');
      }
    }
  };

  const handleNextPractice = () => {
    setPracticeIndex((prev) => (prev + 1) % CHARACTERS_POOL.length);
    setGuesses([]);
    setIsCorrect(false);
    setIsGameOver(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Helmet>
        <title>AniSyncDle - Günlük Anime Karakter Tahmin Oyunu</title>
        <meta name="description" content="Pikselleştirilmiş ve bulanık anime posterinden günün anime karakterini tahmin et! Arkadaşlarınla yarış, serini koru." />
      </Helmet>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-white/20 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 border-2 border-white bg-amber-400 text-black flex items-center justify-center font-black neo-shadow-white">
              <Sparkles size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
              ANISYNCDLE
            </h1>
            <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase shadow-[2px_2px_0px_0px_#fff]">
              BLUR REVEAL
            </span>
          </div>
          <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">
            Bulanık posterden anime karakterini ve serisini tahmin et, serini büyüt
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex bg-black border-2 border-white overflow-hidden neo-shadow-white">
            <button
              onClick={() => setGameMode('daily')}
              className={cn(
                "px-3 py-2 font-black text-xs uppercase cursor-pointer transition-colors",
                gameMode === 'daily' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
              )}
            >
              GÜNLÜK MOD
            </button>
            <button
              onClick={() => setGameMode('practice')}
              className={cn(
                "px-3 py-2 font-black text-xs uppercase border-l-2 border-white cursor-pointer transition-colors",
                gameMode === 'practice' ? "bg-amber-400 text-black" : "text-white hover:bg-neutral-900"
              )}
            >
              ANTRENMAN
            </button>
          </div>

          {/* Stats Button */}
          <button
            onClick={() => setIsStatsOpen(true)}
            className="p-2.5 bg-black hover:bg-white hover:text-black text-white border-2 border-white transition-colors cursor-pointer neo-shadow-white"
            title="İstatistikler"
          >
            <Trophy size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Poster Reveal */}
        <div className="md:col-span-6 space-y-4">
          <BlurredImage
            imageUrl={character.imageUrl}
            blurLevel={blurLevel}
            alt="Anime Karakteri"
            isRevealed={isCorrect || isGameOver}
          />

          {/* Practice Next Button */}
          {gameMode === 'practice' && (isCorrect || isGameOver) && (
            <button
              onClick={handleNextPractice}
              className="w-full py-3 bg-amber-400 hover:bg-white text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all neo-shadow-white cursor-pointer"
            >
              <RefreshCw size={16} strokeWidth={3} />
              <span>SIRADAKİ KARAKTER</span>
            </button>
          )}
        </div>

        {/* Right Column: Hints, Inputs & History */}
        <div className="md:col-span-6 space-y-5">
          {/* Game Status Banner */}
          {isCorrect ? (
            <div className="bg-emerald-500 border-4 border-white neo-shadow-white p-4 text-black font-black">
              <div className="flex items-center gap-2 text-lg uppercase mb-1">
                <CheckCircle2 size={24} strokeWidth={3} />
                <span>TEBRİKLER! BİLDİNİZ!</span>
              </div>
              <p className="text-sm uppercase tracking-wide">
                Karakter: <span className="underline">{character.name}</span> ({character.series})
              </p>
              <p className="text-xs font-bold mt-2">
                {guesses.length} denemede başarıyla tamamlandı!
              </p>
            </div>
          ) : isGameOver ? (
            <div className="bg-rose-600 border-4 border-white neo-shadow-white p-4 text-white font-black">
              <div className="flex items-center gap-2 text-lg uppercase mb-1">
                <XCircle size={24} strokeWidth={3} />
                <span>OYUN BİTTİ!</span>
              </div>
              <p className="text-sm uppercase tracking-wide">
                Doğru Karakter: <span className="underline">{character.name}</span> ({character.series})
              </p>
            </div>
          ) : (
            <div className="bg-neutral-900 border-2 border-white p-4 flex items-center justify-between text-white">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">Kalan Hak</span>
                <span className="text-2xl font-black text-amber-400">{maxAttempts - guesses.length} / {maxAttempts}</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: maxAttempts }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-6 border-2 border-white",
                      i < guesses.length 
                        ? (i === guesses.length - 1 && isCorrect ? "bg-emerald-400" : "bg-rose-500") 
                        : "bg-neutral-800"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Progressive Clues & Hints */}
          <div className="bg-black border-4 border-white p-4 neo-shadow-white space-y-3">
            <div className="flex items-center gap-2 text-white font-black uppercase text-xs tracking-wider border-b border-white/20 pb-2">
              <HelpCircle size={15} className="text-amber-400" strokeWidth={2.5} />
              <span>İPUÇLARI & DETAYLAR</span>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between p-2 bg-neutral-900 border border-white/20">
                <span className="text-neutral-400 uppercase">Tür / Kategori:</span>
                <span className="text-white font-black uppercase">{character.genre}</span>
              </div>

              {/* Hint 1: Unlocked at 2 wrong guesses */}
              <div className={cn(
                "p-2 border transition-all",
                guesses.length >= 2 || isGameOver
                  ? "bg-neutral-900 border-white/40 text-white"
                  : "bg-neutral-950 border-white/10 text-neutral-600"
              )}>
                <span className="text-neutral-400 uppercase block text-[10px] mb-0.5">1. İpucu (2. Yanlıştan Sonra):</span>
                <span>{guesses.length >= 2 || isGameOver ? character.hints[0] : "🔒 2 yanlış tahminden sonra açılır"}</span>
              </div>

              {/* Hint 2: Unlocked at 4 wrong guesses */}
              <div className={cn(
                "p-2 border transition-all",
                guesses.length >= 4 || isGameOver
                  ? "bg-neutral-900 border-white/40 text-white"
                  : "bg-neutral-950 border-white/10 text-neutral-600"
              )}>
                <span className="text-neutral-400 uppercase block text-[10px] mb-0.5">2. İpucu (4. Yanlıştan Sonra):</span>
                <span>{guesses.length >= 4 || isGameOver ? character.hints[1] : "🔒 4 yanlış tahminden sonra açılır"}</span>
              </div>
            </div>
          </div>

          {/* Guess Input Component */}
          <GuessInput onGuess={handleGuess} disabled={isGameOver || isCorrect} />

          {/* Guesses Log */}
          {guesses.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                Yapılan Tahminler ({guesses.length}):
              </span>
              <div className="space-y-1.5">
                {guesses.map((g, idx) => {
                  const match = g.toLowerCase() === character.name.toLowerCase();
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2.5 border-2 flex items-center justify-between text-xs font-black uppercase",
                        match 
                          ? "bg-emerald-500 text-black border-white neo-shadow-white" 
                          : "bg-neutral-900 text-white border-white/40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400 text-[10px]">#{idx + 1}</span>
                        <span>{g}</span>
                      </div>
                      {match ? (
                        <span className="flex items-center gap-1 text-[11px] font-black">
                          <CheckCircle2 size={14} /> DOĞRU!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px] font-black">
                          <XCircle size={14} /> YANLIŞ
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Challenge Box */}
          <ChallengeInviteBox
            title="AniSyncDle Karakter Düellosu"
            scoreDisplay={isCorrect ? `${guesses.length}/${maxAttempts} Tahminde Bildi` : `${guesses.length} Deneme`}
            subtitle="Pikselleştirilmiş ve bulanık anime posterinden karakteri bulma yarışması"
            challengeType="anisync_dle"
            statsData={{ streak: stats.streak }}
          />
        </div>
      </div>

      {/* Stats Modal */}
      {isStatsOpen && (
        <StatsModal
          onClose={() => setIsStatsOpen(false)}
          stats={stats}
        />
      )}
    </div>
  );
};
