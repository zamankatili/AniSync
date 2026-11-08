import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ingestAnimeNews } from "./src/lib/rssIngest";
import { handleTranslate, handleAiRecommendations } from "./src/lib/geminiEndpoints";
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.use(express.json());

  // Ortak Gemini çekirdeği (`src/lib/geminiEndpoints.ts`) — kimlik + kota burada.
  app.post("/api/translate", async (req, res) => {
    const r = await handleTranslate(req.body, req.headers as Record<string, unknown>);
    res.status(r.status).json(r.body);
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
  // CRON_SECRET tanımlıysa `Authorization: Bearer <CRON_SECRET>` zorunludur.
  app.get("/api/refresh-news", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = String(req.headers.authorization ?? '');
      if (auth !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
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
    const r = await handleAiRecommendations(req.body, req.headers as Record<string, unknown>);
    res.status(r.status).json(r.body);
  });

  // ==========================================
  // AUTOMATED EXTERNAL DATA SYNC & INGESTION
  // ==========================================
  let airingScheduleCache: { data: any; timestamp: number } | null = null;
  const AIRING_CACHE_TTL = 60 * 60 * 1000; // 1 hour


  // 1. Automated Live Airing Schedule Sync (Jikan v4; çevrimdışıysa boş + stale)
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
      // Jikan düştü → boş stale yanıt döner (aşağıda)
    }

    // Jikan da düştüyse uydurma yayın saati DÖNDÜRME — boş + stale dön.
    const fetchedAt = new Date().toISOString();
    if (!airingScheduleCache) {
      airingScheduleCache = { data: {}, timestamp: now };
    }
    airingScheduleCache.data[day] = {
      items: [],
      source: "Kaynak yok (çevrimdışı)",
      liveSync: false,
      stale: true,
      fetchedAt,
    };

    return res.json({ schedule: [], source: "Kaynak yok (çevrimdışı)", liveSync: false, stale: true, fetchedAt, season });
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
