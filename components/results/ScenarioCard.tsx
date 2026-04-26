import type { ScenarioResult } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { formatCurrency, formatPercent, formatMonths } from '@/lib/formatting';
import Tooltip from '@/components/shared/Tooltip';

interface ScenarioCardProps {
  result: ScenarioResult;
  rank: number;
  market: MarketCode;
}

const RANK_COLORS = ['text-yellow-400', 'text-[#6b7a8a]', 'text-amber-600', 'text-[#6b7a8a]/60'];
const RANK_LABELS = ['1st — Best value', '2nd', '3rd', '4th'];

export default function ScenarioCard({ result, rank, market }: ScenarioCardProps) {
  return (
    <div className={`bg-white border rounded-xl p-5 ${
      rank === 0 ? 'border-[#4a7c96]/50' : 'border-[#e8e3dc]'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-[#2a2520] text-lg">{result.lenderName}</h3>
          <span className={`text-xs font-semibold ${RANK_COLORS[rank] ?? 'text-[#6b7a8a]'}`}>
            {RANK_LABELS[rank] ?? `#${rank + 1}`} by total cost
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#2a2520]">{formatCurrency(result.firstMonthlyPayment, market)}</p>
          <p className="text-xs text-[#6b7a8a]">first month</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Metric label="Avg monthly payment" value={formatCurrency(result.averageMonthlyPayment, market)} />
        <Metric
          label="Total interest"
          value={formatCurrency(result.totalInterestPaid, market)}
          tooltip="Total interest paid over the full term, or to the exit year if specified."
        />
        <Metric
          label="Total repaid"
          value={formatCurrency(result.totalAmountPaid, market)}
          tooltip="Principal + total interest + any capitalised holiday interest."
        />
        <Metric
          label="Effective annual rate"
          value={formatPercent(result.effectiveAnnualRate)}
          tooltip="An approximation of the annualised cost of borrowing, accounting for all fees and charges included in the calculation."
        />
        <Metric
          label="Actual term"
          value={formatMonths(result.actualRepaymentPeriodMonths)}
          tooltip="The real repayment term, which may be shorter than planned if overpayments were made."
        />
        {result.cashbackReceived > 0 && (
          <Metric
            label="Net cashback"
            value={formatCurrency(result.cashbackReceived - result.cashbackClawbackRisk, market)}
            tooltip="Gross cashback minus any clawback applicable at the exit year."
          />
        )}
        {result.irr !== undefined && (
          <Metric
            label="IRR"
            value={formatPercent(result.irr)}
            tooltip="Internal Rate of Return on your total cash invested, annualised. Accounts for rental income and exit equity."
          />
        )}
        {result.exitEquity !== undefined && (
          <Metric
            label="Exit equity"
            value={formatCurrency(result.exitEquity, market)}
            tooltip="Estimated equity after selling the property at the exit year, minus remaining mortgage balance."
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
