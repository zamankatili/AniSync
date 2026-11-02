import { useMemo, useState } from 'react';
import { Check, Plus, Users, MessagesSquare, ChevronLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CLUBS } from '../data/clubs';
import { PostCard } from '../components/PostCard';
import { Composer } from '../components/Composer';

export function Kose() {
  const posts = useStore((s) => s.posts);
  const joined = useStore((s) => s.joined);
  const joinClub = useStore((s) => s.joinClub);
  const [activeClub, setActiveClub] = useState<string | null>(null);

  const club = CLUBS.find((c) => c.id === activeClub) ?? null;

  const feed = useMemo(() => {
    const list = activeClub ? posts.filter((p) => p.clubId === activeClub) : posts;
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, activeClub]);

  const activeMembers = useMemo(
    () => CLUBS.filter((c) => joined.includes(c.id)).reduce((acc, c) => acc + c.members, 0),
    [joined],
  );

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">köşe</p>
          <h1 className="h1 mt-1.5">{club ? club.name : 'Köşe'}</h1>
          <p className="mt-2 max-w-lg text-[13.5px] text-[var(--ink-2)]">
            {club ? club.description : 'Farklı masalar, tek mekân. Bir köşeye otur, konuşmaya katıl.'}
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-[10.5px] font-bold text-[var(--ink-2)] sm:flex">
          <Users size={13} /> {activeMembers || 0} kişi masada
        </span>
      </header>

      {!club && (
        <section>
          <div className="mb-2 flex items-end justify-between">
            <p className="eyebrow">masalar</p>
            <p className="text-[10.5px] text-[var(--ink-3)]">katıldığın köşeler akışına düşer</p>
          </div>
          <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:px-0 xl:grid-cols-3">
            {CLUBS.map((c) => {
              const isJoined = joined.includes(c.id);
              return (
                <div key={c.id} className="card w-[232px] shrink-0 overflow-hidden p-3.5 sm:w-auto">
                  <button onClick={() => setActiveClub(c.id)} className="flex w-full items-start gap-2.5 text-left">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[20px]"
                      style={{ background: `${c.color}22`, border: `1px solid ${c.color}55` }}
                    >
                      {c.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-bold leading-tight">{c.name}</span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-[var(--ink-3)]">{c.tagline}</span>
                    </span>
                  </button>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[9.5px] font-semibold text-[var(--ink-3)]">{c.members} üye · {c.cadence}</span>
                    {isJoined ? (
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[var(--good)]">
                        <Check size={10} /> masadasın
                      </span>
                    ) : (
                      <button
                        onClick={() => joinClub(c.id)}
                        className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[var(--accent)]"
                      >
                        <Plus size={10} /> katıl
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {club && (
        <button
          onClick={() => setActiveClub(null)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ink-3)] hover:text-[var(--ink)]"
        >
          <ChevronLeft size={13} /> tüm masalar
        </button>
      )}

      <div className="space-y-4 lg:mx-auto lg:max-w-[780px] lg:w-full">
        <Composer
          clubId={club?.id}
          placeholder={club ? `${club.name} masasına bir şey bırak...` : 'Aklında ne var? Bir sahne, bir cümle, bir öneri...'}
        />

        {!club && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveClub(null)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold"
              style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              Tümü
            </button>
            {CLUBS.filter((c) => joined.includes(c.id)).map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveClub(c.id)}
                className="shrink-0 rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] font-bold text-[var(--ink-2)]"
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {feed.length ? (
            feed.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
              <MessagesSquare size={24} className="text-[var(--ink-3)]" />
              <p className="display text-[1.1rem]">Bu masada henüz ses yok</p>
              <p className="max-w-xs text-[12px] text-[var(--ink-3)]">
                İlk cümleyi sen yaz. Genelde bir soruyla başlıyor.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="pb-2 text-[10.5px] leading-relaxed text-[var(--ink-3)]">
        İlk açılışta akış örnek gönderilerle gelir; kendi paylaşımların cihazında saklanır.
      </p>
    </div>
  );
}
