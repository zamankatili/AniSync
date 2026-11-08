/** Vercel Serverless Function — Gemini çevirisi (server.ts ile aynı çekirdek). */
import { handleTranslate } from '../src/lib/geminiEndpoints';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const r = await handleTranslate(req.body, (req.headers ?? {}) as Record<string, unknown>);
  res.setHeader('Cache-Control', 'no-store');
  res.status(r.status).json(r.body);
}
