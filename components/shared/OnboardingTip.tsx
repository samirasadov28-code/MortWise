'use client';

interface OnboardingTipProps {
  onDismiss: () => void;
  children?: React.ReactNode;
}

export default function OnboardingTip({ onDismiss, children }: OnboardingTipProps) {
  return (
    <div className="relative bg-[#eef4f7] border border-[#4a7c96]/30 rounded-xl p-4 pr-10">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss tip"
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-[#6b7a8a] hover:text-[#2a2520] hover:bg-[#4a7c96]/10 transition-colors text-base leading-none"
      >
        ×
      </button>
      {children}
    </div>
  );
}
