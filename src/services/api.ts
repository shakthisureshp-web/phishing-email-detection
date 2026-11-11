import { AnalysisResult, HistoryItem, ModelMetrics, SampleEmail } from '../types';

export async function analyzeEmail(payload: {
  subject: string;
  body: string;
  sender: string;
}): Promise<{ result: AnalysisResult; history_entry: HistoryItem }> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Analysis failed with HTTP ${response.status}`);
  }

  return response.json();
}

export async function getModelMetrics(): Promise<ModelMetrics> {
  const response = await fetch('/api/metrics');
  if (!response.ok) {
    throw new Error(`Failed to load metrics: HTTP ${response.status}`);
  }
  return response.json();
}

export async function retrainModel(): Promise<{ message: string; metrics: ModelMetrics }> {
  const response = await fetch('/api/retrain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Retraining failed: HTTP ${response.status}`);
  }
  return response.json();
}

export async function getSampleEmails(): Promise<SampleEmail[]> {
  const response = await fetch('/api/samples');
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function getHistory(): Promise<{
  history: HistoryItem[];
  stats: {
    total_analyzed: number;
    phishing_detected: number;
    safe_detected: number;
    suspicious_detected: number;
    detection_rate: number;
  };
}> {
  const response = await fetch('/api/history');
  if (!response.ok) {
    throw new Error(`Failed to fetch history: HTTP ${response.status}`);
  }
  return response.json();
}

export async function clearHistory(): Promise<void> {
  await fetch('/api/history/clear', { method: 'POST' });
}
