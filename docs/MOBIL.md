# Mobil: PWA → Android → iOS

Bu proje mobil öncelikli yazıldı; mağaza sürümüne geçiş için büyük bir yeniden yazım gerekmiyor.
Capacitor, aynı `dist/` çıktısını native bir kabuğa sarar.

---

## 0. Şu an hazır olanlar

- `manifest.webmanifest`: ad, ikonlar (maskelenebilir), tema rengi, kısayollar.
- `viewport-fit=cover` + `safe-area-inset-*`: çentikli telefonlarda doğru yerleşim.
- 5 sekmeli alt menü, yatay kaydırmalı raflar, alt sayfa (sheet) etkileşimleri.
- Dokunma hedefleri ≥ 40 px, `-webkit-tap-highlight-color` kapalı.
- `prefers-reduced-motion` / "Hareketleri azalt" ayarı.
- Tema rengi (`<meta name="theme-color">`) atmosfere göre güncelleniyor.

### Telefonda hemen dene
1. Siteyi Chrome/Safari'de aç.
2. Menü → **Ana ekrana ekle**.
3. Uygulama tam ekran açılır (`display: standalone`).

> Not: Şu an service worker yok. Gerçek çevrimdışı destek için 2. adımdaki `vite-plugin-pwa` kurulumu önerilir.

---

## 1. Capacitor kurulumu

```bash
npm i @capacitor/core
npm i -D @capacitor/cli
npm i @capacitor/android @capacitor/ios

npx cap init            # appId: app.anisync.mobile, appName: AniSync, webDir: dist
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

`capacitor.config.ts` hazır; `appId` ve `appName` alanlarını istersen değiştir.

```bash
npx cap open android    # Android Studio
npx cap open ios        # Xcode (macOS gerekir)
```

Her web değişikliğinden sonra: `npm run build && npx cap sync`.

### Gereksinimler
- **Android**: Android Studio + JDK 17, `minSdk 23+`.
- **iOS**: macOS + Xcode 15+, Apple Developer hesabı (yayın için).

---

## 2. İkon ve açılış ekranı

- Mevcut ikon: `public/icon.svg`, maskelenebilir: `public/icon-maskable.svg`.
- Mağaza için 1024×1024 PNG üret: `@capacitor/assets` ile

```bash
npm i -D @capacitor/assets
mkdir -p assets && cp public/icon.svg assets/icon-only.svg
npx capacitor-assets generate
```

---

## 3. Native'de dikkat edilecekler

| Konu | Ne yapmalı |
| --- | --- |
| Durum çubuğu | `@capacitor/status-bar` → `Style.Dark` (çay evi) / `Style.Light` (kütüphane) atmosfere göre |
| Klavye | `@capacitor/keyboard` → `resize: 'body'`; yorum alanı odaklanınca sayfa kaymasın |
| Geri tuşu (Android) | `@capacitor/app` → `backButton`; alt sayfa açıksa kapat, değilse `history.back()` |
| Bağlantı | `@capacitor/network` → çevrimdışıyken yerel seçki zaten çalışıyor; küçük bir "çevrimdışısın" şeridi ekle |
| Paylaşım | `@capacitor/share` → gönderi/eser bağlantısı paylaşımı |
| Bildirim | `@capacitor/push-notifications` + Supabase Edge Function (yeni bölüm, yanıt) |
| Derin bağlantı | `app.anisync.mobile://m/anime/123` → `@capacitor/app` `appUrlOpen` ile router'a yönlendir |

### Önerilen ilk native eklemeler
1. **Paylaşım** (en kolay, en çok kullanılan).
2. **Geri tuşu** yönetimi.
3. **Durum çubuğu** rengi.
4. **Push** (hesap altyapısı geldikten sonra).

---

## 4. Mağaza kontrol listesi

- [ ] Uygulama adı: **AniSync**, alt başlık: "Otaku Mahallesi".
- [ ] Gizlilik politikası + kullanım şartları (hesap yoksa bile gerekli).
- [ ] Yaş derecelendirmesi: anime/manga içeriği nedeniyle 12+/13+ ve içerik uyarıları.
- [ ] Ekran görüntüleri: 6.7", 6.1", iPad 12.9" (iOS) / telefon + 7" tablet (Android).
- [ ] "Veri toplamıyoruz" beyanı — local-first sürümde doğru; hesaplar gelince güncelle.
- [ ] İçerik politikası: telifli kapak görselleri kaynak CDN'lerden; kullanıcı içeriği moderasyonu.
- [ ] Android: `targetSdk` güncel, `INTERNET` izni, ağ güvenliği yapılandırması (HTTPS).
- [ ] iOS: `NSAppTransportSecurity` gerekmiyor (tümü HTTPS), `UIBackgroundModes` gereksiz.

---

## 5. Hesap altyapısı gelince (Supabase önerisi)

Mevcut store eylemleri tek kapı görevi görüyor. Geçiş planı:

1. `profiles`, `shelf_entries`, `posts`, `replies`, `clubs`, `club_members` tabloları.
2. RLS: `shelf_entries` yalnız sahibine; `posts` herkese okunur, yazma girişli kullanıcıya.
3. `useStore` içindeki eylemlerde önce iyimser güncelleme, sonra Supabase yazımı.
4. `persist` yalnızca oturum öncesi/çevrimdışı tampon olarak kalsın.
5. Push için `pg_notify` → Edge Function → FCM/APNs.

Native kabuk değişmez; sadece web katmanı güncellenir ve `npx cap sync` çalıştırılır.
