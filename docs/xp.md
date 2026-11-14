# XP sistemi — AniSync

*Son güncelleme: 14 Kasım 2026 (UTC). Bu belge uygulamadaki XP/seviye ekonomisinin
tamını ve sınırlarını anlatır.*

## Amaç

Üye sadakati ve bağlılığı artırmak, rekabet ve "elde etme" hissiyatı vermek —
**spam ödülü değil, düzenlenmiş bir ekonomi**. Her kazanım sayaçlı, tavanlı ve
GÜNLİK tekrarlanabilir; "taksitle farm" sayımı yoktur.

## Mimari

| Katman | Yer | Sorumluluk |
|---|---|---|
| Saf motor | `src/lib/xp.ts` | Kurallar, günlük/global tavanlar, idempotency, seriler, birleştirme |
| Kalıcı defter | `src/store/useXpStore.ts` | Scope'lu (misafir/uid) localStorage kalıcılığı, atomik ziyaret/ödül |
| Uzak senkron | `src/lib/xpSync.ts` | `users/{uid}.xpTotal/xpStreak/xpBestStreak` okuma-yazma + liderlik tablosu |
| UI köprüsü | `src/components/XpBridge.tsx` | Kapsam seçimi, misafir→hesap birleştirme, günlük giriş ödülü, debounce'lu senkron |
| Gösterim | `OtakuLevelBadge`, `OtakuRankBadges`, `GlobalChat`, `Profile`, `WpSync` (`XpLeaderboard`) | Toplam XP (karma + etkinlik), günlük hedef, seri, sıralama |

## İki seviye, tek ilerleme sayısı

1. **Türetilmiş izleme karması** — `calculateKarma`: liste boyutu ×15, tamamlanan ×40,
   puanlanan ×10, bölüm başına ×2 (en fazla 800), quiz ×80, arcade (en fazla 500), taban 50.
2. **Etkinlik XP'si** — `lib/xp.ts`'teki defter: günlük giriş, oyunlar, gönderiler…

**Toplam XP = karma + etkinlik XP'si**; seviye eğrisi (`25·(L−1)·L`) ve 6 rütbe
(Misafir→Efsane) toplam üzerinde çalışır (`lib/level.ts`).

## Kazanım kuralları (canlı değerler)

| Aksiyon | Taban | Günlük hak | Günlük XP tavanı |
|---|---|---|---|
| Günlük giriş (`daily_login`) | +10 | 1 | 10 |
| Seri kilometre (`streak_bonus`) | 3 gün +10 / 7 gün +25 / 14 gün +60 / 30 gün +150 | günde 1 | 200 |
| DLE — zorluğa göre (`game_finish`) | kolay +20 · orta +30 · zor +40 (kayıp +5) | 3 | 60 |
| Voice Duel / Kim Bu Karakter (`quiz_finish`) | +10 | 3 | 30 |
| Topluluk gönderisi (`forum_post`) | +15 | 2 | 30 |
| Gönderi yorumu (`forum_comment`) | +5 | 4 | 20 |
| Fan lore okuma (`lore_read`) | +5 | 6 | 30 |
| Liste ekleme (`list_add`) | +5 | 5 | 25 |
| Watch Party'ye katılım (`watch_party`) | +20 | 1 | 20 |

**Global günlük tavan: 300 XP** — aşılamaz; kısmi ödeme yapılır (verilebilen kadar).
Haftalık/sezonluk tavan yok (bilinçli: sadakat teşvik edilmeli).

## Günlük liste / hedef

Ana sayfa XP kartının altında **günlük hedef çubuğu** vardır: `DAILY_GOAL_XP = 100`.
Bugünkü etkinlik XP'si (oturum açtıysan Firestore senkronunda da görünür)
göstergeyi doldurur; hedef tamamlanınca çubuk yeşile döner. Sıfırlanan kayıtta
`anisyncdle_today_v3_<gün>` anahtarı ve defter `entries` TR günüyle saklanır.

Seri mantığı (`applyDailyVisit`):
- Aynı gün ikinci giriş → XP yok (`alreadyVisited`).
- Son giriş yarın ise seri +1; atlanmışsa seri 1'e düşer.
- Kilometre gününde bonus **tam o günde** bir kez yazılır (`streak_bonus:<gün>:<seri>`).

## Idempotency

Her kazanım benzersiz anahtara bağlıdır:
`daily_login:<gün>`, `dle_daily:<gün>`, `dle_practice:<tur>`, `voice_duel:<tur>`,
`forum_post:<id>`, `forum_comment:<id>`, `lore:<kayıt>:<gün>`, `list_add:<mal_id>:<gün>`,
`watch_party:<gün>`. Aynı anahtar ikinci kez XP vermez — sayfa yenileme,
StrictMode çift çağrısı veya çift tıklama XP şişirmez.

## Misafir → hesap taşıması

XP kapsamı kimliksiz `guest` iken cihazda saklanır; Google/e-posta ile girişten sonra
(`XpBridge`) `uid:<uid>` kapsamına **bir kez** taşınır; misafir kapsam temizlenir.
Çakışan kazanımlar (aynı anahtar) bir kez sayılır.

## Senkron ve liderlik tablosu

- Yerel defter yetkilidir; uzak değer **yalnızca toplamdan büyükse** benimsenir
  (yeni cihaz geçişi). Yerel değişiklikler 1.5 sn debounce ile `users/{uid}`'a
  `setDoc(merge)` edilir. Alanlar: `xpTotal`, `xpStreak`, `xpBestStreak`, `xpUpdatedAt`.
- `fetchXpLeaderboard(10)`: `orderBy('xpTotal', 'desc')` ilk 10. Alanı olmayan
  kullanıcılar listelenmez; herkese açık `users` okuma izni nedeniyle **alan istemci-
  yazılabilir** — sıralama rekabet sinyalidir, adalet garantisi değildir.
- Kullanıcı profili XP rozetleri/doldurmaları `OtakuRankBadges` içinde gösterilir.

## Bilinen sınırlar (dürüst)

1. **İstemci-yazılabilir xpTotal.** Sahte XP mümkün; sunucu taraflı doğrulama yok.
   Kısıtlama ancak Admin SDK tabanlı uç nokta + hız sınırı + kurallarla sağlanır
   (takip listesi: `docs/observability.md` Backlog).
2. **Misafir XP'si cihaza kilitlidir** — temizleme/başka cihaz taşıması imkânsızdır
   (tasarımdan bilinçli).
3. **Liderlik tablosu** yalnızca hesabı olan ve `xpTotal > 0` olanları sıralar;
   boş listede dürüst boş durum + "giriş yap" yönlendirmesi gösterilir.
4. **Emin olun:** kazanım kuralları istemcide ve kurallar serttir ama müsait
   kodla kopyalanabilir; amaç hileyi imkânsız kılmak değil, casual farm'ı zorlaştırmak.
5. XP salt-okunur izleme verisiyle karışmaz: izleme karması değişmeden kalır;
   etkinlik XP'si ayrıca gösterilir (rozet kartında `+N xp_engagement_xp`).

## Testler

- `src/lib/xp.test.ts` — 15 test: sanitize, günlük ziyaret + seri + kilometre,
  oyun/örnek tavanı, global tavan (kısmi ödeme), idempotent birleştirme.
- `src/lib/characterOrder.test.ts` — 14 test: deterministik seçim, döngü permütasyonu,
  zorluk türetimi (%60 karakter + %40 seri), ağırlıklı kademeli zorluk.
- `src/data/characterGuessData.test.ts` — tur bileşimi ve 4 dil bütünlüğü.
