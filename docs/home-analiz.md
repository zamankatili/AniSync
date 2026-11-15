# AniSync Ana Sayfa — Derinlemesine Analiz Raporu

*15 Kasım 2026 · `src/pages/Home.tsx` (516 satır) ve 15 bileşeni · `/` rotası (üretim: `anisync-tau.vercel.app`)*

> Kapsam: **analiz ve öneri raporu** — bu belge kod değiştirmez; bulgular düzeltme için değerlendirilmelidir. Ölçüm: `npm run build` artefaktları + Firebase/Firestore kaynakları + 2026-11-14 Lighthouse (a11y/BP/SEO = 1.00).

---

## 1. TL;DR

Ana sayfa **mühendislik olarak sağlam, tasarım olarak iddialı** ama iki yapısal sorun var:

1. **Yük dengesiz**: `/` rotası uygulamanın en ağır girişi. `Home-*.js` 87.1 kB raw (20.2 kB gzip) + ana chunk (151 kB gzip) + firebase (182 kB gzip) ile birlikte iner. Gizli sekmelerde yaşayan bileşenler (`MultiMediaHub`, `AnimeNewsFeed`, `MemeZone`) ve 3 modal (~50 kB kaynak) ana pakette eager parse ediliyor — yalnızca bir tıkla görünür olmalarına rağmen.
2. **Firestore forumPosts sorgusunda `limit()` yok** (`AppStore.tsx:137`): her ziyaretçi tüm zamanların her gönderisini indirir. Kullanıcı tabanı büyüdükçe doğrusal şişer; bu tek satırlık düzeltme ana sayfanın en yüksek etkili optimizasyonu.

Buna karşılık: görseller `lazy`/`decoding=async` (76/78), a11y 1.00, kod bölme (22 lazy rota, 20+ ayrı rota chunk'ı), canlı veri rozetli dürüst boş durumlar — hepsi yerinde.

---

## 2. Sayfa mimarisi (envanter)

```
<Layout>                      ← sidebar + header; aktif rota accent'e göre renklenir
  <Home>                      ← 16 bileşen + 3 modal + 2 store
    ├─ <h1> home              ← tek h1; alt bölümler h2 (a11y düzeltildi)
    ├─ Sekme çubuğu (5): feed* | activity | multimedia | memes | news
    ├─ Mobil widget rayı (lg:hidden, yatay scroll): poll / challenge / music-quiz / watch-party / taste
    ├─ main (max-w-2xl):
    │    feed sekmesi: Composer (Form→addForumPost) → QuickContinueWatching
    │      → CommunityPulse → RecentActivityFeed(compact) → [Günlük Seçim] kartı
    │    activity:  RecentActivityFeed (tam boy)
    │    multimedia: MultiMediaHub
    │    memes:     MemeZone
    │    news:      AnimeNewsFeed
    └─ aside (lg+): Live-stream CTA · Günlük anket (aktif/boş) · Music Quiz teaser
         · Watch Party teaser · TodayAiringWidget · 50-Challenge widget
         · Taste Profiler teaser · OtakuLevelBadge (XP) · DailyPromptCard
```

**Veri ve durum:**
- Global: `useAppStore` (auth, forumPosts, watchlist, `users/{uid}`), `useToastStore`, `useThemeStore`, `useXpStore`, `useWeeklyChallengeStore`, `useReminderStore`
- Lokal: `activeTab`, composer state, `useDailyPicks(1)` (Günlük Seçim)
- Live listener'lar: `forumPosts` (AppStore, **limitsiz**), `recentActivities` (RecentActivityFeed, `limit(25)` — sınırlı ✓)

---

## 3. Bileşen karnesi (kaynak boyutu + dist ölçümü)

| Bileşen | src | dist (raw / gzip) | Ne yapar | Mount | Veri kaynağı |
|---|---|---|---|---|---|
| `RecentActivityFeed` | 35.2 KB | Home'a gömülü | "X listeye ekledi" canlı akış; `onSnapshot`, 25 kayıt; neo-chime uyarısı | feed'de compact, activity'de tam | Firestore `recentActivities` (public-read ✓ rules) |
| `MultiMediaHub` | 31.0 KB | 20.2 / 4.5 kB (ayrı chunk — Discover ile paylaşılıyor) | Manga/manga+LN arama, favori karakterler, Steam oyunları, kişisel kitaplık (localStorage) | yalnızca multimedia sekmesi | AniList GraphQL + steam search API + localStorage |
| `CommunityPulse` | 20.7 KB | Home'a gömülü | Topluluk akışı (watch status/review/collection/discussion), oluşturma modalı | feed sekmesi | `useAppStore.forumPosts` (global listener) |
| `TasteProfileSurveyModal` | 19.2 KB | Home'a gömülü | "Otaku DNA" anketi → zevk profili | prop-open | lokal/`personal` skor hesaplama |
| `DailyPollModal` | 16.2 KB | Home'a gömülü | Günlük anket oylama | prop-open | `useDailyPoll` (Firestore `polls` dinler) |
| `DailyChallengeModal` | 14.4 KB | Home'a gömülü | 50 soruluk haftalık challenge açar | prop-open | `useWeeklyChallengeStore` (localStorage) |
| `FeedPost` | 15.4 KB | Home'a gömülü | Gönderi kartı (beğeni/yorum/rapor) | listede | forumPosts üzerinden |
| `AnimeNewsFeed` | 12.4 KB | 11.7 / 4.3 kB (ayrı chunk — FanLore ile paylaşılıyor) | Anime haber akışı; 12 saatte bir auto-refresh + manuel | yalnızca news sekmesi | `/api/anime-news` (sunucu) |
| `QuickContinueWatching` | 11.2 KB | Home'a gömülü | +1 bölüm takip çubuğu | feed | watchlist (AppStore) |
| `TodayAiringWidget` | 7.3 KB | Home'a gömülü | Bugün yayınlananlar; canlı veri + statik fallback + "stale" rozeti | aside | `fetchLiveScheduleForDay` |
| `MemeZone` | 6.4 KB | Home'a gömülü | Anime meme grid | yalnızca memes sekmesi | **üçüncü taraf** `meme-api.com/gimme/animemes/30` |
| `OtakuLevelBadge` | 6.4 KB | Home'a gömülü | XP/seviye rozeti + günlük 100 XP hedef çubuğu | aside | `useXpStore` (localStorage scoped) |
| `DailyPromptCard` | 3.0 KB | Home'a gömülü | "Günün sorusu" kartı → composer'a doldurur | aside | günlük soru havuzu |
| `useDailyPicks(1)` | — | Home'a gömülü | AniList sezon trendlerinden günün seçimi (gün-index'li kayan pencere; tür eşleşmesiyle kişiselleştirme) | feed mount | AniList GraphQL (`fetchSeasonalTrendingAnime(24)`) |

**Toplam Home-path kaynak:** ~210 KB (Home.tsx + bileşenler); kritik ilk boy (yalnız feed): ~120 KB.

---

## 4. Ölçülen yük (build, 2026-11-14)

| Artefakt | Raw | Gzip | Yükleme |
|---|---|---|---|
| `Home-CNGbHnlA.js` | 87.1 kB | **20.2 kB** | `/` ziyaretinde (lazy route) |
| `MultiMediaHub-*.js` | 20.2 kB | 4.5 kB | statik import — Home ile birlikte |
| `AnimeNewsFeed-*.js` | 11.7 kB | 4.3 kB | statik import — Home ile birlikte |
| `index-*.js` (ana) | 457.2 kB | 151.0 kB | her rota |
| `firebase-*.js` | 741.2 kB | 182.3 kB | her rota (auth+firestore+storage) |
| `index-*.css` | 133.9 kB | ~22 kB | her rota |

Görsel: 76/78 `<img>` lazy+async; tek eager → Günlük Seçim kapağı (bilinçli LCP seçimi). Ana sayfada 11 `<img>` etiketi.

---

## 5. Ağ ve Firestore maliyeti (deploy edilen regraslardan doğrulandı)

| Kaynak | Kural | Mount | Gözlem |
|---|---|---|---|
| `forumPosts` | `read: if true` | **her ziyaret, her rota** | `query(collection, orderBy('createdAt','desc'))` — **limit YOK**. Her doc add/update'te tüm set yeniden akar (diff'li ama şişen taban). |
| `recentActivities` | `read: if true` | RecentActivityFeed mount (home) | `limit(25)` ✓ sınırlı; public-read; create = kendi uid'si (spam engelli) |
| AniList GraphQL | açık API | News/Multimedia/Günlük Seçim | Günlük Seçim cache yok; 24 kayıt/istek; hata → kart sessizçe gizlenir |
| `/api/anime-news` | kendi API'miz | news sekmesi | 12h `setInterval` + mount |
| `meme-api.com` | üçüncü taraf | memes sekmesi (lazy görünür) | SPOF + gizlilik: her ziyaretçi bu IP'ye istek atar (reklamsız, ama güvenilmez) |
| `scripts`: `addDoc` ×3 | ✅ kurallar `userId == auth.uid` | list-add akışları | Yazma maliyeti kullanıcı başına ~3 |

**Okuma yükü (kabaca):** forumPosts limitsiz → 100 post ≈ 100 read/ziyaretçi; 10.000 post ≈ 10.000 read/ziyaretçi. `limit(50)` ile sabitlenir.

**Canlı uyarı:** RecentActivityFeed banner + neo-chime **her** `added`'de çalar — başkasının listesi de dahil, kendi eklemeniz de (kendi-uid filtresi yok, `isInitialLoad` yalnızca ilk snapshot'ı kapatır). `soundEnabled` varsayılanı **açık**.

---

## 6. Bulgular — öncelik sırasıyla

### 🔴 Kritik
1. **`forumPosts` sorgusu limitsiz** (`src/context/AppStore.tsx:137`). Etki: maliyet + UI jitter + liste render (1000+ `FeedPost` render edilir!). **Fix:** `query(..., orderBy('createdAt','desc'), limit(50))` + feed'de "daha fazla yükle" (cursor pagination, `startAfter`). ~1 satır + UI.

### 🟠 Yüksek
2. **Gizli sekmelerin ve modal'ların eager import'u** (`Home.tsx:13-27`): `MultiMediaHub`, `AnimeNewsFeed`, `MemeZone`, `RecentActivityFeed`, `CommunityPulse`, `QuickContinueWatching`, `TodayAiringWidget`, `DailyPollModal`, `DailyChallengeModal`, `TasteProfileSurveyModal` — hepsi statik. **Fix:** `React.lazy` + `Suspense` yalnızca `activity|multimedia|memes|news` sekmeleri ve 3 modal için → ~50-55 kB raw (~11 kB gzip) ilk boydan çıkar; parse/execute düşer. Bugünkü kazancı küçük ama katlanarak büyür (feature eklendikçe).
3. **`useDailyPicks` cache yok** (`hooks/useDailyPicks.ts`): her mount'ta AniList GraphQL'e gider. **Fix:** `localStorage`'da `anisync_dailypicks_v1`, 24h TTL + `nonce` sadece manuel refresh'te → tekrar ziyaretlerde ~0 istek.
4. **MemeZone üçüncü-taraf SPOF** (`MemeZone.tsx:30`): `meme-api.com` kesintisinde sekme ölü körlenir + her ziyaretçinin isteği o IP'ye görünür. **Fix:** `try/catch` + hata durumunda "memes şu an ulaşılamıyor" mesajı (şimdilik sadece boş liste basıyor); orta vadede statik curated meme seti veya `/api/memes` proxy.
5. **Live "listeye ekledi" uyarısı — kendi-uid filtresiz** (`RecentActivityFeed.tsx:71`): kendi eklemelerinizde de banner + chime. **Fix:** `change.doc.data().userId === currentUser?.uid` ise uyarma (kendi davranışınız feed'a yine yansır, sadece "canlı alarm" çalmaz). Ses varsayılanını da **kapalı** yapın (KVKK/nezaket + gürültü).

### 🟡 Orta
6. **Sidebar aşırı kalabalık** (9 widget; xl'de bile katman katman): kullanıcı tarafında seyrek etkileşim ölçümü yok → GA4 `home_widget_cta` olayı ekleyin; kullanılmıyorsa daraltın.
7. **Composer misafire görünür**: gönder tıklaması `chat_login_required` toast'u ile kesiliyor — iyi (içerik yazılmaz) ama daha iyi: toast yerine satıra auth CTA ("Oturum aç → paylaş").
8. **"Topluluk Gönderisi" sabit Türkçe** (`Home.tsx:63`): i18n anahtarı değil; yeni dillerde İngilizce/Japonca gönderi bu başlıkla doğar. `new_forum_post` anahtarına taşıyın.
9. **MultiMediaHub mount'ta 3 burst** (`useEffect` ×3 → manga+novels, karakterler, Steam `loadGames('anime')`): sekmeye tıklayan herkese 3-4 istek. **Fix:** yalnızca ilgili sekme aktif olunca tetikle (aktif tab state'ine bağla) + sonuçları 1 saate kadar `localStorage`'da tut.
10. **`RecentActivityFeed` ziyaret başına 2 snapshot**: feed compact'tan activity sekmesine geçince unmount/remount → tekrar `limit(25)` okuma. **Fix:** sekme geçişinde `compact` prop'unu değiştirmek yerine aynı instance'ı render edin (koşulsuz tek instance + layout varyantı) ya da `sessionStorage` ile son listeyi saklayın.

### 🟢 Düşük
11. `h1` `whitespace-pre-wrap` + yalnızca `{t('home')}` — kısa; alt başlık/synopsis yok (SEO başlığı zaten `SEOManager`'da — sorun yok).
12. Feed sekmesi uzun kaydırma: composer + QCW + Pulse + RecentActivity + Günlük seçim — hero dedup'ı (Günlük Seçim tekrarı, Pulse içinde zaten benzer kart) tartışılabilir.
13. `MemeZone`/`RecentActivityFeed` görsel `onError` fallback'leri mevcut ✓; `QuickContinueWatching` afişleri de `handleImageError` ✓.
14. Firestore dinleyicileri misafirde de açık (`recentActivities`, `forumPosts`) — kurallar `read: if true` olduğu için çalışır ama **okumayan misafire de okuma masrafı yazar**; misafirde feed'i "son 20 gönderi (sayfalı kapasiteyle)" olarak localStorage'dan statik göstermek maliyeti düşürür.

---

## 7. Erişilebilirlik & SEO

- a11y 1.00 (2026-11-14, 4 sayfa taraması + `/` yeniden ölçümü). Ana sayfaya özgü: 5 sekme butonunda `aria-pressed` yok (yalnızca `bg` ile aktiflik bildiriliyor) — **kolay kazanç**, screen reader fark edemez.
- Başlık hiyerarşisi: `h1` → `h2` (widget başlıkları) → `h3` (kart) ✓ sıralı; `OtakuLevelBadge` h2'ye taşındı.
- Görseller `alt`'lı; avatar `alt="Me"` → profil adına çevrilebilir.
- SEO: `/` başlığı/açıklaması `SEOManager`'dan; OG görseli MAL CDN'den (sıcak link; CDN giderse kırık) → `public/og-home.webp` ile yerelleştirme önerilir. JSON-LD `WebSite` mevcut.

## 8. Mobil

- `lg:hidden` yatay kayan widget rayı ✓, alt mobil nav ✓, `hide-scrollbar` ✓, `safe-area-*` ✓.
- Composer min-h 60px, dokunma hedefleri ≥44px ✓.
- Mobilde 5 sekme + 5 chip + feed sırası yoğun; ilk ekranda composer + 2 blok makul, `TodayAiringWidget`'ın "bugün" kartı mobilde de kritik — şu an **sadece aside'da** (mobilde yok!); mobil widget rayına eklenebilir.

---

## 9. Önerilen eylem planı (etki / emek)

| # | İş | Etki | Emek |
|---|---|---|---|
| 1 | `forumPosts` → `limit(50)` + `startAfter` pagination | maliyet + render | S |
| 2 | Gizli sekmeler (`activity|multimedia|memes|news`) + 3 modal → `React.lazy` | ilk boy / parse | S-M |
| 3 | Günlük Seçim: 24h TTL localStorage cache | istek sayısı | S |
| 4 | Live aktivite uyarısı: kendi-uid'yi dışarıda bırak; ses varsayılan kapalı | UX/maliyet | S |
| 5 | Sekme butonlarına `aria-pressed` / `aria-selected` (tablist deseni) | a11y | S |
| 6 | "Topluluk Gönderisi" → i18n anahtarı | i18n | XS |
| 7 | MultiMediaHub isteklerini aktif sekmeye bağla + 1h cache | istek sayısı | M |
| 8 | GA4 `home_widget_cta` + sekme açılış olayı | ölçüm | S |
| 9 | MemeZone: hata durumu UI + (orta vade) `/api/memes` proxy / statik set | SPOF/gizlilik | M |
| 10 | OG ana görselini `public/` ile yerelleştir | SEO dayanıklılık | XS |

## 10. Yapılmayanlar (bu rapor yalnız analizdir)

- Kod değiştirilmedi. 204 test, build, CI durumu etkilenmedi.
- "Günlük Seçim" algoritması (gün-index kayan pencere + tür filtresi) ve poll/challenge store sözleşmesi gözden geçirilmedi — ayrı analiz tercih edilebilir.
