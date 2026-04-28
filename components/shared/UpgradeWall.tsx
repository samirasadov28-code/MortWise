'use client';

import { useState } from 'react';
import { setUnlockState } from '@/lib/stripe';

interface UpgradeWallProps {
  onUnlocked?: () => void;
}

const FEATURES = [
  'Side-by-side comparison of all scenarios',
  'Total cost of ownership (including fees, stamp duty)',
  'Rate-rise stress testing (+0.5% to +3.0%)',
  'Overpayment simulator with term and interest savings',
  'Cashback and clawback analysis with break-even',
  'Interest holiday / payment pause impact',
  'Balance chart over time for all scenarios',
  'Principal vs interest breakdown chart',
  'IRR and money-multiple for investment analysis',
  'Exit equity analysis at any year',
  'AI-generated market rate cards for your profile',
  'PDF export of the full analysis',
];

export default function UpgradeWall({ onUnlocked }: UpgradeWallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailUnlock, setShowEmailUnlock] = useState(false);
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const { url, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  async function handleEmailUnlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError(null);
    try {
      const res = await fetch('/api/unlock-with-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.unlocked) {
        setUnlockState(`email:${email.trim().toLowerCase()}`);
        onUnlocked?.();
      } else {
        setEmailError('This email is not on the access list.');
      }
    } catch {
      setEmailError('Could not verify access. Try again.');
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="border border-[#4a7c96]/40 rounded-xl p-5 sm:p-6 bg-[#eef4f7]/80 backdrop-blur">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2a2520] mb-2">See the full picture</h2>
        <p className="text-[#6b7a8a] text-sm">
          Unlock the complete analysis suite — everything you need to make the right decision.
        </p>
      </div>

      <ul className="space-y-2 mb-8">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#6b7a8a]">
            <span className="text-[#4a7c96] mt-0.5 flex-shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="text-center">
        <div className="mb-3">
          <span className="text-3xl font-bold text-[#2a2520]">€3.99</span>
          <span className="text-[#6b7a8a] ml-2 text-sm">/ month — cancel any time</span>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 px-6 bg-[#4a7c96] hover:bg-[#3a6a82] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
        >
          {loading ? 'Redirecting to checkout…' : 'Unlock full analysis — €3.99/month'}
        </button>

        <p className="mt-3 text-xs text-[#6b7a8a]">
          Secure payment via Stripe. Cancel any time from your Stripe billing portal.
        </p>
      </div>

      {/* Early access / allowlist unlock */}
      <div className="mt-5 pt-5 border-t border-[#e8e3dc] text-center">
        {!showEmailUnlock ? (
          <button
            type="button"
            onClick={() => setShowEmailUnlock(true)}
            className="text-xs text-[#6b7a8a] hover:text-[#4a7c96] transition-colors"
          >
            Have early access? Sign in with email →
          </button>
        ) : (
          <form onSubmit={handleEmailUnlock} className="space-y-2">
            <p className="text-xs text-[#6b7a8a]">Enter your early-access email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 bg-white border border-[#e8e3dc] focus:border-[#4a7c96] rounded-lg text-[#2a2520] text-sm placeholder-[#9aa5b0] outline-none transition-colors"
            />
            {emailError && <p className="text-red-600 text-xs">{emailError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowEmailUnlock(false); setEmailError(null); }}
                className="flex-1 py-2 px-3 border border-[#e8e3dc] hover:border-[#4a7c96] rounded-lg text-[#6b7a8a] hover:text-[#4a7c96] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={emailLoading}
                className="flex-1 py-2 px-3 bg-[#4a7c96] hover:bg-[#3a6a82] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {emailLoading ? 'Checking…' : 'Unlock'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
