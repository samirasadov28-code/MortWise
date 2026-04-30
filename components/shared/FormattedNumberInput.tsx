'use client';

import { useEffect, useState } from 'react';

interface FormattedNumberInputProps {
  value: number;
  onValueChange: (n: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

/**
 * Text input that displays a number with comma group separators (e.g. "400,000")
 * while editing — and emits a plain `number` to its parent. Uses
 * `inputMode="numeric"` so phones still show the digit keypad.
 */
export default function FormattedNumberInput({
  value,
  onValueChange,
  min,
  max,
  placeholder,
  className,
  id,
  ariaLabel,
}: FormattedNumberInputProps) {
  // Keep an internal display string so the user's caret behaves naturally
  // even as commas are inserted between digits.
  const [display, setDisplay] = useState(() => (value > 0 ? value.toLocaleString('en-IE') : ''));

  // Re-sync if the parent updates `value` from outside (e.g. switching deposit
  // mode, picking a market) and our internal display would otherwise be stale.
  useEffect(() => {
    const numericFromDisplay = Number(display.replace(/[^0-9]/g, '')) || 0;
    if (numericFromDisplay !== value) {
      setDisplay(value > 0 ? value.toLocaleString('en-IE') : '');
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(raw: string) {
    // Strip everything except digits — drop currency symbols, spaces, commas
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits === '') {
      setDisplay('');
      onValueChange(0);
      return;
    }

    let n = parseInt(digits, 10);
    if (typeof max === 'number' && n > max) n = max;
    if (typeof min === 'number' && n < min) n = min;

    setDisplay(n.toLocaleString('en-IE'));
    onValueChange(n);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
