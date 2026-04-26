'use client';

import type { ScenarioResult, WizardState } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import UpgradeWall from '@/components/shared/UpgradeWall';
import Tooltip from '@/components/shared/Tooltip';

interface FreeResultsProps {
  results: ScenarioResult[];
  state: WizardState;
  onUnlocked: () => void;
}

export default function FreeResults({ results, state, onUnlocked }: FreeResultsProps) {
  if (results.length === 0) return null;

  // Show best result (lowest total cost)
  const best = [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0];
  const market = MARKETS[state.market];
  const sym = market.currencySymbol;

  const avgInterestPerMonth = best.periods.length > 0
    ? best.periods.reduce((s, p) => s + p.interest, 0) / best.periods.length
    : 0;
  const avgPrincipalPerMonth = best.periods.length > 0
    ? best.periods.reduce((s, p) => s + p.principalRepayment, 0) / best.periods.length
    : 0;

  const totalPaid = best.totalAmountPaid;
  const totalInterest = best.totalInterestPaid;
  const interestPct = totalPaid > 0 ? totalInterest / totalPaid : 0;
  const principalPct = 1 - interestPct;

  const stampDuty = market.stampDuty(state.housePrice, state.buyerType);
  const eligibleSchemes = market.govtSchemes.filter(() => state.buyerType === 'first_time');

  return (
    <div className="space-y-8">
      {/* Hero result */}
      <div className="bg-white border border-[#4a7c96]/30 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[#6b7a8a] text-sm mb-1">Best scenario — {best.lenderName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#2a2520]">
                {formatCurrency(best.firstMonthlyPayment, state.market)}
              </span>
              <span className="text-[#6b7a8a]">/ month</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6b7a8a] mb-1">Rate structure</p>
            <p className="text-sm font-semibold text-[#2a2520] capitalize">{state.rateStructure.replace('_', ' ')}</p>
            <p className="text-xs text-[#6b7a8a] mt-0.5">{state.mortgageTerm} year term</p>
          </div>
        </div>

        <p className="text-sm text-[#6b7a8a]">
          Average breakdown:{' '}
          <span className="text-[#2a2520] font-medium">{formatCurrency(avgPrincipalPerMonth, state.market)}</span> principal
          {' '}+{' '}
          <span className="text-[#2a2520] font-medium">{formatCurrency(avgInterestPerMonth, state.market)}</span> interest per month
        </p>

        <p className="text-xs text-[#6b7a8a] mt-1">
          LTV: {formatPercent(state.housePrice > 0 ? (state.housePrice - state.deposit) / state.housePrice : 0)} —
          Loan: {formatCurrency(best.loanAmount, state.market)}
        </p>
      </div>

      {/* Interest vs Principal bar */}
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#2a2520] mb-3 flex items-center gap-1">
          Payment composition
          <Tooltip content="Of every euro you pay over the life of the mortgage, this shows how much goes to interest (the cost of borrowing) vs principal (reducing what you owe)." />
        </h3>
        <div className="h-8 rounded-lg overflow-hidden flex">
          <div
            className="bg-[#4a7c96] flex items-center justify-center text-xs text-white font-medium transition-all"
            style={{ width: `${principalPct * 100}%` }}
          >
            {principalPct > 0.15 && `${(principalPct * 100).toFixed(0)}% principal`}
          </div>
          <div
            className="bg-red-400 flex items-center justify-center text-xs text-[#2a2520] font-medium transition-all"
            style={{ width: `${interestPct * 100}%` }}
          >
            {interestPct > 0.15 && `${(interestPct * 100).toFixed(0)}% interest`}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#6b7a8a]">
          <span>Principal: {formatCurrency(best.loanAmount, state.market)}</span>
          <span className="text-red-600">Interest: locked behind upgrade</span>
        </div>
      </div>

      {/* Stamp duty */}
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#2a2520] mb-3 flex items-center gap-1">
          Stamp duty — {market.name}
          <Tooltip content="Stamp duty (or land transfer tax) is a one-off tax paid to the government when you buy a property. It varies by country, price, and buyer type." />
        </h3>
        <p className="text-2xl font-bold text-[#2a2520]">{formatCurrency(stampDuty, state.market)}</p>
        <p className="text-xs text-[#6b7a8a] mt-1">
          Based on {sym}{state.housePrice.toLocaleString()} property — paid separately, not in mortgage
        </p>
      </div>

      {/* Government schemes */}
      {eligibleSchemes.length > 0 && (
        <div className="bg-white border border-green-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#2a2520] mb-3">Government scheme eligibility</h3>
          <div className="space-y-3">
            {eligibleSchemes.map((scheme) => {
              const maxAmt = typeof scheme.maxAmount === 'function'
                ? scheme.maxAmount(state.housePrice)
                : scheme.maxAmount;
              return (
                <div key={scheme.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-700 text-sm">✓</span>
                    <div>
                      <span className="text-sm font-medium text-[#2a2520]">{scheme.name}</span>
                      <p className="text-xs text-[#6b7a8a]">{scheme.eligibility}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-700 flex-shrink-0">
                    up to {sym}{maxAmt.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade wall */}
      <UpgradeWall onUnlocked={onUnlocked} />
    </div>
  );
}
