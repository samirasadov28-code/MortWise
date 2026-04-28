import type { MarketCode } from '@/lib/types';
import { MARKETS } from '@/lib/markets';
import Flag from './Flag';

interface MarketBadgeProps {
  code: MarketCode;
  size?: 'sm' | 'md' | 'lg';
}

export default function MarketBadge({ code, size = 'md' }: MarketBadgeProps) {
  const market = MARKETS[code];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };
  const flagSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <span className={`inline-flex items-center gap-1.5 bg-[#f9f7f4] border border-[#e8e3dc] rounded-full font-medium ${sizeClasses[size]}`}>
      <Flag code={code} size={flagSize} />
      <span>{market.name}</span>
    </span>
  );
}
