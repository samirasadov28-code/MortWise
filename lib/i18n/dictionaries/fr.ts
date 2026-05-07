import type { Dictionary } from './en';

const fr: Dictionary = {
  // ─── Brand / nav ──────────────────────────────────────────────────────
  'brand.name': 'MortWise',
  'nav.startFree': 'Commencer gratuitement →',
  'header.unlocked': 'Analyse complète débloquée',
  'header.viewFree': 'Vue gratuite',
  'header.viewFull': 'Vue complète',
  'header.compareIn': 'Comparer en',
  'header.localCurrency': 'locale',

  // ─── Disclaimer / version ─────────────────────────────────────────────
  'disclaimer.text': 'MortWise est un outil de calcul, pas un conseil financier. Consultez toujours un courtier hypothécaire qualifié avant de prendre une décision.',
  'disclaimer.forceUpdate': '↻ forcer la mise à jour',
  'disclaimer.updateAvailable': 'mise à jour disponible',

  // ─── Landing — hero ───────────────────────────────────────────────────
  'landing.heroTitle': 'Comprenez votre prêt immobilier —',
  'landing.heroTitleAccent': 'pas seulement la mensualité',
  'landing.heroSubtitle': 'Comparez les prêts à taux fixe, variable et mixte côte à côte. Testez la résistance aux hausses de taux. Voyez ce que vous payez réellement sur 30 ans. Conçu pour les primo-accédants fatigués du jargon.',
  'landing.heroCta': 'Commencer gratuitement →',

  // ─── Landing — value props ────────────────────────────────────────────
  'landing.valueProp1Title': 'Coût total du logement',
  'landing.valueProp1Desc': 'Ne regardez pas que la mensualité — voyez les intérêts totaux, le montant total remboursé, et le vrai coût sur 30 ans de chaque bien que vous pourriez acheter.',
  'landing.valueProp2Title': 'Stress test de hausse des taux',
  'landing.valueProp2Desc': 'Découvrez exactement ce que devient votre mensualité si les taux montent de +1 %, +2 % ou +3 % à la fin de votre période fixe — avant de signer.',
  'landing.valueProp3Title': 'Règles immobilières locales',
  'landing.valueProp3DescTpl': 'Frais de notaire précis, dispositifs primo-accédants (PTZ, Action Logement, Help to Buy, FHSA, KfW…) et plafonds des prêteurs pour {count} marchés immobiliers.',

  // ─── Landing — Free vs Full ───────────────────────────────────────────
  'landing.freeVsFull': 'Gratuit vs Complet',
  'landing.free': 'Gratuit',
  'landing.full': 'Complet',
  'landing.bestValue': 'Meilleur rapport',
  'landing.perMonth': '/ mois',
  'landing.fullCta': 'Commencer gratuit, passer au complet plus tard →',

  // ─── Landing — markets section ────────────────────────────────────────
  'landing.availableMarkets': 'Marchés immobiliers disponibles',
  'landing.marketsHint': 'Frais de notaire, règles d’apport et dispositifs primo-accédants ajustés par pays. Utilisez les flèches pour parcourir.',

  // ─── Wizard — common ──────────────────────────────────────────────────
  'wizard.next': 'Suivant →',
  'wizard.back': '← Retour',
  'wizard.calculate': 'Calculer →',
  'wizard.editInputs': '← Modifier les données',
  'wizard.stepOf': 'Étape {step} sur {total}',

  // ─── Wizard — Step 1: Market ──────────────────────────────────────────
  'step1.title': 'Choisissez votre marché',
  'step1.subtitle': 'MortWise adapte les frais de notaire, les dispositifs publics, le contexte réglementaire et la liste des banques au marché choisi.',
  'step1.govtSchemes': 'Dispositifs publics',
  'step1.regulatoryNotes': 'Notes réglementaires',
  'step1.keyContext': 'contexte clé',

  // ─── Wizard — Step 2: Property ────────────────────────────────────────
  'step2.title': 'Détails du bien',
  'step2.subtitle': 'Saisissez le prix du bien et le montant de votre apport.',
  'step2.enterValuesIn': 'Saisir les valeurs en',
  'step2.propertyPrice': 'Prix du bien',
  'step2.deposit': 'Apport',
  'step2.amount': 'Montant',
  'step2.percent': 'Pourcentage',
  'step2.otherFees': 'Autres frais (notaire, expertise, courtier)',
  'step2.rollFeesIntoMortgage': 'Inclure ces frais dans le prêt',
  'step2.propertyType': 'Type de bien',
  'step2.secondaryMarket': 'Marché secondaire',
  'step2.secondaryMarketDesc': 'Logement existant, revente',
  'step2.newBuild': 'Neuf',
  'step2.newBuildDesc': 'Première vente du promoteur',
  'step2.purchaseDate': 'Date d’achat prévue',
  'step2.estimatedStampDuty': 'Frais de notaire estimés',

  // ─── Wizard — Step 3: Profile ─────────────────────────────────────────
  'step3.title': 'Profil acheteur',
  'step3.subtitle': 'Votre profil influe sur les frais de notaire, le montant maximum empruntable et les dispositifs publics auxquels vous êtes éligible.',
  'step3.buyerType': 'Type d’acheteur',
  'step3.firstTime': 'Primo-accédant',
  'step3.firstTimeDesc': 'Jamais propriétaire auparavant',
  'step3.mover': 'Changement de logement',
  'step3.moverDesc': 'Vente du bien actuel pour en acheter un autre',
  'step3.investor': 'Investisseur / locatif',
  'step3.investorDesc': 'Achat pour investissement locatif',
  'step3.nonResident': 'Non-résident',
  'step3.nonResidentDesc': 'Achat depuis l’étranger',
  'step3.annualIncome': 'Revenu annuel brut',
  'step3.coBorrowerIncome': 'Revenu du co-emprunteur (optionnel)',

  // ─── Wizard — Step 4: Rate structure ──────────────────────────────────
  'step4.title': 'Structure de taux',
  'step4.subtitle': 'Choisissez le type de taux d’intérêt pour vos scénarios de prêt.',
  'step4.mortgageTerm': 'Durée du prêt',
  'step4.paymentHoliday': 'Pause de paiement',
  'step4.cashback': 'Cashback du prêteur',

  // ─── Wizard — Step 5: Lender scenarios ────────────────────────────────
  'step5.title': 'Scénarios de prêteurs',
  'step5.subtitle': 'Configurez jusqu’à 4 scénarios à comparer côte à côte.',
  'step5.generateRates': 'Générer les taux du marché',
  'step5.generating': 'Génération…',

  // ─── Results — common ─────────────────────────────────────────────────
  'results.fullAnalysis': 'Analyse complète',
  'results.scenariosCompared': '{n} scénarios comparés',
  'results.exportPdf': '↓ Exporter en PDF',
  'results.buildingPdf': 'Création du PDF…',

  // ─── Floating widgets ─────────────────────────────────────────────────
  'feedback.button': 'Avis',
  'chat.button': 'Demander à MortWise',

  // ─── Affordability calculator (landing page) — TODO translate ─────────
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

  // ─── Saved scenarios / cross-analysis comparison — TODO translate ─────
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

  // ─── Saved scenarios import/export — TODO translate ───────────────────
  'saved.export': '↓ Export JSON',
  'saved.import': '↑ Import JSON',
  'saved.exportedToast': 'Exported {n} scenario(s) to JSON',
  'saved.importedToast': 'Imported {added} scenario(s), skipped {skipped}',
  'saved.importFailed': 'Couldn’t import that file',
};

export default fr;
