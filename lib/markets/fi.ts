import type { MarketConfig, StampDutyContext } from '../types';

const fi: MarketConfig = {
  code: 'FI',
  name: 'Finland',
  flag: '🇫🇮',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 25,
  maxLTV: 0.95,
  maxIncomeMultiple: 5,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Best rates' },
    { maxLtv: 0.85, label: '71–85% LTV', description: 'Standard FIN-FSA cap' },
    { maxLtv: 0.95, label: '86–95% LTV', description: 'First-home only with state guarantee' },
  ],

  // Varainsiirtovero (transfer tax): 1.5% on shares of housing company (asunto-osake),
  // 3% on a freehold property. FTB exemption was abolished 2024.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.015,

  govtSchemes: [
    {
      name: 'ASP (Asuntosäästöpalkkio)',
      description: 'State-backed savings + loan scheme for under-44s: 1% interest premium on top of bank rate, state covers interest above 3.8%, plus state guarantee enabling 95% LTV.',
      maxAmount: 215_000,
      eligibility: 'Aged 15–44; never owned ≥50% of a home; ≥10% deposit saved across ≥8 quarters in an ASP account',
      url: 'https://www.valtiokonttori.fi',
    },
    {
      name: 'State Guarantee for Owner-Occupied Housing',
      description: 'State guarantees up to 20% of a home loan (max €60k) at €25 fixed fee, allowing borrowers to avoid private mortgage insurance.',
      maxAmount: 60_000,
      eligibility: 'Loan for primary residence; available to most buyers regardless of age',
      url: 'https://www.valtiokonttori.fi',
    },
  ],

  regulatoryNotes: [
    'FIN-FSA macroprudential cap: max 85% LTV for buyers other than FTB (95% with state guarantee).',
    'Most apartments are owned via housing companies (asunto-osake) — buyer purchases shares, not the unit.',
    'Variable rates linked to 12m Euribor are the norm; long fixed (10y+) is rare.',
    'Mortgage interest is no longer tax-deductible (fully phased out 2023).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'OP, Nordea, S-Pankki offer Vihreä asuntolaina rate discounts for energy class A/B and renovation-driven energy upgrades.',
};

export default fi;
