'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ScenarioInput } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { compareOverpayment } from '@/lib/engine/overpayment';
import { formatCurrencyIn } from '@/lib/formatting';

interface OverpaymentPanelProps {
  primaryInput: ScenarioInput;
  market: MarketCode;
  displayMarket?: MarketCode;
}

export default function OverpaymentPanel({ primaryInput, market, displayMarket }: OverpaymentPanelProps) {
  const [lumpSum, setLumpSum] = useState(10000);
  const [startYear, setStartYear] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [reduces, setReduces] = useState<'payment' | 'term'>('term');
  const dm = displayMarket ?? market;
  const fmt = (v: number) => formatCurrencyIn(v, market, dm);

  const sym = market === 'UK' ? '£' : market === 'UAE' ? 'AED ' : '€';

  const comparison = useMemo(() => {
    if (lumpSum <= 0) return null;
    return compareOverpayment(primaryInput, lumpSum, startYear, frequency, reduces);
  }, [primaryInput, lumpSum, startYear, frequency, reduces]);

  const chartData = useMemo(() => {
    if (!comparison) return [];
    const maxLen = Math.max(
      comparison.baseline.periods.length,
      comparison.withOverpayment.periods.length
    );
    const data = [];
    for (let m = 0; m < maxLen; m += 12) {
      const year = m / 12 + 1;
      const base = comparison.baseline.periods[m];
      const over = comparison.withOverpayment.periods[m];
      data.push({
        year,
        baseline: base ? Math.round(base.closingBalance) : 0,
        withOverpayment: over ? Math.round(over.closingBalance) : 0,
      });
    }
    return data;
  }, [comparison]);

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#2a2520] mb-4">Overpayment simulator</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div>
          <label className="block text-xs text-[#6b7a8a] mb-1">Lump sum ({sym})</label>
          <input
            type="number"
            value={lumpSum}
            onChange={(e) => setLumpSum(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
            min={0}
            step={1000}
          />
        </div>
        <div>
          <label className="block text-xs text-[#6b7a8a] mb-1">Start year</label>
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
            min={1}
            max={primaryInput.mortgageTerm}
          />
        </div>
        <div>
          <label className="block text-xs text-[#6b7a8a] mb-1">Every N years</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
            min={1}
          />
        </div>
        <div>
          <label className="block text-xs text-[#6b7a8a] mb-1">Reduces</label>
          <select
            value={reduces}
            onChange={(e) => setReduces(e.target.value as 'payment' | 'term')}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
          >
            <option value="term">Term</option>
            <option value="payment">Payment</option>
          </select>
        </div>
      </div>

      {comparison && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6b7a8a] mb-1">Months saved</p>
              <p className="text-lg font-bold text-[#4a7c96]">{comparison.monthsSaved > 0 ? comparison.monthsSaved : '—'}</p>
            </div>
            <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6b7a8a] mb-1">Interest saved</p>
              <p className="text-lg font-bold text-green-700">{fmt(comparison.interestSaved)}</p>
            </div>
            <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6b7a8a] mb-1">Total saved</p>
              <p className="text-lg font-bold text-green-700">{fmt(comparison.totalSaved)}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e3dc" />
              <XAxis dataKey="year" stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `${sym}${(v / 1000).toFixed(0)}k`} width={60} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e8e3dc', borderRadius: '8px' }}
                formatter={(v: unknown) => [fmt(v as number), '']}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
              <Line type="monotone" dataKey="baseline" stroke="#9aa5b0" strokeWidth={1.5} dot={false} name="No overpayment" />
              <Line type="monotone" dataKey="withOverpayment" stroke="#4a7c96" strokeWidth={2} dot={false} name="With overpayment" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
