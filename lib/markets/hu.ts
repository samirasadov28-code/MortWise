import type { MarketConfig, BuyerType } from '../types';

const hu: MarketConfig = {
  code: 'HU',
  name: 'Hungary',
  flag: '🇭🇺',
  currency: 'HUF',
  currencySymbol: 'Ft',
  defaultTerm: 25,
  maxLTV: 0.80,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.65, label: '≤65% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '66–80% LTV', description: 'Standard FHB cap' },
  ],

  // Vagyonszerzési illeték (acquisition duty): 4% standard, capped at HUF 200M.
  // First-home buyers under 35 with primary-residence intent: 0% up to HUF 80M property.
  stampDuty: (price: number, buyerType: BuyerType): number => {
    if (buyerType === 'first_time' && price <= 80_000_000) return 0;
    return Math.min(price * 0.04, 200_000_000);
  },

  govtSchemes: [
    {
      name: 'CSOK Plusz (Family Housing Allowance)',
      description: 'Subsidised mortgage at capped 3% rate plus a non-repayable grant for couples planning or having children — replaces older CSOK as of 2024.',
      maxAmount: 50_000_000,
      eligibility: 'Married couple aged < 41 with at least one child (or undertaking to have one); HUF income limits',
      url: 'https://www.kormany.hu',
    },
    {
      name: 'Babaváró Loan',
      description: 'Interest-free state loan up to HUF 11M for newly-married couples planning a child; converts to a grant after 3 children.',
      maxAmount: 11_000_000,
      eligibility: 'Married, wife aged 18–40, both with stable employment ≥ 3 yrs',
      url: 'https://www.kormany.hu',
    },
  ],

  regulatoryNotes: [
    'MNB rules: max 80% LTV for HUF loans, plus DSTI cap 25–60% scaled by income.',
    'HUF mortgages dominate after the 2014–15 forint conversion of foreign-currency loans.',
    'New-build VAT was reduced to 5% (extended through 2026) for properties under defined size and price thresholds.',
    'Variable rates pegged to BUBOR; long fixed periods (10y, full-term) gaining popularity.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0050,
  greenMortgageEligibilityNote: 'MNB Zöld Otthon programme: capped low-rate (currently 5%) mortgages for new-build properties meeting BB+ energy standard.',
};

export default hu;
