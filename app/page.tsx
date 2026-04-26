import Link from 'next/link';
import Disclaimer from '@/components/shared/Disclaimer';

const FREE_FEATURES = [
  'Monthly repayment estimate',
  'Rate structure selection (fixed / variable / split)',
  'Stamp duty calculation',
  'Government scheme eligibility',
  'LTV band analysis',
];

const PAID_FEATURES = [
  'Everything in Free',
  'Side-by-side comparison of up to 4 scenarios',
  'Total interest and total cost of ownership',
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white pb-16">
      {/* Nav */}
      <nav className="border-b border-[#1e3a5f] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[#3b82f6] text-xl font-bold">Mort</span>
            <span className="text-white text-xl font-bold">Wise</span>
          </div>
          <Link
            href="/calculator"
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Start free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
          Understand your mortgage —{' '}
          <span className="text-[#3b82f6]">not just the monthly number</span>
        </h1>
        <p className="text-xl text-[#94a3b8] mb-10 max-w-2xl mx-auto">
          Compare fixed, variable, and split-rate mortgages side by side. Stress-test against rate rises.
          See what you actually pay over 30 years. Built for first-time buyers who are tired of jargon.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
        >
          Start free →
        </Link>
      </section>

      {/* Value props */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Free vs Full</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#16213e] border border-[#1e3a5f] rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Free</h3>
              <p className="text-2xl font-bold text-white mt-1">Free</p>
            </div>
            <ul className="space-y-2 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <span className="text-[#3b82f6] mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/calculator"
              className="block text-center py-3 border border-[#1e3a5f] hover:border-[#3b82f6] rounded-lg text-[#94a3b8] hover:text-white text-sm font-medium transition-colors"
            >
              Start free
            </Link>
          </div>

          <div className="bg-[#16213e] border border-[#3b82f6]/40 rounded-xl p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Full</h3>
                <span className="text-xs px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] rounded-full font-medium">Best value</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                €4.99 <span className="text-sm font-normal text-[#94a3b8]">/ month</span>
              </p>
            </div>
            <ul className="space-y-2 mb-6">
              {PAID_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <span className="text-[#3b82f6] mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/calculator"
              className="block text-center py-3 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg text-white text-sm font-semibold transition-colors"
            >
              Start free, upgrade inside →
            </Link>
          </div>
        </div>
      </section>

      {/* Markets */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold text-white text-center mb-6">Available markets</h2>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {[
            { flag: '🇮🇪', name: 'Ireland', available: true },
            { flag: '🇬🇧', name: 'United Kingdom', available: true },
            { flag: '🇦🇪', name: 'UAE', available: true },
            { flag: '🇺🇸', name: 'United States', available: false },
            { flag: '🇦🇺', name: 'Australia', available: false },
            { flag: '🇨🇦', name: 'Canada', available: false },
          ].map(({ flag, name, available }) => (
            <div key={name} className={`flex flex-col items-center gap-1 ${!available ? 'opacity-40' : ''}`}>
              <span className="text-3xl">{flag}</span>
              <span className="text-xs text-[#94a3b8]">{name}</span>
              {!available && <span className="text-xs text-[#94a3b8]/60">Coming soon</span>}
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
    <div className="bg-[#16213e] border border-[#1e3a5f] rounded-xl p-5">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed">{description}</p>
    </div>
  );
}
