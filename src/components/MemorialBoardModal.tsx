import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useToastStore } from '../store/useToastStore';
import { X, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SharedLifeEntry {
  id: string;
  characterName: string;
  worldEmoji: string;
  worldNameTR: string;
  worldNameEN: string;
  regionNameTR: string;
  regionNameEN: string;
  deathAge: number;
  birthYear: number;
  deathCause: string;
  power: number;
  intelligence: number;
  luck: number;
  candles: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const LIT_KEY = 'anisync_candles_lit';

function loadLitIds(): string[] {
  try {
    const raw = localStorage.getItem(LIT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const MemorialBoardModal: React.FC<Props> = ({ open, onClose }) => {
  const { t, currentLang } = useAppTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const [entries, setEntries] = useState<SharedLifeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [lit, setLit] = useState<string[]>(() => loadLitIds());
  const isTr = currentLang === 'tr';

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    const fetchBoard = async () => {
      try {
        const q = query(collection(db, 'sharedLives'), orderBy('createdAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        if (cancelled) return;
        const items: SharedLifeEntry[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            characterName: data.characterName ?? 'Unknown',
            worldEmoji: data.worldEmoji ?? '🌍',
            worldNameTR: data.worldNameTR ?? '',
            worldNameEN: data.worldNameEN ?? '',
            regionNameTR: data.regionNameTR ?? '',
            regionNameEN: data.regionNameEN ?? '',
            deathAge: typeof data.deathAge === 'number' ? data.deathAge : 0,
            birthYear: typeof data.birthYear === 'number' ? data.birthYear : 0,
            deathCause: data.deathCause ?? '',
            power: typeof data.power === 'number' ? data.power : 0,
            intelligence: typeof data.intelligence === 'number' ? data.intelligence : 0,
            luck: typeof data.luck === 'number' ? data.luck : 0,
            candles: typeof data.candles === 'number' ? data.candles : 0,
          };
        });
        setEntries(items);
      } catch (err) {
        console.warn('Memorial board fetch failed:', err);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBoard();
    return () => { cancelled = true; };
  }, [open]);

  const handleCandle = async (entry: SharedLifeEntry) => {
    if (lit.includes(entry.id)) return;
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, candles: e.candles + 1 } : e)));
    const newLit = [...lit, entry.id];
    setLit(newLit);
    try { localStorage.setItem(LIT_KEY, JSON.stringify(newLit)); } catch { /* yoksay */ }
    try {
      await updateDoc(doc(db, 'sharedLives', entry.id), { candles: increment(1) });
    } catch (err) {
      console.warn('Candle increment failed:', err);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('als_board_title')}
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full max-h-[85dvh] bg-neutral-950 border-4 border-amber-400 neo-shadow-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b-2 border-white/10">
          <div>
            <h3 className="text-xl font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
              🕯️ {t('als_board_title')}
            </h3>
            <p className="text-[11px] text-neutral-400 font-bold mt-1">{t('als_board_desc')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white border-2 border-white/20 hover:border-white cursor-pointer" aria-label={t('als_detail_close')}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 [scrollbar-width:thin]">
          {loading ? (
            <p className="text-center text-xs text-neutral-500 font-black uppercase py-10">{t('als_board_loading')}</p>
          ) : failed || entries.length === 0 ? (
            <p className="text-center text-xs text-neutral-500 font-black uppercase py-10">{t('als_board_empty')}</p>
          ) : (
            entries.map((entry) => {
              const isLit = lit.includes(entry.id);
              return (
                <div key={entry.id} className="bg-neutral-900/70 border-2 border-white/10 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{entry.worldEmoji}</span>
                    <span className="font-black text-xs text-white uppercase tracking-tight">{entry.characterName}</span>
                    <span className="text-[9px] font-mono text-neutral-500 ml-auto">{entry.birthYear}–{entry.birthYear + entry.deathAge}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-bold leading-snug">
                    {isTr ? entry.worldNameTR : entry.worldNameEN} · {isTr ? entry.regionNameTR : entry.regionNameEN} · {entry.deathCause}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-[9px] font-mono text-neutral-500">
                      {t('als_board_stats', { power: entry.power, intelligence: entry.intelligence, luck: entry.luck })}
                    </span>
                    <button
                      onClick={() => handleCandle(entry)}
                      disabled={isLit}
                      className={cn(
                        'text-[9px] font-black uppercase px-2 py-1 border cursor-pointer transition-colors flex items-center gap-1',
                        isLit ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-white/20 text-neutral-300 hover:border-amber-400 hover:text-amber-400'
                      )}
                    >
                      <Flame size={10} className={isLit ? 'fill-amber-400' : ''} />
                      {t('als_candle', { count: entry.candles })}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MemorialBoardModal;
