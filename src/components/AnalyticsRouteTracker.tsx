import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../lib/analytics';

/**
 * SPA rota değişimlerini GA4'e sayfa görüntülemesi olarak bildirir.
 *
 * `trackPageView` aynı yol için tekrar göndermez; StrictMode'un çift effect
 * çağrısı bu yüzden çift sayıma yol açmaz. Yol, gönderilmeden önce
 * sadeleştirilir (query atılır, kimlikler `:id` olur).
 */
export function AnalyticsRouteTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    initAnalytics();
    trackPageView(pathname, document.title);
  }, [pathname]);

  return null;
}
