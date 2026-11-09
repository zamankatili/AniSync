/**
 * Gemini destekli uçların ortak çekirdeği.
 * `server.ts` (Express) ve `api/*.ts` (Vercel serverless) bunları çağırır.
 * Kimlik doğrulaması `requireApiAuth` üzerinden (üretimde Bearer token zorunlu).
 */
import { GoogleGenAI } from '@google/genai';
import { requireApiAuth } from './apiAuth';

let ai: GoogleGenAI | null = null;
let aiInit = false;
export function getGeminiClient(): GoogleGenAI | null {
  if (!aiInit) {
    ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
    aiInit = true;
  }
  return ai;
}

export interface EndpointResult {
  status: number;
  body: any;
}

const hashText = (value: string): string => {
  let result = 5381;
  for (let i = 0; i < value.length; i += 1) {
    result = ((result << 5) + result + value.charCodeAt(i)) | 0;
  }
  return (result >>> 0).toString(36);
};

const translationCache = new Map<string, string>();
const MAX_TRANSLATION_CACHE = 300;

// ─── POST /api/translate ───────────────────────────────────────
export async function handleTranslate(body: any, headers: Record<string, unknown>): Promise<EndpointResult> {
  const auth = await requireApiAuth(headers);
  if (!auth.ok) return { status: auth.status ?? 401, body: { error: auth.error ?? 'Unauthorized' } };

  try {
    const client = getGeminiClient();
    if (!client) {
      return { status: 503, body: { error: 'Gemini API key is not configured' } };
    }
    const { text, targetLang } = body ?? {};
    if (!text || !targetLang) {
      return { status: 400, body: { error: 'Missing text or targetLang' } };
    }

    const lang = String(targetLang).toLowerCase().slice(0, 2);
    if (!['tr', 'en', 'ja', 'fr'].includes(lang)) {
      return { status: 400, body: { error: 'Unsupported target language' } };
    }

    // Aynı çeviri tekrar istenirse Gemini kotasını harcamadan dön.
    const cacheKey = `${lang}:${hashText(String(text))}:${String(text).length}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return { status: 200, body: { translation: cached, cached: true } };
    }

    const prompt = `Translate the following text to ${lang}. Return ONLY the translated text. Do not include any other explanations.\n\nText: ${text}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    });

    const translation = response.text ?? '';
    if (translation) {
      if (translationCache.size >= MAX_TRANSLATION_CACHE) {
        const oldest = translationCache.keys().next().value;
        if (oldest) translationCache.delete(oldest);
      }
      translationCache.set(cacheKey, translation);
    }

    return { status: 200, body: { translation } };
  } catch (error: any) {
    console.error('Translation error', error);
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
      return { status: 429, body: { error: 'LIMIT_REACHED' } };
    }
    return { status: 500, body: { error: 'Translation failed' } };
  }
}

// ─── POST /api/ai-recommendations ──────────────────────────────
export async function handleAiRecommendations(body: any, headers: Record<string, unknown>): Promise<EndpointResult> {
  const auth = await requireApiAuth(headers);
  if (!auth.ok) return { status: auth.status ?? 401, body: { error: auth.error ?? 'Unauthorized' } };

  try {
    const { savedTitles, savedGenres } = body ?? {};
    const titlesList = Array.isArray(savedTitles) && savedTitles.length > 0 ? savedTitles.join(', ') : 'Attack on Titan, Demon Slayer, Jujutsu Kaisen';
    const genresList = Array.isArray(savedGenres) && savedGenres.length > 0 ? savedGenres.join(', ') : 'Aksiyon, Fantezi, Gizem';

    const client = getGeminiClient();
    if (!client) {
      return { status: 200, body: { recommendations: [], fallback: true } };
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

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsedRecs = JSON.parse(rawText);
    if (Array.isArray(parsedRecs) && parsedRecs.length > 0) {
      return { status: 200, body: { recommendations: parsedRecs, aiGenerated: true } };
    }
    return { status: 200, body: { recommendations: [], fallback: true } };
  } catch (_err) {
    return { status: 200, body: { recommendations: [], fallback: true } };
  }
}

// ─── POST /api/moderate-room ────────────────────────────────────
interface ModerateRoomResult {
  ok: boolean;
  verdict: 'ok' | 'flagged';
  reason: string;
}

export async function handleModerateRoom(body: any, headers: Record<string, unknown>): Promise<EndpointResult> {
  const auth = await requireApiAuth(headers);
  if (!auth.ok) return { status: auth.status ?? 401, body: { error: auth.error ?? 'Unauthorized' } };

  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 60) : '';
  const topic = typeof body?.topic === 'string' ? body.topic.trim().slice(0, 160) : '';
  if (!name || !topic) {
    return { status: 400, body: { error: 'Missing name or topic' } };
  }

  const client = getGeminiClient();
  if (!client) {
    // AI anahtarı yoksa doğrudan reddetme; moderatör kuyruğuna flagged olarak düşür.
    return { status: 200, body: { ok: false, verdict: 'flagged', reason: 'ai-unavailable' } as ModerateRoomResult };
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
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const raw = (response.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
    let parsed: { ok?: boolean; reason?: string } | undefined;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { ok: false, reason: 'ai-parse-error' };
    }

    const ok = parsed?.ok === true;
    const reason = typeof parsed?.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim().slice(0, 200) : ok ? 'approved' : 'rejected';

    return { status: 200, body: { ok, verdict: ok ? 'ok' : 'flagged', reason } as ModerateRoomResult };
  } catch (error: any) {
    console.error('Moderate room error', error);
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429')) {
      return { status: 429, body: { error: 'LIMIT_REACHED' } };
    }
    return { status: 503, body: { error: 'Moderation unavailable' } };
  }
}


