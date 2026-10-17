import React, { useState, useMemo } from 'react';
import { CompanyProfile, FinancialYearData, ScenarioParameters, ScreenId } from './types';
import { INITIAL_COMPANIES } from './data/companyFixtures';
import { assessCompanyRisk } from './services/riskScoringEngine';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CompanySelectionScreen } from './components/screens/CompanySelectionScreen';
import { DataIngestionScreen } from './components/screens/DataIngestionScreen';
import { RiskAssessmentScreen } from './components/screens/RiskAssessmentScreen';
import { ScenarioExplorerScreen } from './components/screens/ScenarioExplorerScreen';
import { FinalReportScreen } from './components/screens/FinalReportScreen';

export default function App() {
  const [companies, setCompanies] = useState<CompanyProfile[]>(INITIAL_COMPANIES);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('northstar-manufacturing');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('company-selection');
  const [savedScenarioParams, setSavedScenarioParams] = useState<ScenarioParameters | undefined>();

  // Current active company
  const selectedCompany = useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  // Real-time risk assessment derived from current financial statement state
  const currentAssessment = useMemo(() => {
    return assessCompanyRisk(selectedCompany);
  }, [selectedCompany]);

  // Update company statements handler (e.g. from Data Ingestion editing or upload)
  const handleUpdateStatements = (newStatements: { [year: string]: FinancialYearData }) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === selectedCompany.id) {
          return {
            ...c,
            statements: newStatements,
          };
        }
        return c;
      })
    );
  };

  // Reset staging figures back to initial fixtures
  const handleResetStaging = () => {
    const original = INITIAL_COMPANIES.find((c) => c.id === selectedCompany.id);
    if (!original) return;

    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === selectedCompany.id) {
          return {
            ...c,
            statements: JSON.parse(JSON.stringify(original.statements)),
          };
        }
        return c;
      })
    );
  };

  const handleSelectCompany = (comp: CompanyProfile) => {
    setSelectedCompanyId(comp.id);
  };

  return (
    <div className="min-h-screen bg-[#081425] text-[#d8e3fb] flex flex-col font-sans selection:bg-[#4edea3]/30 selection:text-white">
      {/* Fixed Navigation Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        selectedCompanyName={selectedCompany.shortName}
      />

      {/* Main Screen Viewport */}
      <main className="w-full pt-16 flex-1 flex flex-col">
        {currentScreen === 'company-selection' && (
          <CompanySelectionScreen
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={handleSelectCompany}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'data-ingestion' && (
          <DataIngestionScreen
            company={selectedCompany}
            onUpdateCompanyStatements={handleUpdateStatements}
            onResetStaging={handleResetStaging}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'risk-assessment' && (
          <RiskAssessmentScreen
            company={selectedCompany}
            assessment={currentAssessment}
            onNavigate={setCurrentScreen}
            onSelectInvestigation={(_title) => {
              setCurrentScreen('scenario-explorer');
            }}
          />
        )}

        {currentScreen === 'scenario-explorer' && (
          <ScenarioExplorerScreen
            company={selectedCompany}
            onNavigate={setCurrentScreen}
            onSaveScenarioToReport={(params) => setSavedScenarioParams(params)}
          />
        )}

        {currentScreen === 'final-report' && (
          <FinalReportScreen
            company={selectedCompany}
            assessment={currentAssessment}
            savedScenarioParams={savedScenarioParams}
          />
        )}
      </main>

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}
