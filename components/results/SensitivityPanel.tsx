'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ScenarioInput, WizardState, MarketCode } from '@/lib/types';
import { runAmortisation } from '@/lib/engine/amortisation';
import { formatCurrencyIn } from '@/lib/formatting';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import OnboardingTip from '@/components/shared/OnboardingTip';
import { useOnboardingFlag } from '@/lib/useOnboardingFlag';

interface SensitivityPanelProps {
  state: WizardState;
  displayMarket?: MarketCode;
}

export default function SensitivityPanel({ state, displayMarket }: SensitivityPanelProps) {
  const { t } = useTranslation();
  const baseScenario = state.scenarios[0];
  const dm: MarketCode = displayMarket ?? state.market;
  const fmt = (v: number) => formatCurrencyIn(v, state.market, dm);
  const baseRate = (baseScenario?.fixedRate ?? baseScenario?.variableRate) ?? 0;
  const baseTerm = state.mortgageTerm;
  const baseDepositPct = state.housePrice > 0 ? state.deposit / state.housePrice : 0.2;

  const [rateShockBp, setRateShockBp] = useState(0);
  const [futureShockBp, setFutureShockBp] = useState(0);
  const [futureShockYear, setFutureShockYear] = useState(5);
  const [termDelta, setTermDelta] = useState(0);
  const [depositDeltaPp, setDepositDeltaPp] = useState(0);
  const [cashbackPct, setCashbackPct] = useState(((baseScenario?.cashbackPercent ?? 0) * 100));
  const [holidayMonths, setHolidayMonths] = useState(0);
  const [showSliderTip, dismissSliderTip] = useOnboardingFlag('mortwise_seen_sensitivity_tip');

  // Auto-dismiss the tip as soon as the user moves any slider.
  useEffect(() => {
    if (!showSliderTip) return;
    const moved = rateShockBp !== 0 || futureShockBp !== 0 || termDelta !== 0 ||
      depositDeltaPp !== 0 || holidayMonths !== 0;
    if (moved) dismissSliderTip();
  }, [rateShockBp, futureShockBp, termDelta, depositDeltaPp, holidayMonths, showSliderTip, dismissSliderTip]);

  const result = useMemo(() => {
    if (!baseScenario || state.housePrice <= 0) return null;

    const rateShock = rateShockBp / 10_000;
    const futureShock = futureShockBp / 10_000;
    const futureMonth = Math.max(0, Math.round(futureShockYear * 12));
    const newTerm = Math.max(5, Math.min(40, baseTerm + termDelta));
    const newDepositPct = Math.min(0.95, Math.max(0.0, baseDepositPct + depositDeltaPp / 100));
    const newLTV = 1 - newDepositPct;

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
        <p className="text-sm text-[#6b7a8a]">{t('sensitivity.noBase')}</p>
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
      {showSliderTip && (
        <OnboardingTip onDismiss={dismissSliderTip}>
          <p className="text-sm text-[#2a2520]">
            <span className="font-semibold">Try dragging a slider</span> — the monthly payment and total cost update live.
            Start with <strong>Rate shock now</strong> to see the impact of a +1% rate rise on your scenario.
          </p>
        </OnboardingTip>
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#6b7a8a]">{t('sensitivity.intro')}</p>
        <button
          type="button"
          onClick={reset}
          disabled={isBase}
          className="text-xs px-3 py-1.5 border border-[#e8e3dc] rounded-lg text-[#6b7a8a] hover:text-[#4a7c96] hover:border-[#4a7c96] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t('sensitivity.reset')}
        </button>
      </div>

      {/* Live result panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#eef4f7]/60 border border-[#4a7c96]/20 rounded-lg p-4">
        <Stat label={t('sensitivity.newMonthly')} value={fmt(result.monthly)} />
        <Stat label={t('sensitivity.newTotalPaid')} value={fmt(result.total)} />
        <Stat
          label={t('sensitivity.deltaVsBase')}
          value={isBase ? '—' : `${positive ? '+' : ''}${fmt(result.delta)}`}
          tone={isBase ? 'neutral' : positive ? 'bad' : 'good'}
        />
        <Stat
          label={t('sensitivity.deltaPct')}
          value={isBase ? '—' : `${(result.deltaPct * 100).toFixed(2)}%`}
          tone={isBase ? 'neutral' : positive ? 'bad' : 'good'}
        />
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Slider
          label={t('sensitivity.rateShockLabel')}
          help={t('sensitivity.rateShockHelp')}
          unit="pp"
          value={rateShockBp / 100}
          onChange={(pp) => setRateShockBp(Math.round(pp * 100))}
          min={-3}
          max={5}
          step={0.25}
          fmt={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} pp → ${((baseRate + v / 100) * 100).toFixed(2)}%`}
        />

        <Slider
          label={t('sensitivity.futureRateLabel')}
          help={t('sensitivity.futureRateHelp')}
          unit="pp"
          value={futureShockBp / 100}
          onChange={(pp) => setFutureShockBp(Math.round(pp * 100))}
          min={-3}
          max={5}
          step={0.25}
          fmt={(v) =>
            v === 0
              ? t('sensitivity.noFutureChange')
              : t('sensitivity.futureFromYear', {
                  delta: `${v >= 0 ? '+' : ''}${v.toFixed(2)}`,
                  year: futureShockYear,
                })
          }
        />

        <Slider
          label={t('sensitivity.futureStartLabel')}
          help={t('sensitivity.futureStartHelp')}
          unit="y"
          value={futureShockYear}
          onChange={setFutureShockYear}
          min={1}
          max={Math.min(30, baseTerm)}
          step={1}
          fmt={(v) => t('sensitivity.yearN', { n: v })}
          disabled={futureShockBp === 0}
        />

        <Slider
          label={t('sensitivity.termLabel')}
          help={t('sensitivity.termHelp')}
          unit="y"
          value={termDelta}
          onChange={setTermDelta}
          min={-10}
          max={10}
          step={1}
          fmt={(v) =>
            t('sensitivity.termChangeFmt', {
              delta: `${v >= 0 ? '+' : ''}${v}`,
              total: result.newTerm,
            })
          }
        />

        <Slider
          label={t('sensitivity.depositLabel')}
          help={t('sensitivity.depositHelp')}
          unit="pp"
          value={depositDeltaPp}
          onChange={setDepositDeltaPp}
          min={-15}
          max={15}
          step={1}
          fmt={(v) => `${v >= 0 ? '+' : ''}${v} pp → ${(result.newDepositPct * 100).toFixed(0)}%`}
        />

        <Slider
          label={t('sensitivity.cashbackLabel')}
          help={t('sensitivity.cashbackHelp')}
          unit="%"
          value={cashbackPct}
          onChange={setCashbackPct}
          min={0}
          max={5}
          step={0.25}
          fmt={(v) => (v === 0 ? t('sensitivity.none') : `${v.toFixed(2)}%`)}
        />

        <Slider
          label={t('sensitivity.holidayLabel')}
          help={t('sensitivity.holidayHelp')}
          unit="mo"
          value={holidayMonths}
          onChange={setHolidayMonths}
          min={0}
          max={18}
          step={1}
          fmt={(v) => (v === 0 ? t('sensitivity.none') : t('sensitivity.holidayMonths', { n: v }))}
        />
      </div>

      <p className="text-[11px] text-[#6b7a8a]/70">
        {t('sensitivity.baseSummary', {
          lender: baseScenario.lenderName,
          rate: (baseRate * 100).toFixed(2),
          term: String(baseTerm),
          monthly: `${fmt(result.baseMonthly)}/mo`,
          total: fmt(result.baseTotal),
        })}
      </p>
    </div>
  );
}

function Slider({
  label, help, value, onChange, min, max, step, fmt, disabled, unit,
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
  label, value, tone = 'neutral',
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
