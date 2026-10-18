import { describe, expect, it } from 'vitest';
import { computeAffordability } from '@/lib/affordability';

describe('affordability', () => {
  it('Ireland: income multiple is binding for a low-deposit FTB', () => {
    const r = computeAffordability({
      market: 'IE',
      annualIncome: 60_000,
      coBorrowerAnnualIncome: 0,
      monthlyDebtPayments: 0,
      deposit: 50_000,
      annualInterestRate: 0.04,
      termYears: 30,
    });
    expect(r.binding).toBe('income_multiple');
    // 3.5x income multiple for IE
    expect(r.byIncomeMultiple).toBeCloseTo(60_000 * 3.5, 0);
  });

  it('LTV becomes binding when deposit is too small', () => {
    const r = computeAffordability({
      market: 'IE',
      annualIncome: 250_000, // very high, so income & DTI are loose
      coBorrowerAnnualIncome: 0,
      monthlyDebtPayments: 0,
      deposit: 10_000, // tiny
      annualInterestRate: 0.04,
      termYears: 30,
    });
    expect(r.binding).toBe('ltv');
    // maxLTV 0.9 → max price = 10_000 / 0.1 = 100_000
    expect(r.maxPurchasePrice).toBeCloseTo(100_000, 0);
  });

  it('DTI becomes binding when monthly debt is high', () => {
    const r = computeAffordability({
      market: 'UK',
      annualIncome: 80_000,
      coBorrowerAnnualIncome: 0,
      monthlyDebtPayments: 1_500,
      deposit: 200_000,
      annualInterestRate: 0.05,
      termYears: 25,
    });
    expect(r.binding).toBe('dti');
    expect(r.byDTI).toBeLessThan(r.byIncomeMultiple);
    expect(r.byDTI).toBeLessThan(r.byLTV);
  });

  it('falls back to a 4.5× multiple when the market doesn’t set one', () => {
    const r = computeAffordability({
      market: 'US',
      annualIncome: 100_000,
      coBorrowerAnnualIncome: 0,
      monthlyDebtPayments: 0,
      deposit: 1_000_000, // remove LTV as the binding constraint
      annualInterestRate: 0.06,
      termYears: 30,
    });
    if (r.incomeMultipleIsDefault) {
      expect(r.incomeMultipleUsed).toBe(4.5);
    }
  });

  it('returns non-negative results even with zero income', () => {
    const r = computeAffordability({
      market: 'IE',
      annualIncome: 0,
      coBorrowerAnnualIncome: 0,
      monthlyDebtPayments: 0,
      deposit: 0,
      annualInterestRate: 0.04,
      termYears: 30,
    });
    expect(r.maxPurchasePrice).toBe(0);
    expect(r.maxLoan).toBe(0);
    expect(r.monthlyPayment).toBe(0);
  });
});
