import React, { useEffect, useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';

export interface ReportTarget {
  /** Firestore yolu (örn. `recentActivities/abc123` veya `animeComments/xyz`) */
  targetPath: string;
  /** Kullanıcıya gösterilecek kısa etiket */
  targetLabel?: string;
}

interface Props {
  target: ReportTarget;
  className?: string;
  compact?: boolean;
}

const REASON_KEYS = ['spam', 'harassment', 'hate', 'misinformation', 'other'] as const;

/**
 * Tek tıkla şikayet. Hedef koleksiyonunu rapor eder; `reports` koleksiyonuna yazı yazar.
 * Admin panel /reports route'u bu kayıtları gösterir ve siler.
 */
export const ReportButton: React.FC<Props> = ({ target, className, compact }) => {
  const { t, currentLang } = useAppTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<typeof REASON_KEYS[number]>('spam');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const { addToast } = useToastStore();
  const { currentUser } = useAppStore();

  useEffect(() => {
    if (!open) { setReason('spam'); setNote(''); }
  }, [open]);

  // Rapor butonuna basıldığında duyuruyu belirleyen admin orada görsün diye kayıt yazıyoruz.
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await addDoc(collection(db, 'reports'), {
        targetPath: target.targetPath,
        targetLabel: target.targetLabel ?? target.targetPath,
        reason,
        note: note.trim() || null,
        reportedBy: currentUser?.uid ?? null,
        status: 'open',
        createdAt: serverTimestamp(),
      });
      addToast(t('report_submitted', { defaultValue: 'Şikayetiniz alındı. Teşekkürler.' }), 'success');
      setOpen(false);
    } catch (err) {
      console.warn('Report submit failed:', err);
      addToast(t('report_failed', { defaultValue: 'Şikayet gönderilemedi.' }), 'error');
    } finally {
      setBusy(false);
    }
  };

  const reasonLabel = (r: typeof REASON_KEYS[number]) =>
    t(`report_reason_${r}`, { defaultValue: ({ spam: 'Spam', harassment: 'Taciz', hate: 'Nefret söylemi', misinformation: 'Yanlış bilgi', other: 'Diğer' } as any)[r] });

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={cn(
          'inline-flex items-center gap-1 text-neutral-500 hover:text-rose-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400',
          compact ? 'text-[9px] font-black uppercase' : 'text-[10px] font-bold uppercase',
          className
        )}
        aria-label={compact ? t('report') : `${t('report')} (${target.targetLabel ?? ''})`}
        title={t('report')}
      >
        <Flag size={compact ? 10 : 12} />
        {compact ? '' : t('report')}
      </button>
      {open && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="max-w-sm w-full bg-neutral-950 border-2 border-white p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-white">{t('report_title', { defaultValue: 'Şikayet et' })}</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-neutral-400 hover:text-white" aria-label={t('close')}><X size={16} /></button>
            </div>
            {target.targetLabel && <p className="text-[11px] text-neutral-500 font-mono break-all">{target.targetLabel}</p>}
            <div className="grid grid-cols-2 gap-2">
              {REASON_KEYS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={cn(
                    'p-2 border-2 text-[10px] font-black uppercase text-left transition-colors',
                    reason === r ? 'border-rose-500 bg-rose-500/10 text-rose-300' : 'border-white/20 text-neutral-300 hover:border-white'
                  )}
                >
                  {reasonLabel(r)}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('report_note_placeholder', { defaultValue: 'Açıklama (isteğe bağlı)…' })}
              rows={2}
              className="w-full bg-black border-2 border-white/20 focus:border-rose-500 text-white text-xs p-2 outline-none resize-none"
            />
            <button
              onClick={submit}
              disabled={busy}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black uppercase text-xs border-2 border-white flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
              {t('report_submit', { defaultValue: 'Gönder' })}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;
