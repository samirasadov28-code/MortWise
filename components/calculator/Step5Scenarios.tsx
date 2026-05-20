'use client';

import { useState } from 'react';
import type { WizardState, ScenarioInput } from '@/lib/types';
import AIRateBanner from '@/components/shared/AIRateBanner';
import Tooltip from '@/components/shared/Tooltip';
import { AIBadge } from '@/components/shared/AIRateBanner';
import RateInput from '@/components/shared/RateInput';
import { showToast } from '@/components/shared/Toaster';
import { track } from '@/lib/analytics';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface Step5Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

interface AIRateResponse {
  scenarios: Partial<ScenarioInput>[];
  generatedAt: string;
  disclaimer: string;
  provider?: string;
  model?: string;
}

export default function Step5Scenarios({ state, onChange }: Step5Props) {
  const { t } = useTranslation();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMeta, setAiMeta] = useState<{ generatedAt: string; disclaimer: string; provider?: string; model?: string } | null>(null);
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
          // Tell the API exactly which lenders to quote for, so a 5-bank or
          // 6-bank wizard doesn't silently drop the trailing entries.
          lenders: state.scenarios.map((s) => s.lenderName).filter(Boolean),
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

      // Match AI scenarios back to wizard rows by lender name (case-
      // insensitive) so reordering or partial responses can't cross the
      // wires. Falls back to positional match for any bank the AI didn't
      // address by name (e.g. it returned a different lender list).
      const aiByName = new Map<string, Partial<ScenarioInput>>();
      for (const s of data.scenarios) {
        if (s.lenderName) aiByName.set(s.lenderName.trim().toLowerCase(), s);
      }
      const usedNames = new Set<string>();
      const updated = state.scenarios.map((s, i) => {
        const matched = aiByName.get((s.lenderName ?? '').trim().toLowerCase());
        if (matched) {
          usedNames.add((s.lenderName ?? '').trim().toLowerCase());
          return { ...s, ...matched, id: s.id, lenderName: s.lenderName };
        }
        const positional = data.scenarios[i];
        if (positional && !usedNames.has((positional.lenderName ?? '').trim().toLowerCase())) {
          return { ...s, ...positional, id: s.id, lenderName: s.lenderName };
        }
        return s;
      });

      const newAiIds = new Set(updated.map((s) => s.id));
      setAiGeneratedIds(newAiIds);
      setAiMeta({
        generatedAt: data.generatedAt,
        disclaimer: data.disclaimer,
        provider: data.provider,
        model: data.model,
      });
      onChange({ scenarios: updated });
      track('rate_generation_succeeded', {
        market: state.market,
        provider: data.provider,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate rates';
      setAiError(msg);
      showToast({ kind: 'error', message: msg, durationMs: 6000 });
      track('rate_generation_failed', { market: state.market, message: msg });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#2a2520] mb-1">{t('step5.title')}</h2>
          <p className="text-[#6b7a8a] text-sm">
            {t('step5.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={generateAIRates}
          disabled={aiLoading}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-300 hover:bg-amber-100 rounded-lg text-amber-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>✨</span>
          {aiLoading ? t('step5.generating') : t('step5.generateRates')}
        </button>
      </div>

      {aiError && (
        <div className="text-red-700 text-sm mb-4 p-3 rounded-lg bg-red-50 border border-red-200 space-y-1">
          <p className="font-semibold">{t('step5.aiUnavailable')}</p>
          <p className="leading-relaxed">
            {aiError.split(/(\bhttps?:\/\/\S+)/g).map((part, i) =>
              /^https?:\/\//.test(part) ? (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-red-900 break-all"
                >
                  {part}
                </a>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </p>
          <p className="text-xs text-red-600/80">
            {t('step5.aiFallbackTip')}
          </p>
        </div>
      )}

      {aiMeta && (
        <div className="mb-4">
          <AIRateBanner
            generatedAt={aiMeta.generatedAt}
            disclaimer={aiMeta.disclaimer}
            provider={aiMeta.provider}
            model={aiMeta.model}
          />
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
  const { t } = useTranslation();
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
          placeholder={t('step5.lenderName')}
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
                  {t('step5.fixedRate')}
                  <Tooltip content={t('step5.fixedRateHelp')} />
                </label>
                <RateInput
                  value={scenario.fixedRate}
                  onValueChange={(v) => onChange({ fixedRate: v })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                  placeholder="3.80"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1">{t('step5.fixedPeriod')}</label>
                <input
                  type="number"
                  value={scenario.fixedPeriodYears ?? ''}
                  onChange={(e) => onChange({ fixedPeriodYears: e.target.value === "" ? undefined : Number(e.target.value) })}
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
                  {t('step5.baseRate')}
                  <Tooltip content={t('step5.baseRateHelp')} />
                </label>
                <RateInput
                  value={scenario.trackerBaseRate}
                  onValueChange={(v) => onChange({ trackerBaseRate: v })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                  placeholder="2.60"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
                  {t('step5.margin')}
                  <Tooltip content={t('step5.marginHelp')} />
                </label>
                <RateInput
                  value={scenario.trackerMargin}
                  onValueChange={(v) => onChange({ trackerMargin: v })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                  placeholder="0.95"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
              {rateStructure === 'fixed' ? t('step5.revertRate') : t('step5.variableRate')}
              <Tooltip content={rateStructure === 'fixed' ? t('step5.revertRateHelp') : t('step5.variableRateHelp')} />
            </label>
            <RateInput
              value={scenario.variableRate}
              onValueChange={(v) => onChange({ variableRate: v })}
              className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
              placeholder="4.20"
            />
          </div>

          <div>
            <label className="block text-xs text-[#6b7a8a] mb-1">
              {t('step5.repaymentType')}
            </label>
            <select
              value={scenario.repaymentType}
              onChange={(e) => onChange({ repaymentType: e.target.value as ScenarioInput['repaymentType'] })}
              className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
            >
              <option value="annuity">{t('step5.annuity')}</option>
              <option value="fixed_principal">{t('step5.fixedPrincipal')}</option>
            </select>
          </div>
        </div>

        {/* Cashback */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
              {t('step5.cashback')}
              <Tooltip content={t('step5.cashbackHelp')} />
            </label>
            <RateInput
              value={scenario.cashbackPercent}
              onValueChange={(v) => onChange({ cashbackPercent: v })}
              precision={1}
              step={0.1}
              className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
              placeholder="0"
            />
          </div>
          {(scenario.cashbackPercent ?? 0) > 0 && (
            <div>
              <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
                {t('step5.clawback')}
                <Tooltip content={t('step5.clawbackHelp')} />
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
          {expanded ? '▲' : '▼'} {t('step5.advanced')}
        </button>

        {expanded && (
          <div className="border-t border-[#e8e3dc] pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#6b7a8a] mb-1 flex items-center gap-1">
                  {t('step5.gracePeriod')}
                  <Tooltip content={t('step5.gracePeriodHelp')} />
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
                <label className="block text-xs text-[#6b7a8a] mb-1">{t('step5.overpaymentReduces')}</label>
                <select
                  value={scenario.overpaymentReduces}
                  onChange={(e) => onChange({ overpaymentReduces: e.target.value as 'payment' | 'term' })}
                  className="w-full px-3 py-2 bg-[#f5f3ef] border border-[#e8e3dc] rounded-lg text-[#2a2520] text-sm focus:outline-none focus:border-[#4a7c96]"
                >
                  <option value="term">{t('step5.reducesTerm')}</option>
                  <option value="payment">{t('step5.reducesPayment')}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
