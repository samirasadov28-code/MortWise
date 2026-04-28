import type { MarketConfig, BuyerType } from '../types';

const is: MarketConfig = {
  code: 'IS',
  name: 'Iceland',
  flag: '🇮🇸',
  currency: 'ISK',
  currencySymbol: 'kr',
  defaultTerm: 40,
  maxLTV: 0.85,
  maxIncomeMultiple: 6,
  minDepositPercent: 15,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Standard, best rates' },
    { maxLtv: 0.85, label: '71–85% LTV', description: 'FTB-only with CB allowance, up to 90%' },
  ],

  // Stimpilgjald (stamp duty): 0.8% on the deed for a private buyer.
  // Reduced to 0.4% for first-time buyers under primary-residence rules.
  stampDuty: (price: number, buyerType: BuyerType): number => {
    if (buyerType === 'first_time') return price * 0.004;
    return price * 0.008;
  },

  govtSchemes: [
    {
      name: 'Hlutdeildarlán (Shared Equity Loan)',
      description: 'State takes a 20% equity stake in the home so first-time buyers can purchase with 5% deposit and 75% bank mortgage; repaid on sale or refinance.',
      maxAmount: (price: number) => price * 0.20,
      eligibility: 'First home; income limits; primary residence; price cap by region',
      url: 'https://www.hms.is',
    },
    {
      name: 'Tax-Free Pension Withdrawal',
      description: 'Withdraw mandatory pension contributions (3.5% of salary) tax-free for 10 years to fund first home or pay down primary-residence mortgage.',
      maxAmount: (price: number) => price * 0.10,
      eligibility: 'Primary residence ownership; valid for 10-year window since launch',
      url: 'https://www.skatturinn.is',
    },
  ],

  regulatoryNotes: [
    'Mortgages are either CPI-indexed (verðtryggð) — long terms (40y), low instalment, growing principal — or non-indexed (óverðtryggð), shorter terms, higher instalment.',
    'CB caps: max 85% LTV (90% FTB), DSTI ≤ 35–40%, 3% rate stress test buffer.',
    'Variable rates dominate; 3–5y fixed periods are common, full-term fixed is rare.',
    'Mortgage interest is deductible against capital income (vaxtabætur) — means-tested.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Landsbankinn, Íslandsbanki, Arion bjóða grænt fasteignalán with rate discounts for energy class A or BREEAM-certified properties.',
};

export default is;
