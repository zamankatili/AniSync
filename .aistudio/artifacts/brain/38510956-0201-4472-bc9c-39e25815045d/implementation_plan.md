# AniSync / EtyWord - Haftalık 50 Soruluk Meydan Okuma ve Topluluk Ekosistemi

Bu doküman, kullanıcının talebi doğrultusunda **Haftalık 50 Soruluk Anket & Meydan Okuma Döngüsü (Weekly Challenge)** sisteminin gün bazlı 6 soruya bölünerek Ana Sayfa (`/`), özel Meydan Okuma sayfası (`/challenge`, `/polls`), merkezi durum deposu ve rozetleme mekanizmalarıyla eksiksiz tamamlandığını belgeler.

---

## 🏆 50 Soruluk Haftalık Meydan Okuma Dağılımı

Sistem haftanın her gününe tam 6 soru (toplam 42 soru) ve hafta sonu Grand Master etabına 8 soru paylaştırarak tam **50 soru** barındırır:

| Gün İndeksi | Gün Adı | Soru Sayısı | Tema & Kategori | Örnek Konular |
| :---: | :---: | :---: | :--- | :--- |
| **0** | **Pazartesi** | **6 Soru** | **Shounen & Güç Sistemleri** | Nen kategorileri, Gon vs Pitou, Enma & Oden, Limitless Hollow Purple, Gear 5 & SSJ uyanışı. |
| **1** | **Salı** | **6 Soru** | **Seinen & Psikolojik Zeka** | Monster & Johan Liebert, Light vs L taktikleri, Band of the Hawk, Thorfinn felsefesi, Eren & Lelouch ikilemi. |
| **2** | **Çarşamba** | **6 Soru** | **Romantizm & Slice of Life** | Kaguya-sama Shirogane, Clannad & Your Lie in April, Your Name Musubi iplik bağı, A Silent Voice sembolizmi, Iyashikei. |
| **3** | **Perşembe** | **6 Soru** | **Isekai & Fantastik Dünyalar** | Re:Zero Return by Death, Mushoku Tensei dünya inşası, Overlord Suzuki Satoru, KonoSuba & Eminence komedisi, Frieren & Himmel. |
| **4** | **Cuma** | **6 Soru** | **Müzik, Sanat & Stüdyolar** | Evangelion OP, Ufotable & MAPPA akıcılığı, Hiroyuki Sawano tınıları, Studio Ghibli Joe Hisaishi, Kenjiro Tsuda seiyuu gücü. |
| **5** | **Cumartesi** | **6 Soru** | **Felsefe & Büyük İkilemler** | Eşdeğer Değiş-Tokuş kanunu, Death Note ahlakı, Reading Steiner hafızası, Rumbling ikilemi, Fani yaşam vs Frieren ömrü. |
| **6** | **Pazar** | **6 Soru** | **Büyük Düellolar & Fan Oylaması** | G.O.A.T anime seçimi (FMAB vs AOT), Manga vs Anime (Berserk/Vagabond), 2026 gelecek projeleri, Zoro sadakati, 2011 altın yılı. |
| **7** | **Büyük Final** | **8 Soru** | **Efsaneler Kulübü & Grand Finale** | Bleach Zangetsu kökeni, Psycho-Pass Sibyl, Toradora Taiga, Tensura Tempest bağı, Bocchi Kessoku, Human Instrumentality, Tsukuyomi teslimiyeti, Anime kültürü son söz. |
| **TOPLAM** | **8 Aşama** | **50 Soru** | **Tüm Anime Evrenleri** | **42 Günlük Soru + 8 Büyük Final Sorusu = 50 Soru** |

---

## 🛠️ Mimari & Geliştirilen Bileşenler

1. **Merkezi Durum Yönetimi (`/src/store/useWeeklyChallengeStore.ts`):**
   - Zustand ve `localStorage` kalıcılığı (`anisync_weekly_challenge_v2`).
   - Soru yanıtları, dinamik oy yüzdeleri, anlık oy ekleme, günlük seri (streak), kazanılan toplam XP (+10 / +15 / +50 XP bonusları).
   - Günlük tamamlanma durumu (`6/6 Soru`), genel haftalık ilerleme (`X / 50 Soru`).
   - 7 adet Otaku Rozeti: *İlk Kıvılcım, Gün Fatihi, Güç Şampiyonu, Zihin Taktisyeni, Alevli Seri, Yarı Yol Otakusu, 50 Soruluk Efsane*.

2. **Ana Sayfa İnteraktif Meydan Okuma Kartı (`/src/components/WeeklyChallengeWidget.tsx`):**
   - Ana Sayfa (`/`) sosyal akışının tam kalbinde yer alır.
   - PZT (6), SAL (6), ÇAR (6), PER (6), CUM (6), CMT (6), PAZ (6), FİNAL (8) etap butonları.
   - Doğrudan kart üzerinden soru yanıtlama, anlık oy yüzdesi çubukları, doğru/yanlış geri bildirimi, bilgi ve derinlik notu (Lore).
   - Tam ekrana geçiş ve `/challenge` rotasına yönlendirme.
   - Ana sayfa sağ kenar çubuğundaki sayaç da canlı mağaza verisiyle senkronize çalışır.

3. **Özel Meydan Okuma & Anket Sayfası (`/src/pages/WeeklyChallengePage.tsx`):**
   - `/challenge` ve `/polls` URL'leri üzerinden erişilir.
   - Üst bilgi paneli: Çözülen sorular (`X / 50 Soru`), Günlük Seri (`🔥 Z Gün`), Toplam XP, Tamamlanan Etaplar.
   - Etap filtreleri: Tümü, Bilgi Testleri (Quizzes), Topluluk Anketleri (Polls), Boş Kalanlar.
   - Haftalık Rozetler vitrini ve "Topluluk Akışında Paylaş" özelliği.

4. **Doğrulama & Optimizasyon:**
   - Ana sayfadaki mükerrer `<QuickContinueWatching />` bileşeni kaldırıldı.
   - TypeScript derleme (`compile_applet`) ve tip kontrolü (`tsc --noEmit`) sıfır hata ile doğrulandı.
