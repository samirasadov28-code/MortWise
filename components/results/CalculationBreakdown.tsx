'use client';

import type { ScenarioResult, WizardState, MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrencyIn, formatPercent } from '@/lib/formatting';

interface CalculationBreakdownProps {
  results: ScenarioResult[];
  state: WizardState;
  /** Currency to render every monetary value in. Defaults to local market. */
  displayMarket?: MarketCode;
}

/**
 * Step-by-step explainer of how MortWise turns the user's inputs into the
 * headline monthly payment and total cost — including how government schemes,
 * stamp duty and rolled fees are folded in. Designed to be readable for
 * non-finance users so they can sanity-check (and trust) the numbers.
 */
export default function CalculationBreakdown({ results, state, displayMarket }: CalculationBreakdownProps) {
  if (results.length === 0) return null;
  const best = [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0];
  const market = MARKETS[state.market];
  const dm: MarketCode = displayMarket ?? state.market;
  const fmt = (v: number) => formatCurrencyIn(v, state.market, dm);

  const rolledFees = state.otherFeesCoveredByDebt ? state.otherFees : 0;
  const upfrontFees = state.otherFeesCoveredByDebt ? 0 : state.otherFees;
  const schemeSupport = state.govtSchemeEnabled ? state.govtSupportAmount : 0;
  const netLoan = best.loanAmount;
  const totalMonths = state.mortgageTerm * 12;

  const stampDuty = market.stampDuty(state.housePrice, {
    buyerType: state.buyerType,
    propertyType: state.propertyType,
  });

  const cashAtClosing = state.deposit + stampDuty + upfrontFees;
  const totalCost = netLoan + best.totalInterestPaid;

  // Headline rate used to seed the calc — for the "best" scenario the engine
  // ran the full schedule, so we just report what it actually used.
  const rateForDisplay = (() => {
    const inp = state.scenarios.find((s) => s.lenderName === best.lenderName);
    if (!inp) return undefined;
    if (inp.rateStructure === 'fixed' && inp.fixedRate) return inp.fixedRate;
    if (inp.rateStructure === 'tracker' && (inp.trackerBaseRate !== undefined || inp.trackerMargin !== undefined)) {
      return (inp.trackerBaseRate ?? 0) + (inp.trackerMargin ?? 0);
    }
    return inp.variableRate;
  })();
  const monthlyRate = (rateForDisplay ?? 0) / 12;

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-[#2a2520] mb-1">How we calculated this</h3>
        <p className="text-xs text-[#6b7a8a]">
          Showing the math behind your best scenario ({best.lenderName}). Every figure
          below ties back to the inputs you entered in steps 1–5.
        </p>
      </div>

      {/* Loan amount build-up */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          1 · Loan amount build-up
        </h4>
        <div className="text-sm space-y-1.5 font-mono">
          <Line label="Property price" value={fmt(state.housePrice)} />
          <Line label="Cash deposit" value={`− ${fmt(state.deposit)}`} dim />
          <Line label="Loan before adjustments" value={fmt(state.housePrice - state.deposit)} sub />
          {rolledFees > 0 && (
            <Line label={`+ Other fees rolled into loan (${fmt(state.otherFees)})`} value={`+ ${fmt(rolledFees)}`} dim />
          )}
          {schemeSupport > 0 && (
            <Line
              label={`− Government scheme: ${state.selectedGovtSchemeName ?? 'support'}`}
              value={`− ${fmt(schemeSupport)}`}
              dim
              highlight="green"
            />
          )}
          <Line label="Net loan amount drawn" value={fmt(netLoan)} bold />
        </div>
        {schemeSupport > 0 && (
          <p className="text-xs text-green-700 mt-2 leading-relaxed">
            The {state.selectedGovtSchemeName ?? 'selected'} scheme reduces the principal you borrow by{' '}
            {fmt(schemeSupport)}, lowering both the monthly payment and the total
            interest you pay over the life of the loan.
          </p>
        )}
      </section>

      {/* Monthly payment formula */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          2 · Monthly payment
        </h4>
        <p className="text-xs text-[#6b7a8a] mb-2">
          Annuity formula:{' '}
          <code className="bg-[#f9f7f4] px-1.5 py-0.5 rounded">
            P × r / (1 − (1 + r)<sup>−n</sup>)
          </code>{' '}
          — same monthly payment over the term, principal share growing as interest share shrinks.
        </p>
        <div className="text-sm space-y-1.5 font-mono">
          <Line label="P · principal" value={fmt(netLoan)} />
          <Line
            label="r · monthly rate"
            value={`${(monthlyRate * 100).toFixed(4)}% (annual ${formatPercent(rateForDisplay ?? 0, 2)} ÷ 12)`}
          />
          <Line label="n · months" value={`${totalMonths} (${state.mortgageTerm} yrs × 12)`} />
          <Line label="→ first monthly payment" value={fmt(best.firstMonthlyPayment)} bold />
        </div>
      </section>

      {/* Total cost */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          3 · Totals over the loan life
        </h4>
        <div className="text-sm space-y-1.5 font-mono">
          <Line label="Total payments (sum of all months)" value={fmt(best.totalAmountPaid)} />
          <Line label="− Loan principal" value={`− ${fmt(netLoan)}`} dim />
          <Line label="= Total interest paid" value={fmt(best.totalInterestPaid)} bold />
          {best.cashbackReceived > 0 && (
            <Line
              label="− Cashback received from lender"
              value={`− ${fmt(best.cashbackReceived)}`}
              dim
              highlight="green"
            />
          )}
          <Line label="= Net total loan payments" value={fmt(totalCost - best.cashbackReceived)} bold />
        </div>
      </section>

      {/* Cash at closing — separate from the mortgage */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          4 · Cash needed at closing (separate from the loan)
        </h4>
        <div className="text-sm space-y-1.5 font-mono">
          <Line label="Deposit" value={fmt(state.deposit)} />
          <Line
            label={`Stamp duty (${state.propertyType === 'new_build' ? 'new build' : 'secondary'}, ${state.buyerType.replace('_', ' ')})`}
            value={`+ ${fmt(stampDuty)}`}
            dim
          />
          {upfrontFees > 0 && (
            <Line label="Other upfront fees (legal/surveyor/broker)" value={`+ ${fmt(upfrontFees)}`} dim />
          )}
          <Line label="Total cash at closing" value={fmt(cashAtClosing)} bold />
        </div>
      </section>

      <p className="text-[11px] text-[#6b7a8a]/70 leading-relaxed">
        Stamp duty is paid separately at purchase; it&rsquo;s never funded by the
        mortgage. Total cash at closing is what you must have available — deposit +
        stamp duty + (unrolled) fees.
      </p>
    </div>
  );
}

function Line({
  label, value, sub, bold, dim, highlight,
}: {
  label: string;
  value: string;
  sub?: boolean;
  bold?: boolean;
  dim?: boolean;
  highlight?: 'green';
}) {
  const labelClass = dim ? 'text-[#6b7a8a]' : 'text-[#2a2520]';
  const valueClass = `${bold ? 'font-bold text-[#2a2520]' : ''} ${highlight === 'green' ? 'text-green-700' : ''}`.trim();
  return (
    <div className={`flex items-center justify-between ${sub ? 'border-t border-[#e8e3dc]/60 pt-1.5 mt-0.5' : ''}`}>
      <span className={labelClass}>{label}</span>
      <span className={valueClass || 'text-[#2a2520]'}>{value}</span>
    </div>
  );
}
