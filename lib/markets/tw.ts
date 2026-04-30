import type { MarketConfig, StampDutyContext } from '../types';

const tw: MarketConfig = {
  code: 'TW',
  name: 'Taiwan',
  flag: '🇹🇼',
  currency: 'TWD',
  currencySymbol: 'NT$',
  defaultTerm: 30,
  maxLTV: 0.80,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.65, label: '≤65% LTV', description: 'Standard, sharpest rates' },
    { maxLtv: 0.80, label: '66–80% LTV', description: 'First home, primary residence' },
    { maxLtv: 0.55, label: 'Second / luxury', description: 'CBC selective credit controls cap second homes at 50–60% LTV' },
  ],

  // Deed tax 6% on government-assessed value (公告現值, ~70% of market) ≈ 4.2% of price.
  // Plus stamp duty 0.1% and registration 0.1%.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.044,

  govtSchemes: [
    {
      name: 'Youth Home Purchase Loan (青年安心成家貸款)',
      description: 'Subsidised mortgage at very low fixed-rate top tier (~1.4%) for up to NT$10M, 40-year term with 5-year grace period.',
      maxAmount: 10_000_000,
      eligibility: 'Aged 18–45; first home, primary residence; per-household one-time use',
      url: 'https://www.land.moi.gov.tw',
    },
    {
      name: 'Self-Use Residential Loan Tax Deduction',
      description: 'Up to NT$300,000/year mortgage interest deductible against income tax, for one self-use primary residence per household.',
      maxAmount: 300_000,
      eligibility: 'Self-use property registered as residence; only one property per household',
      url: 'https://www.ntbt.gov.tw',
    },
  ],

  regulatoryNotes: [
    'CBC selective credit controls limit LTV to 50–60% on second homes, luxury homes (>NT$70M) and corporate buyers.',
    'Most mortgages are variable rate indexed to a basket of Big Five bank rates; long fixed periods are rare.',
    'Land Value Increment Tax (土地增值稅) is paid by the seller on government-assessed land appreciation.',
    'Foreigners can buy with reciprocity (their home country must allow Taiwanese to buy) and Ministry of Interior approval.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'CTBC, E.Sun, Land Bank offer rate cuts for properties with EEWH (Taiwan green building) Diamond/Gold certification.',
};

export default tw;
