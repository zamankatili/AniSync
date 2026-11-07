import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Play } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useHighScore } from './useHighScore';

const GRID = 16;
const CELL = 20;
const SIZE = GRID * CELL;

type Point = { x: number; y: number };
type Status = 'idle' | 'running' | 'over';

interface SnakeState {
  snake: Point[];
  dir: Point;
  nextDir: Point;
  food: Point;
  score: number;
}

const randomFood = (snake: Point[]): Point => {
  const free: Point[] = [];
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)] || { x: 0, y: 0 };
};

const initialSnake = (): Point[] => [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];

const getAccent = (): string => {
  if (typeof window === 'undefined') return '#e11d48';
  const value = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim();
  return value || '#e11d48';
};

export const SnakeGame = () => {
  const { t } = useAppTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<SnakeState>({
    snake: initialSnake(),
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 12, y: 8 },
    score: 0,
  });

  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  const [best, submitBest] = useHighScore('snake');

  const queueDir = useCallback((x: number, y: number) => {
    const current = stateRef.current;
    // 180° dönüşü engelle
    if (current.dir.x === -x && current.dir.y === -y) return;
    current.nextDir = { x, y };
  }, []);

  const start = useCallback(() => {
    const snake = initialSnake();
    stateRef.current = {
      snake,
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: randomFood(snake),
      score: 0,
    };
    setScore(0);
    setStatus('running');
  }, []);

  // Klavye kontrolleri
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
        if (key === 'arrowup' || key === 'w') queueDir(0, -1);
        if (key === 'arrowdown' || key === 's') queueDir(0, 1);
        if (key === 'arrowleft' || key === 'a') queueDir(-1, 0);
        if (key === 'arrowright' || key === 'd') queueDir(1, 0);
      }
      if ((key === 'enter' || key === ' ') && status !== 'running') {
        event.preventDefault();
        start();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [queueDir, start, status]);

  // Oyun döngüsü
  useEffect(() => {
    if (status !== 'running') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      const state = stateRef.current;
      const accent = getAccent();

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Izgara noktaları
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      for (let y = 0; y < GRID; y += 1) {
        for (let x = 0; x < GRID; x += 1) {
          ctx.fillRect(x * CELL + CELL / 2, y * CELL + CELL / 2, 1.5, 1.5);
        }
      }

      // Yem
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(state.food.x * CELL + 3, state.food.y * CELL + 3, CELL - 6, CELL - 6);

      // Yılan
      state.snake.forEach((segment, index) => {
        if (index === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(segment.x * CELL + 1, segment.y * CELL + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = '#050505';
          ctx.fillRect(segment.x * CELL + 6, segment.y * CELL + 6, 3, 3);
        } else {
          ctx.fillStyle = index % 2 === 0 ? accent : 'rgba(255,255,255,0.75)';
          ctx.fillRect(segment.x * CELL + 2, segment.y * CELL + 2, CELL - 4, CELL - 4);
        }
      });
    };

    let raf = 0;
    let last = performance.now();
    let accumulator = 0;

    const loop = (now: number) => {
      const delta = Math.min(now - last, 100);
      last = now;
      const tickMs = Math.max(70, 120 - Math.floor(stateRef.current.score / 50) * 10);
      accumulator += delta;

      if (accumulator >= tickMs) {
        accumulator = 0;
        const state = stateRef.current;
        state.dir = state.nextDir;

        const head = {
          x: state.snake[0].x + state.dir.x,
          y: state.snake[0].y + state.dir.y,
        };

        const hitsWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
        const hitsBody = state.snake.slice(0, -1).some((segment) => segment.x === head.x && segment.y === head.y);

        if (hitsWall || hitsBody) {
          setStatus('over');
          submitBest(state.score);
          return;
        }

        const eats = head.x === state.food.x && head.y === state.food.y;
        state.snake.unshift(head);
        if (eats) {
          state.score += 10;
          state.food = randomFood(state.snake);
          setScore(state.score);
        } else {
          state.snake.pop();
        }
      }

      draw();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, submitBest]);

  // Boşta / bitince ilk kareyi de çiz
  useEffect(() => {
    if (status === 'running') return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let y = 0; y < GRID; y += 1) {
      for (let x = 0; x < GRID; x += 1) {
        ctx.fillRect(x * CELL + CELL / 2, y * CELL + CELL / 2, 1.5, 1.5);
      }
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[320px] text-xs font-black uppercase tracking-widest">
        <span className="text-neutral-400">
          {t('score')}: <span className="text-white">{score}</span>
        </span>
        <span className="text-neutral-400">
          {t('high_score')}: <span className="text-amber-400">{best}</span>
        </span>
      </div>

      <div className="relative border-4 border-white neo-shadow-white bg-black">
        <canvas ref={canvasRef} width={SIZE} height={SIZE} className="block w-[min(320px,80vw)] h-auto" />

        {status !== 'running' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 text-center p-4">
            {status === 'over' && (
              <>
                <p className="text-2xl font-black uppercase tracking-tighter text-rose-500">{t('game_over')}</p>
                <p className="text-xs font-black uppercase tracking-widest text-neutral-300">
                  {t('score')}: {score}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-white font-black uppercase text-xs tracking-wider hover:bg-rose-600 hover:text-white transition-colors"
            >
              <Play size={14} /> {status === 'over' ? t('restart') : t('start_game')}
            </button>
          </div>
        )}
      </div>

      {/* Dokunmatik D-pad */}
      <div className="grid grid-cols-3 gap-1.5 w-[160px] md:hidden">
        <span />
        <button
          type="button"
          aria-label="Yukarı"
          onPointerDown={() => queueDir(0, -1)}
          className="touch-target border-2 border-white/30 active:bg-white active:text-black"
        >
          <ArrowUp size={18} />
        </button>
        <span />
        <button
          type="button"
          aria-label="Sol"
          onPointerDown={() => queueDir(-1, 0)}
          className="touch-target border-2 border-white/30 active:bg-white active:text-black"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Aşağı"
          onPointerDown={() => queueDir(0, 1)}
          className="touch-target border-2 border-white/30 active:bg-white active:text-black"
        >
          <ArrowDown size={18} />
        </button>
        <button
          type="button"
          aria-label="Sağ"
          onPointerDown={() => queueDir(1, 0)}
          className="touch-target border-2 border-white/30 active:bg-white active:text-black"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
