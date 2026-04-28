import ie from './ie';
import uk from './uk';
import uae from './uae';
import us from './us';
import au from './au';
import ca from './ca';
import cn from './cn';
import jp from './jp';
import de from './de';
import fr from './fr';
import nl from './nl';
import kr from './kr';
import es from './es';
import it from './it';
import inMarket from './in';
import sg from './sg';
import ch from './ch';
import br from './br';
import type { MarketConfig, MarketCode } from '../types';

export const MARKETS: Record<MarketCode, MarketConfig> = {
  IE: ie,
  UK: uk,
  UAE: uae,
  US: us,
  AU: au,
  CA: ca,
  CN: cn,
  JP: jp,
  DE: de,
  FR: fr,
  NL: nl,
  KR: kr,
  ES: es,
  IT: it,
  IN: inMarket,
  SG: sg,
  CH: ch,
  BR: br,
};

// Markets that are fully supported and selectable in the wizard.
export const LAUNCH_MARKETS: MarketCode[] = [
  'IE', 'UK', 'UAE',
  'US', 'CN', 'JP', 'DE', 'FR',
  'AU', 'CA', 'NL', 'KR', 'ES', 'IT', 'IN', 'SG', 'CH', 'BR',
];

// Markets that show as "coming soon" in the picker.
export const COMING_SOON_MARKETS: MarketCode[] = [];

export function getMarket(code: MarketCode): MarketConfig {
  return MARKETS[code];
}

export type { MarketConfig };
