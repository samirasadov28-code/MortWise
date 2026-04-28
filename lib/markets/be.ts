import type { MarketConfig, BuyerType } from '../types';

const be: MarketConfig = {
  code: 'BE',
  name: 'Belgium',
  flag: '🇧🇪',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 25,
  maxLTV: 0.90,
  maxIncomeMultiple: 5,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'Standard NBB target — best rates' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'NBB tolerance band' },
    { maxLtv: 1.00, label: '91–100% LTV', description: 'Rare; case-by-case (FTB young buyers)' },
  ],

  // Registration duty (droit d'enregistrement / registratierechten) varies by region:
  // Flanders 3% (sole own home), Wallonia 12.5%, Brussels 12.5% (with €175k abatement for FTB).
  // Approximation: 6% FTB, 12% non-FTB (national average across regions).
  stampDuty: (price: number, buyerType: BuyerType): number => {
    if (buyerType === 'first_time') return price * 0.06;
    return price * 0.12;
  },

  govtSchemes: [
    {
      name: 'Vlaamse Woonlening (Flanders Social Loan)',
      description: 'Subsidised mortgage from Vlaams Woningfonds (or VMSW) for low/middle-income Flemish residents — rates well below market.',
      maxAmount: 350_000,
      eligibility: 'Income ≤ €56k single / €80k couple (2025); first home only; property in Flanders within price cap',
      url: 'https://www.vlaamswoningfonds.be',
    },
    {
      name: 'Brussels FTB Abatement',
      description: 'First-time buyers in Brussels enjoy a registration-duty exemption on the first €200k of the purchase price.',
      maxAmount: 25_000,
      eligibility: 'First-time buyer; property in Brussels; price ≤ €600k; primary residence ≥ 5 years',
      url: 'https://fiscalite.brussels',
    },
    {
      name: 'Wallonia Chèque Habitat',
      description: 'Tax credit (~€1,520/year for 20 years, scaled by income) replacing the old mortgage interest deduction in Wallonia.',
      maxAmount: 30_400,
      eligibility: 'Mortgage on sole own home in Wallonia; taxable income ≤ ~€90k',
      url: 'https://www.wallonie.be',
    },
  ],

  regulatoryNotes: [
    'NBB guidance: most mortgages should be ≤90% LTV — banks face a 35% extra capital charge on loans above this.',
    'Long fixed periods (20–25y) at a single rate are very common — Belgians strongly prefer rate certainty.',
    'Notary fees ~1.5–2% on top of registration duty — paid in cash at deed signing.',
    'Tax treatment varies sharply by region (Flanders / Wallonia / Brussels) — region of the property matters more than residence.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'KBC Eco-bonus, ING Green, Belfius offer rate discounts (0.05–0.20%) for energy class A or B / EPB ≤ 100 kWh/m²/yr.',
};

export default be;
