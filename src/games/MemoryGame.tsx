import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useHighScore } from './useHighScore';

const EMOJIS = ['🍥', '🍜', '🌸', '⚡', '🗡️', '👹', '🐉', '🎧'];

type Status = 'idle' | 'running' | 'won';

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildDeck = (): Card[] =>
  shuffle([...EMOJIS, ...EMOJIS]).map((emoji, index) => ({
    id: index,
    emoji,
    flipped: false,
    matched: false,
  }));

export const MemoryGame = () => {
  const { t } = useAppTranslation();
  const [cards, setCards] = useState<Card[]>(buildDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [best, submitBest] = useHighScore('memory', true);
  const timeoutRef = useRef<number | null>(null);
  // Hızlı ardışık tıklamalarda bayat state kullanmamak için ref aynası.
  const cardsRef = useRef<Card[]>(cards);
  const selectedRef = useRef<number[]>([]);
  const movesRef = useRef(0);
  const lockedRef = useRef(false);

  const start = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    const deck = buildDeck();
    cardsRef.current = deck;
    selectedRef.current = [];
    movesRef.current = 0;
    lockedRef.current = false;
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setSeconds(0);
    setLocked(false);
    setStatus('running');
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const timer = window.setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = (index: number) => {
    if (status !== 'running' || lockedRef.current) return;
    const currentCards = cardsRef.current;
    const card = currentCards[index];
    if (!card || card.flipped || card.matched) return;

    const nextCards = currentCards.map((item, i) => (i === index ? { ...item, flipped: true } : item));
    const nextSelected = [...selectedRef.current, index];

    cardsRef.current = nextCards;
    selectedRef.current = nextSelected;
    setCards(nextCards);
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      const [first, second] = nextSelected;
      const isMatch = nextCards[first].emoji === nextCards[second].emoji;
      const nextMoves = movesRef.current + 1;

      movesRef.current = nextMoves;
      setMoves(nextMoves);
      lockedRef.current = true;
      setLocked(true);

      if (isMatch) {
        const matchedCards = nextCards.map((item, i) =>
          i === first || i === second ? { ...item, matched: true } : item
        );
        cardsRef.current = matchedCards;
        selectedRef.current = [];
        lockedRef.current = false;
        setCards(matchedCards);
        setSelected([]);
        setLocked(false);

        if (matchedCards.every((item) => item.matched)) {
          setStatus('won');
          submitBest(nextMoves);
        }
      } else {
        timeoutRef.current = window.setTimeout(() => {
          const resetCards = cardsRef.current.map((item, i) =>
            i === first || i === second ? { ...item, flipped: false } : item
          );
          cardsRef.current = resetCards;
          selectedRef.current = [];
          lockedRef.current = false;
          setCards(resetCards);
          setSelected([]);
          setLocked(false);
        }, 650);
      }
    }
  };

  const matchedPairs = useMemo(() => cards.filter((card) => card.matched).length / 2, [cards]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center justify-between w-full max-w-[360px] text-xs font-black uppercase tracking-widest">
        <span className="text-neutral-400">
          {t('moves')}: <span className="text-white">{moves}</span>
        </span>
        <span className="text-neutral-400">
          {t('time')}: <span className="text-cyan-400">{seconds}s</span>
        </span>
        <span className="text-neutral-400">
          {t('best_moves')}: <span className="text-amber-400">{best || '—'}</span>
        </span>
      </div>

      <div className="relative w-full max-w-[360px]">
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, index) => {
            const revealed = card.flipped || card.matched;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleClick(index)}
                aria-label={revealed ? card.emoji : t('memory_card')}
                className={`aspect-square border-2 flex items-center justify-center text-2xl sm:text-3xl transition-all duration-150 ${
                  card.matched
                    ? 'border-emerald-400 bg-emerald-400/15 scale-95'
                    : revealed
                      ? 'border-white bg-neutral-800'
                      : 'border-white/25 bg-neutral-950 hover:border-white hover:bg-neutral-900'
                }`}
              >
                {revealed ? card.emoji : <span className="text-neutral-600 text-lg font-black">?</span>}
              </button>
            );
          })}
        </div>

        {status !== 'running' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 text-center p-4">
            {status === 'won' && (
              <>
                <p className="text-2xl font-black uppercase tracking-tighter text-emerald-400">CLEAR!</p>
                <p className="text-xs font-black uppercase tracking-widest text-neutral-300">
                  {t('moves')}: {moves} {'·'} {seconds}s
                </p>
              </>
            )}
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-white font-black uppercase text-xs tracking-wider hover:bg-rose-600 hover:text-white transition-colors"
            >
              {status === 'won' ? <RotateCcw size={14} /> : <Play size={14} />}
              {status === 'won' ? t('restart') : t('start_game')}
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 text-center max-w-[320px]">
        {matchedPairs}/8 {t('pairs_found')}
      </p>
    </div>
  );
};
