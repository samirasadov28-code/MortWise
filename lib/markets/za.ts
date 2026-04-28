import type { MarketConfig, BuyerType } from '../types';

const za: MarketConfig = {
  code: 'ZA',
  name: 'South Africa',
  flag: '🇿🇦',
  currency: 'ZAR',
  currencySymbol: 'R',
  defaultTerm: 30,
  maxLTV: 1.00,
  maxIncomeMultiple: 5,
  minDepositPercent: 0,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'Standard, sharpest rates' },
    { maxLtv: 1.00, label: '81–100% LTV', description: 'FTB or higher-income borrower with strong credit' },
  ],

  // Transfer duty progressive: 0% under R 1.1M, then 3/6/8/11/13% tiers.
  // FTB: same scale (no extra exemption since 2017 reform).
  stampDuty: (price: number, _buyerType: BuyerType): number => {
    if (price <= 1_100_000) return 0;
    if (price <= 1_512_500) return (price - 1_100_000) * 0.03;
    if (price <= 2_117_500) return 12_375 + (price - 1_512_500) * 0.06;
    if (price <= 2_722_500) return 48_675 + (price - 2_117_500) * 0.08;
    if (price <= 12_100_000) return 97_075 + (price - 2_722_500) * 0.11;
    return 1_128_600 + (price - 12_100_000) * 0.13;
  },

  govtSchemes: [
    {
      name: 'FLISP (Finance-Linked Individual Subsidy Programme)',
      description: 'Once-off subsidy of R30,000–R130,000 toward deposit or principal reduction for first-home buyers in the gap-market.',
      maxAmount: 130_000,
      eligibility: 'Household income R3,501–R22,000/month; first home; bond approved by lender',
      url: 'https://www.dhs.gov.za',
    },
    {
      name: 'RDP / BNG Housing',
      description: 'Free fully-subsidised state housing for very-low-income households — Reconstruction & Development Programme / Breaking New Ground.',
      maxAmount: 0,
      eligibility: 'Household income < R3,500/month; SA citizen / PR; no prior state housing benefit',
      url: 'https://www.dhs.gov.za',
    },
  ],

  regulatoryNotes: [
    'No formal LTV cap; most lenders extend 100% bonds to qualifying FTBs but charge a higher rate above 90%.',
    'Mortgage rates quoted as Prime ± margin — strongly variable; fixed periods 1–5y are available but unusual.',
    'Bond registration and conveyancing fees ~3–4% on top of transfer duty — paid in cash on registration.',
    'Bond originators (e.g. ooba, BetterBond) submit to multiple banks and negotiate on behalf of the buyer at no charge.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Standard Bank, Nedbank, Absa offer green / EDGE-certified property home loan rate discounts and longer terms.',
};

export default za;
