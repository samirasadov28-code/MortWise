import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// A one-off lifetime purchase stops being valid when the payment is fully
// refunded or disputed. session.payment_status stays 'paid' after a refund,
// so the charge itself has to be checked.
async function isChargeRevoked(stripe: Stripe, session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.mode !== 'payment') return false;
  try {
    let charge: Stripe.Charge | null = null;
    const pi = session.payment_intent;
    if (pi && typeof pi === 'object' && pi.latest_charge && typeof pi.latest_charge === 'object') {
      charge = pi.latest_charge as Stripe.Charge;
    } else {
      const piId = typeof pi === 'string' ? pi : pi?.id;
      if (!piId) return false;
      const charges = await stripe.charges.list({ payment_intent: piId, limit: 3 });
      charge = charges.data[0] ?? null;
    }
    if (!charge) return false;
    return (
      charge.refunded === true ||
      charge.disputed === true ||
      (charge.amount_refunded ?? 0) >= charge.amount
    );
  } catch (error) {
    // If the refund state cannot be determined, fail closed for paid checks
    // is too harsh on Stripe hiccups — keep access and log instead.
    console.error('Refund state lookup failed:', error);
    return false;
  }
}

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
      expand: ['subscription', 'payment_intent.latest_charge'],
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
      if (await isChargeRevoked(stripe, session)) {
        return NextResponse.json({ verified: false, refunded: true });
      }
      return NextResponse.json({ verified: true, sessionId });
    }

    return NextResponse.json({ verified: false });
  } catch (error) {
    console.error('Subscription verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
