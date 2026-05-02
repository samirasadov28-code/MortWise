'use client';

import type { WizardState, MarketCode } from '@/lib/types';
import { MARKETS, LAUNCH_MARKETS, COMING_SOON_MARKETS } from '@/lib/markets';
import { scenariosForMarket } from '@/lib/lenders';
import Flag from '@/components/shared/Flag';

interface Step1Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step1Market({ state, onChange }: Step1Props) {
  const selected = state.market;
  const market = MARKETS[selected];

  function selectMarket(code: MarketCode) {
    if (code === state.market) return;
    // Replace scenario lender names + indicative rates with the new market's lenders
    // and reset the Step 2 display-currency back to local for the new market.
    onChange({
      market: code,
      scenarios: scenariosForMarket(code, state.scenarios.length || 4),
      displayCurrencyMarket: code,
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2a2520] mb-1">Select your market</h2>
      <p className="text-[#6b7a8a] text-sm mb-6">
        MortWise adapts stamp duty, government schemes, regulatory context, and bank lineup to the market you select.
      </p>

      {/* Equal-size country grid — every box has identical dimensions and a 2-line name slot
          so single-word and two-word country names sit visually identical. */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {LAUNCH_MARKETS.map((code) => {
          const m = MARKETS[code];
          return (
            <button
              key={code}
              type="button"
              onClick={() => selectMarket(code as MarketCode)}
              className={`flex flex-col items-center justify-between gap-1 px-3 py-4 rounded-xl border-2 transition-all min-h-[140px] ${
                selected === code
                  ? 'border-[#4a7c96] bg-[#4a7c96]/10'
                  : 'border-[#e8e3dc] bg-[#eef4f7]/60 hover:border-[#4a7c96]/50'
              }`}
            >
              <Flag code={code as MarketCode} size={40} />
              <span className="text-xs font-medium text-[#2a2520] text-center leading-tight line-clamp-2 h-[2.4em] flex items-center justify-center">
                {m.name}
              </span>
              <span className="text-[10px] text-[#6b7a8a] uppercase tracking-wide">{m.currency}</span>
            </button>
          );
        })}

        {COMING_SOON_MARKETS.map((code) => {
          const m = MARKETS[code];
          return (
            <div
              key={code}
              className="flex flex-col items-center justify-between gap-1 px-3 py-4 rounded-xl border-2 border-[#e8e3dc]/50 bg-[#eef4f7]/20 opacity-50 cursor-not-allowed min-h-[140px]"
            >
              <Flag code={code as MarketCode} size={40} className="grayscale opacity-60" />
              <span className="text-xs font-medium text-[#6b7a8a] text-center leading-tight line-clamp-2 h-[2.4em] flex items-center justify-center">
                {m.name}
              </span>
              <span className="text-[10px] text-[#6b7a8a]">Coming soon</span>
            </div>
          );
        })}
      </div>

      {/* Market context */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#2a2520] flex items-center gap-2">
          <Flag code={selected} size={20} /> {market.name} — key context
        </h3>

        {market.govtSchemes.length > 0 && (
          <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-lg p-4">
            <p className="text-xs font-semibold text-[#6b7a8a] uppercase tracking-wide mb-2">Government Schemes</p>
            <div className="space-y-2">
              {market.govtSchemes.map((scheme) => (
                <div key={scheme.name} className="flex items-start gap-2">
                  <span className="text-[#4a7c96] text-xs mt-0.5">•</span>
                  <div>
                    <span className="text-sm font-medium text-[#2a2520]">{scheme.name}</span>
                    <p className="text-xs text-[#6b7a8a]">{scheme.eligibility}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {market.regulatoryNotes.length > 0 && (
          <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-lg p-4">
            <p className="text-xs font-semibold text-[#6b7a8a] uppercase tracking-wide mb-2">Regulatory Notes</p>
            <ul className="space-y-1">
              {market.regulatoryNotes.map((note, i) => (
                <li key={i} className="text-xs text-[#6b7a8a] flex items-start gap-2">
                  <span className="text-[#4a7c96] mt-0.5">•</span>
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
