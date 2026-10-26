import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// One-off lifetime access payment. Access is verified synchronously on /success
// from the checkout session; there is no webhook handler.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mortwise.netlify.app';

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_ONE_OFF_PRICE_ID;

  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });

  try {
    // One-off lifetime access (no active subscriptions existed on the old monthly price).
    // Restricted live keys may lack price-read permission, so the mode is fixed, not looked up.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Buyers are looked up by Customer email in Stripe-side tooling.
      // Under the pinned API version the default is 'if_required', which
      // creates NO Customer for card payments.
      customer_creation: 'always',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { product: 'mortwise_full' },
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/calculator`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
