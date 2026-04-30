import type { MarketConfig, StampDutyContext } from '../types';

const sg: MarketConfig = {
  code: 'SG',
  name: 'Singapore',
  flag: '🇸🇬',
  currency: 'SGD',
  currencySymbol: 'S$',
  defaultTerm: 25,
  maxLTV: 0.75,
  maxIncomeMultiple: 5,
  minDepositPercent: 25,

  ltvBands: [
    { maxLtv: 0.55, label: '≤55% LTV', description: 'Loan tenure > 25y or beyond age 65' },
    { maxLtv: 0.75, label: '56–75% LTV', description: 'Standard first home loan (private property)' },
    { maxLtv: 0.45, label: 'Second loan', description: 'LTV cap drops to 45% / 25% for 2nd / 3rd housing loan' },
  ],

  // Buyer's Stamp Duty (BSD): tiered 1% / 2% / 3% / 4% / 5% / 6%.
  // ABSD: 20% Singaporean 2nd home, 60% foreigners. Approximation: ~3% citizen FTB.
  stampDuty: (price: number, { buyerType }: StampDutyContext): number => {
    let bsd = 0;
    let remaining = price;
    const tiers: Array<[number, number]> = [
      [180_000, 0.01],
      [180_000, 0.02],
      [640_000, 0.03],
      [500_000, 0.04],
      [1_500_000, 0.05],
      [Infinity, 0.06],
    ];
    for (const [band, rate] of tiers) {
      const amount = Math.min(remaining, band);
      bsd += amount * rate;
      remaining -= amount;
      if (remaining <= 0) break;
    }
    if (buyerType === 'non_resident' || buyerType === 'investor') {
      bsd += price * 0.60; // ABSD approximation for foreigner
    } else if (buyerType === 'mover') {
      bsd += price * 0.20; // ABSD second property for citizen
    }
    return bsd;
  },

  govtSchemes: [
    {
      name: 'HDB Concessionary Loan',
      description: 'Subsidised loan from the Housing & Development Board for HDB flat purchase, with rate pegged to CPF Ordinary Account rate +0.1% (currently ~2.6%).',
      maxAmount: (price: number) => price * 0.75,
      eligibility: 'Singapore citizens; first or second-time buyer; income ceiling S$14k single / S$21k household',
      url: 'https://www.hdb.gov.sg',
    },
    {
      name: 'Enhanced CPF Housing Grant (EHG)',
      description: 'Cash grant of up to S$120k for first-time HDB buyers, scaled by household income.',
      maxAmount: 120_000,
      eligibility: 'First-time buyer; household income ≤ S$9,000/month; in continuous employment ≥ 12 months',
      url: 'https://www.hdb.gov.sg',
    },
  ],

  regulatoryNotes: [
    'Total Debt Servicing Ratio (TDSR): all monthly debt obligations capped at 55% of gross monthly income.',
    'Mortgage Servicing Ratio (MSR) for HDB / EC flats: housing payment ≤ 30% of income.',
    'Maximum tenure: 30y for HDB, 35y for private; loans extending past 65 trigger lower LTV.',
    'Foreigners face 60% Additional Buyer’s Stamp Duty (ABSD) on residential property.',
  ],

  greenMortgageAvailable: true,
  greenMortgageTypicalDiscount: 0.0010,
  greenMortgageEligibilityNote: 'OCBC Eco-Care, UOB U-Home Green: rate discounts for BCA Green Mark Gold-certified or higher properties.',
};

export default sg;
