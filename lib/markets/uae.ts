import type { MarketConfig, StampDutyContext } from '../types';

const uae: MarketConfig = {
  code: 'UAE',
  name: 'UAE',
  flag: '🇦🇪',
  currency: 'AED',
  currencySymbol: 'AED',
  defaultTerm: 25,
  maxLTV: 0.80,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Off-plan maximum; best rates' },
    { maxLtv: 0.65, label: '51–65% LTV', description: 'Non-resident / expat typical range' },
    { maxLtv: 0.75, label: '66–75% LTV', description: 'Expat buyer standard' },
    { maxLtv: 0.80, label: '76–80% LTV', description: 'UAE nationals only' },
  ],

  stampDuty: (price: number, _ctx: StampDutyContext): number => {
    return price * 0.04;
  },

  govtSchemes: [],

  regulatoryNotes: [
    'Maximum LTV: 80% for UAE nationals, 75% for expat buyers on first property.',
    'Off-plan properties: max 50% LTV.',
    'No income tax in UAE; mortgage interest is not tax-deductible.',
    'EIBOR (Emirates Interbank Offered Rate) underpins most variable rate mortgages.',
    'Non-residents: specialist lender required, typically max 60–65% LTV.',
    'DLD transfer fee of 4% is payable on registration — included in total acquisition cost.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default uae;
