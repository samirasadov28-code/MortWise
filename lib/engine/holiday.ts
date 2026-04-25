import { runAmortisation } from './amortisation';
import type { ScenarioInput, ScenarioResult } from '../types';

export interface HolidayComparison {
  baseline: ScenarioResult;
  withHoliday: ScenarioResult;
  extraInterest: number;
  balanceAtHolidayEnd: number;
  newMonthlyPayment: number;
  totalExtraCost: number;
}

export function compareHoliday(
  input: ScenarioInput,
  holidayStart: number,
  holidayDuration: number,
  startDate: Date = new Date()
): HolidayComparison {
  const baseline = runAmortisation(input, startDate);

  const withInput: ScenarioInput = {
    ...input,
    holidayStart,
    holidayDuration,
  };

  const withHoliday = runAmortisation(withInput, startDate);

  const holidayEndPeriod = withHoliday.periods[holidayStart + holidayDuration];
  const balanceAtHolidayEnd = holidayEndPeriod?.openingBalance ?? 0;
  const newMonthlyPayment = withHoliday.periods[holidayStart + holidayDuration]?.totalPayment ?? 0;

  const extraInterest = withHoliday.totalInterestPaid - baseline.totalInterestPaid;
  const totalExtraCost = withHoliday.totalAmountPaid - baseline.totalAmountPaid;

  return {
    baseline,
    withHoliday,
    extraInterest,
    balanceAtHolidayEnd,
    newMonthlyPayment,
    totalExtraCost,
  };
}
