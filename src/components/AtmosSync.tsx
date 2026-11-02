import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { atmosById } from '../lib/level';

/** Aktif atmosferi <html> üzerine uygular; önizleme varsa geçici olarak onu gösterir. */
export function AtmosSync() {
  const atmos = useStore((s) => s.atmos);
  const preview = useStore((s) => s.preview);
  const motion = useStore((s) => s.settings.motion);
  const effective = preview ?? atmos;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-atmos', effective);
    root.setAttribute('data-motion', motion ? 'on' : 'off');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const colors: Record<string, string> = {
        cay: '#17100e',
        klasik: '#050505',
        sinema: '#140d0d',
        kutuphane: '#f1e7d5',
        safak: '#fdf0e4',
      };
      meta.setAttribute('content', colors[effective] ?? '#17100e');
    }
  }, [effective, motion]);

  useEffect(() => {
    document.title = preview
      ? `${atmosById(preview).name} · önizleme — AniSync`
      : 'AniSync — Otaku Mahallesi';
  }, [preview]);

  return null;
}
