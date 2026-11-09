/**
 * Elle küratörlüğü yapılmış içeriklerin çok dilli sürümleri.
 * Ana veri dosyası `animeRecommendations.ts` Türkçe (tr) temel metinleri tutar;
 * burada en/ja/fr çevirileri id bazında eşlenir. Eksik dillerde tr'ye düşer.
 */
import i18n from '../i18n';

export interface LocalizedText {
  tr: string;
  en: string;
  ja: string;
  fr: string;
}

const baseLang = (): string => {
  const raw = i18n.language || 'tr';
  return String(raw).split('-')[0].toLowerCase();
};

/** tr dahil dört dilden geçerli olanı döner; yoksa tr'ye düşer. */
export const pickLocalized = (entry: LocalizedText | undefined, fallback = ''): string => {
  if (!entry) return fallback;
  const base = baseLang();
  return (entry as any)[base] || entry.tr || fallback;
};

const L = (tr: string, en: string, ja: string, fr: string): LocalizedText => ({ tr, en, ja, fr });

/** POPULAR_PRESETS etiketleri — mal_id ile eşlenir. */
export const POPULAR_PRESET_TAGS: Record<number, LocalizedText> = {
  16498: L('Karanlık Fantastik / Gizem', 'Dark Fantasy / Mystery', 'ダークファンタジー / ミステリー', 'Dark Fantasy / Mystère'),
  1535: L('Psikolojik Zeka Savaşı', 'Psychological Battle of Wits', '心理的な頭脳バトル', 'Bataille Psychologique & Stratégie'),
  52991: L('Büyülü Yolculuk / Fantezi', 'Magical Journey / Fantasy', '魔法の旅 / ファンタジー', 'Voyage Magique / Fantastique'),
  40748: L('Doğaüstü Aksiyon', 'Supernatural Action', '超自然アクション', 'Action Surnaturelle'),
  9253: L('Zaman Yolculuğu / Bilim Kurgu', 'Time Travel / Sci-Fi', '時間旅行 / SF', 'Voyage Temporel / Sci-Fi'),
  5114: L('Kusursuz Hikaye / Macera', 'Flawless Story / Adventure', '完璧な物語 / 冒険', 'Histoire Parfaite / Aventure'),
  38000: L('Duygusal Shounen', 'Emotional Shounen', '感動系少年アニメ', 'Shounen Émouvant'),
  37521: L('Tarihi İntikam Dramı', 'Historical Revenge Drama', '歴史・復讐ドラマ', 'Drame Historique de Vengeance'),
  42310: L('Siberpunk / Adrenalin', 'Cyberpunk / Adrenaline', 'サイバーパンク / アドレナリン', 'Cyberpunk / Adrénaline'),
  11061: L('Stratejik Dövüş / Shounen', 'Strategic Battles / Shounen', '戦略的な闘い / 少年向け', 'Combats Stratégiques / Shounen'),
};



/** AI önerileri (AIRecommendationsSection) fallback içerikleri — mal_id ile eşlenir. */
export const AI_FALLBACK_REASONS: Record<number, LocalizedText> = {
  52991: L('Kaydedilen fantastik ve derin hikayeli animelerinle %98 uyumlu. Unutulmaz atmosferi ve karakter gelişimi tam zevkine göre.', '98% match with your saved fantasy and rich-story anime. The unforgettable atmosphere and character growth are exactly your thing.', '保存したファンタジーで奥深い物語のアニメと98%マッチ。忘れられない雰囲気とキャラクターの成長は、まさにあなた向け。', "98% de correspondance avec tes animes fantastiques aux histoires profondes. L'atmosphère inoubliable et l'évolution des personnages sont exactement ton style."),
  52299: L('İzleme listenizdeki aksiyon ve seviye atlama temalı serilerden yola çıkarak AI tarafından yüksek öncelikle önerildi.', 'Highly prioritized by AI based on the action and leveling-up series in your watchlist.', 'ウォッチリストのアクションとレベルアップ系作品をもとに、AIが高い優先度で推薦。', "Recommandé en priorité par l'IA à partir des séries d'action et de montée en niveau de ta liste."),
  40748: L('Tempolu dövüş koreografileri ve büyüleyici atmosfer seven izleme profilinizle kusursuz eşleşme.', 'A perfect match with your profile that loves fast-paced fight choreography and a fascinating atmosphere.', '疾走する戦闘演出と魅惑的な雰囲気が好きなあなたのプロフィールと完璧な一致。', 'Correspondance parfaite avec ton profil, qui adore les chorégraphies de combat rapides et les atmosphères fascinantes.'),
  54492: L('Zeka küpü ana karakteri ve saray içi gizem çözme dinamikleriyle listeniz için özel seçilmiş yapım.', 'A genius protagonist and palace-intrigue mystery dynamics — specially selected for your list.', '天才的な頭脳の主人公と宮廷の謎解きの力学。あなたのリストのために厳選された一作。', "Une héroïne brillante et des intrigues de palais — spécialement sélectionnée pour ta liste."),
};

export const AI_FALLBACK_SYNOPSIS: Record<number, LocalizedText> = {
  52991: L('Büyük iblis kralı yenen kahraman kafilesinin büyücüsü Frieren, insan yaşamının kısalığını ve bağ kurmanın önemini anlıyor.', 'The mage of the hero party who defeated the demon king, Frieren learns the shortness of human life and the meaning of bonds.', '魔王を倒した勇者パーティの魔法使いフリーレン。人間の一生の短さと絆の意味を知る。', "La mage de la troupe de héros ayant vaincu le roi démon apprend la brièveté de la vie humaine et la valeur des liens."),
  52299: L('En zayıf e-rütbe avcı Sung Jinwoo, gizemli bir zindan görevinde sistem tarafından seçilerek sınırsız seviye atlama yeteneği kazanır.', 'The weakest E-Rank hunter, Sung Jinwoo, is chosen by a mysterious system and gains unlimited leveling.', '最弱のEランクハンター・ソン・ジヌが、謎のシステムに選ばれ、無限のレベルアップ能力を得る。', 'Le chasseur de rang E le plus faible, Sung Jinwoo, est choisi par un système mystérieux et gagne la possibilité de progresser sans limite.'),
  40748: L('Satoru Gojo ve Suguru Geto\'nun gençlik günleri ile unutulmaz Shibuya Olayı arkının nefes kesen mücadelesi.', "Satoru Gojo and Suguru Geto's youth, and the breathtaking battle of the Shibuya Incident arc.", '五条悟と夏油傑の青春、そして忘れ得ぬ渋谷事変編の激闘。', "La jeunesse de Satoru Gojo et de Suguru Geto, puis l'arc de Shibuya Incident, spectaculaire."),
  54492: L('Eczacı kız Maomao, imparatorluk sarayına hizmetçi olarak satılır ve tıbbi bilgileriyle gizemli zehirlenme vakalarını çözer.', 'Apothecary girl Maomao is sold to the imperial palace as a servant and solves mysterious poisonings with her medical knowledge.', '薬師の少女マオマオは宮廷の下女として売られ、医学の知識で不可解な毒殺事件を解く。', "Maomao, jeune apothicaire, est vendue comme servante au palais et résout des mystérieuses intoxications grâce à ses connaissances médicales."),
};
