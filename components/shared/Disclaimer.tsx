'use client';

import { useEffect, useState } from 'react';
import { version as buildVersion } from '@/package.json';

const POLL_INTERVAL_MS = 60_000;

export default function Disclaimer() {
  const [latestVersion, setLatestVersion] = useState<string>(buildVersion);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string };
        if (cancelled || !data.version) return;
        if (data.version !== buildVersion) {
          setLatestVersion(data.version);
          window.location.reload();
        }
      } catch {
        // network errors are fine — we'll retry next tick
      }
    }

    check();
    const id = window.setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const updatePending = latestVersion !== buildVersion;

  return (
    <div className="border-t border-[#e8e3dc] bg-[#f9f7f4] px-4 py-3 mt-8">
      <p className="text-center text-xs text-[#6b7a8a]">
        MortWise is a calculation tool, not financial advice. Always speak to a qualified mortgage advisor before making decisions.
      </p>
      <p className="text-center text-[11px] text-[#6b7a8a]/70 mt-1.5 font-mono">
        v{buildVersion}
        {updatePending && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ml-2 underline hover:text-[#4a7c96]"
          >
            update available — reload
          </button>
        )}
      </p>
    </div>
  );
}
