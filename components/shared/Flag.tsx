import type { MarketCode } from '@/lib/types';

const ISO_MAP: Record<MarketCode, string> = {
  IE: 'ie',
  UK: 'gb',
  UAE: 'ae',
  US: 'us',
  AU: 'au',
  CA: 'ca',
  CN: 'cn',
  JP: 'jp',
  DE: 'de',
  FR: 'fr',
  NL: 'nl',
  KR: 'kr',
  ES: 'es',
  IT: 'it',
  IN: 'in',
  SG: 'sg',
  CH: 'ch',
  BR: 'br',
  MX: 'mx',
  SA: 'sa',
  TR: 'tr',
  PL: 'pl',
  ID: 'id',
  VN: 'vn',
  SE: 'se',
  NO: 'no',
  BE: 'be',
  NZ: 'nz',
};

interface FlagProps {
  code: MarketCode;
  size?: number;
  className?: string;
}

export default function Flag({ code, size = 32, className = '' }: FlagProps) {
  const iso = ISO_MAP[code];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${iso}.png`}
      alt={`${code} flag`}
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
      className={`inline-block rounded-sm shadow-sm ${className}`}
      style={{ objectFit: 'cover', width: size, height: Math.round(size * 0.75) }}
    />
  );
}
