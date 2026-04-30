import type { MarketConfig, StampDutyContext } from '../types';

const hk: MarketConfig = {
  code: 'HK',
  name: 'Hong Kong',
  flag: '🇭🇰',
  currency: 'HKD',
  currencySymbol: 'HK$',
  defaultTerm: 30,
  maxLTV: 0.90,
  maxIncomeMultiple: 5,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Self-use property up to HK$30M' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Self-use HK$10M–30M (HKMC insurance)' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'FTB ≤ HK$10M with HKMC insurance' },
  ],

  // Ad Valorem Stamp Duty — Scale 2 (FTB / sole resident): tiered 1.5–4.25%.
  // Buyer's Stamp Duty (BSD) for foreigners abolished Feb 2024.
  stampDuty: (price: number, _ctx: StampDutyContext): number => {
    if (price <= 3_000_000) return 100;
    if (price <= 4_000_000) return price * 0.015;
    if (price <= 6_000_000) return price * 0.0225;
    if (price <= 9_000_000) return price * 0.03;
    if (price <= 20_000_000) return price * 0.0375;
    return price * 0.0425;
  },

  govtSchemes: [
    {
      name: 'HKMC Mortgage Insurance Programme',
      description: 'Hong Kong Mortgage Corporation insures the slice above 70% LTV so eligible buyers can obtain up to 80–90% LTV.',
      maxAmount: (price: number) => price * 0.20,
      eligibility: 'Self-use; price caps (HK$10M for 90%, HK$30M for 80%); income/DSR tests',
      url: 'https://www.hkmc.com.hk',
    },
    {
      name: 'Home Ownership Scheme (HOS)',
      description: 'Subsidised flats from the Housing Authority sold at a 30–50% discount to market price, with a clawback if resold within restriction period.',
      maxAmount: 0,
      eligibility: 'HK permanent resident; income/asset limits; lottery-allocated',
      url: 'https://www.housingauthority.gov.hk',
    },
  ],

  regulatoryNotes: [
    'HKMA caps: max 90% LTV (FTB ≤ HK$10M), DSR ≤ 50% (60% with mortgage insurance), 3% rate stress buffer.',
    'HIBOR-linked (H-plan) and prime-linked (P-plan) variable rates dominate; long fixed periods are uncommon.',
    'Cash rebates (~1–2% of loan) from lenders are common — net out against headline rate when comparing.',
    'Foreign buyers no longer face Buyer’s Stamp Duty since Feb 2024 — but rules can change quickly.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'HSBC, Hang Seng, Bank of China (HK) offer green mortgage cash rebates for properties holding BEAM Plus Gold/Platinum certification.',
};

export default hk;
