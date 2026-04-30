import type { MarketConfig, StampDutyContext } from '../types';

const de: MarketConfig = {
  code: 'DE',
  name: 'Germany',
  flag: '🇩🇪',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 25,
  maxLTV: 0.90,
  maxIncomeMultiple: 6,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '61–80% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Higher rate tier' },
    { maxLtv: 1.00, label: '91–100% LTV', description: 'Vollfinanzierung — limited lenders' },
  ],

  // Grunderwerbsteuer (real estate transfer tax) varies 3.5–6.5% by Bundesland.
  // Plus notary (~1.5%) and Grundbuch (~0.5%). Typical total fees ~10-12%.
  // Using 5% as approximation for the transfer tax alone.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.05,

  govtSchemes: [
    {
      name: 'KfW Wohneigentumsförderung',
      description: 'State-owned development bank loans for property purchase by families with children, at preferential rates.',
      maxAmount: 270_000,
      eligibility: 'Family with at least one child < 18; household income limits apply',
      url: 'https://www.kfw.de',
    },
    {
      name: 'Wohn-Riester',
      description: 'State-subsidised home savings plan (Bausparvertrag) — subsidies of up to €175/year per adult plus child allowances.',
      maxAmount: 2100,
      eligibility: 'Compulsory pension contributors; primary residence in Germany',
      url: 'https://www.bafa.de',
    },
  ],

  regulatoryNotes: [
    'Mortgages typically have a fixed period (Sollzinsbindung) of 5–30 years, after which the rate resets.',
    'Long fixed periods (10–20 years) are very common to lock in low rates.',
    'Tilgung (annual amortisation rate) of 2–3% is typical at start; you specify this rather than a fixed term.',
    'Notary and land registry fees of ~2% must be paid in cash on top of the deposit.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.002,
  greenMortgageEligibilityNote: 'KfW 261 / 297 programmes for energy-efficient new builds and renovations; subsidies up to €120,000.',
};

export default de;
