import { useEffect, useState } from 'react';
import { BarChart3, Check, X } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  getAnalyticsConsent,
  isAnalyticsConfigured,
  initAnalytics,
  setAnalyticsConsent,
} from '../lib/analytics';

/**
 * KVKK/GDPR rıza bandı.
 *
 * Yalnızca GA4 yapılandırılmışsa ve kullanıcı daha önce karar vermediyse
 * görünür. "Kabul et" gtag'i yükler; "Reddet" kalıcıdır ve tekrar sorulmaz.
 * Analitik kapalıyken hiçbir üçüncü taraf isteği yapılmaz.
 */
export function AnalyticsConsent() {
  const { t } = useAppTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAnalyticsConfigured()) return;
    if (getAnalyticsConsent() === 'unset') setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (decision: 'granted' | 'denied') => {
    setAnalyticsConsent(decision);
    setVisible(false);
    if (decision === 'granted') initAnalytics();
  };

  return (
    <div
      role="region"
      aria-label={t('consent_title')}
      className="fixed bottom-3 left-3 right-3 z-[80] mx-auto max-w-xl border-4 border-white bg-black p-4 text-white shadow-[6px_6px_0_0_#f59e0b] md:left-6 md:right-auto md:bottom-6"
    >
      <div className="flex items-start gap-3">
        <BarChart3 className="mt-1 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase tracking-wide">{t('consent_title')}</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-300">{t('consent_body')}</p>
          <a
            href="/privacy"
            className="mt-2 inline-block text-xs font-bold uppercase text-amber-400 underline underline-offset-2 hover:text-amber-300"
          >
            {t('privacy')}
          </a>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => decide('granted')}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-white bg-amber-400 px-4 text-xs font-black uppercase text-black transition hover:bg-amber-300"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {t('consent_accept')}
            </button>
            <button
              type="button"
              onClick={() => decide('denied')}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-white bg-black px-4 text-xs font-black uppercase text-white transition hover:bg-neutral-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {t('consent_decline')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
