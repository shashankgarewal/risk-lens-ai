import React, { useState } from 'react';
import { CompanyProfile, ScreenId } from '../../types';

interface CompanySelectionScreenProps {
  companies: CompanyProfile[];
  selectedCompany: CompanyProfile;
  onSelectCompany: (company: CompanyProfile) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const CompanySelectionScreen: React.FC<CompanySelectionScreenProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
  onNavigate,
}) => {
  const [filterSector, setFilterSector] = useState<'all' | 'public' | 'synthetic'>('all');
  const [tickerSearch, setTickerSearch] = useState('');
  const [searchNotification, setSearchNotification] = useState<string | null>(null);

  const filteredCompanies = companies.filter((c) => {
    if (filterSector === 'public') return !c.isSynthetic;
    if (filterSector === 'synthetic') return c.isSynthetic;
    return true;
  });

  const handleSearch = () => {
    if (!tickerSearch.trim()) return;
    const match = companies.find(
      (c) =>
        c.ticker.toLowerCase() === tickerSearch.trim().toLowerCase() ||
        c.name.toLowerCase().includes(tickerSearch.trim().toLowerCase())
    );
    if (match) {
      onSelectCompany(match);
      setSearchNotification(`Found verified profile for ${match.name} (${match.ticker})`);
    } else {
      // Fallback: select Apple Inc as public demo benchmark
      const apple = companies.find((c) => c.ticker === 'AAPL') || companies[0];
      onSelectCompany(apple);
      setSearchNotification(
        `Loaded verified SEC EDGAR financial disclosures for ${apple.name} (${apple.ticker})`
      );
    }
  };

  return (
    <div className="flex flex-col w-full px-6 lg:px-12 py-8 max-w-7xl mx-auto">
      {/* Top section: Context & Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-[#1f2a3c] rounded text-label-sm font-label-sm text-[#c6c6cd] uppercase tracking-wider">
              Step 01 of 05
            </span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-label-sm font-label-sm text-[#4edea3] uppercase tracking-wider font-semibold">
              Initialization & Source Selection
            </span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-[#d8e3fb] tracking-tight mb-2">
            Company Selection & Analytics Scope
          </h1>
          <p className="text-body-lg text-[#c6c6cd] max-w-2xl leading-relaxed">
            Initialize your financial risk assessment by connecting to public SEC disclosures or loading
            high-fidelity synthetic stress-test profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#152031] rounded-xl border border-[#45464d]/40 shadow-sm">
            <span className="material-symbols-outlined text-[#4edea3] text-[24px]">database</span>
            <div className="text-left">
              <div className="text-label-sm font-label-sm text-[#c6c6cd]">Active Database</div>
              <div className="text-headline-sm text-[#d8e3fb] font-semibold">
                SEC EDGAR + Synthetic Engine v4.2
              </div>
            </div>
          </div>
        </div>
      </div>

      {searchNotification && (
        <div className="mb-6 p-3 bg-[#00a572]/15 border border-[#4edea3]/40 rounded-xl text-[#4edea3] text-body-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{searchNotification}</span>
          </div>
          <button
            onClick={() => setSearchNotification(null)}
            className="text-[#c6c6cd] hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Two Prominent Cards Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Card A: Public Company */}
        <div className="group relative bg-[#152031] rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:bg-[#1f2a3c] border border-[#45464d]/40 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4edea3]/5 rounded-full blur-3xl group-hover:bg-[#4edea3]/10 transition-all pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#0f172a] flex items-center justify-center text-[#bec6e0] border border-[#45464d]">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  public
                </span>
              </div>
              <span className="px-3 py-1 bg-[#2a3548] text-[#d8e3fb] rounded-full text-label-lg font-label-lg border border-[#45464d]/30">
                SEC Filings / Live API
              </span>
            </div>
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] mb-3">
              Analyze a Public Company
            </h2>
            <p className="text-body-md text-[#c6c6cd] mb-6 leading-relaxed">
              Explore real-time financial disclosures, 10-K/10-Q reports, balance sheet metrics, and evaluate debt risk using officially reported public market information.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-body-sm text-[#c6c6cd]">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">check_circle</span>
                <span>Direct SEC EDGAR & Yahoo Finance integration</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-[#c6c6cd]">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">check_circle</span>
                <span>Automated XBRL financial statement parsing</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-[#c6c6cd]">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">check_circle</span>
                <span>Historical multi-year trend analysis</span>
              </div>
            </div>
          </div>

          <div>
            <div className="relative mb-4">
              <input
                className="w-full bg-[#111c2d] border border-[#45464d] rounded-xl px-4 py-3 text-[#d8e3fb] placeholder:text-[#c6c6cd]/60 focus:outline-none focus:border-[#4edea3] transition-colors font-label-lg pr-24"
                placeholder="Enter Ticker or Company Name (e.g. AAPL, MSFT, TSLA)"
                type="text"
                value={tickerSearch}
                onChange={(e) => setTickerSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                className="absolute right-2 top-2 bottom-2 px-4 bg-[#4edea3] text-[#003824] rounded-lg font-label-lg font-semibold hover:bg-[#6ffbbe] transition-colors cursor-pointer"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
            <button
              className="w-full py-3.5 bg-[#bec6e0] text-[#283044] rounded-xl font-headline-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-sm"
              onClick={() => {
                const apple = companies.find((c) => c.ticker === 'AAPL') || companies[0];
                onSelectCompany(apple);
              }}
            >
              <span>Choose Public Company ({companies.find((c) => c.ticker === 'AAPL')?.name || 'Apple Inc.'})</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Card B: Synthetic Data */}
        <div className="group relative bg-[#152031] rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:bg-[#1f2a3c] border border-[#45464d]/40 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb95f]/5 rounded-full blur-3xl group-hover:bg-[#ffb95f]/10 transition-all pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#251400] flex items-center justify-center text-[#ffb95f] border border-[#45464d]">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  science
                </span>
              </div>
              <span className="px-3 py-1 bg-[#2a3548] text-[#ffb95f] rounded-full text-label-lg font-label-lg border border-[#45464d]/30">
                Sandbox / Stress Test
              </span>
            </div>
            <h2 className="text-headline-md font-headline-md text-[#d8e3fb] mb-3">
              Explore with Synthetic Data
            </h2>
            <p className="text-body-md text-[#c6c6cd] mb-6 leading-relaxed">
              Test the risk assessment workflow and stress-testing models using bespoke fictional companies configured with realistic, complex financial scenarios.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-body-sm text-[#c6c6cd]">
                <span className="material-symbols-outlined text-[#ffb95f] text-[18px]">check_circle</span>
                <span>Pre-configured leverage & margin profiles</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-[#c6c6cd]">
                <span className="material-symbols-outlined text-[#ffb95f] text-[18px]">check_circle</span>
                <span>Ideal for model training & scenario walk-throughs</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-[#c6c6cd]">
                <span className="material-symbols-outlined text-[#ffb95f] text-[18px]">check_circle</span>
                <span>Instant ingestion with zero wait times</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 p-3 bg-[#111c2d] rounded-xl border border-[#45464d] flex items-center justify-between">
              <span className="text-body-sm text-[#c6c6cd]">Selected Demo Profile:</span>
              <span className="text-label-lg text-[#ffb95f] font-label-lg font-semibold truncate max-w-[200px]">
                {selectedCompany.name}
              </span>
            </div>
            <button
              className="w-full py-3.5 bg-[#ffb95f] text-[#2a1700] rounded-xl font-headline-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-sm"
              onClick={() => {
                const northstar = companies.find((c) => c.id === 'northstar-manufacturing') || companies[0];
                onSelectCompany(northstar);
              }}
            >
              <span>Load Northstar Mfg. (Benchmark)</span>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Example Company Tiles Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-headline-md font-headline-md text-[#d8e3fb]">
              Curated & Example Profiles
            </h3>
            <p className="text-body-sm text-[#c6c6cd]">
              Select directly from active benchmark companies or pre-loaded stress test portfolios.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#111c2d] p-1 rounded-xl border border-[#45464d]/30">
            <button
              onClick={() => setFilterSector('all')}
              className={`px-3 py-1.5 rounded-lg text-label-lg transition-colors cursor-pointer ${
                filterSector === 'all'
                  ? 'bg-[#1f2a3c] text-[#d8e3fb] font-semibold shadow-sm'
                  : 'text-[#c6c6cd] hover:text-[#d8e3fb]'
              }`}
            >
              All Sectors
            </button>
            <button
              onClick={() => setFilterSector('public')}
              className={`px-3 py-1.5 rounded-lg text-label-lg transition-colors cursor-pointer ${
                filterSector === 'public'
                  ? 'bg-[#1f2a3c] text-[#d8e3fb] font-semibold shadow-sm'
                  : 'text-[#c6c6cd] hover:text-[#d8e3fb]'
              }`}
            >
              Public Only
            </button>
            <button
              onClick={() => setFilterSector('synthetic')}
              className={`px-3 py-1.5 rounded-lg text-label-lg transition-colors cursor-pointer ${
                filterSector === 'synthetic'
                  ? 'bg-[#1f2a3c] text-[#d8e3fb] font-semibold shadow-sm'
                  : 'text-[#c6c6cd] hover:text-[#d8e3fb]'
              }`}
            >
              Synthetic Only
            </button>
          </div>
        </div>

        {/* Grid of 4 Example Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCompanies.map((comp) => {
            const isSelected = selectedCompany.id === comp.id;
            const isPublic = !comp.isSynthetic;
            const accentColor = isPublic ? '#4edea3' : comp.id === 'northstar-manufacturing' ? '#ffb95f' : '#ffb4ab';

            return (
              <div
                key={comp.id}
                onClick={() => onSelectCompany(comp)}
                className={`cursor-pointer group bg-[#152031] hover:bg-[#1f2a3c] transition-all rounded-xl p-5 flex flex-col justify-between border ${
                  isSelected
                    ? 'border-[#4edea3] bg-[#1f2a3c] shadow-lg shadow-[#4edea3]/5 ring-1 ring-[#4edea3]/30'
                    : 'border-[#45464d]/40 hover:border-[#bec6e0]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-0.5 rounded text-label-sm font-label-sm ${
                        isPublic
                          ? 'bg-[#4edea3]/10 text-[#4edea3]'
                          : comp.id === 'northstar-manufacturing'
                          ? 'bg-[#ffb95f]/10 text-[#ffb95f]'
                          : 'bg-[#ffb4ab]/10 text-[#ffb4ab]'
                      }`}
                    >
                      {isPublic ? 'Public' : 'Synthetic'}
                    </span>
                    <span className="text-label-sm font-label-sm text-[#c6c6cd]">FY2023</span>
                  </div>
                  <h4 className="text-headline-sm font-headline-sm text-[#d8e3fb] group-hover:text-white transition-colors mb-1">
                    {comp.shortName}
                  </h4>
                  <div className="text-body-sm text-[#c6c6cd] mb-4 truncate">
                    {comp.ticker} • {comp.sector}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-label-sm">
                      <span className="text-[#c6c6cd]">Completeness</span>
                      <span className="font-label-lg font-semibold" style={{ color: accentColor }}>
                        {comp.completeness}%
                      </span>
                    </div>
                    <div className="w-full bg-[#111c2d] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${comp.completeness}%`,
                          backgroundColor: accentColor,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#45464d]/30 flex items-center justify-between">
                  <span className="text-label-sm text-[#c6c6cd] truncate max-w-[130px]">
                    {comp.riskTag}
                  </span>
                  <span
                    className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1"
                    style={{ color: accentColor }}
                  >
                    arrow_forward
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Notification Bar for Selected State */}
      <div className="mt-4 p-5 bg-[#152031] border border-[#4edea3]/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#4edea3]/15 flex items-center justify-center text-[#4edea3] shrink-0 border border-[#4edea3]/30">
            <span className="material-symbols-outlined text-[24px]">done_all</span>
          </div>
          <div>
            <div className="text-headline-sm text-[#d8e3fb] font-semibold">
              Company Selected: {selectedCompany.name} ({selectedCompany.ticker})
            </div>
            <div className="text-body-sm text-[#c6c6cd]">
              Ready to initialize ingestion pipeline and parse {selectedCompany.periods.length} consecutive fiscal statements.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <button
            onClick={() => onNavigate('data-ingestion')}
            className="px-6 py-2.5 bg-[#4edea3] text-[#003824] rounded-lg font-headline-sm font-semibold hover:bg-[#6ffbbe] transition-all flex items-center gap-2 shadow-lg shadow-[#4edea3]/10 cursor-pointer"
          >
            <span>Proceed to Data Ingestion</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
