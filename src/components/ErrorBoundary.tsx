import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/** Bir sayfa çökse mekânın geri kalanı ayakta kalsın. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : undefined };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AniSync yakaladı:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="card mx-auto max-w-lg p-6 text-center">
        <p className="display text-[1.4rem]">Bu sayfa dağıldı</p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
          Bir şeyler ters gitti ama mekân hâlâ burada. Sayfayı yenilemeyi dene; olmazsa salona dönelim.
        </p>
        {this.state.message && (
          <pre className="mt-3 overflow-x-auto rounded-[var(--radius-xs)] bg-[var(--surface-2)] p-2 text-left text-[10px] text-[var(--ink-3)]">
            {this.state.message}
          </pre>
        )}
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm">
            <RotateCcw size={13} /> Yenile
          </button>
          <a href="/" className="btn btn-ghost btn-sm">
            <Home size={13} /> Salona dön
          </a>
        </div>
      </div>
    );
  }
}
