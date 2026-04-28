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
import mx from './mx';
import sa from './sa';
import tr from './tr';
import pl from './pl';
import id from './id';
import vn from './vn';
import se from './se';
import no from './no';
import be from './be';
import nz from './nz';
import at from './at';
import dk from './dk';
import fi from './fi';
import pt from './pt';
import gr from './gr';
import cz from './cz';
import hu from './hu';
import ro from './ro';
import lu from './lu';
import is from './is';
import ee from './ee';
import cy from './cy';
import hk from './hk';
import tw from './tw';
import th from './th';
import my from './my';
import ph from './ph';
import qa from './qa';
import kw from './kw';
import il from './il';
import ar from './ar';
import cl from './cl';
import za from './za';
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
  MX: mx,
  SA: sa,
  TR: tr,
  PL: pl,
  ID: id,
  VN: vn,
  SE: se,
  NO: no,
  BE: be,
  NZ: nz,
  AT: at,
  DK: dk,
  FI: fi,
  PT: pt,
  GR: gr,
  CZ: cz,
  HU: hu,
  RO: ro,
  LU: lu,
  IS: is,
  EE: ee,
  CY: cy,
  HK: hk,
  TW: tw,
  TH: th,
  MY: my,
  PH: ph,
  QA: qa,
  KW: kw,
  IL: il,
  AR: ar,
  CL: cl,
  ZA: za,
};

// Markets that are fully supported and selectable in the wizard.
export const LAUNCH_MARKETS: MarketCode[] = [
  'IE', 'UK', 'UAE',
  'US', 'CN', 'JP', 'DE', 'FR',
  'AU', 'CA', 'NL', 'KR', 'ES', 'IT', 'IN', 'SG', 'CH', 'BR',
  'MX', 'SA', 'TR', 'PL', 'ID', 'VN', 'SE', 'NO', 'BE', 'NZ',
  'AT', 'DK', 'FI', 'PT', 'GR', 'CZ', 'HU', 'RO', 'LU', 'IS', 'EE', 'CY',
  'HK', 'TW', 'TH', 'MY', 'PH',
  'QA', 'KW', 'IL',
  'AR', 'CL', 'ZA',
];

// Markets that show as "coming soon" in the picker.
export const COMING_SOON_MARKETS: MarketCode[] = [];

export function getMarket(code: MarketCode): MarketConfig {
  return MARKETS[code];
}

export type { MarketConfig };
