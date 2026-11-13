# Metin macera araştırması — "Kayıp Bölüm"

Bu not, AniSync'e eklenen `/text-adventure` oyununun neden bu şekilde
tasarlandığını kaydeder. Oyun **özgündür**: Zork veya başka bir metin
macera oyunundan alınmış metin, bulmaca ya da harita yoktur. Zork yalnızca
türün kurucu örneği olarak incelendi.

## Neler okundu

- **Zork (1977–79, Infocom)** — [Wikipedia](https://en.wikipedia.org/wiki/Zork).
  Zork, Büyük Yeraltı İmparatorluğu'nda geçen, oyuncunun yazdığı komutlarla
  ilerlediği bir metin maceradır. Infocom'un beş kelimelik komut
  yorumlayıcısı türün standardını belirledi: fiil + nesne (+ edat + nesne).
  Ders: oyuncuya *sınırlı ama tutarlı* bir dil vermek, geniş ama tahmin
  edilemez bir dil vermekten iyidir.
- **Emily Short, "Writing Novice-friendly Parser Games" (2016)** —
  [emshort.blog](https://emshort.blog/2016/04/15/writing-novice-friendly-parser-games/).
  Yeni başlayanlar için iki yaklaşım var: "maximalist" (önce oyuncuya
  deneyimini sor) ve "minimalist" (oyunu kendi kendine öğreten küçük bir
  dünya kur). Öne çıkan öneriler:
  - çıktıda etkileşilebilir isimleri vurgulamak,
  - bağlama duyarlı ipuçları vermek,
  - oyuncuyu suçlamayan, yeniden denemeye davet eden hata mesajları yazmak,
  - ilk birkaç dakikada oyuncuya "burada ne yapabilirim?" sorusunu
    yanıtlatmak.
- **"Parser-based Interactive Fiction: A Primer"** — [clarafv.com](https://clarafv.com/2019/05/13/parser-based-interactive-fiction-a-primer/).
  Komut kalıpları, envanter, harita ve "undo/restart" gibi meta komutların
  türün ortak sözleşmesi olduğunu doğruladı.
- **intfiction.org ve Choice of Games forumları** — ipucu sisteminin
  varlığını oyuncuya *açıkça* duyurmak gerektiği, aksi halde oyuncunun
  takıldığında oyunu bıraktığı yönünde tekrar eden geri bildirim.

## Alınan tasarım kararları

| Ders | "Kayıp Bölüm"de karşılığı |
| --- | --- |
| Küçük, tutarlı dünya | 7 oda: kulüp, koridor, arşiv, depo, gösterim odası, projeksiyon odası, çıkış holü. Harita tek ekranda anlaşılır. |
| Sınırlı fiil seti | `bak`, `git`, `al`, `bırak`, `kullan`, `aç`, `konuş` + meta komutlar. Dört dilde eşanlamlılar ve tek harfli yönler (`k`, `g`, `d`, `b`, `y`, `a`). |
| Oyuncuya komutları göstermek | Terminalin altında dokunulabilir komut çipleri; sağ panelde kalıcı "Nasıl oynanır" metni. |
| Bağlama duyarlı ipucu | `ipucu` ilk istekte bulunduğun aşamaya uygun tek bir ipucu verir; ikinci istekte açık çözümü gösterir. |
| Suçlamayan hata mesajları | "Bunu anlamadım. `yardım` yazarak komutları görebilirsin." — oyuncuya "yanlış" demez. |
| Kısa oyun, net son | 15–25 dakikalık tek oturum; üç farklı son (`sakla`, `sil`, `bırak`) yeniden oynamayı anlamlı kılar. |
| Kaydet / yükle | `kaydet` / `yükle` localStorage'a yazar; sekme kapanınca ilerleme kaybolmaz. |
| Erişilebilirlik | Klavye ile tam oynanır, `aria-live` günlük, 44 px dokunma hedefleri, komut geçmişi (↑/↓), mobilde yatay kayan çipler. |
| Dürüstlük | Sayfada "özgün hikâye, Zork'tan alıntı yok" notu; hiçbir yerde sahte "canlı" veri yok. |

## Neden parser, neden metin?

- Metin, anime/manga telif riski taşımadan atmosfer kurar; görsel varlık
  gerekmez ve Capacitor paketini büyütmez.
- Dört dilde aynı içerik sunmak, seslendirme veya altyazı olmadan mümkün.
- Parser, "keşfet ve birleştir" ürün felsefesine uyar: oyuncu ipuçlarını
  (nottaki 47, perdedeki 1) birleştirip 471 kodunu bulur.

## Bilinçli olarak yapılmayanlar

- Zork'un metinleri, odaları, eşyaları veya ünlü cümleleri kopyalanmadı.
- Rastgele üretilen sonsuz harita yok: küçük, elle yazılmış bir dünya
  hataların ve çıkmazların test edilebilir olmasını sağlıyor.
- Tarayıcıya ses dosyası yüklenmiyor; yalnızca mevcut nazik Web Audio
  motorundan çok kısık bir tuş sesi ve son perdesi kullanılıyor.

## Gelecek fikirler (öncelik sırasıyla)

1. İkinci bölüm: aynı kahraman, farklı stüdyo (yeni bulmaca seti).
2. Oyuncu tarafından yazılan kısa maceralar için moderasyonlu bir editör.
3. "Undo" komutu ve hamle sayacına dayalı hafif başarımlar.
4. Ekran okuyucular için satır satır "yeni metin" duyurusu.
