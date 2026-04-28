'use client';

import { useEffect, useRef, useState } from 'react';
import Flag from './Flag';
import type { MarketCode } from '@/lib/types';

export interface MarketsCarouselItem {
  code: MarketCode;
  name: string;
  available: boolean;
}

interface Props {
  markets: MarketsCarouselItem[];
}

export default function MarketsCarousel({ markets }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll roughly one viewport width (less a bit) so users see new content but keep some overlap.
    const dx = Math.max(el.clientWidth * 0.8, 240) * direction;
    el.scrollBy({ left: dx, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        type="button"
        aria-label="Scroll markets left"
        onClick={() => scrollByCards(-1)}
        disabled={!canLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md border border-[#e8e3dc] flex items-center justify-center transition-all ${
          canLeft
            ? 'text-[#4a7c96] hover:bg-[#4a7c96] hover:text-white hover:border-[#4a7c96] cursor-pointer'
            : 'text-[#e8e3dc] cursor-not-allowed opacity-60'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Edge fades */}
      <div
        className={`pointer-events-none absolute left-10 sm:left-12 top-0 bottom-0 w-8 z-[5] bg-gradient-to-r from-[#f5f3ef] to-transparent transition-opacity ${canLeft ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute right-10 sm:right-12 top-0 bottom-0 w-8 z-[5] bg-gradient-to-l from-[#f5f3ef] to-transparent transition-opacity ${canRight ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-6 sm:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-12 sm:px-14 py-2 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {markets.map(({ code, name, available }) => (
          <div
            key={code}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 snap-start w-16 sm:w-20 ${
              !available ? 'opacity-40' : ''
            }`}
          >
            <Flag code={code} size={56} className={!available ? 'grayscale' : ''} />
            <span className="text-xs text-[#6b7a8a] text-center leading-tight">{name}</span>
            {!available && <span className="text-[10px] text-[#6b7a8a]/60">Coming soon</span>}
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Scroll markets right"
        onClick={() => scrollByCards(1)}
        disabled={!canRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md border border-[#e8e3dc] flex items-center justify-center transition-all ${
          canRight
            ? 'text-[#4a7c96] hover:bg-[#4a7c96] hover:text-white hover:border-[#4a7c96] cursor-pointer'
            : 'text-[#e8e3dc] cursor-not-allowed opacity-60'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
