import React from 'react';
import { AnalysisResult } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Link2, Key, Info, ExternalLink, CheckCircle2 } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const isPhishing = result.classification === 'PHISHING';
  const isSuspicious = result.classification === 'SUSPICIOUS';
  const isSafe = result.classification === 'SAFE';

  // Status-driven styling
  const statusConfig = isPhishing
    ? {
        border: 'border-rose-500/50',
        bg: 'bg-rose-950/20',
        text: 'text-rose-400',
        badgeBg: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
        accentBar: 'bg-rose-500',
        icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
        headline: 'Phishing Threat Detected',
        summary: 'High probability malicious email engineered to extract credentials or compromise security.'
      }
    : isSuspicious
    ? {
        border: 'border-amber-500/50',
        bg: 'bg-amber-950/20',
        text: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
        accentBar: 'bg-amber-500',
        icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
        headline: 'Suspicious Email Content',
        summary: 'Contains anomalous urgency triggers or unverified external domains. Verification recommended.'
      }
    : {
        border: 'border-emerald-500/50',
        bg: 'bg-emerald-950/20',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
        accentBar: 'bg-emerald-500',
        icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
        headline: 'Email Classified as Safe',
        summary: 'Content patterns and sender profile match legitimate, non-adversarial correspondence.'
      };

  return (
    <div className={`mt-8 rounded-xl border ${statusConfig.border} ${statusConfig.bg} p-6 sm:p-8 space-y-6 transition-all duration-300`}>
      
      {/* Top Banner: Classification & Confidence */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
            {statusConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${statusConfig.text}`}>
                {result.classification}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${statusConfig.badgeBg}`}>
                RISK LEVEL: {result.risk_level}
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1.5 max-w-xl">
              {statusConfig.summary}
            </p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="flex flex-col sm:items-end justify-center bg-slate-900/80 p-4 rounded-lg border border-slate-800 min-w-[190px]">
          <span className="text-xs uppercase tracking-wider text-slate-400">ML Confidence Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {result.confidence_percentage}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full ${statusConfig.accentBar} transition-all duration-700`}
              style={{ width: `${Math.min(100, result.confidence_percentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Defense-in-Depth Disclaimer: </span>
          {result.safety_disclaimer} Never enter credentials on unverified third-party pages.
        </div>
      </div>

      {/* Grid: Explanations & Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Reasons & Rationale */}
        <div className="bg-[#0b1120] rounded-lg border border-slate-800/90 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Analysis Explanation & Rationale
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {result.reasons && result.reasons.length > 0 ? (
              result.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 mt-0.5">▸</span>
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">Standard language structure verified across model feature sets.</li>
            )}
          </ul>

          {/* Sender Audit */}
          <div className="pt-3 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 block mb-1">Sender Integrity Audit:</span>
            <div className="font-mono text-slate-200 bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800 break-all">
              {result.sender_analysis.sender || 'Sender not specified'}
            </div>
            {result.sender_analysis.flags.length > 0 ? (
              <div className="mt-2 space-y-1">
                {result.sender_analysis.flags.map((flag, idx) => (
                  <p key={idx} className="text-rose-400 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{flag}</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-emerald-400 text-[11px] mt-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                <span>No overt sender typosquatting or provider mismatches.</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Detected Keywords & Urgency Signals */}
        <div className="bg-[#0b1120] rounded-lg border border-slate-800/90 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            Detected Keywords & Language Signals
          </h4>

          {result.detected_keywords && result.detected_keywords.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs text-slate-400">Trigger terms identified in TF-IDF vocabulary:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {result.detected_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2.5 py-1 rounded font-mono ${
                      kw.severity === 'Critical'
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                        : kw.severity === 'High'
                        ? 'bg-amber-950/40 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    "{kw.term}" <span className="text-[10px] text-slate-400">({kw.category})</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No high-risk credential harvesting or coercive keywords identified.
            </p>
          )}

          {result.urgency_cues && result.urgency_cues.length > 0 && (
            <div className="pt-3 border-t border-slate-800/60 text-xs">
              <span className="text-slate-400 block mb-1">Urgency & Psychological Pressure Triggers:</span>
              <div className="flex flex-wrap gap-1.5">
                {result.urgency_cues.map((cue, idx) => (
                  <span key={idx} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
                    {cue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Model Probability Breakdown */}
          <div className="pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">TF-IDF ML Weight</span>
              <span className="font-mono text-white text-sm font-semibold tabular-nums">
                {(result.raw_ml_probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Composite Heuristic</span>
              <span className="font-mono text-white text-sm font-semibold tabular-nums">
                {(result.composite_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* URL Deep Analysis Table */}
      <div className="bg-[#0b1120] rounded-lg border border-slate-800/90 p-5 space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-400" />
            Embedded URL & Domain Safety Inspection
          </span>
          <span className="text-xs font-mono text-slate-400">
            {result.urls_detected?.length || 0} links found
          </span>
        </h4>

        {result.urls_detected && result.urls_detected.length > 0 ? (
          <div className="space-y-2.5 mt-2">
            {result.urls_detected.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  item.threat_level === 'High'
                    ? 'bg-rose-950/20 border-rose-800/50 text-rose-200'
                    : item.threat_level === 'Medium'
                    ? 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-mono text-xs break-all flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span>{item.url}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                    item.threat_level === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : item.threat_level === 'Medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {item.threat_level.toUpperCase()} RISK ({item.risk_score}/100)
                  </span>
                </div>

                {item.flags && item.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.flags.map((flag, fIdx) => (
                      <span key={fIdx} className="text-[10px] bg-slate-900/90 px-2 py-0.5 rounded text-rose-300 border border-rose-800/40">
                        ⚠ {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">
            No external hyperlinks detected in email body or subject.
          </p>
        )}
      </div>

      {/* Remediation & Next Steps */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-400">
          Recommended Action: <strong className="text-white">
            {isPhishing
              ? 'Block sender, do NOT click any links or download attachments, and report to your Security Operations Center (SOC).'
              : isSuspicious
              ? 'Verify sender via a secondary communication channel (phone, internal chat) prior to responding.'
              : 'Safe to proceed with normal processing.'}
          </strong>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Scan Another Email
        </button>
      </div>

    </div>
  );
};
