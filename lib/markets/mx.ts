import type { MarketConfig, BuyerType } from '../types';

const mx: MarketConfig = {
  code: 'MX',
  name: 'Mexico',
  flag: '🇲🇽',
  currency: 'MXN',
  currencySymbol: 'MX$',
  defaultTerm: 20,
  maxLTV: 0.95,
  maxIncomeMultiple: 4,
  minDepositPercent: 5,

  ltvBands: [
    { maxLtv: 0.70, label: '≤70% LTV', description: 'Best bank rates' },
    { maxLtv: 0.85, label: '71–85% LTV', description: 'Standard bank financing' },
    { maxLtv: 0.95, label: '86–95% LTV', description: 'INFONAVIT/FOVISSSTE backed' },
  ],

  // ISAI (Impuesto Sobre Adquisición de Inmuebles) varies 2–5% by state.
  // Plus notary, registry, appraisal — total ~6–8% closing costs.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.04,

  govtSchemes: [
    {
      name: 'INFONAVIT',
      description: 'Workers’ housing fund — subsidised mortgages funded by mandatory employer contributions, with rates well below market.',
      maxAmount: 2_500_000,
      eligibility: 'Private-sector employees with sufficient INFONAVIT points; loan amount based on salary tier',
      url: 'https://www.infonavit.org.mx',
    },
    {
      name: 'FOVISSSTE',
      description: 'Equivalent of INFONAVIT for federal public-sector workers, including teachers and government employees.',
      maxAmount: 2_500_000,
      eligibility: 'ISSSTE-affiliated public-sector workers; allocation by points-based lottery (sorteo)',
      url: 'https://www.fovissste.gob.mx',
    },
    {
      name: 'Crédito Cofinanciado (Co-financed)',
      description: 'INFONAVIT/FOVISSSTE loan stacked with a bank mortgage to reach a higher purchase price.',
      maxAmount: (price: number) => price * 0.95,
      eligibility: 'Eligible for both INFONAVIT/FOVISSSTE and a complementary bank mortgage',
      url: 'https://www.infonavit.org.mx',
    },
  ],

  regulatoryNotes: [
    'Most bank mortgages are fixed-rate over the full term — a key differentiator vs much of Latin America.',
    'Foreigners can buy in the restricted zone (50 km from coast / 100 km from border) only via a bank trust (fideicomiso).',
    'Notary fees are substantial (1–2% of price) and the buyer pays.',
    'INFONAVIT loans charge a fixed annual rate and are repaid as a percentage of salary, not a fixed peso amount.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'Hipoteca Verde (INFONAVIT) — extra credit (~MX$30k–60k) earmarked for energy/water-saving features in a new home.',
};

export default mx;
