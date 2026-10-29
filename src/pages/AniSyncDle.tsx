import React, { useState } from 'react';
import { BlurredImage } from '../components/BlurredImage';
import { GuessInput } from '../components/GuessInput';

const DailyCharacter = {
  id: '1',
  name: 'Monkey D. Luffy',
  series: 'One Piece',
  imageUrl: 'https://cdn.myanimelist.net/images/characters/9/131031.jpg',
  difficulty: 'easy' as const,
};

export const AniSyncDle: React.FC = () => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleGuess = (guess: string) => {
    if (guess.toLowerCase() === DailyCharacter.name.toLowerCase()) {
      setIsCorrect(true);
    }
    setGuesses([...guesses, guess]);
  };

  const blurLevel = Math.max(0, 20 - guesses.length * 4);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">AniSyncDle</h1>
      <BlurredImage
        imageUrl={DailyCharacter.imageUrl}
        blurLevel={isCorrect ? 0 : blurLevel}
        alt="Günün Karakteri"
      />
      {isCorrect ? (
        <div className="text-green-500 font-bold text-xl">Tebrikler! Doğru tahmin: {DailyCharacter.name}</div>
      ) : (
        <GuessInput onGuess={handleGuess} disabled={guesses.length >= 5} />
      )}
      <div className="text-gray-400">Tahminlerin: {guesses.join(', ')}</div>
    </div>
  );
};
