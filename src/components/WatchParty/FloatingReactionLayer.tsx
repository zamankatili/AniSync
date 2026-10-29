import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingReaction } from '../../data/watchPartySeed';

interface FloatingReactionLayerProps {
  reactions: FloatingReaction[];
}

export const FloatingReactionLayer: React.FC<FloatingReactionLayerProps> = ({ reactions }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      <AnimatePresence>
        {reactions.map((react) => (
          <motion.div
            key={react.id}
            initial={{ 
              opacity: 0, 
              scale: 0.4, 
              y: 80, 
              x: `${react.xOffset}%`,
              rotate: (Math.random() - 0.5) * 30
            }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.6, 1.4, 1.2, 0.9], 
              y: -240, 
              rotate: (Math.random() - 0.5) * 45
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            className="absolute bottom-6 flex flex-col items-center"
          >
            <div 
              className="text-4xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] filter select-none animate-pulse"
            >
              {react.emoji}
            </div>
            <div 
              className="text-[9px] font-black uppercase px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000] text-black whitespace-nowrap mt-1"
              style={{ backgroundColor: react.color }}
            >
              {react.label}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
