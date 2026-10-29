import React, { ErrorInfo, ReactNode } from 'react';
import { AnimeErrorCard } from './AnimeErrorCard';
import { useErrorStore } from '../store/useErrorStore';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AnimeErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by AnimeErrorBoundary:', error, errorInfo);
    useErrorStore.getState().logError({
      title: 'Bileşen Çökme Hatası (React Error Boundary)',
      message: error.message || 'Bilinmeyen bir UI hatası meydana geldi.',
      code: 'REACT_RENDER_CRASH',
      source: error.stack?.split('\n')[1] || 'Component Tree',
      details: errorInfo.componentStack || '',
    });
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-4xl mx-auto my-12">
          <AnimeErrorCard
            title={this.props.fallbackTitle || 'Nani?! Sayfa Bileşeni Yüklenirken Çöktü!'}
            message={this.state.error?.message || 'Bileşen işlenirken beklenmeyen bir hata oluştu.'}
            code="REACT_RENDER_CRASH"
            onRetry={this.handleReset}
            onUseFallback={() => (window.location.href = '/')}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
