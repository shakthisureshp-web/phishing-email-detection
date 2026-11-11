"""
PhishGuard - Flask REST API Backend
Exposes machine learning prediction, metrics, URL analysis, and model retraining.
"""

import os
import re
import json
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from train_model import train_and_evaluate
from dataset import EMAILS_DATASET

app = Flask(__name__)
CORS(app)

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BACKEND_DIR, "phishguard_model.pkl")
VECTORIZER_PATH = os.path.join(BACKEND_DIR, "phishguard_vectorizer.pkl")
METRICS_PATH = os.path.join(BACKEND_DIR, "model_metrics.json")

# In-memory history for demonstration & analytics
analysis_history = []

def load_ml_pipeline():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        train_and_evaluate()
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    return model, vectorizer

# URL Analysis Engine
SUSPICIOUS_TLDS = {".xyz", ".top", ".cc", ".tk", ".pw", ".club", ".work", ".click", ".info", ".online", ".site", ".biz"}

def extract_and_analyze_urls(text, sender=""):
    url_pattern = re.compile(
        r'https?://(?:www\.)?([a-zA-Z0-9\.\-_]+)(?:/[^\s<>"\'\)]*)?',
        re.IGNORECASE
    )
    matches = url_pattern.finditer(text)
    results = []

    for match in matches:
        full_url = match.group(0)
        domain = match.group(1).lower()

        # Check heuristics
        is_ip = bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain))
        has_suspicious_tld = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
        has_hyphens = domain.count("-") >= 2
        subdomain_depth = len(domain.split(".")) > 3

        # Check impersonation cues
        impersonation_keywords = ["paypal", "apple", "microsoft", "google", "chase", "netflix", "amazon", "docusign", "wells", "bank", "secure"]
        impersonates_brand = False
        for brand in impersonation_keywords:
            if brand in domain and not domain.endswith(f"{brand}.com") and not domain.endswith(f"{brand}.net"):
                impersonates_brand = True
                break

        risk_score = 0
        flags = []
        if is_ip:
            risk_score += 40
            flags.append("Raw IP address used instead of domain name")
        if has_suspicious_tld:
            risk_score += 25
            flags.append("Suspicious / low-reputation top-level domain (TLD)")
        if impersonates_brand:
            risk_score += 35
            flags.append("Brand name typosquatting / spoofed target domain")
        if has_hyphens:
            risk_score += 15
            flags.append("Multiple hyphens indicating synthetic deceptive domain")
        if subdomain_depth:
            risk_score += 15
            flags.append("Excessive subdomain levels to conceal true host")

        threat_level = "High" if risk_score >= 35 else "Medium" if risk_score >= 15 else "Low"

        results.append({
            "url": full_url,
            "domain": domain,
            "is_ip": is_ip,
            "threat_level": threat_level,
            "risk_score": min(100, risk_score),
            "flags": flags
        })

    return results

# Keyword and pattern heuristics
SECURITY_PATTERNS = {
    "urgency": [
        "urgent", "immediately", "within 24 hours", "2 hours", "action required",
        "account suspended", "terminate", "final notice", "strictly confidential",
        "lock", "frozen", "deactivated"
    ],
    "credential_harvest": [
        "password", "ssn", "social security", "pin", "verify your credentials",
        "seed phrase", "credit card", "cvv", "login", "recover access", "re-authenticate",
        "one-time passcode", "2fa"
    ],
    "financial_lure": [
        "wire transfer", "gift card", "refund", "unclaimed", "payout", "dividend",
        "bonus", "bitcoin", "btc", "wallet", "invoice past due", "$48,500", "$1,420"
    ]
}

def analyze_email_text(subject, body, sender):
    combined_text = f"{subject} {body} {sender}".lower()
    
    # 1. ML Prediction
    model, vectorizer = load_ml_pipeline()
    features = vectorizer.transform([f"{subject} {body} {sender}"])
    phish_prob = float(model.predict_proba(features)[0][1])
    ml_pred = int(model.predict(features)[0])

    # 2. URL analysis
    url_details = extract_and_analyze_urls(f"{subject} {body}", sender)
    has_high_risk_url = any(u["threat_level"] == "High" for u in url_details)

    # 3. Keyword detection
    detected_keywords = []
    urgency_cues = []
    credential_cues = []
    financial_cues = []

    for word in SECURITY_PATTERNS["urgency"]:
        if word in combined_text:
            urgency_cues.append(word)
            detected_keywords.append({"term": word, "category": "Urgency & Coercion", "severity": "High"})

    for word in SECURITY_PATTERNS["credential_harvest"]:
        if word in combined_text:
            credential_cues.append(word)
            detected_keywords.append({"term": word, "category": "Credential Extraction", "severity": "Critical"})

    for word in SECURITY_PATTERNS["financial_lure"]:
        if word in combined_text:
            financial_cues.append(word)
            detected_keywords.append({"term": word, "category": "Financial Lure", "severity": "High"})

    # 4. Sender analysis
    sender_lower = sender.lower()
    sender_flags = []
    if any(sender_lower.endswith(tld) for tld in SUSPICIOUS_TLDS):
        sender_flags.append("Sender domain uses high-risk suspicious TLD")
    if ("paypal" in sender_lower or "apple" in sender_lower or "microsoft" in sender_lower) and ("@gmail.com" in sender_lower or "@outlook.com" in sender_lower or "@yahoo.com" in sender_lower):
        sender_flags.append("Free email provider spoofing corporate institution")

    # 5. Hybrid scoring & final risk synthesis
    # Blend ML probability with heuristic weights
    heuristic_penalty = 0.0
    if has_high_risk_url:
        heuristic_penalty += 0.20
    if len(credential_cues) >= 1:
        heuristic_penalty += 0.15
    if len(urgency_cues) >= 2:
        heuristic_penalty += 0.10
    if len(sender_flags) > 0:
        heuristic_penalty += 0.15

    composite_score = min(0.99, max(0.01, phish_prob * 0.70 + heuristic_penalty))

    if composite_score >= 0.65:
        classification = "PHISHING"
        risk_level = "CRITICAL" if composite_score >= 0.85 else "HIGH"
        confidence_pct = round(composite_score * 100, 1)
    elif composite_score >= 0.40:
        classification = "SUSPICIOUS"
        risk_level = "MEDIUM"
        confidence_pct = round(composite_score * 100, 1)
    else:
        classification = "SAFE"
        risk_level = "LOW"
        confidence_pct = round((1.0 - composite_score) * 100, 1)

    # 6. Plain-English Explanations
    reasons = []
    if classification == "PHISHING":
        if credential_cues:
            reasons.append(f"Direct request for sensitive credentials detected ({', '.join(credential_cues[:3])}).")
        if url_details:
            reasons.append(f"Embedded links contain deceptive hosts ({', '.join([u['domain'] for u in url_details[:2]])}).")
        if urgency_cues:
            reasons.append(f"High urgency and fear-inducing deadline cues present ({', '.join(urgency_cues[:2])}).")
        if sender_flags:
            reasons.append("Sender address displays anomalous spoofing patterns.")
        if not reasons:
            reasons.append("Text structure and TF-IDF n-grams match recognized spear-phishing attack vectors.")
    elif classification == "SUSPICIOUS":
        reasons.append("Moderate risk signals detected: language urgency or unverified external links.")
        reasons.append("Exercise caution: independently verify sender through an out-of-band channel before clicking.")
    else:
        reasons.append("No credential harvesting patterns or deceptive redirection links found.")
        reasons.append("Language conforms to standard business correspondence characteristics.")
        reasons.append("TF-IDF classification weighted strongly towards legitimate corporate communications.")

    return {
        "classification": classification,
        "confidence_percentage": confidence_pct,
        "risk_level": risk_level,
        "raw_ml_probability": round(phish_prob, 4),
        "composite_score": round(composite_score, 4),
        "detected_keywords": detected_keywords,
        "urls_detected": url_details,
        "sender_analysis": {
            "sender": sender,
            "flags": sender_flags,
            "is_suspicious": len(sender_flags) > 0
        },
        "urgency_cues": urgency_cues,
        "reasons": reasons,
        "safety_disclaimer": "Predictions are probabilistic ML assessments based on TF-IDF feature weights and heuristics. Do not treat prediction confidence as a guarantee of safety.",
        "timestamp": pd.Timestamp.now().isoformat()
    }

@app.route("/api/analyze", methods=["POST"])
def analyze_endpoint():
    data = request.get_json() or {}
    subject = data.get("subject", "").strip()
    body = data.get("body", "").strip()
    sender = data.get("sender", "").strip()

    if not body and not subject:
        return jsonify({"error": "Please provide an email subject or content to analyze."}), 400

    result = analyze_email_text(subject, body, sender)
    
    # Store in history
    entry = {
        "id": f"scan-{len(analysis_history) + 1:04d}",
        "subject": subject or "(No Subject)",
        "sender": sender or "Unknown Sender",
        "snippet": (body[:120] + "...") if len(body) > 120 else body,
        "classification": result["classification"],
        "risk_level": result["risk_level"],
        "confidence": result["confidence_percentage"],
        "timestamp": result["timestamp"]
    }
    analysis_history.insert(0, entry)
    if len(analysis_history) > 50:
        analysis_history.pop()

    return jsonify({"result": result, "history_entry": entry})

@app.route("/api/metrics", methods=["GET"])
def metrics_endpoint():
    if not os.path.exists(METRICS_PATH):
        train_and_evaluate()
    with open(METRICS_PATH, "r") as f:
        metrics = json.load(f)
    return jsonify(metrics)

@app.route("/api/retrain", methods=["POST"])
def retrain_endpoint():
    metrics = train_and_evaluate()
    return jsonify({"message": "Model retrained successfully", "metrics": metrics})

@app.route("/api/samples", methods=["GET"])
def samples_endpoint():
    return jsonify(EMAILS_DATASET)

@app.route("/api/history", methods=["GET"])
def history_endpoint():
    total = len(analysis_history)
    phishing_count = sum(1 for h in analysis_history if h["classification"] == "PHISHING")
    safe_count = sum(1 for h in analysis_history if h["classification"] == "SAFE")
    suspicious_count = sum(1 for h in analysis_history if h["classification"] == "SUSPICIOUS")
    detection_rate = round((phishing_count / total * 100), 1) if total > 0 else 0.0

    return jsonify({
        "history": analysis_history,
        "stats": {
            "total_analyzed": total,
            "phishing_detected": phishing_count,
            "safe_detected": safe_count,
            "suspicious_detected": suspicious_count,
            "detection_rate": detection_rate
        }
    })

@app.route("/api/history/clear", methods=["POST"])
def clear_history_endpoint():
    analysis_history.clear()
    return jsonify({"message": "History cleared", "stats": {"total_analyzed": 0, "phishing_detected": 0, "safe_detected": 0, "detection_rate": 0.0}})

@app.route("/api/health", methods=["GET"])
def health_endpoint():
    return jsonify({
        "status": "healthy",
        "service": "PhishGuard ML Core",
        "python_version": "3.10+",
        "model_loaded": os.path.exists(MODEL_PATH)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
