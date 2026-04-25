import type { ScenarioInput, ScenarioResult } from '../types';

function npv(rate: number, cashflows: number[]): number {
  return cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

function npvDerivative(rate: number, cashflows: number[]): number {
  return cashflows.reduce((sum, cf, t) => sum - (t * cf) / Math.pow(1 + rate, t + 1), 0);
}

export function newtonRaphsonIRR(cashflows: number[], guess = 0.01): number | null {
  let rate = guess;
  for (let i = 0; i < 1000; i++) {
    const val = npv(rate, cashflows);
    const deriv = npvDerivative(rate, cashflows);
    if (Math.abs(deriv) < 1e-12) break;
    const newRate = rate - val / deriv;
    if (Math.abs(newRate - rate) < 1e-6) return newRate;
    rate = newRate;
    if (rate < -1) return null;
  }
  return null;
}

export function computeIRR(input: ScenarioInput, result: ScenarioResult): number | undefined {
  if (!input.exitYear) return undefined;

  const deposit = input.housePrice * (1 - input.loanToValue);
  const upfrontFees = input.otherFeesCoveredByDebt ? 0 : input.otherFees;
  const cashback = result.cashbackReceived;

  const initialOutflow = -(deposit + upfrontFees - cashback);
  const exitMonth = input.exitYear * 12 - 1;

  const cashflows: number[] = [initialOutflow];

  for (let m = 0; m < exitMonth && m < result.periods.length; m++) {
    const period = result.periods[m];
    const payment = -(period.totalPayment);
    const rental = period.rentalIncome;
    cashflows.push(payment + rental);
  }

  if (result.exitEquity !== undefined) {
    const lastIdx = cashflows.length - 1;
    cashflows[lastIdx] = (cashflows[lastIdx] ?? 0) + result.exitEquity;
  }

  const monthlyIRR = newtonRaphsonIRR(cashflows);
  if (monthlyIRR === null) return undefined;

  return Math.pow(1 + monthlyIRR, 12) - 1;
}

export function computeMoneyMultiple(input: ScenarioInput, result: ScenarioResult): number | undefined {
  if (!input.exitYear || result.exitEquity === undefined) return undefined;

  const deposit = input.housePrice * (1 - input.loanToValue);
  const upfrontFees = input.otherFeesCoveredByDebt ? 0 : input.otherFees;
  const totalCashIn = deposit + upfrontFees + result.totalAmountPaid - result.cashbackReceived;

  if (totalCashIn <= 0) return undefined;

  const exitMonth = input.exitYear * 12 - 1;
  const totalRentalReceived = result.periods
    .slice(0, exitMonth + 1)
    .reduce((s, p) => s + p.rentalIncome, 0);

  const totalOut = result.exitEquity + totalRentalReceived;
  return totalOut / totalCashIn;
}
