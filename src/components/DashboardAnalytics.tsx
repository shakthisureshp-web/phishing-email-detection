import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { clearHistory } from '../services/api';
import { ShieldCheck, ShieldAlert, BarChart3, Clock, Download, Trash2, Search, Filter } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DashboardAnalyticsProps {
  history: HistoryItem[];
  stats: {
    total_analyzed: number;
    phishing_detected: number;
    safe_detected: number;
    suspicious_detected: number;
    detection_rate: number;
  };
  onRefreshHistory: () => void;
  onInspectHistoryItem: (item: HistoryItem) => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  history,
  stats,
  onRefreshHistory,
  onInspectHistoryItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PHISHING' | 'SAFE' | 'SUSPICIOUS'>('ALL');
  const [isClearing, setIsClearing] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || item.classification === filterType;
    return matchesSearch && matchesType;
  });

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear scan history?')) return;
    setIsClearing(true);
    try {
      await clearHistory();
      onRefreshHistory();
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Scan ID', 'Classification', 'Risk Level', 'Confidence %', 'Sender', 'Subject', 'Timestamp'];
    const rows = history.map((h) => [
      h.id,
      h.classification,
      h.risk_level,
      h.confidence,
      `"${h.sender.replace(/"/g, '""')}"`,
      `"${h.subject.replace(/"/g, '""')}"`,
      h.timestamp,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phishguard_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pieData = [
    { name: 'Phishing', value: stats.phishing_detected, color: '#ef4444' },
    { name: 'Suspicious', value: stats.suspicious_detected || 0, color: '#f59e0b' },
    { name: 'Safe', value: stats.safe_detected, color: '#10b981' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Security Analytics & Telemetry
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated metrics across analyzed email payloads and detected threat vectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleClearHistory}
            disabled={history.length === 0 || isClearing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/40 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Analyzed */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Total Analyzed
          </span>
          <div className="text-3xl font-bold font-mono tabular-nums text-white">
            {stats.total_analyzed}
          </div>
          <p className="text-[11px] text-slate-500">
            Total payloads processed in this session
          </p>
        </div>

        {/* Phishing Detected */}
        <div className="bg-[#0b1120] border border-rose-900/40 rounded-xl p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Phishing Threats
          </span>
          <div className="text-3xl font-bold font-mono tabular-nums text-rose-400">
            {stats.phishing_detected}
          </div>
          <p className="text-[11px] text-slate-500">
            High & critical risk adversarial lures
          </p>
        </div>

        {/* Safe Detected */}
        <div className="bg-[#0b1120] border border-emerald-900/40 rounded-xl p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Safe / Legitimate
          </span>
          <div className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
            {stats.safe_detected}
          </div>
          <p className="text-[11px] text-slate-500">
            Non-adversarial correspondence
          </p>
        </div>

        {/* Threat Detection Rate */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Threat Detection Rate
          </span>
          <div className="text-3xl font-bold font-mono tabular-nums text-white">
            {stats.detection_rate}%
          </div>
          <p className="text-[11px] text-slate-500">
            Ratio of malicious to total scanned
          </p>
        </div>
      </div>

      {/* Visual Chart & Threat Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie / Donut Chart */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Classification Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current session distribution
            </p>
          </div>

          <div className="h-48 my-3 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 text-center">
                No scans recorded yet
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center text-xs">
            <div>
              <span className="text-rose-400 font-bold font-mono block tabular-nums">
                {stats.phishing_detected}
              </span>
              <span className="text-slate-400 text-[10px]">Phishing</span>
            </div>
            <div>
              <span className="text-amber-400 font-bold font-mono block tabular-nums">
                {stats.suspicious_detected || 0}
              </span>
              <span className="text-slate-400 text-[10px]">Suspicious</span>
            </div>
            <div>
              <span className="text-emerald-400 font-bold font-mono block tabular-nums">
                {stats.safe_detected}
              </span>
              <span className="text-slate-400 text-[10px]">Safe</span>
            </div>
          </div>
        </div>

        {/* Security Posture & Architecture Diagram */}
        <div className="lg:col-span-2 bg-[#0b1120] border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-white">
              PhishGuard Active Threat Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-stage heuristics, TF-IDF lexical indexing, and logistic regression decision boundary.
            </p>
          </div>

          <div className="relative my-3 rounded-lg overflow-hidden border border-slate-800/80 max-h-48">
            <img
              src="/src/assets/images/phishguard_threat_map_1794373784018.jpg"
              alt="PhishGuard Threat Pipeline"
              className="w-full h-48 object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Stage 1</span>
              <p className="font-medium text-white">Payload Tokenization</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Stage 2</span>
              <p className="font-medium text-white">TF-IDF N-grams (1-2)</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Stage 3</span>
              <p className="font-medium text-white">Sigmoid Classification</p>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Analysis History Table */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Recent Analysis History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Log of inspected emails. Click any item to inspect full details.
            </p>
          </div>

          {/* Search & Filter controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject or sender..."
                className="bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>

            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2 py-1 rounded transition-colors ${filterType === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('PHISHING')}
                className={`px-2 py-1 rounded transition-colors ${filterType === 'PHISHING' ? 'bg-rose-950 text-rose-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Phishing
              </button>
              <button
                onClick={() => setFilterType('SAFE')}
                className={`px-2 py-1 rounded transition-colors ${filterType === 'SAFE' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Safe
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Risk</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Sender</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  const isPhish = item.classification === 'PHISHING';
                  const isSus = item.classification === 'SUSPICIOUS';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onInspectHistoryItem(item)}
                      className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            isPhish ? 'text-rose-400' : isSus ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.classification}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-300">
                        {item.risk_level}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums text-slate-200 font-semibold">
                        {item.confidence}%
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-slate-200 font-medium">
                        {item.subject}
                      </td>
                      <td className="py-3 px-3 max-w-[160px] truncate font-mono text-slate-400 text-[11px]">
                        {item.sender}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <span className="text-emerald-400 hover:text-emerald-300 font-medium">
                          View →
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching analysis records found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
