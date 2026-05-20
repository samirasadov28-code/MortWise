'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { LANGUAGES, type Language } from '@/lib/i18n/types';

interface LanguagePickerProps {
  /** Compact mode renders a smaller pill-style selector for headers. */
  compact?: boolean;
  className?: string;
}

/**
 * Custom dropdown that shows real flag images (via flagcdn.com) instead of
 * emoji flags — emoji flags don't render on Windows and on some Asian locales,
 * so users were seeing "GB" / "FR" letter blocks instead of a flag.
 *
 * Russian deliberately uses an "RU" text label rather than a flag (per the
 * language spec), so it falls back to a tinted text chip.
 */
export default function LanguagePicker({ compact, className }: LanguagePickerProps) {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Close on outside click / Escape so the dropdown behaves like a real menu.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const buttonClass =
    className ??
    `inline-flex items-center gap-1.5 bg-white border border-[#e8e3dc] hover:border-[#4a7c96] text-[#2a2520] rounded-full font-medium focus:outline-none focus:border-[#4a7c96] cursor-pointer transition-colors ${
      compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'
    }`;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className={buttonClass}
      >
        <LanguageBadge code={language} size={compact ? 16 : 18} />
        <span>{current.nativeName}</span>
        <span aria-hidden className="text-[10px] text-[#6b7a8a]">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Choose language"
          className="absolute right-0 mt-1 z-50 max-h-80 overflow-y-auto bg-white border border-[#e8e3dc] rounded-lg shadow-lg py-1 min-w-[170px]"
        >
          {LANGUAGES.map((opt) => {
            const selected = opt.code === language;
            return (
              <li key={opt.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  disabled={!opt.available}
                  onClick={() => {
                    setLanguage(opt.code as Language);
                    setOpen(false);
                  }}
                  className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                    selected
                      ? 'bg-[#eef4f7] text-[#2a2520]'
                      : 'text-[#2a2520] hover:bg-[#f9f7f4]'
                  } ${opt.available ? '' : 'opacity-40 cursor-not-allowed'}`}
                >
                  <LanguageBadge code={opt.code} size={18} />
                  <span className="flex-1">{opt.nativeName}</span>
                  {!opt.available && (
                    <span className="text-[10px] text-[#6b7a8a]">soon</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Visual badge for a language — a real flag image for everything except
 * Russian, which renders as a small text chip ("RU"). Used both inside the
 * picker dropdown and on its trigger button.
 */
export function LanguageBadge({ code, size = 18 }: { code: Language; size?: number }) {
  const opt = LANGUAGES.find((l) => l.code === code);
  if (!opt) return null;
  if (opt.isText || !opt.iso) {
    return (
      <span
        aria-hidden
        className="inline-flex items-center justify-center bg-[#2a2520] text-white text-[10px] font-bold leading-none rounded-sm px-1"
        style={{ height: Math.round(size * 0.75), minWidth: size }}
      >
        {opt.flag}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${opt.iso}.png`}
      alt=""
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
      className="inline-block rounded-sm shadow-sm"
      style={{ objectFit: 'cover', width: size, height: Math.round(size * 0.75) }}
    />
  );
}
