import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import type { Lang4 } from '../data/universePaths';
import { canonicalUrl } from '../lib/seoUrls';
import { useHreflangLinks } from '../hooks/useHreflangLinks';

/**
 * Tek sayfa meta yöneticisi.
 *
 * Neden var: `SEOManager` statik rotaların meta'sını üretir; kendi meta'sını
 * yazan sayfalar (detay, oyun, lore...) için ikinci bir `<title>`/`<meta
 * name="description">` üretmesi çift etiket ve yanlış (generic) açıklama
 * seçilmesine yol açıyordu. Bu bileşen o sayfaların tek kaynağıdır:
 * başlık, açıklama, canonical, OpenGraph ve Twitter kartı birlikte yazılır.
 */

const OG_LOCALE: Record<Lang4, string> = {
  tr: 'tr_TR',
  en: 'en_US',
  ja: 'ja_JP',
  fr: 'fr_FR',
};

const DEFAULT_IMAGE = 'https://anisync-tau.vercel.app/icons/icon-512.png';

interface PageMetaProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'video.tv_show' | 'video.movie';
  noindex?: boolean;
  /** Sayfaya özel JSON-LD (schema.org) nesnesi. */
  jsonLd?: Record<string, unknown> | null;
}

export const PageMeta: React.FC<PageMetaProps> = ({
  title,
  description,
  image,
  type = 'website',
  noindex = false,
  jsonLd = null,
}) => {
  const { currentLang } = useAppTranslation();
  const location = useLocation();
  const lang = (['tr', 'en', 'ja', 'fr'] as const).includes(currentLang as Lang4)
    ? (currentLang as Lang4)
    : 'en';

  // Canonical kendi URL'idir: yalnızca desteklenen `?lang=` korunur.
  // (Algılanan dili zorlamak `/dle` → `/dle?lang=en` yapıp x-default'u kırardı.)
  const canonical = canonicalUrl(location.pathname, {
    search: location.search,
    origin: window.location.origin,
  });
  const ogImage = image || DEFAULT_IMAGE;

  // Statik kök hreflang etiketlerini bu sayfanın yoluna taşır.
  useHreflangLinks(location.pathname);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="AniSync" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={OG_LOCALE[lang]} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default PageMeta;
