import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function HouseCoinsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 22 L24 8 L40 22 V40 H8 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M19 40 V28 H29 V40" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="24" cy="20" r="3" fill="currentColor" />
      <path d="M24 17 V14 M24 23 V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HouseChartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 20 L24 6 L42 20 V42 H6 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 36 V28 M21 36 V22 M28 36 V25 M35 36 V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function HouseGlobeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <path d="M6 24 H42" stroke="currentColor" strokeWidth="2" />
      <path d="M24 6 C16 14 16 34 24 42" stroke="currentColor" strokeWidth="2" />
      <path d="M24 6 C32 14 32 34 24 42" stroke="currentColor" strokeWidth="2" />
      <path d="M16 30 L24 22 L32 30 V36 H16 Z" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="7" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M11 12 H21 M17 12 V16 M21 12 V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A row of stylised rooftops + houses for use as a hero / section divider.
 * Sized via className (height); width fills container.
 */
export function HouseSkyline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      aria-hidden="true"
    >
      {/* back row — soft tint */}
      <g opacity="0.5">
        <path d="M0 90 L40 60 L80 90 V110 H0 Z" fill="#cfd8e0" />
        <path d="M70 90 L110 55 L150 90 V110 H70 Z" fill="#cfd8e0" />
        <path d="M150 90 L195 50 L240 90 V110 H150 Z" fill="#cfd8e0" />
        <path d="M240 90 L285 60 L330 90 V110 H240 Z" fill="#cfd8e0" />
        <path d="M330 90 L380 45 L430 90 V110 H330 Z" fill="#cfd8e0" />
        <path d="M430 90 L475 60 L520 90 V110 H430 Z" fill="#cfd8e0" />
        <path d="M520 90 L570 55 L620 90 V110 H520 Z" fill="#cfd8e0" />
        <path d="M620 90 L660 65 L700 90 V110 H620 Z" fill="#cfd8e0" />
        <path d="M700 90 L745 50 L790 90 V110 H700 Z" fill="#cfd8e0" />
      </g>
      {/* front row — primary accent houses */}
      <g>
        {/* House 1 */}
        <path d="M60 105 L100 75 L140 105 V110 H60 Z" fill="#4a7c96" />
        <rect x="80" y="92" width="14" height="18" fill="#f5f3ef" />
        <rect x="108" y="90" width="10" height="10" fill="#f5f3ef" />
        {/* House 2 (taller) */}
        <path d="M200 105 L250 65 L300 105 V110 H200 Z" fill="#3a6a82" />
        <rect x="225" y="88" width="16" height="22" fill="#f5f3ef" />
        <rect x="260" y="85" width="12" height="12" fill="#f5f3ef" />
        <rect x="278" y="85" width="12" height="12" fill="#f5f3ef" />
        {/* House 3 */}
        <path d="M360 105 L400 78 L440 105 V110 H360 Z" fill="#4a7c96" />
        <rect x="380" y="92" width="14" height="18" fill="#f5f3ef" />
        <rect x="410" y="90" width="10" height="10" fill="#f5f3ef" />
        {/* House 4 (large with chimney) */}
        <path d="M495 105 L555 60 L615 105 V110 H495 Z" fill="#3a6a82" />
        <rect x="585" y="68" width="10" height="14" fill="#3a6a82" />
        <rect x="525" y="85" width="16" height="25" fill="#f5f3ef" />
        <rect x="560" y="85" width="14" height="14" fill="#f5f3ef" />
        <rect x="582" y="85" width="14" height="14" fill="#f5f3ef" />
        {/* House 5 */}
        <path d="M670 105 L710 75 L750 105 V110 H670 Z" fill="#4a7c96" />
        <rect x="690" y="92" width="14" height="18" fill="#f5f3ef" />
        <rect x="720" y="90" width="10" height="10" fill="#f5f3ef" />
      </g>
      {/* ground line */}
      <rect x="0" y="108" width="800" height="2" fill="#3a6a82" opacity="0.6" />
    </svg>
  );
}
