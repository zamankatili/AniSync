import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Trophy, CheckCircle2, Award, Sparkles, Share2, RotateCcw, 
  HelpCircle, Filter, ChevronRight, Check, AlertCircle, BarChart3, Star, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeeklyChallengeStore } from '../store/useWeeklyChallengeStore';
import { WEEK_DAYS_CONFIG, WEEKLY_50_CHALLENGE_BANK, ChallengeQuestion } from '../data/weeklyChallengeBank';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { ChallengeInviteBox } from '../components/ChallengeInviteBox';
import { cn } from '../lib/utils';

export const WeeklyChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { addForumPost, userProfile } = useAppStore();

  const {
    selectedDayIndex,
    selectDay,
    getDayQuestions,
    answers,
    answerQuestion,
    getDayProgress,
    getOverallProgress,
    streakDays,
    totalChallengeXp,
    getBadges,
    getOptionVotes,
    getTotalQuestionVotes,
    resetProgress
  } = useWeeklyChallengeStore();

  const [filterType, setFilterType] = useState<'all' | 'quiz' | 'poll' | 'unanswered'>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const dayQuestions = getDayQuestions(selectedDayIndex);
  const dayConfig = WEEK_DAYS_CONFIG.find(d => d.dayIndex === selectedDayIndex) || WEEK_DAYS_CONFIG[0];
  const dayProgress = getDayProgress(selectedDayIndex);
  const overall = getOverallProgress();
  const badges = getBadges();

  // Filter questions for the selected day
  const filteredQuestions = dayQuestions.filter(q => {
    const isAnswered = !!answers[q.id];
    if (filterType === 'quiz') return !q.isOpinionPoll;
    if (filterType === 'poll') return q.isOpinionPoll;
    if (filterType === 'unanswered') return !isAnswered;
    return true;
  });

  const handleSelectOption = (question: ChallengeQuestion, optId: string) => {
    if (answers[question.id]) return; // already answered
    const res = answerQuestion(question.id, optId);

    if (!question.isOpinionPoll) {
      if (res.isCorrect) {
        addToast(`Doğru cevap! +${res.xpEarned} XP kazandın 🔥`, 'success');
      } else {
        addToast('Yanlış cevap! Bilgi notunu incele.', 'info');
      }
    } else {
      addToast(`Oyun kaydedildi! Topluluk istatistiklerine eklendi (+${res.xpEarned} XP)`, 'success');
    }
  };

  const handleShareToFeed = () => {
    addForumPost({
      title: `🏆 Haftalık 50 Soruluk Anime Meydan Okumasında %${overall.percent} İlerleme!`,
      content: `AniSync Haftalık Meydan Okuma döngüsünde ${overall.completedCount}/50 soruyu tamamladım ve ${totalChallengeXp} XP topladım! Günlük serim: 🔥 ${streakDays} gün. Sen de bilgilerini sına ve oylarını kullan!`,
      likes: 0,
      replies: 0,
      category: 'Discussion',
      type: 'discussion'
    });
    addToast('Meydan okuma başarın topluluk akışında paylaşıldı!', 'success');
  };

  const handleConfirmReset = () => {
    resetProgress();
    setShowResetConfirm(false);
    addToast('Haftalık ilerleme sıfırlandı. Yeniden başlayabilirsin!', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <Helmet>
        <title>Haftalık Anime Meydan Okuması (50 Soru Döngüsü) | AniSync</title>
        <meta name="description" content="50 soruluk haftalık anime meydan okuması: Her gün 6 tematik soru, hafta sonu 8 soruluk Büyük Final ile anime bilginizi ve tercihlerinizi test edin." />
      </Helmet>

      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white font-black text-xs uppercase tracking-wider transition-colors"
        >
          <ArrowLeft size={16} /> ANA SAYFAYA DÖN
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareToFeed}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider px-4 py-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#fff]"
          >
            <Share2 size={14} /> AKIŞTA PAYLAŞ
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-black text-xs uppercase tracking-wider px-3 py-2 border-2 border-white/30 transition-colors"
            title="İlerlemeyi sıfırla ve yeniden başla"
          >
            <RotateCcw size={13} /> SIFIRLA
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-black border-4 border-white neo-shadow-white p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Flame size={280} strokeWidth={1} />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 border border-white uppercase tracking-wider">
              50 SORULUK HAFTALIK DÖNGÜ
            </span>
            <span className="bg-amber-400 text-black font-black text-xs px-2.5 py-1 border border-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={13} /> GÜN BAZLI 6 SORU
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">
            HAFTALIK ANİME MEYDAN OKUMASI
          </h1>

          <p className="text-sm md:text-base text-neutral-300 font-medium leading-relaxed mb-6">
            Pazartesi’den Pazar’a her gün 6 tematik soru (toplam 42 soru) ve hafta sonuna özel 8 soruluk Büyük Final ile tam 50 soru! Bilgini sına, anime tercihlerin için oy ver, günlük serini koru ve <span className="text-amber-400 font-bold">Otaku Rozetleri</span> kazan.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950 border-2 border-white/30 p-4">
            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">ÇÖZÜLEN SORULAR</div>
              <div className="text-xl md:text-2xl font-black text-white font-mono mt-0.5">
                {overall.completedCount} <span className="text-xs text-neutral-500">/ 50 (%{overall.percent})</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">GÜNLÜK SERİ</div>
              <div className="text-xl md:text-2xl font-black text-orange-400 font-mono mt-0.5 flex items-center gap-1">
                <Flame size={20} className="fill-orange-400" /> {streakDays} GÜN
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">KAZANILAN XP</div>
              <div className="text-xl md:text-2xl font-black text-amber-400 font-mono mt-0.5">
                +{totalChallengeXp} XP
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">BİTEN ETAPLAR</div>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {overall.completedDaysCount} <span className="text-xs text-neutral-500">/ 8 ETAP</span>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="h-3 w-full bg-neutral-900 border border-white/40 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${overall.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Challenge & Duel Invite Box */}
      <ChallengeInviteBox
        title="50 Soruluk Haftalık Anime Meydan Okuması"
        scoreDisplay={`${overall.completedCount}/50 Soru (%${overall.percent})`}
        subtitle={`Günlük Seri: ${streakDays} Gün | Toplam XP: +${totalChallengeXp}`}
        challengeType="weekly_challenge"
        statsData={{ streak: streakDays, accuracy: overall.percent }}
      />

      {/* Week Day Map (8 Stages: 7 Days + Finale) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" /> HAFTALIK ETAP HARİTASI
          </h2>
          <span className="text-xs font-mono text-neutral-400">
            Etap Başına 6 Soru (Büyük Final: 8 Soru)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {WEEK_DAYS_CONFIG.map((day) => {
            const isSelected = selectedDayIndex === day.dayIndex;
            const progress = getDayProgress(day.dayIndex);

            return (
              <button
                key={day.id}
                onClick={() => selectDay(day.dayIndex)}
                className={cn(
                  "p-3.5 border-2 text-left transition-all cursor-pointer relative group flex flex-col justify-between min-h-[110px]",
                  isSelected 
                    ? "bg-white text-black border-white shadow-[4px_4px_0px_0px_#e11d48] -translate-y-1" 
                    : "bg-black text-white border-white/20 hover:border-white hover:bg-neutral-950",
                  progress.isFullyDone && !isSelected && "border-emerald-500/80 bg-emerald-950/20"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-black text-xs uppercase tracking-wider",
                      isSelected ? "text-rose-600" : "text-neutral-400"
                    )}>
                      {day.name}
                    </span>
                    {progress.isFullyDone && (
                      <span className="w-5 h-5 bg-emerald-500 text-black rounded-none flex items-center justify-center font-black text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-[11px] leading-snug line-clamp-2">
                    {day.theme}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-mono font-bold">
                  <span>{progress.completed}/{day.questionCount}</span>
                  <span>%{progress.percent}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Section Header & Filters */}
      <div className="bg-neutral-900 border-2 border-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
              {dayConfig.name} • {dayConfig.theme}
            </span>
            <span className={cn("text-xs font-black px-2 py-0.5 border uppercase", dayConfig.accentColor)}>
              {dayConfig.badge}
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-medium">
            {dayConfig.description} ({dayProgress.completed} / {dayConfig.questionCount} Soru Tamamlandı)
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              "px-3 py-1.5 text-xs font-black uppercase border transition-colors cursor-pointer",
              filterType === 'all' ? "bg-white text-black border-white" : "bg-black text-neutral-400 border-white/20 hover:border-white"
            )}
          >
            TÜMÜ ({dayQuestions.length})
          </button>
          <button
            onClick={() => setFilterType('quiz')}
            className={cn(
              "px-3 py-1.5 text-xs font-black uppercase border transition-colors cursor-pointer",
              filterType === 'quiz' ? "bg-cyan-400 text-black border-cyan-400" : "bg-black text-neutral-400 border-white/20 hover:border-white"
            )}
          >
            BİLGİ TESTLERİ
          </button>
          <button
            onClick={() => setFilterType('poll')}
            className={cn(
              "px-3 py-1.5 text-xs font-black uppercase border transition-colors cursor-pointer",
              filterType === 'poll' ? "bg-purple-400 text-black border-purple-400" : "bg-black text-neutral-400 border-white/20 hover:border-white"
            )}
          >
            ANKETLER
          </button>
          <button
            onClick={() => setFilterType('unanswered')}
            className={cn(
              "px-3 py-1.5 text-xs font-black uppercase border transition-colors cursor-pointer",
              filterType === 'unanswered' ? "bg-amber-400 text-black border-amber-400" : "bg-black text-neutral-400 border-white/20 hover:border-white"
            )}
          >
            BOŞ KALANLAR ({dayQuestions.filter(q => !answers[q.id]).length})
          </button>
        </div>
      </div>

      {/* Questions Grid for Selected Day */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="bg-black border-2 border-white/20 p-8 text-center neo-shadow">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-3" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">
              Bu filtrede soru kalmadı!
            </h3>
            <p className="text-xs text-neutral-400 uppercase">
              Tüm soruları görmek için "TÜMÜ" filtresine geçebilirsin.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, qIndex) => {
            const userAnswer = answers[q.id];
            const isAnswered = !!userAnswer;
            const totalVotes = getTotalQuestionVotes(q);

            return (
              <div 
                key={q.id}
                className={cn(
                  "bg-black border-2 p-5 md:p-6 transition-all",
                  isAnswered ? "border-white/40 neo-shadow" : "border-white neo-shadow-white"
                )}
              >
                {/* Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-white text-black font-black px-2.5 py-0.5 text-xs uppercase tracking-wider">
                      SORU {qIndex + 1}
                    </span>
                    <span className="text-neutral-400 font-bold text-xs uppercase tracking-wider">
                      {q.category} • {q.theme}
                    </span>
                    {q.isOpinionPoll ? (
                      <span className="bg-purple-900/60 text-purple-200 border border-purple-400 px-2 py-0.5 text-[10px] font-black uppercase">
                        TOPLULUK ANKETİ
                      </span>
                    ) : (
                      <span className="bg-cyan-900/60 text-cyan-200 border border-cyan-400 px-2 py-0.5 text-[10px] font-black uppercase">
                        BİLGİ TESTİ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isAnswered && (
                      <span className="text-emerald-400 font-black text-xs uppercase flex items-center gap-1 border border-emerald-500/50 bg-emerald-950/40 px-2 py-0.5">
                        <Check size={12} strokeWidth={3} /> CEVAPLANDI
                      </span>
                    )}
                    <span className={cn(
                      "font-mono text-[10px] font-black px-2 py-0.5 border uppercase",
                      q.difficulty === 'Zor' ? "border-red-500 text-red-400" :
                      q.difficulty === 'Orta' ? "border-amber-400 text-amber-300" : "border-emerald-500 text-emerald-400"
                    )}>
                      {q.difficulty || 'Normal'}
                    </span>
                  </div>
                </div>

                {/* Question Statement */}
                <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight leading-snug mb-5">
                  {q.question}
                </h3>

                {/* Options */}
                <div className="space-y-3 mb-4">
                  {q.options.map((opt) => {
                    const isSelected = userAnswer?.selectedOptionId === opt.id;
                    const optVotes = getOptionVotes(q.id, opt.id, opt.votes);
                    const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

                    let borderClass = "border-white/20 hover:border-white bg-neutral-950";
                    let textClass = "text-white";

                    if (isAnswered) {
                      if (q.isOpinionPoll) {
                        if (isSelected) {
                          borderClass = "border-purple-400 bg-purple-950/40 shadow-[2px_2px_0px_0px_#a855f7]";
                          textClass = "text-purple-200";
                        } else {
                          borderClass = "border-neutral-800 bg-neutral-900/30 opacity-70";
                        }
                      } else {
                        if (opt.isCorrect) {
                          borderClass = "border-emerald-400 bg-emerald-950/60 shadow-[2px_2px_0px_0px_#10b981]";
                          textClass = "text-emerald-200 font-black";
                        } else if (isSelected && !opt.isCorrect) {
                          borderClass = "border-red-500 bg-red-950/40 shadow-[2px_2px_0px_0px_#ef4444]";
                          textClass = "text-red-200";
                        } else {
                          borderClass = "border-neutral-800 bg-neutral-900/30 opacity-50";
                        }
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(q, opt.id)}
                        disabled={isAnswered}
                        className={cn(
                          "w-full text-left p-4 border-2 transition-all relative overflow-hidden group cursor-pointer",
                          borderClass
                        )}
                      >
                        {/* Vote Percent Bar */}
                        {isAnswered && (
                          <div 
                            className={cn(
                              "absolute top-0 left-0 bottom-0 opacity-20 transition-all duration-700",
                              q.isOpinionPoll 
                                ? isSelected ? "bg-purple-500" : "bg-neutral-600"
                                : opt.isCorrect ? "bg-emerald-500" : "bg-red-500"
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 border-2 flex items-center justify-center shrink-0 font-bold text-xs",
                              isSelected ? "bg-white text-black border-white" : "border-white/40"
                            )}>
                              {isAnswered && opt.isCorrect && <Check size={12} strokeWidth={3} className="text-emerald-500" />}
                              {isAnswered && isSelected && !opt.isCorrect && !q.isOpinionPoll && <span className="text-red-500 font-bold">✕</span>}
                            </div>
                            <span className={cn("text-sm md:text-base font-bold uppercase tracking-wide", textClass)}>
                              {opt.text}
                            </span>
                          </div>

                          {isAnswered && (
                            <div className="flex items-center gap-2 shrink-0 font-mono text-xs font-black">
                              <span className="text-neutral-400">({optVotes} oy)</span>
                              <span className={cn(
                                "px-2 py-0.5 border text-xs",
                                opt.isCorrect ? "border-emerald-400 text-emerald-300 bg-emerald-950" : "border-white/30 text-white"
                              )}>
                                %{percent}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {isAnswered && q.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900 border-2 border-amber-400/50 p-3.5 text-xs"
                  >
                    <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase tracking-wider mb-1">
                      <Sparkles size={14} />
                      <span>BİLGİ NOTU & DERİNLİK</span>
                    </div>
                    <p className="text-neutral-200 leading-relaxed font-medium">
                      {q.explanation}
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Otaku Badges & Rewards Section */}
      <div className="bg-black border-4 border-amber-400 neo-shadow p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-white/10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Award size={24} className="text-amber-400" /> HAFTALIK MEYDAN OKUMA ROZETLERİ
            </h2>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              50 soruluk döngüdeki adımlarını tamamlayarak profil vitrinine özel başarılar ekle.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {badges.filter(b => b.unlocked).length} / {badges.length} Kazanıldı
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "p-4 border-2 transition-all relative overflow-hidden",
                badge.unlocked 
                  ? "bg-neutral-950 border-amber-400 shadow-[2px_2px_0px_0px_#fbbf24]" 
                  : "bg-black border-white/10 opacity-50 grayscale"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0">{badge.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-white uppercase tracking-wider">
                      {badge.title}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
                    {badge.description}
                  </p>
                  <div className="mt-2 text-[10px] font-mono font-bold uppercase">
                    {badge.unlocked ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check size={11} strokeWidth={3} /> KAZANILDI
                      </span>
                    ) : (
                      <span className="text-neutral-500">KİLİTLİ</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border-4 border-white neo-shadow-white max-w-md w-full p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
              Haftalık İlerlemeyi Sıfırla?
            </h3>
            <p className="text-xs text-neutral-400 uppercase tracking-wide mb-6 leading-relaxed">
              Tüm yanıtların ve topladığın meydan okuma puanları sıfırlanacak. Baştan çözmek istediğinden emin misin?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 border-2 border-white text-white font-black text-xs uppercase hover:bg-neutral-900"
              >
                VAZGEÇ
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-rose-600 text-white font-black text-xs uppercase border-2 border-white hover:bg-rose-500"
              >
                EVET, SIFIRLA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
