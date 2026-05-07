import type { WizardState } from './types';

/**
 * A saved analysis is a snapshot of the wizard inputs the user just ran the
 * full analysis on. We persist them to localStorage so the user can revisit
 * "what I worked out last week" and compare it side by side with today's
 * scenario — even across markets / currencies.
 *
 * We deliberately store inputs only (not computed results). Recomputing on
 * load keeps everything consistent if the engine, FX table or market config
 * changes between sessions.
 */
export interface SavedAnalysis {
  id: string;
  name: string;
  savedAt: number;
  /** Snapshot of the wizard state minus volatile flags (step, isUnlocked). */
  state: Omit<WizardState, 'step' | 'isUnlocked'>;
}

const STORAGE_KEY = 'mortwise_saved_analyses';
const MAX_SAVED = 8;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function listSavedAnalyses(): SavedAnalysis[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedAnalysis[];
  } catch {
    return [];
  }
}

function writeAll(list: SavedAnalysis[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Quota exceeded or storage disabled — fail silently rather than crash
    // the results screen the user is currently on.
  }
}

export function saveAnalysis(name: string, state: WizardState): SavedAnalysis {
  // Strip the volatile flags. Casting via two-step pattern to avoid an
  // unused-vars lint hit while removing keys.
  const stateClone: Omit<WizardState, 'step' | 'isUnlocked'> = (() => {
    const { step: _step, isUnlocked: _unlocked, ...rest } = state;
    void _step;
    void _unlocked;
    return rest;
  })();

  const entry: SavedAnalysis = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || `Scenario ${new Date().toLocaleDateString()}`,
    savedAt: Date.now(),
    state: stateClone,
  };

  const next = [entry, ...listSavedAnalyses()].slice(0, MAX_SAVED);
  writeAll(next);
  return entry;
}

export function deleteAnalysis(id: string): void {
  writeAll(listSavedAnalyses().filter((a) => a.id !== id));
}

export function renameAnalysis(id: string, name: string): void {
  const next = listSavedAnalyses().map((a) =>
    a.id === id ? { ...a, name: name.trim() || a.name } : a,
  );
  writeAll(next);
}
