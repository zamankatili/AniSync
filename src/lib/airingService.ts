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

export interface WeekScheduleResult {
  /** Gün → o günün gerçek yayınları (TR saatine göre) */
  days: Partial<Record<DayOfWeek, AiringAnime[]>>;
  source: string;
  isLive: boolean;
  stale: boolean;
  fetchedAt: string;
  seasonLabel: string;
  /** Gün başına kaç kayıt çekildi (teşhis için) */
  counts: Partial<Record<DayOfWeek, number>>;
}

/**
 * Türkiye sabit UTC+3'tür (2016'dan beri yaz saati uygulanmıyor).
 * Gün pencerelerini TR takvimine göre hesaplıyoruz: yayın takvimi kullanıcıya
 * "Pazartesi 22:30" diyorsa o an gerçekten TR Pazartesi olmalı.
 */
const TR_OFFSET = '+03:00';
const CACHE_PREFIX = 'anisync_schedule_day_v3_';
const WEEK_START_KEY = 'anisync_schedule_week_start_v3';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 dakika
const PAGE_LIMIT = 2; // gün başına en fazla 2 × 50 kayıt
const PAGE_GAP_MS = 300;

const DAY_KEYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const WEEKDAY_INDEX: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** TR takvimine göre YYYY-MM-DD */
function trDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function weekdayOfDateKey(dateKey: string): DayOfWeek {
  const index = new Date(`${dateKey}T12:00:00Z`).getUTCDay();
  return DAY_KEYS[(index + 6) % 7];
}

function addDaysToKey(dateKey: string, days: number): string {
  const base = new Date(`${dateKey}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

/** TR gününün UTC saniye aralığı: [00:00 TR, ertesi 00:00 TR) */
function dayWindowSeconds(dateKey: string): { start: number; end: number } {
  const start = Math.floor(Date.parse(`${dateKey}T00:00:00${TR_OFFSET}`) / 1000);
  return { start, end: start + 24 * 60 * 60 };
}

/** Bugünden başlayarak her hafta gününün bir sonraki tarihi (bugün dahil). */
function upcomingDateKeys(todayKey: string): Record<DayOfWeek, string> {
  const map = {} as Record<DayOfWeek, string>;
  for (let offset = 0; offset < 7; offset += 1) {
    const key = addDaysToKey(todayKey, offset);
    const weekday = weekdayOfDateKey(key);
    if (!map[weekday]) map[weekday] = key;
  }
  return map;
}

function hhmmInTimeZone(timestampSeconds: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date(timestampSeconds * 1000));
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

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** AniList GraphQL — tek bir TR gününün gerçek yayın saati ve bölüm numarası. */
const ANILIST_DAY_QUERY = `
query ($start: Int!, $end: Int!, $page: Int!) {
  Page(page: $page, perPage: 50) {
    pageInfo { hasNextPage }
    airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
      airingAt
      episode
      media {
        id
        idMal
        isAdult
        title { romaji english }
        coverImage { large }
        genres
        averageScore
        episodes
        description(asHtml: false)
        status
        studios(isMain: true) { nodes { name } }
        seasonYear
      }
    }
  }
}`;

function mapAniListEntry(entry: any, day: DayOfWeek): AiringAnime | null {
  const media = entry?.media;
  if (!media) return null;
  if (media.status && media.status !== 'RELEASING') return null;
  if (media.isAdult === true) return null;

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
    day,
    timeTR: hhmmInTimeZone(airingAt, 'Europe/Istanbul'),
    timeJST: hhmmInTimeZone(airingAt, 'Asia/Tokyo'),
    currentEpisode: typeof entry.episode === 'number' ? entry.episode : undefined,
    airingAt,
    totalEpisodes: typeof media.episodes === 'number' ? media.episodes : null,
    image: media.coverImage?.large || '',
    studio: studio || '—',
    score: media.averageScore ? Math.round((media.averageScore / 10) * 100) / 100 : 0,
    genres: Array.isArray(media.genres) ? media.genres.slice(0, 4) : [],
    synopsis,
    streamingOn: [],
    seasonYear: media.seasonYear ? String(media.seasonYear) : String(getAnimeSeason().seasonYear),
  };
}

interface DayCacheEntry {
  dateKey: string;
  list: AiringAnime[];
  timestamp: number;
}

function readDayCache(dateKey: string): AiringAnime[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + dateKey);
    if (!raw) return null;
    const parsed: DayCacheEntry = JSON.parse(raw);
    if (parsed?.dateKey !== dateKey) return null;
    if (Date.now() - parsed.timestamp >= CACHE_TTL_MS) return null;
    if (!Array.isArray(parsed.list) || parsed.list.length === 0) return null;
    return parsed.list;
  } catch {
    return null;
  }
}

function writeDayCache(dateKey: string, list: AiringAnime[]) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + dateKey,
      JSON.stringify({ dateKey, list, timestamp: Date.now() } satisfies DayCacheEntry),
    );
  } catch {
    /* kota dolabilir — kritik değil */
  }
}

/**
 * Tek bir TR günü için AniList'ten GERÇEK yayın akışını çeker.
 * Eski sürüm haftanın tamamı için tek sayfa (50 kayıt) istiyordu; bu yüzden
 * takvimde günde 1-2 anime görünüyordu. Artık gün bazında ve sayfalı çekiyoruz.
 */
async function fetchAniListDay(dateKey: string, day: DayOfWeek): Promise<AiringAnime[] | null> {
  const { start, end } = dayWindowSeconds(dateKey);
  const collected: AiringAnime[] = [];

  for (let page = 1; page <= PAGE_LIMIT; page += 1) {
    if (page > 1) await sleep(PAGE_GAP_MS);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: ANILIST_DAY_QUERY, variables: { start, end, page } }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) break;

      const json = await res.json();
      const pageData = json?.data?.Page;
      const entries: any[] = pageData?.airingSchedules ?? [];
      for (const entry of entries) {
        const mapped = mapAniListEntry(entry, day);
        if (mapped) collected.push(mapped);
      }
      if (!pageData?.pageInfo?.hasNextPage || entries.length === 0) break;
    } catch {
      clearTimeout(timeout);
      break;
    }
  }

  if (collected.length === 0) return null;

  // Aynı anime + aynı bölüm birden çok kez gelirse tekilleştir.
  const seen = new Set<string>();
  const unique = collected.filter((item) => {
    const key = `${item.mal_id}_${item.currentEpisode ?? item.airingAt ?? item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => (a.airingAt ?? 0) - (b.airingAt ?? 0));
}

/** Jikan v4 — AniList erişilemezse o günün yayınları (bölüm numarası vermez). */
async function fetchJikanDay(day: DayOfWeek): Promise<AiringAnime[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}&limit=25`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json?.data) || json.data.length === 0) return null;

    return json.data.map((anime: any, idx: number) => {
      const jst = typeof anime?.broadcast?.time === 'string' ? anime.broadcast.time : undefined;
      const [hours, minutes] = (jst || '').split(':').map((n: string) => parseInt(n, 10));
      const timeTR =
        Number.isFinite(hours) && Number.isFinite(minutes)
          ? `${String((hours - 6 + 24) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
          : '—';
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
        image:
          anime.images?.webp?.large_image_url ||
          anime.images?.jpg?.large_image_url ||
          anime.images?.jpg?.image_url ||
          '',
        studio: anime.studios?.[0]?.name || '—',
        score: anime.score || 0,
        genres: (anime.genres || []).map((g: any) => g?.name).filter(Boolean),
        synopsis: anime.synopsis ? `${anime.synopsis.slice(0, 180)}…` : '',
        streamingOn: [],
        seasonYear: getAnimeSeason().labelTR,
      } satisfies AiringAnime;
    });
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/** Sunucu proxy'si (yerel Express / tam yığın dağıtım). */
async function fetchServerDay(day: DayOfWeek): Promise<{ list: AiringAnime[]; live: boolean; source: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(apiUrl(`/api/sync/airing-schedule?day=${day}`), { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json?.schedule) || json.schedule.length === 0) return null;

    const list: AiringAnime[] = json.schedule.map((item: any, idx: number) => ({
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
      image: item.image || '',
      studio: item.studio || '—',
      score: typeof item.score === 'number' ? item.score : 0,
      genres: Array.isArray(item.genres) ? item.genres : [],
      synopsis: item.synopsis || '',
      streamingOn: [],
      seasonYear: getAnimeSeason().labelTR,
    }));

    const live = Boolean(json?.liveSync) && !json?.stale;
    return { list, live, source: json?.source || 'AniSync Senkronizasyon' };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

const baseResult = (source: string, isLive: boolean, stale: boolean, fetchedAt?: string) => ({
  source,
  isLive,
  stale,
  fetchedAt: fetchedAt || new Date().toISOString(),
  seasonLabel: getAnimeSeason().labelTR,
});

/**
 * Haftanın TAMAMINI (bugünden itibaren 7 gün) gerçek verilerle getirir.
 * Gün görünümü de bunu kullanır; tek çağrı 7 günü 30 dk önbelleğe alır.
 */
export async function fetchScheduleWeek(): Promise<WeekScheduleResult> {
  const todayKey = trDateKey();
  const dates = upcomingDateKeys(todayKey);

  // Aynı hafta içinde tekrar tekrar ağa çıkmayalım.
  try {
    const cachedStart = localStorage.getItem(WEEK_START_KEY);
    if (cachedStart === todayKey) {
      const days: Partial<Record<DayOfWeek, AiringAnime[]>> = {};
      let age = 0;
      let any = false;
      for (const day of DAY_KEYS) {
        const list = readDayCache(dates[day]);
        if (list) {
          days[day] = list;
          any = true;
          const raw = localStorage.getItem(CACHE_PREFIX + dates[day]);
          if (raw) age = Math.max(age, Date.now() - (JSON.parse(raw)?.timestamp ?? 0));
        }
      }
      if (any) {
        return {
          days,
          ...baseResult('AniList (önbellek)', true, false, new Date(Date.now() - age).toISOString()),
          counts: Object.fromEntries(
            DAY_KEYS.map((day) => [day, days[day]?.length ?? 0]),
          ) as Partial<Record<DayOfWeek, number>>,
        };
      }
    }
  } catch {
    /* önbellek yoksay */
  }

  const days: Partial<Record<DayOfWeek, AiringAnime[]>> = {};
  let liveCount = 0;
  let fallbackUsed = false;
  let lastSource = '';

  for (const day of DAY_KEYS) {
    const dateKey = dates[day];

    const cached = readDayCache(dateKey);
    if (cached) {
      days[day] = cached;
      liveCount += 1;
      continue;
    }

    const fromAniList = await fetchAniListDay(dateKey, day);
    if (fromAniList) {
      days[day] = fromAniList;
      writeDayCache(dateKey, fromAniList);
      liveCount += 1;
      lastSource = 'AniList (canlı)';
      continue;
    }

    const fromServer = await fetchServerDay(day);
    if (fromServer) {
      days[day] = fromServer.list;
      fallbackUsed = !fromServer.live;
      lastSource = fromServer.source;
      continue;
    }

    const fromJikan = await fetchJikanDay(day);
    if (fromJikan) {
      days[day] = fromJikan;
      writeDayCache(dateKey, fromJikan);
      fallbackUsed = true;
      lastSource = 'Jikan API v4 (canlı)';
    }
  }

  try {
    localStorage.setItem(WEEK_START_KEY, todayKey);
  } catch {
    /* yoksay */
  }

  if (liveCount === 0 && Object.keys(days).length === 0) {
    // Hiçbir canlı kaynak yok: arşiv listesi açıkça "örnek veri" olarak işaretlenir.
    const archive: Partial<Record<DayOfWeek, AiringAnime[]>> = {};
    for (const day of DAY_KEYS) {
      archive[day] = AIRING_SCHEDULE.filter((a) => a.day === day).map((a) => ({
        ...a,
        currentEpisode: undefined,
        airingAt: undefined,
      }));
    }
    return {
      days: archive,
      ...baseResult('Örnek veri (çevrimdışı — güncel sezon değil)', false, true),
      counts: Object.fromEntries(DAY_KEYS.map((day) => [day, archive[day]?.length ?? 0])) as Partial<
        Record<DayOfWeek, number>
      >,
    };
  }

  return {
    days,
    ...baseResult(lastSource || 'AniList (canlı)', !fallbackUsed, fallbackUsed),
    counts: Object.fromEntries(DAY_KEYS.map((day) => [day, days[day]?.length ?? 0])) as Partial<
      Record<DayOfWeek, number>
    >,
  };
}

/** Tek gün — haftanın önbelleğini kullanır, gerekirse yeniler. */
export async function fetchLiveScheduleForDay(day: DayOfWeek): Promise<ScheduleFetchResult> {
  const week = await fetchScheduleWeek();
  const list = week.days[day] ?? [];
  if (list.length === 0) {
    const archive = AIRING_SCHEDULE.filter((a) => a.day === day).map((a) => ({
      ...a,
      currentEpisode: undefined,
      airingAt: undefined,
    }));
    return { ...baseResult('Örnek veri (çevrimdışı — güncel sezon değil)', false, true), list: archive };
  }
  return { ...baseResult(week.source, week.isLive, week.stale, week.fetchedAt), list };
}
