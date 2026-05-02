'use client';

import { useRef, useState } from 'react';
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
import MarketsComparison from '@/components/results/MarketsComparison';
import BuyToLetPanel from '@/components/results/BuyToLetPanel';
import SensitivityPanel from '@/components/results/SensitivityPanel';
import ForeignCurrencyPanel from '@/components/results/ForeignCurrencyPanel';
import CalculationBreakdown from '@/components/results/CalculationBreakdown';

interface FullResultsProps {
  results: ScenarioResult[];
  state: WizardState;
}

export default function FullResults({ results, state }: FullResultsProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const ranked = rankScenarios(results);

  async function handleExportPDF() {
    if (typeof window === 'undefined' || exporting) return;
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      if (!exportRef.current) return;
      const target = exportRef.current;

      // Capture at higher scale; html2canvas handles tall content automatically.
      const canvas = await html2canvas(target, {
        scale: 1.4,
        backgroundColor: '#f5f3ef',
        useCORS: true,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
        scrollY: -window.scrollY,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If the rendered image is taller than one page, slice it across pages.
      if (imgHeight <= pageHeight) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        const pxPerMm = canvas.width / pageWidth;
        const pageHeightPx = Math.floor(pageHeight * pxPerMm);
        let renderedPx = 0;
        let pageNum = 0;
        while (renderedPx < canvas.height) {
          const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedPx);
          // Copy the slice onto a new canvas to avoid jsPDF's source-rect trickery.
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          }
          if (pageNum > 0) pdf.addPage();
          pdf.addImage(
            sliceCanvas.toDataURL('image/png'),
            'PNG',
            0,
            0,
            imgWidth,
            (sliceHeight * imgWidth) / canvas.width,
          );
          renderedPx += sliceHeight;
          pageNum++;
        }
      }

      pdf.save(`mortwise-analysis-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header — sticky so Export PDF stays accessible while scrolling. */}
      <div
        className="sticky top-[72px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-[#f5f3ef]/95 backdrop-blur-sm border-b border-[#e8e3dc] flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-[#2a2520]">Full Analysis</h2>
          <p className="text-[#6b7a8a] text-xs sm:text-sm">{ranked.length} scenario{ranked.length !== 1 ? 's' : ''} compared</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 border border-[#4a7c96]/30 bg-white hover:bg-[#4a7c96] hover:text-white hover:border-[#4a7c96] rounded-lg text-[#4a7c96] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-wait shadow-sm"
        >
          {exporting ? 'Building PDF…' : '↓ Export PDF'}
        </button>
      </div>

      <div ref={exportRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ranked.map((r, i) => (
            <ScenarioCard key={r.id} result={r} rank={i} market={state.market} />
          ))}
        </div>

        {/* Calculation walkthrough — explicit math from inputs to monthly + total. */}
        <section>
          <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
            Calculation breakdown
          </h3>
          <CalculationBreakdown results={ranked} state={state} />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
            Side-by-side comparison
          </h3>
          <ComparisonTable results={ranked} market={state.market} />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
            Charts
          </h3>
          <div className="space-y-4">
            <BalanceChart results={ranked} market={state.market} />
            <RepaymentBreakdown results={ranked} market={state.market} />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
            Rate-rise stress test
          </h3>
          <StressTestPanel results={ranked} inputs={state.scenarios} market={state.market} />
        </section>

        {state.scenarios[0] && (
          <section>
            <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
              Overpayment simulator
            </h3>
            <OverpaymentPanel primaryInput={state.scenarios[0]} market={state.market} />
          </section>
        )}

        {results.some((r) => r.cashbackReceived > 0) && (
          <section>
            <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
              Cashback analysis
            </h3>
            <CashbackPanel results={ranked} inputs={state.scenarios} market={state.market} />
          </section>
        )}

        {state.scenarios[0] && (
          <section>
            <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
              Interest holiday
            </h3>
            <HolidayPanel primaryInput={state.scenarios[0]} market={state.market} />
          </section>
        )}

        <section>
          <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
            Sensitivity analysis · all key inputs
          </h3>
          <SensitivityPanel state={state} />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
            Buy-to-let · rental cash flow
          </h3>
          <BuyToLetPanel state={state} results={ranked} />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
            Foreign-currency mortgage
          </h3>
          <ForeignCurrencyPanel state={state} />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#6b7a8a] uppercase tracking-wide mb-3">
            Cross-market comparison · same cash invested
          </h3>
          <MarketsComparison state={state} />
        </section>
      </div>
    </div>
  );
}
