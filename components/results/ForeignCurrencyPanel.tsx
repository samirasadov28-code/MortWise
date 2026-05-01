'use client';

import { useMemo, useState } from 'react';
import type { MarketCode, ScenarioInput, WizardState } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { getLenders } from '@/lib/lenders';
import { runAmortisation } from '@/lib/engine/amortisation';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import { convertCurrency, COMPARISON_CURRENCIES } from '@/lib/fx';

interface ForeignCurrencyPanelProps {
  state: WizardState;
}

/**
 * "What if I borrow in a different currency?" — common for non-residents
 * buying in markets with high local rates (e.g. UAH, TRY) but with income or
 * existing assets in EUR / USD / CHF. Compares borrowing in the property's
 * home market vs a chosen foreign market, modelling FX risk at three
 * sensitivity levels.
 */
export default function ForeignCurrencyPanel({ state }: ForeignCurrencyPanelProps) {
  const home = MARKETS[state.market];
  const baseScenario = state.scenarios[0];

  // Default the foreign currency to EUR if borrowing in EUR is feasible,
  // otherwise USD. Borrower can change.
  const [loanMarket, setLoanMarket] = useState<MarketCode>(
    home.currency === 'EUR' ? 'US' : 'IE',
  );
  // FX appreciation of the LOAN currency vs the LOCAL property-market currency
  // over the loan life — positive = loan currency strengthens (borrower pays more).
  const [fxStress, setFxStress] = useState<number>(0); // % per year

  const homeRate = (baseScenario?.fixedRate ?? baseScenario?.variableRate) ?? 0.04;
  const term = state.mortgageTerm;
  const ltv = state.housePrice > 0
    ? (state.housePrice - state.deposit) / state.housePrice
    : 0.8;

  const analysis = useMemo(() => {
    if (!baseScenario || state.housePrice <= 0) return null;

    const propertyPriceLocal = state.housePrice;
    const loanLocal = propertyPriceLocal * ltv;

    // Foreign currency loan: borrow `loanLocal` worth, but in `loanMarket` currency.
    const loanForeign = convertCurrency(loanLocal, state.market, loanMarket);

    // Use loan market's average lender rate as the foreign-currency mortgage rate.
    const foreignLenders = getLenders(loanMarket);
    const foreignRate = foreignLenders.length > 0
      ? foreignLenders.reduce((s, l) => s + l.fixedRate, 0) / foreignLenders.length
      : 0.04;

    const homeInput: ScenarioInput = {
      ...baseScenario,
      housePrice: propertyPriceLocal,
      loanToValue: ltv,
      mortgageTerm: term,
      rateStructure: 'fixed',
      fixedRate: homeRate,
      fixedPeriodYears: term,
      variableRate: homeRate,
    };
    const homeR = runAmortisation(homeInput);

    const foreignInput: ScenarioInput = {
      ...baseScenario,
      housePrice: propertyPriceLocal / convertCurrency(1, state.market, loanMarket),
      loanToValue: ltv,
      mortgageTerm: term,
      rateStructure: 'fixed',
      fixedRate: foreignRate,
      fixedPeriodYears: term,
      variableRate: foreignRate,
    };
    const foreignR = runAmortisation(foreignInput);

    // Now translate the foreign payments back to local currency for an
    // apples-to-apples comparison, accounting for FX stress year-on-year.
    const fxPerMonth = Math.pow(1 + fxStress / 100, 1 / 12);
    const baseFxRate = convertCurrency(1, loanMarket, state.market);
    let totalLocalEquivalent = 0;
    let firstPaymentLocal = 0;
    foreignR.periods.forEach((p, i) => {
      const fxAtMonth = baseFxRate * Math.pow(fxPerMonth, i);
      const localEquivalent = p.totalPayment * fxAtMonth;
      totalLocalEquivalent += localEquivalent;
      if (i === 0) firstPaymentLocal = localEquivalent;
    });

    const homeTotal = homeR.totalAmountPaid;
    const fxAdjustedTotal = totalLocalEquivalent;
    const savings = homeTotal - fxAdjustedTotal; // positive = foreign loan is cheaper

    return {
      loanLocal,
      loanForeign,
      homeRate,
      foreignRate,
      homeFirst: homeR.firstMonthlyPayment,
      foreignFirstForeignCcy: foreignR.firstMonthlyPayment,
      foreignFirstLocal: firstPaymentLocal,
      homeTotal,
      foreignTotalForeign: foreignR.totalAmountPaid,
      fxAdjustedTotal,
      savings,
    };
  }, [baseScenario, state.housePrice, state.market, ltv, term, homeRate, loanMarket, fxStress]);

  if (!baseScenario || !analysis) {
    return (
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <p className="text-sm text-[#6b7a8a]">
          Add a base lender scenario to compare a foreign-currency mortgage.
        </p>
      </div>
    );
  }

  const cheaper = analysis.savings > 0;

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5 space-y-4">
      <p className="text-sm text-[#6b7a8a]">
        Compare borrowing in {home.name}&rsquo;s currency ({home.currency}) versus borrowing
        in another currency for the same property. Foreign-currency mortgages can lower the
        rate substantially in high-rate markets, but expose the borrower to FX risk on every
        future payment.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Borrow in
          </label>
          <select
            value={loanMarket}
            onChange={(e) => setLoanMarket(e.target.value as MarketCode)}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          >
            {COMPARISON_CURRENCIES.map((c) => (
              <option key={c.market} value={c.market} disabled={c.market === state.market}>
                {c.label} ({MARKETS[c.market].name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            FX stress (loan currency vs local, % / year)
          </label>
          <input
            type="number"
            value={fxStress}
            step={0.5}
            onChange={(e) => setFxStress(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
          <p className="text-[11px] text-[#6b7a8a]/70 mt-1">
            Positive = loan currency strengthens against {home.currency} (payments grow).
            Negative = loan currency weakens (payments shrink).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
            Local-currency mortgage ({home.currency})
          </p>
          <dl className="space-y-1.5">
            <Row label="Rate" value={formatPercent(analysis.homeRate, 2)} />
            <Row label="Loan amount" value={formatCurrency(analysis.loanLocal, state.market)} />
            <Row label="First monthly" value={formatCurrency(analysis.homeFirst, state.market)} />
            <Row label="Total paid" value={formatCurrency(analysis.homeTotal, state.market)} bold />
          </dl>
        </div>

        <div className="bg-[#eef4f7]/60 border border-[#4a7c96]/20 rounded-lg p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
            Foreign-currency mortgage ({MARKETS[loanMarket].currency})
          </p>
          <dl className="space-y-1.5">
            <Row label="Rate" value={formatPercent(analysis.foreignRate, 2)} />
            <Row label="Loan amount" value={formatCurrency(analysis.loanForeign, loanMarket)} />
            <Row
              label="First monthly"
              value={`${formatCurrency(analysis.foreignFirstForeignCcy, loanMarket)} ≈ ${formatCurrency(analysis.foreignFirstLocal, state.market)}`}
            />
            <Row
              label={`Total paid (in ${home.currency}, FX-adjusted)`}
              value={formatCurrency(analysis.fxAdjustedTotal, state.market)}
              bold
            />
          </dl>
        </div>
      </div>

      <div className={`rounded-lg p-3 text-sm ${cheaper ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
        <strong>{cheaper ? 'Foreign-currency loan looks cheaper' : 'Local-currency loan looks cheaper'}</strong> —
        difference of {formatCurrency(Math.abs(analysis.savings), state.market)} over the life of the loan
        at the FX assumption above.
      </div>

      <p className="text-[11px] text-[#6b7a8a]/70 leading-relaxed">
        FX risk is real: a 5%/yr appreciation of the loan currency over a 25-year mortgage
        compounds to ~3.4× the original FX rate. Many regulators (e.g. NBU in Ukraine,
        KNF in Poland) restrict or ban FX-denominated retail mortgages for residents.
      </p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#6b7a8a]">{label}</dt>
      <dd className={bold ? 'font-bold text-[#2a2520]' : 'text-[#2a2520]'}>{value}</dd>
    </div>
  );
}
