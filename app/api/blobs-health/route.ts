import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export const runtime = 'nodejs';

// Diagnostic endpoint: confirms that the Netlify Blobs store is reachable at
// runtime. Safe to call in any environment; returns no sensitive data.
// GET /api/blobs-health
export async function GET() {
  const contextPresent = !!process.env.NETLIFY_BLOBS_CONTEXT;
  try {
    const store = getStore('mortwise-purchases');
    // A cheap read for a key that will never exist; null result is fine.
    await store.get('__health_probe__');
    return NextResponse.json({ ok: true, contextPresent });
  } catch (err) {
    return NextResponse.json(
      { ok: false, contextPresent, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
