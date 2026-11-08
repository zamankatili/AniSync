import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Trophy, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, 
  Sparkles, Award, ArrowRight, RotateCcw, Share2, HelpCircle, BarChart3, Check
} from 'lucide-react';
import { useWeeklyChallengeStore } from '../store/useWeeklyChallengeStore';
import { WEEK_DAYS_CONFIG, ChallengeQuestion } from '../data/weeklyChallengeBank';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  localizeDayName,
  localizeDayShortName,
  localizeDayTheme,
  localizeDayBadge,
  localizeDayDescription,
  localizeDayCategory,
  localizeDifficulty,
} from '../lib/weeklyChallengeLocalization';

interface WeeklyChallengeWidgetProps {
  onOpenModal?: () => void;
  compact?: boolean;
}

export const WeeklyChallengeWidget: React.FC<WeeklyChallengeWidgetProps> = ({ 
  onOpenModal,
  compact = false 
}) => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { addForumPost } = useAppStore();
  const { t } = useAppTranslation();

  const {
    selectedDayIndex,
    selectDay,
    getDayQuestions,
    answers,
    answerQuestion,
    getDayProgress,
    getOverallProgress,
    streakDays,
    totalChallengeXp
  } = useWeeklyChallengeStore();

  // Active question index within selected day (0 to 5, or 0 to 7 for finale)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);

  const dayQuestions = getDayQuestions(selectedDayIndex);
  const dayConfig = WEEK_DAYS_CONFIG.find(d => d.dayIndex === selectedDayIndex) || WEEK_DAYS_CONFIG[0];
  const dayProgress = getDayProgress(selectedDayIndex);
  const overallProgress = getOverallProgress();

  // Current question safely bounded
  const currentQ: ChallengeQuestion | undefined = dayQuestions[activeQuestionIndex] || dayQuestions[0];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const isCurrentAnswered = !!currentAnswer;

  // Real today index for the "BUGÜN" marker
  const realTodayIndex = (() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  })();

  const handleSelectOption = (optId: string) => {
    if (isCurrentAnswered || !currentQ) return;
    setSelectedOptId(optId);

    const result = answerQuestion(currentQ.id, optId);
    if (!currentQ.isOpinionPoll) {
      if (result.isCorrect) {
        addToast(t('challenge_correct_xp_streak', { xp: result.xpEarned }), 'success');
      } else {
        addToast(t('challenge_wrong_answer_note'), 'info');
      }
    } else {
      addToast(t('challenge_saved_community', { xp: result.xpEarned }), 'success');
    }
  };

  const handleNext = () => {
    if (activeQuestionIndex < dayQuestions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
      setSelectedOptId(null);
    }
  };

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
      setSelectedOptId(null);
    }
  };

  const handleShareDay = () => {
    addForumPost({
      title: t('challenge_share_post_title', { day: localizeDayName(dayConfig.id, dayConfig.name) }),
      content: t('challenge_share_day_content', {
        theme: localizeDayTheme(dayConfig.id, dayConfig.theme),
        xp: totalChallengeXp,
        percent: overallProgress.percent,
      }),
      likes: 0,
      replies: 0,
      category: 'Discussion',
      type: 'discussion'
    });
    addToast(t('challenge_shared_social_toast'), 'success');
  };

  return (
    <div className="bg-black border-4 border-rose-600 neo-shadow-white p-5 md:p-6 mb-8 relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b-2 border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-rose-600 text-white flex items-center justify-center font-black border-2 border-white shrink-0 shadow-[2px_2px_0px_0px_#fff]">
            <Flame size={22} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 border border-white uppercase tracking-wider">
                {t('challenge_daily_6')}
              </span>
              <span className="text-[11px] text-amber-400 font-mono font-bold uppercase tracking-wider">
                {t('challenge_cycle_50')}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
              {t('challenge_weekly_title')}
            </h2>
          </div>
        </div>

        {/* Streak and XP badges */}
        <div className="flex items-center gap-2">
          <div className="bg-neutral-900 border-2 border-white/40 px-3 py-1 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#fff]">
            <Flame size={16} className="text-orange-500 fill-orange-500" />
            <span className="text-xs font-black text-white uppercase">
              {t('challenge_day_streak', { count: streakDays })}
            </span>
          </div>
          <div className="bg-amber-400 text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
            +{totalChallengeXp} XP
          </div>
        </div>
      </div>

      {/* Day Selector Pills (Pzt -> Pazar + Final) */}
      <div className="mb-5">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>{t('challenge_days_6_each')}</span>
          <span className="text-rose-400 font-mono">
            {t('challenge_total_counter', { done: overallProgress.completedCount, percent: overallProgress.percent })}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {WEEK_DAYS_CONFIG.map((day) => {
            const isSelected = selectedDayIndex === day.dayIndex;
            const isToday = realTodayIndex === day.dayIndex;
            const progress = getDayProgress(day.dayIndex);

            return (
              <button
                key={day.id}
                onClick={() => {
                  selectDay(day.dayIndex);
                  setActiveQuestionIndex(0);
                  setSelectedOptId(null);
                }}
                className={cn(
                  "p-2 text-center border-2 transition-all cursor-pointer relative group flex flex-col items-center justify-center",
                  isSelected 
                    ? "bg-white text-black border-white shadow-[2px_2px_0px_0px_#e11d48]" 
                    : "bg-neutral-950 text-neutral-300 border-white/20 hover:border-white hover:bg-neutral-900",
                  progress.isFullyDone && !isSelected && "border-emerald-500/80 bg-emerald-950/20 text-emerald-300"
                )}
              >
                {isToday && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] font-black px-1 border border-white uppercase tracking-tighter">
                    {t('challenge_today')}
                  </span>
                )}
                <div className="font-black text-xs uppercase tracking-wider flex items-center gap-1">
                  {localizeDayShortName(day.id, day.shortName)}
                  {progress.isFullyDone && <Check size={11} strokeWidth={3} className="text-emerald-400" />}
                </div>
                <div className={cn(
                  "text-[9px] font-mono mt-0.5",
                  isSelected ? "text-neutral-700 font-bold" : "text-neutral-500"
                )}>
                  {progress.completed}/{day.questionCount}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Meta Card */}
      <div className="bg-neutral-900 border-2 border-white/30 p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              {localizeDayName(dayConfig.id, dayConfig.name)} • {localizeDayTheme(dayConfig.id, dayConfig.theme)}
            </span>
            <span className={cn("text-[10px] font-black px-2 py-0.5 border uppercase", dayConfig.accentColor)}>
              {localizeDayBadge(dayConfig.id, dayConfig.badge)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">
            {localizeDayDescription(dayConfig.id, dayConfig.description)}
          </p>
        </div>

        {/* Stepper Dots (1 2 3 4 5 6) */}
        <div className="flex items-center gap-1.5">
          {dayQuestions.map((q, idx) => {
            const answered = !!answers[q.id];
            const isCurrent = idx === activeQuestionIndex;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setActiveQuestionIndex(idx);
                  setSelectedOptId(null);
                }}
                className={cn(
                  "w-7 h-7 font-black text-xs border-2 flex items-center justify-center transition-all cursor-pointer",
                  isCurrent 
                    ? "bg-rose-600 text-white border-white scale-110 shadow-[2px_2px_0px_0px_#fff]" 
                    : answered 
                    ? "bg-emerald-600/30 text-emerald-300 border-emerald-500" 
                    : "bg-black text-neutral-400 border-white/20 hover:border-white"
                )}
                title={t('challenge_question_n', { n: idx + 1 })}
              >
                {answered ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Box */}
      {currentQ ? (
        <div className="bg-neutral-950 border-2 border-white p-4 md:p-5 mb-5">
          {/* Question Tag & Difficulty */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-white text-black font-black px-2 py-0.5 text-[10px] uppercase tracking-wider">
                {t('challenge_question_counter', { current: activeQuestionIndex + 1, total: dayQuestions.length })}
              </span>
              <span className="text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                {currentQ.category}
              </span>
              {currentQ.isOpinionPoll ? (
                <span className="bg-purple-900/60 text-purple-200 border border-purple-400 px-2 py-0.5 text-[10px] font-black uppercase">
                  {t('challenge_community_poll')}
                </span>
              ) : (
                <span className="bg-cyan-900/60 text-cyan-200 border border-cyan-400 px-2 py-0.5 text-[10px] font-black uppercase">
                  {t('challenge_knowledge_test')}
                </span>
              )}
            </div>

            <span className={cn(
              "font-mono text-[10px] font-black px-2 py-0.5 border uppercase",
              currentQ.difficulty === 'Zor' ? "border-red-500 text-red-400" :
              currentQ.difficulty === 'Orta' ? "border-amber-400 text-amber-300" : "border-emerald-500 text-emerald-400"
            )}>
              {currentQ.difficulty ? localizeDifficulty(currentQ.difficulty, currentQ.difficulty) : t('difficulty_normal')}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight leading-snug mb-4">
            {currentQ.question}
          </h3>

          {/* Options List */}
          <div className="space-y-2.5 mb-4">
            {(() => {
              const userChosenId = currentAnswer?.selectedOptionId || selectedOptId;

              return currentQ.options.map((opt) => {
                const isSelected = userChosenId === opt.id;

                // Color logic
                let borderStyle = "border-white/20 hover:border-white bg-black";
                let textStyle = "text-white";

                if (isCurrentAnswered) {
                  if (currentQ.isOpinionPoll) {
                    if (isSelected) {
                      borderStyle = "border-purple-400 bg-purple-950/40";
                      textStyle = "text-purple-200";
                    } else {
                      borderStyle = "border-neutral-800 bg-neutral-900/40 opacity-70";
                    }
                  } else {
                    // Knowledge quiz
                    if (opt.isCorrect) {
                      borderStyle = "border-emerald-400 bg-emerald-950/50 shadow-[2px_2px_0px_0px_#10b981]";
                      textStyle = "text-emerald-200 font-black";
                    } else if (isSelected && !opt.isCorrect) {
                      borderStyle = "border-red-500 bg-red-950/40 shadow-[2px_2px_0px_0px_#ef4444]";
                      textStyle = "text-red-200";
                    } else {
                      borderStyle = "border-neutral-800 bg-neutral-900/40 opacity-50";
                    }
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={isCurrentAnswered}
                    className={cn(
                      "w-full text-left p-3.5 border-2 transition-all relative overflow-hidden group cursor-pointer",
                      borderStyle
                    )}
                  >
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-none border-2 flex items-center justify-center shrink-0 font-bold text-xs",
                          isSelected ? "bg-white text-black border-white" : "border-white/40"
                        )}>
                          {isCurrentAnswered && opt.isCorrect && <Check size={12} strokeWidth={3} className="text-emerald-500" />}
                          {isCurrentAnswered && isSelected && !opt.isCorrect && !currentQ.isOpinionPoll && <span className="text-red-500 font-bold">✕</span>}
                        </div>
                        <span className={cn("text-sm md:text-base font-bold uppercase tracking-wide", textStyle)}>
                          {opt.text}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              });
            })()}
          </div>

          {/* Explanation reveal upon answering */}
          {isCurrentAnswered && currentQ.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 border-2 border-amber-400/60 p-3 mb-4 text-xs"
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase tracking-wider mb-1">
                <Sparkles size={14} />
                <span>{t('challenge_info_note')}</span>
              </div>
              <p className="text-neutral-200 leading-relaxed font-medium">
                {currentQ.explanation}
              </p>
            </motion.div>
          )}

          {/* Question Nav controls */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={handlePrev}
              disabled={activeQuestionIndex === 0}
              className="px-3 py-1.5 border-2 border-white/30 text-white text-xs font-black uppercase hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft size={14} /> {t('challenge_prev')}
            </button>

            <span className="text-xs font-mono text-neutral-400">
              {activeQuestionIndex + 1} / {dayQuestions.length}
            </span>

            {activeQuestionIndex < dayQuestions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-white text-black border-2 border-white text-xs font-black uppercase hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1"
              >
                {t('challenge_next')} <ChevronRight size={14} />
              </button>
            ) : dayProgress.isFullyDone ? (
              <button
                onClick={handleShareDay}
                className="px-4 py-1.5 bg-emerald-500 text-black border-2 border-black text-xs font-black uppercase hover:bg-white transition-colors flex items-center gap-1"
              >
                <Share2 size={13} /> {t('challenge_share_day')}
              </button>
            ) : (
              <button
                onClick={() => {
                  // Find first unanswered in day
                  const nextUnanswered = dayQuestions.findIndex(q => !answers[q.id]);
                  if (nextUnanswered !== -1) setActiveQuestionIndex(nextUnanswered);
                }}
                className="px-4 py-1.5 bg-amber-400 text-black border-2 border-black text-xs font-black uppercase hover:bg-white transition-colors"
              >
                {t('challenge_find_unanswered')}
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Bottom CTA to Full Weekly Challenge Page */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-white/20">
        <div className="flex items-center gap-3 text-xs text-neutral-300">
          <Trophy size={16} className="text-amber-400 shrink-0" />
          <span>
            {t('challenge_weekly_progress', { done: overallProgress.completedCount, days: overallProgress.completedDaysCount })}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="flex-1 sm:flex-none px-3 py-2 border-2 border-white/40 text-white text-xs font-black uppercase hover:bg-neutral-800 transition-colors"
            >
              {t('challenge_modal_view')}
            </button>
          )}

          <button
            onClick={() => navigate('/challenge')}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-600 text-white font-black text-xs uppercase tracking-wider border-2 border-white hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#fff]"
          >
            <span>{t('challenge_open_all_50')}</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
