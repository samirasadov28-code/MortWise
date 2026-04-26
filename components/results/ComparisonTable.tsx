import type { ScenarioResult } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { formatCurrency, formatPercent, formatMonths } from '@/lib/formatting';

interface ComparisonTableProps {
  results: ScenarioResult[];
  market: MarketCode;
}

type MetricKey = keyof Pick<ScenarioResult,
  'firstMonthlyPayment' | 'averageMonthlyPayment' | 'totalInterestPaid' |
  'totalAmountPaid' | 'effectiveAnnualRate' | 'cashbackReceived' |
  'actualRepaymentPeriodMonths' | 'irr' | 'exitEquity'
>;

interface MetricDef {
  key: MetricKey;
  label: string;
  format: (v: number, market: MarketCode) => string;
  lowerIsBetter: boolean;
}

const METRICS: MetricDef[] = [
  { key: 'firstMonthlyPayment', label: 'First monthly payment', format: formatCurrency, lowerIsBetter: true },
  { key: 'averageMonthlyPayment', label: 'Average monthly payment', format: formatCurrency, lowerIsBetter: true },
  { key: 'totalInterestPaid', label: 'Total interest paid', format: formatCurrency, lowerIsBetter: true },
  { key: 'totalAmountPaid', label: 'Total amount repaid', format: formatCurrency, lowerIsBetter: true },
  { key: 'effectiveAnnualRate', label: 'Effective annual rate', format: (v) => formatPercent(v), lowerIsBetter: true },
  { key: 'cashbackReceived', label: 'Cashback received', format: formatCurrency, lowerIsBetter: false },
  { key: 'actualRepaymentPeriodMonths', label: 'Actual term', format: (v) => formatMonths(v), lowerIsBetter: true },
  { key: 'irr', label: 'IRR', format: (v) => formatPercent(v), lowerIsBetter: false },
  { key: 'exitEquity', label: 'Exit equity', format: formatCurrency, lowerIsBetter: false },
];

export default function ComparisonTable({ results, market }: ComparisonTableProps) {
  if (results.length === 0) return null;

  function getRankings(key: MetricKey): number[] {
    const values = results.map((r) => r[key] as number | undefined);
    if (values.every((v) => v === undefined || v === 0)) return values.map(() => -1);

    const metric = METRICS.find((m) => m.key === key)!;
    const sorted = [...values]
      .map((v, i) => ({ v: v ?? (metric.lowerIsBetter ? Infinity : -Infinity), i }))
      .sort((a, b) => metric.lowerIsBetter ? a.v - b.v : b.v - a.v);

    const ranks = new Array(values.length).fill(-1);
    sorted.forEach(({ i }, rankIdx) => { ranks[i] = rankIdx; });
    return ranks;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#e8e3dc]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f9f7f4] border-b border-[#e8e3dc]">
            <th className="text-left p-4 text-[#6b7a8a] font-medium w-48">Metric</th>
            {results.map((r) => (
              <th key={r.id} className="p-4 text-center text-[#2a2520] font-semibold">
                {r.lenderName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric) => {
            const ranks = getRankings(metric.key);
            const hasData = results.some((r) => r[metric.key] !== undefined && r[metric.key] !== 0);
            if (!hasData && ['irr', 'exitEquity', 'cashbackReceived'].includes(metric.key)) return null;

            return (
              <tr key={metric.key} className="border-b border-[#e8e3dc] last:border-0 hover:bg-[#eef4f7]/60 transition-colors">
                <td className="p-4 text-[#6b7a8a]">{metric.label}</td>
                {results.map((r, i) => {
                  const val = r[metric.key] as number | undefined;
                  const isWinner = ranks[i] === 0;
                  const displayVal = val !== undefined
                    ? metric.format(val, market)
                    : '—';

                  return (
                    <td
                      key={r.id}
                      className={`p-4 text-center font-medium transition-colors ${
                        isWinner && val !== undefined && val !== 0
                          ? 'bg-[#4a7c96]/10 text-[#4a7c96]'
                          : 'text-[#2a2520]'
                      }`}
                    >
                      {displayVal}
                      {isWinner && val !== undefined && val !== 0 && (
                        <span className="ml-1 text-xs">★</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
