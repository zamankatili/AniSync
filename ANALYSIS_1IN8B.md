# 8 Milyarda 1 (1in8b.life) — Analiz ve AniSync Karşılaştırması

Kaynak: https://1in8b.life/tr/ (v0.9.59 beta), about sayfası, country sayfaları (TR, JPN), 172 ülke tablosu.

## 1. Oyunun Çekirdek Mekaniği

### 1.1 Doğum Yeri Seçimi (random, stats-based)
- Varsayılan: **doğum sayısı** oranlı (172 ülke/bölge, UN WPP 2024)
- Alternatif: **nüfus** oranlı ("Şu an yaşayan 8 milyar kişi")
- Cinsiyet ve ailenin imkânları da gerçek paylara uyar
- Hiçbir ödeme bunları değiştirmez (etik tasarım)
- İsteğe bağlı: gerçekte doğduğun yeri girip karşılaştırma (yalnızca cihazda saklanır)

### 1.2 Dünya/Zaman Seçimi
- **Bugün** (varsayılan) — bugünkü istatistikler
- **Geçmiş** (1950-2025) — o yılın istatistikleri + gerçek tarihi olaylar (savaşlar, katliamlar)
- **Gelecek** — BM projeksiyonları
- **Herhangi bir dünya**

### 1.3 Hayat Uzunluğu
- ~30 dk / ~1 saat (varsayılan) / ~1.5 saat
- 1 saatte bir yıl ≈ 40-60 saniye
- Duraklatma + 16x hızlandırma
- Pencere kapatılsa bile aynı tarayıcıda devam

### 1.4 Yaşam Döngüsü
- Her yıl bir **odak seçimi**: okul, iş, aşk, yurt dışına taşınma, tedavi vb.
- Seçimler **olasılıkları değiştirir ama sonucu asla belirlemez**
- Doğduğun yerin istatistiklerinden tamamen kurtulmak zor
- Çoğu hayat sıradan
- **5, 15, 30, 50, 70 yaşında zaman durur ve bir soru sorulur**
- "Otomatik karar" seçeneği (izleme modu)
- Aynı saniyede doğan 4 bebeğin hayatı da seninkinin yanında akar (paralel hayatlar)

### 1.5 Ölüm
- Ölüm yaşı: **cinsiyete göre yaşam tablolarından yıl yıl çekilir** (ortalama değil!)
- Ölüm nedenleri: DSÖ GHE (Küresel Sağlık Tahminleri) bölgeye/yaşa göre kalıplar
- Bebeklikte bitebilir, çok uzun sürebilir
- Ölüm kaydı: hayata geri bakış

### 1.6 Ağır Konular
- Ölüm, hastalık, savaş, yoksulluk, içki/kumar, madde bağımlılığı, ev içi şiddet, cinsel şiddet, intihar
- Gerçek istatistik sıklığında yaşanır
- Hiçbir sahne gösterilmez
- Nereden yardım alınabileceği her zaman yazar
- "Korkutucu sahneleri çıkar" seçeneği
- 15+ yaş için tasarlandı

### 1.7 Zaman/UX
- 2+ saat kalırsa mola önerisi
- Ağır sahneleri çıkar seçeneği
- "Zorlandığında" bölümü

### 1.8 Kayıt/Paylaşım
- Hesap yok, tarayıcıda saklanır
- "Kayıtları taşı" kodu ile cihazlar arası
- Paylaşım kartı (telefon paylaşım menüsü, X, Threads)
- "Paylaşılan hayatlar" — anonim paylaşım + mum yakma
- Hatıra paketi (129 TL) — film/albüm/kitap (opsiyonel, ücretsiz her şey aynı çalışır)
- 30 gün iade

### 1.9 Eğitim Modu
- `?edu=1` — ağır temalar geri çekilir, yazı paylaşma ve ödemeler kapalı
- Öğretmen rehberi, 40 dk ders akışı

### 1.10 Veri Kaynakları (172 ülke/bölge)
BM WPP 2024 (doğumlar, nüfus, yaşam beklentisi, doğurganlık), UN IGME (çocuk ölümleri), DSÖ/UN MMEIG (anne ölümleri, tütün, trafik), UNDP/UNESCO (eğitim), Dünya Bankası (gelir, Gini, internet, sağlık harcaması), ILO (tarım), UN-Habitat (kentleşme), UNAIDS (HIV), UNODC (cinayetler), UNICEF (çocuk yaşta evlilik), Dünya Mutluluk Raporu 2024. Eksik değerler bölgesel ortalamalarla tamamlanmış.

## 2. AniSync Anime Life Sim — Mevcut Durum

### 2.1 Veri Katmanı
- 8 anime evreni (animeWorlds.ts): shonen_battle, slice_of_life, dark_fantasy, isekai, cyberpunk, seinen_psych, romance_drama, sports
- Her evren: emoji, nameTR, descriptionTR, dangerLevel, lifeExpectancy, powerSystem, stats (povertyRate, powerAwakeningRate, adventureRate)
- 25 bölge (animeRegions.ts): worldId, nameTR, descriptionTR, emoji, stats
- **TÜM İÇERİK TÜRKÇE** (nameTR, descriptionTR) — i18n yok veri katmanında

### 2.2 Olay Motoru (eventEngine.ts)
- generateInitialStats: power/intelligence/luck/socialClass/health (0-100)
- Olay tipleri: birth, childhood, faction, encounter, crisis, choice, death, special
- createBirthEvent, createChildhoodEvent (2 varyant), createFactionEvent (3 evren için), createCrisisEvent (3 varyant), createCanonEncounter (5 evren için), generateMemorialText, generateAchievements
- **YENİ EKLENEN:** tournament, clan, evolution, time loop
- Ölüm: rastgele deathCauses listesinden (Yaşlılık, Hastalık, Savaş yarası, Kaza, Doğa felaketi, Bilinmeyen neden) — **yaşam tablosu YOK, rastgele**
- Memorial text: TR string template
- Achievements: TR string listesi

### 2.3 UI (AnimeLifeSim.tsx)
- 3 faz: select / playing / memorial
- Evren seçimi (8 kart), bölge seçimi, süre seçimi (30dk/1h/1.5h), başlat
- Olay kartı: emoji, başlık, yaş-yıl, açıklama, kanon karşılaşma, seçim kartları (risk etiketli), Devam Et
- İstatistik paneli (5 stat)
- Anma sayfası: memorial text, başarılar, kanon karşılaşımlar, paylaşım, yeni hayat
- **i18n YAPILDI** (bu tur): UI etiketleri TR/EN/JA/FR

## 3. Karşılaştırmalı Analiz — Eksikler ve Fırsatlar

### 3.1 Veri Temeli
| Özellik | 8 Milyarda 1 | AniSync (mevcut) |
|---|---|---|
| Doğum yeri seçimi | Gerçek doğum/nüfus oranları (172 ülke) | 8 anime evreni (eşit ağırlıklı, rastgele) |
| İstatistik kaynağı | BM/DSÖ/Dünya Bankası (gerçek) | Kurgusal (povertyRate vb. el ile) |
| Cinsiyet | Gerçek paylar | Yok |
| Aile imkânları | Gerçek paylar | Sosyal sınıf stat (rastgele) |
| Zaman dilimi | Geçmiş/Gelecek/Bugün | Yok (sadece "bugün") |
| Bölge detayı | 172 ülke, her biri için 20+ metrik | 25 anime bölgesi, 4-5 stat |

**Fırsat:** Anime evrenlerini "bölge" olarak değil, gerçek dünya ülkelerini anime evrenleriyle eşleştirerek (örn. Japonya → Shonen) hibrit bir model yapılabilir. Ama bu büyük bir pivot. Kısa vadede: evrenlerin lifeExpectancy ve stats değerlerini daha gerçekçi ve dengeli hale getirmek.

### 3.2 Yaşam Mekaniği
| Özellik | 8 Milyarda 1 | AniSync (mevcut) |
|---|---|---|
| Yıllık odak seçimi | Var (okul/iş/aşk/taşınma/tedavi) | Yok — sadece olay kartları |
| 5/15/30/50/70 yaşında soru | Var | Yok |
| Paralel hayatlar (4 bebek) | Var | Yok |
| Otomatik karar modu | Var | Yok |
| Yaşam tablosu ölüm | Var (cinsiyete göre) | Yok (rastgele deathCauses) |
| Ölüm nedenleri | DSÖ GHE bölgesel/yaşa göre | 6 sabit string |
| Hızlandırma (16x) | Var | Yok (sabit timeout 800ms) |
| Duraklatma | Var | Yok |
| Pencere kapatıp devam | Var (localStorage) | Yok (state in-memory) |

**Fırsat:** En büyük fark. AniSync şu an "olay kartı seçimi" modeli, 8 Milyarda 1 "yıllık odak + yaşam tablosu" modeli. İki modeli birleştirmek (olay kartları + yaşam tablosu ölüm + hızlandırma) güçlü olur.

### 3.3 Ağır Konular / Etik
| Özellik | 8 Milyarda 1 | AniSync (mevcut) |
|---|---|---|
| Ağır konular | Gerçek istatistik sıklığında | Kriz olayları (salgın, savaş, güç uyanışı) |
| Sahne gösterimi | Hiçbiri | Metin tabanlı |
| Yardım kaynağı | Her zaman yazar | Yok |
| Etik mod | "Korkutucu sahneleri çıkar" | Yok |
| Yaş sınırı | 15+ | Belirtilmemiş |
| Eğitim modu | `?edu=1` | Yok |
| 2 saat mola önerisi | Var | Yok |

**Fırsat:** AniSync'in anime temalı olması nedeniyle "ağır konular" zaten oyunun bir parçası (shonen savaş, dark fantasy). Ama gerçek istatistik tabanlı yaklaşım + yardım kaynağı + etik mod eklenebilir.

### 3.4 Paylaşım/Kayıt
| Özellik | 8 Milyarda 1 | AniSync (mevcut) |
|---|---|---|
| Hesap | Yok | Firebase auth var (ama life sim için kullanılmıyor) |
| Kayıt yeri | Tarayıcı | In-memory (yenilemede kaybolur) |
| Cihazlar arası | "Kayıtları taşı" kodu | Yok |
| Paylaşım | Kart (X/Threads/telefon) | navigator.clipboard.writeText (sadece text) |
| Anonim paylaşım | "Paylaşılan hayatlar" + mum yakma | Yok |
| Hatıra paketi | 129 TL (opsiyonel) | Yok |

**Fırsat:** AniSync zaten Firebase + topluluk altyapısına sahip. Life sim sonuçlarını topluluk akışında paylaşmak, "mum yakma" benzeri reaksiyonlar eklemek doğal bir entegrasyon.

### 3.5 Çok Dillilik
| Özellik | 8 Milyarda 1 | AniSync |
|---|---|---|
| Dil sayısı | 18 | 4 (TR/EN/JA/FR) |
| Veri yerelleştirme | Tam (tüm metinler) | UI yerelleştirildi, veri TR |

**Fırsat:** 8 Milyarda 1'in 18 dil desteği AniSync için de hedef olmalı. Şu an 4 dil var, genişletilebilir.

## 4. Öncelikli İyileştirme Önerileri (AniSync için)

### P0 (Kritik, kısa vade)
1. **localStorage ile kayıt** — sayfa yenilenince hayat kayboluyor. `generateLife` sonucunu localStorage'a kaydet, "devam et" butonu ekle.
2. **Hızlandırma/duraklatma** — 800ms sabit timeout yerine kullanıcı kontrollü hız (1x/2x/4x/8x/16x).
3. **Ölüm tablosu** — rastgele deathCauses yerine lifeExpectancy bazlı yıl-yıl ölüm olasılığı (yaşam tablosu). Bebeklikte ölüm olasılığı yüksek, yaşlılıkta artan.
4. **Yardım kaynağı** — kriz olaylarında (hastalık, savaş) "nereden yardım alınabileceği" metni ekle.

### P1 (Yüksek değer)
5. **Yıllık odak seçimi** — her yıl "okul/iş/aşk/taşınma/tedavi" gibi odak seçimi, 8 Milyarda 1 modeliyle uyumlu.
6. **5/15/30/50/70 yaşında soru** — yaşam dönüm noktalarında özel soru.
7. **Paralel hayatlar** — aynı saniyede doğan 4 bebeğin hayatı yan yana.
8. **Etik mod** — "ağır sahneleri çıkar" + 15+ yaş uyarısı + eğitim modu.
9. **Paylaşım kartı** — memorial sayfasında görsel kart + X/Threads/telefon paylaşım.

### P2 (Orta değer)
10. **Zaman dilimi** — Geçmiş (1950-2025) / Gelecek / Bugün seçimi. Anime evrenleri için "klasik dönem / modern / gelecek" olarak uyarlanabilir.
11. **Cinsiyet + aile imkânları** — gerçek paylara dayalı (anime evrenleri için kurgusal ama dengeli).
12. **Cihazlar arası kayıt** — "Kayıtları taşı" kodu.
13. **Topluluk entegrasyonu** — life sim sonuçlarını topluluk akışında paylaş, "mum yakma" reaksiyonu.
14. **Daha fazla dil** — 18 dile genişleme (8 Milyarda 1 standardı).

### P3 (Düşük değer / uzun vade)
15. **Hatıra paketi** benzeri premium özellik (opsiyonel).
16. **Eğitim modu** (`?edu=1`).
17. **Mola önerisi** (2+ saat).
18. **Gerçekte doğduğun yer karşılaştırması** (anime evreni ile gerçek ülke eşleştirme).

## 5. Veri Modeli Önerisi (kısa vade)

Mevcut `animeWorlds.ts` stats (povertyRate, powerAwakeningRate, adventureRate) yetersiz. 8 Milyarda 1'in metriklerinden esinlenerek genişlet:

```ts
interface WorldStats {
  povertyRate: number;        // mevcut
  powerAwakeningRate: number; // mevcut
  adventureRate: number;      // mevcut
  lifeExpectancy: [number, number]; // mevcut
  // YENİ:
  childMortality: number;     // 5 yaş altı ölüm oranı
  educationYears: number;     // beklenen eğitim yılı
  incomePPP: number;          // kişi başı gelir
  gini: number;              // gelir eşitsizliği
  urbanization: number;      // kentleşme
  internetAccess: number;     // internet erişimi
  marriageUnder18: number;    // çocuk yaşta evlilik
  homicideRate: number;       // cinayet oranı
  trafficDeaths: number;      // trafik ölümleri
  happiness: number;         // mutluluk skoru
}
```

Bu, evrenlerin "gerçekçi" hissetmesini sağlar ve gelecekte gerçek dünya verileriyle hibrit model için temel oluşturur.

## 6. Sonuç

8 Milyarda 1, **gerçek istatistik tabanlı, etik, erişilebilir** bir yaşam simülasyonu. AniSync Anime Life Sim, **anime/manga evrenlerinde kurgusal bir deneyim** sunuyor. İki yaklaşım birbirini dışlamıyor — en güçlü ürün, kurgusal anime evrenlerini gerçek dünya istatistikleriyle (yaşam tabloları, ölüm nedenleri, gelir dağılımı) birleştiren bir hibrit olur.

**Kısa vadede en yüksek değer:** localStorage kayıt + hızlandırma + yaşam tablosu ölüm + yardım kaynakları. Bu 4 iyileştirme, mevcut oyunu 8 Milyarda 1'in kalitesine yaklaştırır.