import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  WEEKLY_50_CHALLENGE_BANK, 
  WEEK_DAYS_CONFIG, 
  ChallengeQuestion, 
  DayMetadata 
} from '../data/weeklyChallengeBank';

export interface UserAnswerRecord {
  questionId: string;
  selectedOptionId: string;
  isCorrect?: boolean;
  answeredAt: string;
}

export interface ChallengeBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

interface WeeklyChallengeState {
  // Answers mapped by questionId
  answers: Record<string, UserAnswerRecord>;
  
  // Selected day index to view/play (0-7: 0:Pzt ... 6:Paz, 7:Final)
  selectedDayIndex: number;

  // Additional live votes cast by user (questionId -> optionId -> number of extra votes)
  extraVotes: Record<string, Record<string, number>>;

  // User streak (days where all 6 questions were answered)
  streakDays: number;
  lastCompletedDateStr: string | null;

  // Earned total XP from challenge
  totalChallengeXp: number;

  // Actions
  selectDay: (dayIndex: number) => void;
  answerQuestion: (questionId: string, optionId: string) => { isCorrect?: boolean; xpEarned: number; isFirstAnswer: boolean };
  isQuestionAnswered: (questionId: string) => boolean;
  getUserAnswer: (questionId: string) => UserAnswerRecord | undefined;
  
  // Day-level getters
  getDayQuestions: (dayIndex?: number) => ChallengeQuestion[];
  isDayCompleted: (dayIndex: number) => boolean;
  getDayProgress: (dayIndex: number) => { completed: number; total: number; percent: number; isFullyDone: boolean };
  
  // Overall week-level getters
  getOverallProgress: () => {
    completedCount: number;
    totalCount: number;
    percent: number;
    completedDaysCount: number;
    isGrandMaster: boolean;
  };

  // Badge list
  getBadges: () => ChallengeBadge[];

  // Helper for option votes (original votes + extra votes)
  getOptionVotes: (questionId: string, optionId: string, baseVotes: number) => number;
  getTotalQuestionVotes: (question: ChallengeQuestion) => number;

  // Reset or clear
  resetProgress: () => void;
}

export const useWeeklyChallengeStore = create<WeeklyChallengeState>()(
  persist(
    (set, get) => {
      // Calculate default day based on current date
      const getTodayIndex = () => {
        const jsDay = new Date().getDay();
        return jsDay === 0 ? 6 : jsDay - 1;
      };

      return {
        answers: {},
        selectedDayIndex: getTodayIndex(),
        extraVotes: {},
        streakDays: 1,
        lastCompletedDateStr: null,
        totalChallengeXp: 0,

        selectDay: (dayIndex: number) => {
          if (dayIndex >= 0 && dayIndex <= 7) {
            set({ selectedDayIndex: dayIndex });
          }
        },

        answerQuestion: (questionId: string, optionId: string) => {
          const state = get();
          const isFirstAnswer = !state.answers[questionId];
          const question = WEEKLY_50_CHALLENGE_BANK.find(q => q.id === questionId);

          if (!question) {
            return { isCorrect: false, xpEarned: 0, isFirstAnswer: false };
          }

          const chosenOption = question.options.find(o => o.id === optionId);
          let isCorrect: boolean | undefined = undefined;
          let xpEarned = 10; // Default +10 XP for participating in question

          if (!question.isOpinionPoll) {
            isCorrect = chosenOption?.isCorrect === true;
            if (isCorrect) {
              xpEarned = 15; // Bonus for correct knowledge
            }
          }

          const now = new Date();
          const todayKey = now.toISOString().split('T')[0];

          // Record answer
          const updatedAnswers = {
            ...state.answers,
            [questionId]: {
              questionId,
              selectedOptionId: optionId,
              isCorrect,
              answeredAt: now.toISOString()
            }
          };

          // Record extra vote
          const currentExtra = state.extraVotes[questionId] || {};
          const updatedExtraVotes = {
            ...state.extraVotes,
            [questionId]: {
              ...currentExtra,
              [optionId]: (currentExtra[optionId] || 0) + 1
            }
          };

          // Check if today's day questions are fully completed with this answer
          let newStreak = state.streakDays;
          let newLastCompletedDate = state.lastCompletedDateStr;

          const dayQuestions = WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === question.dayIndex);
          const allDayAnswered = dayQuestions.every(q => updatedAnswers[q.id] !== undefined);

          if (allDayAnswered && state.lastCompletedDateStr !== todayKey) {
            newStreak = (state.streakDays || 0) + 1;
            newLastCompletedDate = todayKey;
            xpEarned += 50; // Daily set completion bonus
          }

          set({
            answers: updatedAnswers,
            extraVotes: updatedExtraVotes,
            totalChallengeXp: state.totalChallengeXp + (isFirstAnswer ? xpEarned : 0),
            streakDays: newStreak,
            lastCompletedDateStr: newLastCompletedDate
          });

          return { isCorrect, xpEarned, isFirstAnswer };
        },

        isQuestionAnswered: (questionId: string) => {
          return !!get().answers[questionId];
        },

        getUserAnswer: (questionId: string) => {
          return get().answers[questionId];
        },

        getDayQuestions: (dayIndex?: number) => {
          const targetIndex = dayIndex !== undefined ? dayIndex : get().selectedDayIndex;
          return WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === targetIndex);
        },

        isDayCompleted: (dayIndex: number) => {
          const answers = get().answers;
          const questions = WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === dayIndex);
          if (questions.length === 0) return false;
          return questions.every(q => answers[q.id] !== undefined);
        },

        getDayProgress: (dayIndex: number) => {
          const answers = get().answers;
          const questions = WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === dayIndex);
          const total = questions.length;
          const completed = questions.filter(q => answers[q.id] !== undefined).length;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          return {
            completed,
            total,
            percent,
            isFullyDone: total > 0 && completed === total
          };
        },

        getOverallProgress: () => {
          const answers = get().answers;
          const totalCount = 50;
          const completedCount = Object.keys(answers).length;
          const percent = Math.min(100, Math.round((completedCount / totalCount) * 100));

          // Check how many of the 8 stages (0-7) are completed
          let completedDaysCount = 0;
          for (let i = 0; i < 8; i++) {
            const dayQs = WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === i);
            if (dayQs.length > 0 && dayQs.every(q => answers[q.id] !== undefined)) {
              completedDaysCount++;
            }
          }

          return {
            completedCount,
            totalCount,
            percent,
            completedDaysCount,
            isGrandMaster: completedCount >= 50
          };
        },

        getOptionVotes: (questionId: string, optionId: string, baseVotes: number) => {
          const extra = get().extraVotes[questionId]?.[optionId] || 0;
          return baseVotes + extra;
        },

        getTotalQuestionVotes: (question: ChallengeQuestion) => {
          const state = get();
          return question.options.reduce((sum, opt) => {
            const extra = state.extraVotes[question.id]?.[opt.id] || 0;
            return sum + (opt.votes || 0) + extra;
          }, 0);
        },

        getBadges: () => {
          const { answers, streakDays } = get();
          const answeredCount = Object.keys(answers).length;

          // Check specific days
          const isMonDone = WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === 0).every(q => answers[q.id]);
          const isTueDone = WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === 1).every(q => answers[q.id]);
          const isFinaleDone = WEEKLY_50_CHALLENGE_BANK.filter(q => q.dayIndex === 7).every(q => answers[q.id]);

          return [
            {
              id: 'first_question',
              title: 'İlk Kıvılcım',
              description: 'Meydan okuma döngüsünde ilk sorunu yanıtla',
              icon: '⚡',
              unlocked: answeredCount >= 1,
              category: 'Başlangıç'
            },
            {
              id: 'daily_set',
              title: 'Gün Fatihi',
              description: 'Günün 6 soruluk meydan okumasını eksiksiz bitir',
              icon: '🛡️',
              unlocked: isMonDone || isTueDone || answeredCount >= 6,
              category: 'Günlük'
            },
            {
              id: 'shounen_master',
              title: 'Güç Şampiyonu',
              description: 'Pazartesi Shounen etabının 6 sorusunu tamamla',
              icon: '🔥',
              unlocked: isMonDone,
              category: 'Tür Uzmanı'
            },
            {
              id: 'seinen_tactician',
              title: 'Zihin Taktisyeni',
              description: 'Salı Seinen etabının 6 sorusunu tamamla',
              icon: '🧠',
              unlocked: isTueDone,
              category: 'Tür Uzmanı'
            },
            {
              id: 'streak_3',
              title: 'Alevli Seri',
              description: 'En az 3 günlük seri elde et',
              icon: '🔥',
              unlocked: streakDays >= 3,
              category: 'İstikrar'
            },
            {
              id: 'half_way',
              title: 'Yarı Yol Otakusu',
              description: '50 sorunun 25\'ini başarıyla tamamla',
              icon: '⚔️',
              unlocked: answeredCount >= 25,
              category: 'İlerleme'
            },
            {
              id: 'fifty_legend',
              title: '50 Soruluk Efsane',
              description: 'Haftalık havuzun 50 sorusunun tamamını tamamla!',
              icon: '👑',
              unlocked: answeredCount >= 50,
              category: 'Efsane'
            }
          ];
        },

        resetProgress: () => {
          set({
            answers: {},
            extraVotes: {},
            totalChallengeXp: 0,
            streakDays: 1,
            lastCompletedDateStr: null
          });
        }
      };
    },
    {
      name: 'anisync_weekly_challenge_v2'
    }
  )
);
