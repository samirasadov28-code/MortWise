// One-off backfill: seed the mortwise-purchases blob index from Stripe history.
// Run once after deploying the index patch, with env:
//   STRIPE_SECRET_KEY (live restricted key for production backfill)
//   NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN (for blob access outside the Netlify runtime)
//   node scripts/backfill-purchase-index.mjs
// Read-mostly: paginates checkout sessions once; writes one blob per eligible buyer.
import Stripe from 'stripe';
import { getStore } from '@netlify/blobs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
const store = getStore({
  name: 'mortwise-purchases',
  siteID: process.env.NETLIFY_SITE_ID,
  token: process.env.NETLIFY_AUTH_TOKEN,
});

let scanned = 0, written = 0, cursor;
do {
  const page = await stripe.checkout.sessions.list({ limit: 100, ...(cursor ? { starting_after: cursor } : {}) });
  for (const s of page.data) {
    scanned++;
    if (s.payment_status !== 'paid') continue;
    if (s.metadata?.product !== 'mortwise_full') continue;
    const email = s.customer_details?.email?.trim().toLowerCase();
    if (!email) continue;
    await store.setJSON(email, { email, sessionId: s.id, product: 'mortwise_full', paidAt: s.created });
    written++;
  }
  cursor = page.has_more && page.data.length ? page.data[page.data.length - 1].id : undefined;
} while (cursor);
console.log(`scanned ${scanned} sessions, indexed ${written} buyers`);
