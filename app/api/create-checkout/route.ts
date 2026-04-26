import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// NOTE: Add Stripe webhooks before going to high volume — the current flow
// verifies payment synchronously via session_id on the /success page.

const PRICE_ID = 'price_1TQU1FLtprV4p6afrWZH5oWk';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mortwise.netlify.app';

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
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
