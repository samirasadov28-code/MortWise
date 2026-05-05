// Tiny pub/sub used by floating UI widgets (FeedbackButton, MortgageChat) to
// hide themselves while a child component (e.g. WizardShell) is mounted —
// keeps things from competing for space inside the wizard's sticky Back/Next
// bar.
//
// Single boolean: when true, every floating widget that subscribes hides
// itself. Components that need to suppress call useSuppressFloatingWidgets()
// in their effect; components that need to react call
// useFloatingWidgetsSuppressed() (a useSyncExternalStore wrapper).

let suppressed = false;
const listeners = new Set<() => void>();

export function subscribeFloating(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getFloatingSuppressed(): boolean {
  return suppressed;
}

export function getFloatingSuppressedServer(): boolean {
  return false;
}

export function setFloatingSuppressed(v: boolean): void {
  if (suppressed === v) return;
  suppressed = v;
  listeners.forEach((l) => l());
}
