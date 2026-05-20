'use client';

import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ScenarioInput, MarketCode } from '@/lib/types';
import { compareHoliday, type HolidayComparison } from '@/lib/engine/holiday';
import { formatCurrencyIn } from '@/lib/formatting';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface HolidayPanelProps {
  primaryInput: ScenarioInput;
  market: MarketCode;
  displayMarket?: MarketCode;
}

/**
 * Interest holiday / payment-pause simulator. The user enters when the pause
 * starts (in months from today) and how long it lasts, then clicks Run.
 * Charts show outstanding balance and monthly payment over time so the
 * "balance jumps up + payment resets higher" dynamic is obvious.
 */
export default function HolidayPanel({ primaryInput, market, displayMarket }: HolidayPanelProps) {
  const { t } = useTranslation();
  const dm = displayMarket ?? market;
  const fmt = (v: number) => formatCurrencyIn(v, market, dm);

  // String inputs so users can fully delete digits and retype them.
  const [holidayStartStr, setHolidayStartStr] = useState<string>('24');
  const [holidayDurationStr, setHolidayDurationStr] = useState<string>('3');

  const [comparison, setComparison] = useState<HolidayComparison | null>(null);

  const totalMonths = primaryInput.mortgageTerm * 12;
  const holidayStart = Math.max(1, Math.min(totalMonths - 12, Number(holidayStartStr) || 1));
  const holidayDuration = Math.max(1, Math.min(24, Number(holidayDurationStr) || 1));
  const inputsValid =
    Number(holidayStartStr) > 0 && Number(holidayDurationStr) > 0;

  function calculate() {
    if (!inputsValid) {
      setComparison(null);
      return;
    }
    setComparison(compareHoliday(primaryInput, holidayStart, holidayDuration));
  }

  function reset() {
    setHolidayStartStr('24');
    setHolidayDurationStr('3');
    setComparison(null);
  }

  const chartData = useMemo(() => {
    if (!comparison) return [];
    const maxLen = Math.max(
      comparison.baseline.periods.length,
      comparison.withHoliday.periods.length,
    );
    const data: Record<string, number>[] = [];
    for (let m = 0; m < maxLen; m += 12) {
      const year = Math.floor(m / 12) + 1;
      const base = comparison.baseline.periods[m];
      const hol = comparison.withHoliday.periods[m];
      data.push({
        year,
        baselineBalance: base ? Math.round(base.closingBalance) : 0,
        holidayBalance: hol ? Math.round(hol.closingBalance) : 0,
        baselinePayment: base ? Math.round(base.totalPayment) : 0,
        holidayPayment: hol ? Math.round(hol.totalPayment) : 0,
      });
    }
    return data;
  }, [comparison]);

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#2a2520] mb-1">{t('holiday.title')}</h3>
      <p className="text-xs text-[#6b7a8a] mb-4">
        {t('holiday.intro')}
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            {t('holiday.startMonth')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={holidayStartStr}
            onChange={(e) => setHolidayStartStr(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="24"
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
          <p className="text-[11px] text-[#6b7a8a]/70 mt-1">
            {t('holiday.startMonthHint', { max: totalMonths - 12 })}
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            {t('holiday.duration')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={holidayDurationStr}
            onChange={(e) => setHolidayDurationStr(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="3"
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
          <p className="text-[11px] text-[#6b7a8a]/70 mt-1">
            {t('holiday.durationHint')}
          </p>
        </div>
      </div>

      {/* Run button */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={calculate}
          disabled={!inputsValid}
          className="px-4 py-2 bg-[#4a7c96] hover:bg-[#3a6a82] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {t('holiday.runSim')}
        </button>
        {comparison && (
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 border border-[#e8e3dc] hover:border-[#4a7c96] text-[#6b7a8a] hover:text-[#4a7c96] text-sm rounded-lg transition-colors"
          >
            {t('sens.reset')}
          </button>
        )}
        <p className="text-xs text-[#6b7a8a] ml-auto">
          {inputsValid
            ? t('holiday.plan', { duration: holidayDuration, start: holidayStart })
            : t('holiday.invalidInputs')}
        </p>
      </div>

      {comparison && (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Stat label={t('holiday.extraInterest')} value={fmt(comparison.extraInterest)} tone="bad" />
            <Stat label={t('holiday.balanceAtEnd')} value={fmt(comparison.balanceAtHolidayEnd)} tone="neutral" />
            <Stat label={t('holiday.newMonthly')} value={`${fmt(comparison.newMonthlyPayment)}/${t('stress.perMonth')}`} tone="warning" />
            <Stat label={t('holiday.totalExtra')} value={fmt(comparison.totalExtraCost)} tone="bad" />
          </div>

          {/* Balance over time */}
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
              {t('holiday.balanceOverTime')}
              <span className="ml-2 font-normal text-[#6b7a8a]/80 normal-case tracking-normal">
                {t('holiday.balanceOverTimeNote')}
              </span>
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e3dc" />
                <XAxis dataKey="year" stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
                <YAxis stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v).replace(/[€£$A¥₴₪]/g, '').trim()} width={70} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e8e3dc', borderRadius: '8px' }}
                  formatter={(v: unknown) => [fmt(v as number), '']}
                  labelFormatter={(l) => `Year ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="baselineBalance" stroke="#9aa5b0" strokeWidth={1.5} dot={false} name="No pause" />
                <Line type="monotone" dataKey="holidayBalance" stroke="#f59e0b" strokeWidth={2} dot={false} name="With pause" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly payment over time */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
              Monthly payment over time
              <span className="ml-2 font-normal text-[#6b7a8a]/80 normal-case tracking-normal">
                · Drops to 0 during pause, then resumes higher to amortise the new balance.
              </span>
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e3dc" />
                <XAxis dataKey="year" stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
                <YAxis stroke="#9aa5b0" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v).replace(/[€£$A¥₴₪]/g, '').trim()} width={70} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e8e3dc', borderRadius: '8px' }}
                  formatter={(v: unknown) => [fmt(v as number), '']}
                  labelFormatter={(l) => `Year ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="baselinePayment" stroke="#9aa5b0" strokeWidth={1.5} dot={false} name="No pause" />
                <Line type="monotone" dataKey="holidayPayment" stroke="#f59e0b" strokeWidth={2} dot={false} name="With pause" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'good' | 'bad' | 'warning' | 'neutral' }) {
  const tones: Record<string, string> = {
    good: 'text-green-700',
    bad: 'text-red-600',
    warning: 'text-amber-700',
    neutral: 'text-[#2a2520]',
  };
  return (
    <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
      <p className="text-xs text-[#6b7a8a] mb-1">{label}</p>
      <p className={`text-base font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
