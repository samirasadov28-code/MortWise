import { loadStripe } from '@stripe/stripe-js';

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export const UNLOCK_STORAGE_KEY = 'mortwise_unlocked';
export const PRODUCT_PRICE_CENTS = 499;
export const PRODUCT_CURRENCY = 'eur';

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
