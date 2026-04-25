import type { MarketConfig } from '../types';

const us: MarketConfig = {
  code: 'US',
  name: 'United States',
  flag: '🇺🇸',
  currency: 'USD',
  currencySymbol: '$',
  defaultTerm: 30,
  maxLTV: 0.97,
  minDepositPercent: 3,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'No PMI required' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'PMI required' },
    { maxLtv: 0.97, label: '91–97% LTV', description: 'FHA/conventional with PMI' },
  ],

  stampDuty: () => 0,

  govtSchemes: [],

  regulatoryNotes: [
    'Coming soon — US market support is in development.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default us;
