import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.product !== 'mortwise_full') {
      return NextResponse.json({ verified: false });
    }

    // One-off payment: paid, and within 30 days of purchase.
    const ACCESS_SECONDS = 30 * 24 * 60 * 60;
    const withinWindow = Date.now() / 1000 - session.created <= ACCESS_SECONDS;
    if (session.mode === 'payment' && session.payment_status === 'paid' && withinWindow) {
      return NextResponse.json({
        verified: true,
        sessionId,
        expiresAt: (session.created + ACCESS_SECONDS) * 1000,
      });
    }

    return NextResponse.json({ verified: false });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
