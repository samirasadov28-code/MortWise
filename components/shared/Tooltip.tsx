'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#e8e3dc] text-[#6b7a8a] text-xs hover:bg-[#4a7c96] hover:text-white transition-colors cursor-help"
        aria-label="More information"
      >
        ?
      </button>
      {visible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#f9f7f4] border border-[#e8e3dc] rounded-lg text-xs text-[#6b7a8a] leading-relaxed shadow-xl">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-[#e8e3dc]" />
        </span>
      )}
    </span>
  );
}
