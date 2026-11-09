# AniSync — Anime, Manga, Novel & Game Tracker

Anime, manga, light novel ve oyun sevenler için hepsi bir arada platform:
izleme/okuma listeleri, **canlı sezon takvimi**, güncel haberler, topluluk
(sosyal akış, yorumlar, Watch Party), oyunlar (ANISYNCDLE, Müzik Quizi,
Arcade, Life Sim), XP/seviye sistemi ve zevkine göre öneriler.

> Bu repo uygulamanın üretime giden tek kaynağıdır. Deploy hedefi Vercel
> (bkz. **Dağıtım**). Eski `main` geçmişi arşivde `legacy-v2` dalında saklanır.

---

## Öne çıkanlar

**İzleme & Listeler**

- İzleme listesi, +1 bölüm takibi, tamamlandı sayıları, portfoy
- MAL `animelist.xml` / AniList JSON yedeği içe aktarma (batch AniList zenginleştirmeli)
- Manga & light novel kütüphanesi, favori karakter vitrini, Steam oyun kütüphanesi
- **Haftalık yayın takvimi** — AniList'ten günlük/sayfalı, TR saatine göre
  (bölgesel `cache` ile), hatırlatıcılar
- **Sezon listeleri** — her açılışta canlı; sezon, yıl ve popülerlik aynı günden beslenir

**Keşif**

- **Sınırsız Keşif Motoru** — AniList `POPULARITY_DESC` üzerinde sayfa-1..15 arası rastgele 20'lik
  dilimler; tür filtreleri `genre_in` ile; her tıklama farklı, SFW, yedek Jikan → yedek katalog
- Trend & popular listeleri, tür bazlı öneri motorları, benzer anime arama

**ANISYNCDLE** (günün karakteri tahmini)

- Günün karakteri TR gününe göre; antrenman modu günlük istatistiğe dokunmaz
- 20 karakter × 4 dilli ipuçları, takma ad/parça isim eşleştirme

**Topluluk & Sosyal**

- Firebase tabanlı sosyal akış: gönderi, yorum, beğeni, takip
- Watch Party — senkron fragman odaları + sohbet
- 3x3 Grid Maker, listeler, koleksiyonlar, topluluk nabzı, anketler
- **Günün Sorusu** — herkese aynı, 12 soruluk rotasyon; yanıt akışa doldurulur

**Oyunlar & Eğlence**

- ANISYNCDLE, Müzik Quizi (günlük), Arcade (Breakout / Memory / Snake)
- Anime Life Sim — 4 dilli evrenler & olay motoru
- Otaku DNA — 3 adımlı zevk anketi

**Seviye / XP — Otaku Rübesi**

- `25·(L−1)·L` eğrisiyle 30 seviye, 6 rütbe: **Misafir → Müdavim → Kalfa → Usta → Mekân Sahibi → Efsane**
- Ana sayfada XP kartı, Profile rozet/seviye vitrini; seviye atlamada tek seferlik kutlama
- Rozetler izleme, sosyal, quiz ve özel kategorilerde

**Veri ve dürüstlük kuralı**

Canlı veri yoksa ürün uydurma yapmaz: dürüst boş durum ya da açıkça etiketlenmiş
yedek katalog gösterilir. AniList → Jikan (yedek) → yedek katalog sırası,
anilist istekleri için hız sınırlayıcısı ve bellek-içi önbellek ile korunur.

---

## Teknoloji

| Katman | Kullanım |
| --- | --- |
| Uygulama | React 19, TypeScript (strict), Vite |
| Stil | Tailwind CSS v4, neo-brutalist tema |
| Durum | React state + Zustand (quiz / watch party / haftalık challenge / hata yakalama) |
| Yönlendirme | React Router 7, `React.lazy` rotlar, route-level kod bölme |
| Backend | Firebase Auth (Google + e-posta), **named Firestore DB**, Storage |
| Backend (ops) | Vercel serverless: `/api/anime-news` (RSS), `/api/games/*` (Steam proxy'ler), `/api/refresh-news` (cron) |
| Mobil | Capacitor 8 — Android / iOS / Web (`capacitor.config.ts`) |
| Test | Vitest (50 test) |
| İ18n | TR, EN, JA, FR — dil detektörü + dil-bazlı route parçalama |

## Başlangıç

**Gereksinimler:** Node 20+, npm

```bash
npm install
npm run dev        # http://localhost:3000
```

Env (web): `firebase-applet-config.json` istemci profili içerir (public web config);
`.env.example` referans için. `GEMINI_API_KEY` yalnızca Vercel/sunucu tarafında gerekir
(AI sohbet; yoksa 401 ile dürüstçe kapanır).

```bash
npm run verify       # tsc + eslint + test + build
npm run verify:fast  # tsc + test
```

## Komutlar

```bash
npm run dev          # yerel geliştirme (tsx server.ts, 3000)
npm run build        # vite build + server bundle (dist/)
npm run preview      # üretim önizleme
npm run verify[:fast]
npm run test         # vitest
npm run native:sync  # build + cap sync
npm run native:android / native:ios
```

## Proje düzeni

```
src/
  App.tsx              rotalar (lazy)
  index.css            Tailwind v4 tema
  pages/               Home, Discover, AiringCalendar, AniSyncDle, AnimeLifeSim, AdminPage...
  components/          Layout, MultiMediaHub, BadgeShowcase, OtakuLevelBadge...
  context/AppStore.tsx watchlist, profil, feed, auth
  data/                badgeData, dailyPrompts, animeWorlds... (küratörlü içerik)
  hooks/               useAnimeData, useAppTranslation...
  lib/                 anilist.ts (birincil), jikan köprüsü, airingService, importList,
                       level.ts (XP eğrisi), otakuLevel.ts, genreNames, avatar, utils...
  store/               Zustand: quiz, watch party, weekly challenge, toast, hata
  i18n/locales/        tr en ja fr
api/                   Vercel fonksiyonları (news, Steam proxy, cron)
android/ ios/          Capacitor kabukları
public/                PWA, og ikonları, chibi avatarlar (public/avatars/)
```

## Veri kaynakları

- **AniList (GraphQL, birincil)** — sezon takvimi, trend/popüler listeler,
  arama, karakterler, `idMal_in` toplu zenginleştirme, medya detay
- **Jikan v4 (yedek)** — AniList erişilemediğinde canlı yedek
- **Google News RSS (sunucu)** — `/api/anime-news` üzerinden, `/api/refresh-news`
  cron'u her 12 saatte tazeler (`Authorization: Bearer CRON_SECRET`)
- **Steam** — `/api/games/search`, `/api/games/[appid]` keyless proxy
- **Firebase** — auth, sosyal, takip edilen içerik, KVKK/GDPR veri dışa/ekle-sil

## Dağıtım

1. Repoyu Vercel'e bağla (framework: Vite, output: `dist`).
2. Vercel ortam değişkenleri: `GEMINI_API_KEY` (AI sohbet), `CRON_SECRET`,
   `FIREBASE_PROJECT_ID`.
3. Firebase: `firestore.rules` ve `firestore.indexes.json` `firebase deploy --only firestore` ile yayında (named DB).
4. Native: `./android` ve `./ios` Capacitor kabuklarında `npm run native:sync`.

## Admin & roller

`VITE_ADMIN_EMAILS` (ilk kurulum) ya da `users/{uid}.role='admin'` (kalıcı)
admin yetkisi verir. Admin paneli: moderasyon, veri talepleri (KVKK/GDPR),
test/hata odaları.

## Gizlilik & güvenlik

- Kullanıcı kendi verisini (profil, liste, yorumlar) dışa aktarabilir / silebilir.
- ID token doğrulaması `api/` uçlarında sunucu tarafında yapılır; Firestore rules
  minimum yetki ile yaşar.
- Firebase web API anahtarı istemciye görünürdür (tasarım gereği); veri erişimi
  kurallar ve named DB ile korunur.

## Katkı

```bash
npm run verify
```

Testler yeşil, `Layout`'un SEO/hreflang polisine dokunmayın, `src/data/` altında
küratör listelere sayfa bağlıysa değişiklik öncesi etiketleyin, canlı veriyi
uydurma ile değiştirmeyin — bunun yerine dürüst boş durum tercih edin.
