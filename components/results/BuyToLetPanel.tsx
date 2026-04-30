'use client';

import { useMemo, useState } from 'react';
import type { WizardState, ScenarioResult } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrency, formatPercent } from '@/lib/formatting';

interface BuyToLetPanelProps {
  state: WizardState;
  results: ScenarioResult[];
}

/**
 * Estimate of net annual rental management overhead expressed as a fraction of
 * gross rent. Covers: letting agent (~10%), repairs/maintenance (~10%), insurance,
 * void periods, taxes excluded (income tax handled separately by the user).
 */
const DEFAULT_OPERATING_COST_RATIO = 0.25;

export default function BuyToLetPanel({ state, results }: BuyToLetPanelProps) {
  const market = MARKETS[state.market];
  const best = useMemo(
    () => [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0],
    [results],
  );

  // Sensible starting guess: 0.4% of property value per month — close to long-run
  // gross yields in major Euro/US/UK city markets. User can override.
  const [monthlyRent, setMonthlyRent] = useState<number>(() =>
    Math.round(state.housePrice * 0.004),
  );
  const [opexRatio, setOpexRatio] = useState<number>(DEFAULT_OPERATING_COST_RATIO);
  const [occupancy, setOccupancy] = useState<number>(0.95);

  if (!best) return null;

  const stampDuty = market.stampDuty(state.housePrice, {
    buyerType: 'investor',
    propertyType: state.propertyType,
  });

  const cashInvested = state.deposit + stampDuty + state.otherFees;

  const grossAnnualRent = monthlyRent * 12 * occupancy;
  const netAnnualRent = grossAnnualRent * (1 - opexRatio);
  const annualMortgage = best.firstMonthlyPayment * 12;
  const annualCashFlow = netAnnualRent - annualMortgage;

  const grossYield = state.housePrice > 0 ? grossAnnualRent / state.housePrice : 0;
  const netYield = state.housePrice > 0 ? netAnnualRent / state.housePrice : 0;
  const cashOnCash = cashInvested > 0 ? annualCashFlow / cashInvested : 0;

  // Break-even occupancy = the occupancy at which net rent covers the mortgage exactly
  const monthlyAtFullOccupancy = monthlyRent * (1 - opexRatio);
  const breakEvenOccupancy =
    monthlyAtFullOccupancy > 0 ? best.firstMonthlyPayment / monthlyAtFullOccupancy : 1;

  const cashFlowPositive = annualCashFlow >= 0;

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <p className="text-sm text-[#6b7a8a] mb-4">
        Treat this property as a buy-to-let. Adjust the assumptions below to see whether the
        rent covers the mortgage and what return you earn on the cash you put in.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Monthly rent
          </label>
          <input
            type="number"
            min={0}
            value={monthlyRent || ''}
            onChange={(e) => setMonthlyRent(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Opex %
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={Math.round(opexRatio * 100)}
            onChange={(e) => setOpexRatio(Math.min(100, Math.max(0, Number(e.target.value))) / 100)}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
          <p className="text-[11px] text-[#6b7a8a]/70 mt-1">Agent, repairs, voids, insurance</p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            Occupancy %
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={Math.round(occupancy * 100)}
            onChange={(e) => setOccupancy(Math.min(100, Math.max(0, Number(e.target.value))) / 100)}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
        </div>
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Metric
          label="Gross yield"
          value={formatPercent(grossYield, 2)}
          tone="neutral"
        />
        <Metric
          label="Net yield"
          value={formatPercent(netYield, 2)}
          tone="neutral"
        />
        <Metric
          label="Annual cash flow"
          value={formatCurrency(annualCashFlow, state.market)}
          tone={cashFlowPositive ? 'good' : 'bad'}
        />
        <Metric
          label="Cash-on-cash"
          value={formatPercent(cashOnCash, 1)}
          tone={cashOnCash > 0 ? 'good' : 'bad'}
        />
      </div>

      {/* Detail rows */}
      <dl className="text-sm divide-y divide-[#e8e3dc]/60 border-t border-[#e8e3dc]/60">
        <Row label="Cash invested (deposit + stamp duty + fees)" value={formatCurrency(cashInvested, state.market)} />
        <Row label="Stamp duty at investor rate" value={formatCurrency(stampDuty, state.market)} />
        <Row label="Gross rent / year" value={formatCurrency(grossAnnualRent, state.market)} />
        <Row label="Net rent / year (after opex)" value={formatCurrency(netAnnualRent, state.market)} />
        <Row label="Mortgage payments / year" value={formatCurrency(annualMortgage, state.market)} />
        <Row
          label="Break-even occupancy"
          value={breakEvenOccupancy <= 1 ? formatPercent(breakEvenOccupancy, 0) : '> 100% (cannot break even at this rent)'}
          highlight={breakEvenOccupancy > 0.95}
        />
      </dl>

      <p className="text-[11px] text-[#6b7a8a]/70 mt-3 leading-relaxed">
        Calculation uses {market.name}&rsquo;s investor stamp duty schedule and the cheapest
        scenario&rsquo;s mortgage payment. Excludes income tax on rent — varies by country and your
        personal tax position.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'good' | 'bad' | 'neutral';
}) {
  const tones: Record<string, string> = {
    good: 'text-green-700',
    bad: 'text-red-600',
    neutral: 'text-[#2a2520]',
  };
  return (
    <div className="bg-[#f9f7f4] rounded-lg p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7a8a]">{label}</p>
      <p className={`text-lg font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-[#6b7a8a]">{label}</dt>
      <dd className={`font-semibold ${highlight ? 'text-amber-700' : 'text-[#2a2520]'}`}>{value}</dd>
    </div>
  );
}
