import { NextRequest, NextResponse } from 'next/server';
import { hasPaidPurchase, verifyAccessToken } from '@/lib/access';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let token: string | undefined;
  try {
    const body = await req.json();
    token = typeof body?.token === 'string' ? body.token : undefined;
  } catch {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  const secret = process.env.AUTH_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ verified: false }, { status: 500 });
  }

  const parsed = verifyAccessToken(token, secret);
  if (!parsed) {
    return NextResponse.json({ verified: false });
  }

  // Re-check the purchase at redeem time so revoked/refunded access fails.
  try {
    if (!(await hasPaidPurchase(parsed.email))) {
      return NextResponse.json({ verified: false });
    }
  } catch (error) {
    console.error('Access-link redeem failed:', error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }

  return NextResponse.json({ verified: true, email: parsed.email });
}
