import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import {I18nextProvider} from 'react-i18next';
import App from './App.tsx';
import {AnimeErrorBoundary} from './components/AnimeErrorBoundary';
import './index.css';
import i18n, { i18nReady } from './i18n';
import { initNativeShell } from './lib/nativeShell';

let rendered = false;
const mount = () => {
  if (rendered) return;
  rendered = true;
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        {/* Tüm uygulamayı saran güvenlik ağı: Layout veya provider çökse bile beyaz ekran yerine hata kartı gösterir. */}
        <AnimeErrorBoundary fallbackTitle="AniSync yüklenirken bir sorun oluştu">
          <App />
        </AnimeErrorBoundary>
      </HelmetProvider>
    </I18nextProvider>
  </StrictMode>,
);
};
// Locale bundle('lar) inmeden ilk render yapma — ham anahtarlar flaş etmesin.
// Blok olursa yine de render edilir (beyaz ekran yerine kaçış).
i18nReady.then(mount, mount);

// Native kabuk açılış ayarları (web'de no-op).
void initNativeShell();

// PWA: yalnızca web production build'de service worker kaydet
// (dev'de HMR'ı, native WebView'da ise gereksiz önbelleği bozmamak için).
const isNativeShell = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
if ('serviceWorker' in navigator && import.meta.env.PROD && !isNativeShell) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => console.warn('Service worker registration failed:', error));
  });
}

