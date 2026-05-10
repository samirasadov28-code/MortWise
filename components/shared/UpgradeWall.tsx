'use client';

import { useState } from 'react';
import { setUnlockState } from '@/lib/stripe';
import { showToast } from '@/components/shared/Toaster';
import { track } from '@/lib/analytics';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface UpgradeWallProps {
  onUnlocked?: () => void;
}

export default function UpgradeWall({ onUnlocked }: UpgradeWallProps) {
  const { t } = useTranslation();
  const FEATURES = [
    t('paywall.feature1'),
    t('paywall.feature2'),
    t('paywall.feature3'),
    t('paywall.feature4'),
    t('paywall.feature5'),
    t('paywall.feature6'),
    t('paywall.feature7'),
    t('paywall.feature8'),
    t('paywall.feature9'),
    t('paywall.feature10'),
    t('paywall.feature11'),
    t('paywall.feature12'),
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailUnlock, setShowEmailUnlock] = useState(false);
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    track('unlock_clicked');
    try {
      const res = await fetch('/api/create-checkout', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const { url, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);
      if (url) {
        track('checkout_started');
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      showToast({ kind: 'error', message: msg, durationMs: 6000 });
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
        setEmailError(t('paywall.notOnList'));
      }
    } catch {
      setEmailError(t('paywall.verifyFailed'));
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="border border-[#4a7c96]/40 rounded-xl p-5 sm:p-6 bg-[#eef4f7]/80 backdrop-blur">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2a2520] mb-2">{t('paywall.title')}</h2>
        <p className="text-[#6b7a8a] text-sm">
          {t('paywall.subtitle')}
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
          <span className="text-[#6b7a8a] ml-2 text-sm">{t('paywall.priceSuffix')}</span>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 px-6 bg-[#4a7c96] hover:bg-[#3a6a82] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
        >
          {loading ? t('paywall.redirecting') : t('paywall.cta')}
        </button>

        <p className="mt-3 text-xs text-[#6b7a8a]">
          {t('paywall.secureFootnote')}
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
            {t('paywall.earlyAccessLink')}
          </button>
        ) : (
          <form onSubmit={handleEmailUnlock} className="space-y-2">
            <p className="text-xs text-[#6b7a8a]">{t('paywall.earlyAccessPrompt')}</p>
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
                {t('paywall.cancel')}
              </button>
              <button
                type="submit"
                disabled={emailLoading}
                className="flex-1 py-2 px-3 bg-[#4a7c96] hover:bg-[#3a6a82] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {emailLoading ? t('paywall.checking') : t('paywall.unlock')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
