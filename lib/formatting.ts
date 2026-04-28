import type { MarketCode } from './types';

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
};

export function formatCurrency(value: number, market: MarketCode = 'IE', decimals = 0): string {
  const currency = CURRENCY_MAP[market];
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
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
