import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#111c2d] py-8 border-t border-[#45464d]/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center text-[#c6c6cd] text-body-sm gap-4">
        <span>© 2024 RiskLens AI. Enterprise Corporate Risk Analytics Platform.</span>
        <div className="flex items-center gap-4">
          <span className="font-label-md text-[#4edea3]/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
            SEC EDGAR + Synthetic Engine v4.2
          </span>
          <span className="font-label-lg text-[#c6c6cd]">SECURE 256-BIT SSL</span>
        </div>
      </div>
    </footer>
  );
};
