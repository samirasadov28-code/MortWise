import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Diagnostic endpoint: confirms NETLIFY_BLOBS_CONTEXT is present and structurally
// valid (siteID + token fields exist). Does NOT make a network call to the Blobs
// API — the previous implementation timed out because it tried a real store.get().
// GET /api/blobs-health → { ok, contextPresent, hasSiteID, hasToken }
export async function GET() {
  const raw = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) {
    return NextResponse.json(
      { ok: false, contextPresent: false, error: 'NETLIFY_BLOBS_CONTEXT not in process.env' },
      { status: 500 },
    );
  }
  try {
    // @netlify/blobs uses standard base64 (Buffer.from(x,'base64').toString())
    const data: Record<string, unknown> = JSON.parse(
      Buffer.from(raw, 'base64').toString(),
    );
    const hasSiteID = typeof data.siteID === 'string' && data.siteID.length > 0;
    const hasToken  = typeof data.token  === 'string' && data.token.length  > 0;
    if (!hasSiteID || !hasToken) {
      return NextResponse.json(
        { ok: false, contextPresent: true, hasSiteID, hasToken, error: 'Context missing siteID or token' },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, contextPresent: true, hasSiteID: true, hasToken: true });
  } catch {
    return NextResponse.json(
      { ok: false, contextPresent: true, error: 'Context parse failed' },
      { status: 500 },
    );
  }
}
