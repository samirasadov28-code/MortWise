import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { signAccessToken, sendAccessEmail, isPurchaseStillValid } from '@/lib/access';
import { findPurchase } from '@/lib/purchases';

export const runtime = 'nodejs';

// Hardcoded fallback allowlist; can be extended via env var ALLOWED_EMAILS (comma-separated).
const HARDCODED_ALLOWLIST = ['samir.asadov.28@gmail.com'];

function getAllowlist(): string[] {
  const fromEnv = (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...HARDCODED_ALLOWLIST, ...fromEnv]));
}

export async function POST(req: NextRequest) {
  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === 'string' ? body.email : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  // Allowlist keeps its instant-unlock behaviour (no email needed).
  if (getAllowlist().includes(normalized)) {
    return NextResponse.json({ unlocked: true });
  }

  // Paying customers get a signed sign-in link by email. The response is
  // identical whether or not a purchase exists, so the endpoint cannot be
  // used to enumerate buyers. Lookup is the durable purchase index (one
  // bounded read) plus at most two Stripe calls for the refund re-check;
  // this endpoint never scans Stripe history.
  try {
    const purchase = await findPurchase(normalized);
    if (purchase) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      const secret = process.env.AUTH_SIGNING_SECRET;
      if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured');
      if (!secret) throw new Error('AUTH_SIGNING_SECRET not configured');
      const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
      if (await isPurchaseStillValid(stripe, purchase.sessionId)) {
        const origin = new URL(req.url).origin;
        const link = `${origin}/access?token=${signAccessToken(normalized, secret)}`;
        await sendAccessEmail(normalized, link);
      }
    }
  } catch (error) {
    console.error('Access-link request failed:', error);
  }

  return NextResponse.json({ sent: true });
}
