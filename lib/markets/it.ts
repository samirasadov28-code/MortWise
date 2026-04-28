import type { MarketConfig, BuyerType } from '../types';

const it: MarketConfig = {
  code: 'IT',
  name: 'Italy',
  flag: '🇮🇹',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 25,
  maxLTV: 0.80,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Best rates' },
    { maxLtv: 0.70, label: '51–70% LTV', description: 'Standard' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Maximum (95% with Consap guarantee for FTB)' },
  ],

  // Imposta di registro: 2% (FTB, prima casa) on cadastral value, 9% otherwise.
  // Approximation against purchase price: 2% FTB, 7% non-FTB.
  stampDuty: (price: number, buyerType: BuyerType): number => {
    if (buyerType === 'first_time') return price * 0.02;
    return price * 0.07;
  },

  govtSchemes: [
    {
      name: 'Fondo di Garanzia Prima Casa (Consap)',
      description: 'State guarantee covering up to 80% of mortgage principal for first-home buyers, allowing financing up to 100% LTV in some cases.',
      maxAmount: (price: number) => price * 0.50,
      eligibility: 'First home purchase; priority for under-36s, young couples, single parents; ISEE ≤ €40k',
      url: 'https://www.consap.it',
    },
    {
      name: 'Bonus Prima Casa Under 36',
      description: 'For under-36 first-home buyers with ISEE ≤ €40k: exemption from registration tax, mortgage tax, and cadastral tax.',
      maxAmount: 10_000,
      eligibility: 'Aged < 36 in year of purchase; ISEE ≤ €40k; first home, primary residence',
      url: 'https://www.agenziaentrate.gov.it',
    },
  ],

  regulatoryNotes: [
    'Mortgage rates referenced to Euribor (variable) or IRS / Eurirs (fixed).',
    'Surety from family is common to bridge income / deposit gaps.',
    'Notary fees ~1.5–2.5% of price — paid in cash at signing (rogito).',
    'Mutuo a tasso variabile con cap is popular: variable with a contractual maximum rate.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Mutuo Green available from major lenders (Intesa, Unicredit, BPM) for properties in energy class A or B, or for energy-upgrade renovations.',
};

export default it;
