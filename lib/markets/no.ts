import type { MarketConfig, StampDutyContext } from '../types';

const no: MarketConfig = {
  code: 'NO',
  name: 'Norway',
  flag: '🇳🇴',
  currency: 'NOK',
  currencySymbol: 'kr',
  defaultTerm: 25,
  maxLTV: 0.85,
  maxIncomeMultiple: 5,
  minDepositPercent: 15,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates' },
    { maxLtv: 0.85, label: '61–85% LTV', description: 'Standard / max LTV' },
  ],

  // Dokumentavgift (document fee) of 2.5% on freehold (selveier). Cooperative (borettslag) is exempt — pays only ~SEK 480 fixed.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.025,

  govtSchemes: [
    {
      name: 'BSU (Boligsparing for Ungdom)',
      description: 'Tax-deductible savings scheme for under-34s — 20% of annual contributions (up to NOK 27.5k) reduces income tax, funds must be used for housing.',
      maxAmount: 5_500,
      eligibility: 'Aged < 34; max NOK 27,500/year, NOK 300k lifetime; first home or amortisation only',
      url: 'https://www.skatteetaten.no',
    },
    {
      name: 'Husbanken Startlån',
      description: 'Top-up loan from the state housing bank for buyers who cannot get sufficient financing from a commercial bank.',
      maxAmount: (price: number) => price * 0.20,
      eligibility: 'First-time buyer or households with persistent housing difficulties; assessed by local municipality',
      url: 'https://www.husbanken.no',
    },
    {
      name: 'Mortgage Interest Deduction',
      description: '22% tax reduction on all mortgage interest paid — no cap, no FTB requirement.',
      maxAmount: 0,
      eligibility: 'All Norwegian taxpayers with mortgage interest',
      url: 'https://www.skatteetaten.no',
    },
  ],

  regulatoryNotes: [
    'Boliglånsforskriften: hard 85% LTV cap, total debt ≤ 5× gross income, 5% rate stress test, monthly amortisation required above 60% LTV.',
    'Most loans are variable rate (rentes­justert) — fixed rates available but uncommon.',
    'Borettslag (housing co-op) units are sold with “fellesgjeld” (shared debt) — confirm both your private mortgage and your share of co-op debt.',
    'Strict income/affordability calculation — banks must apply standardised cost-of-living tables (SIFO) when assessing capacity.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0015,
  greenMortgageEligibilityNote: 'DNB, Sparebank 1, Nordea offer Grønt boliglån for energy-class A/B properties — typically 0.10–0.15% off the listed rate.',
};

export default no;
