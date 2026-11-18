import React, { useEffect, useRef } from 'react';
import { useSeasonalAmbience } from '../hooks/useSeasonalAmbience';
import { useAmbienceStore } from '../store/useAmbienceStore';
import type { AmbientParticle } from '../lib/ambience/season';

/**
 * Mevsimsel ambiyans katmanı.
 *
 * İki parça:
 * 1. Sabit mevsim tonu — `calm` modda tek başına yeterli, CPU maliyeti yok.
 * 2. Parçacık tuvali — yalnızca `full` modda, hareket azaltma kapalıyken ve
 *    sekme görünürken. `-z-10` katmanı içeriğin arkasında kalır; kartların
 *    opak yüzeyleri parçacıkları doğal biçimde örter.
 *
 * Performans sınırları: DPR ≤ 2, parçacık sayısı ≤ 110, ekran alanına göre
 * ölçeklenir, sekme gizlenince çizim durur, rota duraklatıldığında tuval hiç
 * monte edilmez.
 */

const TAU = Math.PI * 2;
const MAX_PARTICLES = 110;
const MIN_PARTICLES = 14;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  alpha: number;
  sway: number;
  offset: number;
}

const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);

const spawnParticle = (
  width: number,
  height: number,
  kind: AmbientParticle,
): Particle => {
  const base: Particle = {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0,
    vy: 0,
    size: randomBetween(2, 4.5),
    angle: Math.random() * TAU,
    spin: randomBetween(-0.8, 0.8),
    alpha: 0.55,
    sway: randomBetween(0.4, 1.3),
    offset: Math.random() * TAU,
  };

  switch (kind) {
    case 'snow':
      base.vy = randomBetween(16, 42);
      base.vx = randomBetween(-8, 8);
      base.size = randomBetween(1.8, 4.2);
      base.alpha = randomBetween(0.4, 0.75);
      break;
    case 'petal':
      base.vy = randomBetween(12, 30);
      base.vx = randomBetween(-14, 14);
      base.size = randomBetween(3, 6);
      base.alpha = randomBetween(0.35, 0.6);
      break;
    case 'leaf':
      base.vy = randomBetween(18, 40);
      base.vx = randomBetween(-20, 20);
      base.size = randomBetween(3, 6.5);
      base.alpha = randomBetween(0.35, 0.6);
      break;
    case 'mote':
      base.vy = randomBetween(-10, -3);
      base.vx = randomBetween(-4, 4);
      base.size = randomBetween(1.2, 2.4);
      base.alpha = randomBetween(0.2, 0.4);
      break;
    case 'firefly':
      base.vy = randomBetween(-6, 6);
      base.vx = randomBetween(-6, 6);
      base.size = randomBetween(1.6, 2.8);
      base.alpha = randomBetween(0.5, 0.9);
      break;
  }

  return base;
};

const drawParticle = (
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  kind: AmbientParticle,
  color: string,
  time: number,
): void => {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.angle);
  ctx.fillStyle = color;

  if (kind === 'firefly') {
    // Yumuşak hale + çekirdek. `shadowBlur` yerine iki daire: mobilde daha ucuz.
    const pulse = Math.max(0, Math.sin(time * 0.0012 + particle.offset));
    ctx.globalAlpha = 0.12 + pulse * 0.22;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size * 3, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = 0.35 + pulse * 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size, 0, TAU);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (kind === 'snow' || kind === 'mote') {
    ctx.globalAlpha =
      particle.alpha * (0.75 + 0.25 * Math.sin(time * 0.001 + particle.offset));
    ctx.beginPath();
    ctx.arc(0, 0, particle.size, 0, TAU);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Petal / leaf: dönen elips.
  ctx.globalAlpha =
    particle.alpha * (0.8 + 0.2 * Math.sin(time * 0.0013 + particle.offset));
  ctx.beginPath();
  ctx.ellipse(0, 0, particle.size, particle.size * 0.45, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
};

const stepParticle = (
  particle: Particle,
  kind: AmbientParticle,
  width: number,
  height: number,
  dt: number,
  time: number,
  gustPower: number,
): void => {
  const drift = Math.sin(time * 0.001 * particle.sway + particle.offset) * 14 * dt;
  const gust = kind === 'firefly' ? 18 * gustPower : 95 * gustPower;

  particle.x += (particle.vx + gust) * dt + drift;
  particle.y += particle.vy * dt;
  particle.angle += particle.spin * dt;

  if (kind === 'firefly') {
    // Ateş böceği kenarlarda yumuşakça geri döner.
    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;
    if (particle.y < -10) particle.y = height + 10;
    if (particle.y > height + 10) particle.y = -10;
    return;
  }

  if (particle.y > height + 12) {
    particle.y = -12;
    particle.x = Math.random() * width;
  } else if (particle.y < -12) {
    particle.y = height + 12;
    particle.x = Math.random() * width;
  }

  if (particle.x < -14) particle.x = width + 14;
  if (particle.x > width + 14) particle.x = -14;
};

export const SeasonalAmbience: React.FC = () => {
  const { profile, paused, reducedMotion, particlesActive, gust } = useSeasonalAmbience();
  const mode = useAmbienceStore((state) => state.mode);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gustAtRef = useRef(0);

  useEffect(() => {
    gustAtRef.current = performance.now();
  }, [gust]);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'off' || paused) {
      delete root.dataset.ambience;
      return;
    }
    root.dataset.ambience = `${profile.season}-${profile.phase}-${mode}${
      reducedMotion ? '-reduced' : ''
    }`;
    return () => {
      delete root.dataset.ambience;
    };
  }, [mode, paused, profile.season, profile.phase, reducedMotion]);

  useEffect(() => {
    if (!particlesActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const kind = profile.particle;
    const color = profile.palette.particle;
    const density = profile.density;

    let width = 0;
    let height = 0;
    let targetCount = 0;
    let particles: Particle[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      targetCount = Math.round(
        Math.min(
          MAX_PARTICLES,
          Math.max(MIN_PARTICLES, (width * height) / 18_000),
        ) * density,
      );

      if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      }
      while (particles.length < targetCount) {
        particles.push(spawnParticle(width, height, kind));
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', resize, { passive: true });

    let frame = 0;
    let last = 0;

    const render = (time: number) => {
      frame = window.requestAnimationFrame(render);

      if (document.hidden) {
        last = time;
        return;
      }

      const dt = last === 0 ? 0 : Math.min(0.05, (time - last) / 1000);
      last = time;

      const gustAge = (performance.now() - gustAtRef.current) / 1000;
      const gustPower = gustAge < 1.6 ? Math.max(0, 1 - gustAge / 1.6) : 0;

      ctx.clearRect(0, 0, width, height);
      for (const particle of particles) {
        stepParticle(particle, kind, width, height, dt, time, gustPower);
        drawParticle(ctx, particle, kind, color, time);
      }
      ctx.globalAlpha = 1;
    };

    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      particles = [];
      ctx.clearRect(0, 0, width, height);
    };
  }, [particlesActive, profile.particle, profile.palette.particle, profile.density]);

  if (mode === 'off' || paused) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% -8%, ${profile.palette.tint} 0%, transparent 62%), radial-gradient(ellipse at 50% 108%, ${profile.palette.tint} 0%, transparent 55%)`,
        }}
      />
      {particlesActive && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" />
      )}
    </div>
  );
};
