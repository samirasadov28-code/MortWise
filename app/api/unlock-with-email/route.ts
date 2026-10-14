import { NextResponse } from 'next/server';

// Email text alone is not proof of ownership. Current free access is handled
// separately; reintroduce private grants only with authenticated identity.
export async function POST() {
  return NextResponse.json({ unlocked: false, error: 'Email-only unlock is not supported.' }, { status: 403 });
}
