/**
 * English (source) translation dictionary. All other languages must satisfy
 * this `Dictionary` shape — TypeScript will enforce it.
 *
 * Keys are dot-separated to keep groups visually clustered. The `t()` function
 * does a flat lookup so there's no nesting concern at runtime.
 */
const en = {
  // ─── Brand / nav ──────────────────────────────────────────────────────
  'brand.name': 'MortWise',
  'nav.startFree': 'Start free →',
  'header.unlocked': 'Full analysis unlocked',
  'header.viewFree': 'View Free',
  'header.viewFull': 'View Full',
  'header.compareIn': 'Compare in',
  'header.localCurrency': 'local',

  // ─── Disclaimer / version ─────────────────────────────────────────────
  'disclaimer.text': 'MortWise is a calculation tool, not financial advice. Always speak to a qualified mortgage advisor before making decisions.',
  'disclaimer.forceUpdate': '↻ force update',
  'disclaimer.updateAvailable': 'update available',

  // ─── Landing — hero ───────────────────────────────────────────────────
  'landing.heroTitle': 'Understand your mortgage —',
  'landing.heroTitleAccent': 'not just the monthly number',
  'landing.heroSubtitle': 'Compare fixed, variable, and split-rate mortgages side by side. Stress-test against rate rises. See what you actually pay over 30 years. Built for first-time buyers who are tired of jargon.',
  'landing.heroCta': 'Start free →',

  // ─── Landing — value props ────────────────────────────────────────────
  'landing.valueProp1Title': 'Total cost of the home',
  'landing.valueProp1Desc': 'Don’t just see the monthly payment — see total interest, total repaid, and the true 30-year cost of each home you might buy.',
  'landing.valueProp2Title': 'Rate-rise stress test',
  'landing.valueProp2Desc': 'See exactly what your monthly payment becomes if rates rise +1%, +2%, or +3% when your fixed period expires — before you sign.',
  'landing.valueProp3Title': 'Local property rules',
  'landing.valueProp3DescTpl': 'Accurate stamp duty, first-time buyer schemes (Help to Buy, First Home Scheme, FHSA, KfW…), and lender limits for {count} housing markets.',

  // ─── Landing — Free vs Full ───────────────────────────────────────────
  'landing.freeVsFull': 'Free vs Full',
  'landing.free': 'Free',
  'landing.full': 'Full',
  'landing.bestValue': 'Best value',
  'landing.perMonth': '/ month',
  'landing.fullCta': 'Start free, upgrade inside →',

  // ─── Landing — markets section ────────────────────────────────────────
  'landing.availableMarkets': 'Available housing markets',
  'landing.marketsHint': 'Stamp duty, deposit rules, and first-time buyer schemes are tuned per country. Use the arrows to browse.',

  // ─── Wizard — common ──────────────────────────────────────────────────
  'wizard.next': 'Next →',
  'wizard.back': '← Back',
  'wizard.calculate': 'Calculate →',
  'wizard.editInputs': '← Edit inputs',
  'wizard.stepOf': 'Step {step} of {total}',

  // ─── Wizard — Step 1: Market ──────────────────────────────────────────
  'step1.title': 'Select your market',
  'step1.subtitle': 'MortWise adapts stamp duty, government schemes, regulatory context, and bank lineup to the market you select.',
  'step1.govtSchemes': 'Government Schemes',
  'step1.regulatoryNotes': 'Regulatory Notes',
  'step1.keyContext': 'key context',

  // ─── Wizard — Step 2: Property ────────────────────────────────────────
  'step2.title': 'Property details',
  'step2.subtitle': 'Enter the property price and how much deposit you have available.',
  'step2.enterValuesIn': 'Enter values in',
  'step2.propertyPrice': 'Property price',
  'step2.deposit': 'Deposit',
  'step2.amount': 'Amount',
  'step2.percent': 'Percent',
  'step2.otherFees': 'Other fees (legal, surveyor, broker)',
  'step2.rollFeesIntoMortgage': 'Roll these fees into the mortgage',
  'step2.propertyType': 'Property type',
  'step2.secondaryMarket': 'Secondary market',
  'step2.secondaryMarketDesc': 'Existing home, resale',
  'step2.newBuild': 'New build',
  'step2.newBuildDesc': 'First sale from developer',
  'step2.purchaseDate': 'Planned purchase date',
  'step2.estimatedStampDuty': 'Estimated stamp duty',

  // ─── Wizard — Step 3: Profile ─────────────────────────────────────────
  'step3.title': 'Buyer profile',
  'step3.subtitle': 'Your profile affects stamp duty, maximum borrowing, and eligible government schemes.',
  'step3.buyerType': 'Buyer type',
  'step3.firstTime': 'First-time buyer',
  'step3.firstTimeDesc': 'Never owned a property before',
  'step3.mover': 'Moving home',
  'step3.moverDesc': 'Selling existing property to buy another',
  'step3.investor': 'Investor / BTL',
  'step3.investorDesc': 'Buying as a rental investment',
  'step3.nonResident': 'Non-resident',
  'step3.nonResidentDesc': 'Buying from abroad',
  'step3.annualIncome': 'Annual gross income',
  'step3.coBorrowerIncome': 'Co-borrower income (optional)',

  // ─── Wizard — Step 4: Rate structure ──────────────────────────────────
  'step4.title': 'Rate structure',
  'step4.subtitle': 'Choose the type of interest rate arrangement for your mortgage scenarios.',
  'step4.mortgageTerm': 'Mortgage term',
  'step4.paymentHoliday': 'Payment holiday',
  'step4.cashback': 'Lender cashback',

  // ─── Wizard — Step 5: Lender scenarios ────────────────────────────────
  'step5.title': 'Lender scenarios',
  'step5.subtitle': 'Configure up to 4 scenarios to compare side by side.',
  'step5.generateRates': 'Generate market rates',
  'step5.generating': 'Generating…',

  // ─── Results — common ─────────────────────────────────────────────────
  'results.fullAnalysis': 'Full Analysis',
  'results.scenariosCompared': '{n} scenarios compared',
  'results.exportPdf': '↓ Export PDF',
  'results.buildingPdf': 'Building PDF…',

  // ─── Floating widgets ─────────────────────────────────────────────────
  'feedback.button': 'Feedback',
  'chat.button': 'Ask MortWise',

  // ─── Affordability calculator (landing page) ──────────────────────────
  'aff.sectionTitle': 'How much can you borrow?',
  'aff.sectionSubtitle': 'Get a quick affordability estimate before you dive into the full analysis. We apply local lender rules so the number is realistic — not a generic global ratio.',
  'aff.title': 'Affordability check',
  'aff.subtitle': 'Income, deposit and lender rules — combined into a realistic max purchase price.',
  'aff.market': 'Market',
  'aff.annualIncome': 'Your annual gross income',
  'aff.coBorrower': 'Co-borrower income (optional)',
  'aff.deposit': 'Deposit available',
  'aff.monthlyDebt': 'Existing monthly debt payments',
  'aff.rate': 'Indicative mortgage rate',
  'aff.term': 'Mortgage term',
  'aff.maxPrice': 'Estimated max purchase price',
  'aff.maxLoanLine': 'Max loan {loan} · monthly ≈ {payment}',
  'aff.bindingLabel': 'Binding constraint',
  'aff.bindingIncome': 'Income multiple',
  'aff.bindingDTI': 'Debt-to-income ratio',
  'aff.bindingLTV': 'Loan-to-value (deposit size)',
  'aff.byIncome': 'Income cap',
  'aff.byDTI': 'Affordability (DTI)',
  'aff.byLTV': 'Deposit / LTV cap',
  'aff.estimated': 'estimated',
  'aff.regulatory': 'regulatory',
  'aff.ofIncome': 'of gross income',
  'aff.depositCovers': 'deposit ≥',
  'aff.useInCalculator': 'Continue to full mortgage analysis →',
  'aff.disclaimer': 'Indicative only. Actual lender decisions consider credit history, employment status and stress-test buffers we don’t model here.',

  // ─── Saved scenarios / cross-analysis comparison (paid) ───────────────
  'saved.heading': 'Saved scenarios',
  'saved.subheading': 'Save this analysis and compare it side by side with previous ones — including across different markets.',
  'saved.namePlaceholder': 'e.g. Madrid, 2-bed',
  'saved.saveCurrent': 'Save current',
  'saved.empty': 'You haven’t saved any scenarios yet. Hit “Save current” above to keep this one for later.',
  'saved.colName': 'Name',
  'saved.colMarket': 'Market',
  'saved.colPrice': 'Price',
  'saved.colMonthly': 'Monthly',
  'saved.colTotalCost': 'Total cost',
  'saved.colRate': 'Eff. rate',
  'saved.colTerm': 'Term',
  'saved.delete': 'Delete',
  'saved.fxNote': 'Saved values are stored in each scenario’s local currency and re-rendered on the fly into the display currency selected at the top of the page. Saved locally to your browser only.',
  'saved.export': '↓ Export JSON',
  'saved.import': '↑ Import JSON',
  'saved.exportedToast': 'Exported {n} scenario(s) to JSON',
  'saved.importedToast': 'Imported {added} scenario(s), skipped {skipped}',
  'saved.importFailed': 'Couldn’t import that file',
} as const;

export default en;
// Keys come from the literal English dictionary (so other dictionaries are
// forced to translate every key) but values are general strings — translated
// strings are not literally equal to the English source.
export type TranslationKey = keyof typeof en;
export type Dictionary = { [K in TranslationKey]: string };
