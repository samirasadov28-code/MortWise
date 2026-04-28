import type { MarketConfig, BuyerType } from '../types';

const fr: MarketConfig = {
  code: 'FR',
  name: 'France',
  flag: '🇫🇷',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 20,
  maxLTV: 0.90,
  maxIncomeMultiple: 4,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '61–80% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'High LTV' },
  ],

  // Frais de notaire (notary fees) include droits d'enregistrement.
  // ~7-8% on existing properties, ~2-3% on new builds (VEFA).
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.075,

  govtSchemes: [
    {
      name: 'Prêt à Taux Zéro (PTZ)',
      description: 'Interest-free loan for first-time buyers, complementing main mortgage. Amount depends on zone and household.',
      maxAmount: (price: number) => Math.min(price * 0.40, 100_000),
      eligibility: 'First-time buyer; income caps by zone; primary residence; new build or renovation',
      url: 'https://www.service-public.fr',
    },
    {
      name: 'Prêt Action Logement',
      description: 'Employer-backed loan at preferential rate (typically ~1.5%) for employees of companies > 50 staff.',
      maxAmount: 30_000,
      eligibility: 'Employee of contributing employer; primary residence',
      url: 'https://www.actionlogement.fr',
    },
  ],

  regulatoryNotes: [
    'HCSF rules limit the debt-service ratio (taux d\'endettement) to 35% of net income, including insurance.',
    'Mortgage term is generally capped at 25 years (27 years for new builds where works are deferred).',
    'Mortgage insurance (assurance emprunteur) is mandatory and adds ~0.2–0.5% to the effective cost.',
    'Frais de notaire are paid upfront in addition to the deposit.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.001,
  greenMortgageEligibilityNote: 'Éco-PTZ (Eco zero-rate loan) up to €50,000 for energy renovation works on existing properties.',
};

export default fr;
