export type RepaymentType = 'annuity' | 'fixed_principal';
export type RateStructure = 'fixed' | 'variable' | 'split' | 'tracker';
export type BuyerType = 'first_time' | 'mover' | 'investor' | 'non_resident';
export type MarketCode =
  // Original detailed configs
  | 'IE' | 'UK' | 'UAE'
  // Batch 1: USA, China, Japan, Germany, France
  | 'US' | 'CN' | 'JP' | 'DE' | 'FR'
  // Batch 2: Australia, Canada, Netherlands, South Korea, Spain,
  //          Italy, India, Singapore, Switzerland, Brazil
  | 'AU' | 'CA' | 'NL' | 'KR' | 'ES'
  | 'IT' | 'IN' | 'SG' | 'CH' | 'BR'
  // Batch 3: Mexico, Saudi Arabia, Turkey, Poland, Indonesia,
  //          Vietnam, Sweden, Norway, Belgium, New Zealand
  | 'MX' | 'SA' | 'TR' | 'PL' | 'ID'
  | 'VN' | 'SE' | 'NO' | 'BE' | 'NZ';

export interface ScenarioInput {
  id: string;
  lenderName: string;
  housePrice: number;
  otherFees: number;
  loanToValue: number;
  otherFeesCoveredByDebt: boolean;
  mortgageTerm: number;
  rateStructure: RateStructure;

  fixedRate?: number;
  fixedPeriodYears?: number;
  breakageFeePercent?: number;

  variableRate: number;

  trackerBaseRate?: number;
  trackerMargin?: number;

  splitFixedProportion?: number;
  splitVariableProportion?: number;

  repaymentType: RepaymentType;

  cashbackPercent?: number;
  cashbackClawbackYears?: number;

  graceMonths?: number;
  holidayStart?: number;
  holidayDuration?: number;

  overpaymentLumpSum?: number;
  overpaymentStart?: number;
  overpaymentFrequency?: number;
  overpaymentReduces: 'payment' | 'term';

  govtSupportAmount?: number;
  govtSupportConversionYears?: number;

  exitYear?: number;
  annualPropertyAppreciation?: number;

  rentalStartYear?: number;
  monthlyRent?: number;
  annualRentInflation?: number;
}

export interface MonthlyPeriod {
  monthIndex: number;
  date: Date;
  openingBalance: number;
  interest: number;
  principalRepayment: number;
  overpayment: number;
  totalPayment: number;
  closingBalance: number;
  isGracePeriod: boolean;
  isHolidayPeriod: boolean;
  isFixedPeriod: boolean;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  rentalIncome: number;
}

export interface StressResult {
  rateIncrease: number;
  newMonthlyPayment: number;
  paymentIncrease: number;
  totalExtraInterest: number;
  canAfford?: boolean;
}

export interface ScenarioResult {
  id: string;
  lenderName: string;
  loanAmount: number;
  firstMonthlyPayment: number;
  averageMonthlyPayment: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  effectiveAnnualRate: number;
  cashbackReceived: number;
  cashbackClawbackRisk: number;
  actualRepaymentPeriodMonths: number;
  exitEquity?: number;
  irr?: number;
  moneyMultiple?: number;
  periods: MonthlyPeriod[];
  stressResults?: Record<string, StressResult>;
}

export interface MarketConfig {
  code: MarketCode;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  defaultTerm: number;
  maxLTV: number;
  maxIncomeMultiple?: number;
  minDepositPercent: number;
  ltvBands: Array<{
    maxLtv: number;
    label: string;
    description: string;
  }>;
  stampDuty: (purchasePrice: number, buyerType: BuyerType) => number;
  govtSchemes: Array<{
    name: string;
    description: string;
    maxAmount: number | ((price: number) => number);
    eligibility: string;
    url: string;
  }>;
  regulatoryNotes: string[];
  greenMortgageAvailable: boolean;
  greenMortgageTypicalDiscount: number;
  greenMortgageEligibilityNote: string;
}

export interface WizardState {
  step: number;
  market: MarketCode;
  housePrice: number;
  deposit: number;
  otherFees: number;
  otherFeesCoveredByDebt: boolean;
  purchaseDate: string;
  buyerType: BuyerType;
  annualIncome: number;
  coBorrowerIncome: number;
  govtSchemeEnabled: boolean;
  govtSupportAmount: number;
  selectedGovtSchemeName: string | null;
  rateStructure: RateStructure;
  splitFixedProportion: number;
  mortgageTerm: number;
  scenarios: ScenarioInput[];
  isUnlocked: boolean;
}
