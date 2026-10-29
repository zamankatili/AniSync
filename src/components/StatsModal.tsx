import React from 'react';

interface StatsModalProps {
  onClose: () => void;
  stats: {
    played: number;
    wins: number;
    streak: number;
  };
}

export const StatsModal: React.FC<StatsModalProps> = ({ onClose, stats }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-sm text-white border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">İstatistiklerin</h2>
        <div className="space-y-2">
          <p>Oynanan: {stats.played}</p>
          <p>Galibiyet: {stats.wins}</p>
          <p>Seri: {stats.streak}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full p-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
