import type { MarketConfig, StampDutyContext } from '../types';

const gr: MarketConfig = {
  code: 'GR',
  name: 'Greece',
  flag: '🇬🇷',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 30,
  maxLTV: 0.90,
  maxIncomeMultiple: 5,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Standard private bank' },
    { maxLtv: 0.90, label: '71–90% LTV', description: 'Spiti Mou or My Home programmes' },
  ],

  // Property transfer tax: 3.09% on resale; new builds since 2006 attract 24% VAT
  // (currently suspended for new construction permits 2020–2025). FTB resale exemption up to €200k.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    if (buyerType === 'first_time' && price <= 200_000) return 0;
    return price * 0.0309;
  },

  govtSchemes: [
    {
      name: 'Spiti Mou II (My Home II)',
      description: 'State-backed mortgage covering 50% of the loan at 0% interest for under-50s; remaining 50% from a participating bank at market rate.',
      maxAmount: 190_000,
      eligibility: 'Aged 25–50; income €10k–€20k single / €€16k–€31k couple; first home, primary residence, resale built before 2008',
      url: 'https://www.dypa.gov.gr',
    },
    {
      name: 'New / Renovated Home Energy Subsidy (Eksoikonomo)',
      description: 'Direct grants of 40–75% of energy upgrade works on existing homes, plus tax credits.',
      maxAmount: 25_000,
      eligibility: 'Primary residence, owner-occupier; income limits apply; works must reach minimum energy class jump',
      url: 'https://exoikonomo.gov.gr',
    },
  ],

  regulatoryNotes: [
    'Bank of Greece DSTI cap: ≤ 30% for low-income, ≤ 40% for middle-income borrowers.',
    'NPL legacy from the debt crisis still tightens lending appetite — strict KYC and income documentation.',
    'Variable rates pegged to Euribor are dominant; long fixed (10y+) is offered but pricier.',
    'Annual ENFIA property tax replaces former owner-occupancy taxes since 2014.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.001,
  greenMortgageEligibilityNote: 'Eurobank, Alpha, Piraeus, Eθνική offer Green Mortgage with rate discounts for energy class A or A+ properties.',
};

export default gr;
