# AniSync — Kalan İşler (tek liste)
*Son güncelleme: 9 Kasım 2026. Bitenler SYSTEM_REVIEW_2026-11.md'de işaretli.*

## Sende (5 dk – 30 dk)
- [ ] Firebase Console → Firestore → **Rules yayınla** (`firestore.rules`)
- [ ] **`firestore.indexes.json`'daki indeksleri** Yayınla (globalChat roomId+createdAt; `firebase deploy --only firestore:indexes` veya Console → Indexes)
- [ ] `users/{uid}` → `role: 'admin'` ekle (veya Google ile giriş sonrası söyle, birlikte alalım)
- [ ] Vercel env: `GEMINI_API_KEY`, `CRON_SECRET`, `FIREBASE_PROJECT_ID=folkloric-centaur-q6tp2`
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
