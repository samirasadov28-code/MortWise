import type { MarketCode } from './types';

// Approximate FX rates expressed as: 1 unit of local currency = X EUR.
// Updated occasionally — accuracy is sufficient for ranking total-cost-of-ownership
// between markets, not for live trading. Refresh periodically from any major source.
export const EUR_PER_UNIT: Record<MarketCode, number> = {
  IE: 1,        // EUR
  DE: 1,
  FR: 1,
  NL: 1,
  ES: 1,
  IT: 1,
  BE: 1,
  AT: 1,
  PT: 1,
  GR: 1,
  LU: 1,
  EE: 1,
  CY: 1,
  FI: 1,
  UK: 1.16,     // GBP
  US: 0.92,     // USD
  CA: 0.67,     // CAD
  AU: 0.60,     // AUD
  NZ: 0.55,     // NZD
  CH: 1.05,     // CHF
  JP: 0.0058,   // JPY
  CN: 0.13,     // CNY
  KR: 0.00067,  // KRW
  IN: 0.011,    // INR
  SG: 0.68,     // SGD
  HK: 0.12,     // HKD
  TW: 0.029,    // TWD
  TH: 0.026,    // THB
  MY: 0.20,     // MYR
  PH: 0.016,    // PHP
  ID: 0.000056, // IDR
  VN: 0.000037, // VND
  SE: 0.087,    // SEK
  NO: 0.085,    // NOK
  DK: 0.134,    // DKK
  IS: 0.0066,   // ISK
  PL: 0.23,     // PLN
  CZ: 0.040,    // CZK
  HU: 0.0025,   // HUF
  RO: 0.20,     // RON
  TR: 0.027,    // TRY
  UA: 0.022,    // UAH
  UAE: 0.25,    // AED
  SA: 0.245,    // SAR
  QA: 0.252,    // QAR
  KW: 2.99,     // KWD
  IL: 0.245,    // ILS
  MX: 0.046,    // MXN
  BR: 0.16,     // BRL
  AR: 0.00091,  // ARS
  CL: 0.00094,  // CLP
  ZA: 0.048,    // ZAR
};

export function toEur(amount: number, market: MarketCode): number {
  return amount * (EUR_PER_UNIT[market] ?? 1);
}

/** Convert from one market's local currency to another's, pivoting through EUR. */
export function convertCurrency(amount: number, from: MarketCode, to: MarketCode): number {
  const eur = amount * (EUR_PER_UNIT[from] ?? 1);
  return eur / (EUR_PER_UNIT[to] ?? 1);
}

/**
 * Currencies offered as the cross-market comparison base. One representative
 * market per unique currency code in the platform — covers all 52 markets'
 * currencies (EUR, GBP, USD, JPY, CHF, AUD, CAD, NZD, SGD, HKD, CNY, KRW, TWD,
 * THB, MYR, PHP, IDR, INR, VND, SEK, NOK, DKK, ISK, PLN, CZK, HUF, RON, TRY,
 * UAH, AED, SAR, QAR, KWD, ILS, MXN, BRL, ARS, CLP, ZAR).
 */
export const COMPARISON_CURRENCIES: { market: MarketCode; label: string }[] = [
  { market: 'IE',  label: 'EUR' },
  { market: 'US',  label: 'USD' },
  { market: 'UK',  label: 'GBP' },
  { market: 'CH',  label: 'CHF' },
  { market: 'JP',  label: 'JPY' },
  { market: 'AU',  label: 'AUD' },
  { market: 'CA',  label: 'CAD' },
  { market: 'NZ',  label: 'NZD' },
  { market: 'SG',  label: 'SGD' },
  { market: 'HK',  label: 'HKD' },
  { market: 'CN',  label: 'CNY' },
  { market: 'KR',  label: 'KRW' },
  { market: 'TW',  label: 'TWD' },
  { market: 'TH',  label: 'THB' },
  { market: 'MY',  label: 'MYR' },
  { market: 'PH',  label: 'PHP' },
  { market: 'ID',  label: 'IDR' },
  { market: 'IN',  label: 'INR' },
  { market: 'VN',  label: 'VND' },
  { market: 'SE',  label: 'SEK' },
  { market: 'NO',  label: 'NOK' },
  { market: 'DK',  label: 'DKK' },
  { market: 'IS',  label: 'ISK' },
  { market: 'PL',  label: 'PLN' },
  { market: 'CZ',  label: 'CZK' },
  { market: 'HU',  label: 'HUF' },
  { market: 'RO',  label: 'RON' },
  { market: 'TR',  label: 'TRY' },
  { market: 'UA',  label: 'UAH' },
  { market: 'UAE', label: 'AED' },
  { market: 'SA',  label: 'SAR' },
  { market: 'QA',  label: 'QAR' },
  { market: 'KW',  label: 'KWD' },
  { market: 'IL',  label: 'ILS' },
  { market: 'MX',  label: 'MXN' },
  { market: 'BR',  label: 'BRL' },
  { market: 'AR',  label: 'ARS' },
  { market: 'CL',  label: 'CLP' },
  { market: 'ZA',  label: 'ZAR' },
];
