import React, { useState, useEffect } from 'react';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { useAppTranslation } from '../hooks/useAppTranslation';

/**
 * `config/app.announcement` varsa ve tarih aralığı içerideyse
 * gösteren tek satırlık duyuru banner'ı. Ayarlarda kapalı/adı
 * bulunamaz yoksayıldığında hiçbir şey göstermez.
 */
export const AnnouncementBanner: React.FC = () => {
  const { config } = useRemoteConfig();
  const { currentLang } = useAppTranslation();
  const [dismissed, setDismissed] = useState(false);

  const announcement = config?.announcement;
  if (!announcement || dismissed) return null;

  const startOk = !announcement.startsAt || new Date(announcement.startsAt).getTime() <= Date.now();
  const endOk = !announcement.endsAt || new Date(announcement.endsAt).getTime() >= Date.now();
  if (!startOk || !endOk) return null;

  const lang = (currentLang || 'tr').slice(0, 2);
  const message = (announcement as any)[lang] ?? announcement.tr ?? announcement.en ?? '';
  if (!message) return null;

  const color = announcement.type === 'critical' ? 'bg-rose-600' : announcement.type === 'warning' ? 'bg-amber-400' : announcement.type === 'success' ? 'bg-emerald-500' : 'bg-cyan-400';

  return (
    <div className={`${color} text-black w-full py-2 px-4 flex items-center justify-center gap-3 border-b-2 border-white/50`} role="status" aria-live="polite">
      <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[90%]">{message}</span>
      <button onClick={() => setDismissed(true)} aria-label="Kapat" className="text-[10px] font-black border-2 border-black px-1.5 py-0.5 bg-black text-white shrink-0 cursor-pointer">✕</button>
    </div>
  );
};
