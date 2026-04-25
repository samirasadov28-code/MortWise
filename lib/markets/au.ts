import type { MarketConfig } from '../types';

const au: MarketConfig = {
  code: 'AU',
  name: 'Australia',
  flag: '🇦🇺',
  currency: 'AUD',
  currencySymbol: 'A$',
  defaultTerm: 30,
  maxLTV: 0.95,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'No LMI required' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'LMI applies' },
    { maxLtv: 0.95, label: '91–95% LTV', description: 'LMI applies, limited lenders' },
  ],

  stampDuty: () => 0,

  govtSchemes: [],

  regulatoryNotes: [
    'Coming soon — Australian market support is in development.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default au;
