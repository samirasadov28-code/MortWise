import Link from 'next/link';
import Image from 'next/image';
import Disclaimer from '@/components/shared/Disclaimer';
import Flag from '@/components/shared/Flag';
import type { MarketCode } from '@/lib/types';
import { version } from '@/package.json';

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
  'PDF export of full analysis',
];

const MARKETS_LIST: Array<{ code: MarketCode; name: string; available: boolean }> = [
  { code: 'IE', name: 'Ireland', available: true },
  { code: 'UK', name: 'United Kingdom', available: true },
  { code: 'UAE', name: 'UAE', available: true },
  { code: 'US', name: 'United States', available: true },
  { code: 'CN', name: 'China', available: true },
  { code: 'JP', name: 'Japan', available: true },
  { code: 'DE', name: 'Germany', available: true },
  { code: 'FR', name: 'France', available: true },
  { code: 'AU', name: 'Australia', available: false },
  { code: 'CA', name: 'Canada', available: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef] text-[#2a2520] pb-16">
      {/* Nav */}
      <nav className="border-b border-[#e8e3dc] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/Logo_192.png" alt="MortWise" width={36} height={36} className="rounded-lg" />
            <span className="text-xs text-[#6b7a8a]/60 font-mono">v{version}</span>
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

      {/* Value props */}
      <section className="max-w-5xl mx-auto px-6 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <ValueProp
            icon="💰"
            title="Total cost clarity"
            description="Don't just see the monthly payment — see the total interest, total repaid, and true cost of each mortgage option side by side."
          />
          <ValueProp
            icon="📊"
            title="Rate-rise stress test"
            description="See exactly what your monthly payment becomes if rates rise +1%, +2%, or +3% when your fixed period expires."
          />
          <ValueProp
            icon="🌍"
            title="Market-specific context"
            description="Accurate stamp duty, government schemes (Help to Buy, First Home Scheme), and lending rules for Ireland, UK, and UAE."
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
        <h2 className="text-lg sm:text-xl font-bold text-[#2a2520] text-center mb-5 sm:mb-6">Available markets</h2>
        <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
          {MARKETS_LIST.map(({ code, name, available }) => (
            <div key={code} className={`flex flex-col items-center gap-1.5 ${!available ? 'opacity-40' : ''}`}>
              <Flag code={code} size={48} className={!available ? 'grayscale' : ''} />
              <span className="text-xs text-[#6b7a8a]">{name}</span>
              {!available && <span className="text-xs text-[#6b7a8a]/60">Coming soon</span>}
            </div>
          ))}
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}

function ValueProp({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white border border-[#e8e3dc] rounded-xl p-4 sm:p-5">
      <div className="text-2xl sm:text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-[#2a2520] mb-2 text-sm sm:text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-[#6b7a8a] leading-relaxed">{description}</p>
    </div>
  );
}
