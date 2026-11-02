import { Sparkles, Check, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[86px] z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 text-left shadow-[var(--shadow-lift)]"
        >
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{
              background: t.kind === 'unlock' ? 'var(--accent)' : 'var(--accent-soft)',
              color: t.kind === 'unlock' ? 'var(--accent-ink)' : 'var(--accent)',
            }}
          >
            {t.kind === 'success' ? <Check size={13} /> : t.kind === 'unlock' ? <Sparkles size={13} /> : <Info size={13} />}
          </span>
          <span className="text-[12.5px] font-semibold leading-snug text-[var(--ink)]">{t.text}</span>
        </button>
      ))}
    </div>
  );
}
