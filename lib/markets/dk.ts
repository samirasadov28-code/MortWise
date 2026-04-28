import type { MarketConfig, BuyerType } from '../types';

const dk: MarketConfig = {
  code: 'DK',
  name: 'Denmark',
  flag: '🇩🇰',
  currency: 'DKK',
  currencySymbol: 'kr',
  defaultTerm: 30,
  maxLTV: 0.95,
  maxIncomeMultiple: 4,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.80, label: '≤80% LTV', description: 'Realkredit (mortgage bond) only — best rates' },
    { maxLtv: 0.95, label: '81–95% LTV', description: 'Top-up bank loan above the realkredit cap' },
  ],

  // Tinglysningsafgift (registration duty): 0.6% of price + DKK 1,825 fixed (2024).
  // Approximation: 0.7%.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.006 + 1_825,

  govtSchemes: [
    {
      name: 'BoligJobordningen (Renovation Tax Credit)',
      description: 'Annual tax deduction of up to DKK 18k–25k of labour costs on home renovation, energy upgrades and household services.',
      maxAmount: 25_000,
      eligibility: 'All Danish taxpayers; primary or holiday home; labour cost only',
      url: 'https://www.skat.dk',
    },
    {
      name: 'Forældrekøb (Parent Purchase Structure)',
      description: 'Tax-advantaged structure where parents own a flat and rent it to a student child — keeps mortgage interest deductible against rental income.',
      maxAmount: 0,
      eligibility: 'Parents; child must rent at market rate; complex tax planning required',
      url: 'https://www.skat.dk',
    },
  ],

  regulatoryNotes: [
    'Unique Realkredit system: 30y fixed-rate callable mortgages funded by listed mortgage bonds — the borrower can buy back the bond at market price if rates rise.',
    'Hard 80% LTV cap on realkredit; the 80–95% slice must come as a much pricier bank top-up loan.',
    'Strict serviceability: max 4× income, plus DSTI tests at +1% / +2% rate buffers.',
    'Property value tax (ejendomsværdiskat) is owed annually; recently reformed in 2024.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Most realkredit institutes (Totalkredit, Realkredit Danmark, Nykredit) offer cheaper bond series for energy class A/B properties.',
};

export default dk;
