'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { setUnlockState } from '@/lib/stripe';
import Link from 'next/link';

function AccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    fetch('/api/redeem-access-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.verified && data.email) {
          setUnlockState(`email:${data.email}`);
          setStatus('success');
          setTimeout(() => router.push('/calculator'), 2500);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <div>
            <div className="w-16 h-16 border-4 border-[#4a7c96] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#2a2520] mb-2">Signing you in…</h1>
            <p className="text-[#6b7a8a]">Just a moment while we verify your sign-in link.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-20 h-20 rounded-full bg-[#4a7c96]/20 border-2 border-[#4a7c96] flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-[#2a2520] mb-2">Access restored</h1>
            <p className="text-[#6b7a8a] mb-6">
              Your full MortWise access is now active on this device.
            </p>
            <p className="text-sm text-[#6b7a8a]">Redirecting you to the calculator…</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-700 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-red-600">✗</span>
            </div>
            <h1 className="text-2xl font-bold text-[#2a2520] mb-2">Link not valid</h1>
            <p className="text-[#6b7a8a] mb-6">
              This sign-in link is invalid or has expired. Request a new one from the upgrade
              screen using the email you paid with.
            </p>
            <Link
              href="/calculator"
              className="inline-block px-6 py-3 bg-[#4a7c96] hover:bg-[#3a6a82] text-white font-semibold rounded-lg transition-colors"
            >
              Back to calculator
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense>
      <AccessContent />
    </Suspense>
  );
}
