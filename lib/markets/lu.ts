import type { MarketConfig, BuyerType } from '../types';

const lu: MarketConfig = {
  code: 'LU',
  name: 'Luxembourg',
  flag: '🇱🇺',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 30,
  maxLTV: 1.00,
  maxIncomeMultiple: 6,
  minDepositPercent: 0,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'Best rates' },
    { maxLtv: 1.00, label: '81–100% LTV', description: 'FTB primary residence (CSSF allowance)' },
  ],

  // Droits d'enregistrement 6% + droits de transcription 1% = 7% standard.
  // Bëllegen Akt FTB tax credit: up to €40,000 reduces these duties (raised 2024).
  stampDuty: (price: number, buyerType: BuyerType): number => {
    const base = price * 0.07;
    if (buyerType === 'first_time') return Math.max(base - 40_000, 0);
    return base;
  },

  govtSchemes: [
    {
      name: 'Bëllegen Akt (FTB Tax Credit)',
      description: 'Up to €40,000 per buyer (€80k per couple) credit against registration duties when purchasing a first primary residence.',
      maxAmount: 40_000,
      eligibility: 'First-time buyer; primary residence used ≥ 2 years; deed signed in Luxembourg',
      url: 'https://www.guichet.lu',
    },
    {
      name: 'Garantie Locative Étatique / Climate Loan',
      description: 'State-subsidised loan for energy renovations on primary residence; 0% interest up to €50k for low-income, reduced rates otherwise.',
      maxAmount: 50_000,
      eligibility: 'Existing property owner; income limits; works ≥ A energy-class outcome',
      url: 'https://www.klima-agence.lu',
    },
  ],

  regulatoryNotes: [
    'CSSF macroprudential rule: max 100% LTV for FTB primary residence, 90% for second home, 80% for buy-to-let.',
    'Notary fees of ~1.5% and bank file fees ~1% add to total transaction cost.',
    'Most mortgages are variable rate referenced to ECB main rate; long fixed (15–25y) is offered but rarely chosen.',
    'Mortgage interest deduction: up to €4,000/year per household member for primary residence (declining over occupancy years).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'BCEE, BIL, Spuerkeess offer rate discounts for properties meeting AAA energy class and Klimapakt certification.',
};

export default lu;
