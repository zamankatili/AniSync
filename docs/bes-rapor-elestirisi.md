# Beş Raporun Çapraz Denetimi — Üçüncü Görüş

*15 Kasım 2026 · İncelenen: `docs/home-analiz.md`, `docs/kantan-analiz.md`, `docs/automation-blueprint.md`, `docs/sistem-analiz.md`, `docs/rapor-denetimi.md` · Yöntem: her sayısal ve davranışsal iddia **bugünkü kodda** (HEAD `b2eec31`) + `dist/` build artefaktlarında + canlı `r/anime` sayfasında yeniden doğrulandı · Bu belge **kod değiştirmez***

> Bu beş rapor farklı modellerle yazıldı; üçü (home, kantan, automation) bu oturumda benim tarafımdan, ikisi (sistem-analiz, rapor-denetimi) yine benim tarafımdan ama farklı oturumlarda üretildi. Bu belgenin işi **kendi çıktılarım dahil** her iddiayı sorgulamak. Sonuç: raporların büyük çoğunluğu doğru, **dört iddia yanlış/bayat**, ve hepsinin ortak bir kör noktası var (hreflang).

---

## 1. Özet hüküm

| Rapor | Güçlü yön | Zayıf/kör nokta | Puan |
|---|---|---|---|
| `home-analiz.md` | En operasyonel rapor. En yüksek getirili 4 düzeltmeyi doğru sıralamış; üçünü koddan birebir doğruladım | MemeZone için "hata UI yok" demiş → **var** (retry'li); satır numaraları 7 satır kaymış | **9/10** |
| `kantan-analiz.md` | Teknoloji teşhisi (TanStack, Matomo, TTS pipeline, Cloudflare) kanıta dayalı; "yapmayın" listesi dürüst | "AniSync'te hreflang **yok**" → **var ama çalışmıyor**; dolayısıyla 1. öneri ("hreflang ekle") yanlış işi tarif ediyor | **8/10** |
| `automation-blueprint.md` | Altın kural (AI taslak → insan onayı) doğru ve uygulanabilir; katman sıralaması gerçekçi | "Mevcut `polls` yayınla akışı" **yok** — panelde yalnızca 50'lik seed var; challenge bank onayı için veri modeli tanımsız | **7,5/10** |
| `sistem-analiz.md` | En geniş kapsam; KVKK no-op, server trust, AppStore god-context, storage rules — hepsi kanıtlı | Listener sayısı 17→**18**; `users/{uid}` **e-posta tutmuyor** (ifade fazla geniş) | **8,5/10** |
| `rapor-denetimi.md` | 18 maddeyi kanıtla kapattı; bayat metrik tablosu değerli | §2.3 #13 "hreflang ❌ Açık" **yanlış**; "4 limitsiz listener" sayımı düzeltilmeli | **8/10** |

**Ortak sonuç:** Beş raporun hiçbiri `index.html` + `SEOManager` + `PageMeta` üçlüsünü birlikte okumadı. Bu yüzden üçü aynı SEO hatasını farklı yönlerden yanlış yazdı (bkz. §3.1).

---

## 2. Doğrulanan iddialar (kanıtla)

Bunlar artık tartışma konusu değil; tekrar doğrulandı:

| İddia | Kaynak rapor | Kanıt (bugün) |
|---|---|---|
| `forumPosts` sorgusu limitsiz | home-analiz #1 | `AppStore.tsx:137` — `query(collection(db,'forumPosts'), orderBy('createdAt','desc'))`, `limit()` yok (dosyada 0 limit çağrısı) |
| Gizli sekmeler + 3 modal eager import | home-analiz #2 | `Home.tsx:15-17` (3 modal) + `:21-27` (7 bileşen) = 10 statik import |
| `useDailyPicks` cache'siz | home-analiz #3 | `useDailyPicks.ts` yalnız `fetchSeasonalTrendingAnime(24)` (:38); `localStorage/TTL` token'ı yok |
| Ses varsayılanı açık | home-analiz #4 | `RecentActivityFeed.tsx:56` `useState(true)`; ayrıca global `useSoundStore.ts:28,31,38` `enabled: true` |
| Kendi-uid filtresi yok | home-analiz #4 | `RecentActivityFeed.tsx:71` yalnız `change.type === 'added' && !isInitialLoad.current` |
| Home sekmelerinde `aria-pressed` yok | home-analiz §7 | `Home.tsx` içinde `aria-pressed/aria-selected/role="tab"` **0 eşleşme** (aktiflik yalnız `className` ile) |
| "Topluluk Gönderisi" i18n anahtarı değil | home-analiz #8 | `Home.tsx:70` `title: 'Topluluk Gönderisi'` (rapor :63 diyor — 7 satır kayma) |
| `MemeZone` üçüncü-taraf SPOF | home-analiz #4 | `MemeZone.tsx:30` `https://meme-api.com/gimme/animemes/30`, hata yolu yok/var karışık → §3.2 |
| 22 lazy rota, 76/78 lazy görsel | home-analiz §1 | `App.tsx` 22 `lazy(`; `<img` toplam 78, `loading="lazy"` 76 |
| Home 87.1 kB raw / charts ~416 kB | home-analiz §4, rapor-denetimi §5 | `dist/assets`: `Home-CNGbHnlA.js` 87.1 kB, `charts-CMovqZ2z.js` 415.7 kB, `firebase-*.js` 741.2 kB |
| Data dosyası boyutları | automation-blueprint §1 | `characterGuessData.ts` 94.4 KB/1707 satır; `musicQuizData.ts` 64.1/1542; `weeklyChallengeBank.ts` 43.6 KB/1043; `polls.ts` 315 |
| `i18nAdmin` 4 tam dil + parity | rapor-denetimi §2.2 | `i18nAdmin.ts` blok başlangıçları 5/78/151/224; 4 locale × **1899** satır |
| Poll/rating kuralları değer doğrulamıyor | sistem-analiz + rapor-denetimi §3.1 | `rules:125-130` yalnız anahtar kümesi; `rules:164-172` aralık kontrolü var ama **özetle oy arası çapraz kontrol yok** (`totalRatings ≤ 10^9` serbest) |

**Not:** `animeRatings` kuralı `averageRating 0–5` ve `totalRatings int ≥ 0` sınırlarını **koyuyor** — raporun "değerler aralık dışına çıkamaz" cümlesi doğru. Eksik olan aralık değil, **özetin per-uid oylardan türetilmemesi** (tek kişi `totalRatings: 999999999` yazabilir). Bu ayrımı raporda netleştirmek gerekiyor.

---

## 3. Düzeltilmesi gereken iddialar

### 3.1 🔴 hreflang: "yok" değil — **var ama iki katmanda bozuk**

Üç rapor aynı hatayı farklı yönde yaptı:

- `kantan-analiz.md:69` → "hreflang: **Yok** (`og:locale:alternate` sadece OG'de)"
- `kantan-analiz.md:89` → "hreflang alternates **ekleyin**"
- `rapor-denetimi.md` §2.3 #13 → "hreflang ❌ Açık"

**Gerçek:** `index.html:44-49` içinde 5 alternatif **zaten var** (`?lang=en|tr|ja|fr` + `x-default`). Ama çalışmıyor:

1. **Dil parametresi okunmuyor.** `src/i18n.ts:41-52` `LanguageDetector`'ı **yapılandırmasız** kullanıyor. Kurulu sürüm `i18next-browser-languagedetector@8.2.1` varsayılanı `lookupQuerystring: 'lng'` (kaynak: `dist/cjs`, satır 371). `?lang=` hiçbir yerde okunmuyor; `index.html:44`'teki yorum ("LanguageDetector `?lang=` parametresini okur") **yanlış**. Yani dört alternatif URL de aynı dili (tarayıcı/localStorage) sunuyor → hreflang yanlış beyan.
2. **Canonical hedefleri geçersiz kılıyor.** `SEOManager.tsx:117,126` canonical'ı `origin + pathname` olarak üretiyor (query atılıyor). Yani `/?lang=ja` sayfası kendini `/` olarak canonicalize ediyor; Google "her hreflang hedefi kendine canonical olmalı" kuralı gereği alternatifleri **yok sayar**. Ayrıca hreflang etiketleri statik olduğu için `/discover`, `/dle` gibi tüm rotalarda ana sayfanın alternatiflerini beyan ediyor.

**Doğru iş (S–M):** ya (a) `i18n.ts`'e `detection: { lookupQuerystring: 'lang', order: ['querystring','localStorage','navigator','htmlTag'] }` ekle **ve** canonical'a dil parametresini dahil et, ya da (b) hreflang blokunu kaldırıp "tek canonical + `html lang`" ile dürüst kal. Şu hâli en kötü seçenek: **yanlış sinyal**.

> Ders: SEO iddiası üç dosyada birlikte doğrulanmalı — `index.html` (statik), `SEOManager` (dinamik), `PageMeta` (detay). Bu turda `PageMeta.tsx:66` yalnız `og:locale` üretiyor, hreflang yok.

### 3.2 🟠 MemeZone: hata UI'sı **var**, rapor bayat

`home-analiz.md:110` "şimdilik sadece boş liste basıyor" diyor. Gerçek: `MemeZone.tsx:97-107` `fetchError || memes.length === 0` dalında başlık + açıklama + **"Yeniden dene"** butonu var; `:24` `fetchError` state'i, `:46` `catch` bloğu mevcut. Yani "hata UI ekle" maddesi **zaten yapılmış**.

Kalan geçerli kısım: (a) üçüncü-taraf SPOF, (b) her ziyaretçinin `meme-api.com`'a doğrudan isteği (gizlilik), (c) Reddit içeriğinin lisans/atıf belirsizliği. **Öneri "proxy/statik küratörlü set" olarak kalmalı**, "hata mesajı ekle" olarak değil.

### 3.3 🟠 automation-blueprint: "mevcut anket yayınla akışı" yok

`automation-blueprint.md:16` ("Admin panelinden yayınla") ve `:52` ("mevcut `polls` yayınla akışına — yeni UI gerekmez") **yanlış**. `AdminPage.tsx`'te anketle ilgili tek işlem:

- `:138-152` `seedPolls()` → `SEED_POLLS + generateMorePolls(35)` = 50 dokümanı `poll_${i}` id'siyle `merge:true` yazar (idempotent seed)
- `:356-360` panel başlığı "Günün Anketi" + açıklama "50 anketlik havuzu **bir kez** yükler" + buton "Anketleri Seed'le (50)"

Yani **tek tek anket yayınlama, düzenleme, silme, AI önerisini onaylama yolu yok.** `firestore.rules:119` yorumu ("içerik admin tarafında yayınlanır") de bu yüzden gerçeği aşıyor: kural izin veriyor, **arayüz yok**. B1 maddesi "yeni UI gerekmez" değil, **"yayın akışı inşa edilmeli"** olarak düzeltilmeli.

### 3.4 🟠 Challenge bank: onay paneli için veri modeli tanımsız + XP istemcide

`automation-blueprint.md:37,56` doğru kuralı koyuyor ("admin onayı olmadan `weeklyChallengeBank`'a yazılmaz") ama:

- `weeklyChallengeBank.ts` **statik TS** (1043 satır, `WEEKLY_50_CHALLENGE_BANK` :136). AI taslağının "yayınlanması" bugünkü mimaride **kod değişikliği + deploy** demek — panelden yapılamaz.
- `firestore.rules` içinde `challenges`/`weeklyChallenge` koleksiyonu **yok** (0 eşleşme).
- Cevaplar `useWeeklyChallengeStore` (zustand + `persist`) ile **yalnız localStorage**'da; sunucu doğrulaması yok.

Sonuç: (a) onay paneli için önce `challengeDrafts` + `challengeBank` Firestore şeması + runtime merge gerekir; (b) oyun XP'si istemcide hesaplandığı için **değiştirilmiş istemci istediği XP'yi yazabilir** — `sistem-analiz.md`'nin "server trust yok" bulgusunun oyun ayağı. Raporda ikisi de eksik.

### 3.5 🟡 Sayı düzeltmeleri

| Rapordaki | Gerçek | Kanıt |
|---|---|---|
| "17 abonelik, 4'ü limitsiz" | **18** `onSnapshot` / 10 dosya; `limit()` içermeyen **6** listener | `AnimeComments` 1, `AppStore` 3, `useDailyPoll` 1, `useRemoteConfig` 1 |
| "`users/{uid}` e-posta sızdırıyor" | Dokümanda **e-posta yok**: `name`, `handle`, `photoURL` | `AppStore.tsx:192-196` |
| "21 rota" (a11y) vs "22 lazy rota" | **22 lazy component**, **30 `<Route>`** (2 redirect + wildcard), 22 sayfa dosyası | `App.tsx` |
| "`Home.tsx` 516 satır" | 517 | dosya ölçümü |
| "4 sayfa a11y taraması" | Raporun kendi §7'si "4 sayfa + `/`" diyor; karışık ifade | home-analiz §7 |

`users` düzeltmesinin önemi: sızıntı **e-posta adresi değil**, e-postanın `local-part`'ından türetilen `handle` + `role` + `ban`. Yine de daraltılmalı (`rules:92` `read: if true`), ama teşhis doğru konmalı.

### 3.6 🟡 Yeni bulgu: sitemap dil alternatifi taşımıyor, `lastmod` bayat

`public/sitemap.xml` 20 satır, 13+ rota, **hiçbirinde `<xhtml:link rel="alternate" hreflang>` yok** ve tüm `lastmod` değerleri `2026-11-13`. hreflang düzeltilirse sitemap'in de eşlenmesi gerekir; aksi hâlde iki ayrı sinyal çelişir. Bu, beş raporda da yok.

---

## 4. Beş raporun ortak kör noktası

| Kör nokta | Neden görünmedi |
|---|---|
| **SEO sinyalleri üç dosyaya dağılmış** | Her rapor tek dosyaya baktı (`SEOManager` veya `index.html`); çelişki ancak ikisi birlikte okununca çıkıyor |
| **"Yapıldı" ile "arayüzü var" farkı** | `automation-blueprint` kural iznini (`rules`) yayın akışı sanmış; `AdminPage` okunmamış |
| **Oyun ekonomisinin sunucu tarafı** | `sistem-analiz` XP/karma'yı genel yazdı; challenge/quiz XP'sinin **localStorage'da** olduğu ayrıca yazılmadı |
| **Doküman ≠ davranış** | `index.html:44` yorumu "okur" diyor, kod okumuyor — hiçbir rapor yorumu koda karşı test etmedi |

---

## 5. Reddit incelemesi

### 5.1 `r/anime` — canlı gözlem (girişsiz erişildi)

Sayfa metninden doğrudan çıkan mekanikler:

1. **Otomatik bölüm tartışması botu (`AutoLovepon`).** Her bölüm için tek şablon:
   ```
   <Seri> - Episode N discussion
   Reminder: Please do not discuss plot points not yet seen or skipped in the show.
   Streams: <yasal platform>
   Show information: Livechart · MyAnimeList · AniList · AniDB · Anime-Planet · Kitsu · Official Site
   All discussions · Episode Link 1..N
   This post was created by a bot. ... source code on GitHub.
   ```
   Bu, topluluğun **taşıyıcı kolonu**: elle küratörlük değil, **standartlaştırılmış otomasyon**.
2. **Sabit haftalık/günlük thread'ler:** "Anime Questions, Recommendations, and Discussion — November 15, 2026" (günlük) ve "Casual Discussion Fridays — Week of November 13, 2026" (45 oy / ~2B yorum).
3. **Flair taksonomisi:** `News`, `Official Media`, `Episode`, `Movie`, `Batch`, `Meta`, `Clip`, `Merchandise`, `Fanart/Cosplay`, `Spoiler` — kural 3 "flair posts correctly" ile zorunlu.
4. **Spoiler sözdizimi:** `[Spoiler source] >!spoiler!<`; kaynak başlığı zorunlu; başlıkta spoiler yasak; ihlal → ban.
5. **Turnuvalar:** Best Girl / Best Seiyuu / Best ED / Best Guy bracket'ları + arşiv.
6. **Kural seti ürün özelliği gibi:** "Answered questions will be removed", "merch in Daily thread", "no bots/novelty accounts", "no link shorteners", "no crowdfunding" — her kural bir moderasyon akışına karşılık geliyor.
7. **Ölçek:** 2008'den beri, ~1,7 Mn üye; sidebar'da megathread/wiki/watch-order/rewatch/arşiv bağlantıları.

**AniSync'e uyarlanabilir 6 mekanik (dürüst emek tahminiyle):**

| Mekanik | AniSync karşılığı | Emek | Dürüstlük notu |
|---|---|---|---|
| Otomatik bölüm thread'i | `airingSchedule` + AniList `nextAiringEpisode` → `forumPosts` `category:'episode'` + spoiler bayrağı | M | Stream linki **verilemez** (yasadışı); yalnız "yasal nerede izlenir" + MAL/AniList/Livechart |
| Standart şablon | Tek `EpisodeThreadTemplate` bileşeni; bilgi linkleri kanonik ID'lerden | S | Linkler AniList/MAL API'sinden; uydurma yok |
| Flair taksonomisi | `ChatCafe` TABLES + `category` enum'unu genişlet (`episode`, `news`, `clip`, `meta`) | S | Zaten altyapı var |
| Haftalık tekrar eden thread | `DailyPromptCard` → otomatik Cuma sohbet gönderisi | S–M | Zamanlanmış yazma = sunucu tarafı (Vercel cron) gerekir |
| Spoiler sözdizimi | `[kaynak] >!...!<` render eden `SpoilerText` bileşeni + kural metni | S | `guidelines` sayfası zaten var, kural eklenebilir |
| Bracket/turnuva | `polls` altyapısı | M | Önce §3.3'teki yayın akışı şart; bugün yalnız seed var |

**Stratejik ders:** `r/anime`'in kalitesi moderasyon kahramanlığından değil, **bot + şablon + taksonomi + görünür kural** üçlüsünden geliyor. Bu, `automation-blueprint.md`'nin B katmanını doğruluyor; ama sıralamayı değiştiriyor: **önce şablon + taksonomi (S), sonra AI taslak (L).**

### 5.2 `u/Ok_Radio_9283/communities` — erişilemedi

- Bağlantı **giriş duvarına** yönlendiriyor: `/login/?dest=.../communities/...`.
- Public profil (`/user/Ok_Radio_9283/`) açılıyor ama **1 karma, 0 katkı, 1 yıl** — ilgi alanı çıkarılamaz.
- Denenen yollar: doğrudan `fetch` (403), `about.json` (403), `old.reddit.com` (boş), `r.jina.ai` proxy (403), uygulama içi tarayıcı (login duvarı).

**İstediğim:** topluluk listesinin **ekran görüntüsü** veya subreddit adlarının listesi (örn. `r/anime`, `r/manga`, `r/AnimeFigures`). Adlar yeterli — her biri için "ne uyarlanır" analizini ayrı yaparım. Kullanıcı adından ilgi çıkarımı **yapmıyorum** (spekülasyon olur).

---

## 6. Güncellenmiş birleşik plan (5 rapor + Reddit)

Önceki plana göre **değişen 3 madde** işaretli:

| # | İş | Kaynak | Boy | Değişiklik |
|---|---|---|---|---|
| 1 | Firestore rules test suite (emulator, 12 senaryo, CI) | rapor-denetimi §6 | M | — |
| 2 | Güvenlik başlıkları (CSP/HSTS/XFO/nosniff/Referrer-Policy) | sistem-analiz §4.4 | S | — |
| 3 | `refresh-news` secret zorunlu + `?refresh=true` auth | sistem-analiz §4.8 | S | — |
| 4 | `storage.rules` + avatar MIME/boyut doğrulama | sistem-analiz §4.5 | S | — |
| 5 | `users/{uid}` read daraltma (public profil ayrı doküman) | sistem-analiz §4.11 | S–M | Teşhis düzeltildi: e-posta değil, handle/rol/ban |
| 6 | `forumPosts` `limit(50)` + `startAfter` + `animeComments` limit | home-analiz #1 | S | Kapsam genişledi (animeComments) |
| 7 | **hreflang'i düzelt veya kaldır** + canonical dil parametresi + sitemap eşleme | §3.1 (yeni) | S–M | **Yön değişti**: "ekle" → "düzelt" |
| 8 | Anket yayın/düzenleme/onay akışı (seed'in ötesinde) | §3.3 (yeni) | M | **Yeni iş**: "yeni UI gerekmez" yanlıştı |
| 9 | Challenge: Firestore `challengeDrafts` + sunucu doğrulamalı XP ya da "yalnız cihazda" dürüst etiketi | §3.4 (yeni) | M–L | Yeni |
| 10 | Gizli sekmeler + 3 modal → `React.lazy`; `useDailyPicks` 24h cache | home-analiz #2/#3 | S–M | — |
| 11 | MemeZone → proxy/statik küratörlü set (hata UI zaten var) | §3.2 | M | Kapsam daraldı |
| 12 | Reddit deseni: bölüm thread şablonu + flair genişletme + spoiler bileşeni | §5.1 | S–M | Yeni |
| 13 | Kural düzeyi bütünlük (poll votes değeri, rating özeti, `likes == likedBy.length`) | sistem-analiz §3.1 | M–L | — |
| 14 | AppStore bölme + memo; limitsiz listener'ları sayfalama | sistem-analiz §4.6/§4.9 | L | Sayı düzeltildi (18) |
| 15 | KVKK otomatik silme (Admin SDK) | sistem-analiz §4.1 | L | — |

**Sıralama önerisi:** 1 → 2 → 3 → 4 → 6 → 7 → 10 → 12. İlk sekizi tek sprintte, hepsi S–M; hiçbiri yeni altyapı (service account) gerektirmiyor. 8/9/13/15 sunucu tarafı kararları bekliyor.

---

## 7. Dürüst sınırlar

- Tüm doğrulamalar **statik kod + build artefaktı + canlı Reddit sayfası** üzerinden yapıldı. İmzalı oturumda anket yayınlama, oda onayı, admin paneli **denenmedi**.
- `dist/` artefaktları 14 Kasım build'inden; kod 15 Kasım'da değişmediği için geçerli, ama yeni build'de sayılar kayabilir.
- Lighthouse bu ortamda Performance kategorisi vermiyor; performans iddiaları bundle/asset ölçümüyle sınırlı.
- Reddit topluluk listesi giriş duvarı arkasında; kullanıcı listesi paylaşmadan analiz edilemez.
- Bu belge bir **anlık görüntüdür**. Çürümemesi için §6'daki maddeler otomatik kapılara bağlanmalı (rules test suite, `verify:seo` script'i: `?lang=` gerçekten dil değiştiriyor mu + canonical/hreflang tutarlı mı).
