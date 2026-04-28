import type { MarketConfig, BuyerType } from '../types';

const qa: MarketConfig = {
  code: 'QA',
  name: 'Qatar',
  flag: '🇶🇦',
  currency: 'QAR',
  currencySymbol: 'QAR',
  defaultTerm: 25,
  maxLTV: 0.80,
  maxIncomeMultiple: 7,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '61–80% LTV', description: 'Maximum citizens (75% expats)' },
  ],

  // Property registration fee 0.25–0.50%. No traditional stamp duty or VAT.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.0035,

  govtSchemes: [
    {
      name: 'Qatari Citizens Housing System',
      description: 'Free residential land plot or interest-free state housing loan up to QAR 1.2M for Qatari citizens; multiple programmes (married, low-income, special needs).',
      maxAmount: 1_200_000,
      eligibility: 'Qatari citizen, head of household, no other property/land grant received',
      url: 'https://www.gov.qa',
    },
    {
      name: 'Qatar Development Bank Riyada Home Finance',
      description: 'Sharia-compliant subsidised home finance products for Qatari nationals at preferential profit rates.',
      maxAmount: 6_000_000,
      eligibility: 'Qatari citizen; income and DBR criteria',
      url: 'https://www.qdb.qa',
    },
  ],

  regulatoryNotes: [
    'QCB caps LTV at 80% for citizens, 75% for expats; max term 25y citizens, 20y expats.',
    'DBR (Debt Burden Ratio) ≤ 50% of monthly income for QCB-regulated lenders.',
    'Foreigners can purchase only in designated freehold/leasehold zones (e.g. The Pearl, West Bay Lagoon, Lusail).',
    'Sharia-compliant Murabaha and Ijarah products dominate; conventional interest-based loans available alongside.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default qa;
