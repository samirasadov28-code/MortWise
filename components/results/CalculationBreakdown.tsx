'use client';

import type { ScenarioResult, WizardState, MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrencyIn, formatPercent } from '@/lib/formatting';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries/en';

interface CalculationBreakdownProps {
  results: ScenarioResult[];
  state: WizardState;
  /** Currency to render every monetary value in. Defaults to local market. */
  displayMarket?: MarketCode;
}

const BUYER_KEY: Record<string, TranslationKey> = {
  first_time: 'step3.firstTime',
  mover: 'step3.mover',
  investor: 'step3.investor',
  non_resident: 'step3.nonResident',
};

/**
 * Step-by-step explainer of how MortWise turns the user's inputs into the
 * headline monthly payment and total cost — including how government schemes,
 * stamp duty and rolled fees are folded in. Designed to be readable for
 * non-finance users so they can sanity-check (and trust) the numbers.
 */
export default function CalculationBreakdown({ results, state, displayMarket }: CalculationBreakdownProps) {
  const { t } = useTranslation();
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
        <h3 className="text-base font-semibold text-[#2a2520] mb-1">{t('calc.title')}</h3>
        <p className="text-xs text-[#6b7a8a]">
          {t('calc.intro', { lender: best.lenderName })}
        </p>
      </div>

      {/* Loan amount build-up */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          {t('calc.section1')}
        </h4>
        <div className="text-sm space-y-1.5 font-mono">
          <Line label={t('calc.propertyPrice')} value={fmt(state.housePrice)} />
          <Line label={t('calc.cashDeposit')} value={`− ${fmt(state.deposit)}`} dim />
          <Line label={t('calc.loanBeforeAdj')} value={fmt(state.housePrice - state.deposit)} sub />
          {rolledFees > 0 && (
            <Line label={t('calc.rolledFees', { amount: fmt(state.otherFees) })} value={`+ ${fmt(rolledFees)}`} dim />
          )}
          {schemeSupport > 0 && (
            <Line
              label={t('calc.govtSchemeLine', { name: state.selectedGovtSchemeName ?? t('calc.support') })}
              value={`− ${fmt(schemeSupport)}`}
              dim
              highlight="green"
            />
          )}
          <Line label={t('calc.netLoan')} value={fmt(netLoan)} bold />
        </div>
        {schemeSupport > 0 && (
          <p className="text-xs text-green-700 mt-2 leading-relaxed">
            {t('calc.schemeNote', {
              name: state.selectedGovtSchemeName ?? t('calc.selectedFallback'),
              amt: fmt(schemeSupport),
            })}
          </p>
        )}
      </section>

      {/* Monthly payment formula */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          {t('calc.section2')}
        </h4>
        <p className="text-xs text-[#6b7a8a] mb-2">
          {t('calc.annuityFormula')}{' '}
          <code className="bg-[#f9f7f4] px-1.5 py-0.5 rounded">
            P × r / (1 − (1 + r)<sup>−n</sup>)
          </code>{' '}
          {t('calc.annuityCaption')}
        </p>
        <div className="text-sm space-y-1.5 font-mono">
          <Line label={t('calc.principal')} value={fmt(netLoan)} />
          <Line
            label={t('calc.monthlyRate')}
            value={t('calc.monthlyRateValue', {
              rate: (monthlyRate * 100).toFixed(4),
              annual: formatPercent(rateForDisplay ?? 0, 2),
            })}
          />
          <Line label={t('calc.months')} value={t('calc.monthsValue', { months: totalMonths, years: state.mortgageTerm })} />
          <Line label={t('calc.firstMonthlyArrow')} value={fmt(best.firstMonthlyPayment)} bold />
        </div>
      </section>

      {/* Total cost */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          {t('calc.section3')}
        </h4>
        <div className="text-sm space-y-1.5 font-mono">
          <Line label={t('calc.totalPayments')} value={fmt(best.totalAmountPaid)} />
          <Line label={t('calc.minusPrincipal')} value={`− ${fmt(netLoan)}`} dim />
          <Line label={t('calc.totalInterestEq')} value={fmt(best.totalInterestPaid)} bold />
          {best.cashbackReceived > 0 && (
            <Line
              label={t('calc.minusCashback')}
              value={`− ${fmt(best.cashbackReceived)}`}
              dim
              highlight="green"
            />
          )}
          <Line label={t('calc.netTotalEq')} value={fmt(totalCost - best.cashbackReceived)} bold />
        </div>
      </section>

      {/* Cash at closing — separate from the mortgage */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          {t('calc.section4')}
        </h4>
        <div className="text-sm space-y-1.5 font-mono">
          <Line label={t('calc.deposit')} value={fmt(state.deposit)} />
          <Line
            label={t('calc.stampDutyLine', {
              property: state.propertyType === 'new_build' ? t('step2.newBuild').toLowerCase() : t('step2.secondaryMarket').toLowerCase(),
              buyer: t(BUYER_KEY[state.buyerType] ?? 'step3.firstTime').toLowerCase(),
            })}
            value={`+ ${fmt(stampDuty)}`}
            dim
          />
          {upfrontFees > 0 && (
            <Line label={t('calc.upfrontFees')} value={`+ ${fmt(upfrontFees)}`} dim />
          )}
          <Line label={t('calc.totalCash')} value={fmt(cashAtClosing)} bold />
        </div>
      </section>

      <p className="text-[11px] text-[#6b7a8a]/70 leading-relaxed">
        {t('calc.disclaimer')}
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
