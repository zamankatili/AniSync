import { create } from 'zustand';
import { QuizSong, QUIZ_SONGS, getDailyQuizSong, DAILY_UNLOCK_STAGES, generateArcadePlaylist } from '../data/musicQuizData';

export type ChallengeTarget = 25 | 50 | 100 | 'endless';

interface QuizState {
  // Mode selection
  activeMode: 'daily' | 'arcade';
  setActiveMode: (mode: 'daily' | 'arcade') => void;

  // Daily Mode
  dailySong: QuizSong;
  dailyCurrentStage: number; // 0 to 5
  dailyGuesses: Array<{ text: string; correct: boolean; skipped?: boolean }>;
  dailyCompleted: boolean;
  dailyWon: boolean;
  dailyStreak: number;
  dailyLastPlayed: string;
  submitDailyGuess: (guess: string) => boolean;
  skipDailyStage: () => void;
  resetDailyForDebug?: () => void;

  // Arcade / Challenge Mode
  challengeTarget: ChallengeTarget;
  setChallengeTarget: (target: ChallengeTarget) => void;
  arcadeSongs: QuizSong[];
  arcadeIndex: number;
  arcadeScore: number;
  arcadeCombo: number;
  arcadeMaxCombo: number;
  arcadeLives: number;
  arcadeHighScore: number;
  arcadeGameOver: boolean;
  arcadeChallengeWon: boolean;
  arcadeCorrectCount: number;
  arcadeLastCorrect: boolean | null;
  completedChallenges: Record<string, { bestScore: number; bestAccuracy: number; date: string }>;
  startArcadeGame: (target?: ChallengeTarget) => void;
  submitArcadeAnswer: (answer: string, timeLeftBonus: number) => boolean;
  nextArcadeQuestion: () => void;

  // Overall Stats
  stats: {
    totalPlayed: number;
    totalWins: number;
    currentStreak: number;
    maxStreak: number;
    arcadeHighScore: number;
  };
}

const LOCAL_STORAGE_KEY = 'anisync_music_quiz_state';

const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useQuizStore = create<QuizState>((set, get) => {
  const saved = loadSavedState();
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailySong = getDailyQuizSong(todayStr);

  const isTodaySameAsSaved = saved?.dailyLastPlayed === todayStr;

  const initialDailyGuesses = isTodaySameAsSaved ? (saved.dailyGuesses || []) : [];
  const initialDailyCompleted = isTodaySameAsSaved ? (saved.dailyCompleted || false) : false;
  const initialDailyWon = isTodaySameAsSaved ? (saved.dailyWon || false) : false;
  const initialDailyStage = isTodaySameAsSaved ? (saved.dailyCurrentStage || 0) : 0;
  const initialDailyStreak = saved?.dailyStreak || 0;

  const initialCompletedChallenges = saved?.completedChallenges || {};

  const initialStats = saved?.stats || {
    totalPlayed: 0,
    totalWins: 0,
    currentStreak: 0,
    maxStreak: 0,
    arcadeHighScore: saved?.arcadeHighScore || 0,
  };

  const saveToDisk = (partial: any) => {
    try {
      const current = get();
      const payload = {
        dailyLastPlayed: todayStr,
        dailyGuesses: current.dailyGuesses,
        dailyCompleted: current.dailyCompleted,
        dailyWon: current.dailyWon,
        dailyCurrentStage: current.dailyCurrentStage,
        dailyStreak: current.dailyStreak,
        arcadeHighScore: current.arcadeHighScore,
        completedChallenges: current.completedChallenges,
        stats: current.stats,
        ...partial
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Could not save quiz state", e);
    }
  };

  return {
    activeMode: 'daily',
    setActiveMode: (mode) => set({ activeMode: mode }),

    dailySong,
    dailyCurrentStage: initialDailyStage,
    dailyGuesses: initialDailyGuesses,
    dailyCompleted: initialDailyCompleted,
    dailyWon: initialDailyWon,
    dailyStreak: initialDailyStreak,
    dailyLastPlayed: todayStr,

    submitDailyGuess: (guess: string) => {
      const state = get();
      if (state.dailyCompleted) return false;

      const isCorrect = guess.toLowerCase().trim() === state.dailySong.animeTitle.toLowerCase().trim() ||
        guess.toLowerCase().trim() === state.dailySong.animeTitleTR.toLowerCase().trim();

      const newGuesses = [...state.dailyGuesses, { text: guess, correct: isCorrect }];
      const isWon = isCorrect;
      const isFinished = isWon || newGuesses.length >= DAILY_UNLOCK_STAGES.length;

      const nextStage = isFinished ? state.dailyCurrentStage : Math.min(DAILY_UNLOCK_STAGES.length - 1, state.dailyCurrentStage + 1);

      let newStreak = state.dailyStreak;
      let newStats = { ...state.stats };

      if (isFinished) {
        newStats.totalPlayed += 1;
        if (isWon) {
          newStreak += 1;
          newStats.totalWins += 1;
          newStats.currentStreak = newStreak;
          newStats.maxStreak = Math.max(newStats.maxStreak, newStreak);
        } else {
          newStreak = 0;
          newStats.currentStreak = 0;
        }
      }

      set({
        dailyGuesses: newGuesses,
        dailyCurrentStage: nextStage,
        dailyCompleted: isFinished,
        dailyWon: isWon,
        dailyStreak: newStreak,
        stats: newStats
      });

      saveToDisk({
        dailyGuesses: newGuesses,
        dailyCurrentStage: nextStage,
        dailyCompleted: isFinished,
        dailyWon: isWon,
        dailyStreak: newStreak,
        stats: newStats
      });

      return isCorrect;
    },

    skipDailyStage: () => {
      const state = get();
      if (state.dailyCompleted) return;

      const newGuesses = [...state.dailyGuesses, { text: 'PAS GEÇİLDİ', correct: false, skipped: true }];
      const isFinished = newGuesses.length >= DAILY_UNLOCK_STAGES.length;
      const nextStage = isFinished ? state.dailyCurrentStage : Math.min(DAILY_UNLOCK_STAGES.length - 1, state.dailyCurrentStage + 1);

      let newStreak = state.dailyStreak;
      let newStats = { ...state.stats };

      if (isFinished) {
        newStats.totalPlayed += 1;
        newStreak = 0;
        newStats.currentStreak = 0;
      }

      set({
        dailyGuesses: newGuesses,
        dailyCurrentStage: nextStage,
        dailyCompleted: isFinished,
        dailyWon: false,
        dailyStreak: newStreak,
        stats: newStats
      });

      saveToDisk({
        dailyGuesses: newGuesses,
        dailyCurrentStage: nextStage,
        dailyCompleted: isFinished,
        dailyWon: false,
        dailyStreak: newStreak,
        stats: newStats
      });
    },

    // Arcade & Challenge State
    challengeTarget: 25,
    setChallengeTarget: (target) => set({ challengeTarget: target }),
    arcadeSongs: generateArcadePlaylist(25),
    arcadeIndex: 0,
    arcadeScore: 0,
    arcadeCombo: 0,
    arcadeMaxCombo: 0,
    arcadeLives: 3,
    arcadeHighScore: initialStats.arcadeHighScore || 0,
    arcadeGameOver: false,
    arcadeChallengeWon: false,
    arcadeCorrectCount: 0,
    arcadeLastCorrect: null,
    completedChallenges: initialCompletedChallenges,

    startArcadeGame: (target?: ChallengeTarget) => {
      const currentTarget = target || get().challengeTarget || 25;
      const playlistSize = currentTarget === 'endless' ? 100 : currentTarget;
      const playlist = generateArcadePlaylist(playlistSize);

      set({
        challengeTarget: currentTarget,
        arcadeSongs: playlist,
        arcadeIndex: 0,
        arcadeScore: 0,
        arcadeCombo: 0,
        arcadeMaxCombo: 0,
        arcadeLives: 3,
        arcadeGameOver: false,
        arcadeChallengeWon: false,
        arcadeCorrectCount: 0,
        arcadeLastCorrect: null
      });
    },

    submitArcadeAnswer: (answer: string, timeLeftBonus: number) => {
      const state = get();
      if (state.arcadeGameOver) return false;

      const currentSong = state.arcadeSongs[state.arcadeIndex];
      const isCorrect = answer.toLowerCase().trim() === currentSong.animeTitle.toLowerCase().trim();

      let newScore = state.arcadeScore;
      let newCombo = state.arcadeCombo;
      let newMaxCombo = state.arcadeMaxCombo;
      let newLives = state.arcadeLives;
      let newCorrectCount = state.arcadeCorrectCount;
      let isGameOver = false;
      let isChallengeWon = false;

      if (isCorrect) {
        newCorrectCount += 1;
        newCombo += 1;
        newMaxCombo = Math.max(newMaxCombo, newCombo);
        const comboMultiplier = Math.min(4, 1 + (newCombo - 1) * 0.25);
        const roundPoints = Math.round((500 + timeLeftBonus * 50) * comboMultiplier);
        newScore += roundPoints;
      } else {
        newCombo = 0;
        newLives -= 1;
        if (newLives <= 0) {
          isGameOver = true;
        }
      }

      // Check challenge target completion
      const targetNum = state.challengeTarget;
      if (!isGameOver && typeof targetNum === 'number' && state.arcadeIndex + 1 >= targetNum) {
        isGameOver = true;
        isChallengeWon = true;
      }

      const newHighScore = Math.max(state.arcadeHighScore, newScore);
      const updatedStats = {
        ...state.stats,
        arcadeHighScore: newHighScore
      };

      const updatedCompleted = { ...state.completedChallenges };

      if (isChallengeWon && typeof targetNum === 'number') {
        const key = `${targetNum}`;
        const accuracy = Math.round((newCorrectCount / targetNum) * 100);
        const existing = updatedCompleted[key];

        if (!existing || newScore > existing.bestScore) {
          updatedCompleted[key] = {
            bestScore: newScore,
            bestAccuracy: accuracy,
            date: new Date().toISOString()
          };
        }
      }

      set({
        arcadeScore: newScore,
        arcadeCombo: newCombo,
        arcadeMaxCombo: newMaxCombo,
        arcadeLives: newLives,
        arcadeHighScore: newHighScore,
        arcadeCorrectCount: newCorrectCount,
        arcadeGameOver: isGameOver,
        arcadeChallengeWon: isChallengeWon,
        arcadeLastCorrect: isCorrect,
        completedChallenges: updatedCompleted,
        stats: updatedStats
      });

      saveToDisk({
        arcadeHighScore: newHighScore,
        completedChallenges: updatedCompleted,
        stats: updatedStats
      });

      return isCorrect;
    },

    nextArcadeQuestion: () => {
      const state = get();
      if (state.arcadeGameOver) return;

      const nextIndex = state.arcadeIndex + 1;
      const targetNum = state.challengeTarget;

      if (typeof targetNum === 'number' && nextIndex >= targetNum) {
        // Challenge finished
        set({ arcadeGameOver: true, arcadeChallengeWon: true });
        return;
      }

      if (nextIndex >= state.arcadeSongs.length) {
        // Continuous generation for endless
        const extraSongs = generateArcadePlaylist(50);
        set({
          arcadeSongs: [...state.arcadeSongs, ...extraSongs],
          arcadeIndex: nextIndex,
          arcadeLastCorrect: null
        });
      } else {
        set({
          arcadeIndex: nextIndex,
          arcadeLastCorrect: null
        });
      }
    },

    stats: initialStats
  };
});
