'use client';

import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ScenarioInput, MarketCode } from '@/lib/types';
import { compareOverpayment, type OverpaymentComparison } from '@/lib/engine/overpayment';
import { formatCurrencyIn } from '@/lib/formatting';
import { MARKETS } from '@/lib/markets';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';

interface OverpaymentPanelProps {
  primaryInput: ScenarioInput;
  market: MarketCode;
  displayMarket?: MarketCode;
}

/**
 * Overpayment simulator. The user enters a lump sum + cadence, picks whether
 * the saving reduces the term or the monthly payment, then clicks Run. Two
 * charts are rendered: outstanding balance over time, and monthly payment
 * over time so the user can see both kinds of "saving" in motion.
 */
export default function OverpaymentPanel({ primaryInput, market, displayMarket }: OverpaymentPanelProps) {
  const dm = displayMarket ?? market;
  const fmt = (v: number) => formatCurrencyIn(v, market, dm);
  const sym = MARKETS[market].currencySymbol;

  // Inputs — all strings under the hood so the user can fully delete them.
  const [lumpSum, setLumpSum] = useState<number>(10000);
  const [startYearStr, setStartYearStr] = useState<string>('1');
  const [frequencyStr, setFrequencyStr] = useState<string>('1');
  const [reduces, setReduces] = useState<'payment' | 'term'>('term');

  // Computed state — only updated when the user clicks Run.
  const [comparison, setComparison] = useState<OverpaymentComparison | null>(null);

  const startYear = Math.max(1, Math.min(primaryInput.mortgageTerm, Number(startYearStr) || 1));
  const frequency = Math.max(1, Number(frequencyStr) || 1);
  const inputsValid = lumpSum > 0;

  function calculate() {
    if (!inputsValid) {
      setComparison(null);
      return;
    }
    setComparison(
      compareOverpayment(primaryInput, lumpSum, startYear, frequency, reduces),
    );
  }

  function reset() {
    setLumpSum(10000);
    setStartYearStr('1');
    setFrequencyStr('1');
    setReduces('term');
    setComparison(null);
  }

  const chartData = useMemo(() => {
    if (!comparison) return [];
    const maxLen = Math.max(
      comparison.baseline.periods.length,
      comparison.withOverpayment.periods.length,
    );
    const data: Record<string, number>[] = [];
    for (let m = 0; m < maxLen; m += 12) {
      const year = Math.floor(m / 12) + 1;
      const base = comparison.baseline.periods[m];
      const over = comparison.withOverpayment.periods[m];
      data.push({
        year,
        baselineBalance: base ? Math.round(base.closingBalance) : 0,
        overBalance: over ? Math.round(over.closingBalance) : 0,
        baselinePayment: base ? Math.round(base.totalPayment) : 0,
        overPayment: over ? Math.round(over.totalPayment) : 0,
      });
    }
    return data;
  }, [comparison]);

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#2a2520] mb-1">Overpayment simulator</h3>
      <p className="text-xs text-[#6b7a8a] mb-4">
        Schedule a recurring lump-sum overpayment and see how much interest you
        save and how the loan profile changes.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Lump sum
          </label>
          <div className="relative">
            <FormattedNumberInput
              value={lumpSum}
              onValueChange={setLumpSum}
              min={0}
              placeholder="10,000"
              className="w-full pl-3 pr-12 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-xs pointer-events-none">{sym}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Start year
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={startYearStr}
            onChange={(e) => setStartYearStr(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="1"
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Every N years
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={frequencyStr}
            onChange={(e) => setFrequencyStr(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="1"
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Reduces
          </label>
          <select
            value={reduces}
            onChange={(e) => setReduces(e.target.value as 'payment' | 'term')}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          >
            <option value="term">Term (shorter loan, same payment)</option>
            <option value="payment">Payment (same term, lower payments)</option>
          </select>
        </div>
      </div>

      {/* Run button */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={calculate}
          disabled={!inputsValid}
          className="px-4 py-2 bg-[#4a7c96] hover:bg-[#3a6a82] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Run simulation
        </button>
        {comparison && (
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 border border-[#e8e3dc] hover:border-[#4a7c96] text-[#6b7a8a] hover:text-[#4a7c96] text-sm rounded-lg transition-colors"
          >
            Reset
          </button>
        )}
        <p className="text-xs text-[#6b7a8a] ml-auto">
          {inputsValid
            ? `Plan: ${fmt(lumpSum)} every ${frequency} year${frequency !== 1 ? 's' : ''} from year ${startYear}`
            : 'Enter a lump sum greater than 0 to run.'}
        </p>
      </div>

      {comparison && (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <Stat
              label="Months saved"
              value={comparison.monthsSaved > 0 ? `${comparison.monthsSaved} mo` : '—'}
              tone="primary"
            />
            <Stat label="Interest saved" value={fmt(comparison.interestSaved)} tone="good" />
            <Stat label="Total saved" value={fmt(comparison.totalSaved)} tone="good" />
          </div>

          {/* Balance over time */}
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
              Outstanding balance over time
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e3dc" />
                <XAxis dataKey="year" stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
                <YAxis stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v).replace(/[€£$A¥₴₪]/g, '').trim()} width={70} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e8e3dc', borderRadius: '8px' }}
                  formatter={(v: unknown) => [fmt(v as number), '']}
                  labelFormatter={(l) => `Year ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="baselineBalance" stroke="#9aa5b0" strokeWidth={1.5} dot={false} name="No overpayment" />
                <Line type="monotone" dataKey="overBalance" stroke="#4a7c96" strokeWidth={2} dot={false} name="With overpayment" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly payment over time */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
              Monthly payment over time
              {reduces === 'term' && (
                <span className="ml-2 font-normal text-[#6b7a8a]/80 normal-case tracking-normal">
                  · Reduces term: payment is constant, loan ends earlier.
                </span>
              )}
              {reduces === 'payment' && (
                <span className="ml-2 font-normal text-[#6b7a8a]/80 normal-case tracking-normal">
                  · Reduces payment: monthly payment steps down after each overpayment.
                </span>
              )}
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e3dc" />
                <XAxis dataKey="year" stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
                <YAxis stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v).replace(/[€£$A¥₴₪]/g, '').trim()} width={70} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e8e3dc', borderRadius: '8px' }}
                  formatter={(v: unknown) => [fmt(v as number), '']}
                  labelFormatter={(l) => `Year ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="baselinePayment" stroke="#9aa5b0" strokeWidth={1.5} dot={false} name="No overpayment" />
                <Line type="monotone" dataKey="overPayment" stroke="#4a7c96" strokeWidth={2} dot={false} name="With overpayment" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'primary' | 'good' | 'bad' | 'neutral' }) {
  const tones: Record<string, string> = {
    primary: 'text-[#4a7c96]',
    good: 'text-green-700',
    bad: 'text-red-600',
    neutral: 'text-[#2a2520]',
  };
  return (
    <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
      <p className="text-xs text-[#6b7a8a] mb-1">{label}</p>
      <p className={`text-lg font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
