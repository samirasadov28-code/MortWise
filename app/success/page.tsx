'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { setUnlockState } from '@/lib/stripe';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.verified) {
          setUnlockState(sessionId);
          setStatus('success');
          setTimeout(() => router.push('/calculator'), 2500);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <div>
            <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Verifying payment…</h1>
            <p className="text-[#94a3b8]">Just a moment while we confirm your purchase.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-20 h-20 rounded-full bg-[#3b82f6]/20 border-2 border-[#3b82f6] flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Full analysis unlocked!</h1>
            <p className="text-[#94a3b8] mb-6">
              You now have access to the complete MortWise analysis suite — one-time payment, yours forever.
            </p>
            <p className="text-sm text-[#94a3b8]">Redirecting you to the calculator…</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-20 h-20 rounded-full bg-red-900/20 border-2 border-red-700 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-red-400">✗</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment verification failed</h1>
            <p className="text-[#94a3b8] mb-6">
              We could not verify your payment. If you were charged, please contact support.
              Try returning to the calculator and attempting the purchase again.
            </p>
            <Link
              href="/calculator"
              className="inline-block px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold rounded-lg transition-colors"
            >
              Back to calculator
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
