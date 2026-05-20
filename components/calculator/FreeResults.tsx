'use client';

import type { ScenarioResult, WizardState, MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrencyIn, formatPercent } from '@/lib/formatting';
import UpgradeWall from '@/components/shared/UpgradeWall';
import Tooltip from '@/components/shared/Tooltip';
import CalculationBreakdown from '@/components/results/CalculationBreakdown';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface FreeResultsProps {
  results: ScenarioResult[];
  state: WizardState;
  onUnlocked: () => void;
  /** Suppress the upgrade CTA when a full-access user is "viewing as free". */
  hideUpgradeWall?: boolean;
  /** Currency to render every monetary value in. Defaults to local market. */
  displayMarket?: MarketCode;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function FreeResults({ results, state, onUnlocked, hideUpgradeWall, displayMarket }: FreeResultsProps) {
  const { t } = useTranslation();
  const dm: MarketCode = displayMarket ?? state.market;
  const fmt = (v: number) => formatCurrencyIn(v, state.market, dm);
  if (results.length === 0) return null;

  // Show best result (lowest total cost)
  const best = [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0];
  const market = MARKETS[state.market];

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
            <p className="text-[#6b7a8a] text-sm mb-1">{t('free.bestScenario')} — {best.lenderName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#2a2520]">
                {fmt(best.firstMonthlyPayment)}
              </span>
              <span className="text-[#6b7a8a] text-sm sm:text-base">/ {t('free.perMonth')}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6b7a8a] mb-1">{t('free.rateStructure')}</p>
            <p className="text-sm font-semibold text-[#2a2520] capitalize">{state.rateStructure.replace('_', ' ')}</p>
            <p className="text-xs text-[#6b7a8a] mt-0.5">{t('free.yearTerm', { years: state.mortgageTerm })}</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#6b7a8a]">
          LTV: {formatPercent(state.housePrice > 0 ? (state.housePrice - state.deposit) / state.housePrice : 0)} — {t('free.loan')}: {fmt(best.loanAmount)}
        </p>
      </div>

      {/* Cost summary - 3 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label={t('free.annualCost')}
          value={fmt(year1Cost)}
          tooltip={t('free.annualCostTooltip')}
        />
        <StatCard
          label={t('free.totalInterest')}
          value={fmt(best.totalInterestPaid)}
          tooltip={t('free.totalInterestTooltip')}
        />
        <StatCard
          label={t('free.totalPayments')}
          value={fmt(totalCost)}
          tooltip={t('free.totalPaymentsTooltip')}
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
            {t('free.affordabilityCheck')} — {market.name}
            <Tooltip content={t('free.affordabilityCheckTooltip')} />
          </h3>
          <p className="text-sm text-[#2a2520]">
            <span className={`font-semibold ${withinLimit ? 'text-green-700' : 'text-red-600'}`}>
              {withinLimit ? `✓ ${t('free.withinLimits')}` : `⚠ ${t('free.exceedsLimit')}`}
            </span>
            <span className="text-[#6b7a8a] ml-2">
              ({market.maxIncomeMultiple}× {t('step3.incomeOf')} {fmt(totalIncome)} = {fmt(maxBorrow)})
            </span>
          </p>
          <p className="text-xs text-[#6b7a8a] mt-1">
            {t('free.requestedLoan')}: {fmt(requestedLoan)}
          </p>
        </div>
      )}

      {/* Interest vs Principal bar */}
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#2a2520] mb-3 flex items-center gap-1">
          {t('free.paymentComposition')}
          <Tooltip content={t('free.paymentCompositionTooltip')} />
        </h3>
        <div className="h-8 rounded-lg overflow-hidden flex">
          <div
            className="bg-[#4a7c96] flex items-center justify-center text-xs text-white font-medium transition-all"
            style={{ width: `${principalPct * 100}%` }}
          >
            {principalPct > 0.15 && `${(principalPct * 100).toFixed(0)}% ${t('repayment.principal').toLowerCase()}`}
          </div>
          <div
            className="bg-[#c9956a] flex items-center justify-center text-xs text-white font-medium transition-all"
            style={{ width: `${interestPct * 100}%` }}
          >
            {interestPct > 0.15 && `${(interestPct * 100).toFixed(0)}% ${t('repayment.interest').toLowerCase()}`}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#6b7a8a]">
          <span>{t('repayment.principal')}: {fmt(best.loanAmount)}</span>
          <span>{t('repayment.interest')}: {fmt(best.totalInterestPaid)}</span>
        </div>
      </div>

      {/* Stamp duty */}
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#2a2520] mb-3 flex items-center gap-1">
          {t('free.stampDuty')} — {market.name}
          <Tooltip content={t('free.stampDutyTooltip')} />
        </h3>
        <p className="text-2xl font-bold text-[#2a2520]">{fmt(stampDuty)}</p>
        <p className="text-xs text-[#6b7a8a] mt-1">
          {t('free.stampDutyFootnote', { price: fmt(state.housePrice) })}
        </p>
      </div>

      {/* Government schemes */}
      {eligibleSchemes.length > 0 && (
        <div className="bg-white border border-green-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#2a2520] mb-3">{t('free.govtSchemeEligibility')}</h3>
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
                    {t('step3.upTo')} {fmt(maxAmt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calculation breakdown — show the math so users can see exactly how
          the loan amount, monthly payment, schemes and stamp duty fit together. */}
      <CalculationBreakdown results={results} state={state} displayMarket={dm} />

      {/* Upgrade wall — hidden when a full-access user is viewing the free view */}
      {!hideUpgradeWall && <UpgradeWall onUnlocked={onUnlocked} />}
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
