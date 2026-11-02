import type { CSSProperties } from 'react';

interface AvatarProps {
  emoji: string;
  color: string;
  size?: number;
  className?: string;
  ring?: boolean;
}

export function Avatar({ emoji, color, size = 40, className = '', ring = true }: AvatarProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.5,
    background: `linear-gradient(150deg, ${color}38, ${color}0f)`,
    borderColor: ring ? `${color}66` : 'transparent',
  };
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full border ${className}`}
      style={style}
    >
      <span style={{ lineHeight: 1, transform: 'translateY(1px)' }}>{emoji}</span>
    </span>
  );
}
