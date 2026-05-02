export type RepaymentType = 'annuity' | 'fixed_principal';
export type RateStructure = 'fixed' | 'variable' | 'split' | 'tracker';
export type BuyerType = 'first_time' | 'mover' | 'investor' | 'non_resident';
export type PropertyType = 'new_build' | 'secondary';

/**
 * All inputs that can affect transaction taxes (stamp duty, ITP, IMT, SDLT…)
 * across markets. Markets that don't differentiate on a given dimension
 * simply ignore it.
 */
export interface StampDutyContext {
  buyerType: BuyerType;
  propertyType: PropertyType;
}
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
  | 'VN' | 'SE' | 'NO' | 'BE' | 'NZ'
  // Batch 4 (Europe): Austria, Denmark, Finland, Portugal, Greece,
  //          Czech Rep, Hungary, Romania, Luxembourg, Iceland,
  //          Estonia, Cyprus
  | 'AT' | 'DK' | 'FI' | 'PT' | 'GR'
  | 'CZ' | 'HU' | 'RO' | 'LU' | 'IS'
  | 'EE' | 'CY'
  // Batch 4 (Asia): Hong Kong, Taiwan, Thailand, Malaysia, Philippines
  | 'HK' | 'TW' | 'TH' | 'MY' | 'PH'
  // Batch 4 (Middle East): Qatar, Kuwait, Israel
  | 'QA' | 'KW' | 'IL'
  // Batch 4 (Americas + Africa): Argentina, Chile, South Africa
  | 'AR' | 'CL' | 'ZA'
  // Batch 5 (Eastern Europe): Ukraine
  | 'UA';

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
  stampDuty: (purchasePrice: number, ctx: StampDutyContext) => number;
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
  propertyType: PropertyType;
  /**
   * Optional: market whose currency the mortgage is denominated in. When set
   * and different from `market`, this is treated as a foreign-currency
   * mortgage — the property is valued in the host market's currency and the
   * loan is converted to/from the borrowing currency at the FX table.
   * Only used by the pro analysis.
   */
  loanCurrencyMarket?: MarketCode;
  rateStructure: RateStructure;
  splitFixedProportion: number;
  mortgageTerm: number;
  /** Months of payment holiday at the start of the loan (interest still accrues). */
  paymentHolidayMonths: number;
  /**
   * Currency the user types property price / deposit / fees in. Defaults to
   * the local market's currency. When different, the figures shown in step 2
   * are converted on the fly via lib/fx and the canonical values stored on
   * housePrice / deposit / otherFees are always in the local market currency.
   */
  displayCurrencyMarket?: MarketCode;
  /** Wizard-level cashback amount in local market currency (0 for none). */
  wizardCashbackAmount: number;
  /** Years the lender can claw back cashback if you switch (typically 5). */
  wizardCashbackClawbackYears: number;
  scenarios: ScenarioInput[];
  isUnlocked: boolean;
}
