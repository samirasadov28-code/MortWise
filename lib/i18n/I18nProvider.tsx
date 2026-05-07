'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import en from './dictionaries/en';
import uk from './dictionaries/uk';
import fr from './dictionaries/fr';
import type { Dictionary, TranslationKey } from './dictionaries/en';
import { LANGUAGES, type Language, type LanguageOption } from './types';

const DICTIONARIES: Record<Language, Partial<Dictionary>> = {
  en,
  uk,
  fr,
  // Other batches: fall back to English until a dictionary is added.
  es: {},
  de: {},
  pt: {},
  it: {},
  nl: {},
  tr: {},
  zh: {},
  ar: {},
  hi: {},
  ru: {},
};

const STORAGE_KEY = 'mortwise_lang';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Translate a key. Falls back to English then to the key itself. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  options: readonly LanguageOption[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load persisted preference once on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && DICTIONARIES[saved]) {
      setLanguageState(saved);
      const opt = LANGUAGES.find((l) => l.code === saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = opt?.rtl ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
      const opt = LANGUAGES.find((l) => l.code === lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = opt?.rtl ? 'rtl' : 'ltr';
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const dict = DICTIONARIES[language] as Partial<Dictionary>;
      const value = dict[key] ?? en[key] ?? key;
      return interpolate(value, vars);
    },
    [language],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t, options: LANGUAGES }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Outside the provider — return a no-op fallback so server-rendered
    // components and tests still work.
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: ((key: TranslationKey, vars?: Record<string, string | number>) =>
        interpolate(en[key] ?? key, vars)) as I18nContextValue['t'],
      options: LANGUAGES,
    };
  }
  return ctx;
}
