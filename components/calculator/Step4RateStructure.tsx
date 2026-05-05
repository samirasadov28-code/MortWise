'use client';

import type { WizardState, RateStructure, MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { convertCurrency } from '@/lib/fx';
import { formatCurrency } from '@/lib/formatting';
import Tooltip from '@/components/shared/Tooltip';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';

interface Step4Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const RATE_STRUCTURES: Array<{
  value: RateStructure;
  label: string;
  tagline: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'fixed',
    label: 'Fixed rate',
    tagline: 'Certainty and predictability',
    description: 'Pay the same rate for a set period, then revert to your lender\'s variable rate. Ideal if you want to know exactly what you\'ll pay each month and want protection against rate rises.',
    icon: '🔒',
  },
  {
    value: 'variable',
    label: 'Variable / tracker',
    tagline: 'Moves with the market',
    description: 'Your rate tracks the central bank base rate plus a fixed margin. You benefit when rates fall, but payments rise when rates increase. Often starts lower than fixed rates.',
    icon: '📈',
  },
  {
    value: 'split',
    label: 'Split rate',
    tagline: 'Blend stability with flexibility',
    description: 'Part of your mortgage is fixed, part tracks the market. You balance rate certainty on one portion with potential savings on the other. Popular in Ireland with ECB tracker mortgages.',
    icon: '⚖️',
  },
  {
    value: 'tracker',
    label: 'Pure tracker',
    tagline: 'ECB / BoE rate + margin',
    description: 'Tracks a central bank rate (e.g. ECB or Bank of England base rate) plus a fixed margin for the full term. Transparent and directly linked to monetary policy decisions.',
    icon: '🎯',
  },
];

export default function Step4RateStructure({ state, onChange }: Step4Props) {
  const selected = state.rateStructure;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2a2520] mb-1">Rate structure</h2>
      <p className="text-[#6b7a8a] text-sm mb-6">
        Choose the type of interest rate arrangement for your mortgage scenarios.
      </p>

      <div className="space-y-3 mb-6">
        {RATE_STRUCTURES.map((rs) => (
          <button
            key={rs.value}
            type="button"
            onClick={() => onChange({ rateStructure: rs.value })}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected === rs.value
                ? 'border-[#4a7c96] bg-[#4a7c96]/10'
                : 'border-[#e8e3dc] bg-[#eef4f7]/60 hover:border-[#4a7c96]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{rs.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2a2520]">{rs.label}</span>
                  <span className="text-xs text-[#6b7a8a]">— {rs.tagline}</span>
                </div>
                {selected === rs.value && (
                  <p className="text-sm text-[#6b7a8a] mt-1">{rs.description}</p>
                )}
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === rs.value ? 'border-[#4a7c96] bg-[#4a7c96]' : 'border-[#e8e3dc]'
                }`}>
                  {selected === rs.value && <span className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Split rate slider */}
      {selected === 'split' && (
        <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-xl p-4">
          <label className="block text-sm font-medium text-[#2a2520] mb-3 flex items-center gap-1">
            Fixed / Tracker split
            <Tooltip content="The proportion of your mortgage at a fixed rate vs a tracker rate. E.g. 70% fixed means 70% of the loan amount pays the fixed rate, while 30% tracks the ECB rate + margin." />
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={Math.round(state.splitFixedProportion * 100)}
              onChange={(e) => onChange({ splitFixedProportion: Number(e.target.value) / 100 })}
              className="w-full accent-[#4a7c96]"
            />
            <div className="flex justify-between text-sm">
              <span className="text-[#2a2520] font-medium">
                {Math.round(state.splitFixedProportion * 100)}% Fixed
              </span>
              <span className="text-[#6b7a8a]">
                {100 - Math.round(state.splitFixedProportion * 100)}% Tracker
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mortgage term */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
          Mortgage term
          <Tooltip content="The total number of years you take to repay the mortgage. Longer terms = lower monthly payments but much more interest paid overall." />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={40}
            step={1}
            value={state.mortgageTerm}
            onChange={(e) => onChange({ mortgageTerm: Number(e.target.value) })}
            className="flex-1 accent-[#4a7c96]"
          />
          <div className="flex-shrink-0 w-24">
            <div className="relative">
              <input
                type="number"
                value={state.mortgageTerm}
                onChange={(e) => onChange({ mortgageTerm: Math.min(40, Math.max(5, Number(e.target.value))) })}
                className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-center focus:outline-none focus:border-[#4a7c96] transition-colors"
                min={5}
                max={40}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b7a8a]">yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cashback */}
      {(() => {
        const displayMarket: MarketCode = state.displayCurrencyMarket ?? state.market;
        const sym = MARKETS[displayMarket].currencySymbol;
        const isLocal = displayMarket === state.market;
        const localToDisplay = convertCurrency(1, state.market, displayMarket);
        const displayToLocal = convertCurrency(1, displayMarket, state.market);
        const cashbackDisplay = Math.round(state.wizardCashbackAmount * localToDisplay);
        const requestedLoan = Math.max(0, state.housePrice - state.deposit);
        const impliedPct = requestedLoan > 0 ? state.wizardCashbackAmount / requestedLoan : 0;
        return (
          <div className="mt-5">
            <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
              Lender cashback
              <Tooltip content="A one-off amount the lender pays you at drawdown — typical in Ireland (~1–3% of the loan) and rare elsewhere. Netted against your total loan payments. Most lenders claw it back if you switch within the clawback window." />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#6b7a8a] mb-1">Cashback amount</p>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
                  <FormattedNumberInput
                    value={cashbackDisplay}
                    onValueChange={(v) => onChange({ wizardCashbackAmount: Math.round(v * displayToLocal) })}
                    min={0}
                    placeholder="0"
                    className="w-full pl-4 pr-14 py-2.5 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
                  />
                </div>
                {!isLocal && state.wizardCashbackAmount > 0 && (
                  <p className="text-[11px] text-[#6b7a8a] mt-1">
                    ≈ {formatCurrency(state.wizardCashbackAmount, state.market)} in local currency
                  </p>
                )}
                {state.wizardCashbackAmount > 0 && requestedLoan > 0 && (
                  <p className="text-[11px] text-[#6b7a8a] mt-1">
                    {(impliedPct * 100).toFixed(2)}% of the loan amount
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-[#6b7a8a] mb-1">Clawback period (years)</p>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={state.wizardCashbackClawbackYears}
                  onChange={(e) => onChange({ wizardCashbackClawbackYears: Math.min(10, Math.max(0, Number(e.target.value))) })}
                  className="w-full px-4 py-2.5 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] focus:outline-none focus:border-[#4a7c96] transition-colors"
                />
                <p className="text-[11px] text-[#6b7a8a] mt-1">
                  Years the lender can claw back the cashback if you switch.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Payment holiday */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
          Payment holiday
          <Tooltip content="Months at the start of the loan with zero payments. Interest still accrues and is capitalised onto the balance — useful for self-build or job-transition periods." />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={24}
            step={1}
            value={state.paymentHolidayMonths}
            onChange={(e) => onChange({ paymentHolidayMonths: Number(e.target.value) })}
            className="flex-1 accent-[#4a7c96]"
          />
          <div className="flex-shrink-0 w-24">
            <div className="relative">
              <input
                type="number"
                value={state.paymentHolidayMonths}
                onChange={(e) => onChange({ paymentHolidayMonths: Math.min(24, Math.max(0, Number(e.target.value))) })}
                className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-center focus:outline-none focus:border-[#4a7c96] transition-colors"
                min={0}
                max={24}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b7a8a]">mo</span>
            </div>
          </div>
        </div>
        {state.paymentHolidayMonths > 0 && (
          <p className="text-xs text-amber-700 mt-2">
            Interest accrues during the holiday and is added to the loan balance — your monthly
            payment after the holiday will be higher to compensate.
          </p>
        )}
      </div>
    </div>
  );
}
