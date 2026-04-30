import type { MarketConfig, StampDutyContext } from '../types';

const ie: MarketConfig = {
  code: 'IE',
  name: 'Ireland',
  flag: '🇮🇪',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 30,
  maxLTV: 0.90,
  maxIncomeMultiple: 3.5,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates available' },
    { maxLtv: 0.70, label: '61–70% LTV', description: 'Very competitive' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Higher rate tier' },
    { maxLtv: 0.95, label: '91–95% LTV', description: 'Limited lenders, highest rates' },
  ],

  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    if (buyerType === 'investor') return price * 0.075;
    if (price <= 1_000_000) return price * 0.01;
    return 1_000_000 * 0.01 + (price - 1_000_000) * 0.02;
  },

  govtSchemes: [
    {
      name: 'Help to Buy',
      description: 'Income tax and DIRT refund for first-time buyers of new builds. Up to €30,000 or 10% of purchase price.',
      maxAmount: (price: number) => Math.min(30000, price * 0.10),
      eligibility: 'First-time buyers, new builds only, property ≤ €500,000',
      url: 'https://www.revenue.ie/en/property/help-to-buy-incentive/index.aspx',
    },
    {
      name: 'First Home Scheme',
      description: 'Government equity share up to 30% (20% if using HTB). Reduces mortgage size.',
      maxAmount: (price: number) => price * 0.30,
      eligibility: 'First-time buyers, new builds, price caps apply by county',
      url: 'https://firsthomescheme.ie',
    },
  ],

  regulatoryNotes: [
    'Central Bank macro-prudential rules cap borrowing at 3.5× gross annual income for most buyers.',
    'First-time buyers can borrow up to 90% LTV; second-time and subsequent buyers are limited to 80% LTV.',
    'Buy-to-let investors are limited to 70% LTV.',
    'The ECB base rate underpins variable and tracker mortgage rates in Ireland.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.002,
  greenMortgageEligibilityNote: 'BER rating of A or B typically required. Available from AIB, Bank of Ireland, Haven, and others.',
};

export default ie;
