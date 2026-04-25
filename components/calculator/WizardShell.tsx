'use client';

import type { WizardState } from '@/lib/types';

interface WizardShellProps {
  state: WizardState;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  canNext?: boolean;
  nextLabel?: string;
}

const STEPS = [
  { label: 'Market' },
  { label: 'Property' },
  { label: 'Profile' },
  { label: 'Rate Type' },
  { label: 'Scenarios' },
];

export default function WizardShell({
  state,
  children,
  onNext,
  onBack,
  canNext = true,
  nextLabel,
}: WizardShellProps) {
  const step = state.step;
  const isLast = step === 5;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const stepNum = i + 1;
            const isComplete = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isComplete
                      ? 'bg-[#3b82f6] text-white'
                      : isCurrent
                      ? 'bg-[#3b82f6]/20 border-2 border-[#3b82f6] text-[#3b82f6]'
                      : 'bg-[#1e3a5f] text-[#94a3b8]'
                  }`}
                >
                  {isComplete ? '✓' : stepNum}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    isCurrent ? 'text-white' : 'text-[#94a3b8]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1 bg-[#1e3a5f] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3b82f6] transition-all duration-300"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-[#16213e] border border-[#1e3a5f] rounded-xl p-6 mb-6">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 1}
          className="px-5 py-2.5 border border-[#1e3a5f] rounded-lg text-[#94a3b8] hover:text-white hover:border-[#3b82f6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
        >
          {nextLabel ?? (isLast ? 'Calculate →' : 'Next →')}
        </button>
      </div>
    </div>
  );
}
