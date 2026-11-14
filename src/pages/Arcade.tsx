import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageMeta } from '../components/PageMeta';
import { ArrowLeft, BookOpen, Gamepad2, Grid2X2, Trophy } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useHighScore } from '../games/useHighScore';
import { SnakeGame } from '../games/SnakeGame';
import { BreakoutGame } from '../games/BreakoutGame';
import { MemoryGame } from '../games/MemoryGame';

type GameId = 'snake' | 'breakout' | 'memory';

interface GameDefinition {
  id: GameId;
  titleKey: string;
  descKey: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  accent: 'rose' | 'amber' | 'cyan';
}

const GAMES: GameDefinition[] = [
  { id: 'snake', titleKey: 'snake_title', descKey: 'snake_desc', icon: Gamepad2, accent: 'rose' },
  { id: 'breakout', titleKey: 'breakout_title', descKey: 'breakout_desc', icon: Grid2X2, accent: 'amber' },
  { id: 'memory', titleKey: 'memory_title', descKey: 'memory_desc', icon: BookOpen, accent: 'cyan' },
];

const ACCENT_CLASSES: Record<GameDefinition['accent'], { border: string; text: string; bg: string; shadow: string; play: string }> = {
  rose: {
    border: 'border-rose-500',
    text: 'text-rose-500',
    bg: 'bg-rose-600',
    shadow: 'hover:shadow-[6px_6px_0px_0px_#e11d48]',
    play: 'hover:bg-rose-600 hover:border-rose-600',
  },
  amber: {
    border: 'border-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-400',
    shadow: 'hover:shadow-[6px_6px_0px_0px_#fbbf24]',
    play: 'hover:bg-amber-400 hover:border-amber-400',
  },
  cyan: {
    border: 'border-cyan-400',
    text: 'text-cyan-400',
    bg: 'bg-cyan-400',
    shadow: 'hover:shadow-[6px_6px_0px_0px_#22d3ee]',
    play: 'hover:bg-cyan-400 hover:border-cyan-400',
  },
};

const GameCard = ({
  game,
  onPlay,
}: {
  game: GameDefinition;
  onPlay: () => void;
}) => {
  const { t } = useAppTranslation();
  const [best] = useHighScore(game.id);
  const accent = ACCENT_CLASSES[game.accent];
  const Icon = game.icon;

  return (
    <motion.button
      type="button"
      onClick={onPlay}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`text-left bg-black border-2 ${accent.border} p-5 neo-shadow-white transition-shadow ${accent.shadow} flex flex-col gap-3`}
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <span className={`inline-flex items-center justify-center w-11 h-11 border-2 ${accent.border} ${accent.text}`}>
          <Icon size={22} strokeWidth={2.5} />
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <Trophy size={12} className="text-amber-400" /> {best || 0}
        </span>
      </div>

      <h2 className={`text-xl font-black uppercase tracking-tight ${accent.text}`}>{t(game.titleKey)}</h2>
      <p className="text-xs font-bold text-neutral-400 leading-relaxed flex-1">{t(game.descKey)}</p>

      <span className={`inline-flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-white bg-white text-black font-black uppercase text-xs tracking-widest hover:text-white transition-colors ${accent.play}`}>
        {t('play')} →
      </span>
    </motion.button>
  );
};

export const Arcade = () => {
  const { t } = useAppTranslation();
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  const currentGame = GAMES.find((game) => game.id === activeGame) || null;

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto">
      <PageMeta title={`${t('arcade')} — AniSync`} description={t('arcade_tagline')} />

      {currentGame ? (
        <div>
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveGame(null)}
              className="inline-flex items-center gap-2 px-3 py-2 border-2 border-white/20 hover:border-white hover:bg-white hover:text-black font-black uppercase text-xs transition-colors"
            >
              <ArrowLeft size={16} /> {t('back_to_arcade')}
            </button>
            <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tighter ${ACCENT_CLASSES[currentGame.accent].text}`}>
              {t(currentGame.titleKey)}
            </h1>
          </div>

          <div className="bg-black border-2 border-white/20 neo-shadow p-4 sm:p-8 flex justify-center">
            {currentGame.id === 'snake' && <SnakeGame />}
            {currentGame.id === 'breakout' && <BreakoutGame />}
            {currentGame.id === 'memory' && <MemoryGame />}
          </div>
        </div>
      ) : (
        <div>
          {/* Hero */}
          <div className="relative overflow-hidden border-2 border-white/20 neo-shadow bg-black p-6 sm:p-10 mb-6">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 4px)',
              }}
            />
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-3">
                <Gamepad2 size={14} /> 8-BIT ZONE
              </p>
              <h1
                className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none"
                style={{ textShadow: '4px 4px 0px var(--theme-accent, #e11d48)' }}
              >
                {t('arcade')}
              </h1>
              <p className="mt-3 text-sm font-bold uppercase tracking-wider text-neutral-400">{t('arcade_tagline')}</p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 animate-pulse">
                ● INSERT COIN
              </p>
            </div>
          </div>

          {/* Game grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES.map((game) => (
              <GameCard key={game.id} game={game} onPlay={() => setActiveGame(game.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
