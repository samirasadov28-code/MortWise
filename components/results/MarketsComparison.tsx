'use client';

import { useMemo, useState } from 'react';
import type { MarketCode, ScenarioInput, WizardState } from '@/lib/types';
import { MARKETS, LAUNCH_MARKETS } from '@/lib/markets';
import { runAmortisation } from '@/lib/engine/amortisation';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import { convertCurrency, COMPARISON_CURRENCIES } from '@/lib/fx';
import Flag from '@/components/shared/Flag';

interface MarketsComparisonProps {
  state: WizardState;
}

interface Row {
  code: MarketCode;
  name: string;
  currency: string;
  maxLTV: number;
  loanAmount: number;
  stampDuty: number;
  firstMonthlyPayment: number;
  totalAmountPaid: number;
  totalCostLocal: number;
  totalCostBase: number;
}

const DEFAULT_INVESTOR_RATE = 0.055;
const DEFAULT_TERM = 25;

export default function MarketsComparison({ state }: MarketsComparisonProps) {
  const [selected, setSelected] = useState<Set<MarketCode>>(() => {
    const seed = new Set<MarketCode>([state.market]);
    (['UK', 'US', 'PT', 'ES', 'UAE'] as MarketCode[]).forEach((c) => seed.add(c));
    return seed;
  });
  // Currency in which all rankings are shown. Default = EUR (IE proxy).
  const [baseCurrencyMarket, setBaseCurrencyMarket] = useState<MarketCode>('IE');

  const baseRate = useMemo(() => {
    const s = state.scenarios[0];
    if (!s) return DEFAULT_INVESTOR_RATE;
    if (s.rateStructure === 'fixed' && s.fixedRate) return s.fixedRate;
    return s.variableRate || DEFAULT_INVESTOR_RATE;
  }, [state.scenarios]);

  const term = state.mortgageTerm || DEFAULT_TERM;
  const housePrice = state.housePrice;
  const depositRatio = housePrice > 0 ? state.deposit / housePrice : 0.2;

  const rows = useMemo<Row[]>(() => {
    return Array.from(selected)
      .map((code): Row | null => {
        const market = MARKETS[code];
        if (!market) return null;

        const ltv = Math.min(1 - depositRatio, market.maxLTV);
        const loanAmount = housePrice * ltv;
        const stampDuty = market.stampDuty(housePrice, {
          buyerType: 'investor',
          propertyType: state.propertyType,
        });

        const input: ScenarioInput = {
          id: `mkt-${code}`,
          lenderName: code,
          housePrice,
          otherFees: 0,
          loanToValue: ltv,
          otherFeesCoveredByDebt: false,
          mortgageTerm: term,
          rateStructure: 'fixed',
          fixedRate: baseRate,
          fixedPeriodYears: term,
          variableRate: baseRate,
          repaymentType: 'annuity',
          overpaymentReduces: 'payment',
        };

        const result = runAmortisation(input);
        const totalCostLocal = result.totalAmountPaid + stampDuty + (housePrice - loanAmount);

        return {
          code,
          name: market.name,
          currency: market.currency,
          maxLTV: market.maxLTV,
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
  }, [selected, housePrice, depositRatio, term, baseRate, baseCurrencyMarket, state.propertyType]);

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
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-sm text-[#6b7a8a]">
            Compare the same {formatCurrency(housePrice, state.market)} property purchased as an
            investor across different countries. Total cost includes deposit, mortgage repayment,
            and local stamp duty / transfer taxes.
          </p>
          <p className="text-xs text-[#6b7a8a]/70 mt-2">
            Assumes a {formatPercent(baseRate, 2)} fixed rate for the full {term}-year term.
            Each market caps loan-to-value at its own regulatory limit.
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
          Select at least one market to compare.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e3dc] text-left text-xs uppercase tracking-wide text-[#6b7a8a]">
                <th className="py-2 pr-3 font-semibold">Market</th>
                <th className="py-2 pr-3 font-semibold text-right">Max LTV</th>
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
                  <tr
                    key={r.code}
                    className={`border-b border-[#e8e3dc]/60 ${cheapest ? 'bg-[#4a7c96]/5' : ''}`}
                  >
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
                      {formatPercent(r.maxLTV, 0)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[#6b7a8a]">
                      {formatCurrency(r.stampDuty, r.code)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[#2a2520]">
                      {formatCurrency(r.firstMonthlyPayment, r.code)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[#2a2520] font-semibold">
                      {formatCurrency(r.totalCostLocal, r.code)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[#4a7c96] font-semibold">
                      {formatCurrency(r.totalCostBase, baseCurrencyMarket)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-[#6b7a8a]/70 mt-3 leading-relaxed">
        FX rates are approximations refreshed periodically and used only for ranking.
        Stamp duty uses each market&rsquo;s investor / non-resident rate where applicable.
        Government first-time-buyer schemes are deliberately excluded — they don&rsquo;t apply to
        overseas investors.
      </p>
    </div>
  );
}
