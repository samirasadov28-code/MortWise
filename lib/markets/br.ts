import type { MarketConfig, BuyerType } from '../types';

const br: MarketConfig = {
  code: 'BR',
  name: 'Brazil',
  flag: '🇧🇷',
  currency: 'BRL',
  currencySymbol: 'R$',
  defaultTerm: 30,
  maxLTV: 0.80,
  maxIncomeMultiple: 4,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Best rates' },
    { maxLtv: 0.70, label: '51–70% LTV', description: 'Standard SBPE financing' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Maximum financing (Caixa, MCMV)' },
  ],

  // ITBI: ~2–3% by município. São Paulo 3%, Rio 3%. Plus registration ~1%.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.03,

  govtSchemes: [
    {
      name: 'Minha Casa Minha Vida (MCMV)',
      description: 'Federal social housing programme: subsidised interest rates (4–8% vs 11%+ market), down-payment subsidies up to R$55k, and FGTS-backed financing.',
      maxAmount: 55_000,
      eligibility: 'Income tiers 1–3 (≤ R$8k household monthly); first home; property value ≤ R$350k',
      url: 'https://www.gov.br/mcmv',
    },
    {
      name: 'FGTS Withdrawal for Home Purchase',
      description: 'Workers can withdraw their accumulated FGTS (severance fund) as down payment or to amortise an existing mortgage.',
      maxAmount: (price: number) => price * 0.20,
      eligibility: 'Min 3 years of FGTS contributions; no other property in same metropolitan region; financing via SFH',
      url: 'https://www.caixa.gov.br/fgts',
    },
  ],

  regulatoryNotes: [
    'Most mortgages use the Sistema de Amortização Constante (SAC) — fixed principal, declining interest payments (not annuity).',
    'Rates indexed to TR (Taxa Referencial), IPCA inflation, or poupança savings rate; pure fixed rates exist but are pricier.',
    'Caixa Econômica Federal dominates the housing finance market.',
    'Foreigners can purchase but financing options are very limited — usually cash or local bank with strong relationship required.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default br;
