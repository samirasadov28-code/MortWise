// Split-rate logic is handled inline in amortisation.ts via runSplitRate.
// This module exposes helpers for UI display.

export function describeSplit(fixedProportion: number): string {
  const fixed = Math.round(fixedProportion * 100);
  const tracker = 100 - fixed;
  return `${fixed}% fixed / ${tracker}% tracker`;
}

export function blendedRate(
  fixedRate: number,
  trackerRate: number,
  fixedProportion: number
): number {
  return fixedRate * fixedProportion + trackerRate * (1 - fixedProportion);
}
