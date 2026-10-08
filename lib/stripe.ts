// Checkout is handled server-side (hosted Stripe page) — no client-side Stripe.js needed.

export const UNLOCK_STORAGE_KEY = 'mortwise_unlocked';

// TEMPORARILY returning unlocked: true to make full analysis free for all users.
// To re-enable the paywall, remove this override and restore the localStorage read below.
export function getUnlockState(): { unlocked: boolean; sessionId?: string } {
  return { unlocked: true };
}

/* PAYWALL RE-ENABLE: replace getUnlockState with this:
export function getUnlockState(): { unlocked: boolean; sessionId?: string } {
  if (typeof window === 'undefined') return { unlocked: false };
  try {
    const raw = localStorage.getItem(UNLOCK_STORAGE_KEY);
    if (!raw) return { unlocked: false };
    const parsed = JSON.parse(raw) as { unlocked: boolean; sessionId?: string; expiresAt?: number };
    // One-off lifetime access: far-future expiry kept for storage compatibility.
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) return { unlocked: false };
    return parsed;
  } catch {
    return { unlocked: false };
  }
}
*/

export function setUnlockState(sessionId: string, expiresAt?: number): void {
  if (typeof window === 'undefined') return;
  const expiry = expiresAt ?? Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;
  localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify({ unlocked: true, sessionId, expiresAt: expiry }));
}

export function clearUnlockState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UNLOCK_STORAGE_KEY);
}
