'use client';

import { useMemo, useState } from 'react';
import type { MarketCode, ScenarioInput, WizardState } from '@/lib/types';
import { MARKETS, LAUNCH_MARKETS } from '@/lib/markets';
import { runAmortisation } from '@/lib/engine/amortisation';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import { convertCurrency, COMPARISON_CURRENCIES } from '@/lib/fx';
import { getLenders } from '@/lib/lenders';
import Flag from '@/components/shared/Flag';

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
  cashInvestedLocal: number;
  affordablePrice: number;
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
  // Currency in which all rankings are shown. Default = EUR (IE proxy).
  const [baseCurrencyMarket, setBaseCurrencyMarket] = useState<MarketCode>('IE');
  // The cash the investor brings to the table, in the comparison currency.
  // Defaults to deposit + stamp duty + other fees from the home market scenario.
  const [investedAmount, setInvestedAmount] = useState<number>(() => {
    const home = MARKETS[state.market];
    const stamp = home.stampDuty(state.housePrice, {
      buyerType: 'investor',
      propertyType: state.propertyType,
    });
    return Math.round(state.deposit + stamp + state.otherFees);
  });

  const term = state.mortgageTerm || 25;

  const rows = useMemo<Row[]>(() => {
    return Array.from(selected)
      .map((code): Row | null => {
        const market = MARKETS[code];
        if (!market) return null;

        // Convert the user's invested amount (in baseCurrency) into the
        // local currency to be deployed in this market.
        const cashLocal = convertCurrency(investedAmount, baseCurrencyMarket, code);

        // Use the market's average curated rate + fixed period as a fair proxy.
        const { avgFixedRate, avgFixedYears } = averageLenderTerms(code);

        // Solve for the property price the investor can afford given:
        //   cashLocal = depositPct * price + stampDuty(price) + assumed other fees
        // We use the market's regulatory max LTV → depositPct = 1 - maxLTV.
        // Stamp duty is computed for an investor purchase. We solve iteratively
        // because stampDuty can be non-linear (e.g. UK SDLT bands).
        const depositPct = 1 - market.maxLTV;
        const otherFees = 0; // already folded into cashInvested through the user-entered total
        const solveAffordablePrice = (cash: number): number => {
          let lo = 0;
          let hi = cash * 100; // generous upper bound
          for (let i = 0; i < 60; i++) {
            const mid = (lo + hi) / 2;
            const stamp = market.stampDuty(mid, {
              buyerType: 'investor',
              propertyType: state.propertyType,
            });
            const required = mid * depositPct + stamp + otherFees;
            if (required > cash) hi = mid; else lo = mid;
          }
          return lo;
        };

        const affordablePrice = Math.max(0, solveAffordablePrice(cashLocal));
        if (affordablePrice <= 0) return null;

        const stampDuty = market.stampDuty(affordablePrice, {
          buyerType: 'investor',
          propertyType: state.propertyType,
        });
        const loanAmount = affordablePrice * market.maxLTV;

        const input: ScenarioInput = {
          id: `mkt-${code}`,
          lenderName: code,
          housePrice: affordablePrice,
          otherFees: 0,
          loanToValue: market.maxLTV,
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

        const totalCostLocal = result.totalAmountPaid + stampDuty + (affordablePrice - loanAmount);

        return {
          code,
          name: market.name,
          currency: market.currency,
          maxLTV: market.maxLTV,
          avgFixedRate,
          avgFixedYears: Math.min(avgFixedYears, term),
          cashInvestedLocal: cashLocal,
          affordablePrice,
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
  }, [selected, investedAmount, baseCurrencyMarket, term, state.propertyType]);

  function toggle(code: MarketCode) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  const baseLabel =
    COMPARISON_CURRENCIES.find((c) => c.market === baseCurrencyMarket)?.label ?? 'EUR';

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-[#6b7a8a]">
            Same cash on the table everywhere — converted to local currency, applied as
            deposit + investor stamp duty, then a property is bought at the market&rsquo;s
            max LTV using the average lender rate. Compare what your cash buys you across
            countries.
          </p>
          <p className="text-xs text-[#6b7a8a]/70 mt-2">
            Loan term {term} years. Per-market figures shown in local currency; ranking
            uses the comparison currency below.
          </p>
        </div>

        {/* Comparison currency selector */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7a8a]">
            Compare in
          </label>
          <select
            value={baseCurrencyMarket}
            onChange={(e) => setBaseCurrencyMarket(e.target.value as MarketCode)}
            className="px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          >
            {COMPARISON_CURRENCIES.map((c) => (
              <option key={c.market} value={c.market}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cash to invest */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
          Cash to invest ({baseLabel})
        </label>
        <input
          type="number"
          value={investedAmount || ''}
          step={1000}
          min={0}
          onChange={(e) => setInvestedAmount(Number(e.target.value))}
          className="w-full max-w-xs px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
        />
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
          Select at least one market and enter a cash amount to compare.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e3dc] text-left text-xs uppercase tracking-wide text-[#6b7a8a]">
                <th className="py-2 pr-3 font-semibold">Market</th>
                <th className="py-2 pr-3 font-semibold text-right">Avg rate</th>
                <th className="py-2 pr-3 font-semibold text-right">Max LTV</th>
                <th className="py-2 pr-3 font-semibold text-right">Affordable price</th>
                <th className="py-2 pr-3 font-semibold text-right">Stamp duty</th>
                <th className="py-2 pr-3 font-semibold text-right">Monthly</th>
                <th className="py-2 pr-3 font-semibold text-right">Total cost (local)</th>
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
                    <td className="py-2.5 pr-3 text-right text-[#2a2520]">{formatCurrency(r.affordablePrice, r.code)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#6b7a8a]">{formatCurrency(r.stampDuty, r.code)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#2a2520]">{formatCurrency(r.firstMonthlyPayment, r.code)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#2a2520] font-semibold">{formatCurrency(r.totalCostLocal, r.code)}</td>
                    <td className="py-2.5 pr-3 text-right text-[#4a7c96] font-semibold">{formatCurrency(r.totalCostBase, baseCurrencyMarket)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-[#6b7a8a]/70 mt-3 leading-relaxed">
        Affordable price is solved so deposit + investor stamp duty exactly absorbs the
        cash you put in (the loan funds the rest at the market&rsquo;s max LTV). Avg rate
        is the mean of the curated lender roster for that country. FX rates and per-market
        averages are approximations refreshed periodically; FTB schemes are excluded.
      </p>
    </div>
  );
}
