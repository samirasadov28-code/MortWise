'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ScenarioInput } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { compareOverpayment } from '@/lib/engine/overpayment';
import { formatCurrency } from '@/lib/formatting';

interface OverpaymentPanelProps {
  primaryInput: ScenarioInput;
  market: MarketCode;
}

export default function OverpaymentPanel({ primaryInput, market }: OverpaymentPanelProps) {
  const [lumpSum, setLumpSum] = useState(10000);
  const [startYear, setStartYear] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [reduces, setReduces] = useState<'payment' | 'term'>('term');

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
    <div className="bg-[#16213e] border border-[#1e3a5f] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Overpayment simulator</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div>
          <label className="block text-xs text-[#94a3b8] mb-1">Lump sum ({sym})</label>
          <input
            type="number"
            value={lumpSum}
            onChange={(e) => setLumpSum(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#0f3460] border border-[#1e3a5f] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]"
            min={0}
            step={1000}
          />
        </div>
        <div>
          <label className="block text-xs text-[#94a3b8] mb-1">Start year</label>
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#0f3460] border border-[#1e3a5f] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]"
            min={1}
            max={primaryInput.mortgageTerm}
          />
        </div>
        <div>
          <label className="block text-xs text-[#94a3b8] mb-1">Every N years</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-[#0f3460] border border-[#1e3a5f] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]"
            min={1}
          />
        </div>
        <div>
          <label className="block text-xs text-[#94a3b8] mb-1">Reduces</label>
          <select
            value={reduces}
            onChange={(e) => setReduces(e.target.value as 'payment' | 'term')}
            className="w-full px-3 py-2 bg-[#0f3460] border border-[#1e3a5f] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="term">Term</option>
            <option value="payment">Payment</option>
          </select>
        </div>
      </div>

      {comparison && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#0f3460]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-[#94a3b8] mb-1">Months saved</p>
              <p className="text-lg font-bold text-[#3b82f6]">{comparison.monthsSaved > 0 ? comparison.monthsSaved : '—'}</p>
            </div>
            <div className="bg-[#0f3460]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-[#94a3b8] mb-1">Interest saved</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(comparison.interestSaved, market)}</p>
            </div>
            <div className="bg-[#0f3460]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-[#94a3b8] mb-1">Total saved</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(comparison.totalSaved, market)}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${sym}${(v / 1000).toFixed(0)}k`} width={60} />
              <Tooltip
                contentStyle={{ background: '#0f3460', border: '1px solid #1e3a5f', borderRadius: '8px' }}
                formatter={(v: unknown) => [formatCurrency(v as number, market), '']}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
              <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="No overpayment" />
              <Line type="monotone" dataKey="withOverpayment" stroke="#3b82f6" strokeWidth={2} dot={false} name="With overpayment" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
