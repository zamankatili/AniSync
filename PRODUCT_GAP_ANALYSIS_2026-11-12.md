# AniSync — Ürün Boşluk Analizi ve Ürün Geçişi (2026-11-12)

> **Hedef okuyucu:** DeepSeek ve sonraki geliştiriciler.
> **Kapsam:** `C:\Users\semih\Documents\Qoder\anisync\app` — bu turda yapılan ürünleşme geçişi.
> **İlke:** Uydurma veri yok. Canlı olmayan her şey ya boş durum ya da açıkça "küratörlü / örnek / kaynaklı" etiketiyle gösterilir.

Bu belge, 10 Kasım denetiminin (`SYSTEM_AUDIT_2026-11-10.md`) üzerine **12 Kasım ürün turunu** ekler: ne düzeltildi, ne hâlâ eksik, hangi kapılar geçti.

---

## 1. Bu turda kapatılan ürün boşlukları

| # | Boşluk | Çözüm | Dosya |
|---|---|---|---|
| 1 | Life Sim tek tip ilerleme hissi veriyordu; her evren aynı "seviye atla" akışıydı. | Her evrene özgü **5 kademeli rütbe merdiveni** (Naruto'da Akademi → Genin → Chunin → Jonin → Kage/Yonko; Night City'de Street Kid → Runner → Edgerunner → Night City Legend → Beyond the System vb.) + her evrene bir **imza ikilemi**. | `src/data/universePaths.ts`, `src/lib/eventEngine.ts` |
| 2 | Life Sim HUD'unda "hangi rütbedeyim, sıradaki ne?" görünmüyordu. | HUD'a dünya rütbesi, yüzdelik ilerleme ve sıradaki eşik paneli; memorial (ölüm) ekranına son rütbe kartı. | `src/pages/AnimeLifeSim.tsx` |
| 3 | Ses efektleri keskin/rahatsız ediciydi (0.18–0.3 gain, triangle sweep'ler, anlık atak). | Paylaşılan **yumuşak ses motoru**: yalnızca sine/triangle, yumuşak atak, master tavan ≈0.085. Eski elle yazılmış chime'lar kaldırıldı. | `src/lib/gentleAudio.ts`, `src/lib/synthAudioPlayer.ts`, `src/store/useReminderStore.ts`, `src/components/RecentActivityFeed.tsx`, `src/components/QuickContinueWatching.tsx` |
| 4 | Ses aç/kapat ve ses düzeyi kalıcı değildi. | `useSoundStore`: localStorage'da kalıcı `enabled + volume`; Life Sim'de anahtar + kaydırıcı. | `src/store/useSoundStore.ts` |
| 5 | "Kim bu karakter?" yalnızca Madoka Magica kliplerine bağlıydı; telif ve tek seri riski. | **İki mod**: (a) resmi Madoka Exedra klipleri, (b) **İpucu Tanıma** — 16 seriden **37 karakter**, dört dilli ipucu, ses yok. Mod başına ayrı en iyi skor. | `src/pages/VoiceDuel.tsx`, `src/data/characterGuessData.ts` |
| 6 | KÖŞE sohbetinde gün ayrımı, arama ve "kaldığın yer" yoktu. | Gün ayırıcıları, oda içi mesaj arama, "son ziyaretinden beri" ayırıcısı + sayaç, en sona atla, gönderim başarısızsa taslağı geri koyma, oda değişince aramanın sıfırlanması. | `src/components/GlobalChat.tsx` |
| 7 | "Zoro neden üç kılıç kullanıyor?" gibi soruların yeri yoktu; kullanıcı bunu sohbette soruyordu. | **Anime Bilgisi** sayfası: 27 kaynaklı, dört dilli, spoiler etiketli küratörlü kayıt; kategori filtresi + arama; canlı sektör haberleri ayrı akışta. | `src/pages/FanLore.tsx`, `src/data/fanLore.ts`, `/lore` rotası, `fan_lore` menü maddesi |
| 8 | Yeni metinler 4 büyük locale dosyasına dağılıyor, parity testi kırılıyordu. | Yeni anahtarlar `src/i18nProductPass.ts` içinde dört dilde; `src/i18n.ts` ve `locales.test.ts` çalışma anında birleştiriyor. | `src/i18nProductPass.ts`, `src/i18n.ts`, `src/i18n/locales/locales.test.ts` |

### Tek tek doğrulanabilir davranışlar

- **Life Sim ikilemleri** dünya olay kimliği öneklerine uyar (`shonen_`, `df_`, `isekai_`, `cyber_`, `seinen_`, `romance_`, `sports_`, `sol_`) — böylece "fidelity" puanlaması bozulmaz. `universePaths.test.ts` bunu zorlar.
- **Simülasyon içeriği kanon iddiası değildir.** Ekranda bunu söyleyen metin vardır; rütbeler o evrenin *hissini* taşır, resmî sıralama değildir.
- **Voice Duel İpucu modu** ses çalmaz; telif riski yoktur. Şıklar her turda karışır, doğru cevap şıklarda korunur (`characterGuessData.test.ts`).
- **Fan Bilgisi** kayıtları kaynak etiketi + bağlantı taşır; spoiler'lar varsayılan gizli, tek tek veya toplu açılır.
- **KÖŞE araması** yalnızca açık oda içinde çalışır; oda değişince arama terimi ve paneli sıfırlanır.

---

## 1b. 13 Kasım ek turu — "Kayıp Bölüm" + giriş sağlamlaştırma

Bu turda iki iş yapıldı: (a) tür araştırması yapılıp **özgün** bir metin macera oyunu eklendi, (b) Google girişinde popup engellenen ortamlar için yönlendirme yedeği eklendi.

| # | Boşluk | Çözüm | Dosya |
|---|---|---|---|
| 9 | "Zork gibi metin macera oyunlarını araştır, entegre et" isteği karşılanmamıştı. | **"Kayıp Bölüm"** — 7 odalı, 8 eşyalı, 3 sonlu, dört dilde özgün parser macera. Zork/Infocom metni, haritası veya bulmacası kopyalanmadı; yalnızca türün tasarım dersleri uygulandı. | `src/data/textAdventure.ts`, `src/lib/textAdventureEngine.ts`, `src/pages/TextAdventure.tsx`, `docs/text-adventure-research.md` |
| 10 | Parser oyunları yeni başlayanı kaybediyor (görünmez fiiller, ceza veren hata mesajları, çıkmaz). | Ekranda **komut çipleri** + yön çipleri, dört dilli eşanlamlılar ve Türkçe ek eşleşmesi ("feneri", "sandığa"), bağlama duyarlı **iki kademeli ipucu**, suçlamayan hata metni, `kaydet`/`yükle`/`yeniden`, klavye geçmişi (↑/↓), `aria-live` günlük, harita/envanter/ilerleme panelleri. | `src/pages/TextAdventure.tsx`, `src/lib/textAdventureEngine.ts` |
| 11 | Mobilde sabit alt gezinme + radyo paneli komut alanını kapatabiliyordu; komut çipleri 31 px'di (44 px dokunma hedefi altında). | Çipler **44 px**, sayfaya alt boşluk (`pb-32`), günlük yüksekliği `38dvh`, odaklanınca komut alanı ekran ortasına kayıyor. 390 ve 320 px'de yatay taşma yok, çipler yatay kayıyor. | `src/pages/TextAdventure.tsx` |
| 12 | Google girişi yalnızca popup ile çalışıyordu; popup engelleyen tarayıcı/WebView'de giriş tamamen düşüyordu. | `auth/popup-blocked`, `operation-not-supported-in-this-environment`, `web-storage-unsupported` hatalarında `signInWithRedirect` + dönüşte `getRedirectResult`. Kullanıcı popup'ı kendisi kapatırsa yönlendirme başlatılmaz. | `src/context/AppStore.tsx` |

### Metin macera — doğrulanan davranışlar

- Uçtan uca oynanış (tarayıcıda, TR): fener → tornavida → otomat → sandık/dolap → arşiv (karanlık → pil) → kaset+not → projektör → bant → merdiven → `şifre 471` → çıkış holü → **üç son** (`sakla`, `sil`, `bırak`). İlerleme %100, son kartı çiziliyor, konsol hatası yok.
- Karanlık arşivde ışık yokken `al kaset` reddediliyor; merdiven eski anahtar olmadan, kuzey kapısı kod olmadan açılmıyor.
- `kaydet` → başka odaya git → `yükle` odayı/envanteri geri getiriyor; bozuk kayıt çökme yerine "kayıt yok" diyor.
- Dört dilde aynı içerik: TR/EN/JA/FR komutlar ve eşanlamlılar tek motorda birleşiyor (`textAdventureEngine.test.ts`).
- Zorluk dengesi: küçük harita, sınırlı fiil seti, ilerlemeli ipucu — Zork'un "tahmin etme, keşfet" dersinin uygulanabilir kısmı. Araştırma notu: `docs/text-adventure-research.md`.

---

## 1c. 13 Kasım P0 turu — SEO tek kaynak, ban yaptırımı, admin denetim izi

Bu turda üç P0 açığı kapatıldı: çift meta etiketi, kozmetik ban ve izsiz admin işlemleri.

| # | Boşluk | Çözüm | Dosya |
|---|---|---|---|
| 13 | Detay ve oyun sayfalarında **iki `<title>`, iki canonical, iki description** vardı; generic olan kazanabiliyordu. | Tek meta kaynağı `PageMeta`: başlık, açıklama, canonical, OG/Twitter, `og:locale`, `noindex` ve JSON-LD birlikte yazılır. `SEOManager` kendi meta'sını yazan rotaları atlar (`/anime/*`, `/media/*`, `/arcade`, `/lore`, `/text-adventure`, `/challenge`, `/anime-life-sim`, `/dle`). | `src/components/PageMeta.tsx`, `src/components/SEOManager.tsx`, `src/lib/seoRoutes.ts`, 8 sayfa |
| 14 | `/lists` robots'ta engelliydi, sitemap 9 eski URL'deydi, `/lore` ve `/text-adventure` yoktu; `/profile` kuralı herkese açık profilleri de kapatıyordu. | Sitemap 15 gerçek rotaya çıkarıldı (`lastmod 2026-11-13`); robots'ta `/lists` ve `/profile/` açıldı, yalnızca `/profile$` kapalı. Eski `/anisyncdle` → `/dle`, `/polls` → `/challenge` yönlendirmesi. | `public/sitemap.xml`, `public/robots.txt`, `src/lib/seoRoutes.ts`, `src/App.tsx` |
| 15 | Ban yalnızca admin tablosunda bir sayıydı; kurallar `banUntil` okumuyordu, banlı kullanıcı SDK ile yazmaya devam ediyordu. | `isBanned()` / `canWrite()` kuralları: banlıyken yorum, sohbet, gönderi, oda, oy, puan, parti mesajı yazımı reddedilir. Kişisel takip/liste ve KVKK veri talebi açık kalır. İstemcide `users/{uid}` canlı dinlenir, `Layout` kısıt bandı gösterir. | `firestore.rules`, `src/context/AppStore.tsx`, `src/types.ts`, `src/components/Layout.tsx`, `src/i18nProductPass.ts` |
| 16 | `reports` create "imzalı herkes" idi: `reportedBy` sahtelenebilir, not sınırsız, sebep serbestti. | Rapor: `reportedBy == uid`, sebep allowlist, not ≤500, etiket ≤300, bilinen alanlar; banlıyken rapor yazılamaz. | `firestore.rules` |
| 17 | `chatRooms` create yalnızca alan biçimine bakıyordu; Kalfa kapısı istemcideydi. | Doğrudan oda için kural düzeyinde **500 XP** eşiği. Karma hâlâ istemcide hesaplandığı için bu bir hız tümseği, güvenlik sınırı değil — gerçek çözüm güvenilir uç nokta/Admin SDK. | `firestore.rules`, `src/lib/rooms.ts` |
| 18 | Rol verme/alma arayüzü yoktu; `adminActions` tanımlı ama hiç yazılmıyordu. | Admin panelinde rol seçici (yalnız admin; kendi rolünü düşürmesi engelli). Ban/unban, rol değişimi, rapor arşivleme, içerik silme ve KVKK tamamlama `adminActions`'a yazılır; kayıtlar admin/moderatör okur, güncelleme/silme admin-only. | `src/pages/admin/AdminPage.tsx`, `src/i18nAdmin.ts`, `firestore.rules` |

### Bu turda doğrulananlar

- `/anime/16498`, `/arcade`, `/lore`, `/text-adventure`, `/challenge`, `/dle`: **tek** canonical, **tek** description, **tek** `og:title`; başlık sayfaya özel.
- `/profile`: `noindex, follow`; `/anisyncdle` istemcide `/dle`'a yönleniyor.
- `/lists`, `/calendar`, `/voice-duel`: yeni meta kaynağından başlık/açıklama alıyor (`voice-duel` anahtarları dört dilde eklendi).
- Sitemap/robots ile rota haritası `seoFiles.test.ts` ile kilitlendi; kendi meta'sını yazan sayfada ikinci `<Helmet>` kalırsa test kırılır.

---

## 1d. 14 Kasım turu — sosyal bot önizlemeleri + yerel sitemap tek kaynak

| # | Boşluk | Çözüm | Dosya |
|---|---|---|---|
| 19 | Discord/X/WhatsApp/Telegram botları JS çalıştırmadığı için `/anime/:id` ve `/media/:id` paylaşımları hep **generic AniSync kartı** gösteriyordu. | Bot UA'ları `vercel.json`'da `/api/og` fonksiyonuna yönlendiriliyor; fonksiyon AniList (gerekirse Jikan yedeği) kaydını çözüp başlık, özet, kapak, canonical, OG/Twitter ve `og:locale` içeren **meta-only HTML** döndürüyor. Tüm değerler kaçışlanır; görsel yalnızca `https:`. Kayıt bulunamazsa dört dilli dürüst genel kart. | `server/api/og.ts` (→ `api/og.js`), `src/lib/ogMeta.ts`, `src/lib/ogRender.ts`, `vercel.json` |
| 20 | Bot HTML'i aynı URL'de CDN'e düşerse tarayıcıya SPA yerine bot HTML'i servis edilebilirdi (cloaking/zehirlenme). | Tüm OG yanıtları `Cache-Control: no-store`, `Vary: User-Agent, Accept-Language`, `X-Robots-Tag: noindex, nofollow`; HTML içinde canonical + `noindex`. Yalnızca sosyal/önizleme botları eşlenir; Googlebot/Bingbot bilinçli olarak hariç. | `server/api/og.ts`, `vercel.json`, `src/lib/ogMeta.ts` |
| 21 | Yerel `server.ts` içindeki dinamik `/sitemap.xml` üretimdeki statik dosyadan farklı 8 eski rota (`/list`, `/grid-maker`, `/watch-party`...) ve 30 anime URL'i döndürüyordu; `npm start` ile canlı arasında SEO farkı oluşuyordu. | Yerel rota artık `PUBLIC_SITEMAP_ROUTES`'tan üretiliyor; statik dosya, rota haritası ve yerel sunucu tek kaynak. Drift testi `PUBLIC_SITEMAP_ROUTES` kullanımını ve eski rotaların yokluğunu doğruluyor. | `server.ts`, `src/lib/seoRoutes.ts`, `src/lib/seoFiles.test.ts` |
| 22 | **Canlıda gizli kırık uç nokta:** Vercel bu projede (Next.js değil) `api/games/[appid].ts` gibi dinamik fonksiyon adlarını yönlendirmiyor; `/api/games/123` SPA `index.html` döndürüyordu. Aynı tuzak ilk OG tasarımını da vurdu. | Dinamik dosya adları kaldırıldı: `server/api/games/appid.ts` + `vercel.json` rewrite `/api/games/:appid(\\d+)` → `?appid=:appid`; OG için tek `server/api/og.ts` + `?kind=&id=` rewrite'ı. Test, `api/` altında `[param]` dosya adı kalırsa kırılır. | `server/api/games/appid.ts`, `server/api/og.ts`, `vercel.json`, `src/lib/seoFiles.test.ts` |

### Bu turda doğrulananlar

- Yerel `GET /api/og/anime/16498` (yol tabanlı) ve üretim `GET /api/og?kind=anime&id=16498` (rewrite query'si) → 200, `X-Og-Fallback: 0`, `<title>Attack on Titan - AniSync</title>`, doğru kapak ve canonical `/anime/16498`.
- `GET /api/og?kind=media&id=anilist:154587` (`Accept-Language: en`) → `Frieren: Beyond Journey's End`, `<html lang="en">`, `og:locale en_US`, canonical `/media/anilist:154587`.
- `GET /api/og/anime/zzz` → 200, `X-Og-Fallback: 1`, genel İngilizce kart, canonical `/` (ölü bağlantı önizlemesi boş kalmıyor).
- Birim testleri: 34 yeni test (27 OG biçimlendirme/çözümleme + 7 SEO/Vercel yönlendirme: rewrite sırası, arama motoru botlarının hariç tutulması, yerel/uzak sitemap tek kaynağı, dinamik `api/[param]` dosya yasağı ve Steam detay rewrite'ı).
- Kapılar: `tsc` temiz, ESLint 0 hata, **17 dosya / 143 test**, üretim derlemesi başarılı.

---

## 1e. 14 Kasım turu — sunucu fonksiyonlarını ön-paketleme (üretim geneli 500 arızası)

Canlı doğrulama sırasında OG kartının hâlâ `500 FUNCTION_INVOCATION_FAILED` döndüğü görüldü ve kök neden yalnızca OG değildi: **bu Vercel kurulumu (Next.js olmayan proje) `api/` altındaki TypeScript dosyalarının göreli import'larını paketlemiyor.** İzole probe fonksiyonlarıyla kanıtlandı:

| Probe | İçerik | Canlı sonuç |
|---|---|---|
| `api/probe-inline.ts` | Hiç import yok | 200 JSON |
| `api/probe-import.ts` | Yan dosyadan `./probe-shared` import | **500** |
| `api/probe-src.ts` | `../src/lib/seoRoutes` import | **500** |

Yani `api/anime-news`, `api/refresh-news`, `api/translate`, `api/moderate-room`, `api/ai-recommendations`, `api/og` ve Steam detay uç noktaları canlıda tamamen kırıktı; yalnızca hiç import kullanmayan `api/games/search.ts` çalışıyordu.

| # | Boşluk | Çözüm | Dosya |
|---|---|---|---|
| 23 | Fonksiyonların göreli import'ları üretimde çözülmüyor; her uç nokta 500 veriyor. | Fonksiyon kaynakları `server/api/**` altına taşındı. `scripts/build-api.mjs` (esbuild, ESM, `target: node20`, `packages: external`) her kaynağı **tek dosyalık, kendi kendine yeten** `api/**/*.js` paketine derliyor. `api/` artık yalnızca üretilmiş `.js` içerir; `.ts` ve `[param]` dosya adı yasak. | `scripts/build-api.mjs`, `server/api/**`, `api/**`, `package.json`, `eslint.config.js`, `src/lib/seoFiles.test.ts` |
| 24 | Üretilen paketler commit'lendiği için kaynak ile paket sessizce ayrışabilirdi. | `npm run build` önce `build:api` çalıştırıyor. CI'da `npm run build:api && git diff --exit-code -- api` adımı paket bayatsa kırmızı oluyor. `seoFiles.test.ts` ayrıca `api/` ile `server/api/` dosya kümesinin birebir eşleştiğini doğruluyor. | `.github/workflows/ci.yml`, `src/lib/seoFiles.test.ts` |

### Bu turda doğrulananlar

- `node api/og.js` doğrudan çalıştırıldı: `anime/16498` → `fallback=0`, `Attack on Titan - AniSync`; yol tabanlı `media/anilist:154587` + `ja` → `葬送のフリーレン`; geçersiz kimlik → `fallback=1`; tüm yanıtlarda `Cache-Control: no-store, max-age=0`.
- Üretilen 8 pakette göreli `import`/`require` kalmadığı `Select-String` ile doğrulandı.
- Kapılar: `tsc` temiz, `eslint src server/api server.ts --quiet` 0 hata, **17 dosya / 141 → 143 test**, `npm run build` exit 0.

---

## 1f. 14 Kasım oturumu — "Kim Bu Karakter?" içeriği büyüdü

- **İpucu Tanıma** 37 → **86 karakter**; öne çıkan seriler artık Naruto / One Piece / Attack on Titan / Jujutsu Kaisen / Demon Slayer / My Hero Academia / Dragon Ball / Death Note / FMA / Frieren / Spy×Family / Re:Zero vb. Zorluklar AniList popülerliğini izler; dört dilli ipucu + dört şık; `characterGuessData.test.ts` yeşil.
- **Ses Düellosu (resmî klipler)** 11 → **18 klip**: MAPPA CHANNEL resmî Chainsaw Man “Character PV” dizisi (Denji, Power, Pochita, Aki, Himeno, Kobeni, Makima) eklendi; Madoka karakter klipleri korunur. Her klip `docs/voice-sources.md` tablosunda kanal + videoId + segment (00:00–00:18) + zorlukla belgeli. Not: isimli resmî karakter-PV formatı (tek karakteri odaklayan, kısa) ses kesimlerinin en başta olmasını pratikte garanti ediyor; yine de kesim seçimi oynanışta teyit edilmedi — bu nedenle her çeyrekte yeniden doğrulama ve gerekirse düzeltme zorunludur.
- UI atfı (`voice_duel_source` tr/en/ja/fr) artık "Madoka Exedra ve MAPPA resmî kanalları" diyor. `voiceDuelData.test.ts` klip bütünlüğünü (tekil id, segment aralığı, 4 dilli ipucu, resmi kanal kapsamı) kilitliyor.
- **Kalan iş**: One Piece / Naruto / Jujutsu Kaisen / Demon Slayer resmî karakter-PV klipleri; biri HATA yaparsa canlı doğrulama yapılmadan commit'lenmeyecek. Yapay ses üretimi/yeniden barındırma asla yok.

---

## 1h. 14 Kasım (ikinci oturum) — karakter sırası, zorluk ve XP ekonomisi

**Karakter oyunları artık hilesiz, karışık ve bilinirlik bazlı.**

- **Sıralama**: `src/lib/characterOrder.ts` — günlük karakter, her `CHARACTERS_POOL.length` günlük döngüde yeniden karışan **deterministik permütasyonla** seçilir (FNV-1a + mulberry32). Aynı gün herkes aynı karakteri görür, döngü içinde tekrar etmez. Antrenman turu ağırlıklıdır: tur 0–1 kolay%70/orta%30, 2–3 %45/%40/%15(zor), 4+ %25/%45/%30. `sort(() => Math.random() - 0.5)` yanlılığı `shuffleWithRng` (Fisher-Yates) ile değiştirildi.
- **Zorluk = bilinirlik**: DLE havuzuna `seriesPopularity` + `characterFame` (1–5) eklendi; `difficulty` artık `difficultyFromFame(fame, popularity)` ile türetiliyor (skor ≥4.5 kolay, ≥3.5 orta, aksi zor). Dağılım 12 kolay / 5 orta / 3 zor. Seçilen karakter türüne göre hak sayısı artar (kolay 6 / orta 7 / zor 8 — ipucu açılışları 1/3 ve 2/3'te).
- **"Kim Bu Karakter?" ipucu modu**: 86'lik havuzdan tur oranları kolay→zor artar (zor ~%25, orta ~%40, kalan kolay) + Fisher-Yates karıştırma; dosya sırası hiçbir zaman görünmez.
- **XP ekonomisi**: `src/lib/xp.ts` — günlük giriş (+10), seri kilometre (3/7/14/30 gün → +10/+25/+60/+150), oyunlar (DLE: kolay 20 / orta 30 / zor 40, kayıp +5; 3/gün), Voice Duel (+10; 3/gün), gönderi (+15; 2/gün), yorum (+5; 4/gün), Fan lore (+5; 6/gün), liste ekleme (+5; 5/gün), Watch Party (+20; 1/gün). **Aksiyon başına günlük tavan + 300 XP global günlük tavan** (aşımı kısmi ödemeyle engellenir). `daily_login:gün` gibi anahtarlarla **idempotent**. Defter scope'ludur; misafir XP'si girişte hesaba taşınır (çakışan anahtarlar bir kez sayılır).
- **Seviye birliği**: `computeOtakuLevel(..., engagementXp)` — toplam XP = izleme karması + etkinlik XP'si; aynı eğri (`level.ts`) ve rütbeler (Misafir→Efsane). OtakuLevelBadge artık toplam XP + günlük hedef çubuğu (100 XP) + seri ikonu gösterir; rozet sayfasında `+N etkinlik XP` satırı vardır.
- **Liderlik tablosu**: Profile sayfasında `XpLeaderboard` — `users.xpTotal desc` ilk 10, "sen" vurgusu, boş durumda dürüst mesaj + giriş yönlendirmesi. Uyarı: **xpTotal istemci-yazılabilir** (kurallar sahip güncellemesine izin veriyor); sıralama rekabet sinyalidir, adalet garantisi değil. Detaylar `docs/xp.md`.
- **Kapsam**: 24 değişen/yeni dosya, **22 dosya / 194 test**, `tsc` temiz, ESLint 0 hata. Tarayıcıdaki canlı oturumda uçtan uca gözlendi: günlük DLE bitişi (`dle_daily:2026-11-14`, L Lawliet orta, +30), antrenman bitişi (+30), günlük giriş (+10) ve günlük hedef çubuğu (70/100 XP) ekranı.

Dürüst sınırlar: liderlik tablosu hileye açık (Admin SDK + kural sıkılaştırması şart); XP salt istemcide hesaplanır; misafir XP'si yalnızca o cihazda; kayıt anahtarları (`anisyncdle_today_v3`) önceki v2 kayıtlarını otomatik temizler (günün karakteri değişti — v3 characterId doğrulaması).

---

## 1i. 14 Kasım (üçüncü oturum) — İkonik Sahneler ve Voice Duel serisi genişletmesi

**"İKONİK SAHNELER" sayfası (/scenes)** yayına eklendi. Editörün seçtiği 15 sahne; her biri 4 dilde bağlam, arc etiketi, kategori (Duygusal 5 / Atmosfer 3 / Aksiyon 7), 15/15 kartta resmî kanal embed'i (youtube-nocookie, `rel=0`, oEmbed-doğrulanmış: Prime Video JP, ONE PIECE Official, Aniplex USA, TOHO animation, アニプレックス, Attack on Titan Official, KADOKAWAanime, MAPPA CHANNEL); kaynaklar `docs/iconic-scenes.md`'de, spoiler düzeyi (Ⅰ/Ⅱ) ve resmî kaynak etiketini taşır. Kart açılışı `scene_view` XP kurallarına dahildir (6/gün, 30 XP). Sayfa `KEŞİFE` menüsüne eklendi, sitemap/SEO testleri senkron kaldı. Alıntılar yalnızca kanonik ve herkesçe bilinen satırlar (örn. "逃げちゃいかんよ", "海賊王におれはなる", "俺が来たぞーーーッ！！", "領域展開——無量空処"); doğrulanamayan satırlar bilinçli olarak boş bırakıldı — uydurma alıntı yapılmadı.

**Voice Duel'den Madoka çıkarıldı, popüler seriler eklendi:**
- 10 Madoka klip kaldırıldı; UI metni ve `docs/voice-sources.md` güncellendi (araç, test senkronu).
- 14 yeni klip **resmî kanallardan** eklendi (oEmbed ile doğrulama yapıldı, doğrulanamayan adaylar elendi): 呪術廻戦 ファントムパレード公式 (Gojo, Nobara, Megumi, Yuta, Naoya, Kenjaku), ONE PIECE Official (Luffy Gear 5, 海賊無双4 Crocodile/Big Mom), アニプレックス チャンネル (Kamado Tanjiro, 冨岡義勇 Giyu, 我妻善逸 Zenitsu, 胡蝶しのぶ Shinobu), Crunchyroll (Orochimaru). Eklenen resmî kanallar belgede listelenir.
- Ses biçi 7'ye 14'e çıktı: 21 klip (Chainsaw Man 7, Jujutsu Kaisen 6, ONE PIECE 3, Demon Slayer 4, Naruto 1).
- **Eklenemeyenler — dürüstçe elendi**: Naruto/Spy x Family/My Hero Academia/Attack on Titan için, ancak "キャラクター紹介映像" niteliğinde resmî klip bulunabildiğinde eklenecek (mevcutlar var ancak doğrulama yapılamayanlar bırakılmadı). TODO.md'de takvimli aksiyon olarak duruyor.
- Madoka-free doğrulama: kaynak testi, `madoka` için locales araması sıfır çıktı; canlıda sayfa metinleri güncel.

Doğrulama: `tsc` temiz, ESLint 0 hata, **23 dosya / 202 test**, build exit 0. Tarayıcıda `/scenes` ve `/voice-duel` doğrulandı (Madoka yok, beş seri görünüyor, konsol temiz).

---

## 1g. 14 Kasım oturumu — ölçüm, hata izleme ve kötüye kullanım koruması

Dört katman eklendi; hepsi **env kapılı** ve varsayılan olarak kapalı. Kurulum adımları `docs/observability.md` içinde.

- **GA4** (`src/lib/analytics.ts`): `VITE_GA4_ID` yoksa hiçbir script yüklenmez. KVKK rıza bandı (`AnalyticsConsent`) olmadan gtag çalışmaz; "Reddet" kalıcıdır. Giden yollar sadeleştirilir (`/anime/16498` → `/anime/:id`), query/hash atılır, olay adları ve parametreleri allowlist ile sınırlı. Reklam sinyalleri kapalı.
- **Aktivasyon dönüşümleri**: `signup` (Google popup/redirect + e-posta), `first_list_add` (misafir/hesap) ve `first_game_finish` (Voice Duel, AniSyncDLE, Life Sim, Text Adventure) tarayıcı başına bir kez gönderiliyor (`trackConversionOnce`). Rıza yoksa gönderilmez ve işaretlenmez.
- **Sentry** (`src/lib/errorReporting.ts`): `VITE_SENTRY_DSN` yoksa no-op. SDK **yalnızca ilk hatada** dinamik indirilir (hata olmayan ziyaretlerde ek paket yok). Global `error`/`unhandledrejection` tamponu 10 hata; `beforeSend` kullanıcı, istek gövdesi, çerez ve query'yi siler. React render hataları `AnimeErrorBoundary` üzerinden `surface: react.errorBoundary` etiketiyle gider.
- **Firebase App Check** (`src/firebase.ts`): `VITE_RECAPTCHA_SITE_KEY` varsa reCAPTCHA v3 sağlayıcısı başlatılır; Capacitor WebView'de bilinçli olarak atlanır. **Enforcement açılmadı** — sıra `docs/observability.md` §3'te.
- **Hız sınırı** (`src/lib/rateLimit.ts`): tüm genel uç noktalar `enforceRateLimit` ile korunuyor. Upstash Redis varsa dağıtık atomik sayaç, yoksa bellek içi (örnek başına, dürüst sınır). Redis hatasında **fail-open**. IP'ler düz metin saklanmaz (FNV-1a). Limitler: news 60, games/search 30, games/:appid 40, og 240, translate 20, moderate-room 20, ai-recommendations 10, refresh-news 6 (dakika). Yerel Express sunucusu (`server.ts`) aynı limitleri uygular; `RATE_LIMIT_DISABLED=1` yalnızca geliştirme içindir.

Doğrulama:

- Paketlenmiş `api/games/search.js` doğrudan çalıştırıldı: aynı IP'den 30 istek 200, sonraki 5 istek 429 + `Retry-After: 60`; farklı IP 200.
- Yerel sunucuda `/api/games/search` → `X-RateLimit-Limit: 30`, `/api/og/anime/16498` → `X-RateLimit-Limit: 240` ve `X-Og-Fallback: 0`.
- Tarayıcıda rıza akışı: script yok → "Reddet" → kalıcı, gtag yok → "Kabul et" (localStorage) → gtag yüklenir, `consent/default`, `config`, `page_view`; `/anime/16498` görüntülemesi `/anime/:id` olarak raporlandı. Konsolda uygulama hatası yok (yalnızca ikinci dev sunucusunun HMR WebSocket uyarısı).
- Kapılar: `tsc` temiz, ESLint 0 hata, **20 dosya / 163 test**, `npm run build` exit 0, `verify:api` commit sonrası yeşil.

Kalanlar (dürüst): GA4 dönüşüm olayları tarayıcı bazlı bir kez gönderiliyor ama GA4'te "conversion" olarak işaretlenmedi ve sunucu tarafı tekilleştirme yok; Sentry source map yüklemesi yok; App Check enforcement kapalı; alarm/alert politikası ve kalıcı sunucu logu yok; hız sınırı IP bazlı (uid kotası için Admin SDK şart).

---

## 2. Doğrulama kapıları (12–13 Kasım 2026, bu çalışma ağacı)

| Kapı | Komut | Sonuç |
|---|---|---|
| TypeScript (strict) | `npx.cmd tsc --noEmit` | ✅ exit 0 |
| Testler | `npm.cmd test -- --run` | ✅ **20 dosya / 163 test** |
| Üretim derlemesi | `npm.cmd run build` | ✅ exit 0 (route-level code splitting korunuyor) |
| ESLint | `npx.cmd eslint src --quiet` | ✅ 0 error (uyarılar önceden var olan stil uyarıları) |
| Firestore kuralları | `firebase.cmd deploy --only firestore:rules --project folkloric-centaur-q6tp2` | ✅ derlendi ve yayınlandı (14 Kasım 2026) |

Yeni test dosyaları:

- `src/data/universePaths.test.ts` — 8 dünya, 5 rütbe, ikilem önekleri, ilerleme kırpma.
- `src/data/characterGuessData.test.ts` — 86 karakter, 20+ seri, 4 benzersiz şık, dört dilde ipucu/not.
- `src/data/fanLore.test.ts` — 24+ kayıt, kategori/kaynak/çeviri bütünlüğü, üç dilde arama, spoiler dağılımı.
- `src/data/textAdventure.test.ts` — 7 test: dört dilde oda/eşya/son/ipucu bütünlüğü, tekil kimlikler, ulaşılabilir harita, eşyaların yerleşimi, fiil eşlemesi.
- `src/lib/textAdventureEngine.test.ts` — 15 test: üç sona giden tam yürüyüş, karanlık arşiv, kilitli kapılar, yanlış kod, dört dilde komut, kaydet/yükle ve bozuk kayıt, ipucu kademeleri, durum değişmezliği.
- `src/lib/seoFiles.test.ts` — 14 test: sitemap rota kümesi ve `lastmod`, özel/eski rotaların sitemap'e sızmaması, robots kuralları, kendi meta'sını yazan her sayfada `<PageMeta>` olması ve ikinci `<Helmet>` bulunmaması, bot OG rewrite'larının sırası ve arama motoru botlarını hedeflememesi, yerel `/sitemap.xml`'in ortak rota haritasından üretilmesi, `api/` altında yalnızca üretilmiş `.js` bulunması, `[param]` dosya adı yasağı, `server/api` ↔ `api` dosya kümesi eşleşmesi, Steam detay rewrite'ı.
- `src/lib/analytics.test.ts` — 9 test: kapalıyken no-op, rıza varsayılanı, yol sadeleştirme, olay adı/parametre allowlist, dönüşüm tekilleştirme.
- `src/lib/errorReporting.test.ts` — 4 test: DSN yokken no-op, kullanıcı/istek/breadcrumb temizliği.
- `src/lib/rateLimit.test.ts` — 7 test: IP hash, başlık önceliği, limit/retry hesabı, pencere sıfırlama, varsayılan limitler.
- `src/lib/ogMeta.test.ts` — 27 test: HTML kaçışı, kod noktası güvenli kırpma, `https:` görsel filtresi, `Accept-Language` seçimi, OG/Twitter etiketleri, `noindex` varsayılanı, `og:type` allowlist, MAL/AniList/Jikan kimlik çözümleme, canonical türetme, dört dilli fallback kart.

Tarayıcı dumanı (localhost, TR):

- `/lore` → 27 kayıt, spoiler cevapları gizli, "CEVABI GÖSTER" çalışıyor, konsol hatası yok.
- `/voice-duel` → mod seçici görünüyor; **İpucu Tanıma** ile 10 turluk oyun başlıyor, dört dilli ipucu ve dört şık geliyor, konsol hatası yok.
- KÖŞE paneli → oda sekmeleri ve besteci çiziliyor, konsol hatası yok.
- `/text-adventure` → tam yürüyüş sona ulaşıyor (%100), son kartı ve "BAŞTAN BAŞLA" çalışıyor, kaydet/yükle turu doğrulandı; 390 ve 320 px genişlikte yatay taşma yok, çipler yatay kayıyor, odaklanınca komut alanı sabit çubukların üstüne geliyor; konsol hatası yok.
- SEO tek kaynak turu (localhost, TR): `/anime/16498` tek canonical/description/og:title ve AoT başlığı; `/arcade`, `/lore`, `/text-adventure`, `/challenge`, `/dle` tek meta; `/profile` noindex; `/anisyncdle` → `/dle`.
- Bot önizleme turu (localhost): `/api/og?kind=anime&id=16498` ve yol tabanlı `/api/og/anime/16498` doğru başlık/kapak/canonical; `/api/og/media/anilist:154587` + `Accept-Language: fr` → Fransızca kart; geçersiz kimlik 200 + genel kart (`X-Og-Fallback: 1`); tüm yanıtlar `no-store` ve `noindex`.
- Vercel fonksiyon yönlendirmesi: canlıda `/api/games/123` ve `/api/og/...` SPA `index.html` döndürüyordu; dinamik dosya adları yerine statik fonksiyon + rewrite'a geçildi. `/api/games/search` statik dosya olduğu için etkilenmedi (canlıda JSON doğrulandı).
- **Canlı üretim doğrulaması (14 Kasım, `5b9a441`):** `/api/og?kind=anime&id=16498` → 200, `X-Og-Fallback: 0`, `Cache-Control: no-store`, `Vary: User-Agent, Accept-Language`, `X-Robots-Tag: noindex, nofollow`; `/anime/16498` + Twitterbot → doğru OG HTML; `/media/anilist:154587` + Discordbot + `Accept-Language: fr` → `<html lang="fr">`, `og:locale fr_FR`; tarayıcı ve Googlebot UA → SPA `index.html` (cloaking yok). `/api/anime-news`, `/api/games/620`, `/api/games/search` → 200 JSON (önceden hepsi 500'dü). `/api/translate` GET → 405 (auth kapısı; 500 değil).

---

## 3. Dürüst backlog (bu turda kapatılmayanlar)

Öncelik sırasıyla; hiçbiri "yapıldı" gibi gösterilmemelidir.

1. **Auth'lu uçtan uca test yok.** Tarayıcı oturumu kapalı olduğu için oda onayı (50 oy → moderatör), Kalfa doğrudan oda açma, Watch Party senkronu ve admin paneli yalnızca kod + Firestore kurallarıyla doğrulandı. Gerçek hesapla imzalı smoke şart.
2. **Native arka plan bildirimi yok.** `@capacitor/local-notifications` kurulu değil; Capacitor WebView'de Web Notification çoğu cihazda çalışmaz. Arayüz bunu açıkça söylüyor, sessiz başarısızlık yok — ama gerçek çözüm eklenti entegrasyonu.
3. **Gemini kapalı.** Sağlanan anahtar 402 (ön ödeme kredisi bitti). `GEMINI_API_KEY` Vercel'de bilinçli olarak yok; öneri/moderasyon fail-closed ve arayüz "AI çevrimdışı — editör seçkisi" diyor. Sağlayıcı kararı (Groq/OpenRouter/AI Studio) verilmedi.
4. **KVKK otomasyonu yok.** Silme/dışa aktarma hâlâ kuyruk + manuel e-posta; otomatik işleyici yazılmadı.
5. **`FIREBASE_TOKEN` yok.** GitHub `deploy-rules.yml` bu yüzden düşüyor. 14 Kasım'da kurallar yerel oturumla **elle** yayınlandı (derleme başarılı); bundan sonraki kural değişiklikleri yine elle veya token eklenene kadar CI dışında.
6. **Kalan sabit Türkçe metinler.** `MemeZone`, `MonthlyActivityChart`, `ProfileAnalyticsDashboard` ve bazı `FeedPost` yedek liste adlarında hâlâ sabit metin var; tam i18n taraması bitmedi (`locales.test.ts` yalnızca `t()` anahtarlarını ve JSX'te bilinen kalıpları tarar).
7. **ESLint uyarıları.** Hata 0; uyarı sayısı yüksek ve `--max-warnings` kapısı gevşek.
8. **Bundle izleme.** `recharts` ağır; Life Sim ayrı chunk (~300 KB) kabul edilebilir ama izlenmeli.
9. **Fan Bilgisi büyüme hızı.** 27 kayıt elle seçildi; yeni kayıt eklemek kaynak doğrulaması gerektirir. Otomatik üretim yok — bu bilinçli bir karar.
10. **Metin macera tek bölüm.** "Kayıp Bölüm" 7 oda / 15–25 dakika; ikinci bölüm, `undo` komutu, başarım ve oyuncu yazımı editörü yok. İçerik dört dilde elle yazıldığı için büyüme hızı düşük — bu bilinçli.
11. **Yönlendirmeli Google girişi gerçek cihazda test edilmedi.** Kod yolu (`signInWithRedirect` + `getRedirectResult`) eklendi ve popup kapatma hatadan sayılmıyor; ancak popup engelleyen bir tarayıcıda ve Capacitor WebView'de uçtan uca denenmedi. WebView için hâlâ yerel auth eklentisi gerekebilir.
12. **Dokunma hedefleri sayfa sayfa eşit değil.** Oyun sayfasında tüm düğmeler ≥44 px; uygulamanın geri kalanında hâlâ 32–36 px kontroller var. Sistematik bir erişilebilirlik taraması yapılmadı.
13. **Dil başına URL yok.** Dört hreflang de aynı SPA'ya `?lang=` ile gidiyor; canonical query'yi atıyor. Gerçek çok dilli indeksleme için `/tr/...`, `/en/...` rotaları gerekli.
14. **Kalfa kapısı güvenilir değil.** Kural 500 XP istiyor ama `karmaAtCreation` istemcide hesaplanıyor; kötü niyetli istemci bu alanı uydurabilir. Trusted endpoint/Admin SDK + `users/{uid}.karma` senkronu şart.
15. **Rapor hız sınırı yok.** `reportedBy` doğrulandı ve alanlar sınırlandı, ancak aynı hedefe tekrar/limit koruması yok (rules sorgu sayamaz). Cloud Function/App Check ile çözülür.
16. **E-posta doğrulama ve handle tekilliği yok.** Handle hâlâ e-postanın `@` öncesinden türetiliyor; `users/{uid}` dünya-okunur. Doğrulama akışı + benzersiz handle indeksi P1.
17. **Moderatör paneli yok.** Moderasyon KÖŞE paneli + admin sekmelerine dağılmış; şikayet bağlamı, atama, durum akışı ve süreli ban (7 gün sabit) hâlâ eksik.
18. **Performans/erişilebilirlik borcu.** `loading="lazy"` yalnızca 3/77 görselde; `charts` her rotada modulepreload; ortak Modal/focus-trap ve skip-link yok; Sentry/GA4 yok.
19. **Bot önizlemesi yalnızca iki rota.** `/anime/:id` ve `/media/:id` kapsandı; `/lore`, `/text-adventure`, `/dle` gibi statik sayfaların paylaşım kartı hâlâ istemci meta'sına bağlı (sayfa başlığı doğru, bot kartı genel). Gerekirse aynı fonksiyona statik rota modu eklenir.
20. **Üretilen paketler bakım yükü.** `api/**/*.js` commit'leniyor (Vercel `api/` içindeki göreli import'ları paketlemediği için zorunlu). Kaynağa dokunup `npm run build:api` çalıştırmamak `npm run verify` ve CI'daki `verify:api` adımını kırar. Alternatif: Vercel'de build komutuna `build:api` eklenip `api/` git'ten çıkarılabilir — Vercel ayarlarına erişim gerektirir.

---

## 4. Veri kaynakları ve dürüstlük sözleşmesi (değişmedi)

- Anime/manga: **AniList birincil** → Jikan (SFW) yedek → açıkça etiketli katalog/boş durum.
- Roman: OpenLibrary. Oyun: Steam (`/api/games/*`). Haber: `/api/anime-news`.
- "Canlı" etiketi yalnızca gerçekten canlı veri için. Gecikme/eksiklik footer'da yazılı.
- Voice Duel klipleri yalnızca resmî Madoka Exedra kanalından; atıf `docs/voice-sources.md` içinde.
- Life Sim senaryoları kurgudur; kanon değildir ve ekranda böyle yazar.
- Fan Bilgisi küratörlüdür; canlı haber değildir ve sayfada böyle yazar.
- "Kayıp Bölüm" tamamen özgündür: Zork veya başka bir oyundan metin, harita, eşya ya da bulmaca alınmadı. Sayfada bu açıkça yazar; Zork yalnızca `docs/text-adventure-research.md` içinde tür örneği olarak anılır.

---

## 5. DeepSeek için hızlı devir notları

- Çalışma dizini: `C:\Users\semih\Documents\Qoder\anisync\app` (yalnızca `app/`, `AniSync-main/` değil).
- Windows: `npm.cmd`, `npx.cmd`, `firebase.cmd` kullan; PowerShell git/gh stderr'i hata gibi gösterir.
- Locale dosyaları aynı anahtar kümesini korumalı; anahtar tekrarı TS1117 verir; BOM'suz UTF-8.
- Yeni UI metni eklerken büyük locale dosyalarını düzenlemek yerine `i18nProductPass.ts`'e eklemek daha güvenli.
- Yeni sayfa rotası eklerken `src/lib/seoRoutes.ts` + `public/sitemap.xml` birlikte güncellenmeli; `seoFiles.test.ts` aksi halde kırılır. Sayfa kendi meta'sını yazıyorsa `<PageMeta>` kullan ve rotayı `SELF_MANAGED_EXACT`/`PREFIXES`'e ekle.
- Bot önizlemeleri `vercel.json` rewrite + `server/api/og.ts` (üretilen `api/og.js`) + `src/lib/ogMeta.ts` ile üretilir. Yeni bir dinamik rotayı kapsama almak için rewrite ekle ve `ogRender.parseOgTarget`'a kimlik çözümünü yaz; OG çıktısı **asla** CDN'de önbelleklenmemeli (`no-store` + `Vary`), aksi hâlde bot HTML'i tarayıcıya düşer. Arama motoru botlarını (Googlebot/Bingbot) bu rewrite'lara dahil etme.
- **Vercel fonksiyonları:** kaynak `server/api/**/*.ts`, çıktı `api/**/*.js`. `api/` altına elle dosya koymayın. Dosya adları statik olmalı (bu proje Next.js değil; `api/foo/[id].ts` yönlendirilmiyor, istek SPA'ya düşer); parametreyi `vercel.json` rewrite'ı ile query'ye taşı (`/api/games/:appid(\\d+)` → `/api/games/appid?appid=:appid`). Fonksiyona yeni bir göreli import eklerseniz **mutlaka** `npm run build:api` çalıştırın; CI `git diff --exit-code -- api` ile bayat paketi yakalar. Vercel bu kurulumda `api/` içindeki göreli import'ları paketlemiyor — import'lar esbuild tarafından gömülmeli.
- `firestore.rules` değişiklikleri **elle** dağıtılmalı: `firebase.cmd deploy --only firestore:rules --project folkloric-centaur-q6tp2`. `FIREBASE_TOKEN` yoksa GitHub `deploy-rules.yml` düşer; 14 Kasım 2026 itibarıyla ban/rol/rapor korumaları bu komutla canlıya alındı.
- Ban yalnızca topluluk yazılarını keser (`canWrite`); kişisel watchlist/liste ve KVKK veri talebi açık kalır. Ban bandı `users/{uid}` canlı dinleyicisinden beslenir.
- Life Sim olay kimlikleri dünya öneklerine uymalı; `universePaths.test.ts` ve `eventEngine.test.ts` bunu zorlar.
- PWA `public/sw.js` kabuğu (`anisync-shell-v2`) dağıtımdan sonra kısa süre eski sürümü servis edebilir; gezinme network-first, hash'li varlıklar cache-first. Eski derleme görünürse SW/cache temizle.
