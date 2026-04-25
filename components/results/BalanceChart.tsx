'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ScenarioResult } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { formatCurrency } from '@/lib/formatting';

interface BalanceChartProps {
  results: ScenarioResult[];
  market: MarketCode;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function BalanceChart({ results, market }: BalanceChartProps) {
  if (results.length === 0) return null;

  const maxLen = Math.max(...results.map((r) => r.periods.length));
  const data: Record<string, number | string>[] = [];

  for (let m = 0; m < maxLen; m += 12) {
    const year = m / 12 + 1;
    const point: Record<string, number | string> = { year };
    results.forEach((r) => {
      const period = r.periods[m];
      if (period) {
        point[r.lenderName] = Math.round(period.closingBalance);
      }
    });
    data.push(point);
  }

  return (
    <div className="bg-[#16213e] border border-[#1e3a5f] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Remaining balance over time</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
            tickFormatter={(v) => formatCurrency(v, market, 0).replace(/[€£$]/, '').trim()}
            width={70}
          />
          <Tooltip
            contentStyle={{ background: '#0f3460', border: '1px solid #1e3a5f', borderRadius: '8px' }}
            labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
            formatter={(v: unknown, name: unknown) => [formatCurrency(v as number, market), String(name)]}
            labelFormatter={(l) => `Year ${l}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
          {results.map((r, i) => (
            <Line
              key={r.id}
              type="monotone"
              dataKey={r.lenderName}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
