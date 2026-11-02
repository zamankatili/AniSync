import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, EyeOff, CornerDownRight } from 'lucide-react';
import type { Post, PostKind } from '../lib/types';
import { timeAgo } from '../lib/format';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';
import { mediaLink } from './MediaCard';

const KIND_STYLE: Record<PostKind, { label: string; color: string; bg: string }> = {
  sohbet: { label: 'Sohbet', color: 'var(--ink-2)', bg: 'var(--surface-2)' },
  oneri: { label: 'Öneri', color: 'var(--good)', bg: 'color-mix(in srgb, var(--good) 14%, transparent)' },
  inceleme: { label: 'İnceleme', color: 'var(--accent-2)', bg: 'color-mix(in srgb, var(--accent-2) 14%, transparent)' },
  soru: { label: 'Soru', color: 'var(--warn)', bg: 'color-mix(in srgb, var(--warn) 14%, transparent)' },
  ilerleme: { label: 'İlerleme', color: 'var(--accent)', bg: 'var(--accent-soft)' },
};

export function PostCard({ post }: { post: Post }) {
  const me = useStore((s) => s.profile?.handle ?? 'ben');
  const likePost = useStore((s) => s.likePost);
  const replyToPost = useStore((s) => s.replyToPost);
  const hideSpoilers = useStore((s) => s.settings.hideSpoilers);

  const [revealed, setRevealed] = useState(!post.spoiler || !hideSpoilers);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showAllReplies, setShowAllReplies] = useState(false);

  const liked = post.likes.includes(me);
  const kind = KIND_STYLE[post.kind] ?? KIND_STYLE.sohbet;
  const replies = showAllReplies ? post.replies : post.replies.slice(0, 2);

  const submitReply = () => {
    if (!replyText.trim()) return;
    replyToPost(post.id, replyText);
    setReplyText('');
    setShowAllReplies(true);
  };

  return (
    <article className="card p-4 md:p-5">
      <header className="flex items-center gap-2.5">
        <Avatar emoji={post.author.emoji} color={post.author.color} size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-bold text-[var(--ink)]">{post.author.name}</p>
          <p className="text-[10.5px] text-[var(--ink-3)]">{timeAgo(post.createdAt)}</p>
        </div>
        <span
          className="rounded-full px-2 py-[3px] text-[9.5px] font-extrabold uppercase tracking-[0.1em]"
          style={{ color: kind.color, background: kind.bg }}
        >
          {kind.label}
        </span>
      </header>

      <div className="relative mt-3">
        <p
          className={`prose-warm whitespace-pre-wrap text-[13.5px] leading-relaxed text-[var(--ink-2)] transition ${
            !revealed ? 'select-none blur-[6px]' : ''
          }`}
        >
          {post.text}
        </p>
        {!revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="absolute inset-0 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[var(--accent)]"
          >
            <EyeOff size={13} /> Spoiler var, dokun
          </button>
        )}
      </div>

      {revealed && post.spoiler && (
        <button
          onClick={() => setRevealed(false)}
          className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--ink-3)]"
        >
          <Eye size={11} /> Gizle
        </button>
      )}

      {post.ref && (
        <Link
          to={`/m/${post.ref.type}/${encodeURIComponent(post.ref.id.split(':').slice(1).join(':'))}`}
          className="mt-3 flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-2)] p-2 transition-colors hover:border-[var(--line-strong)]"
        >
          <div className="h-[58px] w-[40px] shrink-0 overflow-hidden rounded-[4px] bg-[var(--surface-3)]">
            {post.ref.cover && (
              <img src={post.ref.cover} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-[12px] font-semibold text-[var(--ink)]">{post.ref.title}</p>
            <p className="text-[10px] text-[var(--ink-3)]">
              {post.ref.type === 'anime' ? 'Anime' : post.ref.type === 'manga' ? 'Manga' : post.ref.type === 'novel' ? 'Novel' : 'Oyun'}
              {post.ref.year ? ` · ${post.ref.year}` : ''}
            </p>
          </div>
        </Link>
      )}

      <footer className="mt-3 flex items-center gap-4 border-t border-[var(--line)] pt-3">
        <button
          onClick={() => likePost(post.id)}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold transition-colors"
          style={{ color: liked ? 'var(--accent)' : 'var(--ink-3)' }}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          {post.likes.length}
        </button>
        <button
          onClick={() => setReplyOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
        >
          <MessageCircle size={14} />
          {post.replies.length}
        </button>
      </footer>

      {(post.replies.length > 0 || replyOpen) && (
        <div className="mt-3 space-y-2.5 border-t border-[var(--line)] pt-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              <Avatar emoji={reply.author.emoji} color={reply.author.color} size={24} ring={false} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[var(--ink)]">
                  {reply.author.name}
                  <span className="ml-1.5 font-medium text-[var(--ink-3)]">{timeAgo(reply.createdAt)}</span>
                </p>
                <p className="text-[12px] leading-snug text-[var(--ink-2)]">{reply.text}</p>
              </div>
            </div>
          ))}

          {post.replies.length > 2 && !showAllReplies && (
            <button
              onClick={() => setShowAllReplies(true)}
              className="ml-8 text-[10.5px] font-bold text-[var(--accent)]"
            >
              {post.replies.length - 2} yanıt daha
            </button>
          )}

          {replyOpen && (
            <div className="flex items-end gap-2 pt-1">
              <CornerDownRight size={14} className="mb-2.5 shrink-0 text-[var(--ink-3)]" />
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitReply();
                }}
                placeholder="Bir şey söyle..."
                className="input !py-2 text-[12.5px]"
                autoFocus
              />
              <button onClick={submitReply} className="btn btn-primary btn-sm">
                Yanıtla
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export { mediaLink };
