// Server-only durable index of eligible purchases, keyed by normalized buyer email.
// Written at checkout verification time and by scripts/backfill-purchase-index.mjs;
// read by the access-recovery routes. Replaces unbounded Stripe scans on the public
// recovery endpoint with one bounded read (+ at most two Stripe calls for the
// refund/dispute re-check).

import { getStore, type Store } from '@netlify/blobs';

export type PurchaseRecord = {
  email: string;
  sessionId: string;
  product: 'mortwise_full';
  paidAt: number; // unix seconds (checkout session created)
};

const STORE_NAME = 'mortwise-purchases';

function store(): Store {
  return getStore(STORE_NAME);
}

function key(email: string): string {
  return email.trim().toLowerCase();
}

export async function recordPurchase(rec: PurchaseRecord): Promise<void> {
  await store().setJSON(key(rec.email), rec);
}

export async function findPurchase(email: string): Promise<PurchaseRecord | null> {
  try {
    const rec = await store().get(key(email), { type: 'json' });
    if (!rec || typeof rec !== 'object') return null;
    const r = rec as Partial<PurchaseRecord>;
    if (typeof r.sessionId !== 'string' || r.product !== 'mortwise_full') return null;
    return r as PurchaseRecord;
  } catch (err) {
    // Blob store not configured or unreachable — degrade to "no record found"
    // rather than propagating and causing a 500.
    console.error('[purchases] findPurchase failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
