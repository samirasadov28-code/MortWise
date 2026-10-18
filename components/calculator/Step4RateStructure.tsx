'use client';

import type { WizardState, RateStructure, MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { convertCurrency } from '@/lib/fx';
import { formatCurrency } from '@/lib/formatting';
import Tooltip from '@/components/shared/Tooltip';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries/en';

interface Step4Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const RATE_STRUCTURES: Array<{
  value: RateStructure;
  labelKey: TranslationKey;
  taglineKey: TranslationKey;
  descKey: TranslationKey;
  icon: string;
}> = [
  { value: 'fixed',    labelKey: 'step4.fixed.label',    taglineKey: 'step4.fixed.tagline',    descKey: 'step4.fixed.desc',    icon: '🔒' },
  { value: 'variable', labelKey: 'step4.variable.label', taglineKey: 'step4.variable.tagline', descKey: 'step4.variable.desc', icon: '📈' },
  { value: 'split',    labelKey: 'step4.split.label',    taglineKey: 'step4.split.tagline',    descKey: 'step4.split.desc',    icon: '⚖️' },
  { value: 'tracker',  labelKey: 'step4.tracker.label',  taglineKey: 'step4.tracker.tagline',  descKey: 'step4.tracker.desc',  icon: '🎯' },
];

export default function Step4RateStructure({ state, onChange }: Step4Props) {
  const { t } = useTranslation();
  const selected = state.rateStructure;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2a2520] mb-1">{t('step4.title')}</h2>
      <p className="text-[#6b7a8a] text-sm mb-6">
        {t('step4.subtitle')}
      </p>

      <div className="space-y-3 mb-6">
        {RATE_STRUCTURES.map((rs) => (
          <button
            key={rs.value}
            type="button"
            onClick={() => onChange({ rateStructure: rs.value })}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected === rs.value
                ? 'border-[#4a7c96] bg-[#4a7c96]/10'
                : 'border-[#e8e3dc] bg-[#eef4f7]/60 hover:border-[#4a7c96]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{rs.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2a2520]">{t(rs.labelKey)}</span>
                  <span className="text-xs text-[#6b7a8a]">— {t(rs.taglineKey)}</span>
                </div>
                {selected === rs.value && (
                  <p className="text-sm text-[#6b7a8a] mt-1">{t(rs.descKey)}</p>
                )}
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === rs.value ? 'border-[#4a7c96] bg-[#4a7c96]' : 'border-[#e8e3dc]'
                }`}>
                  {selected === rs.value && <span className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Split rate slider */}
      {selected === 'split' && (
        <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-xl p-4">
          <label className="block text-sm font-medium text-[#2a2520] mb-3 flex items-center gap-1">
            {t('step4.splitSlider')}
            <Tooltip content={t('step4.splitSliderTooltip')} />
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={Math.round(state.splitFixedProportion * 100)}
              onChange={(e) => onChange({ splitFixedProportion: Number(e.target.value) / 100 })}
              className="w-full accent-[#4a7c96]"
            />
            <div className="flex justify-between text-sm">
              <span className="text-[#2a2520] font-medium">
                {Math.round(state.splitFixedProportion * 100)}% {t('step4.fixedShort')}
              </span>
              <span className="text-[#6b7a8a]">
                {100 - Math.round(state.splitFixedProportion * 100)}% {t('step4.trackerShort')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mortgage term */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
          {t('step4.mortgageTerm')}
          <Tooltip content={t('step4.mortgageTermTooltip')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={40}
            step={1}
            value={state.mortgageTerm}
            onChange={(e) => onChange({ mortgageTerm: Number(e.target.value) })}
            className="flex-1 accent-[#4a7c96]"
          />
          <div className="flex-shrink-0 w-24">
            <div className="relative">
              <input
                type="number"
                value={state.mortgageTerm}
                onChange={(e) => onChange({ mortgageTerm: Math.min(40, Math.max(5, Number(e.target.value))) })}
                className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-center focus:outline-none focus:border-[#4a7c96] transition-colors"
                min={5}
                max={40}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b7a8a]">{t('step4.yearAbbr')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cashback */}
      {(() => {
        const displayMarket: MarketCode = state.displayCurrencyMarket ?? state.market;
        const sym = MARKETS[displayMarket].currencySymbol;
        const isLocal = displayMarket === state.market;
        const localToDisplay = convertCurrency(1, state.market, displayMarket);
        const displayToLocal = convertCurrency(1, displayMarket, state.market);
        const cashbackDisplay = Math.round(state.wizardCashbackAmount * localToDisplay);
        const requestedLoan = Math.max(0, state.housePrice - state.deposit);
        const impliedPct = requestedLoan > 0 ? state.wizardCashbackAmount / requestedLoan : 0;
        return (
          <div className="mt-5">
            <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
              {t('step4.cashback')}
              <Tooltip content={t('step4.cashbackTooltip')} />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#6b7a8a] mb-1">{t('step4.cashbackAmount')}</p>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
                  <FormattedNumberInput
                    value={cashbackDisplay}
                    onValueChange={(v) => onChange({ wizardCashbackAmount: Math.round(v * displayToLocal) })}
                    min={0}
                    placeholder="0"
                    className="w-full pl-4 pr-14 py-2.5 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
                  />
                </div>
                {!isLocal && state.wizardCashbackAmount > 0 && (
                  <p className="text-[11px] text-[#6b7a8a] mt-1">
                    ≈ {formatCurrency(state.wizardCashbackAmount, state.market)} {t('step2.inLocalCurrency')}
                  </p>
                )}
                {state.wizardCashbackAmount > 0 && requestedLoan > 0 && (
                  <p className="text-[11px] text-[#6b7a8a] mt-1">
                    {(impliedPct * 100).toFixed(2)}% {t('step4.ofLoanAmount')}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-[#6b7a8a] mb-1">{t('step4.clawbackYears')}</p>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={state.wizardCashbackClawbackYears}
                  onChange={(e) => onChange({ wizardCashbackClawbackYears: Math.min(10, Math.max(0, Number(e.target.value))) })}
                  className="w-full px-4 py-2.5 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] focus:outline-none focus:border-[#4a7c96] transition-colors"
                />
                <p className="text-[11px] text-[#6b7a8a] mt-1">
                  {t('step4.clawbackHint')}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Payment holiday */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
          {t('step4.paymentHoliday')}
          <Tooltip content={t('step4.paymentHolidayTooltip')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={24}
            step={1}
            value={state.paymentHolidayMonths}
            onChange={(e) => onChange({ paymentHolidayMonths: Number(e.target.value) })}
            className="flex-1 accent-[#4a7c96]"
          />
          <div className="flex-shrink-0 w-24">
            <div className="relative">
              <input
                type="number"
                value={state.paymentHolidayMonths}
                onChange={(e) => onChange({ paymentHolidayMonths: Math.min(24, Math.max(0, Number(e.target.value))) })}
                className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-center focus:outline-none focus:border-[#4a7c96] transition-colors"
                min={0}
                max={24}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b7a8a]">{t('step4.monthAbbr')}</span>
            </div>
          </div>
        </div>
        {state.paymentHolidayMonths > 0 && (
          <p className="text-xs text-amber-700 mt-2">
            {t('step4.paymentHolidayWarning')}
          </p>
        )}
      </div>
    </div>
  );
}
