import { Capacitor } from '@capacitor/core';

/**
 * Native kabuk (Android/iOS) açılış ayarları.
 *
 * Web'de hiçbir şey yapmaz; böylece aynı kod tabanı tarayıcıda da çalışır.
 * Capacitor eklentileri yalnızca native platformda dinamik olarak yüklenir.
 */
export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
      import('@capacitor/status-bar'),
      import('@capacitor/splash-screen'),
      import('@capacitor/app'),
    ]);

    // Koyu tema: açık renkli durum çubuğu ikonları.
    await StatusBar.setStyle({ style: Style.Light }).catch(() => undefined);
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => undefined);
      await StatusBar.setOverlaysWebView({ overlay: false }).catch(() => undefined);
    }

    // Android donanım geri tuşu: geçmiş varsa geri git, yoksa uygulamadan çık.
    await App.addListener('backButton', () => {
      if (window.history.length > 1 && window.location.pathname !== '/') {
        window.history.back();
      } else {
        App.exitApp().catch(() => undefined);
      }
    });

    // İlk kare çizildikten sonra splash'i kapat.
    requestAnimationFrame(() => {
      SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => undefined);
    });
  } catch (error) {
    console.warn('[nativeShell] Başlatma uyarısı:', error);
  }
}
