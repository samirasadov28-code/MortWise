import type { ScenarioResult, ScenarioInput } from '../types';

export interface ExitAnalysis {
  exitYear: number;
  propertyValue: number;
  remainingBalance: number;
  grossEquity: number;
  netEquity: number;
  breakageFee: number;
  cashbackClawback: number;
  govtRepayment: number;
}

export function computeExitAnalysis(input: ScenarioInput, result: ScenarioResult): ExitAnalysis | null {
  if (!input.exitYear) return null;

  const exitMonth = input.exitYear * 12 - 1;
  const period = result.periods[Math.min(exitMonth, result.periods.length - 1)];
  if (!period) return null;

  const appreciation = input.annualPropertyAppreciation ?? 0;
  const propertyValue = input.housePrice * Math.pow(1 + appreciation, input.exitYear);
  const remainingBalance = period.closingBalance;

  // Breakage fee if still in fixed period
  const fixedMonths = (input.fixedPeriodYears ?? 0) * 12;
  const breakageFeePercent = input.breakageFeePercent ?? 0;
  const breakageFee = exitMonth < fixedMonths
    ? remainingBalance * breakageFeePercent
    : 0;

  // Cashback clawback
  const cashbackClawback = (() => {
    if (!input.cashbackPercent || !input.cashbackClawbackYears) return 0;
    if (input.exitYear >= input.cashbackClawbackYears) return 0;
    return result.cashbackReceived * (1 - input.exitYear / input.cashbackClawbackYears);
  })();

  // Govt support repayment
  const govtRepayment = (() => {
    if (!input.govtSupportAmount) return 0;
    const conversionYear = input.govtSupportConversionYears ?? Infinity;
    if (input.exitYear >= conversionYear) return 0;
    // Repay proportional share of appreciated property
    const originalShare = input.govtSupportAmount / input.housePrice;
    return propertyValue * originalShare;
  })();

  const grossEquity = propertyValue - remainingBalance;
  const netEquity = grossEquity - breakageFee - cashbackClawback - govtRepayment;

  return {
    exitYear: input.exitYear,
    propertyValue,
    remainingBalance,
    grossEquity,
    netEquity,
    breakageFee,
    cashbackClawback,
    govtRepayment,
  };
}
