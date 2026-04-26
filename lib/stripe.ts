// Checkout is handled server-side (hosted Stripe page) — no client-side Stripe.js needed.

export const UNLOCK_STORAGE_KEY = 'mortwise_unlocked';

export function getUnlockState(): { unlocked: boolean; sessionId?: string } {
  if (typeof window === 'undefined') return { unlocked: false };
  try {
    const raw = localStorage.getItem(UNLOCK_STORAGE_KEY);
    if (!raw) return { unlocked: false };
    return JSON.parse(raw);
  } catch {
    return { unlocked: false };
  }
}

export function setUnlockState(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify({ unlocked: true, sessionId }));
}

export function clearUnlockState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UNLOCK_STORAGE_KEY);
}
