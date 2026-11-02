import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, Gamepad2, Sparkles, Tv, BookMarked } from 'lucide-react';
import { useStore } from '../store/useStore';
import { GENRE_OPTIONS } from '../lib/genres';
import { recommendFrom } from '../lib/api';
import type { MediaType } from '../lib/types';

const EMOJIS = ['🫖', '🍵', '🌙', '📖', '🎧', '🎮', '🍜', '✨', '🦊', '🐱'];
const COLORS = ['#eda85a', '#e07a5f', '#8b7cf6', '#7fb069', '#d4a5a5', '#e8c07a'];

const HOMES: Array<{ id: MediaType; label: string; hint: string; icon: typeof Tv }> = [
  { id: 'anime', label: 'Anime', hint: 'Bölüm bölüm, sezon sezon.', icon: Tv },
  { id: 'manga', label: 'Manga', hint: 'Panel panel, cilt cilt.', icon: BookOpen },
  { id: 'novel', label: 'Novel', hint: 'Sayfa sayfa, gece gece.', icon: BookMarked },
  { id: 'game', label: 'Oyun', hint: 'Saatlerce, dünyalar boyu.', icon: Gamepad2 },
];

export function Onboarding() {
  const onboard = useStore((s) => s.onboard);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🫖');
  const [color, setColor] = useState(COLORS[0]);
  const [genres, setGenres] = useState<string[]>([]);
  const [homeType, setHomeType] = useState<MediaType>('anime');

  const starters = useMemo(
    () => (genres.length ? recommendFrom([], genres, 3).filter((m) => m.cover) : []),
    [genres],
  );

  const canNext = name.trim().length >= 2;
  const canFinish = genres.length >= 2;

  const toggleGenre = (id: string) => {
    setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : prev.length >= 6 ? prev : [...prev, id]));
  };

  const finish = () => {
    if (!canFinish) return;
    onboard({ name, emoji, color, genres, homeType, starter: starters });
  };

  return (
    <div className="relative min-h-dvh">
      <div className="app-bg" aria-hidden />

      <div className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 md:grid-cols-[1.05fr_1fr]">
        {/* Sol: mekânın kapısı */}
        <div className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex lg:p-14">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" className="h-10 w-10 rounded-xl" />
            <div>
              <p className="display text-[1.2rem] leading-none">AniSync</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--ink-3)]">otaku mahallesi</p>
            </div>
          </div>

          <div className="max-w-md">
            <p className="eyebrow mb-4">otaku mahallesi · kapı açık</p>
            <h1 className="h1 text-[3.1rem] leading-[0.95] lg:text-[3.7rem]">
              Mekâna
              <br />
              hoş geldin.
            </h1>
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-[var(--ink-2)]">
              Anime, manga, novel ve oyun sevenlerin aynı masada buluştuğu bir yer burası.
              Rafını kur, ilerlemeni takip et, köşelere otur. Kimse kimseyi yargılamıyor.
            </p>

            <div className="mt-8 space-y-2.5 border-l border-[var(--line-strong)] pl-4">
              <p className="text-[12px] italic text-[var(--ink-3)]">“Çay biterse yeniden demleriz.”</p>
              <p className="text-[12px] italic text-[var(--ink-3)]">“Spoiler, söylenmeden önce sorulur.”</p>
              <p className="text-[12px] italic text-[var(--ink-3)]">“Yalnız izlemek de bir seçim, ama kapı açık.”</p>
            </div>
          </div>

          <p className="text-[10.5px] text-[var(--ink-3)]">
            İlerledikçe mekân değişir: seviye atladıkça yeni atmosferler açılır.
          </p>
        </div>

        {/* Sağ: form */}
        <div className="flex min-w-0 items-center justify-center px-4 py-8 md:border-l md:border-[var(--line)] md:px-8">
          <div className="w-full max-w-[460px]">
            <div className="mb-5 flex items-center justify-between md:hidden">
              <div className="flex items-center gap-2">
                <img src="/icon.svg" alt="" className="h-8 w-8 rounded-lg" />
                <p className="display text-[1.05rem]">AniSync</p>
              </div>
              <span className="chip">{step + 1}/2</span>
            </div>

            <div className="mb-6 flex gap-1.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{ background: i <= step ? 'var(--accent)' : 'var(--line)' }}
                />
              ))}
            </div>

            {step === 0 ? (
              <div className="animate-fade-up">
                <p className="eyebrow">ilk adım</p>
                <h2 className="h1 mt-2 text-[2.1rem]">Kendini nasıl çağıralım?</h2>
                <p className="mt-2 text-[13px] text-[var(--ink-3)]">
                  Gerçek adın olmak zorunda değil. Mekânda bu isimle anılacaksın.
                </p>

                <label className="mt-6 block">
                  <span className="eyebrow mb-2 block">adın / takma adın</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ör. Semih, kahvekurdu, gece_izleyicisi"
                    className="input text-[15px]"
                    autoFocus
                    maxLength={24}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canNext) setStep(1);
                    }}
                  />
                </label>

                <div className="mt-5">
                  <span className="eyebrow mb-2 block">masadaki yüzün</span>
                  <div className="grid grid-cols-5 gap-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className="flex aspect-square w-full items-center justify-center rounded-full border text-[20px] transition-all"
                        style={{
                          borderColor: emoji === e ? 'var(--accent)' : 'var(--line)',
                          background: emoji === e ? 'var(--accent-soft)' : 'var(--surface)',
                          transform: emoji === e ? 'scale(1.06)' : undefined,
                        }}
                        aria-label={`Avatar ${e}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <span className="eyebrow mb-2 block">rengin</span>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        aria-label={`Renk ${c}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform"
                        style={{ background: c, borderColor: color === c ? 'var(--ink)' : 'transparent', transform: color === c ? 'scale(1.1)' : undefined }}
                      >
                        {color === c && <Check size={13} color="#1b120c" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <button onClick={() => setStep(1)} disabled={!canNext} className="btn btn-primary w-full disabled:opacity-40">
                    Devam <ArrowRight size={15} />
                  </button>
                </div>
                <p className="mt-3 text-center text-[10.5px] text-[var(--ink-3)]">
                  Bilgilerin yalnızca bu cihazda saklanır. Hesap açman gerekmez.
                </p>
              </div>
            ) : (
              <div className="animate-fade-up">
                <button onClick={() => setStep(0)} className="mb-3 text-[11px] font-bold text-[var(--ink-3)] hover:text-[var(--ink)]">
                  ← geri
                </button>
                <p className="eyebrow">ikinci adım</p>
                <h2 className="h1 mt-2 text-[2.1rem]">Neyle ısınıyorsun?</h2>
                <p className="mt-2 text-[13px] text-[var(--ink-3)]">
                  En az iki tür seç; rafına ilk üç şeyi biz bırakalım.
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {GENRE_OPTIONS.map((g) => {
                    const active = genres.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGenre(g.id)}
                        className="rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all"
                        style={{
                          borderColor: active ? 'var(--accent)' : 'var(--line)',
                          background: active ? 'var(--accent-soft)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--ink-2)',
                        }}
                      >
                        {g.tr}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <span className="eyebrow mb-2 block">en çok nerede vakit geçiriyorsun?</span>
                  <div className="grid grid-cols-2 gap-2">
                    {HOMES.map((h) => {
                      const active = homeType === h.id;
                      const Icon = h.icon;
                      return (
                        <button
                          key={h.id}
                          onClick={() => setHomeType(h.id)}
                          className="rounded-[var(--radius-sm)] border p-3 text-left transition-all"
                          style={{
                            borderColor: active ? 'var(--accent)' : 'var(--line)',
                            background: active ? 'var(--accent-soft)' : 'var(--surface)',
                          }}
                        >
                          <Icon size={16} style={{ color: active ? 'var(--accent)' : 'var(--ink-3)' }} />
                          <p className="mt-1.5 text-[12.5px] font-bold">{h.label}</p>
                          <p className="text-[10px] leading-tight text-[var(--ink-3)]">{h.hint}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {starters.length > 0 && (
                  <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-3">
                    <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      <Sparkles size={12} /> rafına bırakacağımız üç şey
                    </p>
                    <div className="mt-2 flex gap-2">
                      {starters.map((m) => (
                        <div key={m.id} className="min-w-0 flex-1">
                          <div className="poster" style={{ borderRadius: 'var(--radius-xs)' }}>
                            <img src={m.cover} alt="" loading="lazy" referrerPolicy="no-referrer" />
                          </div>
                          <p className="mt-1 line-clamp-2 text-[9.5px] font-semibold leading-tight text-[var(--ink-2)]">{m.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={finish} disabled={!canFinish} className="btn btn-primary mt-6 w-full disabled:opacity-40">
                  Mekâna gir <ArrowRight size={15} />
                </button>
                <p className="mt-3 text-center text-[10.5px] text-[var(--ink-3)]">
                  Sonradan her şeyi değiştirebilirsin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
