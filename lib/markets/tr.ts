import type { MarketConfig, BuyerType } from '../types';

const tr: MarketConfig = {
  code: 'TR',
  name: 'Turkey',
  flag: '🇹🇷',
  currency: 'TRY',
  currencySymbol: '₺',
  defaultTerm: 10,
  maxLTV: 0.90,
  maxIncomeMultiple: 6,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Best rates' },
    { maxLtv: 0.75, label: '51–75% LTV', description: 'Standard' },
    { maxLtv: 0.90, label: '76–90% LTV', description: 'Maximum (≤ ₺2M property), FTB only' },
  ],

  // Tapu harcı (title deed fee): 4% combined, conventionally split 2% buyer / 2% seller
  // — but commonly buyer pays both halves in practice.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.04,

  govtSchemes: [
    {
      name: 'TOKİ (Mass Housing Administration)',
      description: 'Government developer providing low-cost housing to first-time buyers with subsidised long-term instalment plans, no bank involved.',
      maxAmount: (price: number) => price * 0.90,
      eligibility: 'Turkish citizen, no property in last 10 years; income limits and lottery-based allocation',
      url: 'https://www.toki.gov.tr',
    },
    {
      name: 'Public Bank Subsidised FTB Loans',
      description: 'State banks (Ziraat, Halkbank, Vakıfbank) periodically launch subsidised mortgage campaigns at rates well below market — terms vary with policy.',
      maxAmount: 5_000_000,
      eligibility: 'First-time buyer; eligibility windows announced periodically; property value caps apply',
      url: 'https://www.ziraatbank.com.tr',
    },
  ],

  regulatoryNotes: [
    'High inflation environment — typical mortgage terms are short (5–10 years) and rates are very high.',
    'KDV (VAT) on new builds: 1% (residential ≤150 m²), 8% or 18% otherwise. Often included in advertised price.',
    'Foreigners can purchase residential property in most cities (with some restricted zones); €400k+ qualifies for citizenship by investment.',
    'Variable rates are essentially unused — fixed for the loan duration is standard.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default tr;
