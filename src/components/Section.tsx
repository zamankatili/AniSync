import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionProps {
  title: string;
  subtitle?: string;
  action?: { label: string; to: string };
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}

export function Section({ title, subtitle, action, children, className = '', right }: SectionProps) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="h2 text-[1.22rem] text-[var(--ink)]">{title}</h2>
          {subtitle && <p className="mt-1 text-[12.5px] text-[var(--ink-3)]">{subtitle}</p>}
        </div>
        {right}
        {action && (
          <Link
            to={action.to}
            className="group inline-flex shrink-0 items-center gap-1 text-[11.5px] font-bold text-[var(--ink-2)] transition-colors hover:text-[var(--accent)]"
          >
            {action.label}
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
