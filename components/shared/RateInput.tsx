'use client';

import { useEffect, useRef, useState } from 'react';

interface RateInputProps {
  /** Rate as a decimal fraction, e.g. 0.038 means 3.8%. `undefined` is empty. */
  value: number | undefined;
  /** Called with the parsed decimal fraction (or `undefined` when empty). */
  onValueChange: (n: number | undefined) => void;
  step?: number;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  id?: string;
  /** Display precision used when re-syncing from props or on blur. Defaults to 2. */
  precision?: number;
}

/**
 * Percent-rate input that lets the user actually type "3.8" without losing
 * focus or having the digit-2 silently dropped because the parent stuffed
 * `(0.038 * 100).toFixed(2)` back into `value`.
 *
 * Internally keeps a free-form string (`"3."`, `"3.8"`, `"03"`) so an
 * in-progress decimal entry survives every render, and only normalises to a
 * canonical `n.toFixed(precision)` on blur or when the parent's number
 * changes from outside (e.g. AI rate generation overwrites the value).
 */
export default function RateInput({
  value,
  onValueChange,
  step = 0.01,
  placeholder,
  className,
  ariaLabel,
  id,
  precision = 2,
}: RateInputProps) {
  const fromValue = (v: number | undefined) =>
    v === undefined || Number.isNaN(v) ? '' : (v * 100).toFixed(precision);

  const [text, setText] = useState<string>(() => fromValue(value));
  const focusedRef = useRef(false);

  // If the parent's value changes while we don't have focus (e.g. AI rate
  // generation, switching markets), re-sync. Skip while focused so the user's
  // in-progress typing isn't clobbered.
  useEffect(() => {
    if (focusedRef.current) return;
    const expected = fromValue(value);
    setText(expected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(raw: string) {
    // Allow only digits, a single dot, and an optional leading minus. Anything
    // else gets stripped silently.
    let cleaned = raw.replace(/[^0-9.\-]/g, '');
    // Collapse multiple dots to the first one — keeps "3.8.5" from breaking.
    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, '');
    }
    setText(cleaned);

    if (cleaned === '' || cleaned === '.' || cleaned === '-' || cleaned === '-.') {
      onValueChange(undefined);
      return;
    }
    const n = Number(cleaned);
    if (Number.isNaN(n)) return;
    onValueChange(n / 100);
  }

  function handleBlur() {
    focusedRef.current = false;
    // Normalise display now that the user has stopped typing — but leave the
    // committed numeric value alone (we already reported it on each keystroke).
    if (text === '' || text === '.' || text === '-') {
      setText('');
      return;
    }
    const n = Number(text);
    if (Number.isNaN(n)) return;
    setText(n.toFixed(precision));
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={text}
      step={step}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
