import type { MarketConfig, StampDutyContext } from '../types';

const cn: MarketConfig = {
  code: 'CN',
  name: 'China',
  flag: '🇨🇳',
  currency: 'CNY',
  currencySymbol: '¥',
  defaultTerm: 25,
  maxLTV: 0.80,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Lowest rates' },
    { maxLtv: 0.65, label: '51–65% LTV', description: 'Standard first home' },
    { maxLtv: 0.80, label: '66–80% LTV', description: 'Maximum first home (city dependent)' },
  ],

  // Deed tax: 1% (≤90 m²), 1.5% (90-144 m²), 3% (>144 m²) for first home; 3% second home.
  // Approximation as 1.5% for typical first home purchase.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    if (buyerType === 'first_time') return price * 0.015;
    return price * 0.03;
  },

  govtSchemes: [
    {
      name: 'Housing Provident Fund (公积金)',
      description: 'Subsidised mortgage at significantly lower rate, funded by employer/employee contributions.',
      maxAmount: (price: number) => Math.min(price * 0.7, 1_200_000),
      eligibility: 'Employees who contribute to the fund for ≥ 6 months; loan caps vary by city',
      url: 'http://www.mohurd.gov.cn',
    },
  ],

  regulatoryNotes: [
    'Down payment requirements vary by city tier and whether it is a first or second home.',
    'Loan Prime Rate (LPR) set monthly by PBOC underpins most variable mortgage rates.',
    'Foreign buyers face additional restrictions and typically need local residency / employment.',
    'Property purchases by individuals in tier-1 cities often subject to additional eligibility rules.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default cn;
