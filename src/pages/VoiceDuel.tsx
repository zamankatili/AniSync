import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play, RotateCcw, ArrowLeft, CheckCircle2, XCircle, Sparkles, Trophy,
  HelpCircle, Mic2, Lightbulb,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { scoreFor, getRound } from '../data/voiceDuelData';
import { getCharacterRound, type CharacterDifficulty } from '../data/characterGuessData';
import type { Lang4 } from '../data/universePaths';
import { trackConversionOnce } from '../lib/analytics';
import { useXpStore } from '../store/useXpStore';
import { useToastStore } from '../store/useToastStore';
import { getDailyDateKey } from '../lib/dailyDate';

const BEST_SCORE_KEY: Record<DuelMode, string> = {
  voice: 'anisync_voice_duel_best',
  hint: 'anisync_voice_duel_best_hint',
};
const ROUND_ITEMS = 10;
const ROUND_DURATION = 120;
const HINT_TIMEOUT_MS = 1600;

type DuelMode = 'voice' | 'hint';
type Stage = 'idle' | 'playing' | 'finished';

const DIFFICULTY_POINTS: Record<CharacterDifficulty, number> = {
  kolay: 100,
  orta: 200,
  zor: 300,
};

interface DuelItem {
  id: string;
  name: string;
  series: string;
  difficulty: CharacterDifficulty;
  options: [string, string, string, string];
  hint: Record<Lang4, string>;
  note?: Record<Lang4, string>;
  kind: DuelMode;
  videoId?: string;
  startSeconds?: number;
  endSeconds?: number;
}

interface AnsweredRecord {
  itemId: string;
  selectedIndex: number;
  correct: boolean;
  elapsed: number;
}

const formatTime = (s: number): string => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const loadBest = (mode: DuelMode): number => {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY[mode])) || 0;
  } catch {
    return 0;
  }
};

const buildRound = (mode: DuelMode): DuelItem[] => {
  if (mode === 'voice') {
    return getRound(ROUND_ITEMS).map((clip) => ({ ...clip, kind: 'voice' as const }));
  }
  return getCharacterRound(ROUND_ITEMS).map((item) => ({ ...item, kind: 'hint' as const }));
};

export const VoiceDuel = () => {
  const { t, currentLang } = useAppTranslation();
  const { addToast } = useToastStore();
  const award = useXpStore((state) => state.award);

  const base = currentLang.slice(0, 2) as Lang4;
  const lang: Lang4 = (['tr', 'en', 'ja', 'fr'] as const).includes(base) ? base : 'en';

  const [mode, setMode] = useState<DuelMode>('voice');
  const [stage, setStage] = useState<Stage>('idle');
  const [round, setRound] = useState<DuelItem[]>([]);
  const [itemIndex, setItemIndex] = useState(0);
  const [answered, setAnswered] = useState<AnsweredRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [autoplayKey, setAutoplayKey] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  // Her tur için taze XP anahtarı üretir (idempotency).
  const [roundKey, setRoundKey] = useState('initial');
  const [bestScores, setBestScores] = useState<Record<DuelMode, number>>(() => ({
    voice: loadBest('voice'),
    hint: loadBest('hint'),
  }));

  const scoreRef = useRef(0);
  const bestBeforeRef = useRef(0);

  const currentItem = round[itemIndex];
  const correctIndex = useMemo(
    () => (currentItem ? currentItem.options.indexOf(currentItem.name) : 0),
    [currentItem],
  );

  const startRound = useCallback((nextMode: DuelMode) => {
    const items = buildRound(nextMode);
    bestBeforeRef.current = loadBest(nextMode);
    scoreRef.current = 0;
    setIsNewRecord(false);
    setRoundKey(`${nextMode}:${Math.random().toString(36).slice(2, 10)}`);
    setMode(nextMode);
    setRound(items);
    setItemIndex(0);
    setAnswered([]);
    setSelected(null);
    setShowHint(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(ROUND_DURATION);
    setStage('playing');
  }, []);

  const finishRound = useCallback(() => {
    const final = scoreRef.current;
    setIsNewRecord(final > bestBeforeRef.current && final > 0);
    setStage('finished');
    // XP: turu bitirmenin ödülü (günde 3 hak, 30 XP) — moddan bağımsız.
    const result = award({ action: 'quiz_finish', key: `voice_duel:${roundKey}`, day: getDailyDateKey() });
    if (result.awarded > 0) {
      addToast(t('xp_award_toast', { xp: result.awarded }), 'success');
    }
    trackConversionOnce('first_game_finish', 'first_game_finish', {
      surface: 'voice_duel',
      mode,
      count: final,
    });
    setBestScores((prev) => {
      if (final <= prev[mode]) return prev;
      try {
        localStorage.setItem(BEST_SCORE_KEY[mode], String(final));
      } catch {
        // storage disabled — record simply won't persist
      }
      return { ...prev, [mode]: final };
    });
  }, [mode, award, addToast, t, roundKey]);

  useEffect(() => {
    if (stage !== 'playing') return;
    if (timeLeft <= 0) {
      finishRound();
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [stage, timeLeft, finishRound]);

  const handleAnswer = useCallback((index: number) => {
    if (selected !== null || !currentItem) return;
    setSelected(index);
    const isCorrect = index === correctIndex;
    const points = isCorrect
      ? (currentItem.kind === 'voice'
        ? scoreFor(currentItem.id, streak)
        : DIFFICULTY_POINTS[currentItem.difficulty] + streak * 10)
      : 0;
    const newStreak = isCorrect ? streak + 1 : 0;
    const nextScore = score + points;
    scoreRef.current = nextScore;
    setScore(nextScore);
    setStreak(newStreak);
    setAnswered((prev) => [...prev, {
      itemId: currentItem.id,
      selectedIndex: index,
      correct: isCorrect,
      elapsed: ROUND_DURATION - timeLeft,
    }]);

    window.setTimeout(() => {
      if (itemIndex + 1 >= round.length) {
        finishRound();
        return;
      }
      setItemIndex((i) => i + 1);
      setSelected(null);
      setShowHint(false);
      setAutoplayKey((k) => k + 1);
    }, HINT_TIMEOUT_MS);
  }, [selected, currentItem, correctIndex, streak, score, timeLeft, itemIndex, round.length, finishRound]);

  const iframeSrc = currentItem?.kind === 'voice' && currentItem.videoId
    ? `https://www.youtube.com/embed/${currentItem.videoId}?autoplay=1&start=${currentItem.startSeconds ?? 0}&end=${currentItem.endSeconds ?? 0}&rel=0&modestbranding=1&key=${autoplayKey}`
    : '';

  const accuracy = answered.length ? Math.round((answered.filter((a) => a.correct).length / answered.length) * 100) : 0;

  const modeMeta: Record<DuelMode, { title: string; desc: string; badge: string; icon: typeof Mic2 }> = {
    voice: {
      title: t('voice_duel_mode_voice'),
      desc: t('voice_duel_mode_voice_desc'),
      badge: t('voice_duel_mode_voice_badge'),
      icon: Mic2,
    },
    hint: {
      title: t('voice_duel_mode_hint'),
      desc: t('voice_duel_mode_hint_desc'),
      badge: t('voice_duel_mode_hint_badge'),
      icon: Lightbulb,
    },
  };

  /* ── Seçim / giriş ekranı ─────────────────────────────── */
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

            {/* Mod seçimi */}
            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-2">{t('voice_duel_modes')}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {(['voice', 'hint'] as DuelMode[]).map((m) => {
                  const meta = modeMeta[m];
                  const Icon = meta.icon;
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      aria-pressed={active}
                      className={cn(
                        'text-left p-4 border-4 transition-colors cursor-pointer',
                        active
                          ? 'bg-amber-400 text-black border-white neo-shadow-white'
                          : 'bg-black text-white border-white/30 hover:border-white',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={18} strokeWidth={3} />
                        <span className="font-black uppercase tracking-wide text-sm">{meta.title}</span>
                        <span className={cn(
                          'ml-auto text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border',
                          active ? 'border-black text-black' : 'border-amber-400 text-amber-400',
                        )}>
                          {meta.badge}
                        </span>
                      </div>
                      <p className={cn('mt-2 text-[11px] font-bold leading-snug', active ? 'text-black/80' : 'text-neutral-400')}>
                        {meta.desc}
                      </p>
                      {bestScores[m] > 0 && (
                        <p className={cn('mt-2 font-mono text-[9px] uppercase tracking-wider', active ? 'text-black/70' : 'text-neutral-500')}>
                          <Trophy size={10} className="inline" /> {t('voice_duel_best_score', { score: bestScores[m].toLocaleString() })}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs font-black uppercase">
              <div className="border-2 border-white/20 p-3"><span className="text-amber-400 block text-lg">10</span>{t('voice_duel_clips')}</div>
              <div className="border-2 border-white/20 p-3"><span className="text-amber-400 block text-lg">2:00</span>{t('voice_duel_duration')}</div>
              <div className="border-2 border-white/20 p-3"><span className="text-amber-400 block text-lg">4</span>{t('voice_duel_options')}</div>
            </div>

            <button
              type="button"
              onClick={() => startRound(mode)}
              className="mt-8 px-8 py-4 bg-amber-400 hover:bg-white text-black font-black uppercase tracking-widest text-base border-4 border-black neo-shadow transition-colors flex items-center gap-3"
            >
              <Play size={22} strokeWidth={3} fill="currentColor" />
              {t('voice_duel_play')}
            </button>

            {bestScores.voice === 0 && bestScores.hint === 0 && (
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                <Trophy size={12} className="inline" /> {t('voice_duel_best_score', { score: '0' })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Sonuç ekranı ─────────────────────────────────────── */
  if (stage === 'finished') {
    const correct = answered.filter((a) => a.correct).length;
    const meta = modeMeta[mode];
    return (
      <div className="min-h-full bg-black text-white p-6 md:p-10">
        <div className="max-w-3xl mx-auto border-4 border-white bg-neutral-950 p-6 md:p-10 neo-shadow-white text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-400">{t('voice_duel_round_complete')}</p>
          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">{meta.title}</p>
          <h1 className="font-serif font-black text-5xl md:text-6xl mt-3">{score.toLocaleString()} <span className="text-amber-400">XP</span></h1>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-black uppercase flex-wrap">
            <div className="border-2 border-white/20 px-4 py-3"><span className="text-amber-400 block text-2xl">{correct}/{round.length}</span>{t('voice_duel_correct')}</div>
            <div className="border-2 border-white/20 px-4 py-3"><span className="text-amber-400 block text-2xl">{accuracy}%</span>{t('voice_duel_accuracy')}</div>
            <div className="border-2 border-white/20 px-4 py-3"><span className="text-amber-400 block text-2xl">{answered.length}</span>{t('voice_duel_played')}</div>
          </div>
          {isNewRecord && (
            <p className="mt-5 text-emerald-400 font-black uppercase inline-flex items-center gap-2"><Sparkles size={16} /> {t('voice_duel_new_record')}</p>
          )}
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => startRound(mode)}
              className="px-8 py-4 bg-amber-400 hover:bg-white text-black font-black uppercase tracking-widest text-base border-4 border-black neo-shadow transition-colors inline-flex items-center gap-3"
            >
              <RotateCcw size={20} strokeWidth={3} /> {t('voice_duel_play_again')}
            </button>
            <button
              type="button"
              onClick={() => setStage('idle')}
              className="px-5 py-4 bg-black hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-xs border-4 border-white transition-colors"
            >
              {t('voice_duel_change_mode')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Oyun ekranı ──────────────────────────────────────── */
  return (
    <div className="min-h-full bg-black text-white flex flex-col">
      {/* Yapışkan HUD */}
      <div className="sticky top-0 z-20 bg-black border-b-4 border-white p-3 md:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setStage('idle')}
            className="p-2 text-white hover:bg-white hover:text-black border-2 border-white"
            aria-label={t('back')}
            title={t('voice_duel_change_mode')}
          >
            <ArrowLeft size={18} strokeWidth={3} />
          </button>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-400 truncate">
              {t('voice_duel_hud_title')} · {modeMeta[mode].badge}
            </p>
            <p className="font-serif font-bold text-lg leading-none">{t('voice_duel_round_label', { current: itemIndex + 1, total: round.length })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-center"><span className="block font-mono text-[8px] uppercase text-neutral-500">{t('voice_duel_time')}</span><span className={cn('font-serif font-bold text-2xl tabular-nums', timeLeft <= 10 ? 'text-rose-500' : 'text-white')}>{formatTime(timeLeft)}</span></div>
          <div className="text-center"><span className="block font-mono text-[8px] uppercase text-neutral-500">{t('voice_duel_score')}</span><span className="font-serif font-bold text-2xl tabular-nums text-amber-400">{score.toLocaleString()}</span></div>
          {streak > 1 && <div className="text-center"><span className="block font-mono text-[8px] uppercase text-neutral-500">{t('voice_duel_streak')}</span><span className="font-serif font-bold text-2xl text-emerald-400">×{streak}</span></div>}
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-6">
          {/* Sol: klip veya ipucu */}
          <div className="md:col-span-3 border-4 border-white bg-neutral-950 p-3 md:p-4 neo-shadow-white flex flex-col gap-3">
            {currentItem.kind === 'voice' ? (
              <div className="relative aspect-video bg-black border-2 border-white/20 overflow-hidden">
                {iframeSrc && (
                  <iframe
                    key={iframeSrc}
                    src={iframeSrc}
                    allow="autoplay; encrypted-media"
                    title={currentItem.name}
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
            ) : (
              <div className="min-h-[180px] md:min-h-[240px] bg-neutral-900 border-2 border-amber-400/40 p-4 flex flex-col items-center justify-center text-center gap-3">
                <Lightbulb size={30} className="text-amber-400" />
                <p className="text-sm md:text-base font-bold leading-relaxed text-neutral-100 max-w-md">
                  {currentItem.hint[lang] || currentItem.hint.en}
                </p>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-500">
                  {selected === null ? t('voice_duel_who') : `${t('voice_duel_series_label')}: ${currentItem.series}`}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                {currentItem.kind === 'voice' ? t('voice_duel_source') : t('voice_duel_hint_scoring')}
              </span>
              {currentItem.kind === 'voice' && (
                <button
                  type="button"
                  onClick={() => setAutoplayKey((k) => k + 1)}
                  className="text-[10px] font-black uppercase text-amber-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw size={11} /> {t('voice_duel_replay')}
                </button>
              )}
            </div>

            {currentItem.kind === 'voice' && (
              <div className="border-t-2 border-white/20 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="flex items-center gap-2 text-[11px] font-black uppercase text-amber-400 hover:text-white"
                >
                  <HelpCircle size={13} /> {t('voice_duel_hint')} {showHint ? t('voice_duel_hide') : t('voice_duel_show')}
                </button>
                {showHint && (
                  <p className="mt-1.5 text-[11px] text-neutral-300 leading-snug font-medium">
                    {currentItem.hint[lang] || currentItem.hint.en}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sağ: şıklar + cevap notu */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-400">{t('voice_duel_who')}</p>
            {currentItem.options.map((name, i) => {
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
                  type="button"
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

            {selected !== null && currentItem.note && (
              <div className="border-2 border-white/20 bg-neutral-900 p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400">{t('voice_duel_answer_note')}</p>
                <p className="mt-1 text-[11px] font-medium leading-snug text-neutral-300">
                  {currentItem.note[lang] || currentItem.note.en}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDuel;
