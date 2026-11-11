import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Users } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

export type LegalKind = 'privacy' | 'terms' | 'guidelines';

const ICONS: Record<LegalKind, React.ReactNode> = {
  privacy: <ShieldCheck size={28} strokeWidth={2.5} />,
  terms: <FileText size={28} strokeWidth={2.5} />,
  guidelines: <Users size={28} strokeWidth={2.5} />,
};

/**
 * Gizlilik, kullanım koşulları ve topluluk kuralları.
 * Metinler ürünün gerçek davranışını yansıtır: otomatik silme yok,
 * talepler e-posta ile manuel işlenir; üçüncü taraf verileri etiketlenir.
 */
export const LegalPage: React.FC<{ kind: LegalKind }> = ({ kind }) => {
  const { t } = useAppTranslation();
  const titleKey = kind === 'privacy' ? 'privacy_title' : kind === 'terms' ? 'terms_title' : 'guidelines_title';

  const sections = [1, 2, 3, 4].map((n) => ({
    heading: t(`legal_${kind}_h${n}`),
    body: t(`legal_${kind}_p${n}`),
  }));

  return (
    <div className="max-w-3xl mx-auto py-8 px-1">
      <header className="flex items-start gap-4 mb-8 pb-6 border-b-4 border-white/20">
        <div className="w-14 h-14 shrink-0 border-4 border-white bg-black flex items-center justify-center text-amber-400 neo-shadow-white">
          {ICONS[kind]}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">{t(titleKey)}</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mt-2">
            {t('legal_updated')}: 11.11.2026
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-black text-white uppercase tracking-wide mb-2">{section.heading}</h2>
            <p className="text-sm font-bold text-neutral-300 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/privacy"
          className="px-4 py-2 border-2 border-white/30 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          {t('privacy')}
        </Link>
        <Link
          to="/terms"
          className="px-4 py-2 border-2 border-white/30 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          {t('terms')}
        </Link>
        <Link
          to="/guidelines"
          className="px-4 py-2 border-2 border-white/30 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          {t('guidelines')}
        </Link>
        <Link
          to="/"
          className="px-4 py-2 bg-amber-400 border-2 border-black text-black text-xs font-black uppercase tracking-widest neo-shadow hover:shadow-none transition-all"
        >
          {t('legal_back_home')}
        </Link>
      </div>
    </div>
  );
};
