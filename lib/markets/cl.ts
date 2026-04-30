import type { MarketConfig, StampDutyContext } from '../types';

const cl: MarketConfig = {
  code: 'CL',
  name: 'Chile',
  flag: '🇨🇱',
  currency: 'CLP',
  currencySymbol: 'CLP$',
  defaultTerm: 25,
  maxLTV: 0.90,
  maxIncomeMultiple: 5,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Lowest UF-indexed rate' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'Standard mortgage' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'CMF allowance / SERVIU subsidy' },
  ],

  // Impuesto de timbres y estampillas (stamp duty on mortgage): ~0.8%.
  // Plus notary, conservador de bienes raíces ~1%.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.008,

  govtSchemes: [
    {
      name: 'Subsidio Habitacional DS1',
      description: 'Direct housing subsidy of UF 250–600 to middle-income households for purchase of new or existing home.',
      maxAmount: 22_500_000,
      eligibility: 'Household savings ≥ UF 30; family income limits by tier; first home preferred',
      url: 'https://www.minvu.gob.cl',
    },
    {
      name: 'Subsidio DS49 (Fondo Solidario)',
      description: 'Full state subsidy for low-income households to buy first home, often without taking on a mortgage at all.',
      maxAmount: 35_000_000,
      eligibility: 'Vulnerable household (Registro Social de Hogares ≤ 40%); first home; primary residence',
      url: 'https://www.minvu.gob.cl',
    },
  ],

  regulatoryNotes: [
    'Most mortgages are UF-indexed (Unidad de Fomento, daily CPI-linked) at fixed real rates over 15–30 years — Chilean borrowers carry inflation risk implicitly.',
    'Mutuo Hipotecario Endosable lets banks securitise the loan and sell it to insurers — typically the cheapest product class.',
    'CMF macroprudential rule (2023): max 80% LTV for second/investor property; 90% allowed for first home.',
    'Foreigners can purchase residential property freely (excluding some border zones).',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Banco de Chile, BancoEstado, Santander offer Hipoteca Verde rate discounts for CES- or LEED-certified properties.',
};

export default cl;
