import React, { useState } from 'react';
import { CompanyProfile, ScenarioParameters, ScreenId } from '../../types';
import { runScenarioSimulation } from '../../services/scenarioEngine';

interface ScenarioExplorerScreenProps {
  company: CompanyProfile;
  onNavigate: (screen: ScreenId) => void;
  onSaveScenarioToReport?: (simParams: ScenarioParameters) => void;
}

export const ScenarioExplorerScreen: React.FC<ScenarioExplorerScreenProps> = ({
  company,
  onNavigate,
  onSaveScenarioToReport,
}) => {
  const [params, setParams] = useState<ScenarioParameters>({
    revenueGrowthPct: 4.2,
    ebitdaMarginShiftPct: -1.5,
    interestRateShockBps: 175,
    capExAdjustmentPct: -10,
  });

  const [activePreset, setActivePreset] = useState<string>('Custom Stress');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const simulation = runScenarioSimulation(company, params);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleReset = () => {
    setParams({
      revenueGrowthPct: 0,
      ebitdaMarginShiftPct: 0,
      interestRateShockBps: 0,
      capExAdjustmentPct: 0,
    });
    setActivePreset('Base Case');
    showToast('Baseline parameters restored.');
  };

  const applyPreset = (type: 'stagflation' | 'crunch' | 'bull' | 'base') => {
    if (type === 'stagflation') {
      setParams({
        revenueGrowthPct: -5.0,
        ebitdaMarginShiftPct: -4.0,
        interestRateShockBps: 275,
        capExAdjustmentPct: -25,
      });
      setActivePreset('Stagflation');
      showToast('Applied preset profile: STAGFLATION STRESS');
    } else if (type === 'crunch') {
      setParams({
        revenueGrowthPct: -12.5,
        ebitdaMarginShiftPct: -3.0,
        interestRateShockBps: 100,
        capExAdjustmentPct: -35,
      });
      setActivePreset('Tech Crunch');
      showToast('Applied preset profile: TECH CRUNCH DOWNTURN');
    } else if (type === 'bull') {
      setParams({
        revenueGrowthPct: 15.0,
        ebitdaMarginShiftPct: 3.5,
        interestRateShockBps: 0,
        capExAdjustmentPct: 30,
      });
      setActivePreset('Bull Rally');
      showToast('Applied preset profile: BULL RALLY EXPANSION');
    } else {
      handleReset();
    }
  };

  const handleSaveScenario = () => {
    if (onSaveScenarioToReport) {
      onSaveScenarioToReport(params);
    }
    showToast('Scenario saved successfully to local risk repository.');
  };

  const handleExportToReport = () => {
    if (onSaveScenarioToReport) {
      onSaveScenarioToReport(params);
    }
    showToast('Scenario assumptions exported to Final Committee Report.');
    setTimeout(() => {
      onNavigate('final-report');
    }, 500);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 gap-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label-lg font-label-lg text-[#4edea3] tracking-widest uppercase font-semibold">
              RiskLens AI // Simulation Core
            </span>
            <span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-[#1f2a3c] text-[#c6c6cd]">
              Model v4.8
            </span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-[#d8e3fb]">
            Scenario Explorer & Assumption Stress-Testing
          </h1>
          <p className="text-body-md text-[#c6c6cd] mt-1 max-w-2xl leading-relaxed">
            Dynamically adjust macroeconomic and fundamental valuation vectors to evaluate real-time capital structure resilience for {company.name}.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#1f2a3c] text-[#d8e3fb] rounded-lg text-body-md font-semibold hover:bg-[#2a3548] transition-all flex items-center gap-2 border border-[#45464d]/40 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            Reset Baseline
          </button>
          <button
            onClick={handleSaveScenario}
            className="px-4 py-2 bg-[#4edea3] text-[#003824] rounded-lg text-body-md font-semibold hover:bg-[#6ffbbe] transition-all flex items-center gap-2 shadow-lg shadow-[#4edea3]/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
            Save Scenario
          </button>
          <button
            onClick={handleExportToReport}
            className="px-4 py-2 bg-[#0f172a] text-[#bec6e0] rounded-lg text-body-md font-semibold hover:bg-[#1f2a3c] transition-all flex items-center gap-2 border border-[#45464d]/40 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            Export to Report
          </button>
        </div>
      </div>

      {/* Main Grid: Levers (Col 5) vs Matrix & Chart (Col 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders & Vulnerability Narrative */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card: Levers */}
          <div className="bg-[#152031] p-6 rounded-xl border border-[#45464d]/40 shadow-lg relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1f2a3c] flex items-center justify-center text-[#4edea3] border border-[#45464d]/30">
                  <span className="material-symbols-outlined text-[22px]">tune</span>
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                    Macro & Fundamental Levers
                  </h2>
                  <p className="text-body-sm text-[#c6c6cd]">
                    Real-time valuation recalculation matrix
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#4edea3]/10 text-[#4edea3] font-label-lg text-label-lg font-semibold border border-[#4edea3]/20">
                {activePreset}
              </span>
            </div>

            {/* Levers List */}
            <div className="flex flex-col gap-6">
              {/* Slider 1: Revenue Growth */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-body-md font-semibold text-[#d8e3fb] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4edea3] text-[16px]">trending_up</span>
                    Revenue Growth Rate
                  </label>
                  <span className="font-label-lg text-label-lg text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded font-bold">
                    {params.revenueGrowthPct >= 0 ? '+' : ''}
                    {params.revenueGrowthPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.5"
                  value={params.revenueGrowthPct}
                  onChange={(e) => {
                    setParams({ ...params, revenueGrowthPct: parseFloat(e.target.value) });
                    setActivePreset('Custom Stress');
                  }}
                  className="w-full accent-[#4edea3] bg-[#1f2a3c] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-label-sm text-[#c6c6cd] font-label-sm">
                  <span>-20.0% (Recession)</span>
                  <span>Baseline (0.0%)</span>
                  <span>+20.0% (Boom)</span>
                </div>
              </div>

              {/* Slider 2: EBITDA Margin Shift */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-body-md font-semibold text-[#d8e3fb] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4edea3] text-[16px]">percent</span>
                    EBITDA Margin Shift
                  </label>
                  <span className="font-label-lg text-label-lg text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded font-bold">
                    {params.ebitdaMarginShiftPct >= 0 ? '+' : ''}
                    {params.ebitdaMarginShiftPct.toFixed(2)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.25"
                  value={params.ebitdaMarginShiftPct}
                  onChange={(e) => {
                    setParams({ ...params, ebitdaMarginShiftPct: parseFloat(e.target.value) });
                    setActivePreset('Custom Stress');
                  }}
                  className="w-full accent-[#4edea3] bg-[#1f2a3c] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-label-sm text-[#c6c6cd] font-label-sm">
                  <span>-5.0% (Compression)</span>
                  <span>Baseline</span>
                  <span>+5.0% (Expansion)</span>
                </div>
              </div>

              {/* Slider 3: Interest Rate Shock */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-body-md font-semibold text-[#d8e3fb] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffb95f] text-[16px]">bolt</span>
                    Interest Rate Shock
                  </label>
                  <span className="font-label-lg text-label-lg text-[#ffb95f] bg-[#ffb95f]/10 px-2 py-0.5 rounded font-bold">
                    +{params.interestRateShockBps} bps
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="25"
                  value={params.interestRateShockBps}
                  onChange={(e) => {
                    setParams({ ...params, interestRateShockBps: parseInt(e.target.value) });
                    setActivePreset('Custom Stress');
                  }}
                  className="w-full accent-[#ffb95f] bg-[#1f2a3c] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-label-sm text-[#c6c6cd] font-label-sm">
                  <span>+0 bps (Flat)</span>
                  <span>+150 bps</span>
                  <span>+300 bps (Severe)</span>
                </div>
              </div>

              {/* Slider 4: CapEx Adjustments */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-body-md font-semibold text-[#d8e3fb] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4edea3] text-[16px]">domain</span>
                    CapEx Adjustments
                  </label>
                  <span className="font-label-lg text-label-lg text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded font-bold">
                    {params.capExAdjustmentPct >= 0 ? '+' : ''}
                    {params.capExAdjustmentPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="50"
                  step="5"
                  value={params.capExAdjustmentPct}
                  onChange={(e) => {
                    setParams({ ...params, capExAdjustmentPct: parseInt(e.target.value) });
                    setActivePreset('Custom Stress');
                  }}
                  className="w-full accent-[#4edea3] bg-[#1f2a3c] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-label-sm text-[#c6c6cd] font-label-sm">
                  <span>-40% (Defensive)</span>
                  <span>Baseline</span>
                  <span>+50% (Aggressive)</span>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="pt-4 border-t border-[#45464d]/30 flex flex-col gap-3">
              <span className="text-label-lg font-label-lg text-[#c6c6cd] uppercase tracking-wider">
                Preset Stress Profiles
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => applyPreset('stagflation')}
                  className="px-3 py-2 bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] rounded-lg text-body-sm font-semibold transition-all text-center cursor-pointer border border-[#45464d]/30"
                >
                  Stagflation
                </button>
                <button
                  onClick={() => applyPreset('crunch')}
                  className="px-3 py-2 bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] rounded-lg text-body-sm font-semibold transition-all text-center cursor-pointer border border-[#45464d]/30"
                >
                  Tech Crunch
                </button>
                <button
                  onClick={() => applyPreset('bull')}
                  className="px-3 py-2 bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] rounded-lg text-body-sm font-semibold transition-all text-center cursor-pointer border border-[#45464d]/30"
                >
                  Bull Rally
                </button>
              </div>
            </div>
          </div>

          {/* Card: Vulnerability Matrix & Catalysts Narrative */}
          <div className="bg-[#152031] p-6 rounded-xl border border-[#45464d]/40 shadow-lg flex flex-col gap-3">
            <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3] text-[20px]">radar</span>
              Vulnerability Matrix & Catalysts
            </h3>
            <p className="text-body-sm text-[#c6c6cd]">
              AI-generated impact narrative based on current slider positions.
            </p>
            <div
              className={`p-4 rounded-lg bg-[#1f2a3c] text-body-md text-[#c6c6cd] border-l-4 flex flex-col gap-2 ${
                simulation.statusSeverity === 'critical'
                  ? 'border-[#ffb4ab]'
                  : simulation.statusSeverity === 'warning'
                  ? 'border-[#ffb95f]'
                  : 'border-[#4edea3]'
              }`}
            >
              <span className="font-semibold text-[#d8e3fb]">
                {simulation.narrativeTitle}
              </span>
              <span className="leading-relaxed">{simulation.narrativeDescription}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Metrics Matrix & Trajectory Chart */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#152031] p-6 rounded-xl border border-[#45464d]/40 shadow-lg flex flex-col gap-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                  Baseline vs. Scenario Matrix
                </h2>
                <p className="text-body-sm text-[#c6c6cd]">
                  Comparative financial health metrics under simulated parameters
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2a3548]"></span>
                <span className="text-label-md text-[#c6c6cd]">Baseline</span>
                <span className="w-3 h-3 rounded-full bg-[#4edea3] ml-3"></span>
                <span className="text-label-md text-[#d8e3fb]">Scenario</span>
              </div>
            </div>

            {/* 4 Comparative Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Risk Score */}
              <div className="p-5 bg-[#1f2a3c] rounded-xl flex flex-col justify-between gap-4 border border-[#45464d]/30">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-label-lg font-label-lg text-[#c6c6cd] uppercase tracking-wider">
                      Risk Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-headline-lg font-headline-lg font-bold text-[#4edea3]">
                        {simulation.scenarioScore}
                      </span>
                      <span className="text-body-sm text-[#c6c6cd]">/ 100</span>
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-label-md font-label-lg flex items-center gap-1 font-semibold ${
                      simulation.scoreDelta > 0
                        ? 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                        : 'bg-[#4edea3]/15 text-[#4edea3]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {simulation.scoreDelta > 0 ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {simulation.scoreDelta > 0 ? '+' : ''}
                    {simulation.scoreDelta} pts
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-body-sm">
                  <div className="flex justify-between text-[#c6c6cd]">
                    <span>Baseline Score:</span>
                    <span className="font-label-lg text-[#d8e3fb] font-semibold">
                      {simulation.baselineScore}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#c6c6cd]">
                    <span>Shift Category:</span>
                    <span className="font-label-lg text-[#4edea3] font-semibold">
                      {simulation.scenarioScore <= 35
                        ? 'Prime Grade'
                        : simulation.scenarioScore <= 65
                        ? 'Stable / Watch'
                        : 'Elevated Risk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Interest Coverage */}
              <div className="p-5 bg-[#1f2a3c] rounded-xl flex flex-col justify-between gap-4 border border-[#45464d]/30">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-label-lg font-label-lg text-[#c6c6cd] uppercase tracking-wider">
                      Interest Coverage
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-headline-lg font-headline-lg font-bold text-[#d8e3fb]">
                        {simulation.scenarioICR.toFixed(2)}x
                      </span>
                      <span className="text-body-sm text-[#c6c6cd]">EBIT / Interest</span>
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-label-md font-label-lg flex items-center gap-1 font-semibold ${
                      simulation.icrDelta < 0
                        ? 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                        : 'bg-[#4edea3]/15 text-[#4edea3]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {simulation.icrDelta >= 0 ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {simulation.icrDelta >= 0 ? '+' : ''}
                    {simulation.icrDelta.toFixed(2)}x
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-body-sm">
                  <div className="flex justify-between text-[#c6c6cd]">
                    <span>Baseline ICR:</span>
                    <span className="font-label-lg text-[#d8e3fb] font-semibold">
                      {simulation.baselineICR.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between text-[#c6c6cd]">
                    <span>Covenant Threshold:</span>
                    <span className="font-label-lg text-[#d8e3fb] font-semibold">2.50x Min</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Leverage Ratio */}
              <div className="p-5 bg-[#1f2a3c] rounded-xl flex flex-col justify-between gap-4 border border-[#45464d]/30">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-label-lg font-label-lg text-[#c6c6cd] uppercase tracking-wider">
                      Leverage Ratio
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-headline-lg font-headline-lg font-bold text-[#d8e3fb]">
                        {simulation.scenarioLeverage.toFixed(2)}x
                      </span>
                      <span className="text-body-sm text-[#c6c6cd]">Debt / EBITDA</span>
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-label-md font-label-lg flex items-center gap-1 font-semibold ${
                      simulation.leverageDelta > 0
                        ? 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                        : 'bg-[#4edea3]/15 text-[#4edea3]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {simulation.leverageDelta >= 0 ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {simulation.leverageDelta >= 0 ? '+' : ''}
                    {simulation.leverageDelta.toFixed(2)}x
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-body-sm">
                  <div className="flex justify-between text-[#c6c6cd]">
                    <span>Baseline Leverage:</span>
                    <span className="font-label-lg text-[#d8e3fb] font-semibold">
                      {simulation.baselineLeverage.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between text-[#c6c6cd]">
                    <span>Covenant Limit:</span>
                    <span className="font-label-lg text-[#d8e3fb] font-semibold">3.50x Max</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Liquidity Runway */}
              <div className="p-5 bg-[#1f2a3c] rounded-xl flex flex-col justify-between gap-4 border border-[#45464d]/30">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-label-lg font-label-lg text-[#c6c6cd] uppercase tracking-wider">
                      Liquidity Runway
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-headline-lg font-headline-lg font-bold text-[#4edea3]">
                        {simulation.scenarioRunwayMonths.toFixed(1)} mo
                      </span>
                      <span className="text-body-sm text-[#c6c6cd]">Cash + RCF</span>
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-label-md font-label-lg flex items-center gap-1 font-semibold ${
                      simulation.runwayDelta < 0
                        ? 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                        : 'bg-[#4edea3]/15 text-[#4edea3]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {simulation.runwayDelta >= 0 ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {simulation.runwayDelta >= 0 ? '+' : ''}
                    {simulation.runwayDelta.toFixed(1)} mo
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-body-sm">
                  <div className="flex justify-between text-[#c6c6cd]">
                    <span>Baseline Runway:</span>
                    <span className="font-label-lg text-[#d8e3fb] font-semibold">
                      {simulation.baselineRunwayMonths.toFixed(1)} mo
                    </span>
                  </div>
                  <div className="flex justify-between text-[#c6c6cd]">
                    <span>Min Safe Target:</span>
                    <span className="font-label-lg text-[#d8e3fb] font-semibold">12.0 mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trajectory Bar Chart */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                  Projected Free Cash Flow (FCF) Trajectory
                </h3>
                <span className="text-label-md text-[#c6c6cd]">Quarterly Simulation ($M)</span>
              </div>

              <div className="h-52 w-full bg-[#1f2a3c] rounded-xl p-5 flex items-end justify-between gap-4 relative border border-[#45464d]/30">
                {/* Reference Grid lines */}
                <div className="absolute inset-x-5 top-5 bottom-10 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-[#bec6e0] w-full"></div>
                  <div className="border-b border-[#bec6e0] w-full"></div>
                  <div className="border-b border-[#bec6e0] w-full"></div>
                </div>

                {simulation.projectedFCFQuarters.map((quarter, idx) => {
                  const maxVal = Math.max(
                    ...simulation.projectedFCFQuarters.map((q) => Math.abs(q.value)),
                    50
                  );
                  const heightPct = Math.min(100, Math.max(15, (Math.abs(quarter.value) / maxVal) * 90));
                  const isPositive = quarter.value >= 0;

                  return (
                    <div key={quarter.period} className="flex flex-col items-center gap-2 z-10 flex-1 h-full justify-end">
                      <div className="w-full max-w-[50px] bg-[#2a3548] rounded-t flex flex-col justify-end h-32 relative group">
                        <div
                          className={`w-full rounded-t transition-all duration-300 flex items-center justify-center text-xs font-mono font-bold ${
                            isPositive
                              ? idx === 0
                                ? 'bg-[#4edea3]/50'
                                : 'bg-[#4edea3]'
                              : 'bg-[#ffb4ab]'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        ></div>
                      </div>
                      <span className="text-label-sm font-label-sm text-[#d8e3fb] font-semibold">
                        ${quarter.value}M
                      </span>
                      <span className="text-label-md text-[#c6c6cd] font-label-md">
                        {quarter.period}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
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
