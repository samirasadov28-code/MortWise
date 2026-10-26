import { NextRequest, NextResponse } from 'next/server';
import { signAccessToken } from '@/lib/access';
import { recordPurchase } from '@/lib/purchases';

export const runtime = 'nodejs';

// Seeds a test purchase record and returns a ready-to-redeem recovery token.
// Gated to non-production Netlify contexts (deploy-preview, branch-deploy, local).
// The seeded record uses sessionId 'preview_test_bypass', which isPurchaseStillValid
// accepts without a Stripe call in non-production environments.
//
// POST /api/test-seed-purchase  { email: string }
// → { seeded: true, email, token }  (token can be passed directly to /api/redeem-access-link)
export async function POST(req: NextRequest) {
  if (process.env.NETLIFY_CONTEXT === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 });
  }

  const secret = process.env.AUTH_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'AUTH_SIGNING_SECRET not configured' }, { status: 500 });
  }

  try {
    await recordPurchase({
      email,
      sessionId: 'preview_test_bypass',
      product: 'mortwise_full',
      paidAt: Math.floor(Date.now() / 1000),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Blob write failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }

  const token = signAccessToken(email, secret);
  return NextResponse.json({ seeded: true, email, token });
}
