import { useEffect } from 'react';
import { syncHreflangTags } from '../lib/seoUrls';

/**
 * Geçerli rota için dil alternatiflerini `index.html`'deki statik etiketlere
 * yazar. SEO meta kaynağı ikiye bölünmüş durumda (statik kök + dinamik rotalar);
 * bu kanca statik beş etiketi yerinde güncelleyerek tek küme bırakır.
 *
 * Helmet ile üretilmez: react-helmet-async statik etiketleri kaldıramadığı için
 * her rotada iki küme (biri ana sayfaya ait) oluşuyordu.
 */
export function useHreflangLinks(pathname: string): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    syncHreflangTags(document, pathname, window.location.origin);
  }, [pathname]);
}

export default useHreflangLinks;
