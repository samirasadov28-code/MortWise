'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MarketCode, ScenarioResult, WizardState } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import { runScenarios } from '@/lib/engine/scenarios';
import { buildPreparedScenarios } from '@/lib/wizard';
import { formatCurrencyIn, formatPercent, formatMonths } from '@/lib/formatting';
import {
  type SavedAnalysis,
  deleteAnalysis,
  exportSavedAnalyses,
  importSavedAnalyses,
  listSavedAnalyses,
  saveAnalysis,
} from '@/lib/savedScenarios';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { showToast } from '@/components/shared/Toaster';
import { track } from '@/lib/analytics';

interface SavedScenariosPanelProps {
  /** The wizard state currently displayed in Full Results — i.e. the
   *  scenario the user just ran. We let them save it to a comparison list. */
  currentState: WizardState;
  /** The display currency the rest of the page is using; we render every
   *  saved analysis in the same currency for an apples-to-apples view. */
  displayMarket: MarketCode;
}

interface ComputedRow {
  saved: SavedAnalysis;
  best: ScenarioResult | null;
}

function computeBest(saved: SavedAnalysis): ScenarioResult | null {
  // Re-run the engine with the saved inputs and pick the cheapest scenario.
  const fullState: WizardState = {
    ...saved.state,
    step: 5,
    isUnlocked: true,
  };
  const prepared = buildPreparedScenarios(fullState);
  if (prepared.length === 0) return null;
  const results = runScenarios(prepared, new Date());
  if (results.length === 0) return null;
  return [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0];
}

export default function SavedScenariosPanel({
  currentState,
  displayMarket,
}: SavedScenariosPanelProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<SavedAnalysis[]>([]);
  const [name, setName] = useState('');
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(listSavedAnalyses());
  }, []);

  const rows = useMemo<ComputedRow[]>(
    () => items.map((s) => ({ saved: s, best: computeBest(s) })),
    [items],
  );

  function handleSave() {
    const entry = saveAnalysis(name, currentState);
    setName('');
    setItems(listSavedAnalyses());
    setJustSavedId(entry.id);
    window.setTimeout(() => setJustSavedId(null), 2000);
    track('scenario_saved', { market: currentState.market });
  }

  function handleDelete(id: string) {
    deleteAnalysis(id);
    setItems(listSavedAnalyses());
  }

  function handleExport() {
    if (items.length === 0) {
      showToast({ kind: 'error', message: t('saved.empty') });
      return;
    }
    const blob = new Blob([exportSavedAnalyses()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortwise-scenarios-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast({ kind: 'success', message: t('saved.exportedToast', { n: items.length }) });
    track('scenarios_exported', { count: items.length });
  }

  function handleImportFile(file: File) {
    file.text()
      .then((text) => {
        const result = importSavedAnalyses(text);
        setItems(listSavedAnalyses());
        showToast({
          kind: 'success',
          message: t('saved.importedToast', { added: result.added, skipped: result.skipped }),
        });
        track('scenarios_imported', { added: result.added, skipped: result.skipped });
      })
      .catch((err: unknown) => {
        showToast({
          kind: 'error',
          message:
            err instanceof Error
              ? `${t('saved.importFailed')}: ${err.message}`
              : t('saved.importFailed'),
        });
      });
  }

  return (
    <div className="rounded-xl border border-[#e8e3dc] bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-[#2a2520]">{t('saved.heading')}</h4>
          <p className="text-xs text-[#6b7a8a] mt-0.5">{t('saved.subheading')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('saved.namePlaceholder')}
            aria-label={t('saved.namePlaceholder')}
            className="px-3 py-2 text-sm border border-[#e8e3dc] rounded-lg bg-white text-[#2a2520] focus:outline-none focus:border-[#4a7c96] w-44"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-2 bg-[#4a7c96] hover:bg-[#3a6a82] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            {t('saved.saveCurrent')}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 border border-[#e8e3dc] hover:border-[#4a7c96] text-[#6b7a8a] hover:text-[#4a7c96] text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {t('saved.export')}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 border border-[#e8e3dc] hover:border-[#4a7c96] text-[#6b7a8a] hover:text-[#4a7c96] text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {t('saved.import')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-[#6b7a8a] italic py-2">{t('saved.empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#e8e3dc]">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f9f7f4] border-b border-[#e8e3dc]">
                <th className="text-left p-3 text-[#6b7a8a] font-medium">{t('saved.colName')}</th>
                <th className="text-left p-3 text-[#6b7a8a] font-medium">{t('saved.colMarket')}</th>
                <th className="text-right p-3 text-[#6b7a8a] font-medium">{t('saved.colPrice')}</th>
                <th className="text-right p-3 text-[#6b7a8a] font-medium">{t('saved.colMonthly')}</th>
                <th className="text-right p-3 text-[#6b7a8a] font-medium">{t('saved.colTotalCost')}</th>
                <th className="text-right p-3 text-[#6b7a8a] font-medium hidden sm:table-cell">
                  {t('saved.colRate')}
                </th>
                <th className="text-right p-3 text-[#6b7a8a] font-medium hidden md:table-cell">
                  {t('saved.colTerm')}
                </th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ saved, best }) => {
                const localMarket = saved.state.market;
                const cfg = MARKETS[localMarket];
                const justSaved = saved.id === justSavedId;
                return (
                  <tr
                    key={saved.id}
                    className={`border-b border-[#e8e3dc] last:border-0 transition-colors ${
                      justSaved ? 'bg-[#4a7c96]/10' : 'hover:bg-[#eef4f7]/60'
                    }`}
                  >
                    <td className="p-3 text-[#2a2520] font-medium">
                      <div className="truncate max-w-[12rem]" title={saved.name}>
                        {saved.name}
                      </div>
                      <div className="text-[10px] text-[#6b7a8a]">
                        {new Date(saved.savedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 text-[#2a2520]">
                      <span className="mr-1">{cfg.flag}</span>
                      {cfg.name}
                    </td>
                    <td className="p-3 text-right tabular-nums text-[#2a2520]">
                      {formatCurrencyIn(saved.state.housePrice, localMarket, displayMarket)}
                    </td>
                    <td className="p-3 text-right tabular-nums text-[#2a2520]">
                      {best
                        ? formatCurrencyIn(best.firstMonthlyPayment, localMarket, displayMarket)
                        : '—'}
                    </td>
                    <td className="p-3 text-right tabular-nums text-[#2a2520]">
                      {best
                        ? formatCurrencyIn(best.totalAmountPaid, localMarket, displayMarket)
                        : '—'}
                    </td>
                    <td className="p-3 text-right tabular-nums text-[#6b7a8a] hidden sm:table-cell">
                      {best ? formatPercent(best.effectiveAnnualRate) : '—'}
                    </td>
                    <td className="p-3 text-right tabular-nums text-[#6b7a8a] hidden md:table-cell">
                      {best
                        ? formatMonths(best.actualRepaymentPeriodMonths)
                        : `${saved.state.mortgageTerm} yr`}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(saved.id)}
                        aria-label={t('saved.delete')}
                        className="text-[#6b7a8a] hover:text-red-600 text-base leading-none px-1"
                        title={t('saved.delete')}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-[#6b7a8a] mt-3 leading-relaxed">{t('saved.fxNote')}</p>
    </div>
  );
}
