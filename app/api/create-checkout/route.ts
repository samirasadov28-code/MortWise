import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { assertOneOffPrice } from '@/lib/stripe-price';

// One-off 30-day access payment. Access is verified synchronously on /success
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
    const problem = await assertOneOffPrice(stripe, priceId);
    if (problem) {
      console.error('MortWise price check failed:', problem);
      return NextResponse.json({ error: 'Stripe price misconfigured' }, { status: 500 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
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
