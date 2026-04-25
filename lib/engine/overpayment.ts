import { runAmortisation } from './amortisation';
import type { ScenarioInput, ScenarioResult } from '../types';

export interface OverpaymentComparison {
  baseline: ScenarioResult;
  withOverpayment: ScenarioResult;
  monthsSaved: number;
  interestSaved: number;
  totalSaved: number;
}

export function compareOverpayment(
  input: ScenarioInput,
  lumpSum: number,
  startYear: number,
  frequency: number,
  reduces: 'payment' | 'term',
  startDate: Date = new Date()
): OverpaymentComparison {
  const baseline = runAmortisation(input, startDate);

  const withInput: ScenarioInput = {
    ...input,
    overpaymentLumpSum: lumpSum,
    overpaymentStart: startYear,
    overpaymentFrequency: frequency,
    overpaymentReduces: reduces,
  };

  const withOverpayment = runAmortisation(withInput, startDate);

  const monthsSaved = baseline.actualRepaymentPeriodMonths - withOverpayment.actualRepaymentPeriodMonths;
  const interestSaved = baseline.totalInterestPaid - withOverpayment.totalInterestPaid;
  const totalSaved = baseline.totalAmountPaid - withOverpayment.totalAmountPaid;

  return { baseline, withOverpayment, monthsSaved, interestSaved, totalSaved };
}
