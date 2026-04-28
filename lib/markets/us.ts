import type { MarketConfig, BuyerType } from '../types';

const us: MarketConfig = {
  code: 'US',
  name: 'United States',
  flag: '🇺🇸',
  currency: 'USD',
  currencySymbol: '$',
  defaultTerm: 30,
  maxLTV: 0.97,
  maxIncomeMultiple: 5,
  minDepositPercent: 3,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'No PMI required' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Conventional with PMI' },
    { maxLtv: 0.97, label: '91–97% LTV', description: 'FHA / first-time buyer programmes' },
  ],

  // Recording / transfer taxes vary by state; ~0.5% national average.
  // First-time buyers can sometimes claim partial exemptions in some states.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.005,

  govtSchemes: [
    {
      name: 'FHA Loan',
      description: 'Government-insured mortgage with low down payment (3.5%) for first-time and lower-credit buyers.',
      maxAmount: (price: number) => price * 0.965,
      eligibility: 'Min credit score 580 for 3.5% down; primary residence; loan limits by county',
      url: 'https://www.hud.gov/buying/loans',
    },
    {
      name: 'VA Loan',
      description: '0% down mortgage for eligible veterans, service members, and surviving spouses.',
      maxAmount: (price: number) => price,
      eligibility: 'Active-duty / veteran with Certificate of Eligibility (COE)',
      url: 'https://www.va.gov/housing-assistance/home-loans/',
    },
  ],

  regulatoryNotes: [
    '30-year fixed-rate is the most common product; 15-year fixed is also widely available.',
    'Property taxes (typically 0.5–2.5% of home value annually) and homeowners insurance are paid separately.',
    'PMI typically required when LTV > 80% on conventional loans; FHA mortgage insurance is permanent for most LTVs.',
    'Closing costs are typically 2–5% of the purchase price (separate from down payment).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0025,
  greenMortgageEligibilityNote: 'Energy Efficient Mortgages (EEM) and FHA EEM available; eligibility based on energy audit.',
};

export default us;
