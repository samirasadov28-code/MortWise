'use client';

import { useState } from 'react';
import type { WizardState, MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { formatCurrency } from '@/lib/formatting';
import { convertCurrency, COMPARISON_CURRENCIES } from '@/lib/fx';
import Tooltip from '@/components/shared/Tooltip';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries/en';

interface Step2Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const BUYER_TYPE_KEY: Record<string, TranslationKey> = {
  first_time: 'step3.firstTime',
  mover: 'step3.mover',
  investor: 'step3.investor',
  non_resident: 'step3.nonResident',
};

export default function Step2Property({ state, onChange }: Step2Props) {
  const { t, language } = useTranslation();
  const [depositMode, setDepositMode] = useState<'amount' | 'percent'>('amount');
  const market = MARKETS[state.market];

  // Currency the user enters values in. Defaults to the local market currency
  // (the "base case"). All values stored on state are always in local currency.
  const displayMarket: MarketCode = state.displayCurrencyMarket ?? state.market;
  const displayCurrency = MARKETS[displayMarket].currency;
  const sym = MARKETS[displayMarket].currencySymbol;
  const isLocal = displayMarket === state.market;
  // 1 unit local = `localToDisplay` units of display currency.
  const localToDisplay = convertCurrency(1, state.market, displayMarket);
  const displayToLocal = convertCurrency(1, displayMarket, state.market);

  const ltv = state.housePrice > 0 ? (state.housePrice - state.deposit) / state.housePrice : 0;
  const ltvBand = market.ltvBands.find((b) => ltv <= b.maxLtv) ?? market.ltvBands[market.ltvBands.length - 1];

  function handlePriceChange(displayVal: number) {
    const localVal = Math.round(displayVal * displayToLocal);
    const newDeposit = depositMode === 'percent'
      ? localVal * (state.deposit / (state.housePrice || 1))
      : state.deposit;
    onChange({ housePrice: localVal, deposit: Math.min(newDeposit, localVal) });
  }

  function handleDepositAmount(displayVal: number) {
    const localVal = Math.round(displayVal * displayToLocal);
    onChange({ deposit: Math.min(localVal, state.housePrice) });
  }

  function handleDepositPercent(pct: number) {
    onChange({ deposit: (pct / 100) * state.housePrice });
  }

  function handleOtherFeesChange(displayVal: number) {
    onChange({ otherFees: Math.round(displayVal * displayToLocal) });
  }

  const depositPct = state.housePrice > 0 ? (state.deposit / state.housePrice) * 100 : 0;
  const loanAmount = state.housePrice - state.deposit;

  // Display-currency values for the inputs
  const housePriceDisplay = Math.round(state.housePrice * localToDisplay);
  const depositDisplay = Math.round(state.deposit * localToDisplay);
  const otherFeesDisplay = Math.round(state.otherFees * localToDisplay);

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2a2520] mb-1">{t('step2.title')}</h2>
      <p className="text-[#6b7a8a] text-sm mb-6">
        {t('step2.subtitle')}
      </p>

      <div className="space-y-5">
        {/* Currency selector — local market currency is the base case */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
              {t('step2.enterValuesIn')}
              <Tooltip content={t('step2.currencyTooltip', { currency: market.currency, market: market.name })} />
            </label>
            <select
              value={displayMarket}
              onChange={(e) => onChange({ displayCurrencyMarket: e.target.value as MarketCode })}
              className="w-full px-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] focus:outline-none focus:border-[#4a7c96] transition-colors"
            >
              <option value={state.market}>
                {market.currency} — {t('step2.localOption', { market: market.name })}
              </option>
              {COMPARISON_CURRENCIES
                .filter((c) => c.market !== state.market)
                .map((c) => (
                  <option key={c.market} value={c.market}>
                    {c.label} — {MARKETS[c.market].name}
                  </option>
                ))}
            </select>
          </div>
          {!isLocal && (
            <div className="text-xs text-[#6b7a8a] flex-shrink-0 pb-2">
              1 {displayCurrency} ≈ {displayToLocal.toFixed(displayToLocal > 100 ? 0 : 4)} {market.currency}
            </div>
          )}
        </div>

        {/* Property price */}
        <div>
          <label className="block text-sm font-medium text-[#2a2520] mb-1.5">
            {t('step2.propertyPrice')}
          </label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
            <FormattedNumberInput
              value={housePriceDisplay}
              onValueChange={handlePriceChange}
              min={0}
              placeholder="400,000"
              className="w-full pl-4 pr-14 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
            />
          </div>
          {!isLocal && state.housePrice > 0 && (
            <p className="text-xs text-[#6b7a8a] mt-1.5">
              ≈ {formatCurrency(state.housePrice, state.market)} {t('step2.inLocalCurrency')}
            </p>
          )}
        </div>

        {/* Deposit */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-[#2a2520] flex items-center gap-1">
              {t('step2.deposit')}
              <Tooltip content={t('step2.depositTooltip')} />
            </label>
            <div className="flex text-xs bg-[#f9f7f4] rounded-lg overflow-hidden border border-[#e8e3dc]">
              <button
                type="button"
                onClick={() => setDepositMode('amount')}
                className={`px-3 py-1 transition-colors ${depositMode === 'amount' ? 'bg-[#4a7c96] text-white' : 'text-[#6b7a8a] hover:text-[#4a7c96]'}`}
              >
                {sym} {t('step2.amount')}
              </button>
              <button
                type="button"
                onClick={() => setDepositMode('percent')}
                className={`px-3 py-1 transition-colors ${depositMode === 'percent' ? 'bg-[#4a7c96] text-white' : 'text-[#6b7a8a] hover:text-[#4a7c96]'}`}
              >
                % {t('step2.percent')}
              </button>
            </div>
          </div>

          {depositMode === 'amount' ? (
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
              <FormattedNumberInput
                value={depositDisplay}
                onValueChange={handleDepositAmount}
                min={0}
                max={housePriceDisplay}
                placeholder="80,000"
                className="w-full pl-4 pr-14 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
              />
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                value={depositPct.toFixed(1)}
                onChange={(e) => handleDepositPercent(Number(e.target.value))}
                className="w-full pl-4 pr-8 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
                placeholder="20"
                min={0}
                max={100}
                step={0.5}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">%</span>
            </div>
          )}

          {/* LTV indicator */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#6b7a8a]">
              {t('step2.loan')}: {formatCurrency(loanAmount, state.market)} {t('step2.at')} <span className="font-semibold text-[#2a2520]">{(ltv * 100).toFixed(1)}% LTV</span>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              ltv <= 0.6 ? 'bg-green-50 text-green-700' :
              ltv <= 0.8 ? 'bg-sky-50 text-sky-700' :
              ltv <= 0.9 ? 'bg-amber-50 text-amber-700' :
              'bg-red-50 text-red-600'
            }`}>
              {ltvBand.label} — {ltvBand.description}
            </span>
          </div>
        </div>

        {/* Other fees */}
        <div>
          <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
            {t('step2.otherFees')}
            <Tooltip content={t('step2.otherFeesTooltip')} />
          </label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">{sym}</span>
            <FormattedNumberInput
              value={otherFeesDisplay}
              onValueChange={handleOtherFeesChange}
              min={0}
              placeholder="5,000"
              className="w-full pl-4 pr-14 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] placeholder-[#9aa5b0] focus:outline-none focus:border-[#4a7c96] transition-colors"
            />
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={state.otherFeesCoveredByDebt}
              onChange={(e) => onChange({ otherFeesCoveredByDebt: e.target.checked })}
              className="rounded border-[#e8e3dc] bg-[#f9f7f4] accent-[#4a7c96]"
            />
            <span className="text-xs text-[#6b7a8a]">{t('step2.rollFeesIntoMortgage')}</span>
          </label>
        </div>

        {/* Property type — new build vs secondary affects stamp duty / VAT in many countries */}
        <div>
          <label className="block text-sm font-medium text-[#2a2520] mb-1.5 flex items-center gap-1">
            {t('step2.propertyType')}
            <Tooltip content={t('step2.propertyTypeTooltip')} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ propertyType: 'secondary' })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                state.propertyType === 'secondary'
                  ? 'border-[#4a7c96] bg-[#4a7c96]/10'
                  : 'border-[#e8e3dc] bg-white hover:border-[#4a7c96]/50'
              }`}
            >
              <p className="text-sm font-medium text-[#2a2520]">{t('step2.secondaryMarket')}</p>
              <p className="text-xs text-[#6b7a8a] mt-0.5">{t('step2.secondaryMarketDesc')}</p>
            </button>
            <button
              type="button"
              onClick={() => onChange({ propertyType: 'new_build' })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                state.propertyType === 'new_build'
                  ? 'border-[#4a7c96] bg-[#4a7c96]/10'
                  : 'border-[#e8e3dc] bg-white hover:border-[#4a7c96]/50'
              }`}
            >
              <p className="text-sm font-medium text-[#2a2520]">{t('step2.newBuild')}</p>
              <p className="text-xs text-[#6b7a8a] mt-0.5">{t('step2.newBuildDesc')}</p>
            </button>
          </div>
        </div>

        {/* Purchase date — independent month + year so any year is reachable
            in one click instead of paging through a native month picker. */}
        <div>
          <label className="block text-sm font-medium text-[#2a2520] mb-1.5">
            {t('step2.purchaseDate')}
          </label>
          {(() => {
            const [yearStr, monthStr] = (state.purchaseDate || '').split('-');
            const yearNum = Number(yearStr) || new Date().getFullYear();
            const monthNum = Number(monthStr) || (new Date().getMonth() + 1);
            // Use the active language's locale to format month names so e.g.
            // French shows "Janvier", German "Januar", etc. without us having
            // to maintain 12 keys × 12 langs by hand.
            const locale = language === 'en' ? 'en-IE' : language;
            const monthFmt = new Intl.DateTimeFormat(locale, { month: 'long' });
            const months = Array.from({ length: 12 }, (_, i) =>
              monthFmt.format(new Date(2024, i, 1)),
            );
            const currentYear = new Date().getFullYear();
            const yearStart = currentYear - 10;
            const years = Array.from({ length: 21 }, (_, i) => yearStart + i);
            if (!years.includes(yearNum)) years.push(yearNum);
            years.sort((a, b) => a - b);

            const update = (y: number, m: number) => {
              const mm = String(m).padStart(2, '0');
              onChange({ purchaseDate: `${y}-${mm}` });
            };

            return (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={monthNum}
                  onChange={(e) => update(yearNum, Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] focus:outline-none focus:border-[#4a7c96] transition-colors"
                  aria-label={t('step2.purchaseMonth')}
                >
                  {months.map((label, i) => (
                    <option key={label} value={i + 1}>{label}</option>
                  ))}
                </select>
                <select
                  value={yearNum}
                  onChange={(e) => update(Number(e.target.value), monthNum)}
                  className="w-full px-4 py-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-[#2a2520] focus:outline-none focus:border-[#4a7c96] transition-colors"
                  aria-label={t('step2.purchaseYear')}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            );
          })()}
        </div>

        {/* Stamp duty preview */}
        <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#6b7a8a] uppercase tracking-wide mb-1">
            {t('step2.estimatedStampDuty')}
          </p>
          <p className="text-lg font-bold text-[#2a2520]">
            {formatCurrency(
              market.stampDuty(state.housePrice, {
                buyerType: state.buyerType,
                propertyType: state.propertyType,
              }),
              state.market,
            )}
          </p>
          <p className="text-xs text-[#6b7a8a] mt-0.5">
            {t('step2.stampDutyFootnote', {
              market: market.name,
              buyer: t(BUYER_TYPE_KEY[state.buyerType] ?? 'step3.firstTime').toLowerCase(),
              property: state.propertyType === 'new_build' ? t('step2.newBuild').toLowerCase() : t('step2.secondaryMarket').toLowerCase(),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
