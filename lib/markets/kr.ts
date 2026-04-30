import type { MarketConfig, StampDutyContext } from '../types';

const kr: MarketConfig = {
  code: 'KR',
  name: 'South Korea',
  flag: '🇰🇷',
  currency: 'KRW',
  currencySymbol: '₩',
  defaultTerm: 30,
  maxLTV: 0.70,
  maxIncomeMultiple: 5,
  minDepositPercent: 30,

  ltvBands: [
    { maxLtv: 0.40, label: '≤40% LTV', description: 'Speculative zones (Seoul Gangnam etc.)' },
    { maxLtv: 0.60, label: '41–60% LTV', description: 'Adjustment zones' },
    { maxLtv: 0.70, label: '61–70% LTV', description: 'Standard regions / first home' },
  ],

  // Acquisition tax: 1–3% (price-tiered) for first home; 8–12% for multi-home owners.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    if (buyerType === 'first_time') {
      if (price <= 600_000_000) return price * 0.01;
      if (price <= 900_000_000) return price * 0.02;
      return price * 0.03;
    }
    return price * 0.08;
  },

  govtSchemes: [
    {
      name: 'Bogeumjari Loan (보금자리론)',
      description: 'Long-term fixed-rate mortgage from the Korea Housing Finance Corporation (HF) at preferential rates for middle-income households.',
      maxAmount: 360_000_000,
      eligibility: 'Annual income ≤ ₩70M (₩85M for newlyweds), property ≤ ₩600M, owner-occupied',
      url: 'https://www.hf.go.kr',
    },
    {
      name: 'Didimdol Loan (디딤돌)',
      description: 'Government-subsidised mortgage for first-time buyers and lower-income households at very low fixed rates.',
      maxAmount: 250_000_000,
      eligibility: 'Annual income ≤ ₩60M (couples ≤ ₩70M), property ≤ ₩500M, no other home',
      url: 'https://nhuf.molit.go.kr',
    },
  ],

  regulatoryNotes: [
    'DSR (Debt Service Ratio) cap: total annual debt service ≤ 40% of income for most loans.',
    'LTV is region-dependent — strict caps in designated speculative / adjustment zones.',
    'Jeonse (lump-sum lease deposit) is a uniquely Korean alternative to monthly rent.',
    'Foreigners can borrow but typically face lower LTV caps and require local income.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.002,
  greenMortgageEligibilityNote: 'HF offers rate cuts for energy-efficient (Green Standard for Energy & Environmental Design / G-SEED) certified housing.',
};

export default kr;
