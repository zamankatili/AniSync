import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Trash2, CheckCircle2, Copy, Wifi, WifiOff, AlertTriangle, Image as ImageIcon, Zap } from 'lucide-react';
import { useErrorStore } from '../store/useErrorStore';
import { useToastStore } from '../store/useToastStore';
import { clearImageCache } from '../lib/utils';

export const ErrorConsoleModal: React.FC = () => {
  const {
    showErrorConsoleModal,
    setShowErrorConsoleModal,
    errorLogs,
    clearErrorLogs,
    resolveError,
    logError,
    isOffline,
    setIsOffline,
  } = useErrorStore();
  const { addToast } = useToastStore();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!showErrorConsoleModal) return null;

  const handleCopySingle = (logId: string, logData: any) => {
    navigator.clipboard.writeText(JSON.stringify(logData, null, 2));
    setCopiedId(logId);
    addToast('Hata detayları kopyalandı.', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateRateLimit = () => {
    logError({
      title: 'Hız Sınırı Test Simülasyonu (HTTP 429)',
      message: 'Jikan API isteği sınırlandırıldı. Otomatik geri çekilme (backoff) ve yerel önbellek devreye sokuldu.',
      code: 'RATE_LIMIT',
      source: 'Test Simulation Engine',
      details: 'HTTP/1.1 429 Too Many Requests - Retry-After: 15'
    });
    addToast('⚡ HTTP 429 Hız Sınırı hatası simüle edildi.', 'info');
  };

  const handleSimulateDataError = () => {
    logError({
      title: 'Bozuk Veri Yükü Simülasyonu (MAL Parse Error)',
      message: 'Gelen JSON/XML paketinde zorunlu başlık veya mal_id anahtarları eksik.',
      code: 'MALFORMED_DATA',
      source: 'Import/Export Parser',
      details: 'TypeError: Cannot read properties of undefined (reading "title")'
    });
    addToast('⚠️ Bozuk veri yükü simüle edildi.', 'info');
  };

  const handlePurgeImageCache = () => {
    clearImageCache();
    addToast('🖼️ Görüntü önbelleği başarıyla temizlendi.', 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-black border-4 border-white neo-shadow-white flex flex-col max-h-[85vh] text-white"
        >
          {/* Header */}
          <div className="p-4 border-b-2 border-white/20 bg-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border-2 border-white bg-rose-600 flex items-center justify-center text-white font-black neo-shadow">
                <Terminal size={18} />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight text-white flex items-center gap-2">
                  AniSync Hata & Dayanıklılık Konsolu
                  <span className="text-xs px-2 py-0.5 bg-rose-600 text-white font-black">
                    {errorLogs.length} Kayıt
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 font-bold">
                  Kritik yollar (Arama, Liste, Detay) için hata simülasyonları ve sistem izleme
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowErrorConsoleModal(false)}
              className="p-2 border-2 border-white/20 hover:border-white hover:bg-rose-600 transition-colors text-white font-black neo-shadow-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* End-to-End Simulation & Quick Toolbar */}
          <div className="p-3 border-b-2 border-white/10 bg-neutral-950 flex flex-col gap-2">
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1">
              <Zap size={12} /> Dayanıklılık & Edge Case Hata Simülasyon Araçları:
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsOffline(!isOffline)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 border-2 transition-all text-xs cursor-pointer ${
                    isOffline
                      ? 'bg-amber-500 border-white text-black font-black'
                      : 'bg-neutral-900 border-white/20 text-neutral-300 hover:border-white'
                  }`}
                >
                  {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
                  {isOffline ? 'Ağ Kesintisi Aktif' : 'Çevrimdışı Test'}
                </button>

                <button
                  onClick={handleSimulateRateLimit}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border-2 border-white/20 hover:border-rose-500 hover:text-rose-400 text-neutral-300 text-xs transition-all cursor-pointer"
                >
                  <AlertTriangle size={14} className="text-rose-500" />
                  Simüle Et: HTTP 429
                </button>

                <button
                  onClick={handleSimulateDataError}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border-2 border-white/20 hover:border-amber-400 hover:text-amber-400 text-neutral-300 text-xs transition-all cursor-pointer"
                >
                  <Terminal size={14} className="text-amber-400" />
                  Simüle Et: Bozuk Veri
                </button>

                <button
                  onClick={handlePurgeImageCache}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border-2 border-white/20 hover:border-cyan-400 hover:text-cyan-400 text-neutral-300 text-xs transition-all cursor-pointer"
                >
                  <ImageIcon size={14} className="text-cyan-400" />
                  Önbellek Temizle
                </button>
              </div>

              <button
                onClick={() => {
                  clearErrorLogs();
                  addToast('Hata günlüğü temizlendi.', 'info');
                }}
                disabled={errorLogs.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border-2 border-white/20 hover:border-rose-500 hover:text-rose-500 text-neutral-300 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Trash2 size={14} /> Temizle
              </button>
            </div>
          </div>

          {/* Error List Body */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 font-mono text-xs">
            {errorLogs.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 font-sans">
                <CheckCircle2 size={40} className="mx-auto mb-2 text-emerald-500" />
                <h4 className="text-base font-black uppercase text-white">Sistem Stabil</h4>
                <p className="text-xs font-bold text-neutral-400">
                  Henüz yakalanan herhangi bir kritik hata veya Jikan API çökmesi yok. Simülasyon butonları ile test yapabilirsiniz.
                </p>
              </div>
            ) : (
              errorLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border-2 p-3 transition-all relative ${
                    log.resolved
                      ? 'border-neutral-800 bg-neutral-950/60 opacity-60'
                      : 'border-rose-500/80 bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap font-sans">
                      <span className="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 uppercase">
                        {log.code || 'ERROR'}
                      </span>
                      <span className="text-neutral-400 text-[11px] font-bold">[{log.timestamp}]</span>
                      <h4 className="font-black text-sm text-white uppercase">{log.title}</h4>
                    </div>

                    <div className="flex items-center gap-1 font-sans">
                      <button
                        onClick={() => handleCopySingle(log.id, log)}
                        className="p-1 text-neutral-400 hover:text-white border border-white/10 hover:border-white transition-colors"
                        title="JSON Kopyala"
                      >
                        {copiedId === log.id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      {!log.resolved && (
                        <button
                          onClick={() => resolveError(log.id)}
                          className="px-2 py-0.5 bg-neutral-800 text-neutral-300 hover:bg-emerald-600 hover:text-white font-black text-[10px] uppercase transition-colors"
                        >
                          Çözüldü İşaretle
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-rose-300 font-mono text-xs mb-1 break-words">{log.message}</p>

                  {log.source && (
                    <div className="text-[10px] text-neutral-400 font-mono line-clamp-1">
                      Kaynak: {log.source}
                    </div>
                  )}

                  {log.details && (
                    <pre className="mt-2 p-2 bg-black border border-white/10 text-[10px] text-neutral-400 overflow-x-auto max-h-32 whitespace-pre-wrap">
                      {log.details}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
