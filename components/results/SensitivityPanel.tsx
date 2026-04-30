'use client';

import { useMemo } from 'react';
import type { ScenarioInput, WizardState } from '@/lib/types';
import { runAmortisation } from '@/lib/engine/amortisation';
import { formatCurrency } from '@/lib/formatting';

interface SensitivityPanelProps {
  state: WizardState;
}

interface Variation {
  label: string;
  totalCost: number;
  monthly: number;
  delta: number; // vs base
  deltaPct: number;
}

interface AxisResult {
  axis: string;
  description: string;
  variations: Variation[];
}

const RATE_OFFSETS = [-0.02, -0.01, 0, 0.01, 0.02, 0.03];
const TERM_OFFSETS_YEARS = [-10, -5, 0, 5, 10];
const DEPOSIT_OFFSETS_PCT = [-0.10, -0.05, 0, 0.05, 0.10];
const CASHBACK_LEVELS = [0, 0.01, 0.02, 0.03];
const HOLIDAY_MONTHS = [0, 3, 6, 12];

export default function SensitivityPanel({ state }: SensitivityPanelProps) {
  const baseScenario = state.scenarios[0];

  const data = useMemo<AxisResult[] | null>(() => {
    if (!baseScenario || state.housePrice <= 0) return null;

    const housePrice = state.housePrice;
    const baseLTV = (housePrice - state.deposit) / housePrice;

    const buildInput = (overrides: Partial<ScenarioInput>): ScenarioInput => ({
      ...baseScenario,
      housePrice,
      loanToValue: baseLTV,
      mortgageTerm: state.mortgageTerm,
      rateStructure: state.rateStructure,
      ...overrides,
    });

    const baseResult = runAmortisation(buildInput({}));
    const baseTotal = baseResult.totalAmountPaid;

    function describe(input: ScenarioInput): Variation {
      const r = runAmortisation(input);
      return {
        label: '',
        totalCost: r.totalAmountPaid,
        monthly: r.firstMonthlyPayment,
        delta: r.totalAmountPaid - baseTotal,
        deltaPct: baseTotal > 0 ? (r.totalAmountPaid - baseTotal) / baseTotal : 0,
      };
    }

    const baseRate = (baseScenario.fixedRate ?? baseScenario.variableRate) || 0;

    // Interest rate sensitivity (shocks on the contract rate)
    const rateAxis: AxisResult = {
      axis: 'Interest rate',
      description: 'Same loan, contract rate shocked by ±2pp.',
      variations: RATE_OFFSETS.map((off) => {
        const newRate = Math.max(0, baseRate + off);
        const v = describe(
          buildInput({
            fixedRate: newRate,
            variableRate: newRate,
          }),
        );
        return {
          ...v,
          label:
            off === 0
              ? `${(baseRate * 100).toFixed(2)}% (base)`
              : `${off > 0 ? '+' : ''}${(off * 100).toFixed(0)}pp → ${(newRate * 100).toFixed(2)}%`,
        };
      }),
    };

    // Tenor (term) sensitivity
    const termAxis: AxisResult = {
      axis: 'Mortgage term',
      description: 'Effect of lengthening or shortening the loan.',
      variations: TERM_OFFSETS_YEARS.map((off) => {
        const newTerm = Math.max(5, state.mortgageTerm + off);
        const v = describe(buildInput({ mortgageTerm: newTerm }));
        return {
          ...v,
          label:
            off === 0
              ? `${state.mortgageTerm} yrs (base)`
              : `${off > 0 ? '+' : ''}${off} yrs → ${newTerm} yrs`,
        };
      }),
    };

    // Debt size sensitivity (deposit ratio)
    const depositAxis: AxisResult = {
      axis: 'Debt size (deposit %)',
      description: 'Bigger deposit shrinks the loan; smaller deposit grows it.',
      variations: DEPOSIT_OFFSETS_PCT.map((off) => {
        const newDeposit = Math.min(housePrice, Math.max(0, state.deposit + housePrice * off));
        const newLTV = (housePrice - newDeposit) / housePrice;
        const v = describe(buildInput({ loanToValue: newLTV }));
        const newDepositPct = (newDeposit / housePrice) * 100;
        return {
          ...v,
          label:
            off === 0
              ? `${newDepositPct.toFixed(0)}% (base)`
              : `${off > 0 ? '+' : ''}${(off * 100).toFixed(0)}pp → ${newDepositPct.toFixed(0)}%`,
        };
      }),
    };

    // Cashback sensitivity — counted as an offset against total amount paid
    const cashbackAxis: AxisResult = {
      axis: 'Cashback',
      description: 'One-off cashback paid by lender as a % of loan, reducing net total cost.',
      variations: CASHBACK_LEVELS.map((cb) => {
        const r = runAmortisation(
          buildInput({
            cashbackPercent: cb,
            cashbackClawbackYears: cb > 0 ? 5 : undefined,
          }),
        );
        // Cashback received reduces effective total cost
        const adjusted = r.totalAmountPaid - r.cashbackReceived;
        return {
          label: cb === 0 ? '0% (none)' : `${(cb * 100).toFixed(0)}% cashback`,
          totalCost: adjusted,
          monthly: r.firstMonthlyPayment,
          delta: adjusted - baseTotal,
          deltaPct: baseTotal > 0 ? (adjusted - baseTotal) / baseTotal : 0,
        };
      }),
    };

    // Payment-holiday sensitivity (interest accrues during holiday, capitalising)
    const holidayAxis: AxisResult = {
      axis: 'Payment holiday',
      description: 'Months at the start with no payments (interest still accrues).',
      variations: HOLIDAY_MONTHS.map((h) => {
        const v = describe(
          buildInput({
            holidayStart: h > 0 ? 1 : undefined,
            holidayDuration: h > 0 ? h : undefined,
          }),
        );
        return {
          ...v,
          label: h === 0 ? 'No holiday (base)' : `${h}-month holiday`,
        };
      }),
    };

    return [rateAxis, termAxis, depositAxis, cashbackAxis, holidayAxis].map((a) => ({
      ...a,
      variations: a.variations.map((v, i) => ({
        ...v,
        // Replace base monthly's delta with 0 explicitly for the base row
        ...(i === Math.floor(a.variations.length / 2) && Math.abs(v.delta) < 1
          ? { delta: 0, deltaPct: 0 }
          : {}),
      })),
    }));
  }, [baseScenario, state.deposit, state.housePrice, state.mortgageTerm, state.rateStructure]);

  if (!data) {
    return (
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-5">
        <p className="text-sm text-[#6b7a8a]">
          No base scenario available. Add at least one lender scenario to run sensitivity analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-5 space-y-6">
      <p className="text-sm text-[#6b7a8a]">
        Each row varies one input — keeping everything else fixed at your base scenario — and
        reports the impact on total amount paid over the life of the loan. Use this to see
        which lever moves the needle most.
      </p>

      {data.map((axis) => (
        <section key={axis.axis}>
          <h4 className="text-sm font-semibold text-[#2a2520] flex items-baseline gap-2">
            {axis.axis}
            <span className="text-xs font-normal text-[#6b7a8a]">{axis.description}</span>
          </h4>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e3dc] text-left text-xs uppercase tracking-wide text-[#6b7a8a]">
                  <th className="py-2 pr-3 font-semibold">Scenario</th>
                  <th className="py-2 pr-3 font-semibold text-right">Monthly</th>
                  <th className="py-2 pr-3 font-semibold text-right">Total cost</th>
                  <th className="py-2 pr-3 font-semibold text-right">Δ vs base</th>
                </tr>
              </thead>
              <tbody>
                {axis.variations.map((v, i) => {
                  const isBase = Math.abs(v.delta) < 1;
                  const positive = v.delta > 0;
                  return (
                    <tr key={i} className={`border-b border-[#e8e3dc]/60 ${isBase ? 'bg-[#eef4f7]/60' : ''}`}>
                      <td className="py-2 pr-3 text-[#2a2520]">{v.label}</td>
                      <td className="py-2 pr-3 text-right text-[#6b7a8a]">
                        {formatCurrency(v.monthly, state.market)}
                      </td>
                      <td className="py-2 pr-3 text-right text-[#2a2520] font-medium">
                        {formatCurrency(v.totalCost, state.market)}
                      </td>
                      <td
                        className={`py-2 pr-3 text-right font-semibold ${
                          isBase
                            ? 'text-[#6b7a8a]'
                            : positive
                              ? 'text-red-600'
                              : 'text-green-700'
                        }`}
                      >
                        {isBase
                          ? '—'
                          : `${positive ? '+' : ''}${formatCurrency(v.delta, state.market)} (${(v.deltaPct * 100).toFixed(1)}%)`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <p className="text-[11px] text-[#6b7a8a]/70">
        Sensitivity uses the first scenario as base. Cashback delta is net of clawback risk
        is excluded — only the headline cashback amount is netted off total cost.
      </p>
    </div>
  );
}
