# AniSync Tam Sistem Analizi — Mimari, Eksikler ve Hatalar

*15 Kasım 2026 · Kapsam: **tüm** sayfa/bileşen/frontend/backend/altyapı · Yöntem: kaynak kod denetimi (21 sayfa, 66 bileşen, 59 lib, 10 zustand store, 8 serverless fonksiyon, 354 satır Firestore kuralı) + iki paralel derinlemesine inceleme · Bu belge **kod değiştirmez**, yalnız rapor ve plan*

---

## 1. Yönetici Özeti

**Genel sağlık: 7,5/10 — sağlam temel, kritik üç zayıf halka.**

AniSync, hobi ölçeğinin çok üzerinde bir mühendislik disiplinine sahip: strict TypeScript (sıfır `@ts-ignore`), 21 rotanın tamamı lazy, 4 dil parity testi, consent-gated analitik, deny-all fallback Firestore kuralları, oEmbed doğrulamalı içerik, kapsamlı SEO altyapısı. Ancak üç alanda **ürün ölçeğine geçişi engelleyen** yapısal eksik var:

| # | Kritik bulgu | Etki |
|---|---|---|
| 1 | **KVKK silme yolu çalışmıyor** — Firebase Admin SDK yok; `dataRequests/delete` yalnız durum alanını değiştiriyor, veri gerçekten silinmiyor (alt koleksiyonlar ana doküman silinince bile hayatta kalıyor) | Yasal uyum 🔴 |
| 2 | **Sunucu güveni yok** — XP, anket oyları, puan özetleri, oda karması hep istemciden yazılıyor; kurallar değerleri doğrulamıyor | Manipülasyon 🔴 |
| 3 | **AppStore god-context** — 45 alanlık tek provider, memo'suz `value` (AppStore.tsx:802); her watchlist/forum değişimi **tüm tüketicileri** yeniden render eder | Performans 🟠 |

Bunların yanında 40+ orta/düşük bulgu var (§4–§5) ve hepsi somut dosya:satır referanslı.

---

## 2. Sistem Envanteri (ölçülmüş)

```
Frontend     Vite 6 + React 19 + TS strict + Tailwind v4 + RRD v7 + zustand(10) + i18next(4 dil)
             21 sayfa (hepsi React.lazy) · 66 bileşen · 5 hook · 59 lib · 10 store
             107 `: any` eşleşmesi · 0 @ts-ignore · 23 test dosyası / 204 test (lib/data/i18n — sayfa/bileşen sıfır)
Backend      8 Vercel serverless fn (ai-recommendations, anime-news, moderate-room, og, refresh-news,
             translate, games/search, games/appid) ← kaynak: server/api/*.ts → api/ bundle (verify:api ile mühürlü)
             Express dev sunucusu (server.ts) — ama prod'da çalışmayan 4 ek endpoint (§5.3)
Veri         Firebase (Auth + Firestore + Storage + App Check opsiyonel) · AniList/Jikan/Steam/RSS client
             ~470 KB elle küratörlü içerik (DLE havuzu 94KB, müzik quiz 64KB, challenge 44KB, fan lore 45KB)
Deploy       Vercel (cron: refresh-news 05:00 UTC) · CI: tsc+eslint+vitest+build+verify:api
Mobil        Capacitor 8 (android/ios + share/haptics/preferences/splash/statusbar)
Gözlemlenebilirlik  GA4 (consent-gated) + Sentry (lazy, env-gated) + rate-limit (Upstash→memory fallback)
```

---

## 3. Güçlü Yanlar (korunması gerekenler)

1. **Tip disiplini:** strict TS, sıfır `@ts-ignore`, `verify` zinciri CI'da bundle tazeliği de denetliyor.
2. **Firestore kural mimarisi iskeleti doğru:** deny-all default, rol/ban yetki yükseltme koruması, `roomRequests` append-only oylama ve `sharedLives` candle gibi **mükemmel** kural örnekleri mevcut (firestore.rules:256-286, 326-339).
3. **Gizli anahtar hijyeni:** `.env` commit dışı (0 commit geçmişi), bundle'lar temiz, tüm `Bearer` kullanımları dinamik.
4. **HTTP katmanı:** `lib/api/http.ts` 9 sn timeout + Retry-After + backoff + dedupe — profesyonel kalitede; RSS hattı stale-cache fallback'i ile fail-safe.
5. **İçerik dürüstlüğü:** oEmbed doğrulama, kanonik-only alıntılar, dürüst boş durumlar — ürün kimliği tutarlı.
6. **i18n altyapısı:** 1898 satır × 4 dil eşit, parity + hardcoded-Türkçe kapısı testli.
7. **SEO:** sitemap↔route testli tutarlılık, bot-conditional OG rewrite, JSON-LD.
8. **Gözlemlenebilirlik env-gating:** GA4/Sentry/App Check/rate-limit hepsi env yoksa no-op — KVKK uyumlu tasarım.

---

## 4. Backend & Güvenlik Bulguları

### 4.1 [KRİTİK] KVKK silme yolu no-op
- `dataRequests/{type:delete}` admin tarafından "done" yapılıyor (AdminPage.tsx:127-136) ama **hiçbir yerde veri silinmiyor**. Depoda Admin SDK yok (arama: 0 sonuç).
- Firestore alt koleksiyonları (`watchlist`, `reminders`, `customData`) ana doküman silinse bile **kalır**.
- Herkese açık içerik (yorumlar, socialFeed, chat mesajları) uid anahtarlı kalır.
- **Çözüm:** Admin SDK'lı silme fonksiyonu (subcollection recursive delete + authored public docs temizliği) veya gerçek silme yoksa "export" akışıyla sınırlı kalıp UI'da "silme talebiniz elle işlenir" dürüst metni (30 gün SLA iddiası şu an uygulanamaz — Profile.tsx:71).

### 4.2 [YÜKSEK] İstemciye güvenilen yazımlar (maksatlı hile yüzeyi)
| Yazım | Kural | Saldırı |
|---|---|---|
| `polls.votes` değerleri | :125-130 yalnız anahtar eşleşmesi | `votes:{A:999999}` — istemci `increment(1)` kullanıyor ama kural zorunlu tutmuyor |
| `forumPosts.comments` | :148 — her oturum açan `comments` dizisini **bütünüyle** değiştirebilir | Başkalarının yorumlarını silmek/sahtelemek (AppStore.tsx:797 tam-doc `setDoc`) |
| `animeRatings` özeti | :164-172 aralık kontrolü var, çapraz doğrulama yok | `averageRating:5, totalRatings:10^9` |
| XP / xpTotal | :97-98 sahibi her alanı yazabilir | Lider tablosu tavanı `xpSync.ts` kendisi kabul ediyor |
| `karmaAtCreation` | :248 `int>=500` yeter | Oda sınırlaması atlanabilir; kural içi yorum bunu biliyor (:246-247) |
| `recentActivities` | :156 alan/boyut doğrulaması **yok** | Herkese açık akışa sınırsız spam dokümanı |

**Çözüm çizgisi:** Admin SDK olmadan mümkün olanlar hemen: `recentActivities`/`socialFeed`/`customLists`/`suggestedPolls` create'lerine `sharedLives` tarzı hasOnly+boyut kapları; `polls` oylamasını per-uid `votes/{uid}` dokümanlarından istemcide sayma (zaten kısıtlı); forum yorumlarını alt koleksiyona taşıma. Admin SDK gerektirenler: XP sayaçları, rating özetleri, karma.

### 4.3 [YÜKSEK] Gizli anahtar olmadan çalışabilir tetikler
- `refresh-news`: `CRON_SECRET` set değilse **anonim** tetiklenebilir (server/api/refresh-news.ts:13-20; .env.example:37'de yorum satırı). Üretimde zorunlu yapılmalı.
- `anime-news?refresh=true`: herkes cache bypass edebilir (server/api/anime-news.ts:15-18).
- App Check enforcement kapalı (docs/observability.md:97-112) — public web config, kural sınırları içinde serbest SDK erişimi demek.

### 4.4 [YÜKSEK] Güvenlik başlıkları hiç yok
`vercel.json` tek cache header'ı içeriyor; CSP/HSTS/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy **hepsi eksik**. En ucuz, en yüksek getirili düzeltme budur (§7 A1).

### 4.5 [YÜKSEK] Storage denetimsiz
- `storage.rules` **depoda yok** (console'dan yönetiliyor — denetlenemez durum); `EditProfileModal.tsx:47-58` avatar yüklemede **MIME/boyut doğrulaması yok** (kendim doğruladım).
- Çözüm: storage.rules dosyası (own-uid write, image/*, <2MB) + istemci kabul/boyut kontrolü.

### 4.6 [YÜKSEK] Prod'da ölü dev endpoint'leri
`server.ts`'teki `/api/music-preview`, `/api/sync/airing-schedule`, `/api/sync/trending-anime`, path-form `/api/og/:kind/:id` Vercel'de **fonksiyon yok** → catch-all'a düşüp HTML döner (200). İstemci zar zor kurtuluyor (airingService.ts:321-325, audioResolver.ts:31-56) ama her istek boşa render maliyeti. Çözüm: serverless'a taşı veya üretimde kapı-kapat.

### 4.7 [ORTA] CORS / native boşlukları
- Fonksiyonlarda CORS header yok → Capacitor WebView'dan `POST /api/translate` **preflight'ta düşer** (apiBase.ts:14-18 cross-origin). Native'de AI çeviri/öneri bugün çalışmaz.
- Native'de `signInWithRedirect` fallback'i WebView'da genellikle çalışmaz (AppStore.tsx:276-291) — `@capacitor/google-auth` eklentisi veya custom scheme akışı gerekir.
- Web `Notification` API hatırlatıcıları native'de garanti değil (useReminderStore.ts:79-84).

### 4.8 Diğer
- `translate`: girdi boyut sınırı yok (geminiEndpoints.ts:46-49) — 1MB text = maliyet şişirme. Zod yok (tüm validasyon elle, tutarsız).
- `games/*` prod'da upstream timeout yok (appid.ts:24-27) — askıda upstream fonksiyonu bloklar; `lib/api/http.ts` yeniden kullanılmalı.
- `deploy-rules.yml`: deprecated `firebase login:ci` token; ayrıca CI'dan bağımsız (needs yok) push'ta kural deploy ediyor.
- Boot admin e-postası 3 yerde hardcoded (rules:10, adminConfig:49, .env.example:31) — rol verildikten sonra temizlenmeli.
- `/api/health` yok — uptime monitörü kurulamaz.

---

## 5. Frontend Bulguları

### 5.1 [KRİTİK] AppStore god-context
- `AppStore.tsx:15-45`: 45 alan/eylem — auth + watchlist + forum + XP + anket tek context.
- `:802`: `value={{...}}` **useMemo'suz** → her provider render'ında her tüketici re-render. (Kendim doğruladım.)
- **Çözüm:** 3 context'e böl (auth+profile / watchlist / forum) + `useMemo`; uzun vadede zustand selector'larına taşı (store altyapısı zaten var, 10 store mevcut).

### 5.2 [YÜKSEK] Sınırsız Firestore listener'ları (17 abonelik listelendi, 4'ü limit'siz)
`forumPosts` (AppStore.tsx:137-138 — bilinen kritik), `users/{uid}/watchlist` (:238-239), `animeComments` (AnimeComments.tsx:39-45), `polls` (useDailyPoll.ts:14-15). AniSync'in analizi zaten #1'i öne çıkarmıştı; diğer üçü aynı sınıf.

### 5.3 [YÜKSEK] i18n kapsamı dışında kalan sabit Türkçe veriler
locales.test.ts güçlü ama **JSX-metin dışı string'lere bakmıyor**; gerçek örnekler:
- `AppStore.tsx:533` — `listName:'İzleniyor'` **Firestore'a yazılıyor**, EN/JA/FR kullanıcı RecentActivityFeed'de Türkçe görüyor.
- `AppStore.tsx:666,671` — `'Anime İçe Aktarıldı'` akışa yazılıyor.
- `useWatchPartyStore.ts:134,152,232,261` — oda başlığı/açıklama/`'Anonim'` dokümana yazılıyor.
- `newsService.ts:9,108,151` — TR-only kategori enum'u + `${title} — ...sezonunda yayında` başlık şablonu.
- `useAnimeData.ts:223`, `AnimeDetail.tsx:65-66` — hata mesajları.
- **Çözüm:** bu akışlarda enum + `t('status_*')` render-time dönüşümü (test kapsamını literal-string taramasına genişletmek ayrıca yapılabilir).

### 5.4 [YÜKSEK] useAnimeData: iptal korumasız + çift istemci
- Fetch zincirleri abort/cancel korumasız (useAnimeData.ts:186-424) — AnimeDetail/Discover/Home/MyList/MediaDetail'de `cancelled` guard yok (9 bileşende var, fark net).
- Aynı API'lerin **iki ayrı istemcisi**: hook'un kendi cache'i + `lib/api` katmanı; toplam Jikan hızı tek yerden ölçülemiyor. Debounce'suz type-ahead 500ms kuyruğu büyütüyor (:108).
- **Çözüm:** hook'u `lib/api/*` üzerine bindir + `signal`/cancelled guard'ları.

### 5.5 [YÜKSEK] Test boşluğu
23 testin tamamı lib/data/i18n; **21 sayfa, 70+ bileşen, AppStore, 10 store, hook fallback zincirleri: sıfır test**. `@testing-library` bağımlılığı yok. AppStore bölünmesi (5.1) öncesi en azından watchlist merge/import birim testleri eklenmeli.

### 5.6 [YÜKSEK] Route-level ErrorBoundary yok
Root'ta tek boundary (main.tsx:21-23); lazy chunk yükleme hatası tüm uygulamayı düşürür. Her `LazyRoute`'a boundary + Suspense retry eklenmeli.

### 5.7 [YÜKSEK] Yazım yarışları
- `toggleLike` tam doküman overwrite (AppStore.tsx:713-755) → `arrayUnion/arrayRemove`.
- `updateWatchlistItem`/`incrementEpisode` getDoc→setDoc RMW yarışı (:544-606) → `updateDoc`/transaction.

### 5.8 [ORTA] Seçilmiş diğerleri
- **Çift `<h1>`:** Layout header'daki `h1` + her sayfanın h1'i (Layout.tsx:264,414) — logo `<div>`'e çevrilmeli. (21 rota a11y 1.00'e rağmen başlık hiyerarşisi semantik olarak kusurlu.)
- **Eski↔yeni veri modeli ikiliği:** `types.ts` (Jikan-shape) vs `types/unified.ts` — her yeni özellik model seçmek zorunda; `animeBridge.ts` köprüsü var ama geçiş planı yok.
- `useAppTranslation` (95 call-site) react-i18next'in reaktif `t`'sini yeniden icat ediyor — standart `useTranslation`'a geçiş düşünülebilir.
- Recharts `CustomTooltip` 5 dosyada kopya; modal iskeleti ~20 dosyada tekrar → `ChartTooltip` + `<Modal>` primitive.
- Layout tüm `useReminderStore` state'ini destruct ediyor (selector yok, Layout.tsx:100-109).
- `sw.js` navigasyon fallback `response.ok` kontrolü yapmıyor (sw.js:83-93).
- `manifest.webmanifest` `lang:"tr"` sabit.
- localStorage çift yazım: watchlist listener'ı her Firestore güncellemesini tekrar localStorage'a yazıyor (AppStore.tsx:354-360).
- `Discover.tsx:87` `dangerouslySetInnerHTML` — `Trans` bileşenine geçilmeli.
- 107 `: any` (AdminPage 8, geminiEndpoints 7, useAnimeData 7…) — hotspot'lar types/ altına çıkarılabilir.

---

## 6. "Olması Gerekenler" — Eksik Ürün/Altyapı Listesi

1. **Sunucu tarafı yetki katmanı** (Admin SDK + Cloud Function): XP yazımı, rating özeti, oda onayı karma doğrulama, KVKK silme. Admin SDK'sız bunlar kalıcı olarak hile yüzeyi.
2. **Güvenlik başlıkları** (CSP dahil) — yok.
3. **`/api/health`** + uptime monitörü.
4. **storage.rules** — depoda yok.
5. **Sayfa/bileşen test altyapısı** (@testing-library + en az AppStore/watchlist birim testleri).
6. **Route-level ErrorBoundary + Suspense retry.**
7. **TanStack Query (pilot):** iki cache katmanı (hook + lib/api) ve 6 elle yazılmış TTL cache'in standartlaşması — kantan-analiz.md §4.8 ile aynı öneri.
8. **CORS/native AI akışı** — Capacitor'da translate/öneri bugün fiilen çalışmıyor.
9. **Abonelik sayfalama standardı:** tüm onSnapshot'lara limit + "daha fazla" deseni (17 abonelikten 13'ü sınırlı — desen mevcut, 4 taneye uygulanacak).
10. **KVKK watchlist gizliliği:** `users/{uid}/watchlist` read `if true` (:107) — izleme listesi varsayılan herkese açık; en azından ilk giriş onayı/profile gizlilik ayarı.

---

## 7. Öncelikli Eylem Tablosu

| # | İş | Boy | Getiri |
|---|---|---|---|
| A1 | vercel.json güvenlik başlıkları (CSP, HSTS, nosniff, Referrer-Policy, XFO) | S | Yüksek güvenlik / 30 dk |
| A2 | `users/{uid}` read daraltma (public-profil alanları ayrı dokümana) veya AdminPage listesi admin-only koleksiyona | S–M | PII sızıntısı kapanır |
| A3 | Firestore create validator'ları: recentActivities/socialFeed/customLists/suggestedPolls + watchPartyRooms (sharedLives deseni kopyala) | M | Spam/sahtecilik kapanır |
| A4 | `CRON_SECRET` prod'da zorunlu + `?refresh=true` auth'a bağla | S | Ücretsiz infra koruması |
| A5 | storage.rules dosyası + avatar MIME/boyut kontrolü | S | Denetimsiz yüzey kapanır |
| B1 | AppStore 3'e bölme + useMemo | L | Tüm uygulama render performansı |
| B2 | forumPosts/watchlist/animeComments/polls limitleri (home-analiz #1 ile birleşik) | S | Maliyet + bellek |
| B3 | toggleLike→arrayUnion, watchlist RMW→updateDoc | S | Yarış hataları |
| B4 | Route-level ErrorBoundary | S | Dayanıklılık |
| B5 | i18n enum dönüşümü (listName/oda başlıkları/haber kategorileri) | M | 4-dil dürüstlüğü |
| C1 | Admin SDK'lı silme fonksiyonu (KVKK) | L | Yasal uyum — **karar gerekir** (service account) |
| C2 | XP/rating sunucu doğrulaması | L | Hile kapama — Admin SDK ile |
| C3 | useAnimeData → lib/api bindirme + abort guard | M | Çift istemci temizliği |
| C4 | Dev-only endpoint'lerin prod kapatılması/taşınması | S | Boşa fonksiyon maliyeti |
| C5 | Native: @capacitor/google-auth + CORS allowlist | M | Mobil uygulama AI/auth çalışır |

**Sıra önerisi:** A1 → A4 → A5 → A2 → A3 (tek hafta sonu, hepsi güvenlik, Firestore rules deploy-rules akışıyla) → B2/B3/B4 → B1 (planlı) → C grubu (Admin SDK kararı sonrası).

---

## 8. Dürüst Sınırlar

- Bu analiz statik kaynak kod + canlı üretim gözlemlerine dayanır; **auth-korumalı akışlar E2E test edilemedi** (service account yok), Storage kuralları depoda olmadığından **denetlenemedi**, Vercel env gerçek değerleri (GEMINI_API_KEY/CRON_SECRET set mi) repodan doğrulanamaz.
- AppStore bölünmesi ve TanStack Query geçişi gerçek etkisi ölçülmeden (render sayacı/Lighthouse) yapılmamalı; Lighthouse bu ortamda Performance kategorisi raporlamıyor (bilinen sınır, z-raporu.md).
- Yayın tabanlı iddialar (satır numaraları) baş `8396c78..c4e7968` anlık görüntüsüne aittir.
