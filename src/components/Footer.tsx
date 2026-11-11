import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: 'scanner' | 'analytics' | 'metrics' | 'education' | 'docs') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#080d1a] py-8 mt-16 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">PhishGuard</span>
          <span>·</span>
          <span>Phishing Email Detection System</span>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setActiveTab('scanner')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Model Performance
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Threat Intel
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            API Docs
          </button>
        </div>

        <div>
          <span>Scikit-Learn · TF-IDF · Logistic Regression</span>
        </div>

      </div>
    </footer>
  );
};
