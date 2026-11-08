# Life Sim — Evren Uyumlu Olay/Soru Analizi
*Tarih: 8 Kasım 2026 · Kapsam: `eventEngine.ts`, `data/lore/*`, `data/animeRegions.ts`, `src/pages/AnimeLifeSim.tsx`*

## 0. Özet
Motorun olay/ünlüden türeyen kısımları (fraksiyon seçimi, kanon karşılaşmaları) zaten bölgeye duyarlı; ancak **soru şablonlarının büyük çoğunluğu evren-bağımsız** (çocukluk, kriz, dönüm noktası, odak kontrolü) ve hatta **fraksiyon seçimi 8 evrenden 5'i için yanlış/eksik**: `slice_of_life`, `romance_drama`, `sports`, `seinen_psych`, `cyberpunk` evrenlerinde şablon `shonen_battle`'a düşer — yani Huzurevleri/Romantik Dram/Spor evreninde korsan-denizci seçimi görülür. "Soru akışı" (hangi olay ne zaman gelir, ağır olaylar var/yok, ölüm biçimleri) da evrenden bağımsız dağılıma sahiptir.

## 1. Mevcut dünyaya-duyarlı / dünya-bağımsız olaylar (doğrulanmış harita)

| Olay | Tür | 8 evrene uyarlanmış mı? | Kanıt |
|---|---|---|---|
| Doğum (`birth`) | `birth` | ⚠️ Kısmen (region LE var, dünya teması yok) | `createBirthEvent` |
| Çocukluk (`childhood`) | `childhood` | ❌ Generik | `createChildhoodEvent` |
| Fraksiyon (`faction`) | `faction` | ❌ 3 evren var (shonen, dark_fantasy, isekai); **5 evren shonen'a düşer** | `createFactionEvent` |
| Turnuva (`special`) | `special` | ❌ Generik, sadece yaş 18 | `createTournamentEvent` |
| Klân (`faction`) | `faction` | ❌ Generik, yaş 20 | `createClanEvent` |
| Evrim/Uyanış (`special`) | `special` | ⚠️ güç sistemi değeri var, metin generik | `createEvolutionEvent` |
| Zaman Döngüsü | `special` | ⚠️ isekai hissi var ama her evrende %8 | `createTimeLoopEvent` |
| Dönüm Noktaları 5/15/30/50/70 | `special` | ❌ Generik | `createMilestoneEvent` |
| Odak Kontrolü (her 5 yıl) | `special` | ❌ Generik | focus check-in |
| Kanon Karşılaşmaları | `special` | ✅ Bölge bazlı (konoha/kanton/marley/jujutsu_high…) | `createCanonEncounter` |
| Kriz (`crisis`) | `crisis` | ❌ Generik (2 şablon) | `createCrisisEvent` |
| Ölüm | `death` | ✅ Bölge istatistiklerine göre (warRate/disease/etc.) | death cause ağırlığı |
| Sonuç/İstatistik | — | ❌ Generik | `generateAchievements` |

**Sonuç:** Motor "bölge" düzeyinde yeterince uyarlı, "evren" düzeyinde değil. Soru metinleri dünya lore'una bağlı ama lore verisi yalnızca `createFactionEvent`'te isim örnekleri için okunuyor (bkz. `getWorldLore(world.id)` — `factionNames`).

## 2. Hedef tasarım: `WorldEventPack` (veri-güdümlü evren adaptasyonu)
`src/data/worldEventPacks.ts` (yeni dosya, per-world ayrı):

```ts
export interface WorldUniqueEvent {
  id: string;
  age: number | { min: number; max: number };
  weight?: number;        // default 1
  titleKey: string;       // i18n key veya 4 dilli satır içi text
  descriptionKey: string;
  choices: WorldUniqueChoice[]; // LifeChoice şeklinde
  requiredStats?: Partial<LifeStats>; // örn. sports için power ≥ X
}
export interface WorldEventPack {
  worldId: string;
  factionVariant: 'none' | 'konoha' | 'isekai_guild' | 'cyberpunk' | ... // mevcut seçenekler, ya da 'none'
  hasHeavyEvents: boolean;       // dark_fantasy true; slice_of_life false
  heavyEventWeight: number;      // 0 = yok, 1 = normal, >1 = daha sık
  endingLineTone: 'light' | 'neutral' | 'dark';
  uniqueEvents: WorldUniqueEvent[];
  childhoodTheme: 'arcade' | 'school' | 'survival' | 'sports' | 'artistic';
  deathTone?: 'noble' | 'tragic' | 'peaceful';
}
```
Motor `generateLife()` içinde `WORLD_EVENT_PACKS[world.id]` okunur; yoksa fallback şu anki davranış. Olay üretim sırasına benzersiz olaylar `min(age <= deathAge)` kontrolüyle eklenir.

## 3. Evren evren soru/akış uyarlaması (önerilen içerik)

### 3.1 `slice_of_life` — "sakin günler" akışı
- Ağır kriz yok; ölüm genellikle hastalık/kaza/yaşlılık (zaten warRate=0.01).
- **Yeni olaylar:** `sol_festival` (12): "Yaz Festivali" — hazırlanmaya yardım et / arkadaşlarınla git / orman kampı yap.
- **Yeni olay:** `sol_music` (17): "Müzik Kulübü" — katıl / izle / gül
- `faction` **devre dışı**. Dönüm noktası 5/15/30/50/70 metinleri `school`/`camp`/`friends` ekseniyle yeniden yazılır.
- Ending tonu: `light` — "Hatıralar arasında yitirmeden hatırlanırsın" kapanışı.
- Ölüm nedenleri havuzu: ani hastalık, kaza, yaşlılık (şiddet yok).

### 3.2 `romance_drama` — "ilişki/duygusal olgunlaşma" akışı
- **Devre dışı:** `faction`, `tournament`, `clan`, `evolution`.
- **Yeni olaylar:** `romance_confession` (16): "İtiraf" — itiraf et / bekle / birine bırak. `romance_festival` (14): "Festival", `romance_grief` (40): "Kayıp", `romance_music` (17): "Müzik Performansı", `romance_reunion` (30): "Yıllar Sonra".
- Ölüm nedenleri: hastalık/kaza/yaşlılık (Clannad tarzı kaybına izin var ama rare).
- Beklenen "mutlu/üzücü son" dallanması `romance_grief`’ten etkilenir.

### 3.3 `sports` — "yarışma/azim" akışı
- **Devre dışı:** `faction`, `clan`; `evolution` yerine `sports_zone`.
- **Yeni olaylar:** `sports_tryout` (13): "Okul Takımı Seçmeleri" — gir / hazırlanıp gir / sporsuz kal. `sports_match` (16): "İlk Maç", `sports_championship` (18): "Turnuva", `sports_injury` (23): "Sakatlık", `sports_pro` (26): "Profesyonel mi?".
- Kritik akış: `sports_injury` → `power`, `health` düşer ama `teams` takip kararı sonu belirler (final stat güç).
- Ending tonu: `neutral` — "Saha arkada olur; hatırası kalır".
- Ölüm nedenleri: sakatlık/kaza (havuz kapalı: hastalık/yaşlılık/sakatlık).

### 3.4 `cyberpunk` — "kurum/çete/siber ağı" akışı
- **Yeni faction seçenekleri** (sadece bu evren): `corp` (Kurumsal Sözleşme), `gang` (Sokak Çetesi), `solo` (Bağımsız Solo), `netrunner` (Netrunner) — `illusion` yerine sokak kültürü.
- **Yeni olaylar:** `cyber_gig` (22): "İş" — kurumsal teklif / kara pazar / özgür kalır. `cyber_augment` (25): "İmplant" — ucuz / askerî / yok. `cyber_psychosis` (28): ağır; `cyber_debt` (32): "Borç".
- Ölüm nedenleri: assault/cyber-psycho/stroke — cyberpunk ile ticari/ile noktalı sahneler.

### 3.5 `seinen_psych` — "soğuk strateji/şüphe" akışı
- **Devre dışı:** `faction`, `tournament`, `clan`; `evol` metal / ev büyüsü gibi phantomolojik seçimler yok.
- **Yeni olaylar:** `seinen_case` (25): "Vaka" — araştır / geri çekil / birini suçla. `seinen_ally` (30): "Müttefik mi, Düşman mı?" — güven / sorgula / kullan. `seinen_exposure` (35): "Kimlik Tehdidi".
- Ending: `dark` — "Adın sır olarak kalır" açıklığı.

### 3.6 `isekai` — "oyun sistemi" akışı
- `faction`: mevcut Adventurer/Merchant/Scholar/Hermit **geliştirilir** (S-rank, C-rank, F-rank seçimi).
- **Yeni olaylar:** `isekai_tutorial` (7): "İlk Görev" — kabul et / reddet / loncaya kayıt. `isekai_class` (9): "Job Class Seçimi", `isekai_party` (12): "Yoldaşlık", `isekai_levelup` (15): "Seviye Atlama", `isekai_boss` (30): "Şeytan Lord" (final boss).
- Stat anlamı yatayda adapte: `intelligence` = skill/ magic, `power` = strength, `socialClass` = party reputation.

### 3.7 `shonen_battle` — "güçlenme/rival" akışı (mevcut + uyarlama)
- **Yeni olaylar:** `shonen_training` (9): "Yoğun Antrenman", `shonen_rival` (12): "Rakip", `shonen_tournament` (16): özel turnuva (mevcut `createTournamentEvent` 16'ya iner), `shonen_awakening` (18).
- Mevcut `faction` korunur; `evolution` "Güç Uyanışı" temasına uygun (doğru okunuyor).

### 3.8 `dark_fantasy` — "lanet/fedakarlık" akışı
- **Yeni olaylar:** `df_curse` (20): "Lanet Bulaştı" — hafiflet / doğuştan / yok et. `df_hunt` (25): "Mahlukat Avı", `df_sacrifice` (30): "Fedakarlık".
- `hasHeavyEvents` = true (en ağır havuz).
- Ölüm nedenleri: canavar, ihanet, lanet, savaş — savaş/canavar ağırlıklı; `Itachi`/`Guts`-tarzı trajedi sonu desteklenir.

## 4. Akış/pacing uyarlaması
| Evren | Olay sıklığı (age adım) | Ağır konu | Olası sonlar (ton) |
|---|---|---|---|
| slice_of_life | 1/4 yaş (sakin) | Hayır | light |
| romance_drama | 1/4 yaş | Kısmen (kayıp) | warm/tragic |
| sports | 1/3 yaş (turnuva sezonları) | Hayır | driven |
| cyberpunk | 1/2 yaş (yoğun) | Kısmen | gritty |
| seinen_psych | 1/2 yaş | Kısmen | cold |
| isekai | 1/3 yaş (seviye sistemli) | Kısmen | heroic |
| shonen_battle | 1/2 yaş | Kısmen | heroic |
| dark_fantasy | 1/2 yaş (sık) | Evet | tragic |

Uygulama: `generateLife()` zaten `rollDice(5..8)` adımlarıyla kriz üretir; `crisisWeight` / `heavyWeight` dünya başına eklenir (table above).

## 5. Uygulama fazları
- **Faz 1 (bu oturumda uygulandı):** `createWorldUniqueEvent` + 8 evren için 2'şer olay; `faction` olayı worldMap'ten okunur ve non-faction evrenlerde gösterilmez; `createFactionEvent` cyberpunk & seinen_psych için kendi seçenekleriyle genişletilir; ağır olay ağırlığı dünya başına (`hasHeavyEvents`, `heavyWeight`).
- **Faz 2:** Olay yüzdelerinin 8 evren için ince ayarı (şu an %40 crisis — her evren için farklı), `romance_grief` zincirleme; `sports_injury` → maç akışını etkiler; `isekai_levelup` seviye sistemi.
- **Faz 3:** JA/FR çevirileri tüm yeni olaylar için (uygulamak zorunda değil), JA/FR lore metni (data/lore/*).
- **Faz 4:** "Evrenlerarası sadakat skoru" (sonuç ekranında evrene sadık kalma yüzdesi) — sosyal paylaşım tarafı.

## 6. Hızlı kararlar (Phase 1 kapsamında)
- `seinen_psych` ve `cyberpunk` fraksiyonları generic shonen'a düşüyordu — **düzeltildi** (kendi seçenekleri ile).
- `slice_of_life`, `romance_drama`, `sports` — `faction` olayı **kaldırıldı** (anlamsız: korsan/denizci seçmezler).
- Yeni benzersiz olaylar 4 dil (TR/EN/JA/FR) — hepsi tarandı ve yazıldı.
- `npm test` 8/8 ✓; `vite build` ✓; tarayıcıda JA ve FR akışları doğrulandı.

## 7. Riskler / notlar
- **Telif/atıf:** `notableCharacters` canlı isimler içerir (PUİ: fan projesi). Ticari ürüne giderken evrenler ve karakter adları "homage" isimleriyle değiştirilmeli — ör. "Kitsune Village" yerine "Konoha" → "Kibō" tarzı jenerik isimler.
- **Lokalizasyon borcu:** yeni olayların JA/FR değeri yüksek; mağaza yorumlarında "bu Türkçe" şikâyeti "flavor text" için sorun olur; Faz 3'te tamamlanır.
- **Motoru karmaşıklaştırma:** WorldEventPack → unique events birlikte çalıştıkça test matrisi büyür. `generateLife` testlerine "her dünya için en az 1 tekil olay üretilir" ekle.
