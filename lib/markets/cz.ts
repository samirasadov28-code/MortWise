import type { MarketConfig, BuyerType } from '../types';

const cz: MarketConfig = {
  code: 'CZ',
  name: 'Czech Republic',
  flag: '🇨🇿',
  currency: 'CZK',
  currencySymbol: 'Kč',
  defaultTerm: 30,
  maxLTV: 0.90,
  maxIncomeMultiple: 8,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'Standard, best rates' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'CNB ceiling for under-36s; otherwise 80%' },
  ],

  // Property transfer tax (daň z nabytí) abolished in 2020.
  stampDuty: (_price: number, _buyerType: BuyerType): number => 0,

  govtSchemes: [
    {
      name: 'SFPI Hypotéka pro mladé',
      description: 'State Fund for Investment Support — interest-bearing top-up loan to bridge the deposit gap, at well-below-market fixed rates.',
      maxAmount: 3_000_000,
      eligibility: 'Aged < 36; first home; CZK income limits; primary residence',
      url: 'https://sfpi.cz',
    },
    {
      name: 'Stavební spoření',
      description: 'State-bonused building savings: ~10% bonus on annual contributions up to CZK 1,000, plus access to a guaranteed-rate Bauspar loan.',
      maxAmount: 1_000,
      eligibility: 'Czech resident saver of any age',
      url: 'https://www.mfcr.cz',
    },
  ],

  regulatoryNotes: [
    'CNB caps: max 90% LTV (under-36 FTB) / 80% otherwise; DSTI ≤ 45% (50% under 36); DTI ≤ 8.5× income (9.5× under 36) — caps suspended 2024 but expected back if heat returns.',
    'Mortgages typically have a fixation period of 3, 5, 7 or 10 years before the rate is reset.',
    'Mortgage tax deduction: interest on up to CZK 300k/year (CZK 150k for post-2021 contracts) deductible against income tax.',
    'Notary and cadastre fees are minor (~CZK 2,000) — buyer-friendly cost structure.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Komerční banka, ČSOB, Česká spořitelna offer Zelená hypotéka rate discounts for energy class A properties or upgrade renovations.',
};

export default cz;
