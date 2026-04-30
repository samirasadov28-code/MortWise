import type { MarketConfig, StampDutyContext } from '../types';

const se: MarketConfig = {
  code: 'SE',
  name: 'Sweden',
  flag: '🇸🇪',
  currency: 'SEK',
  currencySymbol: 'kr',
  defaultTerm: 50,
  maxLTV: 0.85,
  maxIncomeMultiple: 5,
  minDepositPercent: 15,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'No mandatory amortisation' },
    { maxLtv: 0.70, label: '51–70% LTV', description: 'Mandatory 1% amortisation/yr' },
    { maxLtv: 0.85, label: '71–85% LTV', description: 'Mandatory 2% amortisation/yr' },
  ],

  // Stämpelskatt (stamp duty): 1.5% individuals on freehold; cooperative apartments (bostadsrätt) have no stämpelskatt.
  // Plus pantbrev (mortgage deed) 2% on the mortgage amount.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.015,

  govtSchemes: [
    {
      name: 'ROT-avdrag (Renovation Deduction)',
      description: 'Tax credit for 30% of labour costs (capped at SEK 75k/year/person) on home renovations, repairs, and extensions.',
      maxAmount: 75_000,
      eligibility: 'Property owner; work done on primary or holiday home; labour cost only (not materials)',
      url: 'https://www.skatteverket.se',
    },
    {
      name: 'Räntereduktion (Interest Tax Reduction)',
      description: '30% tax reduction on mortgage interest paid up to SEK 100k; 21% on interest above that.',
      maxAmount: 30_000,
      eligibility: 'Swedish taxpayer; applies to all mortgage interest (no FTB-specific scheme exists)',
      url: 'https://www.skatteverket.se',
    },
  ],

  regulatoryNotes: [
    'Hard 85% LTV cap and strict amortisation rules: 1% if LTV>50%, 2% if LTV>70%, +1% extra if mortgage > 4.5× gross income.',
    'Most mortgages are variable (3-month rate reset) — only ~30% are fixed for any meaningful period.',
    'Cooperative apartments (bostadsrätt) dominate urban housing — buyer purchases shares in the association, not the unit itself.',
    'Long terms (40–50 years) common because amortisation, not maturity, drives equity build-up.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'SBAB, Skandia, Länsförsäkringar offer Grönt bolån for energy-class A/B properties — typically 0.10% off the listed rate.',
};

export default se;
