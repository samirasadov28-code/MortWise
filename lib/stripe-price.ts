import type Stripe from 'stripe';

/**
 * The one-off MortWise price must be active, one_time, EUR, 4.99 and
 * tax-inclusive. Anything else fails closed so a wrong price id can never
 * start a checkout.
 */
export async function assertOneOffPrice(stripe: Stripe, priceId: string): Promise<string | null> {
  const price = await stripe.prices.retrieve(priceId);
  if (!price.active) return 'price is not active';
  if (price.type !== 'one_time') return 'price is not one-time';
  if (price.currency !== 'eur') return 'price is not in EUR';
  if (price.unit_amount !== 499) return 'price is not 4.99';
  if (price.tax_behavior !== 'inclusive') return 'price is not tax-inclusive';
  return null;
}
