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
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.metadata?.product !== 'mortwise_full') {
      return NextResponse.json({ verified: false });
    }

    // For subscriptions, check the subscription status directly
    const sub = session.subscription;
    if (sub && typeof sub === 'object') {
      const active = sub.status === 'active' || sub.status === 'trialing';
      return NextResponse.json({ verified: active, subscriptionId: sub.id });
    }

    // Fallback: initial payment_status (covers the moment before subscription propagates)
    if (session.payment_status === 'paid') {
      return NextResponse.json({ verified: true, sessionId });
    }

    return NextResponse.json({ verified: false });
  } catch (error) {
    console.error('Subscription verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
