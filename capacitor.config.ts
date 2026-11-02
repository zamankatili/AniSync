/**
 * Capacitor yapılandırması — mağaza sürümleri için hazır iskelet.
 * Kurulum adımları: docs/MOBIL.md
 *
 * Not: @capacitor paketleri henüz kurulu değil; web build'i etkilemez.
 */
const config = {
  appId: 'app.anisync.mobile',
  appName: 'AniSync',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#17100e',
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
  ios: {
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: true,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
