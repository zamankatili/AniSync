# Mevsimsel ambiyans — tasarım ve uygulama notları

*Son güncelleme: 17 Kasım 2026 · Durum: yayında (kod + testler)*

## 1. Ne yapıyor?

AniSync'e, bulunduğun mevsime ve günün saatine göre değişen **dekoratif** bir
katman eklendi:

- sabit, çok düşük alfalı bir mevsim tonu (her modda),
- isteğe bağlı yavaş parçacıklar (kar, taç yaprağı, yaprak, toz, ateş böceği),
- çok seyrek, tek seferlik doğa sesleri (kuş, cırcır, rüzgâr, kar sessizliği).

Ambiyans **içerik değildir**: hava durumu, konum, canlı yayın veya "şu an
yağmur yağıyor" gibi hiçbir iddia taşımaz. Tamamen yerel takvim + sentezlenmiş
ses kullanır.

## 2. Ürün kararı: üç mod

| Mod | Görsel | Parçacık | Ses |
| --- | --- | --- | --- |
| `off` | yok | yok | yok |
| `calm` (varsayılan) | sabit ton | yok | genel ses açıksa seyrek vurgu |
| `full` | sabit ton | var | genel ses açıksa seyrek vurgu |

**Neden varsayılan `calm`?** İlk ziyaretçiye ne hareket ne ses dayatmak
istiyoruz; ama özelliği de görünmez kılmak istemiyoruz. `calm` tek bir sabit
degrade katmanıdır: pil ve CPU maliyeti yok, hareket yok, ses yok. `full`
parçacıkları açık bir tercih gerektirir.

**Neden ses için ayrı anahtar yok?** Ürün kuralı tek bir ses tercihi: feed
çanı, hatırlatıcı, Life Sim ve ambiyans aynı `useSoundStore.enabled` değerine
uyar. Böylece "ambiyansı kapatmadan sesi kapat" gibi ikinci bir sözleşme
doğmaz. Ses varsayılan olarak **kapalıdır**; açılmadıkça hiçbir örnek çalmaz.

**Neden yarımküre elle seçiliyor?** Konum izni istemiyoruz (`geolocation`
çağrısı yok, izin istemi yok). Varsayılan kuzey yarımküre; güneydeki kullanıcı
tek dokunuşla çevirir. Tercih `localStorage`'da `anisync_ambience` anahtarında
saklanır; bozuk/eksik kayıt `calm` + `north` olarak çözülür ve asla `full`'a
yükseltilmez (fail-closed).

## 3. Mevsim ve faz motoru

`src/lib/ambience/season.ts`

- **Mevsim**: kuzey yarımküre meteorolojik takvim (Mar–May ilkbahar, Haz–Ağu
  yaz, Eyl–Kas sonbahar, Ara–Şub kış). Güney için karşıt mevsim.
- **Faz**: 05–07 şafak, 08–16 gündüz, 17–19 akşamüstü, 20–04 gece.
- **Parçacık**: kış → kar, ilkbahar → taç yaprağı, sonbahar → yaprak,
  yaz gündüz → toz, yaz gece → ateş böceği.
- **Vurgu**: gece → yaz/cırcır, kış → rüzgâr; gündüz kış → kar sessizliği,
  sonbahar → rüzgâr, ilkbahar/yaz → kuş.
- **Yoğunluk**: 0.45–1.1 arası; kış en yoğun, yaz gündüzü en seyrek.

Yaz gecesi için ayrı, daha serin yeşil bir palet vardır; diğer durumlar mevsim
paletini kullanır.

## 4. Vurgu saati: 15 / 27 / 45

`src/lib/ambience/schedule.ts`

| Vurgu | Taban aralık |
| --- | --- |
| Kuş | 15 dk |
| Cırcır | 27 dk |
| Rüzgâr | 45 dk |
| Kar sessizliği | 45 dk |

- Her aralığa **±%20 sapma** uygulanır; tam saat gibi tıklayan ritim yok.
- Sapma `random` enjekte edilerek test edilebilir.
- Sekme uykuya dalıp saatler sonra döndüğünde kaçırılan vurgular **toplu hâlde
  patlatılmaz**; saat ileri sıçratılır ve tek vurgu çalar.
- Mevsim/faz değişince (ör. kış → ilkbahar) saat sıfırlanır; "anında kuş"
  olmaz.
- Zamanlayıcı yalnızca tüketici varsa kurulur: `calm` + ses kapalı = sıfır
  zamanlayıcı, sıfır CPU.

## 5. Ses: tamamen sentetik, döngüsüz

`src/lib/ambience/audio.ts`

- **Hiçbir ses dosyası yok.** Kuş cıvıltısı, cırcır darbeleri, rüzgâr ve alçak
  "hush" tonu Web Audio osilatörleri + tarayıcıda üretilen kahverengi gürültü
  ile sentezlenir. Dolayısıyla üçüncü taraf lisans yükümlülüğü yoktur.
- Vurgular **kısa ve tek seferliktir** (≈0.5–3.6 sn). Döngüsel yatak yok:
  döngü dikişi tık sesi, sürekli pil tüketimi ve "istenmeyen sürekli ses"
  riskleri ortadan kalkar.
- Tavan `0.05 × kullanıcı ses seviyesi`; UI çanının (0.085) belirgin altında.
- `AudioContext` yalnızca kullanıcı etkileşiminden sonra çalışır. Genel ses
  kapalıysa veya context `running` değilse hiçbir düğüm kurulmaz.
- Rota/sekme değişiminde çalan vurgu 120 ms'lik fade ile susturulur.

## 6. Duraklatılan rotalar

`/watch-party`, `/music-quiz`, `/voice-duel`, `/anime-life-sim`

Gerekçeler:

- Watch Party: video izlenirken parçacık/ses dikkat dağıtır.
- Music Quiz: ambiyans sesi cevapları maskeler.
- Voice Duel: mikrofon kaydına ortam sesi karışır.
- Life Sim: oyunun kendi ses tasarımı ve atmosferi var.

Bu rotalarda katman hiç monte edilmez, `AudioContext` vurgusu kesilir ve
`html[data-ambience]` özniteliği silinir.

## 7. Erişilebilirlik

- `prefers-reduced-motion: reduce` → parçacık yok, yalnızca sabit ton. Panelde
  bunun nedeni yazılıdır; ses bir hareket olmadığı için ayrıca kapatılmaz.
- Tüm düğmeler en az 44×44 px (`touch-target` / `min-h-[44px]`).
- Mod ve yarımküre seçimleri `aria-pressed` ile bildirilir; gruplar
  `role="group"` + `aria-label` taşır.
- Popover `role="dialog"`, `aria-label`, Escape ve dış tıklama ile kapanır;
  rota değişiminde kendiliğinden kapanır.
- Katman `aria-hidden="true"` ve `pointer-events-none`; ekran okuyucu ve
  klavye için görünmez.
- Paneldeki tüm metinler dört dilde (TR/EN/JA/FR) çevrilidir.

## 8. Performans bütçesi

- Parçacık tuvali yalnızca `full` + hareket azaltma kapalı + sekme görünür +
  rota uygun iken çizilir.
- DPR ≤ 2; parçacık sayısı ekran alanına göre 14–110 arasında ölçeklenir.
- Sekme gizlenince `requestAnimationFrame` çizim yapmaz; görünürlük değişince
  saat ve ses de durur.
- `calm` modda canvas hiç oluşturulmaz.
- Katman `-z-10` sabit konumludur; sayfa düzenine girmez, scroll'u etkilemez.

## 9. Dürüstlük ve gizlilik

- Konum izni yok, IP tabanlı tahmin yok, hava durumu servisi yok.
- Hiçbir "canlı", "şu an", "gerçek zamanlı hava" iddiası yok; panelde
  "Dekoratif" rozeti ve kapsam notu görünür.
- Analitik olayı gönderilmez; tercih yalnızca `localStorage`'da tutulur.
- `html[data-ambience="<mevsim>-<faz>-<mod>"]` yalnızca QA/hata ayıklama için
  eklenir; kişisel veri içermez.

## 10. Dosya haritası

| Dosya | Görev |
| --- | --- |
| `src/lib/ambience/season.ts` | mevsim/faz/palet/parçacık/vurgu saf motoru |
| `src/lib/ambience/schedule.ts` | 15/27/45 aralıkları, sapma, telafi |
| `src/lib/ambience/audio.ts` | sentetik tek seferlik doğa sesleri |
| `src/store/useAmbienceStore.ts` | mod + yarımküre tercihi, fail-closed çözümleyici |
| `src/hooks/useSeasonalAmbience.ts` | profil tazeleme, görünürlük, ses kilidi, vurgu saati |
| `src/components/SeasonalAmbience.tsx` | sabit ton + canvas parçacıkları |
| `src/components/AmbienceControl.tsx` | popover (masaüstü) + inline (mobil) panel |
| `src/i18nProductPass.ts` | 38 anahtar × 4 dil |

## 11. Test haritası

| Dosya | Kapsam |
| --- | --- |
| `src/lib/ambience/season.test.ts` | 14 test: 12 ay mevsim eşlemesi, güney kayması, faz sınırları, parçacık/vurgu/palet, yoğunluk aralığı, duraklatılan rotalar, 4 dil etiket anahtarları |
| `src/lib/ambience/schedule.test.ts` | 10 test: 15/27/45 sabitleri, ±%20 sapma, deterministik örnek, uzun uykudan sonra toplu patlama yasağı, profil değişiminde sıfırlama |
| `src/store/useAmbienceStore.test.ts` | 7 test: ilk ziyaret/boş/bozuk JSON → `calm`+`north`, bilinmeyen modun `full`'a yükselmemesi |
| `src/i18n/locales/locales.test.ts` | 4 dil anahtar paritesi + Literal `t()` anahtarları |

Toplam: **31 yeni test** (14 + 10 + 7), ayrıca mevcut i18n parity kapısı.

## 12. Manuel QA kontrol listesi

1. İlk ziyaret: `localStorage` boş → ton görünür, parçacık yok, ses yok.
2. Panelde "Hareketli" seç → parçacıklar başlar, yenileme sonrası kalır.
3. "Kapalı" seç → katman kaybolur, `html[data-ambience]` silinir.
4. Güney yarımküre seç → mevsim etiketi değişir (ör. Kasım → İlkbahar).
5. Genel ses kapalıyken "Genel sesi aç" → tek tık, sonrasında düğme "Genel sesi kapat" olur; vurgular yalnızca saat geldiğinde çalar.
6. `prefers-reduced-motion` aç → "Hareketli" seçili olsa bile parçacık yok,
   panelde gerekçe yazıyor.
7. `/watch-party` (ve diğer üç rota) → katman yok, ses kesilir.
8. Sekmeyi arkaya al → çizim ve zamanlayıcı durur; geri dönünce tek vurgu.
9. 390 px: panelde yatay taşma yok, tüm düğmeler 44 px, "Daha fazla"
   sayfasında inline panel görünür.
10. TR/EN/JA/FR: tüm etiketler çevrili, konsol temiz.

## 13. Bilinen sınırlar

- Yarımküre otomatik algılanmaz (bilinçli gizlilik kararı).
- Ses vurguları 15 dakikadan erken gelmez; bu bir "önizleme" düğmesi yoktur.
  Kullanıcı sesin nasıl geldiğini duymak için beklemek zorundadır — istenirse
  ileride tek seferlik "örnek çal" düğmesi eklenebilir (ayrı ürün kararı).
- Parçacık hızları sabittir; cihaz yüküne göre uyarlanmaz (sabit üst sınır
  yeterli kabul edildi).
- `calm` modda ses vurguları yine çalışır; "sessiz ama hareketli" kombinasyonu
  için ses zaten genel tercihe bağlıdır.
