import ie from './ie';
import uk from './uk';
import uae from './uae';
import us from './us';
import au from './au';
import ca from './ca';
import type { MarketConfig, MarketCode } from '../types';

export const MARKETS: Record<MarketCode, MarketConfig> = {
  IE: ie,
  UK: uk,
  UAE: uae,
  US: us,
  AU: au,
  CA: ca,
};

export const LAUNCH_MARKETS: MarketCode[] = ['IE', 'UK', 'UAE'];
export const COMING_SOON_MARKETS: MarketCode[] = ['US', 'AU', 'CA'];

export function getMarket(code: MarketCode): MarketConfig {
  return MARKETS[code];
}

export type { MarketConfig };
