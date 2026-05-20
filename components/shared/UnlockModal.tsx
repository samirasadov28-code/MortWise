'use client';

const PANELS = [
  { icon: '📊', title: 'Side-by-side comparison', desc: 'All scenarios in one table — rate, monthly, total, LTV.' },
  { icon: '📈', title: 'Balance & repayment charts', desc: 'See how principal erodes and interest compounds over time.' },
  { icon: '⚡', title: 'Rate-rise stress test', desc: 'What your payment becomes if rates rise +1%, +2%, or +3%.' },
  { icon: '🎛️', title: 'Sensitivity analysis', desc: 'Drag sliders to model rate shocks, term changes, and deposit shifts live.' },
  { icon: '💰', title: 'Overpayment simulator', desc: 'See how lump-sum overpayments cut interest and shorten your term.' },
  { icon: '⏸️', title: 'Payment holiday', desc: 'Model the true cost of pausing repayments for several months.' },
  { icon: '🎁', title: 'Cashback analysis', desc: 'Break-even point and clawback schedule for cashback deals.' },
  { icon: '🏘️', title: 'Buy-to-let evaluation', desc: 'Yield, IRR, and cash flow if you rent the property out.' },
  { icon: '🌍', title: 'Cross-market comparison', desc: 'Same cash invested — compare mortgage costs across countries.' },
  { icon: '💱', title: 'Foreign-currency mortgage', desc: 'Lower rate in EUR/USD vs local currency? Model the FX risk.' },
];

export default function UnlockModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 pb-4 border-b border-[#e8e3dc]">
          <p className="text-2xl mb-1">🎉</p>
          <h2 className="text-xl font-bold text-[#2a2520]">Full analysis unlocked</h2>
          <p className="text-sm text-[#6b7a8a] mt-1">
            Scroll down your results to explore all of these panels:
          </p>
        </div>

        <ul className="overflow-y-auto flex-1 divide-y divide-[#e8e3dc]/60 px-6">
          {PANELS.map(({ icon, title, desc }) => (
            <li key={title} className="flex gap-3 py-3">
              <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#2a2520]">{title}</p>
                <p className="text-xs text-[#6b7a8a] leading-snug">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="p-6 pt-4 border-t border-[#e8e3dc]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#4a7c96] hover:bg-[#3d6a82] text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Let&apos;s explore →
          </button>
        </div>
      </div>
    </div>
  );
}
