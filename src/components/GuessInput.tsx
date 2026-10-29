import React, { useState } from 'react';

interface GuessInputProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onGuess, disabled }) => {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onGuess(guess);
      setGuess('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Karakter ismini tahmin et..."
        className="flex-grow p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        disabled={disabled}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        disabled={disabled || !guess.trim()}
      >
        Tahmin Et
      </button>
    </form>
  );
};
