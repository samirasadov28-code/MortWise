import type { MarketConfig, BuyerType } from '../types';

const ca: MarketConfig = {
  code: 'CA',
  name: 'Canada',
  flag: '🇨🇦',
  currency: 'CAD',
  currencySymbol: 'C$',
  defaultTerm: 25,
  maxLTV: 0.95,
  maxIncomeMultiple: 5,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.65, label: '≤65% LTV', description: 'Conventional, sharpest rates' },
    { maxLtv: 0.80, label: '66–80% LTV', description: 'Conventional (no insurance required)' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'High-ratio, CMHC insured' },
    { maxLtv: 0.95, label: '91–95% LTV', description: 'High-ratio, max insured' },
  ],

  // Provincial Land Transfer Tax varies. Ontario marginal: 0.5/1/1.5/2/2.5%.
  // Toronto/MTL add municipal LTT (~doubles cost). FTB rebates up to ~C$4k.
  // Approximation: 1.5% standard, 0.75% effective for FTB after rebate.
  stampDuty: (price: number, buyerType: BuyerType): number => {
    const base = price * 0.015;
    if (buyerType === 'first_time') return Math.max(base - 4_000, 0);
    return base;
  },

  govtSchemes: [
    {
      name: 'First Home Savings Account (FHSA)',
      description: 'Tax-deductible contributions (like RRSP) and tax-free withdrawals (like TFSA) for first home purchase. Up to C$8k/year, C$40k lifetime.',
      maxAmount: 40_000,
      eligibility: 'Canadian resident, 18+, has not owned home in current or prior 4 calendar years',
      url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html',
    },
    {
      name: 'Home Buyers’ Plan (HBP)',
      description: 'Withdraw up to C$60k from your RRSP tax-free for a first home; repaid over 15 years.',
      maxAmount: 60_000,
      eligibility: 'First-time home buyer; must repay annual minimum or count as taxable income',
      url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/what-home-buyers-plan.html',
    },
    {
      name: 'GST/HST New Housing Rebate',
      description: 'Partial rebate of GST/HST paid on a new or substantially renovated home.',
      maxAmount: (price: number) => Math.min(price * 0.05, 24_000),
      eligibility: 'Primary residence; price thresholds apply (full rebate ≤ C$350k)',
      url: 'https://www.canada.ca/en/revenue-agency.html',
    },
  ],

  regulatoryNotes: [
    'OSFI stress test: borrowers must qualify at the greater of contract rate +2% or 5.25%.',
    'CMHC insurance is mandatory above 80% LTV — premium 2.8–4.0% of loan, added to mortgage.',
    'Mortgages amortise over 25–30 years but rate is fixed only for the term (typically 1–5 years), then renewed.',
    'Foreign buyer ban in effect through 2027 (with exceptions for permanent residents and work permit holders).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: 'CMHC Eco Plus / Eco Improvement: 25% premium refund on mortgage insurance for energy-efficient homes (NRCan EnerGuide rating ≤ 82 GJ/yr).',
};

export default ca;
