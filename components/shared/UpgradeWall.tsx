'use client';

import { useState } from 'react';

interface UpgradeWallProps {
  onUnlocked?: () => void;
}

const FEATURES = [
  'Side-by-side comparison of all scenarios',
  'Total interest paid over the life of each loan',
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UpgradeWall(_props: UpgradeWallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="border border-[#3b82f6]/40 rounded-xl p-6 bg-[#0f3460]/50 backdrop-blur">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">See the full picture</h2>
        <p className="text-[#94a3b8] text-sm">
          Unlock the complete analysis suite — everything you need to make the right decision.
        </p>
      </div>

      <ul className="space-y-2 mb-8">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#94a3b8]">
            <span className="text-[#3b82f6] mt-0.5 flex-shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="text-center">
        <div className="mb-3">
          <span className="text-3xl font-bold text-white">€3.99</span>
          <span className="text-[#94a3b8] ml-2 text-sm">/ month — cancel any time</span>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 px-6 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
        >
          {loading ? 'Redirecting to checkout…' : 'Unlock full analysis — €3.99/month'}
        </button>

        <p className="mt-3 text-xs text-[#94a3b8]">
          Secure payment via Stripe. Cancel any time from your Stripe billing portal.
        </p>
      </div>
    </div>
  );
}
