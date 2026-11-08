import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ingestAnimeNews } from "./src/lib/rssIngest";
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.use(express.json());

  // Google Gemini Setup
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // Translate API
  const translationCache = new Map<string, string>();
  const MAX_TRANSLATION_CACHE = 300;
  const hashText = (value: string): string => {
    let result = 5381;
    for (let i = 0; i < value.length; i += 1) {
      result = ((result << 5) + result + value.charCodeAt(i)) | 0;
    }
    return (result >>> 0).toString(36);
  };

  app.post("/api/translate", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }
      const { text, targetLang } = req.body;
      if (!text || !targetLang) {
         return res.status(400).json({ error: "Missing text or targetLang" });
      }

      const lang = String(targetLang).toLowerCase().slice(0, 2);
      if (!["tr", "en", "ja", "fr"].includes(lang)) {
        return res.status(400).json({ error: "Unsupported target language" });
      }

      // Aynı çeviri tekrar istenirse Gemini kotasını harcamadan dön.
      const cacheKey = `${lang}:${hashText(text)}:${text.length}`;
      const cached = translationCache.get(cacheKey);
      if (cached) {
        return res.json({ translation: cached, cached: true });
      }

      const prompt = `Translate the following text to ${lang}. Return ONLY the translated text. Do not include any other explanations.\n\nText: ${text}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      const translation = response.text ?? "";
      if (translation) {
        if (translationCache.size >= MAX_TRANSLATION_CACHE) {
          const oldest = translationCache.keys().next().value;
          if (oldest) translationCache.delete(oldest);
        }
        translationCache.set(cacheKey, translation);
      }

      res.json({ translation });
    } catch (error: any) {
      console.error("Translation error", error);
      if (error?.status === 429 || error?.code === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
        return res.status(429).json({ error: "LIMIT_REACHED" });
      }
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // Canlı anime haber hattı — src/lib/rssIngest.ts ile paylaşılır (Vercel /api/refresh-news de aynı).
  // Eski sürümdeki hardcoded "küratörlü 2026 haberleri" kaldırıldı (uydurma tarihler).
  const seasonLabelServer = () => {
    const d = new Date();
    const m = d.getMonth();
    const season = m <= 1 || m === 11 ? 'Kış' : m <= 4 ? 'İlkbahar' : m <= 7 ? 'Yaz' : 'Sonbahar';
    return `${d.getFullYear()} ${season}`;
  };

  // Cron çağırır; canlı RSS'i çekip önbelleği tazeler (12 saatte bir).
  app.get("/api/refresh-news", async (_req, res) => {
    const result = await ingestAnimeNews(true);
    res.json({
      news: result.items,
      source: result.stale ? 'Önbellek (bayat)' : 'Canlı RSS (ANN / Google News)',
      isGrounded: !result.stale,
      stale: result.stale,
      fetchedAt: result.fetchedAt,
      refreshedAt: result.fetchedAt,
    });
  });

  // iTunes Audio Preview Search Proxy
  app.get("/api/music-preview", async (req, res) => {
    try {
      const term = req.query.term as string;
      if (!term) return res.status(400).json({ error: "Missing search term" });

      const queryUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=3`;
      const response = await fetch(queryUrl);
      if (!response.ok) {
        return res.status(500).json({ error: "Failed to query iTunes API" });
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const match = data.results.find((item: any) => item.previewUrl);
        if (match) {
          return res.json({ previewUrl: match.previewUrl, trackName: match.trackName, artistName: match.artistName });
        }
      }
      return res.status(404).json({ error: "No preview found" });
    } catch (err) {
      console.error("iTunes proxy error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // (Eski in-memory cache ve "BACKEND_2026_CURATED_NEWS" kaldırıldı —
  //  canlı RSS ingestion yukarıdaki `ingestAnimeNews()` içinde.)

  // Canlı anime haberleri — gerçek RSS (ANN + Google News TR), ISO `publishedAt`,
  // 15 dk cache; bayat önbellek daima `stale: true` ile döner. Sahte içerik yok.
  app.get("/api/anime-news", async (req, res) => {
    const forceRefresh = req.query.refresh === 'true';
    const result = await ingestAnimeNews(forceRefresh);
    res.json({
      news: result.items,
      source: result.stale ? 'Önbellek (bayat)' : 'Canlı RSS (ANN / Google News)',
      isGrounded: !result.stale,
      stale: result.stale,
      cached: result.cached,
      fetchedAt: result.fetchedAt,
    });
  });

  // Gemini AI Personalized Recommendations Endpoint
  app.post("/api/ai-recommendations", async (req, res) => {
    try {
      const { savedTitles, savedGenres } = req.body || {};
      const titlesList = Array.isArray(savedTitles) && savedTitles.length > 0 ? savedTitles.join(", ") : "Attack on Titan, Demon Slayer, Jujutsu Kaisen";
      const genresList = Array.isArray(savedGenres) && savedGenres.length > 0 ? savedGenres.join(", ") : "Aksiyon, Fantezi, Gizem";

      if (!ai) {
        return res.json({ recommendations: [], fallback: true });
      }

      const prompt = `Kullanıcının kaydettiği izleme listesi anileleri: [${titlesList}] ve sevdiği türler: [${genresList}].
Bu izleme profiline dayanarak kullanıcı için tam 4 adet kişiselleştirilmiş anime tavsiyesi üret.
Çıktıyı SADECE aşağıdaki JSON dizisi formatında ver:
[
  {
    "id": 52991,
    "title": "Anime Başlığı",
    "englishTitle": "English Title",
    "genres": ["Aksiyon", "Fantezi"],
    "score": 8.9,
    "episodes": 24,
    "matchPercentage": 96,
    "reason": "1-2 cümlelik Türkçe özel gerekçe (Kullanıcının izleme listesindeki serilere neden benziyor)",
    "imageUrl": "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
    "synopsis": "Kısa konu özeti (Türkçe)"
  }
]
Açıklama veya markdown yazma, yalnızca geçerli JSON dizisi döndür.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
      });

      let rawText = response.text || "";
      rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

      const parsedRecs = JSON.parse(rawText);
      if (Array.isArray(parsedRecs) && parsedRecs.length > 0) {
        return res.json({ recommendations: parsedRecs, aiGenerated: true });
      }
      return res.json({ recommendations: [], fallback: true });
    } catch (_err) {
      return res.json({ recommendations: [], fallback: true });
    }
  });

  // ==========================================
  // AUTOMATED EXTERNAL DATA SYNC & INGESTION
  // ==========================================
  let airingScheduleCache: { data: any; timestamp: number } | null = null;
  const AIRING_CACHE_TTL = 60 * 60 * 1000; // 1 hour

  // NOT: SCHEDULE_2026 arşiv/ÖRNEK bir listidir; sezon doğrulaması YOKTUR.
  // Jikan'dan canlı veri çekilemezse yalnızca `stale: true` + "örnek veri"
  // etiketiyle döndürülür; istemci bunu asla "Canlı" olarak göstermez.
  const SCHEDULE_2026: Record<string, any[]> = {
    monday: [
      { mal_id: 58941, title: "Sakamoto Days", title_english: "SAKAMOTO DAYS", image: "https://cdn.myanimelist.net/images/anime/1169/143761l.webp", score: 8.65, broadcastTime: "18:00", broadcastDay: "monday", genres: ["Aksiyon", "Komedi"], synopsis: "Eski efsanevi suikastçı Taro Sakamoto'nun aksiyon dolu maceraları.", episodes: 24, studio: "TMS Entertainment" },
      { mal_id: 54857, title: "The 100 Girlfriends Who Really Love You 2nd Season", title_english: "The 100 Girlfriends Season 2", image: "https://cdn.myanimelist.net/images/anime/1066/141071l.webp", score: 8.35, broadcastTime: "19:30", broadcastDay: "monday", genres: ["Komedi", "Romantizm"], synopsis: "Rentaro ve 100 ruh ikizinin romantik kaos serüveni.", episodes: 12, studio: "Bibury Animation" },
      { mal_id: 55644, title: "Tower of God Season 2: Workshop Battle", title_english: "Tower of God: Workshop Battle", image: "https://cdn.myanimelist.net/images/anime/1118/143529l.webp", score: 7.62, broadcastTime: "21:00", broadcastDay: "monday", genres: ["Aksiyon", "Macera"], synopsis: "Atölye Savaşı arenasındaki ölümcül testler.", episodes: 26, studio: "The Answer Studio" }
    ],
    tuesday: [
      { mal_id: 56784, title: "Wind Breaker Season 2", title_english: "Wind Breaker Season 2", image: "https://cdn.myanimelist.net/images/anime/1815/141743l.webp", score: 8.15, broadcastTime: "19:00", broadcastDay: "tuesday", genres: ["Aksiyon", "Dövüş"], synopsis: "Furin Lisesi'nin sokak savunucuları.", episodes: 12, studio: "CloverWorks" },
      { mal_id: 54900, title: "Kuroshitsuji: Emerald Witch Arc", title_english: "Black Butler: Emerald Witch Arc", image: "https://cdn.myanimelist.net/images/anime/1204/141887l.webp", score: 8.22, broadcastTime: "20:30", broadcastDay: "tuesday", genres: ["Gizem", "Doğaüstü"], synopsis: "Zümrüt Cadı ve kurtadam efsaneleri.", episodes: 12, studio: "CloverWorks" },
      { mal_id: 57400, title: "Apocalypse Hotel", title_english: "Apocalypse Hotel", image: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg", score: 7.88, broadcastTime: "22:00", broadcastDay: "tuesday", genres: ["Bilim Kurgu", "Komedi"], synopsis: "Kıyamet sonrası ayakta kalan son lüks otel.", episodes: 12, studio: "CygamesPictures" }
    ],
    wednesday: [
      { mal_id: 54857, title: "Re:ZERO Season 3 (Counterattack)", title_english: "Re:ZERO Season 3", image: "https://cdn.myanimelist.net/images/anime/1160/142384l.webp", score: 8.78, broadcastTime: "17:30", broadcastDay: "wednesday", genres: ["Dram", "Fantastik"], synopsis: "Su Kapısı Şehri Priestella'daki büyük karşı taarruz.", episodes: 16, studio: "White Fox" },
      { mal_id: 57520, title: "Dr. STONE SCIENCE FUTURE", title_english: "Dr. STONE Final Season", image: "https://cdn.myanimelist.net/images/anime/1487/142079l.webp", score: 8.54, broadcastTime: "19:00", broadcastDay: "wednesday", genres: ["Bilim Kurgu", "Macera"], synopsis: "Ay'a yolculuk ve taşlaşmanın sırrı.", episodes: 12, studio: "TMS Entertainment" },
      { mal_id: 59301, title: "Gachiakuta", title_english: "Gachiakuta", image: "https://cdn.myanimelist.net/images/anime/1171/123961l.jpg", score: 8.41, broadcastTime: "21:00", broadcastDay: "wednesday", genres: ["Aksiyon", "Karanlık Shounen"], synopsis: "Uçurum'a atılan Rudo'nun intikam savaşı.", episodes: 24, studio: "Bones" }
    ],
    thursday: [
      { mal_id: 57334, title: "DAN DA DAN", title_english: "DAN DA DAN", image: "https://cdn.myanimelist.net/images/anime/1487/142079l.webp", score: 8.82, broadcastTime: "18:00", broadcastDay: "thursday", genres: ["Aksiyon", "Doğaüstü"], synopsis: "Momo ve Okarun'un uzaylılar ve lanetlerle serüveni.", episodes: 12, studio: "Science SARU" },
      { mal_id: 59120, title: "Kaiju No. 8 Season 2", title_english: "Kaiju No. 8 Season 2", image: "https://cdn.myanimelist.net/images/anime/1739/140994l.webp", score: 8.48, broadcastTime: "20:00", broadcastDay: "thursday", genres: ["Aksiyon", "Askeri"], synopsis: "9 Numaralı Kaiju'nun Tokyo istilasına karşı savunma.", episodes: 12, studio: "Production I.G" },
      { mal_id: 58210, title: "Rurouni Kenshin: Kyoto Disturbance", title_english: "Rurouni Kenshin Season 2", image: "https://cdn.myanimelist.net/images/anime/1208/135328l.jpg", score: 8.10, broadcastTime: "21:30", broadcastDay: "thursday", genres: ["Samuray", "Aksiyon"], synopsis: "Shishio Makoto'ya karşı Kyoto savunması.", episodes: 23, studio: "LIDENFILMS" }
    ],
    friday: [
      { mal_id: 52991, title: "Sousou no Frieren Season 2", title_english: "Frieren: Beyond Journey's End Season 2", image: "https://cdn.myanimelist.net/images/anime/1015/138006l.webp", score: 9.38, broadcastTime: "18:30", broadcastDay: "friday", genres: ["Macera", "Fantastik"], synopsis: "Kuzey Yaylası yolculuğu ve Aureole cenneti.", episodes: 24, studio: "Madhouse" },
      { mal_id: 58712, title: "Fire Force Season 3", title_english: "Fire Force Season 3", image: "https://cdn.myanimelist.net/images/anime/1171/123961l.jpg", score: 8.32, broadcastTime: "20:00", broadcastDay: "friday", genres: ["Aksiyon", "Doğaüstü"], synopsis: "Büyük Afet ve Adolla felaketine karşı son savaş.", episodes: 24, studio: "David Production" },
      { mal_id: 54842, title: "Delicious in Dungeon Season 2", title_english: "Delicious in Dungeon Season 2", image: "https://cdn.myanimelist.net/images/anime/1489/141014l.webp", score: 8.68, broadcastTime: "21:30", broadcastDay: "friday", genres: ["Macera", "Gurme"], synopsis: "Zindanın derinliklerinde yeni canavar tarifleri.", episodes: 24, studio: "Trigger" }
    ],
    saturday: [
      { mal_id: 52701, title: "Bleach: Thousand-Year Blood War - The Conflict", title_english: "Bleach: TYBW Part 3", image: "https://cdn.myanimelist.net/images/anime/1912/143527l.webp", score: 8.85, broadcastTime: "17:00", broadcastDay: "saturday", genres: ["Aksiyon", "Doğaüstü"], synopsis: "Ruh Kralı Sarayı ve Yhwach ile nihai yüzleşme.", episodes: 13, studio: "Pierrot Films" },
      { mal_id: 52347, title: "Solo Leveling Season 2: Arise from the Shadow", title_english: "Solo Leveling Season 2", image: "https://cdn.myanimelist.net/images/anime/1210/141049l.webp", score: 8.74, broadcastTime: "19:00", broadcastDay: "saturday", genres: ["Aksiyon", "Fantastik"], synopsis: "Sung Jin-Woo ve Gölge Ordusu'nun savaşı.", episodes: 13, studio: "A-1 Pictures" },
      { mal_id: 58514, title: "Blue Lock vs. U-20 Japan", title_english: "Blue Lock Season 2", image: "https://cdn.myanimelist.net/images/anime/1169/143761l.webp", score: 7.85, broadcastTime: "20:30", broadcastDay: "saturday", genres: ["Spor", "Futbol"], synopsis: "Ego Jinpachi ve forvetlerin U-20 mücadelesi.", episodes: 14, studio: "8bit" },
      { mal_id: 54112, title: "Shangri-La Frontier Season 2", title_english: "Shangri-La Frontier Season 2", image: "https://cdn.myanimelist.net/images/anime/1138/142999l.webp", score: 8.24, broadcastTime: "13:00", broadcastDay: "saturday", genres: ["Aksiyon", "VRMMO"], synopsis: "Yedi Efsanevi Canavar ile yüzleşme.", episodes: 25, studio: "C2C" }
    ],
    sunday: [
      { mal_id: 21, title: "One Piece (Elbaf Arkı: Devler Diyarı)", title_english: "One Piece - Elbaf Arc", image: "https://cdn.myanimelist.net/images/anime/6/73245l.webp", score: 8.79, broadcastTime: "05:30", broadcastDay: "sunday", genres: ["Aksiyon", "Macera"], synopsis: "Hasır Şapkalar efsanevi Elbaf devler diyarına ayak basar.", episodes: 1130, studio: "Toei Animation" },
      { mal_id: 5114, title: "Jujutsu Kaisen 3. Sezon: The Culling Game", title_english: "Jujutsu Kaisen Season 3", image: "https://cdn.myanimelist.net/images/anime/1171/123961l.jpg", score: 8.92, broadcastTime: "18:00", broadcastDay: "sunday", genres: ["Aksiyon", "Karanlık Fantazi"], synopsis: "Ölüm bariyerlerinde kadim büyücülerle savaş.", episodes: 24, studio: "MAPPA" },
      { mal_id: 59880, title: "Lord of the Mysteries", title_english: "Lord of the Mysteries", image: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg", score: 8.84, broadcastTime: "20:00", broadcastDay: "sunday", genres: ["Gizem", "Viktoryen"], synopsis: "Klein Moretti ve Tarot Kulübü'nün gizemleri.", episodes: 16, studio: "B.CMAY PICTURES" }
    ]
  };

  // 1. Automated Live Airing Schedule Sync (Jikan API v4 + arşiv/örnek fallback)
  app.get("/api/sync/airing-schedule", async (req, res) => {
    const now = Date.now();
    const day = ((req.query.day as string) || "monday").toLowerCase();
    const season = seasonLabelServer();

    if (airingScheduleCache && (now - airingScheduleCache.timestamp < AIRING_CACHE_TTL) && airingScheduleCache.data[day]) {
      const cached = airingScheduleCache.data[day];
      return res.json({
        schedule: cached.items,
        source: cached.source,
        liveSync: cached.liveSync === true,
        stale: cached.stale !== false,
        cached: true,
        fetchedAt: cached.fetchedAt,
        season,
      });
    }

    try {
      // 2-second timeout so it never hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`https://api.jikan.moe/v4/schedules?filter=${encodeURIComponent(day)}&limit=25`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const transformed = (json.data || []).map((anime: any) => ({
          mal_id: anime.mal_id,
          title: anime.title,
          title_english: anime.title_english || anime.title,
          image: anime.images?.webp?.image_url || anime.images?.jpg?.image_url,
          score: anime.score || 0,
          broadcastTime: anime.broadcast?.time || "18:00",
          broadcastJST: anime.broadcast?.time || undefined,
          broadcastDay: anime.broadcast?.day || day,
          genres: (anime.genres || []).map((g: any) => g.name),
          synopsis: anime.synopsis ? anime.synopsis.substring(0, 140) + "..." : "",
          episodes: anime.episodes || 12
        }));

        if (transformed.length > 0) {
          const fetchedAt = new Date().toISOString();
          if (!airingScheduleCache) {
            airingScheduleCache = { data: {}, timestamp: now };
          }
          airingScheduleCache.data[day] = { items: transformed, source: "Jikan API v4", liveSync: true, stale: false, fetchedAt };
          airingScheduleCache.timestamp = now;

          return res.json({ schedule: transformed, source: "Jikan API v4", liveSync: true, stale: false, fetchedAt, season });
        }
      }
    } catch (_err) {
      // Fall through to 2026 verified schedule
    }

    // Son çare: arşiv/ÖRNEK liste — AÇIKÇA bayat olarak işaretlenir
    const dayList = SCHEDULE_2026[day] || SCHEDULE_2026.monday;
    const fetchedAt = new Date().toISOString();
    if (!airingScheduleCache) {
      airingScheduleCache = { data: {}, timestamp: now };
    }
    airingScheduleCache.data[day] = {
      items: dayList,
      source: "Örnek veri (çevrimdışı — güncel sezon değil)",
      liveSync: false,
      stale: true,
      fetchedAt,
    };

    return res.json({ schedule: dayList, source: "Örnek veri (çevrimdışı — güncel sezon değil)", liveSync: false, stale: true, fetchedAt, season });
  });

  // 2. Automated Trending & Seasonal Anime Sync
  let trendingAnimeCache: { data: any[]; timestamp: number } | null = null;
  const TRENDING_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  app.get("/api/sync/trending-anime", async (req, res) => {
    const now = Date.now();
    if (trendingAnimeCache && (now - trendingAnimeCache.timestamp < TRENDING_CACHE_TTL)) {
      return res.json({ trending: trendingAnimeCache.data, cached: true });
    }

    try {
      const response = await fetch("https://api.jikan.moe/v4/seasons/now?limit=12");
      if (response.ok) {
        const json = await response.json();
        const items = (json.data || []).map((anime: any) => ({
          mal_id: anime.mal_id,
          title: anime.title,
          title_english: anime.title_english || anime.title,
          images: anime.images,
          score: anime.score || 8.0,
          members: anime.members || 10000,
          genres: anime.genres || [],
          synopsis: anime.synopsis || "",
          episodes: anime.episodes || 12
        }));

        trendingAnimeCache = { data: items, timestamp: now };
        return res.json({ trending: items, source: "Jikan API v4", liveSync: true });
      }
    } catch (_err) {
      // Handled silently
    }

    return res.json({ trending: [], fallback: true });
  });

  // --- Steam oyun kataloğu proxy'si (API anahtarı gerekmez) ---
  const steamCache = new Map<string, { data: unknown; expiresAt: number }>();
  const STEAM_CACHE_TTL = 10 * 60 * 1000;

  const steamFetch = async (url: string): Promise<any> => {
    const cached = steamCache.get(url);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Steam HTTP ${response.status}`);
      const data = await response.json();
      steamCache.set(url, { data, expiresAt: Date.now() + STEAM_CACHE_TTL });
      return data;
    } finally {
      clearTimeout(timer);
    }
  };

  app.get("/api/games/search", async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ items: [], total: 0 });

    const lang = ["tr", "en", "ja", "fr"].includes(String(req.query.lang)) ? String(req.query.lang) : "en";
    try {
      const data = await steamFetch(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=${lang}&cc=US`
      );
      const items = (data?.items ?? []).map((item: any) => ({
        id: String(item.id),
        name: item.name,
        image: item.tiny_image ?? null,
        metascore: item.metascore ? Number(item.metascore) : null,
        price: item.price ?? null,
        platforms: item.platforms ?? {},
      }));
      res.json({ items, total: data?.total ?? items.length });
    } catch (error) {
      console.error("[games/search] Steam araması başarısız:", error);
      res.status(502).json({ items: [], total: 0, error: "steam_unavailable" });
    }
  });

  app.get("/api/games/:appid", async (req, res) => {
    const appid = String(req.params.appid || "").replace(/\D/g, "");
    if (!appid) return res.status(400).json({ error: "invalid_appid" });

    try {
      const data = await steamFetch(
        `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&cc=US`
      );
      const entry = data?.[appid];
      if (!entry?.success || !entry.data) return res.status(404).json({ error: "not_found" });

      const game = entry.data;
      res.json({
        appid,
        name: game.name,
        type: game.type,
        shortDescription: game.short_description ?? null,
        headerImage: game.header_image ?? null,
        capsuleImage: game.capsule_image ?? null,
        developers: game.developers ?? [],
        publishers: game.publishers ?? [],
        genres: (game.genres ?? []).map((genre: any) => genre.description),
        releaseDate: game.release_date?.date ?? null,
        metacritic: game.metacritic?.score ?? null,
        website: game.website ?? null,
        background: game.background_raw ?? game.background ?? null,
      });
    } catch (error) {
      console.error("[games/detail] Steam detayı alınamadı:", error);
      res.status(502).json({ error: "steam_unavailable" });
    }
  });

  // Dynamic sitemap.xml endpoint for SEO indexing
  app.get("/sitemap.xml", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers.host ? `${protocol}://${req.headers.host}` : "https://anisync.app";
    const today = new Date().toISOString().split("T")[0];

    const staticRoutes = [
      { path: "", priority: "1.0", changefreq: "daily" },
      { path: "/discover", priority: "0.9", changefreq: "daily" },
      { path: "/list", priority: "0.8", changefreq: "daily" },
      { path: "/lists", priority: "0.7", changefreq: "weekly" },
      { path: "/calendar", priority: "0.8", changefreq: "daily" },
      { path: "/grid-maker", priority: "0.7", changefreq: "weekly" },
      { path: "/music-quiz", priority: "0.8", changefreq: "weekly" },
      { path: "/watch-party", priority: "0.8", changefreq: "daily" },
    ];

    const popularAnimeIds = [
      52991, 52299, 40748, 54492, 51179, 16498, 38000, 21, 20, 9253, 11061, 
      32182, 1535, 5114, 41467, 37521, 50265, 42310, 44511, 47917, 52034,
      30276, 31964, 33486, 34572, 38524, 40028, 48583, 50631, 51009, 52578
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticRoutes.forEach((route) => {
      xml += `  <url>\n`;
      xml += `    <loc>${host}${route.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    popularAnimeIds.forEach((id) => {
      xml += `  <url>\n`;
      xml += `    <loc>${host}/anime/${id}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
