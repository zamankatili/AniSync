import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CHARACTERS_POOL } from '../data/charactersPool';
import { Search, Send, Sparkles } from 'lucide-react';

interface GuessInputProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onGuess, disabled }) => {
  const [guess, setGuess] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter matching suggestions
  const suggestions = useMemo(() => {
    if (!guess.trim() || guess.length < 2) return [];
    const query = guess.toLowerCase();
    return CHARACTERS_POOL.filter(
      c => c.name.toLowerCase().includes(query) || c.series.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [guess]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && !disabled) {
      onGuess(guess.trim());
      setGuess('');
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    onGuess(name);
    setGuess('');
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Anime karakteri veya seri adı yazın..."
            className="w-full px-4 py-3 bg-black border-4 border-white text-white font-bold text-sm uppercase focus:outline-none focus:border-amber-400 placeholder-neutral-500 transition-colors neo-shadow-white"
            disabled={disabled}
          />
          <Search size={18} className="absolute right-3.5 top-3.5 text-neutral-400 pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={disabled || !guess.trim()}
          className="px-6 py-3 bg-amber-400 hover:bg-white text-black font-black uppercase text-sm border-4 border-white flex items-center gap-2 transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 neo-shadow-white shrink-0"
        >
          <Send size={16} strokeWidth={3} />
          <span>TAHMİN ET</span>
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-black border-4 border-white z-50 neo-shadow-white max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectSuggestion(item.name)}
              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-neutral-800 border-b border-white/20 text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-8 h-8 rounded-none border border-white object-cover"
                />
                <div>
                  <div className="text-white font-black text-sm uppercase">{item.name}</div>
                  <div className="text-neutral-400 text-xs font-bold">{item.series}</div>
                </div>
              </div>
              <span className="text-[10px] bg-amber-400 text-black font-black px-1.5 py-0.5 uppercase border border-black">
                {item.genre}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
