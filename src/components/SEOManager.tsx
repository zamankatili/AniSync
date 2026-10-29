import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const DEFAULT_SEO = {
  title: 'AniSync – Anime Takip, Watch Party & Topluluk Platformu',
  description: 'En güncel animeleri takip edin, Birlikte İzle (Watch Party) odalarında arkadaşlarınızla canlı izleyin, Müzik Quizi oynayın ve Otaku Rank derecenizi yükseltin.',
  image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
  type: 'website'
};

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'AniSync – Ana Sayfa & Topluluk Akışı',
    description: 'Topluluğun paylaştığı gönderileri, günlük anketleri, canlı izleme akışını ve popüler anime tartışmalarını keşfedin.'
  },
  '/discover': {
    title: 'Keşfet & Rastgele Anime Motoru – AniSync',
    description: 'Sınırsız rastgele anime keşif motoru, günün önerileri, benzer anime bulucu ve türe göre trend grafiklerini inceleyin.'
  },
  '/list': {
    title: 'İzleme Listem & İstatistikler – AniSync',
    description: 'İzleme listenizi yönetin, izlenen bölüm sürelerinizi grafiklerle analiz edin ve kişisel Otaku profilinizi özelleştirin.'
  },
  '/lists': {
    title: 'Özel Listeler & Koleksiyonlar – AniSync',
    description: 'Topluluk üyelerinin oluşturduğu özel anime listelerini, favori koleksiyonları ve 3x3 grid kartlarını keşfedin.'
  },
  '/profile': {
    title: 'Profilim & Otaku Rank Rozetleri – AniSync',
    description: 'Kişisel Karma XP seviyenizi, kazanılan başarım rozetlerini, izleme istatistiklerinizi ve favori karakter vitrininizi yönetin.'
  },
  '/watch-party': {
    title: 'Watch Party Odaları (Birlikte İzle) – AniSync',
    description: 'Canlı senkronize video oynatıcısı, anlık sohbet ve uçuşan emoji reaksiyonları ile arkadaşlarınızla anime fragmanları izleyin.'
  },
  '/music-quiz': {
    title: 'Anime Müzik Quizi & Açılış Şarkısı Yarışı – AniSync',
    description: 'Günün açılış şarkısını dinleyin, animeyi tahmin edin ve Arcade modunda en yüksek skoru kırarak liderlik tablosuna adınızı yazdırın.'
  },
  '/calendar': {
    title: 'Haftalık Yayın Takvimi & Hatırlatıcılar – AniSync',
    description: 'Türkiye saatine göre haftalık yeni bölüm yayın akışı, canlı geri sayım, Google Takvim senkronizasyonu ve 15 dk kala bildirimler.'
  },
  '/grid-maker': {
    title: '3x3 Anime Grid Kartı Oluşturucu – AniSync',
    description: 'Favori 9 anime serinizi seçerek sosyal medyada paylaşabileceğiniz şık 3x3 Neo-Brutalist grid kartları tasarlayın.'
  },
  '/challenge': {
    title: 'Haftalık Meydan Okuma & Günlük Anketler – AniSync',
    description: 'Her gün yenilenen tematik soruları çözün, serinizi koruyun ve ek XP puanları toplayarak sıralamada yükselin.'
  }
};

export const SEOManager: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Check exact match or dynamic prefixes
  let seoInfo = ROUTE_SEO[currentPath];

  if (!seoInfo) {
    if (currentPath.startsWith('/anime/')) {
      seoInfo = {
        title: 'Anime Detayı & İncelemeler – AniSync',
        description: 'Anime detayları, karakter seslendirmenleri, topluluk incelemeleri ve puanlama sistemini inceleyin.'
      };
    } else if (currentPath.startsWith('/profile/')) {
      seoInfo = {
        title: 'Kullanıcı Profili & Otaku Derecesi – AniSync',
        description: 'Otaku üyesinin izleme listesini, başarımlarını ve favori serilerini inceleyin.'
      };
    } else if (currentPath.startsWith('/watch-party/')) {
      seoInfo = {
        title: 'Canlı Watch Party Odası – AniSync',
        description: 'Senkronize canlı izleme odasına katılarak sohbet edin ve reaksiyonlar fırlatın.'
      };
    } else {
      seoInfo = DEFAULT_SEO;
    }
  }

  const finalTitle = seoInfo.title || DEFAULT_SEO.title;
  const finalDesc = seoInfo.description || DEFAULT_SEO.description;
  const canonicalUrl = window.location.origin + currentPath;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <link rel="canonical" href={canonicalUrl} />

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
