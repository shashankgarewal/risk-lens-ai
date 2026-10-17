import { CompanyProfile, ScenarioParameters, ScenarioSimulationResult } from '../types';
import { calculateFinancialRatios } from './financialEngine';
import { assessCompanyRisk } from './riskScoringEngine';

export function runScenarioSimulation(
  company: CompanyProfile,
  params: ScenarioParameters
): ScenarioSimulationResult {
  const periods = company.periods;
  const latestPeriod = periods[periods.length - 1] || 'FY2023';
  const baseData = company.statements[latestPeriod];

  // Baseline assessment
  const baselineAssessment = assessCompanyRisk(company);
  const baselineRatios = baselineAssessment.ratios;

  const baselineScore = baselineAssessment.score;
  const baselineICR = baselineRatios.interestCoverage ?? 4.5;
  const baselineLeverage = baselineRatios.debtToEbitda ?? 2.6;

  // Approximate baseline runway in months
  const baselineAnnualBurn = Math.max(
    baseData.interestExpense + baseData.capEx * 0.5,
    Math.abs(Math.min(0, baseData.operatingCashFlow - baseData.capEx)) + baseData.interestExpense
  );
  const baselineRunwayMonths = Math.min(
    36,
    Math.max(
      3,
      Math.round(((baseData.cashAndEquivalents + baseData.revenue * 0.05) / (baselineAnnualBurn / 12)) * 10) / 10
    )
  );

  // 1. Calculate simulated revenue
  const simulatedRevenue = baseData.revenue * (1 + params.revenueGrowthPct / 100);

  // 2. Calculate simulated EBITDA & margin
  const baseMargin = baseData.ebitda / baseData.revenue;
  const simulatedMargin = Math.max(0.02, baseMargin + params.ebitdaMarginShiftPct / 100);
  const simulatedEbitda = simulatedRevenue * simulatedMargin;

  // 3. Simulated EBIT (preserving depreciation baseline)
  const baseDeprec = Math.max(0, baseData.ebitda - baseData.ebit);
  const simulatedEbit = Math.max(1, simulatedEbitda - baseDeprec);

  // 4. Rate shock on interest expense
  const rateShockDecimal = params.interestRateShockBps / 10000;
  const addedInterest = baseData.totalDebt * rateShockDecimal * 0.6; // assuming ~60% floating or refinancing portion
  const simulatedInterestExpense = baseData.interestExpense + addedInterest;

  // 5. CapEx adjustments
  const simulatedCapEx = Math.max(0, baseData.capEx * (1 + params.capExAdjustmentPct / 100));

  // 6. Operating Cash Flow simulation
  const ebitdaDelta = simulatedEbitda - baseData.ebitda;
  const simulatedOCF = Math.max(
    0,
    baseData.operatingCashFlow + ebitdaDelta * 0.72 - addedInterest
  );

  const simulatedFreeCashFlow = simulatedOCF - simulatedCapEx;

  // Build simulated financial statement snapshot
  const simulatedData = {
    ...baseData,
    revenue: simulatedRevenue,
    ebitda: simulatedEbitda,
    ebit: simulatedEbit,
    interestExpense: simulatedInterestExpense,
    capEx: simulatedCapEx,
    operatingCashFlow: simulatedOCF,
  };

  const simulatedRatios = calculateFinancialRatios(simulatedData);
  const scenarioAssessment = assessCompanyRisk(company, simulatedData);

  const scenarioScore = scenarioAssessment.score;
  const scoreDelta = Math.round((scenarioScore - baselineScore) * 10) / 10;

  const scenarioICR = simulatedRatios.interestCoverage ?? 1.0;
  const icrDelta = Math.round((scenarioICR - baselineICR) * 100) / 100;

  const scenarioLeverage = simulatedRatios.debtToEbitda ?? 4.0;
  const leverageDelta = Math.round((scenarioLeverage - baselineLeverage) * 100) / 100;

  // Simulated liquidity runway in months
  const simulatedMonthlyBurn = Math.max(1, (simulatedInterestExpense + simulatedCapEx * 0.4) / 12);
  const scenarioRunwayMonths = Math.min(
    36,
    Math.max(
      2,
      Math.round(((baseData.cashAndEquivalents + (simulatedFreeCashFlow > 0 ? simulatedFreeCashFlow * 0.4 : 0)) / simulatedMonthlyBurn) * 10) / 10
    )
  );
  const runwayDelta = Math.round((scenarioRunwayMonths - baselineRunwayMonths) * 10) / 10;

  // Dynamic narrative generation
  let narrativeTitle = 'Stable Capital Posture';
  let narrativeDescription =
    'Assumptions remain within safe covenant thresholds. Debt service and cash runway are well protected.';
  let statusSeverity: 'normal' | 'warning' | 'critical' = 'normal';

  if (scenarioScore > 65 || scenarioICR < 2.0 || scenarioRunwayMonths < 8) {
    statusSeverity = 'critical';
    narrativeTitle = 'Critical Covenant & Liquidity Alert';
    narrativeDescription = `Severe stress parameters pushed Interest Coverage to ${scenarioICR.toFixed(
      2
    )}x and reduced liquidity runway to ${scenarioRunwayMonths.toFixed(
      1
    )} months. Immediate covenant waiver or emergency liquidity facility required.`;
  } else if (scenarioScore > 48 || scenarioICR < 3.0 || scoreDelta > 6) {
    statusSeverity = 'warning';
    narrativeTitle = 'Elevated Watchlist Warning';
    narrativeDescription = `Combination of rate shock (+${params.interestRateShockBps} bps) and margin pressure (${params.ebitdaMarginShiftPct >= 0 ? '+' : ''}${params.ebitdaMarginShiftPct.toFixed(1)}%) compresses debt service buffer. Review working capital facilities.`;
  } else if (scoreDelta < -3) {
    narrativeTitle = 'Deleveraging & Credit Expansion';
    narrativeDescription = `Top-line growth and margin expansion increase free cash flow generation by ${Math.round(
      simulatedFreeCashFlow - (baseData.operatingCashFlow - baseData.capEx)
    )}M, accelerating balance sheet de-risking.`;
  }

  // Quarterly FCF projections for trajectory chart
  const baseQuarterFCF = (baseData.operatingCashFlow - baseData.capEx) / 4;
  const simQuarterFCF = simulatedFreeCashFlow / 4;
  const projectedFCFQuarters = [
    { period: 'Q1 (Base)', value: Math.round(baseQuarterFCF * 10) / 10, isSimulated: false },
    {
      period: 'Q2 (Sim)',
      value: Math.round((baseQuarterFCF * 0.7 + simQuarterFCF * 0.3) * 10) / 10,
      isSimulated: true,
    },
    {
      period: 'Q3 (Sim)',
      value: Math.round((baseQuarterFCF * 0.3 + simQuarterFCF * 0.7) * 10) / 10,
      isSimulated: true,
    },
    { period: 'Q4 (Sim)', value: Math.round(simQuarterFCF * 10) / 10, isSimulated: true },
    { period: 'FY25E', value: Math.round(simulatedFreeCashFlow * 1.05 * 10) / 10, isSimulated: true },
  ];

  return {
    baselineScore,
    scenarioScore,
    scoreDelta,
    baselineICR,
    scenarioICR,
    icrDelta,
    baselineLeverage,
    scenarioLeverage,
    leverageDelta,
    baselineRunwayMonths,
    scenarioRunwayMonths,
    runwayDelta,
    simulatedRatios,
    simulatedRevenue,
    simulatedEbitda,
    simulatedEbit,
    simulatedInterestExpense,
    simulatedFreeCashFlow,
    narrativeTitle,
    narrativeDescription,
    statusSeverity,
    projectedFCFQuarters,
  };
}
