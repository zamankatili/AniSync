import { useEffect, useRef, useState } from 'react';
import { FileUp, Upload, Loader2, Check, AlertTriangle, ExternalLink, Film } from 'lucide-react';
import { Sheet } from './Sheet';
import { useStore } from '../store/useStore';
import {
  detectImportSource,
  parseAniListJson,
  parseMalXml,
  prepareMalImport,
  type ImportResult,
  type ImportSource,
} from '../lib/import';
import { MEDIA_LABELS } from '../lib/level';

interface ImportSheetProps {
  open: boolean;
  onClose: () => void;
}

export function ImportSheet({ open, onClose }: ImportSheetProps) {
  const importShelfItems = useStore((s) => s.importShelfItems);
  const [source, setSource] = useState<ImportSource>('mal');
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setRaw('');
      setResult(null);
      setError(null);
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    if (raw.trim().length < 20) {
      setResult(null);
      setError(null);
      return;
    }
    try {
      const parsed = source === 'mal' ? parseMalXml(raw) : parseAniListJson(raw);
      setResult(parsed);
      setError(parsed.items.length ? null : 'Dosyada aktarılabilir kayıt bulunamadı.');
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Dosya okunamadı.');
    }
  }, [raw, source]);

  const handleText = (text: string) => {
    setRaw(text);
    const detected = detectImportSource(text);
    if (detected && detected !== source) setSource(detected);
  };

  const readFile = async (file?: File | null) => {
    if (!file) return;
    const text = await file.text();
    handleText(text);
  };

  const runImport = async () => {
    if (!result?.items.length) return;
    setBusy(true);
    setError(null);
    try {
      let items = result.items;
      if (source === 'mal') {
        const enriched = await prepareMalImport(raw);
        items = enriched.items;
      }
      importShelfItems(items);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İçe aktarma başarısız oldu.');
    } finally {
      setBusy(false);
    }
  };

  const counts = result
    ? result.items.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Rafına aktar"
      subtitle="MAL veya AniList yedeğini içe al. Mevcut kayıtların korunur."
    >
      <div className="mb-3 flex gap-1.5">
        {(['mal', 'anilist'] as ImportSource[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setSource(s);
              setRaw('');
              setResult(null);
              setError(null);
            }}
            className="flex-1 rounded-[var(--radius-sm)] border px-3 py-2 text-[11.5px] font-bold transition-colors"
            style={{
              borderColor: source === s ? 'var(--accent)' : 'var(--line)',
              background: source === s ? 'var(--accent-soft)' : 'transparent',
              color: source === s ? 'var(--accent)' : 'var(--ink-2)',
            }}
          >
            {s === 'mal' ? 'MyAnimeList (.xml)' : 'AniList (.json)'}
          </button>
        ))}
      </div>

      <p className="mb-3 text-[11px] leading-relaxed text-[var(--ink-3)]">
        {source === 'mal' ? (
          <>
            MAL → Profil → Anime List → <strong>Export</strong> ile XML indir.{' '}
            <a
              href="https://myanimelist.net/panel.php?go=export"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 font-bold text-[var(--accent)]"
            >
              Dışa aktarma sayfası <ExternalLink size={10} />
            </a>{' '}
            Kapaklar ve detaylar AniList üzerinden tamamlanır.
          </>
        ) : (
          <>
            AniList → Settings → Apps → <strong>Export</strong> ile JSON indir. Anime ve mangalar birlikte gelir.
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm">
          <FileUp size={13} /> Dosya seç
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xml,.json,text/xml,application/json"
          className="hidden"
          onChange={(e) => {
            void readFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <span className="self-center text-[10.5px] text-[var(--ink-3)]">veya aşağıya yapıştır</span>
      </div>

      <textarea
        value={raw}
        onChange={(e) => handleText(e.target.value)}
        placeholder={source === 'mal' ? '<myanimelist>…</myanimelist>' : '{"lists":[…] }'}
        className="textarea mt-2 !min-h-[120px] font-mono text-[11px]"
        spellCheck={false}
      />

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] font-semibold text-[var(--accent-2)]">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {result && result.items.length > 0 && (
        <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-2)] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--good)]">
            <Check size={13} /> {result.items.length} kayıt hazır
            {result.enriched ? ` · ${result.enriched} kapak eşleşti` : ''}
          </p>
          <p className="mt-1 text-[10.5px] text-[var(--ink-3)]">
            {Object.entries(counts)
              .map(([status, count]) => `${count} ${
                status === 'active' ? 'devam' : status === 'done' ? 'bitti' : status === 'planned' ? 'sırada' : status === 'paused' ? 'arada' : 'bırakıldı'
              }`)
              .join(' · ')}
          </p>

          <div className="mt-2 space-y-1.5">
            {result.items.slice(0, 4).map((item) => (
              <div key={item.media.id} className="flex items-center gap-2">
                <div className="h-8 w-[22px] shrink-0 overflow-hidden rounded-[2px] bg-[var(--surface-3)]">
                  {item.media.cover ? (
                    <img src={item.media.cover} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--ink-3)]">
                      <Film size={10} />
                    </div>
                  )}
                </div>
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{item.media.title}</span>
                <span className="shrink-0 text-[9.5px] text-[var(--ink-3)]">
                  {MEDIA_LABELS[item.media.type]} · {item.progress}
                  {item.media.totalUnits ? `/${item.media.totalUnits}` : ''}
                </span>
              </div>
            ))}
            {result.items.length > 4 && (
              <p className="text-[10px] text-[var(--ink-3)]">+ {result.items.length - 4} kayıt daha…</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => void runImport()}
        disabled={!result?.items.length || busy}
        className="btn btn-primary mt-4 w-full disabled:opacity-40"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {busy ? 'Kapaklar getiriliyor…' : `${result?.items.length ?? 0} kaydı rafa aktar`}
      </button>
    </Sheet>
  );
}
