import type { MarketCode } from './types';
import { MARKETS } from './markets';

export interface AffordabilityInput {
  market: MarketCode;
  annualIncome: number;
  coBorrowerAnnualIncome: number;
  monthlyDebtPayments: number;
  deposit: number;
  annualInterestRate: number;
  termYears: number;
  /**
   * Share of gross monthly income the lender is willing to count as housing
   * costs (mortgage payment + monthly debts). Most lenders sit between 0.30
   * and 0.40 — 0.35 is a sensible default for a "what can I afford" view.
   */
  dtiCap?: number;
}

export type BindingConstraint = 'income_multiple' | 'dti' | 'ltv';

export interface AffordabilityResult {
  maxPurchasePrice: number;
  maxLoan: number;
  monthlyPayment: number;
  binding: BindingConstraint;
  /** Underlying max-loan implied by each constraint, for UI explanation. */
  byIncomeMultiple: number;
  byDTI: number;
  byLTV: number;
  incomeMultipleUsed: number;
  maxLTVUsed: number;
  dtiCapUsed: number;
  /** Note when we fell back to a default income multiple. */
  incomeMultipleIsDefault: boolean;
}

const FALLBACK_INCOME_MULTIPLE = 4.5;
const DEFAULT_DTI_CAP = 0.35;

function annuityLoanFromPayment(
  monthlyPayment: number,
  monthlyRate: number,
  totalMonths: number,
): number {
  if (monthlyPayment <= 0 || totalMonths <= 0) return 0;
  if (monthlyRate <= 0) return monthlyPayment * totalMonths;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (monthlyPayment * (factor - 1)) / (monthlyRate * factor);
}

function annuityPaymentFromLoan(
  loan: number,
  monthlyRate: number,
  totalMonths: number,
): number {
  if (loan <= 0 || totalMonths <= 0) return 0;
  if (monthlyRate <= 0) return loan / totalMonths;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (loan * monthlyRate * factor) / (factor - 1);
}

/**
 * Compute the largest property price the borrower could buy under three
 * binding constraints and return the tightest one. All amounts are in the
 * local market's currency.
 */
export function computeAffordability(input: AffordabilityInput): AffordabilityResult {
  const market = MARKETS[input.market];
  const totalIncome = Math.max(0, input.annualIncome + input.coBorrowerAnnualIncome);
  const monthlyIncome = totalIncome / 12;
  const monthlyRate = input.annualInterestRate / 12;
  const totalMonths = Math.max(1, input.termYears * 12);
  const dtiCap = input.dtiCap ?? DEFAULT_DTI_CAP;

  const incomeMultipleUsed = market.maxIncomeMultiple ?? FALLBACK_INCOME_MULTIPLE;
  const incomeMultipleIsDefault = market.maxIncomeMultiple === undefined;
  const maxLTV = market.maxLTV;

  // 1) Income multiple — direct cap on loan size.
  const byIncomeMultiple = totalIncome * incomeMultipleUsed;

  // 2) DTI — what monthly payment is allowed, then back out a loan size.
  const allowedHousingMonthly = Math.max(0, monthlyIncome * dtiCap - input.monthlyDebtPayments);
  const byDTI = annuityLoanFromPayment(allowedHousingMonthly, monthlyRate, totalMonths);

  // 3) LTV — given the deposit, the largest price the deposit can be
  //    `(1 - maxLTV)` of, and therefore the largest implied loan.
  const byLTVPrice = maxLTV >= 1 ? Infinity : input.deposit / (1 - maxLTV);
  const byLTV = byLTVPrice === Infinity ? Infinity : byLTVPrice * maxLTV;

  // Pick the binding loan size, then derive the price.
  const maxLoan = Math.max(0, Math.min(byIncomeMultiple, byDTI, byLTV));

  // Price candidates from each constraint — take the tightest.
  const priceFromIncome = byIncomeMultiple + input.deposit;
  const priceFromDTI = byDTI + input.deposit;
  const priceFromLTV = byLTVPrice;
  const maxPurchasePrice = Math.max(0, Math.min(priceFromIncome, priceFromDTI, priceFromLTV));

  let binding: BindingConstraint = 'income_multiple';
  if (priceFromDTI <= priceFromIncome && priceFromDTI <= priceFromLTV) binding = 'dti';
  else if (priceFromLTV <= priceFromIncome && priceFromLTV <= priceFromDTI) binding = 'ltv';

  const monthlyPayment = annuityPaymentFromLoan(maxLoan, monthlyRate, totalMonths);

  return {
    maxPurchasePrice,
    maxLoan,
    monthlyPayment,
    binding,
    byIncomeMultiple,
    byDTI,
    byLTV: byLTV === Infinity ? byIncomeMultiple : byLTV,
    incomeMultipleUsed,
    maxLTVUsed: maxLTV,
    dtiCapUsed: dtiCap,
    incomeMultipleIsDefault,
  };
}
