import type { MarketConfig, BuyerType } from '../types';

const at: MarketConfig = {
  code: 'AT',
  name: 'Austria',
  flag: '🇦🇹',
  currency: 'EUR',
  currencySymbol: '€',
  defaultTerm: 25,
  maxLTV: 0.90,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.60, label: '≤60% LTV', description: 'Best rates' },
    { maxLtv: 0.80, label: '61–80% LTV', description: 'Standard FMA target' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'KIM-V borderline; tighter scrutiny' },
  ],

  // Grunderwerbsteuer 3.5% + Eintragungsgebühr 1.1% + notary ~2%.
  // Approximation: 4.5% government fees combined.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.046,

  govtSchemes: [
    {
      name: 'Wohnbauförderung',
      description: 'State (Bundesland) housing subsidy — low-interest top-up loans and direct grants. Terms vary widely by province.',
      maxAmount: 80_000,
      eligibility: 'Income limits per Bundesland; primary residence; energy/quality criteria',
      url: 'https://www.oesterreich.gv.at',
    },
    {
      name: 'Bausparen',
      description: 'State-bonused home savings plan: ~1.5% bonus on annual contributions up to €1,200, plus access to a guaranteed-rate Bauspardarlehen loan.',
      maxAmount: 18,
      eligibility: 'Austrian resident; saver of any age',
      url: 'https://www.bausparkassen.at',
    },
  ],

  regulatoryNotes: [
    'KIM-V macroprudential rule: max 90% LTV, max 40% DSTI, max 35y term — banks granted limited leeway.',
    'Notarial costs (~2%) and Maklerprovision (broker commission, capped 2024 at 3% buyer/seller) sit on top of stamp duty.',
    'Long fixed periods of 15–25 years are common, often with cap-and-collar variable as a hybrid.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Bausparkassen and Erste Bank offer green discounts for properties meeting klimaaktiv silver/gold or energy class A standards.',
};

export default at;
