import { create } from 'zustand';

export interface AnimeErrorLog {
  id: string;
  title: string;
  message: string;
  code?: string; // e.g., 'HTTP_429', 'NETWORK_ERROR', 'NO_DATA', 'PARSE_ERROR'
  source?: string;
  timestamp: string;
  details?: string;
  resolved?: boolean;
}

interface ErrorStoreState {
  errorLogs: AnimeErrorLog[];
  isOffline: boolean;
  showErrorConsoleModal: boolean;
  logError: (error: Omit<AnimeErrorLog, 'id' | 'timestamp'>) => void;
  clearErrorLogs: () => void;
  resolveError: (id: string) => void;
  setShowErrorConsoleModal: (show: boolean) => void;
  setIsOffline: (offline: boolean) => void;
}

export const useErrorStore = create<ErrorStoreState>((set, get) => {
  // Setup offline listeners if browser environment
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => set({ isOffline: false }));
    window.addEventListener('offline', () => set({ isOffline: true }));
  }

  return {
    errorLogs: [],
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    showErrorConsoleModal: false,

    logError: (errorData) => {
      const newLog: AnimeErrorLog = {
        ...errorData,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        resolved: false,
      };

      console.error(`[AniSync ErrorTracker] ${newLog.title}: ${newLog.message}`, newLog);

      set((state) => ({
        errorLogs: [newLog, ...state.errorLogs].slice(0, 50), // keep last 50
      }));
    },

    clearErrorLogs: () => set({ errorLogs: [] }),

    resolveError: (id) =>
      set((state) => ({
        errorLogs: state.errorLogs.map((log) => (log.id === id ? { ...log, resolved: true } : log)),
      })),

    setShowErrorConsoleModal: (show) => set({ showErrorConsoleModal: show }),
    setIsOffline: (offline) => set({ isOffline: offline }),
  };
});
