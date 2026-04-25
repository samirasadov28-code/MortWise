'use client';

import { useState } from 'react';
import type { ScenarioResult, ScenarioInput } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { formatCurrency } from '@/lib/formatting';

interface StressTestPanelProps {
  results: ScenarioResult[];
  inputs: ScenarioInput[];
  market: MarketCode;
}

const INCREMENTS = ['+0.5%', '+1.0%', '+1.5%', '+2.0%', '+3.0%'];

export default function StressTestPanel({ results, inputs, market }: StressTestPanelProps) {
  const [selectedKey, setSelectedKey] = useState(INCREMENTS[1]);

  const fixedPeriodYears = inputs[0]?.fixedPeriodYears;

  return (
    <div className="bg-[#16213e] border border-[#1e3a5f] rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-white">Rate-rise stress test</h3>
      </div>

      {fixedPeriodYears && (
        <p className="text-xs text-[#94a3b8] mb-4">
          Your fixed period expires in <span className="text-white font-medium">{fixedPeriodYears} years</span>.
          If rates have moved by then, here is what your monthly payment becomes.
        </p>
      )}

      {/* Slider */}
      <div className="mb-5">
        <label className="block text-xs text-[#94a3b8] mb-2">Rate increase scenario</label>
        <div className="flex gap-2 flex-wrap">
          {INCREMENTS.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => setSelectedKey(inc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedKey === inc
                  ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                  : 'bg-[#0f3460] border-[#1e3a5f] text-[#94a3b8] hover:text-white'
              }`}
            >
              {inc}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {results.map((r) => {
          const stress = r.stressResults?.[selectedKey];
          if (!stress) return null;

          const basePayment = r.firstMonthlyPayment;
          const newPayment = stress.newMonthlyPayment;
          const increase = stress.paymentIncrease;
          const increasePct = basePayment > 0 ? increase / basePayment : 0;

          const severity = increasePct >= 0.4 ? 'red' : increasePct >= 0.2 ? 'amber' : 'green';
          const severityColors = {
            red: 'border-red-700/40 bg-red-900/10',
            amber: 'border-amber-600/40 bg-amber-900/10',
            green: 'border-green-700/40 bg-green-900/10',
          };
          const increaseColors = {
            red: 'text-red-400',
            amber: 'text-amber-400',
            green: 'text-green-400',
          };

          return (
            <div key={r.id} className={`p-4 rounded-lg border ${severityColors[severity]}`}>
              <p className="text-sm font-semibold text-white mb-2">{r.lenderName}</p>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-[#94a3b8]">New payment</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(newPayment, market)}/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#94a3b8]">Increase</p>
                  <p className={`text-sm font-semibold ${increaseColors[severity]}`}>
                    +{formatCurrency(increase, market)}/mo
                  </p>
                  <p className={`text-xs ${increaseColors[severity]}`}>
                    +{(increasePct * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">
                Extra interest: {formatCurrency(stress.totalExtraInterest, market)} total
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
