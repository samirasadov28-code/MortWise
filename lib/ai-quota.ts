import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';

/**
 * AI request budget. Off unless AI_QUOTA_ENABLED=true. When enabled it fails
 * closed: missing limits, missing database settings or a database error all
 * block the AI call. Limits are set in env, never hard-coded:
 *   AI_USER_DAILY_LIMIT, AI_GLOBAL_DAILY_LIMIT, AI_GLOBAL_MINUTE_LIMIT
 * Database: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server only).
 */
export type QuotaResult = { ok: true } | { ok: false; status: number; error: string };

const positiveInt = (v: string | undefined): number | null => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export function clientHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  return createHash('sha256').update(`mortwise:${ip}`).digest('hex');
}

export async function reserveAiCall(req: NextRequest): Promise<QuotaResult> {
  if (process.env.AI_QUOTA_ENABLED !== 'true') return { ok: true };

  const user = positiveInt(process.env.AI_USER_DAILY_LIMIT);
  const day = positiveInt(process.env.AI_GLOBAL_DAILY_LIMIT);
  const minute = positiveInt(process.env.AI_GLOBAL_MINUTE_LIMIT);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!user || !day || !minute || !url || !key) {
    return { ok: false, status: 503, error: 'AI is temporarily unavailable.' };
  }

  try {
    const res = await fetch(`${url}/rest/v1/rpc/reserve_mortwise_ai_call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        p_client_hash: clientHash(req),
        p_user_daily: user,
        p_global_daily: day,
        p_global_minute: minute,
      }),
    });
    if (!res.ok) return { ok: false, status: 503, error: 'AI is temporarily unavailable.' };
    const outcome = (await res.json()) as string;
    if (outcome === 'ok') return { ok: true };
    if (outcome === 'user_daily') {
      return { ok: false, status: 429, error: 'You have used today\'s AI questions. Try again tomorrow.' };
    }
    return { ok: false, status: 429, error: 'AI is busy right now. Please try again shortly.' };
  } catch {
    return { ok: false, status: 503, error: 'AI is temporarily unavailable.' };
  }
}
