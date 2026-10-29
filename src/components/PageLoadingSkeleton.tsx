import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const ANIME_QUOTES = [
  "\"Düşmeden koşmayı öğrenemezsin.\" — Attack on Titan",
  "\"İnsan bir şeyi elde etmek için eşit değerde başka bir şeyi feda etmelidir.\" — Fullmetal Alchemist",
  "\"Sınırlarını aş, tam burada, tam şimdi!\" — Black Clover",
  "\"Asla pes etmemek benim sihirli değneğimdir!\" — Naruto",
  "\"Gelecek, onu bugün ne yaptığına bağlıdır.\" — Jujutsu Kaisen"
];

export const PageLoadingSkeleton: React.FC = () => {
  const quote = React.useMemo(() => {
    return ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];
  }, []);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-white space-y-6">
      {/* Animated Neo-Brutalist Loader Deck */}
      <div className="relative">
        <div className="w-20 h-20 bg-rose-600 border-4 border-white flex items-center justify-center neo-shadow-white animate-pulse">
          <Loader2 size={38} className="animate-spin text-white" />
        </div>
        <div className="absolute -top-3 -right-3 bg-amber-400 border-2 border-black text-black px-2 py-0.5 text-[10px] font-black uppercase neo-shadow">
          LAZY LOAD
        </div>
      </div>

      <div className="text-center space-y-2 max-w-md">
        <div className="flex items-center justify-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest">
          <Sparkles size={16} /> SAYFA BİLEŞENLERİ YÜKLENİYOR...
        </div>
        <p className="text-sm font-bold text-neutral-300 italic bg-black/60 p-3 border border-white/20 neo-shadow">
          {quote}
        </p>
      </div>

      {/* Grid Skeleton Placeholder Simulation */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 opacity-30 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-neutral-800 border-2 border-white/20 animate-pulse flex flex-col justify-between p-3">
            <div className="w-12 h-4 bg-white/20" />
            <div className="w-full h-3 bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
};
