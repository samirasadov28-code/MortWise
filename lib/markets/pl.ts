import type { MarketConfig, BuyerType } from '../types';

const pl: MarketConfig = {
  code: 'PL',
  name: 'Poland',
  flag: '🇵🇱',
  currency: 'PLN',
  currencySymbol: 'zł',
  defaultTerm: 25,
  maxLTV: 0.90,
  maxIncomeMultiple: 6,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '61–80% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Above 80% requires LTV insurance' },
  ],

  // PCC (tax on civil law transactions) 2% on resale; new-build VAT (8% / 23%) is in price.
  // FTB exemption from PCC for first home (announced 2023).
  stampDuty: (price: number, buyerType: BuyerType): number => {
    if (buyerType === 'first_time') return 0;
    return price * 0.02;
  },

  govtSchemes: [
    {
      name: 'Mieszkanie na Start (Housing for a Start)',
      description: 'Successor to Bezpieczny Kredyt 2% — government covers part of the interest so the borrower’s effective rate ranges 0–1.5% depending on household size.',
      maxAmount: 600_000,
      eligibility: 'Aged < 35 (or family of 2+); household income ≤ defined threshold; no other home',
      url: 'https://www.gov.pl',
    },
    {
      name: 'Rodzinny Kredyt Mieszkaniowy (Family Home Loan)',
      description: 'State guarantee covering the deposit (up to 100k PLN) for buyers with insufficient down payment.',
      maxAmount: 100_000,
      eligibility: 'No other property; income limits; minimum 5% own contribution required',
      url: 'https://bgk.pl',
    },
  ],

  regulatoryNotes: [
    'WIBOR (or new WIRON benchmark) underlies almost all variable-rate mortgages — sharp increases in 2022 hit borrowers hard.',
    'Periodically-fixed rates (5y or 10y) are gaining popularity post-2022 rate spike.',
    'KNF stress test: serviceability assessed at +2.5% above contract rate.',
    'No income mortgage interest deduction; FTB stamp duty exemption is the key tax break.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Some lenders (mBank, BNP Paribas) offer Eko Kredyt rate discounts for energy-efficient (≤ 40 kWh/m²/yr) properties.',
};

export default pl;
