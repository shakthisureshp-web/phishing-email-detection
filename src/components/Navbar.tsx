import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'analytics' | 'metrics' | 'education' | 'docs';
  setActiveTab: (tab: 'scanner' | 'analytics' | 'metrics' | 'education' | 'docs') => void;
  onQuickSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickSample }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#080d1a]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div 
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-3 cursor-pointer group whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/60 transition-colors">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Phish<span className="text-emerald-400">Guard</span>
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 Navigation Links (Single-Line, clean hover) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'scanner'
                ? 'text-emerald-400 border-emerald-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Email Scanner
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'analytics'
                ? 'text-emerald-400 border-emerald-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Dashboard Analytics
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'metrics'
                ? 'text-emerald-400 border-emerald-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            ML Model Metrics
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'education'
                ? 'text-emerald-400 border-emerald-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Threat Intelligence
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === 'docs'
                ? 'text-emerald-400 border-emerald-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            API & Architecture
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickSample}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm shadow-emerald-500/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Load Phishing Demo</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-slate-800/60 overflow-x-auto text-xs gap-3">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'scanner' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}
        >
          Scanner
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'analytics' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'metrics' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}
        >
          ML Metrics
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'education' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}
        >
          Threat Intel
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'docs' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}
        >
          Docs
        </button>
      </div>
    </header>
  );
};
