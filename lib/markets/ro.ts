import type { MarketConfig, StampDutyContext } from '../types';

const ro: MarketConfig = {
  code: 'RO',
  name: 'Romania',
  flag: '🇷🇴',
  currency: 'RON',
  currencySymbol: 'lei',
  defaultTerm: 30,
  maxLTV: 0.85,
  maxIncomeMultiple: 5,
  minDepositPercent: 15,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates, EUR or RON' },
    { maxLtv: 0.85, label: '61–85% LTV', description: 'Standard residents (RON only above 80%)' },
    { maxLtv: 0.95, label: '86–95% LTV', description: 'Noua Casă state-guaranteed loans only' },
  ],

  // Notarial fees ~1–2% (paid by buyer) + ANCPI registration ~0.15%.
  // No transfer tax as such; capital gains tax is on the seller.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.015,

  govtSchemes: [
    {
      name: 'Noua Casă (formerly Prima Casă)',
      description: 'State guarantees up to 50% of the loan, allowing a 5% down payment for first-home buyers — most popular FTB scheme in CEE.',
      maxAmount: 140_000,
      eligibility: 'First home, primary residence; price cap ~€140k; resident borrower',
      url: 'https://www.fngcimm.ro',
    },
    {
      name: 'Reduced VAT for First Home',
      description: 'Reduced 9% VAT (vs 19% standard) on new homes priced up to RON 600,000 — limited to one purchase per buyer.',
      maxAmount: 60_000,
      eligibility: 'New build; price ≤ RON 600k; buyer has not previously bought at the reduced rate',
      url: 'https://www.anaf.ro',
    },
  ],

  regulatoryNotes: [
    'BNR DSTI cap: ≤ 40% for RON loans (45% if FTB), 20% for FX loans — strongly steers borrowers to RON mortgages.',
    'Mortgage rates often quoted as IRCC (Romanian benchmark, replaces ROBOR for retail) plus a margin.',
    'Long fixed periods are uncommon; most loans are variable or 1–5y promo fixed.',
    'Notary, ANCPI, and bank evaluation fees add ~2% to closing cost beyond the deposit.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Banca Transilvania, BCR, ING offer green mortgage rate discounts for energy class A or NZEB-certified new builds.',
};

export default ro;
