import React from 'react';
import { Trophy, Flame, Target, Share2, X } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

interface StatsModalProps {
  onClose: () => void;
  stats: {
    played: number;
    wins: number;
    streak: number;
    maxStreak: number;
  };
}

export const StatsModal: React.FC<StatsModalProps> = ({ onClose, stats }) => {
  const { addToast } = useToastStore();
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  const handleShare = () => {
    const text = `🎯 AniSyncDle Günlük Karakter Tahmini!\n🏆 Galibiyet Oranı: %${winRate}\n🔥 Galibiyet Serisi: ${stats.streak} gün\nSen de dene: https://anisync-tau.vercel.app/dle`;
    navigator.clipboard.writeText(text);
    addToast('İstatistikler panoya kopyalandı!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black border-4 border-white neo-shadow-white w-full max-w-md text-white p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-neutral-900 hover:bg-rose-600 border-2 border-white transition-colors cursor-pointer text-white"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-white/20">
          <div className="w-10 h-10 bg-amber-400 text-black flex items-center justify-center font-black border-2 border-white neo-shadow">
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">ANISYNCDLE İSTATİSTİKLERİ</h2>
            <p className="text-xs text-neutral-400 font-bold uppercase">Günlük Anime Karakter Tahmin Skorun</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-neutral-900 border-2 border-white p-3 text-center">
            <div className="text-3xl font-black text-amber-400 mb-1">{stats.played}</div>
            <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Oynanan Oyun</div>
          </div>
          <div className="bg-neutral-900 border-2 border-white p-3 text-center">
            <div className="text-3xl font-black text-emerald-400 mb-1">%{winRate}</div>
            <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Galibiyet Oranı</div>
          </div>
          <div className="bg-neutral-900 border-2 border-white p-3 text-center">
            <div className="text-3xl font-black text-rose-500 mb-1 flex items-center justify-center gap-1">
              <Flame size={24} className="inline fill-rose-500" />
              <span>{stats.streak}</span>
            </div>
            <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Aktif Seri</div>
          </div>
          <div className="bg-neutral-900 border-2 border-white p-3 text-center">
            <div className="text-3xl font-black text-cyan-400 mb-1">{stats.maxStreak}</div>
            <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">En Yüksek Seri</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-amber-400 hover:bg-white text-black font-black uppercase text-xs border-2 border-white flex items-center justify-center gap-2 transition-all neo-shadow-white cursor-pointer"
          >
            <Share2 size={16} strokeWidth={2.5} />
            <span>SKORU PAYLAŞ</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase text-xs border-2 border-white transition-all cursor-pointer"
          >
            KAPAT
          </button>
        </div>
      </div>
    </div>
  );
};
