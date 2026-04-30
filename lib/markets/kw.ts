import type { MarketConfig, StampDutyContext } from '../types';

const kw: MarketConfig = {
  code: 'KW',
  name: 'Kuwait',
  flag: '🇰🇼',
  currency: 'KWD',
  currencySymbol: 'KD',
  defaultTerm: 15,
  maxLTV: 0.70,
  maxIncomeMultiple: 7,
  minDepositPercent: 30,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Standard, best rates' },
    { maxLtv: 0.70, label: '61–70% LTV', description: 'Maximum LTV under CBK' },
  ],

  // Real estate registration fee ~0.5%. No traditional stamp duty or VAT.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.005,

  govtSchemes: [
    {
      name: 'Kuwait Credit Bank Housing Loan',
      description: 'Interest-free state housing loan up to KD 70,000 for Kuwaiti citizens, repaid over 30+ years from monthly housing allowance.',
      maxAmount: 70_000,
      eligibility: 'Kuwaiti citizen; head of household; first home; long PAHW waiting list applies',
      url: 'https://www.kcb.gov.kw',
    },
    {
      name: 'PAHW Government Housing',
      description: 'Public Authority for Housing Welfare allocates state-built homes or developed land to Kuwaiti citizens via long waiting lists.',
      maxAmount: 0,
      eligibility: 'Kuwaiti citizen; married; head of household; queue allocation',
      url: 'https://www.pahw.gov.kw',
    },
  ],

  regulatoryNotes: [
    'Foreigners cannot own residential property in Kuwait (with rare GCC reciprocity exceptions).',
    'CBK caps consumer-loan tenor at 15y and DBR at 40% of monthly salary (50% post-retirement).',
    'Most private mortgages are short-tenor (5–15y) and rarely exceed KD 70k due to consumer-loan caps.',
    'Sharia-compliant murabaha is widely offered alongside conventional loans.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default kw;
