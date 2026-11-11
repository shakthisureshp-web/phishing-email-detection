import React from 'react';
import { Terminal, Code, Cpu, Server, ShieldCheck, ArrowRight } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Terminal className="w-7 h-7 text-emerald-400" />
          System Architecture & Technical API Documentation
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Specification of the machine learning pipeline, Python Flask microservice, TF-IDF feature extraction, and REST interfaces.
        </p>
      </div>

      {/* ML Pipeline Flow Diagram */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          End-to-End Machine Learning Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Step 1</span>
            <h4 className="text-xs font-bold text-white">Ingestion & Tokenization</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Accepts subject, body, and sender address. Strips HTML markup, lowercases, and segments into unigram and bigram token streams.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Step 2</span>
            <h4 className="text-xs font-bold text-white">TF-IDF Vectorization</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculates sublinear term frequencies and inverse document frequencies across a vocabulary of 1,200 n-grams with L2 normalization.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Step 3</span>
            <h4 className="text-xs font-bold text-white">Logistic Regression</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Passes dot product through the sigmoid activation function: P(y=1|x) = 1 / (1 + e^-(w·x + b)), outputting calibrated probability.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Step 4</span>
            <h4 className="text-xs font-bold text-white">Heuristic Verification</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesizes raw ML score with URL lexical anomalies (IP links, suspicious TLDs, typosquatting) and sender domain authenticity.
            </p>
          </div>
        </div>
      </div>

      {/* REST API Endpoints Specification */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          REST API Interface Specification
        </h3>

        <div className="space-y-4">
          
          {/* POST /api/analyze */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                POST
              </span>
              <span className="font-mono text-xs text-white">/api/analyze</span>
              <span className="text-xs text-slate-400">· Analyze raw email payload for phishing indicators</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-300">Request Body (JSON):</span>
              <pre className="p-3 rounded bg-[#080d1a] border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`{
  "subject": "URGENT: Your PayPal Account Has Been Suspended",
  "sender": "service-security@paypal-update-alert.xyz",
  "body": "We detected unauthorized login attempts. Click here: http://paypal.security-verification.xyz"
}`}
              </pre>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-300">Response (JSON):</span>
              <pre className="p-3 rounded bg-[#080d1a] border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`{
  "result": {
    "classification": "PHISHING",
    "confidence_percentage": 98.4,
    "risk_level": "CRITICAL",
    "raw_ml_probability": 0.7071,
    "detected_keywords": [
      { "term": "urgent", "category": "Urgency & Coercion", "severity": "High" },
      { "term": "verify", "category": "Credential Extraction", "severity": "Critical" }
    ],
    "urls_detected": [
      {
        "url": "http://paypal.security-verification.xyz",
        "domain": "paypal.security-verification.xyz",
        "threat_level": "High",
        "risk_score": 60,
        "flags": ["Suspicious low-reputation TLD", "Brand typosquatting"]
      }
    ],
    "reasons": [
      "Direct request for sensitive credentials detected.",
      "Embedded links contain deceptive hosts."
    ]
  }
}`}
              </pre>
            </div>
          </div>

          {/* GET /api/metrics */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                GET
              </span>
              <span className="font-mono text-xs text-white">/api/metrics</span>
              <span className="text-xs text-slate-400">· Retrieve scikit-learn test evaluation metrics & confusion matrix</span>
            </div>
          </div>

          {/* POST /api/retrain */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                POST
              </span>
              <span className="font-mono text-xs text-white">/api/retrain</span>
              <span className="text-xs text-slate-400">· Trigger live retraining of vectorizer and classifier on dataset</span>
            </div>
          </div>

          {/* GET /api/history */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                GET
              </span>
              <span className="font-mono text-xs text-white">/api/history</span>
              <span className="text-xs text-slate-400">· Retrieve session scan log and aggregated threat counts</span>
            </div>
          </div>

        </div>
      </div>

      {/* Terminal Curl Example */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-emerald-400" />
          Terminal Execution & Curl Verification
        </h3>
        <p className="text-xs text-slate-400">
          You can test the detection API directly from any command line shell using cURL:
        </p>

        <pre className="p-4 rounded-lg bg-[#080d1a] border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`# 1. Inspect test split metrics
curl -X GET http://localhost:3000/api/metrics

# 2. Analyze a suspicious email
curl -X POST http://localhost:3000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject": "Urgent Security Verification",
    "sender": "alerts@account-security.top",
    "body": "Your bank account has been suspended. Confirm password at http://chase-bank.top"
  }'

# 3. Retrain the scikit-learn model
curl -X POST http://localhost:3000/api/retrain`}
        </pre>
      </div>

    </div>
  );
};
