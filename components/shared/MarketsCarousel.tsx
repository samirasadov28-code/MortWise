'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
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

/**
 * Infinite/looping horizontal markets carousel.
 *
 * The list is rendered three times back-to-back. The user starts in the middle
 * copy. When they scroll into the first or third copy we silently jump back to
 * the equivalent position in the middle copy, so scrolling never hits a wall.
 */
export default function MarketsCarousel({ markets }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const loopWidthRef = useRef<number>(0);
  const isJumpingRef = useRef(false);

  // Measure one full copy of the list and centre the viewport on the middle copy.
  const recalibrate = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // Total scroll width covers 3 copies; one copy is 1/3 of that.
    const oneLoop = el.scrollWidth / 3;
    loopWidthRef.current = oneLoop;
    isJumpingRef.current = true;
    el.scrollLeft = oneLoop;
    requestAnimationFrame(() => {
      isJumpingRef.current = false;
    });
  }, []);

  useLayoutEffect(() => {
    recalibrate();
  }, [recalibrate]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (isJumpingRef.current) return;
      const loop = loopWidthRef.current;
      if (loop <= 0) return;
      // If we've drifted into the leading or trailing copy, jump back to the
      // matching position in the middle copy. Use scrollLeft assignment (no
      // smooth) so it's invisible to the user.
      if (el.scrollLeft < loop * 0.5) {
        isJumpingRef.current = true;
        el.scrollLeft += loop;
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      } else if (el.scrollLeft > loop * 1.5) {
        isJumpingRef.current = true;
        el.scrollLeft -= loop;
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', recalibrate);
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', recalibrate);
    };
  }, [recalibrate]);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const dx = Math.max(el.clientWidth * 0.8, 240) * direction;
    el.scrollBy({ left: dx, behavior: 'smooth' });
  };

  // Triple the list for the infinite-loop illusion.
  const tripled = [...markets, ...markets, ...markets];

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        type="button"
        aria-label="Scroll markets left"
        onClick={() => scrollByCards(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md border border-[#e8e3dc] flex items-center justify-center text-[#4a7c96] hover:bg-[#4a7c96] hover:text-white hover:border-[#4a7c96] cursor-pointer transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Edge fades — soft cream gradient hints at more content */}
      <div
        className="pointer-events-none absolute left-10 sm:left-12 top-0 bottom-0 w-8 z-[5] bg-gradient-to-r from-[#f5f3ef] to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-10 sm:right-12 top-0 bottom-0 w-8 z-[5] bg-gradient-to-l from-[#f5f3ef] to-transparent"
        aria-hidden="true"
      />

      {/* Track — three copies of the list */}
      <div
        ref={trackRef}
        className="flex gap-6 sm:gap-8 overflow-x-auto scroll-smooth px-12 sm:px-14 py-2 no-scrollbar"
      >
        {tripled.map(({ code, name, available }, i) => (
          <div
            key={`${code}-${i}`}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 w-16 sm:w-20 ${
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
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md border border-[#e8e3dc] flex items-center justify-center text-[#4a7c96] hover:bg-[#4a7c96] hover:text-white hover:border-[#4a7c96] cursor-pointer transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
