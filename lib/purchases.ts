// Server-only durable index of eligible purchases, keyed by normalized buyer email.
// Written at checkout verification time and by scripts/backfill-purchase-index.mjs;
// read by the access-recovery routes. Replaces unbounded Stripe scans on the public
// recovery endpoint with one bounded read (+ at most two Stripe calls for the
// refund/dispute re-check).

import { getStore, getDeployStore, type Store } from '@netlify/blobs';

export type PurchaseRecord = {
  email: string;
  sessionId: string;
  product: 'mortwise_full';
  paidAt: number; // unix seconds (checkout session created)
};

const STORE_NAME = 'mortwise-purchases';
const BLOB_TIMEOUT_MS = 5_000;

// Production always uses the durable site-level store.
// Deploy-previews and branch-deploys use a deploy-scoped store so test seeds
// are isolated per deploy and never land in the production buyer index.
function store(): Store {
  if (
    process.env.NETLIFY_CONTEXT === 'deploy-preview' ||
    process.env.NETLIFY_CONTEXT === 'branch-deploy'
  ) {
    return getDeployStore(STORE_NAME);
  }
  return getStore(STORE_NAME);
}

function key(email: string): string {
  return email.trim().toLowerCase();
}

function withTimeout<T>(p: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[purchases] ${label} timed out after ${BLOB_TIMEOUT_MS}ms`)),
        BLOB_TIMEOUT_MS,
      ),
    ),
  ]);
}

// Errors (including timeout) propagate to the caller — they must distinguish
// "storage unavailable" from a clean null (key genuinely absent).
export async function findPurchase(email: string): Promise<PurchaseRecord | null> {
  const rec = await withTimeout(store().get(key(email), { type: 'json' }), 'findPurchase');
  if (!rec || typeof rec !== 'object') return null;
  const r = rec as Partial<PurchaseRecord>;
  if (typeof r.sessionId !== 'string' || r.product !== 'mortwise_full') return null;
  return r as PurchaseRecord;
}

export async function recordPurchase(rec: PurchaseRecord): Promise<void> {
  await withTimeout(store().setJSON(key(rec.email), rec), 'recordPurchase');
}
