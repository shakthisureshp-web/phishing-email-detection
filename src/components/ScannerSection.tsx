import React, { useState } from 'react';
import { AnalysisResult, SampleEmail } from '../types';
import { analyzeEmail } from '../services/api';
import { ResultCard } from './ResultCard';
import { Shield, Sparkles, Trash2, ArrowRight, AlertCircle, FileText, Send, Mail } from 'lucide-react';

interface ScannerSectionProps {
  samples: SampleEmail[];
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const ScannerSection: React.FC<ScannerSectionProps> = ({
  samples,
  onAnalysisComplete,
}) => {
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);

  const handleSelectSample = (sample: SampleEmail) => {
    setSubject(sample.subject);
    setSender(sample.sender);
    setBody(sample.body);
    setActiveSampleId(sample.id);
    setError(null);
  };

  const handleClear = () => {
    setSubject('');
    setSender('');
    setBody('');
    setResult(null);
    setError(null);
    setActiveSampleId(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() && !body.trim()) {
      setError('Please provide an email subject or email content to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeEmail({ subject, body, sender });
      setResult(data.result);
      onAnalysisComplete(data.result);
    } catch (err: any) {
      setError(err.message || 'Error executing ML threat analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1322] p-6 sm:p-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>AI-POWERED THREAT INTELLIGENCE</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">TF-IDF Vectorization & Logistic Regression</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Detect Phishing. <span className="text-emerald-400">Stay Protected.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            PhishGuard inspects inbound emails against trained machine learning classifiers, evaluating
            linguistic urgency cues, deceptive sender patterns, and credential-harvesting hyperlinks before
            they compromise your network.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Full Scikit-Learn Pipeline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Zero External Telemetry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Deep Domain Reputation Check</span>
            </div>
          </div>
        </div>

        {/* Ambient Hero Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block opacity-35 pointer-events-none">
          <img
            src="/src/assets/images/phishguard_hero_banner_1794373783218.jpg"
            alt="PhishGuard Security Center"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1322] via-[#0c1322]/80 to-transparent" />
        </div>
      </div>

      {/* Quick Sample Selector */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Quick-Load Sample Datasets
          </span>
          <span className="text-[11px] text-slate-400">
            Click any sample below to populate the scanner
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {samples.slice(0, 6).map((s) => {
            const isPhish = s.label === 1;
            const isSelected = activeSampleId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSample(s)}
                className={`text-left p-3 rounded-lg border transition-all text-xs space-y-1 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${isPhish ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isPhish ? '● Phishing Threat' : '○ Legitimate Email'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {s.type}
                  </span>
                </div>
                <div className="text-slate-200 font-medium truncate">
                  {s.subject}
                </div>
                <div className="text-slate-400 font-mono text-[11px] truncate">
                  {s.sender}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Input Form */}
      <form onSubmit={handleAnalyze} className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            Email Threat Inspection Input
          </h2>
          <div className="text-xs text-slate-400">
            Untrusted payload sandbox mode
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sender Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Sender Email Address</span>
              <span className="text-[11px] text-slate-400 font-normal">e.g. security-update@service.xyz</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="sender@domain.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Email Subject Line</span>
              <span className="text-[11px] text-slate-400 font-normal">Included in TF-IDF extraction</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. URGENT: Verify your billing information immediately"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Email Body Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Raw Email Body & Content
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {body.length} characters · {body.trim() ? body.trim().split(/\s+/).length : 0} words
            </span>
          </div>
          <textarea
            rows={7}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste complete email body text or message headers here for lexical, URL, and syntactic evaluation..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors leading-relaxed"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Strict privacy: Input processed locally. Never sent to commercial third parties.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!subject && !body && !sender)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-400 bg-slate-800/80 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer w-1/3 sm:w-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              disabled={loading || (!subject.trim() && !body.trim())}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Classifying Vectors...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>

      {/* Prediction Output Section */}
      {result && (
        <ResultCard
          result={result}
          onReset={handleClear}
        />
      )}

    </div>
  );
};
