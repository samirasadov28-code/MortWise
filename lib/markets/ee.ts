import type { MarketConfig, StampDutyContext } from '../types';

const ee: MarketConfig = {
  code: 'EE',
  name: 'Estonia',
  flag: '🇪🇪',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 30,
  maxLTV: 0.90,
  maxIncomeMultiple: 5,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Best rates' },
    { maxLtv: 0.85, label: '71–85% LTV', description: 'Standard residents' },
    { maxLtv: 0.90, label: '86–90% LTV', description: 'KredEx-guaranteed buyers' },
  ],

  // Notary 0.4% + state fee 0.04% on land registry. No transfer tax.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.005,

  govtSchemes: [
    {
      name: 'KredEx Eluasemelaenu Käendus (Mortgage Guarantee)',
      description: 'KredEx underwrites part of the loan, allowing borrowers (FTB / families / young specialists) to buy with as little as 10% deposit.',
      maxAmount: (price: number) => price * 0.20,
      eligibility: 'Young families with children, FTB under 35, public-sector specialists; one-off premium 3% of guarantee',
      url: 'https://kredex.ee',
    },
    {
      name: 'KredEx Renovation Grant',
      description: 'Direct grant of 30–50% of energy renovation costs on apartment buildings, plus low-rate loans for owner-occupiers.',
      maxAmount: 50_000,
      eligibility: 'Existing apartment building; full-stack energy upgrade plan; achieve energy class A/B',
      url: 'https://kredex.ee',
    },
  ],

  regulatoryNotes: [
    'Eesti Pank rules: max 90% LTV (15% allowance for higher), DSTI ≤ 50%, max term 30y.',
    'Mortgage rates: 6m Euribor + ~1.5–2.5% margin — almost all loans are variable.',
    'Notary process is fast and digital (Estonia’s e-state); typical purchase signs in days.',
    'Mortgage interest deduction abolished 2017 — no income-tax break for housing debt.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Swedbank, SEB, LHV offer Roheline kodulaen rate discounts for energy class A or B properties.',
};

export default ee;
