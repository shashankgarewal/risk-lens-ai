import React, { useState } from 'react';
import { CompanyProfile, RiskAssessmentResult, ScreenId } from '../../types';
import { formatMultiple, formatPercent, formatCurrencyM } from '../../services/financialEngine';

interface RiskAssessmentScreenProps {
  company: CompanyProfile;
  assessment: RiskAssessmentResult;
  onNavigate: (screen: ScreenId) => void;
  onSelectInvestigation?: (investigationTitle: string) => void;
}

export const RiskAssessmentScreen: React.FC<RiskAssessmentScreenProps> = ({
  company,
  assessment,
  onNavigate,
  onSelectInvestigation,
}) => {
  const [assignedActionIds, setAssignedActionIds] = useState<string[]>([]);

  const { score, riskCategory, ratingGrade, ratios, historicalRatios, drivers, mitigatingFactors, topRecommendations } = assessment;

  // Trend helper: compute 3 points for SVG sparkline
  const periods = company.periods; // ['FY2021', 'FY2022', 'FY2023']
  const getTrendPoints = (metricKey: keyof typeof ratios) => {
    const vals = periods.map((p) => {
      const r = historicalRatios[p];
      return (r ? (r[metricKey] as number) : 0) ?? 0;
    });

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;

    // Map 3 points to SVG viewBox 0 0 100 30
    const coords = vals.map((v, i) => {
      const x = 5 + i * 45;
      const y = 25 - ((v - min) / range) * 20;
      return `${x} ${isNaN(y) ? 15 : y}`;
    });

    return `M${coords[0]} L${coords[1]} L${coords[2]}`;
  };

  const getStatusBadge = (
    metric: string,
    val: number | null,
    target: string,
    isGoodHigher: boolean
  ) => {
    if (val === null) {
      return (
        <span className="px-2 py-0.5 bg-[#1f2a3c] text-[#c6c6cd] rounded text-label-sm">
          N/A
        </span>
      );
    }

    if (metric === 'Total Debt / EBITDA') {
      if (val > 4.0) return <span className="px-2 py-0.5 bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded text-label-sm font-semibold">Critical</span>;
      if (val > 3.0) return <span className="px-2 py-0.5 bg-[#251400] text-[#ffb95f] border border-[#ffb95f]/30 rounded text-label-sm font-semibold">Warning</span>;
      return <span className="px-2 py-0.5 bg-[#003824] text-[#4edea3] border border-[#4edea3]/30 rounded text-label-sm font-semibold">Strong</span>;
    }

    if (metric === 'Interest Coverage Ratio') {
      if (val < 1.5) return <span className="px-2 py-0.5 bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded text-label-sm font-semibold">Critical</span>;
      if (val < 2.5) return <span className="px-2 py-0.5 bg-[#251400] text-[#ffb95f] border border-[#ffb95f]/30 rounded text-label-sm font-semibold">Warning</span>;
      return <span className="px-2 py-0.5 bg-[#003824] text-[#4edea3] border border-[#4edea3]/30 rounded text-label-sm font-semibold">Robust</span>;
    }

    if (metric === 'Debt-to-Equity') {
      if (val > 3.0) return <span className="px-2 py-0.5 bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded text-label-sm font-semibold">High</span>;
      if (val > 1.8) return <span className="px-2 py-0.5 bg-[#1f2a3c] text-[#c6c6cd] rounded text-label-sm font-semibold">Moderate</span>;
      return <span className="px-2 py-0.5 bg-[#003824] text-[#4edea3] border border-[#4edea3]/30 rounded text-label-sm font-semibold">Optimal</span>;
    }

    if (metric === 'Current Ratio') {
      if (val < 1.0) return <span className="px-2 py-0.5 bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded text-label-sm font-semibold">Deficit</span>;
      if (val < 1.25) return <span className="px-2 py-0.5 bg-[#251400] text-[#ffb95f] border border-[#ffb95f]/30 rounded text-label-sm font-semibold">Tight</span>;
      return <span className="px-2 py-0.5 bg-[#003824] text-[#4edea3] border border-[#4edea3]/30 rounded text-label-sm font-semibold">Healthy</span>;
    }

    // Default
    if (isGoodHigher ? (val >= 0) : (val <= 0)) {
      return <span className="px-2 py-0.5 bg-[#003824] text-[#4edea3] border border-[#4edea3]/30 rounded text-label-sm font-semibold">Adequate</span>;
    }
    return <span className="px-2 py-0.5 bg-[#251400] text-[#ffb95f] border border-[#ffb95f]/30 rounded text-label-sm font-semibold">Warning</span>;
  };

  const handleActionClick = (rec: { id: string; actionType: string; title: string }) => {
    if (rec.actionType === 'simulate') {
      if (onSelectInvestigation) onSelectInvestigation(rec.title);
      onNavigate('scenario-explorer');
    } else {
      setAssignedActionIds((prev) =>
        prev.includes(rec.id) ? prev.filter((i) => i !== rec.id) : [...prev, rec.id]
      );
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 gap-10">
      {/* Section 1: Executive Risk Scorecard Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#111c2d] p-8 shadow-xl border border-[#45464d]/30">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#4edea3]/5 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-[#ffb95f]/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full font-label-lg tracking-wider uppercase font-semibold ${
                  riskCategory === 'Low'
                    ? 'bg-[#003824] text-[#4edea3] border border-[#4edea3]/30'
                    : riskCategory === 'Moderate'
                    ? 'bg-[#251400] text-[#ffb95f] border border-[#ffb95f]/30'
                    : 'bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30'
                }`}
              >
                {ratingGrade}
              </span>
              <span className="text-[#c6c6cd] font-label-lg">ID: {company.scorecardId}</span>
            </div>
            <h1 className="text-headline-lg font-headline-lg text-[#d8e3fb] font-semibold">
              {company.name}
            </h1>
            <p className="text-body-lg text-[#c6c6cd] max-w-2xl leading-relaxed">
              Comprehensive explainable risk scorecard generated via multi-factor quantitative simulation and historical variance analysis.
            </p>
          </div>

          <div className="flex items-center gap-8 bg-[#152031] p-6 rounded-xl border border-[#45464d]/40 shadow-inner">
            <div className="flex flex-col items-center justify-center pr-8 border-r border-[#45464d]/40">
              <span className="text-label-sm font-label-sm text-[#c6c6cd] uppercase tracking-wider mb-1">
                Overall Risk Index
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl font-headline-lg font-bold"
                  style={{
                    color:
                      riskCategory === 'Low'
                        ? '#4edea3'
                        : riskCategory === 'Moderate'
                        ? '#ffb95f'
                        : '#ffb4ab',
                  }}
                >
                  {score}
                </span>
                <span className="text-headline-sm text-[#c6c6cd]">/100</span>
              </div>
              <span
                className={`text-label-md mt-1 flex items-center gap-1 font-semibold ${
                  riskCategory === 'Low'
                    ? 'text-[#4edea3]'
                    : riskCategory === 'Moderate'
                    ? 'text-[#ffb95f]'
                    : 'text-[#ffb4ab]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {riskCategory === 'Low' ? 'verified' : 'warning'}
                </span>
                {riskCategory} Risk
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-w-xs">
              <span className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                Model Provenance
              </span>
              <p className="text-body-sm text-[#c6c6cd] leading-relaxed">
                Illustrative baseline scoring model v1.2. This output is an algorithmic risk assessment and does not constitute an official credit rating agency rating.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 & 3: Ratios Table & Key Drivers Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Financial Ratios Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3]">analytics</span>
              Key Financial Ratios & Underlying Values
            </h2>
            <span className="text-label-lg text-[#c6c6cd]">
              {periods[periods.length - 1]} Evaluated
            </span>
          </div>

          <div className="bg-[#111c2d] rounded-xl border border-[#45464d]/40 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#152031] text-[#c6c6cd] font-label-lg border-b border-[#45464d]/30 text-label-md uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Metric / Ratio</th>
                  <th className="py-3 px-4 font-semibold text-right">Current Value</th>
                  <th className="py-3 px-4 font-semibold text-right">Target / Benchmark</th>
                  <th className="py-3 px-4 font-semibold text-center">3-Year Trend</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2a3c] text-body-md">
                {/* 1. Total Debt / EBITDA */}
                <tr className="hover:bg-[#152031]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#d8e3fb]">Total Debt / EBITDA</div>
                    <div className="text-body-sm text-[#c6c6cd]">Leverage capacity indicator</div>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-label-lg font-bold ${
                    (ratios.debtToEbitda ?? 0) > 3.5 ? 'text-[#ffb4ab]' : (ratios.debtToEbitda ?? 0) > 2.5 ? 'text-[#ffb95f]' : 'text-[#4edea3]'
                  }`}>
                    {formatMultiple(ratios.debtToEbitda)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#c6c6cd] font-label-lg">&lt; 3.0x</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center">
                      <svg className="w-24 h-8 text-[#ffb4ab]" fill="none" viewBox="0 0 100 30">
                        <path
                          d={getTrendPoints('debtToEbitda')}
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge('Total Debt / EBITDA', ratios.debtToEbitda, '< 3.0x', false)}
                  </td>
                </tr>

                {/* 2. Interest Coverage Ratio */}
                <tr className="hover:bg-[#152031]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#d8e3fb]">Interest Coverage Ratio</div>
                    <div className="text-body-sm text-[#c6c6cd]">EBIT / Interest Expense</div>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-label-lg font-bold ${
                    (ratios.interestCoverage ?? 0) < 2.0 ? 'text-[#ffb4ab]' : (ratios.interestCoverage ?? 0) < 3.5 ? 'text-[#ffb95f]' : 'text-[#4edea3]'
                  }`}>
                    {formatMultiple(ratios.interestCoverage)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#c6c6cd] font-label-lg">&gt; 2.5x</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center">
                      <svg className="w-24 h-8 text-[#ffb95f]" fill="none" viewBox="0 0 100 30">
                        <path
                          d={getTrendPoints('interestCoverage')}
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge('Interest Coverage Ratio', ratios.interestCoverage, '> 2.5x', true)}
                  </td>
                </tr>

                {/* 3. Debt-to-Equity */}
                <tr className="hover:bg-[#152031]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#d8e3fb]">Debt-to-Equity</div>
                    <div className="text-body-sm text-[#c6c6cd]">Capital structure leverage</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#d8e3fb]">
                    {formatMultiple(ratios.debtToEquity)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#c6c6cd] font-label-lg">&lt; 1.5x</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center">
                      <svg className="w-24 h-8 text-[#4edea3]" fill="none" viewBox="0 0 100 30">
                        <path
                          d={getTrendPoints('debtToEquity')}
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge('Debt-to-Equity', ratios.debtToEquity, '< 1.5x', false)}
                  </td>
                </tr>

                {/* 4. Current Ratio */}
                <tr className="hover:bg-[#152031]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#d8e3fb]">Current Ratio</div>
                    <div className="text-body-sm text-[#c6c6cd]">Short-term liquidity</div>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-label-lg font-bold ${
                    (ratios.currentRatio ?? 0) < 1.1 ? 'text-[#ffb4ab]' : (ratios.currentRatio ?? 0) < 1.3 ? 'text-[#ffb95f]' : 'text-[#4edea3]'
                  }`}>
                    {formatMultiple(ratios.currentRatio)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#c6c6cd] font-label-lg">&gt; 1.3x</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center">
                      <svg className="w-24 h-8 text-[#ffb95f]" fill="none" viewBox="0 0 100 30">
                        <path
                          d={getTrendPoints('currentRatio')}
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge('Current Ratio', ratios.currentRatio, '> 1.3x', true)}
                  </td>
                </tr>

                {/* 5. Free Cash Flow */}
                <tr className="hover:bg-[#152031]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#d8e3fb]">Free Cash Flow</div>
                    <div className="text-body-sm text-[#c6c6cd]">Operating CF less CapEx</div>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-label-lg font-bold ${
                    ratios.freeCashFlow < 0 ? 'text-[#ffb4ab]' : 'text-[#4edea3]'
                  }`}>
                    {formatCurrencyM(ratios.freeCashFlow)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#c6c6cd] font-label-lg">&gt; $0.0M</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center">
                      <svg className="w-24 h-8 text-[#4edea3]" fill="none" viewBox="0 0 100 30">
                        <path
                          d={getTrendPoints('freeCashFlow')}
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge('Free Cash Flow', ratios.freeCashFlow, '> 0', true)}
                  </td>
                </tr>

                {/* 6. Net Debt / EBITDA */}
                <tr className="hover:bg-[#152031]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#d8e3fb]">Net Debt / EBITDA</div>
                    <div className="text-body-sm text-[#c6c6cd]">Net leverage post-cash buffer</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-[#d8e3fb]">
                    {formatMultiple(ratios.netDebtToEbitda)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#c6c6cd] font-label-lg">&lt; 2.5x</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center">
                      <svg className="w-24 h-8 text-[#4edea3]" fill="none" viewBox="0 0 100 30">
                        <path
                          d={getTrendPoints('netDebtToEbitda')}
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge('Net Debt / EBITDA', ratios.netDebtToEbitda, '< 2.5x', false)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Primary Risk Drivers */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb95f]">psychology</span>
              Primary Risk Drivers
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {drivers.length > 0 ? (
              drivers.slice(0, 3).map((driver, index) => {
                const borderCol = index === 0 ? 'border-[#ffb4ab]' : index === 1 ? 'border-[#ffb95f]' : 'border-[#4edea3]';
                const textCol = index === 0 ? 'text-[#ffb4ab]' : index === 1 ? 'text-[#ffb95f]' : 'text-[#4edea3]';

                return (
                  <div
                    key={driver.name}
                    className={`bg-[#111c2d] p-5 rounded-xl border-l-4 ${borderCol} border-t border-r border-b border-[#45464d]/30 flex flex-col gap-2 shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-[#d8e3fb] font-semibold">{driver.name}</span>
                      <span className={`font-label-lg font-bold ${textCol}`}>
                        +{driver.impactPercent}% impact
                      </span>
                    </div>
                    <p className="text-body-sm text-[#c6c6cd] leading-relaxed">
                      {driver.explanation}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#111c2d] p-5 rounded-xl border-l-4 border-[#4edea3] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-[#d8e3fb]">Fortress Balance Sheet</span>
                  <span className="font-label-lg text-[#4edea3]">Low Risk Profile</span>
                </div>
                <p className="text-body-sm text-[#c6c6cd]">
                  No high-risk impairment factors identified across credit coverage metrics.
                </p>
              </div>
            )}

            {mitigatingFactors.length > 0 && (
              <div className="bg-[#111c2d] p-5 rounded-xl border-l-4 border-[#4edea3] border-t border-r border-b border-[#45464d]/30 flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-[#d8e3fb] font-semibold">
                    {mitigatingFactors[0].name}
                  </span>
                  <span className="font-label-lg text-[#4edea3] font-bold">
                    -{mitigatingFactors[0].impactPercent}% buffer
                  </span>
                </div>
                <p className="text-body-sm text-[#c6c6cd] leading-relaxed">
                  {mitigatingFactors[0].explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Data Quality Warnings & Recommended Analyst Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
        {/* Left: Data Quality & Completeness */}
        <div className="bg-[#111c2d] p-6 rounded-xl border border-[#45464d]/40 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#251400] border border-[#ffb95f]/30 flex items-center justify-center text-[#ffb95f]">
              <span className="material-symbols-outlined">report_problem</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                Data Quality & Completeness
              </h3>
              <p className="text-body-sm text-[#c6c6cd]">
                Integrity score: {company.completeness}% (Confidence: High)
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-3 text-body-md text-[#c6c6cd]">
            {company.warnings.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#ffb95f] text-[18px] mt-0.5 shrink-0">
                  info
                </span>
                <span>{w}</span>
              </li>
            ))}
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#4edea3] text-[18px] mt-0.5 shrink-0">
                check_circle
              </span>
              <span>
                Primary audited statements for {periods[periods.length - 1]} fully reconciled against filing documents.
              </span>
            </li>
          </ul>
        </div>

        {/* Right: Recommended Analyst Investigations */}
        <div className="bg-[#111c2d] p-6 rounded-xl border border-[#45464d]/40 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00a572]/20 border border-[#4edea3]/30 flex items-center justify-center text-[#4edea3]">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                Recommended Analyst Investigations
              </h3>
              <p className="text-body-sm text-[#c6c6cd]">
                Suggested next steps for credit committee review
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {topRecommendations.map((rec) => {
              const isAssigned = assignedActionIds.includes(rec.id);
              return (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3.5 bg-[#152031] border border-[#45464d]/30 rounded-lg"
                >
                  <span className="text-body-md text-[#d8e3fb] font-medium pr-3">
                    {rec.title}
                  </span>
                  <button
                    onClick={() => handleActionClick(rec)}
                    className={`px-3 py-1.5 rounded font-label-lg font-semibold transition-all shrink-0 cursor-pointer ${
                      rec.actionType === 'simulate'
                        ? 'bg-[#bec6e0] text-[#283044] hover:bg-[#dae2fd]'
                        : isAssigned
                        ? 'bg-[#00a572] text-white'
                        : 'bg-[#1f2a3c] text-[#bec6e0] hover:bg-[#2a3548] border border-[#45464d]/40'
                    }`}
                  >
                    {rec.actionType === 'simulate'
                      ? 'Simulate'
                      : isAssigned
                      ? 'Assigned ✓'
                      : 'Assign'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
