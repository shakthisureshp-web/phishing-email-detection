import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScannerSection } from './components/ScannerSection';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { ModelPerformance } from './components/ModelPerformance';
import { EducationalSection } from './components/EducationalSection';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { Footer } from './components/Footer';
import { AnalysisResult, HistoryItem, ModelMetrics, SampleEmail } from './types';
import { getHistory, getModelMetrics, getSampleEmails } from './services/api';
import { X, ShieldAlert, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'analytics' | 'metrics' | 'education' | 'docs'>('scanner');
  const [samples, setSamples] = useState<SampleEmail[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState({
    total_analyzed: 3,
    phishing_detected: 1,
    safe_detected: 2,
    suspicious_detected: 0,
    detection_rate: 33.3,
  });
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  // Initial data loading
  useEffect(() => {
    getSampleEmails().then(setSamples).catch(console.error);
    refreshHistoryData();
    getModelMetrics().then(setMetrics).catch(console.error);
  }, []);

  const refreshHistoryData = async () => {
    try {
      const data = await getHistory();
      setHistory(data.history);
      setStats(data.stats);
    } catch (err) {
      console.warn('Could not refresh history:', err);
    }
  };

  const handleAnalysisComplete = (newResult: AnalysisResult) => {
    refreshHistoryData();
  };

  const handleQuickSampleDemo = () => {
    setActiveTab('scanner');
    if (samples.length > 0) {
      const phishSample = samples.find(s => s.label === 1) || samples[0];
      // Scanner handles sample selection via quick-load buttons
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickSample={handleQuickSampleDemo}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {activeTab === 'scanner' && (
          <ScannerSection
            samples={samples}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {activeTab === 'analytics' && (
          <DashboardAnalytics
            history={history}
            stats={stats}
            onRefreshHistory={refreshHistoryData}
            onInspectHistoryItem={(item) => setSelectedHistoryItem(item)}
          />
        )}

        {activeTab === 'metrics' && (
          <ModelPerformance
            metrics={metrics}
            onMetricsUpdated={(newMetrics) => setMetrics(newMetrics)}
          />
        )}

        {activeTab === 'education' && (
          <EducationalSection />
        )}

        {activeTab === 'docs' && (
          <ArchitectureDocs />
        )}

      </main>

      {/* History Detail Modal (when clicked from table) */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedHistoryItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                {selectedHistoryItem.classification === 'PHISHING' ? (
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                ) : selectedHistoryItem.classification === 'SUSPICIOUS' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                )}
              </div>
              <div>
                <span className={`text-xl font-bold ${
                  selectedHistoryItem.classification === 'PHISHING'
                    ? 'text-rose-400'
                    : selectedHistoryItem.classification === 'SUSPICIOUS'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {selectedHistoryItem.classification}
                </span>
                <span className="text-xs text-slate-400 block font-mono">
                  Risk Level: {selectedHistoryItem.risk_level} · Confidence: {selectedHistoryItem.confidence}%
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Subject:</span>
                <p className="text-white font-medium">{selectedHistoryItem.subject}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Sender:</span>
                <p className="text-slate-300 font-mono">{selectedHistoryItem.sender}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Timestamp:</span>
                <p className="text-slate-400 font-mono">
                  {new Date(selectedHistoryItem.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Payload Preview:</span>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed font-mono text-[11px]">
                  {selectedHistoryItem.snippet}
                </p>
              </div>
              {selectedHistoryItem.reasons && selectedHistoryItem.reasons.length > 0 && (
                <div>
                  <span className="text-slate-400 block font-mono mb-1">Key Rationale:</span>
                  <ul className="space-y-1 text-slate-300">
                    {selectedHistoryItem.reasons.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">▸</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Close Audit Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Clean Footer */}
      <Footer setActiveTab={setActiveTab} />

    </div>
  );
}
