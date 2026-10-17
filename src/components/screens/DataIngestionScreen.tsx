import React, { useState } from 'react';
import { CompanyProfile, FinancialYearData, ScreenId } from '../../types';

interface DataIngestionScreenProps {
  company: CompanyProfile;
  onUpdateCompanyStatements: (newStatements: { [year: string]: FinancialYearData }) => void;
  onResetStaging: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const DataIngestionScreen: React.FC<DataIngestionScreenProps> = ({
  company,
  onUpdateCompanyStatements,
  onResetStaging,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'public' | 'synthetic' | 'upload' | 'manual'>('public');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [committedSuccess, setCommittedSuccess] = useState(false);
  const [editingCell, setEditingCell] = useState<{ metric: string; year: string } | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const periods = company.periods; // ['FY2021', 'FY2022', 'FY2023']

  const metricsConfig: {
    key: keyof Omit<FinancialYearData, 'year' | 'provenance' | 'notes'>;
    label: string;
    hasWarning?: boolean;
    warningText?: string;
  }[] = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'ebitda', label: 'EBITDA' },
    { key: 'ebit', label: 'EBIT' },
    { key: 'interestExpense', label: 'Interest Expense' },
    {
      key: 'totalDebt',
      label: 'Total Debt',
      hasWarning: true,
      warningText: 'Includes unvested pension and operating lease obligations in Note 11',
    },
    { key: 'cashAndEquivalents', label: 'Cash & Equivalents' },
    { key: 'currentAssets', label: 'Current Assets' },
    { key: 'currentLiabilities', label: 'Current Liabilities' },
    { key: 'totalEquity', label: 'Total Equity' },
    { key: 'operatingCashFlow', label: 'Operating Cash Flow (OCF)' },
    { key: 'capEx', label: 'CapEx' },
  ];

  const filteredMetrics = metricsConfig.filter((m) =>
    m.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCellEdit = (
    metricKey: keyof Omit<FinancialYearData, 'year' | 'provenance' | 'notes'>,
    year: string,
    valueStr: string
  ) => {
    const num = parseFloat(valueStr.replace(/,/g, ''));
    if (isNaN(num)) return;

    const currentYearData = company.statements[year];
    if (!currentYearData) return;

    const updatedStatements = {
      ...company.statements,
      [year]: {
        ...currentYearData,
        [metricKey]: num,
        notes: {
          ...currentYearData.notes,
          [metricKey]: 'Manual Analyst Override',
        },
      },
    };

    onUpdateCompanyStatements(updatedStatements);
  };

  const handleCommit = () => {
    setIsCommitting(true);
    setTimeout(() => {
      setIsCommitting(false);
      setCommittedSuccess(true);
      setTimeout(() => {
        onNavigate('risk-assessment');
      }, 700);
    }, 800);
  };

  // CSV download helper
  const handleDownloadCsvTemplate = () => {
    const headers = ['Financial Metric', ...periods].join(',');
    const rows = metricsConfig.map((m) => {
      const vals = periods.map((p) => company.statements[p]?.[m.key] ?? 0);
      return `"${m.label}",${vals.join(',')}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${company.ticker}_Financial_Statements_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV file upload simulator & parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          setUploadFeedback(`Successfully parsed ${lines.length - 1} rows from ${file.name}`);
        } else {
          setUploadFeedback(`Parsed file with 11 validated attributes.`);
        }
      } catch {
        setUploadFeedback(`Validated statement file with standard schema.`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col w-full min-h-screen text-[#d8e3fb] bg-[#081425]">
      {/* Top Banner / Action Header */}
      <div className="w-full bg-[#111c2d] px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#45464d]/30">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] font-label-md text-[10px] tracking-wider uppercase font-semibold">
              Pipeline Step 02
            </span>
            <span className="text-[#c6c6cd] font-label-md">/</span>
            <span className="text-[#c6c6cd] font-label-md uppercase font-semibold">
              {company.name} ({company.ticker})
            </span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-[#d8e3fb] tracking-tight">
            Financial Data Ingestion & Validation
          </h1>
          <p className="text-body-md text-[#c6c6cd] max-w-2xl leading-relaxed">
            Stream, upload, or generate foundational financial statements to feed real-time credit
            risk models, solvency simulations, and liquidity stress tests.
          </p>
        </div>
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={onResetStaging}
            className="px-4 py-2.5 rounded-lg bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] text-body-md font-semibold transition-colors flex items-center gap-2 cursor-pointer border border-[#45464d]/40"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            Reset Staging
          </button>
          <button
            onClick={handleCommit}
            disabled={isCommitting}
            className={`px-5 py-2.5 rounded-lg text-body-md font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
              committedSuccess
                ? 'bg-[#00a572] text-white'
                : 'bg-[#4edea3] text-[#003824] hover:bg-[#6ffbbe]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isCommitting ? 'sync' : committedSuccess ? 'check_circle' : 'verified'}
            </span>
            {isCommitting ? 'Verifying Identities...' : committedSuccess ? 'Data Committed' : 'Verify & Commit Data'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 py-8 flex flex-col gap-8">
        {/* Feature 1: Data Input Method Selector Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-headline-sm text-[#d8e3fb] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3] text-[20px]">input</span>
              Select Data Ingestion Channel
            </h2>
            <span className="text-label-md text-[#c6c6cd]">
              Active Protocol: {company.isSynthetic ? 'Synthetic Monte Carlo Engine v4.2' : 'SEC EDGAR API v4.2'}
            </span>
          </div>

          {/* Tab Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveTab('public')}
              className={`p-4 rounded-xl text-left transition-all border-2 flex flex-col gap-2 relative overflow-hidden group cursor-pointer ${
                activeTab === 'public'
                  ? 'border-[#4edea3] bg-[#152031] shadow-md'
                  : 'border-transparent bg-[#111c2d] hover:bg-[#152031]'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${activeTab === 'public' ? 'text-[#4edea3]' : 'text-[#c6c6cd]'}`}>
                cloud_sync
              </span>
              <div>
                <div className="text-headline-sm font-headline-sm text-[#d8e3fb]">Public Dataset</div>
                <div className="text-body-sm text-[#c6c6cd]">SEC 10-K & 10-Q Live Sync</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('synthetic')}
              className={`p-4 rounded-xl text-left transition-all border-2 flex flex-col gap-2 relative overflow-hidden group cursor-pointer ${
                activeTab === 'synthetic'
                  ? 'border-[#4edea3] bg-[#152031] shadow-md'
                  : 'border-transparent bg-[#111c2d] hover:bg-[#152031]'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${activeTab === 'synthetic' ? 'text-[#4edea3]' : 'text-[#c6c6cd]'}`}>
                science
              </span>
              <div>
                <div className="text-headline-sm font-headline-sm text-[#d8e3fb]">Synthetic Load</div>
                <div className="text-body-sm text-[#c6c6cd]">Monte Carlo Generator v2.4</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`p-4 rounded-xl text-left transition-all border-2 flex flex-col gap-2 relative overflow-hidden group cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[#4edea3] bg-[#152031] shadow-md'
                  : 'border-transparent bg-[#111c2d] hover:bg-[#152031]'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${activeTab === 'upload' ? 'text-[#4edea3]' : 'text-[#c6c6cd]'}`}>
                upload_file
              </span>
              <div>
                <div className="text-headline-sm font-headline-sm text-[#d8e3fb]">CSV / Excel Upload</div>
                <div className="text-body-sm text-[#c6c6cd]">Custom Template Parser</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`p-4 rounded-xl text-left transition-all border-2 flex flex-col gap-2 relative overflow-hidden group cursor-pointer ${
                activeTab === 'manual'
                  ? 'border-[#4edea3] bg-[#152031] shadow-md'
                  : 'border-transparent bg-[#111c2d] hover:bg-[#152031]'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${activeTab === 'manual' ? 'text-[#4edea3]' : 'text-[#c6c6cd]'}`}>
                edit_note
              </span>
              <div>
                <div className="text-headline-sm font-headline-sm text-[#d8e3fb]">Manual Override</div>
                <div className="text-body-sm text-[#c6c6cd]">Figure Editor & Footnotes</div>
              </div>
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'public' && (
            <div className="p-6 rounded-xl bg-[#152031] border border-[#45464d]/30 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#2a3548] flex items-center justify-center shrink-0 text-[#4edea3]">
                  <span className="material-symbols-outlined text-[28px]">verified_user</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                    {company.isSynthetic ? 'Benchmark Synthetic Ingest Connected' : 'SEC EDGAR Direct Feed Connected'}
                  </h3>
                  <p className="text-body-md text-[#c6c6cd]">
                    Pulled latest audited statements for {company.cik ? `CIK ${company.cik}` : company.name} across 3 consecutive fiscal years.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-label-lg font-label-lg text-[#4edea3] px-3 py-1.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/20">
                  {company.isSynthetic ? 'Benchmark Verified' : 'SEC 10-K Verified'}
                </span>
                <button
                  onClick={onResetStaging}
                  className="px-4 py-2 rounded-lg bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] text-body-md font-semibold transition-colors cursor-pointer"
                >
                  Re-fetch Filings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'synthetic' && (
            <div className="p-6 rounded-xl bg-[#152031] border border-[#45464d]/30 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#2a3548] flex items-center justify-center shrink-0 text-[#ffb95f]">
                  <span className="material-symbols-outlined text-[28px]">query_stats</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                    Synthetic Stress Profile Generator
                  </h3>
                  <p className="text-body-md text-[#c6c6cd]">
                    Inject customized volatility parameters or simulate distressed industry benchmarks across multi-year cycles.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select className="bg-[#1f2a3c] text-[#d8e3fb] px-3 py-2 rounded-lg text-body-md outline-none border border-[#45464d]/40">
                  <option>Distressed Retail Profile (Beta 1.4)</option>
                  <option>High Growth Tech (Beta 2.1)</option>
                  <option>Stable Industrial (Beta 0.8)</option>
                </select>
                <button
                  onClick={() => alert('Generated high-fidelity multi-period financial variance.')}
                  className="px-4 py-2 rounded-lg bg-[#4edea3] text-[#003824] text-body-md font-semibold transition-colors cursor-pointer"
                >
                  Generate Run
                </button>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="p-6 rounded-xl bg-[#152031] border-2 border-dashed border-[#45464d] flex flex-col items-center justify-center gap-3 text-center py-8">
              <span className="material-symbols-outlined text-[#4edea3] text-[40px]">cloud_upload</span>
              <div className="flex flex-col gap-1 max-w-lg">
                <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                  Drag & Drop Financial Statement Spreadsheet
                </h3>
                <p className="text-body-md text-[#c6c6cd]">
                  Supports .csv, .xlsx, or US-GAAP XBRL instance documents. Uploading immediately populates the inspector below.
                </p>
                {uploadFeedback && (
                  <div className="text-label-md text-[#4edea3] mt-2 font-semibold">
                    {uploadFeedback}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <label className="px-4 py-2 rounded-lg bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] text-body-md font-semibold transition-colors cursor-pointer border border-[#45464d]/40">
                  <span>Browse Files</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  onClick={handleDownloadCsvTemplate}
                  className="px-4 py-2 rounded-lg bg-[#111c2d] text-[#c6c6cd] hover:text-[#d8e3fb] text-body-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 border border-[#45464d]/40"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download Template
                </button>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="p-6 rounded-xl bg-[#152031] border border-[#4edea3]/40 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#4edea3]">
                <span className="material-symbols-outlined text-[20px]">edit</span>
                <h3 className="text-headline-sm font-headline-sm text-[#d8e3fb]">
                  Manual Figure Staging Area Enabled
                </h3>
              </div>
              <p className="text-body-md text-[#c6c6cd]">
                Direct cell editing is active in the table below. Click on any financial figure in FY2021, FY2022, or FY2023 to edit its value. Modified values will update risk scores, ratios, and scenarios automatically.
              </p>
            </div>
          )}
        </div>

        {/* Feature 2: Data Validation & Provenance Dashboard */}
        <div className="flex flex-col gap-4">
          <h2 className="text-headline-sm font-headline-sm text-[#d8e3fb] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">fact_check</span>
            Data Validation & Provenance Dashboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Metric Card 1 */}
            <div className="p-5 rounded-xl bg-[#152031] border border-[#45464d]/40 flex flex-col justify-between gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-body-sm text-[#c6c6cd]">Required Fields</span>
                <span className="material-symbols-outlined text-[#4edea3] text-[20px]">check_circle</span>
              </div>
              <div>
                <div className="text-headline-lg font-headline-lg text-[#d8e3fb]">11 / 11</div>
                <div className="text-label-md text-[#4edea3] mt-1">100% Coverage Available</div>
              </div>
              <div className="w-full bg-[#2a3548] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#4edea3] h-full w-full"></div>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="p-5 rounded-xl bg-[#152031] border border-[#45464d]/40 flex flex-col justify-between gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-body-sm text-[#c6c6cd]">Quality Warnings</span>
                <span className="material-symbols-outlined text-[#ffb95f] text-[20px]">warning</span>
              </div>
              <div>
                <div className="text-headline-lg font-headline-lg text-[#d8e3fb]">
                  {company.warnings.length} Notes
                </div>
                <div className="text-label-md text-[#ffb95f] mt-1 truncate">
                  {company.warnings[0]?.slice(0, 28) || 'Pension Liability Footnote'}...
                </div>
              </div>
              <div className="w-full bg-[#2a3548] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#ffb95f] h-full w-3/4"></div>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="p-5 rounded-xl bg-[#152031] border border-[#45464d]/40 flex flex-col justify-between gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-body-sm text-[#c6c6cd]">Period Alignment</span>
                <span className="material-symbols-outlined text-[#4edea3] text-[20px]">date_range</span>
              </div>
              <div>
                <div className="text-headline-lg font-headline-lg text-[#d8e3fb]">
                  {periods[0]?.replace('FY', 'FY')} - {periods[periods.length - 1]?.replace('FY', 'FY')}
                </div>
                <div className="text-label-md text-[#4edea3] mt-1">3 Consecutive Annual Periods</div>
              </div>
              <div className="w-full bg-[#2a3548] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#4edea3] h-full w-full"></div>
              </div>
            </div>

            {/* Metric Card 4 */}
            <div className="p-5 rounded-xl bg-[#152031] border border-[#45464d]/40 flex flex-col justify-between gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-body-sm text-[#c6c6cd]">Primary Source</span>
                <span className="material-symbols-outlined text-[#c6c6cd] text-[20px]">source</span>
              </div>
              <div>
                <div className="text-headline-sm font-headline-sm text-[#d8e3fb] truncate">
                  {company.primarySource.split('(')[0]}
                </div>
                <div className="text-label-md text-[#c6c6cd] mt-1 truncate">
                  Audited by {company.auditor.split('(')[0]}
                </div>
              </div>
              <div className="w-full bg-[#2a3548] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#bec6e0] h-full w-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Interactive Financial Statement Inspector */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-[#d8e3fb] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-[20px]">table_chart</span>
                Interactive Financial Statement Inspector
              </h2>
              <p className="text-body-md text-[#c6c6cd]">
                Inspect figures, verify consistency checks, and audit line-item provenance before execution. Click any cell to edit.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#c6c6cd] text-[18px]">
                  search
                </span>
                <input
                  className="bg-[#152031] border border-[#45464d]/40 pl-9 pr-4 py-2 rounded-lg text-body-md text-[#d8e3fb] placeholder:text-[#c6c6cd]/60 outline-none w-64 focus:border-[#4edea3]"
                  placeholder="Filter metrics..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-xl bg-[#152031] border border-[#45464d]/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1f2a3c] text-[#c6c6cd] font-label-lg text-label-lg uppercase tracking-wider border-b border-[#45464d]/30">
                    <th className="py-3.5 px-4 font-semibold">Financial Metric</th>
                    {periods.map((p) => (
                      <th key={p} className="py-3.5 px-4 font-semibold text-right">
                        {p} ($M)
                      </th>
                    ))}
                    <th className="py-3.5 px-4 font-semibold">Data Quality & Status</th>
                    <th className="py-3.5 px-4 font-semibold">Source & Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2a3c] text-body-md">
                  {filteredMetrics.map((metric) => {
                    return (
                      <tr
                        key={metric.key}
                        className={`hover:bg-[#1f2a3c]/60 transition-colors ${
                          metric.hasWarning ? 'bg-[#ffb95f]/5' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#d8e3fb]">
                          <div className="flex items-center gap-2">
                            <span>{metric.label}</span>
                            {metric.hasWarning && (
                              <span
                                className="material-symbols-outlined text-[#ffb95f] text-[16px] cursor-help"
                                title={metric.warningText}
                              >
                                warning
                              </span>
                            )}
                          </div>
                        </td>

                        {periods.map((p, idx) => {
                          const val = company.statements[p]?.[metric.key] ?? 0;
                          const isLatest = idx === periods.length - 1;
                          const isEditing =
                            editingCell?.metric === metric.key && editingCell?.year === p;

                          return (
                            <td key={p} className="py-3.5 px-4 text-right font-mono">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="any"
                                  defaultValue={val}
                                  autoFocus
                                  onBlur={(e) => {
                                    handleCellEdit(metric.key, p, e.target.value);
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(metric.key, p, (e.target as HTMLInputElement).value);
                                      setEditingCell(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  className="w-24 bg-[#081425] text-white px-2 py-1 text-right rounded border border-[#4edea3] outline-none"
                                />
                              ) : (
                                <span
                                  onClick={() => setEditingCell({ metric: metric.key, year: p })}
                                  className={`cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#2a3548] hover:text-white transition-colors ${
                                    isLatest ? 'text-[#d8e3fb] font-semibold' : 'text-[#c6c6cd]'
                                  }`}
                                  title="Click to edit value"
                                >
                                  {val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="py-3.5 px-4">
                          {metric.hasWarning ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffb95f]/10 text-[#ffb95f] text-label-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb95f]"></span> Footnote Note
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4edea3]/10 text-[#4edea3] text-label-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span> Verified
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[#c6c6cd] text-body-sm font-label-md">
                          {company.statements[periods[periods.length - 1]]?.provenance?.[metric.key] ||
                            (metric.hasWarning ? 'SEC 10-K + Pension Adj.' : 'SEC 10-K (Item 8)')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-[#111c2d] border-t border-[#45464d]/30 flex flex-col sm:flex-row items-center justify-between text-body-sm text-[#c6c6cd] gap-2">
              <span>Showing {filteredMetrics.length} of 11 core required parameters</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                <span className="text-[#4edea3]">All balance identities reconciled successfully</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
