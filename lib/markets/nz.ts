import type { MarketConfig, StampDutyContext } from '../types';

const nz: MarketConfig = {
  code: 'NZ',
  name: 'New Zealand',
  flag: '🇳🇿',
  currency: 'NZD',
  currencySymbol: 'NZ$',
  defaultTerm: 30,
  maxLTV: 0.95,
  maxIncomeMultiple: 6,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'No LVR speed-limit restriction' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Limited by RBNZ LVR speed limits' },
    { maxLtv: 0.95, label: '91–95% LTV', description: 'First-Home Loan only; income / price caps' },
  ],

  // No stamp duty in New Zealand — a notable feature of the market.
  stampDuty: (_price: number, _ctx: StampDutyContext): number => 0,

  govtSchemes: [
    {
      name: 'KiwiSaver First Home Withdrawal',
      description: 'Withdraw most of your KiwiSaver balance (leaving NZ$1,000) for a first home deposit, including employer + government contributions.',
      maxAmount: (price: number) => price * 0.20,
      eligibility: 'KiwiSaver member ≥ 3 years; first home; live in property ≥ 6 months',
      url: 'https://www.kiwisaver.govt.nz',
    },
    {
      name: 'First-Home Loan (Kāinga Ora)',
      description: 'Government-underwritten loan allowing first home buyers to purchase with as little as 5% deposit through participating lenders.',
      maxAmount: (price: number) => price * 0.95,
      eligibility: 'Income ≤ NZ$95k single / NZ$150k joint; deposit ≥ 5% of price; live in the home',
      url: 'https://kaingaora.govt.nz',
    },
  ],

  regulatoryNotes: [
    'No stamp duty or transfer tax — unusual among major housing markets.',
    'RBNZ LVR speed limits cap the share of high-LTV lending each bank can do (typically only 15% of new owner-occupier loans above 80% LTV).',
    'Most mortgages are fixed for 1–5 years, then re-fixed — long fixed (10+) is extremely rare.',
    'Bright-line test: capital gain on residential property sold within 2 years is taxable income (5–10y for some pre-2024 acquisitions).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'ANZ, ASB, Westpac, BNZ all offer Healthy Home / Green loan top-ups — typically NZ$80k at 1% for energy / insulation upgrades.',
};

export default nz;
