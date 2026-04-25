'use client';

import { useRef } from 'react';
import type { ScenarioResult, WizardState } from '@/lib/types';
import { rankScenarios } from '@/lib/engine/scenarios';
import ScenarioCard from '@/components/results/ScenarioCard';
import ComparisonTable from '@/components/results/ComparisonTable';
import BalanceChart from '@/components/results/BalanceChart';
import RepaymentBreakdown from '@/components/results/RepaymentBreakdown';
import StressTestPanel from '@/components/results/StressTestPanel';
import OverpaymentPanel from '@/components/results/OverpaymentPanel';
import CashbackPanel from '@/components/results/CashbackPanel';
import HolidayPanel from '@/components/results/HolidayPanel';

interface FullResultsProps {
  results: ScenarioResult[];
  state: WizardState;
}

export default function FullResults({ results, state }: FullResultsProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const ranked = rankScenarios(results);

  async function handleExportPDF() {
    if (typeof window === 'undefined') return;
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, {
      scale: 1.5,
      backgroundColor: '#1a1a2e',
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('mortwise-analysis.pdf');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Full Analysis</h2>
          <p className="text-[#94a3b8] text-sm">{ranked.length} scenario{ranked.length !== 1 ? 's' : ''} compared</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 border border-[#1e3a5f] hover:border-[#3b82f6] rounded-lg text-[#94a3b8] hover:text-white text-sm transition-colors"
        >
          ↓ Export PDF
        </button>
      </div>

      <div ref={exportRef} className="space-y-6">
        {/* Scenario cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ranked.map((r, i) => (
            <ScenarioCard key={r.id} result={r} rank={i} market={state.market} />
          ))}
        </div>

        {/* Comparison table */}
        <section>
          <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">
            Side-by-side comparison
          </h3>
          <ComparisonTable results={ranked} market={state.market} />
        </section>

        {/* Charts */}
        <section>
          <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">
            Charts
          </h3>
          <div className="space-y-4">
            <BalanceChart results={ranked} market={state.market} />
            <RepaymentBreakdown results={ranked} market={state.market} />
          </div>
        </section>

        {/* Stress test */}
        <section>
          <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">
            Rate-rise stress test
          </h3>
          <StressTestPanel results={ranked} inputs={state.scenarios} market={state.market} />
        </section>

        {/* Overpayment */}
        {state.scenarios[0] && (
          <section>
            <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">
              Overpayment simulator
            </h3>
            <OverpaymentPanel primaryInput={state.scenarios[0]} market={state.market} />
          </section>
        )}

        {/* Cashback */}
        {results.some((r) => r.cashbackReceived > 0) && (
          <section>
            <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">
              Cashback analysis
            </h3>
            <CashbackPanel results={ranked} inputs={state.scenarios} market={state.market} />
          </section>
        )}

        {/* Interest holiday */}
        {state.scenarios[0] && (
          <section>
            <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">
              Interest holiday
            </h3>
            <HolidayPanel primaryInput={state.scenarios[0]} market={state.market} />
          </section>
        )}
      </div>
    </div>
  );
}
