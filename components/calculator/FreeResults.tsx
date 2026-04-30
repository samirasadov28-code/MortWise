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

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function FreeResults({ results, state, onUnlocked }: FreeResultsProps) {
  if (results.length === 0) return null;

  // Show best result (lowest total cost)
  const best = [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0];
  const market = MARKETS[state.market];
  const sym = market.currencySymbol;

  // Year 1 totals (first 12 months of payments)
  const year1Periods = best.periods.slice(0, 12);
  const year1Cost = year1Periods.reduce((s, p) => s + p.totalPayment, 0);

  // Payment composition: principal repaid = loanAmount, interest = totalInterestPaid
  // This always sums cleanly to 100%, regardless of holidays/grace periods.
  const totalCost = best.loanAmount + best.totalInterestPaid;
  const principalPct = totalCost > 0 ? clamp01(best.loanAmount / totalCost) : 0;
  const interestPct = clamp01(1 - principalPct);

  const stampDuty = market.stampDuty(state.housePrice, {
    buyerType: state.buyerType,
    propertyType: state.propertyType,
  });
  const eligibleSchemes = market.govtSchemes.filter(() => state.buyerType === 'first_time');

  // Affordability check
  const totalIncome = state.annualIncome + state.coBorrowerIncome;
  const maxBorrow = market.maxIncomeMultiple ? totalIncome * market.maxIncomeMultiple : null;
  const requestedLoan = state.housePrice - state.deposit;
  const withinLimit = maxBorrow !== null && requestedLoan <= maxBorrow;

  return (
    <div className="space-y-6">
      {/* Hero result */}
      <div className="bg-white border border-[#4a7c96]/30 rounded-xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[#6b7a8a] text-sm mb-1">Best scenario — {best.lenderName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#2a2520]">
                {formatCurrency(best.firstMonthlyPayment, state.market)}
              </span>
              <span className="text-[#6b7a8a] text-sm sm:text-base">/ month</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6b7a8a] mb-1">Rate structure</p>
            <p className="text-sm font-semibold text-[#2a2520] capitalize">{state.rateStructure.replace('_', ' ')}</p>
            <p className="text-xs text-[#6b7a8a] mt-0.5">{state.mortgageTerm} year term</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#6b7a8a]">
          LTV: {formatPercent(state.housePrice > 0 ? (state.housePrice - state.deposit) / state.housePrice : 0)} — Loan: {formatCurrency(best.loanAmount, state.market)}
        </p>
      </div>

      {/* Cost summary - 3 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Annual cost (year 1)"
          value={formatCurrency(year1Cost, state.market)}
          tooltip="What you'll pay in mortgage repayments during the first 12 months."
        />
        <StatCard
          label="Total interest"
          value={formatCurrency(best.totalInterestPaid, state.market)}
          tooltip="The total interest you'll pay over the entire life of the loan, assuming no overpayments."
        />
        <StatCard
          label="Total cost of loan"
          value={formatCurrency(totalCost, state.market)}
          tooltip="Loan amount + total interest. The full amount you'll repay over the term."
        />
      </div>

      {/* Affordability check */}
      {totalIncome > 0 && maxBorrow !== null && (
        <div className={`rounded-xl p-5 border ${
          withinLimit
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="text-sm font-semibold text-[#2a2520] mb-2 flex items-center gap-1">
            Affordability check — {market.name}
            <Tooltip content="Most lenders apply a cap on how much you can borrow as a multiple of your gross annual income. This shows whether your requested loan fits within that cap." />
          </h3>
          <p className="text-sm text-[#2a2520]">
            <span className={`font-semibold ${withinLimit ? 'text-green-700' : 'text-red-600'}`}>
              {withinLimit ? '✓ Within typical limits' : '⚠ Exceeds typical limit'}
            </span>
            <span className="text-[#6b7a8a] ml-2">
              ({market.maxIncomeMultiple}× income of {formatCurrency(totalIncome, state.market)} = {formatCurrency(maxBorrow, state.market)})
            </span>
          </p>
          <p className="text-xs text-[#6b7a8a] mt-1">
            Your requested loan: {formatCurrency(requestedLoan, state.market)}
          </p>
        </div>
      )}

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
            className="bg-[#c9956a] flex items-center justify-center text-xs text-white font-medium transition-all"
            style={{ width: `${interestPct * 100}%` }}
          >
            {interestPct > 0.15 && `${(interestPct * 100).toFixed(0)}% interest`}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#6b7a8a]">
          <span>Principal: {formatCurrency(best.loanAmount, state.market)}</span>
          <span>Interest: {formatCurrency(best.totalInterestPaid, state.market)}</span>
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
          Based on {formatCurrency(state.housePrice, state.market)} property — paid separately, not in mortgage
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
                    up to {formatCurrency(maxAmt, state.market)}
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

function StatCard({ label, value, tooltip }: { label: string; value: string; tooltip: string }) {
  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-4">
      <p className="text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
        {label}
        <Tooltip content={tooltip} />
      </p>
      <p className="text-lg sm:text-xl font-bold text-[#2a2520]">{value}</p>
    </div>
  );
}
