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

## 2. Doğrulama kapıları (12 Kasım 2026, bu çalışma ağacı)

| Kapı | Komut | Sonuç |
|---|---|---|
| TypeScript (strict) | `npx.cmd tsc --noEmit` | ✅ exit 0 |
| Testler | `npm.cmd test -- --run` | ✅ **13 dosya / 78 test** |
| Üretim derlemesi | `npm.cmd run build` | ✅ exit 0 (route-level code splitting korunuyor) |
| ESLint | `npx.cmd eslint src` | ✅ 0 error (uyarılar önceden var olan stil uyarıları) |

Yeni test dosyaları:

- `src/data/universePaths.test.ts` — 8 dünya, 5 rütbe, ikilem önekleri, ilerleme kırpma.
- `src/data/characterGuessData.test.ts` — 30+ karakter, 12+ seri, 4 benzersiz şık, dört dilde ipucu/not.
- `src/data/fanLore.test.ts` — 24+ kayıt, kategori/kaynak/çeviri bütünlüğü, üç dilde arama, spoiler dağılımı.

Tarayıcı dumanı (localhost, TR):

- `/lore` → 27 kayıt, spoiler cevapları gizli, "CEVABI GÖSTER" çalışıyor, konsol hatası yok.
- `/voice-duel` → mod seçici görünüyor; **İpucu Tanıma** ile 10 turluk oyun başlıyor, dört dilli ipucu ve dört şık geliyor, konsol hatası yok.
- KÖŞE paneli → oda sekmeleri ve besteci çiziliyor, konsol hatası yok.

---

## 3. Dürüst backlog (bu turda kapatılmayanlar)

Öncelik sırasıyla; hiçbiri "yapıldı" gibi gösterilmemelidir.

1. **Auth'lu uçtan uca test yok.** Tarayıcı oturumu kapalı olduğu için oda onayı (50 oy → moderatör), Kalfa doğrudan oda açma, Watch Party senkronu ve admin paneli yalnızca kod + Firestore kurallarıyla doğrulandı. Gerçek hesapla imzalı smoke şart.
2. **Native arka plan bildirimi yok.** `@capacitor/local-notifications` kurulu değil; Capacitor WebView'de Web Notification çoğu cihazda çalışmaz. Arayüz bunu açıkça söylüyor, sessiz başarısızlık yok — ama gerçek çözüm eklenti entegrasyonu.
3. **Gemini kapalı.** Sağlanan anahtar 402 (ön ödeme kredisi bitti). `GEMINI_API_KEY` Vercel'de bilinçli olarak yok; öneri/moderasyon fail-closed ve arayüz "AI çevrimdışı — editör seçkisi" diyor. Sağlayıcı kararı (Groq/OpenRouter/AI Studio) verilmedi.
4. **KVKK otomasyonu yok.** Silme/dışa aktarma hâlâ kuyruk + manuel e-posta; otomatik işleyici yazılmadı.
5. **`FIREBASE_TOKEN` yok.** GitHub `deploy-rules.yml` bu yüzden düşüyor; kural/index dağıtımı manuel.
6. **Kalan sabit Türkçe metinler.** `MemeZone`, `MonthlyActivityChart`, `ProfileAnalyticsDashboard` ve bazı `FeedPost` yedek liste adlarında hâlâ sabit metin var; tam i18n taraması bitmedi (`locales.test.ts` yalnızca `t()` anahtarlarını ve JSX'te bilinen kalıpları tarar).
7. **ESLint uyarıları.** Hata 0; uyarı sayısı yüksek ve `--max-warnings` kapısı gevşek.
8. **Bundle izleme.** `recharts` ağır; Life Sim ayrı chunk (~300 KB) kabul edilebilir ama izlenmeli.
9. **Fan Bilgisi büyüme hızı.** 27 kayıt elle seçildi; yeni kayıt eklemek kaynak doğrulaması gerektirir. Otomatik üretim yok — bu bilinçli bir karar.

---

## 4. Veri kaynakları ve dürüstlük sözleşmesi (değişmedi)

- Anime/manga: **AniList birincil** → Jikan (SFW) yedek → açıkça etiketli katalog/boş durum.
- Roman: OpenLibrary. Oyun: Steam (`/api/games/*`). Haber: `/api/anime-news`.
- "Canlı" etiketi yalnızca gerçekten canlı veri için. Gecikme/eksiklik footer'da yazılı.
- Voice Duel klipleri yalnızca resmî Madoka Exedra kanalından; atıf `docs/voice-sources.md` içinde.
- Life Sim senaryoları kurgudur; kanon değildir ve ekranda böyle yazar.
- Fan Bilgisi küratörlüdür; canlı haber değildir ve sayfada böyle yazar.

---

## 5. DeepSeek için hızlı devir notları

- Çalışma dizini: `C:\Users\semih\Documents\Qoder\anisync\app` (yalnızca `app/`, `AniSync-main/` değil).
- Windows: `npm.cmd`, `npx.cmd`, `firebase.cmd` kullan; PowerShell git/gh stderr'i hata gibi gösterir.
- Locale dosyaları aynı anahtar kümesini korumalı; anahtar tekrarı TS1117 verir; BOM'suz UTF-8.
- Yeni UI metni eklerken büyük locale dosyalarını düzenlemek yerine `i18nProductPass.ts`'e eklemek daha güvenli.
- Life Sim olay kimlikleri dünya öneklerine uymalı; `universePaths.test.ts` ve `eventEngine.test.ts` bunu zorlar.
- PWA `public/sw.js` kabuğu (`anisync-shell-v2`) dağıtımdan sonra kısa süre eski sürümü servis edebilir; gezinme network-first, hash'li varlıklar cache-first. Eski derleme görünürse SW/cache temizle.
