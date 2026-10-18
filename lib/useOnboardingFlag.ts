'use client';

import { useEffect, useState } from 'react';

/**
 * Returns [visible, dismiss]. `visible` is true the first time the user
 * encounters a given UI moment. Calling `dismiss` hides it and persists the
 * choice to localStorage so it never shows again.
 */
export function useOnboardingFlag(key: string): [boolean, () => void] {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(key)) setVisible(true);
  }, [key]);

  function dismiss() {
    setVisible(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(key, '1');
  }

  return [visible, dismiss];
}
