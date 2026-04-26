'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { WizardState, ScenarioResult } from '@/lib/types';
import { DEFAULT_WIZARD_STATE } from '@/lib/defaults';
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

  // Check unlock status on mount and after payment
  useEffect(() => {
    async function checkUnlock() {
      const { unlocked, sessionId } = getUnlockState();
      if (!unlocked) return;

      // Silently re-verify
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

      const preparedScenarios = state.scenarios.map((s) => ({
        ...s,
        housePrice: state.housePrice,
        loanToValue: state.housePrice > 0 ? (state.housePrice - state.deposit) / state.housePrice : 0.8,
        mortgageTerm: state.mortgageTerm,
        rateStructure: state.rateStructure,
        govtSupportAmount: state.govtSchemeEnabled ? state.govtSupportAmount : 0,
        splitFixedProportion: state.rateStructure === 'split' ? state.splitFixedProportion : undefined,
        splitVariableProportion: state.rateStructure === 'split' ? 1 - state.splitFixedProportion : undefined,
      }));

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
    <div className="min-h-screen bg-[#f5f3ef] pb-20">
      {/* Header */}
      <header className="border-b border-[#e8e3dc] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/Logo_192.png" alt="MortWise" width={32} height={32} className="rounded-md" />
          </Link>
          {state.isUnlocked && (
            <span className="text-xs px-2 py-1 bg-[#4a7c96]/10 border border-[#4a7c96]/30 text-[#4a7c96] rounded-full">
              Full analysis unlocked
            </span>
          )}
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

            {state.isUnlocked ? (
              <FullResults results={results} state={state} />
            ) : (
              <FreeResults results={results} state={state} onUnlocked={handleUnlocked} />
            )}
          </div>
        )}
      </main>

      <Disclaimer />
    </div>
  );
}
