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
    <div className="w-full max-w-3xl mx-auto pb-28 sm:pb-32">
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
                      ? 'bg-[#4a7c96] text-white'
                      : isCurrent
                      ? 'bg-[#4a7c96]/20 border-2 border-[#4a7c96] text-[#4a7c96]'
                      : 'bg-[#e8e3dc] text-[#6b7a8a]'
                  }`}
                >
                  {isComplete ? '✓' : stepNum}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    isCurrent ? 'text-[#2a2520]' : 'text-[#6b7a8a]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1 bg-[#e8e3dc] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4a7c96] transition-all duration-300"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white border border-[#e8e3dc] rounded-xl p-6 mb-6">
        {children}
      </div>

      {/* Navigation — sticky at bottom of viewport so users never have to scroll to advance */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8e3dc] bg-[#f5f3ef]/95 backdrop-blur-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={step === 1}
            className="px-5 py-3 border border-[#e8e3dc] rounded-lg text-[#6b7a8a] hover:text-[#4a7c96] hover:border-[#4a7c96] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm bg-white"
          >
            ← Back
          </button>
          <div className="text-xs text-[#6b7a8a] hidden sm:block">
            Step {step} of {STEPS.length}
          </div>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="px-6 sm:px-8 py-3 bg-[#4a7c96] hover:bg-[#3a6a82] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm shadow-md flex-1 sm:flex-initial"
          >
            {nextLabel ?? (isLast ? 'Calculate →' : 'Next →')}
          </button>
        </div>
      </div>
    </div>
  );
}
