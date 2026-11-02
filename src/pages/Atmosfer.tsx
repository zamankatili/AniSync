import { Link } from 'react-router-dom';
import { Check, Eye, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ATMOSPHERES, levelProgress, rankFor } from '../lib/level';
import { TeaMeter } from '../components/TeaMeter';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { THEME_CONFIGS, useThemeStore } from '../store/useThemeStore';

function AtmosPreview({ id }: { id: string }) {
  return (
    <div data-atmos={id} className="h-[146px] w-full overflow-hidden p-3" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[4px] text-[8px]" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
            A
          </span>
          <span className="display text-[12px]" style={{ color: 'var(--ink)' }}>AniSync</span>
        </div>
        <span className="rounded-full px-1.5 py-[2px] text-[7.5px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          canlı
        </span>
      </div>

      <div className="mt-2.5 flex gap-2">
        <div
          className="relative h-[76px] w-[52px] shrink-0 overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, var(--accent-soft), var(--surface-3))',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <img src="/icon.svg" alt="" className="h-full w-full object-cover opacity-45" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-[7px] w-4/5 rounded-full" style={{ background: 'var(--ink)', opacity: 0.82 }} />
          <div className="mt-1.5 h-[5px] w-3/5 rounded-full" style={{ background: 'var(--ink-3)', opacity: 0.55 }} />
          <div className="mt-2 flex gap-1">
            <span className="rounded-full px-1.5 py-[2px] text-[7px] font-bold" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>
              Fantastik
            </span>
            <span className="rounded-full px-1.5 py-[2px] text-[7px] font-bold" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>
              Macera
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="btn btn-primary" style={{ padding: '3px 7px', fontSize: '7.5px', borderRadius: 'var(--btn-radius)' }}>
              Rafıma ekle
            </span>
            <span className="text-[7px]" style={{ color: 'var(--ink-3)' }}>12 bölüm · 2024</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
              <div className="h-full w-2/3 rounded-full" style={{ background: 'var(--accent)' }} />
            </div>
            <span className="text-[6.5px]" style={{ color: 'var(--ink-3)' }}>8 / 12</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SHORT: Record<keyof typeof THEME_CONFIGS, string> = {
  dawn: '\u015Eafak',
  noon: '\u00D6\u011Fle',
  twilight: 'Alacakaranl\u0131k',
  midnight: 'Gece',
  light: 'I\u015F\u0131k',
};

export function Atmosfer() {
  const xp = useStore((s) => s.xp);
  const atmos = useStore((s) => s.atmos);
  const setAtmos = useStore((s) => s.setAtmos);
  const previewAtmos = useStore((s) => s.previewAtmos);
  const preview = useStore((s) => s.preview);
  const { currentTheme, isAutoMode, setTheme, toggleAutoMode } = useThemeStore();

  const progress = levelProgress(xp);
  const rank = rankFor(progress.level);
  const activeTime = THEME_CONFIGS[currentTheme];

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">atmosferler</p>
        <h1 className="h1 mt-1.5">Mekânın ışığı</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[var(--ink-2)]">
          AniSync tek bir görünüm değil, zamanla açılan bir mekân. Seviye atladıkça yeni bir atmosfer açılır;
          dilediğin an aralarında geçebilirsin. Aynı raf, aynı insanlar, farklı ışık.
        </p>
      </header>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <TeaMeter percent={progress.percent} size={64} />
          <div className="min-w-0">
            <p className="eyebrow">şu an · seviye {progress.level}</p>
            <p className="display text-[1.35rem] leading-tight">
              {ATMOSPHERES.find((a) => a.id === (preview ?? atmos))?.name}
            </p>
            <p className="mt-0.5 text-[11.5px] text-[var(--ink-3)]">
              {rank.name} · sıradaki seviyeye {progress.remaining} XP
            </p>
          </div>
        </div>
        <Link to="/raf" className="btn btn-ghost btn-sm w-full shrink-0 sm:ml-auto sm:w-auto">
          XP kazan <ArrowRight size={13} />
        </Link>
      </div>

      <section className="card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">klasik içinde</p>
            <p className="display text-[1.15rem]">Günün saatine göre 5 palet</p>
            <p className="mt-1 text-[11px] text-[var(--ink-3)]">
              Seçili: {activeTime.icon} {activeTime.nameTR} · {isAutoMode ? 'otomatik' : 'sabit'}
            </p>
          </div>
          <ThemeSwitcher />
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {(Object.keys(THEME_CONFIGS) as Array<keyof typeof THEME_CONFIGS>).map((id) => {
            const cfg = THEME_CONFIGS[id];
            const selected = currentTheme === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setTheme(id);
                  setAtmos('klasik');
                }}
                className="rounded-[var(--radius-xs)] border p-2 text-center transition-colors"
                style={{
                  borderColor: selected ? 'var(--accent)' : 'var(--line)',
                  background: selected ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                <span className="text-[16px] leading-none">{cfg.icon}</span>
                <span className="mt-1 block text-[8px] font-bold uppercase leading-tight text-[var(--ink-2)]">
                  {SHORT[id]}
                </span>
                <span className="mt-1.5 block h-1.5 w-full rounded-full" style={{ background: cfg.accentColor }} />
              </button>
            );
          })}
        </div>

        <button onClick={toggleAutoMode} className="btn btn-ghost btn-sm mt-3 w-full">
          {isAutoMode ? 'Otomatik modu kapat' : 'Otomatik saate bırak (06 · 12 · 18 · 22)'}
        </button>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ATMOSPHERES.map((a) => {
          const unlocked = progress.level >= a.unlockLevel;
          const active = atmos === a.id;
          const isPreviewing = preview === a.id;

          return (
            <article key={a.id} className="card overflow-hidden">
              <div className="relative">
                <AtmosPreview id={a.id} />
                {!unlocked && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 backdrop-blur-[3px]"
                    style={{ background: 'rgba(14, 9, 7, 0.55)', color: '#fff' }}
                  >
                    <Lock size={18} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
                      seviye {a.unlockLevel}’de açılır
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="display text-[1.18rem] leading-tight">{a.name}</h2>
                    <p className="mt-0.5 text-[11px] italic text-[var(--ink-3)]">{a.tagline}</p>
                  </div>
                  <span className="text-[20px] leading-none">{a.icon}</span>
                </div>

                <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--ink-2)]">{a.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {active ? (
                    <span className="btn btn-soft btn-sm cursor-default">
                      <Check size={12} /> buradasın
                    </span>
                  ) : unlocked ? (
                    <button onClick={() => setAtmos(a.id)} className="btn btn-primary btn-sm">
                      Bu atmosfere geç
                    </button>
                  ) : (
                    <>
                      <button onClick={() => previewAtmos(a.id)} className="btn btn-ghost btn-sm">
                        <Eye size={12} /> 12 sn göz at
                      </button>
                      <span className="text-[10px] text-[var(--ink-3)]">
                        {a.unlockLevel - progress.level} seviye kaldı
                      </span>
                    </>
                  )}
                  {isPreviewing && <span className="chip chip-accent">önizleme</span>}
                </div>

                {!unlocked && (
                  <div className="mt-3">
                    <div className="h-[3px] overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (xp / (25 * (a.unlockLevel - 1) * a.unlockLevel)) * 100)}%`,
                          background: 'var(--accent)',
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[9.5px] text-[var(--ink-3)]">
                      {xp} / {25 * (a.unlockLevel - 1) * a.unlockLevel} XP
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="card-inset p-4">
        <p className="eyebrow mb-2">nasıl açılır</p>
        <div className="space-y-1.5 text-[11.5px] leading-relaxed text-[var(--ink-2)]">
          <p>• Rafına eser ekle: <strong>+15 XP</strong> · bölüm/cilt/sayfa ilerlet: <strong>+4 XP</strong></p>
          <p>• Bir eseri bitir: <strong>+40 XP</strong> · puan ver: <strong>+6 XP</strong></p>
          <p>• Gönderi paylaş: <strong>+20 XP</strong> · yanıt yaz: <strong>+8 XP</strong> · köşeye katıl: <strong>+12 XP</strong></p>
          <p>• Her gün uğra: <strong>+10 XP</strong> ve seri bonusu</p>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-[var(--ink-3)]">
          <Sparkles size={11} /> Kilitli atmosferleri 12 saniyeliğine deneyebilirsin; beğenirsen kazanana kadar bekle.
        </p>
      </div>
    </div>
  );
}
