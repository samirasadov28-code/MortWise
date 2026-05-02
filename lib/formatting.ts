import type { MarketCode } from './types';
import { EUR_PER_UNIT } from './fx';

const CURRENCY_MAP: Record<MarketCode, string> = {
  IE: 'EUR',
  UK: 'GBP',
  UAE: 'AED',
  US: 'USD',
  AU: 'AUD',
  CA: 'CAD',
  CN: 'CNY',
  JP: 'JPY',
  DE: 'EUR',
  FR: 'EUR',
  NL: 'EUR',
  KR: 'KRW',
  ES: 'EUR',
  IT: 'EUR',
  IN: 'INR',
  SG: 'SGD',
  CH: 'CHF',
  BR: 'BRL',
  MX: 'MXN',
  SA: 'SAR',
  TR: 'TRY',
  PL: 'PLN',
  ID: 'IDR',
  VN: 'VND',
  SE: 'SEK',
  NO: 'NOK',
  BE: 'EUR',
  NZ: 'NZD',
  AT: 'EUR',
  DK: 'DKK',
  FI: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  LU: 'EUR',
  IS: 'ISK',
  EE: 'EUR',
  CY: 'EUR',
  HK: 'HKD',
  TW: 'TWD',
  TH: 'THB',
  MY: 'MYR',
  PH: 'PHP',
  QA: 'QAR',
  KW: 'KWD',
  IL: 'ILS',
  AR: 'ARS',
  CL: 'CLP',
  ZA: 'ZAR',
  UA: 'UAH',
};

export function formatCurrency(value: number, market: MarketCode = 'IE', decimals = 0): string {
  const currency = CURRENCY_MAP[market];
  const formatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  // Walk the formatted parts so that any currency token (€, US$, A$, £, ¥…) is
  // followed by a space before the digits — produces "US$ 1,000,000" instead of "US$1,000,000".
  return formatter
    .formatToParts(value)
    .map((part, i, arr) => {
      if (part.type !== 'currency') return part.value;
      const next = arr[i + 1];
      if (!next) return part.value;
      // Don't double-space if the formatter already inserted a literal space
      if (next.type === 'literal' && next.value.startsWith(' ')) return part.value;
      return `${part.value} `;
    })
    .join('');
}

export function formatPercent(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a value held in `localMarket` currency into the user-chosen display
 * currency, FX-converting on the fly. If displayMarket is omitted or matches
 * localMarket, no conversion is applied.
 */
export function formatCurrencyIn(
  value: number,
  localMarket: MarketCode,
  displayMarket: MarketCode = localMarket,
  decimals = 0,
): string {
  if (displayMarket === localMarket) {
    return formatCurrency(value, localMarket, decimals);
  }
  const eur = value * (EUR_PER_UNIT[localMarket] ?? 1);
  const inDisplay = eur / (EUR_PER_UNIT[displayMarket] ?? 1);
  return formatCurrency(inDisplay, displayMarket, decimals);
}

export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} yr${years !== 1 ? 's' : ''}`;
  return `${years} yr${years !== 1 ? 's' : ''} ${rem} mo`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IE', { month: 'short', year: 'numeric' }).format(date);
}

export function parseCurrencyInput(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
}
