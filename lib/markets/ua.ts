import type { MarketConfig, BuyerType } from '../types';

const ua: MarketConfig = {
  code: 'UA',
  name: 'Ukraine',
  flag: '🇺🇦',
  currency: 'UAH',
  currencySymbol: '₴',
  defaultTerm: 20,
  maxLTV: 0.80,
  maxIncomeMultiple: 5,
  minDepositPercent: 20,

  ltvBands: [
    { maxLtv: 0.50, label: '≤50% LTV', description: 'Best rates, lowest risk weighting' },
    { maxLtv: 0.70, label: '51–70% LTV', description: 'Standard residents, primary residence' },
    { maxLtv: 0.80, label: '71–80% LTV', description: 'eOselia state programme or top-tier banks only' },
  ],

  // 1% pension fund levy + 1% state duty paid by buyer; notary/registration fees are extra.
  stampDuty: (price: number, _buyerType: BuyerType): number => price * 0.02,

  govtSchemes: [
    {
      name: 'єОселя (eOselia)',
      description: 'State-supported affordable mortgage programme run by Ukrfinzhytlo — fixed rates of 3% (priority workers: military, medics, teachers, scientists) or 7% (other residents) for the full term.',
      maxAmount: 2_000_000,
      eligibility: 'Ukrainian citizen; primary residence; price/area caps by city; priority categories receive the 3% rate',
      url: 'https://eoselya.gov.ua',
    },
    {
      name: 'Affordable Housing 50/50',
      description: 'State covers 50% of the cost of a home (up to defined area norms) for eligible categories such as IDPs, military families and young families.',
      maxAmount: 1_500_000,
      eligibility: 'Registered eligible category (IDP, military, young family); area norms apply; one-time use',
      url: 'https://www.molod-kredit.gov.ua',
    },
  ],

  regulatoryNotes: [
    'NBU policy rate and wartime capital controls heavily shape mortgage availability — most market-rate lending is paused, with eOselia the dominant channel.',
    'Loans must be denominated in UAH for retail borrowers; FX mortgages to individuals have been banned since 2011.',
    'Martial law restricts foreclosure on primary residences of mobilised borrowers and IDPs.',
    'Notary fees, 1% pension levy and 1% state duty add ~3–4% to closing costs beyond the deposit.',
  ],

  greenMortgageAvailable: false,
  greenMortgageTypicalDiscount: 0,
  greenMortgageEligibilityNote: 'No formal green mortgage discount yet; energy-efficiency incentives flow through separate IFC/EBRD-backed retrofit grants rather than rate discounts.',
};

export default ua;
