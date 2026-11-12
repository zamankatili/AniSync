import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, ArrowLeft, CheckCircle2, XCircle, Sparkles, Trophy, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { scoreFor, getRound } from '../data/voiceDuelData';


const BEST_SCORE_KEY = 'anisync_voice_duel_best';
const ROUND_CLIPS = 10;
const ROUND_DURATION = 120;


const formatTime = (s: number): string => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

interface AnsweredRecord {
  clipId: string;
  selectedIndex: number;
  correct: boolean;
  elapsed: number;
}

export const VoiceDuel = () => {
  const { t, currentLang } = useAppTranslation();

  const [stage, setStage] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [round, setRound] = useState<ReturnType<typeof getRound>>([]);
  const [clipIndex, setClipIndex] = useState(0);
  const [answered, setAnswered] = useState<AnsweredRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [autoplayKey, setAutoplayKey] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try { return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0; } catch { return 0; }
  });
  const timerRef = useRef<number | null>(null);

  const currentClip = round[clipIndex];
  const correctIndex = useMemo(
    () => (currentClip ? currentClip.options.indexOf(currentClip.name) : 0),
    [currentClip],
  );

  const startRound = useCallback(() => {
    const newRound = getRound(ROUND_CLIPS);
    setRound(newRound);
    setClipIndex(0);
    setAnswered([]);
    setSelected(null);
    setShowHint(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(ROUND_DURATION);
    setStage('playing');
  }, []);

  const finishRound = useCallback(() => {
    setStage('finished');
    if (score > bestScore) {
      setBestScore(score);
      try { localStorage.setItem(BEST_SCORE_KEY, String(score)); } catch { /* yoksay */ }
    }
  }, [score, bestScore]);

  useEffect(() => {
    if (stage !== 'playing') {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current!);
          finishRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [stage, finishRound]);

  const handleAnswer = useCallback((index: number) => {
    if (selected !== null || !currentClip) return;
    setSelected(index);
    const isCorrect = index === correctIndex;
    const points = isCorrect ? scoreFor(currentClip.id, streak) : 0;
    const newStreak = isCorrect ? streak + 1 : 0;
    setScore((s) => s + points);
    setStreak(newStreak);
    setAnswered((prev) => [...prev, { clipId: currentClip.id, selectedIndex: index, correct: isCorrect, elapsed: ROUND_DURATION - timeLeft }]);

    // 1.2s sonra otomatik ilerleme
    window.setTimeout(() => {
      if (clipIndex + 1 >= round.length) {
        finishRound();
        return;
      }
      setClipIndex((i) => i + 1);
      setSelected(null);
      setShowHint(false);
      setAutoplayKey((k) => k + 1);
    }, 1300);
  }, [selected, currentClip, correctIndex, streak, timeLeft, clipIndex, round.length, finishRound]);

  const iframeSrc = currentClip
    ? `https://www.youtube.com/embed/${currentClip.videoId}?autoplay=1&start=${currentClip.startSeconds}&end=${currentClip.endSeconds}&rel=0&modestbranding=1&key=${autoplayKey}`
    : '';

  const accuracy = answered.length ? Math.round((answered.filter((a) => a.correct).length / answered.length) * 100) : 0;

  if (stage === 'idle') {
    return (
      <div className="min-h-full bg-black text-white p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="border-4 border-white bg-neutral-950 p-6 md:p-10 neo-shadow-white">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-400">{t('voice_duel_brand')}</p>
            <h1 className="font-serif font-black text-5xl md:text-7xl leading-[0.92] mt-2">
              {t('voice_duel_title_1')}<br />
              <span className="text-amber-400">{t('voice_duel_title_2')}</span>
            </h1>
            <p className="text-neutral-300 font-bold mt-4 max-w-xl text-sm md:text-base leading-snug">
              {t('voice_duel_desc')}
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs font-black uppercase">
              <div className="border-2 border-white/20 p-3"><span className="text-amber-400 block text-lg">10</span>{t('voice_duel_clips')}</div>
              <div className="border-2 border-white/20 p-3"><span className="text-amber-400 block text-lg">2:00</span>{t('voice_duel_duration')}</div>
              <div className="border-2 border-white/20 p-3"><span className="text-amber-400 block text-lg">4</span>{t('voice_duel_options')}</div>
            </div>

            <button
              onClick={startRound}
              className="mt-8 px-8 py-4 bg-amber-400 hover:bg-white text-black font-black uppercase tracking-widest text-base border-4 border-black neo-shadow transition-colors flex items-center gap-3"
            >
              <Play size={22} strokeWidth={3} fill="currentColor" />
              {t('voice_duel_play')}
            </button>

            {bestScore > 0 && (
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                <Trophy size={12} className="inline" /> {t('voice_duel_best_score', { score: bestScore.toLocaleString() })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'finished') {
    const correct = answered.filter((a) => a.correct).length;
    return (
      <div className="min-h-full bg-black text-white p-6 md:p-10">
        <div className="max-w-3xl mx-auto border-4 border-white bg-neutral-950 p-6 md:p-10 neo-shadow-white text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-400">{t('voice_duel_round_complete')}</p>
          <h1 className="font-serif font-black text-5xl md:text-6xl mt-3">{score.toLocaleString()} <span className="text-amber-400">XP</span></h1>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-black uppercase">
            <div className="border-2 border-white/20 px-4 py-3"><span className="text-amber-400 block text-2xl">{correct}/10</span>{t('voice_duel_correct')}</div>
            <div className="border-2 border-white/20 px-4 py-3"><span className="text-amber-400 block text-2xl">{accuracy}%</span>{t('voice_duel_accuracy')}</div>
            <div className="border-2 border-white/20 px-4 py-3"><span className="text-amber-400 block text-2xl">{answered.length}</span>{t('voice_duel_played')}</div>
          </div>
          {score > bestScore && (
            <p className="mt-5 text-emerald-400 font-black uppercase inline-flex items-center gap-2"><Sparkles size={16} /> {t('voice_duel_new_record')}</p>
          )}
          <button onClick={startRound} className="mt-8 px-8 py-4 bg-amber-400 hover:bg-white text-black font-black uppercase tracking-widest text-base border-4 border-black neo-shadow transition-colors inline-flex items-center gap-3">
            <RotateCcw size={20} strokeWidth={3} /> {t('voice_duel_play_again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black text-white flex flex-col">
      {/* Yapışkan HUD */}
      <div className="sticky top-0 z-20 bg-black border-b-4 border-white p-3 md:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setStage('idle')} className="p-2 text-white hover:bg-white hover:text-black border-2 border-white" aria-label={t('back')}>
            <ArrowLeft size={18} strokeWidth={3} />
          </button>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-400">{t('voice_duel_hud_title')}</p>
            <p className="font-serif font-bold text-lg leading-none">{t('voice_duel_round_label', { current: clipIndex + 1, total: round.length })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-center"><span className="block font-mono text-[8px] uppercase text-neutral-500">{t('voice_duel_time')}</span><span className={cn('font-serif font-bold text-2xl tabular-nums', timeLeft <= 10 ? 'text-rose-500' : 'text-white')}>{formatTime(timeLeft)}</span></div>
          <div className="text-center"><span className="block font-mono text-[8px] uppercase text-neutral-500">{t('voice_duel_score')}</span><span className="font-serif font-bold text-2xl tabular-nums text-amber-400">{score.toLocaleString()}</span></div>
          {streak > 1 && <div className="text-center"><span className="block font-mono text-[8px] uppercase text-neutral-500">{t('voice_duel_streak')}</span><span className="font-serif font-bold text-2xl text-emerald-400">×{streak}</span></div>}
        </div>
      </div>

      {/* Klip kartı */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-6">
          {/* Sol: video + ipuçları */}
          <div className="md:col-span-3 border-4 border-white bg-neutral-950 p-3 md:p-4 neo-shadow-white flex flex-col gap-3">
            <div className="relative aspect-video bg-black border-2 border-white/20 overflow-hidden">
              {iframeSrc && (
                <iframe
                  key={iframeSrc}
                  src={iframeSrc}
                  allow="autoplay; encrypted-media"
                  title={currentClip.name}
                  className="absolute inset-0 w-full h-full border-0"
                />
              )}
              {/* Karakter görünmesin: yalnızca ses. Cevap verilince overlay kalkar. */}
              {iframeSrc && selected === null && (
                <div className="absolute inset-0 z-10 bg-black pointer-events-none flex flex-col items-center justify-center">
                  <span className="font-serif font-black text-7xl text-amber-400 leading-none">?</span>
                  <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400">{t('voice_duel_listen_hint')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">{t('voice_duel_source')}</span>
              <button onClick={() => setAutoplayKey((k) => k + 1)} className="text-[10px] font-black uppercase text-amber-400 hover:text-white flex items-center gap-1">
                <RotateCcw size={11} /> {t('voice_duel_replay')}
              </button>
            </div>

            <div className="border-t-2 border-white/20 pt-3">
              <button onClick={() => setShowHint((v) => !v)} className="flex items-center gap-2 text-[11px] font-black uppercase text-amber-400 hover:text-white">
                <HelpCircle size={13} /> {t('voice_duel_hint')} {showHint ? t('voice_duel_hide') : t('voice_duel_show')}
              </button>
              {showHint && (
                <p className="mt-1.5 text-[11px] text-neutral-300 leading-snug font-medium">{currentClip.hint[currentLang as keyof typeof currentClip.hint] || currentClip.hint.en}</p>
              )}
            </div>
          </div>

          {/* Sağ: şıklar */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-400">{t('voice_duel_who')}</p>
            {currentClip.options.map((name, i) => {
              const isSelected = selected === i;
              const isCorrect = i === correctIndex;
              const isLocked = selected !== null;
              const classes = isLocked
                ? isCorrect
                  ? 'bg-emerald-500 text-black border-emerald-300'
                  : isSelected
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-neutral-800 text-neutral-400 border-white/20'
                : 'bg-black border-white/30 text-white hover:border-amber-400 hover:bg-neutral-900';
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={isLocked}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3 md:p-4 border-4 font-bold text-sm uppercase tracking-tight transition-all cursor-pointer disabled:cursor-default',
                    classes,
                  )}
                >
                  <span lang="en">{name}</span>
                  {isLocked && isCorrect && <CheckCircle2 size={18} strokeWidth={3} />}
                  {isLocked && isSelected && !isCorrect && <XCircle size={18} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
