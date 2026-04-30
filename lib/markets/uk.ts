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

  // SDLT (England & Northern Ireland). Same headline schedule for new builds and existing,
  // but heavy surcharges for additional homes / buy-to-let (+5% since Oct 2024) and
  // non-residents (+2% since Apr 2021).
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    let tax = 0;
    if (buyerType === 'first_time' && price <= 625_000) {
      // FTB relief: nil to £425k, 5% on slice £425k–£625k. Withdrawn entirely above £625k.
      if (price <= 425_000) return 0;
      return (price - 425_000) * 0.05;
    }
    // Standard residential band schedule
    if (price > 250_000) tax += Math.min(price - 250_000, 675_000) * 0.05;
    if (price > 925_000) tax += Math.min(price - 925_000, 575_000) * 0.10;
    if (price > 1_500_000) tax += (price - 1_500_000) * 0.12;

    // Investor / second-home surcharge: +5% on entire price (Higher Rates for Additional Dwellings)
    if (buyerType === 'investor') tax += price * 0.05;
    // Non-resident surcharge: +2% on entire price, on top of HRAD if also an investor
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
    'Bank of England stress test: lenders typically assess affordability at reversion rate +3%.',
    'Scotland uses LBTT; Wales uses LTT — stamp duty figures shown are for England/NI only.',
    'The Mortgage Charter introduced in 2023 provides additional protections for borrowers under financial stress.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0015,
  greenMortgageEligibilityNote: 'EPC rating of A or B typically required. Available from most major lenders.',
};

export default uk;
