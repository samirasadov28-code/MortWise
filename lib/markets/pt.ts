import type { MarketConfig, StampDutyContext } from '../types';

const pt: MarketConfig = {
  code: 'PT',
  name: 'Portugal',
  flag: '🇵🇹',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 30,
  maxLTV: 0.90,
  maxIncomeMultiple: 5,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Standard residents' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Maximum residents (non-residents capped 70–80%)' },
  ],

  // IMT (transfer tax) — progressive scale, FTB primary-residence under €316k pays 0%.
  // Approximation: 0% if FTB primary <€316k, else ~6%.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    if (buyerType === 'first_time' && price <= 316_772) return 0;
    return price * 0.06;
  },

  govtSchemes: [
    {
      name: 'Garantia do Estado (Under-35 State Guarantee)',
      description: 'State guarantees up to 15% of the purchase price so buyers under 35 can finance up to 100% LTV.',
      maxAmount: (price: number) => price * 0.15,
      eligibility: 'Aged 18–35; first home, primary residence; price ≤ €450k; income ≤ 8th IRS bracket',
      url: 'https://www.portaldofinancas.gov.pt',
    },
    {
      name: 'IMT/Stamp Duty Exemption (Under-35)',
      description: 'Full exemption from IMT and stamp duty on first home purchase up to €316k, partial up to €633k, for buyers under 35.',
      maxAmount: 19_000,
      eligibility: 'Aged < 35; first home; sole owner / co-owner all under 35',
      url: 'https://www.portaldofinancas.gov.pt',
    },
  ],

  regulatoryNotes: [
    'Banco de Portugal recommendation: max 90% LTV (residents), 35y term, DSTI ≤ 50% with stress test.',
    'Non-residents typically face 70–80% LTV cap and tighter scrutiny.',
    'Stamp duty (Imposto do Selo) of 0.8% on the purchase plus 0.6% on the mortgage amount sits on top of IMT.',
    'Variable rates pegged to 6m or 12m Euribor dominate; mixed (a few years fixed then variable) is gaining share.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Crédito Habitação Verde from major Portuguese lenders (CGD, Millennium BCP, Santander) for energy class A or A+ properties.',
};

export default pt;
