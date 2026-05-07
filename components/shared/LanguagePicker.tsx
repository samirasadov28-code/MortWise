'use client';

import { useTranslation } from '@/lib/i18n/I18nProvider';
import type { Language } from '@/lib/i18n/types';

interface LanguagePickerProps {
  /** Compact mode renders a smaller pill-style selector for headers. */
  compact?: boolean;
  className?: string;
}

/**
 * Language switcher rendered in the top of every page (landing nav + calculator
 * header). Native names are shown so non-English speakers can find their own
 * language without needing to read English. Russian uses a "RU" text label
 * instead of a flag emoji per the language spec.
 */
export default function LanguagePicker({ compact, className }: LanguagePickerProps) {
  const { language, setLanguage, options } = useTranslation();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      aria-label="Language"
      className={
        className ??
        `bg-white border border-[#e8e3dc] hover:border-[#4a7c96] text-[#2a2520] rounded-full font-medium focus:outline-none focus:border-[#4a7c96] cursor-pointer transition-colors ${
          compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'
        }`
      }
    >
      {options.map((opt) => (
        <option key={opt.code} value={opt.code} disabled={!opt.available}>
          {opt.flag} {opt.nativeName}
          {!opt.available ? ' (coming soon)' : ''}
        </option>
      ))}
    </select>
  );
}
