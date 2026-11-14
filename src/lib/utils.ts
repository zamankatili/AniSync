import type React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FALLBACK_ANIME_COVER = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%230a0a0a'/%3E%3Crect x='8' y='8' width='284' height='434' fill='none' stroke='%23e11d48' stroke-width='4'/%3E%3Cpath d='M100 200 L150 140 L200 200 Z' fill='%23222222'/%3E%3Ccircle cx='130' cy='170' r='12' fill='%23e11d48'/%3E%3Ctext x='50%25' y='60%25' font-family='sans-serif' font-weight='900' font-size='18' fill='%23ffffff' text-anchor='middle'%3EANIME GÖRSELİ%3C/text%3E%3Ctext x='50%25' y='67%25' font-family='sans-serif' font-weight='700' font-size='11' fill='%23999999' text-anchor='middle'%3EOTOMATİK YEDEK%3C/text%3E%3C/svg%3E";

// Global Image Preloading & Memory Caching Engine
const imageCacheMap = new Map<string, boolean>();
const FAILED_IMAGES = new Set<string>();

export const preloadImage = (url: string): Promise<boolean> => {
  if (!url || FAILED_IMAGES.has(url)) return Promise.resolve(false);
  if (imageCacheMap.has(url)) return Promise.resolve(true);

  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.src = url;
    img.onload = () => {
      imageCacheMap.set(url, true);
      resolve(true);
    };
    img.onerror = () => {
      FAILED_IMAGES.add(url);
      resolve(false);
    };
  });
};

export const preloadImages = async (urls: string[]) => {
  const validUrls = urls.filter((u) => u && !imageCacheMap.has(u) && !FAILED_IMAGES.has(u));
  await Promise.allSettled(validUrls.map((url) => preloadImage(url)));
};

export const isImageCached = (url: string): boolean => {
  return imageCacheMap.has(url);
};

export const clearImageCache = () => {
  imageCacheMap.clear();
  FAILED_IMAGES.clear();
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src && target.src !== FALLBACK_ANIME_COVER) {
    FAILED_IMAGES.add(target.src);
    target.onerror = null; // Prevent infinite loop if fallback fails
    target.src = FALLBACK_ANIME_COVER;
  }
};

export const getSafeImageUrl = (url?: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return FALLBACK_ANIME_COVER;
  }

  const trimmed = url.trim();

  if (FAILED_IMAGES.has(trimmed)) {
    return FALLBACK_ANIME_COVER;
  }

  // If already a data URI or valid SVG, return as is
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Upgrade http to https
  const secureUrl = trimmed.startsWith('http://') ? trimmed.replace('http://', 'https://') : trimmed;

  return secureUrl;
};

/**
 * Firestore Timestamp, { seconds, nanoseconds }, ISO string, sayı veya Date'i
 * güvenli biçimde Date'e çevirir. Anonim/yerel mesajlarda `toDate()` bulunmadığı
 * için doğrudan çağrı yapmak uygulamayı çökertiyordu (bkz. GlobalChat).
 */
export const toDateSafe = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object') {
    const candidate = value as { toDate?: () => Date; seconds?: number; nanoseconds?: number };
    if (typeof candidate.toDate === 'function') {
      try {
        const d = candidate.toDate();
        return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
      } catch {
        return null;
      }
    }
    if (typeof candidate.seconds === 'number') {
      const d = new Date(candidate.seconds * 1000 + (candidate.nanoseconds ?? 0) / 1e6);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  return null;
};

export const formatRelativeTime = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Az önce';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}d önce`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}s önce`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}g önce`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}h önce`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}a önce`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y önce`;
};

/**
 * Accent renkle yeterince kontrast veren okunabilir metin rengi seçer.
 * WCAG kontrast oranını (siyah/beyaz) hesaplayıp daha iyi olanı döndürür.
 * time-of-day temaların parlak accent'leri (amber/cyan/fuchsia) üzerinde
 * beyaz metin 2.x:1 seviyesine düşebiliyor; neo-brutalist vurgularda AA için gerekli.
 */
export const getReadableTextColor = (hex: string): '#000000' | '#ffffff' => {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return '#ffffff';
  const int = parseInt(match[1], 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
  const L = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const contrast = (other: number) => (Math.max(L, other) + 0.05) / (Math.min(L, other) + 0.05);
  return contrast(1) >= contrast(0) ? '#ffffff' : '#000000';
};
