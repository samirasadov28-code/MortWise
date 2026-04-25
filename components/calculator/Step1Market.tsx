'use client';

import type { WizardState, MarketCode } from '@/lib/types';
import { MARKETS, LAUNCH_MARKETS, COMING_SOON_MARKETS } from '@/lib/markets';

interface Step1Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step1Market({ state, onChange }: Step1Props) {
  const selected = state.market;
  const market = MARKETS[selected];

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Select your market</h2>
      <p className="text-[#94a3b8] text-sm mb-6">
        MortWise adapts stamp duty, government schemes, and regulatory context to the market you select.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {LAUNCH_MARKETS.map((code) => {
          const m = MARKETS[code];
          return (
            <button
              key={code}
              type="button"
              onClick={() => onChange({ market: code as MarketCode })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selected === code
                  ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                  : 'border-[#1e3a5f] bg-[#0f3460]/30 hover:border-[#3b82f6]/50'
              }`}
            >
              <span className="text-3xl">{m.flag}</span>
              <span className="text-sm font-medium text-white">{m.name}</span>
              <span className="text-xs text-[#94a3b8]">{m.currency}</span>
            </button>
          );
        })}

        {COMING_SOON_MARKETS.map((code) => {
          const m = MARKETS[code];
          return (
            <div
              key={code}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#1e3a5f]/50 bg-[#0f3460]/10 opacity-50 cursor-not-allowed"
            >
              <span className="text-3xl grayscale">{m.flag}</span>
              <span className="text-sm font-medium text-[#94a3b8]">{m.name}</span>
              <span className="text-xs text-[#94a3b8]">Coming soon</span>
            </div>
          );
        })}
      </div>

      {/* Market context */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">
          {market.flag} {market.name} — key context
        </h3>

        {market.govtSchemes.length > 0 && (
          <div className="bg-[#0f3460]/50 border border-[#1e3a5f] rounded-lg p-4">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Government Schemes</p>
            <div className="space-y-2">
              {market.govtSchemes.map((scheme) => (
                <div key={scheme.name} className="flex items-start gap-2">
                  <span className="text-[#3b82f6] text-xs mt-0.5">•</span>
                  <div>
                    <span className="text-sm font-medium text-white">{scheme.name}</span>
                    <p className="text-xs text-[#94a3b8]">{scheme.eligibility}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {market.regulatoryNotes.length > 0 && (
          <div className="bg-[#0f3460]/50 border border-[#1e3a5f] rounded-lg p-4">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Regulatory Notes</p>
            <ul className="space-y-1">
              {market.regulatoryNotes.map((note, i) => (
                <li key={i} className="text-xs text-[#94a3b8] flex items-start gap-2">
                  <span className="text-[#3b82f6] mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
