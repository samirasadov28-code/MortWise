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
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#1e3a5f] text-[#94a3b8] text-xs hover:bg-[#3b82f6] hover:text-white transition-colors cursor-help"
        aria-label="More information"
      >
        ?
      </button>
      {visible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#0f3460] border border-[#1e3a5f] rounded-lg text-xs text-[#94a3b8] leading-relaxed shadow-xl">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-[#0f3460]" />
        </span>
      )}
    </span>
  );
}
