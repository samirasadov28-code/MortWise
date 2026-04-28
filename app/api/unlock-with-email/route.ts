import { NextRequest, NextResponse } from 'next/server';

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
    return NextResponse.json({ unlocked: false, error: 'Invalid request body' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ unlocked: false, error: 'Missing email' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const allowlist = getAllowlist();

  if (allowlist.includes(normalized)) {
    return NextResponse.json({ unlocked: true });
  }

  return NextResponse.json({ unlocked: false }, { status: 200 });
}
