import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, CheckCircle2, ChevronRight,
  Share2, Flame, Trophy, ArrowRight
} from 'lucide-react';
import { useWeeklyChallengeStore } from '../store/useWeeklyChallengeStore';
import { WEEK_DAYS_CONFIG, ChallengeQuestion } from '../data/weeklyChallengeBank';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  localizeDayName,
  localizeDayTheme,
} from '../lib/weeklyChallengeLocalization';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { addForumPost, userProfile } = useAppStore();
  const { t } = useAppTranslation();

  const {
    selectedDayIndex,
    getDayQuestions,
    answers,
    answerQuestion,
    getDayProgress,
    getOverallProgress,
    streakDays,
    totalChallengeXp,
  } = useWeeklyChallengeStore();

  // Active question index within selected day
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const dayQuestions = getDayQuestions(selectedDayIndex);
  const dayConfig = WEEK_DAYS_CONFIG.find(d => d.dayIndex === selectedDayIndex) || WEEK_DAYS_CONFIG[0];
  const dayProgress = getDayProgress(selectedDayIndex);
  const overall = getOverallProgress();

  const currentQuestion: ChallengeQuestion | undefined = dayQuestions[currentIndex] || dayQuestions[0];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isAnswered = !!currentAnswer;

  const handleSelectOption = (optId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOptionId || !currentQuestion || isAnswered) return;

    const res = answerQuestion(currentQuestion.id, selectedOptionId);
    if (!currentQuestion.isOpinionPoll) {
      if (res.isCorrect) {
        addToast(t('challenge_correct_xp', { xp: res.xpEarned }), 'success');
      } else {
        addToast(t('challenge_wrong_answer'), 'info');
      }
    } else {
      addToast(t('challenge_saved_xp', { xp: res.xpEarned }), 'success');
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < dayQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
    }
  };

  const handleShareResult = () => {
    addForumPost({
      title: t('challenge_share_post_title', { day: localizeDayName(dayConfig.id, dayConfig.name) }),
      content: t('challenge_share_post_content', {
        theme: localizeDayTheme(dayConfig.id, dayConfig.theme),
        xp: totalChallengeXp,
      }),
      likes: 0,
      replies: 0,
      category: 'Discussion',
      type: 'discussion'
    });
    addToast(t('challenge_shared_feed_toast'), 'success');
  };

  const handleOpenFullPage = () => {
    onClose();
    navigate('/challenge');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white border-4 border-black neo-shadow flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-3.5 bg-neutral-950 text-white border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-400 text-black border border-black flex items-center justify-center font-black">
              <Flame size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase text-amber-400">
                  {t('challenge_day_quiz_title', { day: localizeDayName(dayConfig.id, dayConfig.name).toUpperCase() })}
                </span>
                <span className="bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.2 border border-white">
                  {t('challenge_daily_6')}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-bold uppercase truncate">
                {t('challenge_theme_cycle', { theme: localizeDayTheme(dayConfig.id, dayConfig.theme), done: overall.completedCount })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col justify-between">
          {(!dayProgress.isFullyDone || currentQuestion) && currentQuestion ? (
            <div className="space-y-4">
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-black uppercase text-black">
                  <span>{t('challenge_question_counter', { current: currentIndex + 1, total: dayQuestions.length })}</span>
                  <span className="text-rose-600 font-mono">{t('challenge_total_xp', { xp: totalChallengeXp })}</span>
                </div>
                <div className="w-full bg-neutral-200 h-3 border-2 border-black overflow-hidden p-0.5">
                  <div 
                    className="bg-amber-400 h-full transition-all duration-300" 
                    style={{ width: `${((currentIndex + 1) / dayQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Category Pill */}
              <div className="flex items-center gap-2">
                <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase border border-black">
                  {currentQuestion.category}
                </span>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">
                  {currentQuestion.isOpinionPoll ? t('challenge_opinion_poll') : t('challenge_knowledge_quiz')}
                </span>
              </div>

              {/* Question Statement */}
              <h3 className="text-base sm:text-lg font-black text-black uppercase leading-snug tracking-tight">
                {currentQuestion.question}
              </h3>

              {/* Options List */}
              <div className="space-y-2.5 pt-1">
                {(() => {
                  const effectiveChosen = currentAnswer?.selectedOptionId || selectedOptionId;
                  return currentQuestion.options.map((option) => {
                    const isSelected = effectiveChosen === option.id;

                    let optionStyle = "bg-neutral-50 hover:bg-neutral-100 text-black border-black";
                    if (isSelected && !isAnswered) {
                      optionStyle = "bg-amber-400 text-black border-black neo-shadow";
                    } else if (isAnswered) {
                      if (!currentQuestion.isOpinionPoll) {
                        if (option.isCorrect) {
                          optionStyle = "bg-emerald-400 text-black border-black font-black";
                        } else if (isSelected && !option.isCorrect) {
                          optionStyle = "bg-rose-500 text-white border-black font-black";
                        } else {
                          optionStyle = "bg-neutral-100 text-neutral-500 border-neutral-300 opacity-60";
                        }
                      } else {
                        optionStyle = isSelected ? "bg-amber-400 text-black border-black" : "bg-neutral-50 text-neutral-600";
                      }
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(option.id)}
                        className={cn(
                          "w-full p-3 border-2 text-left font-black text-xs uppercase flex items-center justify-between transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] relative overflow-hidden",
                          optionStyle
                        )}
                      >
                        <div className="flex items-center gap-2 relative z-10">
                          <span className="w-5 h-5 rounded-none border border-black bg-white text-black flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                            {option.id.charAt(0).toUpperCase()}
                          </span>
                          <span>{option.text}</span>
                        </div>

                        <div className="flex items-center gap-2 relative z-10 shrink-0 font-mono text-xs">
                          {isAnswered && !currentQuestion.isOpinionPoll && option.isCorrect && (
                            <CheckCircle2 size={16} className="text-black shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Explanation Box when Answered */}
              {isAnswered && currentQuestion.explanation && (
                <div className="p-3 bg-amber-50 border-2 border-black text-xs font-bold text-neutral-900 leading-relaxed animate-in fade-in">
                  <span className="font-black text-black uppercase block mb-0.5">
                    {t('challenge_explanation_label')}
                  </span>
                  {currentQuestion.explanation}
                </div>
              )}
            </div>
          ) : (
            /* Completed Result Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-400 text-black border-4 border-black flex items-center justify-center mx-auto neo-shadow">
                <Trophy size={32} strokeWidth={2.5} />
              </div>

              <div>
                <span className="bg-black text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 border border-black">
                  {t('challenge_day_completed_badge')}
                </span>
                <h3 className="text-2xl font-black text-black uppercase tracking-tight mt-1">
                  {t('challenge_great_job', { name: userProfile.name })}
                </h3>
                <p className="text-xs text-neutral-600 font-bold max-w-sm mx-auto uppercase mt-1">
                  {t('challenge_day_done_desc', { day: localizeDayName(dayConfig.id, dayConfig.name), done: overall.completedCount })}
                </p>
              </div>

              {/* Score Card */}
              <div className="bg-neutral-950 border-4 border-black p-4 text-white max-w-xs mx-auto neo-shadow space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase border-b border-white/20 pb-1">
                  <span>{t('challenge_total_xp_label')}</span>
                  <span className="text-amber-400 font-black">+{totalChallengeXp} XP</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase border-b border-white/20 pb-1">
                  <span>{t('challenge_daily_streak')}</span>
                  <span className="text-rose-500 font-black">🔥 {t('challenge_days_count', { count: streakDays })}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>{t('challenge_50_progress')}</span>
                  <span className="text-cyan-400 font-black">%{overall.percent}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleShareResult}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer neo-shadow"
                >
                  <Share2 size={13} />
                  <span>{t('challenge_share_community')}</span>
                </button>

                <button
                  onClick={handleOpenFullPage}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer neo-shadow"
                >
                  <span>{t('challenge_open_all_50')}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3 mt-4">
            <button
              type="button"
              onClick={handleOpenFullPage}
              className="text-xs font-black uppercase text-neutral-600 hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <span>{t('challenge_see_all_50')}</span> <ArrowRight size={13} />
            </button>

            {!isAnswered ? (
              <button
                type="button"
                disabled={!selectedOptionId}
                onClick={handleConfirmAnswer}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-200 text-black border-2 border-black font-black text-xs uppercase transition-transform active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              >
                {t('challenge_confirm_answer')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer neo-shadow"
              >
                <span>{currentIndex < dayQuestions.length - 1 ? t('challenge_next_question') : t('challenge_see_result')}</span>
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
