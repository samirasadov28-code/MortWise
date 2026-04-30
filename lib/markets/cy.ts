import type { MarketConfig, StampDutyContext } from '../types';

const cy: MarketConfig = {
  code: 'CY',
  name: 'Cyprus',
  flag: '🇨🇾',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 30,
  maxLTV: 0.80,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Standard residents, best rates' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'CBC ceiling for residents' },
    { maxLtv: 0.70, label: 'Non-residents', description: 'Capped at 60–70% LTV' },
  ],

  // Property transfer fees: progressive 3/5/8% (50% reduction since 2014 — now 1.5/2.5/4%).
  // VAT exemption for new builds first 130 m² primary residence (5% reduced rate).
  stampDuty: (price: number, _ctx: StampDutyContext): number => {
    if (price <= 85_000) return price * 0.015;
    if (price <= 170_000) return 1_275 + (price - 85_000) * 0.025;
    return 3_400 + (price - 170_000) * 0.04;
  },

  govtSchemes: [
    {
      name: 'Reduced VAT for First Primary Residence',
      description: '5% reduced VAT (vs 19% standard) on the first 130 m² of new-build primary residence, capped at €350k property value.',
      maxAmount: 26_000,
      eligibility: 'First primary residence; ≤ 130 m² covered area; ≤ €350k value (€475k cap on property)',
      url: 'https://www.mof.gov.cy',
    },
    {
      name: 'Housing Plan for Mountain & Rural Areas',
      description: 'Direct grants up to €70,000 for purchase, construction or renovation of homes in designated mountain/rural areas.',
      maxAmount: 70_000,
      eligibility: 'Cyprus citizen, age limits, primary residence in eligible mountainous or rural community',
      url: 'https://www.cypruslife.gov.cy',
    },
  ],

  regulatoryNotes: [
    'Central Bank of Cyprus caps: max 80% LTV (residents), 70% (non-residents); DSTI ≤ 80% gross; 5% rate stress buffer.',
    'Title deed delays are a known risk — many older developments still trail title issuance; due diligence essential.',
    'No annual immovable property tax since 2017; municipal rates apply.',
    'Variable rates pegged to ECB + bank margin dominate; long fixed (>5y) is rare.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Bank of Cyprus, Hellenic Bank offer green housing loans for properties meeting energy class A under the EU EPBD.',
};

export default cy;
