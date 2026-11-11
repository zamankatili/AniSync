/**
 * Gemini destekli uçların ortak çekirdeği.
 * `server.ts` (Express) ve `api/*.ts` (Vercel serverless) bunları çağırır.
 * Kimlik doğrulaması `requireApiAuth` üzerinden (üretimde Bearer token zorunlu).
 */
import { GoogleGenAI } from '@google/genai';
import { requireApiAuth } from './apiAuth';
import { searchAniList } from './api/anilist';

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
    const { savedTitles, savedGenres, language } = body ?? {};
    const titlesList = Array.isArray(savedTitles) && savedTitles.length > 0 ? savedTitles.join(', ') : 'Attack on Titan, Demon Slayer, Jujutsu Kaisen';
    const genresList = Array.isArray(savedGenres) && savedGenres.length > 0 ? savedGenres.join(', ') : 'Aksiyon, Fantezi, Gizem';
    const lang = typeof language === 'string' && language.trim() ? language.trim().slice(0, 5) : 'tr';

    const client = getGeminiClient();
    if (!client) {
      return { status: 200, body: { recommendations: [], fallback: true } };
    }

    const prompt = `Kullanıcının kaydettiği izleme listesi animeleri: [${titlesList}] ve sevdiği türler: [${genresList}].
Bu izleme profiline dayanarak kullanıcı için tam 4 adet kişiselleştirilmiş anime tavsiyesi üret.
Çıktıyı SADECE aşağıdaki JSON dizisi formatında ver:
[
  {
    "title": "Anime Başlığı (resmi ad)",
    "englishTitle": "English Title",
    "reason": "1-2 cümlelik özel gerekçe (kullanıcının izleme listesindeki serilere neden benziyor)"
  }
]
Kural: yalnızca gerçekten var olan animeler öner. Puan, bölüm sayısı, görsel URL'si veya kimlik UYDURMA; bu alanlar doğrulanmış katalogdan eklenecek. "reason" dili: ${lang}. Açıklama veya markdown yazma, yalnızca geçerli JSON dizisi döndür.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { status: 200, body: { recommendations: [], fallback: true } };
    }

    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const verified = await Promise.all(
      parsed.slice(0, 4).map(async (rec: any) => {
        const requested = typeof rec?.title === 'string' ? rec.title.trim() : '';
        const requestedEn = typeof rec?.englishTitle === 'string' ? rec.englishTitle.trim() : '';
        const query = requested || requestedEn;
        if (!query) return null;

        try {
          const result = await searchAniList({ query, kind: 'anime', perPage: 3 });
          const match = result.items.find((media) => {
            const candidates = [media.title.romaji, media.title.english, media.title.native, media.displayTitle]
              .filter((v): v is string => typeof v === 'string' && v.length > 0)
              .map(normalize);
            const target = normalize(query);
            return candidates.some((candidate) => candidate === target || candidate.includes(target) || target.includes(candidate));
          });
          if (!match) return null;

          if (!match.title?.romaji && !match.title?.english) return null;

          return {
            // LLM'in uydurduğu kimlik/puan/görsel yerine doğrulanmış katalog verisi.
            id: match.externalIds?.mal ?? 0,
            mediaId: match.id,
            title: match.title.romaji || match.displayTitle,
            englishTitle: match.title.english ?? undefined,
            genres: match.genres.slice(0, 4),
            score: match.averageScore != null ? Math.round(match.averageScore) / 10 : null,
            episodes: match.episodes ?? null,
            reason: typeof rec?.reason === 'string' ? rec.reason.trim() : '',
            imageUrl: match.cover?.large ?? match.cover?.medium ?? undefined,
            synopsis: match.synopsis ? match.synopsis.slice(0, 240) : ''
          };
        } catch (error) {
          console.warn('[ai-recommendations] doğrulama başarısız:', error);
          return null;
        }
      })
    );

    const recommendations = verified.filter((item): item is NonNullable<typeof item> => item !== null);
    if (recommendations.length === 0) {
      return { status: 200, body: { recommendations: [], fallback: true } };
    }
    return { status: 200, body: { recommendations, aiGenerated: true } };
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


