import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// NOTE: Add Stripe webhooks before going to high volume to handle
// edge cases where the success page is not visited after payment.

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'MortWise Full Analysis',
              description: 'Unlock the complete mortgage analysis suite — one-time payment, yours forever.',
            },
            unit_amount: 499,
          },
          quantity: 1,
        },
      ],
      metadata: {
        product: 'mortwise_full',
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/calculator`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
