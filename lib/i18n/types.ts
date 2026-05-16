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
  | 'ru'
  | 'bn'
  | 'ja'
  | 'id';

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
  { code: 'en', flag: '🇬🇧', nativeName: 'English',     englishName: 'English',                available: true },
  { code: 'uk', flag: '🇺🇦', nativeName: 'Українська',  englishName: 'Ukrainian',              available: true },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français',    englishName: 'French',                 available: true },
  { code: 'es', flag: '🇪🇸', nativeName: 'Español',     englishName: 'Spanish',                available: true },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch',     englishName: 'German',                 available: true },
  { code: 'pt', flag: '🇵🇹', nativeName: 'Português',   englishName: 'Portuguese',             available: true },
  { code: 'it', flag: '🇮🇹', nativeName: 'Italiano',    englishName: 'Italian',                available: true },
  { code: 'nl', flag: '🇳🇱', nativeName: 'Nederlands',  englishName: 'Dutch',                  available: true },
  { code: 'tr', flag: '🇹🇷', nativeName: 'Türkçe',      englishName: 'Turkish',                available: true },
  { code: 'zh', flag: '🇨🇳', nativeName: '中文',         englishName: 'Chinese (Simplified)',   available: true },
  { code: 'ar', flag: '🇸🇦', nativeName: 'العربية',      englishName: 'Arabic',                 rtl: true, available: true },
  { code: 'hi', flag: '🇮🇳', nativeName: 'हिन्दी',         englishName: 'Hindi',                  available: true },
  { code: 'ru', flag: 'RU',  isText: true, nativeName: 'Русский',   englishName: 'Russian',              available: true },
  { code: 'bn', flag: '🇧🇩', nativeName: 'বাংলা',     englishName: 'Bengali',              available: true },
  { code: 'ja', flag: '🇯🇵', nativeName: '日本語',     englishName: 'Japanese',             available: true },
  { code: 'id', flag: '🇮🇩', nativeName: 'Indonesia', englishName: 'Indonesian',           available: true },
];
