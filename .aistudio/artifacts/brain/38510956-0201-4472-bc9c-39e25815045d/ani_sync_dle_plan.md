# AniSyncDle: Blurred/Pixelated Poster Reveal - Tasarım Planı

## Oyun Mekaniği
- **Temel:** Her gün "Günün Anime Karakteri" değişir.
- **Görsel:** Karakterin resmi başlangıçta yüksek oranda pikselleştirilmiş veya bulanıklaştırılmıştır.
- **İpucu/Açılma:** Kullanıcı her yanlış tahmin yaptığında görselin bulanıklığı azalır veya pikseller daha net hale gelir.
- **Tahmin:** Kullanıcılar karakterin ismini (veya serisini) tahmin eder.

## Karakter Havuzu
- Tüm zamanların klasikleri, popüler seriler ve shounen/seinen türlerinden karma bir havuz.
- Zorluk seviyesini artırmak için günlük modda serbest, antrenman modunda tür seçmeli seçenekler.

## Teknik Plan
1. **Veri Modeli:** `AnimeCharacter` (id, name, series, imageUrl, difficulty)
2. **Oyun Mantığı:**
    - `currentDailyCharacter`: Firestore'dan günlük çekilecek.
    - `guesses`: Kullanıcının tahmin geçmişi.
    - `blurLevel`: `guesses.length` değerine bağlı dinamik CSS filtresi.
3. **Bileşenler:**
    - `BlurredImage`: Canvas veya CSS `filter: blur()` kullanarak görüntüyü işleyecek.
    - `GuessInput`: Otomatik tamamlama özellikli tahmin kutusu.
    - `StatsModal`: Günlük başarı istatistikleri.
