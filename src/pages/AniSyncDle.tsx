import React, { useState, useEffect, useMemo } from 'react';
import { BlurredImage } from '../components/BlurredImage';
import { PageMeta } from '../components/PageMeta';
import { GuessInput } from '../components/GuessInput';
import { StatsModal } from '../components/StatsModal';
import { ChallengeInviteBox } from '../components/ChallengeInviteBox';
import {
  getDailyCharacter,
  getPracticeCharacter,
  getCharacterHints,
  matchesCharacter,
  normalizeCharacterName,
  type DleCharacter,
} from '../data/charactersPool';
import { getDailyDateKey, getPreviousDateKey, diffDateKeys } from '../lib/dailyDate';
import { useToastStore } from '../store/useToastStore';
import {
  Trophy, Sparkles, RefreshCw, HelpCircle, CheckCircle2, XCircle, Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { trackConversionOnce } from '../lib/analytics';
import { useXpStore } from '../store/useXpStore';
import type { DifficultyTier } from '../lib/characterOrder';

const STATS_KEY = 'anisyncdle_stats_v1';
const TODAY_STATE_KEY = 'anisyncdle_today_v3';

/**
 * Zorluğa göre hak sayısı: beklenen bilinirlik düştükçe hak artar.
 * Temel deneme 6; orta 7, zor 8 (zor = daha az bilinen karakter).
 */
const ATTEMPTS_BY_TIER: Record<DifficultyTier, number> = { easy: 6, medium: 7, hard: 8 };

interface DleStats {
  played: number;
  wins: number;
  streak: number;
  maxStreak: number;
  /** Son galibiyetin TR gün anahtarı (YYYY-MM-DD). */
  lastWinDate?: string;
  /** Son günlük oyunun sonucunun kaydedildiği gün (çift sayımı önler). */
  lastResultDate?: string;
}

interface DailyState {
  /** Kaydedilen günün karakteriyle uyuşmayan eski v2 kayıtlarını yok sayar. */
  characterId?: string;
  guesses: string[];
  isCorrect: boolean;
  isGameOver: boolean;
}

const DEFAULT_STATS: DleStats = { played: 0, wins: 0, streak: 0, maxStreak: 0 };

function readStats(): DleStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw) as Partial<DleStats>;
    return {
      played: Number(parsed.played) || 0,
      wins: Number(parsed.wins) || 0,
      streak: Number(parsed.streak) || 0,
      maxStreak: Number(parsed.maxStreak) || 0,
      lastWinDate: typeof parsed.lastWinDate === 'string' ? parsed.lastWinDate : undefined,
      lastResultDate: typeof parsed.lastResultDate === 'string' ? parsed.lastResultDate : undefined,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

function readDailyState(dateKey: string, characterId?: string): DailyState | null {
  try {
    const raw = localStorage.getItem(`${TODAY_STATE_KEY}_${dateKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DailyState>;
    if (!Array.isArray(parsed.guesses)) return null;
    // Günün karakteri değiştiyse kaydı yok say (izinsiz taze oyun).
    if (characterId && typeof parsed.characterId === 'string' && parsed.characterId !== characterId) {
      return null;
    }
    return {
      characterId: typeof parsed.characterId === 'string' ? parsed.characterId : undefined,
      guesses: parsed.guesses.filter((guess): guess is string => typeof guess === 'string'),
      isCorrect: parsed.isCorrect === true,
      isGameOver: parsed.isGameOver === true,
    };
  } catch {
    return null;
  }
}

export const AniSyncDle: React.FC = () => {
  const { addToast } = useToastStore();
  const { t, currentLang } = useAppTranslation();

  // TR takvim günü: gece 00:00'da (UTC+3) sıfırlanır, UTC'de 03:00'te değil.
  const todayKey = getDailyDateKey();
  const dailyCharacter = useMemo(() => getDailyCharacter(), [todayKey]);
  const { award } = useXpStore();

  const [gameMode, setGameMode] = useState<'daily' | 'practice'>('daily');
  const [practiceRound, setPracticeRound] = useState(0);
  // Her antrenman turu için taze oyun anahtarı (XP idempotency anahtarı).
  const [practiceKey, setPracticeKey] = useState(() => Math.random().toString(36).slice(2, 10));
  const [practiceCharacter, setPracticeCharacter] = useState(() => getPracticeCharacter(0, dailyCharacter.id));

  const character: DleCharacter = gameMode === 'daily' ? dailyCharacter : practiceCharacter;
  const hints = getCharacterHints(character, currentLang);

  const difficulty: DifficultyTier = character.difficulty;
  const maxAttempts = ATTEMPTS_BY_TIER[difficulty];
  const hint1At = Math.ceil(maxAttempts / 3);
  const hint2At = Math.ceil((2 * maxAttempts) / 3);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [stats, setStats] = useState<DleStats>(readStats);

  // Günlük moda dönüldüğünde bugünün kaydını geri yükle; antrenman temiz başlar.
  useEffect(() => {
    if (gameMode !== 'daily') {
      setGuesses([]);
      setIsCorrect(false);
      setIsGameOver(false);
      return;
    }
    const saved = readDailyState(todayKey, dailyCharacter.id);
    setGuesses(saved?.guesses ?? []);
    setIsCorrect(saved?.isCorrect ?? false);
    setIsGameOver(saved?.isGameOver ?? false);
  }, [gameMode, todayKey, dailyCharacter.id]);

  // Kaçırılan günlerde seri görünürde sıfırlanır (kayıt silinmez).
  const activeStreak = useMemo(() => {
    if (!stats.lastWinDate) return 0;
    const gap = diffDateKeys(stats.lastWinDate, todayKey);
    return gap === 0 || gap === 1 ? stats.streak : 0;
  }, [stats.lastWinDate, stats.streak, todayKey]);

  const blurLevel = isCorrect || isGameOver ? 0 : Math.max(0, 24 - guesses.length * 4);

  const persistDailyState = (payload: DailyState) => {
    try {
      localStorage.setItem(
        `${TODAY_STATE_KEY}_${todayKey}`,
        JSON.stringify({ ...payload, characterId: dailyCharacter.id }),
      );
    } catch {
      /* localStorage kapalıysa oyun çalışmaya devam eder */
    }
  };

  /** Oyun bitişi (galibiyet/mağlubiyet) için XP verir ve bildirim gösterir. */
  const awardGameXp = (won: boolean) => {
    const key = gameMode === 'daily' ? `dle_daily:${todayKey}` : `dle_practice:${practiceKey}`;
    const result = award({ action: 'game_finish', key, day: todayKey, difficulty, won });
    if (result.awarded > 0) {
      addToast(t('xp_award_toast', { xp: result.awarded }), 'success');
    }
  };

  /** Yalnızca GÜNLÜK mod sonuçlarını istatistiğe işler. */
  const recordDailyResult = (won: boolean) => {
    setStats((prev) => {
      if (prev.lastResultDate === todayKey) return prev; // aynı gün ikinci kez sayma

      const wonYesterday = prev.lastWinDate === getPreviousDateKey(todayKey);
      const nextStreak = won ? (wonYesterday ? prev.streak + 1 : 1) : 0;
      const updated: DleStats = {
        played: prev.played + 1,
        wins: prev.wins + (won ? 1 : 0),
        streak: nextStreak,
        maxStreak: Math.max(prev.maxStreak, nextStreak),
        lastWinDate: won ? todayKey : prev.lastWinDate,
        lastResultDate: todayKey,
      };
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(updated));
      } catch {
        /* yoksay */
      }
      return updated;
    });
  };

  const handleGuess = (guessName: string) => {
    if (isGameOver || isCorrect) return;

    const cleaned = guessName.trim();
    const normalized = normalizeCharacterName(cleaned);
    if (!normalized) return;

    if (guesses.some((guess) => normalizeCharacterName(guess) === normalized)) {
      addToast(t('anisyncdle_already_guessed'), 'info');
      return;
    }

    const newGuesses = [...guesses, cleaned];
    setGuesses(newGuesses);

    if (matchesCharacter(character, cleaned)) {
      setIsCorrect(true);
      setIsGameOver(true);
      trackConversionOnce('first_game_finish', 'first_game_finish', {
        surface: 'anisyncdle',
        mode: gameMode,
        result: true,
      });
      addToast(t('anisyncdle_correct_toast', { name: character.name }), 'success');
      awardGameXp(true);

      if (gameMode === 'daily') {
        recordDailyResult(true);
        persistDailyState({ guesses: newGuesses, isCorrect: true, isGameOver: true });
      }
      return;
    }

    if (newGuesses.length >= maxAttempts) {
      setIsGameOver(true);
      trackConversionOnce('first_game_finish', 'first_game_finish', {
        surface: 'anisyncdle',
        mode: gameMode,
        result: false,
      });
      addToast(
        t('anisyncdle_out_of_attempts_toast', { name: character.name, series: character.series }),
        'error',
      );
      awardGameXp(false);
      if (gameMode === 'daily') {
        recordDailyResult(false);
        persistDailyState({ guesses: newGuesses, isCorrect: false, isGameOver: true });
      }
    } else {
      addToast(t('anisyncdle_wrong_toast', { count: maxAttempts - newGuesses.length }), 'info');
    }
  };

  const switchMode = (mode: 'daily' | 'practice') => {
    if (mode === gameMode) return;
    if (mode === 'practice') {
      setPracticeRound(0);
      setPracticeKey(Math.random().toString(36).slice(2, 10));
      setPracticeCharacter(getPracticeCharacter(0, dailyCharacter.id));
    }
    setGameMode(mode);
  };

  const handleNextPractice = () => {
    const nextRound = practiceRound + 1;
    setPracticeRound(nextRound);
    setPracticeKey(Math.random().toString(36).slice(2, 10));
    setPracticeCharacter((current) => getPracticeCharacter(nextRound, current.id));
    setGuesses([]);
    setIsCorrect(false);
    setIsGameOver(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageMeta title={t('anisyncdle_meta_title')} description={t('anisyncdle_meta_desc')} />

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
            {t('anisyncdle_subtitle')}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex bg-black border-2 border-white overflow-hidden neo-shadow-white">
            <button
              onClick={() => switchMode('daily')}
              className={cn(
                "px-3 py-2 font-black text-xs uppercase cursor-pointer transition-colors",
                gameMode === 'daily' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
              )}
            >
              {t('anisyncdle_daily_mode')}
            </button>
            <button
              onClick={() => switchMode('practice')}
              className={cn(
                "px-3 py-2 font-black text-xs uppercase border-l-2 border-white cursor-pointer transition-colors",
                gameMode === 'practice' ? "bg-amber-400 text-black" : "text-white hover:bg-neutral-900"
              )}
            >
              {t('anisyncdle_practice_mode')}
            </button>
          </div>

          {/* Stats Button */}
          <button
            onClick={() => setIsStatsOpen(true)}
            className="p-2.5 bg-black hover:bg-white hover:text-black text-white border-2 border-white transition-colors cursor-pointer neo-shadow-white"
            title={t('anisyncdle_stats_title')}
          >
            <Trophy size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {gameMode === 'practice' && (
        <div className="bg-cyan-500 border-2 border-white px-4 py-2 text-black font-black text-xs uppercase tracking-wide">
          {t('anisyncdle_practice_note')}
        </div>
      )}

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Poster Reveal */}
        <div className="md:col-span-6 space-y-4">
          <BlurredImage
            imageUrl={character.imageUrl}
            blurLevel={blurLevel}
            alt={t('anisyncdle_poster_alt')}
            isRevealed={isCorrect || isGameOver}
          />

          {/* Practice Next Button */}
          {gameMode === 'practice' && (isCorrect || isGameOver) && (
            <button
              onClick={handleNextPractice}
              className="w-full py-3 bg-amber-400 hover:bg-white text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all neo-shadow-white cursor-pointer"
            >
              <RefreshCw size={16} strokeWidth={3} />
              <span>{t('anisyncdle_next_character')}</span>
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
                <span>{t('anisyncdle_won_title')}</span>
              </div>
              <p className="text-sm uppercase tracking-wide">
                {t('anisyncdle_character_label')} <span lang="en" className="underline">{character.name}</span> (<span lang="en">{character.series}</span>)
              </p>
              <p className="text-xs font-bold mt-2">
                {t('anisyncdle_won_desc', { count: guesses.length })}
              </p>
            </div>
          ) : isGameOver ? (
            <div className="bg-rose-600 border-4 border-white neo-shadow-white p-4 text-white font-black">
              <div className="flex items-center gap-2 text-lg uppercase mb-1">
                <XCircle size={24} strokeWidth={3} />
                <span>{t('anisyncdle_game_over')}</span>
              </div>
              <p className="text-sm uppercase tracking-wide">
                {t('anisyncdle_correct_character')} <span lang="en" className="underline">{character.name}</span> (<span lang="en">{character.series}</span>)
              </p>
            </div>
          ) : (
            <div className="bg-neutral-900 border-2 border-white p-4 flex items-center justify-between text-white">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">{t('anisyncdle_remaining_attempts')}</span>
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
              <span>{t('anisyncdle_hints_title')}</span>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between p-2 bg-neutral-900 border border-white/20">
                <span className="text-neutral-400 uppercase">{t('anisyncdle_genre_label')}</span>
                <span lang="en" className="text-white font-black uppercase">{character.genre}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-neutral-900 border border-white/20">
                <span className="text-neutral-400 uppercase">{t('xp_difficulty_label')}</span>
                <span
                  title={t('xp_dle_attempts_note')}
                  className={cn(
                    'font-black uppercase px-2 py-0.5 border inline-flex items-center gap-1',
                    difficulty === 'easy' && 'bg-emerald-500 text-black border-white',
                    difficulty === 'medium' && 'bg-amber-400 text-black border-white',
                    difficulty === 'hard' && 'bg-rose-600 text-white border-white',
                  )}
                >
                  <Shield size={12} strokeWidth={2.5} />
                  {t(`difficulty_${difficulty}`)} · {maxAttempts}
                </span>
              </div>

              {/* Hint 1: Unlocked at ~1/3 of attempts */}
              <div className={cn(
                "p-2 border transition-all",
                guesses.length >= hint1At || isGameOver
                  ? "bg-neutral-900 border-white/40 text-white"
                  : "bg-neutral-950 border-white/10 text-neutral-600"
              )}>
                <span className="text-neutral-400 uppercase block text-[10px] mb-0.5">{t('anisyncdle_hint_1_label')}</span>
                <span>{guesses.length >= hint1At || isGameOver ? hints[0] : t('anisyncdle_hint_1_locked')}</span>
              </div>

              {/* Hint 2: Unlocked at ~2/3 of attempts */}
              <div className={cn(
                "p-2 border transition-all",
                guesses.length >= hint2At || isGameOver
                  ? "bg-neutral-900 border-white/40 text-white"
                  : "bg-neutral-950 border-white/10 text-neutral-600"
              )}>
                <span className="text-neutral-400 uppercase block text-[10px] mb-0.5">{t('anisyncdle_hint_2_label')}</span>
                <span>{guesses.length >= hint2At || isGameOver ? hints[1] : t('anisyncdle_hint_2_locked')}</span>
              </div>
            </div>
          </div>

          {/* Guess Input Component */}
          <GuessInput onGuess={handleGuess} disabled={isGameOver || isCorrect} />

          {/* Guesses Log */}
          {guesses.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                {t('anisyncdle_guesses_log', { count: guesses.length })}
              </span>
              <div className="space-y-1.5">
                {guesses.map((g, idx) => {
                  const match = matchesCharacter(character, g);
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
                        <span lang="en">{g}</span>
                      </div>
                      {match ? (
                        <span className="flex items-center gap-1 text-[11px] font-black">
                          <CheckCircle2 size={14} /> {t('anisyncdle_correct_badge')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px] font-black">
                          <XCircle size={14} /> {t('anisyncdle_wrong_badge')}
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
            title={t('anisyncdle_challenge_title')}
            scoreDisplay={isCorrect ? t('anisyncdle_challenge_score_win', { guesses: guesses.length, max: maxAttempts }) : t('anisyncdle_challenge_score_lose', { count: guesses.length })}
            subtitle={t('anisyncdle_challenge_subtitle')}
            challengeType="anisync_dle"
            statsData={{ streak: activeStreak }}
          />
        </div>
      </div>

      {/* Stats Modal */}
      {isStatsOpen && (
        <StatsModal
          onClose={() => setIsStatsOpen(false)}
          stats={{
            played: stats.played,
            wins: stats.wins,
            streak: activeStreak,
            maxStreak: stats.maxStreak,
          }}
        />
      )}
    </div>
  );
};
