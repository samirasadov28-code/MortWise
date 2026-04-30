import type { MarketCode, ScenarioInput } from './types';

export interface Lender {
  name: string;
  /** Fixed rate as a decimal, e.g. 0.038 for 3.8%. */
  fixedRate: number;
  /** Length of the fixed period in years. */
  fixedPeriodYears: number;
  /** Headline variable / SVR rate as a decimal. */
  variableRate: number;
  /** Optional cashback the lender offers as a decimal of loan amount. */
  cashbackPercent?: number;
  /** Years for which the lender can claw back cashback if you switch. */
  cashbackClawbackYears?: number;
}

/**
 * Indicative consumer mortgage rates from headline lenders. Hand-curated rather
 * than scraped — refresh periodically. Only used to seed the wizard's scenario
 * defaults when the user picks a market; users can edit any rate in Step 5.
 */
export const LENDERS_BY_MARKET: Partial<Record<MarketCode, Lender[]>> = {
  IE: [
    { name: 'Bank of Ireland', fixedRate: 0.0385, fixedPeriodYears: 5, variableRate: 0.0420, cashbackPercent: 0.02, cashbackClawbackYears: 5 },
    { name: 'AIB',             fixedRate: 0.0365, fixedPeriodYears: 3, variableRate: 0.0395 },
    { name: 'Permanent TSB',   fixedRate: 0.0395, fixedPeriodYears: 4, variableRate: 0.0440, cashbackPercent: 0.02 },
    { name: 'Haven',           fixedRate: 0.0370, fixedPeriodYears: 5, variableRate: 0.0415 },
    { name: 'Avant Money',     fixedRate: 0.0345, fixedPeriodYears: 7, variableRate: 0.0395 },
    { name: 'EBS',             fixedRate: 0.0380, fixedPeriodYears: 3, variableRate: 0.0425, cashbackPercent: 0.03 },
  ],
  UK: [
    { name: 'Halifax',         fixedRate: 0.0445, fixedPeriodYears: 5, variableRate: 0.0729 },
    { name: 'Nationwide',      fixedRate: 0.0429, fixedPeriodYears: 5, variableRate: 0.0699 },
    { name: 'NatWest',         fixedRate: 0.0438, fixedPeriodYears: 2, variableRate: 0.0764 },
    { name: 'Barclays',        fixedRate: 0.0449, fixedPeriodYears: 5, variableRate: 0.0739 },
    { name: 'HSBC',            fixedRate: 0.0419, fixedPeriodYears: 5, variableRate: 0.0699 },
    { name: 'Santander',       fixedRate: 0.0439, fixedPeriodYears: 2, variableRate: 0.0725 },
  ],
  US: [
    { name: 'Wells Fargo',     fixedRate: 0.0685, fixedPeriodYears: 30, variableRate: 0.0710 },
    { name: 'Chase',           fixedRate: 0.0675, fixedPeriodYears: 30, variableRate: 0.0700 },
    { name: 'Bank of America', fixedRate: 0.0680, fixedPeriodYears: 30, variableRate: 0.0705 },
    { name: 'Rocket Mortgage', fixedRate: 0.0665, fixedPeriodYears: 30, variableRate: 0.0695 },
    { name: 'US Bank',         fixedRate: 0.0670, fixedPeriodYears: 30, variableRate: 0.0700 },
  ],
  CA: [
    { name: 'RBC',             fixedRate: 0.0489, fixedPeriodYears: 5, variableRate: 0.0595 },
    { name: 'TD',              fixedRate: 0.0479, fixedPeriodYears: 5, variableRate: 0.0590 },
    { name: 'Scotiabank',      fixedRate: 0.0494, fixedPeriodYears: 5, variableRate: 0.0610 },
    { name: 'BMO',             fixedRate: 0.0484, fixedPeriodYears: 5, variableRate: 0.0600 },
    { name: 'CIBC',            fixedRate: 0.0489, fixedPeriodYears: 5, variableRate: 0.0605 },
  ],
  AU: [
    { name: 'CommBank',        fixedRate: 0.0589, fixedPeriodYears: 3, variableRate: 0.0625 },
    { name: 'Westpac',         fixedRate: 0.0594, fixedPeriodYears: 3, variableRate: 0.0635 },
    { name: 'NAB',             fixedRate: 0.0584, fixedPeriodYears: 3, variableRate: 0.0625 },
    { name: 'ANZ',             fixedRate: 0.0589, fixedPeriodYears: 3, variableRate: 0.0630 },
    { name: 'Macquarie',       fixedRate: 0.0574, fixedPeriodYears: 3, variableRate: 0.0610 },
  ],
  DE: [
    { name: 'Deutsche Bank',   fixedRate: 0.0335, fixedPeriodYears: 10, variableRate: 0.0395 },
    { name: 'Commerzbank',     fixedRate: 0.0345, fixedPeriodYears: 10, variableRate: 0.0405 },
    { name: 'ING DiBa',        fixedRate: 0.0325, fixedPeriodYears: 10, variableRate: 0.0385 },
    { name: 'DKB',             fixedRate: 0.0319, fixedPeriodYears: 10, variableRate: 0.0379 },
    { name: 'Sparkasse',       fixedRate: 0.0349, fixedPeriodYears: 10, variableRate: 0.0410 },
  ],
  FR: [
    { name: 'BNP Paribas',     fixedRate: 0.0345, fixedPeriodYears: 20, variableRate: 0.0395 },
    { name: 'Crédit Agricole', fixedRate: 0.0335, fixedPeriodYears: 20, variableRate: 0.0385 },
    { name: 'Société Générale',fixedRate: 0.0349, fixedPeriodYears: 20, variableRate: 0.0399 },
    { name: 'LCL',             fixedRate: 0.0339, fixedPeriodYears: 20, variableRate: 0.0389 },
    { name: 'Crédit Mutuel',   fixedRate: 0.0329, fixedPeriodYears: 20, variableRate: 0.0379 },
  ],
  ES: [
    { name: 'BBVA',            fixedRate: 0.0285, fixedPeriodYears: 25, variableRate: 0.0395 },
    { name: 'CaixaBank',       fixedRate: 0.0290, fixedPeriodYears: 25, variableRate: 0.0410 },
    { name: 'Santander',       fixedRate: 0.0299, fixedPeriodYears: 25, variableRate: 0.0410 },
    { name: 'Banco Sabadell',  fixedRate: 0.0289, fixedPeriodYears: 25, variableRate: 0.0399 },
    { name: 'ING España',      fixedRate: 0.0275, fixedPeriodYears: 25, variableRate: 0.0385 },
  ],
  IT: [
    { name: 'Intesa Sanpaolo', fixedRate: 0.0319, fixedPeriodYears: 20, variableRate: 0.0395 },
    { name: 'UniCredit',       fixedRate: 0.0325, fixedPeriodYears: 20, variableRate: 0.0405 },
    { name: 'BPER Banca',      fixedRate: 0.0329, fixedPeriodYears: 20, variableRate: 0.0410 },
    { name: 'Banco BPM',       fixedRate: 0.0335, fixedPeriodYears: 20, variableRate: 0.0415 },
    { name: 'Crédit Agricole Italia', fixedRate: 0.0315, fixedPeriodYears: 20, variableRate: 0.0395 },
  ],
  NL: [
    { name: 'ING',             fixedRate: 0.0399, fixedPeriodYears: 10, variableRate: 0.0470 },
    { name: 'Rabobank',        fixedRate: 0.0405, fixedPeriodYears: 10, variableRate: 0.0480 },
    { name: 'ABN AMRO',        fixedRate: 0.0395, fixedPeriodYears: 10, variableRate: 0.0465 },
    { name: 'SNS',             fixedRate: 0.0389, fixedPeriodYears: 10, variableRate: 0.0460 },
    { name: 'Triodos',         fixedRate: 0.0385, fixedPeriodYears: 10, variableRate: 0.0455 },
  ],
  PT: [
    { name: 'Caixa Geral',     fixedRate: 0.0339, fixedPeriodYears: 5, variableRate: 0.0395 },
    { name: 'Millennium BCP',  fixedRate: 0.0345, fixedPeriodYears: 5, variableRate: 0.0405 },
    { name: 'Novo Banco',      fixedRate: 0.0349, fixedPeriodYears: 5, variableRate: 0.0410 },
    { name: 'Santander Totta', fixedRate: 0.0335, fixedPeriodYears: 5, variableRate: 0.0395 },
    { name: 'BPI',             fixedRate: 0.0349, fixedPeriodYears: 5, variableRate: 0.0410 },
  ],
  CH: [
    { name: 'UBS',             fixedRate: 0.0185, fixedPeriodYears: 10, variableRate: 0.0249 },
    { name: 'Credit Suisse',   fixedRate: 0.0189, fixedPeriodYears: 10, variableRate: 0.0255 },
    { name: 'Raiffeisen',      fixedRate: 0.0179, fixedPeriodYears: 10, variableRate: 0.0245 },
    { name: 'PostFinance',     fixedRate: 0.0195, fixedPeriodYears: 10, variableRate: 0.0260 },
    { name: 'ZKB',             fixedRate: 0.0182, fixedPeriodYears: 10, variableRate: 0.0249 },
  ],
  UAE: [
    { name: 'Emirates NBD',    fixedRate: 0.0399, fixedPeriodYears: 3, variableRate: 0.0475 },
    { name: 'ADCB',            fixedRate: 0.0410, fixedPeriodYears: 3, variableRate: 0.0485 },
    { name: 'Mashreq',         fixedRate: 0.0420, fixedPeriodYears: 3, variableRate: 0.0495 },
    { name: 'HSBC UAE',        fixedRate: 0.0405, fixedPeriodYears: 3, variableRate: 0.0480 },
    { name: 'FAB',             fixedRate: 0.0399, fixedPeriodYears: 3, variableRate: 0.0475 },
  ],
  SG: [
    { name: 'DBS',             fixedRate: 0.0285, fixedPeriodYears: 3, variableRate: 0.0345 },
    { name: 'OCBC',            fixedRate: 0.0290, fixedPeriodYears: 3, variableRate: 0.0349 },
    { name: 'UOB',             fixedRate: 0.0295, fixedPeriodYears: 3, variableRate: 0.0355 },
    { name: 'Standard Chartered', fixedRate: 0.0289, fixedPeriodYears: 3, variableRate: 0.0349 },
    { name: 'Maybank SG',      fixedRate: 0.0299, fixedPeriodYears: 3, variableRate: 0.0359 },
  ],
};

/**
 * Generic fallback lender list — used for markets that don't have a curated
 * roster yet. The market's regulatory hints are baked in via defaultTerm.
 */
function genericLenders(): Lender[] {
  return [
    { name: 'Bank A', fixedRate: 0.040, fixedPeriodYears: 5, variableRate: 0.045 },
    { name: 'Bank B', fixedRate: 0.041, fixedPeriodYears: 5, variableRate: 0.046 },
    { name: 'Bank C', fixedRate: 0.042, fixedPeriodYears: 5, variableRate: 0.047 },
    { name: 'Bank D', fixedRate: 0.040, fixedPeriodYears: 5, variableRate: 0.045 },
    { name: 'Bank E', fixedRate: 0.043, fixedPeriodYears: 5, variableRate: 0.048 },
  ];
}

export function getLenders(market: MarketCode): Lender[] {
  return LENDERS_BY_MARKET[market] ?? genericLenders();
}

/** Build wizard scenarios seeded from a market's lender roster. */
export function scenariosForMarket(market: MarketCode, count = 4): ScenarioInput[] {
  const lenders = getLenders(market).slice(0, count);
  return lenders.map((l, i) => ({
    id: `scenario-${i + 1}`,
    lenderName: l.name,
    housePrice: 0, // overridden by wizard at calculation time
    otherFees: 5000,
    loanToValue: 0.80,
    otherFeesCoveredByDebt: false,
    mortgageTerm: 30,
    rateStructure: 'fixed' as const,
    fixedRate: l.fixedRate,
    fixedPeriodYears: l.fixedPeriodYears,
    variableRate: l.variableRate,
    cashbackPercent: l.cashbackPercent,
    cashbackClawbackYears: l.cashbackClawbackYears,
    repaymentType: 'annuity' as const,
    overpaymentReduces: 'term' as const,
  }));
}
