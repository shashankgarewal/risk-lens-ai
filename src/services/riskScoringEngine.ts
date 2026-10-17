import {
  CompanyProfile,
  FinancialYearData,
  RiskAssessmentResult,
  RiskFactorContribution,
  CalculatedRatios,
} from '../types';
import { calculateFinancialRatios, formatMultiple, formatPercent, formatCurrencyM } from './financialEngine';

/**
 * Scorecard Weightings & Thresholds
 * Transparent, deterministic credit scorecard methodology.
 */
export const SCORECARD_CONFIG = {
  weights: {
    leverage: 0.28,       // Debt-to-EBITDA
    coverage: 0.26,       // Interest Coverage
    liquidity: 0.16,      // Current Ratio
    cashFlowToDebt: 0.16, // OCF to Total Debt
    margin: 0.14,         // EBITDA Margin
  },
  thresholds: {
    debtToEbitda: {
      low: 2.2,     // <= 2.2x is prime (0-25 risk subscore)
      target: 3.0,  // benchmark
      high: 4.5,    // >= 4.5x is elevated risk (75-100 risk subscore)
    },
    interestCoverage: {
      high: 5.0,    // >= 5.0x is robust (0-20 risk subscore)
      target: 2.5,  // benchmark
      low: 1.5,     // <= 1.5x is critical danger (80-100 risk subscore)
    },
    currentRatio: {
      high: 1.5,    // >= 1.5x is strong liquidity
      target: 1.3,
      low: 1.0,     // < 1.0x indicates working capital deficit
    },
    ocfToDebt: {
      high: 40.0,   // >= 40% OCF/Debt is excellent cash amortization
      target: 25.0,
      low: 10.0,    // <= 10% is severe repayment drag
    },
    ebitdaMargin: {
      high: 25.0,   // >= 25% is high pricing power
      target: 15.0,
      low: 8.0,     // < 8% is thin buffer against cost shocks
    },
  },
};

/**
 * Normalizes a metric into a subscore from 0 (safest) to 100 (highest risk)
 */
function computeSubscores(ratios: CalculatedRatios) {
  // 1. Leverage Subscore (Debt-to-EBITDA)
  let leverageScore = 50;
  if (ratios.debtToEbitda !== null) {
    if (ratios.debtToEbitda <= 1.0) leverageScore = 5;
    else if (ratios.debtToEbitda <= 2.0) leverageScore = 15 + (ratios.debtToEbitda - 1.0) * 15;
    else if (ratios.debtToEbitda <= 3.0) leverageScore = 30 + (ratios.debtToEbitda - 2.0) * 20;
    else if (ratios.debtToEbitda <= 4.5) leverageScore = 50 + ((ratios.debtToEbitda - 3.0) / 1.5) * 35;
    else leverageScore = Math.min(100, 85 + (ratios.debtToEbitda - 4.5) * 5);
  } else if (ratios.flags.negativeEbitda) {
    leverageScore = 95;
  }

  // 2. Coverage Subscore (Interest Coverage: inverse metric)
  let coverageScore = 50;
  if (ratios.interestCoverage !== null) {
    if (ratios.interestCoverage >= 8.0) coverageScore = 5;
    else if (ratios.interestCoverage >= 5.0) coverageScore = 15;
    else if (ratios.interestCoverage >= 3.0) coverageScore = 30 + (5.0 - ratios.interestCoverage) * 10;
    else if (ratios.interestCoverage >= 1.5) coverageScore = 50 + ((3.0 - ratios.interestCoverage) / 1.5) * 35;
    else coverageScore = Math.min(100, 85 + (1.5 - Math.max(0, ratios.interestCoverage)) * 20);
  } else if (ratios.flags.zeroInterest) {
    coverageScore = 10; // no debt interest burden
  }

  // 3. Liquidity Subscore (Current Ratio: inverse metric)
  let liquidityScore = 50;
  if (ratios.currentRatio !== null) {
    if (ratios.currentRatio >= 2.0) liquidityScore = 10;
    else if (ratios.currentRatio >= 1.5) liquidityScore = 20;
    else if (ratios.currentRatio >= 1.2) liquidityScore = 35 + (1.5 - ratios.currentRatio) * 40;
    else if (ratios.currentRatio >= 1.0) liquidityScore = 50 + (1.2 - ratios.currentRatio) * 120;
    else liquidityScore = Math.min(100, 75 + (1.0 - Math.max(0.2, ratios.currentRatio)) * 40);
  }

  // 4. Cash Flow to Debt Subscore (inverse metric)
  let cashFlowScore = 50;
  if (ratios.ocfToTotalDebt !== null) {
    if (ratios.ocfToTotalDebt >= 50) cashFlowScore = 8;
    else if (ratios.ocfToTotalDebt >= 35) cashFlowScore = 20;
    else if (ratios.ocfToTotalDebt >= 20) cashFlowScore = 40 + ((35 - ratios.ocfToTotalDebt) / 15) * 20;
    else if (ratios.ocfToTotalDebt >= 10) cashFlowScore = 60 + ((20 - ratios.ocfToTotalDebt) / 10) * 25;
    else cashFlowScore = Math.min(100, 85 + (10 - Math.max(0, ratios.ocfToTotalDebt)) * 1.5);
  }

  // 5. Margin Subscore (EBITDA Margin: inverse metric)
  let marginScore = 50;
  if (ratios.ebitdaMargin !== null) {
    if (ratios.ebitdaMargin >= 30) marginScore = 10;
    else if (ratios.ebitdaMargin >= 20) marginScore = 25;
    else if (ratios.ebitdaMargin >= 12) marginScore = 45 + ((20 - ratios.ebitdaMargin) / 8) * 20;
    else if (ratios.ebitdaMargin >= 6) marginScore = 65 + ((12 - ratios.ebitdaMargin) / 6) * 20;
    else marginScore = Math.min(100, 85 + (6 - Math.max(0, ratios.ebitdaMargin)) * 2.5);
  }

  return {
    leverageScore,
    coverageScore,
    liquidityScore,
    cashFlowScore,
    marginScore,
  };
}

/**
 * Evaluates corporate credit risk using deterministic weighted scorecard
 */
export function assessCompanyRisk(
  company: CompanyProfile,
  customLatestData?: FinancialYearData
): RiskAssessmentResult {
  const periods = company.periods;
  const latestPeriod = periods[periods.length - 1] || 'FY2023';
  const latestData = customLatestData || company.statements[latestPeriod];

  // Calculate ratios for all historical periods
  const historicalRatios: { [year: string]: CalculatedRatios } = {};
  for (const p of periods) {
    const pData = p === latestPeriod && customLatestData ? customLatestData : company.statements[p];
    if (pData) {
      historicalRatios[p] = calculateFinancialRatios(pData);
    }
  }

  const latestRatios = calculateFinancialRatios(latestData);
  const subscores = computeSubscores(latestRatios);
  const { weights } = SCORECARD_CONFIG;

  // Composite Score
  const rawScore =
    subscores.leverageScore * weights.leverage +
    subscores.coverageScore * weights.coverage +
    subscores.liquidityScore * weights.liquidity +
    subscores.cashFlowScore * weights.cashFlowToDebt +
    subscores.marginScore * weights.margin;

  const score = Math.round(Math.max(5, Math.min(98, rawScore)) * 10) / 10;

  // Categorization
  let riskCategory: 'Low' | 'Moderate' | 'High' = 'Moderate';
  let ratingLabel = 'Investment Grade';
  let ratingGrade = 'BBB+ / STABLE';

  if (score <= 35) {
    riskCategory = 'Low';
    ratingLabel = 'Prime Grade';
    ratingGrade = score <= 20 ? 'AAA / PRIME' : 'AA- / STABLE';
  } else if (score <= 65) {
    riskCategory = 'Moderate';
    ratingLabel = 'Moderate Risk';
    ratingGrade = score <= 50 ? 'BBB+ / STABLE' : 'BB / WATCHLIST';
  } else {
    riskCategory = 'High';
    ratingLabel = 'Elevated Debt Risk';
    ratingGrade = score <= 78 ? 'B+ / WATCHLIST' : 'CCC / DISTRESSED';
  }

  // Generate explainable scorecard contributions
  const drivers: RiskFactorContribution[] = [];
  const mitigatingFactors: RiskFactorContribution[] = [];

  // 1. Leverage Evaluation
  if (latestRatios.debtToEbitda !== null) {
    if (latestRatios.debtToEbitda > 3.0) {
      const impact = Math.round(Math.min(45, (latestRatios.debtToEbitda / 3.0 - 1) * 35 + 15));
      drivers.push({
        name: 'Elevated Leverage Capacity',
        metricLabel: 'Total Debt / EBITDA',
        valueDisplay: formatMultiple(latestRatios.debtToEbitda),
        benchmarkDisplay: '< 3.0x',
        impactPercent: impact,
        direction: 'risk_increasing',
        category: 'leverage',
        explanation: `Total Debt to EBITDA of ${formatMultiple(latestRatios.debtToEbitda)} exceeds institutional benchmark of 3.0x, compressing refinancing flexibility.`,
      });
    } else {
      mitigatingFactors.push({
        name: 'Conservative Leverage Headroom',
        metricLabel: 'Total Debt / EBITDA',
        valueDisplay: formatMultiple(latestRatios.debtToEbitda),
        benchmarkDisplay: '< 3.0x',
        impactPercent: Math.round(Math.max(10, (1 - latestRatios.debtToEbitda / 3.0) * 30)),
        direction: 'risk_mitigating',
        category: 'leverage',
        explanation: `Prudent leverage at ${formatMultiple(latestRatios.debtToEbitda)} provides substantial borrowing headroom below standard covenant ceilings.`,
      });
    }
  }

  // 2. Interest Coverage Evaluation
  if (latestRatios.interestCoverage !== null) {
    if (latestRatios.interestCoverage < 2.5) {
      const impact = Math.round(Math.min(40, (1 - latestRatios.interestCoverage / 2.5) * 35 + 12));
      drivers.push({
        name: 'Weak Interest Coverage Buffer',
        metricLabel: 'Interest Coverage Ratio',
        valueDisplay: formatMultiple(latestRatios.interestCoverage),
        benchmarkDisplay: '> 2.5x',
        impactPercent: impact,
        direction: 'risk_increasing',
        category: 'coverage',
        explanation: `Interest Coverage at ${formatMultiple(latestRatios.interestCoverage)} indicates limited earnings cushion against benchmark policy rate increases.`,
      });
    } else {
      mitigatingFactors.push({
        name: 'Robust Debt Service Coverage',
        metricLabel: 'Interest Coverage Ratio',
        valueDisplay: formatMultiple(latestRatios.interestCoverage),
        benchmarkDisplay: '> 2.5x',
        impactPercent: Math.round(Math.min(35, (latestRatios.interestCoverage / 5.0) * 25)),
        direction: 'risk_mitigating',
        category: 'coverage',
        explanation: `Operating earnings (EBIT) cover annual debt service by ${formatMultiple(latestRatios.interestCoverage)}, protecting against covenant stress.`,
      });
    }
  }

  // 3. Margin & Profitability Evaluation
  if (latestRatios.ebitdaMargin !== null) {
    if (latestRatios.ebitdaMargin < 12.0) {
      drivers.push({
        name: 'Declining EBITDA Margins',
        metricLabel: 'EBITDA Margin',
        valueDisplay: formatPercent(latestRatios.ebitdaMargin),
        benchmarkDisplay: '> 15.0%',
        impactPercent: 28,
        direction: 'risk_increasing',
        category: 'profitability',
        explanation: `Operating margin of ${formatPercent(latestRatios.ebitdaMargin)} reflects input cost pressures and compressed margin defense.`,
      });
    } else {
      mitigatingFactors.push({
        name: 'Healthy Operating Profitability',
        metricLabel: 'EBITDA Margin',
        valueDisplay: formatPercent(latestRatios.ebitdaMargin),
        benchmarkDisplay: '> 15.0%',
        impactPercent: 20,
        direction: 'risk_mitigating',
        category: 'profitability',
        explanation: `EBITDA Margin of ${formatPercent(latestRatios.ebitdaMargin)} demonstrates resilient product pricing power.`,
      });
    }
  }

  // 4. Liquidity & Current Ratio Evaluation
  if (latestRatios.currentRatio !== null) {
    if (latestRatios.currentRatio < 1.2) {
      drivers.push({
        name: 'Working Capital & Liquidity Drag',
        metricLabel: 'Current Ratio',
        valueDisplay: formatMultiple(latestRatios.currentRatio),
        benchmarkDisplay: '> 1.3x',
        impactPercent: 18,
        direction: 'risk_increasing',
        category: 'liquidity',
        explanation: `Current assets of ${formatCurrencyM(latestData.currentAssets)} vs liabilities of ${formatCurrencyM(latestData.currentLiabilities)} indicate tight short-term buffer.`,
      });
    } else {
      mitigatingFactors.push({
        name: 'Comfortable Working Capital Buffer',
        metricLabel: 'Current Ratio',
        valueDisplay: formatMultiple(latestRatios.currentRatio),
        benchmarkDisplay: '> 1.3x',
        impactPercent: 16,
        direction: 'risk_mitigating',
        category: 'liquidity',
        explanation: `Current ratio of ${formatMultiple(latestRatios.currentRatio)} provides ample buffer for rolling short-term operating commitments.`,
      });
    }
  }

  // 5. Cash Flow generation
  if (latestRatios.freeCashFlow < 0) {
    drivers.push({
      name: 'Negative Free Cash Flow Drain',
      metricLabel: 'Free Cash Flow (OCF - CapEx)',
      valueDisplay: formatCurrencyM(latestRatios.freeCashFlow),
      benchmarkDisplay: '> $0.0M',
      impactPercent: 22,
      direction: 'risk_increasing',
      category: 'cash_flow',
      explanation: `CapEx of ${formatCurrencyM(latestData.capEx)} outstripped operating cash flow, requiring external debt or cash reserves to fund growth.`,
    });
  } else {
    mitigatingFactors.push({
      name: 'Positive Organic Free Cash Flow',
      metricLabel: 'Free Cash Flow',
      valueDisplay: formatCurrencyM(latestRatios.freeCashFlow),
      benchmarkDisplay: '> $0.0M',
      impactPercent: 18,
      direction: 'risk_mitigating',
      category: 'cash_flow',
      explanation: `Organic free cash flow generation of ${formatCurrencyM(latestRatios.freeCashFlow)} supports self-funded debt service and capital expenditures.`,
    });
  }

  // Rule-based actionable analyst recommendations
  const topRecommendations = [];
  if (score > 60 || (latestRatios.debtToEbitda && latestRatios.debtToEbitda > 3.5)) {
    topRecommendations.push({
      id: 'rec-1',
      title: 'Verify debt refinancing term sheet status',
      description: 'Audit upcoming debt maturities within next 12-24 months and confirm committed bank refinancing facilities.',
      actionLabel: 'Assign',
      actionType: 'assign' as const,
    });
  }
  topRecommendations.push({
    id: 'rec-2',
    title: 'Stress test liquidity under 200 bps rate hike',
    description: 'Simulate the impact of monetary tightening on floating-rate debt service and interest coverage covenants.',
    actionLabel: 'Simulate',
    actionType: 'simulate' as const,
  });
  if (latestRatios.currentRatio && latestRatios.currentRatio < 1.25) {
    topRecommendations.push({
      id: 'rec-3',
      title: 'Audit working capital & inventory turnover cycles',
      description: 'Review accounts receivable aging and supplier payment terms to protect short-term cash conversion cycles.',
      actionLabel: 'Audit',
      actionType: 'audit' as const,
    });
  }

  return {
    score,
    riskCategory,
    ratingLabel,
    ratingGrade,
    confidencePercent: 94,
    ratios: latestRatios,
    historicalRatios,
    drivers: drivers.sort((a, b) => b.impactPercent - a.impactPercent),
    mitigatingFactors: mitigatingFactors.sort((a, b) => b.impactPercent - a.impactPercent),
    topRecommendations,
    dataQuality: {
      requiredFieldsCount: 11,
      availableFieldsCount: 11,
      completenessPercent: company.completeness,
      warnings: company.warnings,
      reconciled: true,
    },
  };
}
