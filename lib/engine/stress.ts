import { runAmortisation } from './amortisation';
import type { ScenarioInput, StressResult } from '../types';

const STRESS_INCREMENTS = [0.005, 0.01, 0.015, 0.02, 0.03];

export function runStressTests(
  input: ScenarioInput,
  startDate: Date = new Date()
): Record<string, StressResult> {
  const baseline = runAmortisation(input, startDate);
  const basePayment = baseline.firstMonthlyPayment;

  const results: Record<string, StressResult> = {};

  for (const increment of STRESS_INCREMENTS) {
    const stressedInput: ScenarioInput = {
      ...input,
      variableRate: input.variableRate + increment,
      trackerBaseRate: input.trackerBaseRate !== undefined
        ? input.trackerBaseRate + increment
        : undefined,
    };

    const stressed = runAmortisation(stressedInput, startDate);
    const newPayment = stressed.firstMonthlyPayment;
    const paymentIncrease = newPayment - basePayment;
    const totalExtraInterest = stressed.totalInterestPaid - baseline.totalInterestPaid;

    const key = `+${(increment * 100).toFixed(1)}%`;
    results[key] = {
      rateIncrease: increment,
      newMonthlyPayment: newPayment,
      paymentIncrease,
      totalExtraInterest,
    };
  }

  return results;
}
