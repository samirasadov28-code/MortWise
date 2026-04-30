import type { MarketConfig, StampDutyContext } from '../types';

const id: MarketConfig = {
  code: 'ID',
  name: 'Indonesia',
  flag: '🇮🇩',
  currency: 'IDR',
  currencySymbol: 'Rp',
  defaultTerm: 20,
  maxLTV: 0.90,
  maxIncomeMultiple: 5,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Lowest rates' },
    { maxLtv: 0.85, label: '71–85% LTV', description: 'Standard KPR' },
    { maxLtv: 0.90, label: '86–90% LTV', description: 'First-home or FLPP-subsidised' },
  ],

  // BPHTB (acquisition duty): 5% above NJOP threshold (varies by region, ~Rp 60M-100M).
  // Plus PPN 11% on new-build above luxury threshold.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    const threshold = 80_000_000; // ~Rp 80M typical NJOP exemption
    if (buyerType === 'first_time' && price <= 2_000_000_000) return 0;
    return Math.max(price - threshold, 0) * 0.05;
  },

  govtSchemes: [
    {
      name: 'KPR FLPP (Subsidised Mortgage)',
      description: 'Government provides liquidity at low cost so banks lend to low-income buyers at a fixed 5% rate for the full term.',
      maxAmount: 240_000_000,
      eligibility: 'Monthly income ≤ Rp 8M; never owned a home; property within FLPP price cap',
      url: 'https://sikumbang.tapera.go.id',
    },
    {
      name: 'Tapera (Public Housing Savings)',
      description: 'Mandatory savings scheme (3% of salary) accessible for first-home purchase or home improvement at preferential rates.',
      maxAmount: 200_000_000,
      eligibility: 'Indonesian worker (gov & private); ≥ 12 months of contributions; first-time buyer',
      url: 'https://www.tapera.go.id',
    },
  ],

  regulatoryNotes: [
    'Foreigners cannot hold full freehold (Hak Milik); typically restricted to Hak Pakai (right of use, 30y renewable) or via PT PMA structure.',
    'BI-rate moves drive variable mortgage rates; many lenders offer 1–3y promotional fixed rates that revert to floating.',
    'KPR (Kredit Pemilikan Rumah) is the standard mortgage product across all major banks.',
    'PPN (VAT) of 11% applies to new builds above price thresholds — government has periodically waived this for FTB.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'BTN, Bank Mandiri offer green KPR for EDGE / Greenship-certified developments at slightly reduced rates.',
};

export default id;
