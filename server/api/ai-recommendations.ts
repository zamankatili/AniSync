/** Vercel Serverless Function — Gemini anime önerileri (server.ts ile aynı çekirdek). */
import { handleAiRecommendations } from '../../src/lib/geminiEndpoints';
import { enforceRateLimit, RATE_LIMITS } from '../../src/lib/rateLimit';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!(await enforceRateLimit(req, res, RATE_LIMITS['ai-recommendations']))) return;
  const r = await handleAiRecommendations(req.body, (req.headers ?? {}) as Record<string, unknown>);
  res.setHeader('Cache-Control', 'no-store');
  res.status(r.status).json(r.body);
}
