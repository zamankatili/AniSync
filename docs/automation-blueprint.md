# AniSync Otomasyon Mimarisi — "Kurgulanmış Motorlar" Analizi ve Geliştirme Planı

*15 Kasım 2026 · `src/data/*` ve `api/*` envanteri · Kapsam: **analiz + plan**; bu belge kod değiştirmez*

---

## 1. Mevcut "içerik motorları" (hepsi elle küratörlü, tek dosya)

| Motor | Dosya | Boyut | Durum | Otomasyon potansiyeli |
|---|---|---|---|---|
| Yayın akışı (bu hafta ne çıkıyor) | `airingSchedule.ts` + `fetchLiveScheduleForDay` | 452 satır + canlı AniList | **Yarı-otomatik** — statik yedek + canlı | ✅ %95 — canlı veri zaten var; yedeği Sahneler gibi periyodik tazeleme |
| DLE günlük karakter | `charactersPool.ts` + `characterOrder.ts` | 417 satır | Deterministik permütasyon, fame-scored | ✅ meta veri (AniList ID→kapak) otomatik tazele |
| "Kim Bu Karakter?" | `characterGuessData.ts` | **94.4 KB / 1706 satır** | Elle | ✅ trivia afiş/ID'leri AniList'ten |
| Müzik quizi | `musicQuizData.ts` | **64.1 KB / 1541 satır** | Elle | ⚠️ AI-draft + insan onayı |
| Haftalık 50 soru challenge | `weeklyChallengeBank.ts` | 43.6 KB | Elle (+`isOpinionPoll` alanı) | ⚠️ AI-draft + insan onayı |
| Günlük anket | `polls.ts` → Firestore `polls` | 315 satır seed | Admin panelinden yayınla | ✅ **AI haftalık 5 öneri → 1 tıkla yayınla** |
| Günün sorusu | `dailyPrompts.ts` | 197 satır | Elle 4 dil | ✅ AI-draft + yalnız dil revizyonu |
| Fan lore | `fanLore.ts` | 45 KB | Elle | ⚠️ spekülasyon = insan |
| İkonik Sahneler | `iconicScenes.ts` | 342 satır | oEmbed-doğrulamalı | ✅ **ölü embed'i CI yakarsa "üret" değil "denetle"** |
| Ses savaşları (Voice Duel) | `voiceDuelData.ts` | 390 satır | oEmbed-doğrulamalı | ✅ aynı denetim |
| Text adventure | `textAdventure.ts` | 40 KB | Elle | ⚠️ hikâye yaratıcı — insan |
| Fallback önerileri | `fallbackLists.ts` | 378 satır | Elle | ✅ AniList trending'ten üret |
| Beklenti listesi seed | `watchPartySeed.ts` | 70 satır | Elle | ✅ canlı yayından doldur |
| Rozetler | `badgeData.ts` | 345 satır | Kural-tabanlı | ✅ kodifiye (zaten öyle) |
| Haber akışı | `/api/anime-news` (RSS) | 15 dk cache | **Otomatik** ✅ | + AI TL;DR (GEMINI_API_KEY gerekir) |
| Oyun içerikleri (Steam/RAWG) | `api/games/*` | 2 endpoint | **Otomatik** ✅ | genişletilebilir |
| Manga/roman arama | AniList GraphQL | canlı | ✅ | — |

**Özet: ~470 KB elle yazılmış tek dosya.** Her biri 4 dil + elle bakım; taşınan iş anı kazandıran değil, doğruluk taşıyan kısımlar.

---

## 2. Altın kural (her otomasyon kararı için)

> **AI metni yalnız varsayılan; insan onayı varsayılan yayın.**
> Olgusal içerik (bölüm sayısı, tarih, stüdyo) → AniList/Kitsu/Jikan ID'sine bağlanır, uydurma asla.
> Yaratıcı içerik (soru, alıntı, lore) → AI taslağı → **admin onayı** olmadan `polls`/`weeklyChallengeBank`'a yazılmaz.
> Alıntılar → **yalnız kanonik ve herkesçe bilinen** (mevcut İkonik Sahneler/Voice Duel standardı).

Otomasyon enerjisini "yazmak" için değil, **doğrulamak** için kullanın.

---

## 3. Uygulanabilir otomasyon katmanları

### A. Denetim otomasyonu (hemen, S boy — en yüksek getirili)
- **Haftalık CI workflow** (`verify-embeds.yml`): 15 sahne + 21 ses kaydı + `polls.ts`/`fallbackLists.ts`/`watchPartySeed.ts` içindeki tüm `s4.anilist.co` kapak ID'lerine HEAD/oEmbed isteği atar; kırık → build fail → PR açar. ~1 saatlik iş; elle "link öldü mü diye bak" işi biter.
- `verify:api` zaten var; aynı mantık dışarıda.

### B. Besleme otomasyonu (bu hafta, M boy)
- **"Bu hafta animelerde"** kartı: AniList seasonal-trending → Gemini (key varsa) → 5 madde TR TL;DR → admin onayı → `announcements` koleksiyonu veya haftalık challenge açıklamasına. Key yoksa: madde listesi ham başlıklarla (dürüst, AI-siz).
- **Günlük Anket önerici**: Admin paneline "✨ 5 Öneri Üret" butonu → `useWeeklyChallengeStore` trendlerinden (veya doğrudan AniList top-10) → mevcut `polls` yayınla akışına (aynı Firestore `polls`) — yeni UI gerekmez, yalnız liste üretimi.

### C. İçerik üretim otomasyonu (sprint, L boy — dikkatli)
- **Challenge Bank motoru**: AniList `media` alanları (stüdyo, bölüm, yıl, tür) üzerinden 4-seçenekli soru taslakları. Örn. "Shingeki no Kyojin hangi stüdyoda yapıldı?" — doğru cevap AniList'te; dikkat: silinen/yeniden adlandırılan kayıtlar var (ör. `Wit Studio`→`MAPPA` geçişi) → **soru mutlaka "hangi stüdyoda BAŞLADI?" gibi tek-doğru formatında** olur ve yalnız id-match ile doğrulanır.
- Onay paneli: `AdminPage` → yeni "İçerik Önerileri" bölümü (mevcut "Günlük Anketi Yayınla" komşusu): AI taslak → "Düzenle & Yayınla" / "Reddet".

### D. Sistem otomasyonu (zaten büyük ölçüde var)
- ✅ Vercel cron `/api/refresh-news` (`0 5 * * *`) — haber tazeleme
- ✅ `verify:api` + CI + immutable assets + SW v3
- ✅ Firestore tek-yazar kuralı (polls/posts/recentActivities)
- ➕ Öneri: cron sayısını 1'e değil **`/api/refresh-news` + `/api/verify-embeds`** (gitHub Actions tarafında) ayırın; Vercel hobby cron limiti var, GH Actions'ta limit yok.

---

## 4. Önerilen sıralama

```
[bugün, 1-2s]  A) GH Action: oEmbed + CDN doğrulama haftalık (kırık embed → fail)
[bu hafta, M]  B1) Günlük Anket "5 öneri" butonu (anilist top-10) + admin onayı
[bu hafta, S]  B2) Günün sorusu: AI-draft 30 yeni prompt (fix language only) — insan dokunuşu korunur
[sprint, M]    B3) "Bu hafta animelerde" TL;DR (Gemini_API_KEY gerekir; yoksa ham)
[sprint, L]    C)  Challenge bank AI-draft → onay paneli (AdminPage yeni bölüm)
[opsiyon]      FallbackLists/SeedRefresh: ID-listesine göre kapak/isim tazeleme skripti
```

## 5. Ölçek / maliyet hesabı

- **GET/WRITE hacmi:** A/B katmanı Firestore'a **yazmaz** (yalnız okuma + admin tıklaması ile yazar) → maliyet sıfıra yakın.
- **Gemini:** ücretsiz kademe → `B3` günlük 1 istek × 30 = 30/ay (sığar). C soru başına ~1 istek; haftada 50 soru → 200/ay.
- **CI:** GH Actions 2.000 ücretsiz dakika/ay (public repo) → haftalık verify ~1 dk.
- **İnsan:** haftalık ~20-30 dk admin onay süresi (şu an 0'dan 50 soru/hafta elle yazılıyor — çok daha kötü).

## 6. Yapılmayacaklar

- Fan lore/spekülasyon: **yaratıcı metin**, AI'ya bırakılmaz (kanıtlanabilirlik yok).
- "Kesin doğru" sınıfındaki sorular bile **insan onayı olmadan** yayına çıkmaz (AniList kayıt hatası riski).
- Ses savaşları/ikonik sahneler: **içerik üretme**, yalnız **doğrulama** (telif & doğruluk).
- Anime alıntıları: **kanonik + herkesçe bilinen** dışında AI'ya yazdırılmaz (ses benzerliği hukuki ihlale girer).

---

## 7. Bana düşen

A'dan başlayarak istediğiniz dalgayı uygulayabilirim (`.github/workflows/verify-embeds.yml` + admin paneli önerisi + B1/B2). Hangi dalgayla başlayalım?
