// One-off: delete a single email record from the mortwise-purchases blob store.
// Run after deploying to remove test/stray records from the production index.
//
//   STRIPE_SECRET_KEY=...
//   NETLIFY_SITE_ID=<your site ID>
//   NETLIFY_AUTH_TOKEN=<personal access token>
//   node scripts/delete-purchase-record.mjs nobody-probe-7777@example.com
import { getStore } from '@netlify/blobs';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/delete-purchase-record.mjs <email>');
  process.exit(1);
}

const store = getStore({
  name: 'mortwise-purchases',
  siteID: process.env.NETLIFY_SITE_ID,
  token: process.env.NETLIFY_AUTH_TOKEN,
});

const existing = await store.get(email, { type: 'json' }).catch(() => null);
if (!existing) {
  console.log(`No record found for ${email} — nothing to delete.`);
  process.exit(0);
}

await store.delete(email);
console.log(`Deleted purchase record for ${email}.`);
