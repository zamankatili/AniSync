import React from 'react';
import { RefreshCw, AlertTriangle, WifiOff, ShieldAlert, Terminal, Copy, Check } from 'lucide-react';
import { useErrorStore } from '../store/useErrorStore';
import { useToastStore } from '../store/useToastStore';

export interface AnimeErrorCardProps {
  title?: string;
  message?: string;
  code?: 'RATE_LIMIT' | 'OFFLINE' | 'NOT_FOUND' | 'GENERIC' | string;
  onRetry?: () => void;
  onUseFallback?: () => void;
  compact?: boolean;
}

export const AnimeErrorCard: React.FC<AnimeErrorCardProps> = ({
  title,
  message,
  code = 'GENERIC',
  onRetry,
  onUseFallback,
  compact = false,
}) => {
  const { isOffline, setShowErrorConsoleModal, errorLogs } = useErrorStore();
  const { addToast } = useToastStore();
  const [copied, setCopied] = React.useState(false);

  // Determine display presets based on error code or offline status
  const effectiveCode = isOffline ? 'OFFLINE' : code;

  const getPreset = () => {
    switch (effectiveCode) {
      case 'OFFLINE':
        return {
          icon: WifiOff,
          badgeText: 'ÇEVRİMDİŞİ MOD',
          badgeBg: 'bg-amber-500',
          title: title || 'Bağlantı Koptu! (Isekai Portalı Çöktü)',
          message: message || 'İnternet bağlantınız kesilmiş gibi görünüyor. Önbellekteki verilerle devam edebilirsiniz.',
          accentColor: '#f59e0b',
          emoji: '📡⚡',
        };
      case 'RATE_LIMIT':
        return {
          icon: AlertTriangle,
          badgeText: 'HIZ SINIRI (HTTP 429)',
          badgeBg: 'bg-rose-600',
          title: title || 'Sakin Ol Sensei! Çok Hızlı İstekte Bulunuldu',
          message: message || 'Anime API servisi yoğun istek nedeniyle geçici olarak kısıtlandı. Birkaç saniye sonra otomatik düzelecektir.',
          accentColor: '#e11d48',
          emoji: '⏳🍥',
        };
      case 'NOT_FOUND':
        return {
          icon: ShieldAlert,
          badgeText: '404 BULUNAMADI',
          badgeBg: 'bg-purple-600',
          title: title || 'Bu Anime Kayıp Diyarlarda Bulunamadı',
          message: message || 'Aradığınız veri sunucularda veya arşivde mevcut değil.',
          accentColor: '#9333ea',
          emoji: '🔍🌀',
        };
      default:
        return {
          icon: AlertTriangle,
          badgeText: 'SİSTEM HATASI',
          badgeBg: 'bg-red-600',
          title: title || 'Nani?! Veri Yüklenirken Bir Hata Oluştu',
          message: message || 'Sunucudan yanıt alınamadı. Lütfen tekrar deneyin veya çevrimdışı önbelleği kullanın.',
          accentColor: '#dc2626',
          emoji: '💥⚠️',
        };
    }
  };

  const preset = getPreset();
  const IconComponent = preset.icon;

  const handleCopyLogs = () => {
    const lastError = errorLogs[0];
    const reportText = `[AniSync Error Report]\nCode: ${effectiveCode}\nTitle: ${preset.title}\nDetails: ${preset.message}\nLast Log: ${lastError ? JSON.stringify(lastError) : 'None'}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    addToast('Hata raporu panoya kopyalandı!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="border-2 border-rose-500 bg-black/90 p-4 neo-shadow text-white flex flex-col md:flex-row items-center justify-between gap-4 my-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-white bg-rose-600 flex items-center justify-center font-black shrink-0 neo-shadow-white">
            <IconComponent size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 text-black ${preset.badgeBg}`}>
                {preset.badgeText}
              </span>
              <h4 className="font-black text-sm uppercase tracking-tight text-white">{preset.title}</h4>
            </div>
            <p className="text-xs text-neutral-400 font-bold line-clamp-1">{preset.message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 border-2 border-white text-white font-black text-xs uppercase neo-shadow-white hover:bg-rose-500 transition-all cursor-pointer"
            >
              <RefreshCw size={14} /> Tekrar Dene
            </button>
          )}
          {onUseFallback && (
            <button
              onClick={onUseFallback}
              className="flex-1 md:flex-none px-3 py-1.5 bg-white border-2 border-white text-black font-black text-xs uppercase neo-shadow-white hover:bg-neutral-200 transition-all cursor-pointer"
            >
              Önbellek Verisi
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 border-4 border-white bg-black p-6 md:p-8 neo-shadow-white relative overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
        {/* Anime Illustration Avatar Badge */}
        <div className="relative shrink-0 mx-auto md:mx-0">
          <div className="w-24 h-24 border-4 border-white bg-rose-950 flex flex-col items-center justify-center neo-shadow relative group">
            <span className="text-3xl mb-1 group-hover:scale-125 transition-transform">{preset.emoji}</span>
            <IconComponent size={28} className="text-white" />
          </div>
          <div className={`absolute -bottom-2 -right-2 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black text-black ${preset.badgeBg} neo-shadow`}>
            {preset.badgeText}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-block mb-2">
            <span className="text-xs font-black tracking-widest uppercase bg-rose-600/30 border border-rose-500 text-rose-300 px-2 py-1">
              HATA BİLDİRİM SİSTEMİ # {effectiveCode}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight mb-2">
            {preset.title}
          </h3>

          <p className="text-sm text-neutral-300 font-medium leading-relaxed max-w-2xl mb-6">
            {preset.message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 border-2 border-white text-white font-black text-sm uppercase tracking-wide neo-shadow-white hover:bg-rose-500 hover:translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <RefreshCw size={18} /> Yeniden Dene
              </button>
            )}

            {onUseFallback && (
              <button
                onClick={onUseFallback}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-white text-black font-black text-sm uppercase tracking-wide neo-shadow-white hover:bg-neutral-200 transition-all cursor-pointer"
              >
                Çevrimdışı Kataloğu Yükle
              </button>
            )}

            <button
              onClick={() => setShowErrorConsoleModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-black border-2 border-white/40 text-neutral-300 hover:text-white hover:border-white font-black text-xs uppercase tracking-wide transition-all cursor-pointer"
            >
              <Terminal size={16} /> Hata Konsolu ({errorLogs.length})
            </button>

            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-2 px-3 py-2.5 bg-neutral-900 border-2 border-neutral-700 text-neutral-400 hover:text-white font-bold text-xs uppercase transition-all cursor-pointer"
              title="Hata Raporunu Kopyala"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copied ? 'Kopyalandı' : 'Rapor Kopyala'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
