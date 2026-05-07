/**
 * Languages supported by MortWise. Translations are added in batches — strings
 * that don't yet have a translation in a given dictionary fall back to English.
 *
 * Russian deliberately uses the `RU` text label rather than a flag emoji.
 */
export type Language =
  | 'en'
  | 'uk'
  | 'fr'
  | 'es'
  | 'de'
  | 'pt'
  | 'it'
  | 'nl'
  | 'tr'
  | 'zh'
  | 'ar'
  | 'hi'
  | 'ru';

export interface LanguageOption {
  code: Language;
  flag: string;
  /** Whether `flag` is a real flag emoji or a text fallback (e.g. "RU"). */
  isText?: boolean;
  nativeName: string;
  englishName: string;
  /** True for right-to-left scripts. Used to set `dir` on <html>. */
  rtl?: boolean;
  /** True if the dictionary for this language is at least partially translated. */
  available: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', flag: '🇬🇧', nativeName: 'English',     englishName: 'English',                available: true  },
  { code: 'uk', flag: '🇺🇦', nativeName: 'Українська',  englishName: 'Ukrainian',              available: true  },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français',    englishName: 'French',                 available: true  },
  { code: 'es', flag: '🇪🇸', nativeName: 'Español',     englishName: 'Spanish',                available: false },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch',     englishName: 'German',                 available: false },
  { code: 'pt', flag: '🇵🇹', nativeName: 'Português',   englishName: 'Portuguese',             available: false },
  { code: 'it', flag: '🇮🇹', nativeName: 'Italiano',    englishName: 'Italian',                available: false },
  { code: 'nl', flag: '🇳🇱', nativeName: 'Nederlands',  englishName: 'Dutch',                  available: false },
  { code: 'tr', flag: '🇹🇷', nativeName: 'Türkçe',      englishName: 'Turkish',                available: false },
  { code: 'zh', flag: '🇨🇳', nativeName: '中文',         englishName: 'Chinese (Simplified)',   available: false },
  { code: 'ar', flag: '🇸🇦', nativeName: 'العربية',      englishName: 'Arabic',                 rtl: true, available: false },
  { code: 'hi', flag: '🇮🇳', nativeName: 'हिन्दी',         englishName: 'Hindi',                  available: false },
  { code: 'ru', flag: 'RU',  isText: true, nativeName: 'Русский', englishName: 'Russian',     available: false },
];
