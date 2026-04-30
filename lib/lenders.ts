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
  CN: [
    { name: 'ICBC',                       fixedRate: 0.0320, fixedPeriodYears: 5, variableRate: 0.0345 },
    { name: 'China Construction Bank',    fixedRate: 0.0315, fixedPeriodYears: 5, variableRate: 0.0340 },
    { name: 'Bank of China',              fixedRate: 0.0325, fixedPeriodYears: 5, variableRate: 0.0350 },
    { name: 'Agricultural Bank of China', fixedRate: 0.0320, fixedPeriodYears: 5, variableRate: 0.0345 },
    { name: 'China Merchants Bank',       fixedRate: 0.0310, fixedPeriodYears: 5, variableRate: 0.0335 },
  ],
  JP: [
    { name: 'Mitsubishi UFJ',  fixedRate: 0.0175, fixedPeriodYears: 10, variableRate: 0.0049 },
    { name: 'Sumitomo Mitsui', fixedRate: 0.0179, fixedPeriodYears: 10, variableRate: 0.0048 },
    { name: 'Mizuho',          fixedRate: 0.0180, fixedPeriodYears: 10, variableRate: 0.0050 },
    { name: 'Resona',          fixedRate: 0.0185, fixedPeriodYears: 10, variableRate: 0.0049 },
    { name: 'Japan Post Bank', fixedRate: 0.0189, fixedPeriodYears: 10, variableRate: 0.0055 },
  ],
  KR: [
    { name: 'KB Kookmin',  fixedRate: 0.0420, fixedPeriodYears: 5, variableRate: 0.0455 },
    { name: 'Shinhan',     fixedRate: 0.0425, fixedPeriodYears: 5, variableRate: 0.0460 },
    { name: 'Hana',        fixedRate: 0.0430, fixedPeriodYears: 5, variableRate: 0.0470 },
    { name: 'Woori',       fixedRate: 0.0435, fixedPeriodYears: 5, variableRate: 0.0475 },
    { name: 'NH NongHyup', fixedRate: 0.0440, fixedPeriodYears: 5, variableRate: 0.0480 },
  ],
  IN: [
    { name: 'SBI',                 fixedRate: 0.0855, fixedPeriodYears: 3, variableRate: 0.0890 },
    { name: 'HDFC Bank',           fixedRate: 0.0860, fixedPeriodYears: 3, variableRate: 0.0895 },
    { name: 'ICICI Bank',          fixedRate: 0.0870, fixedPeriodYears: 3, variableRate: 0.0905 },
    { name: 'Axis Bank',           fixedRate: 0.0875, fixedPeriodYears: 3, variableRate: 0.0915 },
    { name: 'LIC Housing Finance', fixedRate: 0.0865, fixedPeriodYears: 3, variableRate: 0.0900 },
  ],
  BR: [
    { name: 'Caixa Econômica', fixedRate: 0.0995, fixedPeriodYears: 5, variableRate: 0.1095 },
    { name: 'Itaú',            fixedRate: 0.1050, fixedPeriodYears: 5, variableRate: 0.1150 },
    { name: 'Bradesco',        fixedRate: 0.1075, fixedPeriodYears: 5, variableRate: 0.1175 },
    { name: 'Santander Brasil',fixedRate: 0.1080, fixedPeriodYears: 5, variableRate: 0.1180 },
    { name: 'Banco do Brasil', fixedRate: 0.1020, fixedPeriodYears: 5, variableRate: 0.1120 },
  ],
  MX: [
    { name: 'BBVA México',     fixedRate: 0.0960, fixedPeriodYears: 20, variableRate: 0.1020 },
    { name: 'Santander México',fixedRate: 0.0975, fixedPeriodYears: 20, variableRate: 0.1035 },
    { name: 'Banorte',         fixedRate: 0.0965, fixedPeriodYears: 20, variableRate: 0.1025 },
    { name: 'Citibanamex',     fixedRate: 0.0985, fixedPeriodYears: 20, variableRate: 0.1045 },
    { name: 'HSBC México',     fixedRate: 0.0990, fixedPeriodYears: 20, variableRate: 0.1050 },
  ],
  SA: [
    { name: 'Al Rajhi Bank',           fixedRate: 0.0540, fixedPeriodYears: 25, variableRate: 0.0595 },
    { name: 'Saudi National Bank',     fixedRate: 0.0545, fixedPeriodYears: 25, variableRate: 0.0600 },
    { name: 'Riyad Bank',              fixedRate: 0.0560, fixedPeriodYears: 25, variableRate: 0.0615 },
    { name: 'Banque Saudi Fransi',     fixedRate: 0.0555, fixedPeriodYears: 25, variableRate: 0.0610 },
    { name: 'Alinma Bank',             fixedRate: 0.0535, fixedPeriodYears: 25, variableRate: 0.0590 },
  ],
  TR: [
    { name: 'Ziraat Bankası', fixedRate: 0.3950, fixedPeriodYears: 1, variableRate: 0.4250 },
    { name: 'Garanti BBVA',   fixedRate: 0.4050, fixedPeriodYears: 1, variableRate: 0.4350 },
    { name: 'İş Bankası',     fixedRate: 0.4000, fixedPeriodYears: 1, variableRate: 0.4300 },
    { name: 'Akbank',         fixedRate: 0.4100, fixedPeriodYears: 1, variableRate: 0.4400 },
    { name: 'Yapı Kredi',     fixedRate: 0.4050, fixedPeriodYears: 1, variableRate: 0.4350 },
  ],
  PL: [
    { name: 'PKO BP',              fixedRate: 0.0710, fixedPeriodYears: 5, variableRate: 0.0790 },
    { name: 'Pekao',               fixedRate: 0.0720, fixedPeriodYears: 5, variableRate: 0.0795 },
    { name: 'mBank',               fixedRate: 0.0695, fixedPeriodYears: 5, variableRate: 0.0780 },
    { name: 'ING Bank Śląski',     fixedRate: 0.0705, fixedPeriodYears: 5, variableRate: 0.0785 },
    { name: 'Santander Bank Polska', fixedRate: 0.0715, fixedPeriodYears: 5, variableRate: 0.0790 },
  ],
  ID: [
    { name: 'Bank Mandiri', fixedRate: 0.0725, fixedPeriodYears: 3, variableRate: 0.0825 },
    { name: 'BCA',          fixedRate: 0.0699, fixedPeriodYears: 3, variableRate: 0.0799 },
    { name: 'BRI',          fixedRate: 0.0750, fixedPeriodYears: 3, variableRate: 0.0850 },
    { name: 'BNI',          fixedRate: 0.0735, fixedPeriodYears: 3, variableRate: 0.0835 },
    { name: 'CIMB Niaga',   fixedRate: 0.0745, fixedPeriodYears: 3, variableRate: 0.0845 },
  ],
  VN: [
    { name: 'Vietcombank', fixedRate: 0.0850, fixedPeriodYears: 3, variableRate: 0.1000 },
    { name: 'BIDV',        fixedRate: 0.0875, fixedPeriodYears: 3, variableRate: 0.1025 },
    { name: 'VietinBank',  fixedRate: 0.0860, fixedPeriodYears: 3, variableRate: 0.1010 },
    { name: 'Agribank',    fixedRate: 0.0865, fixedPeriodYears: 3, variableRate: 0.1015 },
    { name: 'Techcombank', fixedRate: 0.0890, fixedPeriodYears: 3, variableRate: 0.1040 },
  ],
  SE: [
    { name: 'Handelsbanken', fixedRate: 0.0389, fixedPeriodYears: 5, variableRate: 0.0420 },
    { name: 'SEB',           fixedRate: 0.0394, fixedPeriodYears: 5, variableRate: 0.0425 },
    { name: 'Swedbank',      fixedRate: 0.0385, fixedPeriodYears: 5, variableRate: 0.0415 },
    { name: 'Nordea',        fixedRate: 0.0399, fixedPeriodYears: 5, variableRate: 0.0430 },
    { name: 'Danske Bank',   fixedRate: 0.0405, fixedPeriodYears: 5, variableRate: 0.0435 },
  ],
  NO: [
    { name: 'DNB',                   fixedRate: 0.0555, fixedPeriodYears: 5, variableRate: 0.0595 },
    { name: 'Nordea Norway',         fixedRate: 0.0565, fixedPeriodYears: 5, variableRate: 0.0605 },
    { name: 'SpareBank 1',           fixedRate: 0.0560, fixedPeriodYears: 5, variableRate: 0.0600 },
    { name: 'Handelsbanken Norway',  fixedRate: 0.0550, fixedPeriodYears: 5, variableRate: 0.0590 },
    { name: 'Danske Bank Norway',    fixedRate: 0.0570, fixedPeriodYears: 5, variableRate: 0.0610 },
  ],
  BE: [
    { name: 'KBC',               fixedRate: 0.0335, fixedPeriodYears: 20, variableRate: 0.0395 },
    { name: 'BNP Paribas Fortis',fixedRate: 0.0345, fixedPeriodYears: 20, variableRate: 0.0405 },
    { name: 'Belfius',           fixedRate: 0.0349, fixedPeriodYears: 20, variableRate: 0.0410 },
    { name: 'ING Belgium',       fixedRate: 0.0339, fixedPeriodYears: 20, variableRate: 0.0399 },
    { name: 'Argenta',           fixedRate: 0.0325, fixedPeriodYears: 20, variableRate: 0.0385 },
  ],
  NZ: [
    { name: 'ANZ NZ',     fixedRate: 0.0599, fixedPeriodYears: 2, variableRate: 0.0699 },
    { name: 'ASB',        fixedRate: 0.0594, fixedPeriodYears: 2, variableRate: 0.0695 },
    { name: 'BNZ',        fixedRate: 0.0605, fixedPeriodYears: 2, variableRate: 0.0705 },
    { name: 'Westpac NZ', fixedRate: 0.0610, fixedPeriodYears: 2, variableRate: 0.0710 },
    { name: 'Kiwibank',   fixedRate: 0.0589, fixedPeriodYears: 2, variableRate: 0.0689 },
  ],
  AT: [
    { name: 'Erste Bank',     fixedRate: 0.0395, fixedPeriodYears: 10, variableRate: 0.0445 },
    { name: 'Bank Austria',   fixedRate: 0.0405, fixedPeriodYears: 10, variableRate: 0.0455 },
    { name: 'Raiffeisen',     fixedRate: 0.0399, fixedPeriodYears: 10, variableRate: 0.0449 },
    { name: 'BAWAG PSK',      fixedRate: 0.0389, fixedPeriodYears: 10, variableRate: 0.0440 },
    { name: 'Hypo NÖ',        fixedRate: 0.0385, fixedPeriodYears: 10, variableRate: 0.0435 },
  ],
  DK: [
    { name: 'Danske Bank',  fixedRate: 0.0445, fixedPeriodYears: 10, variableRate: 0.0495 },
    { name: 'Nordea Kredit',fixedRate: 0.0440, fixedPeriodYears: 10, variableRate: 0.0490 },
    { name: 'Jyske Bank',   fixedRate: 0.0455, fixedPeriodYears: 10, variableRate: 0.0505 },
    { name: 'Sydbank',      fixedRate: 0.0460, fixedPeriodYears: 10, variableRate: 0.0510 },
    { name: 'Nykredit',     fixedRate: 0.0435, fixedPeriodYears: 10, variableRate: 0.0485 },
  ],
  FI: [
    { name: 'OP',                  fixedRate: 0.0379, fixedPeriodYears: 10, variableRate: 0.0420 },
    { name: 'Nordea Finland',      fixedRate: 0.0385, fixedPeriodYears: 10, variableRate: 0.0425 },
    { name: 'Danske Bank Finland', fixedRate: 0.0395, fixedPeriodYears: 10, variableRate: 0.0435 },
    { name: 'Aktia',               fixedRate: 0.0389, fixedPeriodYears: 10, variableRate: 0.0429 },
    { name: 'Handelsbanken Finland', fixedRate: 0.0382, fixedPeriodYears: 10, variableRate: 0.0422 },
  ],
  GR: [
    { name: 'Alpha Bank',                 fixedRate: 0.0395, fixedPeriodYears: 10, variableRate: 0.0445 },
    { name: 'Eurobank',                   fixedRate: 0.0405, fixedPeriodYears: 10, variableRate: 0.0455 },
    { name: 'National Bank of Greece',    fixedRate: 0.0410, fixedPeriodYears: 10, variableRate: 0.0460 },
    { name: 'Piraeus Bank',               fixedRate: 0.0415, fixedPeriodYears: 10, variableRate: 0.0465 },
    { name: 'Attica Bank',                fixedRate: 0.0420, fixedPeriodYears: 10, variableRate: 0.0470 },
  ],
  CZ: [
    { name: 'ČSOB',                     fixedRate: 0.0510, fixedPeriodYears: 5, variableRate: 0.0570 },
    { name: 'Česká spořitelna',         fixedRate: 0.0505, fixedPeriodYears: 5, variableRate: 0.0565 },
    { name: 'Komerční banka',           fixedRate: 0.0520, fixedPeriodYears: 5, variableRate: 0.0580 },
    { name: 'Raiffeisenbank',           fixedRate: 0.0515, fixedPeriodYears: 5, variableRate: 0.0575 },
    { name: 'UniCredit Bank Czech',     fixedRate: 0.0525, fixedPeriodYears: 5, variableRate: 0.0585 },
  ],
  HU: [
    { name: 'OTP Bank',          fixedRate: 0.0695, fixedPeriodYears: 10, variableRate: 0.0775 },
    { name: 'K&H Bank',          fixedRate: 0.0710, fixedPeriodYears: 10, variableRate: 0.0790 },
    { name: 'MBH Bank',          fixedRate: 0.0700, fixedPeriodYears: 10, variableRate: 0.0780 },
    { name: 'Erste Hungary',     fixedRate: 0.0705, fixedPeriodYears: 10, variableRate: 0.0785 },
    { name: 'Raiffeisen Hungary',fixedRate: 0.0715, fixedPeriodYears: 10, variableRate: 0.0795 },
  ],
  RO: [
    { name: 'Banca Transilvania',  fixedRate: 0.0715, fixedPeriodYears: 5, variableRate: 0.0795 },
    { name: 'BCR',                 fixedRate: 0.0725, fixedPeriodYears: 5, variableRate: 0.0805 },
    { name: 'BRD-SocGen',          fixedRate: 0.0730, fixedPeriodYears: 5, variableRate: 0.0810 },
    { name: 'Raiffeisen Romania',  fixedRate: 0.0720, fixedPeriodYears: 5, variableRate: 0.0800 },
    { name: 'ING Romania',         fixedRate: 0.0710, fixedPeriodYears: 5, variableRate: 0.0790 },
  ],
  LU: [
    { name: 'Spuerkeess (BCEE)',     fixedRate: 0.0349, fixedPeriodYears: 15, variableRate: 0.0399 },
    { name: 'BIL',                   fixedRate: 0.0359, fixedPeriodYears: 15, variableRate: 0.0409 },
    { name: 'BGL BNP Paribas',       fixedRate: 0.0355, fixedPeriodYears: 15, variableRate: 0.0405 },
    { name: 'Raiffeisen Luxembourg', fixedRate: 0.0345, fixedPeriodYears: 15, variableRate: 0.0395 },
    { name: 'ING Luxembourg',        fixedRate: 0.0339, fixedPeriodYears: 15, variableRate: 0.0389 },
  ],
  IS: [
    { name: 'Landsbankinn',  fixedRate: 0.0820, fixedPeriodYears: 5, variableRate: 0.0950 },
    { name: 'Íslandsbanki',  fixedRate: 0.0830, fixedPeriodYears: 5, variableRate: 0.0960 },
    { name: 'Arion banki',   fixedRate: 0.0840, fixedPeriodYears: 5, variableRate: 0.0970 },
    { name: 'Kvika banki',   fixedRate: 0.0850, fixedPeriodYears: 5, variableRate: 0.0980 },
    { name: 'Indó',          fixedRate: 0.0810, fixedPeriodYears: 5, variableRate: 0.0940 },
  ],
  EE: [
    { name: 'Swedbank Estonia',fixedRate: 0.0475, fixedPeriodYears: 5, variableRate: 0.0535 },
    { name: 'SEB Estonia',     fixedRate: 0.0480, fixedPeriodYears: 5, variableRate: 0.0540 },
    { name: 'LHV',             fixedRate: 0.0470, fixedPeriodYears: 5, variableRate: 0.0530 },
    { name: 'Luminor',         fixedRate: 0.0485, fixedPeriodYears: 5, variableRate: 0.0545 },
    { name: 'Coop Pank',       fixedRate: 0.0490, fixedPeriodYears: 5, variableRate: 0.0550 },
  ],
  CY: [
    { name: 'Bank of Cyprus',  fixedRate: 0.0405, fixedPeriodYears: 5, variableRate: 0.0455 },
    { name: 'Hellenic Bank',   fixedRate: 0.0410, fixedPeriodYears: 5, variableRate: 0.0460 },
    { name: 'AstroBank',       fixedRate: 0.0420, fixedPeriodYears: 5, variableRate: 0.0470 },
    { name: 'Eurobank Cyprus', fixedRate: 0.0415, fixedPeriodYears: 5, variableRate: 0.0465 },
    { name: 'Alpha Bank Cyprus', fixedRate: 0.0418, fixedPeriodYears: 5, variableRate: 0.0468 },
  ],
  HK: [
    { name: 'HSBC',                  fixedRate: 0.0420, fixedPeriodYears: 2, variableRate: 0.0445 },
    { name: 'Bank of China (HK)',    fixedRate: 0.0415, fixedPeriodYears: 2, variableRate: 0.0440 },
    { name: 'Hang Seng Bank',        fixedRate: 0.0425, fixedPeriodYears: 2, variableRate: 0.0450 },
    { name: 'Standard Chartered HK', fixedRate: 0.0420, fixedPeriodYears: 2, variableRate: 0.0445 },
    { name: 'Citibank HK',           fixedRate: 0.0428, fixedPeriodYears: 2, variableRate: 0.0455 },
  ],
  TW: [
    { name: 'Taishin International', fixedRate: 0.0220, fixedPeriodYears: 1, variableRate: 0.0245 },
    { name: 'CTBC',                  fixedRate: 0.0215, fixedPeriodYears: 1, variableRate: 0.0240 },
    { name: 'E.Sun',                 fixedRate: 0.0225, fixedPeriodYears: 1, variableRate: 0.0250 },
    { name: 'Cathay United',         fixedRate: 0.0230, fixedPeriodYears: 1, variableRate: 0.0255 },
    { name: 'Mega International',    fixedRate: 0.0218, fixedPeriodYears: 1, variableRate: 0.0243 },
  ],
  TH: [
    { name: 'Bangkok Bank',  fixedRate: 0.0455, fixedPeriodYears: 3, variableRate: 0.0525 },
    { name: 'Kasikornbank',  fixedRate: 0.0450, fixedPeriodYears: 3, variableRate: 0.0520 },
    { name: 'SCB',           fixedRate: 0.0460, fixedPeriodYears: 3, variableRate: 0.0530 },
    { name: 'Krungthai',     fixedRate: 0.0445, fixedPeriodYears: 3, variableRate: 0.0515 },
    { name: 'TMBThanachart', fixedRate: 0.0465, fixedPeriodYears: 3, variableRate: 0.0535 },
  ],
  MY: [
    { name: 'Maybank',         fixedRate: 0.0420, fixedPeriodYears: 5, variableRate: 0.0470 },
    { name: 'CIMB',            fixedRate: 0.0425, fixedPeriodYears: 5, variableRate: 0.0475 },
    { name: 'Public Bank',     fixedRate: 0.0415, fixedPeriodYears: 5, variableRate: 0.0465 },
    { name: 'RHB',             fixedRate: 0.0430, fixedPeriodYears: 5, variableRate: 0.0480 },
    { name: 'Hong Leong Bank', fixedRate: 0.0428, fixedPeriodYears: 5, variableRate: 0.0478 },
  ],
  PH: [
    { name: 'BDO',       fixedRate: 0.0680, fixedPeriodYears: 5, variableRate: 0.0780 },
    { name: 'Metrobank', fixedRate: 0.0695, fixedPeriodYears: 5, variableRate: 0.0795 },
    { name: 'BPI',       fixedRate: 0.0685, fixedPeriodYears: 5, variableRate: 0.0785 },
    { name: 'Land Bank', fixedRate: 0.0670, fixedPeriodYears: 5, variableRate: 0.0770 },
    { name: 'PNB',       fixedRate: 0.0710, fixedPeriodYears: 5, variableRate: 0.0810 },
  ],
  QA: [
    { name: 'QNB',                    fixedRate: 0.0445, fixedPeriodYears: 5, variableRate: 0.0510 },
    { name: 'Doha Bank',              fixedRate: 0.0455, fixedPeriodYears: 5, variableRate: 0.0520 },
    { name: 'Commercial Bank Qatar',  fixedRate: 0.0460, fixedPeriodYears: 5, variableRate: 0.0525 },
    { name: 'Qatar Islamic Bank',     fixedRate: 0.0450, fixedPeriodYears: 5, variableRate: 0.0515 },
    { name: 'Ahli Bank',              fixedRate: 0.0465, fixedPeriodYears: 5, variableRate: 0.0530 },
  ],
  KW: [
    { name: 'NBK',                  fixedRate: 0.0540, fixedPeriodYears: 5, variableRate: 0.0610 },
    { name: 'Kuwait Finance House', fixedRate: 0.0550, fixedPeriodYears: 5, variableRate: 0.0620 },
    { name: 'Boubyan Bank',         fixedRate: 0.0545, fixedPeriodYears: 5, variableRate: 0.0615 },
    { name: 'Burgan Bank',          fixedRate: 0.0560, fixedPeriodYears: 5, variableRate: 0.0625 },
    { name: 'Gulf Bank',            fixedRate: 0.0555, fixedPeriodYears: 5, variableRate: 0.0620 },
  ],
  IL: [
    { name: 'Bank Hapoalim',     fixedRate: 0.0540, fixedPeriodYears: 10, variableRate: 0.0590 },
    { name: 'Bank Leumi',        fixedRate: 0.0545, fixedPeriodYears: 10, variableRate: 0.0595 },
    { name: 'Mizrahi-Tefahot',   fixedRate: 0.0535, fixedPeriodYears: 10, variableRate: 0.0585 },
    { name: 'Israel Discount',   fixedRate: 0.0555, fixedPeriodYears: 10, variableRate: 0.0605 },
    { name: 'FIBI',              fixedRate: 0.0550, fixedPeriodYears: 10, variableRate: 0.0600 },
  ],
  AR: [
    // UVA-indexed real rates — quoted on top of inflation indexation
    { name: 'Banco Nación',         fixedRate: 0.0590, fixedPeriodYears: 20, variableRate: 0.0690 },
    { name: 'Banco Galicia',        fixedRate: 0.0680, fixedPeriodYears: 20, variableRate: 0.0780 },
    { name: 'Santander Argentina',  fixedRate: 0.0699, fixedPeriodYears: 20, variableRate: 0.0799 },
    { name: 'BBVA Argentina',       fixedRate: 0.0710, fixedPeriodYears: 20, variableRate: 0.0810 },
    { name: 'Banco Macro',          fixedRate: 0.0720, fixedPeriodYears: 20, variableRate: 0.0820 },
  ],
  CL: [
    // UF-indexed real rates
    { name: 'Banco de Chile',     fixedRate: 0.0440, fixedPeriodYears: 20, variableRate: 0.0490 },
    { name: 'BancoEstado',        fixedRate: 0.0420, fixedPeriodYears: 20, variableRate: 0.0470 },
    { name: 'Santander Chile',    fixedRate: 0.0445, fixedPeriodYears: 20, variableRate: 0.0495 },
    { name: 'Itaú Chile',         fixedRate: 0.0455, fixedPeriodYears: 20, variableRate: 0.0505 },
    { name: 'BCI',                fixedRate: 0.0450, fixedPeriodYears: 20, variableRate: 0.0500 },
  ],
  ZA: [
    { name: 'Standard Bank', fixedRate: 0.1125, fixedPeriodYears: 5, variableRate: 0.1175 },
    { name: 'Absa',          fixedRate: 0.1130, fixedPeriodYears: 5, variableRate: 0.1180 },
    { name: 'FNB',           fixedRate: 0.1120, fixedPeriodYears: 5, variableRate: 0.1170 },
    { name: 'Nedbank',       fixedRate: 0.1135, fixedPeriodYears: 5, variableRate: 0.1185 },
    { name: 'Investec',      fixedRate: 0.1115, fixedPeriodYears: 5, variableRate: 0.1165 },
  ],
  UA: [
    // eOselia state programme rates (3% priority / 7% other) sit alongside market rates
    { name: 'PrivatBank',           fixedRate: 0.0700, fixedPeriodYears: 20, variableRate: 0.1850 },
    { name: 'Oschadbank',           fixedRate: 0.0700, fixedPeriodYears: 20, variableRate: 0.1875 },
    { name: 'Ukreximbank',          fixedRate: 0.0700, fixedPeriodYears: 20, variableRate: 0.1900 },
    { name: 'Raiffeisen Bank Aval', fixedRate: 0.0700, fixedPeriodYears: 20, variableRate: 0.1850 },
    { name: 'OTP Bank Ukraine',     fixedRate: 0.0700, fixedPeriodYears: 20, variableRate: 0.1825 },
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
