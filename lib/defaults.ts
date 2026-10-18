import type { ScenarioInput, WizardState } from './types';
import { scenariosForMarket } from './lenders';

// Seed the wizard from the IE lender roster so trackerBaseRate/trackerMargin
// are pre-populated on first render — same path that Step 1 takes when the
// user later switches markets.
export const DEFAULT_SCENARIOS: ScenarioInput[] = scenariosForMarket('IE', 4).map(
  (s) => ({ ...s, housePrice: 400000 }),
);

export const DEFAULT_WIZARD_STATE: WizardState = {
  step: 1,
  market: 'IE',
  housePrice: 400000,
  deposit: 80000,
  otherFees: 5000,
  otherFeesCoveredByDebt: false,
  purchaseDate: new Date().toISOString().slice(0, 7),
  buyerType: 'first_time',
  annualIncome: 70000,
  coBorrowerIncome: 0,
  govtSchemeEnabled: false,
  govtSupportAmount: 0,
  selectedGovtSchemeName: null,
  propertyType: 'secondary',
  rateStructure: 'fixed',
  splitFixedProportion: 0.7,
  mortgageTerm: 30,
  paymentHolidayMonths: 0,
  wizardCashbackAmount: 0,
  wizardCashbackClawbackYears: 5,
  scenarios: DEFAULT_SCENARIOS,
  isUnlocked: false,
};
