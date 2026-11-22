# KÖŞE — sohbet yüzeyi (tasarım, veri, dürüstlük sınırları)

Son güncelleme: 21 Kasım 2026.

KÖŞE, AniSync'in topluluk sohbetidir. Bu belge 21 Kasım'daki derinleştirme
turunun kararlarını, veri modelini, bilinen sınırlarını ve elle QA adımlarını
kaydeder. Forum akışı KÖŞE'den çıkarılmadı: ana sayfadaki `CommunityPulse`
olarak yaşamaya devam ediyor.

## 1. Tek sohbet, iki kabuk

Aynı durum modeli iki görünümü besler:

| Görünüm | Dosya | Ne zaman |
| --- | --- | --- |
| Yüzen panel | `src/components/GlobalChat.tsx` | Sağ alttaki FAB; mobil ve masaüstü |
| Tam sayfa | `src/components/ChatCafe.tsx` | Panelden "büyüt"; mobilde de tam sayfa |

Panel ile tam sayfa **aynı React durumunu** okur: seçili oda, taslak, yanıt
hedefi, arama terimi ve oda listesi geçişte korunur. Bu yüzden:

- Panelde yazmaya başlayıp büyütünce metin kaybolmaz.
- Tam sayfada oda değiştirip panele dönünce aynı oda açık kalır.
- Arama her iki kabukta da aynı sonuç kümesini gösterir.

Tam sayfa düzeni:

- Sol: odalar (resmî + topluluk, okunmamış sayısı ve son mesaj önizlemesi).
  1024px altında çekmeceye taşınır.
- Orta: mesaj akışı + yazma alanı.
- Sağ (1280px+): ANİME RADYOSU, seviye/XP, ev kuralları ve kapsam notu.

Forum gönderileri, beğeniler ve yorumlar artık KÖŞE'nin içinde değil;
ana sayfa akışında. Böylece "sohbet" ile "forum" aynı panelde iki farklı
şeymiş gibi görünmüyor.

## 2. Mesaj deneyimi

### Yazma

- Enter gönderir, Shift+Enter yeni satır açar; IME kompozisyonu
  (`isComposing` / `keyCode === 229`) gönderimi tetiklemez.
- Sınır **250 karakter** (`CHAT_MESSAGE_MAX`). Firestore kuralı 500'e kadar
  izin verir; UI daha dar tutar.
- Oda başına taslak `localStorage`'da saklanır (`anisync_chat_drafts_v1`).
  Oda değişince eski taslak yazılır, yeni odanın taslağı yüklenir.
- Gönderim sonrası taslak temizlenir; hata olursa metin ve yanıt hedefi geri
  yüklenir.
- İstemci tarafı 1,5 sn hız sınırı vardır (sunucu tarafı değildir; kötüye
  kullanım Firestore kurallarıyla ayrıca sınırlanmaz).

### Biçimlendirme

Mesaj gövdesi `src/lib/chatText.ts` ile ayrıştırılır ve **React düğümleri**
olarak basılır; `dangerouslySetInnerHTML` kullanılmaz.

| Yazım | Sonuç |
| --- | --- |
| `||gizli||` | Dokununca açılan spoiler; her spoiler bağımsız açılır |
| `https://…` | Yalnız http(s) bağlantısı, yeni sekmede, `noopener noreferrer nofollow` |
| `@isim` | Amber vurgu; görünen adın ilk kelimesi eşleşir |

- Kapanmayan `||` ve boş `||||` düz metin olarak kalır.
- `javascript:` gibi şemalar asla bağlantıya dönüşmez.
- Spoiler içindeki bağlantı/anma çözümlenmez (içerik sızdırmamak için).
- Oda listesi önizlemesi spoiler metnini `•••` ile maskeler.
- Yazma alanındaki `||…||` düğmesi seçili metni sarar; seçim yoksa imleci
  iki çubuğun arasına koyar.

### Yanıt, kopyalama, silme

- **Yanıt**: mesajın altındaki ok düğmesi `replyTo` hedefi kurar ve yazma
  alanına odaklanır. Yanıt, **yeni mesaj dokümanında** `replyTo`
  `{id,name,text}` alanı olarak taşınır. Eski mesajlar güncellenmez; bu yüzden
  ek Firestore kuralı/izin gerekmez. Alıntıya dokunmak orijinal mesaja kaydırır
  ve kısa süre vurgular.
- **Kopyala**: panoya yazar; izin yoksa dürüst hata toast'ı gösterir.
- **Sil**: yalnız kendi mesajı. `window.confirm` yerine iki adımlı satır içi
  onay vardır. Misafirin yerel mesajı yalnız cihazdan silinir.
- **Şikayet**: başkasının mesajında `ReportButton` aynı satırda durur.

### Liste davranışı

- Gün ayırıcıları ve "son ziyaretinden beri" çizgisi `src/lib/chatTimeline.ts`
  tarafından üretilir.
- Aynı yazarın 5 dakika içindeki ardışık mesajları gruplanır.
- Kullanıcı yukarıdayken yeni mesaj gelirse konum zorla değişmez; "en sona git"
  düğmesi okunmamış sayısıyla görünür. Kendi mesajı gönderilince otomatik
  en alta dönülür.
- Sana gelen `@anma` mesajları sol kenarda rose şerit ve "SANA" rozeti taşır.

## 3. Odalar ve okunmamışlar

- Resmî odalar `src/lib/rooms.ts` içinde kodla tanımlıdır; adları 4 dilde
  çevrilir.
- Topluluk odaları `chatRooms` koleksiyonundan gelir.
- Kalfa (≥500 XP) doğrudan oda açar; altındaki kullanıcı oda isteği açar
  (50 oy + moderatör onayı). Akışlar `RoomRequestModal` ve `RoomQueuePanel`
  içinde korunmuştur.
- Okunmamış sayısı ve son mesaj önizlemesi **ikinci bir dinleyiciden** gelir:
  `globalChat` `orderBy createdAt desc limit(80)`. Bu yüzden sayı bir üst
  sınırdır; "tam okunmamış" iddiası taşımaz ve eski mesajlar pencere dışında
  kalabilir.
- Son ziyaret damgası oda başına `localStorage`'da tutulur
  (`anisync_chat_last_visit_<oda>`). Farklı cihazlar arasında paylaşılmaz.
- Aktif odanın akışı `where roomId == … orderBy createdAt desc limit(50)`.
  Bileşik indeks yoksa küresel son 50'ye düşer ve konsola uyarı yazar.

## 4. Veri modeli

`globalChat/{id}`:

```ts
{
  text: string;        // ≤250 UI, kural 500
  roomId: string;      // yoksa 'genel' kabul edilir
  uid: string;         // kural: request.auth.uid
  name: string;
  avatar: string;      // URL veya boş
  createdAt: Timestamp;
  replyTo?: { id: string; name: string; text: string };
}
```

- `replyTo.name` ≤60, `replyTo.text` ≤140 karaktere kırpılır
  (`normalizeReplyRef`).
- `update` yalnız admine açıktır; `delete` sahibine ve admine açıktır.
- Misafir mesajları Firestore'a **hiç yazılmaz**: günde 3 mesaj, yalnız
  `localStorage` (`anisync_anon_messages_v1`, 24 saat TTL) ve "bu cihazda"
  rozetiyle görünür. Misafir yanıtı kalıcı değildir.

## 5. Dürüstlük sınırları (bilinçli olarak yok)

- **Tepki/emoji, yazıyor göstergesi, çevrimiçi durumu yok.** Bunlar yeni
  koleksiyon/kural ve kural dağıtımı gerektirir; dağıtım bu ortamda bloke.
  Sahte "3 kişi çevrimiçi" göstergesi basılmaz.
- Kapalı FAB üzerinde **uydurma okunmamış noktası yoktur**; eski sabit ping
  kaldırıldı.
- Arama **yalnız yüklü aktif oda penceresinde** çalışır; tüm geçmişte arama
  iddiası yoktur.
- Okunmamış sayısı yaklaşıktır (80 mesajlık pencere).
- Mesaj düzenleme yoktur; yalnız silme vardır.
- Ses: KÖŞE kendi sesini çalmaz. Radyo ve genel ses tercihi tek global
  anahtara uyar; varsayılan kapalıdır.

## 6. Erişilebilirlik ve mobil

- Tüm eylem düğmeleri en az 44×44 px (`min-h-11 min-w-11`).
- Mesaj akışı `role="log" aria-live="polite" aria-relevant="additions"`.
- Oda listesi `aria-current="page"`; okunmamış rozetleri erişilebilir etiketli.
- Spoiler düğmeleri `aria-label` + `aria-expanded` taşır; aç/kapa ayrı
  hedeflerdir.
- Mobilde: 390px'te tam sayfa, tek sütun; odalar çekmecede; yazma alanı
  `env(safe-area-inset-bottom)` boşluğu bırakır.
- Escape çekmeceyi kapatır; çekmece açılınca kapat düğmesine odak gider.
- Arama çubuğu otomatik odaklanırken `autoFocus` özniteliği yerine ref +
  effect kullanılır (erişilebilirlik lint kuralı).

## 7. Testler

Saf mantık katmanı 42 testle kilitlidir:

| Dosya | Kapsam |
| --- | --- |
| `src/lib/chatText.test.ts` | spoiler, link, anma, önizleme, yanıt normalizasyonu |
| `src/lib/chatTimeline.test.ts` | gün ayırıcı, gruplama, yeni çizgisi, kendi/anma |
| `src/lib/chatOverview.test.ts` | okunmamış, son mesaj, ziyaret damgası, bozuk depolama |
| `src/lib/chatDrafts.test.ts` | oda başına taslak, sınır, temizleme |

i18n paritesi `src/i18n/locales/locales.test.ts` içinde ayrıca doğrulanır:
`chat_*` anahtarlarının tamamı TR/EN/JA/FR'de bulunur.

## 8. Elle QA kontrol listesi

1. 390×844: FAB → panel açılır; oda sekmeleri yatay kaydırılabilir, sayfa
   taşmaz.
2. Panelde metin yaz → büyüt → metin ve oda aynı; tam sayfada gönder.
3. Oda değiştir → taslak korunur; geri dön → taslak geri gelir.
4. `||spoiler||` gönder → kapalı rozet; dokun → aç; tekrar dokun → kapan.
5. `https://example.com` gönder → bağlantı; `javascript:` bağlantı olmaz.
6. `@kullanıcı` gönder → amber vurgu; karşı tarafta "SANA" rozeti.
7. Bir mesajı yanıtla → alıntı görünür; alıntıya dokun → orijinal vurgulanır.
8. Kendi mesajını sil → satır içi onay; vazgeç ve sil yolları.
9. Arama aç → terim yaz → vurgu; eşleşme yoksa dürüst boş durum.
10. Odalar çekmecesi: aç, oda seç, kapan; Escape ile kapan.
11. Konsol: hata yok; yalnız beklenen geliştirme uyarıları.
