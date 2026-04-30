'use client';

import { useState } from 'react';
import type { WizardState, ScenarioInput } from '@/lib/types';
import AIRateBanner from '@/components/shared/AIRateBanner';
import Tooltip from '@/components/shared/Tooltip';
import { AIBadge } from '@/components/shared/AIRateBanner';

interface Step5Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

interface AIRateResponse {
  scenarios: Partial<ScenarioInput>[];
  generatedAt: string;
  disclaimer: string;
}

export default function Step5Scenarios({ state, onChange }: Step5Props) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMeta, setAiMeta] = useState<{ generatedAt: string; disclaimer: string } | null>(null);
  const [aiGeneratedIds, setAiGeneratedIds] = useState<Set<string>>(new Set());

  const ltv = state.housePrice > 0 ? (state.housePrice - state.deposit) / state.housePrice : 0.8;

  function updateScenario(id: string, updates: Partial<ScenarioInput>) {
    onChange({
      scenarios: state.scenarios.map((s) => s.id === id ? { ...s, ...updates } : s),
    });
  }

  async function generateAIRates() {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: state.market,
          ltv,
          term: state.mortgageTerm,
          buyerType: state.buyerType,
          rateStructure: state.rateStructure,
        }),
      });
      if (!res.ok) {
        let serverMsg = `AI rate generation failed (HTTP ${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody?.error) serverMsg = errBody.error;
        } catch {
          // body wasn't JSON — keep the generic message
        }
        throw new Error(serverMsg);
      }
      const data: AIRateResponse = await res.json();

      // Merge AI scenarios into existing ones
      const updated = state.scenarios.map((s, i) => {
        const aiScenario = data.scenarios[i];
        if (!aiScenario) return s;
        return { ...s, ...aiScenario, id: s.id };
      });

      const newAiIds = new Set(updated.map((s) => s.id));
      setAiGeneratedIds(newAiIds);
      setAiMeta({ generatedAt: data.generatedAt, disclaimer: data.disclaimer });
      onChange({ scenarios: updated });
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate rates');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#2a2520] mb-1">Lender scenarios</h2>
          <p className="text-[#6b7a8a] text-sm">
            Configure up to 4 scenarios to compare side by side.
          </p>
        </div>
        <button
          type="button"
          onClick={generateAIRates}
          disabled={aiLoading}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-300 hover:bg-amber-100 rounded-lg text-amber-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>✨</span>
          {aiLoading ? 'Generating…' : 'Generate market rates'}
        </button>
      </div>

      {aiError && (
        <p className="text-red-600 text-sm mb-4">{aiError}</p>
      )}

      {aiMeta && (
        <div className="mb-4">
          <AIRateBanner generatedAt={aiMeta.generatedAt} disclaimer={aiMeta.disclaimer} />
        </div>
      )}

      <div className="space-y-4">
        {state.scenarios.map((scenario, idx) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            index={idx}
            rateStructure={state.rateStructure}
            mortgageTerm={state.mortgageTerm}
            isAIGenerated={aiGeneratedIds.has(scenario.id)}
            onChange={(updates) => updateScenario(scenario.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}

interface ScenarioCardProps {
  scenario: ScenarioInput;
  index: number;
  rateStructure: WizardState['rateStructure'];
  mortgageTerm: number;
  sym: string;
  isAIGenerated: boolean;
  onChange: (updates: Partial<ScenarioInput>) => void;
}

function ScenarioCard({ scenario, index, rateStructure, mortgageTerm, isAIGenerated, onChange }: Omit<ScenarioCardProps, 'sym'>) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-[#e8e3dc]">
        <span className="w-6 h-6 rounded-full bg-[#4a7c96] text-white text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <input
          type="text"
          value={scenario.lenderName}
          onChange={(e) => onChange({ lenderName: e.target.value })}
          className="flex-1 bg-transparent text-[#2a2520] font-medium focus:outline-none placeholder-[#9aa5b0]"
          placeholder="Lender name"
        />
        {isAIGenerated && <AIBadge />}
      </div>

      <div className="p-4 space-y-4">
        {/* Rate inputs based on rate structure */}
        <div className="grid grid-cols-2 gap-3">
          {(rateStructure === 'fixed' || rateStructure === 'split') && (
            <>
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
                  Fixed rate (%)
                  <Tooltip content="The interest rate during the fixed period. This rate is guaranteed not to change until the fixed period ends." />
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={scenario.fixedRate !== undefined ? (scenario.fixedRate * 100).toFixed(2) : ''}
                  onChange={(e) => onChange({ fixedRate: Number(e.target.value) / 100 })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                  placeholder="3.80"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1">Fixed period (years)</label>
                <input
                  type="number"
                  value={scenario.fixedPeriodYears ?? ''}
                  onChange={(e) => onChange({ fixedPeriodYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                  placeholder="5"
                  min={1}
                  max={mortgageTerm}
                />
              </div>
            </>
          )}

          {(rateStructure === 'tracker' || rateStructure === 'variable') && (
            <>
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
                  Base rate (%)
                  <Tooltip content="The central bank reference rate (e.g. ECB main refinancing rate, Bank of England base rate)." />
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={scenario.trackerBaseRate !== undefined ? (scenario.trackerBaseRate * 100).toFixed(2) : ''}
                  onChange={(e) => onChange({ trackerBaseRate: Number(e.target.value) / 100 })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                  placeholder="2.60"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
                  Margin / spread (%)
                  <Tooltip content="The fixed premium your lender adds above the base rate. E.g. ECB +0.95% means your rate = ECB rate + 0.95%." />
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={scenario.trackerMargin !== undefined ? (scenario.trackerMargin * 100).toFixed(2) : ''}
                  onChange={(e) => onChange({ trackerMargin: Number(e.target.value) / 100 })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                  placeholder="0.95"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
              {rateStructure === 'fixed' ? 'Revert rate (%)' : 'Variable rate (%)'}
              <Tooltip content={rateStructure === 'fixed' ? "The rate your mortgage reverts to after the fixed period ends. This is what your stress test will be based on." : "Your ongoing variable rate."} />
            </label>
            <input
              type="number"
              step="0.01"
              value={scenario.variableRate !== undefined ? (scenario.variableRate * 100).toFixed(2) : ''}
              onChange={(e) => onChange({ variableRate: Number(e.target.value) / 100 })}
              className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
              placeholder="4.20"
            />
          </div>

          <div>
            <label className="block text-xs text-[#6b7a8a] mb-1">
              Repayment type
            </label>
            <select
              value={scenario.repaymentType}
              onChange={(e) => onChange({ repaymentType: e.target.value as ScenarioInput['repaymentType'] })}
              className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
            >
              <option value="annuity">Annuity (standard)</option>
              <option value="fixed_principal">Fixed principal</option>
            </select>
          </div>
        </div>

        {/* Cashback */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
              Cashback (%)
              <Tooltip content="Some lenders offer a cash rebate when you draw down the mortgage. E.g. 2% cashback on a €320k loan = €6,400 paid to you at drawdown." />
            </label>
            <input
              type="number"
              step="0.1"
              value={scenario.cashbackPercent !== undefined ? (scenario.cashbackPercent * 100).toFixed(1) : ''}
              onChange={(e) => onChange({ cashbackPercent: Number(e.target.value) / 100 || undefined })}
              className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
              placeholder="0"
            />
          </div>
          {(scenario.cashbackPercent ?? 0) > 0 && (
            <div>
              <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
                Clawback period (yrs)
                <Tooltip content="The number of years you must remain with the lender to keep the cashback. If you switch or sell before this, you repay a proportion." />
              </label>
              <input
                type="number"
                value={scenario.cashbackClawbackYears ?? ''}
                onChange={(e) => onChange({ cashbackClawbackYears: Number(e.target.value) || undefined })}
                className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                placeholder="5"
                min={1}
              />
            </div>
          )}
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-[#6b7a8a] hover:text-[#4a7c96] flex items-center gap-1 transition-colors"
        >
          {expanded ? '▲' : '▼'} Advanced options (grace period, overpayment)
        </button>

        {expanded && (
          <div className="border-t border-[#e8e3dc] pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
                  Grace period (months)
                  <Tooltip content="Interest-only months at the start of the mortgage. You pay only interest, not principal, reducing initial monthly payments." />
                </label>
                <input
                  type="number"
                  value={scenario.graceMonths ?? ''}
                  onChange={(e) => onChange({ graceMonths: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                  placeholder="0"
                  min={0}
                  max={24}
                />
              </div>
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1">Overpayment reduces</label>
                <select
                  value={scenario.overpaymentReduces}
                  onChange={(e) => onChange({ overpaymentReduces: e.target.value as 'payment' | 'term' })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                >
                  <option value="term">Term (same payment, shorter loan)</option>
                  <option value="payment">Payment (same term, lower payments)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
