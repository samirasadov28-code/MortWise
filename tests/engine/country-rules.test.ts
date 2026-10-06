import { describe, expect, it } from 'vitest';
import { MARKETS } from '@/lib/markets';
import { computeAffordability } from '@/lib/affordability';

const ctx = (buyerType: 'first_time' | 'mover' | 'investor' | 'non_resident' = 'mover', propertyType: 'new_build' | 'secondary' = 'secondary') =>
  ({ buyerType, propertyType }) as never;

describe('Ireland', () => {
  it('stamp duty: 1% to 1m, 2% to 1.5m, 6% above', () => {
    expect(MARKETS.IE.stampDuty(2_000_000, ctx())).toBeCloseTo(10_000 + 10_000 + 30_000, 0);
    expect(MARKETS.IE.stampDuty(400_000, ctx())).toBeCloseTo(4_000, 0);
  });
  it('new builds use the VAT-exclusive price', () => {
    expect(MARKETS.IE.stampDuty(400_000, ctx('first_time', 'new_build'))).toBeCloseTo(3_524, 0);
  });
  it('investors are not charged a 7.5% rate on homes', () => {
    expect(MARKETS.IE.stampDuty(400_000, ctx('investor'))).toBeCloseTo(4_000, 0);
  });
  it('income multiple is 4x for first-time buyers and 3.5x for movers, flagged regulatory', () => {
    const base = { market: 'IE' as const, annualIncome: 60_000, coBorrowerAnnualIncome: 0, monthlyDebtPayments: 0, deposit: 100_000, annualInterestRate: 0.04, termYears: 30 };
    expect(computeAffordability({ ...base, buyerType: 'first_time' }).byIncomeMultiple).toBeCloseTo(240_000, 0);
    const mover = computeAffordability({ ...base, buyerType: 'mover' });
    expect(mover.byIncomeMultiple).toBeCloseTo(210_000, 0);
    expect(mover.incomeMultipleIsRegulatory).toBe(true);
  });
  it('90% LTV for both buyer types', () => {
    expect(MARKETS.IE.maxLTV).toBe(0.9);
  });
});

describe('United Kingdom SDLT (from 1 Apr 2025)', () => {
  it('standard bands', () => {
    expect(MARKETS.UK.stampDuty(295_000, ctx())).toBeCloseTo(4_750, 0);
    expect(MARKETS.UK.stampDuty(1_000_000, ctx())).toBeCloseTo(43_750, 0);
  });
  it('first-time buyer relief to 500k, none above', () => {
    expect(MARKETS.UK.stampDuty(500_000, ctx('first_time'))).toBeCloseTo(10_000, 0);
    expect(MARKETS.UK.stampDuty(600_000, ctx('first_time'))).toBe(MARKETS.UK.stampDuty(600_000, ctx()));
  });
  it('surcharges', () => {
    expect(MARKETS.UK.stampDuty(300_000, ctx('investor'))).toBeCloseTo(MARKETS.UK.stampDuty(300_000, ctx()) + 15_000, 0);
    expect(MARKETS.UK.stampDuty(300_000, ctx('non_resident'))).toBeCloseTo(MARKETS.UK.stampDuty(300_000, ctx()) + 6_000, 0);
  });
  it('no outdated BoE stress-test note', () => {
    expect(MARKETS.UK.regulatoryNotes.join(' ')).toContain('withdrew');
  });
});

describe('Canada', () => {
  it('tiered deposit: C$50k supports a C$750k price and C$700k loan', () => {
    expect(MARKETS.CA.maxPriceForDeposit!(50_000)).toBeCloseTo(750_000, 0);
    const r = computeAffordability({ market: 'CA', annualIncome: 500_000, coBorrowerAnnualIncome: 0, monthlyDebtPayments: 0, deposit: 50_000, annualInterestRate: 0.04, termYears: 25 });
    expect(r.byLTV).toBeCloseTo(700_000, 0);
    expect(r.binding).toBe('ltv');
  });
  it('debt service caps', () => {
    expect(MARKETS.CA.dtiCap).toBe(0.44);
    expect(MARKETS.SG.dtiCap).toBe(0.55);
    expect(MARKETS.UAE.dtiCap).toBe(0.5);
  });
});
