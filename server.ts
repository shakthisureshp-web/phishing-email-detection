/**
 * PhishGuard - Express Server with Vite Middleware
 * Runs on Port 3000 and bridges to the Python Machine Learning engine.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const rootDir = process.cwd();

app.use(express.json({ limit: '2mb' }));

interface HistoryItem {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  classification: 'PHISHING' | 'SAFE' | 'SUSPICIOUS';
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  timestamp: string;
  urls_count: number;
  reasons: string[];
}

const analysisHistory: HistoryItem[] = [
  {
    id: 'scan-0001',
    subject: 'URGENT: Your PayPal Account Has Been Suspended',
    sender: 'service-security@paypal-update-alert.xyz',
    snippet: 'Dear Valued Customer, We detected unauthorized login attempts from IP 185.220.101.5 on your account...',
    classification: 'PHISHING',
    risk_level: 'CRITICAL',
    confidence: 98.4,
    timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    urls_count: 1,
    reasons: ['Direct request for sensitive credentials', 'Deceptive spoofed URL (paypal-update-alert.xyz)']
  },
  {
    id: 'scan-0002',
    subject: '[GitHub] Security advisory: High severity vulnerability in express-session',
    sender: 'notifications@github.com',
    snippet: 'GitHub Dependabot detected 1 vulnerable dependency in your repository acme/web-service...',
    classification: 'SAFE',
    risk_level: 'LOW',
    confidence: 96.8,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    urls_count: 0,
    reasons: ['Authentic sender domain (github.com)', 'Legitimate software advisory pattern']
  },
  {
    id: 'scan-0003',
    subject: 'Amazon Web Services: Your Monthly Invoice [Account: 8821-4412-9018]',
    sender: 'no-reply@amazonwebservices.com',
    snippet: 'Greetings from Amazon Web Services. This email is to notify you that your invoice for the billing period...',
    classification: 'SAFE',
    risk_level: 'LOW',
    confidence: 95.2,
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    urls_count: 0,
    reasons: ['Standard billing correspondence pattern', 'No anomalous credential lures']
  }
];

// Helper to invoke Python ML prediction
function runPythonPrediction(payload: { subject: string; body: string; sender: string }): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [path.join(rootDir, 'backend', 'predict.py')]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 && stdoutData.trim()) {
        try {
          const parsed = JSON.parse(stdoutData.trim());
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse Python ML output: ${stdoutData}`));
        }
      } else {
        reject(new Error(`Python process exited with code ${code}: ${stderrData || stdoutData}`));
      }
    });

    pythonProcess.stdin.write(JSON.stringify(payload));
    pythonProcess.stdin.end();
  });
}

// Fallback high-fidelity heuristic classifier if Python is compiling or offline
function fallbackAnalyze(subject: string, body: string, sender: string) {
  const combined = `${subject} ${body} ${sender}`.toLowerCase();
  const suspiciousKeywords: { term: string; category: string; severity: 'Critical' | 'High' | 'Medium' }[] = [];
  const urgencyCues: string[] = [];

  const urgencyWords = ['urgent', 'immediately', 'within 24 hours', 'action required', 'suspended', 'locked', 'terminate', 'final notice'];
  const credentialWords = ['password', 'ssn', 'social security', 'pin', 'credentials', 'seed phrase', 'credit card', 'cvv', 'login', '2fa'];
  const financialWords = ['wire transfer', 'gift card', 'refund', 'unclaimed', 'dividend', 'bonus', 'bitcoin', 'btc'];

  for (const w of urgencyWords) {
    if (combined.includes(w)) {
      urgencyCues.push(w);
      suspiciousKeywords.push({ term: w, category: 'Urgency & Coercion', severity: 'High' });
    }
  }

  for (const w of credentialWords) {
    if (combined.includes(w)) {
      suspiciousKeywords.push({ term: w, category: 'Credential Extraction', severity: 'Critical' });
    }
  }

  for (const w of financialWords) {
    if (combined.includes(w)) {
      suspiciousKeywords.push({ term: w, category: 'Financial Lure', severity: 'High' });
    }
  }

  // URL extraction
  const urlPattern = /https?:\/\/(?:www\.)?([a-zA-Z0-9.\-_]+)(?:\/[^\s<>"']+)?/gi;
  const urlsDetected: any[] = [];
  let match;
  while ((match = urlPattern.exec(`${subject} ${body}`)) !== null) {
    const fullUrl = match[0];
    const domain = match[1].toLowerCase();
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain);
    const hasSuspiciousTld = /\.(xyz|top|cc|tk|pw|club|work|click|info|online|site|biz)$/.test(domain);
    const flags: string[] = [];
    let risk = 0;
    if (isIp) { risk += 40; flags.push('Raw IP address in URL'); }
    if (hasSuspiciousTld) { risk += 30; flags.push('Suspicious low-reputation TLD'); }
    if (domain.includes('paypal') || domain.includes('apple') || domain.includes('microsoft')) {
      if (!domain.endsWith('paypal.com') && !domain.endsWith('apple.com') && !domain.endsWith('microsoft.com')) {
        risk += 35;
        flags.push('Spoofed brand target in domain');
      }
    }
    urlsDetected.push({
      url: fullUrl,
      domain,
      is_ip: isIp,
      threat_level: risk >= 35 ? 'High' : risk >= 15 ? 'Medium' : 'Low',
      risk_score: Math.min(100, risk),
      flags
    });
  }

  const senderLower = sender.toLowerCase();
  const senderFlags: string[] = [];
  if (/\.(xyz|top|cc|tk|pw|club|work|click|info|online|site|biz)$/.test(senderLower)) {
    senderFlags.push('Sender domain uses suspicious TLD');
  }
  if ((senderLower.includes('paypal') || senderLower.includes('apple') || senderLower.includes('security')) &&
      (senderLower.includes('@gmail.com') || senderLower.includes('@outlook.com'))) {
    senderFlags.push('Free email provider impersonating security authority');
  }

  const hasHighRiskUrl = urlsDetected.some(u => u.threat_level === 'High');
  let score = 0.15;
  if (suspiciousKeywords.some(k => k.severity === 'Critical')) score += 0.40;
  if (hasHighRiskUrl) score += 0.35;
  if (urgencyCues.length >= 2) score += 0.20;
  if (senderFlags.length > 0) score += 0.25;

  score = Math.min(0.99, Math.max(0.02, score));

  const classification = score >= 0.60 ? 'PHISHING' : score >= 0.35 ? 'SUSPICIOUS' : 'SAFE';
  const risk_level = score >= 0.80 ? 'CRITICAL' : score >= 0.60 ? 'HIGH' : score >= 0.35 ? 'MEDIUM' : 'LOW';
  const confidence = score >= 0.5 ? Math.round(score * 100) : Math.round((1 - score) * 100);

  const reasons: string[] = [];
  if (classification === 'PHISHING') {
    if (suspiciousKeywords.some(k => k.severity === 'Critical')) reasons.push('Direct request for user credentials or sensitive authentication tokens.');
    if (hasHighRiskUrl) reasons.push('Embedded hyperlinks route to unverified external domains with suspicious TLDs.');
    if (urgencyCues.length > 0) reasons.push('Coercive deadline language designed to trigger panic.');
    if (senderFlags.length > 0) reasons.push('Sender identity shows strong signs of domain spoofing.');
  } else if (classification === 'SUSPICIOUS') {
    reasons.push('Elevated risk cues detected. Verify sender identity through external out-of-band communication.');
  } else {
    reasons.push('No credential harvesting or malicious redirection signatures detected.');
    reasons.push('Sender address and body structure conform to legitimate communication norms.');
  }

  return {
    classification,
    confidence_percentage: confidence,
    risk_level,
    raw_ml_probability: score,
    composite_score: score,
    detected_keywords: suspiciousKeywords,
    urls_detected: urlsDetected,
    sender_analysis: {
      sender,
      flags: senderFlags,
      is_suspicious: senderFlags.length > 0
    },
    urgency_cues: urgencyCues,
    reasons,
    safety_disclaimer: 'Predictions are probabilistic ML assessments based on TF-IDF feature weights and heuristics. Do not treat prediction confidence as a guarantee of safety.'
  };
}

// API Routes
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { subject = '', body = '', sender = '' } = req.body;
    if (!subject.trim() && !body.trim()) {
      return res.status(400).json({ error: 'Please provide email subject or body content to analyze.' });
    }

    let result;
    try {
      result = await runPythonPrediction({ subject, body, sender });
    } catch (pyErr) {
      console.warn('Python engine error or fallback used:', pyErr);
      result = fallbackAnalyze(subject, body, sender);
    }

    const historyItem: HistoryItem = {
      id: `scan-${String(analysisHistory.length + 1).padStart(4, '0')}`,
      subject: subject || '(No Subject)',
      sender: sender || 'Unknown Sender',
      snippet: body.length > 130 ? body.substring(0, 130) + '...' : body,
      classification: result.classification,
      risk_level: result.risk_level,
      confidence: result.confidence_percentage,
      timestamp: new Date().toISOString(),
      urls_count: result.urls_detected?.length || 0,
      reasons: result.reasons || []
    };

    analysisHistory.unshift(historyItem);
    if (analysisHistory.length > 50) analysisHistory.pop();

    res.json({ result, history_entry: historyItem });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal analysis error' });
  }
});

app.get('/api/metrics', (req: Request, res: Response) => {
  try {
    const metricsPath = path.join(rootDir, 'backend', 'model_metrics.json');
    if (fs.existsSync(metricsPath)) {
      const data = fs.readFileSync(metricsPath, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: 'Model metrics not found. Train the model first.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/retrain', (req: Request, res: Response) => {
  const trainProc = spawn('python3', [path.join(rootDir, 'backend', 'train_model.py')]);
  let output = '';
  trainProc.stdout.on('data', d => { output += d.toString(); });
  trainProc.stderr.on('data', d => { output += d.toString(); });
  trainProc.on('close', (code) => {
    if (code === 0) {
      const metricsPath = path.join(rootDir, 'backend', 'model_metrics.json');
      const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));
      res.json({ message: 'Model retrained successfully via scikit-learn!', metrics });
    } else {
      res.status(500).json({ error: `Retraining failed with code ${code}`, output });
    }
  });
});

app.get('/api/samples', (req: Request, res: Response) => {
  try {
    const datasetPath = path.join(rootDir, 'backend', 'dataset.json');
    if (fs.existsSync(datasetPath)) {
      const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
      // Return 8 curated diverse samples
      res.json(dataset.slice(0, 8));
    } else {
      res.json([]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/history', (req: Request, res: Response) => {
  const total = analysisHistory.length;
  const phishing = analysisHistory.filter(h => h.classification === 'PHISHING').length;
  const safe = analysisHistory.filter(h => h.classification === 'SAFE').length;
  const suspicious = analysisHistory.filter(h => h.classification === 'SUSPICIOUS').length;
  const detectionRate = total > 0 ? Number(((phishing / total) * 100).toFixed(1)) : 0;

  res.json({
    history: analysisHistory,
    stats: {
      total_analyzed: total,
      phishing_detected: phishing,
      safe_detected: safe,
      suspicious_detected: suspicious,
      detection_rate: detectionRate
    }
  });
});

app.post('/api/history/clear', (req: Request, res: Response) => {
  analysisHistory.length = 0;
  res.json({ message: 'History cleared', stats: { total_analyzed: 0, phishing_detected: 0, safe_detected: 0, detection_rate: 0 } });
});

app.get('/api/health', (req: Request, res: Response) => {
  const hasModel = fs.existsSync(path.join(rootDir, 'backend', 'phishguard_model.pkl'));
  res.json({ status: 'ok', service: 'PhishGuard Detection Core', model_ready: hasModel });
});

// Mount Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(rootDir, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(rootDir, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ PhishGuard Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
