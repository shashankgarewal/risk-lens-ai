export type ScreenId =
  | 'company-selection'
  | 'data-ingestion'
  | 'risk-assessment'
  | 'scenario-explorer'
  | 'final-report';

export interface FinancialYearData {
  year: string; // e.g. "FY2021", "FY2022", "FY2023"
  revenue: number;
  ebitda: number;
  ebit: number;
  interestExpense: number;
  totalDebt: number;
  cashAndEquivalents: number;
  currentAssets: number;
  currentLiabilities: number;
  totalEquity: number;
  operatingCashFlow: number;
  capEx: number;
  provenance?: {
    [key: string]: string;
  };
  notes?: {
    [key: string]: string;
  };
}

export interface CompanyProfile {
  id: string;
  name: string;
  shortName: string;
  ticker: string;
  sector: string;
  isSynthetic: boolean;
  scorecardId: string;
  description: string;
  profileSummary: string;
  isin?: string;
  cik?: string;
  completeness: number; // percentage, e.g. 100
  riskTag: string; // e.g. "Prime Grade", "Moderate leverage", "High leverage", "Elevated debt"
  assignedRating: string; // e.g. "BBB+", "AA-", "B+", "CCC"
  ratingOutlook: string; // e.g. "Stable", "Positive", "Negative", "Watchlist"
  primarySource: string;
  auditor: string;
  recommendedFacilityLimit: string;
  statements: {
    [year: string]: FinancialYearData;
  };
  periods: string[]; // ["FY2021", "FY2022", "FY2023"]
  warnings: string[];
}

export interface CalculatedRatios {
  debtToEquity: number | null;
  debtToEbitda: number | null;
  netDebtToEbitda: number | null;
  interestCoverage: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  ebitdaMargin: number | null;
  ocfToTotalDebt: number | null;
  netDebt: number;
  freeCashFlow: number;
  flags: {
    negativeEquity: boolean;
    negativeEbitda: boolean;
    zeroInterest: boolean;
    zeroLiabilities: boolean;
  };
}

export interface RiskFactorContribution {
  name: string;
  metricLabel: string;
  valueDisplay: string;
  benchmarkDisplay: string;
  impactPercent: number; // e.g. 34 (meaning +34% impact on risk score)
  direction: 'risk_increasing' | 'risk_mitigating';
  category: 'leverage' | 'coverage' | 'liquidity' | 'cash_flow' | 'profitability';
  explanation: string;
}

export interface RiskAssessmentResult {
  score: number; // 0 to 100
  riskCategory: 'Low' | 'Moderate' | 'High';
  ratingLabel: string;
  ratingGrade: string; // e.g. "B+ / WATCHLIST"
  confidencePercent: number;
  ratios: CalculatedRatios;
  historicalRatios: {
    [year: string]: CalculatedRatios;
  };
  drivers: RiskFactorContribution[];
  mitigatingFactors: RiskFactorContribution[];
  topRecommendations: {
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    actionType: 'assign' | 'simulate' | 'audit';
  }[];
  dataQuality: {
    requiredFieldsCount: number;
    availableFieldsCount: number;
    completenessPercent: number;
    warnings: string[];
    reconciled: boolean;
  };
}

export interface ScenarioParameters {
  revenueGrowthPct: number; // e.g. 4.2 (-20 to +20)
  ebitdaMarginShiftPct: number; // e.g. -1.5 (-5 to +5)
  interestRateShockBps: number; // e.g. 175 (0 to 300)
  capExAdjustmentPct: number; // e.g. -10 (-40 to +50)
}

export interface ScenarioSimulationResult {
  baselineScore: number;
  scenarioScore: number;
  scoreDelta: number;
  baselineICR: number;
  scenarioICR: number;
  icrDelta: number;
  baselineLeverage: number;
  scenarioLeverage: number;
  leverageDelta: number;
  baselineRunwayMonths: number;
  scenarioRunwayMonths: number;
  runwayDelta: number;
  simulatedRatios: CalculatedRatios;
  simulatedRevenue: number;
  simulatedEbitda: number;
  simulatedEbit: number;
  simulatedInterestExpense: number;
  simulatedFreeCashFlow: number;
  narrativeTitle: string;
  narrativeDescription: string;
  statusSeverity: 'normal' | 'warning' | 'critical';
  projectedFCFQuarters: {
    period: string;
    value: number;
    isSimulated: boolean;
  }[];
}
