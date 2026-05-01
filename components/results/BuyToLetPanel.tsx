'use client';

import { useMemo, useState } from 'react';
import type { WizardState, ScenarioResult } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import { newtonRaphsonIRR } from '@/lib/engine/irr';

interface BuyToLetPanelProps {
  state: WizardState;
  results: ScenarioResult[];
}

const DEFAULT_OPERATING_COST_RATIO = 0.25;

export default function BuyToLetPanel({ state, results }: BuyToLetPanelProps) {
  const market = MARKETS[state.market];
  const best = useMemo(
    () => [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0],
    [results],
  );

  const [monthlyRent, setMonthlyRent] = useState<number>(() => Math.round(state.housePrice * 0.004));
  const [opexRatio, setOpexRatio] = useState<number>(DEFAULT_OPERATING_COST_RATIO);
  const [occupancy, setOccupancy] = useState<number>(0.95);
  const [appreciation, setAppreciation] = useState<number>(0.03); // 3% pa default
  const [holdYears, setHoldYears] = useState<number>(10);
  const [rentInflation, setRentInflation] = useState<number>(0.02);

  const stampDuty = market.stampDuty(state.housePrice, {
    buyerType: 'investor',
    propertyType: state.propertyType,
  });
  const cashInvested = state.deposit + stampDuty + state.otherFees;

  const analysis = useMemo(() => {
    if (!best) return null;
    const months = Math.min(holdYears * 12, best.periods.length);

    // Annual flows: rent grows with rentInflation. Mortgage payment uses the
    // first-month figure (we keep it flat — close enough for a quick yield view).
    const monthlyMortgage = best.firstMonthlyPayment;

    const cashflows: number[] = [-cashInvested];
    let cumulativeNetCash = -cashInvested;
    let paybackYear: number | null = null;
    let totalRent = 0;
    let totalNetRent = 0;

    for (let y = 1; y <= holdYears; y++) {
      const grossYearRent = monthlyRent * 12 * occupancy * Math.pow(1 + rentInflation, y - 1);
      const netYearRent = grossYearRent * (1 - opexRatio);
      const yearMortgage = monthlyMortgage * 12;
      const yearCash = netYearRent - yearMortgage;
      totalRent += grossYearRent;
      totalNetRent += netYearRent;

      // For IRR: in the final year, add exit equity = property value − remaining balance
      let inflow = yearCash;
      if (y === holdYears) {
        const exitMonthIdx = Math.min(months - 1, best.periods.length - 1);
        const remainingBalance = best.periods[exitMonthIdx]?.closingBalance ?? 0;
        const propertyValue = state.housePrice * Math.pow(1 + appreciation, y);
        const exitEquity = propertyValue - remainingBalance;
        inflow += exitEquity;
      }
      cashflows.push(inflow);

      cumulativeNetCash += yearCash;
      if (paybackYear === null && cumulativeNetCash >= 0) {
        paybackYear = y;
      }
    }

    const irrAnnual = newtonRaphsonIRR(cashflows, 0.05);

    // Year-1 metrics for headline yields
    const grossYr1 = monthlyRent * 12 * occupancy;
    const netYr1 = grossYr1 * (1 - opexRatio);
    const annualMortgageYr1 = monthlyMortgage * 12;
    const annualCashFlowYr1 = netYr1 - annualMortgageYr1;

    const grossYield = state.housePrice > 0 ? grossYr1 / state.housePrice : 0;
    const netYield = state.housePrice > 0 ? netYr1 / state.housePrice : 0;
    const cashYield = cashInvested > 0 ? annualCashFlowYr1 / cashInvested : 0;
    const breakEvenOccupancy =
      monthlyRent * (1 - opexRatio) > 0 ? monthlyMortgage / (monthlyRent * (1 - opexRatio)) : 1;

    return {
      grossYr1,
      netYr1,
      annualMortgageYr1,
      annualCashFlowYr1,
      grossYield,
      netYield,
      cashYield,
      breakEvenOccupancy,
      irrAnnual,
      paybackYear,
      totalRent,
      totalNetRent,
    };
  }, [best, monthlyRent, opexRatio, occupancy, appreciation, holdYears, rentInflation, state.housePrice, cashInvested]);

  if (!best || !analysis) return null;
  const cashFlowPositive = analysis.annualCashFlowYr1 >= 0;

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <p className="text-sm text-[#6b7a8a] mb-4">
        Treat this property as a buy-to-let. Adjust the assumptions below to see whether the
        rent covers the mortgage, what return you earn on cash invested, and when the
        deal pays itself back.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <Field label="Monthly rent" value={monthlyRent} setValue={setMonthlyRent} step={50} prefix={market.currencySymbol} />
        <Field label="Opex %" value={Math.round(opexRatio * 100)} setValue={(v) => setOpexRatio(v / 100)} step={1} suffix="%" max={100} />
        <Field label="Occupancy %" value={Math.round(occupancy * 100)} setValue={(v) => setOccupancy(v / 100)} step={1} suffix="%" max={100} />
        <Field label="Hold (yrs)" value={holdYears} setValue={setHoldYears} step={1} min={1} max={state.mortgageTerm} />
        <Field label="Rent inflation %/yr" value={Math.round(rentInflation * 1000) / 10} setValue={(v) => setRentInflation(v / 100)} step={0.5} suffix="%" />
        <Field label="Property appreciation %/yr" value={Math.round(appreciation * 1000) / 10} setValue={(v) => setAppreciation(v / 100)} step={0.5} suffix="%" />
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Metric label="Gross yield" value={formatPercent(analysis.grossYield, 2)} tone="neutral" />
        <Metric label="Net yield" value={formatPercent(analysis.netYield, 2)} tone="neutral" />
        <Metric label="Cash yield" value={formatPercent(analysis.cashYield, 1)} tone={analysis.cashYield > 0 ? 'good' : 'bad'} />
        <Metric
          label={`IRR (${holdYears}yr)`}
          value={analysis.irrAnnual === null || analysis.irrAnnual === undefined ? '—' : formatPercent(analysis.irrAnnual, 1)}
          tone={(analysis.irrAnnual ?? 0) > 0 ? 'good' : 'bad'}
        />
      </div>

      {/* Detail rows */}
      <dl className="text-sm divide-y divide-[#e8e3dc]/60 border-t border-[#e8e3dc]/60">
        <Row label="Cash invested (deposit + stamp duty + fees)" value={formatCurrency(cashInvested, state.market)} />
        <Row label="Stamp duty at investor rate" value={formatCurrency(stampDuty, state.market)} />
        <Row label="Year-1 gross rent" value={formatCurrency(analysis.grossYr1, state.market)} />
        <Row label="Year-1 net rent (after opex)" value={formatCurrency(analysis.netYr1, state.market)} />
        <Row label="Year-1 mortgage payments" value={formatCurrency(analysis.annualMortgageYr1, state.market)} />
        <Row
          label="Year-1 cash flow"
          value={formatCurrency(analysis.annualCashFlowYr1, state.market)}
          tone={cashFlowPositive ? 'good' : 'bad'}
        />
        <Row
          label="Payback (cumulative cash flow ≥ deposit + fees)"
          value={
            analysis.paybackYear === null
              ? `Not within ${holdYears} years at these assumptions`
              : `Year ${analysis.paybackYear}`
          }
          tone={analysis.paybackYear === null ? 'bad' : 'good'}
        />
        <Row
          label="Break-even occupancy (Y1)"
          value={analysis.breakEvenOccupancy <= 1 ? formatPercent(analysis.breakEvenOccupancy, 0) : '> 100% (rent never covers mortgage)'}
          tone={analysis.breakEvenOccupancy > 0.95 ? 'bad' : 'neutral'}
        />
      </dl>

      {/* Market risk notes — surface the regulatory environment that can shift */}
      {market.regulatoryNotes.length > 0 && (
        <details className="mt-5 group">
          <summary className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] cursor-pointer hover:text-[#4a7c96]">
            How rules, rates &amp; terms can change in {market.name}
          </summary>
          <ul className="mt-2 space-y-1.5 text-xs text-[#6b7a8a]">
            {market.regulatoryNotes.map((n, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#4a7c96] mt-0.5">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-[11px] text-[#6b7a8a]/70 mt-3 leading-relaxed">
        IRR uses your hold period (default 10y) and includes year-end exit equity:
        property value × (1+appreciation)^N minus the remaining mortgage balance.
        Excludes income tax on rent — varies by country and your personal tax position.
      </p>
    </div>
  );
}

function Field({
  label, value, setValue, step, prefix, suffix, min, max,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  step: number;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{prefix}</span>
        )}
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          max={max}
          onChange={(e) => setValue(Number(e.target.value))}
          className={`w-full ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'good' | 'bad' | 'neutral' }) {
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

function Row({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const tones: Record<string, string> = {
    good: 'text-green-700',
    bad: 'text-red-600',
    neutral: 'text-[#2a2520]',
  };
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-[#6b7a8a]">{label}</dt>
      <dd className={`font-semibold ${tones[tone ?? 'neutral']}`}>{value}</dd>
    </div>
  );
}
