import type { MarketConfig, StampDutyContext } from '../types';

const th: MarketConfig = {
  code: 'TH',
  name: 'Thailand',
  flag: '🇹🇭',
  currency: 'THB',
  currencySymbol: '฿',
  defaultTerm: 30,
  maxLTV: 0.95,
  maxIncomeMultiple: 5,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'Second / luxury home (BoT cap)' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'First home > THB 10M' },
    { maxLtv: 1.00, label: '91–100% LTV', description: 'First home ≤ THB 10M (BoT temporary easing)' },
  ],

  // Transfer fee 2% (sometimes negotiated 50/50 buyer/seller), specific business tax 3.3% if held <5y,
  // stamp duty 0.5% (not applicable if SBT applies). Effective: ~3% buyer side typical.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.025,

  govtSchemes: [
    {
      name: 'GH Bank Home Loan (Government Housing Bank)',
      description: 'State-owned GH Bank (ธอส.) offers subsidised fixed rates and reduced fees for low/middle-income FTBs through rotating campaigns.',
      maxAmount: 3_000_000,
      eligibility: 'Thai citizen; FTB or low-income household; income / property caps depending on campaign',
      url: 'https://www.ghbank.co.th',
    },
    {
      name: 'Reduced Transfer & Mortgage Fees',
      description: 'Government periodically caps transfer fee at 0.01% and mortgage registration at 0.01% (vs 1%) for properties ≤ THB 7M.',
      maxAmount: 200_000,
      eligibility: 'Property ≤ THB 7M; primary residence; valid during the active stimulus window',
      url: 'https://www.dol.go.th',
    },
  ],

  regulatoryNotes: [
    'Foreigners cannot own land outright but can own condominium units (max 49% of any building); houses are typically held via long-term lease or Thai-majority company.',
    'BoT LTV macroprudential rules: progressively tighter for second/third homes and luxury units.',
    'Mortgage rates are MRR/MLR-linked (variable); 1–3y promotional fixed rates are then-floating.',
    'Specific Business Tax (SBT) 3.3% on resale within 5 years of acquisition — usually paid by seller.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Bangkok Bank, Kasikorn, GH Bank periodically offer green home loan rate discounts for TREES- or LEED-certified properties.',
};

export default th;
