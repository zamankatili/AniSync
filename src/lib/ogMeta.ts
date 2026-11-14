/**
 * Sosyal bot önizleme meta'sı (sunucu tarafı, DOM'suz).
 *
 * Neden var: uygulama bir SPA olduğu için `/anime/:id` ve `/media/:id`
 * adreslerinin ham HTML'i yalnızca genel `index.html` meta'sını taşır.
 * Twitter/Discord/WhatsApp gibi JS çalıştırmayan botlar bu yüzden her
 * bağlantıyı aynı kartla gösteriyordu. Vercel'de bot isteklerini
 * `/api/og/*` fonksiyonuna yönlendirip burada medya başlığı, özeti ve
 * kapağıyla meta-only HTML üretiyoruz.
 *
 * Kurallar:
 *  - Bu HTML indekslenmemeli (`noindex`) ve önbelleğe alınmamalı; aksi
 *    hâlde aynı URL tarayıcıya bot HTML'i servis edebilir.
 *  - İçerik, istemci DOM'unda üretilen meta ile aynı olmalı (cloaking yok).
 *  - Tüm değerler kaçışlanır; dış kaynaklı metin HTML'e ham girmez.
 */

import type { Lang4 } from '../data/universePaths';

export const OG_SITE_NAME = 'AniSync';
export const DEFAULT_OG_IMAGE = 'https://anisync-tau.vercel.app/icons/icon-512.png';

export const OG_LOCALES: Record<Lang4, string> = {
  tr: 'tr_TR',
  en: 'en_US',
  ja: 'ja_JP',
  fr: 'fr_FR',
};

export type OgType = 'website' | 'article' | 'book' | 'video.tv_show' | 'video.movie' | 'video.other';

const OG_TYPES: readonly OgType[] = [
  'website',
  'article',
  'book',
  'video.tv_show',
  'video.movie',
  'video.other',
];

export interface OgMetaInput {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl?: string | null;
  locale?: Lang4;
  type?: OgType;
  noindex?: boolean;
}

/** Genel (kayıt bulunamadığında) kart metinleri — 4 dil. */
export const OG_FALLBACK_COPY: Record<Lang4, { title: string; description: string }> = {
  tr: {
    title: 'AniSync — Anime, manga ve oyun keşfi',
    description:
      'Yeni bir şey izlemek için doğru yer: güncel sezon, yayın takvimi, kişisel listeler ve topluluk tek yerde.',
  },
  en: {
    title: 'AniSync — Anime, manga and game discovery',
    description:
      'The easiest place to find something new to watch: current season, airing calendar, personal lists and community.',
  },
  ja: {
    title: 'AniSync — アニメ・マンガ・ゲームの発見',
    description:
      '次に見る作品がすぐ見つかる。今期アニメ、放送カレンダー、マイリスト、コミュニティがひとつに。',
  },
  fr: {
    title: 'AniSync — Découvrir animes, mangas et jeux',
    description:
      'Le meilleur point de départ pour trouver quoi regarder : saison en cours, calendrier, listes personnelles et communauté.',
  },
};

/** HTML metin/attribute kaçışı. `&` önce gelmeli. */
export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Boşlukları toparlar ve kod noktası sınırında kısaltır.
 * `String.slice` emoji gibi çift birimli karakterleri bölebilir; bu yüzden
 * `Array.from` kullanıyoruz ve kelime ortasında kesmemeye çalışıyoruz.
 */
export function truncateText(input: string | null | undefined, max: number): string {
  const normalized = String(input ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return '';

  const chars = Array.from(normalized);
  if (chars.length <= max) return normalized;

  const hardCut = chars.slice(0, Math.max(1, max - 1)).join('');
  const lastSpace = hardCut.lastIndexOf(' ');
  const softCut = lastSpace > hardCut.length * 0.6 ? hardCut.slice(0, lastSpace) : hardCut;
  return `${softCut.replace(/[\s,.;:!?-]+$/, '')}…`;
}

/**
 * `Accept-Language` başlığından desteklenen ilk dili seçer.
 * Eşleşme yoksa Türkçe (varsayılan arayüz dili) döner.
 */
export function pickLocaleFromHeader(header: string | string[] | undefined): Lang4 {
  const raw = Array.isArray(header) ? header.join(',') : String(header ?? '');
  for (const part of raw.split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (code === 'tr' || code === 'en' || code === 'ja' || code === 'fr') return code;
  }
  return 'tr';
}

/** Yalnızca `https:` görselleri kabul eder; bozuksa genel karta düşer. */
export function safeImageUrl(value: string | null | undefined): string {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return DEFAULT_OG_IMAGE;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' ? url.toString() : DEFAULT_OG_IMAGE;
  } catch {
    return DEFAULT_OG_IMAGE;
  }
}

/**
 * Botlar için meta-only HTML üretir. Gövde kısa tutulur: bazı botlar
 * `<body>` metnini de kart açıklaması olarak kullanır.
 */
export function buildOgHtml(input: OgMetaInput): string {
  const locale: Lang4 = input.locale && OG_LOCALES[input.locale] ? input.locale : 'tr';
  const title = truncateText(input.title, 110) || OG_FALLBACK_COPY[locale].title;
  const description = truncateText(input.description, 180) || OG_FALLBACK_COPY[locale].description;
  const canonical = input.canonicalUrl;
  const image = safeImageUrl(input.imageUrl);
  const type: OgType = OG_TYPES.includes(input.type as OgType) ? (input.type as OgType) : 'website';

  const alternates = (Object.keys(OG_LOCALES) as Lang4[])
    .filter((code) => code !== locale)
    .map((code) => `    <meta property="og:locale:alternate" content="${OG_LOCALES[code]}" />`)
    .join('\n');

  const robots = input.noindex === false ? '' : '    <meta name="robots" content="noindex, nofollow" />\n';

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
${robots}    <meta name="theme-color" content="#e11d48" />

    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="${OG_SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:locale" content="${OG_LOCALES[locale]}" />
${alternates}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
    <p><a href="${escapeHtml(canonical)}">${escapeHtml(title)}</a></p>
  </body>
</html>
`;
}
