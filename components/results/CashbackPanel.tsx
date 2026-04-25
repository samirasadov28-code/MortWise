import type { ScenarioResult, ScenarioInput } from '@/lib/types';
import type { MarketCode } from '@/lib/types';
import { analyseCashback } from '@/lib/engine/cashback';
import { formatCurrency } from '@/lib/formatting';

interface CashbackPanelProps {
  results: ScenarioResult[];
  inputs: ScenarioInput[];
  market: MarketCode;
}

export default function CashbackPanel({ results, inputs, market }: CashbackPanelProps) {
  const cashbackScenarios = results.filter((r) => r.cashbackReceived > 0);
  if (cashbackScenarios.length === 0) return null;

  // Find the non-cashback scenario for break-even comparison
  const baselineResult = results.find((r) => r.cashbackReceived === 0);

  return (
    <div className="bg-[#16213e] border border-[#1e3a5f] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Cashback analysis</h3>

      {cashbackScenarios.map((r) => {
        const input = inputs.find((i) => i.id === r.id);
        if (!input?.cashbackPercent) return null;

        const clawbackYears = input.cashbackClawbackYears ?? 5;
        const exitYear = input.exitYear ?? clawbackYears;

        const analysis = analyseCashback(
          r.loanAmount,
          input.cashbackPercent,
          clawbackYears,
          exitYear,
          baselineResult?.firstMonthlyPayment ?? r.firstMonthlyPayment,
          r.firstMonthlyPayment
        );

        return (
          <div key={r.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">{r.lenderName}</h4>
              <span className="text-lg font-bold text-[#3b82f6]">
                {formatCurrency(analysis.grossCashback, market)} gross cashback
              </span>
            </div>

            {/* Clawback schedule */}
            <div>
              <p className="text-xs text-[#94a3b8] mb-2">Clawback schedule — amount returned if you exit early</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e3a5f]">
                      <th className="text-left py-1.5 text-[#94a3b8]">Year</th>
                      <th className="text-right py-1.5 text-[#94a3b8]">Clawback owed</th>
                      <th className="text-right py-1.5 text-[#94a3b8]">Net cashback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.clawbackSchedule.map(({ year, clawback, net }) => (
                      <tr key={year} className="border-b border-[#1e3a5f]/50 hover:bg-[#0f3460]/20">
                        <td className="py-1.5 text-white">Year {year}</td>
                        <td className={`py-1.5 text-right ${clawback > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {clawback > 0 ? `-${formatCurrency(clawback, market)}` : 'None'}
                        </td>
                        <td className="py-1.5 text-right text-white">{formatCurrency(net, market)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Break-even */}
            {analysis.breakEvenMonths !== null && (
              <div className={`p-3 rounded-lg ${
                analysis.breakEvenMonths === 0
                  ? 'bg-green-900/20 border border-green-700/30'
                  : 'bg-[#0f3460]/50 border border-[#1e3a5f]'
              }`}>
                <p className="text-sm text-white">
                  {analysis.breakEvenMonths === 0
                    ? 'This cashback lender is already cheaper — cashback is pure benefit.'
                    : `Break-even: cashback exceeds the rate premium after ${analysis.breakEvenMonths} months (${(analysis.breakEvenMonths / 12).toFixed(1)} years).`
                  }
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
