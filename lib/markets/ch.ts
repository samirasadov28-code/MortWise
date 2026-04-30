import type { MarketConfig, StampDutyContext } from '../types';

const ch: MarketConfig = {
  code: 'CH',
  name: 'Switzerland',
  flag: '🇨🇭',
  currency: 'CHF',
  currencySymbol: 'CHF',
  defaultTerm: 25,
  maxLTV: 0.80,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.65, label: '≤65% LTV', description: '1st mortgage — no mandatory amortisation' },
    { maxLtv: 0.80, label: '66–80% LTV', description: '2nd mortgage — must amortise to 65% within 15y' },
  ],

  // Notary, land registry & cantonal property transfer tax vary 0.5–3.3% by canton.
  // Approximation: 2.5%.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.025,

  govtSchemes: [
    {
      name: 'Pillar 2 / 3a Withdrawal for Home Purchase',
      description: 'Tax-advantaged withdrawal of occupational (BVG) and private pension (3a) funds to bridge the cash deposit requirement.',
      maxAmount: (price: number) => price * 0.10,
      eligibility: 'Primary residence only; minimum CHF 20k withdrawal; restricted near retirement age',
      url: 'https://www.ch.ch',
    },
    {
      name: 'Cantonal Tax Deductions',
      description: 'Mortgage interest is deductible against income — but Eigenmietwert (notional rental value of own home) is added to taxable income.',
      maxAmount: 0,
      eligibility: 'All Swiss-resident homeowners; rules vary by canton',
      url: 'https://www.estv.admin.ch',
    },
  ],

  regulatoryNotes: [
    'Hard 20% deposit rule — and at least 10% must be from own funds, not pension withdrawal.',
    'Mortgage above 65% LTV must be amortised down to 65% within 15 years.',
    'Affordability stress test: theoretical rate 5%, plus maintenance 1% of property value, must be ≤ 33% of gross income.',
    'SARON-linked variable mortgages have largely replaced LIBOR products.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0025,
  greenMortgageEligibilityNote: 'Cantonal banks and Raiffeisen offer Eco / Minergie mortgages with rate discounts of 0.20–0.30% for Minergie / Minergie-P certified properties.',
};

export default ch;
