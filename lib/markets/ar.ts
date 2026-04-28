import type { MarketConfig, BuyerType } from '../types';

const ar: MarketConfig = {
  code: 'AR',
  name: 'Argentina',
  flag: '🇦🇷',
  currency: 'ARS',
  currencySymbol: 'AR$',
  defaultTerm: 20,
  maxLTV: 0.75,
  maxIncomeMultiple: 4,
  minDepositPercent: 25,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Best rates' },
    { maxLtv: 0.75, label: '51–75% LTV', description: 'Standard UVA / FTB programmes' },
  ],

  // Provincial impuesto de sellos varies 1–4% (commonly split buyer/seller).
  // Plus escribano (notary) fees ~1.5%, registration ~0.5%.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.025,

  govtSchemes: [
    {
      name: 'Crédito Hipotecario UVA',
      description: 'Mortgage indexed to UVA (CPI-linked) — instalments rise with inflation but interest rate is much lower (~6–8% real) vs nominal-peso loans.',
      maxAmount: 200_000_000,
      eligibility: 'Argentine resident with stable income; income / DTI test by lender',
      url: 'https://www.argentina.gob.ar',
    },
    {
      name: 'ProCreAr',
      description: 'State housing programme combining construction subsidies, land allocation and bank-credit underwriting for middle-income FTBs.',
      maxAmount: 100_000_000,
      eligibility: 'First home; income tier criteria; primary residence in qualifying provinces',
      url: 'https://www.argentina.gob.ar/procrear',
    },
  ],

  regulatoryNotes: [
    'High and volatile inflation makes nominal-peso fixed-rate mortgages rare; UVA (CPI-indexed) loans dominate when available.',
    'Mortgage market is small relative to GDP — most home purchases are cash transactions, often in USD.',
    'BCRA periodically restricts foreign-currency lending to those with USD income.',
    'Notary (escribano) selection by the buyer; total closing costs often 6–8% of price.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: '',
};

export default ar;
