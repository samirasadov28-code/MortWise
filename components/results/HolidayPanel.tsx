'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ScenarioInput } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { compareHoliday } from '@/lib/engine/holiday';
import { formatCurrency } from '@/lib/formatting';

interface HolidayPanelProps {
  primaryInput: ScenarioInput;
  market: MarketCode;
}

export default function HolidayPanel({ primaryInput, market }: HolidayPanelProps) {
  const [holidayStart, setHolidayStart] = useState(24);
  const [holidayDuration, setHolidayDuration] = useState(3);

  const comparison = useMemo(() => {
    if (holidayDuration <= 0) return null;
    return compareHoliday(primaryInput, holidayStart, holidayDuration);
  }, [primaryInput, holidayStart, holidayDuration]);

  const chartData = useMemo(() => {
    if (!comparison) return [];
    const maxLen = Math.max(
      comparison.baseline.periods.length,
      comparison.withHoliday.periods.length
    );
    const data = [];
    for (let m = 0; m < maxLen; m += 12) {
      const year = m / 12 + 1;
      const base = comparison.baseline.periods[m];
      const hol = comparison.withHoliday.periods[m];
      data.push({
        year,
        baseline: base ? Math.round(base.closingBalance) : 0,
        withHoliday: hol ? Math.round(hol.closingBalance) : 0,
      });
    }
    return data;
  }, [comparison]);

  const sym = market === 'UK' ? '£' : market === 'UAE' ? 'AED ' : '€';

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#2a2520] mb-4">Interest holiday / payment pause</h3>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs text-[#6b7a8a] mb-1">Pause starts (month)</label>
          <input
            type="number"
            value={holidayStart}
            onChange={(e) => setHolidayStart(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
            min={1}
            max={primaryInput.mortgageTerm * 12 - 12}
          />
        </div>
        <div>
          <label className="block text-xs text-[#6b7a8a] mb-1">Duration (months)</label>
          <input
            type="number"
            value={holidayDuration}
            onChange={(e) => setHolidayDuration(Math.min(12, Math.max(1, Number(e.target.value))))}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
            min={1}
            max={12}
          />
        </div>
      </div>

      {comparison && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6b7a8a] mb-1">Extra interest</p>
              <p className="text-base font-bold text-red-600">{formatCurrency(comparison.extraInterest, market)}</p>
            </div>
            <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6b7a8a] mb-1">Balance at end</p>
              <p className="text-base font-bold text-[#2a2520]">{formatCurrency(comparison.balanceAtHolidayEnd, market)}</p>
            </div>
            <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6b7a8a] mb-1">New payment</p>
              <p className="text-base font-bold text-amber-700">{formatCurrency(comparison.newMonthlyPayment, market)}/mo</p>
            </div>
            <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6b7a8a] mb-1">Total extra cost</p>
              <p className="text-base font-bold text-red-600">{formatCurrency(comparison.totalExtraCost, market)}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e3dc" />
              <XAxis dataKey="year" stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `${sym}${(v / 1000).toFixed(0)}k`} width={60} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e8e3dc', borderRadius: '8px' }}
                formatter={(v: unknown) => [formatCurrency(v as number, market), '']}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
              <Line type="monotone" dataKey="baseline" stroke="#9aa5b0" strokeWidth={1.5} dot={false} name="No holiday" />
              <Line type="monotone" dataKey="withHoliday" stroke="#f59e0b" strokeWidth={2} dot={false} name="With holiday" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
