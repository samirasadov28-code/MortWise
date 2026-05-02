import type { ScenarioInput, MonthlyPeriod, ScenarioResult } from '../types';

function calcAnnuityPayment(principal: number, monthlyRate: number, remainingMonths: number): number {
  if (monthlyRate === 0) return principal / remainingMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) /
    (Math.pow(1 + monthlyRate, remainingMonths) - 1);
}

function calcLoanAmount(input: ScenarioInput): number {
  const base = input.housePrice * input.loanToValue;
  const fees = input.otherFeesCoveredByDebt ? input.otherFees : 0;
  const support = input.govtSupportAmount ?? 0;
  return Math.max(0, base + fees - support);
}

function getMonthlyRate(input: ScenarioInput, monthIndex: number): number {
  const fixedMonths = (input.fixedPeriodYears ?? 0) * 12;

  switch (input.rateStructure) {
    case 'fixed':
      if (fixedMonths > 0 && monthIndex < fixedMonths) {
        return (input.fixedRate ?? input.variableRate) / 12;
      }
      return input.variableRate / 12;

    case 'variable':
      return input.variableRate / 12;

    case 'tracker': {
      const base = input.trackerBaseRate ?? 0;
      const margin = input.trackerMargin ?? 0;
      return (base + margin) / 12;
    }

    case 'split':
      // For split, amortisation.ts handles each part separately via runSplitRate
      return input.variableRate / 12;

    default:
      return input.variableRate / 12;
  }
}

export function runAmortisation(input: ScenarioInput, startDate: Date = new Date()): ScenarioResult {
  if (input.rateStructure === 'split') {
    return runSplitRate(input, startDate);
  }

  const loanAmount = calcLoanAmount(input);
  const totalMonths = input.mortgageTerm * 12;
  const fixedMonths = (input.fixedPeriodYears ?? 0) * 12;
  const graceMonths = input.graceMonths ?? 0;
  const cashbackPercent = input.cashbackPercent ?? 0;
  const cashbackReceived = loanAmount * cashbackPercent;

  const periods: MonthlyPeriod[] = [];
  let balance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let monthlyPayment = 0;
  let firstPayment = 0;
  let actualMonths = totalMonths;

  // Precompute initial payment
  if (graceMonths > 0) {
    monthlyPayment = 0; // will be set per-period
  } else {
    const rate = getMonthlyRate(input, 0);
    if (input.repaymentType === 'annuity') {
      monthlyPayment = calcAnnuityPayment(balance, rate, totalMonths);
    } else {
      monthlyPayment = balance / totalMonths + balance * rate;
    }
  }

  for (let m = 0; m < totalMonths; m++) {
    if (balance <= 0.01) {
      actualMonths = m;
      break;
    }

    const isGrace = m < graceMonths;
    const isHoliday = input.holidayStart !== undefined &&
      input.holidayDuration !== undefined &&
      m >= input.holidayStart &&
      m < (input.holidayStart + input.holidayDuration);
    const isFixed = input.rateStructure === 'fixed' && m < fixedMonths;

    const rate = getMonthlyRate(input, m);
    const openingBalance = balance;
    const interestCharge = openingBalance * rate;

    let principal = 0;
    let payment = 0;
    let overpayment = 0;

    if (isHoliday) {
      // Interest accrues, capitalised
      balance += interestCharge;
      // Recalculate payment post-holiday
      const remainingMonths = totalMonths - m - 1;
      if (remainingMonths > 0) {
        const nextRate = getMonthlyRate(input, m + 1);
        if (input.repaymentType === 'annuity') {
          monthlyPayment = calcAnnuityPayment(balance, nextRate, remainingMonths);
        } else {
          monthlyPayment = balance / remainingMonths + balance * nextRate;
        }
      }
    } else if (isGrace) {
      payment = interestCharge;
      principal = 0;
      // Recalculate after grace period ends
      if (m === graceMonths - 1) {
        const remainingMonths = totalMonths - graceMonths;
        const nextRate = getMonthlyRate(input, graceMonths);
        if (input.repaymentType === 'annuity') {
          monthlyPayment = calcAnnuityPayment(balance, nextRate, remainingMonths);
        } else {
          monthlyPayment = balance / remainingMonths + balance * nextRate;
        }
      }
    } else {
      // After fixed period — recalculate
      if (input.rateStructure === 'fixed' && fixedMonths > 0 && m === fixedMonths) {
        const remaining = totalMonths - m;
        const newRate = input.variableRate / 12;
        if (input.repaymentType === 'annuity') {
          monthlyPayment = calcAnnuityPayment(balance, newRate, remaining);
        } else {
          monthlyPayment = balance / remaining + balance * newRate;
        }
      }

      if (input.repaymentType === 'fixed_principal') {
        principal = loanAmount / totalMonths;
        payment = principal + interestCharge;
        monthlyPayment = payment;
      } else {
        payment = Math.min(monthlyPayment, balance + interestCharge);
        principal = payment - interestCharge;
        if (principal < 0) principal = 0;
      }

      // Apply overpayment if scheduled
      if (
        input.overpaymentLumpSum &&
        input.overpaymentStart !== undefined &&
        input.overpaymentFrequency !== undefined
      ) {
        const yearOfMonth = Math.floor(m / 12) + 1;
        const startYear = input.overpaymentStart;
        const freq = input.overpaymentFrequency;
        if (yearOfMonth >= startYear && (yearOfMonth - startYear) % freq === 0) {
          const isFirstMonthOfYear = m % 12 === 0;
          if (isFirstMonthOfYear) {
            overpayment = Math.min(input.overpaymentLumpSum, balance - principal);
            if (overpayment < 0) overpayment = 0;
          }
        }
      }

      // Standard amortisation: the principal portion of the payment reduces
      // the outstanding balance. Interest doesn't get added back in here —
      // it was already paid as part of `payment` (interest + principal).
      // (Holiday months are handled separately above where interest IS
      // capitalised onto the balance.)
      balance = openingBalance - principal - overpayment;
      if (balance < 0) balance = 0;

      // If overpayment reduces payment (not term), recalculate monthly payment
      if (overpayment > 0 && input.overpaymentReduces === 'payment') {
        const remaining = totalMonths - m - 1;
        if (remaining > 0) {
          const curRate = getMonthlyRate(input, m + 1);
          monthlyPayment = calcAnnuityPayment(balance, curRate, remaining);
        }
      }
    }

    const periodDate = new Date(startDate);
    periodDate.setMonth(periodDate.getMonth() + m);

    cumulativeInterest += isHoliday ? interestCharge : interestCharge;
    if (!isHoliday) cumulativePrincipal += principal + overpayment;

    const rentalIncome = (() => {
      if (!input.rentalStartYear || !input.monthlyRent) return 0;
      const year = Math.floor(m / 12) + 1;
      if (year < input.rentalStartYear) return 0;
      const inflation = input.annualRentInflation ?? 0;
      return input.monthlyRent * Math.pow(1 + inflation, year - input.rentalStartYear);
    })();

    const totalPayment = isHoliday ? 0 : payment + overpayment;

    periods.push({
      monthIndex: m,
      date: new Date(periodDate),
      openingBalance,
      interest: interestCharge,
      principalRepayment: isHoliday ? 0 : principal,
      overpayment,
      totalPayment,
      closingBalance: isHoliday ? balance : Math.max(0, balance),
      isGracePeriod: isGrace,
      isHolidayPeriod: isHoliday,
      isFixedPeriod: isFixed,
      cumulativeInterest,
      cumulativePrincipal,
      rentalIncome,
    });

    if (m === 0) firstPayment = totalPayment;
  }

  // Final-payment guard — if rounding (or a high-rate scenario where the
  // recomputed annuity left a residue) leaves a tiny balance, fold it into
  // the last payment so the principal is always fully repaid by maturity.
  if (balance > 0.01 && periods.length > 0) {
    const last = periods[periods.length - 1];
    last.principalRepayment += balance;
    last.totalPayment += balance;
    last.closingBalance = 0;
    cumulativePrincipal += balance;
    last.cumulativePrincipal = cumulativePrincipal;
    balance = 0;
  }

  const totalInterestPaid = periods.reduce((s, p) => s + p.interest, 0);
  const totalAmountPaid = periods.reduce((s, p) => s + p.totalPayment, 0);
  const avgPayment = periods.length > 0 ? totalAmountPaid / periods.filter(p => p.totalPayment > 0).length : 0;

  // Effective annual rate approximation
  const effectiveAnnualRate = computeEffectiveRate(loanAmount, periods);

  const cashbackClawbackRisk = (() => {
    if (!cashbackPercent || !input.cashbackClawbackYears || !input.exitYear) return 0;
    if (input.exitYear >= input.cashbackClawbackYears) return 0;
    return cashbackReceived * (1 - input.exitYear / input.cashbackClawbackYears);
  })();

  const exitEquity = computeExitEquity(input, periods);

  return {
    id: input.id,
    lenderName: input.lenderName,
    loanAmount,
    firstMonthlyPayment: firstPayment,
    averageMonthlyPayment: avgPayment,
    totalInterestPaid,
    totalAmountPaid,
    effectiveAnnualRate,
    cashbackReceived,
    cashbackClawbackRisk,
    actualRepaymentPeriodMonths: actualMonths,
    exitEquity,
    periods,
  };
}

function computeEffectiveRate(principal: number, periods: MonthlyPeriod[]): number {
  // Approximate XIRR using total interest vs principal
  if (principal <= 0) return 0;
  const totalInterest = periods.reduce((s, p) => s + p.interest, 0);
  const years = periods.length / 12;
  if (years <= 0) return 0;
  return totalInterest / (principal * years);
}

function computeExitEquity(input: ScenarioInput, periods: MonthlyPeriod[]): number | undefined {
  if (!input.exitYear) return undefined;
  const exitMonth = input.exitYear * 12 - 1;
  if (exitMonth >= periods.length) return undefined;

  const period = periods[exitMonth];
  const appreciation = input.annualPropertyAppreciation ?? 0;
  const propertyValue = input.housePrice * Math.pow(1 + appreciation, input.exitYear);
  const remainingBalance = period.closingBalance;
  const support = input.govtSupportAmount ?? 0;

  return propertyValue - remainingBalance - support;
}

function runSplitRate(input: ScenarioInput, startDate: Date): ScenarioResult {
  const fixedProportion = input.splitFixedProportion ?? 0.7;
  const variableProportion = input.splitVariableProportion ?? (1 - fixedProportion);
  const loanAmount = calcLoanAmount(input);

  const fixedLoan = loanAmount * fixedProportion;
  const variableLoan = loanAmount * variableProportion;

  const fixedInput: ScenarioInput = {
    ...input,
    id: input.id + '_f',
    rateStructure: 'fixed',
    housePrice: fixedLoan / input.loanToValue,
    otherFees: 0,
    otherFeesCoveredByDebt: false,
    govtSupportAmount: 0,
    cashbackPercent: undefined,
    overpaymentLumpSum: undefined,
  };

  const variableInput: ScenarioInput = {
    ...input,
    id: input.id + '_v',
    rateStructure: 'tracker',
    housePrice: variableLoan / input.loanToValue,
    otherFees: 0,
    otherFeesCoveredByDebt: false,
    govtSupportAmount: 0,
    cashbackPercent: undefined,
    overpaymentLumpSum: undefined,
    fixedRate: undefined,
    fixedPeriodYears: undefined,
  };

  const fixedResult = runAmortisation(fixedInput, startDate);
  const variableResult = runAmortisation(variableInput, startDate);

  // Merge periods
  const maxLen = Math.max(fixedResult.periods.length, variableResult.periods.length);
  const periods: MonthlyPeriod[] = [];
  let cumInt = 0;
  let cumPrinc = 0;

  for (let i = 0; i < maxLen; i++) {
    const fp = fixedResult.periods[i];
    const vp = variableResult.periods[i];
    const interest = (fp?.interest ?? 0) + (vp?.interest ?? 0);
    const principal = (fp?.principalRepayment ?? 0) + (vp?.principalRepayment ?? 0);
    const overpayment = (fp?.overpayment ?? 0) + (vp?.overpayment ?? 0);
    const totalPayment = (fp?.totalPayment ?? 0) + (vp?.totalPayment ?? 0);
    cumInt += interest;
    cumPrinc += principal + overpayment;

    periods.push({
      monthIndex: i,
      date: fp?.date ?? vp?.date ?? new Date(),
      openingBalance: (fp?.openingBalance ?? 0) + (vp?.openingBalance ?? 0),
      interest,
      principalRepayment: principal,
      overpayment,
      totalPayment,
      closingBalance: (fp?.closingBalance ?? 0) + (vp?.closingBalance ?? 0),
      isGracePeriod: (fp?.isGracePeriod ?? false) || (vp?.isGracePeriod ?? false),
      isHolidayPeriod: (fp?.isHolidayPeriod ?? false) || (vp?.isHolidayPeriod ?? false),
      isFixedPeriod: fp?.isFixedPeriod ?? false,
      cumulativeInterest: cumInt,
      cumulativePrincipal: cumPrinc,
      rentalIncome: (fp?.rentalIncome ?? 0) + (vp?.rentalIncome ?? 0),
    });
  }

  const cashbackReceived = loanAmount * (input.cashbackPercent ?? 0);
  const totalInterestPaid = periods.reduce((s, p) => s + p.interest, 0);
  const totalAmountPaid = periods.reduce((s, p) => s + p.totalPayment, 0);
  const paidPeriods = periods.filter(p => p.totalPayment > 0);
  const avgPayment = paidPeriods.length > 0 ? totalAmountPaid / paidPeriods.length : 0;

  return {
    id: input.id,
    lenderName: input.lenderName,
    loanAmount,
    firstMonthlyPayment: periods[0]?.totalPayment ?? 0,
    averageMonthlyPayment: avgPayment,
    totalInterestPaid,
    totalAmountPaid,
    effectiveAnnualRate: computeEffectiveRate(loanAmount, periods),
    cashbackReceived,
    cashbackClawbackRisk: 0,
    actualRepaymentPeriodMonths: periods.length,
    exitEquity: computeExitEquity(input, periods),
    periods,
  };
}
