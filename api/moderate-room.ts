/** Vercel Serverless Function — oda moderasyonu (server.ts ile aynı çekirdek). */
import { handleModerateRoom } from '../src/lib/geminiEndpoints';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const r = await handleModerateRoom(req.body, (req.headers ?? {}) as Record<string, unknown>);
  res.setHeader('Cache-Control', 'no-store');
  res.status(r.status).json(r.body);
}
