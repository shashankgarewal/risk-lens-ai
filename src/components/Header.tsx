import React from 'react';
import { ScreenId } from '../types';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  selectedCompanyName?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate }) => {
  const navItems: { id: ScreenId; label: string }[] = [
    { id: 'company-selection', label: 'Company Selection' },
    { id: 'data-ingestion', label: 'Data Ingestion' },
    { id: 'risk-assessment', label: 'Risk Assessment' },
    { id: 'scenario-explorer', label: 'Scenario Explorer' },
    { id: 'final-report', label: 'Final Report' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#081425]/90 backdrop-blur-xl border-b border-[#45464d]/30 shadow-[0_1px_8px_rgba(0,0,0,0.2)]">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('company-selection')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#152031] border border-[#45464d]/60 flex items-center justify-center text-[#4edea3] shadow-inner group-hover:border-[#4edea3] transition-colors">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
          <span className="text-headline-sm font-semibold tracking-tight text-[#d8e3fb]">
            RiskLens AI
          </span>
        </div>

        {/* Top Bar Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 text-body-md transition-all rounded-lg whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#0f172a] text-[#bec6e0] font-semibold border border-[#45464d]/40 shadow-sm'
                    : 'text-[#c6c6cd] hover:text-[#d8e3fb] hover:bg-[#1f2a3c]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Status & User */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1f2a3c] rounded-full border border-[#45464d]/50">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span className="font-label-md text-[#d8e3fb]">API: Live</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#bec6e0] flex items-center justify-center text-[#283044] shadow-sm">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
