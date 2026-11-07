import { Capacitor } from '@capacitor/core';

/**
 * API taban adresi.
 *
 * Web'de boş string döner; istekler aynı origin'e (`/api/...`) gider.
 * Native (Android/iOS) kabukta ise göreli yollar çalışmadığı için
 * `VITE_API_BASE_URL` ile verilen sunucuya ya da üretim alan adına gider.
 */
const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

const normalize = (value: string) => value.replace(/\/+$/, '');

export const API_BASE = envBase
  ? normalize(envBase)
  : Capacitor.isNativePlatform()
    ? 'https://anisync.app'
    : '';

/** `/api/...` yolunu platforma göre tam adrese çevirir. */
export function apiUrl(path: string): string {
  if (!API_BASE) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Uygulamanın native kabukta çalışıp çalışmadığını bildirir. */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/** Native platform adı ('android' | 'ios' | 'web'). */
export const nativePlatform = (): string => Capacitor.getPlatform();
