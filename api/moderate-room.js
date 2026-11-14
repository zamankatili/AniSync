// src/lib/geminiEndpoints.ts
import { GoogleGenAI } from "@google/genai";

// src/lib/verifyIdToken.ts
import crypto from "crypto";
var CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
var DEFAULT_PROJECT_ID = "folkloric-centaur-q6tp2";
var certCache = null;
async function getCerts() {
  const now = Date.now();
  if (certCache && certCache.expires > now) return certCache.certs;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`Google certs fetch failed: ${res.status}`);
  const certs = await res.json();
  const maxAge = /max-age=(\d+)/.exec(res.headers.get("cache-control") ?? "");
  const ttlMs = maxAge ? Number(maxAge[1]) * 1e3 : 36e5;
  certCache = { certs, expires: now + ttlMs };
  return certs;
}
var b64urlJson = (segment) => JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
async function verifyFirebaseIdToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const header = b64urlJson(h);
    const payload = b64urlJson(p);
    if (header?.alg !== "RS256" || typeof header?.kid !== "string") return null;
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
    const nowSec = Math.floor(Date.now() / 1e3);
    if (typeof payload?.exp !== "number" || payload.exp <= nowSec) return null;
    if (typeof payload?.iat !== "number" || payload.iat > nowSec + 300) return null;
    if (payload?.aud !== projectId) return null;
    if (payload?.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof payload?.sub !== "string" || !payload.sub) return null;
    const certs = await getCerts();
    const cert = certs[header.kid];
    if (!cert) return null;
    const key = cert.includes("BEGIN CERTIFICATE") ? new crypto.X509Certificate(cert).publicKey : crypto.createPublicKey(cert);
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(`${h}.${p}`);
    if (!verifier.verify(key, s, "base64url")) return null;
    return { uid: payload.sub };
  } catch {
    return null;
  }
}

// src/lib/apiAuth.ts
async function requireApiAuth(headers) {
  const raw = headers && (headers["authorization"] ?? headers["Authorization"]);
  const auth = typeof raw === "string" ? raw : "";
  if (auth.startsWith("Bearer ")) {
    const verified = await verifyFirebaseIdToken(auth.slice(7));
    if (verified) return { ok: true, uid: verified.uid };
    return { ok: false, status: 401, error: "Invalid token" };
  }
  if (process.env.NODE_ENV === "production") {
    return { ok: false, status: 401, error: "Authorization required" };
  }
  return { ok: true };
}

// src/lib/api/http.ts
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function createRateLimiter(minIntervalMs) {
  let chain = Promise.resolve();
  let lastRun = 0;
  return () => {
    chain = chain.then(async () => {
      const wait = Math.max(0, lastRun + minIntervalMs - Date.now());
      if (wait > 0) await sleep(wait);
      lastRun = Date.now();
    });
    return chain;
  };
}

// src/lib/api/cache.ts
var DEFAULT_TTL_MS = 15 * 60 * 1e3;
function createTtlCache(options = {}) {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const memory = /* @__PURE__ */ new Map();
  const storageKey = options.persistKey ? `anisync.cache.${options.persistKey}` : null;
  const silent = options.silent ?? true;
  const readStorage = () => {
    if (!storageKey || typeof localStorage === "undefined") return {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };
  const writeStorage = (data) => {
    if (!storageKey || typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      if (!silent) throw error;
      try {
        const keys = Object.keys(data);
        const trimmed = Object.fromEntries(keys.slice(Math.floor(keys.length / 2)).map((k) => [k, data[k]]));
        localStorage.setItem(storageKey, JSON.stringify(trimmed));
      } catch {
      }
    }
  };
  const get = (key) => {
    const now = Date.now();
    const fromMemory = memory.get(key);
    if (fromMemory) {
      if (fromMemory.expiresAt > now) return fromMemory.value;
      memory.delete(key);
    }
    const stored = readStorage()[key];
    if (stored && stored.expiresAt > now) {
      memory.set(key, stored);
      return stored.value;
    }
    return null;
  };
  const set = (key, value) => {
    const entry = { value, expiresAt: Date.now() + ttlMs };
    memory.set(key, entry);
    if (storageKey) {
      const data = readStorage();
      data[key] = entry;
      writeStorage(data);
    }
  };
  const remove = (key) => {
    memory.delete(key);
    if (storageKey) {
      const data = readStorage();
      delete data[key];
      writeStorage(data);
    }
  };
  const clear = () => {
    memory.clear();
    if (storageKey && typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch {
      }
    }
  };
  const wrap = async (key, producer) => {
    const cached = get(key);
    if (cached !== null) return cached;
    const value = await producer();
    set(key, value);
    return value;
  };
  return { get, set, delete: remove, clear, wrap };
}

// src/lib/api/anilist.ts
var limiter = createRateLimiter(700);
var cache = createTtlCache({ ttlMs: 15 * 60 * 1e3 });

// src/lib/geminiEndpoints.ts
var ai = null;
var aiInit = false;
function getGeminiClient() {
  if (!aiInit) {
    ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
    aiInit = true;
  }
  return ai;
}
async function handleModerateRoom(body, headers) {
  const auth = await requireApiAuth(headers);
  if (!auth.ok) return { status: auth.status ?? 401, body: { error: auth.error ?? "Unauthorized" } };
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
  const topic = typeof body?.topic === "string" ? body.topic.trim().slice(0, 160) : "";
  if (!name || !topic) {
    return { status: 400, body: { error: "Missing name or topic" } };
  }
  const client = getGeminiClient();
  if (!client) {
    return { status: 200, body: { ok: false, verdict: "flagged", reason: "ai-unavailable" } };
  }
  const prompt = `You moderate room creation requests for an anime, manga, novel and games community chat.

Room name: "${name}"
Room topic: "${topic}"

Approve only if the room is clearly about anime/manga/light novels/games/music/otaku culture.
Reject: NSFW, hate/harassment, illegal content, self-harm, spam, malicious links, or unrelated topics (policy, spammy SEO, ads).

Return ONLY this JSON object, no markdown, no explanation:
{"ok": true or false, "reason": "<one short English sentence on the decision>"}`;
  try {
    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt
    });
    const raw = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { ok: false, reason: "ai-parse-error" };
    }
    const ok = parsed?.ok === true;
    const reason = typeof parsed?.reason === "string" && parsed.reason.trim() ? parsed.reason.trim().slice(0, 200) : ok ? "approved" : "rejected";
    return { status: 200, body: { ok, verdict: ok ? "ok" : "flagged", reason } };
  } catch (error) {
    console.error("Moderate room error", error);
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes("429")) {
      return { status: 429, body: { error: "LIMIT_REACHED" } };
    }
    return { status: 503, body: { error: "Moderation unavailable" } };
  }
}

// server/api/moderate-room.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const r = await handleModerateRoom(req.body, req.headers ?? {});
  res.setHeader("Cache-Control", "no-store");
  res.status(r.status).json(r.body);
}
export {
  handler as default
};
