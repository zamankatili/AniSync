import { Minus, Plus, Check } from 'lucide-react';
import type { ShelfEntry } from '../lib/types';
import { useStore } from '../store/useStore';
import { progressPercent } from '../lib/format';

interface ProgressControlProps {
  entry: ShelfEntry;
  showComplete?: boolean;
}

export function ProgressControl({ entry, showComplete = true }: ProgressControlProps) {
  const bump = useStore((s) => s.bumpProgress);
  const setStatus = useStore((s) => s.setStatus);
  const total = entry.media.totalUnits ?? 0;
  const percent = progressPercent(entry);
  const step = entry.media.type === 'novel' ? 10 : 1;
  const unit = entry.media.unitLabel;
  const done = entry.status === 'done';

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <button
          onClick={() => bump(entry.media.id, -step)}
          className="btn btn-ghost btn-icon h-8 w-8"
          aria-label="Bir adım geri"
          disabled={entry.progress <= 0}
          style={{ opacity: entry.progress <= 0 ? 0.4 : 1 }}
        >
          <Minus size={14} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] font-bold tabular text-[var(--ink)]">
              {entry.progress}
              {total > 0 ? ` / ${total}` : ''}{' '}
              <span className="text-[10.5px] font-medium text-[var(--ink-3)]">{unit}</span>
            </span>
            {total > 0 && <span className="text-[10px] font-bold tabular text-[var(--ink-3)]">{percent}%</span>}
          </div>
          <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${total > 0 ? percent : Math.min(100, entry.progress)}%`, background: 'var(--accent)' }}
            />
          </div>
        </div>

        <button
          onClick={() => bump(entry.media.id, step)}
          className="btn btn-soft btn-icon h-8 w-8"
          aria-label="Bir adım ileri"
        >
          <Plus size={14} />
        </button>
      </div>

      {showComplete && !done && total > 0 && (
        <button
          onClick={() => setStatus(entry.media.id, 'done')}
          className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-[var(--ink-3)] transition-colors hover:text-[var(--good)]"
        >
          <Check size={12} /> Bitirdim olarak işaretle
        </button>
      )}
    </div>
  );
}
