# AniSync — Yol Haritası

> **Tarih:** 2 Kasım 2026, gece
> **Durum:** v2 çekirdeği çalışıyor. v1 özellikleri sırada; v1 bizim temelimiz.
> Bu dosya "nerede kaldık, ne yapacağız, neyi neden yapıyoruz" sözleşmesi.

---

## 0. Bu gece alınan kararlar

| # | Karar | Gerekçe |
| --- | --- | --- |
| K1 | **v1 temel alınır.** Tüm v1 modülleri taşınacak, üzerine geliştirilecek. | Kullanıcının emeği ve ürün hafızası v1'de. |
| K2 | **v1 teması (AniSync Klasik) temel/varsayılan tema.** | Kullanıcı talebi: "v1'in temasını basic olarak kullanalım." |
| K3 | Diğer atmosferler seviyeyle açılır: Çay Evi **2**, Sinema **4**, Kütüphane **7**. | Merak + aidiyet döngüsü; tema bir ödül. |
| K4 | Bilgi mimarisi **5 oda**: Salon · Keşfet · Rafım · Köşe · Ben. | 11 maddelik menü mobilde kullanılamıyordu. |
| K5 | **Local-first** iskelet korunur; gerçek hesaplar Faz 3'te. | Hemen çalışan, anahtarsız, test edilebilir ürün. |
| K6 | Yayın **Vercel**; GitHub akışı **dal + PR** (main'deki v1 korunur). | Geri dönüşü olan, güvenli teslim. |

---

## 1. Şu anki durum (kanıtlı)

### Çalışan çekirdek

| Alan | Durum | Kanıt |
| --- | --- | --- |
| Tip kontrolü + build | ✅ | `tsc --noEmit` temiz, `vite build` başarılı |
| Beş oda + detay sayfası | ✅ | `/`, `/kesfet`, `/raf`, `/kose`, `/ben`, `/m/:type/:id` |
| Onboarding (isim, avatar, tür, başlangıç rafı) | ✅ | Gerçek tarayıcıda baştan sona tamamlandı |
| Arama (anime/manga/novel/oyun) | ✅ | "berserk" → 33 sonuç, tür filtreleri |
| Raf: ekleme, durum, ilerletme, puan, favori | ✅ | Sheet + kart etkileşimleri test edildi |
| Seviye/XP ve atmosfer kilidi | ✅ | L5'e çıkıp "Seviye atladın" modalı doğrulandı |
| 4 atmosfer | ✅ | Klasik, Çay Evi, Sinema, Kütüphane ekran görüntüleri |
| Mobil 390 px + masaüstü 1440 px | ✅ | Alt menü, sheet, güvenli alan |
| Ağ yoksa yerel seçki | ✅ | AniList 429'da bile ekran doluyor |
| Konsol hatası | ✅ | Son turda 0 hata / 0 istisna |
| JSON yedek al/yükle | ✅ | Ben → Ayarlar |

### Rakamlar

- **44 kaynak dosya**, ~7.600 satır (veri seçkileri dahil).
- Paket: **119 KB gzip JS**, 21 KB gzip CSS.
- Veri: AniList (anime+manga), Open Library (novel), Steam kataloğu (**41 oyun**).
- Yerel seçki: 18 anime + 18 manga + 12 novel + 14 sezonluk.
- 6 köşe, 8 örnek gönderi, 12 günlük soru.

### Henüz olmayanlar (dürüst liste)

- Gerçek hesaplar, cihazlar arası senkron, gerçek zamanlı topluluk.
- Watch Party, müzik quizi, DLE, takvim/hatırlatıcı, grid maker, analitik grafikleri.
- Push bildirimi, çevrimdışı service worker, i18n.
- Otomatik testler.

---

## 2. v1 envanteri → hedef

İşaretler: ✅ taşındı · 🟡 kısmi · ⬜ planlı · 🔁 yeniden yazılacak

| v1 modülü | Ne yapıyordu | v2 durumu | Faz |
| --- | --- | --- | --- |
| MyList / anime takip | Durum, bölüm, puan | ✅ Rafım (daha sade) | — |
| Named lists / Lists | Özel listeler, oy verme | 🟡 iskelet var (varsayılan 3 liste) | 1–3 |
| Import/Export (MAL, AniList) | Dış listeleri içe alma | ⬜ | 1 |
| Airing Calendar + hatırlatıcı | Yayın takvimi, bildirim | ⬜ | 2 |
| AnimeGridMaker | Poster kolajı dışa aktarma | ⬜ | 2 |
| Profil analitiği | Aylık aktivite, tür dağılımı, donut | ⬜ | 2 |
| BadgeShowcase / OtakuRank | Rozet ve rütbe vitrini | 🟡 rozetler var, vitrin yok | 4 |
| Weekly/Daily Challenge | Görev, XP, seri | 🟡 XP var, görev yok | 4 |
| Daily Poll | Günlük anket | ⬜ | 4 |
| Music Quiz | Anime müziği tahmin oyunu | ⬜ | 4 |
| AniSync DLE | Günlük karakter tahmini | ⬜ | 4 |
| Watch Party | Oda, video, sohbet, reaksiyon | ⬜ | 3 |
| Global Chat | Anlık genel sohbet | ⬜ | 3 |
| Comments / Community Reviews | Eser başına yorum ve inceleme | 🟡 eser altı akış var | 3 |
| Social Feed / MemeZone | Topluluk akışı, meme | ✅ Köşe / ⬜ meme | 3–5 |
| SimilarAnimeFinder | Benzer eser bulma | 🟡 "Benzer hisler" (tür bazlı) | 5 |
| AI Recommendations (Gemini) | Kişisel öneri | ⬜ | 5 |
| TasteProfileSurvey | Zevk profili anketi | ⬜ | 5 |
| AnimeNewsFeed | Haber akışı | ⬜ | 5 |
| AnimeRadioPlayer | Radyo/çalar | ⬜ (telif) | 6 |
| i18n (TR/EN/JA) | Çok dil | ⬜ (TR-first) | 5 |
| ThemeSwitcher | Saat bazlı tema | ✅ Atmosfer sistemi (daha ileri) | — |
| AuthModal (Firebase) | Giriş/kayıt | 🔁 Supabase ile | 3 |
| ImportExportModal (yedek) | JSON yedek | ✅ | — |
| ErrorConsoleModal | Hata konsolu | 🟡 ErrorBoundary | 6 |
| SEO yönetimi | Sayfa meta/JSON-LD | 🟡 statik meta | 5 |

---

## 3. Fazlar

### Faz 0 — Çekirdek ✅ (tamam)
Beş oda, dört atmosfer, seviye mekaniği, gerçek veri, mobil düzen, yerel kalıcılık.

### Faz 1 — v1 kimliği + kütüphane araçları (1–2 gün)
**Hedef:** v1'in "listeler ve takip" gücünü yeni kabuğa taşımak.

- [x] Klasik tema varsayılan, Çay Evi L2
- [x] Klasik tema v1'e birebir yaklaştırıldı (nokta ızgara, 28 sn renk döngüsü, 4px gölge, beyaz şeritli kartlar)
- [x] MAL XML + AniList JSON içe aktarma (dosya + yapıştırma; MAL kayıtları AniList kapaklarıyla eşleniyor)
- [x] Raf: arama + sıralama (ad / puan / ilerleme / güncelleme)
- [x] Raf: çoklu seçim, toplu durum
- [x] Özel listeler (oluştur, emoji/renk, eser ekle–çıkar, metin olarak paylaş)
- [x] Eser başına kişisel not (spoiler etiketli)
- [x] Atmosfer 5: "Şafak" (seviye 10 ödülü)

**Kabul:** Bir MAL yedeği yüklenip 200+ kayıt 3 sn içinde rafta görünüyor; liste metni panoya kopyalanıyor. (Paylaşılabilir herkese açık bağlantı, hesaplarla birlikte Faz 3'te.)

### Faz 2 — Takvim, koleksiyon, analiz (2–3 gün)
- [ ] Yayın takvimi (haftalık ızgara), "bugün" şeridi
- [ ] Hatırlatıcı + tarayıcı bildirimi + iCal dışa aktarma
- [ ] Grid maker: seçili 9/16 posteri 1080×1350 PNG olarak indir
- [ ] Profil analitiği: aylık aktivite, tür dağılımı, tamamlama oranı (hafif SVG)
- [ ] "Yılın özeti" (2026 wrapped) — paylaşılabilir kart

**Kabul:** Takvimden bir diziye hatırlatıcı kuruluyor, 15 dk önce bildirim geliyor; grid PNG indiriliyor.

### Faz 3 — Gerçek topluluk (3–5 gün)
- [ ] Supabase: `profiles`, `shelf_entries`, `posts`, `replies`, `clubs`, `club_members`
- [ ] Auth: e-posta + Google; misafir → hesap birleştirme
- [ ] Realtime Köşe: gönderi/yanıt/beğeni anlık
- [ ] Watch Party v1: oda + senkron trailer + sohbet + uçan reaksiyon
- [ ] Global Chat (oda bazlı)
- [ ] Bildirimler: in-app + web push
- [ ] Moderasyon: raporla, spoiler zorunluluğu, yavaş mod

**Kabul:** İki farklı tarayıcı aynı odada aynı saniyede reaksiyon gönderiyor; yeni gönderi diğer cihazda <1 sn'de görünüyor.

### Faz 4 — Ritüeller ve oyunlar (3–4 gün)
- [ ] Haftalık görev zinciri + ödül (atmosfer/rozet), günlük anket
- [ ] Music Quiz (v1 veri bankası 65 KB hazır)
- [ ] DLE (günlük karakter)
- [ ] Rozet vitrini + OtakuRank
- [ ] Seri (streak) sigortası: 1 gün kaçırma hakkı

**Kabul:** Haftalık görev tamamlanınca XP + rozet + atmosfer ödülü veriliyor; quiz skoru liderlik tablosuna düşüyor.

### Faz 5 — Zeka ve dil (3–4 gün)
- [ ] Zevk profili anketi → embedding/etiket tabanlı öneri
- [ ] AI öneri: sunucu tarafı (Gemini/DeepSeek), önbellekli, maliyet kontrollü
- [ ] Benzer eser: AniList relations + tür/etiket skoru
- [ ] Haber akışı (RSS/AniList duyuruları)
- [ ] i18n: TR + EN (JA sonra)
- [ ] SEO: rota bazlı meta, OG görseli, sitemap

**Kabul:** Öneriler kullanıcının rafına göre değişiyor; dil değişimi tüm arayüzü kapsıyor.

### Faz 6 — Mobil ve mağaza (5–7 gün)
- [ ] PWA service worker (çevrimdışı raf + görsel önbelleği)
- [ ] Capacitor: Android + iOS kabuğu, paylaşım, geri tuşu, durum çubuğu
- [ ] Push (FCM/APNs), derin bağlantı
- [ ] Mağaza görselleri, gizlilik politikası, yaş derecelendirmesi
- [ ] AnimeRadioPlayer (telif temiz kaynaklarla)

**Kabul:** Android'de APK iç test; iOS TestFlight; uçak modunda raf açılıyor.

### Faz 7 — Büyüme (sürekli)
Etkinlikler (sezon maratonu, "haftanın masası"), davet sistemi, gönüllü destek/üyelik, moderatör araçları, haftalık ürün raporu.

---

## 4. Teknik borç ve riskler

| Risk | Etki | Önlem |
| --- | --- | --- |
| AniList 90 istek/dk | Arama/keşif boş kalır | Mevcut cache + timeout; Faz 3'te Vercel proxy + 5 dk cache |
| Görsel CDN (AniList/Steam/OL) | Yavaş/engelli ağ | `large` boyut kullanımı; Faz 6'da image proxy |
| localStorage ~5 MB | Büyük raf/akış taşar | Faz 2'de IndexedDB'ye geçiş |
| Test yok | Regresyon riski | Faz 1'de Vitest (store), Faz 3'te Playwright (akışlar) |
| Telif (müzik/radyo/video) | Mağaza reddi | Yalnız resmi embed/trailer; ses için lisanslı kaynak |
| Moderasyon | Toksik içerik | Faz 3'te raporlama + kural metni + yavaş mod |
| Tek kişi bakımı | Yavaşlama | Fazlar küçük, her faz sonunda yayınlanabilir |

---

## 5. GitHub bağlantısı — nasıl yaparız

Bu oturumdan repoya **doğrudan** yazabilmem için Git + GitHub CLI kurulu ve yetkili olmalı.
Token'ı sohbete yazmana gerek yok; `gh` kendi güvenli deposunda tutar.

### Seçenek A — önerilen (5 dakika)

1. **Kurulum** (yönetici PowerShell):
   ```powershell
   winget install --id Git.Git -e
   winget install --id GitHub.cli -e
   ```
2. **Yeni bir terminal aç** (PATH güncellensin), sonra:
   ```powershell
   gh auth login
   ```
   → `GitHub.com` → `HTTPS` → `Login with a web browser` → ekrandaki kodu gir.
   ```powershell
   gh auth setup-git
   gh auth status
   ```
3. Bana **"hazır"** yaz. Ben şunları yapacağım:
   - Mevcut klasörü git deposuna çevirip `v2` dalına commit edeceğim.
   - `origin` = `https://github.com/zamankatili/AniSync.git`
   - `main` korunacak; PR açılacak. Sen onaylayınca Vercel yeni sürümü alacak.

   Çalıştıracağım komutlar (şeffaflık için):
   ```powershell
   git init -b v2
   git remote add origin https://github.com/zamankatili/AniSync.git
   git add -A
   git commit -m "feat: AniSync v2 — otaku mahallesi çekirdeği"
   git push -u origin v2
   gh pr create --base main --head v2 --title "AniSync v2: mekân çekirdeği" --body "..."
   ```

### Seçenek B — kişisel erişim anahtarı (önerilmez)
Token'ı sohbete yazma. Zorunluysa bir dosyaya koy (`gh auth login --with-token < token.txt`) ve dosyayı iş sonrası sil.

### Seçenek C — tarayıcıdan manuel yükleme
44 dosyayı sürükle-bırak ile yüklemek mümkün ama `node_modules`/`dist` hariç tutulmalı ve eski dosyalar silinmeli; hata payı yüksek. Önerilmez.

### Yükleme öncesi kontrol listesi
- [x] `node_modules/`, `dist/`, `.tmp/`, `.npm-cache/` `.gitignore`'da
- [x] Firebase/AI Studio artıkları silindi
- [x] `package-lock.json` yeni bağımlılıklarla güncel
- [ ] `gh auth status` yeşil
- [ ] (istersen) Vercel projesine `v2` dalı için preview

---

## 6. İlk üç iş (yarın)

1. **GitHub + PR** — v2'yi güvenceye al, Vercel preview'ı gör.
2. **Faz 1'in ilk yarısı** — MAL/AniList içe aktarma + raf araçları.
3. **Vercel ayarı** — framework Vite, build `npm run build`, output `dist`; eski URL güncellensin.

---

## 7. Karar bekleyen sorular

1. **Hesap altyapısı:** Supabase (öneri) mi, Firebase mi?
2. **Watch Party:** yalnız resmî trailer mı, harici embed mi? (telif + güvenlik)
3. **AI öneri:** sağlayıcı ve aylık bütçe?
4. **Dil:** TR-only mu, EN de olsun mu? (JA sonra)
5. **Marka:** "AniSync" kalsın mı; yoksa mekân adı öne mi çıksın ("AniSync — Mahalle")?
6. **Topluluk:** yaş sınırı, spoiler politikası, moderasyon kademesi?

---

## 8. Ölçüm (ürün sağlığı)

- **Aktivasyon:** onboarding tamamlama, ilk raf ekleme (hedef: %60)
- **Elde tutma:** 7. gün dönüş, 3+ gün seri (hedef: %25)
- **Sosyal:** raf başına gönderi/yanıt (hedef: 0,2)
- **Performans:** LCP < 2,5 sn, JS < 150 KB gzip, CLS < 0,05
- **Güvenilirlik:** JS hata oranı < %0,5, API fallback oranı

---

*Bu dosya yaşayan bir belge. Her faz sonunda "Durum" ve "Kararlar" bölümleri güncellenir.*
