// Server-only helpers for verified email sign-in (access recovery).
// Never import this file from client components.

import Stripe from 'stripe';
import crypto from 'crypto';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// A one-off purchase stops being valid when the payment is fully refunded or
// disputed. session.payment_status stays 'paid' after a refund, so the charge
// itself has to be checked (same rule as app/api/verify-payment/route.ts).
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
    // Mirror verify-payment: on a Stripe hiccup keep access and log, rather
    // than failing closed for a buyer we cannot check right now.
    console.error('Refund state lookup failed:', error);
    return false;
  }
}

// In deploy-preview and branch-deploy contexts, a session ID of
// 'preview_test_bypass' skips the Stripe call so recovery can be proved
// end-to-end without a real payment.
// Fail-closed: if NETLIFY_CONTEXT is absent or any value other than the two
// explicit preview strings, bypass is rejected. This means an attacker who
// somehow seeds a bypass record into the production store gains nothing.
function isPreviewBypass(sessionId: string): boolean {
  return (
    sessionId === 'preview_test_bypass' &&
    (process.env.NETLIFY_CONTEXT === 'deploy-preview' ||
     process.env.NETLIFY_CONTEXT === 'branch-deploy')
  );
}

// Bounded re-validation of ONE known purchase (recovery + redeem paths):
// one session retrieve (expanded) + at most one charge lookup. Never scans.
export async function isPurchaseStillValid(stripe: Stripe, sessionId: string): Promise<boolean> {
  if (isPreviewBypass(sessionId)) return true;
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent.latest_charge'],
  });
  if (session.metadata?.product !== 'mortwise_full') return false;
  if (session.payment_status !== 'paid') return false;
  return !(await isChargeRevoked(stripe, session));
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
