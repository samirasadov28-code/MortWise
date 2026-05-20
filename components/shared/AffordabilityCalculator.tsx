'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MarketCode } from '@/lib/types';
import { MARKETS, LAUNCH_MARKETS } from '@/lib/markets';
import { computeAffordability } from '@/lib/affordability';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';
import Flag from '@/components/shared/Flag';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { track } from '@/lib/analytics';

const inputClass =
  'w-full px-3 py-2 border border-[#e8e3dc] rounded-lg bg-white text-[#2a2520] focus:outline-none focus:border-[#4a7c96] text-sm';

const DEFAULT_RATE_PCT = 4.0;
const DEFAULT_TERM_YEARS = 30;

const PREFILL_KEY = 'mortwise_wizard';

interface AffordabilityCalculatorProps {
  initialMarket?: MarketCode;
}

export default function AffordabilityCalculator({
  initialMarket = 'IE',
}: AffordabilityCalculatorProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [market, setMarket] = useState<MarketCode>(initialMarket);
  const [annualIncome, setAnnualIncome] = useState<number>(70_000);
  const [coIncome, setCoIncome] = useState<number>(0);
  const [monthlyDebt, setMonthlyDebt] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(50_000);
  const [ratePct, setRatePct] = useState<number>(DEFAULT_RATE_PCT);
  const [termYears, setTermYears] = useState<number>(DEFAULT_TERM_YEARS);

  const cfg = MARKETS[market];

  const result = useMemo(
    () =>
      computeAffordability({
        market,
        annualIncome,
        coBorrowerAnnualIncome: coIncome,
        monthlyDebtPayments: monthlyDebt,
        deposit,
        annualInterestRate: ratePct / 100,
        termYears,
      }),
    [market, annualIncome, coIncome, monthlyDebt, deposit, ratePct, termYears],
  );

  function handleHandoff() {
    if (typeof window === 'undefined') return;
    // Pre-populate the wizard with what the user just typed so they don't have
    // to re-enter the basics. The calculator page merges this over its
    // defaults via { ...DEFAULT_WIZARD_STATE, ...JSON.parse(saved) }.
    const prefill = {
      step: 1,
      market,
      housePrice: Math.round(result.maxPurchasePrice),
      deposit: Math.round(deposit),
      annualIncome: Math.round(annualIncome),
      coBorrowerIncome: Math.round(coIncome),
      mortgageTerm: termYears,
    };
    try {
      window.localStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
    } catch {
      // localStorage unavailable — proceed anyway
    }
    track('affordability_handoff', { market, binding: result.binding });
    router.push('/calculator');
  }

  // Fire one event per "the user has stopped typing" so we don't spam GA on
  // every keystroke. 600ms after the result settles is a reasonable proxy.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (result.maxPurchasePrice <= 0) return;
      track('affordability_calculated', {
        market,
        binding: result.binding,
        maxLoan: Math.round(result.maxLoan),
      });
    }, 600);
    return () => window.clearTimeout(id);
  }, [market, result.maxPurchasePrice, result.maxLoan, result.binding]);

  const bindingLabel: Record<typeof result.binding, string> = {
    income_multiple: t('aff.bindingIncome'),
    dti: t('aff.bindingDTI'),
    ltv: t('aff.bindingLTV'),
  };

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg sm:text-xl font-bold text-[#2a2520]">
          {t('aff.title')}
        </h3>
        <p className="text-xs sm:text-sm text-[#6b7a8a] mt-1">{t('aff.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#6b7a8a] mb-1.5">
            {t('aff.market')}
          </label>
          <div className="relative">
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as MarketCode)}
              className={`${inputClass} pl-9`}
            >
              {LAUNCH_MARKETS.map((code) => (
                <option key={code} value={code}>
                  {MARKETS[code].name} ({MARKETS[code].currency})
                </option>
              ))}
            </select>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <Flag code={market} size={20} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6b7a8a] mb-1.5">
            {t('aff.annualIncome')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">
              {cfg.currencySymbol}
            </span>
            <FormattedNumberInput
              value={annualIncome}
              onValueChange={setAnnualIncome}
              min={0}
              className={`${inputClass} pl-7`}
              ariaLabel={t('aff.annualIncome')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6b7a8a] mb-1.5">
            {t('aff.coBorrower')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">
              {cfg.currencySymbol}
            </span>
            <FormattedNumberInput
              value={coIncome}
              onValueChange={setCoIncome}
              min={0}
              className={`${inputClass} pl-7`}
              ariaLabel={t('aff.coBorrower')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6b7a8a] mb-1.5">
            {t('aff.deposit')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">
              {cfg.currencySymbol}
            </span>
            <FormattedNumberInput
              value={deposit}
              onValueChange={setDeposit}
              min={0}
              className={`${inputClass} pl-7`}
              ariaLabel={t('aff.deposit')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6b7a8a] mb-1.5">
            {t('aff.monthlyDebt')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-sm">
              {cfg.currencySymbol}
            </span>
            <FormattedNumberInput
              value={monthlyDebt}
              onValueChange={setMonthlyDebt}
              min={0}
              className={`${inputClass} pl-7`}
              ariaLabel={t('aff.monthlyDebt')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6b7a8a] mb-1.5">
            {t('aff.rate')} <span className="text-[#6b7a8a]/70">(% p.a.)</span>
          </label>
          <input
            type="number"
            value={ratePct}
            onChange={(e) => setRatePct(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
            step={0.1}
            min={0}
            max={20}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6b7a8a] mb-1.5">
            {t('aff.term')} <span className="text-[#6b7a8a]/70">(years)</span>
          </label>
          <input
            type="number"
            value={termYears}
            onChange={(e) => setTermYears(Math.max(5, Math.min(40, Number(e.target.value) || 0)))}
            step={1}
            min={5}
            max={40}
            className={inputClass}
          />
        </div>
      </div>

      {/* Headline result */}
      <div
        className="bg-[#eef4f7] border border-[#4a7c96]/20 rounded-xl p-5 mb-4"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="text-xs uppercase tracking-wide text-[#6b7a8a] mb-1">
          {t('aff.maxPrice')}
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-[#2a2520] tabular-nums">
          {formatCurrency(result.maxPurchasePrice, market)}
        </div>
        <div className="text-sm text-[#6b7a8a] mt-2">
          {t('aff.maxLoanLine', {
            loan: formatCurrency(result.maxLoan, market),
            payment: formatCurrency(result.monthlyPayment, market),
          })}
        </div>
        <div className="text-xs text-[#4a7c96] mt-2 font-medium">
          {t('aff.bindingLabel')}: {bindingLabel[result.binding]}
        </div>
      </div>

      {/* Constraint breakdown — small, secondary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5 text-xs">
        <ConstraintCell
          label={t('aff.byIncome')}
          value={formatCurrency(result.byIncomeMultiple, market)}
          note={`${result.incomeMultipleUsed.toFixed(1)}× ${
            result.incomeMultipleIsDefault ? t('aff.estimated') : t('aff.regulatory')
          }`}
          active={result.binding === 'income_multiple'}
        />
        <ConstraintCell
          label={t('aff.byDTI')}
          value={formatCurrency(result.byDTI, market)}
          note={`${formatPercent(result.dtiCapUsed)} ${t('aff.ofIncome')}`}
          active={result.binding === 'dti'}
        />
        <ConstraintCell
          label={t('aff.byLTV')}
          value={formatCurrency(result.byLTV, market)}
          note={`${t('aff.depositCovers')} ${formatPercent(1 - result.maxLTVUsed)}`}
          active={result.binding === 'ltv'}
        />
      </div>

      <button
        type="button"
        onClick={handleHandoff}
        className="block w-full text-center py-3 bg-[#4a7c96] hover:bg-[#3a6a82] rounded-lg text-white text-sm font-semibold transition-colors"
      >
        {t('aff.useInCalculator')}
      </button>
      <p className="text-[11px] text-[#6b7a8a] text-center mt-2 leading-relaxed">
        {t('aff.disclaimer')}
      </p>
    </div>
  );
}

function ConstraintCell({
  label,
  value,
  note,
  active,
}: {
  label: string;
  value: string;
  note: string;
  active: boolean;
}) {
  return (
    <div
      className={`px-3 py-2 rounded-lg border ${
        active
          ? 'border-[#4a7c96] bg-[#4a7c96]/10'
          : 'border-[#e8e3dc] bg-[#f9f7f4]'
      }`}
    >
      <div className="text-[10px] uppercase tracking-wide text-[#6b7a8a]">{label}</div>
      <div className={`font-semibold tabular-nums ${active ? 'text-[#4a7c96]' : 'text-[#2a2520]'}`}>
        {value}
      </div>
      <div className="text-[10px] text-[#6b7a8a]">{note}</div>
    </div>
  );
}
