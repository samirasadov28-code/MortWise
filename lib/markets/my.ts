import type { MarketConfig, BuyerType } from '../types';

const my: MarketConfig = {
  code: 'MY',
  name: 'Malaysia',
  flag: '🇲🇾',
  currency: 'MYR',
  currencySymbol: 'RM',
  defaultTerm: 35,
  maxLTV: 0.90,
  maxIncomeMultiple: 7,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'BNM cap on 3rd+ property' },
    { maxLtv: 0.90, label: '71–90% LTV', description: 'Standard 1st / 2nd property' },
    { maxLtv: 1.00, label: '91–100% LTV', description: 'PR1MA / Skim Rumah Pertamaku' },
  ],

  // Stamp duty (Memorandum of Transfer): tiered 1/2/3/4%.
  // FTB: full waiver up to RM 500k under MOTP 2023 stimulus.
  stampDuty: (price: number, buyerType: BuyerType): number => {
    if (buyerType === 'first_time' && price <= 500_000) return 0;
    if (price <= 100_000) return price * 0.01;
    if (price <= 500_000) return 1_000 + (price - 100_000) * 0.02;
    if (price <= 1_000_000) return 9_000 + (price - 500_000) * 0.03;
    return 24_000 + (price - 1_000_000) * 0.04;
  },

  govtSchemes: [
    {
      name: 'Skim Rumah Pertamaku (SRP / My First Home Scheme)',
      description: 'Cagamas-guaranteed 100% financing for first-home buyers earning up to RM 5,000/month — no down payment required.',
      maxAmount: 500_000,
      eligibility: 'Malaysian citizen; FTB; aged ≤ 40; household income ≤ RM 10k',
      url: 'https://www.srp.com.my',
    },
    {
      name: 'PR1MA (1Malaysia People\'s Housing)',
      description: 'Government-developed homes priced 20% below market for middle-income households, with rent-to-own options.',
      maxAmount: 0,
      eligibility: 'Malaysian; household income RM 2,500–15,000; not currently owning primary residence',
      url: 'https://pr1ma.my',
    },
  ],

  regulatoryNotes: [
    'BNM caps third-and-subsequent property loans at 70% LTV.',
    'Most mortgages are floating, pegged to BLR / BR; 1–3y promotional rates are common.',
    'Foreigners face minimum purchase price thresholds set by each state (e.g. RM 1M+ in Selangor / KL).',
    'Real Property Gains Tax (RPGT) applies on resale — 30% in years 1–3, 0% from year 6 (citizens).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Maybank, CIMB, RHB offer green home loan discounts for GreenRE or GBI-certified developments.',
};

export default my;
