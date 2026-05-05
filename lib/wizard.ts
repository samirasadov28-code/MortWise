import type { ScenarioInput, WizardState } from './types';

/**
 * Merge a wizard's top-level inputs (housePrice, deposit, term, rate structure,
 * government scheme support, payment holiday, wizard-level cashback) into
 * each lender scenario so the engine has everything it needs.
 *
 * This is the single source of truth used by the calculator page on Run, by
 * FullResults when feeding sub-panels (overpayment, holiday, sensitivity, BTL),
 * and anywhere else a "ready to amortise" ScenarioInput is needed.
 */
export function buildPreparedScenarios(state: WizardState): ScenarioInput[] {
  const requestedLoan = Math.max(0, state.housePrice - state.deposit);
  const wizardCashbackPct =
    state.wizardCashbackAmount > 0 && requestedLoan > 0
      ? state.wizardCashbackAmount / requestedLoan
      : undefined;
  const ltv = state.housePrice > 0 ? requestedLoan / state.housePrice : 0.8;

  return state.scenarios.map((s) => ({
    ...s,
    housePrice: state.housePrice,
    loanToValue: ltv,
    mortgageTerm: state.mortgageTerm,
    rateStructure: state.rateStructure,
    govtSupportAmount: state.govtSchemeEnabled ? state.govtSupportAmount : 0,
    splitFixedProportion: state.rateStructure === 'split' ? state.splitFixedProportion : undefined,
    splitVariableProportion: state.rateStructure === 'split' ? 1 - state.splitFixedProportion : undefined,
    holidayStart: state.paymentHolidayMonths > 0 ? 1 : s.holidayStart,
    holidayDuration: state.paymentHolidayMonths > 0 ? state.paymentHolidayMonths : s.holidayDuration,
    cashbackPercent: wizardCashbackPct ?? s.cashbackPercent,
    cashbackClawbackYears:
      wizardCashbackPct !== undefined ? state.wizardCashbackClawbackYears : s.cashbackClawbackYears,
  }));
}
