# Ölçüm, hata izleme ve kötüye kullanım koruması

Son güncelleme: **2026-11-14**

Bu belge, AniSync'in üretimde "ne oluyor?" sorusunu cevaplayabilmesi için
eklenen dört katmanı ve **hâlâ yapılmamış** adımları anlatır. Hiçbir katman
varsayılan olarak açık değildir: ilgili ortam değişkeni tanımlanmazsa kod
no-op çalışır, üçüncü taraf isteği yapılmaz.

| Katman | Kod | Env | Kapalıyken davranış |
| --- | --- | --- | --- |
| GA4 sayfa/olay ölçümü | `src/lib/analytics.ts` + `AnalyticsRouteTracker` + `AnalyticsConsent` | `VITE_GA4_ID` | Hiçbir script yüklenmez, rıza bandı görünmez |
| Sentry hata izleme | `src/lib/errorReporting.ts` | `VITE_SENTRY_DSN` | Dinleyici kurulmaz, SDK indirilmez |
| Firebase App Check | `src/firebase.ts` | `VITE_RECAPTCHA_SITE_KEY` | Token eklenmez (bugünkü davranış) |
| Hız sınırı | `src/lib/rateLimit.ts` + her `server/api/*.ts` | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Bellek içi, örnek başına sayaç |

---

## 1. GA4 (davranış ölçümü)

### Neden rıza kapılı?
KVKK/GDPR gereği analitik çerezler açık rıza ister. Bu yüzden:

- `AnalyticsConsent` yalnızca `VITE_GA4_ID` varsa ve kullanıcı karar vermediyse görünür.
- **Kabul et** → `gtag` yüklenir, `analytics_storage: granted`, reklam sinyalleri kapalı.
- **Reddet** → hiçbir istek yapılmaz; seçim `localStorage: anisync_analytics_consent` içinde kalıcıdır.
- Reklam/pazarlama ölçümü bilinçli olarak **yok**: `allow_google_signals: false`,
  `allow_ad_personalization_signals: false`, `ad_storage: denied`.

### Neler gönderiliyor?
- `page_view`: yalnızca sadeleştirilmiş yol. Query/hash atılır; kimlik segmentleri
  `:id` olur: `/anime/16498` → `/anime/:id`, `/profile/<uid>` → `/profile/:id`.
- Özel olaylar allowlist ile sınırlı: `route, surface, mode, difficulty, lang,
  result, source, count`. 40 karakterden uzun değerler düşürülür (PII riski).
- E-posta, uid, arama terimi, mesaj içeriği **asla** gönderilmez.

### Dönüşüm olayları
Aktivasyon hunisi için üç olay **tarayıcı başına bir kez** gönderilir
(`trackConversionOnce`, `localStorage: anisync_conv_*`):

| Olay | Nerede | Parametreler |
| --- | --- | --- |
| `signup` | Google (popup + redirect) ve e-posta kaydı | `surface: google / google_redirect / email` |
| `first_list_add` | İlk kez listeye anime ekleme (misafir veya hesap) | `surface: guest / account` |
| `first_game_finish` | Voice Duel, AniSyncDLE, Life Sim sonu, Text Adventure sonu | `surface`, `mode`, `result`, `count` |

Rıza verilmeden dönüşüm **gönderilmez ve işaretlenmez**; kullanıcı sonradan
kabul ederse bir sonraki tetiklemede kaydedilir. Sınır: `localStorage`
temizlenirse aynı tarayıcıda yeniden sayılabilir; sunucu tarafı tekilleştirme
kullanıcı hesabı gerektirir (Admin SDK ile yapılacak).

### Kurulum
1. GA4'te bir Web data stream oluştur, `G-XXXXXXXXXX` ölçüm kimliğini al.
2. Vercel → Project → Settings → Environment Variables:
   `VITE_GA4_ID=G-XXXXXXXXXX` (Production + Preview).
3. Yeniden deploy et. İlk ziyaretçide rıza bandı çıkar.
4. DebugView'de `page_view` ve `game_start` gibi olayları doğrula.

> Not: GA4 kimliği istemci paketinde görünür — bu normaldir. Gizli anahtar değildir.

---

## 2. Sentry (hata izleme)

### Davranış
- DSN yoksa SDK hiç indirilmez (dinamik `import('@sentry/browser')`).
- **SDK yalnızca ilk hata yakalandığında indirilir.** Hata olmayan ziyaretlerde
  ~40 KB'lık paket ağdan çekilmez; hata anında yüklenip tampondaki olayı gönderir.
- DSN varsa `window.error` + `unhandledrejection` hemen dinlenir; SDK gelmeden
  oluşan en fazla 10 hata tamponlanıp sonra gönderilir.
- React render hataları `AnimeErrorBoundary` içinden `surface: react.errorBoundary`
  etiketiyle gider.
- `sendDefaultPii: false`; `beforeSend` içinde `user`, istek gövdesi, çerezler ve
  URL query'si silinir. Breadcrumb URL'leri de arındırılır.
- Aynı hata 5 saniye içinde tekrar gönderilmez (fırtına koruması).
- Performans izleme (tracing) kapalı: `tracesSampleRate: 0`. Davranış ölçümü GA4'te;
  iki sistemi üst üste bindirmiyoruz.

### Kurulum
1. sentry.io → New Project → **React**.
2. DSN'i kopyala.
3. Vercel env: `VITE_SENTRY_DSN=https://...@oXXXX.ingest.sentry.io/XXXX`
   (isteğe bağlı `VITE_SENTRY_RELEASE=<commit sha>`).
4. Deploy sonrası `Sentry.captureMessage` yerine gerçek bir test hatası üret:
   tarayıcı konsolunda `setTimeout(() => { throw new Error('sentry-probe') })`.
   Issue akışında görünmeli.

---

## 3. Firebase App Check

### Neden?
Firestore/Auth kuralları kimlik doğrulamasına dayanır; ama istemci anahtarı
herkese açıktır. App Check, isteğin gerçekten **senin uygulamandan** geldiğini
reCAPTCHA v3 ile kanıtlar ve kötüye kullanımı (script'le veri çekme) zorlaştırır.

### Durum
- Kod `src/firebase.ts` içinde hazır: `VITE_RECAPTCHA_SITE_KEY` varsa başlatılır.
- **Enforcement henüz açılmadı.** Açmadan önce site anahtarını doğrula, aksi
  halde tüm Firestore çağrıları reddedilir.
- Capacitor WebView'de reCAPTCHA güvenilir olmadığı için native kabukta App Check
  atlanır. Bu bilinçli bir sınırdır; native için ileride Play Integrity /
  DeviceCheck gerekir.

### Kurulum sırası (sırayı bozma)
1. Google Cloud → reCAPTCHA Enterprise (veya v3) → site anahtarı oluştur.
   Alan adları: `anisync-tau.vercel.app`, `localhost`.
2. Vercel env: `VITE_RECAPTCHA_SITE_KEY=<site key>`.
3. Deploy et, tarayıcı konsolunda App Check hatası olmadığını doğrula.
4. Firebase Console → App Check → Firestore → **Metrics**'te isteklerin
   `verified` göründüğünü 1–2 gün izle.
5. Ancak ondan sonra **Enforce** aç.
6. Yerel geliştirme için: `VITE_APPCHECK_DEBUG_TOKEN=true` ile debug token üret,
   Firebase Console'a ekle.

---

## 4. Hız sınırı

### Nasıl çalışır?
Her genel uç nokta `enforceRateLimit(req, res, RATE_LIMITS[...])` ile başlar.
Anahtar: `anisync:rl:<rule>:<hash(ip)>`. IP düz metin saklanmaz (FNV-1a).

| Uç nokta | Limit |
| --- | --- |
| `/api/anime-news` | 60 / dk |
| `/api/refresh-news` | 6 / dk (ayrıca `CRON_SECRET` gerekir) |
| `/api/games/search` | 30 / dk |
| `/api/games/:appid` | 40 / dk |
| `/api/og` | 240 / dk (sosyal bot trafiği için yüksek) |
| `/api/translate` | 20 / dk |
| `/api/moderate-room` | 20 / dk |
| `/api/ai-recommendations` | 10 / dk |

Yanıtlar `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
döner; limit aşımında `429` + `Retry-After`.

### Depolama seçimi
- **Upstash Redis** (önerilen): `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
  Atomik `EVAL` (INCR + PEXPIRE) kullanılır; tüm fonksiyon örnekleri aynı sayacı paylaşır.
- **Bellek içi** (varsayılan): her örnek kendi sayacını tutar. Ölçeklenmiş
  trafikte yaklaşık koruma; soğuk başlangıçta sıfırlanır. Dürüst sınır budur.
- **Fail-open**: Redis erişilemezse istek engellenmez, uyarı loglanır. Ürün
  çalışmaya devam eder.
- Yerel geliştirmede `RATE_LIMIT_DISABLED=1` ile tamamen kapatılabilir.

### Kurulum
1. upstash.com → Redis → yeni veritabanı (bölge: `eu-central-1` Vercel'e yakın).
2. REST URL + token'ı Vercel env'e ekle (Production + Preview).
3. Deploy sonrası: `curl -I https://anisync-tau.vercel.app/api/anime-news`
   → `X-RateLimit-Limit: 60` görünmeli.

---

## 5. Hâlâ yapılmayanlar (dürüst backlog)

1. **Dönüşüm olayları** artık gönderiliyor (`signup`, `first_list_add`,
   `first_game_finish`) ama yalnızca tarayıcı bazlı tekilleştirme var; aynı
   hesabın ikinci cihazı ayrı sayılır. GA4 arayüzünde bu olayların "conversion"
   olarak işaretlenmesi ve huni raporunun kurulması henüz yapılmadı.
2. **Sentry source map yüklemesi** yok. Minified stack trace okunur ama satır
   numarası eşleşmez. `@sentry/vite-plugin` + `SENTRY_AUTH_TOKEN` gerekir.
3. **App Check enforcement** açılmadı (yukarıdaki sıra tamamlanmadı).
4. **Uyarı/alert politikası** yok: Sentry'de hata oranı eşiği, GA4'te trafik
   düşüşü alarmı tanımlı değil.
5. **Sunucu tarafı yapısal log** yok; Vercel fonksiyon logları 1 saatlik
   pencerede kaybolur. Kalıcı log için Axiom/Datadog gerekir.
6. **Hız sınırı kimlik bazlı değil**, yalnızca IP bazlı. Giriş yapmış kullanıcı
   için uid bazlı kota (özellikle AI uç noktalarında) eklenmeli — bunun için
   güvenilir token doğrulaması (Admin SDK) şart.
