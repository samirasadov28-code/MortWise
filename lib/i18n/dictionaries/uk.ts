import type { Dictionary } from './en';

const uk: Dictionary = {
  // ─── Brand / nav ──────────────────────────────────────────────────────
  'brand.name': 'MortWise',
  'nav.startFree': 'Почати безкоштовно →',
  'header.unlocked': 'Повний аналіз розблоковано',
  'header.viewFree': 'Безкоштовний вигляд',
  'header.viewFull': 'Повний вигляд',
  'header.compareIn': 'Порівняти у',
  'header.localCurrency': 'місцевій',

  // ─── Disclaimer / version ─────────────────────────────────────────────
  'disclaimer.text': 'MortWise — це інструмент для розрахунків, а не фінансова порада. Перед прийняттям рішень завжди консультуйтеся з кваліфікованим іпотечним радником.',
  'disclaimer.forceUpdate': '↻ примусово оновити',
  'disclaimer.updateAvailable': 'доступне оновлення',

  // ─── Landing — hero ───────────────────────────────────────────────────
  'landing.heroTitle': 'Зрозумійте свою іпотеку —',
  'landing.heroTitleAccent': 'не лише щомісячний платіж',
  'landing.heroSubtitle': 'Порівнюйте іпотеку з фіксованою, плаваючою та змішаною ставкою. Перевіряйте стійкість до підвищення ставок. Дивіться, скільки ви насправді сплатите за 30 років. Створено для тих, хто купує житло вперше і втомився від жаргону.',
  'landing.heroCta': 'Почати безкоштовно →',

  // ─── Landing — value props ────────────────────────────────────────────
  'landing.valueProp1Title': 'Повна вартість житла',
  'landing.valueProp1Desc': 'Не дивіться лише на щомісячний платіж — бачте загальні відсотки, повну суму до сплати та реальну 30-річну вартість кожного житла.',
  'landing.valueProp2Title': 'Стрес-тест зростання ставок',
  'landing.valueProp2Desc': 'Дізнайтеся, яким стане ваш щомісячний платіж, якщо після фіксованого періоду ставки зростуть на +1%, +2% або +3% — ще до підписання договору.',
  'landing.valueProp3Title': 'Місцеві правила нерухомості',
  'landing.valueProp3DescTpl': 'Точне мито, програми для нових покупців (Help to Buy, First Home Scheme, FHSA, KfW…) та обмеження банків для {count} ринків нерухомості.',

  // ─── Landing — Free vs Full ───────────────────────────────────────────
  'landing.freeVsFull': 'Безкоштовно vs Повний',
  'landing.free': 'Безкоштовно',
  'landing.full': 'Повний',
  'landing.bestValue': 'Найкраща ціна',
  'landing.perMonth': '/ місяць',
  'landing.fullCta': 'Почати безкоштовно, оновити всередині →',

  // ─── Landing — markets section ────────────────────────────────────────
  'landing.availableMarkets': 'Доступні ринки нерухомості',
  'landing.marketsHint': 'Мито, правила щодо першого внеску та програми для нових покупців налаштовані для кожної країни. Використовуйте стрілки, щоб переглянути.',

  // ─── Wizard — common ──────────────────────────────────────────────────
  'wizard.next': 'Далі →',
  'wizard.back': '← Назад',
  'wizard.calculate': 'Розрахувати →',
  'wizard.editInputs': '← Змінити дані',
  'wizard.stepOf': 'Крок {step} з {total}',

  // ─── Wizard — Step 1: Market ──────────────────────────────────────────
  'step1.title': 'Оберіть ринок',
  'step1.subtitle': 'MortWise адаптує мито, державні програми, регуляторний контекст і список банків до обраного вами ринку.',
  'step1.govtSchemes': 'Державні програми',
  'step1.regulatoryNotes': 'Регуляторні нотатки',
  'step1.keyContext': 'ключовий контекст',

  // ─── Wizard — Step 2: Property ────────────────────────────────────────
  'step2.title': 'Деталі нерухомості',
  'step2.subtitle': 'Введіть ціну нерухомості та розмір доступного першого внеску.',
  'step2.enterValuesIn': 'Вводити суми у',
  'step2.propertyPrice': 'Ціна нерухомості',
  'step2.deposit': 'Перший внесок',
  'step2.amount': 'Сума',
  'step2.percent': 'Відсоток',
  'step2.otherFees': 'Інші витрати (юридичні, оцінка, брокер)',
  'step2.rollFeesIntoMortgage': 'Включити ці витрати в іпотеку',
  'step2.propertyType': 'Тип нерухомості',
  'step2.secondaryMarket': 'Вторинний ринок',
  'step2.secondaryMarketDesc': 'Існуюче житло, перепродаж',
  'step2.newBuild': 'Новобудова',
  'step2.newBuildDesc': 'Перший продаж від забудовника',
  'step2.purchaseDate': 'Запланована дата купівлі',
  'step2.estimatedStampDuty': 'Орієнтовне мито',

  // ─── Wizard — Step 3: Profile ─────────────────────────────────────────
  'step3.title': 'Профіль покупця',
  'step3.subtitle': 'Ваш профіль впливає на мито, максимальну суму кредиту та доступні державні програми.',
  'step3.buyerType': 'Тип покупця',
  'step3.firstTime': 'Перша покупка',
  'step3.firstTimeDesc': 'Ніколи раніше не володів нерухомістю',
  'step3.mover': 'Зміна житла',
  'step3.moverDesc': 'Продаж існуючої нерухомості для купівлі іншої',
  'step3.investor': 'Інвестор / під оренду',
  'step3.investorDesc': 'Купівля як орендна інвестиція',
  'step3.nonResident': 'Нерезидент',
  'step3.nonResidentDesc': 'Купівля з-за кордону',
  'step3.annualIncome': 'Річний дохід (валовий)',
  'step3.coBorrowerIncome': 'Дохід співпозичальника (необов’язково)',

  // ─── Wizard — Step 4: Rate structure ──────────────────────────────────
  'step4.title': 'Структура ставки',
  'step4.subtitle': 'Оберіть тип процентної ставки для ваших іпотечних сценаріїв.',
  'step4.mortgageTerm': 'Термін іпотеки',
  'step4.paymentHoliday': 'Кредитні канікули',
  'step4.cashback': 'Cashback від банку',

  // ─── Wizard — Step 5: Lender scenarios ────────────────────────────────
  'step5.title': 'Сценарії кредиторів',
  'step5.subtitle': 'Налаштуйте до 4 сценаріїв для порівняння.',
  'step5.generateRates': 'Згенерувати ринкові ставки',
  'step5.generating': 'Генеруємо…',

  // ─── Results — common ─────────────────────────────────────────────────
  'results.fullAnalysis': 'Повний аналіз',
  'results.scenariosCompared': 'Порівняно сценаріїв: {n}',
  'results.exportPdf': '↓ Експорт у PDF',
  'results.buildingPdf': 'Створюємо PDF…',

  // ─── Floating widgets ─────────────────────────────────────────────────
  'feedback.button': 'Відгук',
  'chat.button': 'Запитати MortWise',

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

export default uk;
