import { create } from 'zustand';
import { AnimeReminder, DayOfWeek } from '../types';
import { AiringAnime } from '../data/airingSchedule';
import { db, auth } from '../firebase';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import i18n from '../i18n';
import { playReminderChime } from '../lib/gentleAudio';

const tr = (key: string, options?: Record<string, unknown>): string =>
  String(i18n.t(key, options));

interface ReminderState {
  reminders: AnimeReminder[];
  notificationPermission: NotificationPermission;
  isScheduleModalOpen: boolean;
  modalInitialTab: 'schedule' | 'reminders' | 'season';
  openScheduleModal: (tab?: 'schedule' | 'reminders' | 'season') => void;
  closeScheduleModal: () => void;
  initReminders: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
  addReminder: (anime: AiringAnime, options?: { notifyBeforeMinutes?: number; soundEnabled?: boolean; browserNotify?: boolean }) => Promise<void>;
  removeReminder: (mal_id: number) => Promise<void>;
  updateReminder: (mal_id: number, updates: Partial<AnimeReminder>) => Promise<void>;
  isReminderSet: (mal_id: number) => boolean;
  getReminder: (mal_id: number) => AnimeReminder | undefined;
  sendTestNotification: () => void;
  playChimeSound: () => void;
  downloadIcsFile: (anime: AiringAnime | AnimeReminder) => void;
  generateGoogleCalendarUrl: (anime: AiringAnime | AnimeReminder) => string;
  getNextAiringDate: (day: DayOfWeek, timeTR: string) => Date;
  getTimeUntilAiring: (day: DayOfWeek, timeTR: string) => { days: number; hours: number; minutes: number; text: string; isToday: boolean };
}

const LOCAL_STORAGE_KEY = 'anisync_anime_reminders';

const DAY_MAP: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const ICS_BY_DAY: Record<DayOfWeek, string> = {
  sunday: 'SU',
  monday: 'MO',
  tuesday: 'TU',
  wednesday: 'WE',
  thursday: 'TH',
  friday: 'FR',
  saturday: 'SA',
};

// Gentle chime shared with the rest of the product (see lib/gentleAudio.ts).
// It respects the global SFX preference and uses a much lower ceiling than the
// old hand-rolled 0.15/0.18 dual tone.

export const useReminderStore = create<ReminderState>((set, get) => {
  // Load initial from localStorage
  const loadLocal = (): AnimeReminder[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveLocal = (items: AnimeReminder[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save reminders locally', err);
    }
  };

  const getPermission = (): NotificationPermission => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  };

  return {
    reminders: loadLocal(),
    notificationPermission: getPermission(),
    isScheduleModalOpen: false,
    modalInitialTab: 'schedule',

    openScheduleModal: (tab = 'schedule') => {
      set({ isScheduleModalOpen: true, modalInitialTab: tab });
    },

    closeScheduleModal: () => {
      set({ isScheduleModalOpen: false });
    },

    initReminders: async () => {
      // Refresh local permissions
      set({ notificationPermission: getPermission() });

      // If user is logged in, optionally fetch from Firestore
      const user = auth.currentUser;
      if (user) {
        try {
          const snap = await getDocs(collection(db, 'users', user.uid, 'reminders'));
          if (!snap.empty) {
            const list: AnimeReminder[] = [];
            snap.forEach((docSnap) => {
              list.push(docSnap.data() as AnimeReminder);
            });
            // Merge local and remote
            const localList = get().reminders;
            const map = new Map<number, AnimeReminder>();
            localList.forEach(r => map.set(r.mal_id, r));
            list.forEach(r => map.set(r.mal_id, r));
            const merged = Array.from(map.values());
            set({ reminders: merged });
            saveLocal(merged);
          }
        } catch (err) {
          console.warn('Could not sync reminders from Firestore, using local cache', err);
        }
      }
    },

    requestPermission: async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const res = await Notification.requestPermission();
          set({ notificationPermission: res });
          return res;
        } catch {
          return 'denied';
        }
      }
      return 'denied';
    },

    playChimeSound: () => {
      playReminderChime();
    },

    sendTestNotification: () => {
      playReminderChime();

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(tr('reminder_test_title'), {
          body: tr('reminder_test_body'),
          icon: '/favicon.ico',
        });
      }
    },

    isReminderSet: (mal_id: number) => {
      return get().reminders.some((r) => r.mal_id === mal_id);
    },

    getReminder: (mal_id: number) => {
      return get().reminders.find((r) => r.mal_id === mal_id);
    },

    addReminder: async (anime: AiringAnime, options = {}) => {
      const {
        notifyBeforeMinutes = 15,
        soundEnabled = true,
        browserNotify = true,
      } = options;

      const reminderItem: AnimeReminder = {
        id: `rem_${anime.mal_id}`,
        mal_id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english,
        image: anime.image,
        day: anime.day,
        timeTR: anime.timeTR,
        timeJST: anime.timeJST,
        currentEpisode: anime.currentEpisode,
        totalEpisodes: anime.totalEpisodes,
        studio: anime.studio,
        notifyBeforeMinutes,
        soundEnabled,
        browserNotify,
        streamingOn: anime.streamingOn,
        createdAt: new Date().toISOString(),
      };

      const updated = [...get().reminders.filter((r) => r.mal_id !== anime.mal_id), reminderItem];
      set({ reminders: updated });
      saveLocal(updated);

      if (soundEnabled) {
        playReminderChime();
      }

      // Sync to Firestore if user logged in
      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'reminders', `rem_${anime.mal_id}`), reminderItem);
        } catch (err) {
          console.warn('Could not persist reminder to Firestore:', err);
        }
      }
    },

    removeReminder: async (mal_id: number) => {
      const updated = get().reminders.filter((r) => r.mal_id !== mal_id);
      set({ reminders: updated });
      saveLocal(updated);

      const user = auth.currentUser;
      if (user) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'reminders', `rem_${mal_id}`));
        } catch (err) {
          console.warn('Could not remove reminder from Firestore:', err);
        }
      }
    },

    updateReminder: async (mal_id: number, updates: Partial<AnimeReminder>) => {
      const updated = get().reminders.map((r) => {
        if (r.mal_id === mal_id) {
          return { ...r, ...updates };
        }
        return r;
      });
      set({ reminders: updated });
      saveLocal(updated);

      const user = auth.currentUser;
      if (user) {
        const item = updated.find((r) => r.mal_id === mal_id);
        if (item) {
          try {
            await setDoc(doc(db, 'users', user.uid, 'reminders', `rem_${mal_id}`), item, { merge: true });
          } catch (err) {
            console.warn('Could not update reminder in Firestore:', err);
          }
        }
      }
    },

    getNextAiringDate: (day: DayOfWeek, timeTR: string): Date => {
      const now = new Date();
      const targetDayIndex = DAY_MAP[day];
      const currentDayIndex = now.getDay();

      const [hours, minutes] = timeTR.split(':').map(Number);
      const nextDate = new Date(now);
      nextDate.setHours(hours, minutes, 0, 0);

      let dayDifference = targetDayIndex - currentDayIndex;
      if (dayDifference < 0 || (dayDifference === 0 && nextDate.getTime() <= now.getTime())) {
        dayDifference += 7;
      }

      nextDate.setDate(now.getDate() + dayDifference);
      return nextDate;
    },

    getTimeUntilAiring: (day: DayOfWeek, timeTR: string) => {
      const nextDate = get().getNextAiringDate(day, timeTR);
      const now = new Date();
      const diffMs = nextDate.getTime() - now.getTime();

      const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      const isToday = days === 0 && nextDate.getDate() === now.getDate();

      let text = '';
      if (isToday) {
        if (hours === 0) {
          text = tr('reminder_time_minutes', { minutes });
        } else {
          text = tr('reminder_time_today', { hours, minutes });
        }
      } else if (days === 1) {
        text = tr('reminder_time_tomorrow', { time: timeTR });
      } else {
        text = tr('reminder_time_days', { days, hours });
      }

      return { days, hours, minutes, text, isToday };
    },

    generateGoogleCalendarUrl: (anime: AiringAnime | AnimeReminder): string => {
      const title = anime.title_english || anime.title;
      const targetDate = get().getNextAiringDate(anime.day, anime.timeTR);

      // 30 min duration
      const endDate = new Date(targetDate.getTime() + 30 * 60 * 1000);

      // Format ISO without separators for Google Calendar in UTC: YYYYMMDDTHHmmssZ
      const formatGCalDate = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };

      const dates = `${formatGCalDate(targetDate)}/${formatGCalDate(endDate)}`;
      const details = encodeURIComponent(
        `${tr('reminder_calendar_title')}:\n` +
        `${tr('reminder_calendar_anime', { title })}\n` +
        (anime.currentEpisode ? `${tr('reminder_calendar_episode', { episode: anime.currentEpisode })}\n` : '') +
        `${tr('reminder_calendar_time', { time: anime.timeTR })}\n` +
        (anime.streamingOn && anime.streamingOn.length > 0 ? `${tr('reminder_calendar_platforms', { platforms: anime.streamingOn.join(', ') })}\n` : '') +
        `\n${tr('reminder_calendar_created')}`
      );
      const summary = encodeURIComponent(
        anime.currentEpisode
          ? tr('reminder_calendar_summary_episode', { title, episode: anime.currentEpisode })
          : tr('reminder_calendar_summary', { title })
      );
      const recur = encodeURIComponent(`RRULE:FREQ=WEEKLY;BYDAY=${ICS_BY_DAY[anime.day]}`);

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${summary}&dates=${dates}&details=${details}&recur=${recur}`;
    },

    downloadIcsFile: (anime: AiringAnime | AnimeReminder) => {
      const title = anime.title_english || anime.title;
      const targetDate = get().getNextAiringDate(anime.day, anime.timeTR);
      const endDate = new Date(targetDate.getTime() + 30 * 60 * 1000);

      const formatIcsDate = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };

      const uid = `anisync-${anime.mal_id}-${Date.now()}@anisync.app`;
      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AniSync//Anime Airing Reminder//TR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(targetDate)}`,
        `DTEND:${formatIcsDate(endDate)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${ICS_BY_DAY[anime.day]}`,
        `SUMMARY:${anime.currentEpisode ? tr('reminder_ics_summary_episode', { title, episode: anime.currentEpisode }) : tr('reminder_ics_summary', { title })}`,
        `DESCRIPTION:${tr('reminder_ics_description', { title })}${anime.streamingOn && anime.streamingOn.length > 0 ? tr('reminder_ics_description_platforms', { platforms: anime.streamingOn.join(', ') }) : ''}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        `DESCRIPTION:${tr('reminder_ics_alarm', { title })}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${tr('reminder_ics_filename')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  };
});
