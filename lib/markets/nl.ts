import type { MarketConfig, StampDutyContext } from '../types';

const nl: MarketConfig = {
  code: 'NL',
  name: 'Netherlands',
  flag: '🇳🇱',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 30,
  maxLTV: 1.00,
  maxIncomeMultiple: 5,
  minDepositPercent: 0,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '61–80% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Higher tier' },
    { maxLtv: 1.00, label: '91–100% LTV', description: 'Maximum (NHG eligible)' },
  ],

  // Overdrachtsbelasting (transfer tax) only applies to existing properties.
  // New builds are sold with 21% VAT included in the price, no separate transfer tax.
  //   • FTB <35yo, primary residence, ≤ €525k:   0% (existing) / 0% (new build, no OVB)
  //   • Owner-occupier (mover):                   2% (existing) / 0% (new build)
  //   • Investor / second home / non-resident:   10.4% (existing) / 0% (new build, just VAT in price)
  stampDuty: (price: number, { buyerType, propertyType }: StampDutyContext): number => {
    if (propertyType === 'new_build') return 0;
    if (buyerType === 'first_time' && price <= 525_000) return 0;
    if (buyerType === 'investor' || buyerType === 'non_resident') return price * 0.104;
    return price * 0.02;
  },

  govtSchemes: [
    {
      name: 'Nationale Hypotheek Garantie (NHG)',
      description: 'National mortgage guarantee — lender risk is reduced so you get a discounted rate (~0.5–0.6% lower). Also provides a safety net if you cannot repay due to job loss, divorce, etc.',
      maxAmount: 435_000,
      eligibility: 'Property price ≤ €435k (2026 limit, €461k with energy upgrades); one-off premium 0.4% of mortgage',
      url: 'https://www.nhg.nl',
    },
    {
      name: 'Startersschenking (Family gift exemption)',
      description: 'Tax-free gift from parents (or anyone) up to a fixed annual amount, designated for buying or improving a primary residence.',
      maxAmount: 32_000,
      eligibility: 'Recipient aged 18–40; gift used for home purchase, improvement, or mortgage paydown',
      url: 'https://www.belastingdienst.nl',
    },
  ],

  regulatoryNotes: [
    'Mortgage interest is tax-deductible (hypotheekrenteaftrek) only on annuity / linear loans, not interest-only.',
    'Maximum loan based on income via NIBUD financing tables — strict but transparent.',
    '100% LTV financing is permitted, but kosten koper (notary, transfer tax, valuation) ~5–8% must be paid in cash.',
    'Long fixed periods of 10, 20, even 30 years are common given historically low rates.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0015,
  greenMortgageEligibilityNote: 'Most major lenders offer rate discounts for energy label A or better, plus extra borrowing capacity (€10k–€50k) for energy-saving improvements.',
};

export default nl;
