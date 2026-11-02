import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AtmosId,
  Author,
  Media,
  Post,
  PostKind,
  Profile,
  ShelfEntry,
  ShelfStatus,
} from '../lib/types';
import { ATMOSPHERES, XP, levelFromXp } from '../lib/level';
import { buildSeedPosts } from '../data/seed';
import { CLUBS } from '../data/clubs';

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

export const todayKey = (): string => new Date().toLocaleDateString('sv-SE');
const nowISO = (): string => new Date().toISOString();

export type ToastKind = 'info' | 'success' | 'unlock';

export interface Toast {
  id: string;
  text: string;
  kind: ToastKind;
}

export interface LevelUp {
  level: number;
  unlocks: AtmosId[];
}

export interface Settings {
  motion: boolean;
  hideSpoilers: boolean;
  compact: boolean;
}

export interface PostInput {
  text: string;
  kind: PostKind;
  ref?: Media;
  spoiler?: boolean;
  clubId?: string;
}

interface StoreData {
  onboarded: boolean;
  profile: Profile | null;
  xp: number;
  shelf: Record<string, ShelfEntry>;
  posts: Post[];
  joined: string[];
  atmos: AtmosId;
  settings: Settings;
  streak: number;
  lastVisitDay: string | null;
  answered: Record<string, string>;
}

interface Store extends StoreData {
  hydrated: boolean;
  preview: AtmosId | null;
  toasts: Toast[];
  levelUp: LevelUp | null;

  markHydrated: () => void;
  onboard: (input: {
    name: string;
    emoji: string;
    color: string;
    genres: string[];
    homeType: Profile['homeType'];
    starter?: Media[];
  }) => void;
  touchVisit: () => void;

  notify: (text: string, kind?: ToastKind) => void;
  dismissToast: (id: string) => void;
  clearLevelUp: () => void;

  addToShelf: (media: Media, status?: ShelfStatus) => void;
  setStatus: (id: string, status: ShelfStatus) => void;
  bumpProgress: (id: string, delta?: number) => void;
  setProgress: (id: string, value: number) => void;
  setScore: (id: string, score: number) => void;
  toggleFavorite: (id: string) => void;
  removeEntry: (id: string) => void;

  createPost: (input: PostInput) => string | null;
  likePost: (id: string) => void;
  replyToPost: (id: string, text: string) => void;
  answerPrompt: (question: string, text: string) => string | null;

  joinClub: (id: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setAtmos: (id: AtmosId) => boolean;
  previewAtmos: (id: AtmosId) => void;
  clearPreview: () => void;
  updateSettings: (patch: Partial<Settings>) => void;

  exportData: () => string;
  importData: (raw: string) => boolean;
  resetAll: () => void;
}

const defaultSettings: Settings = { motion: true, hideSpoilers: false, compact: false };

const freshData = (): StoreData => ({
  onboarded: false,
  profile: null,
  xp: 0,
  shelf: {},
  posts: buildSeedPosts(),
  joined: [],
  atmos: 'klasik',
  settings: defaultSettings,
  streak: 0,
  lastVisitDay: null,
  answered: {},
});

const at = (iso: string) => new Date(iso).getTime();

const sortShelf = (entries: ShelfEntry[]): ShelfEntry[] =>
  entries.sort((a, b) => at(b.updatedAt) - at(a.updatedAt));

let previewTimer: ReturnType<typeof setTimeout> | null = null;

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const grant = (amount: number) => {
        const before = get().xp;
        const after = Math.max(0, before + amount);
        const prevLevel = levelFromXp(before);
        const nextLevel = levelFromXp(after);
        set({ xp: after });
        if (nextLevel > prevLevel) {
          const unlocks = ATMOSPHERES.filter(
            (a) => a.unlockLevel > prevLevel && a.unlockLevel <= nextLevel,
          ).map((a) => a.id);
          set({ levelUp: { level: nextLevel, unlocks } });
        }
      };

      const notify = (text: string, kind: ToastKind = 'info') => {
        const toast: Toast = { id: uid(), text, kind };
        set((s) => ({ toasts: [...s.toasts, toast] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toast.id) }));
        }, 4200);
      };

      const authorOf = (): Author => {
        const p = get().profile;
        return {
          name: p?.name ?? 'Misafir',
          emoji: p?.emoji ?? '🫖',
          color: p?.color ?? '#eda85a',
        };
      };

      const patchEntry = (id: string, patch: Partial<ShelfEntry>) => {
        const entry = get().shelf[id];
        if (!entry) return;
        set((s) => ({
          shelf: { ...s.shelf, [id]: { ...entry, ...patch, updatedAt: nowISO() } },
        }));
      };

      return {
        ...freshData(),
        hydrated: false,
        preview: null,
        toasts: [],
        levelUp: null,

        markHydrated: () => set({ hydrated: true }),

        notify,

        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

        clearLevelUp: () => set({ levelUp: null }),

        onboard: ({ name, emoji, color, genres, homeType, starter = [] }) => {
          const handle = name
            .toLocaleLowerCase('tr-TR')
            .replace(/[^a-z0-9çğıöşü]+/gi, '')
            .slice(0, 18) || 'otaku';
          const profile: Profile = {
            name: name.trim() || 'Misafir',
            handle,
            emoji,
            color,
            bio: '',
            joinedAt: nowISO(),
            genres,
            homeType,
          };
          const shelf = { ...get().shelf };
          starter.forEach((media) => {
            if (!shelf[media.id]) {
              shelf[media.id] = {
                media,
                status: 'planned',
                progress: 0,
                createdAt: nowISO(),
                updatedAt: nowISO(),
              };
            }
          });
          set({
            onboarded: true,
            profile,
            shelf,
            xp: get().xp + 30,
            streak: 1,
            lastVisitDay: todayKey(),
          });
          notify(`Hoş geldin ${profile.name}. Çay senin, mekân hepimizin.`, 'success');
        },

        touchVisit: () => {
          if (!get().onboarded) return;
          const today = todayKey();
          const last = get().lastVisitDay;
          if (last === today) return;

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const wasYesterday = last === yesterday.toLocaleDateString('sv-SE');
          const streak = wasYesterday ? get().streak + 1 : 1;
          set({ lastVisitDay: today, streak });
          grant(XP.visit);
          if (streak > 1) {
            notify(`${streak}. gün üst üste geldin. Müdavimlik böyle bir şey.`, 'success');
          }
        },

        addToShelf: (media, status = 'planned') => {
          const existing = get().shelf[media.id];
          if (existing) {
            patchEntry(media.id, { status });
            notify(`“${media.title}” ${status === 'done' ? 'bitenlere' : 'rafına'} taşındı.`);
            return;
          }
          const entry: ShelfEntry = {
            media,
            status,
            progress: status === 'done' ? media.totalUnits ?? 1 : 0,
            createdAt: nowISO(),
            updatedAt: nowISO(),
          };
          set((s) => ({ shelf: { ...s.shelf, [media.id]: entry } }));
          grant(XP.addShelf);
          notify(`“${media.title}” rafına eklendi.`, 'success');
        },

        setStatus: (id, status) => {
          const entry = get().shelf[id];
          if (!entry) return;
          const total = entry.media.totalUnits;
          patchEntry(id, {
            status,
            progress: status === 'done' ? total ?? Math.max(1, entry.progress) : entry.progress,
          });
          if (status === 'done') grant(XP.complete);
        },

        bumpProgress: (id, delta = 1) => {
          const entry = get().shelf[id];
          if (!entry) return;
          const total = entry.media.totalUnits ?? 0;
          const next = Math.max(0, entry.progress + delta);
          const clamped = total > 0 ? Math.min(total, next) : next;
          const done = total > 0 && clamped >= total;
          patchEntry(id, {
            progress: clamped,
            status: done ? 'done' : entry.status === 'planned' ? 'active' : entry.status,
          });
          grant(XP.progress);
          if (done && entry.status !== 'done') {
            grant(XP.complete);
            notify(`“${entry.media.title}” bitti. Bu his rafa sığmıyor.`, 'success');
          }
        },

        setProgress: (id, value) => {
          const entry = get().shelf[id];
          if (!entry) return;
          const total = entry.media.totalUnits ?? 0;
          const clamped = Math.max(0, total > 0 ? Math.min(total, value) : value);
          const done = total > 0 && clamped >= total;
          patchEntry(id, { progress: clamped, status: done ? 'done' : entry.status });
          if (done && entry.status !== 'done') grant(XP.complete);
        },

        setScore: (id, score) => {
          const entry = get().shelf[id];
          if (!entry) return;
          const first = !entry.score;
          patchEntry(id, { score });
          if (first) grant(XP.score);
        },

        toggleFavorite: (id) => {
          const entry = get().shelf[id];
          if (!entry) return;
          patchEntry(id, { favorite: !entry.favorite });
          if (!entry.favorite) grant(XP.favorite);
        },

        removeEntry: (id) => {
          const entry = get().shelf[id];
          if (!entry) return;
          set((s) => {
            const shelf = { ...s.shelf };
            delete shelf[id];
            return { shelf };
          });
          notify(`“${entry.media.title}” raftan çıkarıldı.`);
        },

        createPost: ({ text, kind, ref, spoiler, clubId }) => {
          const body = text.trim();
          if (!body) return null;
          const post: Post = {
            id: uid(),
            author: authorOf(),
            kind,
            text: body,
            createdAt: nowISO(),
            likes: [],
            replies: [],
            ref: ref
              ? {
                  id: ref.id,
                  title: ref.title,
                  cover: ref.cover,
                  type: ref.type,
                  year: ref.year ?? null,
                  score: ref.score ?? null,
                }
              : undefined,
            clubId,
            spoiler,
          };
          set((s) => ({ posts: [post, ...s.posts] }));
          grant(XP.post);
          notify('Paylaştın. Mekân biraz daha dolu.', 'success');
          return post.id;
        },

        likePost: (id) => {
          const me = get().profile?.handle ?? 'ben';
          set((s) => ({
            posts: s.posts.map((p) => {
              if (p.id !== id) return p;
              const liked = p.likes.includes(me);
              return { ...p, likes: liked ? p.likes.filter((l) => l !== me) : [...p.likes, me] };
            }),
          }));
        },

        replyToPost: (id, text) => {
          const body = text.trim();
          if (!body) return;
          const reply = {
            id: uid(),
            author: authorOf(),
            text: body,
            createdAt: nowISO(),
          };
          set((s) => ({
            posts: s.posts.map((p) => (p.id === id ? { ...p, replies: [...p.replies, reply] } : p)),
          }));
          grant(XP.reply);
        },

        answerPrompt: (question, text) => {
          const body = text.trim();
          if (!body) return null;
          const id = get().createPost({ text: body, kind: 'sohbet' });
          if (id) {
            set((s) => ({ answered: { ...s.answered, [todayKey()]: question } }));
          }
          return id;
        },

        joinClub: (id) => {
          if (get().joined.includes(id)) {
            notify('Bu köşedesin zaten.');
            return;
          }
          set((s) => ({ joined: [...s.joined, id] }));
          const club = CLUBS.find((c) => c.id === id);
          grant(XP.joinClub);
          notify(`${club?.name ?? 'Köşe'} masasına oturdun.`, 'success');
        },

        updateProfile: (patch) =>
          set((s) => ({ profile: s.profile ? { ...s.profile, ...patch } : s.profile })),

        setAtmos: (id) => {
          const atmos = ATMOSPHERES.find((a) => a.id === id);
          if (!atmos) return false;
          const level = levelFromXp(get().xp);
          if (level < atmos.unlockLevel) {
            notify(`“${atmos.name}” seviye ${atmos.unlockLevel}’de açılıyor.`, 'info');
            return false;
          }
          set({ atmos: id, preview: null });
          return true;
        },

        previewAtmos: (id) => {
          set({ preview: id });
          if (previewTimer) clearTimeout(previewTimer);
          previewTimer = setTimeout(() => set({ preview: null }), 12000);
        },

        clearPreview: () => {
          if (previewTimer) clearTimeout(previewTimer);
          set({ preview: null });
        },

        updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

        exportData: () => {
          const s = get();
          const payload = {
            app: 'anisync',
            version: 2,
            exportedAt: nowISO(),
            data: {
              onboarded: s.onboarded,
              profile: s.profile,
              xp: s.xp,
              shelf: s.shelf,
              posts: s.posts.filter((p) => !p.seed),
              joined: s.joined,
              atmos: s.atmos,
              settings: s.settings,
              streak: s.streak,
              lastVisitDay: s.lastVisitDay,
              answered: s.answered,
            },
          };
          return JSON.stringify(payload, null, 2);
        },

        importData: (raw) => {
          try {
            const parsed = JSON.parse(raw);
            const data = parsed?.data ?? parsed;
            if (!data || typeof data !== 'object') return false;
            const next: Partial<StoreData> = {};
            if (data.profile) next.profile = data.profile;
            if (typeof data.xp === 'number') next.xp = data.xp;
            if (data.shelf && typeof data.shelf === 'object') next.shelf = data.shelf;
            if (Array.isArray(data.joined)) next.joined = data.joined;
            if (Array.isArray(data.posts)) next.posts = [...data.posts, ...get().posts.filter((p) => p.seed)];
            if (data.atmos) next.atmos = data.atmos;
            if (data.settings) next.settings = { ...defaultSettings, ...data.settings };
            if (typeof data.streak === 'number') next.streak = data.streak;
            if (data.lastVisitDay) next.lastVisitDay = data.lastVisitDay;
            if (data.answered) next.answered = data.answered;
            if (data.onboarded) next.onboarded = true;
            set(next);
            notify('Yedek geri yüklendi.', 'success');
            return true;
          } catch {
            notify('Dosya okunamadı. Geçerli bir AniSync yedeği seç.', 'info');
            return false;
          }
        },

        resetAll: () => {
          const fresh = freshData();
          set({ ...fresh, hydrated: true, preview: null, toasts: [], levelUp: null });
          notify('Her şey sıfırlandı. Yeni bir sayfa.');
        },
      };
    },
    {
      name: 'anisync.v2',
      version: 2,
      partialize: (s) => ({
        onboarded: s.onboarded,
        profile: s.profile,
        xp: s.xp,
        shelf: s.shelf,
        posts: s.posts,
        joined: s.joined,
        atmos: s.atmos,
        settings: s.settings,
        streak: s.streak,
        lastVisitDay: s.lastVisitDay,
        answered: s.answered,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

/* ---------- türetilmiş seçiciler ---------- */

export const useLevel = () => {
  const xp = useStore((s) => s.xp);
  return levelFromXp(xp);
};

export const useShelfEntries = (): ShelfEntry[] => {
  const shelf = useStore((s) => s.shelf);
  return sortShelf(Object.values(shelf));
};

export const useShelfEntry = (id?: string): ShelfEntry | undefined =>
  useStore((s) => (id ? s.shelf[id] : undefined));
