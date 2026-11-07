import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useHighScore } from './useHighScore';

const W = 360;
const H = 420;
const PADDLE_W = 76;
const PADDLE_H = 10;
const PADDLE_Y = H - 28;
const BALL_R = 6;
const COLS = 6;
const ROWS = 5;
const BRICK_W = 50;
const BRICK_H = 16;
const GAP = 4;
const TOP = 52;
const LEFT = (W - (COLS * BRICK_W + (COLS - 1) * GAP)) / 2;
const ROW_COLORS = ['#e11d48', '#fbbf24', '#22d3ee', '#a855f7', '#34d399'];

type Status = 'idle' | 'running' | 'over' | 'won';

interface Brick {
  x: number;
  y: number;
  row: number;
  alive: boolean;
}

interface BreakoutState {
  ball: { x: number; y: number; vx: number; vy: number };
  paddleX: number;
  bricks: Brick[];
  score: number;
  lives: number;
}

const buildBricks = (): Brick[] => {
  const bricks: Brick[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      bricks.push({
        x: LEFT + col * (BRICK_W + GAP),
        y: TOP + row * (BRICK_H + GAP),
        row,
        alive: true,
      });
    }
  }
  return bricks;
};

const createState = (): BreakoutState => ({
  ball: { x: W / 2, y: PADDLE_Y - 30, vx: 2.4, vy: -3.1 },
  paddleX: (W - PADDLE_W) / 2,
  bricks: buildBricks(),
  score: 0,
  lives: 3,
});

interface BreakoutGameProps {
  /** Oyun bittiğinde dışarıya skor bildir (hub kartında göstermek için). */
  onFinish?: (score: number) => void;
}

export const BreakoutGame = ({ onFinish }: BreakoutGameProps) => {
  const { t } = useAppTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<BreakoutState>(createState());
  const keysRef = useRef({ left: false, right: false });

  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, submitBest] = useHighScore('breakout');

  const start = useCallback(() => {
    stateRef.current = createState();
    setScore(0);
    setLives(3);
    setStatus('running');
  }, []);

  const finish = useCallback(
    (finalScore: number) => {
      submitBest(finalScore);
      onFinish?.(finalScore);
    },
    [onFinish, submitBest]
  );

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        keysRef.current.left = true;
      }
      if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        keysRef.current.right = true;
      }
      if ((key === 'enter' || key === ' ') && status !== 'running') {
        event.preventDefault();
        start();
      }
    };
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') keysRef.current.left = false;
      if (key === 'arrowright' || key === 'd') keysRef.current.right = false;
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [start, status]);

  useEffect(() => {
    if (status !== 'running') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      const state = stateRef.current;

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let y = 12; y < H; y += 24) {
        for (let x = 12; x < W; x += 24) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      state.bricks.forEach((brick) => {
        if (!brick.alive) return;
        ctx.fillStyle = ROW_COLORS[brick.row % ROW_COLORS.length];
        ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(brick.x, brick.y + BRICK_H - 3, BRICK_W, 3);
      });

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(state.paddleX, PADDLE_Y, PADDLE_W, PADDLE_H);

      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    };

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const delta = Math.min(now - last, 40);
      last = now;
      const factor = delta / 16.667;
      const state = stateRef.current;

      // Paddle
      if (keysRef.current.left) state.paddleX -= 6.5 * factor;
      if (keysRef.current.right) state.paddleX += 6.5 * factor;
      state.paddleX = Math.max(0, Math.min(W - PADDLE_W, state.paddleX));

      // Ball
      const ball = state.ball;
      ball.x += ball.vx * factor;
      ball.y += ball.vy * factor;

      if (ball.x - BALL_R <= 0) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x + BALL_R >= W) {
        ball.x = W - BALL_R;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y - BALL_R <= 0) {
        ball.y = BALL_R;
        ball.vy = Math.abs(ball.vy);
      }

      // Paddle çarpışması
      if (
        ball.vy > 0 &&
        ball.y + BALL_R >= PADDLE_Y &&
        ball.y + BALL_R <= PADDLE_Y + PADDLE_H + 4 &&
        ball.x >= state.paddleX - BALL_R &&
        ball.x <= state.paddleX + PADDLE_W + BALL_R
      ) {
        const hit = (ball.x - (state.paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
        ball.vx = hit * 4;
        ball.vy = -Math.max(2.8, Math.abs(ball.vy) * 1.02);
        ball.y = PADDLE_Y - BALL_R - 1;
      }

      // Brick çarpışması
      for (const brick of state.bricks) {
        if (!brick.alive) continue;
        const withinX = ball.x + BALL_R >= brick.x && ball.x - BALL_R <= brick.x + BRICK_W;
        const withinY = ball.y + BALL_R >= brick.y && ball.y - BALL_R <= brick.y + BRICK_H;
        if (withinX && withinY) {
          brick.alive = false;
          state.score += 10;
          setScore(state.score);
          ball.vy = -ball.vy;
          break;
        }
      }

      if (state.bricks.every((brick) => !brick.alive)) {
        finish(state.score);
        setStatus('won');
        return;
      }

      // Can kaybı
      if (ball.y - BALL_R > H) {
        state.lives -= 1;
        setLives(state.lives);
        if (state.lives <= 0) {
          finish(state.score);
          setStatus('over');
          return;
        }
        ball.x = W / 2;
        ball.y = PADDLE_Y - 30;
        ball.vx = 2.4;
        ball.vy = -3.1;
        state.paddleX = (W - PADDLE_W) / 2;
      }

      draw();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, finish]);

  // Boştayken sahneyi çiz
  useEffect(() => {
    if (status === 'running') return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);
    const state = stateRef.current;
    state.bricks.forEach((brick) => {
      if (!brick.alive) return;
      ctx.fillStyle = ROW_COLORS[brick.row % ROW_COLORS.length];
      ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H);
    });
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(state.paddleX, PADDLE_Y, PADDLE_W, PADDLE_H);
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
  }, [status]);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || status !== 'running') return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    stateRef.current.paddleX = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[360px] text-xs font-black uppercase tracking-widest">
        <span className="text-neutral-400">
          {t('score')}: <span className="text-white">{score}</span>
        </span>
        <span className="text-neutral-400">
          {t('lives')}: <span className="text-rose-400">{lives}</span>
        </span>
        <span className="text-neutral-400">
          {t('high_score')}: <span className="text-amber-400">{best}</span>
        </span>
      </div>

      <div className="relative border-4 border-white neo-shadow-white bg-black">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerMove={handlePointerMove}
          className="block w-[min(360px,80vw)] h-auto touch-none"
        />

        {status !== 'running' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 text-center p-4">
            {status !== 'idle' && (
              <>
                <p className="text-2xl font-black uppercase tracking-tighter text-rose-500">
                  {status === 'won' ? 'YOU WIN!' : t('game_over')}
                </p>
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
              <Play size={14} /> {status === 'idle' ? t('start_game') : t('restart')}
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 text-center max-w-[320px]">
        {t('controls')}: ← → / A D {'·'} {t('breakout_hint')}
      </p>
    </div>
  );
};
