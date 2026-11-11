export interface UrlDetection {
  url: string;
  domain: string;
  is_ip: boolean;
  threat_level: 'High' | 'Medium' | 'Low';
  risk_score: number;
  flags: string[];
}

export interface DetectedKeyword {
  term: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium';
}

export interface SenderAnalysis {
  sender: string;
  flags: string[];
  is_suspicious: boolean;
}

export interface AnalysisResult {
  classification: 'PHISHING' | 'SAFE' | 'SUSPICIOUS';
  confidence_percentage: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  raw_ml_probability: number;
  composite_score: number;
  detected_keywords: DetectedKeyword[];
  urls_detected: UrlDetection[];
  sender_analysis: SenderAnalysis;
  urgency_cues: string[];
  reasons: string[];
  safety_disclaimer: string;
  timestamp?: string;
}

export interface HistoryItem {
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

export interface ModelMetrics {
  model_type: string;
  benchmark_model: string;
  training_samples: number;
  test_samples: number;
  total_dataset_size: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    benchmark_nb_accuracy: number;
    benchmark_nb_f1: number;
  };
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
    total_tested: number;
  };
  top_phishing_features: { feature: string; weight: number }[];
  top_legitimate_features: { feature: string; weight: number }[];
  vocabulary_size: number;
  generated_at: string;
}

export interface SampleEmail {
  id: string;
  label: number;
  type: string;
  sender: string;
  subject: string;
  body: string;
}
