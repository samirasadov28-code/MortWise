'use client';

import { useEffect, useMemo, useState } from 'react';
import type { WizardState, ScenarioResult, MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrencyIn, formatPercent } from '@/lib/formatting';
import { newtonRaphsonIRR } from '@/lib/engine/irr';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';

interface BuyToLetPanelProps {
  state: WizardState;
  results: ScenarioResult[];
  /** Display currency. Defaults to local market currency. */
  displayMarket?: MarketCode;
}

const DEFAULT_OPERATING_COST_RATIO = 0.25;

export default function BuyToLetPanel({ state, results, displayMarket }: BuyToLetPanelProps) {
  const market = MARKETS[state.market];
  const dm: MarketCode = displayMarket ?? state.market;
  const fmt = (v: number) => formatCurrencyIn(v, state.market, dm);
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

      {/* Inputs — monthly rent uses FormattedNumberInput (commas, currency on right);
          percentage / year fields use draft-string state so the user can fully
          delete the value and retype, including the last "0". */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <CurrencyField
          label="Monthly rent"
          value={monthlyRent}
          setValue={setMonthlyRent}
          symbol={market.currencySymbol}
          placeholder="2,000"
        />
        <NumberField label="Opex %" value={Math.round(opexRatio * 100)} setValue={(v) => setOpexRatio(v / 100)} suffix="%" max={100} placeholder="25" />
        <NumberField label="Occupancy %" value={Math.round(occupancy * 100)} setValue={(v) => setOccupancy(v / 100)} suffix="%" max={100} placeholder="95" />
        <NumberField label="Hold (yrs)" value={holdYears} setValue={setHoldYears} min={1} max={state.mortgageTerm} placeholder="10" />
        <NumberField label="Rent inflation %/yr" value={Math.round(rentInflation * 1000) / 10} setValue={(v) => setRentInflation(v / 100)} suffix="%" allowDecimal placeholder="2.0" />
        <NumberField label="Property appreciation %/yr" value={Math.round(appreciation * 1000) / 10} setValue={(v) => setAppreciation(v / 100)} suffix="%" allowDecimal placeholder="3.0" />
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
        <Row label="Cash invested (deposit + stamp duty + fees)" value={fmt(cashInvested)} />
        <Row label="Stamp duty at investor rate" value={fmt(stampDuty)} />
        <Row label="Year-1 gross rent" value={fmt(analysis.grossYr1)} />
        <Row label="Year-1 net rent (after opex)" value={fmt(analysis.netYr1)} />
        <Row label="Year-1 mortgage payments" value={fmt(analysis.annualMortgageYr1)} />
        <Row
          label="Year-1 cash flow"
          value={fmt(analysis.annualCashFlowYr1)}
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

/**
 * Currency input with comma-separator formatting and the currency symbol on
 * the right. Reuses our shared FormattedNumberInput which already lets the
 * user fully delete the digits — including the last "0" — and treats empty
 * as 0 internally.
 */
function CurrencyField({
  label, value, setValue, symbol, placeholder,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  symbol: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <FormattedNumberInput
          value={value}
          onValueChange={setValue}
          min={0}
          placeholder={placeholder}
          className="w-full pl-3 pr-12 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-xs pointer-events-none">{symbol}</span>
      </div>
    </div>
  );
}

/**
 * Plain numeric input that holds its own draft-string state so the user can
 * fully delete the digits — including the last 0 — without the parent's
 * number snapping back into the input. Syncs to parent on every keystroke.
 * Resyncs from the parent when the parent's value changes externally
 * (e.g. on Reset).
 */
function NumberField({
  label, value, setValue, min, max, suffix, allowDecimal, placeholder,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  allowDecimal?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState<string>(value === 0 ? '' : String(value));
  // Re-sync if the parent's value drifts away from what our string would parse to.
  useEffect(() => {
    const parsed = Number(draft);
    if (Number.isFinite(parsed) && parsed === value) return;
    setDraft(value === 0 ? '' : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(raw: string) {
    const allowed = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
    const cleaned = raw.replace(allowed, '');
    setDraft(cleaned);
    if (cleaned === '' || cleaned === '.') {
      setValue(0);
      return;
    }
    let n = Number(cleaned);
    if (!Number.isFinite(n)) return;
    if (typeof max === 'number' && n > max) n = max;
    if (typeof min === 'number' && n < min) n = min;
    setValue(n);
  }

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-3 ${suffix ? 'pr-9' : 'pr-3'} py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-xs pointer-events-none">{suffix}</span>
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
