import type { MarketConfig, StampDutyContext } from '../types';

const sa: MarketConfig = {
  code: 'SA',
  name: 'Saudi Arabia',
  flag: '🇸🇦',
  currency: 'SAR',
  currencySymbol: 'SAR',
  defaultTerm: 25,
  maxLTV: 0.90,
  maxIncomeMultiple: 7,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Lowest rates' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Maximum citizens (FTB / Sakani)' },
  ],

  // No traditional stamp duty. New builds attract 5% Real Estate Transaction Tax (RETT)
  // — government often subsidises this for first home Saudi citizens.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    if (buyerType === 'first_time') return 0;
    return price * 0.05;
  },

  govtSchemes: [
    {
      name: 'Sakani (Real Estate Development Fund)',
      description: 'Flagship housing programme by REDF — provides subsidised mortgages, deposit support, and access to government-built housing for Saudi citizens.',
      maxAmount: 1_000_000,
      eligibility: 'Saudi citizen, head of household, first-time homeowner, registered on Sakani platform',
      url: 'https://sakani.sa',
    },
    {
      name: 'REDF Profit Subsidy',
      description: 'The REDF subsidises the lender’s profit margin on Sharia-compliant home finance for eligible Saudis — buyer pays a much lower effective rate.',
      maxAmount: (price: number) => price * 0.30,
      eligibility: 'Saudi national; loan from accredited Sakani lender; first-time homeowner',
      url: 'https://www.redf.gov.sa',
    },
  ],

  regulatoryNotes: [
    'Almost all retail mortgages are Sharia-compliant — typically Murabaha (cost-plus) or Ijarah (lease-to-own).',
    'Foreigners generally cannot purchase residential property except in select designated zones (e.g. parts of Mecca/Medina explicitly excluded).',
    'Maximum DTI of 65% (33% for low-income borrowers) per SAMA regulation.',
    'Most products quoted as fixed-rate for the full term — no concept of fixed-then-variable as in Europe.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default sa;
