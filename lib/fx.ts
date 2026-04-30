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
