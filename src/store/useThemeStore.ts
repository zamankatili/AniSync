import { create } from 'zustand';

export type TimeThemeId = 'dawn' | 'noon' | 'twilight' | 'midnight' | 'light';

export interface ThemeConfig {
  id: TimeThemeId;
  nameTR: string;
  nameEN: string;
  timeRange: string;
  descriptionTR: string;
  accentColor: string; // Hex color
  secondaryColor: string;
  glowColor: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
}

export const THEME_CONFIGS: Record<TimeThemeId, ThemeConfig> = {
  dawn: {
    id: 'dawn',
    nameTR: 'Tokyo Şafağı',
    nameEN: 'Tokyo Dawn',
    timeRange: '06:00 - 11:59',
    descriptionTR: 'Sıcak altın sarısı ve gün doğumu portakalı.',
    accentColor: '#f59e0b',
    secondaryColor: '#ea580c',
    glowColor: 'rgba(245, 158, 11, 0.28)',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-black',
    icon: '🌅'
  },
  noon: {
    id: 'noon',
    nameTR: 'Akihabara Öğlesi',
    nameEN: 'Akihabara Noon',
    timeRange: '12:00 - 17:59',
    descriptionTR: 'Klasik Neo-Brutalist yüksek kontrast, kıpkırmızı enerji.',
    accentColor: '#e11d48',
    secondaryColor: '#ffffff',
    glowColor: 'rgba(225, 29, 72, 0.28)',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    icon: '☀️'
  },
  twilight: {
    id: 'twilight',
    nameTR: 'Shinjuku Alacakaranlık',
    nameEN: 'Shinjuku Twilight',
    timeRange: '18:00 - 21:59',
    descriptionTR: 'Neon gün batımı, fuşya ve lavanta moru vurgular.',
    accentColor: '#d946ef',
    secondaryColor: '#a855f7',
    glowColor: 'rgba(217, 70, 239, 0.32)',
    badgeBg: 'bg-fuchsia-500',
    badgeText: 'text-white',
    icon: '🌇'
  },
  midnight: {
    id: 'midnight',
    nameTR: 'Neo-Tokyo Gece',
    nameEN: 'Neo-Tokyo Midnight',
    timeRange: '22:00 - 05:59',
    descriptionTR: 'Cyberpunk gece, elektrik cyan ve neon yeşili zarafet.',
    accentColor: '#06b6d4',
    secondaryColor: '#10b981',
    glowColor: 'rgba(6, 182, 212, 0.30)',
    badgeBg: 'bg-cyan-400',
    badgeText: 'text-black',
    icon: '🌙'
  },
  light: {
    id: 'light',
    nameTR: 'Yüksek Kontrast Işık',
    nameEN: 'High-Contrast Light',
    timeRange: 'Aydınlık Mod',
    descriptionTR: 'Beyaz zemin üzerine siyah yüksek kontrastlı aydınlık tema.',
    accentColor: '#000000',
    secondaryColor: '#ffffff',
    glowColor: 'rgba(0, 0, 0, 0.08)',
    badgeBg: 'bg-black',
    badgeText: 'text-white',
    icon: '💡'
  }
};

export const getAutoThemeByHour = (hour: number): TimeThemeId => {
  if (hour >= 6 && hour < 12) return 'dawn';
  if (hour >= 12 && hour < 18) return 'noon';
  if (hour >= 18 && hour < 22) return 'twilight';
  return 'midnight';
};

const applyThemeToDOM = (theme: TimeThemeId) => {
  if (typeof document === 'undefined') return;
  const cfg = THEME_CONFIGS[theme] || THEME_CONFIGS.noon;
  
  document.documentElement.setAttribute('data-time-theme', theme);
  document.body.setAttribute('data-time-theme', theme);

  document.documentElement.style.setProperty('--theme-accent', cfg.accentColor);
  document.documentElement.style.setProperty('--theme-secondary', cfg.secondaryColor);
  document.documentElement.style.setProperty('--theme-glow', cfg.glowColor);
  document.documentElement.style.setProperty('--theme-shadow', `4px 4px 0px 0px ${cfg.accentColor}`);
};

interface ThemeState {
  currentTheme: TimeThemeId;
  isAutoMode: boolean;
  setTheme: (theme: TimeThemeId) => void;
  toggleAutoMode: () => void;
  checkAutoTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const currentHour = new Date().getHours();
  const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('anisync_time_theme') : null) as TimeThemeId | null;
  const savedAuto = typeof window !== 'undefined' ? localStorage.getItem('anisync_auto_theme') === 'true' : false;

  const initialTheme = savedAuto || !savedTheme ? getAutoThemeByHour(currentHour) : savedTheme;

  // Immediately apply on store creation
  applyThemeToDOM(initialTheme);

  return {
    currentTheme: initialTheme,
    isAutoMode: savedAuto,

    setTheme: (theme: TimeThemeId) => {
      set({ currentTheme: theme, isAutoMode: false });
      if (typeof window !== 'undefined') {
        localStorage.setItem('anisync_time_theme', theme);
        localStorage.setItem('anisync_auto_theme', 'false');
      }
      applyThemeToDOM(theme);
    },

    toggleAutoMode: () => {
      const newAuto = !get().isAutoMode;
      const hour = new Date().getHours();
      const autoTheme = getAutoThemeByHour(hour);

      set({
        isAutoMode: newAuto,
        currentTheme: newAuto ? autoTheme : get().currentTheme
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('anisync_auto_theme', String(newAuto));
      }
      if (newAuto) {
        applyThemeToDOM(autoTheme);
      }
    },

    checkAutoTheme: () => {
      if (get().isAutoMode) {
        const hour = new Date().getHours();
        const autoTheme = getAutoThemeByHour(hour);
        if (autoTheme !== get().currentTheme) {
          set({ currentTheme: autoTheme });
          applyThemeToDOM(autoTheme);
        }
      }
    }
  };
});
