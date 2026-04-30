import type { MarketConfig, StampDutyContext } from '../types';

const es: MarketConfig = {
  code: 'ES',
  name: 'Spain',
  flag: '🇪🇸',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 25,
  maxLTV: 0.80,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates' },
    { maxLtv: 0.70, label: '61–70% LTV', description: 'Standard' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Maximum residents (90% non-resident discount limited)' },
  ],

  // Spain treats new builds and resales completely differently:
  //   • Secondary (existing home): ITP transfer tax, 6–10% by autonomous region (8% national average).
  //   • New build (first sale from developer): IVA (VAT) 10% + AJD stamp duty ~1.2% national average.
  // Investor / non-resident pays the same headline rate but typically also AJD on the mortgage deed.
  stampDuty: (price: number, { propertyType }: StampDutyContext): number => {
    if (propertyType === 'new_build') return price * 0.112; // 10% IVA + 1.2% AJD
    return price * 0.08; // ITP, regional average
  },

  govtSchemes: [
    {
      name: 'ICO Línea Joven Vivienda',
      description: 'State-guaranteed mortgages for under-35s and families with children — government covers the portion above 80% LTV so buyers can finance up to 100%.',
      maxAmount: (price: number) => price * 0.20,
      eligibility: 'Aged < 35 or family with dependent minors; income ≤ 4.5× IPREM (~€37,800)',
      url: 'https://www.ico.es',
    },
    {
      name: 'Plan Estatal de Vivienda — Ayudas',
      description: 'Direct subsidy of up to €10,800 toward first home purchase for young buyers in qualifying regions.',
      maxAmount: 10_800,
      eligibility: 'Aged < 35; property ≤ €100k–€120k (region-dependent); income limits apply',
      url: 'https://www.mivau.gob.es',
    },
  ],

  regulatoryNotes: [
    'Bank of Spain expects affordability tested at stress rate (typically +2% above contract rate).',
    'Non-residents are typically capped at 60–70% LTV.',
    'Mixed-rate mortgages (a few years fixed, then variable referenced to Euribor) are very common.',
    'Total transaction costs (taxes, notary, registry, agency) often run 10–13% of price — must be paid in cash.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.001,
  greenMortgageEligibilityNote: 'Several lenders (BBVA, CaixaBank, Triodos) offer rate discounts for properties with energy certificate A or B.',
};

export default es;
