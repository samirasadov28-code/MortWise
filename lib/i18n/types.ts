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
  /** Emoji-flag fallback. Kept so we can degrade gracefully on platforms
   *  that block external image hosts. Never rendered when `iso` is set. */
  flag: string;
  /** ISO-3166 alpha-2 country code used to fetch a real flag image from
   *  flagcdn.com. Omitted for languages that should use a text label
   *  (currently Russian — see `isText`). */
  iso?: string;
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
  { code: 'en', flag: '🇬🇧', iso: 'gb', nativeName: 'English',     englishName: 'English',                available: true },
  { code: 'uk', flag: '🇺🇦', iso: 'ua', nativeName: 'Українська',  englishName: 'Ukrainian',              available: true },
  { code: 'fr', flag: '🇫🇷', iso: 'fr', nativeName: 'Français',    englishName: 'French',                 available: true },
  { code: 'es', flag: '🇪🇸', iso: 'es', nativeName: 'Español',     englishName: 'Spanish',                available: true },
  { code: 'de', flag: '🇩🇪', iso: 'de', nativeName: 'Deutsch',     englishName: 'German',                 available: true },
  { code: 'pt', flag: '🇵🇹', iso: 'pt', nativeName: 'Português',   englishName: 'Portuguese',             available: true },
  { code: 'it', flag: '🇮🇹', iso: 'it', nativeName: 'Italiano',    englishName: 'Italian',                available: true },
  { code: 'nl', flag: '🇳🇱', iso: 'nl', nativeName: 'Nederlands',  englishName: 'Dutch',                  available: true },
  { code: 'tr', flag: '🇹🇷', iso: 'tr', nativeName: 'Türkçe',      englishName: 'Turkish',                available: true },
  { code: 'zh', flag: '🇨🇳', iso: 'cn', nativeName: '中文',         englishName: 'Chinese (Simplified)',   available: true },
  { code: 'ar', flag: '🇸🇦', iso: 'sa', nativeName: 'العربية',      englishName: 'Arabic',                 rtl: true, available: true },
  { code: 'hi', flag: '🇮🇳', iso: 'in', nativeName: 'हिन्दी',         englishName: 'Hindi',                  available: true },
  { code: 'ru', flag: 'RU',  isText: true, nativeName: 'Русский',   englishName: 'Russian',              available: true },
  { code: 'bn', flag: '🇧🇩', iso: 'bd', nativeName: 'বাংলা',        englishName: 'Bengali',                available: true },
  { code: 'ja', flag: '🇯🇵', iso: 'jp', nativeName: '日本語',         englishName: 'Japanese',               available: true },
  { code: 'id', flag: '🇮🇩', iso: 'id', nativeName: 'Indonesia',    englishName: 'Indonesian',             available: true },
];
