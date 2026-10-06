import type { MarketConfig, StampDutyContext } from '../types';

const uk: MarketConfig = {
  code: 'UK',
  name: 'United Kingdom',
  flag: '🇬🇧',
  currency: 'GBP',
  currencySymbol: '£',
  defaultTerm: 25,
  maxLTV: 0.95,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates available' },
    { maxLtv: 0.75, label: '61–75% LTV', description: 'Very competitive' },
    { maxLtv: 0.85, label: '76–85% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '86–90% LTV', description: 'Higher rate tier' },
    { maxLtv: 0.95, label: '91–95% LTV', description: 'Limited lenders, highest rates' },
  ],

  // SDLT (England & Northern Ireland), rates from 1 April 2025 (gov.uk).
  // Standard: nil to 125k, 2% to 250k, 5% to 925k, 10% to 1.5m, 12% above.
  // First-time buyers: nil to 300k, 5% to 500k, no relief above 500k.
  // Surcharges on the whole price: +5% additional dwellings, +2% non-residents.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    const bands = (limits: Array<[number, number]>): number => {
      let tax = 0;
      let lower = 0;
      for (const [upper, rate] of limits) {
        if (price > lower) tax += (Math.min(price, upper) - lower) * rate;
        lower = upper;
      }
      return tax;
    };
    let tax: number;
    if (buyerType === 'first_time' && price <= 500_000) {
      tax = bands([[300_000, 0], [500_000, 0.05]]);
    } else {
      tax = bands([
        [125_000, 0],
        [250_000, 0.02],
        [925_000, 0.05],
        [1_500_000, 0.10],
        [Infinity, 0.12],
      ]);
    }
    if (buyerType === 'investor') tax += price * 0.05;
    if (buyerType === 'non_resident') tax += price * 0.02;
    return tax;
  },

  govtSchemes: [
    {
      name: 'Lifetime ISA',
      description: '25% government bonus on savings up to £4,000/year. Use towards first home purchase.',
      maxAmount: 1000,
      eligibility: 'Age 18–39, first-time buyer, property ≤ £450,000',
      url: 'https://www.gov.uk/lifetime-isa',
    },
    {
      name: 'Shared Ownership',
      description: 'Buy 10–75% share of property, pay rent on remainder. Staircase to full ownership.',
      maxAmount: (price: number) => price * 0.75,
      eligibility: 'Household income ≤ £80,000 (£90,000 in London)',
      url: 'https://www.gov.uk/shared-ownership-scheme',
    },
  ],

  regulatoryNotes: [
    'FCA-regulated mortgage advice required for recommendations — this tool is for information only.',
    'The Bank of England withdrew its mortgage affordability test on 20 June 2022; lenders now set their own affordability stress rates.',
    'Scotland uses LBTT; Wales uses LTT — stamp duty figures shown are for England/NI only.',
    'The Mortgage Charter introduced in 2023 provides additional protections for borrowers under financial stress.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0015,
  greenMortgageEligibilityNote: 'EPC rating of A or B typically required. Available from most major lenders.',
};

export default uk;
