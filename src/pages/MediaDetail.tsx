import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  BookText,
  ExternalLink,
  Gamepad2,
  Languages,
  Loader2,
  Sparkles,
  Star,
  Tv2,
} from 'lucide-react';
import { getUnifiedDetail } from '../lib/api/unified';
import { pickTitle, normalizeMediaStatus, type MediaKind, type UnifiedMedia } from '../types/unified';
import { cn, getSafeImageUrl, handleImageError } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useToastStore } from '../store/useToastStore';
import { apiUrl } from '../lib/apiBase';
import { auth } from '../firebase';
import { getCachedTranslation, setCachedTranslation } from '../lib/translationCache';
import { localizeGenre } from '../lib/genreNames';

const KIND_LABEL_KEY: Record<MediaKind, string> = {
  anime: 'type_anime',
  manga: 'type_manga',
  light_novel: 'type_light_novel',
  novel: 'type_novel',
  game: 'type_game',
};

const KIND_ICON: Record<MediaKind, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  anime: Tv2,
  manga: BookOpen,
  light_novel: BookText,
  novel: BookText,
  game: Gamepad2,
};

export const MediaDetail = () => {
  const { t, i18n } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [media, setMedia] = useState<UnifiedMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedSynopsis, setTranslatedSynopsis] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(false);
    setTranslatedSynopsis(null);

    getUnifiedDetail(decodeURIComponent(id), controller.signal)
      .then((result) => {
        if (!active) return;
        setMedia(result);
        setError(!result);
      })
      .catch(() => {
        if (!active) return;
        setMedia(null);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  const handleTranslate = async () => {
    if (!media?.synopsis) return;
    if (translatedSynopsis) {
      setTranslatedSynopsis(null);
      return;
    }
    if (!auth.currentUser) {
      // Çeviri ucu Gemini kotası tüketir — giriş gerekiyor
      addToast(t('chat_login_required'), 'info');
      return;
    }

    setIsTranslating(true);
    try {
      const targetLang = i18n.language || 'tr';
      const cached = getCachedTranslation(media.synopsis, targetLang);
      if (cached) {
        setTranslatedSynopsis(cached);
        return;
      }

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(apiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ text: media.synopsis, targetLang }),
      });

      if (res.status === 429) {
        addToast(t('translation_limit'), 'error');
        return;
      }

      const data = await res.json();
      if (data.translation) {
        setTranslatedSynopsis(data.translation);
        setCachedTranslation(media.synopsis, targetLang, data.translation);
      } else {
        addToast(t('translation_failed'), 'error');
      }
    } catch {
      addToast(t('translation_failed'), 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <Loader2 size={48} className="animate-spin text-rose-500" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-black border-2 border-white/20 neo-shadow p-8 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">{t('media_not_found')}</h1>
        <p className="text-sm text-neutral-400 font-bold mb-6">{t('try_again_later')}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white font-black uppercase text-xs hover:bg-white hover:text-black transition-colors"
        >
          <ArrowLeft size={16} /> {t('go_back')}
        </button>
      </div>
    );
  }

  const KindIcon = KIND_ICON[media.kind];
  const localizedTitle = pickTitle(media.title, i18n.language);
  const alternativeTitles = [media.title.romaji, media.title.english, media.title.native].filter(
    (value, index, array): value is string => Boolean(value) && value !== localizedTitle && array.indexOf(value) === index
  );

  const meta: { label: string; value: string }[] = [];
  const statusKey = normalizeMediaStatus(media.status);
  // Bilinmeyen durumu gösterme: oyun ve roman kaynaklarında durum alanı yok.
  if (statusKey) meta.push({ label: t('status'), value: t(`status_${statusKey}`) });
  else if (media.status) meta.push({ label: t('status'), value: media.status });
  if (media.format) meta.push({ label: t('format'), value: media.format });
  if (media.seasonYear) meta.push({ label: t('year_season'), value: `${media.seasonYear}${media.season ? ` · ${media.season}` : ''}` });
  if (media.kind === 'anime' && media.episodes) meta.push({ label: t('episodes'), value: String(media.episodes) });
  if (media.chapters) meta.push({ label: t('chapters'), value: String(media.chapters) });
  if (media.volumes) meta.push({ label: t('volumes'), value: String(media.volumes) });
  if (media.averageScore) meta.push({ label: t('score'), value: `${media.averageScore} / 100` });
  if (media.studios.length) {
    // Aynı isim hem geliştirici hem yayıncı olarak gelebilir; tekrarları temizle.
    const names = Array.from(new Set(media.studios.map((studio) => studio.name).filter(Boolean)));
    meta.push({
      label: media.kind === 'game' ? t('developer') : t('studio'),
      value: names.join(', '),
    });
  }

  const animeMalId = media.kind === 'anime' ? media.externalIds?.mal : undefined;

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto">
      <Helmet>
        <title>{`${localizedTitle} — AniSync`}</title>
        <meta name="description" content={media.synopsis?.slice(0, 160) || localizedTitle} />
      </Helmet>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-5 px-3 py-2 border-2 border-white/20 hover:border-white hover:bg-white hover:text-black font-black uppercase text-xs transition-colors"
      >
        <ArrowLeft size={16} /> {t('go_back')}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-black border-2 border-white/20 neo-shadow overflow-hidden"
      >
        {/* Banner / header */}
        <div className="relative">
          {media.banner ? (
            <div className="h-32 sm:h-48 w-full overflow-hidden border-b-2 border-white/20">
              <img src={getSafeImageUrl(media.banner)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={handleImageError} />
            </div>
          ) : (
            <div
              className="h-24 sm:h-32 w-full border-b-2 border-white/20"
              style={{ backgroundColor: media.cover?.color || 'var(--theme-accent, #e11d48)' }}
            />
          )}
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
            <img
              src={getSafeImageUrl(media.cover?.large || media.cover?.medium)}
              alt={localizedTitle}
              className={cn(
                'object-cover border-2 border-white shrink-0 mx-auto sm:mx-0',
                media.kind === 'game' ? 'w-full sm:w-72 aspect-video' : 'w-40 sm:w-48 aspect-[2/3]'
              )}
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest border-2 border-white">
                  <KindIcon size={12} strokeWidth={3} />
                  {t(KIND_LABEL_KEY[media.kind])}
                </span>
                {media.averageScore ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest border-2 border-white">
                    <Star size={12} fill="currentColor" /> {media.averageScore}
                  </span>
                ) : null}
              </div>

              <h1 lang="en" className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none break-words">{localizedTitle}</h1>

              {alternativeTitles.length > 0 && (
                <p lang="en" className="mt-2 text-xs font-bold text-neutral-400 break-words">{alternativeTitles.join(' · ')}</p>
              )}

              {animeMalId ? (
                <button
                  type="button"
                  onClick={() => navigate(`/anime/${animeMalId}`)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-white font-black uppercase text-xs tracking-wider hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <Sparkles size={14} /> {t('open_anime_page')}
                </button>
              ) : null}
            </div>
          </div>

          {/* Meta grid */}
          {meta.length > 0 && (
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
              {meta.map((item) => (
                <div key={item.label} className="border-2 border-white/15 p-2.5 min-w-0">
                  <dt className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{item.label}</dt>
                  <dd className="text-xs font-black uppercase break-words">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Genres */}
          {media.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {media.genres.slice(0, 12).map((genre) => (
                <span key={genre} className="px-2 py-1 border border-white/20 text-[10px] font-black uppercase tracking-wider text-neutral-300">
                  {localizeGenre(genre)}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-2 border-b-2 border-white/10 pb-2">
              <h2 className="text-sm font-black uppercase tracking-widest">{t('synopsis')}</h2>
              {media.synopsis ? (
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-white/20 hover:border-white hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                  {isTranslating ? t('translating') : translatedSynopsis ? t('translated') : t('translate')}
                </button>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-line">
              {translatedSynopsis || media.synopsis || t('no_synopsis')}
            </p>
          </div>

          {/* Relations */}
          {media.relations.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-white/10 pb-2">{t('relations')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {media.relations.slice(0, 8).map((relation) => (
                  <button
                    key={`${relation.id}-${relation.relationType}`}
                    type="button"
                    onClick={() => navigate(`/media/${encodeURIComponent(relation.id)}`)}
                    className="text-left border-2 border-white/15 hover:border-white transition-colors p-2 group"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden border border-white/10 mb-2 bg-neutral-900">
                      {relation.cover ? (
                        <img src={getSafeImageUrl(relation.cover)} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" onError={handleImageError} />
                      ) : null}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-400">{relation.relationType.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] font-bold uppercase leading-tight line-clamp-2">
                      {pickTitle(relation.title, i18n.language)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* External links */}
          {media.externalLinks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-white/10 pb-2">{t('external_links')}</h2>
              <div className="flex flex-wrap gap-2">
                {media.externalLinks.slice(0, 8).map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-2 border-2 border-white/20 text-[10px] font-black uppercase tracking-wider',
                      'hover:border-white hover:bg-white hover:text-black transition-colors'
                    )}
                  >
                    {link.site} <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
