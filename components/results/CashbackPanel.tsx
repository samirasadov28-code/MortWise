'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ScenarioResult, ScenarioInput, MarketCode } from '@/lib/types';
import { analyseCashback } from '@/lib/engine/cashback';
import { formatCurrencyIn } from '@/lib/formatting';
import { MARKETS } from '@/lib/markets';
import FormattedNumberInput from '@/components/shared/FormattedNumberInput';

interface CashbackPanelProps {
  results: ScenarioResult[];
  inputs: ScenarioInput[];
  market: MarketCode;
  displayMarket?: MarketCode;
}

/**
 * Cashback analysis panel.
 *
 * If any scenarios already include lender cashback (set in Step 4 wizard-level
 * or per-lender in Step 5), they're listed at the top with the gross amount,
 * clawback schedule and break-even point.
 *
 * Below that there's an interactive "what if" simulator so users can play with
 * any cashback %, clawback period and exit year regardless of whether their
 * scenarios include cashback. Lets people answer "what would 2% cashback be
 * worth on this loan if I sold in year 3?" without going back to the wizard.
 */
export default function CashbackPanel({ results, inputs, market, displayMarket }: CashbackPanelProps) {
  const dm = displayMarket ?? market;
  const fmt = (v: number) => formatCurrencyIn(v, market, dm);
  const sym = MARKETS[market].currencySymbol;

  const cashbackScenarios = results.filter((r) => r.cashbackReceived > 0);
  const baselineResult = results.find((r) => r.cashbackReceived === 0) ?? results[0];
  const cheapest = results.length
    ? [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0]
    : undefined;
  const referenceLoan = cheapest?.loanAmount ?? results[0]?.loanAmount ?? 0;

  // Interactive sim state
  const [simCashbackPct, setSimCashbackPct] = useState<number>(2);
  const [simClawbackYears, setSimClawbackYears] = useState<number>(5);
  const [simExitYear, setSimExitYear] = useState<number>(5);
  const [simRatePremiumBp, setSimRatePremiumBp] = useState<number>(0);
  const [simLoanAmount, setSimLoanAmount] = useState<number>(referenceLoan);

  // Initialise the simulator's loan amount once results arrive.
  useEffect(() => {
    if (referenceLoan > 0 && simLoanAmount === 0) {
      setSimLoanAmount(Math.round(referenceLoan));
    }
  }, [referenceLoan, simLoanAmount]);

  const sim = useMemo(() => {
    const loan = simLoanAmount;
    const cbPct = Math.max(0, simCashbackPct / 100);
    const clawback = Math.max(1, simClawbackYears);
    const exit = Math.max(1, simExitYear);

    // Approximate the monthly premium for taking the cashback rate vs the
    // baseline rate from the rate-premium slider. Premium in bp on the
    // reference loan over the clawback window — rough but useful.
    const baselinePay = baselineResult?.firstMonthlyPayment ?? 0;
    const cashbackPay = baselinePay + (loan * (simRatePremiumBp / 10_000)) / 12;

    return analyseCashback(loan, cbPct, clawback, exit, baselinePay, cashbackPay);
  }, [simLoanAmount, simCashbackPct, simClawbackYears, simExitYear, simRatePremiumBp, baselineResult]);

  return (
    <div className="space-y-4">
      {/* Existing cashback scenarios from the wizard (if any) */}
      {cashbackScenarios.length === 0 ? (
        <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
          <p className="text-sm text-[#6b7a8a]">
            None of your scenarios currently include lender cashback. Use the
            simulator below to see what cashback would be worth on this loan,
            or add a cashback amount in <strong>Step 4 · Rate type</strong> /
            <strong> Step 5 · Lender scenarios</strong> to feed it into the rest of the analysis.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
          <h4 className="text-sm font-semibold text-[#2a2520] mb-4">
            Cashback in your scenarios
          </h4>
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
              r.firstMonthlyPayment,
            );
            return (
              <div key={r.id} className="space-y-3 mb-4 last:mb-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-[#2a2520]">{r.lenderName}</h5>
                  <span className="text-base font-bold text-[#4a7c96]">
                    {fmt(analysis.grossCashback)} gross
                  </span>
                </div>
                <ClawbackTable schedule={analysis.clawbackSchedule} fmt={fmt} />
                {analysis.breakEvenMonths !== null && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      analysis.breakEvenMonths === 0
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-[#eef4f7]/80 border border-[#e8e3dc] text-[#2a2520]'
                    }`}
                  >
                    {analysis.breakEvenMonths === 0
                      ? 'This cashback lender is already cheaper — cashback is pure benefit.'
                      : `Break-even: cashback exceeds the rate premium after ${analysis.breakEvenMonths} months (${(analysis.breakEvenMonths / 12).toFixed(1)} years).`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive simulator — always available */}
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <h4 className="text-sm font-semibold text-[#2a2520] mb-1">
          Cashback simulator
        </h4>
        <p className="text-xs text-[#6b7a8a] mb-4">
          Test any cashback offer against your loan. Adjust the inputs to see
          the gross amount, clawback if you switch early, and the break-even
          point against any rate premium.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <NumField
            label="Loan amount"
            value={simLoanAmount}
            setValue={setSimLoanAmount}
            suffix={sym}
            currencyMode
            placeholder="320,000"
          />
          <NumField
            label="Cashback %"
            value={simCashbackPct}
            setValue={setSimCashbackPct}
            suffix="%"
            allowDecimal
            placeholder="2"
          />
          <NumField
            label="Clawback period (yrs)"
            value={simClawbackYears}
            setValue={setSimClawbackYears}
            suffix="yrs"
            placeholder="5"
          />
          <NumField
            label="Exit year"
            value={simExitYear}
            setValue={setSimExitYear}
            suffix="yrs"
            placeholder="5"
          />
        </div>

        <div className="mb-4">
          <NumField
            label="Cashback rate premium (basis points)"
            value={simRatePremiumBp}
            setValue={setSimRatePremiumBp}
            suffix="bp"
            placeholder="0 (none)"
            help={`E.g. 25 means the cashback lender charges 0.25% more than your baseline. The simulator uses your cheapest-scenario monthly payment of ${fmt(baselineResult?.firstMonthlyPayment ?? 0)} as the baseline.`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <Stat label="Gross cashback" value={fmt(sim.grossCashback)} tone="primary" />
          <Stat label={`Net at year ${simExitYear}`} value={fmt(sim.netAtExitYear)} tone={sim.netAtExitYear > 0 ? 'good' : 'neutral'} />
          <Stat
            label="Break-even"
            value={
              sim.breakEvenMonths === null
                ? '—'
                : sim.breakEvenMonths === 0
                  ? 'Already cheaper'
                  : `${sim.breakEvenMonths} mo (${(sim.breakEvenMonths / 12).toFixed(1)} yrs)`
            }
            tone={sim.breakEvenMonths === 0 ? 'good' : 'neutral'}
          />
        </div>

        <ClawbackTable schedule={sim.clawbackSchedule} fmt={fmt} />

        <p className="text-[11px] text-[#6b7a8a]/70 mt-3 leading-relaxed">
          Clawback is the amount the lender takes back if you switch within the
          clawback period — typically scaled linearly with how many years remain.
          Break-even is months until cashback exceeds cumulative premium paid
          for taking a higher rate (only meaningful when premium &gt; 0).
        </p>
      </div>
    </div>
  );
}

function ClawbackTable({
  schedule,
  fmt,
}: {
  schedule: Array<{ year: number; clawback: number; net: number }>;
  fmt: (v: number) => string;
}) {
  if (schedule.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
        Clawback schedule — net cashback if you exit at year N
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#e8e3dc]">
              <th className="text-left py-1.5 text-[#6b7a8a]">Year</th>
              <th className="text-right py-1.5 text-[#6b7a8a]">Clawback owed</th>
              <th className="text-right py-1.5 text-[#6b7a8a]">Net cashback</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(({ year, clawback, net }) => (
              <tr key={year} className="border-b border-[#e8e3dc]/50 hover:bg-[#eef4f7]/40">
                <td className="py-1.5 text-[#2a2520]">Year {year}</td>
                <td className={`py-1.5 text-right ${clawback > 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {clawback > 0 ? `-${fmt(clawback)}` : 'None'}
                </td>
                <td className="py-1.5 text-right text-[#2a2520]">{fmt(net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'primary' | 'good' | 'bad' | 'neutral';
}) {
  const tones: Record<string, string> = {
    primary: 'text-[#4a7c96]',
    good: 'text-green-700',
    bad: 'text-red-600',
    neutral: 'text-[#2a2520]',
  };
  return (
    <div className="bg-[#eef4f7]/80 rounded-lg p-3 text-center">
      <p className="text-[11px] text-[#6b7a8a] mb-1">{label}</p>
      <p className={`text-base font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

/**
 * Compact deletion-friendly numeric input. Currency mode renders the value
 * with comma group separators via FormattedNumberInput (so big loan amounts
 * read cleanly); other modes use a draft-string text input that allows full
 * deletion including the last "0".
 */
function NumField({
  label,
  value,
  setValue,
  suffix,
  placeholder,
  help,
  currencyMode,
  allowDecimal,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  suffix?: string;
  placeholder?: string;
  help?: string;
  currencyMode?: boolean;
  allowDecimal?: boolean;
}) {
  const [draft, setDraft] = useState<string>(value === 0 ? '' : String(value));

  function handleText(raw: string) {
    const allowed = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
    const cleaned = raw.replace(allowed, '');
    setDraft(cleaned);
    if (cleaned === '' || cleaned === '.') {
      setValue(0);
      return;
    }
    const n = Number(cleaned);
    if (Number.isFinite(n)) setValue(n);
  }

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#6b7a8a] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {currencyMode ? (
          <FormattedNumberInput
            value={value}
            onValueChange={setValue}
            min={0}
            placeholder={placeholder}
            className={`w-full pl-3 ${suffix ? 'pr-12' : 'pr-3'} py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]`}
          />
        ) : (
          <input
            type="text"
            inputMode={allowDecimal ? 'decimal' : 'numeric'}
            value={draft}
            onChange={(e) => handleText(e.target.value)}
            placeholder={placeholder}
            className={`w-full pl-3 ${suffix ? 'pr-12' : 'pr-3'} py-2 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-sm focus:outline-none focus:border-[#4a7c96]`}
          />
        )}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8a] text-xs pointer-events-none">{suffix}</span>
        )}
      </div>
      {help && <p className="text-[11px] text-[#6b7a8a]/70 mt-1 leading-snug">{help}</p>}
    </div>
  );
}
