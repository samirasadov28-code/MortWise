import type { MarketConfig, BuyerType } from '../types';

const il: MarketConfig = {
  code: 'IL',
  name: 'Israel',
  flag: '🇮🇱',
  currency: 'ILS',
  currencySymbol: '₪',
  defaultTerm: 30,
  maxLTV: 0.75,
  maxIncomeMultiple: 6,
  minDepositPercent: 25,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Investor / second home cap' },
    { maxLtv: 0.70, label: '51–70% LTV', description: 'Mover / improver' },
    { maxLtv: 0.75, label: '71–75% LTV', description: 'First home — Bank of Israel cap' },
  ],

  // Mas rechishá (purchase tax): 0% on FTB up to ~₪1.97M, then progressive (3.5–10%);
  // Investors / second homes pay 8% from first shekel.
  stampDuty: (price: number, buyerType: BuyerType): number => {
    if (buyerType === 'investor' || buyerType === 'non_resident' || buyerType === 'mover') {
      return price * 0.08;
    }
    if (price <= 1_978_745) return 0;
    if (price <= 2_347_040) return (price - 1_978_745) * 0.035;
    if (price <= 6_055_070) return 12_890 + (price - 2_347_040) * 0.05;
    return 198_280 + (price - 6_055_070) * 0.08;
  },

  govtSchemes: [
    {
      name: 'Mehir L\'Mishtaken / Diyur Mufnam (Subsidised Housing Lottery)',
      description: 'Government discount programmes selling new homes to FTBs at 15–25% below market via lottery in development zones.',
      maxAmount: 0,
      eligibility: 'Israeli citizen / PR; first home, primary residence; income / family criteria',
      url: 'https://www.dira.moch.gov.il',
    },
    {
      name: 'Olim (New Immigrants) Mortgage Aid',
      description: 'Reduced purchase tax brackets and extended FTB benefit window for new immigrants buying first home in Israel.',
      maxAmount: 50_000,
      eligibility: 'Olim within 7 years of aliyah; first home; primary residence',
      url: 'https://www.gov.il/en/departments/ministry_of_aliyah_and_integration',
    },
  ],

  regulatoryNotes: [
    'Bank of Israel rules: max 75% LTV (FTB), 70% (mover), 50% (investor); max term 30y; max 2/3 of loan at variable rate.',
    'Mortgages are typically split (mortgage mix): part fixed CPI-linked, part variable, part fixed unindexed.',
    'Variable rate adjustment intervals must be ≥ 5 years for the adjustable slice (Bank of Israel rule).',
    'Annual property tax (arnona) is municipal, paid by the occupier (often the tenant).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Bank Hapoalim, Leumi, Mizrahi-Tefahot offer green mortgage rate discounts for properties with Israeli Standard 5281 green building certification.',
};

export default il;
