import type { MarketConfig } from '../types';

const ca: MarketConfig = {
  code: 'CA',
  name: 'Canada',
  flag: '🇨🇦',
  currency: 'CAD',
  currencySymbol: 'C$',
  defaultTerm: 25,
  maxLTV: 0.95,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'Conventional mortgage' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'High-ratio, CMHC insured' },
    { maxLtv: 0.95, label: '91–95% LTV', description: 'High-ratio, CMHC insured' },
  ],

  stampDuty: () => 0,

  govtSchemes: [],

  regulatoryNotes: [
    'Coming soon — Canadian market support is in development.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default ca;
