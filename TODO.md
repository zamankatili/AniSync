# AniSync — Kalan İşler (tek liste)
*Son güncelleme: 9 Kasım 2026. Bitenler SYSTEM_REVIEW_2026-11.md'de işaretli.*

## Bu oturumda tamamlananlar
- [x] **İkonik Sahneler (14 Kasım, üçüncü oturum)**: `/scenes` sayfası âdet KEŞİFE menüsünde. Editörün 14 seçkisi; her biri 4 dilde bağlam, arc etiketi, 3 kategori (Duygusal 5 / Atmosfer 3 / Aksiyon 7), spoiler düzeyi seviyeleri ve resmî kaynak etiketini taşır. **14/14 kartta resmî kanal embed'leri** (youtube-nocookie): Prime Video JP, ONE PIECE Official, Aniplex USA, TOHO animation, Aniplex, Attack on Titan Official, KADOKAWAanime, MAPPA CHANNEL. Alıntılar sadece kanonik ve herkesçe bilinen satırlar (逃げちゃいかんよ, 海賊王におれはなる, 俺が来たぞーーーッ！！, 領域展開——無量空処); doğrulanamayan satırlar boş — uydurma yok. XP entegrasyonu: `scene_view` (6/gün, 30 XP). Kaynaklar `docs/iconic-scenes.md`'de.
- [x] **Voice Duel — Madoka çıkarıldı, popüler seriler eklendi (14 Kasım, üçüncü oturum)**: 10 Madoka klip kaldırıldı; 14 yeni resmî klip eklendi (呪術廻戦ファントムパレード公式, ONE PIECE Official, Bandai Namco Entertainment, アニプレックス チャンネル, Crunchyroll). 21 klip → Chainsaw Man, Jujutsu Kaisen, ONE PIECE, Demon Slayer, Naruto. UI metni ve `docs/voice-sources.md` güncellendi. Doğrulanamayan seriler (Spy x Family, MHA, AoT + daha fazla Naruto) dürüstçe eklenmedi — TODO'da takvimli.
- [x] **Karakter sırası + zorluk (14 Kasım, ikinci oturum)**: DLE günlük karakteri 20 günlük döngüde yeniden karışan deterministik permütasyonla seçilir (`lib/characterOrder.ts`); antrenman turu zorluk kademeli (0–1 %70 kolay / 2–3 %15 zor / 4+ %30 zor). Zorluk artık bilinirlikten türer: `seriesPopularity` + `characterFame` (1–5), skor = %60 karakter + %40 seri (≥4.5 kolay, ≥3.5 orta, aksi zor) → 12/5/3 dağılım; kolay 6 / orta 7 / zor 8 hak, ipucu açılışları 1/3–2/3. "Kim Bu Karakter?" 86'lık havuz kolay→zor artar.
- [x] **XP ekonomisi (14 Kasım, ikinci oturum)**: `lib/xp.ts` — aksiyon başına günlük tavanlar + 300 XP global günlük tavan, idempotency anahtarlı defter, günlük giriş (+10), seri kilometre (3/7/14/30 gün → +10/+25/+60/+150), oyunlar (DLE 20/30/40, Voice Duel +10), gönderi/yorum/lore/liste/watch-party kazanımları, günlük hedef çubuğu (100 XP) + seri sayacı; misafir XP girişte hesaba taşınır, `users/{uid}` senkronu, profilde `XpLeaderboard` (ilk 10, istemci-yazılabilir — dürüst sınır `docs/xp.md`).
- [x] **Ölçüm + güvenlik paketi (14 Kasım)**: rıza kapılı GA4 (`VITE_GA4_ID`), tembel Sentry (`VITE_SENTRY_DSN`), App Check altyapısı (`VITE_RECAPTCHA_SITE_KEY`, enforcement kapalı), tüm `/api/*` uç noktalarında hız sınırı (Upstash varsa dağıtık, yoksa bellek içi) + `docs/observability.md`. Dönüşüm olayları: `signup`, `first_list_add`, `first_game_finish` (tarayıcı başına bir kez, rıza yoksa gönderilmez).
- [x] **Varsayılan avatarlar → chibi anime**: DiceBear `avataaars` yerine yerel `public/avatars/chibi-01..08.svg` + `src/lib/avatar.ts` (`getDefaultAvatar` / `resolveAvatar`). İnternet gerektirmez, seed'e göre deterministik.
- [x] **Veri motorları**: gün bazlı/sayfalı AniList yayın takvimi, `/api/anime-news` + ölü rss2json temizliği, güncel sezon trendleri, canlı manga/karakter/Steam keşfi.
- [x] **ANISYNCDLE**: TR günü, rastgele antrenman, istatistik izolasyonu, takma ad/eşleşme, 4 dilli ipuçları.
- [x] **Başlık büyütme (TR i→İ) düzeltmesi**: Anime/manga/karakter/ haber başlıklarına `lang="en"` verilerek Türkçe `text-transform` kuralının Latin başlıkları bozması engellendi (CHAİNSAW → CHAINSAW).
- [x] **Bölüm sayısı gösterimi**: Canlı katalogda bilinmeyen okuma yerine "232 BÖLÜM" formatı (`multimedia_chapters_total`).
- [x] **MAL/AniList import**: `ImportExportModal` artık uydurma kapak/skor basmıyor (DiceBear identicon, skor 8.0, 2023). `src/lib/importList.ts` CDATA/entitelü MAL XML + AniList JSON (`lists[].entries[].media`) ayrıştırır; `anilistByMalIds` 50'şerli batch ile kapak/özet/skor/yıl/türle zenginleştirir; zenginleştirme alınamazsa akış MAL verisiyle devam eder ve arayüz bunu belirtir.
- [x] **Adım 2 — Nazik onboarding**: Kayıt sonrası tek sayfa `/onboarding` (PrivateRoute); isim + 2+ tür + canlı AniList önerileri (genre_in; TRENDING → POPULARITY), karttan tek dokunuşla "Listeme Ekle". Kanca: `anisync_onboarding_pending` (Google/e-posta kaydında), Layout yönlendirir; "Şimdilik Atla" her an; günlük modal yöneticisi atlar. **Sahte `['Action','Fantasy']` varsayılanları kaldırıldı** — sinyal yoksa "SENİN İÇİN SEÇİLDİ" artık gösterilmiyor.
- [x] **Sınırsız Keşif Motoru**: Rastgele seçim artık AniList (POPULARITY_DESC, 1..15 sayfa, SFW) — sayfa başına 20 anime, her tıklayışta farklı; tür filtresi `genre_in`; zincir AniList → Jikan → dürüst yedek katalog. Hero'da "CANLI ANILIST KATALOĞU" notu; tür düğümleri Türkçe büyütmeden korundu.
- [x] **XP / Seviye eğrisi & rütbeler**: `src/lib/level.ts` (`25·(L−1)·L`, 30 seviye, 6 rütbe: Misafir→Efsane); `badgeData.LEVELS` eğriden üretiliyor; `OtakuLevelBadge` anasayfada XP kartı + tek seferlik seviye-atla toast; Profile BadgeShowcase aynı hesap; TR/EN/JA/FR rütbe isimleri. (14 Kasım ikinci oturumda etkinlik XP'si toplam XP'ye eklendi — bkz. yukarıdaki "XP ekonomisi".)
- [x] **Günün Sorusu**: 12 soru × 4 dil, yılın günüyle deterministik seçim; "YANITLA" düğmesi soru ile besteciyi doldurur + odaklar; anasayfada kart.
- [x] **Günün Önerileri**: `data/picks.ts` silindi; seçim artık canlı AniList `season+seasonYear TRENDING_DESC` (TR günüyle deterministik kaydırma; kullanıcı `favoriteGenres`'u varsa tür eşleşmesine göre sıralanır, "ZEVKİNE UYAN" rozeti gösterilir). Discover + Home kartı canlı kapak/skor/tür/bölüm taşır; hata durumunda `AnimeErrorCard` ile dürüst boş durum.
- [x] **Anon chat 3 mesaj/gün + Café "KÖŞE" tam sayfa**: Anon kullanıcılar günlük 3 yerel mesaj (localStorage kotası, Firestore'a yazılmaz) gönderir; hem yüzen panel hem tam sayfa KÖŞE, aynı FAB ile açılır (panele geçiş düğmesi header'da, Masa-Geç ile büyük sayfaya dönülür). **Café artık feed-only** (Sohbet/Soru/Öneri/İnceleme masaları, canlı AniList topluluk gönderileri) ve **neo-brütalist tema** (siyah + kalın beyaz sınırlar, amber/rose vurgular) + ANİME RADYOSU + SEVİYE/KALFA kartları sağ kolonda. AI filtresi + 50 oy + moderatör onayı de kurallarda.
- [x] **README.md**: ürün/feature, stack, scriptler, env, Firebase/Vercel/Capacitor dağıtımı, admin & gizlilik, katkılama.

## Sende (5 dk – 30 dk)
- [ ] Firebase Console → Firestore → **Rules yayınla** (`firestore.rules`)
- [ ] **Voice Duel (/voice-duel) fix list** (Sebastian'dan istek):
  - [ ] Doğru cevap her zaman A — şıklar rastgele karışıklmalı (`shuffleList` lokasyonda, değilse klip başına shuffle)
  - [ ] **Karakterler ekranda görünüyor** — official PV'lerdeki görselleri kapatarak yalnızca ses oynat (ör. iframe'in üstüne `position:absolute; background:#000; display:flex; align center "?"` overlay; YouTube iframe arka planda ses oynatmaya devam eder)
  - [x] Madoka Exedra dışına genişlet (kısmi): 14 yeni resmî klip eklendi (JJKファンパレ公式, ONE PIECE Official, Bandai Namco Entertainment, アニプレックス チャンネル, Crunchyroll); toplam 21 klip, 5 seri (`docs/voice-sources.md`, tüm videolar oEmbed ile doğrulandı)
  - [ ] Kalan seriler için resmî klip bulunup eklenecek: Spy × Family (OPERATION DIARY PVs), My Hero Academia (TOHO animation), Attack on Titan (Ponic Canyon / Aniplex), bir proper Naruto karakteri (ör. サスケ・ナルト veya Haruno özel PV tabanlı)
  - [ ] Yanlışlar puan kırılmasın? (karar) + skor kalıcı localStorage’da en iyi skorla yüzleşme
- [ ] **AIRecommendationsSection mock verisi**: "%98 uyumlu" `AI_FALLBACK_REASONS` gösteriliyor; Vercel'de `GEMINI_API_KEY` boş olduğu için gerçek API yerine user'lar mock görüyor.
  - [ ] Seçim: (a) dürüstçe "AI kapalı" kartı + mock gizlenir, ya da (b) ücretsiz alternatif (Groq/OpenRouter — llama) ile gerçek API'ye geçilir; (c) AI Studio ücretsiz proje (kart yok) ile aynı kod → Vercel env'e koyulması.
- [ ] **Gemini bakiyesi**: verilen key (`AQ.Ab8…`) 402 `RESOURCE_EXHAUSTED` — prepaid credits bitmiş. Yeni key ya da bakiye yüklemesi gerekli; şu haliyle `/api/moderate-room` "flagged → moderatör kuyruğuna" düşer (calismasi: tam zamanında tercih düşer, ama yüksek XP'li kullanıcılar yine de kendi odasını açar çünkü `canDirectCreate && moderation.ok` olur — bu durumda AI olmadan `ok: false` dönecektir, **oda isteği** ve **moderatör onayına** düşer).
- [ ] **Push/deploy**: `main` forced-push edildi (önceki `main` → `legacy-v2` dalında arşivlendi). Canlı: https://anisync-tau.vercel.app — `GEMINI_API_KEY` Vercel env'e **DEĞİL** (kullanıcı kararı: "şimdilik ekleme").
- [ ] **`firestore.indexes.json`'daki indeksleri** Yayınla (globalChat roomId+createdAt; `firebase deploy --only firestore:indexes` veya Console → Indexes)
- [ ] `users/{uid}` → `role: 'admin'` ekle (veya Google ile giriş sonrası söyle, birlikte alalım)
- [ ] Vercel env: `GEMINI_API_KEY`, `CRON_SECRET`, `FIREBASE_PROJECT_ID=folkloric-centaur-q6tp2`
- [ ] **Native build**: `VITE_API_BASE_URL=https://<canlı-domain>` ver (varsayılan `https://anisync.app` yayında değil; native'de /api çağrıları kırılır)
- [ ] GitHub repo secret `FIREBASE_TOKEN` (`firebase login:ci`) → rules otomatik deploy
- [ ] `.env` içeriğini Google hesabınla Firebase konsolundan doğrula (auth provider'lar)

## Büyük adaylar (her biri ayrı oturum)
- [ ] **i18n split 2. aşama**: `i18nAnimeLifeSim.ts` de aynı loader'a (Life Sim 301 KB chunk'ı küçültür)
- [ ] **Admin SDK servisi** (Vercel fonksiyonu `_admin.ts`): hesap silme talepleri `dataRequests` → otomatik silme; todayList temizliği; **XP/katılım puanının sunucuda doğrulanması** (liderlik tablosu şu an istemci-yazılabilir)
- [ ] **Karakter bilinirliği güncelleme akışı**: `charactersPool.ts`'teki `seriesPopularity`/`characterFame` elle değeri — 20 satır; periyodik gözden geçirme zamanlanır, yeni karakter eklenirken zorunlu alan olmalı
- [ ] **KVKK veri-talebi e-posta kanalı**: dataRequests → Resend/Postmark ile sana bildirim + kullanıcıya otomatik "30 gün içinde" yanıtı
- [ ] **Rules birim testleri** (`@firebase/rules-unit-testing` + emulator) — admin silme yetkisi, RSVP sahipliği, votes +1 diff
- [ ] **`eventEngine.ts` ayrıştırma** (generateLife / memorial / achievements / worldUnique) + hook test altyapısı (Vitest RTL)
- [ ] **AppStore slice'ları**: useWatchlistSync / useForumSync / useNamedLists — AppStore 700 satırına iner
- [ ] **RTL & eksik-anahtar CI**: i18n anahtar kapsam raporu GitHub Actions'ta (`i18n-checker` benzeri), 4 dilde key-parity zorunluluğu
- [ ] **SEO route-level**: `/anime/:id` prerender (Vercel rewrite + `api/og`) — şu an tüm rotalar aynı meta
- [ ] **Performans ölçümü**: Lighthouse/MUD profiling, `charts` (424 KB!) — recharts yerine hafif grafik modülü?
- [ ] **AnimeNewsFeed fallback etiketlemesi**: RSS yokken Jikan sezon-kartları zaten "haber değil" etiketli — verify

## Bilinçli ertelendi (hafta sonu / MVP sonrası)
- [ ] Ticari ad değişikliği: "1 in 8 Billion" → marka/telif (öneri: "AniSync: One Life, Many Worlds")
- [ ] Self-host chat moderasyonu (shadowban/wordlist), spam throttle (Firestore maliyeti)
- [ ] `bun.lock` geri getirme? (npm tek kaynak — kalıyor)
- [ ] Konsol gürültüsü: `console.error/warn` → `import.meta.env.PROD` filtresi / Sentry

## Doğrulandı ama yapılmadı (opsiyonel)
- [ ] ESLint 464 uyarı (çoğu `no-unused-vars` + a11y) — 2 haftada azalmak yerine ihtiyaca göre dokun
- [ ] `.github/workflows/deploy-rules.yml` çalıştı mı? (Secret eklendiğinde)

## Tek komutla doğrulama
`npm run verify` → tsc + eslint + vitest + build. CI (`.github/workflows/ci.yml`) aynı adımları atıyor.
