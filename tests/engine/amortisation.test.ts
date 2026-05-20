import { describe, expect, it } from 'vitest';
import { runAmortisation } from '@/lib/engine/amortisation';
import type { ScenarioInput } from '@/lib/types';

const baseInput: ScenarioInput = {
  id: 'test',
  lenderName: 'Test Bank',
  housePrice: 400_000,
  otherFees: 0,
  loanToValue: 0.8,
  otherFeesCoveredByDebt: false,
  mortgageTerm: 30,
  rateStructure: 'fixed',
  fixedRate: 0.04,
  fixedPeriodYears: 30,
  variableRate: 0.04,
  repaymentType: 'annuity',
  overpaymentReduces: 'term',
};

describe('amortisation engine', () => {
  it('produces a 360-month schedule for a 30-year annuity', () => {
    const r = runAmortisation(baseInput, new Date('2025-01-01'));
    expect(r.periods).toHaveLength(360);
    expect(r.actualRepaymentPeriodMonths).toBe(360);
  });

  it('matches the textbook annuity payment for 320k @ 4% / 30y', () => {
    // M = P * r(1+r)^n / ((1+r)^n - 1), r = 0.04/12, n = 360, P = 320_000
    // expected ≈ 1,527.73
    const r = runAmortisation(baseInput, new Date('2025-01-01'));
    expect(r.firstMonthlyPayment).toBeGreaterThan(1_525);
    expect(r.firstMonthlyPayment).toBeLessThan(1_530);
  });

  it('amortises balance to zero by the final period', () => {
    const r = runAmortisation(baseInput, new Date('2025-01-01'));
    const last = r.periods[r.periods.length - 1];
    expect(last.closingBalance).toBeLessThanOrEqual(0.01);
  });

  it('total amount paid > principal (interest is positive)', () => {
    const r = runAmortisation(baseInput, new Date('2025-01-01'));
    expect(r.totalAmountPaid).toBeGreaterThan(r.loanAmount);
    expect(r.totalInterestPaid).toBeGreaterThan(0);
  });

  it('honours fixed-then-variable rate transition', () => {
    const input: ScenarioInput = {
      ...baseInput,
      fixedRate: 0.03,
      fixedPeriodYears: 5,
      variableRate: 0.06,
    };
    const r = runAmortisation(input, new Date('2025-01-01'));
    // Month 0 is on the fixed rate; month 60 (post-fixed) recalculates to the
    // variable rate, so payment should jump up.
    const m0 = r.periods[0].totalPayment;
    const m60 = r.periods[60].totalPayment;
    expect(m60).toBeGreaterThan(m0);
  });

  it('a payment holiday capitalises interest into the balance', () => {
    const noHoliday = runAmortisation(baseInput, new Date('2025-01-01'));
    const withHoliday = runAmortisation(
      { ...baseInput, holidayStart: 0, holidayDuration: 6 },
      new Date('2025-01-01'),
    );
    // A 6-month holiday at the start makes the loan more expensive overall
    // because interest accrues onto the balance.
    expect(withHoliday.totalInterestPaid).toBeGreaterThan(noHoliday.totalInterestPaid);
  });

  it('a lump-sum overpayment that reduces term shortens the schedule', () => {
    const baseline = runAmortisation(baseInput, new Date('2025-01-01'));
    const withOverpay = runAmortisation(
      {
        ...baseInput,
        overpaymentLumpSum: 20_000,
        overpaymentStart: 1,
        overpaymentFrequency: 5,
        overpaymentReduces: 'term',
      },
      new Date('2025-01-01'),
    );
    expect(withOverpay.actualRepaymentPeriodMonths).toBeLessThan(
      baseline.actualRepaymentPeriodMonths,
    );
    expect(withOverpay.totalInterestPaid).toBeLessThan(baseline.totalInterestPaid);
  });

  it('zero-interest loan repays principal exactly in equal slices', () => {
    const r = runAmortisation(
      { ...baseInput, fixedRate: 0, variableRate: 0 },
      new Date('2025-01-01'),
    );
    expect(r.totalInterestPaid).toBeLessThan(0.01);
    // 320_000 / 360 ≈ 888.89
    expect(r.firstMonthlyPayment).toBeGreaterThan(888);
    expect(r.firstMonthlyPayment).toBeLessThan(890);
  });
});
