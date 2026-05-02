'use client';

import { useMemo, useState } from 'react';
import type { ScenarioInput, WizardState, MarketCode } from '@/lib/types';
import { runAmortisation } from '@/lib/engine/amortisation';
import { formatCurrencyIn } from '@/lib/formatting';

interface SensitivityPanelProps {
  state: WizardState;
  displayMarket?: MarketCode;
}

/**
 * Interactive multi-axis sensitivity playground. Adjust any combination of
 * sliders below to see the joint impact on monthly payment and total amount
 * paid. The base scenario is the cheapest one in the wizard.
 *
 * Supports:
 *  - Rate shock: −3pp to +5pp on the contract rate (handles falling AND rising)
 *  - Forward rate change: a one-off rate shift in N years (models a remortgage
 *    or fixed-rate roll-off — applied via the variableRate so it kicks in
 *    after the fixed period).
 *  - Term ±10 years
 *  - Deposit ±15pp
 *  - Cashback 0–5%
 *  - Payment holiday 0–18 months
 */
export default function SensitivityPanel({ state, displayMarket }: SensitivityPanelProps) {
  const baseScenario = state.scenarios[0];
  const dm: MarketCode = displayMarket ?? state.market;
  const fmt = (v: number) => formatCurrencyIn(v, state.market, dm);
  const baseRate = (baseScenario?.fixedRate ?? baseScenario?.variableRate) ?? 0;
  const baseTerm = state.mortgageTerm;
  const baseDepositPct = state.housePrice > 0 ? state.deposit / state.housePrice : 0.2;

  const [rateShockBp, setRateShockBp] = useState(0);          // basis points, -300..+500
  const [futureShockBp, setFutureShockBp] = useState(0);      // applied after fixed period rolls off
  const [futureShockYear, setFutureShockYear] = useState(5);
  const [termDelta, setTermDelta] = useState(0);              // years, -10..+10
  const [depositDeltaPp, setDepositDeltaPp] = useState(0);    // pp, -15..+15
  const [cashbackPct, setCashbackPct] = useState(((baseScenario?.cashbackPercent ?? 0) * 100));
  const [holidayMonths, setHolidayMonths] = useState(0);

  const result = useMemo(() => {
    if (!baseScenario || state.housePrice <= 0) return null;

    const rateShock = rateShockBp / 10_000;
    const futureShock = futureShockBp / 10_000;
    const futureMonth = Math.max(0, Math.round(futureShockYear * 12));
    const newTerm = Math.max(5, Math.min(40, baseTerm + termDelta));
    const newDepositPct = Math.min(0.95, Math.max(0.0, baseDepositPct + depositDeltaPp / 100));
    const newLTV = 1 - newDepositPct;

    // Build a "what-if" scenario.
    // Rate shock applies during the fixed period; future shock applies once the
    // loan rolls onto the variable rate (after fixedPeriodYears) — by adding it
    // to the variableRate we model a remortgage / curve forecast.
    // If the user explicitly chose a forward year shorter than fixedPeriodYears,
    // shorten the fixed period to that year so the future shock takes effect.
    let fixedPeriod = baseScenario.fixedPeriodYears ?? 0;
    if (futureShockBp !== 0 && futureMonth / 12 < fixedPeriod) {
      fixedPeriod = futureMonth / 12;
    }

    const input: ScenarioInput = {
      ...baseScenario,
      housePrice: state.housePrice,
      loanToValue: newLTV,
      mortgageTerm: newTerm,
      rateStructure: 'fixed',
      fixedRate: Math.max(0, (baseScenario.fixedRate ?? baseRate) + rateShock),
      fixedPeriodYears: fixedPeriod,
      variableRate: Math.max(
        0,
        (baseScenario.variableRate ?? baseRate) + rateShock + futureShock,
      ),
      cashbackPercent: cashbackPct / 100,
      cashbackClawbackYears: cashbackPct > 0 ? 5 : undefined,
      holidayStart: holidayMonths > 0 ? 1 : undefined,
      holidayDuration: holidayMonths > 0 ? holidayMonths : undefined,
    };

    const r = runAmortisation(input);
    const baseR = runAmortisation({
      ...baseScenario,
      housePrice: state.housePrice,
      loanToValue: 1 - baseDepositPct,
      mortgageTerm: baseTerm,
    });

    const adjustedTotal = r.totalAmountPaid - r.cashbackReceived;
    const baseTotal = baseR.totalAmountPaid - baseR.cashbackReceived;
    return {
      monthly: r.firstMonthlyPayment,
      total: adjustedTotal,
      delta: adjustedTotal - baseTotal,
      deltaPct: baseTotal > 0 ? (adjustedTotal - baseTotal) / baseTotal : 0,
      baseTotal,
      baseMonthly: baseR.firstMonthlyPayment,
      newRate: input.fixedRate ?? baseRate,
      newTerm,
      newDepositPct,
      futureRate: input.variableRate,
    };
  }, [
    baseScenario, state.housePrice, baseRate, baseTerm, baseDepositPct,
    rateShockBp, futureShockBp, futureShockYear, termDelta, depositDeltaPp,
    cashbackPct, holidayMonths,
  ]);

  function reset() {
    setRateShockBp(0);
    setFutureShockBp(0);
    setFutureShockYear(5);
    setTermDelta(0);
    setDepositDeltaPp(0);
    setCashbackPct((baseScenario?.cashbackPercent ?? 0) * 100);
    setHolidayMonths(0);
  }

  if (!baseScenario || !result) {
    return (
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <p className="text-sm text-[#6b7a8a]">
          No base scenario available. Add at least one lender scenario to run sensitivity analysis.
        </p>
      </div>
    );
  }

  const positive = result.delta > 0;
  const isBase =
    rateShockBp === 0 && futureShockBp === 0 && termDelta === 0 &&
    depositDeltaPp === 0 && Math.abs(cashbackPct - (baseScenario.cashbackPercent ?? 0) * 100) < 0.01 &&
    holidayMonths === 0;

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#6b7a8a]">
          Drag the sliders to combine multiple shocks at once. The result panel
          updates live and shows the combined impact on monthly payment and
          total amount paid versus your base scenario.
        </p>
        <button
          type="button"
          onClick={reset}
          disabled={isBase}
          className="text-xs px-3 py-1.5 border border-[#e8e3dc] rounded-lg text-[#6b7a8a] hover:text-[#4a7c96] hover:border-[#4a7c96] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Live result panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#eef4f7]/60 border border-[#4a7c96]/20 rounded-lg p-4">
        <Stat label="New monthly" value={fmt(result.monthly)} />
        <Stat label="New total paid" value={fmt(result.total)} />
        <Stat
          label="Δ vs base"
          value={
            isBase ? '—'
              : `${positive ? '+' : ''}${fmt(result.delta)}`
          }
          tone={isBase ? 'neutral' : positive ? 'bad' : 'good'}
        />
        <Stat
          label="Δ %"
          value={isBase ? '—' : `${(result.deltaPct * 100).toFixed(2)}%`}
          tone={isBase ? 'neutral' : positive ? 'bad' : 'good'}
        />
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Slider
          label="Rate shock now"
          help="Shift the contract rate up (rises) or down (cuts) by basis points."
          unit="pp"
          value={rateShockBp / 100}
          onChange={(pp) => setRateShockBp(Math.round(pp * 100))}
          min={-3}
          max={5}
          step={0.25}
          fmt={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} pp → ${((baseRate + v / 100) * 100).toFixed(2)}%`}
        />

        <Slider
          label="Future rate move"
          help="One-off rate shift applied at the year below — models a remortgage / forward curve."
          unit="pp"
          value={futureShockBp / 100}
          onChange={(pp) => setFutureShockBp(Math.round(pp * 100))}
          min={-3}
          max={5}
          step={0.25}
          fmt={(v) =>
            v === 0
              ? 'No future change'
              : `${v >= 0 ? '+' : ''}${v.toFixed(2)} pp from year ${futureShockYear}`
          }
        />

        <Slider
          label="Future change starts at year"
          help="The year the rate move above kicks in."
          unit="y"
          value={futureShockYear}
          onChange={setFutureShockYear}
          min={1}
          max={Math.min(30, baseTerm)}
          step={1}
          fmt={(v) => `Year ${v}`}
          disabled={futureShockBp === 0}
        />

        <Slider
          label="Term"
          help="Lengthen or shorten the loan in years."
          unit="y"
          value={termDelta}
          onChange={setTermDelta}
          min={-10}
          max={10}
          step={1}
          fmt={(v) => `${v >= 0 ? '+' : ''}${v} yr → ${result.newTerm} yrs total`}
        />

        <Slider
          label="Deposit %"
          help="Bigger deposit shrinks the loan; smaller deposit grows it."
          unit="pp"
          value={depositDeltaPp}
          onChange={setDepositDeltaPp}
          min={-15}
          max={15}
          step={1}
          fmt={(v) => `${v >= 0 ? '+' : ''}${v} pp → ${(result.newDepositPct * 100).toFixed(0)}%`}
        />

        <Slider
          label="Cashback %"
          help="Lender cashback at drawdown, netted off total cost."
          unit="%"
          value={cashbackPct}
          onChange={setCashbackPct}
          min={0}
          max={5}
          step={0.25}
          fmt={(v) => (v === 0 ? 'None' : `${v.toFixed(2)}%`)}
        />

        <Slider
          label="Payment holiday"
          help="Months of zero payments at the start. Interest still accrues and capitalises."
          unit="mo"
          value={holidayMonths}
          onChange={setHolidayMonths}
          min={0}
          max={18}
          step={1}
          fmt={(v) => (v === 0 ? 'None' : `${v} months`)}
        />
      </div>

      <p className="text-[11px] text-[#6b7a8a]/70">
        Base scenario: {baseScenario.lenderName} · {(baseRate * 100).toFixed(2)}% · {baseTerm} yrs ·
        {' '}{fmt(result.baseMonthly)}/mo · {fmt(result.baseTotal)} total.
      </p>
    </div>
  );
}

function Slider({
  label,
  help,
  value,
  onChange,
  min,
  max,
  step,
  fmt,
  disabled,
  unit,
}: {
  label: string;
  help: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  disabled?: boolean;
  unit: string;
}) {
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-[#2a2520]">{label}</label>
        <span className="text-xs text-[#4a7c96] font-mono">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#4a7c96]"
        aria-label={`${label} slider in ${unit}`}
      />
      <p className="text-[11px] text-[#6b7a8a]/70 mt-0.5 leading-snug">{help}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'good' | 'bad' | 'neutral';
}) {
  const tones: Record<string, string> = {
    good: 'text-green-700',
    bad: 'text-red-600',
    neutral: 'text-[#2a2520]',
  };
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7a8a]">{label}</p>
      <p className={`text-lg font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
