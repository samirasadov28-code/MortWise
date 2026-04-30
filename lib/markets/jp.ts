import type { MarketConfig, StampDutyContext } from '../types';

const jp: MarketConfig = {
  code: 'JP',
  name: 'Japan',
  flag: '🇯🇵',
  currency: 'JPY',
  currencySymbol: '¥',
  defaultTerm: 35,
  maxLTV: 0.90,
  maxIncomeMultiple: 7,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'High LTV (limited lenders)' },
  ],

  // Acquisition tax (~3% land/residence) + registration license tax (~2%) ≈ 4-5% combined.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.04,

  govtSchemes: [
    {
      name: 'Flat 35 (フラット35)',
      description: 'Long-term fixed-rate mortgage backed by Japan Housing Finance Agency (JHF). Up to 35 years at fixed rate.',
      maxAmount: 100_000_000,
      eligibility: 'Property must meet JHF technical standards; resident in Japan',
      url: 'https://www.flat35.com/',
    },
    {
      name: 'Housing loan tax deduction',
      description: 'Income tax deduction of up to 0.7% of loan balance per year for 13 years on new builds.',
      maxAmount: (price: number) => Math.min(price * 0.007 * 13, 4_550_000),
      eligibility: 'Primary residence, ≥ 50 m², income ≤ ¥30M',
      url: 'https://www.nta.go.jp',
    },
  ],

  regulatoryNotes: [
    'Mortgage rates in Japan are exceptionally low — variable rates often below 0.5%.',
    'Most Japanese mortgages are variable rate; long fixed-rate products available via Flat 35.',
    'Lenders typically require permanent residency or Japanese citizenship for foreign buyers.',
    'Bonus payment option common — some borrowers make larger payments twice per year (June & December).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0015,
  greenMortgageEligibilityNote: 'ZEH (net Zero Energy House) certified properties qualify for preferential rates and Flat 35S discount.',
};

export default jp;
