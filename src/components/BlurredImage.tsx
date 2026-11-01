import React from 'react';
import { Sparkles, Eye, ShieldAlert } from 'lucide-react';

interface BlurredImageProps {
  imageUrl: string;
  blurLevel: number; // 0 to 24
  alt: string;
  isRevealed?: boolean;
}

export const BlurredImage: React.FC<BlurredImageProps> = ({ imageUrl, blurLevel, alt, isRevealed = false }) => {
  const percentage = Math.round((blurLevel / 24) * 100);

  return (
    <div className="relative overflow-hidden border-4 border-white neo-shadow-white w-full max-w-md mx-auto aspect-[3/4] bg-neutral-950 group">
      {/* Background Anime Character Poster with dynamic blur */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-700 ease-out select-none pointer-events-none"
        style={{
          filter: `blur(${blurLevel}px) grayscale(${isRevealed ? 0 : 35}%) contrast(${isRevealed ? 100 : 125}%)`,
          transform: isRevealed ? 'scale(1.02)' : 'scale(1.08)'
        }}
      />

      {/* Retro CRT scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* Blur Level Badge */}
      <div className="absolute top-3 left-3 z-10">
        {isRevealed ? (
          <span className="bg-emerald-400 text-black font-black text-xs px-2.5 py-1 border-2 border-white uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#fff]">
            <Sparkles size={13} /> AÇILDI!
          </span>
        ) : (
          <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 border-2 border-white uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#fff]">
            <Eye size={13} /> GİZLİLİK: %{percentage}
          </span>
        )}
      </div>

      {/* Target Crosshair Decoration */}
      {!isRevealed && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <div className="w-24 h-24 border-2 border-dashed border-white/60 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-rose-500 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};
