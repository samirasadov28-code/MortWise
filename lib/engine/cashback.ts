export interface CashbackAnalysis {
  grossCashback: number;
  clawbackSchedule: Array<{ year: number; clawback: number; net: number }>;
  netAtExitYear: number;
  breakEvenMonths: number | null;
}

export function analyseCashback(
  loanAmount: number,
  cashbackPercent: number,
  cashbackClawbackYears: number,
  exitYear: number,
  baselineMonthlyPayment: number,
  cashbackMonthlyPayment: number
): CashbackAnalysis {
  const grossCashback = loanAmount * cashbackPercent;

  const clawbackSchedule = Array.from({ length: cashbackClawbackYears }, (_, i) => {
    const year = i + 1;
    const clawback = year < cashbackClawbackYears
      ? grossCashback * (1 - year / cashbackClawbackYears)
      : 0;
    return { year, clawback, net: grossCashback - clawback };
  });

  const netAtExitYear = exitYear >= cashbackClawbackYears
    ? grossCashback
    : grossCashback * (exitYear / cashbackClawbackYears);

  // Break-even: months until cashback > cumulative premium paid for higher rate
  const monthlyPremium = cashbackMonthlyPayment - baselineMonthlyPayment;
  let breakEvenMonths: number | null = null;
  if (monthlyPremium > 0) {
    breakEvenMonths = Math.ceil(grossCashback / monthlyPremium);
  } else if (monthlyPremium <= 0) {
    breakEvenMonths = 0; // cashback lender is actually cheaper
  }

  return { grossCashback, clawbackSchedule, netAtExitYear, breakEvenMonths };
}
