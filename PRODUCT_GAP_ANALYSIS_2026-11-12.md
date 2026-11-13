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

## 2. Doğrulama kapıları (12–13 Kasım 2026, bu çalışma ağacı)

| Kapı | Komut | Sonuç |
|---|---|---|
| TypeScript (strict) | `npx.cmd tsc --noEmit` | ✅ exit 0 |
| Testler | `npm.cmd test -- --run` | ✅ **15 dosya / 100 test** |
| Üretim derlemesi | `npm.cmd run build` | ✅ exit 0 (route-level code splitting korunuyor) |
| ESLint | `npx.cmd eslint src --quiet` | ✅ 0 error (uyarılar önceden var olan stil uyarıları) |

Yeni test dosyaları:

- `src/data/universePaths.test.ts` — 8 dünya, 5 rütbe, ikilem önekleri, ilerleme kırpma.
- `src/data/characterGuessData.test.ts` — 30+ karakter, 12+ seri, 4 benzersiz şık, dört dilde ipucu/not.
- `src/data/fanLore.test.ts` — 24+ kayıt, kategori/kaynak/çeviri bütünlüğü, üç dilde arama, spoiler dağılımı.
- `src/data/textAdventure.test.ts` — 7 test: dört dilde oda/eşya/son/ipucu bütünlüğü, tekil kimlikler, ulaşılabilir harita, eşyaların yerleşimi, fiil eşlemesi.
- `src/lib/textAdventureEngine.test.ts` — 15 test: üç sona giden tam yürüyüş, karanlık arşiv, kilitli kapılar, yanlış kod, dört dilde komut, kaydet/yükle ve bozuk kayıt, ipucu kademeleri, durum değişmezliği.

Tarayıcı dumanı (localhost, TR):

- `/lore` → 27 kayıt, spoiler cevapları gizli, "CEVABI GÖSTER" çalışıyor, konsol hatası yok.
- `/voice-duel` → mod seçici görünüyor; **İpucu Tanıma** ile 10 turluk oyun başlıyor, dört dilli ipucu ve dört şık geliyor, konsol hatası yok.
- KÖŞE paneli → oda sekmeleri ve besteci çiziliyor, konsol hatası yok.
- `/text-adventure` → tam yürüyüş sona ulaşıyor (%100), son kartı ve "BAŞTAN BAŞLA" çalışıyor, kaydet/yükle turu doğrulandı; 390 ve 320 px genişlikte yatay taşma yok, çipler yatay kayıyor, odaklanınca komut alanı sabit çubukların üstüne geliyor; konsol hatası yok.

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
10. **Metin macera tek bölüm.** "Kayıp Bölüm" 7 oda / 15–25 dakika; ikinci bölüm, `undo` komutu, başarım ve oyuncu yazımı editörü yok. İçerik dört dilde elle yazıldığı için büyüme hızı düşük — bu bilinçli.
11. **Yönlendirmeli Google girişi gerçek cihazda test edilmedi.** Kod yolu (`signInWithRedirect` + `getRedirectResult`) eklendi ve popup kapatma hatadan sayılmıyor; ancak popup engelleyen bir tarayıcıda ve Capacitor WebView'de uçtan uca denenmedi. WebView için hâlâ yerel auth eklentisi gerekebilir.
12. **Dokunma hedefleri sayfa sayfa eşit değil.** Oyun sayfasında tüm düğmeler ≥44 px; uygulamanın geri kalanında hâlâ 32–36 px kontroller var. Sistematik bir erişilebilirlik taraması yapılmadı.

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
- Life Sim olay kimlikleri dünya öneklerine uymalı; `universePaths.test.ts` ve `eventEngine.test.ts` bunu zorlar.
- PWA `public/sw.js` kabuğu (`anisync-shell-v2`) dağıtımdan sonra kısa süre eski sürümü servis edebilir; gezinme network-first, hash'li varlıklar cache-first. Eski derleme görünürse SW/cache temizle.
