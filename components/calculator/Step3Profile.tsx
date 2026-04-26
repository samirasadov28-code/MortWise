'use client';

import type { WizardState, BuyerType } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import Tooltip from '@/components/shared/Tooltip';

interface Step3Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const BUYER_TYPES: Array<{ value: BuyerType; label: string; description: string }> = [
  { value: 'first_time', label: 'First-time buyer', description: 'Never owned a property before' },
  { value: 'mover', label: 'Moving home', description: 'Selling existing property to buy another' },
  { value: 'investor', label: 'Investor / BTL', description: 'Buying as a rental investment' },
  { value: 'non_resident', label: 'Non-resident', description: 'Buying from abroad' },
];

export default function Step3Profile({ state, onChange }: Step3Props) {
  const market = MARKETS[state.market];
  const sym = market.currencySymbol;
  const totalIncome = state.annualIncome + state.coBorrowerIncome;
  const maxBorrow = market.maxIncomeMultiple ? totalIncome * market.maxIncomeMultiple : null;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2a2520] mb-1">Buyer profile</h2>
      <p className="text-[#6b7a8a] text-sm mb-6">
        Your profile affects stamp duty, maximum borrowing, and eligible government schemes.
      </p>

      <div className="space-y-5">
        {/* Buyer type */}
        <div>
          <label className="block text-sm font-medium text-[#2a2520] mb-2">Buyer type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BUYER_TYPES.map((bt) => (
              <button
                key={bt.value}
                type="button"
                onClick={() => onChange({ buyerType: bt.value })}
                className={`text-left p-3 rounded-lg border-2 transition-all ${
                  state.buyerType === bt.value
                    ? 'border-[#4a7c96] bg-[#4a7c96]/10'
                    : 'border-[#e8e3dc] bg-[#eef4f7]/60 hover:border-[#4a7c96]/50'
                }`}
              >
                <div className="text-sm font-medium text-[#2a2520]">{bt.label}</div>
                <div className="text-xs text-[#6b7a8a] mt-0.5">{bt.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Income */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
              Annual gross income
              <Tooltip content="Your total pre-tax income from all sources. Used to check against the lender income multiple cap (e.g. 3.5× in Ireland)." />
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
              <input
                type="number"
                value={state.annualIncome || ''}
                onChange={(e) => onChange({ annualIncome: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
                placeholder="70,000"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2a2520] mb-1.5">
              Co-borrower income (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
              <input
                type="number"
                value={state.coBorrowerIncome || ''}
                onChange={(e) => onChange({ coBorrowerIncome: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
                placeholder="0"
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Income multiple feedback */}
        {totalIncome > 0 && maxBorrow !== null && (
          <div className={`p-3 rounded-lg border ${
            (state.housePrice - state.deposit) <= maxBorrow
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-sm">
              <span className="font-medium text-[#2a2520]">
                {market.name} lending limit: {sym}{maxBorrow.toLocaleString()}
              </span>
              <span className="text-[#6b7a8a] ml-1">
                ({market.maxIncomeMultiple}× income of {sym}{totalIncome.toLocaleString()})
              </span>
            </p>
            <p className={`text-xs mt-0.5 ${
              (state.housePrice - state.deposit) <= maxBorrow ? 'text-green-700' : 'text-red-600'
            }`}>
              {(state.housePrice - state.deposit) <= maxBorrow
                ? `Your required loan (${sym}${(state.housePrice - state.deposit).toLocaleString()}) is within limits.`
                : `Your required loan (${sym}${(state.housePrice - state.deposit).toLocaleString()}) exceeds the typical lending cap.`}
            </p>
          </div>
        )}

        {/* Government schemes */}
        {market.govtSchemes.length > 0 && state.buyerType === 'first_time' && (
          <div>
            <label className="block text-sm font-medium text-[#2a2520] mb-2">
              Government scheme support
            </label>
            <div className="space-y-2">
              {market.govtSchemes.map((scheme) => {
                const maxAmt = typeof scheme.maxAmount === 'function'
                  ? scheme.maxAmount(state.housePrice)
                  : scheme.maxAmount;
                return (
                  <div key={scheme.name} className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-[#2a2520]">{scheme.name}</p>
                        <p className="text-xs text-[#6b7a8a] mt-0.5">{scheme.description}</p>
                        <p className="text-xs text-[#6b7a8a] mt-0.5">
                          Eligibility: {scheme.eligibility}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#4a7c96]">
                          up to {sym}{maxAmt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.govtSchemeEnabled}
                  onChange={(e) => onChange({
                    govtSchemeEnabled: e.target.checked,
                    govtSupportAmount: e.target.checked ? state.govtSupportAmount : 0,
                  })}
                  className="accent-[#4a7c96]"
                />
                <span className="text-sm text-[#6b7a8a]">Include government support in calculations</span>
              </label>

              {state.govtSchemeEnabled && (
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
                  <input
                    type="number"
                    value={state.govtSupportAmount || ''}
                    onChange={(e) => onChange({ govtSupportAmount: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
                    placeholder="30,000"
                    min={0}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
