'use client';

import { useMemo, useState } from 'react';
import type { MarketCode, ScenarioInput, WizardState } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { getLenders } from '@/lib/lenders';
import { runAmortisation } from '@/lib/engine/amortisation';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import { convertCurrency, COMPARISON_CURRENCIES } from '@/lib/fx';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface ForeignCurrencyPanelProps {
  state: WizardState;
}

export default function ForeignCurrencyPanel({ state }: ForeignCurrencyPanelProps) {
  const { t } = useTranslation();
  const home = MARKETS[state.market];
  const baseScenario = state.scenarios[0];

  const [loanMarket, setLoanMarket] = useState<MarketCode>(
    home.currency === 'EUR' ? 'US' : 'IE',
  );
  const [fxStress, setFxStress] = useState<number>(0);

  const homeRate = (baseScenario?.fixedRate ?? baseScenario?.variableRate) ?? 0.04;
  const term = state.mortgageTerm;
  const ltv = state.housePrice > 0
    ? (state.housePrice - state.deposit) / state.housePrice
    : 0.8;

  const analysis = useMemo(() => {
    if (!baseScenario || state.housePrice <= 0) return null;

    const propertyPriceLocal = state.housePrice;
    const loanLocal = propertyPriceLocal * ltv;
    const loanForeign = convertCurrency(loanLocal, state.market, loanMarket);

    const foreignLenders = getLenders(loanMarket);
    const foreignRate = foreignLenders.length > 0
      ? foreignLenders.reduce((s, l) => s + l.fixedRate, 0) / foreignLenders.length
      : 0.04;

    const homeInput: ScenarioInput = {
      ...baseScenario,
      housePrice: propertyPriceLocal,
      loanToValue: ltv,
      mortgageTerm: term,
      rateStructure: 'fixed',
      fixedRate: homeRate,
      fixedPeriodYears: term,
      variableRate: homeRate,
    };
    const homeR = runAmortisation(homeInput);

    const foreignInput: ScenarioInput = {
      ...baseScenario,
      housePrice: propertyPriceLocal / convertCurrency(1, state.market, loanMarket),
      loanToValue: ltv,
      mortgageTerm: term,
      rateStructure: 'fixed',
      fixedRate: foreignRate,
      fixedPeriodYears: term,
      variableRate: foreignRate,
    };
    const foreignR = runAmortisation(foreignInput);

    const fxPerMonth = Math.pow(1 + fxStress / 100, 1 / 12);
    const baseFxRate = convertCurrency(1, loanMarket, state.market);
    let totalLocalEquivalent = 0;
    let firstPaymentLocal = 0;
    foreignR.periods.forEach((p, i) => {
      const fxAtMonth = baseFxRate * Math.pow(fxPerMonth, i);
      const localEquivalent = p.totalPayment * fxAtMonth;
      totalLocalEquivalent += localEquivalent;
      if (i === 0) firstPaymentLocal = localEquivalent;
    });

    return {
      loanLocal,
      loanForeign,
      homeRate,
      foreignRate,
      homeFirst: homeR.firstMonthlyPayment,
      foreignFirstForeignCcy: foreignR.firstMonthlyPayment,
      foreignFirstLocal: firstPaymentLocal,
      homeTotal: homeR.totalAmountPaid,
      foreignTotalForeign: foreignR.totalAmountPaid,
      fxAdjustedTotal: totalLocalEquivalent,
      savings: homeR.totalAmountPaid - totalLocalEquivalent,
    };
  }, [baseScenario, state.housePrice, state.market, ltv, term, homeRate, loanMarket, fxStress]);

  if (!baseScenario || !analysis) {
    return (
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <p className="text-sm text-[#6b7a8a]">{t('fx.noBase')}</p>
      </div>
    );
  }

  const cheaper = analysis.savings > 0;

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5 space-y-4">
      <p className="text-sm text-[#6b7a8a]">
        {t('fx.intro', { market: home.name, currency: home.currency })}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            {t('fx.borrowIn')}
          </label>
          <select
            value={loanMarket}
            onChange={(e) => setLoanMarket(e.target.value as MarketCode)}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          >
            {COMPARISON_CURRENCIES.map((c) => (
              <option key={c.market} value={c.market} disabled={c.market === state.market}>
                {c.label} ({MARKETS[c.market].name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
            {t('fx.fxStressLabel')}
          </label>
          <input
            type="number"
            value={fxStress}
            step={0.5}
            onChange={(e) => setFxStress(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]"
          />
          <p className="text-[11px] text-[#6b7a8a]/70 mt-1">
            {t('fx.fxStressHelp', { currency: home.currency })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
            {t('fx.localMortgageTitle', { currency: home.currency })}
          </p>
          <dl className="space-y-1.5">
            <Row label={t('fx.rate')} value={formatPercent(analysis.homeRate, 2)} />
            <Row label={t('fx.loanAmount')} value={formatCurrency(analysis.loanLocal, state.market)} />
            <Row label={t('fx.firstMonthly')} value={formatCurrency(analysis.homeFirst, state.market)} />
            <Row label={t('fx.totalPaid')} value={formatCurrency(analysis.homeTotal, state.market)} bold />
          </dl>
        </div>

        <div className="bg-[#eef4f7]/60 border border-[#4a7c96]/20 rounded-lg p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-2">
            {t('fx.foreignMortgageTitle', { currency: MARKETS[loanMarket].currency })}
          </p>
          <dl className="space-y-1.5">
            <Row label={t('fx.rate')} value={formatPercent(analysis.foreignRate, 2)} />
            <Row label={t('fx.loanAmount')} value={formatCurrency(analysis.loanForeign, loanMarket)} />
            <Row
              label={t('fx.firstMonthly')}
              value={`${formatCurrency(analysis.foreignFirstForeignCcy, loanMarket)} ≈ ${formatCurrency(analysis.foreignFirstLocal, state.market)}`}
            />
            <Row
              label={t('fx.totalPaidFxAdjusted', { currency: home.currency })}
              value={formatCurrency(analysis.fxAdjustedTotal, state.market)}
              bold
            />
          </dl>
        </div>
      </div>

      <div className={`rounded-lg p-3 text-sm ${cheaper ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
        <strong>{cheaper ? t('fx.foreignCheaper') : t('fx.localCheaper')}</strong>
        {' — '}
        {t('fx.savingsSuffix', { amount: formatCurrency(Math.abs(analysis.savings), state.market) })}
      </div>

      <p className="text-[11px] text-[#6b7a8a]/70 leading-relaxed">{t('fx.footnote')}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#6b7a8a]">{label}</dt>
      <dd className={bold ? 'font-bold text-[#2a2520]' : 'text-[#2a2520]'}>{value}</dd>
    </div>
  );
}
