'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ScenarioResult } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { formatCurrency } from '@/lib/formatting';

interface RepaymentBreakdownProps {
  results: ScenarioResult[];
  market: MarketCode;
}

export default function RepaymentBreakdown({ results, market }: RepaymentBreakdownProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const result = results[selectedIdx];

  if (!result) return null;

  const data = result.periods
    .filter((_, i) => i % 12 === 0)
    .map((p) => ({
      year: Math.floor(p.monthIndex / 12) + 1,
      principal: Math.round(p.principalRepayment * 12),
      interest: Math.round(p.interest * 12),
    }));

  return (
    <div className="bg-[#16213e] border border-[#1e3a5f] rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-white">Principal vs Interest</h3>
        {results.length > 1 && (
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className="text-xs bg-[#0f3460] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#3b82f6]"
          >
            {results.map((r, i) => (
              <option key={r.id} value={i}>{r.lenderName}</option>
            ))}
          </select>
        )}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `Yr ${v}`}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => formatCurrency(v, market, 0).replace(/[€£$A]/, '').trim()}
            width={70}
          />
          <Tooltip
            contentStyle={{ background: '#0f3460', border: '1px solid #1e3a5f', borderRadius: '8px' }}
            formatter={(v: unknown, name: unknown) => [formatCurrency(v as number, market), String(name)]}
            labelFormatter={(l) => `Year ${l}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
          <Area type="monotone" dataKey="principal" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="Principal" />
          <Area type="monotone" dataKey="interest" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Interest" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
