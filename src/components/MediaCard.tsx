import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Media, ShelfEntry } from '../lib/types';
import { MEDIA_LABELS } from '../lib/level';
import { score10 } from '../lib/format';
import { progressPercent } from '../lib/format';

const TYPE_TINT: Record<string, string> = {
  anime: 'var(--accent)',
  manga: 'var(--good)',
  novel: 'var(--accent-2)',
  game: 'var(--warn)',
};

export function mediaLink(media: Pick<Media, 'id' | 'type'>): string {
  const raw = media.id.split(':').slice(1).join(':');
  return `/m/${media.type}/${encodeURIComponent(raw)}`;
}

interface MediaCardProps {
  media: Media;
  entry?: ShelfEntry;
  showType?: boolean;
  className?: string;
  compact?: boolean;
}

export function MediaCard({ media, entry, showType = false, className = '', compact = false }: MediaCardProps) {
  const [failed, setFailed] = useState(false);
  const percent = entry ? progressPercent(entry) : 0;

  return (
    <Link to={mediaLink(media)} className={`media-card group block ${className}`} aria-label={media.title}>
      <div className={`poster ${compact ? 'rounded-[var(--radius-xs)]' : ''}`}>
        {!failed && media.cover ? (
          <img
            src={media.cover}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center p-3 text-center"
            style={{ background: `linear-gradient(160deg, ${media.accent ?? 'var(--surface-3)'}33, var(--surface-2))` }}
          >
            <span className="display text-[15px] leading-tight" style={{ color: 'var(--ink-2)' }}>
              {media.title}
            </span>
          </div>
        )}

        {showType && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.12em] backdrop-blur"
            style={{
              background: 'color-mix(in srgb, var(--bg) 72%, transparent)',
              color: TYPE_TINT[media.type] ?? 'var(--accent)',
              border: `1px solid color-mix(in srgb, ${TYPE_TINT[media.type] ?? 'var(--accent)'} 45%, transparent)`,
            }}
          >
            {MEDIA_LABELS[media.type]}
          </span>
        )}

        {media.score ? (
          <span className="media-score absolute right-2 top-2 rounded-full bg-black/55 px-2 py-[3px] text-[10px] font-bold text-white backdrop-blur">
            ★ {score10(media.score)}
          </span>
        ) : null}

        {entry && (
          <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-black/50">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percent}%`, background: 'var(--accent)' }}
              />
            </div>
            {!compact && (entry.media.totalUnits ?? 0) > 0 && (
              <div className="mt-1 text-right text-[9.5px] font-bold text-white/85">
                {entry.progress}/{entry.media.totalUnits}
              </div>
            )}
          </div>
        )}
      </div>

      {!compact && (
        <div className="media-caption mt-2 px-0.5">
          <h3 className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
            {media.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium text-[var(--ink-3)]">
            {media.meta || media.subtitle || MEDIA_LABELS[media.type]}
          </p>
        </div>
      )}
    </Link>
  );
}
