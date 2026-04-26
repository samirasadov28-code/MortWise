import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// NOTE: Add Stripe webhooks before going to high volume to handle subscription
// cancellations and renewals. Current flow verifies synchronously on /success.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mortwise.netlify.app';

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { product: 'mortwise_full' },
      subscription_data: {
        metadata: { product: 'mortwise_full' },
      },
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/calculator`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
