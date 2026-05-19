'use client';

import type { WizardState, MarketCode } from '@/lib/types';
import { MARKETS, LAUNCH_MARKETS, COMING_SOON_MARKETS } from '@/lib/markets';
import { scenariosForMarket } from '@/lib/lenders';
import Flag from '@/components/shared/Flag';
import { useTranslation } from '@/lib/i18n/I18nProvider';

// Maps non-standard market codes to ISO 3166-1 alpha-2 for Intl.DisplayNames
const CODE_TO_ISO: Partial<Record<MarketCode, string>> = {
  UK: 'GB',
  UAE: 'AE',
};

interface Step1Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step1Market({ state, onChange }: Step1Props) {
  const { t, language } = useTranslation();
  const selected = state.market;
  const market = MARKETS[selected];

  // Locale-aware country name resolver — falls back to the static English name
  const regionNames = (() => {
    try {
      return new Intl.DisplayNames([language], { type: 'region' });
    } catch {
      return null;
    }
  })();

  function getLocalizedName(code: MarketCode): string {
    const isoCode = CODE_TO_ISO[code] ?? (code as string);
    try {
      const localised = regionNames?.of(isoCode);
      return localised ?? MARKETS[code].name;
    } catch {
      return MARKETS[code].name;
    }
  }

  function selectMarket(code: MarketCode) {
    if (code === state.market) return;
    onChange({
      market: code,
      scenarios: scenariosForMarket(code, state.scenarios.length || 4),
      displayCurrencyMarket: code,
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2a2520] mb-1">{t('step1.title')}</h2>
      <p className="text-[#6b7a8a] text-sm mb-6">{t('step1.subtitle')}</p>

      {/* Equal-size country grid — every box has identical dimensions and a 2-line name slot
          so single-word and two-word country names sit visually identical. */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {LAUNCH_MARKETS.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => selectMarket(code as MarketCode)}
            className={`flex flex-col items-center justify-between gap-1 px-3 py-4 rounded-xl border-2 transition-all min-h-[140px] ${
              selected === code
                ? 'border-[#4a7c96] bg-[#4a7c96]/10'
                : 'border-[#e8e3dc] bg-[#eef4f7]/60 hover:border-[#4a7c96]/50'
            }`}
          >
            <Flag code={code as MarketCode} size={40} />
            <span className="text-xs font-medium text-[#2a2520] text-center leading-tight line-clamp-2 h-[2.4em] flex items-center justify-center">
              {getLocalizedName(code as MarketCode)}
            </span>
            <span className="text-[10px] text-[#6b7a8a] uppercase tracking-wide">{MARKETS[code].currency}</span>
          </button>
        ))}

        {COMING_SOON_MARKETS.map((code) => (
          <div
            key={code}
            className="flex flex-col items-center justify-between gap-1 px-3 py-4 rounded-xl border-2 border-[#e8e3dc]/50 bg-[#eef4f7]/20 opacity-50 cursor-not-allowed min-h-[140px]"
          >
            <Flag code={code as MarketCode} size={40} className="grayscale opacity-60" />
            <span className="text-xs font-medium text-[#6b7a8a] text-center leading-tight line-clamp-2 h-[2.4em] flex items-center justify-center">
              {getLocalizedName(code as MarketCode)}
            </span>
            <span className="text-[10px] text-[#6b7a8a]">{t('misc.comingSoon')}</span>
          </div>
        ))}
      </div>

      {/* Market context */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#2a2520] flex items-center gap-2">
          <Flag code={selected} size={20} /> {getLocalizedName(selected)} — {t('step1.keyContext')}
        </h3>

        {market.govtSchemes.length > 0 && (
          <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-lg p-4">
            <p className="text-xs font-semibold text-[#6b7a8a] uppercase tracking-wide mb-2">{t('step1.govtSchemes')}</p>
            <div className="space-y-2">
              {market.govtSchemes.map((scheme) => (
                <div key={scheme.name} className="flex items-start gap-2">
                  <span className="text-[#4a7c96] text-xs mt-0.5">•</span>
                  <div>
                    <span className="text-sm font-medium text-[#2a2520]">{scheme.name}</span>
                    <p className="text-xs text-[#6b7a8a]">{scheme.eligibility}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {market.regulatoryNotes.length > 0 && (
          <div className="bg-[#eef4f7]/80 border border-[#e8e3dc] rounded-lg p-4">
            <p className="text-xs font-semibold text-[#6b7a8a] uppercase tracking-wide mb-2">{t('step1.regulatoryNotes')}</p>
            <ul className="space-y-1">
              {market.regulatoryNotes.map((note, i) => (
                <li key={i} className="text-xs text-[#6b7a8a] flex items-start gap-2">
                  <span className="text-[#4a7c96] mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
