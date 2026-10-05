import { afterEach, describe, expect, it } from 'vitest';
import { reserveAiCall } from '@/lib/ai-quota';

const req = { headers: new Headers({ 'x-forwarded-for': '1.2.3.4' }) } as never;
const keys = ['AI_QUOTA_ENABLED', 'AI_USER_DAILY_LIMIT', 'AI_GLOBAL_DAILY_LIMIT', 'AI_GLOBAL_MINUTE_LIMIT', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
afterEach(() => keys.forEach((k) => delete process.env[k]));

describe('ai quota', () => {
  it('is off unless enabled', async () => {
    expect((await reserveAiCall(req)).ok).toBe(true);
  });
  it('fails closed when enabled without limits or database', async () => {
    process.env.AI_QUOTA_ENABLED = 'true';
    const r = await reserveAiCall(req);
    expect(r.ok).toBe(false);
  });
  it('fails closed when a limit is not a positive integer', async () => {
    process.env.AI_QUOTA_ENABLED = 'true';
    Object.assign(process.env, { AI_USER_DAILY_LIMIT: '0', AI_GLOBAL_DAILY_LIMIT: '30', AI_GLOBAL_MINUTE_LIMIT: '2', SUPABASE_URL: 'http://x', SUPABASE_SERVICE_ROLE_KEY: 'k' });
    expect((await reserveAiCall(req)).ok).toBe(false);
  });
});
