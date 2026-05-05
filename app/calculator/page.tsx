'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { WizardState, ScenarioResult, MarketCode } from '@/lib/types';
import { DEFAULT_WIZARD_STATE } from '@/lib/defaults';
import { COMPARISON_CURRENCIES } from '@/lib/fx';
import { MARKETS } from '@/lib/markets';
import { buildPreparedScenarios } from '@/lib/wizard';
import { getUnlockState } from '@/lib/stripe';
import { runScenarios } from '@/lib/engine/scenarios';
import Disclaimer from '@/components/shared/Disclaimer';
import WizardShell from '@/components/calculator/WizardShell';
import Step1Market from '@/components/calculator/Step1Market';
import Step2Property from '@/components/calculator/Step2Property';
import Step3Profile from '@/components/calculator/Step3Profile';
import Step4RateStructure from '@/components/calculator/Step4RateStructure';
import Step5Scenarios from '@/components/calculator/Step5Scenarios';
import FreeResults from '@/components/calculator/FreeResults';
import FullResults from '@/components/calculator/FullResults';
import MortgageChat from '@/components/shared/MortgageChat';

type Phase = 'wizard' | 'results';

export default function CalculatorPage() {
  const [state, setState] = useState<WizardState>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('mortwise_wizard');
      if (saved) {
        try {
          return { ...DEFAULT_WIZARD_STATE, ...JSON.parse(saved) };
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_WIZARD_STATE;
  });

  const [phase, setPhase] = useState<Phase>('wizard');
  const [results, setResults] = useState<ScenarioResult[]>([]);
  // Full-access users can toggle "view as free" to compare the two views side-by-side.
  const [viewAsFree, setViewAsFree] = useState(false);
  // Currency in which all results are shown (cards, tables, charts, breakdowns).
  // Defaults to the local market currency; user can switch in the results header.
  const [displayMarket, setDisplayMarket] = useState<MarketCode>(state.market);

  // Reset display currency to the new market's local currency whenever the
  // user picks a different market in Step 1.
  useEffect(() => {
    setDisplayMarket(state.market);
  }, [state.market]);

  // Check unlock status on mount and after payment
  useEffect(() => {
    async function checkUnlock() {
      const { unlocked, sessionId } = getUnlockState();
      if (!unlocked) return;

      // Email-based unlocks (early access list) are re-verified against the API
      if (sessionId?.startsWith('email:')) {
        const email = sessionId.slice('email:'.length);
        try {
          const res = await fetch('/api/unlock-with-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          setState((s) => ({ ...s, isUnlocked: data.unlocked === true }));
        } catch {
          setState((s) => ({ ...s, isUnlocked: unlocked }));
        }
        return;
      }

      // Stripe-based unlocks: re-verify against subscription status
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await res.json();
        setState((s) => ({ ...s, isUnlocked: data.verified === true }));
      } catch {
        setState((s) => ({ ...s, isUnlocked: unlocked }));
      }
    }
    checkUnlock();
  }, []);

  // Persist wizard state to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mortwise_wizard', JSON.stringify(state));
    }
  }, [state]);

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...updates }));
  }, []);

  function handleNext() {
    if (state.step < 5) {
      setState((s) => ({ ...s, step: s.step + 1 }));
    } else {
      // Run calculation
      const startDate = state.purchaseDate
        ? new Date(state.purchaseDate + '-01')
        : new Date();

      const preparedScenarios = buildPreparedScenarios(state);

      const computed = runScenarios(preparedScenarios, startDate);
      setResults(computed);
      setPhase('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBack() {
    if (phase === 'results') {
      setPhase('wizard');
      setState((s) => ({ ...s, step: 5 }));
    } else if (state.step > 1) {
      setState((s) => ({ ...s, step: s.step - 1 }));
    }
  }

  function handleUnlocked() {
    setState((s) => ({ ...s, isUnlocked: true }));
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      {/* Header — frozen on top, always visible */}
      <header className="sticky top-0 z-40 border-b border-[#e8e3dc] bg-[#f5f3ef]/95 backdrop-blur-sm px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/Logo_192.png" alt="MortWise" width={56} height={56} className="rounded-xl" />
            <span className="text-base sm:text-lg font-bold text-[#2a2520]">MortWise</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Global comparison currency — visible whenever the user is on
                the results screen, regardless of paid/free. */}
            {phase === 'results' && (
              <select
                value={displayMarket}
                onChange={(e) => setDisplayMarket(e.target.value as MarketCode)}
                aria-label="Display currency"
                className="text-xs px-2 py-1 border border-[#e8e3dc] hover:border-[#4a7c96] bg-white text-[#2a2520] rounded-full font-medium focus:outline-none focus:border-[#4a7c96]"
              >
                <option value={state.market}>
                  {MARKETS[state.market].currency} (local)
                </option>
                {COMPARISON_CURRENCIES
                  .filter((c) => c.market !== state.market)
                  .map((c) => (
                    <option key={c.market} value={c.market}>
                      {c.label}
                    </option>
                  ))}
              </select>
            )}
            {state.isUnlocked && phase === 'results' && (
              <button
                type="button"
                onClick={() => setViewAsFree((v) => !v)}
                className="text-xs px-3 py-1 border border-[#4a7c96]/30 hover:border-[#4a7c96] hover:bg-[#4a7c96] hover:text-white text-[#4a7c96] rounded-full font-medium transition-colors"
                aria-pressed={viewAsFree}
              >
                {viewAsFree ? 'View Full' : 'View Free'}
              </button>
            )}
            {state.isUnlocked && (
              <span className="text-xs px-2 py-1 bg-[#4a7c96]/10 border border-[#4a7c96]/30 text-[#4a7c96] rounded-full">
                Full analysis unlocked
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {phase === 'wizard' ? (
          <WizardShell
            state={state}
            onNext={handleNext}
            onBack={handleBack}
            nextLabel={state.step === 5 ? 'Calculate →' : undefined}
          >
            {state.step === 1 && <Step1Market state={state} onChange={updateState} />}
            {state.step === 2 && <Step2Property state={state} onChange={updateState} />}
            {state.step === 3 && <Step3Profile state={state} onChange={updateState} />}
            {state.step === 4 && <Step4RateStructure state={state} onChange={updateState} />}
            {state.step === 5 && <Step5Scenarios state={state} onChange={updateState} />}
          </WizardShell>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-[#6b7a8a] hover:text-[#4a7c96] flex items-center gap-1 transition-colors"
              >
                ← Edit inputs
              </button>
            </div>

            {state.isUnlocked && !viewAsFree ? (
              <FullResults results={results} state={state} displayMarket={displayMarket} />
            ) : (
              // When a paid user clicks "View Free" we show the full free
              // experience — including the upgrade wall — so they can see
              // exactly what's being advertised to non-paying users.
              <FreeResults
                results={results}
                state={state}
                onUnlocked={handleUnlocked}
                displayMarket={displayMarket}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating mortgage chat — hide it inside the wizard sheets, where the
          sticky Back/Next bar already occupies the bottom-right area. */}
      <MortgageChat state={state} results={results} hidden={phase === 'wizard'} />

      <Disclaimer />
    </div>
  );
}
