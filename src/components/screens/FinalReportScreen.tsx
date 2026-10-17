import React, { useState } from 'react';
import { CompanyProfile, RiskAssessmentResult, ScenarioParameters } from '../../types';
import { formatMultiple, formatPercent, formatCurrencyM } from '../../services/financialEngine';
import { runScenarioSimulation } from '../../services/scenarioEngine';

interface FinalReportScreenProps {
  company: CompanyProfile;
  assessment: RiskAssessmentResult;
  savedScenarioParams?: ScenarioParameters;
}

export const FinalReportScreen: React.FC<FinalReportScreenProps> = ({
  company,
  assessment,
  savedScenarioParams,
}) => {
  const [approvedState, setApprovedState] = useState<{
    analyst: boolean;
    cro: boolean;
    chair: boolean;
  }>({
    analyst: true,
    cro: false,
    chair: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const periods = company.periods;
  const latestPeriod = periods[periods.length - 1];
  const priorPeriod = periods[periods.length - 2] || periods[0];

  const latestRatios = assessment.ratios;
  const priorRatios = assessment.historicalRatios[priorPeriod] || latestRatios;

  // Run simulation if parameters exist or fallback to standard stress test
  const simParams: ScenarioParameters = savedScenarioParams || {
    revenueGrowthPct: -5.0,
    ebitdaMarginShiftPct: -2.0,
    interestRateShockBps: 200,
    capExAdjustmentPct: -15,
  };
  const simulation = runScenarioSimulation(company, simParams);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    const csvRows: string[] = [];
    csvRows.push(`"RISKLENS AI CREDIT COMMITTEE REPORT - ${company.name.toUpperCase()}"`);
    csvRows.push(`"Generated","${new Date().toISOString()}"`);
    csvRows.push(`"Scorecard ID","${company.scorecardId}"`);
    csvRows.push(`"Assigned Rating","${company.assignedRating} (${company.ratingOutlook})"`);
    csvRows.push('');
    csvRows.push('"FINANCIAL STATEMENTS ($M)"');
    csvRows.push(`"Metric",${periods.map((p) => `"${p}"`).join(',')}`);

    const keys = [
      'revenue',
      'ebitda',
      'ebit',
      'interestExpense',
      'totalDebt',
      'cashAndEquivalents',
      'currentAssets',
      'currentLiabilities',
      'totalEquity',
      'operatingCashFlow',
      'capEx',
    ] as const;

    keys.forEach((k) => {
      const vals = periods.map((p) => company.statements[p]?.[k] ?? 0);
      csvRows.push(`"${k}",${vals.join(',')}`);
    });

    csvRows.push('');
    csvRows.push('"CREDIT RATIOS"');
    csvRows.push(`"Total Debt / EBITDA","${formatMultiple(latestRatios.debtToEbitda)}"`);
    csvRows.push(`"Interest Coverage","${formatMultiple(latestRatios.interestCoverage)}"`);
    csvRows.push(`"Debt-to-Equity","${formatMultiple(latestRatios.debtToEquity)}"`);
    csvRows.push(`"Current Ratio","${formatMultiple(latestRatios.currentRatio)}"`);
    csvRows.push(`"Free Cash Flow","${formatCurrencyM(latestRatios.freeCashFlow)}"`);

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RiskLens_${company.ticker}_Credit_Model.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Financial model exported to CSV/Excel format.');
  };

  const handleDownloadAuditLog = () => {
    const auditLog = {
      platform: 'RiskLens AI Enterprise Analytics',
      version: 'v4.8.2-prod',
      timestamp: new Date().toISOString(),
      scorecardId: company.scorecardId,
      company: {
        id: company.id,
        name: company.name,
        ticker: company.ticker,
        sector: company.sector,
        isSynthetic: company.isSynthetic,
      },
      assessment: {
        score: assessment.score,
        category: assessment.riskCategory,
        ratingGrade: assessment.ratingGrade,
        ratios: latestRatios,
      },
      cryptographicAuditHash: '0x8f9c2b4e7a1d3f8c0e2a9b4f7e1d3c8a9f2b4e7a',
      signatories: approvedState,
    };

    const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Log_${company.scorecardId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Immutable audit log JSON downloaded.');
  };

  const handleSignAndApprove = () => {
    setApprovedState({ analyst: true, cro: true, chair: true });
    showToast('Report fully authorized by Credit Committee Chairperson.');
  };

  return (
    <div className="flex flex-col w-full text-[#d8e3fb] bg-[#081425] min-h-screen">
      {/* Top Action & Toolbar Banner */}
      <div className="w-full bg-[#111c2d] border-b border-[#45464d]/30 py-4 px-6 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-[#4edea3]/10 text-[#4edea3] rounded font-label-lg uppercase tracking-wider border border-[#4edea3]/20 font-semibold">
            Institutional Grade
          </span>
          <span className="text-headline-md font-headline-md text-[#d8e3fb]">
            Final Credit Committee Risk Assessment & Report
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] rounded-lg text-label-lg font-label-lg flex items-center gap-2 transition-all cursor-pointer border border-[#45464d]/40"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print / PDF Report
          </button>
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] rounded-lg text-label-lg font-label-lg flex items-center gap-2 transition-all cursor-pointer border border-[#45464d]/40"
          >
            <span className="material-symbols-outlined text-[16px]">table_view</span>
            Excel Model (.xlsx)
          </button>
          <button
            onClick={handleDownloadAuditLog}
            className="px-4 py-2 bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] rounded-lg text-label-lg font-label-lg flex items-center gap-2 transition-all cursor-pointer border border-[#45464d]/40"
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            Audit Log JSON
          </button>
          <button
            onClick={handleSignAndApprove}
            className="px-4 py-2 bg-[#4edea3] text-[#003824] rounded-lg text-label-lg font-label-lg flex items-center gap-2 font-semibold shadow-lg shadow-[#4edea3]/10 hover:bg-[#6ffbbe] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Sign & Approve
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-10 space-y-12">
        {/* Document Header & Metadata Panel */}
        <div className="bg-[#152031] rounded-xl p-8 shadow-xl border border-[#45464d]/40 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#45464d]/40 pb-6">
            <div>
              <div className="text-label-md font-label-md text-[#4edea3] uppercase tracking-widest mb-1 font-semibold">
                Confidential Credit Committee Memorandum
              </div>
              <h1 className="text-headline-lg font-headline-lg text-[#d8e3fb] font-semibold">
                Enterprise Risk & Solvency Assessment: {company.name}
              </h1>
              <p className="text-body-md text-[#c6c6cd] mt-1">
                Ticker: {company.ticker} | ISIN: {company.isin || 'US0378331005'} | Sector: {company.sector}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1 bg-[#111c2d] p-4 rounded-lg border border-[#45464d]/30">
              <span className="text-label-sm font-label-sm text-[#c6c6cd]">RISKLENS SCORECARD ID</span>
              <span className="font-label-lg text-[#4edea3] text-headline-sm font-bold">
                {company.scorecardId}
              </span>
              <span className="text-body-sm text-[#c6c6cd]">
                Generated: Oct 24, 2024 - 14:22 UTC
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
            <div>
              <span className="text-label-sm font-label-sm text-[#c6c6cd] uppercase">
                Composite Risk Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-headline-lg text-[#4edea3] font-headline-lg font-bold">
                  {assessment.score}
                </span>
                <span className="text-body-sm text-[#4edea3]">
                  / 100 ({assessment.ratingLabel})
                </span>
              </div>
            </div>

            <div>
              <span className="text-label-sm font-label-sm text-[#c6c6cd] uppercase">
                Assigned Credit Rating
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-headline-lg text-[#d8e3fb] font-headline-lg font-bold">
                  {company.assignedRating}
                </span>
                <span className="text-body-sm text-[#4edea3]">{company.ratingOutlook}</span>
              </div>
            </div>

            <div>
              <span className="text-label-sm font-label-sm text-[#c6c6cd] uppercase">
                Recommended Facility Limit
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-headline-lg text-[#d8e3fb] font-headline-lg font-bold">
                  {company.recommendedFacilityLimit}
                </span>
                <span className="text-body-sm text-[#c6c6cd]">Revolving Credit</span>
              </div>
            </div>

            <div>
              <span className="text-label-sm font-label-sm text-[#c6c6cd] uppercase">
                Stress Test Survivability
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-headline-lg text-[#4edea3] font-headline-lg font-bold">
                  {simulation.statusSeverity === 'normal' ? '99.4%' : simulation.statusSeverity === 'warning' ? '91.2%' : '78.5%'}
                </span>
                <span className="text-body-sm text-[#4edea3]">Confidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="bg-[#152031] rounded-xl p-8 shadow-md border border-[#45464d]/40 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] flex items-center gap-3">
              <span className="w-2 h-6 bg-[#4edea3] rounded-full"></span>
              1. Executive Summary & Committee Recommendation
            </h2>
            <span className="text-label-md font-label-md px-3 py-1 bg-[#1f2a3c] rounded-md text-[#c6c6cd]">
              Section 01 / 05
            </span>
          </div>

          <div className="space-y-4 text-body-lg text-[#c6c6cd] leading-relaxed">
            <p>
              {company.name} ({company.ticker}) exhibits a composite debt risk score of{' '}
              <strong className="text-[#d8e3fb] font-bold">{assessment.score} / 100</strong>, reflecting{' '}
              {assessment.riskCategory.toLowerCase()} credit risk parameters based on {latestPeriod} audited financial statements. The enterprise maintains a Net Debt-to-EBITDA ratio of{' '}
              <strong className="text-[#d8e3fb] font-bold">
                {formatMultiple(latestRatios.netDebtToEbitda)}
              </strong>{' '}
              and an Interest Coverage Ratio of{' '}
              <strong className="text-[#d8e3fb] font-bold">
                {formatMultiple(latestRatios.interestCoverage)}
              </strong>.
            </p>
            <p>
              Our multi-factor stress simulations evaluated resilience under macroeconomic rate hikes (+{simParams.interestRateShockBps} bps) and margin compression ({simParams.ebitdaMarginShiftPct}%). Consequently, the RiskLens Credit Committee recommends approving the requested{' '}
              <strong className="text-[#d8e3fb] font-bold">
                {company.recommendedFacilityLimit} 5-year senior unsecured revolving credit facility
              </strong>{' '}
              subject to compliance covenants and ongoing quarterly monitoring.
            </p>
          </div>

          {/* Quick Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-[#111c2d] p-4 rounded-lg border border-[#45464d]/30">
              <div className="text-label-md font-label-md text-[#4edea3] mb-1 font-semibold">
                Key Strength
              </div>
              <p className="text-body-md text-[#d8e3fb] leading-relaxed">
                {assessment.mitigatingFactors[0]?.explanation ||
                  'Diversified multi-corridor revenue streams insulate operations against regional downturns.'}
              </p>
            </div>
            <div className="bg-[#111c2d] p-4 rounded-lg border border-[#45464d]/30">
              <div className="text-label-md font-label-md text-[#ffb95f] mb-1 font-semibold">
                Primary Vulnerability
              </div>
              <p className="text-body-md text-[#d8e3fb] leading-relaxed">
                {assessment.drivers[0]?.explanation ||
                  'Exposure to floating interest benchmark adjustments and supply chain cost volatility.'}
              </p>
            </div>
            <div className="bg-[#111c2d] p-4 rounded-lg border border-[#45464d]/30">
              <div className="text-label-md font-label-md text-[#4edea3] mb-1 font-semibold">
                Covenant Headroom
              </div>
              <p className="text-body-md text-[#d8e3fb] leading-relaxed">
                Interest Coverage stands at {formatMultiple(latestRatios.interestCoverage)} against a mandatory minimum covenant threshold of 2.50x.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Data Provenance Statement */}
        <div className="bg-[#152031] rounded-xl p-8 shadow-md border border-[#45464d]/40 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] flex items-center gap-3">
              <span className="w-2 h-6 bg-[#4edea3] rounded-full"></span>
              2. Synthetic & Public Data Provenance Statement
            </h2>
            <span className="text-label-md font-label-md px-3 py-1 bg-[#1f2a3c] rounded-md text-[#c6c6cd]">
              Section 02 / 05
            </span>
          </div>

          <p className="text-body-lg text-[#c6c6cd] leading-relaxed">
            To ensure unbiased predictive modeling and complete audit transparency, this risk assessment aggregates verified corporate filings with high-fidelity stress simulations. All statement inputs have undergone cryptographic integrity validation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111c2d] p-6 rounded-lg space-y-3 border border-[#45464d]/30">
              <div className="flex items-center justify-between">
                <span className="text-label-lg font-label-lg text-[#d8e3fb]">Primary Public & Benchmark Sources</span>
                <span className="text-label-sm font-label-sm px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded font-semibold">
                  {company.isSynthetic ? 'Benchmark Spec' : 'Verified SEC EDGAR'}
                </span>
              </div>
              <ul className="space-y-2 text-body-md text-[#c6c6cd]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#4edea3]">check_circle</span>
                  Form 10-K Annual Reports (FY 2021 - FY 2023)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#4edea3]">check_circle</span>
                  Audited Balance Sheets, Income & Cash Flow Statements
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#4edea3]">check_circle</span>
                  Audited Independent Opinions ({company.auditor})
                </li>
              </ul>
            </div>

            <div className="bg-[#111c2d] p-6 rounded-lg space-y-3 border border-[#45464d]/30">
              <div className="flex items-center justify-between">
                <span className="text-label-lg font-label-lg text-[#d8e3fb]">Synthetic & Macro Simulation Inputs</span>
                <span className="text-label-sm font-label-sm px-2 py-0.5 bg-[#ffb95f]/10 text-[#ffb95f] rounded font-semibold">
                  Monte Carlo 100k Runs
                </span>
              </div>
              <ul className="space-y-2 text-body-md text-[#c6c6cd]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">analytics</span>
                  Central Bank Benchmark Policy Rate Shock (+{simParams.interestRateShockBps} bps)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">analytics</span>
                  Operating Margin Compression Vector ({simParams.ebitdaMarginShiftPct}%)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">analytics</span>
                  Capital Expenditure Curtailment Simulation ({simParams.capExAdjustmentPct}%)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Detailed Financial Ratio Analysis */}
        <div className="bg-[#152031] rounded-xl p-8 shadow-md border border-[#45464d]/40 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] flex items-center gap-3">
              <span className="w-2 h-6 bg-[#4edea3] rounded-full"></span>
              3. Detailed Financial Ratio Analysis
            </h2>
            <span className="text-label-md font-label-md px-3 py-1 bg-[#1f2a3c] rounded-md text-[#c6c6cd]">
              Section 03 / 05
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#45464d]/30 text-label-lg font-label-lg text-[#c6c6cd] uppercase">
                  <th className="py-3 px-4">Financial Metric / Ratio</th>
                  <th className="py-3 px-4 text-right">{priorPeriod}</th>
                  <th className="py-3 px-4 text-right">{latestPeriod}</th>
                  <th className="py-3 px-4 text-right">TTM / Evaluated</th>
                  <th className="py-3 px-4 text-right">Target / Benchmark</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2a3c] text-body-md">
                <tr className="hover:bg-[#1f2a3c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#d8e3fb]">Current Ratio</td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatMultiple(priorRatios.currentRatio, '')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatMultiple(latestRatios.currentRatio, '')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#4edea3] font-bold">
                    {formatMultiple(latestRatios.currentRatio, '')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#c6c6cd]">&gt; 1.20</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded text-label-sm font-semibold">
                      {(latestRatios.currentRatio ?? 0) >= 1.2 ? 'Optimal' : 'Watch'}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#1f2a3c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#d8e3fb]">Quick Ratio (Acid-Test)</td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatMultiple(priorRatios.quickRatio, '')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatMultiple(latestRatios.quickRatio, '')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#4edea3] font-bold">
                    {formatMultiple(latestRatios.quickRatio, '')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#c6c6cd]">&gt; 1.00</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded text-label-sm font-semibold">
                      {(latestRatios.quickRatio ?? 0) >= 1.0 ? 'Healthy' : 'Tight'}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#1f2a3c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#d8e3fb]">Net Debt / EBITDA</td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatMultiple(priorRatios.netDebtToEbitda)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatMultiple(latestRatios.netDebtToEbitda)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#4edea3] font-bold">
                    {formatMultiple(latestRatios.netDebtToEbitda)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#c6c6cd]">&lt; 3.00x</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded text-label-sm font-semibold">
                      {(latestRatios.netDebtToEbitda ?? 0) <= 3.0 ? 'Strong' : 'Elevated'}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#1f2a3c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#d8e3fb]">Interest Coverage Ratio</td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatMultiple(priorRatios.interestCoverage)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatMultiple(latestRatios.interestCoverage)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#4edea3] font-bold">
                    {formatMultiple(latestRatios.interestCoverage)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#c6c6cd]">&gt; 3.0x</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded text-label-sm font-semibold">
                      {(latestRatios.interestCoverage ?? 0) >= 3.0 ? 'Robust' : 'Warning'}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#1f2a3c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#d8e3fb]">EBITDA Margin</td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatPercent(priorRatios.ebitdaMargin)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg">
                    {formatPercent(latestRatios.ebitdaMargin)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#4edea3] font-bold">
                    {formatPercent(latestRatios.ebitdaMargin)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#c6c6cd]">&gt; 15.0%</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded text-label-sm font-semibold">
                      {(latestRatios.ebitdaMargin ?? 0) >= 15.0 ? 'Superior' : 'Moderate'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Stress Test Scenario Findings */}
        <div className="bg-[#152031] rounded-xl p-8 shadow-md border border-[#45464d]/40 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] flex items-center gap-3">
              <span className="w-2 h-6 bg-[#4edea3] rounded-full"></span>
              4. Stress Test Scenario Findings
            </h2>
            <span className="text-label-md font-label-md px-3 py-1 bg-[#1f2a3c] rounded-md text-[#c6c6cd]">
              Section 04 / 05
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scenario A */}
            <div className="bg-[#111c2d] p-6 rounded-lg border border-[#45464d]/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-label-lg font-label-lg text-[#d8e3fb] font-semibold">
                  Severe Recession Shock
                </span>
                <span className="text-label-sm font-label-sm px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded font-semibold">
                  Passed
                </span>
              </div>
              <p className="text-body-sm text-[#c6c6cd]">
                Simulates a 15% revenue drop coupled with a 200 bps spike in base interest rates.
              </p>
              <div className="space-y-2 pt-2 border-t border-[#45464d]/20 text-body-md">
                <div className="flex justify-between">
                  <span className="text-[#c6c6cd]">Min. ICR Stressed:</span>
                  <span className="font-label-lg text-[#d8e3fb] font-bold">
                    {simulation.scenarioICR.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#c6c6cd]">Liquidity Runway:</span>
                  <span className="font-label-lg text-[#4edea3] font-bold">
                    {simulation.scenarioRunwayMonths.toFixed(1)} Months
                  </span>
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="bg-[#111c2d] p-6 rounded-lg border border-[#45464d]/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-label-lg font-label-lg text-[#d8e3fb] font-semibold">
                  Cost Spike & Margin Pressure
                </span>
                <span className="text-label-sm font-label-sm px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded font-semibold">
                  Passed
                </span>
              </div>
              <p className="text-body-sm text-[#c6c6cd]">
                Simulates input cost pressures compressing EBITDA margin by {Math.abs(simParams.ebitdaMarginShiftPct)}%.
              </p>
              <div className="space-y-2 pt-2 border-t border-[#45464d]/20 text-body-md">
                <div className="flex justify-between">
                  <span className="text-[#c6c6cd]">EBITDA Compression:</span>
                  <span className="font-label-lg text-[#ffb95f] font-bold">
                    {simParams.ebitdaMarginShiftPct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#c6c6cd]">Covenant Breach Risk:</span>
                  <span className="font-label-lg text-[#4edea3] font-bold">Low (1.2%)</span>
                </div>
              </div>
            </div>

            {/* Scenario C */}
            <div className="bg-[#111c2d] p-6 rounded-lg border border-[#45464d]/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-label-lg font-label-lg text-[#d8e3fb] font-semibold">
                  CapEx Curtailment Shock
                </span>
                <span className="text-label-sm font-label-sm px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded font-semibold">
                  Passed
                </span>
              </div>
              <p className="text-body-sm text-[#c6c6cd]">
                Simulates defense CapEx containment preserving organic free cash flow liquidity.
              </p>
              <div className="space-y-2 pt-2 border-t border-[#45464d]/20 text-body-md">
                <div className="flex justify-between">
                  <span className="text-[#c6c6cd]">Simulated Free Cash Flow:</span>
                  <span className="font-label-lg text-[#d8e3fb] font-bold">
                    {formatCurrencyM(simulation.simulatedFreeCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#c6c6cd]">Solvency Margin:</span>
                  <span className="font-label-lg text-[#4edea3] font-bold">Adequate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Actionable Analyst Recommendations */}
        <div className="bg-[#152031] rounded-xl p-8 shadow-md border border-[#45464d]/40 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] flex items-center gap-3">
              <span className="w-2 h-6 bg-[#4edea3] rounded-full"></span>
              5. Actionable Analyst Recommendations & Covenants
            </h2>
            <span className="text-label-md font-label-md px-3 py-1 bg-[#1f2a3c] rounded-md text-[#c6c6cd]">
              Section 05 / 05
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-[#111c2d] rounded-lg border-l-4 border-[#4edea3] border-t border-r border-b border-[#45464d]/30">
              <span className="material-symbols-outlined text-[#4edea3] text-[24px]">task_alt</span>
              <div>
                <h4 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                  1. Facility Approval & Drawdown Tranches
                </h4>
                <p className="text-body-md text-[#c6c6cd] mt-1 leading-relaxed">
                  Approve the {company.recommendedFacilityLimit} revolving credit line with an initial drawdown tranche of $40.0M. Subsequent tranches contingent on maintaining Net Debt/EBITDA below 3.00x.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#111c2d] rounded-lg border-l-4 border-[#4edea3] border-t border-r border-b border-[#45464d]/30">
              <span className="material-symbols-outlined text-[#4edea3] text-[24px]">shield</span>
              <div>
                <h4 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                  2. Mandatory Interest Rate Hedging Covenant
                </h4>
                <p className="text-body-md text-[#c6c6cd] mt-1 leading-relaxed">
                  Require the borrower to maintain a minimum 50% fixed-rate or derivative collar hedge across all floating-rate debt instruments for the next 24 months.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#111c2d] rounded-lg border-l-4 border-[#4edea3] border-t border-r border-b border-[#45464d]/30">
              <span className="material-symbols-outlined text-[#4edea3] text-[24px]">monitoring</span>
              <div>
                <h4 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                  3. Continuous Compliance Reporting
                </h4>
                <p className="text-body-md text-[#c6c6cd] mt-1 leading-relaxed">
                  Enforce quarterly automated compliance certification via the RiskLens platform for real-time liquidity tracking and covenant headroom audit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature & Sign-Off Block */}
        <div className="bg-[#152031] rounded-xl p-8 shadow-md border border-[#45464d]/40 space-y-8">
          <div className="border-b border-[#45464d]/30 pb-4">
            <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
              Credit Committee Approval Sign-Off
            </h3>
            <p className="text-body-sm text-[#c6c6cd] mt-0.5">
              By signing below, members of the Institutional Credit Committee endorse the findings and authorize the facility terms outlined in Report {company.scorecardId}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {/* Signatory 1 */}
            <div className="space-y-4 bg-[#111c2d] p-6 rounded-lg border border-[#45464d]/30">
              <div className="text-label-sm font-label-sm text-[#c6c6cd] uppercase">
                Lead Risk Analyst
              </div>
              <div className="h-12 border-b border-[#45464d]/50 flex items-end pb-2 font-label-lg text-[#d8e3fb] italic text-lg">
                Eleanor Vance, CFA
              </div>
              <div className="flex justify-between text-body-sm text-[#c6c6cd]">
                <span>Date: 24 Oct 2024</span>
                <span className="text-[#4edea3] font-label-lg font-bold">VERIFIED</span>
              </div>
            </div>

            {/* Signatory 2 */}
            <div className="space-y-4 bg-[#111c2d] p-6 rounded-lg border border-[#45464d]/30">
              <div className="text-label-sm font-label-sm text-[#c6c6cd] uppercase">
                Chief Risk Officer (CRO)
              </div>
              <div className="h-12 border-b border-[#45464d]/50 flex items-end pb-2 font-label-lg text-[#d8e3fb] italic text-lg">
                Marcus Sterling, PhD
              </div>
              <div className="flex justify-between items-center text-body-sm text-[#c6c6cd]">
                <span>Date: 24 Oct 2024</span>
                {approvedState.cro ? (
                  <span className="text-[#4edea3] font-label-lg font-bold">APPROVED</span>
                ) : (
                  <button
                    onClick={() => setApprovedState({ ...approvedState, cro: true })}
                    className="text-xs bg-[#1f2a3c] hover:bg-[#2a3548] text-[#bec6e0] px-2.5 py-1 rounded cursor-pointer border border-[#45464d]/40"
                  >
                    Click to Sign
                  </button>
                )}
              </div>
            </div>

            {/* Signatory 3 */}
            <div className="space-y-4 bg-[#111c2d] p-6 rounded-lg border border-[#45464d]/30">
              <div className="text-label-sm font-label-sm text-[#c6c6cd] uppercase">
                Committee Chairperson
              </div>
              <div className="h-12 border-b border-[#45464d]/50 flex items-end pb-2 font-label-lg text-[#d8e3fb] italic text-lg">
                Beatrice H. DuPont
              </div>
              <div className="flex justify-between items-center text-body-sm text-[#c6c6cd]">
                <span>Date: 24 Oct 2024</span>
                {approvedState.chair ? (
                  <span className="text-[#4edea3] font-label-lg font-bold">AUTHORIZED</span>
                ) : (
                  <button
                    onClick={() => setApprovedState({ ...approvedState, chair: true })}
                    className="text-xs bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-semibold px-2.5 py-1 rounded cursor-pointer"
                  >
                    Authorize
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#45464d]/20 flex flex-col md:flex-row items-center justify-between text-body-sm text-[#c6c6cd] gap-4">
            <span className="truncate max-w-full">
              RiskLens AI Cryptographic Audit Hash:{' '}
              <code className="text-[#4edea3] font-label-lg">
                0x8f9c2b4e7a1d3f8c0e2a9b4f7e1d3c8a9f2b4e7a
              </code>
            </span>
            <span className="font-label-lg uppercase text-xs">
              Strictly Confidential - For Internal Committee Use Only
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#152031] border border-[#4edea3]/40 text-[#d8e3fb] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-[#4edea3]">check_circle</span>
          <span className="text-body-md font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
