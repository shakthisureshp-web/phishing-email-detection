# PhishGuard – Phishing Email Detection System

> **Detect Phishing. Stay Protected.**  
> An AI-powered cybersecurity dashboard for analyzing email content and classifying whether an email is **Phishing**, **Suspicious**, or **Safe** using Machine Learning, TF-IDF vectorization, risk heuristics, and empirical model evaluation.

---

## 1. Project Overview

PhishGuard provides automated detection of adversarial email threats, including credential harvesting, Business Email Compromise (BEC/whaling), fake invoices, package delivery scams, and account takeover lures.

The system combines:
1. **Machine Learning Text Classification**: TF-IDF N-gram feature vectorization with a trained Logistic Regression classifier and a Multinomial Naive Bayes benchmark.
2. **Deep URL & Domain Inspection**: Detects raw IP hosts, deceptive/spoofed target domains, brand typosquatting, and high-risk top-level domains (`.xyz`, `.top`, `.cc`, etc.).
3. **Sender Reputation & Spoofing Heuristics**: Identifies free-mail provider impersonation (e.g. `paypal-support@gmail.com`) and synthetic domain patterns.
4. **Explainable AI (XAI)**: Provides clear, plain-English rationales for every classification alongside actionable defense-in-depth guidance.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PhishGuard Frontend                     │
│  React 19 + TypeScript + Tailwind CSS + Lucide + Recharts   │
│  - Email Scanner with quick-load realistic test samples     │
│  - Live Threat Intelligence & URL Deep Inspection Card      │
│  - Dashboard Analytics (KPIs, Donut Chart, History Table)   │
│  - Real Test Split Confusion Matrix & Feature Importance    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Full-Stack Gateway (server.ts)              │
│       Express (Port 3000) with Vite Middlewares Mounted     │
│  - Serves React Client and /api/* endpoints                 │
│  - Spawns Python ML Pipeline or bridges to Flask API        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Python Scikit-Learn Core   │ │   Standalone Flask Server  │
│      (backend/predict.py)    │ │      (backend/app.py)      │
│  - Joblib-serialized Model   │ │  - Port 5000 REST API      │
│  - TF-IDF Vectorizer         │ │  - CORS-enabled            │
│  - Stratified Test Metrics   │ │  - Headless Deployment     │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **React 19**: Component-based user interface.
- **TypeScript**: Static type safety for threat objects and metrics.
- **Tailwind CSS v4**: Dark cybersecurity theme (`#080d1a` canvas, `#0f172a` surfaces, neon green `#10b981` accents).
- **Lucide Icons**: Cyber defense and audit iconography.
- **Recharts**: Responsive charting for classification breakdown and feature importance weights.

### Backend & Machine Learning
- **Python 3.10+**
- **Flask & Flask-CORS**: REST API framework.
- **Scikit-learn**:
  - `TfidfVectorizer`: Sublinear term frequency, unigram & bigram extraction, L2 vector normalization.
  - `LogisticRegression`: Maximum-likelihood estimation with L2 regularization (`C=2.0`).
  - `MultinomialNB`: Baseline benchmark model.
  - `confusion_matrix`, `classification_report`, `roc_auc_score`: Quantitative test split metrics.
- **Pandas & NumPy**: Dataset curation, feature matrix manipulation, and data transformation.
- **Joblib**: Persistent model and vectorizer serialization.

---

## 4. Machine Learning Pipeline Details

### Dataset
- Curated corpus of realistic phishing and legitimate emails covering:
  - **Phishing Vectors**: Credential harvesting, executive impersonation (BEC), fake invoices, package delivery lures, cryptocurrency wallet drainers, banking security warnings, DocuSign lures.
  - **Legitimate Corporate Communications**: GitHub security advisories, team meeting agendas, AWS monthly invoices, HR benefits notices, IT maintenance schedules, academic reviews.
- Accessible in both CSV (`backend/dataset.csv`) and JSON (`backend/dataset.json`) formats.

### Model Training & Evaluation
The training script splits the dataset using a stratified 75/25 train/test split:
- **Accuracy**: Measured on the held-out test split.
- **Precision**: Minimizes false alarms on legitimate business mail.
- **Recall**: Maximizes interception of malicious payloads (prioritizes zero false negatives).
- **F1 Score**: Harmonic mean of precision and recall.
- **Confusion Matrix**: True Negatives (TN), False Positives (FP), False Negatives (FN), True Positives (TP) calculated directly from test set predictions.

---

## 5. Installation & Execution Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher) and **npm**
- **Python** (v3.10 or higher) and **pip**

### Step 1: Install Node Dependencies
```bash
npm install
```

### Step 2: Install Python ML Dependencies
```bash
pip install -r backend/requirements.txt
```
*(Or on Debian/Ubuntu managed environments: `pip install --break-system-packages -r backend/requirements.txt`)*

### Step 3: Train the Machine Learning Model
Train the TF-IDF vectorizer and Logistic Regression classifier:
```bash
npm run train
# or directly:
python3 backend/train_model.py
```
This produces `backend/phishguard_model.pkl`, `backend/phishguard_vectorizer.pkl`, and `backend/model_metrics.json`.

### Step 4: Start the Application
Run the unified full-stack server on port 3000:
```bash
npm run dev
```
Open your browser to: **http://localhost:3000**

*(Optional) Run the standalone Python Flask API on port 5000:*
```bash
npm run flask
# or:
python3 backend/app.py
```

---

## 6. API Reference

### `POST /api/analyze`
Analyzes an email payload for phishing indicators.

**Request Body:**
```json
{
  "subject": "URGENT: Your PayPal Account Has Been Suspended",
  "sender": "service-security@paypal-update-alert.xyz",
  "body": "We detected unauthorized login attempts. Click here to confirm credentials: http://paypal.security-verification.xyz/restore-access"
}
```

**Response:**
```json
{
  "result": {
    "classification": "PHISHING",
    "confidence_percentage": 99.0,
    "risk_level": "CRITICAL",
    "raw_ml_probability": 0.7071,
    "composite_score": 0.99,
    "detected_keywords": [
      { "term": "urgent", "category": "Urgency & Coercion", "severity": "High" },
      { "term": "password", "category": "Credential Extraction", "severity": "Critical" }
    ],
    "urls_detected": [
      {
        "url": "http://paypal.security-verification.xyz/restore-access",
        "domain": "paypal.security-verification.xyz",
        "threat_level": "High",
        "risk_score": 60,
        "flags": ["Suspicious low-reputation TLD", "Brand typosquatting"]
      }
    ],
    "reasons": [
      "Direct request for sensitive credentials detected.",
      "Embedded links contain deceptive hosts."
    ],
    "safety_disclaimer": "Predictions are probabilistic ML assessments based on TF-IDF feature weights and heuristics. Do not treat prediction confidence as a guarantee of safety."
  }
}
```

### `GET /api/metrics`
Returns current model evaluation metrics, test split confusion matrix, and top feature weights.

### `POST /api/retrain`
Retrains the scikit-learn model on the dataset and regenerates test evaluation metrics.

### `GET /api/samples`
Returns pre-configured sample emails for testing.

### `GET /api/history`
Returns recent scan audit logs and aggregated threat counts.

---

## 7. Security & Privacy Guarantees
- **No Third-Party Telemetry**: Email contents are evaluated strictly on the local server; no text is sent to third-party commercial APIs or tracking endpoints.
- **Untrusted Input Handling**: All URLs and email bodies are treated as untrusted data and sanitized. Hyperlinks are never auto-loaded or prefetched.
- **Transparent Probabilistic Reasoning**: Classifications are clearly labeled as machine learning predictions, accompanied by defensive caveats.
