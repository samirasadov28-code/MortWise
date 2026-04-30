import Link from 'next/link';
import Image from 'next/image';
import type { ComponentType, SVGProps } from 'react';
import Disclaimer from '@/components/shared/Disclaimer';
import MarketsCarousel, { type MarketsCarouselItem } from '@/components/shared/MarketsCarousel';
import {
  HouseCoinsIcon,
  HouseChartIcon,
  HouseGlobeIcon,
  HouseSkyline,
} from '@/components/shared/HouseIcons';

const FREE_FEATURES = [
  'Monthly repayment estimate',
  'Total interest & total cost over life of loan',
  'Annual cost (12-month outlook)',
  'Rate structure selection (fixed / variable / split)',
  'Stamp duty calculation',
  'Government scheme eligibility & picker',
  'LTV band analysis',
  'Affordability check vs lender income limits',
];

const PAID_FEATURES = [
  'Everything in Free',
  'Side-by-side comparison of up to 4 scenarios',
  'Rate-rise stress test (+0.5% to +3.0%)',
  'Overpayment simulator with term savings',
  'Cashback & clawback break-even analysis',
  'Interest holiday / payment pause impact',
  'Balance chart over time',
  'Principal vs interest breakdown chart',
  'IRR and money multiple (investor view)',
  'Exit equity analysis at any year',
  'AI-generated market rate cards',
  'Cross-market comparison — find the cheapest overseas investment',
  'Buy-to-let analysis: cash flow, yield, cash-on-cash return',
  'New-build vs secondary-market tax differentiation',
  'PDF export of full analysis',
];

const MARKETS_LIST: MarketsCarouselItem[] = [
  // Europe — West & North
  { code: 'IE', name: 'Ireland', available: true },
  { code: 'UK', name: 'United Kingdom', available: true },
  { code: 'DE', name: 'Germany', available: true },
  { code: 'FR', name: 'France', available: true },
  { code: 'NL', name: 'Netherlands', available: true },
  { code: 'BE', name: 'Belgium', available: true },
  { code: 'LU', name: 'Luxembourg', available: true },
  { code: 'AT', name: 'Austria', available: true },
  { code: 'CH', name: 'Switzerland', available: true },
  { code: 'ES', name: 'Spain', available: true },
  { code: 'PT', name: 'Portugal', available: true },
  { code: 'IT', name: 'Italy', available: true },
  { code: 'GR', name: 'Greece', available: true },
  { code: 'CY', name: 'Cyprus', available: true },
  { code: 'SE', name: 'Sweden', available: true },
  { code: 'NO', name: 'Norway', available: true },
  { code: 'DK', name: 'Denmark', available: true },
  { code: 'FI', name: 'Finland', available: true },
  { code: 'IS', name: 'Iceland', available: true },
  // Europe — Central & East
  { code: 'PL', name: 'Poland', available: true },
  { code: 'CZ', name: 'Czech Rep.', available: true },
  { code: 'HU', name: 'Hungary', available: true },
  { code: 'RO', name: 'Romania', available: true },
  { code: 'EE', name: 'Estonia', available: true },
  { code: 'UA', name: 'Ukraine', available: true },
  { code: 'TR', name: 'Turkey', available: true },
  // Americas
  { code: 'US', name: 'United States', available: true },
  { code: 'CA', name: 'Canada', available: true },
  { code: 'MX', name: 'Mexico', available: true },
  { code: 'BR', name: 'Brazil', available: true },
  { code: 'AR', name: 'Argentina', available: true },
  { code: 'CL', name: 'Chile', available: true },
  // Asia & Pacific
  { code: 'CN', name: 'China', available: true },
  { code: 'HK', name: 'Hong Kong', available: true },
  { code: 'TW', name: 'Taiwan', available: true },
  { code: 'JP', name: 'Japan', available: true },
  { code: 'KR', name: 'South Korea', available: true },
  { code: 'SG', name: 'Singapore', available: true },
  { code: 'MY', name: 'Malaysia', available: true },
  { code: 'TH', name: 'Thailand', available: true },
  { code: 'PH', name: 'Philippines', available: true },
  { code: 'ID', name: 'Indonesia', available: true },
  { code: 'VN', name: 'Vietnam', available: true },
  { code: 'IN', name: 'India', available: true },
  { code: 'AU', name: 'Australia', available: true },
  { code: 'NZ', name: 'New Zealand', available: true },
  // Middle East
  { code: 'UAE', name: 'UAE', available: true },
  { code: 'SA', name: 'Saudi Arabia', available: true },
  { code: 'QA', name: 'Qatar', available: true },
  { code: 'KW', name: 'Kuwait', available: true },
  { code: 'IL', name: 'Israel', available: true },
  // Africa
  { code: 'ZA', name: 'South Africa', available: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef] text-[#2a2520]">
      {/* Nav — frozen on top, always visible */}
      <nav className="sticky top-0 z-40 border-b border-[#e8e3dc] bg-[#f5f3ef]/95 backdrop-blur-sm px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/Logo_192.png" alt="MortWise" width={56} height={56} className="rounded-xl" />
            <span className="text-base sm:text-lg font-bold text-[#2a2520]">MortWise</span>
          </div>
          <Link
            href="/calculator"
            className="px-4 py-2 bg-[#4a7c96] hover:bg-[#3a6a82] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Start free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-10 sm:py-20 text-center">
        <div className="flex justify-center mb-5 sm:mb-6">
          <Image src="/Logo_512.png" alt="MortWise" width={80} height={80} className="rounded-2xl shadow-md sm:w-24 sm:h-24" />
        </div>
        <h1 className="text-2xl sm:text-5xl font-bold text-[#2a2520] mb-4 sm:mb-5 leading-tight">
          Understand your mortgage —{' '}
          <span className="text-[#4a7c96]">not just the monthly number</span>
        </h1>
        <p className="text-sm sm:text-xl text-[#6b7a8a] mb-7 sm:mb-10 max-w-2xl mx-auto">
          Compare fixed, variable, and split-rate mortgages side by side. Stress-test against rate rises.
          See what you actually pay over 30 years. Built for first-time buyers who are tired of jargon.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#4a7c96] hover:bg-[#3a6a82] text-white font-bold text-base sm:text-lg rounded-xl transition-colors shadow-lg"
        >
          Start free →
        </Link>
      </section>

      {/* House skyline divider */}
      <div className="max-w-5xl mx-auto px-6">
        <HouseSkyline className="w-full h-20 sm:h-28" />
      </div>

      {/* Value props */}
      <section className="max-w-5xl mx-auto px-6 pt-8 sm:pt-10 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <ValueProp
            Icon={HouseCoinsIcon}
            title="Total cost of the home"
            description="Don't just see the monthly payment — see total interest, total repaid, and the true 30-year cost of each home you might buy."
          />
          <ValueProp
            Icon={HouseChartIcon}
            title="Rate-rise stress test"
            description="See exactly what your monthly payment becomes if rates rise +1%, +2%, or +3% when your fixed period expires — before you sign."
          />
          <ValueProp
            Icon={HouseGlobeIcon}
            title="Local property rules"
            description={`Accurate stamp duty, first-time buyer schemes (Help to Buy, First Home Scheme, FHSA, KfW…), and lender limits for ${MARKETS_LIST.length} housing markets.`}
          />
        </div>
      </section>

      {/* Free vs Paid */}
      <section className="max-w-5xl mx-auto px-6 pb-12 sm:pb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2a2520] text-center mb-6 sm:mb-8">Free vs Full</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border border-[#e8e3dc] rounded-xl p-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#2a2520]">Free</h3>
              <p className="text-xl sm:text-2xl font-bold text-[#2a2520] mt-1">Free</p>
            </div>
            <ul className="space-y-2 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#6b7a8a]">
                  <span className="text-[#4a7c96] mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/calculator"
              className="block text-center py-3 border border-[#e8e3dc] hover:border-[#4a7c96] rounded-lg text-[#6b7a8a] hover:text-[#4a7c96] text-sm font-medium transition-colors"
            >
              Start free
            </Link>
          </div>

          <div className="bg-white border border-[#4a7c96]/40 rounded-xl p-5 sm:p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#2a2520]">Full</h3>
                <span className="text-xs px-2 py-0.5 bg-[#4a7c96]/20 text-[#4a7c96] rounded-full font-medium">Best value</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#2a2520] mt-1">
                €3.99 <span className="text-sm font-normal text-[#6b7a8a]">/ month</span>
              </p>
            </div>
            <ul className="space-y-2 mb-6">
              {PAID_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#6b7a8a]">
                  <span className="text-[#4a7c96] mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/calculator"
              className="block text-center py-3 bg-[#4a7c96] hover:bg-[#3a6a82] rounded-lg text-white text-sm font-semibold transition-colors"
            >
              Start free, upgrade inside →
            </Link>
          </div>
        </div>
      </section>

      {/* Markets */}
      <section className="max-w-5xl mx-auto px-6 pb-12 sm:pb-16">
        <h2 className="text-lg sm:text-xl font-bold text-[#2a2520] text-center mb-2">
          Available housing markets <span className="text-[#4a7c96]">({MARKETS_LIST.length})</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#6b7a8a] text-center mb-5 sm:mb-6">
          Stamp duty, deposit rules, and first-time buyer schemes are tuned per country. Use the arrows to browse.
        </p>
        <MarketsCarousel markets={MARKETS_LIST} />
      </section>

      <Disclaimer />
    </div>
  );
}

function ValueProp({
  Icon,
  title,
  description,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-4 sm:p-5">
      <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 text-[#4a7c96]">
        <Icon className="w-full h-full" />
      </div>
      <h3 className="font-bold text-[#2a2520] mb-2 text-sm sm:text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-[#6b7a8a] leading-relaxed">{description}</p>
    </div>
  );
}
