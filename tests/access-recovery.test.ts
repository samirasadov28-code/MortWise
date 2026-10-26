// Regression tests for the access-recovery buyer-lookup gap (v1.44.0 -> indexed fix).
// Run: npx vitest run tests/access-recovery.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---- Durable purchase index mock (in-memory Map standing in for Netlify Blobs) ----
// Set blobError to simulate storage unavailability in specific tests.
const indexStore = new Map<string, any>();
let blobError: Error | null = null;
vi.mock('@/lib/purchases', () => ({
  recordPurchase: vi.fn(async (rec: any) => {
    if (blobError) throw blobError;
    indexStore.set(rec.email, rec);
  }),
  findPurchase: vi.fn(async (email: string) => {
    if (blobError) throw blobError;
    return indexStore.get(email.trim().toLowerCase()) ?? null;
  }),
}));

// ---- Stripe mock --------------------------------------------------------------
type FakeSession = {
  id: string; mode: string; payment_status: string;
  metadata?: Record<string, string>;
  customer_details?: { email?: string } | null;
  payment_intent?: any; created: number;
};
let fakeSessionsById: Record<string, FakeSession> = {};
let fakeCharge: { refunded: boolean; disputed: boolean; amount: number; amount_refunded: number };

vi.mock('stripe', () => ({
  default: class FakeStripe {
    checkout = { sessions: {
      retrieve: async (id: string) => {
        const s = fakeSessionsById[id];
        if (!s) throw new Error('No such checkout session: ' + id);
        return { ...s, payment_intent: { id: 'pi_1', latest_charge: { ...fakeCharge, id: 'ch_1' } } };
      },
    } };
    charges = { list: async () => ({ data: [{ ...fakeCharge, id: 'ch_1' }] }) };
  },
}));

const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }) as any);
vi.stubGlobal('fetch', fetchMock);

import { signAccessToken, verifyAccessToken, sendAccessEmail } from '@/lib/access';
import { POST as requestAccessLink } from '@/app/api/request-access-link/route';
import { POST as redeemAccessLink } from '@/app/api/redeem-access-link/route';
import { GET as verifyPayment } from '@/app/api/verify-payment/route';
import { POST as testSeedPurchase } from '@/app/api/test-seed-purchase/route';

const SECRET = 'test-signing-secret';
const BUYER = 'buyer@example.com';

function indexBuyer(email: string, sessionId = 'cs_test_buyer') {
  indexStore.set(email, { email, sessionId, product: 'mortwise_full', paidAt: 1700000000 });
}
function fakePaidSession(over: Partial<FakeSession> = {}) {
  fakeSessionsById['cs_test_buyer'] = {
    id: 'cs_test_buyer', mode: 'payment', payment_status: 'paid',
    metadata: { product: 'mortwise_full' }, customer_details: { email: BUYER },
    payment_intent: 'pi_1', created: 1700000000, ...over,
  };
}
const post = (url: string, body: any) =>
  new NextRequest('http://localhost:3100' + url, { method: 'POST', body: JSON.stringify(body) });

beforeEach(() => {
  indexStore.clear();
  blobError = null;
  fakeSessionsById = {};
  fakeCharge = { refunded: false, disputed: false, amount: 499, amount_refunded: 0 };
  fetchMock.mockClear();
  process.env.STRIPE_SECRET_KEY = 'rk_test_fake';
  process.env.RESEND_API_KEY = 're_fake';
  process.env.AUTH_SIGNING_SECRET = SECRET;
  delete process.env.ALLOWED_EMAILS;
});

describe('request-access-link', () => {
  it('allowlisted email instant-unlocks without index, Stripe or email', async () => {
    const res = await requestAccessLink(post('/api/request-access-link', { email: 'samir.asadov.28@gmail.com' }));
    expect(await res.json()).toEqual({ unlocked: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('unknown email: identical {sent:true}, no Stripe, no email (anti-enumeration, zero scan cost)', async () => {
    const res = await requestAccessLink(post('/api/request-access-link', { email: 'nobody@example.com' }));
    expect(await res.json()).toEqual({ sent: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('indexed eligible buyer: sends the sign-in email', async () => {
    indexBuyer(BUYER); fakePaidSession();
    const res = await requestAccessLink(post('/api/request-access-link', { email: BUYER }));
    expect(await res.json()).toEqual({ sent: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchMock.mock.calls[0] as any)[1].body);
    expect(body.to).toBe(BUYER);
    expect(body.text).toContain('http://localhost:3100/access?token=');
  });

  it('indexed but fully refunded buyer: no email sent', async () => {
    indexBuyer(BUYER); fakePaidSession();
    fakeCharge = { refunded: true, disputed: false, amount: 499, amount_refunded: 499 };
    const res = await requestAccessLink(post('/api/request-access-link', { email: BUYER }));
    expect(await res.json()).toEqual({ sent: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('anti-enumeration: buyer and unknown responses are byte-identical', async () => {
    const unknown = await (await requestAccessLink(post('/api/request-access-link', { email: 'nobody@example.com' }))).text();
    indexBuyer(BUYER); fakePaidSession();
    const buyer = await (await requestAccessLink(post('/api/request-access-link', { email: BUYER }))).text();
    expect(unknown).toBe(buyer);
  });

  it('storage unavailable: returns 503 fast (not silently treated as buyer-not-found)', async () => {
    blobError = new Error('Connection timed out');
    const res = await requestAccessLink(post('/api/request-access-link', { email: BUYER }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('unavailable') });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('redeem-access-link', () => {
  it('redeems the exact emailed-shape token for an indexed eligible buyer', async () => {
    indexBuyer(BUYER); fakePaidSession();
    const token = signAccessToken(BUYER, SECRET);
    const res = await redeemAccessLink(post('/api/redeem-access-link', { token }));
    expect(await res.json()).toEqual({ verified: true, email: BUYER });
  });

  it('rejects a valid token whose purchase was refunded', async () => {
    indexBuyer(BUYER); fakePaidSession();
    fakeCharge = { refunded: true, disputed: false, amount: 499, amount_refunded: 499 };
    const token = signAccessToken(BUYER, SECRET);
    const res = await redeemAccessLink(post('/api/redeem-access-link', { token }));
    expect(await res.json()).toEqual({ verified: false });
  });

  it('rejects garbage and wrong-secret tokens', async () => {
    indexBuyer(BUYER); fakePaidSession();
    expect(await (await redeemAccessLink(post('/api/redeem-access-link', { token: 'Z2FyYmFnZQ==' }))).json()).toEqual({ verified: false });
    const bad = signAccessToken(BUYER, 'wrong-secret');
    expect(await (await redeemAccessLink(post('/api/redeem-access-link', { token: bad }))).json()).toEqual({ verified: false });
  });

  it('storage unavailable at redeem: returns 503, not verified: false (token was valid)', async () => {
    blobError = new Error('Blobs API unreachable');
    const token = signAccessToken(BUYER, SECRET);
    const res = await redeemAccessLink(post('/api/redeem-access-link', { token }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('unavailable') });
  });
});

describe('verify-payment indexes eligible purchases', () => {
  it('verified purchase is written to the index with normalized email', async () => {
    fakePaidSession({ customer_details: { email: 'Buyer@Example.com' } });
    const req = new NextRequest('http://localhost:3100/api/verify-payment?session_id=cs_test_buyer');
    const res = await verifyPayment(req);
    expect((await res.json()).verified).toBe(true);
    expect(indexStore.get('buyer@example.com')).toMatchObject({ sessionId: 'cs_test_buyer', product: 'mortwise_full' });
  });

  it('refunded purchase is not indexed and not verified', async () => {
    fakePaidSession();
    fakeCharge = { refunded: true, disputed: false, amount: 499, amount_refunded: 499 };
    const req = new NextRequest('http://localhost:3100/api/verify-payment?session_id=cs_test_buyer');
    const res = await verifyPayment(req);
    expect(await res.json()).toEqual({ verified: false, refunded: true });
    expect(indexStore.size).toBe(0);
  });
});

describe('token + email helpers', () => {
  it('token round-trips and rejects tampering', () => {
    const token = signAccessToken(BUYER, SECRET);
    expect(verifyAccessToken(token, SECRET)).toEqual({ email: BUYER });
    expect(verifyAccessToken(token, 'other')).toBeNull();
  });

  it('sendAccessEmail uses the MortWise identity and link', async () => {
    await sendAccessEmail(BUYER, 'https://mortwise.netlify.app/access?token=abc');
    const [url, init] = fetchMock.mock.calls[0] as any;
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse(init.body);
    expect(body.from).toBe('MortWise <noreply@modeloop.net>');
    expect(body.text).toContain('/access?token=');
  });
});

describe('preview test-seed endpoint + bypass (fail-closed)', () => {
  it('blocked when NETLIFY_CONTEXT=production', async () => {
    process.env.NETLIFY_CONTEXT = 'production';
    const res = await testSeedPurchase(post('/api/test-seed-purchase', { email: BUYER }));
    expect(res.status).toBe(403);
    delete process.env.NETLIFY_CONTEXT;
  });

  it('blocked when NETLIFY_CONTEXT is absent (fail-closed)', async () => {
    delete process.env.NETLIFY_CONTEXT;
    const res = await testSeedPurchase(post('/api/test-seed-purchase', { email: BUYER }));
    expect(res.status).toBe(403);
  });

  it('allowed when NETLIFY_CONTEXT=deploy-preview', async () => {
    process.env.NETLIFY_CONTEXT = 'deploy-preview';
    const res = await testSeedPurchase(post('/api/test-seed-purchase', { email: BUYER }));
    const data = await res.json();
    expect(data.seeded).toBe(true);
    expect(data.email).toBe(BUYER);
    expect(typeof data.token).toBe('string');
    expect(indexStore.get(BUYER)).toMatchObject({ sessionId: 'preview_test_bypass', product: 'mortwise_full' });
    delete process.env.NETLIFY_CONTEXT;
  });

  it('seeded token redeems end-to-end in deploy-preview (no Stripe)', async () => {
    process.env.NETLIFY_CONTEXT = 'deploy-preview';
    const seedRes = await testSeedPurchase(post('/api/test-seed-purchase', { email: BUYER }));
    const { token } = await seedRes.json();
    const redeemRes = await redeemAccessLink(post('/api/redeem-access-link', { token }));
    expect(await redeemRes.json()).toEqual({ verified: true, email: BUYER });
    delete process.env.NETLIFY_CONTEXT;
  });

  it('bypass rejected when NETLIFY_CONTEXT=production (fail-closed)', async () => {
    process.env.NETLIFY_CONTEXT = 'production';
    indexBuyer(BUYER, 'preview_test_bypass');
    const token = signAccessToken(BUYER, SECRET);
    const res = await redeemAccessLink(post('/api/redeem-access-link', { token }));
    // isPurchaseStillValid falls through to Stripe, which throws — returns 500
    expect(res.status).toBe(500);
    delete process.env.NETLIFY_CONTEXT;
  });

  it('bypass rejected when NETLIFY_CONTEXT absent (fail-closed)', async () => {
    delete process.env.NETLIFY_CONTEXT;
    indexBuyer(BUYER, 'preview_test_bypass');
    const token = signAccessToken(BUYER, SECRET);
    const res = await redeemAccessLink(post('/api/redeem-access-link', { token }));
    expect(res.status).toBe(500);
  });
});
