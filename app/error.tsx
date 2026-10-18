'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'app_error', {
        message: error.message,
        digest: error.digest,
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f5f3ef] text-[#2a2520] flex items-center justify-center px-6 py-10">
      <div className="max-w-md w-full bg-white border border-[#e8e3dc] rounded-xl p-6 shadow-sm text-center">
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-[#6b7a8a] mb-5 leading-relaxed">
          MortWise hit an unexpected error rendering this page. The team has been
          notified. You can try again, or head back to the homepage.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 bg-[#4a7c96] hover:bg-[#3a6a82] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-[#e8e3dc] hover:border-[#4a7c96] text-[#6b7a8a] hover:text-[#4a7c96] text-sm font-medium rounded-lg transition-colors"
          >
            Go home
          </a>
        </div>
        {error.digest && (
          <p className="text-[10px] text-[#6b7a8a]/70 mt-4 font-mono">
            ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
