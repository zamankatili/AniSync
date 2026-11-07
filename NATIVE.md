# Native Uygulamalar (Android / iOS)

AniSync web uygulaması Capacitor ile sarılır. Aynı React kodu tarayıcıda, Android'de ve iOS'ta çalışır.

## Gereksinimler

- **Android:** Android Studio + JDK 21 (Capacitor 8). `npx cap open android` sonrası Studio üzerinden çalıştırın.
- **iOS:** macOS + Xcode 16+. `npx cap open ios` sonrası imzalama (Signing & Capabilities) ayarlanır.

## Komutlar

```bash
npm run native:sync      # web build + native kopyalama (cap sync)
npm run native:android   # sync + Android Studio'yu açar
npm run native:ios       # sync + Xcode'u açar
```

Yalnızca web build'i yeniledikten sonra: `npx cap sync`.

## API adresi

Web'de istekler göreli (`/api/...`) gider. Native kabukta göreli yol çalışmadığı için
`src/lib/apiBase.ts` devreye girer:

- Varsayılan: `https://anisync.app` (native)
- Geliştirme için: `.env` içine `VITE_API_BASE_URL=https://<sunucu>` yazın.

Bu değişkeni değiştirdikten sonra `npm run native:sync` çalıştırın.

## İkon ve splash

Kaynak dosyalar `resources/` altında (`icon.png`, `splash.png`, `splash-dark.png`).
Yeniden üretmek için:

```bash
npx capacitor-assets generate --assetPath resources --iconBackgroundColor '#000000' --splashBackgroundColor '#000000'
```

## Bilinen sınırlar / sıradaki adımlar

### Google ile giriş (native plan)
Firebase `signInWithPopup` bir WebView içinde güvenilir şekilde çalışmaz. Native Google giriş şu şekilde yürütülür:
- **Android:** `cordova-plugin-googleplus` / `@codetrix-studio/capacitor-google-auth` ile `google.signIn()`; ardından `GoogleAuthProvider.credential(idToken)` ile Firebase'de `signInWithCredential`.
- **iOS:** `ASWebAuthenticationSession` ile Google OAuth2 akışı; alınan `idToken` ile Firebase `signInWithCredential`.
- **Web (fallback):** Firebase `signInWithPopup(googleProvider)`.
- Ortak: `googleProvider.setCustomParameters({ prompt: 'select_account' })` ve `VITE_GOOGLE_*_CLIENT_ID` env değişkenleri (`src/firebase.ts` üzerinden `googleProvider` yapılandırılabilir).

### Bildirimler
Push için `@capacitor/push-notifications` + FCM (Android) / APNs (iOS) yapılandırması gerekir.

### Mağaza
Android `versionCode`, iOS `CFBundleVersion` ve imzalama anahtarları yayın öncesi ayarlanmalı.

### Çevrimdışı
Service worker yalnızca web'de kaydedilir; native'de varlıklar APK/IPA içindedir.
