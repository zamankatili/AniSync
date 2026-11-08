# AniSync - Sistem Gözden Geçirme (9 Kasım 2026)
*Kapsam: `app/` - tüm katmanlar (mimari, güvenlik, dağıtım, performans, veri, i18n/SEO, erişilebilirlik, test, teknik borç, yasal)*
*Yöntem: dosya sayımı, kod okuma (server.ts, rules, vite/tsconfig, capacitor, vercel), dependency taraması, git yapılandırması, canlı tarayıcı doğrulaması*

## ⭐ GÜNCELLEME — Aynı gün (9 Kasım 2026) — "hepsini yap" oturumu
Bu raporun yazıldığı gün içinde uygulanan ve doğrulananlar (her biri build+29 test yeşil):

**Güvenlik/kurallar (commit `c413e42`, `c3f0451`)**
- 🔴 P0 **Kurallar şema-uyumlu hale getirildi** ve **privilege-escalation açığı kapatıldı**: `users/{uid}` artık kendi `role/ban` alanını yazamaz (owner OR admin idi); sahip/ moderatör/ admin yetkileri ayrıştırıldı (moderatör yalnız ban alanları).
- `customLists.creatorId`, `forumPosts.author.uid`, `globalChat.uid`, `recentActivities.userId`, `socialFeed.userId`, `sharedLives.userId`, `watchPartyRooms(hostId/uid)` alan-uyuma kurallarda düzeltildi ve **sıkılaştırıldı** (misafir/toplu yazma yok; guest yazımları kod tarafında da engellendi).
- `polls`: içerik admin-only; `votes` alt-kolejsiyonu (oy = +1/diff-only); anket tohumlama **admin paneline taşındı** ("Anketleri Seed'le (50)" butonu).
- `sharedLives`: mum (+1) dışında güncelleme yok; `animeReviews`: like-only diff; `animeNews` admin-only.
- **Gemini uçları kimlik kapısında**: `/api/translate` ve `/api/ai-recommendations` artık Firebase ID token doğrular (üretimde zorunlu) — sıfır bağımlılıkla Google securetoken doğrulaması (`src/lib/verifyIdToken.ts`) + istemci Bearer gönderiyor + imzasız 2026/sahte yok. `/api/refresh-news` → CRON_SECRET guard (Vercel + Express).
- `SCHEDULE_2026` hardcoded sahte yayın takvimi **tamamen silindi** (çevrimdışıysa boş+stale).

**Sahte canlı içerik temizliği (commit `c413e42`, `19b4058`)**
- "Topluluk aktivitesi" feed'i: sahte 6 üyeli seed + "simülasyon üret" butonu → kaldırıldı, dürüst boş durum.
- Sosyal akış: sahte 3 inceleme + sahte "match %96" AI rozeti → gerçek durum + "AI POWERED only when aiGenerated" (Curated/Editor rozeti).
- Anime yorumları: sahte Frieren/SoloLeveling incelemeleri + sahte "4.8★" → kaldırıldı; beğeniler kalıcı (likes/likedBy).
- WatchParty: sahte 5 "canlı oda" (126 katılımcı!) + join'de DB'ye seed yazma → kaldırıldı; katılımcılar gerçek türetim (host+sen+sohbet edenler); sahte "Simulated Active Members" listesi → gerçek türetim.
- Home: sahte "GÜNÜN ANKETİ KAZANANI: NARUTO!" ve sahte trendler ("#SOLOLEVELING 12.4K") + sahte "kimi takip etmeli" → kaldırıldı/dürüst durum.
- `mockFriends`/`mockForumPosts` → silindi; `poll` senkronizasyonu `useDailyPoll` hook'una çıkarıldı; forum listener her zaman güncel listeyi uygular.

**Platform/kalite**
- 🔴 P0 ESLint 9 (flat config, `react-hooks` error, a11y warn) + `.github/workflows/ci.yml` (npm ci → tsc → eslint → vitest → build) + `.github/workflows/deploy-rules.yml` (rules'ı FIREBASE_TOKEN ile deploy; `rules` path'ine tetiklenir) — **CI artık hazır; repo'da tek lockfile (bun.lock silindi)**.
- 🔴 P0 `index.html` İngilizce varsayılan + `og:locale=en_US` + alternate `hreflang` + dinamik JSON-LD `inLanguage` (TR/EN/JA/FR); `fallbackLng: 'tr'` → `'en'`; `syncHtmlLang` EN varsayılan.
- Testler: 15 → **29** (RSS ingest: birleştirme/sıralama/dedupe/30g filtre/TTL/kategori; ID token doğrulama: imza/exp/iss/aud/kid/cache — RSA üretilerek).
- `prefers-reduced-motion` + global `:focus-visible` (theme-accent outline).
- **KVKK/GDPR**: profilde "VERİLERİMİ İNDİR" (client-side JSON export) ve "HESAP SİLME TALEBİ" (`dataRequests` kuyruğu; admin panelinde **Veri Talepleri** sekmesi; 30 gün işleme SLA'sı); kurallar: create yalnız kendi talebin + `pending`.
- Report-delete yolu beyaz-listesi: rapor → "İçeriği Sil" artık yalnız `socialFeed/globalChat/animeComments/forumPosts/recentActivities/sharedLives/customLists` (users/-veya başka path silinemez).
- `npm audit fix`: 2 kritik (proxy-addr, websocket-driver) çözüldü; 31 → 19 (mod/yük: tamamı dev zinciri).

**Kalan işler (bilinçli ertelendi / sende)**
- i18n split (index 254 KB gzip; route-level i18n) — t() çağrılarını her yerde kırmamak için ayrı oturum.
- `eventEngine.ts` break-out (generateLife/memorial ayrımı) + AppStore'da kalan slice'lar (forum/watchlist) — hook test altyapısı ile birlikte yapılacak.
- Firestore kuralları yayınlandı mı? **Hayır — senin Firebase Console'dan yayınlaman gerekiyor** (bu oturumdan `firestore.rules` güncel). `role:'admin'` ataması da senin. `deploy-rules.yml` çalışması için `FIREBASE_TOKEN` repo secret gerekir.
- Vercel env: `GEMINI_API_KEY`, `CRON_SECRET`, `FIREBASE_PROJECT_ID` set edilmeli (aksi halde prod'da translate/AI 401 döner — fail-closed).
- "1 in 8 Billion" ismi → ticari lansmanda değiştir (öneri: "AniSync: One Life, Many Worlds").
- Rules birim testleri (@firebase/rules-unit-testing + emulator) — P1.
- console.error gürültüsü üretimde süzülmüyor (P1); i18n eksik-anahtar CI raporu (P2); `notableCharacters.role` romaji karma (P2).

## 0. Yönetici özeti — sistem tek cümlede
**Yeni nesil görünür, eskimiş çekirdek:** güzel bir neo-brutalist mobil UX + gerçek canlı veri akışları (AniList takvimi, RSS haberleri) + 4 dilli içerik, AMA halen MVP kalitesinde mühendislik disiplini: test coverage düşük, güvenlik kural deposu yeni, dağıtım uyarısı (Vercel) sahte cron'a sahip; yasal/telif jakarında "dokunma" hassasiyeti; tek geliştiriciye dayalı.

## 1. Yapı ve ölçek (ölçülmüş)
| Metrik | Değer |
|---|---|
| Kaynak dosya (`src/`) | 149 (81 .tsx + 68 .ts + 1 .css) — **2.29 MB** |
| Depo izlenen dosya | 296 |
| Bileşen | ~51 |
| Sayfa | 15 (+ admin) |
| Rotalar | 16 (+ `/admin`) |
| Veri dosyaları | ~30 (worlds/regions/lore/fallback…) |
| i18n | `i18n.ts` **351 KB tek parça** + `i18nAnimeLifeSim.ts` + `i18nAdmin.ts` |
| Backend | `server.ts` (Express, 31 KB) + **YENİ** `api/refresh-news.ts` (Vercel serverless) + **YENİ** `src/lib/rssIngest.ts` (ortak kaynak) |
| Bağımlılıklar | ~50 (Capacitor 8, Firebase 12, Vite 6, React 19, Tailwind 4…) |
| Üretim paketleri (gzip) | `index` 254 KB, `AnimeLifeSim` 71 KB, `firebase` 123 KB, `charts` 123 KB |
| Test | **15 test / 2 dosya** (`eventEngine.test.ts`, `adminConfig.test.ts`) |

## 2. Güvenlik & gizlilik (bu oturumda yeni uygulamalar dahil)
### 2.1 İyi giden
- `firestore.rules` **eklendi ve commitlendi** — `isAdmin()` + `isBootstrapAdminEmail()` (e-posta doğrulaması hem env hem rules'da, ikisi de bootstrap için `zamankatilii@gmail.com`). Bilinmeyen koleksiyon → **deny-all**.
- `animeNews` artık **admin-only yazma** (evvelden giriş yapan herkesin sahte "canlı haber" enjekte edebilmesi kapatıldı, `e06d206`).
- `.env` ve servis hesabı anahtarları repoda yok (`.gitignore` ✓, hiç commit'lenmemiş). `firebase-applet-config.json` yalnızca **client-side** config (API anahtarı zaten istemcide public).
- Sunucu, Gemini API anahtarını sunucuda tutar (istemciye sızmaz).
- Admin bootstrap e-postası `.env` ile değiştirilebilir; rules'ta ayrıca listelenir (körlenmeme/devir).
### 2.2 Açık kalanlar
| Bulgu | Öncelik | Eylem |
|---|---|---|
| **H1 — `animeNews`/`sharedLives`/`recentActivities` kuralları hâlâ "giriş yapan herkese" açık** — sistem kendini besliyor ama kötü niyetli spam tüm kullanıcıya ulaşır | 🔴 P0 | `recentActivities`/`sharedLives` için de **admin/owner** daraltma (moderasyon kuyruğu da zaten `reports` var) |
| **H2 — API'ler kimliksiz** | 🟠 P1 | `/api/ai-recommendations`, `/api/translate`, `/api/refresh-news` → Firebase ID token doğrulama (Vercel function public olduğu için rate limit yok) |
| **H3 — Firestore rules'un `users/{uid}` güncelleme** kuralı `update: only auth.uid == uid **veya** admin` ama `hasOnly([...])` `role` dahil — admin atanan herkes `role:'admin'` yazar | 🟠 P1 | `role` alanını yalnız `isAdminOnly()` değiştirebilir yap |
| **H4 — `handleDeleteMessage`** sadece kendi mesajını siliyor; moderatör/admin silme yok | 🟡 P2 | Moderatör silme + `adminActions` log |
| **H5 — Service account yoksa Admin SDK rolleri dağıtılamıyor** (ilk admin elle) | 🟢 bilgi | Dokümante edildi (`ADMIN_PANEL_ANALYSIS.md`) |

## 3. Dağıtım & sunucusuz hatası (önemli bulgu)
| Bulgu | Öncelik | Eylem |
|---|---|---|
| **D1 — `vercel.json` cron → `/api/refresh-news` Vercel'de 404** (rewrites her şeyi `index.html`'e yönlendiriyordu; cron asla çalışmıyordu) | 🔴 P0 | **Düzeltildi** — `api/refresh-news.ts` + ortak `src/lib/rssIngest.ts` (yerelde Express `/api/refresh-news` da aynı kaynağı kullanır) `e06d206` |
| **D2 — `api/refresh-news`'in response'u statik cron için uygun ama auth yok** | 🟠 P1 | Vercel Cron header kontrolü (`Authorization: Bearer $CRON_SECRET`) |
| **D3 — `firebase.json` doğru rules dosyasına işaret ediyor; Vercel'de Firestore rules otomatik yüklenmez** | 🟠 P1 | `.github/workflows/deploy-rules.yml` veya manuel `firebase deploy --only firestore:rules` talimatı |
| **D4 — Vercel'de `GEMINI_API_KEY` veya `VITE_FIREBASE_*` set değilse** translate/ai-recommendations sessizce `fallback:true` döner (veya 500) | 🟡 P2 | `.env.example` anlatıyor; build logunda kontrol |
| **D5 — `metadata.json` AI Studio için; üretim için `robots.txt`/`sitemap.xml` kuralına uyum** | 🟢 bilgi | `/sitemap.xml` sunuculu; Vercel'de statik ise 404 → Vercel function'a taşıyın |

## 4. Performans & paketleme
| Bulgu | Not |
|---|---|
| **P1 — İlk yükleme ~830 KB (gzip ~258 KB) `index`** | React+router+firebase+i18n tek parça; `manualChunks` firebase/motion/charts ayrılmış (iyi) |
| **P2 — `AnimeLifeSim` 301 KB → 88 KB gzip; 16 benzersiz olay + TR/EN/JA/FR içeriği** | Yaklaşık %28 i18n, %40 event content; **lazy import doğru** ama içeriğin kendi chunk'ına ayrı klasörden import edilmesi tek dosya büyütüyor |
| **P3 — `i18n.ts` 351 KB tek parça** | ~4 dil × ~3.500 anahtar; başlangıç paketi şişiriyor; **i18n split (feature namespace)** kritik |
| **P4 — Tailwind 4 + neo-brutalist tema; `backdrop-blur` + kalın `border`/box-shadow pek çok yerde** | Mobilde GPU maliyeti; `prefers-reduced-motion` opsiyonel değil |
| **P5 — `framer-motion` + `motion` aynı projede**; `vite.config.ts` `motion` chunk'ı her ikisini kapsıyor | Doğrudan `motion` importlarına göç edin |

## 5. Veri & tazelik (bu oturumda uygulandı, doğrulandı)
- **Canlı takvimi** AniList `airingSchedules` GraphQL: gerçek `airingAt` + `episode` (TR saati `Intl` ile), backend/Jikan fallback'leri **açıkça stale rozetiyle**, uydurma bölüm/saat/platform kaldırıldı; kök sayfa `/calendar` 2026 Sonbahar listesi yerine **gerçek bu-sezon animeleri** gösteriyor.
- **Haberler** Firestore-first → kaldırıldı; istemci → `/api/anime-news` (15 dk cache + 30 gün filtre) → yoksa **doğrudan canlı RSS** (rss2json) → yoksa Jikan "Sezon Takvimi" (dürüstçe haber değil diye etiketli). **Sahte "1 saat önce" 8 haber kaldırıldı.**
- **Keşfet TRENDING NOW** `fetchSeasonalTrendingAnime()`: AniList `season + seasonYear + TRENDING_DESC`.
- **Evergreen** listeleri soyutlandı (`top_airing` → `evergreen_picks`), `"now/airing/seasons"` offline boş liste + "YÜKLENEMEDİ" gösterir; **"2026 Sonbahar" sabitleri kaldırıldı** (dinamik sezon).

## 6. i18n & SEO yerelleştirme
| Bulgu | Durum |
|---|---|
| **İçerik motoru 4 dilde** (TR/EN/JA/FR tam) — doğum/çocukluk/fraksiyon/kriz/kanon/turnuva/klân/evrim/time-loop/dönüm noktaları/odak/anma/başarımlar/paylaşım metni | ✅ uygulandı ve doğrulandı |
| **Dünya/bölge açıklamaları** 8 evren + 27 bölge için JA/FR | ✅ uygulandı |
| **Lore** 8 dünya için summary/history/power/faction/location/character/keyEvents/themes/sourceSeries | ✅ uygulandı (8 dosya) |
| **`index.html` statik Türkçe meta/OG/JSON-LD** — `lang="tr"` sabit; `og:locale="tr_TR"` | 🔴 **P0** — eşsiz sayfa açılışında TR; dil algılama veya route/lang başlıklı meta üretme gerekir |
| **i18n `fallbackLng: 'tr'`** — JA/FR eksik anahtarı TR'ye düşürür (taze süreçte görüldü) | 🟠 P1 — fallback → `en` (kullanıcı dilini bilmiyorsa ortak dil EN) |
| **Lore UI başlıkları** (`力の体系`, `テーマ`, `原作シリーズ`, `詳細` vb.) JA/FR'ye çevrildi; lore **gövdeleri** daha önce TR kalmıştı → ŞU ANDA JA/FR ✅ tam (universe açıklama + fraksiyonlar dahil) — yalnızca `notableCharacters.role` karışık | 🟠 P2 — karakter rolleri romaji+TR |
| **RTL** (Arapça/Farsça) destek yok; `dir` yönetimi yok | 🟡 P3 — 18 dil hedefi için altyapı |
| **Intl.DateTimeFormat** kullanım — takvim/saat yerelleştirildi; sayı/tarih `Intl` ile tam değil | 🟡 P2 |
| **Eksik anahtarlar için otomatik rapor yok** (yayın kapısında) | 🟡 P2 — `i18n-checker` veya benzeri |

## 7. Erişilebilirlik & UX
| Bulgu | Durum |
|---|---|
| **44×44 dokunma hedefi** `.touch-target` uygulanmış; mobil 5 birincil sekme + "Daha fazla" alt sayfası | ✅ |
| **`prefers-reduced-motion` yok** — animasyonlar herkese | 🟡 P2 |
| **`aria-label` çoğu yerde var; ancak** Life Sim seçimleri (card'lar `div[role=button]`) klavye fokusunda `outline` yok; silme butonu SR için etiketsiz | 🟡 P2 |
| **Renk kontrastı** (beyaz/siyah üstünde amber/rose) çoğunlukla AA, bazı küçük metinlerde 7:1 sorunlu | 🟡 P2 |
| **Klavye/dijital atak seti** (Left/Right ok, ok+enter) arcade/dle için yok | 🟡 P3 |
| **Input font büyüklüğü** 16px mobilde (iOS zoom) ✓ | ✅ |
| **Dinleme modu** (`.coarse-only`) touch cihazlarına özel; `prefers-reduced-motion` eklenmeli | 🟡 P2 |

## 8. Test & kalite kapıları
| Bulgu | Durum |
|---|---|
| **`npm run lint` = `tsc --noEmit`** (ESLint yok) — stil/hook/a11y kuralı yok | 🔴 P0 |
| **`strict: true`** ✓ açık (5 hata çözüldü) | ✅ |
| **Test coverage** 15 test (eventEngine 9 + adminConfig 6) — hook/route/UI yok | 🔴 P0 |
| **CI** (`.github/workflows`) yok | 🔴 P0 |
| **`console.error/console.log`** üretimde kalıyor (Firestore hataları, API fallback'ler) — süzülmüyor | 🟠 P1 |
| **`Date.now()`/`Math.random()`** doğrudan çağrılar — seed'li test yalnız eventEngine'de var | 🟠 P1 |

## 9. Yasal & telif / içerik güvenliği
| Bulgu | Öneri |
|---|---|
| **"1 in 8 Billion" konsepte yakın** — 1in8b.life'ın parafrazı; mekanikleri korsan ama korumaya açık değil; **ticarileştirmede "8 Billion in Life" veya "One Life, 8 Billion Universes" tarzı isim** önerilir | 🟠 P1 — marka/名 gerçeği |
| **Gerçek karakter/seriler** — `notableCharacters`: Naruto, Goku, Guts, Eren… kamuya açık fan datası ama **ticari üründe IP sahibi talep edebilir** | 🟠 P1 — "inspiration from anime, not affiliated" dip notu + ticari isim değişikliği |
| **Anime/manga görselleri** MAL CDN'den hotlink — Sunucular kullanım şartlarına tabi (hotlink yasak değil ama bandwidth) | 🟡 P2 — `referrerPolicy="no-referrer"` zaten ✓; kendi CDN'inize taşıyın |
| **KVKK/GDPR** — kullanıcı verisi (email, watchlist, Life Sim kaydı) Firebase'de tutuluyor; "verilerimi dışa aktar"/"hesabımı sil" yok | 🟠 P1 — D1 (`api/data-requests`) — admin ön-sürecinde hazır |
| **Şikayet/moderasyon** — her gönderide 🚩 butonu (socialFeed, globalChat); `reports` koleksiyonu, panel dahil — **OK** ama kanunî yükümlülüklerdeki "illegal içerik kaldırma süresi" yok | 🟡 P2 — moderasyon SLA tanımı |

## 10. Kod kalitesi & mimari
| Bulgu | Not |
|---|---|
| **Tek 350 KB `i18n.ts`** — bunda `en/ja/fr` dahil; yeni özellik `i18nAnimeLifeSim.ts`'e ayrıldı (doğru yön), `admin` de öyle; **route-split i18n** gerek | P1 |
| **State yönetimi bölük pörçük** — Zustand (9 store) + `AppStore` (büyük: auth, watchlist, socialFeed via AppContext) — tutarsızlık | P2 |
| **`AppStore.tsx` 700+ satır** — auth + watchlist sync + social feed poll + badges + reminder işleri tek dosyada | P2 — `useAuthSlice`/`useListsSlice` ayırma |
| **`server.ts` tek dosya** — route/concierge ayrımı yok | P2 |
| **`eventEngine.ts` 2.300+ satır** — generateLife + memorial + achievements + world-specific events — **bir dosyada** — test edilir ama bakımı zor | P2 — `eventGeneration.ts`, `memorial.ts` ayırma |
| **`useAnimeData.ts` 400+ satır** — Jikan/AniList/bridge/fallback hepsi tek yerde | P2 |
| **Kurallar `firestore.rules` repoda ✓ ama hiçbir yerde otomatik test edilmiyor** (`@firebase/rules-unit-testing` yok) | 🟠 P1 |
| **`bun.lock` + `package-lock.json` ikisi de depod** — karışıklık (birini seçin) | 🟢 P3 |

## 11. Veri tabanı & entegrasyon güvenilirliği
- **AniList GraphQL** birincil — `fetchSeasonalTrendingAnime` + `fetchAniListWeek` + `getAnimeSeason` dinamik ✓
- **Jikan** `top/anime`, `schedules`, `seasons/now` — rate limit 3 req/s, `jikanFetch` kuyruk + retry var ✓
- **RSS** (ANN + Google News) — **doğrulandı canlı** (Vercel cron işlevi `api/refresh-news.ts` ile — `e06d206`)
- **OpenLibrary/Steam** — kitap/oyun arama public API; oyunlar `/api/games/*` (anahtar gerektirmez)
- **FireStore** — tek DB (`ai-studio-38510956-…`), 12h refresh/cron yolunu izliyor; `animeNews` seed boş kaldı (kuralı doğru); kullanıcı verisi (`users/{uid}/watchlist`) real-time sync var ✓
- **Hata yedekleme** — `translationCache` 429/Gemini düşüşünde sessizce boş dönüyor; kullanıcıya hata gösterilmiyor (pasif düşer) — P2 iyileştirme

## 12. Önceliklendirilmiş aksiyon planı (sıradaki 2 hafta)
**P0 (bu hafta — kurallara değil koda dokunur):**
1. `firestore.rules` → `recentActivities` ve `sharedLives` için **"owner veya admin"** (create: `isSignedIn()`, delete: owner/admin; `create` ancak `request.resource.data.userId == request.auth.uid`). `users/{uid} role` yazma yetkisini `isAdminOnly()` daralt.
2. `index.html` → `<html lang>` ve `og:locale` **route/lang'a göre** dinamik yap (prerender/SPA strategy; en uygun: `react-helmet-async` ile route-level `<Helmet><html lang>…`).
3. `fallbackLng: 'tr'` → `'en'` yap; production build'de TR fallback yalnız TR kullanıcısına.
4. **ESLint** (typescript-eslint + react-hooks + jsx-a11y) ekle + `npm run lint` sadece tsc değil; CI workflow (`.github/workflows/ci.yml`: lint + build + test).
5. **Tests**: en az 15 yeni test — hooks (useRemoteConfig, useFeatureFlag), Uı smoke, `rssIngest.parseRSS` (mock feed), `AdminRoute` (yetki/redirect), `eventEngine` 4-dil üretimi.

**P1 (hafta 2 — ürün/operasyon):**
6. `/api/ai-recommendations`, `/api/translate`, `/api/refresh-news` → **Firebase ID token** middleware + kullanıcı başına günlük kota (`rateLimits/{uid}/{yyyymmdd}`).
7. **KVKK/GDPR** — `/admin/data-requests` sayfası (istek listesi + "JSON dışa aktar" + "hesabı sil" — Admin SDK kodu ayrı serviste).
8. **Vercel cron** test edip etmediğini görmek için `api/refresh-news.ts`'i Vercel preview'da çalıştırın; `Authorization: Bearer $CRON_SECRET` guard ekleyin.
9. **İ18n split** — route chunks (loadAnimeLifeSim, loadAdmin…) — bundle 830 KB → < 500 KB hedefleyin.
10. **Lore metinleri JA/FR** kalan 8 dosyada `notableCharacters.role` (ör. "世界最強の魔法使い") ve `factions[].description` — zaten ✅ tam; `keyEvents` — ✅. **Geriye kalan** `description` (summary/history/powerSystem/events/themes) → ✅ tam JA/FR — audit düzeltmesi: **lore TAM4 dilli**.

**P2:**
11. `.github/workflows/ci.yml` (lint, build, test) + `deploy-rules.yml` (`firebase deploy --only firestore:rules`).
12. `AppStore.tsx` → `useAuthSlice`/`useWatchlistSlice`/`useSocialSlice`.
13. `eventEngine.ts` → `events/generateLife.ts`, `events/memorial.ts`, `events/worldUnique.ts`, `events/achievements.ts`.
14. `bun.lock` sil (npm tek kaynak).
15. `prefers-reduced-motion` CSS + focus-visible stil seti.

**P3 / ticarileşme:**
16. "1 in 8 Billion" → "AniSync: One Life, Many Worlds" tarzı marka + IP bildirimi sayfası (fani, sponsorluk yok, "inspired by anime").
17. Vercel Pro/Hobby limitleri (cron 2×/gün yeterli); kendi domain (anisync.app) ve KVKK aydınlatma metni.

## 13. Sağlık karnesi (bu tortuya karşı)
**Genel:** C+ / Yayınlanabilir MVP
- Ürün fikri & UX gücü: A-
- Veri canlılığı/şeffaflığı: B+
- **Güvenlik kuralları:** C+ (açık düşüşler kapatıldı bu oturumda; H1 hâlâ)
- **Kod disiplini:** C+ (strict ✓ ama test 2 dosyada)
- **Performans:** B (ilk yükleme yüksek ama code-split decent)
- **i18n:** A- (4 dil tam)
- **Dağıtım:** C+ (cron sahte idi — düzeltildi; CI yok)
- **Yasal/telif:** C (fan proje çerçevesinde kalın, ticariye girmeden önce marka çözümü)

## 14. Sonraki oturum için somut "başla" önerisi
**Önce P0-1 (rules tighten) → P0-3 (fallbackLng) → P0-4 (CI + ESLint).** Bu üçü 2 saatte bitirilebilir ve yayın sinyallerini düzeltir. Sonra P0-2 (Helmet + lang). Bu dörtü **canlıya alınabilir ilk gerçek quality patch** olur.
