import { FinancialYearData, CalculatedRatios } from '../types';

/**
 * Deterministic Financial Ratio Calculation Engine
 * Adheres strictly to institutional corporate credit analysis standards.
 */
export function calculateFinancialRatios(data: FinancialYearData): CalculatedRatios {
  const {
    revenue,
    ebitda,
    ebit,
    interestExpense,
    totalDebt,
    cashAndEquivalents,
    currentAssets,
    currentLiabilities,
    totalEquity,
    operatingCashFlow,
    capEx,
  } = data;

  const flags = {
    negativeEquity: totalEquity <= 0,
    negativeEbitda: ebitda <= 0,
    zeroInterest: interestExpense <= 0,
    zeroLiabilities: currentLiabilities <= 0,
  };

  // Debt-to-Equity
  let debtToEquity: number | null = null;
  if (totalEquity > 0) {
    debtToEquity = totalDebt / totalEquity;
  }

  // Debt-to-EBITDA
  let debtToEbitda: number | null = null;
  if (ebitda > 0) {
    debtToEbitda = totalDebt / ebitda;
  }

  // Net Debt
  const netDebt = totalDebt - cashAndEquivalents;

  // Net Debt to EBITDA
  let netDebtToEbitda: number | null = null;
  if (ebitda > 0) {
    netDebtToEbitda = netDebt / ebitda;
  }

  // Interest Coverage Ratio = EBIT / Interest Expense
  let interestCoverage: number | null = null;
  if (interestExpense > 0) {
    interestCoverage = ebit / interestExpense;
  }

  // Current Ratio = Current Assets / Current Liabilities
  let currentRatio: number | null = null;
  if (currentLiabilities > 0) {
    currentRatio = currentAssets / currentLiabilities;
  }

  // Quick Ratio (Acid-Test) = (Current Assets - estimated inventory portion ~25%) / Current Liabilities
  // Or approximate using Cash & Liquid equivalents
  let quickRatio: number | null = null;
  if (currentLiabilities > 0) {
    const liquidAssets = cashAndEquivalents + Math.max(0, currentAssets - cashAndEquivalents) * 0.65;
    quickRatio = liquidAssets / currentLiabilities;
  }

  // EBITDA Margin = EBITDA / Revenue
  let ebitdaMargin: number | null = null;
  if (revenue > 0) {
    ebitdaMargin = (ebitda / revenue) * 100;
  }

  // Operating Cash Flow to Total Debt
  let ocfToTotalDebt: number | null = null;
  if (totalDebt > 0) {
    ocfToTotalDebt = (operatingCashFlow / totalDebt) * 100;
  }

  // Free Cash Flow = Operating Cash Flow - CapEx
  const freeCashFlow = operatingCashFlow - capEx;

  return {
    debtToEquity,
    debtToEbitda,
    netDebtToEbitda,
    interestCoverage,
    currentRatio,
    quickRatio,
    ebitdaMargin,
    ocfToTotalDebt,
    netDebt,
    freeCashFlow,
    flags,
  };
}

/**
 * Format helper for numerical displays
 */
export function formatMultiple(val: number | null, suffix: string = 'x'): string {
  if (val === null || isNaN(val)) return 'N/A';
  return `${val.toFixed(2)}${suffix}`;
}

export function formatPercent(val: number | null): string {
  if (val === null || isNaN(val)) return 'N/A';
  return `${val.toFixed(1)}%`;
}

export function formatCurrencyM(val: number | null): string {
  if (val === null || isNaN(val)) return 'N/A';
  if (Math.abs(val) >= 1000) {
    return `$${(val / 1000).toFixed(2)}B`;
  }
  return `$${val.toFixed(1)}M`;
}
