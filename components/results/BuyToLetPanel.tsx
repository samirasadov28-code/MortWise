'use client';

import { useEffect, useMemo, useState } from 'react';
import type { WizardState, ScenarioResult, MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrencyIn, formatPercent } from '@/lib/formatting';
import { newtonRaphsonIRR } from '@/lib/engine/irr';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface BuyToLetPanelProps {
  state: WizardState;
  results: ScenarioResult[];
  displayMarket?: MarketCode;
}

const DEFAULT_OPERATING_COST_RATIO = 0.25;

export default function BuyToLetPanel({ state, results, displayMarket }: BuyToLetPanelProps) {
  const { t } = useTranslation();
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
  const [appreciation, setAppreciation] = useState<number>(0.03);
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
      if (paybackYear === null && cumulativeNetCash >= 0) paybackYear = y;
    }

    const irrAnnual = newtonRaphsonIRR(cashflows, 0.05);
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
      grossYr1, netYr1, annualMortgageYr1, annualCashFlowYr1,
      grossYield, netYield, cashYield, breakEvenOccupancy,
      irrAnnual, paybackYear, totalRent, totalNetRent,
    };
  }, [best, monthlyRent, opexRatio, occupancy, appreciation, holdYears, rentInflation, state.housePrice, cashInvested]);

  if (!best || !analysis) return null;
  const cashFlowPositive = analysis.annualCashFlowYr1 >= 0;

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <p className="text-sm text-[#6b7a8a] mb-4">{t('btl.intro')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <CurrencyField
          label={t('btl.monthlyRent')}
          value={monthlyRent}
          setValue={setMonthlyRent}
          symbol={market.currencySymbol}
          placeholder="2,000"
        />
        <NumberField label={t('btl.opex')} value={Math.round(opexRatio * 100)} setValue={(v) => setOpexRatio(v / 100)} suffix="%" max={100} placeholder="25" />
        <NumberField label={t('btl.occupancy')} value={Math.round(occupancy * 100)} setValue={(v) => setOccupancy(v / 100)} suffix="%" max={100} placeholder="95" />
        <NumberField label={t('btl.holdYears')} value={holdYears} setValue={setHoldYears} min={1} max={state.mortgageTerm} placeholder="10" />
        <NumberField label={t('btl.rentInflation')} value={Math.round(rentInflation * 1000) / 10} setValue={(v) => setRentInflation(v / 100)} suffix="%" allowDecimal placeholder="2.0" />
        <NumberField label={t('btl.appreciation')} value={Math.round(appreciation * 1000) / 10} setValue={(v) => setAppreciation(v / 100)} suffix="%" allowDecimal placeholder="3.0" />
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Metric label={t('btl.grossYield')} value={formatPercent(analysis.grossYield, 2)} tone="neutral" />
        <Metric label={t('btl.netYield')} value={formatPercent(analysis.netYield, 2)} tone="neutral" />
        <Metric label={t('btl.cashYield')} value={formatPercent(analysis.cashYield, 1)} tone={analysis.cashYield > 0 ? 'good' : 'bad'} />
        <Metric
          label={t('btl.irr', { years: holdYears })}
          value={analysis.irrAnnual === null || analysis.irrAnnual === undefined ? '—' : formatPercent(analysis.irrAnnual, 1)}
          tone={(analysis.irrAnnual ?? 0) > 0 ? 'good' : 'bad'}
        />
      </div>

      {/* Detail rows */}
      <dl className="text-sm divide-y divide-[#e8e3dc]/60 border-t border-[#e8e3dc]/60">
        <Row label={t('btl.cashInvested')} value={fmt(cashInvested)} />
        <Row label={t('btl.stampDuty')} value={fmt(stampDuty)} />
        <Row label={t('btl.yr1GrossRent')} value={fmt(analysis.grossYr1)} />
        <Row label={t('btl.yr1NetRent')} value={fmt(analysis.netYr1)} />
        <Row label={t('btl.yr1Mortgage')} value={fmt(analysis.annualMortgageYr1)} />
        <Row
          label={t('btl.yr1CashFlow')}
          value={fmt(analysis.annualCashFlowYr1)}
          tone={cashFlowPositive ? 'good' : 'bad'}
        />
        <Row
          label={t('btl.payback')}
          value={
            analysis.paybackYear === null
              ? t('btl.paybackNotWithin', { years: holdYears })
              : t('btl.paybackYear', { n: analysis.paybackYear })
          }
          tone={analysis.paybackYear === null ? 'bad' : 'good'}
        />
        <Row
          label={t('btl.breakEvenOccupancy')}
          value={
            analysis.breakEvenOccupancy <= 1
              ? formatPercent(analysis.breakEvenOccupancy, 0)
              : t('btl.breakEvenOver100')
          }
          tone={analysis.breakEvenOccupancy > 0.95 ? 'bad' : 'neutral'}
        />
      </dl>

      {/* Market risk notes */}
      {market.regulatoryNotes.length > 0 && (
        <details className="mt-5 group">
          <summary className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] cursor-pointer hover:text-[#4a7c96]">
            {t('btl.rulesTitle', { market: market.name })}
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

      <p className="text-[11px] text-[#6b7a8a]/70 mt-3 leading-relaxed">{t('btl.footnote')}</p>
    </div>
  );
}

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
    if (cleaned === '' || cleaned === '.') { setValue(0); return; }
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
  const tones: Record<string, string> = { good: 'text-green-700', bad: 'text-red-600', neutral: 'text-[#2a2520]' };
  return (
    <div className="bg-[#f9f7f4] rounded-lg p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7a8a]">{label}</p>
      <p className={`text-lg font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const tones: Record<string, string> = { good: 'text-green-700', bad: 'text-red-600', neutral: 'text-[#2a2520]' };
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-[#6b7a8a]">{label}</dt>
      <dd className={`font-semibold ${tones[tone ?? 'neutral']}`}>{value}</dd>
    </div>
  );
}
