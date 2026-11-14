import { PROBE_VALUE } from './_probe-shared';

export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, value: PROBE_VALUE });
}
