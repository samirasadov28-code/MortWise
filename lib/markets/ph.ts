import type { MarketConfig, StampDutyContext } from '../types';

const ph: MarketConfig = {
  code: 'PH',
  name: 'Philippines',
  flag: '🇵🇭',
  currency: 'PHP',
  currencySymbol: '₱',
  defaultTerm: 30,
  maxLTV: 0.95,
  maxIncomeMultiple: 5,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'Standard private bank' },
    { maxLtv: 0.95, label: '81–95% LTV', description: 'Pag-IBIG / SSS / GSIS subsidised loans' },
  ],

  // Documentary Stamp Tax 1.5% + Transfer Tax 0.5–0.75% + Registration ~0.25%.
  // Approximation: 2.5% buyer side.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.025,

  govtSchemes: [
    {
      name: 'Pag-IBIG Fund Housing Loan',
      description: 'Mandatory savings fund offering home loans up to ₱6M at subsidised rates (e.g. 6.25% for ₱750k bracket vs ~9–10% private).',
      maxAmount: 6_000_000,
      eligibility: 'Filipino citizen contributing to Pag-IBIG ≥ 24 months; loan capped by member contribution and salary',
      url: 'https://www.pagibigfund.gov.ph',
    },
    {
      name: 'SSS Direct House Construction / Acquisition Loan',
      description: 'Social Security System direct loan for housing acquisition or construction at preferential rates for member contributors.',
      maxAmount: 2_000_000,
      eligibility: 'SSS member with required contributions; primary residence; subject to availability',
      url: 'https://www.sss.gov.ph',
    },
  ],

  regulatoryNotes: [
    'BSP RRR / risk weights influence supply, but no formal LTV cap on private banks for residential.',
    'Foreigners cannot own land but can own condominium units (max 40% of any building) and inherit.',
    'Most private mortgages are 1–5y fixed at promo rate then re-priced; long full-term fixed is rare.',
    'Capital Gains Tax 6% on sale price/zonal value (whichever higher) — usually paid by seller.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default ph;
