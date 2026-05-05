'use client';

import { useMemo, useState } from 'react';
import type { MarketCode, ScenarioInput, WizardState } from '@/lib/types';
import { MARKETS, LAUNCH_MARKETS } from '@/lib/markets';
import { runAmortisation } from '@/lib/engine/amortisation';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import { convertCurrency, COMPARISON_CURRENCIES } from '@/lib/fx';
import { getLenders } from '@/lib/lenders';
import Flag from '@/components/shared/Flag';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';

interface MarketsComparisonProps {
  state: WizardState;
}

interface Row {
  code: MarketCode;
  name: string;
  currency: string;
  maxLTV: number;
  avgFixedRate: number;
  avgFixedYears: number;
  propertyPriceLocal: number;
  depositLocal: number;
  loanAmount: number;
  stampDuty: number;
  firstMonthlyPayment: number;
  totalAmountPaid: number;
  totalCostLocal: number;
  totalCostBase: number;
}

/** Average a market's curated lender roster to get a fair indicative rate. */
function averageLenderTerms(market: MarketCode) {
  const lenders = getLenders(market);
  if (lenders.length === 0) return { avgFixedRate: 0.04, avgFixedYears: 5 };
  const avgFixedRate = lenders.reduce((s, l) => s + l.fixedRate, 0) / lenders.length;
  const avgFixedYears = Math.round(lenders.reduce((s, l) => s + l.fixedPeriodYears, 0) / lenders.length);
  return { avgFixedRate, avgFixedYears };
}

export default function MarketsComparison({ state }: MarketsComparisonProps) {
  const [selected, setSelected] = useState<Set<MarketCode>>(() => {
    const seed = new Set<MarketCode>([state.market]);
    (['UK', 'US', 'PT', 'ES', 'UAE'] as MarketCode[]).forEach((c) => seed.add(c));
    return seed;
  });
  // Currency the user enters the price in, AND the currency in which the
  // ranking column is shown. Defaults to USD — the most common cross-border
  // pricing currency for international property buyers.
  const [baseCurrencyMarket, setBaseCurrencyMarket] = useState<MarketCode>('US');
  // The property price the user wants to buy at, expressed in baseCurrency.
  // Same nominal price applies across every selected market — we convert to
  // each market's local currency for the engine + tax calc.
  const [priceInBase, setPriceInBase] = useState<number>(() => {
    // Default = the home-market house price converted to USD
    return Math.round(convertCurrency(state.housePrice, state.market, 'US'));
  });

  const term = state.mortgageTerm || 25;

  const rows = useMemo<Row[]>(() => {
    return Array.from(selected)
      .map((code): Row | null => {
        const market = MARKETS[code];
        if (!market) return null;
        if (priceInBase <= 0) return null;

        // Same property price across all markets — convert to this market's
        // local currency for stamp duty + amortisation.
        const propertyPriceLocal = convertCurrency(priceInBase, baseCurrencyMarket, code);

        // Use the market's average curated rate + fixed period as a fair proxy.
        const { avgFixedRate, avgFixedYears } = averageLenderTerms(code);

        // Apply the market's regulatory max LTV → loan amount + deposit.
        const ltv = market.maxLTV;
        const loanAmount = propertyPriceLocal * ltv;
        const depositLocal = propertyPriceLocal - loanAmount;

        const stampDuty = market.stampDuty(propertyPriceLocal, {
          buyerType: 'investor',
          propertyType: state.propertyType,
        });

        const input: ScenarioInput = {
          id: `mkt-${code}`,
          lenderName: code,
          housePrice: propertyPriceLocal,
          otherFees: 0,
          loanToValue: ltv,
          otherFeesCoveredByDebt: false,
          mortgageTerm: term,
          rateStructure: 'fixed',
          fixedRate: avgFixedRate,
          fixedPeriodYears: Math.min(avgFixedYears, term),
          variableRate: avgFixedRate,
          repaymentType: 'annuity',
          overpaymentReduces: 'payment',
        };
        const result = runAmortisation(input);

        const totalCostLocal = result.totalAmountPaid + stampDuty + depositLocal;

        return {
          code,
          name: market.name,
          currency: market.currency,
          maxLTV: market.maxLTV,
          avgFixedRate,
          avgFixedYears: Math.min(avgFixedYears, term),
          propertyPriceLocal,
          depositLocal,
          loanAmount,
          stampDuty,
          firstMonthlyPayment: result.firstMonthlyPayment,
          totalAmountPaid: result.totalAmountPaid,
          totalCostLocal,
          totalCostBase: convertCurrency(totalCostLocal, code, baseCurrencyMarket),
        };
      })
      .filter((r): r is Row => r !== null)
      .sort((a, b) => a.totalCostBase - b.totalCostBase);
  }, [selected, priceInBase, baseCurrencyMarket, term, state.propertyType]);

  function toggle(code: MarketCode) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  const baseLabel =
    COMPARISON_CURRENCIES.find((c) => c.market === baseCurrencyMarket)?.label ?? 'USD';

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-[#6b7a8a]">
            Same property price across countries — entered in your chosen
            currency, converted to each market&rsquo;s local currency, then
            modelled with that market&rsquo;s max LTV, average lender rate,
            and investor stamp duty.
          </p>
          <p className="text-xs text-[#6b7a8a]/70 mt-2">
            Loan term {term} years. Local-currency figures shown alongside the
            ranking column in {baseLabel}.
          </p>
        </div>
      </div>

      {/* Property price + comparison currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Property price (in {baseLabel})
          </label>
          <div className="relative">
            <FormattedNumberInput
              value={priceInBase}
              onValueChange={setPriceInBase}
              min={0}
              placeholder="500,000"
              className="w-full pl-3 pr-14 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-xs pointer-events-none">{baseLabel}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Comparison currency
          </label>
          <select
            value={baseCurrencyMarket}
            onChange={(e) => setBaseCurrencyMarket(e.target.value as MarketCode)}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          >
            {COMPARISON_CURRENCIES.map((c) => (
              <option key={c.market} value={c.market}>
                {c.label} — {MARKETS[c.market].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equal-size country boxes */}
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
          Markets ({selected.size} selected)
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {LAUNCH_MARKETS.map((code) => {
            const active = selected.has(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggle(code)}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors aspect-square ${
                  active
                    ? 'bg-[#4a7c96]/10 border-[#4a7c96] text-[#2a2520]'
                    : 'bg-white border-[#e8e3dc] text-[#6b7a8a] hover:border-[#4a7c96] hover:text-[#4a7c96]'
                }`}
                aria-pressed={active}
              >
                <Flag code={code as MarketCode} size={28} />
                <span className="text-[11px] font-semibold leading-tight">{code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[#6b7a8a] py-6 text-center">
          Select at least one market and enter a property price to compare.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e3dc] text-left text-xs uppercase tracking-wide text-[#6b7a8a]">
                <th className="py-2 pr-3 font-semibold">Market</th>
                <th className="py-2 pr-3 font-semibold text-right">Avg rate</th>
                <th className="py-2 pr-3 font-semibold text-right">Max LTV</th>
                <th className="py-2 pr-3 font-semibold text-right">Price (local)</th>
                <th className="py-2 pr-3 font-semibold text-right">Deposit</th>
                <th className="py-2 pr-3 font-semibold text-right">Stamp duty</th>
                <th className="py-2 pr-3 font-semibold text-right">Monthly</th>
                <th className="py-2 pr-3 font-semibold text-right">Total cost ({baseLabel})</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const cheapest = i === 0;
                return (
                  <tr key={r.code} className={`border-b border-[#e8e3dc]/60 ${cheapest ? 'bg-[#4a7c96]/5' : ''}`}>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <Flag code={r.code} size={20} />
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-[#2a2520]">{r.name}</span>
                          <span className="text-[11px] text-[#6b7a8a]">{r.currency}</span>
                        </div>
                        {cheapest && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-[#4a7c96] text-white rounded-full font-semibold uppercase tracking-wide">
                            Cheapest
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[#6b7a8a]">
                      {formatPercent(r.avgFixedRate, 2)}
                      <span className="block text-[10px] text-[#6b7a8a]/70">{r.avgFixedYears}y fix</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[#6b7a8a]">{formatPercent(r.maxLTV, 0)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#2a2520]">{formatCurrency(r.propertyPriceLocal, r.code)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#6b7a8a]">{formatCurrency(r.depositLocal, r.code)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#6b7a8a]">{formatCurrency(r.stampDuty, r.code)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#2a2520]">{formatCurrency(r.firstMonthlyPayment, r.code)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#4a7c96] font-semibold">{formatCurrency(r.totalCostBase, baseCurrencyMarket)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-[#6b7a8a]/70 mt-3 leading-relaxed">
        The same property price (in {baseLabel}) is converted to each market&rsquo;s local
        currency. Deposit = price × (1 − max LTV). Avg rate is the mean of the curated lender
        roster for that country. FX rates are approximations refreshed periodically.
        Government first-time-buyer schemes are excluded — they don&rsquo;t apply to overseas
        investors.
      </p>
    </div>
  );
}
