# Rapor Denetimi — İki Eski Denetimin Doğrulaması ve Üçüncü Görüş

*15 Kasım 2026 · İncelenen: `SYSTEM_AUDIT_2026-11-10.md` (414 satır) + `PRODUCT_GAP_ANALYSIS_2026-11-12.md` (270 satır) · Yöntem: her "düzeltildi" iddiası **bugünkü kodda tek tek** doğrulandı (HEAD `31fc2f4`) · Çapraz referans: `docs/sistem-analiz.md` (tam sistem denetimi) · Bu belge kod değiştirmez*

---

## 1. İki raporun değeri (dürüst değerlendirme)

**İkisi de iyi rapor.** Özellikle:

- `SYSTEM_AUDIT` 10 Kasım'da **gerçek P0'ları** yakalamış: GlobalChat çökmesi, onaylı odanın asla açılmaması, `animeRatings` kurallarının hiç olmaması, `email_verified` eksikliği, Watch Party herkese açık yazma, anket oyu sahteleme. Bunların **hepsi o gün gerçekti** ve bugün **hepsi kapalı** (aşağıda kanıtla).
- `PRODUCT_GAP_ANALYSIS` ürünleşme turlarını **doğrulanabilir davranışlarla** kaydetmiş (text adventure tam yürüyüş, OG bot testleri, sunucu fonksiyonu ön-paketleme). Bu disiplin, çoğu ticari ekipte yok.
- İkisinin ortak zayıflığı aynı: **anlık görüntü belgesi** — düzeltmeler kapandıkça "durum" bölümü çürüyor; sayılar (67 test, 3/77 lazy, "GA4 yok") bugün yanlış. Ve **hiçbir raporda Firestore kuralları için otomatik test yok** (bkz. §6), yani "düzeltildi" iddiaları yalnız insan gözüyle doğrulanmış.

Bu belge üç işi yapıyor: (a) her iddiayı bugünkü kodla eşleştirmek, (b) **tam kapanmayanları** ayırmak, (c) her iki raporun **kaçırdığı** yapısal sorunları eklemek.

---

## 2. İddia doğrulama tablosu

### 2.1 `SYSTEM_AUDIT` P0'lar

| Madde | Rapordaki durum | Bugünkü kod (kanıt) | Verdict |
|---|---|---|---|
| P0-1 GlobalChat misafir mesajı çökmesi | ✅ düzeltildi | `toDateSafe` normalize (`GlobalChat.tsx:10`) + GlobalChat kendi `<AnimeErrorBoundary>` içinde (`Layout.tsx:627-629`) | ✅ **Tam kapalı** |
| P0-2 Onaylı oda asla açılamaz | ✅ düzeltildi | `isValidRoom`: `source=='approved' && isAdmin()` (`firestore.rules:251-254`) | ✅ **Tam kapalı** |
| P0-3 `animeRatings` kurallarda yok | ✅ düzeltildi | `match /animeRatings/{animeId}` var (`rules:162-172`), özellik çalışıyor | ✅ açıldı — **ama** bütünlük zayıf (bkz. §3.1) |
| P0-4 AdminRoute rol okumuyor | ✅ düzeltildi | `users/{uid}.role` Firestore'dan okunuyor (`AdminRoute.tsx:39-43`) | ✅ **Kapalı** (kalıntı: §3.2) |
| P0-5 Bootstrap admin + `email_verified` yok | ✅ düzeltildi | `rules:7-10` — `email_verified == true` şartı | ✅ **Yetki yükseltme kapalı** (kalıntı: §3.2) |
| P0-6 `watchPartyRooms` herkese açık yazma | ✅ düzeltildi | Host/admin tam; diğerleri yalnız kilit açıkken `isPlaying/currentTime/updatedAt` (`rules:298-305`) | ✅ **Kapalı** (yorum uyumsuzluğu: §3.3) |
| P0-7 Anket oyu forge edilebilir | ✅ düzeltildi | `runTransaction` + `votes/{uid}` tek-oy kontrolü (`DailyPollModal.tsx:84-95`) | ⚠️ **Kısmi** — kural hâlâ değer doğrulamıyor (§3.1) |

### 2.2 `SYSTEM_AUDIT` P1'ler

| Madde | Bugünkü kod | Verdict |
|---|---|---|
| P1-1 VideoPlayerDeck her saniye reload | `embedSrc` `useMemo` yalnız `youtubeId`'ye bağlı; `postMessage` komutları (`VideoPlayerDeck.tsx:47-62`); timeline `max={duration}` (`:262`) | ✅ **Kapalı** |
| P1-2 Uydurma tür "trend" sayıları | Bileşen kullanıcının kendi watchlist'inden hesaplıyor, boş listede açık boş durum (`GenreTrendingVisualization.tsx:78-88`) | ✅ **Kapalı** |
| P1-3 "%98 uyum" mock'u | `isAiGenerated=false` → "EDITOR / editör seçkisi" etiketi (`AIRecommendationsSection.tsx:179-183`); `matchPercentage` yok | ✅ **Kapalı** |
| P1-4 Rozetlerde ham i18n anahtarı | Anahtarlar 4 dilde mevcut; parity testi kilitliyor | ✅ **Kapalı** |
| P1-5 AppStore listener sızıntısı + logout sızıntısı | Listener `useEffect [uid]` içinde, cleanup var (`AppStore.tsx:237-254`); logout `anisync_profile` + `forumPosts` temizliyor (`:174-177`) | ✅ **Kapalı** |
| P1-6 Review like delta zorlaması yok | Kural hâlâ yalnız `likes/likedBy` anahtarına bakıyor | ⚠️ **Açık (bilinçli, düşük risk)** |
| P1-7 Admin i18n ja/fr 4/45 | `i18nAdmin.ts` artık 4 tam dil bloğu (tr:5, en:78, ja:151, fr:224 ≈ 73 anahtar/dil) | ✅ **Kapalı** |
| P2-4 i18n parity | 4 locale × 1899 satır, `locales.test.ts` zorluyor | ✅ **Kapalı** |
| P2-6 `animeComments` index | `firestore.indexes.json` içinde var; deploy workflow `paths`'inde `firestore.indexes.json` da var | ✅ **Kapalı** |

### 2.3 `PRODUCT_GAP_ANALYSIS` dürüst backlog (20 madde) — bugün

| # | Madde | Bugün | Not |
|---|---|---|---|
| 1 | Auth'lu uçtan uca test yok | ❌ **Açık** | Hâlâ service account/oturum yok |
| 2 | Native arka plan bildirimi yok | ❌ **Açık** | `@capacitor/local-notifications` kurulu değil |
| 3 | Gemini kapalı | ❌ **Açık** | Vercel'de key yok, fail-closed |
| 4 | KVKK otomasyonu yok | ❌ **Açık — ve sanılandan kötü** | Kuyruk var, **icracı yok**; silme gerçekten silmiyor (§4.1) |
| 5 | `FIREBASE_TOKEN` yok | ❌ **Açık** | Kural deploy'u hâlâ elle |
| 6 | Kalan sabit Türkçe | ⚠️ **Kısmen** | Liste eksik: Firestore'a **yazılan** Türkçe veriler (§4.2) |
| 7 | ESLint uyarıları / gevşek kapı | ❌ **Açık** | CI hâlâ `--max-warnings 10000` |
| 8 | Bundle izleme (charts ağır) | ❌ **Açık** | ~416 KB charts chunk |
| 9 | Fan Bilgisi elle büyüyor | ✅ Bilinçli karar | Değişmedi, sorun değil |
| 10 | Metin macera tek bölüm | ✅ Bilinçli karar | Değişmedi |
| 11 | Redirect'li Google girişi cihazda test edilmedi | ❌ **Açık** | Native WebView'da hâlâ riskli (§4.3) |
| 12 | Dokunma hedefleri eşit değil | ⚠️ **Kısmen** | Oyun sayfaları iyi; sistematik tarama yok |
| 13 | Dil başına URL yok (hreflang) | ❌ **Açık** | ⚠️ **Düzeltme (çapraz denetim)**: `index.html:44-49` hreflang **zaten var**, ama çalışmıyor — `i18n.ts` detector'ı yapılandırmasız (varsayılan `lng`, `?lang=` okunmuyor) ve canonical query'yi atıyor. Doğru iş "ekle" değil "düzelt veya kaldır" → `docs/bes-rapor-elestirisi.md` §3.1 |
| 14 | Kalfa kapısı güvenilir değil | ❌ **Açık** | Kural yorumu da kabul ediyor (`rules:246-247`) |
| 15 | Rapor hız sınırı yok | ❌ **Açık** | Kuralda sorgu sayacı yok |
| 16 | E-posta doğrulama + handle tekilliği | ❌ **Açık** | Handle hâlâ e-postadan türetiliyor |
| 17 | Moderatör paneli yok | ⚠️ **Kısmen** | Admin sekmeleri var; atama/durum akışı yok |
| 18 | Performans/a11y borcu (lazy 3/77, charts preload, Modal/focus-trap, Sentry/GA4 yok) | 🕓 **Bayat** | Lazy artık 76/78, a11y 21 rota 1.00, GA4/Sentry var (env-gated). **Modal/focus-trap hâlâ yok** |
| 19 | Bot önizlemesi yalnız 2 rota | ❌ **Açık** | `/anime/*`, `/media/*` (+Steam rewrite); statik sayfalar genel kart |
| 20 | Üretilen `api/*.js` bakım yükü | ⚠️ **Kontrollü** | `verify:api` bayatlığı yakalıyor; Vercel build ayarı erişimi yok |

---

## 3. "Düzeltildi" denilen ama tam kapanmayan maddeler

### 3.1 Kural düzeyinde bütünlük hâlâ yok (P0-3 / P0-7 / P1-6)
Raporlar "anket oyu ve puanlama düzeltildi" diyor; **dürüst istemci** için doğru, **kötü niyetli istemci** için değil:

- **Anket:** `votes/{uid}` + transaction çift oyu engelliyor; ama `polls.votes` haritasının **değerleri** kuralda sınırsız (`rules:125-130` yalnız anahtar kümesini doğruluyor). Değiştirilmiş istemci `votes:{A:999999}` yazabilir. → Gerçek çözüm: sayacı `votes/{uid}` dokümanlarından okumak veya `/api/poll-vote` (Admin SDK).
- **Puanlama:** `animeRatings` özeti her imzalı kullanıcı tarafından `averageRating:5, totalRatings:10^9` ile yazılabilir (`rules:164-172`); per-uid oylarla çapraz doğrulama yok. → Özet okuma anında türetilmeli veya sunucuda hesaplanmalı.
- **Review like:** `likes == likedBy.length` zorlaması yok.

**Ders:** Bir maddeyi "kapalı" saymak için kuralın **kötü niyetli istemciyi** de durdurduğunu göstermek gerekir; istemci transaction'ı yeterli değildir.

### 3.2 Bootstrap admin e-postası hâlâ istemci bundle'ında
`adminConfig.ts:48-55` — `VITE_ADMIN_EMAILS` yoksa `['zamankatilii@gmail.com']` **varsayılanı bundle'a giriyor**. Kural artık `email_verified` istediği için **yetki yükseltme kapalı** (doğru), ama:
- saldırgana hedef adres veriyor (oltalama/phishing yüzeyi),
- tek kişilik SPOF + tek hesap ele geçirilirse tam admin (kural hâlâ bu e-postaya yetki veriyor),
- rapordaki "bootstrap listesini client'tan kaldır" maddesi **uygulanmamış**.

### 3.3 `watchPartyRooms` yorum ↔ kural uyumsuzluğu
`rules:296-297` yorumu "videoId/title/lock host'a kapalıdır" diyor; host dalı (`:299`) **hiçbir `affectedKeys` kısıtı taşımıyor** — host kendi odasında her alanı yazabilir. Sahiplik açısından kabul edilebilir, ama yorum yanlış ve ileride "kilit" mantığı eklendiğinde sürpriz üretir. Ayrıca kilitsiz odada **her imzalı kullanıcı** oynatmayı sürükleyebilir (tasarım gereği, trollenmeye açık).

---

## 4. Her iki raporun kaçırdığı yapısal sorunlar

Bunlar `docs/sistem-analiz.md`'de kanıtlandı; burada yalnız raporlara göre **yeni** olanlar:

### 4.1 KVKK silme gerçekten silmiyor (rapordan daha ağır)
Her iki rapor "manuel kuyruk var" diyor. Eksik olan: **kuyruğu işleyen hiçbir kod yok** ve Firestore **alt koleksiyonları ana dokümanla silmez** — `users/{uid}` silinse bile `watchlist`, `reminders`, `customData` kalır; herkese açık içerik (yorum, gönderi) uid anahtarıyla durur. "30 gün içinde işlenir" taahhüdü araçsız uygulanamaz.

### 4.2 Firestore'a **yazılan** Türkçe veriler
Raporlar "MemeZone/charts sabit Türkçe" diyor (JSX metni). Asıl sorun veri katmanında:
- `AppStore.tsx:533` — `listName: 'İzleniyor'` **Firestore'a** yazılıyor, EN/JA/FR kullanıcı akışta Türkçe görüyor.
- `useWatchPartyStore.ts:134-261` — oda başlığı/açıklaması/`'Anonim'` dokümana yazılıyor.
- `newsService.ts:9,151` — TR-only kategori enum'u + TR başlık şablonu.
`locales.test.ts` JSX-metin dışı string'leri taramıyor; bu sınıf kalıcı olarak görünmez.

### 4.3 Native (Capacitor) yazma yolu fiilen kırık
- **CORS yok:** `POST /api/translate` ve `/api/ai-recommendations` native shell'den cross-origin gidiyor (`apiBase.ts:14-18`), preflight `OPTIONS` yanıtsız → AI özellikleri native'de çalışmaz.
- `signInWithRedirect` fallback'i WebView'da güvenilir değil (raporun #11'i bunu "test edilmedi" diyor; aslında **tasarım gereği** çalışmaz, `@capacitor/google-auth` gerekir).
- Web `Notification` API native'de garantili değil (#2 ile aynı).

### 4.4 Güvenlik başlıkları yok (doğrulandı)
`vercel.json` `headers` bloğu **yalnız** `/assets/*` için `Cache-Control` içeriyor — CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` **hiçbiri yok**. Raporda CSP'den hiç söz edilmiyor.

### 4.5 Storage denetimsiz
`storage.rules` depoda yok; `EditProfileModal.tsx:47-58` **her tür/boyutta** dosya yükleyebiliyor (`accept="image/*"` yalnız dosya seçici ipucu, doğrulama değil). Raporlar avatar yüklemesine hiç değinmiyor.

### 4.6 Sınırsız Firestore listener'ları
Rapor `AppStore` listener **sızıntısını** yakaladı (düzeltildi) ama **limitsiz sorguları** atladı: `forumPosts` (AppStore:137), `watchlist` (:238), `animeComments` (AnimeComments:39-45), `polls` (useDailyPoll:14). 17 abonelikten 4'ü limitsiz — maliyet doğrusal büyür.

### 4.7 Prod'da ölü dev endpoint'leri
`server.ts`'teki `/api/music-preview`, `/api/sync/airing-schedule`, `/api/sync/trending-anime`, path-form `/api/og/:kind/:id` Vercel'de fonksiyon değil → SPA `index.html` döner (200). İstemci sessizce yedeklere düşüyor; her istek boşa çalışıyor.

### 4.8 Kimlik doğrulamasız tetikler
`refresh-news` `CRON_SECRET` yoksa **anonim** çalışır (`.env.example:37` yorum satırı); `anime-news?refresh=true` herkesçe cache bypass. Raporlarda yok.

### 4.9 AppStore god-context
45 alanlık tek provider + **memo'suz** `value` (`AppStore.tsx:802`) — raporun P1-5'i "slice ayrımı" diyordu ama performans etkisi ölçülmemiş ve iş yapılmamış.

### 4.10 Çift API istemcisi
`useAnimeData.ts` kendi Jikan cache'i + `global apiQueue`; `lib/api/*` ayrı TTL cache + rate limiter. Raporlar "AniList birincil → Jikan yedek" diyor ama **iki paralel istemci** olduğunu kaçırıyor; toplam istek hızı tek yerden ölçülemiyor.

### 4.11 `users/{uid}` herkese açık
`rules:92` `read: if true` — e-posta türevi handle, rol, ban bilgisi her istemciden okunabilir. Rapor #16 "handle dünya-okunur" diye **değiniyor** ama rol/ban alanlarının da açık olduğunu ve AdminPage listesinin bunun üzerine kurulu olduğunu yazmıyor.

### 4.12 Route-level ErrorBoundary yok + test boşluğu
Root boundary tek (`main.tsx:21`); lazy chunk hatası tüm uygulamayı düşürür. 23 testin tamamı lib/data/i18n — **21 sayfa, 70+ bileşen, AppStore: sıfır test**. Raporlar "UI testi sıfır" diyor (doğru) ama route boundary'yi atlıyor.

---

## 5. Bayatlamış iddialar (rapor sayıları bugün yanlış)

| Rapordaki iddia | Bugün |
|---|---|
| "67 test / 10 dosya" | **204 test / 23 dosya** |
| "`loading=\"lazy\"` yalnız 3/77 görsel" | **76/78** (istisnalar: DLE posteri + ana sayfa LCP kapağı) |
| "GA4/Sentry yok" | İkisi de var, **env-gated** ve consent-gated |
| "SW `anisync-shell-v2`" | **v3** + `anisync-images-v1` görsel cache |
| "Backend yok" | 8 Vercel serverless fonksiyonu + ön-paketleme hattı |
| "`i18nAdmin` ja/fr 4/45" | 4 tam dil bloğu |
| "deploy-rules yalnız rules'a bakar" | `paths`'te `firestore.indexes.json` + `firebase.json` da var |
| "ESLint ~464 uyarı" | ~485 (artmış) — hâlâ 0 hata |
| "charts 424 KB" | ~416 KB (değişmedi) |

**Süreç dersi:** anlık görüntü belgeleri çürür. Tek yaşayan belge (`docs/status.md`) + her iddiaya otomatik kapı (§6) gerekir.

---

## 6. En önemli süreç boşluğu: Firestore kurallarının **sıfır** otomatik testi

Doğruladım: depoda `*.rules.test.ts` **yok**, `@firebase/rules-unit-testing` bağımlılığı **yok** (yalnız `@firebase/eslint-plugin-security-rules` — bu bir linter, davranış testi değil).

Sonuç: 10–14 Kasım arasında yapılan **tüm kural düzeltmeleri** (approved oda istisnası, ban, rapor doğrulaması, oda oylaması, `sharedLives` candle, animeRatings…) yalnız **elle** doğrulandı. Bir sonraki kural değişikliği bunlardan birini sessizce bozabilir — nitekim §3.1'deki değer doğrulama boşlukları bu yüzden görünmez kaldı.

**Öneri (S–M):** Firebase Emulator + `@firebase/rules-unit-testing` ile en az 12 kritik senaryo: onaylı oda, banlı yazma reddi, anket çift oy, `recentActivities` sahte uid, rapor alan sınırları, oda oylaması append-only, avatar olmayan yazma, admin rol yükseltme reddi. CI'ya `firebase emulators:exec` adımı.

---

## 7. Üç belgenin birleşik doğru tablosu

### Kapalı (tekrar açılmasın)
GlobalChat çökmesi · onaylı oda yolu · watch party yazma kısıtı · email_verified · AdminRoute rolü · video player senkronu · %98 mock · tür trendi · rozet i18n · AppStore listener sızıntısı + logout · admin i18n · i18n parity · animeComments index · SEO tek kaynak · bot OG · sunucu fonksiyonu ön-paketleme · lazy görseller · 21 rota a11y 1.00.

### Açık — güvenlik/uyum (öncelik 1)
1. KVKK silme no-op (Admin SDK şart)
2. Güvenlik başlıkları yok
3. `users/{uid}` read `if true` (rol/ban/handle)
4. Storage kuralları yok + avatar doğrulaması yok
5. `refresh-news` secret'sız + `?refresh=true` açık
6. Kural düzeyi bütünlük: poll votes değerleri, rating özeti, forum `comments` tam-doc overwrite
7. Bootstrap adres istemci bundle'ında
8. CORS yok → native AI akışı kırık

### Açık — performans/mimari (öncelik 2)
9. AppStore god-context + memo'suz value
10. 4 limitsiz Firestore listener
11. Çift Jikan istemcisi + abort korumasız fetch'ler
12. Route-level ErrorBoundary yok
13. Prod'da ölü dev endpoint'leri
14. Charts chunk ~416 KB, ESLint kapısı `--max-warnings 10000`
15. `useReminderStore` selector'sız tüketim, çift `<h1>`, Modal/focus-trap yok

### Açık — ürün/içerik (öncelik 3)
16. Firestore'a yazılan Türkçe veriler (listName, oda metinleri, haber kategorileri)
17. hreflang + dil URL'leri yok
18. Native bildirim + native Google auth
19. Moderatör paneli/şikayet akışı
20. `/api/health` + uptime monitörü
21. Sayfa/bileşen test altyapısı (0)

---

## 8. Öncelikli birleşik plan (raporlardan devralınan + yeni)

| # | İş | Kaynak | Boy |
|---|---|---|---|
| 1 | **Firestore rules test suite** (emulator, 12 senaryo, CI) | §6 (yeni) | M |
| 2 | Güvenlik başlıkları (`vercel.json` headers) | §4.4 (yeni) | S |
| 3 | `refresh-news` secret zorunlu + `?refresh=true` auth | §4.8 (yeni) | S |
| 4 | Storage rules + avatar MIME/boyut | §4.5 (yeni) | S |
| 5 | `users/{uid}` read daraltma (public profil ayrı doküman) | §4.11 + rapor #16 | S–M |
| 6 | Anket sayacını `votes/{uid}`'den türet; rating özetini sunucuda hesapla | §3.1 | M–L (Admin SDK) |
| 7 | Forum yorumlarını alt koleksiyona taşı (tam-doc overwrite kapanır) | §3.1 + tam analiz | M |
| 8 | Limitsiz 4 listener'a limit + sayfalama | §4.6 + home-analiz #1 | S |
| 9 | AppStore 3'e bölme + memo | §4.9 | L |
| 10 | Firestore'a yazılan Türkçe verileri enum + render-time çeviriye çevir | §4.2 | M |
| 11 | Route ErrorBoundary + `PageLoadingSkeleton` standardı | §4.12 | S |
| 12 | Native: CORS allowlist + `@capacitor/google-auth` + local notifications | §4.3 + rapor #2/#11 | M |
| 13 | hreflang/x-default + `SearchAction` JSON-LD | rapor #13 + kantan §4 | S |
| 14 | KVKK otomatik silme fonksiyonu | rapor #4 + §4.1 | L (service account) |
| 15 | Bootstrap adresini client'tan kaldır (env-only) | §3.2 | S |

---

## 9. Dürüst sınırlar

- Doğrulamalar statik kod + kural okumasıyla yapıldı; **imzalı canlı oturumda** oda onayı, watch party senkronu, admin paneli hâlâ test edilmedi.
- Storage kurallarının **Console'daki gerçek durumu** bilinmiyor (depoda dosya yok).
- Vercel env gerçekleri (CRON_SECRET/GEMINI_API_KEY set mi) repodan doğrulanamaz.
- "Kötü niyetli istemci" senaryoları kural metninden çıkarıldı; canlıda denenmedi (denemek için de kural test suite gerekir — §6).
- Bu belge `31fc2f4` anlık görüntüsüdür; iki eski rapor gibi çürümemesi için §8'deki kapılar otomatikleştirilmelidir.
