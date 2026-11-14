import { SITE_BASE_URL } from '../src/lib/seoRoutes';

export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, url: SITE_BASE_URL });
}
