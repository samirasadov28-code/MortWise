import type { ScenarioResult } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { formatCurrencyIn, formatPercent, formatMonths } from '@/lib/formatting';
import Tooltip from '@/components/shared/Tooltip';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import type { TranslationKey } from '@/lib/i18n/dictionaries/en';

interface ScenarioCardProps {
  result: ScenarioResult;
  rank: number;
  market: MarketCode;
  displayMarket?: MarketCode;
}

const RANK_COLORS = ['text-yellow-400', 'text-[#6b7a8a]', 'text-amber-600', 'text-[#6b7a8a]/60'];
const RANK_LABEL_KEYS: TranslationKey[] = [
  'card.rank.first', 'card.rank.second', 'card.rank.third', 'card.rank.fourth',
];

export default function ScenarioCard({ result, rank, market, displayMarket }: ScenarioCardProps) {
  const { t } = useTranslation();
  const dm = displayMarket ?? market;
  const fmt = (v: number) => formatCurrencyIn(v, market, dm);
  return (
    <div className={`bg-white border rounded-xl p-5 ${
      rank === 0 ? 'border-[#4a7c96]/50' : 'border-[#e8e3dc]'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-[#2a2520] text-lg">{result.lenderName}</h3>
          <span className={`text-xs font-semibold ${RANK_COLORS[rank] ?? 'text-[#6b7a8a]'}`}>
            {RANK_LABEL_KEYS[rank] ? t(RANK_LABEL_KEYS[rank]) : `#${rank + 1}`} {t('card.rankSuffix')}
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#2a2520]">{fmt(result.firstMonthlyPayment)}</p>
          <p className="text-xs text-[#6b7a8a]">{t('card.firstMonth')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Metric label={t('card.avgMonthly')} value={fmt(result.averageMonthlyPayment)} />
        <Metric
          label={t('card.totalInterest')}
          value={fmt(result.totalInterestPaid)}
          tooltip={t('card.totalInterestTooltip')}
        />
        <Metric
          label={t('card.totalRepaid')}
          value={fmt(result.totalAmountPaid)}
          tooltip={t('card.totalRepaidTooltip')}
        />
        <Metric
          label={t('card.effectiveRate')}
          value={formatPercent(result.effectiveAnnualRate)}
          tooltip={t('card.effectiveRateTooltip')}
        />
        <Metric
          label={t('card.actualTerm')}
          value={formatMonths(result.actualRepaymentPeriodMonths)}
          tooltip={t('card.actualTermTooltip')}
        />
        {result.cashbackReceived > 0 && (
          <Metric
            label={t('card.netCashback')}
            value={fmt(result.cashbackReceived - result.cashbackClawbackRisk)}
            tooltip={t('card.netCashbackTooltip')}
          />
        )}
        {result.irr !== undefined && (
          <Metric
            label={t('card.irr')}
            value={formatPercent(result.irr)}
            tooltip={t('card.irrTooltip')}
          />
        )}
        {result.exitEquity !== undefined && (
          <Metric
            label={t('card.exitEquity')}
            value={fmt(result.exitEquity)}
            tooltip={t('card.exitEquityTooltip')}
          />
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div>
      <p className="text-xs text-[#6b7a8a] flex items-center gap-0.5">
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </p>
      <p className="text-sm font-semibold text-[#2a2520] mt-0.5">{value}</p>
    </div>
  );
}
