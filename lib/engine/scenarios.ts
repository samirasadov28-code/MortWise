import { runAmortisation } from './amortisation';
import { runStressTests } from './stress';
import { computeIRR, computeMoneyMultiple } from './irr';
import type { ScenarioInput, ScenarioResult } from '../types';

export function runScenarios(inputs: ScenarioInput[], startDate: Date = new Date()): ScenarioResult[] {
  return inputs.map((input) => {
    const result = runAmortisation(input, startDate);
    result.stressResults = runStressTests(input, startDate);
    result.irr = computeIRR(input, result);
    result.moneyMultiple = computeMoneyMultiple(input, result);
    return result;
  });
}

export function rankScenarios(results: ScenarioResult[]): ScenarioResult[] {
  return [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid);
}
