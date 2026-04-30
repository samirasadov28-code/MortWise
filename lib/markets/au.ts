import type { MarketConfig, StampDutyContext } from '../types';

const au: MarketConfig = {
  code: 'AU',
  name: 'Australia',
  flag: '🇦🇺',
  currency: 'AUD',
  currencySymbol: 'A$',
  defaultTerm: 30,
  maxLTV: 0.95,
  maxIncomeMultiple: 6,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Sharpest rates' },
    { maxLtv: 0.80, label: '61–80% LTV', description: 'No LMI required' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'LMI applies' },
    { maxLtv: 0.95, label: '91–95% LTV', description: 'LMI + limited lenders' },
  ],

  // Stamp duty varies sharply by state. NSW/VIC FTB exemptions to ~A$650k–800k,
  // standard scale ~3–5.5%. Approximation: 4% for non-FTB, 1.5% for FTB.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    if (buyerType === 'first_time' && price <= 800_000) return price * 0.015;
    return price * 0.04;
  },

  govtSchemes: [
    {
      name: 'First Home Guarantee (FHBG)',
      description: 'Government guarantees the portion of the loan above 80% LTV so eligible first home buyers can purchase with as little as 5% deposit and avoid LMI.',
      maxAmount: (price: number) => Math.min(price * 0.15, 200_000),
      eligibility: 'Australian citizens, first home buyer, income < A$125k single / A$200k couple, property < state cap',
      url: 'https://www.housingaustralia.gov.au',
    },
    {
      name: 'First Home Super Saver Scheme (FHSSS)',
      description: 'Voluntary super contributions can be withdrawn (up to A$50k) for a first home deposit at concessional tax rates.',
      maxAmount: 50_000,
      eligibility: 'Never owned property in Australia; live in the home for ≥ 6 months in first 12',
      url: 'https://www.ato.gov.au',
    },
    {
      name: 'Help to Buy (Shared Equity)',
      description: 'Federal scheme where the government takes up to 40% equity stake in the home, reducing the mortgage required.',
      maxAmount: (price: number) => price * 0.40,
      eligibility: 'Income < A$90k single / A$120k couple; property within state price cap',
      url: 'https://www.dss.gov.au',
    },
  ],

  regulatoryNotes: [
    'APRA serviceability buffer: lenders must assess repayments at +3.0% above the offered rate.',
    'Lenders Mortgage Insurance (LMI) typically required above 80% LTV — adds 1–4% of loan amount.',
    'Variable and 1–5 year fixed are most common; long fixed terms are rare.',
    'Investor and interest-only loans attract higher rates and tighter rules.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Several major lenders (CBA, Bank Australia, Bendigo) offer discounts for properties with high NatHERS / 7-star energy ratings or solar/EV upgrades.',
};

export default au;
