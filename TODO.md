# AniSync — Kalan İşler (tek liste)
*Son güncelleme: 9 Kasım 2026. Bitenler SYSTEM_REVIEW_2026-11.md'de işaretli.*

## Bu oturumda tamamlananlar
- [x] **Varsayılan avatarlar → chibi anime**: DiceBear `avataaars` yerine yerel `public/avatars/chibi-01..08.svg` + `src/lib/avatar.ts` (`getDefaultAvatar` / `resolveAvatar`). İnternet gerektirmez, seed'e göre deterministik.
- [x] **Veri motorları**: gün bazlı/sayfalı AniList yayın takvimi, `/api/anime-news` + ölü rss2json temizliği, güncel sezon trendleri, canlı manga/karakter/Steam keşfi.
- [x] **ANISYNCDLE**: TR günü, rastgele antrenman, istatistik izolasyonu, takma ad/eşleşme, 4 dilli ipuçları.
- [x] **Başlık büyütme (TR i→İ) düzeltmesi**: Anime/manga/karakter/ haber başlıklarına `lang="en"` verilerek Türkçe `text-transform` kuralının Latin başlıkları bozması engellendi (CHAİNSAW → CHAINSAW).
- [x] **Bölüm sayısı gösterimi**: Canlı katalogda bilinmeyen okuma yerine "232 BÖLÜM" formatı (`multimedia_chapters_total`).
- [x] **MAL/AniList import**: `ImportExportModal` artık uydurma kapak/skor basmıyor (DiceBear identicon, skor 8.0, 2023). `src/lib/importList.ts` CDATA/entitelü MAL XML + AniList JSON (`lists[].entries[].media`) ayrıştırır; `anilistByMalIds` 50'şerli batch ile kapak/özet/skor/yıl/türle zenginleştirir; zenginleştirme alınamazsa akış MAL verisiyle devam eder ve arayüz bunu belirtir.
- [x] **Adım 2 — Nazik onboarding**: Kayıt sonrası tek sayfa `/onboarding` (PrivateRoute); isim + 2+ tür + canlı AniList önerileri (genre_in; TRENDING → POPULARITY), karttan tek dokunuşla "Listeme Ekle". Kanca: `anisync_onboarding_pending` (Google/e-posta kaydında), Layout yönlendirir; "Şimdilik Atla" her an; günlük modal yöneticisi atlar. **Sahte `['Action','Fantasy']` varsayılanları kaldırıldı** — sinyal yoksa "SENİN İÇİN SEÇİLDİ" artık gösterilmiyor.
- [x] **Sınırsız Keşif Motoru**: Rastgele seçim artık AniList (POPULARITY_DESC, 1..15 sayfa, SFW) — sayfa başına 20 anime, her tıklayışta farklı; tür filtresi `genre_in`; zincir AniList → Jikan → dürüst yedek katalog. Hero'da "CANLI ANILIST KATALOĞU" notu; tür düğümleri Türkçe büyütmeden korundu.
- [x] **XP / Seviye eğrisi & rütbeler**: `src/lib/level.ts` (`25·(L−1)·L`, 30 seviye, 6 rütbe: Misafir→Efsane); `badgeData.LEVELS` eğriden üretiliyor; `OtakuLevelBadge` anasayfada XP kartı + tek seferlik seviye-atla toast; Profile BadgeShowcase aynı hesap; TR/EN/JA/FR rütbe isimleri.
- [x] **Günün Sorusu**: 12 soru × 4 dil, yılın günüyle deterministik seçim; "YANITLA" düğmesi soru ile besteciyi doldurur + odaklar; anasayfada kart.
- [x] **Günün Önerileri**: `data/picks.ts` silindi; seçim artık canlı AniList `season+seasonYear TRENDING_DESC` (TR günüyle deterministik kaydırma; kullanıcı `favoriteGenres`'u varsa tür eşleşmesine göre sıralanır, "ZEVKİNE UYAN" rozeti gösterilir). Discover + Home kartı canlı kapak/skor/tür/bölüm taşır; hata durumunda `AnimeErrorCard` ile dürüst boş durum.
- [x] **README.md**: ürün/feature, stack, scriptler, env, Firebase/Vercel/Capacitor dağıtımı, admin & gizlilik, katkılama.

## Sende (5 dk – 30 dk)
- [ ] Firebase Console → Firestore → **Rules yayınla** (`firestore.rules`)
- [ ] **`firestore.indexes.json`'daki indeksleri** Yayınla (globalChat roomId+createdAt; `firebase deploy --only firestore:indexes` veya Console → Indexes)
- [ ] `users/{uid}` → `role: 'admin'` ekle (veya Google ile giriş sonrası söyle, birlikte alalım)
- [ ] Vercel env: `GEMINI_API_KEY`, `CRON_SECRET`, `FIREBASE_PROJECT_ID=folkloric-centaur-q6tp2`
- [ ] **Native build**: `VITE_API_BASE_URL=https://<canlı-domain>` ver (varsayılan `https://anisync.app` yayında değil; native'de /api çağrıları kırılır)
- [ ] GitHub repo secret `FIREBASE_TOKEN` (`firebase login:ci`) → rules otomatik deploy
- [ ] `.env` içeriğini Google hesabınla Firebase konsolundan doğrula (auth provider'lar)

## Büyük adaylar (her biri ayrı oturum)
- [ ] **i18n split 2. aşama**: `i18nAnimeLifeSim.ts` de aynı loader'a (Life Sim 301 KB chunk'ı küçültür)
- [ ] **Admin SDK servisi** (Vercel fonksiyonu `_admin.ts`): hesap silme talepleri `dataRequests` → otomatik silme; todayList temizliği
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
