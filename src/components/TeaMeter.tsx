interface TeaMeterProps {
  percent: number;
  size?: number;
  showSteam?: boolean;
  className?: string;
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

/** Bardağın verilen yükseklikteki sol/sağ kenarı (tulip formu). */
function edgeAt(y: number): [number, number] {
  const topY = 3;
  const waistY = 24.5;
  const bottomY = 35;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  if (y <= waistY) {
    const t = (y - topY) / (waistY - topY);
    return [lerp(7, 9.4, t), lerp(25, 22.6, t)];
  }
  const t = Math.min(1, (y - waistY) / (bottomY - waistY));
  const e = Math.pow(t, 1.7);
  return [lerp(9.4, 15.2, e), lerp(22.6, 16.8, e)];
}

/**
 * İnce belli çay bardağı: seviye ilerlemesinin imzası.
 * Doluluk arttıkça buhar yavaşlar, bardak "demlenmiş" görünür.
 */
export function TeaMeter({ percent, size = 40, showSteam = true, className = '' }: TeaMeterProps) {
  const p = clamp(percent);
  const height = size;
  const width = size * (32 / 53);

  const glass =
    'M7 3 H25 L22.6 24.5 C22.1 31.5 19.6 35 16 35 C12.4 35 9.9 31.5 9.4 24.5 Z';

  const bottom = 34.4;
  const top = 4.4;
  const fillY = bottom - ((bottom - top) * p) / 100;

  // Dolguyu bardak formuna oturtmak için kenar noktalarını örnekliyoruz.
  const steps = 8;
  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i += 1) {
    const y = fillY + ((bottom - fillY) * i) / steps;
    const [l, r] = edgeAt(y);
    left.push([l, y]);
    right.push([r, y]);
  }
  const fillPath = [
    `M ${left[0][0].toFixed(2)} ${left[0][1].toFixed(2)}`,
    ...left.slice(1).map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`),
    ...right
      .slice()
      .reverse()
      .map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`),
    'Z',
  ].join(' ');
  const surface = left[0] && right[0] ? { x1: left[0][0] + 0.6, x2: right[0][0] - 0.6, y: fillY } : null;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 -5 32 53"
      role="img"
      aria-label={`Seviye ilerlemesi yüzde ${Math.round(p)}`}
      className={className}
    >
      {showSteam && p < 99.5 && (
        <g stroke="var(--accent)" strokeWidth="1.1" fill="none" opacity="0.5" strokeLinecap="round">
          <path d="M12.5 1.2c1.4-1.2 1.4-2.4 0-3.6" style={{ animation: 'steam 3.2s ease-in-out infinite' }} />
          <path d="M16 -0.8c1.4-1.2 1.4-2.4 0-3.6" style={{ animation: 'steam 3.2s ease-in-out 0.6s infinite' }} />
          <path d="M19.5 1.2c1.4-1.2 1.4-2.4 0-3.6" style={{ animation: 'steam 3.2s ease-in-out 1.2s infinite' }} />
        </g>
      )}

      <path d={glass} fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="1.2" strokeLinejoin="round" />
      {p > 0.5 && <path d={fillPath} fill="var(--accent)" opacity="0.95" />}
      {p > 0.5 && surface && (
        <line
          x1={surface.x1}
          y1={surface.y}
          x2={surface.x2}
          y2={surface.y}
          stroke="#f6e7d6"
          strokeWidth="1.1"
          opacity="0.5"
        />
      )}
      <path d={glass} fill="none" stroke="var(--line-strong)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M13.6 38.6 L18.4 38.6 L19.2 41 L12.8 41 Z" fill="var(--line-strong)" opacity="0.5" />
      <path d="M9 43.4 H23" stroke="var(--line-strong)" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
