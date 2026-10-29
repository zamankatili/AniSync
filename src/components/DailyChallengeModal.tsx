import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, CheckCircle2, Award, Sparkles, ChevronRight, 
  Share2, Flame, Trophy, Check, ArrowRight
} from 'lucide-react';
import { useWeeklyChallengeStore } from '../store/useWeeklyChallengeStore';
import { WEEK_DAYS_CONFIG, ChallengeQuestion } from '../data/weeklyChallengeBank';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { cn } from '../lib/utils';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { addForumPost, userProfile } = useAppStore();

  const {
    selectedDayIndex,
    getDayQuestions,
    answers,
    answerQuestion,
    getDayProgress,
    getOverallProgress,
    streakDays,
    totalChallengeXp,
    getOptionVotes,
    getTotalQuestionVotes
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
        addToast(`Doğru cevap! +${res.xpEarned} XP`, 'success');
      } else {
        addToast('Yanlış cevap! Açıklamayı incele.', 'info');
      }
    } else {
      addToast(`Oyun kaydedildi! +${res.xpEarned} XP`, 'success');
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
      title: `${dayConfig.name} Anime Meydan Okumasını Tamamladım! 🏆`,
      content: `Bugünün "${dayConfig.theme}" temalı 6 soruluk meydan okumasından ${totalChallengeXp} XP topladım! Haftalık 50 soruluk döngüde sen de yarış.`,
      likes: 0,
      replies: 0,
      category: 'Discussion',
      type: 'discussion'
    });
    addToast('Başarı kartın topluluk akışında paylaşıldı!', 'success');
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
                  {dayConfig.name.toUpperCase()} MEYDAN OKUMASI
                </span>
                <span className="bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.2 border border-white">
                  GÜNLÜK 6 SORU
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-bold uppercase truncate">
                Tema: {dayConfig.theme} • Toplam 50 Soruluk Döngü ({overall.completedCount}/50)
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
                  <span>Soru {currentIndex + 1} / {dayQuestions.length}</span>
                  <span className="text-rose-600 font-mono">Toplam: {totalChallengeXp} XP</span>
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
                  {currentQuestion.isOpinionPoll ? "📊 Topluluk Anket Sorusu" : "🧠 Bilgi Testi"}
                </span>
              </div>

              {/* Question Statement */}
              <h3 className="text-base sm:text-lg font-black text-black uppercase leading-snug tracking-tight">
                {currentQuestion.question}
              </h3>

              {/* Options List */}
              <div className="space-y-2.5 pt-1">
                {(() => {
                  const totalVotes = getTotalQuestionVotes(currentQuestion);
                  const effectiveChosen = currentAnswer?.selectedOptionId || selectedOptionId;

                  return currentQuestion.options.map((option) => {
                    const isSelected = effectiveChosen === option.id;
                    const optVotes = getOptionVotes(currentQuestion.id, option.id, option.votes);
                    const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

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
                        {isAnswered && (
                          <div 
                            className="absolute top-0 left-0 bottom-0 bg-black/10 transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        )}

                        <div className="flex items-center gap-2 relative z-10">
                          <span className="w-5 h-5 rounded-none border border-black bg-white text-black flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                            {option.id.charAt(0).toUpperCase()}
                          </span>
                          <span>{option.text}</span>
                        </div>

                        <div className="flex items-center gap-2 relative z-10 shrink-0 font-mono text-xs">
                          {isAnswered && <span>%{percent}</span>}
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
                    💡 Açıklama & Lore:
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
                  GÜNÜN MEYDAN OKUMASI TAMAMLANDI!
                </span>
                <h3 className="text-2xl font-black text-black uppercase tracking-tight mt-1">
                  HARİKA İŞ, {userProfile.name}!
                </h3>
                <p className="text-xs text-neutral-600 font-bold max-w-sm mx-auto uppercase mt-1">
                  Haftalık 50 soruluk döngünün {dayConfig.name} etabını bitirdin. Toplam: {overall.completedCount} / 50 Soru.
                </p>
              </div>

              {/* Score Card */}
              <div className="bg-neutral-950 border-4 border-black p-4 text-white max-w-xs mx-auto neo-shadow space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase border-b border-white/20 pb-1">
                  <span>Toplam XP:</span>
                  <span className="text-amber-400 font-black">+{totalChallengeXp} XP</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase border-b border-white/20 pb-1">
                  <span>Günlük Seri:</span>
                  <span className="text-rose-500 font-black">🔥 {streakDays} Gün</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>50 Soruluk İlerleme:</span>
                  <span className="text-cyan-400 font-black">%{overall.percent}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleShareResult}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer neo-shadow"
                >
                  <Share2 size={13} />
                  <span>TOPLULUKLA PAYLAŞ</span>
                </button>

                <button
                  onClick={handleOpenFullPage}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer neo-shadow"
                >
                  <span>TÜM 50 SORULUK SAYFAYI AÇ</span>
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
              <span>Tüm 50 Soruyu Gör</span> <ArrowRight size={13} />
            </button>

            {!isAnswered ? (
              <button
                type="button"
                disabled={!selectedOptionId}
                onClick={handleConfirmAnswer}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-200 text-black border-2 border-black font-black text-xs uppercase transition-transform active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              >
                CEVABI ONAYLA
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer neo-shadow"
              >
                <span>{currentIndex < dayQuestions.length - 1 ? "SONRAKİ SORU" : "SONUCU GÖR"}</span>
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
