import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ATMOSPHERES, rankFor } from '../lib/level';
import { Sheet } from './Sheet';

export function LevelUpModal() {
  const levelUp = useStore((s) => s.levelUp);
  const clearLevelUp = useStore((s) => s.clearLevelUp);
  const setAtmos = useStore((s) => s.setAtmos);

  if (!levelUp) return null;
  const rank = rankFor(levelUp.level);
  const unlocks = ATMOSPHERES.filter((a) => levelUp.unlocks.includes(a.id));

  return (
    <Sheet
      open
      onClose={clearLevelUp}
      title="Seviye atladın"
      subtitle={`Artık ${rank.name}’sın. ${rank.line}`}
    >
      <div className="flex flex-col items-center pb-2">
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 35%, var(--accent-soft), transparent 70%)',
            border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
            animation: 'levelGlow 2.4s ease-out 1',
          }}
        >
          <span className="display text-[2.6rem] leading-none text-[var(--accent)]">{levelUp.level}</span>
          <Sparkles size={16} className="absolute -right-1 top-1 text-[var(--accent)]" />
        </div>

        {unlocks.length > 0 ? (
          <div className="mt-5 w-full space-y-3">
            <p className="eyebrow text-center">Yeni bir kapı açıldı</p>
            {unlocks.map((a) => (
              <div key={a.id} className="card-inset flex items-start gap-3 p-3.5">
                <span className="text-2xl leading-none">{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="display text-[1.05rem] text-[var(--ink)]">{a.name}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-[var(--ink-3)]">{a.tagline}</p>
                </div>
                <button
                  onClick={() => {
                    setAtmos(a.id);
                    clearLevelUp();
                  }}
                  className="btn btn-primary btn-sm shrink-0"
                >
                  Geç
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 max-w-xs text-center text-[12.5px] leading-relaxed text-[var(--ink-3)]">
            Mekân seninle büyüyor. Sıradaki atmosfer için biraz daha birlikte vakit geçirelim.
          </p>
        )}

        <button onClick={clearLevelUp} className="btn btn-ghost mt-5 w-full">
          Sonra bakarım
        </button>
      </div>
    </Sheet>
  );
}
