# AniSync — Sistem Denetimi (2026‑11‑10)

> **Hedef okuyucu:** DeepSeek (ve sonraki geliştiriciler). Bu belge, 10 Kasım 2026 itibarıyla AniSync kod tabanının **dürüst, doğrulanmış** durumunu ve yapılmamış kalan işleri anlatır. Yeni bir şey uydurulmamıştır; her bulgunun dosya ve satır referansı vardır veya "ajan raporu — doğrulanamadı" olarak işaretlenmiştir.
>
> **Hazırlayan:** Inkling 2 Small (OpenCode aracısı), 4 bağımsız keşif ajanının çıktıları + doğrudan dosya doğrulaması ile.
> **Kapsam:** `C:\Users\semih\Documents\Qoder\anisync\app` — `main` dalının HEAD'i `983b998`.
> **Çalışma dizini bir Vite + React 19 + TypeScript (strict) + Tailwind SPA'sıdır; Capacitor ile native paketlenir. Backend yok — Firestore (adlandırılmış DB) + Vercel serverless `/api/*` fonksiyonları + Vercel Edge rewrites.**

---

## Uzman İncelemesi — 11 Kasım 2026 (en güncel bölüm)

> Bu bölüm, 10 Kasım raporunun üzerinden geçen **ikinci uzman turudur**. Aşağıdaki tablo, raporun iddialarını koda karşı tek tek doğrular; "düzeltildi" satırları bu depodaki mevcut kodla teyit edilmiştir.

### Raporun değerlendirmesi

**Doğru ve değerli olanlar:**
- P0‑1…P0‑7'nin tamamı gerçekti; özellikle `email_verified` eksikliği, `watchPartyRooms` herkese açık update ve `isValidRoom` ↔ `approveRoomRequest` uyumsuzluğu doğru teşhislerdi.
- P1‑1 (VideoPlayerDeck'in her saniye yeniden yüklenmesi) ve P1‑3 (%98 uyum mock'u) kanıtlı ve kritikti.
- Dürüstlük ilkeleri (Bölüm 11) ürünün gerçek felsefesiyle uyumlu; korunmalı.

**Eksik veya yanıltıcı olanlar (bu turda düzeltildi):**
1. Rapor, P1‑3 için "mock'u gizle" diyordu; yeterli değil. **LLM'in ürettiği başlıkları doğrulamadan göstermek** de bir uydurma yoludur. Artık sunucu yalnızca başlık + gerekçe ister, her başlığı AniList aramasıyla doğrular ve MAL/AniList kimliği, kapak, puan, bölüm bilgisini **doğrulanmış katalogdan** döner (`src/lib/geminiEndpoints.ts`).
2. Rapor "P1‑2 kaldırılsın" diyordu; bileşen kaldırılmadı ama **kullanıcının kendi izleme listesinden hesaplanan** gerçek tür dağılımına çevrildi (`GenreTrendingVisualization.tsx`); uydurma trend sayısı yok.
3. Raporda **ölü bağlantılar** yoktu: AniList kayıtlarında `idMal` boş olabildiği için `/anime/0` üretiliyordu. `src/lib/mediaLinks.ts` eklendi; MAL yoksa `/media/anilist:<id>`, o da yoksa bağlantı gizlenir.
4. Raporda **misafir listesi** yoktu: `/list` `PrivateRoute` arkasındaydı ama `AppStore` misafir listesini zaten localStorage'da tutuyordu → kullanıcı liste yapıyor, sayfayı açamıyordu. `/list` public yapıldı + açık "misafir modu" bandı eklendi.
5. Raporda **mobil taşma** yoktu: 320–375 px'te header taşıyordu; tema düğmesi <430 px'te gizlendi, giriş düğmesi <360 px'te ikonlaştı, dokunma hedefleri korundu.
6. Raporda **SEO/PWA çelişkisi** yoktu: `robots.txt`/`sitemap.xml`/`apiBase` eski `anisync.app` alan adını, `manifest` ise var olmayan `.webp` ikonları gösteriyordu; statik canonical/OG etiketleri `SEOManager` ile çakışıyordu. Hepsi tek host (`anisync-tau.vercel.app`) ve gerçek PNG ikonlara çekildi.
7. Raporda **yasal sayfalar** yoktu (KVKK/GDPR için yayın öncesi şart): `/privacy`, `/terms`, `/guidelines` eklendi; footer'da veri kaynağı atfı var; kayıt formunda 13+ ve koşul onayı zorunlu.
8. Raporda **sessiz hata yutma** yoktu: yorum yükleme hatası "yorum yok" gibi görünüyordu; artık hata + "tekrar dene" var. Sahte "şikayet edildi" toast'ı gerçek `ReportButton` ile değiştirildi (yorum, gönderi, profil).
9. Raporda **sahte "Takip Et — yakında"** ve Watch Party'de uydurma MAL kimliği/kapak yoktu; ikisi de gerçek davranışa çevrildi.
10. Raporda Watch Party'ye detay sayfasından gelirken **bağlam kaybı** yoktu; `?anime&title&img` derin bağlantısı oluşturma modalını ön dolduruyor.

### Düzeltme durumu (kodla doğrulandı)

| # | Sorun | Durum | Kanıt |
|---|---|---|---|
| P0‑1 | Misafir sohbeti beyaz sayfa | ✅ Düzeltildi | `GlobalChat` ErrorBoundary içinde; tarih normalizasyonu guard'lı |
| P0‑2 | Onaylı oda asla açılmıyor | ✅ Düzeltildi | `isValidRoom`: `source == 'approved' && isAdmin()` |
| P0‑3 | `animeRatings` kapalı | ✅ Düzeltildi | `firestore.rules:132-140` + tek oy/özet yolu |
| P0‑4 | AdminRoute rol okumuyor | ✅ Düzeltildi | `AdminRoute.tsx` `users/{uid}.role` okuyor |
| P0‑5 | Bootstrap admin + `email_verified` yok | ✅ Düzeltildi | `firestore.rules:9` doğrulama şartı |
| P0‑6 | Watch Party odası herkese açık | ✅ Düzeltildi | host/admin veya kilit açıkken yalnız oynatma alanları |
| P0‑7 | Anket oyu forge edilebilir | ✅ Düzeltildi | `DailyPollModal` `runTransaction` + `votes/{uid}` varlık kontrolü |
| P1‑1 | VideoPlayerDeck her saniye reload | ✅ Düzeltildi | `embedSrc` `useMemo`, `postMessage` API, gerçek süre |
| P1‑2 | Uydurma tür trendi | ✅ Düzeltildi | İzleme listesinden hesaplanan gerçek dağılım |
| P1‑3 | "%98 uyum" mock'u | ✅ Düzeltildi | Sunucu tarafı AniList doğrulaması; `matchPercentage` kaldırıldı |
| P1‑4 | Rozetlerde ham i18n anahtarı | ✅ Düzeltildi | 4 dilde anahtarlar + parity testi |
| P1‑5 | Logout'ta profil sızıntısı | ✅ Düzeltildi | `anisync_profile`/`anisync_watchlist` temizliği |
| P1‑6 | Review like sayacı | ⚠️ Kısmi | Delta zorlaması yok; kural bilinçli gevşek (düşük risk) |
| P1‑7 | Admin i18n ja/fr eksik | ⚠️ Kısmi | Ana panel anahtarları var; admin özel anahtarları hâlâ seyrek |
| P2‑4 | i18n parity | ✅ Düzeltildi | `locales.test.ts` 4 dilde anahtar eşitliğini zorluyor |
| P2‑6 | `animeComments` index'i | ✅ Düzeltildi | `firestore.indexes.json` + kurallar deploy edildi |

### Güncel kapılar (11 Kas 2026)

| Kapı | Sonuç |
|---|---|
| `npx.cmd tsc --noEmit` | ✅ exit 0 |
| `npm.cmd run lint:eslint` | ✅ 0 error |
| `npm.cmd test -- --run` | ✅ **10 dosya / 67 test** |
| `npm.cmd run build` | ✅ exit 0 |
| Test dosyaları | `adminConfig`, `anonQuota`, `eventEngine`, `importList`, `level`, `rssIngest`, `utils`, `verifyIdToken`, `voiceDuelData`, `locales` |

### Kalan dürüst backlog (öncelik sırasıyla)

1. **Native hatırlatıcı boşluğu:** `@capacitor/local-notifications` yok; Capacitor WebView'de Web Notification çoğu cihazda çalışmaz. Native'de hatırlatıcı düğmesi sessizce başarısız olmamalı — ya eklenti entegre edilmeli ya da "native'de bildirim desteklenmiyor" uyarısı gösterilmeli.
2. **Kalan hard-coded Türkçe:** `MemeZone`, `MonthlyActivityChart`, `ProfileAnalyticsDashboard`, `RecentActivityFeed` yedek liste adları ve bazı `FeedPost` kalıntıları. Tam i18n taraması bitmedi.
3. **Auth'lu uçtan uca test:** Oda onayı (50 oy → moderatör), Kalfa doğrudan oda açma, Watch Party senkronu ve admin paneli yalnız kod/kural ile doğrulandı; imzalı tarayıcıda smoke şart.
4. **AI fail-closed kararı:** Gemini anahtarı Vercel'de yok (402 kredi). Alternatif sağlayıcı (Groq/OpenRouter) veya AI Studio ücretsiz projesi kararı verilmedi; şu an öneri bölümü açıkça "editör seçkisi" gösteriyor.
5. **KVKK otomasyonu:** Silme/dışa aktarma hâlâ e-posta + manuel; `dataRequests` kuyruğu var ama otomatik işleyici yok.
6. **`FIREBASE_TOKEN`:** GitHub `deploy-rules.yml` için secret yok; kural/index deploy'u manuel.
7. **ESLint uyarıları:** Hata 0, uyarı sayısı yüksek; `--max-warnings` kapısı hâlâ gevşek.
8. **Bundle:** `recharts`/`charts` ağır; Life Sim ayrı chunk (~300 KB) kabul edilebilir ama izlenmeli.

---

## 0. Yönetici Özeti

**AniSync nedir?** Anime/manga/hafif roman/oyun takip platformu. Ana felsefe: *"İzleyecek yeni bir anime bulmayı kolaylaştırmak."* İkinci hedef: *aynı ilgi alanlarına sahip insanları kolay sosyalleştirmek* (KÖŞE café, global chat, Watch Party, forum, anketler).

**Bugünkü durum (11 Kas 2026):** Ürün uçtan uca **çalışıyor ve canlıda** (https://anisync-tau.vercel.app). 67/67 test yeşil (10 dosya), `tsc --noEmit` temiz, ESLint 0 **hata**, production build başarılı, GitHub CI (`build-test`) ve Vercel dağıtımı `success`. ~354 izlenen dosya, ~51.000 satır uygulama kodu.

**Ama:** "Çalışıyor" ≠ "Güvenli/dürüst". Bu denetim dört sınıf sorun buldu:

1. **Çökme seviyesinde (P0):** Anonim sohbet mesajı, tüm uygulamayı ErrorBoundary'nin dışına düşürerek beyaz sayfa yapar. Admin paneli, client-side role'ü Firestore'dan okumadığı için yalnız bootstrap e-postasıyla açılır.
2. **Güvenlik kuralları (P0):** Firestore kuralları ile client kodu uyuşmuyor — **moderatör onaylı odalar asla açılamaz**, yıldız puanları (`animeRatings`) üretimde tam kapalı, anket oyları sahte olabilir, `watchPartyRooms` her imzalı kullanıcıya açık, bootstrap admin e-postası client bundle'ında ve `email_verified` kontrolü yok.
3. **Dürüstlük ihlalleri (P1):** Fallback önerilerde **"%98 uyum"** sahte yüzde; `GenreTrendingVisualization` uydurma trend sayılarını "içgörü" diye sunar; `VideoPlayerDeck` sahte 240 saniyelik zaman çizelgesi ve her saniye iframe'i yeniden yükleyen player; Admin Route/panel.
4. **Hijyen (P2):** i18n anahtar boşlukları (ja dili `recent_activity` 2 anahtarını eksik; `i18nAdmin.ts` ja/fr yalnız 4/45 anahtar), ESLint ~464 uyarı, `charts` paketi 424 KB, CI `--max-warnings 10000`, README/TODO'da bayat iddialar ("50 test" → gerçek 55).

**Stratejik tavsiye:** P0'ları (kurallar + AdminRoute + GlobalChat) tek bir oturumda halledin, sonra P1 dürüstlük temizliği. Yeni özellik eklemeden önce bu belgedeki sırasıyla ilerleyin.

---

## 1. Doğrulanan Durum (10 Kas 2026 anlık görüntüsü; 11 Kas değerleri güncellendi)

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 |
| ESLint (hata seviyesi) | ✅ 0 error (~464 warning, çoğu `no-unused-vars` + a11y) |
| `vitest run` | ✅ 10 dosya / **67 test** passed |
| `vite build` + `esbuild server.ts` | ✅ exit 0 |
| GitHub Actions `build-test` (Node 20) | ✅ success |
| Vercel production deploy | ✅ success |
| Canlı smoke test (`/voice-duel`, port 3000 & prod) | ✅ Sayfa + oyun akışı çalışıyor |

**Ortam uyarısı:** Bu makinede PowerShell execution policy `npm.ps1`'i engelliyor — daima **`npm.cmd`** kullanın. `npm` doğrudan çağrılırsa `SecurityError` atar.

**İzleyerek doğrulanamayanlar:** Oturum boyunca kullanılan test tarayıcısı **imzasızdı** — kimlikle korunan akışlar (oda oyu, moderatör onayı, watch-party, admin paneli) yalnız kod + kurallar okuyarak doğrulandı, **canlı imzalı oturumla uçtan uca doğrulanmadı**. DeepSeek bunu ilk iş listesine almalı.

---

## 2. Mimari — Veri Akışı (tek sayfa özet)

**Doğru veri kaynağı nerede?**

| Veri | Kaynak | Önbellek | Dürüstlük politikası |
|---|---|---|---|
| Anime arama / detay / trend / sezon | **AniList GraphQL** (birincil) | bellek-içi LRU + `createRateLimiter` (~85 istek/dk) | Yedek: Jikan (SFW) → etiketli yedek katalog |
| Haftalık yayın takvimi | `src/lib/airingService.ts` — AniList gün penceresi, TR günü, sayfalı | gün damgalı localStorage | Kaynak hatasında **`AIRING_SCHEDULE`** arşivi + STALE etiketi; asla uydurma |
| Haberler | `/api/anime-news` (Vercel fn) | yok | RSS boş → dürüst "haber yok" |
| Manga / karakterler / Steam | AniList + OpenLibrary + `/api/games/*` proxy | bellek | SFW filtreli; yedek kataloglar etiketli |
| ANISYNCDLE günün karakteri | `src/data/anisyncDleData.ts` (TR gün anahtarı) | — | Antreman modu istatistikten izole |
| Müzik Quizi | `src/data/musicQuizData.ts` + iTunes önizleme | — | Resmi önizleme URL'leri |
| **KİM BU KARAKTER?** (Voice Duel) | `src/data/voiceDuelData.ts` — 10 resmi Madoka Exedra character PV (Aniplex kanalı), YouTube embed | localStorage (best score) | Kanal atfı her klibe gösterilir |
| Listeler / oturum | Firestore `users/{uid}/watchlist/*` (onSnapshot) + localStorage aynası | localStorage | Offline'da yerel kopya; Firestore gerçek kaynak |
| Sohbet / KÖŞE / odalar | Firestore `globalChat`, `chatRooms`, `roomRequests`, `chatEventRsvps` | — | Odalar: 7 resmi + Kalfa/50-oy governance |
| Forum / akış / yorumlar | Firestore `forumPosts`, `socialFeed`, `animeComments`, `animeReviews` | — | Auth + rules zorunlu |
| Kullanıcı profili | `users/{uid}` (Firestore) + `anisync_profile` (localStorage) | localStorage | **Logout'ta temizlenmiyor — bkz. P1** |
| AI önerileri / moderasyon | `/api/ai-recommendations`, `/api/moderate-room` (Gemini) | — | **Gemini key 402 → fail-closed**; kullanıcı "%98 uyum" mock'u görüyor (bkz. P1-3) |

**Kural:** Canlı veri yoksa ürün **asla uydurmaz** — boş durum ya da açık etiketli yedek gösterilir. Bu kural `README.md`'de yazılıdır ve KÖŞE/takvim/DLE tarafında tutulmaktadır; **istisnalar Bölüm 5'te (P1) listelenmiştir.**

---

## 3. P0 — Çökme ve Güvenlik

### P0‑1. Misafir sohbet mesajı tüm uygulamayı çökertir *(çökme)*
`src/components/GlobalChat.tsx:142-151` anonim mesajları yerel olarak `{ createdAt: { seconds, nanoseconds } }` (düz nesne) şeklinde kurgular; render'da `msg.createdAt.toDate()` çağrılır (**GlobalChat.tsx:526**) → `toDate is not a function` → TypeError.

GlobalChat `src/components/Layout.tsx:16`'da import edilir ve **iç `<AnimeErrorBoundary>`'nin dışında** (boundary yalnız `<Outlet/>`'i sarıyor) mount edilir → hata root `main.tsx` boundary'sine fırlar → beyaz sayfa + hata kartı. `loadAnonMessages` kalıcılığı sayesinde **her render'da yeniden çöker** — misafir kullanıcı uygulamayı hiç açamaz.

**Fix:** (a) `toSeconds()` normalize'ını `formatRelativeTime` çağrısından önce uygula (createdAt düz nesne ise `new Date(seconds*1000)`), veya (b) anonim yerel mesajları Firestore `Timestamp`-uyumlu şekil yerine kendi tipinde tut ve `createdAt.toDate?.()` guard'ı kullan; (c) GlobalChat'i `<AnimeErrorBoundary>` içine al. Regresyon testi ekle (misafir mesajı render edilmeli).

### P0‑2. Moderatör onaylı topluluk odası ASLA açılamaz *(kurallar ↔ istemci uyumsuzluğu)*
`src/lib/rooms.ts:197-208` `approveRoomRequest()` moderatör tarafından çağrılır ve `chatRooms` dokümanı `createdBy.uid = request.requestedBy.uid` (isteği yapan kullanıcı) olarak yazar. Ama `firestore.rules:176-185` `isValidRoom()` **`data.createdBy.uid == request.auth.uid`** şartını koşar → istek atan kullanıcı değil, moderatör yazıyor → `permission-denied`. `chatRooms` create kuralı (`rules:198`) aynı şartı taşır.

Sonuç: 50 oy toplayan bir oda isteği onay düğmesine basıldığında **hem `chatRooms` set'i hem aynı batch'teki `roomRequests` update'i reddedilir** (atomik batch) → istek "pending" kalır, oda doğmaz, kullanıcı hata görmez.

**Fix:** `isValidRoom`'a `source == 'approved'` için istisna ekleyin (örn. `source == 'direct' ⇒ createdBy.uid == request.auth.uid`; `source == 'approved' ⇒ isAdmin()` ve alan beyaz listesi geçerli) veya moderatör onayını Admin SDK'lı `/api/*` fonksiyonuna taşıyın (client batch'i terk edin). Kuralları `firebase deploy --only firestore:rules` ile yayınlayın — bkz. Deploy Checklist.

### P0‑3. `firestore.rules`'ta `animeRatings` YOK *(özellik üretimde ölü)*
Yıldız puanı/ortalama yorumlama kodu `animeRatings` koleksiyonunu kullanır (istemci yazar, `firestore.indexes.json`'da da karşılığı yok) ama kurallarda bu koleksiyon **bulunmaz** → catch-all (`rules:272-274`, `allow read, write: if false`) devreye girer → **okuma ve yazma tamamen kapalıdır**. Ek olarak ortalama hesaplama oy başına O(n) yeniden hesaplama + yarış koşulu taşır.

**Fix:** Kural ekleyin (create/update: imzalı, `userId == auth.uid`, `value` 1..10 int, tek doc başına kullanıcı başına bir oy; read: true) + **transaction tabanlı** ortalama güncelleme (`runTransaction` ile toplam/adet tutan bir `animeRatingAggregates/{animeId}` dokümanı) veya batched recompute. `firestore.indexes.json`'a gerekli indeksleri ekleyin.

### P0‑4. Admin route yetki kontrolü client tipinde var olmayan alana güveniyor
`src/components/AdminRoute.tsx:18` `const role = (userProfile as any)?.role` okur — **`UserProfile` tipinde (`src/types.ts`) `role` alanı yoktur** (grep ile 0 sonuç). Runtime'da `userProfile.role` undefined döner → yalnız `isBootstrapAdminEmail()` (`src/lib/adminConfig.ts`, örn. `zamankatilii@gmail.com`) eşleşirse geçer. **Firestore'daki gerçek admin/moderatörler (`users/{uid}.role`) siteye girer ama `/admin` paneline giremez**; üstelik `adminConfig.ts` bootstrap liste'sini **client bundle'a gömer**.

**Fix:** `Auth` sonrası `users/{uid}` dokümanını okuyup role'ü state'e koy (admin sayfasında zaten `AdminPage.tsx` benzerini yapıyor), `UserProfile`'a `role?: 'admin'|'moderator'` ekle, bootstrap listesini yalnız kurallarda tut (client'tan kaldır).

### P0‑5. Bootstrap admin + `email_verified` yokluğu *(ayrıcalık yükseltme)*
`firestore.rules:6-10` `isBootstrapAdminEmail()` `request.auth.token.email` üzerine bakar ama **`email_verified` kontrol etmez**. Uygulama e-posta/parola ile kayıt açıyor — saldırgan `zamankatilii@gmail.com` ile kayıt olup (domain/e-posta doğrulaması yok) `isBootstrapAdminEmail()`'i tetikleyebilir → tam admin (config, banlar, şikayetler, `adminActions`).

Ek olarak: aynı bootstrap adresi client bundle'ında (`adminConfig.ts`) görünür → hedef gösterilmiş olur; tek-nokta-arıza.

**Fix:** Kurala `&& request.auth.token.email_verified == true` ekleyin; bootstrap listesini daraltın/silin ve rolü `users/{uid}.role`'a taşıyın; client `adminConfig.ts`'i build-time'a (`.env` `VITE_ADMIN_EMAILS`) bağlayıp prod default'unu kaldırın.

### P0‑6. `watchPartyRooms` herkese açık yazma
`firestore.rules:223-228`: `allow update: if isSignedIn()` — oda sahipliği/lock/host kontrolü yok → herhangi bir imzalı kullanıcı başkasının watch-party odasının `currentTime`, `isPlaying`, `youtubeId`, `title` alanlarını ezebilir; odayı sabote edebilir.

**Fix:** `allow update: if isSignedIn() && (resource.data.hostId == request.auth.uid || isAdmin() || hostile-alan-beyaz-listesi)` — örn. herkes yalnız `currentTime/isPlaying`'i delta sınırları içinde ve lock açıkken değiştirebilir; `youtubeId/title/lock` yalnız host/admin.

### P0‑7. Anket oyları forge edilebilir
`firestore.rules:89-99`: `polls/{id}` update `affectedKeys().hasOnly(['votes'])` yeterli; `votes/{uid}` alt koleksiyonunda "tek oy" inancı istemciye bırakılır → istemci aynı oyu N kez yazabilir, `votes` haritasını keyfi değerlerle doldurabilir (delta zorlaması yok). `likes` sayaçlarında da aynı desen (kasıtlı, düşük risk — ama anketlerde sonuç güvenilirliği bozulur).

**Fix:** Transaksiyon tabanlı oy (`votes/{uid}` var mı kontrolü + `votes` delta +1) — istemcide `runTransaction`, kurallarda `affectedKeys().hasOnly(['votes'])` + delta == 1 zorlaması (mümkün değil; kurallar map değer farkını hesaplayabilir: `request.resource.data.votes[voteKey] == resource.data.votes[voteKey] + 1 || ...`). En güvenli: `/api/poll-vote` serverless + Admin SDK (sayaç atomik).

---

## 4. P1 — Doğruluk & Dürüstlük

### P1‑1. VideoPlayerDeck: her saniye iframe yeniden yüklenir *(Watch Party kullanılamaz)*
`src/components/WatchParty/VideoPlayerDeck.tsx:118` — `youtubeEmbedUrl` her render'da `Math.floor(localTime)` içerir; `localTime` saniyede bir tick'lenir → **iframe `src` her saniye değişir → YouTube oynatıcısı her saniye başa sarar/reload olur**. Senkron imkansız. Ayrıca:
- Ses/kısma düğmeleri (`:268-283`) yalnız yerel `volume` state'ini değiştirir — iframe'e **hiçbir mesaj gitmez** (`postMessage`/YAPI yok) → **ses kontrolü ölü düğme**.
- Zaman çizelgesi `max="240"` (`:200`) → 4 dakikanın üstündeki videolar bozuk; sahte zaman.
- Hacim/mute UI, `enablejsapi=1` yüklü ama API komutları gönderilmiyor.

**Fix:** iframe `src`'i yalnız `room.youtubeId`/`start` değişiminde kur (`useMemo`), zamanı `postMessage` ile YouTube IFrame API'ye sür; `localTime`'ı tick yerine API `getCurrentTime` polling/`infoDelivery` ile besle; volume/mute gerçek komutlar; timeline `max` = video süresi (player `ready` + `getDuration`).

### P1‑2. `GenreTrendingVisualization` uydurma "trend" sayıları
Bileşen, tür popülerliği için sabit/sahte taban sayılarını "içgörü kartı" olarak sunar (kaynak: ajan raporu; doğrudan render hattı `GenreTrendingVisualization.tsx`). Bu **üretilmiş metrik** — AniList verisinden gelmez ve raporlanamaz kesinlikle. README'deki "veri ve dürüstlük kuralı" ile doğrudan çelişir.

**Fix:** Ya gerçek AniList `TRENDING` dizisinden hesaplanan son 7 günlük delta, ya da kartın tamamen kaldırılması. Görüntülenen her sayı canlı veriden türetiliyorsa **şu an değil** — kaldırın.

### P1‑3. AIRecommendationsSection hâlâ "%98 uyum" mock'u gösteriyor
`src/components/AIRecommendationsSection.tsx:13` `AI_FALLBACK_REASONS`, `:31` `FALLBACK_RECOMMENDATIONS`, `:39` `matchPercentage: 98` — Gemini kapalıyken (Vercel'de `GEMINI_API_KEY` yok; `.env`'deki key 402 `RESOURCE_EXHAUSTED`) API `fallback: true` döner ve kullanıcı **gerçek yapay zekâ önerisi sanılan uydurma %98 uyum** görür. `isAiGenerated` bayrağı yalnız etiketi gizler; **sebep metnini değil.**

**Fix:** Seçenek (a) dürüst "AI şu an kapalı — kendi listenize göre öneriler" kartı + mock gizleme (~20 dk); (b) ücretsiz sağlayıcı (Groq/OpenRouter Llama) ile gerçek endpoint (`.env` → Vercel env); (c) AI Studio ücretsiz proje (kart gerektirmez) + aynı kod. **Bayat TODO'daki "AI kapalı kartı" maddesi budur.**

### P1‑4. OtakuRankBadges — ham `t('...')` anahtarları Profile rozet duvarına basıyor
`src/components/OtakuRankBadges.tsx` 13 ham i18n anahtarı arayüz metni olarak render eder (ajan raporu; rozet vitrini dili Türkçe olmayan kullanıcılarda bozuk metin kalabilir). i18n anahtarı yoksa react-i18next **anahtar dizesini aynen basar** — kullanıcı görür.

**Fix:** Her `t()` çağrısına `defaultValue` verin veya anahtarları 4 dil dosyasına ekleyin; eksik anahtarları CI'da i18n-parity testiyle yakalayın (bkz. P2‑4).

### P1‑5. AppStore: watchlist listener sızıntısı + logout veri sızıntısı + yarışlar
`src/context/AppStore.tsx:135-191`:
- `onSnapshot(wq, …)` auth callback'i **içinde** kurulur; `return () => unsubWatchlist()` (`:185`) callback'ten döner ama dış `useEffect` cleanup'ına ulaşamaz → **her auth değişiminde (token yenileme dahil) yeni listener eklenir**, eskileri sızmaya devam eder.
- Logout yalnız `setWatchlist([])` yapar (`:187, 249`); **`userProfile` (ad, avatar, e-posta) state ve `anisync_profile` localStorage'da kalır** → paylaşılan cihazda bir sonraki kullanıcı öncekini görür. Forum post state'i de temizlenmez.
- `setDoc(... users/{uid}/customData/namedLists ...)` her keystroke'ta full-doc overwrite (`:259-267`) → çoklu cihaz yarışında veri kaybı; `useWatchlistSync`/AppStore slice ayrımı TODO'da bekliyor.
- Async unhandled: `addForumPost`, `toggleLike`, `applySnapshot` hata yolları `.catch`'siz (`:529, 558, 174`); Firestore reddinde sessiz yutulur.
- Forum listener `useEffect` bağımlılığı `[auth.currentUser]` (`:133`) — `auth.currentUser` reaktif değildir; yanlış memo bağımlılığı.

**Fix:** Watchlist listener'ını auth effect'inden ayırıp `useEffect(() => { if (!uid) return; const unsub = onSnapshot(...); return unsub; }, [uid])` yapın; logout'ta `userProfile`'ı default sentinel'a çek + `localStorage.removeItem('anisync_profile')`; namedLists write'ına `try/catch` + debounce; tüm Firestore write'larını promise-handle edin.

### P1‑6. `animeReviews` ortalama/like — doğrulama ve yarış
`firestore.rules:138-143`: `write` yazar için serbest, ama `likes` sayacı `affectedKeys().hasOnly(['likes','likedBy'])` ile sınırlı — sayı delta zorlaması yok (sahte +9999 like yazılabilir; kasıtlı-risk kabul ama not edilmeli). Yorum/like senkronu AppStore'dan full-doc overwrite ile gidiyorsa yarış kayıpları kaçınılmaz.

### P1‑7. Admin sayfaları: yüklenemeyen veri dürüstçe gösterilmiyor
`AdminPage.tsx` kullanıcı listesi/şikayet yüklemesi hata aldığında `admin_users_load_failed` i18n anahtarı var (iyi) ama `i18nAdmin.ts` **ja/fr 4/45 anahtar** — Almanca/Fransızca/Japonca adminler ham anahtar metinleri görür. Ayrıca admin sayfası role kontrolünü `users/{uid}.role`'den okuyor ama `AdminRoute` okumuyor (tutarsız).

---

## 5. P1 — Voice Duel ("KİM BU KARAKTER?") — bilinen hata listesi (kullanıcı isteği)

Canlı: `/voice-duel`. 10 resmi Madoka Exedra character PV (Aniplex kanalı), YouTube embed, 4 şık, 120 sn süre, streak skoru, best-score localStorage.

Kullanıcının 10 Kas 2026 geri bildirimi (düzeltme listesi `TODO.md`'de):
1. **Doğru cevap her zaman A** — şıklar oyuncu başına shuffle EDİLMİYOR (`getRound` klipleri karıştırır ama `options` dizileri sabit; doğru cevap hep index 0). `pickRandom`/per-clip shuffle gerekiyor — cevabın sırası için ayrı bir rng.
2. **Karakterler ekranda görünüyor** — resmi PV görselleri gizlenmeli. Öneri: iframe'i tam kapla, üstüne `position:absolute; inset:0; background:#000` + büyük "?" overlay; ses arka planda çalmaya devam eder (YouTube embed görseli iframe içinde olduğundan overlay iframe'in üstüne konur, iframe `pointer-events:none` yapılabilir; tek tık sessiz autoplay için).
3. **Madoka Exedra dışına genişlet** — kullanıcı seriyi tanımıyor; popüler serilere (One Piece, Naruto, Jujutsu Kaisen, Demon Slayer) geçilmeli. Kaynak: her serinin **resmi kanalının** karakter klipleri (ör. Aniplex EN, Bandai Namco, Viz). Dataset yeniden kurulmalı — yeni klipler `docs/voice-sources.md`'da kanıtlanmalı (URL + erişim tarihi).
4. **Skorun `anisync` hesabına/Kalıcı Firestore'a yazılması** — şu an yalnız localStorage best-score var. Opsiyonel: imzalıysa `recentActivities`'e "skor X yaptı" yaz (mevcut desen).

Ek teknik not: `src/pages/VoiceDuel.tsx` `finishRound` `useCallback` bağımlılıkları `[score, bestScore]` — zamanlayıcı 0'a inince `finishRound` eski closure'a düşebilir (küçük yarış). `setTimeout` 1300 ms ilerleme `clipIndex` closure'ını taşır — race improbable ama `useRef` ile sağlamlaştırın.

**Kapsam dışı karar:** Madoka-cast hayran içeriği **kullanmayın** — yalnız resmi kanallar (telif). Eren Yeager, Luffy gibi kliplerin resmi PV'lerini pin'leyin.

---

## 6. P2 — Hijyen, Doküman, Süreç

1. **ESLint ~464 uyarı** (`no-unused-vars` + a11y) — `ci.yml` ve README "errors only" der, `--max-warnings 10000` pratikte kapıyı kapatmıyor. Yavaşça sürün: `eslint --fix` + 2 hafta kuralı.
2. **`charts` paketi ~424 KB** — recharts yerine ~40 KB'lık el yazımı SVG (Life Sim istatistikleri) ile değiştirin; bundle boyutunu `vite build` sonrası izleyin.
3. **CI `--max-warnings 10000` → `0` yapın** (uyarıları önce arın) ya da hata/uyarı ayrımını açıklayın. Aksi halde CI yeşili anlamsız.
4. **i18n parity:** `ja.ts` 2 anahtar eksik (`recent_activity` ve `recent_activity_tab` civarı — 1590 vs 1592 satır); `i18nAdmin.ts` ja/fr 4/45 anahtar; `OtakuRankBadges` ham anahtarlar; `ja.ts`'da kod sayfası kırık karakterler (PowerShell çıktısında `᠏` benzerleri — gerçek dosya UTF‑8, konsol gösterimi artifact'i olabilir ama doğrulayın: `file -i src/i18n/locales/ja.ts`).
5. **README/TODO bayatları:** "50 test" → 55; `cron: 0 5 * * *` (Hobby sınırı, doğru) README'de "saatlik" gibi eski iddialar var; `README`'deki "Sezon listeleri — her açılışta canlı; sezon, yıl popülerlik aynı günden beslenir" ifadesi güncel motorla uyuşuyor mu doğrulayın. **README doc ile gerçek arasındaki her farkı düzeltin.**
6. **`firestore.indexes.json` eksik:** `animeComments (animeId, createdAt desc)` yok → yorum listesi production'da "missing index" hatasıyla kırılır. `animeReviews`/`socialFeed` ORDER BY'ları da gözden geçirin; **deploy-rules.yml indeks DEPLOY ETMEZ** — `firebase deploy --only firestore:indexes` ekleyin veya Console'dan yayınlayın.
7. **`FIREBASE_TOKEN` GitHub secret'ı yok** → `.github/workflows/deploy-rules.yml` her push'ta hata ile düşer (hata mesajı okunabilir — "FIREBASE_TOKEN secret is not set" — ama dağıtım yok). `firebase login:ci` ile token üretin.
8. **`.env` (yerel, commit'li değil)** yalnız `VITE_ADMIN_EMAILS` + ölü `GEMINI_API_KEY` içerir — doğrulandı. **Geçmişte hiçbir commit'te key yok** (log taraması yapıldı). `GEMINI_API_KEY` kasıtlı olarak Vercel'e EKLENMEDİ (kullanıcı kararı) — AI yolları fail-closed; bu karar hâlâ geçerli mi, kullanıcıya tekrar sorun.
9. **adminActions / config / reports** — `reports` create imzalı herkese açık ✓ ama moderatör `update` yetkisi `isAdmin()` → moderatör bir şikayeti "sildi" yapabilir (kasıtlı, not).
10. **KVKK/GDPR:** `dataRequests` kuyruğu var (rules: `dataRequests`) ama **otomatik silme/export yok** — talep oluşturulunca moderatöre düşer; SLA ve e-posta kanalı TODO'da. AB/TR kullanıcıları için yayına çıkmadan önce en azından "30 gün içinde işlenecek" taahhüdü + manuel süreç belgelenmeli.
11. **`deploy-rules.yml` yalnız `firestore.rules`'a bakar** — `firestore.indexes.json` değişikliği workflow'u tetiklemez. `paths` listesine `firestore.indexes.json` ekleyin.
12. **`README` “Tek kaynak” ifadesi `legacy-v2`** arşiviyle doğru — ama README'de "Deploy hedefi Vercel" altında `VITE_API_BASE_URL` native build talimatı eksik (TODO'da var): Capacitor'da `/api` kırılır; `VITE_API_BASE_URL=https://anisync-tau.vercel.app` verilmeli.

---

## 7. Envanter — sayfalar, oyunlar, sistemler (durum & verdict)

Ajan raporlarından derlendi (detay: Bölüm 9'teki "Ajan Çıktıları"). ✅ = üretimde çalışıyor, ⚠️ = çalışıyor ama bilinen sorunu var, ❌ = üretimde kırık/kapalı.

| Parça | Yol | Verdict | Not |
|---|---|---|---|
| Home (KEŞFET) | `src/pages/Home.tsx` | ⚠️ | Hero/etiket stub'ları; `addForumPost` unawaited; 506 satır |
| Discover | `src/pages/Discover.tsx` | ✅ | Canlı AniList + stub'lar temizlendi |
| MyList | `src/pages/MyList.tsx` | ✅ | PrivateRoute; toplu import |
| Profile + rozet vitrini | `src/pages/Profile.tsx` + `OtakuRankBadges` | ⚠️ | Ham i18n anahtarları (P1‑4) |
| AnimeDetail | `src/pages/AnimeDetail.tsx` | ✅ | Yorumlar `animeComments` eksik index'i (P2‑6) |
| MediaDetail | `src/pages/MediaDetail.tsx` | ✅ | Manga/novel detay |
| AiringCalendar | `src/pages/AiringCalendar.tsx` | ✅ | TR-day penceresi + STALE badge (tasarım gereği) |
| MusicQuiz | `src/pages/MusicQuiz.tsx` | ✅ | iTunes preview; günlük |
| **Voice Duel** | `src/pages/VoiceDuel.tsx` + `src/data/voiceDuelData.ts` | ⚠️ | Bölüm 5 — shuffle/overlay/Madoka kapsamı |
| Arcade | `src/pages/Arcade.tsx` | ✅ | Breakout/Memory/Snake |
| ANISYNCDLE | `src/pages/Dle.tsx` + `src/data/anisyncDleData.ts` | ✅ | TR-day, pratik izole |
| Life Sim | `src/pages/LifeSim.tsx` + `src/lib/eventEngine.ts` (2421 LOC) | ✅ | 4 dil; ayrı chunk (~301 KB) |
| Watch Party | `src/pages/WatchParty.tsx` + `src/components/WatchParty/*` | ⚠️ | VideoPlayerDeck (P1‑1); rules (P0‑6) |
| KÖŞE / Café chat | `src/pages/CoffeeCorner.tsx` + `GlobalChat.tsx` + `RoomRequestModal/Panel` | ❌→⚠️ | GlobalChat P0‑1; onay yolu P0‑2; 7 resmi oda sağlam |
| AnimeRadioPlayer | `src/components/AnimeRadioPlayer.tsx` | ✅ | YouTube embed, kalıcı rail |
| Import/Export | `src/components/ImportExportModal.tsx` + `src/lib/importList.ts` + `enrichImport.ts` | ✅ | CDATA + AniList batch enrich; sahte kapak/skor yok |
| Admin Panel | `src/pages/admin/AdminPage.tsx` + `src/components/AdminRoute.tsx` | ⚠️ | P0‑4; i18nAdmin P1‑7 |
| AIRecommendationsSection | `src/components/AIRecommendationsSection.tsx` | ❌ | P1‑3 |
| CommunityPulse / RecentActivityFeed | `src/components/*` | ✅/⚠️ | Firestore `recentActivities`; ses +1 sızıntı yok |
| Firebase integration | `src/firebase.ts` (named DB) | ✅ | `(default)` DB kullanılmıyor — KARIŞIKLIK! `useWatchPartyStore` / `roomsDb` adlandırılmış DB adını taşır; client default DB'ye yazan kod KALMADI (grep doğrulandı, ama yeni kod ekleyenler dikkat) |
| AnimeLifeSim concept doc | `ANIME_LIFE_SIM_CONCEPT.md` | ✅ | Tasarım belgesi, güncel |

**i18n kapsamı:** TR/EN/JA/FR anahtar eşitliği `locales.test.ts` ile zorunlu (parity ✅). Buna rağmen bazı bileşenlerde hâlâ gömülü Türkçe metin var (`MemeZone`, `MonthlyActivityChart`, `ProfileAnalyticsDashboard`, `RecentActivityFeed` yedek adları). `useAppTranslation` + i18next; **dil değişimi tam reload gerektirir** (CJS bundle).

**Test kapsamı (11 Kas 2026):** **67 test / 10 dosya** — `adminConfig`, `anonQuota`, `eventEngine`, `importList` (13), `level`, `rssIngest`, `utils`, `verifyIdToken`, `voiceDuelData`, `locales`. **UI bileşen testi sıfır, E2E sıfır** (tarayıcı testi imzasızdı).

---

## 8. Düzeltme Sırası (DeepSeek'e iş emri)

**Oturum 1 — P0 (çökme + kurallar, ~1 gün)**
1. P0‑1 GlobalChat anonim mesaj render düzeltmesi + AnimeErrorBoundary içine al.
2. P0‑2 `isValidRoom()` approved-exception **veya** `approveRoomRequest`'i `/api/approve-room` (Admin SDK) serverless'a taşı; kuralları yayınla; **gerçek imzalı hesapla** test et (50 oy → onay → oda doğuyor mu?).
3. P0‑3 `animeRatings` rules + aggregate transaction + index + client average okuma yolu.
4. P0‑4 AdminRoute Firestore role okuma; `UserProfile.role` tipi; `adminConfig.ts` bundle'dan kalkış.
5. P0‑5 rules `email_verified == true`; bootstrap listesini daralt.
6. P0‑6 watchPartyRooms update beyaz listesi.
7. P0‑7 poll votes transaction (istemci `runTransaction`) veya `/api/poll-vote`.

**Oturum 2 — P1 (dürüstlük + oynatıcı, ~1 gün)**
8. P1‑1 VideoPlayerDeck YouTube IFrame API (`enablejsapi`), src stabilizasyonu, volume/mute komutları, süre››240 fix.
9. P1‑3 AIRecommendationsSection dürüst kart (veya Groq/OpenRouter entegrasyonu — kullanıcı kararı gerekli).
10. P1‑5 AppStore slice ayrımı (`useWatchlistSync`, `useForumSync`, `useNamedLists`) + logout temizliği.
11. P1‑2 GenreTrendingVisualization gerçek hesap veya kaldır.
12. Bölüm 5 Voice Duel: shuffle, görsel overlay, popüler-seri dataset (One Piece/Naruto/JJK/DS resmi kanalları — URL listesiyle başla).

**Oturum 3 — P2 (süreç, ~yarım gün)**
13. P2‑6 eksik index + `deploy-rules.yml`'ye `firestore:indexes` deploy; `FIREBASE_TOKEN` secret.
14. P2‑4 i18n parity CI kapısı (missing-key raporu); ja anahtarları; adminTranslations ja/fr.
15. P2‑5 README/TODO senkronu; P2‑12 native `VITE_API_BASE_URL` + Capacitor smoke (`cap sync`).
16. `--max-warnings 0` yol haritası; `charts` paketi değişimi.

**Her adım için kabul kriteri:** `npm.cmd run verify` yeşil + **imzalı tarayıcıda** uçtan uca smoke + `git push` (Vercel yeşil) + canlı URL'de doğrulama.

---

## 9. Ajan Çıktıları (ham özet — arşiv)

Dört keşif ajanı bu denetim için paralel koşturuldu (`explore`, 10 Kas 2026). Aşağıda her birinin en kritik çıktılarından derlenen kanıt haritası var; **doğrulandı ✅** notu olanlar bu oturumda dosyada tekrar okunmuştur, kalanlar ajan beyanıdır (DeepSeek teyit etmeli).

**A1 — Sayfalar (18+ dosya, tümü `App.tsx`'e lazy route):** Home, Discover, MyList, Profile (hem `/profile` Private hem `/profile/:uid` **public** — bilinçli? teyit et), AnimeDetail, MediaDetail, Lists, AiringCalendar, AnimeGridMaker (canvas, CORS), MusicQuiz, VoiceDuel, WatchParty, CoffeeCorner, Arcade, LifeSim, Dle, Onboarding, admin/AdminPage, About. Verdict ağırlığı: 2 BROKEN/STUB (AdminRoute auth'a bağlı, Anime ratings), kalanlar COMPLETE/PARTIAL. En büyük sayfalar: MusicQuiz 1103, AnimeGridMaker 807, AiringCalendar 668 — bölünmeye aday.

**A2 — Bileşenler/oyunlar:** GlobalChat (P0‑1 ✅), ChatCafe/RoomQueuePanel, AnimeCommunityReviews/Comments (index eksikliği ✅ P2‑6), MultiMediaHub (localStorage-vs-Firestore sahipliği dokümante edilmemiş), AnimeGridMaker canvas CORS, BadgeShowcase/OtakuRankBadges (P1‑4 ✅), DailyModalManager, AIRecommendationsSection (P1‑3 ✅), ImportExportModal (yeni enrichment yolu doğru), WatchParty modalları (P1‑1 ✅), MemeZone/CommunityPulse/RecentActivityFeed, ErrorBoundary/AnimeErrorBoundary (yakalıyor ✅), AnimeRadioPlayer (kalıcı ✅). **Top‑10 bileşen sorunu**: GlobalChat crash, %98 mock, VideoPlayerDeck reload, GenreTrending uydurma, ham i18n, O(n) rating recompute, unawaited writes, `as any`, console.log kalıntıları, AdminRoute.

**A3 — lib/hooks/store/i18n:** anilist.ts 636 LOC (rate limit + cache ✅, `fetchSimilarAnime` yok — `similarAnime.ts:24` üzerinden, `aiStudio` 18+ çağrı yeri), unified.ts/animeBridge.ts (fallback inline), airingService.ts (TR-day + sayfalı ✅), level.ts (30 seviye eğrisi ✅), rooms.ts (transaction + approve ❌ P0‑2 ✅), importList.ts (13 test ✅), avatar.ts ✅, genreNames.ts, useAnimeData/useAppTranslation/useRemoteConfig/useReminderStore, AppStore.tsx (P1‑5 ✅), i18n.ts 79 satır loader (fallback: en), **i18n/index.ts YOK** dosyalar locales/*.ts; ja 2 anahtar eksik ✅; eventEngine.ts 2421 LOC (parçalanmalı). **Doğrulanmış mimari beyanı:** "AppStore ~700 satır; watchlist/namedLists Firestore+localStorage aynalı; forum posts Firestore onSnapshot; offline = yerel kopya + Firestore gerçek kaynak."

**A4 — Altyapı/güvenlik/doküman:** rules (P0‑2/3/5/6/7 ✅), indexes ✅, package.json (`tsx server.ts` dev; `test` vitest), vite.config chunking, vercel.json cron `0 5 * * *` (Hobby ✓), ci.yml/deploy-rules.yml ✅, gitleaks taraması temiz ✅, `.env` izlenmiyor ✅ (`.gitignore` doğru), **354 tracked / 186 src / 7 test dosyası** ✅, 50947 LOC ✅, node v24.12.0 local / CI Node 20.

---

## 10. Operasyon Runbook

```powershell
# Ortam (PowerShell execution policy engelli):
npm.cmd ci          # bağımlılıklar
npm.cmd run verify  # tsc + eslint + vitest + build  (CI ile aynı)
npm.cmd run dev     # tsx server.ts → :3000

# Dağıtım zinciri: commit → push (master→main) → GitHub CI → Vercel prod
git push origin master:main
gh api repos/zamankatili/AniSync/commits/<sha>/status   # Vercel durumu

# Firebase (Kural yayın):
firebase.cmd deploy --only firestore:rules --project folkloric-centaur-q6tp2
firebase.cmd deploy --only firestore:indexes --project folkloric-centaur-q6tp2

# Native build:
$env:VITE_API_BASE_URL="https://anisync-tau.vercel.app"; npm.cmd run native:sync
```

**Canlı:** https://anisync-tau.vercel.app · **Repo:** github.com/zamankatili/AniSync (public) · **Branch:** main (eski → `legacy-v2`) · **Firebase:** proje `folkloric-centaur-q6tp2`, adlandırılmış DB `ai-studio-38510956-0201-4472-bc9c-39e25815045d` · **Vercel proje:** `zamans-projects-e6ff294a/anisync` (Hobby) · **Cron:** `/api/refresh-news` günlük 05:00 (Hobby sınırı).

**Bilinen karar kayıtları:** ① GEMINI_API_KEY Vercel'de yok (kullanıcı, 9 Kas). ② `main` forced-push edildi, `legacy-v2` arşiv. ③ `.env` commit'te yok. ④ Adlandırılmış Firestore DB kullanılıyor; yeni kod `roomsDb` gibi default-DB varsayımı yapmamalı. ⑤ KALFA odası: AI fail-closed → istek→50 oy→mod onayı; yüksek XP kullanıcılar da moderasız oda açamaz (AI kapalıyken `ok:false`). ⑥ ANON sohbet 3 mesaj/gün cihaz kotası. ⑦ `/profile/:uid` public (moderasyon görünürlüğü için kasıtlı mı? teyit edin).

---

## 11. Dürüstlük Politikası — değiştirilmez ilkeler

1. Canlı veri yoksa **uydurma yok** — boş durum ya da açık etiketli yedek.
2. Kullanıcıya gösterilen her sayı (skor, %, trend, "6 rütbe", "30 seviye") kod ve veri ile **çelişemez**; çelişki varsa sayı yoksa ya da hesaplanır.
3. AI kapalıyken mock öneri "AI önerisi" diye sunulmaz — ya etiketlenir ya gizlenir.
4. Resmi olmayan kaynaklardan (hayran klibi, hot-link kapak) medya gömülmez; resmi kanallar ve lisanslı API'ler kullanılır.
5. Firebase kuralları **client'a değil, sunucu mantığına güvenir**; her yeni koleksiyon için kural + test yazılır.

---

## 12. DeepSeek — ilk 10 dakikanız

1. En güncel durum için **en üstteki "Uzman İncelemesi — 11 Kasım 2026"** bölümünü okuyun; aşağıdaki 3–8 numaralı bölümler 10 Kasım anlık görüntüsüdür.
2. `npm.cmd ci && npm.cmd run verify` → yeşil mi? (Beklenen: 67 test / 10 dosya, tsc 0, ESLint 0 hata, build 0.)
3. Firestore kurallarını yalnız değiştirirken emulator'da test edin; mevcut P0 kuralları canlıda deploy edilmiş durumda.
4. İmzalı bir test kullanıcısı ile canlıda uçtan uca smoke yapın: oda onayı (50 oy → moderatör), Kalfa oda açma, Watch Party senkronu, admin paneli.
5. ~~`docs/voice-sources.md` oluşturup Voice Duel dataset'inin her klipini URL+erişim tarihiyle pin'leyin.~~ **Yapıldı** — `docs/voice-sources.md` 10 klibin kanalını, segmentini ve doğrulama kurallarını listeliyor.
6. PWA service worker (`public/sw.js`, `anisync-shell-v2`) deploy sonrası kısa süre eski kabuğu sunabilir. Şüpheli bir "eski sürüm" gözleminde önce SW'yi ve cache'i temizleyin; navigasyon network-first, hash'li asset'ler cache-first.
7. Bu belgeyi güncelleyerek ilerleyin — her kapattığınız satırı işaretleyin ve gerekiyorsa `SYSTEM_AUDIT_2026-11-12.md` olarak devam ettirin (yoksa belge çürür).

---

## 13. 12 Kasım 2026 — Kapanış turu (i18n + dürüstlük)

**Commit'ler:** `c5e7d25`, `61cbc52`, `b01687f` (+ bu tur).

**Kapanan işler:**
- Profil analitiği: boş listede uydurma radar türleri/sayılar kaldırıldı; bilinmeyen bölüm sayısı 12 varsayılmıyor; "tahmini" ve "bilinmeyen seriler hariç" notları eklendi.
- Aylık aktivite grafiği: ay adları aktif dile göre; bilinmeyen bölümlerde 12 uydurulmuyor; eksen, legend ve tooltip yerelleşti.
- Voice Duel: TR/EN/JA/FR arayüz ve dört dilli ipuçları; resmî kanal atfı; şık isimleri `lang="en"` ile Türkçe büyük harf bozulmasından korunuyor.
- Liste oluşturma, akış kartı, KÖŞE kafe, haber arama, yanıt alanı ve Snake yön etiketleri yerelleşti.
- Zevk anketi: tüm adımlar ve sonuçlar dört dilde; eksik `taste_header_*` anahtarları eklendi. Üç öneri artık "sabit editör seçkisi" olarak etiketli; MAL skorları "seçki tarihinde" olarak işaretli.
- Zevk anketi hızlı ekleme: uydurma 24 bölüm / 2024 / Finished Airing / tür yazımı kaldırıldı. Önce AniList, sonra Jikan'dan gerçek veri çekiliyor; ikisi de yoksa açık hata gösteriliyor.
- Hatırlatıcılar: bildirim testi, kalan süre metni, Google Takvim ve ICS içerikleri dört dilde; mobilde arka plan bildirimi olmadığı arayüzde açıkça yazılı.
- Top Listeler (`/lists`) misafirlere açıldı; resmî AniList/MAL sıralamaları giriş duvarı olmadan görünüyor, liste oluşturma hâlâ giriş istiyor.
- Liste başlıkları, sezon etiketi (“2026年秋” / “AUTOMNE 2026”) ve detay 404 kartı dört dilde. Türkçe gömülü metin ve `t('key', 'Türkçe')` varsayılanları için guard testi eklendi.

**Kapılar:** 67 test / 10 dosya, `tsc` 0, ESLint 0 hata, build 0; GitHub CI `build-test` yeşil; Vercel deploy yeşil.

**Açık kalanlar (dürüst liste):**
1. Oturum açmış kullanıcıyla uçtan uca smoke yapılmadı: oda onayı, Kalfa oda açma, Watch Party senkronu, admin paneli.
2. `FIREBASE_TOKEN` GitHub secret yok → `deploy` işi kırmızı; Firestore kuralları/index'leri elle deploy edildi.
3. Gemini anahtarı yok/kotası bitmiş → AI önerileri fail-closed; arayüz "editör seçkisi" demeli, "AI eşleşmesi" dememeli.
4. KVKK otomatik silme/dışa aktarma yok; e-posta + manuel kuyruk.
5. Native arka plan bildirimi yok (Capacitor local notifications eklenmedi).
6. ~~Voice Duel klip kaynak pinleme dokümanı (`docs/voice-sources.md`) yok.~~ **Kapandı** — `docs/voice-sources.md` eklendi.
7. Kalan gömülü metinler ağırlıklı olarak admin paneli ve marka adları; yeni ekranlarda önce `t()` kullanılmalı.
8. PWA service worker deploy sonrası kısa süre eski kabuğu gösterebilir; operasyon notu runbook'ta (bölüm 12, madde 6).

---

*Belge sonu · AniSync MVP → Consumer Product · 2026‑11‑10 · İletişim: repo sahibi (zamankatili).*
