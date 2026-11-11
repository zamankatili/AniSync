import React from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';

/**
 * Tüm sayfaların altında görünen yasal/veri kaynağı şeridi.
 * Bağlantılar SPA içinde kalır; dış kaynaklar yeni sekmede açılır.
 */
export const Footer: React.FC = () => {
  const { t } = useAppTranslation();

  return (
    <footer className="mt-10 border-t-2 border-white/20 pt-6 pb-2 text-neutral-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-widest">
          <Link to="/privacy" className="hover:text-white transition-colors">
            {t('privacy')}
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            {t('terms')}
          </Link>
          <Link to="/guidelines" className="hover:text-white transition-colors">
            {t('guidelines')}
          </Link>
        </nav>

        <p className="text-[9px] font-bold uppercase tracking-wider leading-relaxed md:text-right max-w-xl">
          {t('footer_data_note')}
          {' '}
          <a href="https://anilist.co" target="_blank" rel="noreferrer" className="underline hover:text-white">AniList</a>
          {' · '}
          <a href="https://myanimelist.net" target="_blank" rel="noreferrer" className="underline hover:text-white">MyAnimeList/Jikan</a>
          {' · '}
          <a href="https://openlibrary.org" target="_blank" rel="noreferrer" className="underline hover:text-white">OpenLibrary</a>
          {' · '}
          <a href="https://store.steampowered.com" target="_blank" rel="noreferrer" className="underline hover:text-white">Steam</a>
        </p>
      </div>
    </footer>
  );
};
