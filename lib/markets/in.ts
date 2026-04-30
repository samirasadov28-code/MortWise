import type { MarketConfig, StampDutyContext } from '../types';

const inMarket: MarketConfig = {
  code: 'IN',
  name: 'India',
  flag: '🇮🇳',
  currency: 'INR',
  currencySymbol: '₹',
  defaultTerm: 20,
  maxLTV: 0.90,
  maxIncomeMultiple: 6,
  minDepositPercent: 10,

  ltvBands: [
    { maxLtv: 0.75, label: '≤75% LTV', description: 'Loan ≤ ₹30 lakh — up to 90% allowed' },
    { maxLtv: 0.80, label: '76–80% LTV', description: 'Loan ₹30–75 lakh' },
    { maxLtv: 0.90, label: '81–90% LTV', description: 'Small-ticket loans only (≤ ₹30 lakh)' },
  ],

  // Stamp duty + registration varies by state: 5–8% combined typical.
  // Some states give 1–2% concession to women buyers.
  stampDuty: (price: number, _ctx: StampDutyContext): number => price * 0.07,

  govtSchemes: [
    {
      name: 'Pradhan Mantri Awas Yojana — Credit Linked Subsidy (PMAY-CLSS)',
      description: 'Interest subsidy of 3–6.5% on home loans for EWS, LIG, and MIG categories — directly reduces effective EMI for the first 20 years.',
      maxAmount: 267_000,
      eligibility: 'Household income ≤ ₹18 lakh/yr; family must not own pucca house anywhere in India',
      url: 'https://pmaymis.gov.in',
    },
    {
      name: 'Section 80C + 24(b) Tax Deductions',
      description: 'Up to ₹1.5 lakh principal (80C) and ₹2 lakh interest (24b) deductible per year for self-occupied property.',
      maxAmount: 350_000,
      eligibility: 'Self-occupied property; loan from approved lender; construction completed within 5 years',
      url: 'https://www.incometax.gov.in',
    },
    {
      name: 'Section 80EEA Additional Interest Deduction',
      description: 'Additional ₹1.5 lakh interest deduction for first-time buyers of affordable housing (stamp value ≤ ₹45 lakh).',
      maxAmount: 150_000,
      eligibility: 'First-time buyer; loan sanctioned 2019–2022 (extensions); property stamp value ≤ ₹45 lakh',
      url: 'https://www.incometax.gov.in',
    },
  ],

  regulatoryNotes: [
    'RBI repo rate is the benchmark — most floating-rate loans linked to External Benchmark Lending Rate (EBLR).',
    'Most home loans are floating-rate; long fixed tenors are uncommon.',
    'Several states offer 1–2% stamp duty concession for women-owned property — co-owning with a woman often saves significantly.',
    'Foreign nationals (non-NRI/PIO/OCI) generally cannot purchase residential property in India.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'SBI, HDFC, and others offer rate concessions for IGBC- or GRIHA-certified green homes.',
};

export default inMarket;
