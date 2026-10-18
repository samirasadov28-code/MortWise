'use client';

import { useState } from 'react';
import type { ScenarioResult, ScenarioInput } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { formatCurrencyIn } from '@/lib/formatting';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface StressTestPanelProps {
  results: ScenarioResult[];
  inputs: ScenarioInput[];
  market: MarketCode;
  displayMarket?: MarketCode;
}

const INCREMENTS = ['+0.5%', '+1.0%', '+1.5%', '+2.0%', '+3.0%'];

export default function StressTestPanel({ results, inputs, market, displayMarket }: StressTestPanelProps) {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState(INCREMENTS[1]);
  const dm = displayMarket ?? market;
  const fmt = (v: number) => formatCurrencyIn(v, market, dm);

  const fixedPeriodYears = inputs[0]?.fixedPeriodYears;

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-[#2a2520]">{t('stress.title')}</h3>
      </div>

      {fixedPeriodYears && (
        <p className="text-xs text-[#6b7a8a] mb-4">
          {t('stress.intro1')} <span className="text-[#2a2520] font-medium">{t('stress.years', { years: fixedPeriodYears })}</span>{t('stress.intro2')}
        </p>
      )}

      {/* Slider */}
      <div className="mb-5">
        <label className="block text-xs text-[#6b7a8a] mb-2">{t('stress.scenarioLabel')}</label>
        <div className="flex gap-2 flex-wrap">
          {INCREMENTS.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => setSelectedKey(inc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedKey === inc
                  ? 'bg-[#4a7c96] border-[#4a7c96] text-white'
                  : 'bg-[#f9f7f4] border-[#e8e3dc] text-[#6b7a8a] hover:text-[#4a7c96]'
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
            red: 'border-red-200 bg-red-900/10',
            amber: 'border-amber-300 bg-amber-900/10',
            green: 'border-green-200 bg-green-900/10',
          };
          const increaseColors = {
            red: 'text-red-600',
            amber: 'text-amber-700',
            green: 'text-green-700',
          };

          return (
            <div key={r.id} className={`p-4 rounded-lg border ${severityColors[severity]}`}>
              <p className="text-sm font-semibold text-[#2a2520] mb-2">{r.lenderName}</p>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-[#6b7a8a]">{t('stress.newPayment')}</p>
                  <p className="text-lg font-bold text-[#2a2520]">{fmt(newPayment)}/{t('stress.perMonth')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6b7a8a]">{t('stress.increase')}</p>
                  <p className={`text-sm font-semibold ${increaseColors[severity]}`}>
                    +{fmt(increase)}/{t('stress.perMonth')}
                  </p>
                  <p className={`text-xs ${increaseColors[severity]}`}>
                    +{(increasePct * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#6b7a8a] mt-2">
                {t('stress.extraInterest', { amount: fmt(stress.totalExtraInterest) })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
