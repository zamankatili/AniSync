# AniSync — Admin Paneli & Kayıt/Giriş/Profil/Ayarlar Analizi
*Tarih: 9 Kasım 2026 · Kapsam: `app/` · Yöntem: kod okuma (auth, store, firebase, server, rotalar, sayfalar)*

## 0. Yönetici özeti
AniSync'te **kimlik doğrulama (Google + e-posta/şifre) ve bir profil sayfası zaten var**; ancak **admin paneli, yetki (role) sistemi, moderasyon, sistem ayarları ve analitik sıfır.** Sunucu API'leri (`/api/anime-news`, `/api/translate`, `/api/ai-recommendations`, `/api/sync/*`) kimliksiz açık; yetki sınırı yok. Firestore'un `isAdmin()` kuralı/konfigürasyonu kodda yok. En kritik ilk adım: **Firestore güvenlik kuralları + Firebase Custom Claims tipi `admin`** olmadan hiçbir admin ekranı canlıya alınmamalı.

---

## 1. Mevcut durum — envanter (doğrulanmış)

### 1.1 Kullanıcının gördüğü yüzey
| Parça | Durum | Kanıt |
|---|---|---|
| Google ile giriş | ✅ var | `AppStore.tsx:298` `loginWithGoogle`, `Layout.tsx` başlık butonu |
| E-posta + şifre kayıt | ✅ var | `AppStore.tsx:316` `registerWithEmail` |
| E-posta + şifre giriş | ✅ var | `AppStore.tsx:307` `loginWithEmail` |
| Şifre sıfırlama e-postası | ✅ var | `AppStore.tsx:325` `resetPassword` |
| Oturum kapatma | ✅ var | `AppStore.tsx:334` |
| Auth modal (giriş/kayıt/reset) | ✅ var | `AuthModal.tsx` |
| Giriş zorunlu sayfalar (Korumalı) | ✅ var | `/list`, `/lists`, `/watch-party`, `/grid-maker`, `/profile` via `PrivateRoute` |
| Profil sayfası (kendi) | ✅ var | `pages/Profile.tsx` (izleme listesi istatistikleri, radar chart, rozetler, karma seviyesi, kullanıcı handle'ı, Steam/anket alanı) |
| Başkasının profili (herkese açık) | ✅ var | `/profile/:uid` |
| Toast/hata bildirimi | ✅ var | `useToastStore`, `useErrorStore`, `ErrorConsoleModal` |

### 1.2 Firestore koleksiyonları (kodda görülen, üretimde olduğunu varsaydığımız)
| Koleksiyon | Kullanım | Yazma yetkisi (kodda görülen) |
|---|---|---|
| `users/{uid}` | Profil dokümanı, watchlist alt koleksiyonu | yalnız uid (sunucu kodu elimizde değil) |
| `users/{uid}/watchlist` | İzleme listesi | uid |
| `users/{uid}/reminders` | Yayın hatırlatıcıları | uid |
| `recentActivities` | Topluluk akışı / Life Sim sonuçları | **herkes (yazma)** — kod `addDoc` çağrıyor, Firestore kuralı belli değil |
| `animeComments` | Detay sayfası yorumları | **herkes** |
| `animeReviews/{animeId}/userReviews` | Kullanıcı incelemeleri | **herkes** |
| `customLists` | Özel listelerim | **herkes (yazma)** |
| `forumPosts` | Forum bildirimleri | **herkes** |
| `polls`, `suggestedPolls` | Popüler anketler | **herkes** |
| `socialFeed` | Sosyal akış | **herkes** |
| `globalChat` | Küresel sohbet | **herkes** |
| `watchPartyRooms/*/messages` | Oda mesajları | **herkes** |
| `animeNews` | Cloud haber (manuel) | **herkes (yazma!)** |
| `sharedLives` | Anonim Anma Defteri | **herkes (yazma!)** — salt-okuma çekme denemesi kurala takılıp sessiz boş dönüyor |
| `sharedLives`, `recentActivities` vb. | Scroll/query | sıklık limitsiz |

**Not:** Direkt istemci → Firestore yazma her yerde; bu MVP için hızlı ama yayında güvenlik riski. `animeNews`, `sharedLives` gibi toplulukça bozulabilecek koleksiyonlar sunucu tarafına alınmalı ya da yalnız `admin` yazmasına izin verilmeli.

### 1.3 Sunucu (`server.ts`) — kimliksiz açık uçlar
| Uç | Amaç | Auth? | Risk |
|---|---|---|---|
| `POST /api/translate` | Gemini çevirisi | ❌ | kota tüketimi, maliyet |
| `GET /api/anime-news` | Canlı RSS haber | ❌ | yok (rss2json köprüsü sabit) |
| `GET /api/refresh-news` | Cron çağrısı | ❌ | herkes tetikleyebilir (cron "sızdırma") |
| `GET /api/music-preview` | iTunes proxy | ❌ | düşük |
| `POST /api/ai-recommendations` | Gemini öneri | ❌ | kota tüketimi |
| `GET /api/sync/airing-schedule`, `/api/sync/trending-anime` | Jikan proxy | ❌ | düşük |
| `GET /api/games/search|games/:appid` | Steam proxy | ❌ | düşük |
| `GET /sitemap.xml` | SEO | ❌ | yok |

**Not:** Gemini **sunucu** tarafında — iyi (anahtar istemcide değil). Ama `searchParams`'a hiçbir giriş doğrulaması/yetkisi yok; `/api/refresh-news` ile keyfi 15 dk'lık cache tetiklenebilir; `/api/ai-recommendations` ile ücretsiz Gemini maliyeti artırılabilir.

### 1.4 "Admin" hiç yok — kanıtlar
- `admin` dizgisi hiçbir dosyada geçmiyor (arama sonucu 0).
- `role`/`roles`/`isAdmin` yok.
- `PrivateRoute` sadece "giriş var mı" kontrolü (`PrivateRoute.tsx:12`) — rol sorgulamaz.
- `server.ts`'te hiçbir istek `auth`/`Bearer`/`admin` kontrol etmiyor.
- `ErrorConsoleModal` (geliştirici konsolu) var ama sadece gösterim; toplama yok.

---

## 2. Admin panelinin olmamasının kullanıcı/operasyon etkileri

| Eksik | Bugün ne oluyor | Etki |
|---|---|---|
| İçerik seed/seed sürümü yok | "Bu hafta anketi" elle (kod/commit) güncellenir; `AIRING_SCHEDULE` hâlâ eski 2026 Sonbahar verisini tutuyor (fallback) | Haber/takvim bayatlar, fark edilmez |
| Moderasyon yok | Kötü amaçlı yorum/sohbet silinemez; spam engellenemiyor | Seri şikayet + itibar kaybı |
| Feature flag / bakım modu yok | Sorun olduğunda tüm kullanıcılara yayın durur; "bakımda" ekranı çevrilemez | Baştan Yayın hataları |
| Duyuru/bildirim sistemi yok | Yeni özellikler "sessiz" yayınlanır; kullanıcıya ulaşmaz | Düşük benimseme |
| Analitik yok | Hangi evren/evrim seçiliyor, kaç hayat oynandı, ölüm dağılımı — bilmiyoruz | Ürün kararı körlemesine |
| Toplu kullanıcı işlemi yok | "Hesabı sil" / "tüm verilerini ver" (GDPR/KVKK) elle, yavaş | Yasal risk |
| Admin işlem günlüğü yok | Sistem yedeklenmiyor; hatalı toplu işlem yapanı kimse görmüyor | Hesap verebilirlik yok |
| Sistem sağlığı görünür değil | Canlı RSS zamanında dönüyor mu? Gemini kotası? Jikan down mu? Bilmiyoruz | Farkında olman yok |

---

## 3. Önerilen ürün tanımı (kapsam)

**Amaç:** AniSync'e **tek koleksiyondan** yönerilebilen bir **iç yönetim arayüzü** — "elle deploy" gerekmeden hayata geçirilebilen sistem ayarları, kullanıcı yönetimi, moderasyon ve operasyon görünürlüğü.

**Kapsam (P0/P1/P2):**

### P0 — Güvenli temel (olmadan diğerleri canlıya alınamaz)
1. **Yetki modeli:** Firebase Auth Custom Claims `admin: true`; `users/{uid}` dokümanına `role: 'admin' | 'user' | 'moderator'` (claims ile birlikte). `useAdmin()` hook'u (claims okur) — `/admin/*` route'u `AdminRoute` ile korunur; yetkisiz erişim 404.
2. **Firestore security rules:** `isAdmin()` fonksiyonu; `recentActivities`, `animeNews`, `sharedLives`, `polls`, `socialFeed`, `globalChat` sadece `admin` yazabilir ya da oturumlu kullanıcı yazsa da güncelleme/silme yalnız admin; `users/{uid}` değişiklikleri sahibine veya admin'e.
3. **Admin seed'i:** İlk admin manuel (Firebase Console veya CLI `setCustomUserClaims`); sonraki adminler `/admin/users` UI'den atanabilir (sadece diğer adminler).
4. **Audit log:** `adminActions/{id}` — her admin işlemi (kullanıcı banlama, içerik silme, config değiştirme) `at`, `actor`, `action`, `targetId`, `before/after` ile kaydedilir. Saltlı hash ile hassas alanlar maskeler.
5. **Admin route için ayrı chunk + başlık:** `/admin/*` `AnimeLifeSim` tarzı lazy import; başlıkte "AniSync İçerik Yönetimi" tabı görünür (sadece adminlere).

### P1 — Sistem ayarları & feature flags (operasyonel)
6. **`config/app` dokümanı** (Firestore, tek doküman): `maintenanceMode: boolean`, `featureFlags: { lifeSim, musicQuiz, watchParty, dle, challenge, adminNews }`, `announcement: { text, type, startsAt, endsAt } | null`. `useRemoteConfig` hook'u: 60 sn cache + realtime `onSnapshot` aboneliği; bütün sayfalar flag'leri okur; `maintenanceMode=true` iken son kullanıcıya "Bakımdayız" ekranı (logolu, email, dönüş tarihi).
7. **Feature flag rollout:** Yüzdelik dağılım (`0`, `25`, `50`, `100`) → `useFeatureFlag('x', userId)` kararlı hash ile karar verir (ör. Life Sim %50'ye açıldı).
8. **Sistem sağlığı paneli (`/admin/system`):** Canlı RSS son çekim zamanı, Gemini 429 geçmişi, Jikan yanıt süreleri, Firestone okuma sayısı (yaklaşık), hata konsolu (`useErrorStore` boşaltma/export). Canlı olmasa bile "son başarılı" etiketleriyle bayatlık gösterilir (haber/takvim modelimizle aynı dürüstlük ilkesi).
9. **Kullanım limiti sayacı:** `/api/ai-recommendations` ve `/api/translate` için kullanıcı başına günlük kota (Firestore counter `rateLimits/{uid}/{yyyymmdd}`), aşımda 429 + dost mesaj. Katman: `maxRecommendationsPerUserPerDay: 20` (ayarlardan değiştirilebilir).

### P1/P2 — Kullanıcı & moderasyon aracı
10. **Kullanıcı yönetimi (`/admin/users`):** arama (handle/e-posta/UID), UID ile dışa aktarma (JSON), yasaklama (`banUntil`, `banReason`, `shadowBan? false`), "shadowban" yerine basit "hesabı askıya al": tüm paylaşım istekleri sessiz reddedilir (istemciye "başarı" değer, Firestore'a yazılmaz). Kullanıcı sayısı, yeni kayıtlar (son 7 gün), banlananlar listesi.
11. **İçerik moderasyonu (`/admin/reports`):** raporlanan yorumlar/sohbetler/akış gönderileri/hayatlar (`reports/{id}` — yeni koleksiyon; kullanıcı UI'ına "şikayet et" butonu eklenir) → "indirmez" 1 tıkla sil (`adminActions` loglar). `AnimeComments`, `globalChat`, `socialFeed`, `sharedLives`, `forumPosts`, `animeReviews` hedefi.
12. **Toplu canlı veri tetiği:** `/admin/sync` — "RSS çek → Firestore'a yaz", "trending güncelle", "polls seed'le" butonları; sonuç toast + `adminActions` logu.

### P2 — İçerik & analitik
13. **İçerik yönetimi (`/admin/content`):** günlük picks (`DAILY_PICKS`) düzenleme/JSON import-export; badge tanımları; arcade/Dle soru seti seed; Life Sim `worldEventPack` açık/kapalı / ağırlık override (dev araçları).
14. **Basit analitik (`/admin/analytics`):** `recentActivities` üzerinde toplayıcı; son 7/30 gün: aksiyon dağılımı, dünyaya göre sayaç (grafik — `recharts` zaten dependency'de), Life Sim anma sayısı, haftalık kayıt artışı. Canlı veri değil, "tahmini" notuyla gösterilir.
15. **KVKK/GDPR aracı (`/admin/data-requests`):** `dataRequests/{id}` — kullanıcı "verilerimi iste" der (profil altına buton); admin "ZIP hazırla" (JSON dışa aktarım — cevap e-postayla), "Hesabı sil" (gerçek silme — `deleteUserAuth` via Admin SDK ile sunucu/Cloud Function gerekir; bu yalnız Cloud Function ile güvenli olur).
16. **Dil/erişilebilirlik denetimi (`/admin/i18n`):** eksik anahtar raporu (i18nResource yükle → EN/JA/FR'de eksik anahtarları listele) — yayın öncesi kalite kapısı.

---

## 4. Teknik mimari (veri akışı)

```
[Admin (React, AdminRoute)]
        │  Firestore client SDK (authClaims: admin)
        ▼
[Firestore]  ──  rules: isAdmin() ──  config/app (flags, maintenance, announcement)
        │        ──  users/{uid} (ban, role)
        │        ──  reports/{id}
        │        ──  adminActions/{id}  ← her yazma buraya da yazar
        │
        └─  [Server (Express / Vercel function)]  /admin/api/*
              ↳ Firebase ID Token verifyCustomClaimsAdmin
              ↳ auditlog
              ↳ nadir işler: user delete/export via Admin SDK (serviceAccount yalnız server)

[Kullanıcı app]  →  useRemoteConfig →  gate kapılı bölümleri (bakım sayfası, feature shadow)
```

**İstemci tarafı:** Admin UI ayrı route grubu (`/admin/*`), `react-i18next` (TR anahtarları `admin.*` namespace'te — `i18n.ts` monolitinden ayrı `admin.json`).

**Sunucu tarafı (P2 için):** `server.ts`'e `/admin/api` prefix'i + `verifyAdmin` middleware (Firebase ID token doğrulama + `admin` claim); nadir işler (silme/export) yalnız burada.

**Paylaşılan:** `src/admin/` klasörü (hooks, bileşenler, i18n, tipler) — ortak CRUD grid (`AdminTable`) kolonlar + satır aksiyonları ile.

---

## 5. Uygulama sırası (yol haritası)

| Aşama | İş | Önkoşul | Tahmini süre |
|---|---|---|---|
| **A0** | Firestore `rules` deploy (isAdmin + read/write kısıtlama) + `functions` deploy (veya "rules-only, no server-write" modülü) | Firebase erişimi (konsol), CLI login | 0.5–1 gün |
| **A1** | `src/admin/useAdmin` hook + Custom Claims okuma; `AdminRoute` + `/admin/*` route | A0 | 0.5 gün |
| **A2** | `config/app` + `useRemoteConfig` + Bakım modu ekranı + `MaintenanceGate` | A1 | 1 gün |
| **A3** | `adminActions` log altyapısı + `AdminTable` komponenti + `NotificationsCenter` (toast) | A1 | 0.5–1 gün |
| **B1** | `/admin/users` — list/search/ban/unban + audit log | A3 | 1 gün |
| **B2** | `/admin/reports` — rapor kuyruğu + silme (moderasyon) | A3 | 1–2 gün |
| **B3** | `/admin/system` — sağlık paneli (son RSS, Gemini durumu) + kota sayaçları | A3, server sayaçları | 1–2 gün |
| **C1** | `/admin/content` — picks/polls/badge düzenleme + import/export | A3 | 1–2 gün |
| **C2** | `/admin/analytics` — recharts ile toplu özet | A3 | 1–2 gün |
| **D1** | `/admin/data-requests` — KVKK/GDPR export + silme (Cloud Function) | A2, server Admin SDK | 2–3 gün |
| **E1** | i18n `admin.*` anahtarları (en az TR/EN; JA/FR kapsam gerektikçe) | A1 | 0.5 gün |
| **E2** | Test: admin route guard + flag gate + quota testleri; `vitest` | A1–B2 | 1 gün |
| **F1** | `.env.example` güncellemesi + `ADMIN_EMAILS` kaldırılıp claim-based yapılır; dokümantasyon | A1 | 0.5 gün |

---

## 6. Güvenlik kuralları (örnek `firestore.rules` parçası)

```
function isSignedIn() { return request.auth != null; }
function isAdmin() {
  return isSignedIn() && (
    request.auth.token.admin == true
    || exists(/databases/$(database)/documents/users/$(request.auth.uid))
      && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
  );
}
match /{document=**} {
  match /config/app   { allow read: if true; allow write: if isAdmin(); }
  match /adminActions { allow read: if isAdmin(); allow write: if isAdmin(); }
  match /reports      { allow read, write: if isAdmin(); allow create: if isSignedIn(); }
  match /recentActivities { allow read: if true; allow write: if isSignedIn(); allow update, delete: if isAdmin(); }
  match /sharedLives       { allow read: if true; allow write: if isAdmin(); }
  match /animeNews         { allow read: if true; allow write: if isAdmin(); }
  match /polls, /socialFeed, /globalChat, /forumPosts, /animeComments, /animeReviews {
    allow read: if true; allow create: if isSignedIn(); allow update, delete: if isAdmin() || request.auth.uid == resource.data.userId;
  }
  match /users/{uid} { allow read: if true; allow update: if isSignedIn() && request.auth.uid == uid; allow write: if isAdmin(); }
}
```

**Sert kurallar (her aşamada):**
- Admin route'ta **service-account JSON paketine** asla referans yok.
- `admin` claim yalnız server veya Firebase CLI ile set edilir — istemciden `setDoc(users/{uid}, {role:'admin'})` çağrılamaz (rules `role` alanını `isAdmin()` koşuluyladışında değiştiremez).
- `adminActions` yazılamıyor istemciye if exception yoksa — sadece admin yazabilir.
- Hiçbir `console.log` üretimde bırakılmaz; hassas hata ayrıntısı kullanıcıya gösterilmez.
- Rate limit: admin yazma sayısı kullanıcı UI'ında doğrulansa bile rules/transaction ile zorlanır.

---

## 7. Sistem ayarları (örnek `config/app`)

```json
{
  "maintenanceMode": false,
  "announcement": {
    "tr": "Yeni özellik: Live Sim'i keşfedin!",
    "en": "New: discover Life Sim!",
    "ja": "新機能：ライフシムをどうぞ！",
    "fr": "Nouveau : découvrez Life Sim !",
    "type": "info",
    "startsAt": "2026-11-15T00:00:00Z",
    "endsAt": "2026-11-30T00:00:00Z"
  },
  "featureFlags": {
    "lifeSim": 100,
    "musicQuiz": 100,
    "watchParty": 50,
    "dle": 100,
    "challenge": 100,
    "adminNews": 0
  },
  "limits": {
    "maxRecommendationsPerDay": 20,
    "maxCommentsPerMinute": 5,
    "watchPartyRoomMax": 50
  }
}
```

`useFeatureFlag('lifeSim', userId)` — flag % (örn. 50) üzeri sahip olan `%` sorumuza; hash'ini `crc32(userId) % 100 < flag` şeklinde karar verir (kararlı, tüm cihazlarda aynı sonuç).

---

## 8. Riskler & karar soruları

| # | Risk / Karar | Öneri |
|---|---|---|
| R1 | **Firestore rules olmadan** kısmi oyun = okunamaz/yazılamaz app | A0 **şart**, A2'den önce |
| R2 | Gemini kota istismarı (anonim client spam `/api/ai-recommendations`) | P1 A3 + server rate limit |
| R3 | `recentActivities`/`animeNews` herkese açık yazma → spam/istenmeyen | A0'da `isAdmin` veya `isSignedIn` zorunlu kılın |
| R4 | Admin claim'ini yanlış kullanıcıya verme | Only CLI/console; `/admin/users` UI'ında "claim set by backend" butonu (Admin SDK script'i) |
| R5 | Admin UI public'te görünmez olmalı | 404 + `noindex` meta (`SeoManager` uyumlu); hiçbir link ifşa etmeyiz |
| R6 | "İnternetten alınan admin listesi" e-posta konfigürasyonu | `ADMIN_EMAILS` env'i yerine **sadece claim**; e-posta listesi denemesi bile yok |
| R7 | KVKK/GDPR silme işi Cloud Function gerektirir | D1'i tamamen sunucu tarafına; istemcide "istek oluştur" |
| R8 | `firebase-applet-config.json` içinde API anahtarı depoya giriyor | Env ile override ediliyor ama fallback doğrudan depoda — taşıma önerisi |
| S1 | **Karar:** Admin tek kullanıcıda mı, çoklu? | Önerim: çoklu `role: admin | moderator` — moderator sadece report'ları görür, ban/edit yok |
| S2 | **Karar:** Serverless (Vercel) devam mı, VPS mi? | Serverless + Vercel Cron neredeyse her şeyi karşılıyor; şu an `server.ts` yerine `api/*` işlenmeli düşünün |
| S3 | **Karar:** Bakım modu "göster ama yaz" mı, "kapat" mı? | Öneri: salt-okuma (cache/RSS) açık, yazma kapalı |

---

## 9. Hızlı MVP (tek hafta)

1. **A0** `firestore.rules` deploy, `isAdmin` + kısıtlı yazma.
2. **A1** Admin hook + `AdminRoute` + gizli `/admin` route (403/404 davranışı).
3. **A2** `config/app` + Bakım Modu + 2 flag (Life Sim on/off).
4. **B1** Kullanıcı listesi + ban/unban + `adminActions` log.
5. **B2** Report kuyruğu + silme (yorum/chat/akış).
6. **E1** TR/EN `admin.*` anahtarları.
7. **E2** 5 unit test (`AdminRoute` yetkisiz → 404, flag hash dağılımı, quota counter).

**Kabul kriterleri:** yetkisiz kullanıcı `/admin`'de 404 görür; bakım modu herkesi karşılar; admin 2 aksiyonunu loglar; report sayıları dashboard'da görünür.

---

## 10. Kod ve doküman işaretleri

- `AUDIT_2026-11.md` — ürün denetimi (bu doküman §11 sonrası).
- `src/context/AppStore.tsx` — auth kaynağı (tüm login/register/logout buradan).
- `src/components/PrivateRoute.tsx`, `src/components/AuthModal.tsx` — mevcut kapılar.
- `pages/Profile.tsx` — kullanıcıya dönük "profil" UI (admin paneliyle aynı görsel dili konuşur: siyah beyaz sert tema).
- `server.ts`, `vite.config.ts` — sunucu ve build (yeni `/admin/api/*` prefix'i buraya eklenecek).
- `firestore.rules` **repoda yok** — ilk iş olarak `firebase.json` + `firestore.rules` eklenecek (yoksa "kod içinde güvenlik" iddiası geçmez).
