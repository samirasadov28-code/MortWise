// Server-only helpers for verified email sign-in (access recovery).
// Never import this file from client components.

import Stripe from 'stripe';
import crypto from 'crypto';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Returns true when Stripe shows a paid MortWise checkout for this email.
export async function hasPaidPurchase(email: string): Promise<boolean> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return false;
  const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
  const customers = await stripe.customers.list({ email, limit: 5 });
  for (const customer of customers.data) {
    const sessions = await stripe.checkout.sessions.list({ customer: customer.id, limit: 100 });
    const paid = sessions.data.some(
      (s) => s.payment_status === 'paid' && s.metadata?.product === 'mortwise_full'
    );
    if (paid) return true;
  }
  return false;
}

export function signAccessToken(email: string, secret: string): string {
  const payload = `${email}|${Date.now() + TOKEN_TTL_MS}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return Buffer.from(`${payload}|${sig}`, 'utf8').toString('base64url');
}

export function verifyAccessToken(token: string, secret: string): { email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 3) return null;
    const [email, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!email || !Number.isFinite(exp) || Date.now() > exp) return null;
    const expected = crypto.createHmac('sha256', secret).update(`${email}|${expStr}`).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return { email };
  } catch {
    return null;
  }
}

export async function sendAccessEmail(email: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not configured');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MortWise <noreply@modeloop.net>',
      to: email,
      subject: 'Your MortWise sign-in link',
      text: [
        'Here is your MortWise sign-in link (valid for 24 hours):',
        '',
        link,
        '',
        'It restores your full access on this device. If you did not request it, you can ignore this email.',
      ].join('\n'),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed with status ${res.status}`);
  }
}
