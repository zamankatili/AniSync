import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--line-strong)] text-center ${
        compact ? 'px-4 py-8' : 'px-6 py-14'
      }`}
      style={{ background: 'color-mix(in srgb, var(--surface) 55%, transparent)' }}
    >
      {icon && <div className="mb-3 text-[var(--ink-3)]">{icon}</div>}
      <p className="display text-[1.05rem] text-[var(--ink)]">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-[var(--ink-3)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
