'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ScenarioResult } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { formatCurrencyIn } from '@/lib/formatting';

interface RepaymentBreakdownProps {
  results: ScenarioResult[];
  market: MarketCode;
  displayMarket?: MarketCode;
}

export default function RepaymentBreakdown({ results, market, displayMarket }: RepaymentBreakdownProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const result = results[selectedIdx];
  const dm = displayMarket ?? market;
  const fmt = (v: number) => formatCurrencyIn(v, market, dm);

  if (!result) return null;

  const data = result.periods
    .filter((_, i) => i % 12 === 0)
    .map((p) => ({
      year: Math.floor(p.monthIndex / 12) + 1,
      principal: Math.round(p.principalRepayment * 12),
      interest: Math.round(p.interest * 12),
    }));

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-[#2a2520]">Principal vs Interest</h3>
        {results.length > 1 && (
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className="text-xs bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg px-3 py-1.5 text-[#2a2520] focus:outline-none focus:border-[#4a7c96]"
          >
            {results.map((r, i) => (
              <option key={r.id} value={i}>{r.lenderName}</option>
            ))}
          </select>
        )}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e3dc" />
          <XAxis
            dataKey="year"
            stroke="#9aa5b0"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `Yr ${v}`}
          />
          <YAxis
            stroke="#9aa5b0"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => fmt(v).replace(/[€£$A¥₴₪]/g, '').trim()}
            width={70}
          />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e8e3dc', borderRadius: '8px' }}
            formatter={(v: unknown, name: unknown) => [fmt(v as number), String(name)]}
            labelFormatter={(l) => `Year ${l}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
          <Area type="monotone" dataKey="principal" stackId="1" stroke="#4a7c96" fill="#4a7c96" fillOpacity={0.4} name="Principal" />
          <Area type="monotone" dataKey="interest" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Interest" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
