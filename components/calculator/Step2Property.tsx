'use client';

import { useState } from 'react';
import type { WizardState } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import Tooltip from '@/components/shared/Tooltip';

interface Step2Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step2Property({ state, onChange }: Step2Props) {
  const [depositMode, setDepositMode] = useState<'amount' | 'percent'>('amount');
  const market = MARKETS[state.market];
  const sym = market.currencySymbol;

  const ltv = state.housePrice > 0 ? (state.housePrice - state.deposit) / state.housePrice : 0;
  const ltvBand = market.ltvBands.find((b) => ltv <= b.maxLtv) ?? market.ltvBands[market.ltvBands.length - 1];

  function handlePriceChange(val: number) {
    const newDeposit = depositMode === 'percent'
      ? val * (state.deposit / (state.housePrice || 1))
      : state.deposit;
    onChange({ housePrice: val, deposit: Math.min(newDeposit, val) });
  }

  function handleDepositAmount(val: number) {
    onChange({ deposit: Math.min(val, state.housePrice) });
  }

  function handleDepositPercent(pct: number) {
    onChange({ deposit: (pct / 100) * state.housePrice });
  }

  const depositPct = state.housePrice > 0 ? (state.deposit / state.housePrice) * 100 : 0;
  const loanAmount = state.housePrice - state.deposit;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2a2520] mb-1">Property details</h2>
      <p className="text-[#6b7a8a] text-sm mb-6">
        Enter the property price and how much deposit you have available.
      </p>

      <div className="space-y-5">
        {/* Property price */}
        <div>
          <label className="block text-sm font-medium text-[#2a2520] mb-1.5">
            Property price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
            <input
              type="number"
              value={state.housePrice || ''}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
              placeholder="400,000"
              min={0}
            />
          </div>
        </div>

        {/* Deposit */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-[#2a2520] flex items-center gap-1">
              Deposit
              <Tooltip content="Your deposit is the amount you pay upfront. The rest is borrowed as a mortgage. A larger deposit = lower LTV = better rates." />
            </label>
            <div className="flex text-xs bg-[#f9f7f4] rounded-lg overflow-hidden border border-[#e8e3dc]">
              <button
                type="button"
                onClick={() => setDepositMode('amount')}
                className={`px-3 py-1 transition-colors ${depositMode === 'amount' ? 'bg-[#4a7c96] text-white' : 'text-[#6b7a8a] hover:text-[#4a7c96]'}`}
              >
                {sym} Amount
              </button>
              <button
                type="button"
                onClick={() => setDepositMode('percent')}
                className={`px-3 py-1 transition-colors ${depositMode === 'percent' ? 'bg-[#4a7c96] text-white' : 'text-[#6b7a8a] hover:text-[#4a7c96]'}`}
              >
                % Percent
              </button>
            </div>
          </div>

          {depositMode === 'amount' ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
              <input
                type="number"
                value={state.deposit || ''}
                onChange={(e) => handleDepositAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
                placeholder="80,000"
                min={0}
                max={state.housePrice}
              />
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                value={depositPct.toFixed(1)}
                onChange={(e) => handleDepositPercent(Number(e.target.value))}
                className="w-full pl-4 pr-8 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
                placeholder="20"
                min={0}
                max={100}
                step={0.5}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">%</span>
            </div>
          )}

          {/* LTV indicator */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#6b7a8a]">
              Loan: {sym}{loanAmount.toLocaleString()} at <span className="font-semibold text-[#2a2520]">{(ltv * 100).toFixed(1)}% LTV</span>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              ltv <= 0.6 ? 'bg-green-50 text-green-700' :
              ltv <= 0.8 ? 'bg-sky-50 text-sky-700' :
              ltv <= 0.9 ? 'bg-amber-50 text-amber-700' :
              'bg-red-50 text-red-600'
            }`}>
              {ltvBand.label} — {ltvBand.description}
            </span>
          </div>
        </div>

        {/* Other fees */}
        <div>
          <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
            Other fees (legal, surveyor, broker)
            <Tooltip content="These are the upfront costs beyond the deposit: solicitor fees (~€2–3k in Ireland), surveyor/valuation (~€500), broker fees (if applicable). Some lenders let you roll these into the mortgage." />
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
            <input
              type="number"
              value={state.otherFees || ''}
              onChange={(e) => onChange({ otherFees: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
              placeholder="5,000"
              min={0}
            />
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={state.otherFeesCoveredByDebt}
              onChange={(e) => onChange({ otherFeesCoveredByDebt: e.target.checked })}
              className="rounded border-[#e8e3dc] bg-[#f9f7f4] accent-[#4a7c96]"
            />
            <span className="text-xs text-[#6b7a8a]">Roll these fees into the mortgage</span>
          </label>
        </div>

        {/* Purchase date */}
        <div>
          <label className="block text-sm font-medium text-[#2a2520] mb-1.5">
            Planned purchase date
          </label>
          <input
            type="month"
            value={state.purchaseDate}
            onChange={(e) => onChange({ purchaseDate: e.target.value })}
            className="w-full px-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] focus:outline-none focus:border-[#4a7c96] transition-colors"
          />
        </div>

        {/* Stamp duty preview */}
        <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#6b7a8a] uppercase tracking-wide mb-1">
            Estimated stamp duty
          </p>
          <p className="text-lg font-bold text-[#2a2520]">
            {sym}{market.stampDuty(state.housePrice, state.buyerType).toLocaleString()}
          </p>
          <p className="text-xs text-[#6b7a8a] mt-0.5">
            Based on {market.name} rates for your buyer type — not included in mortgage calculation
          </p>
        </div>
      </div>
    </div>
  );
}
