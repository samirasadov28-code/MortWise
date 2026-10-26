import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyAccessToken, isPurchaseStillValid } from '@/lib/access';
import { findPurchase } from '@/lib/purchases';

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
  // Bounded: one index read + at most two Stripe calls.
  try {
    const purchase = await findPurchase(parsed.email);
    if (!purchase) {
      return NextResponse.json({ verified: false });
    }
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ verified: false }, { status: 500 });
    }
    const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
    if (!(await isPurchaseStillValid(stripe, purchase.sessionId))) {
      return NextResponse.json({ verified: false });
    }
  } catch (error) {
    console.error('Access-link redeem failed:', error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }

  return NextResponse.json({ verified: true, email: parsed.email });
}
