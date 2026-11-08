import { DayOfWeek } from '../types';
import { AiringAnime, AIRING_SCHEDULE } from '../data/airingSchedule';
import { apiUrl } from './apiBase';
import { getAnimeSeason } from './season';

export interface ScheduleFetchResult {
  list: AiringAnime[];
  source: string;
  /** Canlı kaynaktan mı geldi? */
  isLive: boolean;
  /** Önbellek/örnek veri ise true; UI rozetle gösterir. */
  stale: boolean;
  fetchedAt: string;
  seasonLabel: string;
}

const CACHE_PREFIX = 'anisync_schedule_cache_v2_';
const WEEK_CACHE_KEY = 'anisync_schedule_anilist_week_v2';
const CACHE_TTL_MS = 45 * 60 * 1000; // 45 dakika

const TR_TZ = 'Europe/Istanbul';
const JST_TZ = 'Asia/Tokyo';

function hhmmInTimeZone(timestampSeconds: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date(timestampSeconds * 1000));
}

function dayOfWeekInTimeZone(timestampSeconds: number, timeZone: string): DayOfWeek {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone })
    .format(new Date(timestampSeconds * 1000))
    .toLowerCase();
  const map: Record<string, DayOfWeek> = {
    monday: 'monday',
    tuesday: 'tuesday',
    wednesday: 'wednesday',
    thursday: 'thursday',
    friday: 'friday',
    saturday: 'saturday',
    sunday: 'sunday',
  };
  return map[weekday] ?? 'monday';
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** AniList GraphQL — önümüzdeki 7 günün gerçek yayın saati ve bölüm numarası. */
const ANILIST_AIRING_QUERY = `
query ($now: Int!, $later: Int!) {
  Page(page: 1, perPage: 50) {
    airingSchedules(airingAt_greater: $now, airingAt_lesser: $later, sort: TIME) {
      airingAt
      episode
      media {
        id
        idMal
        title { romaji english }
        coverImage { large }
        genres
        averageScore
        episodes
        description(asHtml: false)
        status
        studios(isMain: true) { nodes { name } }
        season
        seasonYear
      }
    }
  }
}`;

function mapAniListEntry(entry: any): AiringAnime | null {
  const media = entry?.media;
  if (!media) return null;
  if (media.status && media.status !== 'RELEASING') return null;

  const idMal = typeof media.idMal === 'number' ? media.idMal : Number(media.id) || 0;
  if (!idMal) return null;

  const airingAt: number = entry.airingAt;
  const synopsis = media.description ? stripHtml(media.description).slice(0, 220) : '';
  const studio = media.studios?.nodes?.[0]?.name || undefined;

  return {
    id: `anilist_${media.id}_${entry.episode ?? 'x'}`,
    mal_id: idMal,
    title: media.title?.romaji || media.title?.english || 'Bilinmeyen Anime',
    title_english: media.title?.english || media.title?.romaji || 'Bilinmeyen Anime',
    day: dayOfWeekInTimeZone(airingAt, TR_TZ),
    timeTR: hhmmInTimeZone(airingAt, TR_TZ),
    timeJST: hhmmInTimeZone(airingAt, JST_TZ),
    currentEpisode: typeof entry.episode === 'number' ? entry.episode : undefined,
    airingAt,
    totalEpisodes: typeof media.episodes === 'number' ? media.episodes : null,
    image: media.coverImage?.large || 'https://cdn.myanimelist.net/images/anime/1169/143761l.webp',
    studio: studio || '—',
    score: media.averageScore ? Math.round((media.averageScore / 10) * 100) / 100 : 0,
    genres: Array.isArray(media.genres) ? media.genres.slice(0, 4) : [],
    synopsis,
    streamingOn: [],
    seasonYear: media.seasonYear ? String(media.seasonYear) : String(getAnimeSeason().seasonYear),
  };
}

async function fetchAniListWeek(): Promise<Map<DayOfWeek, AiringAnime[]> | null> {
  // Haftalık önbellek — tek GraphQL çağrısını 7 güne yayarız.
  try {
    const cached = localStorage.getItem(WEEK_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.week) {
        return new Map(Object.entries(parsed.week) as [DayOfWeek, AiringAnime[]][]);
      }
    }
  } catch (_e) {
    // önbellek okunamadı → canlı dene
  }

  const now = Math.floor(Date.now() / 1000);
  const later = now + 7 * 24 * 60 * 60;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: ANILIST_AIRING_QUERY, variables: { now, later } }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    const entries: any[] = json?.data?.Page?.airingSchedules ?? [];
    if (entries.length === 0) return null;

    const week = new Map<DayOfWeek, AiringAnime[]>();
    for (const entry of entries) {
      const mapped = mapAniListEntry(entry);
      if (!mapped) continue;
      const bucket = week.get(mapped.day) ?? [];
      bucket.push(mapped);
      week.set(mapped.day, bucket);
    }
    for (const bucket of week.values()) {
      bucket.sort((a, b) => (a.airingAt ?? 0) - (b.airingAt ?? 0));
    }

    try {
      localStorage.setItem(WEEK_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), week: Object.fromEntries(week) }));
    } catch (_e) {
      // localStorage dolu olabilir — kritik değil
    }
    return week;
  } catch (_err) {
    clearTimeout(timeout);
    return null;
  }
}

const freshResult = (
  list: AiringAnime[],
  source: string,
  isLive: boolean,
  stale: boolean,
): ScheduleFetchResult => ({
  list,
  source,
  isLive,
  stale,
  fetchedAt: new Date().toISOString(),
  seasonLabel: getAnimeSeason().labelTR,
});

export async function fetchLiveScheduleForDay(day: DayOfWeek): Promise<ScheduleFetchResult> {
  const cacheKey = `${CACHE_PREFIX}${day}`;

  // 1. Kısa ömürlü istemci önbelleği (taze kabul edilir)
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.list) && parsed.list.length > 0) {
        return { ...freshResult(parsed.list, 'AniList (önbellek)', true, false), fetchedAt: new Date(parsed.timestamp).toISOString() };
      }
    }
  } catch (_e) {
    // önbellek yoksay
  }

  // 2. AniList canlı (client-side, CORS açık) — gerçek airingAt + bölüm
  const week = await fetchAniListWeek();
  const anilistList = week?.get(day);
  if (anilistList && anilistList.length > 0) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ list: anilistList, timestamp: Date.now() }));
    } catch (_e) { /* yoksay */ }
    return freshResult(anilistList, 'AniList (canlı)', true, false);
  }

  // 3. Backend proxy (dev / tam-stack dağıtımında) — endpoint artık dürüst bayrak döndürür
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(apiUrl(`/api/sync/airing-schedule?day=${day}`), { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const serverLive = Boolean(json?.liveSync) && !json?.stale;
      if (Array.isArray(json?.schedule) && json.schedule.length > 0) {
        const mapped: AiringAnime[] = json.schedule.map((item: any, idx: number) => ({
          id: `sync_${day}_${item.mal_id || idx}`,
          mal_id: item.mal_id,
          title: item.title,
          title_english: item.title_english || item.title,
          day,
          timeTR: item.broadcastTime || '—',
          timeJST: item.broadcastJST || undefined,
          currentEpisode: typeof item.episode === 'number' ? item.episode : undefined,
          airingAt: typeof item.airingAt === 'number' ? item.airingAt : undefined,
          totalEpisodes: typeof item.episodes === 'number' ? item.episodes : null,
          image: item.image || 'https://cdn.myanimelist.net/images/anime/1169/143761l.webp',
          studio: item.studio || '—',
          score: typeof item.score === 'number' ? item.score : 0,
          genres: Array.isArray(item.genres) ? item.genres : [],
          synopsis: item.synopsis || '',
          streamingOn: [],
          seasonYear: getAnimeSeason().labelTR,
        }));
        return {
          ...freshResult(mapped, json?.source || 'AniSync Senkronizasyon', serverLive, !serverLive),
          fetchedAt: json?.fetchedAt || new Date().toISOString(),
        };
      }
    }
  } catch (_err) {
    // backend yok → Jikan'a geç
  }

  // 4. Doğrudan Jikan v4 (vercel client-side)
  try {
    const jikanController = new AbortController();
    const jikanTimeout = setTimeout(() => jikanController.abort(), 5000);
    const jikanRes = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}&limit=25`, {
      signal: jikanController.signal,
    });
    clearTimeout(jikanTimeout);

    if (jikanRes.ok) {
      const json = await jikanRes.json();
      if (Array.isArray(json?.data) && json.data.length > 0) {
        const season = getAnimeSeason();
        const mapped: AiringAnime[] = json.data.map((anime: any, idx: number) => {
          const jst = typeof anime?.broadcast?.time === 'string' ? anime.broadcast.time : undefined;
          const [hours, minutes] = (jst || '').split(':').map((n: string) => parseInt(n, 10));
          const timeTR = Number.isFinite(hours) && Number.isFinite(minutes)
            ? `${String((hours - 6 + 24) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
            : '—';
          const genres = (anime.genres || []).map((g: any) => g?.name).filter(Boolean);

          return {
            id: `jikan_${day}_${anime.mal_id || idx}`,
            mal_id: anime.mal_id,
            title: anime.title,
            title_english: anime.title_english || anime.title,
            day,
            timeTR,
            timeJST: jst,
            // Jikan bölüm numarası VERMEZ — uydurmayız.
            currentEpisode: undefined,
            totalEpisodes: typeof anime.episodes === 'number' ? anime.episodes : null,
            image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://cdn.myanimelist.net/images/anime/1169/143761l.webp',
            studio: anime.studios?.[0]?.name || '—',
            score: anime.score || 0,
            genres,
            synopsis: anime.synopsis ? `${anime.synopsis.slice(0, 180)}…` : '',
            streamingOn: [],
            seasonYear: season.labelTR,
          };
        });
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ list: mapped, timestamp: Date.now() }));
        } catch (_e) { /* yoksay */ }
        return freshResult(mapped, 'Jikan API v4 (canlı)', true, false);
      }
    }
  } catch (_jikanErr) {
    // çevrimdışı → örnek veri
  }

  // 5. Son çare: arşiv/örnek veri — AÇIKÇA bayat ve örnek olarak işaretlenir
  const fallbackList = AIRING_SCHEDULE.filter(a => a.day === day).map(a => ({ ...a, currentEpisode: undefined, airingAt: undefined }));
  return freshResult(fallbackList, 'Örnek veri (çevrimdışı — güncel sezon değil)', false, true);
}
