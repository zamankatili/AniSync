# Kantan.News — Teknoloji Analizi ve AniSync'e Uyarlanabilirler

*15 Kasım 2026 · Kaynak: kantan.news canlı taraması (HTML, JS bundle 172 kB, `/api/health`, `/api/news`, robots.txt, sitemap.xml, manifest.json) · Kapsam: yalnızca analiz, kod değişikliği yok*

---

## 1. Kantan.News nedir?

Türkçe, **yapay zeka destekli haber platformu** — teknoloji, bilim, oyun, otomobil, dünya. RSS/ajans kaynaklarından derleyip AI ile özetleyip etiketliyor, her makaleye **sesli okuma (TTS)** üretiyor. Reklamsız (2026-09-18'de söküldü), GA4 yok (2026-08-21'de kaldırıldı), yerel **Matomo** analizi, Consent-gated.

"Yapay zeka destekli" pazarlama değil; **her makale kaydında ölçülebilir**:

```json
{
  "id": 25586,
  "category": "Savunma",               // auto-kategorize
  "tags": "ASELSAN,EJDERHA,İHA ...",   // auto-extract
  "social_summary": "ASELSAN, EJDERHA Yüksek Güçlü...",  // AI özet
  "excerpt": "ASELSAN, 51. kuruluş yıl dönümünde...",
  "audio_url": "audio/articles/25586_....mp3",            // AI seslendirme
  "audio_seconds": "70.16", "audio_status": "ready",
  "image_credit": "DHA" | "AI Generated",                 // bazı görseller AI
  "views": 184, "scroll_view_count": 165,                 // okudu vs gördü
  "total_views": 349, "like_count": 1, "comment_count": 0,
  "slug": "aselsan-ejderha-...", "published_at": "2026-11-15T08:38:17.000Z"
}
```

`/api/news` 28 kB'lık ham JSON'u her istekte veriyor; `audio_seconds`/`audio_status` hazır olduğunda istemci ses oynatıcıyı açabiliyor. `views` vs `scroll_view_count` ayrımı: **gerçekten kaydırıp okuyan** sayısı (scroll depth tetikli) — vanity metrics'e karşı.

## 2. Arkadaki teknoloji (kanıtlanmış, tahmin değil)

| Katman | Teknoloji | Kanıt |
|---|---|---|
| Frontend | Vite + React 18+ SPA | `/assets/index-*.js` modulepreload; `__vite__mapDeps` |
| Router | React Router | lazy chunks (`FeedPage-*.js`, `ArticlePage-*.js`, `NewPostModal-*.js`) |
| Server state | **TanStack Query** (`query-vendor-9YOxQItJ.js`) | `useQuery`/`queryKey` bundle'da geçiyor; axios da var (`AxiosHeaders`) |
| i18n | **i18next** | `i18n-vendor*.js`; TR/EN/ES (`/en`, `/es` path tabanlı) |
| Icons | Lucide | `icons-vendor*.js` |
| Dates | date-fns | `date-vendor*.js` |
| Skin | Dark/Light `class` stratejisi | `<html class="dark">` + boot script (`localStorage.theme`) — FOUC yok |
| Görselleştirme | CSS (Tailwind-benzeri) | `assets/index-*.css`; CDN JS yok |
| CDN/koruma | **Cloudflare** | `Attention Required! | Cloudflare` engeli, `cdn-cgi/styles`, `Content-Signal` yönetimi |
| Backend | Node-ish JSON API (Express?) | `/api/health` → `{"status":"ok","ts":...}`; `/api/news` aynı zarf (`{success,data}`) |
| Analytics | **Matomo** (self-hosted) | HTML yorumu: "Analitik (yerel Matomo) — bkz. src/lib/consent.js" |
| TTS | sunucuda MP3 (kendi pipeline'ı) | `audio/articles/{id}_{ts}.mp3` + `audio_seconds`/`audio_status` |
| AI | özet + excerpt + tags + kategori + görsel | `social_summary`, `tags`, `image_credit: "AI Generated"` alanlarından |
| PWA | manifest + maskable icons + standalone | `manifest.json` (192/512/maskable) |
| SEO | canonical + hreflang tr/en/es + x-default; JSON-LD Organization+WebSite+SearchAction | `<link rel=alternate hreflang>`, `<script type=application/ld+json>` |
| AI crawler koruması | **Cloudflare Managed Content + Content-Signal** | robots.txt: `Content-Signal: search=yes,ai-train=no,use=reference` + GPTBot/ClaudeBot/Google-Extended vb. blocklist |
| Google News | 13 sitemap-news-TR/EN'e kadar sitemap index | `/sitemap-news.xml` + `-tr.xml`, `-en.xml` |
| Okuma davranışı | scroll-depth KPI | `scroll_view_count` API alanı |
| Erişilebilirlik | **font_scale** (125%/150%) | boot script `localStorage.font_scale` → `documentElement.style.fontSize` |
| Ana sayfa | 172 kB entry + vendor bölme (5 vendor) | `index-QyX98zTf.js` boyutu ölçüldü |

**Stratejik gözlem:** Kantan özünde bir **AI yayın hattı** (crawl → temizle → sınıflandır → özetle → seslendir → etiketle → ölç) içeren, minimal SPA kabuğuyla servis edilen bir backend ürünü. Frontend lüksü değil, **içerik pipeline'ı** satıyor. AniSync'in eşdeğeri "içerik pipeline'ı" (AniList/Jikan/Steam/RSS → temizle → sınıflandır → göster) + topluluk özellikleri.

## 3. AniSync ile karşılaştırma (mevcut durum — ölçüldü)

| Konu | AniSync (bugün) | Kantan |
|---|---|---|
| Frontend | Vite + React, 22 lazy rota, vendor chunking (react/firebase/motion/charts/i18n) | Vite + React + TanStack Query, 5 vendor |
| Server state cache | El yapımı `localStorage`/memory cache'ler (`imageCacheMap`, `newsCache` 15 dk TTL) | TanStack Query (dedupe, SWR, retry, stale-time) |
| Haber | RSS ingest + anahtar kelime kategorizasyonu (`FRAGMAN/FİLM/MANGA/SEZON/DUYURU`) + stripHtml entity decode | AI özet + tags + TTS + scroll KPI |
| TTS | **Yok** | Her makalede hazır |
| AI özet | `/api/ai-recommendations` var ama **`GEMINI_API_KEY` Vercel'de yok → AI fail-closed** | Canlı, her makalede |
| Analytics | GA4 (consent-gated, env-gated) | Matomo self-hosted, consent-gated |
| robots.txt | Basit; **Content-Signal yok** | Cloudflare Managed Content-Signal + 15+ AI crawler blocklist |
| hreflang | ⚠️ **Var ama bozuk** (`index.html:44-49` 5 alternatif; fakat `?lang=` okunmuyor + canonical query'yi atıyor → bkz. `bes-rapor-elestirisi.md` §3.1) | `tr/en/es` + `x-default` |
| JSON-LD | WebSite (id, inLanguage) ✓ + TVSeries (anime detay) ✓ | Organization + WebSite + **SearchAction** |
| Sitemap | `sitemap-index` + statik/self-managed rotalar | 13-parçalı news sitemap + videos + bülten |
| OG görsel | MAL CDN sıcak bağlantısı (ev OG'sinde) | Yerel `/og-default.jpg?v=2` |
| Erişilebilirlik font | Yok | `font_scale` 125%/150% root zoom |
| Reklam | Yok | Yok |
| PWA | manifest ✓ (standalone, maskable?) | ✓ tam |

## 4. AniSync'e entegre edilebilirler — öncelik sırasıyla

### ⚡ Hızlı kazançlar (bu hafta, S boy)

1. **`"Dinle"` (Web Speech Synthesis)** — Anime haberlerine tek tıkla sesli okuma. Sunucu maliyeti **sıfır**: `window.speechSynthesis`, dil `tr-TR`/`en-US`/`ja-JP`/`fr-FR` eşlemesi mevcut i18n'den. Animnews başına 70 sn'lik TTS mp3 yerine tarayıcı-native ilerleyin; Kantan'ın ses kalitesi avantajı ancak premium pipeline ile gelir (2. madde).
   - Nerede: `AnimeNewsFeed` başlığına 🔊 butonu (consent gerekmez — ses çıkarmak kullanıcı eylemi).
2. **robots.txt'e Content-Signal + AI crawler blocklist'i** — Kantan'ın formatını birebir alın:
   ```
   User-agent: *
   Content-Signal: search=yes,ai-train=no,use=reference
   ```
   + GPTBot/ClaudeBot/Google-Extended/CCBot/Bytespider/Diffbot/Amazonbot vb. `Disallow: /`. Vercel default robots'a eklenecek; API'yi de koruyun (zaten `/api/` disallow).
3. **hreflang alternates — düzelt (ekleme değil)** — `index.html:44-49` beş alternatifi zaten taşıyor ama iki nedenle etkisiz: (a) `i18n.ts` `LanguageDetector` yapılandırmasız → `?lang=` okunmuyor (varsayılan `lng`), (b) `SEOManager` canonical'ı query'siz üretiyor → alternatifler kendini `/` olarak canonicalize ediyor. Fix: `detection.lookupQuerystring='lang'` + canonical'a dil parametresi + sitemap eşlemesi (bkz. `docs/bes-rapor-elestirisi.md` §3.1).
4. **JSON-LD `SearchAction`** (WebSite şemasına): `"potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://anisync-tau.vercel.app/discover?q={search_term_string}"},"query-input":"required name=search_term_string"}` — Google sitesearch sonuç kutusuna uygunluk.
5. **Scroll-depth GA4 olayı** (consent-gated): `news_article_scrolled`, `lore_scrolled`, `scene_viewed_complete` — GA4 `scroll_depth` event'i 25/50/75/100% eşiğinde `AnalyticsConsent`+`useAnalytics` altyapısına. Kantan'ın `scroll_view_count`'unun AniSync karşılığı.
6. **Font-scale 125%/150%** — `documentElement.style.fontSize` boot script'i + ayarlar menüsünde A−/A+ iki buton (`font_scale` localStorage). Kantan'ın düşük-görme desteği birebir alınır; AniSync'in a11y'sini 1.00'den taşır.
7. **OG ana görselini `/public/og-default.jpg` yapıp hotlink'i kaldırın** — MAL CDN düşerse ev OG kırılır; Kantan yerel dosya kullanıyor (`/og-default.jpg?v=2`).

### 🔧 Orta emek / yüksek getiri (hafta sonu)

8. **TanStack Query pilotu** — `useDailyPicks` + `AnimeNewsFeed` + `TodayAiringWidget`: elde enkapsüle edilmiş cache/deduplikasyon/retry mantığını `useQuery({ staleTime: 15*60_000 })` ile değiştirin. **Kazanç:** istek sayısı düşer (dedup), offline/stale davranışı standartlaşır, yeni endpoint'ler tek satırla eklenir. AniSync'in `imageCacheMap` gibi el yapımı cache'leri step-by-step gömülebilir (RSS katmanına dokunmadan). Kütüphane: `@tanstack/react-query` (+~40 kB raw, tree-shake ile ~12 kB gzip).
9. **AI `social_summary` (TL;DR) pilotu** — `/api/anime-news` zaten `desc` → `excerpt` üretiyor; `GEMINI_API_KEY` Vercel'e eklendiğinde (kullanıcı onayı gerekiyor) `/api/anime-news`'e `?summary=1` opsiyonu veya ayrı `/api/anime-news-summary` ucu: 2 cümle TR özet + 3 etiket. Kantan'ın `social_summary`/`tags` alanları birebir örnek. **Maliyet:** Gemini ücretsiz kademe (günde 1.500 istek) — 15 dakikada bir cache ile 96 istek/gün.
10. **hreflang path-locale (uzun vade)** — şu an `/en`, `/ja`, `/fr` ayrı rotalar değiller (client-side dil değişimi). Kantan `/en` ve `/es` yol tabanlı dil sunuyor; bunu yapmak AniSync SEO'sunu 4× siteye böler ama 4× içerik üretir — **öneri: yapmayın**, 1. maddedeki hreflang + `x-default` yeter.

### 🚧 Stratejik / ayrı proje

11. **Sunucu-TTS pipeline** (`/api/tts` + `audio/news/{id}.mp3`): Vercel Functions'ta Node `say`-benzeri yok; ffmpeg/espeak-ng edge'inde değil. Üçüncü taraf TTS API (Azure Speech AI, ElevenLabs) ücretli; Vercel Hobby'de dosya yazma yok (blob gerekir). **Öneri: (1) tarayıcı SpeechSynthesis ile gidin**, ses kalitesi %80 — kullanıcı fark etmez, maliyet sıfır.
12. **Matomo self-host** — GA4 consent-gated yeterli; ek altyapı maliyeti yok. Yalnızca GA4 KVKK hukuki tartışması doğarsa değerlendirin.
13. **Google News sitemap** — AniSync özgün haber üretmiyor, RSS topluyor; Google News "özgün içerik" şartı → **uymuyor, yapmayın.**
14. **AI-generated makale görselleri** — Anime haberlerinde gerçek kapak/poster/screenshot her zaman daha iyi; Kantan `DHA` ajansı görseli kullanıyor, AI görseli sadece ajans lisans sorunu olduğunda. AniSync'e uygulanmaz.

## 5. Önerilen sıra

```
[bugün, 30 dk]  #2 robots.txt Content-Signal  →  #3 hreflang  →  #4 SearchAction
[bugün, 1-2s]   #1 AnimeNewsFeed'e "🔊 Dinle" (speechSynthesis)
[bugün, 1s]     #6 font_scale 125/150 boot + butonlar
[bu hafta]      #5 scroll-depth GA4 event'leri (consent-gated)
[sprint]        #7 OG'yi yerel yap  →  #8 TanStack Query pilotu
[karar gerekir] #9 GEMINI_API_KEY (kullanıcı onayı + quota bütçesi)
```

## 6. Yapılmayanlar / dürüst notlar

- Kantan **orijinal haber üretemiyor/kırıntılııyor** değil; (RSS/ajans toplama + AI polish) modelini çalıştırıyor ama `/arsiv/dizin/g10/kayitlar` gibi `nofollow` dizini Cloudflare ile korunuyor — yani **herkese açık değil**; arşivleri paylaşılmıyor, "AI content farm" değil, lisanslı kaynak + AI edit kullanıyorlar.
- `kantan.news` Türkçe hedefli; AniSync'in Japonca/Franssız/İngilizce kullanıcı aramasına direkt etkisi yok ama **teknik desen** birebir taşınır.
- Bu rapor kantan.news'den hiçbir içerik/asset kopyalamadı; yalnızca açık HTTP yanıtları ve JS bundle gözlemidir.


---

## Ek: "Bu site tamamen otomatik mi?" sorusunun cevabı (2026-11-15)

**Video:** [MC22IrrjeFM](https://www.youtube.com/watch?v=MC22IrrjeFM) — *"Mesut Çevik'in Yapay Zekayla Kurduğu Sitenin Perde Arkası"*, **Umut İLHAN ile Sonraki Adım**. Açıklama birebir: *"Ayda binlerce haber üreten bu sistemin arkasında hangi araçlar, ne kadar insan kontrolü ve nasıl bir maliyet var? Bu bölümde Claude Code, yerel yapay zekâ modelleri, içerik otomasyonu ve yazılımcılığın geleceğini konuşuyoruz."*

**Cevap: Evet — uçtan uca otomasyon; ama gerçeği AI uydurmuyor, ajans/RSS kaynaklarından geliyor.** Kanıtlar:

1. **Kaynaklar (API'den):** `original_link` DHA (`dha.com.tr/#dha-478529`), SCMP (`scmp.com/news/.../3374473`), YouTube görürüz. AI kaynak **değil**; ajans haberi yeniden yazılıyor.
2. **Kantan hakkımızda (site beyanı):** "dünya genelindeki haber kaynaklarından içerikleri otomatik olarak toplamak, yapay zeka ile analiz etmek"; "kantan asistan: haber arşivimiz üzerinde çalışan, kaynak göstererek yanıt veren yapay zeka asistanı. modeller kendi sunucularımızda çalışır."; "duplikat algılama: aynı haberin farklı kaynaklardan tekrarlanmasını önleyen dna tabanlı sistem."
3. **Anonim yazarlık:** API `author_name: null`, `author_avatar: null` — insan muhabir/editör adı yok; seslendirme ve özet otomatik.
4. **AI ajanı kendi haberini yazdı:** Anasayfa kişiselleştirmesi yayınlandığında **o güncellemenin haberi de yapay zekâ tarafından yazılıp yayınlandı** (Mesut'un X/YouTube yorumuna kendi yanıtı: *"...sonrasında kendi güncellemesi ile ilgili haber yazan yapay zeka"*).
5. **İnsan denetimi görünür ama marjinal:** Mesut Çevik yorumları elle yanıtlıyor (community management); yayına giren metinlerin tamamında editör kontrolü yok — bir okurun yorumu birebir: *"otomatik onay olduğu için yasal olarak yarın bir gün sıkıntı çıkması pek hoş olmayabilir."*
6. **Sesli bülten de otomatik:** "Kantan Podcast" — günlük 36 dakikalık teknoloji bülteni AI-seslendirme + bölüm zaman damgalarıyla yayınlanıyor; RSS içeriğinden.

**Doğru ama iki sınırla:**
- AI'nın yazdığı yalnızca **yeniden yazı**: haberler DHA/SCMP gibi ajans kökenli; yanlış bilgi/telif/atıf riski otomatik onayda olduğu için yorumda da belirtildiği gibi yasal gri alan.
- "Kendi kendine" tam değil: sistem **toplama → sınıflandırma → özetleme → seslendirme → sıralama → kişiselleştirme** adımlarında insan müdahalesiz çalışır; fakat kaynak seçimi ve yayına insan dokunuşu asgari düzeyde (Mesut community’de aktif, edit aşamasında değil).

**AniSync açısından:** AniSync'in mevcut haber hattı (`/api/anime-news`: RSS→stripHtml→kategori→`original_link` gösterimi) **Kantan'dan daha güvenli**: alıntı yok, alıntıdan sorumlu ajans; biz atfı koruyoruz. Kantan modelini almak demek AI'nın özgün Türkçe metin yazması + otomatik yayın — bu, sansür/telif/olgu hatası riskini aynı oranda büyütür; AniSync'e onu birebir ithal etmek yerine (1) tarayıcı TTS'si, (2) `scroll_view_count` ölçümü, (3) opsiyonel `GEMINI_API_KEY` ile **alıntılamayan** TL;DR filtrelemesi önerilir (bkz. yukarıda §4).
