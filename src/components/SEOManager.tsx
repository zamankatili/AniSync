import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  NOINDEX_EXACT,
  NOINDEX_PREFIXES,
  SELF_MANAGED_EXACT,
  SELF_MANAGED_PREFIXES,
} from '../lib/seoRoutes';

/**
 * Statik rotaların tek meta kaynağı.
 *
 * Kendi `<PageMeta>`'sını yazan sayfalar (detay, oyun, lore, metin macerası...)
 * burada atlanır; aksi halde iki `<title>`, iki canonical ve iki description
 * üretilir ve Google generic olanı seçebilir.
 */

export const SEOManager: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useAppTranslation();

  const DEFAULT_SEO = {
    title: t('seo_default_title'),
    description: t('seo_default_desc'),
    image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
  };

  const ROUTE_SEO: Record<string, { title: string; description: string }> = {
    '/': {
      title: t('seo_home_title'),
      description: t('seo_home_desc'),
    },
    '/discover': {
      title: t('seo_discover_title'),
      description: t('seo_discover_desc'),
    },
    '/list': {
      title: t('seo_list_title'),
      description: t('seo_list_desc'),
    },
    '/lists': {
      title: t('seo_lists_title'),
      description: t('seo_lists_desc'),
    },
    '/profile': {
      title: t('seo_profile_title'),
      description: t('seo_profile_desc'),
    },
    '/watch-party': {
      title: t('seo_watchparty_title'),
      description: t('seo_watchparty_desc'),
    },
    '/music-quiz': {
      title: t('seo_musicquiz_title'),
      description: t('seo_musicquiz_desc'),
    },
    '/voice-duel': {
      title: t('seo_voice_duel_title'),
      description: t('seo_voice_duel_desc'),
    },
    '/calendar': {
      title: t('seo_calendar_title'),
      description: t('seo_calendar_desc'),
    },
    '/grid-maker': {
      title: t('seo_gridmaker_title'),
      description: t('seo_gridmaker_desc'),
    },
    '/challenge': {
      title: t('seo_challenge_title'),
      description: t('seo_challenge_desc'),
    },
    '/privacy': {
      title: `${t('privacy_title')} — AniSync`,
      description: t('legal_privacy_p1'),
    },
    '/terms': {
      title: `${t('terms_title')} — AniSync`,
      description: t('legal_terms_p1'),
    },
    '/guidelines': {
      title: `${t('guidelines_title')} — AniSync`,
      description: t('legal_guidelines_p1'),
    },
  };

  const isSelfManaged =
    (SELF_MANAGED_EXACT as readonly string[]).includes(currentPath) ||
    SELF_MANAGED_PREFIXES.some((prefix) => currentPath.startsWith(prefix));

  if (isSelfManaged) return null;

  // Check exact match or dynamic prefixes
  let seoInfo = ROUTE_SEO[currentPath];

  if (!seoInfo) {
    if (currentPath.startsWith('/profile/')) {
      seoInfo = {
        title: t('seo_profile_user_title'),
        description: t('seo_profile_user_desc'),
      };
    } else if (currentPath.startsWith('/watch-party/')) {
      seoInfo = {
        title: t('seo_watchparty_room_title'),
        description: t('seo_watchparty_room_desc'),
      };
    } else {
      seoInfo = DEFAULT_SEO;
    }
  }

  const finalTitle = seoInfo.title || DEFAULT_SEO.title;
  const finalDesc = seoInfo.description || DEFAULT_SEO.description;
  const canonicalUrl = window.location.origin + currentPath;
  const noindex =
    (NOINDEX_EXACT as readonly string[]).includes(currentPath) ||
    NOINDEX_PREFIXES.some((prefix) => currentPath.startsWith(prefix));

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={DEFAULT_SEO.image} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={DEFAULT_SEO.image} />
    </Helmet>
  );
};
