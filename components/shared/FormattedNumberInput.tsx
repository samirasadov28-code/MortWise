'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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
 * while editing, and emits a plain `number` to its parent. Uses
 * `inputMode="numeric"` so phones still show the digit keypad.
 *
 * Caret-preservation: re-formatting on every keystroke would normally jump the
 * caret to the end of the input. We instead measure how many *digits* sat to
 * the left of the caret before the change, and after the new formatted string
 * is rendered we move the caret back to the same digit-position. That makes
 * editing in the middle ("400,000" → click between 4 and 0 → type 5") feel
 * native again.
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
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaretRef = useRef<number | null>(null);

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

  // After display updates, restore the caret to the same digit-position the
  // user was editing at. useLayoutEffect runs synchronously before paint so
  // the cursor doesn't visibly flash to the end first.
  useLayoutEffect(() => {
    const target = pendingCaretRef.current;
    if (target == null) return;
    const el = inputRef.current;
    if (el && document.activeElement === el) {
      el.setSelectionRange(target, target);
    }
    pendingCaretRef.current = null;
  }, [display]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const caret = e.target.selectionStart ?? raw.length;
    // How many digits sat to the left of the caret before reformat? That's
    // the position-invariant we want to preserve across the formatting pass.
    const digitsLeftOfCaret = raw.slice(0, caret).replace(/[^0-9]/g, '').length;

    // Strip everything except digits — drop currency symbols, spaces, commas
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits === '') {
      pendingCaretRef.current = 0;
      setDisplay('');
      onValueChange(0);
      return;
    }

    let n = parseInt(digits, 10);
    if (typeof max === 'number' && n > max) n = max;
    if (typeof min === 'number' && n < min) n = min;

    const formatted = n.toLocaleString('en-IE');
    // Walk the formatted string and find the index just after the Nth digit
    // (where N = digitsLeftOfCaret). Commas count as zero-width for caret
    // purposes, but the caret does belong *after* a comma if all the digits
    // it should sit after have been consumed.
    let seen = 0;
    let target = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (seen >= digitsLeftOfCaret) {
        target = i;
        break;
      }
      if (/[0-9]/.test(formatted[i])) seen++;
    }
    pendingCaretRef.current = target;

    setDisplay(formatted);
    onValueChange(n);
  }

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
