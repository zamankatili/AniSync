import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscape, useLockBody } from '../lib/hooks';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, subtitle, children, footer }: SheetProps) {
  useLockBody(open);
  useEscape(onClose, open);

  useEffect(() => {
    if (!open) return;
    const node = document.getElementById('sheet-root');
    if (!node) {
      const div = document.createElement('div');
      div.id = 'sheet-root';
      document.body.appendChild(div);
    }
  }, [open]);

  if (!open || typeof document === 'undefined') return null;
  const host = document.getElementById('sheet-root') ?? document.body;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-sheet-in relative z-10 w-full max-h-[88dvh] overflow-y-auto rounded-t-[26px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)] md:max-w-lg md:rounded-[var(--radius)]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-4">
          <div>
            {title && <h3 className="h2 text-[1.15rem]">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Kapat">
            <X size={17} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t border-[var(--line)] px-5 py-4">{footer}</div>}
      </div>
    </div>,
    host,
  );
}
