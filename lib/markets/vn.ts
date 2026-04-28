import type { MarketConfig, BuyerType } from '../types';

const vn: MarketConfig = {
  code: 'VN',
  name: 'Vietnam',
  flag: '🇻🇳',
  currency: 'VND',
  currencySymbol: '₫',
  defaultTerm: 20,
  maxLTV: 0.70,
  maxIncomeMultiple: 5,
  minDepositPercent: 30,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Standard, sharpest rates' },
    { maxLtv: 0.70, label: '51–70% LTV', description: 'Maximum LTV typical bank' },
  ],

  // Registration fee 0.5%, plus 2% income tax on seller (often baked into price).
  // VAT 10% on new builds. Approximation 0.5% buyer-side + ~2% notary/stamp.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.025,

  govtSchemes: [
    {
      name: 'Social Housing Programme (Nhà ở xã hội)',
      description: 'Subsidised mortgages from VBSP (Vietnam Bank for Social Policies) at 4.8% fixed (vs ~10–12% market) for state-recognised social housing.',
      maxAmount: 1_000_000_000,
      eligibility: 'Low-income workers, civil servants, military; income/asset thresholds; defined social housing project only',
      url: 'https://vbsp.org.vn',
    },
    {
      name: '120 Trillion VND Programme',
      description: 'State-bank credit package offering reduced rates (~1.5–2% below market) to social housing buyers and developers.',
      maxAmount: (price: number) => price * 0.70,
      eligibility: 'Buyers of qualified social housing projects through state-owned banks (Vietcombank, BIDV, etc.)',
      url: 'https://www.sbv.gov.vn',
    },
  ],

  regulatoryNotes: [
    'Foreigners can purchase apartments (max 30% of any building) and houses (max 250 in any ward) under 50-year leasehold, renewable.',
    'Variable rates dominate; promotional fixed periods are typically only 1–3 years before reverting to floating.',
    'Mortgage rates closely track State Bank of Vietnam refinancing rate plus a wide bank margin (3–5%).',
    'Land Use Right Certificate (LURC, "pink book") is the legal title — verify before purchase.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default vn;
