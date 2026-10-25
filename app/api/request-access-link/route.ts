import { NextRequest, NextResponse } from 'next/server';
import { hasPaidPurchase, signAccessToken, sendAccessEmail } from '@/lib/access';

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
  // used to enumerate buyers.
  try {
    if (await hasPaidPurchase(normalized)) {
      const secret = process.env.AUTH_SIGNING_SECRET;
      if (!secret) throw new Error('AUTH_SIGNING_SECRET not configured');
      const origin = new URL(req.url).origin;
      const link = `${origin}/access?token=${signAccessToken(normalized, secret)}`;
      await sendAccessEmail(normalized, link);
    }
  } catch (error) {
    console.error('Access-link request failed:', error);
  }

  return NextResponse.json({ sent: true });
}
