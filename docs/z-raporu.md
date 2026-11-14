# AniSync — Z Raporu (Kapanış / Performans Raporu)

*14 Kasım 2026 · Hazırlayan: optimizasyon oturumu sonu özeti · Kapsam: `anisync-tau.vercel.app` (üretim) ve yerel `master` / `main`*

---

## 0. Özet (TL;DR)

Bu oturumda uygulamanın **performans yolu** (görseller, service worker, kod bölme, yığılım/bundle sağlığı) ve **erişilebilirlik** (Lighthouse a11y 0.87 → **1.00**) birlikte çalışıldı. Üretim sitesi ölçümlü ve dürüst şekilde iyileşti; uydurma metrikler sunulmadı.

| Ölçüm | Önce (üretim) | Sonra (üretim) |
|---|---|---|
| Lighthouse Accessibility **21 rota** | 0.87–1.00 | **1.00 (hepsi)** |
| Lighthouse Best Practices ×21 | 1.00 | 1.00 |
| Lighthouse SEO ×21 | 0.8–1.00 | **1.00 (hepsi)** |
| Lighthouse **Performance** | **ölçülemedi** | **ölçülemedi** |
| Test | 202/202 | **204/204** |

"Performance" kategorisi bu ortamdaki araç tarafından hiç raporlanmıyor (aşağıda "Bilinen Sınırlar" maddesine bak). Bu yüzden perf iyileştirmeleri *dolaylı ama ölçülebilir vekâletler* ile kanıtlanmıştır: bundle boyutları, lazy görsel oranı, SW cache stratejisi, ağ sayımı.

---

## 1. Değişenler (bu oturumun iki commit'i)

### `7457fa7` — perf: image lazy-loading, SW image cache, a11y pass
- **76/78 `<img>`** `loading="lazy" decoding="async"` oldu. Bilinçli 2 istisna:
  - DLE afişi (`BlurredImage` posteri) — MVP görülü oynanışında anında görünmeli;
  - Ana sayfa "günün seçimi" kapağı — LCP/above-the-fold görseli, eager bırakıldı.
- **`public/sw.js` v2 → v3**: kabuk (`anisync-shell-v3`) olduğu gibi korundu (navigate network-first, statik varlıklar cache-first, `/api/` ve Firebase dokümomundan uzak). Yeni `anisync-images-v1`: MAL/AniList/YouTube/Unsplash CDN görselleri için cross-origin cache, **~300 girişlik yaklaşık FIFO** sınırıyla (aşırı dolumda en eski anahtarlar silinir). Opaque yanıtlar (no-cors kapaklar) önbelleğe alınır; hata fırlatılsa bile uygulama etkilenmez.
- **A11y (1. dalga)**: Home composer ikon butonlarına `aria-label`; sidebar metin `text-neutral-400 → 300` (kontrast); Home + `OtakuLevelBadge` başlıkları `<h3> → <h2>`; dil dropdown'unun erişilebilir adı artık görünür kısaltmayı içeriyor (`Language: TR` — WCAG 2.5.3 Label in Name); GlobalChat göndere/ile mesaj inputu ve gönder butonuna erişilebilir ad.
- Docs senkronu: Iconic Scenes sayfaları **15 sahne / 10 seri** (önceki 14/9 metni güncellendi).

### `f1fb5cb` — a11y: readable ink on accent surfaces, heading order on Home
- **`getReadableTextColor(hex)`** (`src/lib/utils.ts`): WCAG luminance karşılaştırmasıyla siyah/beyaz metin seçer. Dawn amber `#f59e0b`, twilight fuchsia `#d946ef`, midnight cyan `#06b6d4` üstünde beyaz metin **~2.1–3.5:1** (AA başarısız); rose `#e11d48` üstünde beyaz (4.75:1) doğru. Kullanım yerleri:
  - Desktop sidebar logo kutusu ("A") ve aktif nav öğesi (accent arka plan + beyaz metin → okunabilir mürekkep),
  - Mobil alt barda aktif öğe ikonu/etiketi ve mobil logo kutusu,
  - ThemeSwitcher "KİLİTLİ" rozeti ve "check" işareti (elle yazılmış `id === 'dawn' || id === 'midnight'` ternerleri bu yardımcı ile değiştirildi),
  - Birim testleriyle kilitlendi (2 yeni test; toplam **204**).
- **Başlık sırası (2. dalga)**: Home'a komşu bileşenlerin bölüm başlıkları (`QuickContinueWatching`, `DailyPromptCard`, `TodayAiringWidget`) ve `RecentActivityFeed` satır başlıkları sekanslı seviyelere taşındı (`<h2>` bölümler; sıra atlama yok).

---

## 2. Ölçüm detayı (dürüst)

### 2.1 Lighthouse (üretim, tek koşu)
**`/` (ana sayfa):**
- **0.87 (önce)**: hatalar → `button-name` ×2 (Home composer ikon butonları), `color-contrast` ×1 (sidebar nav rozeti), `heading-order` ×1, `label-content-name-mismatch` ×1 (dil dropdown).
- **0.94 (1. dalga sonrası)**: kalanlar → `color-contrast` (accent üstünde beyaz metin), `heading-order` (QuickContinueWatching başlığı).
- **1.00 (2. dalga sonrası, `f1fb5cb` deploy'u, prod SW v3 canlı doğrulandı)**: **sıfır hata**.

**Diğer taranan sayfalar (aynı gün):**
- `/` 0.87 → **1.00**
- `/discover` 0.93 → **1.00** (`SimilarAnimeFinder` submit butonu)
- `/calendar` 0.87 → **1.00** (ikon-only `goToAnime` butonu `aria-label={anime.title}`; seçili gün hücresinde `neutral-400 → neutral-700` kontrast; `h1→h3` atlama düzeltmesi — section h2'ler, grid kart başlığı h3)
- `/lore` 0.95 → **1.00** (`neutral-500 → neutral-400` küçük metinler)
- `/dle` 0.94 → **1.00** (kilitli ipucu metni `neutral-600 → neutral-400`; `ChallengeInviteBox` h4 → h2)
- `/challenge` 0.92 → **1.00** (`neutral-500 → neutral-400`; `ChallengeInviteBox` h4 → h2; rozet başlığı h4 → h2)
- `/music-quiz` 0.95 → **1.00** (günlük açılım çipleri: sayı metni duruma göre `text-black/white`, `opacity-40 → border-white/10`)
- `/voice-duel` 0.95 → **1.00** (`neutral-500 → neutral-400`)
- `/text-adventure` 0.89 → **1.00** (`<dl>` yeniden yapılandırıldı: `progressbar` dl dışına alındı; `definition-list`/`dlitem` temizlendi; `neutral-500 → neutral-400`)
- `/list` 0.98 → **1.00** (`MyListStatusDonutChart` h3 → h2, kart başlığı h4 → h3; MyList başlıkları h2/h3 hiyerarşisiyle h1 altına dizildi)
- `/media/1` SEO 0.80 → **1.00** (detay sayfaları artık loading/error dallarında da `<PageMeta>` ile geçici açıklama basar — `MediaDetail` ve `AnimeDetail`)
- `/profile`, `/watch-party`, `/lists`, `/scenes`, `/arcade`, `/anime-life-sim`, `/privacy`, `/terms`, `/guidelines`, `/grid-maker`, `/anime/1`: tarandı, hata yok — zaten **1.00**.

**Toplam: 21 rota × (a11y + BP + SEO) → hepsi 1.00.**

> Not: Lighthouse skorları koşudan koşuya oynar; 0.87 → 0.94 → 1.00 tek koşuluk değerlerdir, "her zaman 1.00" iddiası değildir.

### 2.2 Lighthouse **Performance kategorisi yok**
Bu oturumda kullanılan Lighthouse aracı `performance` kategorisini ve perf auditlerini (FCP/LCP/speed-index/TTI vb.) hiç raporlamıyor — `categories` çıktısı yalnızca `accessibility`, `best-practices`, `seo` içeriyor. Bu yüzden gerçek kullanıcı deneyim metrikleri (özellikle LCP) **bu raporun ölçümleri arasında yoktur**. Performans etkisi, aşağıda sayfaları/asset'leri ve kod yolundan doğrulanır.

### 2.3 Bundle (yerel build, `vite build` — 2026-11-14)
| Parça | Boyut |
|---|---|
| `index-*.js` (uygulama) | ~776.7 kB (önceki ölçümle +0.8 kB; a11y etiket maliyeti) |
| `firebase-*.js` | 741.2 kB |
| `charts-*.js` (recharts) | 415.7 kB |
| `AnimeLifeSim-*.js` (rota) | 324.1 kB (yalnızca `/anime-life-sim` ziyaretinde) |
| `index-*.css` | 133.9 kB |
| `motion-*.js` | 126.4 kB |
| Dil chunk'ları | ja 110.4 · fr 101.9 · tr 97.6 · en 91.7 kB |

Yapı: `manualChunks` (react/firebase/motion/charts/i18n) + **22 rota `React.lazy`** üzerinden kod bölünür; ilk boyda yalnızca shell + gerekli chunk'lar iner. Üretim hash'leri yerelleşmeye göre farklıdır (Vercel bake ortam değişkenleri), boyutlar aynı mertebededir.

### 2.4 Ağ / yükleme yolu
- `index.html`: fontlar ve MAL CDN için `preconnect` (ANA sayfa kapakları hemen paralel iner).
- Kapak görselleri: artık lazy + async decode; 2 izinli eager görsel dışında görsel ağda blokçu değil.
- SW v3 `anisync-images-v1`: tekrar ziyaretlerde kapaklar **cache-first** → mobilde görünür kazanç (kapaklar ~200–300 sorumlu asset).

---

## 3. Doğrulama kapıları (hepsi yeşil)

| Kapı | Sonuç |
|---|---|
| `npm run lint` (tsc --noEmit) | temiz |
| `npm run lint:eslint` | **0 hata** (485 uyarı — tümü eski/izinli `react-hooks/exhaustive-deps` kalıpları) |
| `npm run test` (vitest) | **204/204** (23 test dosyası) |
| `npm run build` | ✓ (API bundle + vite + server.cjs) |
| `npm run verify:api` | `api/` diff **yok** (yalnızca committed bundle'lar) |
| CI (GitHub Actions) | `7457fa7`: `43633490622` (main) / `43633487089` (master) **success**; `f1fb5cb`: `43634341467` (main) / `43634337356` (master) **success** |
| Üretim deploy | Vercel auto-deploy; `Last-Modified 19:53:33Z`; `sw.js` içeriğinde `anisync-shell-v3` + `anisync-images-v1` doğrulandı |

---

## 4. Bu tur dışında bırakılanlar (bilinçli)

- **`api/` dokunulmadı** — verify:api değişiklik yok (build hash'leri committed bundle ile uyumlu).
- DLE afiş deneyimi (skeleton/poster) ve `BlurredImage` primitifinin kendisi; yalnızca `loading` davranışı korundu.
- `AniSync-main/` klasörü bu raporun kapsamı dışında (kullanıcı direktifi: yalnızca `app/`).

---

## 5. Bilinen sınırlar ve dürüst notlar

1. **Performance kategorisi ölçülemedi** (araç çıktısında yok). Gerçek LCP/FCP/INP değerleri ölçülmedi; "2.3s mobil" gibi iddialar yoktur — yalnızca bundle/asset/cache vekâletleri.
2. **Lighthouse sürebilirliği**: tek koşu. 0.87→1.00 iyileşmesi gerçek düzeltmelere dayanır (liste §1); skorun kalıcılığı CI'de izlenmiyor (Lighthouse CI kurulmadı).
3. **Bundle hâlâ ağır**: `firebase` 741 kB + ana chunk ~777 kB. İlerisi: `firebase/app` → modüler seçilmiş importlar (`auth`/`firestore` zaten), haber feed'i gibi sayfalarda daha ince bölme, `recharts`'ı yalnızca profil analizinde dinamik import, font subset'leri, lucide ikon tree-shake doğrulaması. Tahmini ek kazanç 150–250 kB; bu turda risk/etki dengesi nedeniyle dokunulmadı.
4. **SW görsel cache'i yaklaşık FIFO**: `cache.keys()` sırası spesifikasyon garantisi olmayan implementasyona bağlı; "yaklaşık 300 giriş" davranışı iyi niyetlidir. Depolama kotası aşımında `.put()` reddedilirse sessizce yutulur.
5. **Opaque (no-cors) yanıtlar cache'lenir**; boyutları ve `status 0` olmaları sorun değil ama `Content-Type` doğrulaması yapılamaz — yanlış ana bilgisayardan gönderilen her şey görsel sayılır (host allowlist daraltır, risk düşük).
6. **XP liderlik tablosu client-yazarıdır**: Firestore kuralları `xpTotal`'ın harici doğrulanmasını engellemez; "cheat-proof" değildir (mevcut durum `docs/xp.md`'de belgelendi). Gerçek çözüm Admin SDK + `dataRequests` hattı; bu oturumda mümkün değildi.
7. **Yapılandırılmamış ortamlar**: `GEMINI_API_KEY` (Vercel) yok — AI önerileri fail-closed; App Check reCAPTCHA anahtarı yok; `FIREBASE_TOKEN` olmadan kurallar CI ile deploy edilemiyor (elle deploy hâlâ mümkün).
8. **Gerçek kullanıcı izleme yok**: GA4 consent-gated ve env-gated; `web-vitals` paketi entegre değil. LCP şikâyetleri ancak RUM ile görülürdü — önerilen ileriki adım.
9. **a11y 1.00 axe-tarzı sezgisel taramadır**; ekran okuyucu ile manuel görev testi bu oturumda yapılmadı.
10. **Duygusal/performans işlek yollar**: ana sayfada hâlâ 10+ ağır bileşen aynı anda mount olabilir (`MultiMediaHub`, `CommunityPulse` vb.) — sanal listeleme (`Virtuoso`) gibi yapısal iyileştirmeler scope dışı kaldı.

---

## 6. Sonraki adımlar (öneri)

1. **Lighthouse CI** ekle (`@lhci/cli` tüm PR'larda a11y < 0.95 ise fail) — skor geri kaymasın.
2. **web-vitals** (INP/LCP) gönderimi GA4 consent ardına; özellikle mobil 3G'de hero LCP ölçümü.
3. **Büyük paket refaktoru**: recharts'ı profil sayfasında lazy'e al (+~400 kB rota dışı), i18n chunk'larını sadece ziyaret dilini yükleyecek şekilde işaretlemeyi doğrula.
4. **SW cache monitörü**: storage kullanımını telemetriye logla (kota aşımı erken uyarısı).
5. **XP anti-cheat**: Firebase Admin SDK sidecar'ı (`/api/award-xp`) — client'ın `users/{uid}.xpTotal`'a doğrudan yazmasını kapat; kurallarda `xpTotal` yaz-engeli.
6. **Smoke testi genişlet**: üretim için sentetik akış (ev → filtre → XP kazan → `/scenes` modal → geri) — şu an elle doğrulandı, otomasyon yok.
7. **Tarama kapsamı tamamlandı**: 21 rota × (a11y + BP + SEO) hepsi **1.00** (2026-11-14, deploy `cbd3a12`). Yine de bu axe-tarzı sezgisel bir taramadır; ekran okuyucuyla manuel görev testi yapılmadı ve dinamik alt sayfaların tamamı (örn. tüm `/anime/:id`) örneklemlendi.

---

## 7. Değişiklik günlüğü (bu oturum)

| Commit | İçerik |
|---|---|
| `f743121` | Iconic Scenes: resmî kanallardan 15 video embed, 15/15 kart, oEmbed doğrulamalı (bu raporun hemen öncesi) |
| `7457fa7` | perf: image lazy-loading, SW v3 + görsel cache, a11y 1. dalga, docs 15 sahne senkronu |
| `f1fb5cb` | a11y: okunabilir mürekkep (accent), Home başlık sırası, `getReadableTextColor` + testler |
| `90f63e4` | a11y: SimilarAnimeFinder canlı arama `submit` butonu erişilebilir ad (Discover 0.93 → 1.00) |
| `e7fed2b` | docs: bu Z raporu |
| `ca45526` | docs: Z raporu 4 sayfa a11y 1.00 senkronu |
| `cbd3a12` | a11y: full-page pass — calendar/lore/challenge/DLE/music-quiz/voice-duel/text-adventure/MyList/`/media/*` ve `/anime/*` hata ve loading dallarına `<PageMeta>` fallback (21 rota × 3 kategori → 1.00) |

**Durum: yayında.** Üretim SW `anisync-shell-v3` + a11y 1.00 doğrulandı (19:53Z deploy).
