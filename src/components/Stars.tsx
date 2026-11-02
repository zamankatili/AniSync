import { Star } from 'lucide-react';

interface StarsProps {
  value?: number;
  onChange?: (score: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function Stars({ value = 0, onChange, size = 16, readOnly = false }: StarsProps) {
  const filled = Math.round((value / 10) * 5);
  return (
    <div className="flex items-center gap-1" role={readOnly ? undefined : 'radiogroup'} aria-label="Puan">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= filled;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(i * 2)}
            aria-label={`${i * 2} puan`}
            className={`transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
            style={{ color: active ? 'var(--warn)' : 'var(--ink-3)' }}
          >
            <Star size={size} fill={active ? 'currentColor' : 'none'} strokeWidth={1.8} />
          </button>
        );
      })}
      {value > 0 && <span className="ml-1 text-[11px] font-bold tabular text-[var(--ink-2)]">{value}/10</span>}
    </div>
  );
}
